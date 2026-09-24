// AudioWorkletProcessor que roda o motor C++ do BRDRUM (WASM). A página fala o ID de parâmetro do
// plugin; aqui ele vira índice uma vez (cache) e vai para web_set.
import './url-shim.js'; // precisa vir antes: o glue referencia URL no top-level
import createEngine from './engine.mjs?v=7'; // casa com ENGINE_V em dd-audio.js

const BLOCK = 128;

class DrumDealerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.M = null;
    this.pending = [];
    this.lastStep = -1;
    this.meterTick = 0;
    this.parado = true; // o main thread marca no STOP e limpa no PLAY; enquanto marcado, para de mandar peak
    this.indices = new Map();
    this.port.onmessage = (e) => {
      if (e.data.type === 'wasm') { this.boot(e.data.data); return; }
      if (this.M) this.safeHandle(e.data);
      else this.pending.push(e.data);
    };
  }

  boot(wasmBytes) {
    createEngine({ wasmBinary: wasmBytes }).then((M) => {
      this.M = M;
      M._web_init(sampleRate);
      this.outL = M._malloc(BLOCK * 4);
      this.outR = M._malloc(BLOCK * 4);
      const p = this.pending;
      this.pending = [];
      p.forEach((m) => this.safeHandle(m));
      this.port.postMessage({ type: 'ready' });
    }).catch((err) => {
      this.port.postMessage({ type: 'error', message: String((err && err.message) || err) });
    });
  }

  safeHandle(m) {
    try {
      this.handle(m);
    } catch (err) {
      this.port.postMessage({ type: 'error', message: `falha ao tratar "${m && m.type}": ${String((err && err.message) || err)}` });
    }
  }

  indice(id) {
    let i = this.indices.get(id);
    if (i === undefined) {
      i = this.M.ccall('web_param_index', 'number', ['string'], [id]);
      this.indices.set(id, i);
    }
    if (i < 0) throw new Error('parâmetro desconhecido no motor: ' + id);
    return i;
  }

  handle(m) {
    const M = this.M;
    switch (m.type) {
      case 'param': M._web_set(this.indice(m.id), m.value); break;
      case 'get': this.port.postMessage({ type: 'valor', id: m.id, value: M._web_get(this.indice(m.id)) }); break;
      case 'step': M._web_set_step(m.inst, m.step, m.on ? 1 : 0); break;
      case 'accent': M._web_set_accent(m.step, m.value); break;
      case 'bpm': M._web_set_bpm(m.value); break;
      case 'playing': M._web_set_playing(m.on ? 1 : 0); this.lastStep = -1; this.parado = !m.on; break;
      case 'trigger': M._web_trigger(m.inst); break;
      case 'sample': {
        const arr = m.data;
        const ptr = M._malloc(arr.length * 4);
        M.HEAPF32.set(arr, ptr / 4);
        M._web_load_sample(m.inst, ptr, arr.length);
        M._free(ptr);
        break;
      }
      case 'rand': {
        M._web_randomize_grid();
        const grid = [];
        for (let i = 0; i < 6; i++) {
          grid[i] = [];
          for (let s = 0; s < 16; s++) grid[i][s] = !!M._web_get_step(i, s);
        }
        this.port.postMessage({ type: 'grid', grid });
        break;
      }
      case 'preset': {
        M._web_mb_preset(m.preset);
        const values = {};
        const n = M._web_param_count();
        for (let i = 0; i < n; i++) {
          const id = M.UTF8ToString(M._web_param_name(i));
          if (id.startsWith('mb')) values[id] = M._web_get(i);
        }
        this.port.postMessage({ type: 'params', values });
        break;
      }
      case 'generate': {
        const MAX = 4096;
        M._web_generate(m.kind, m.root, m.scale, m.bars, m.seed >>> 0);
        const bars = M._web_gen_bars(m.kind);
        const ptr = M._malloc(MAX * 4 * 4);
        const n = M._web_gen_notes(m.kind, ptr, MAX);
        const notes = new Float32Array(M.HEAPF32.subarray(ptr / 4, ptr / 4 + n * 4));
        M._free(ptr);
        this.port.postMessage({ type: 'gen', kind: m.kind, bars, count: n, notes }, [notes.buffer]);
        break;
      }
      default: break;
    }
  }

  process(_inputs, outputs) {
    const M = this.M;
    const out = outputs[0];
    if (!M || !out || out.length === 0) return true;
    const n = Math.min(out[0].length, BLOCK);
    M._web_process(this.outL, this.outR, n);
    out[0].set(M.HEAPF32.subarray(this.outL / 4, this.outL / 4 + n));
    if (out.length > 1) out[1].set(M.HEAPF32.subarray(this.outR / 4, this.outR / 4 + n));
    // Clamp de segurança em ±1 (o preset OTT ainda passa de 0 dBFS). Abaixo de 1 o som não muda.
    // NaN (parâmetro ou estado do motor inválido) vira silêncio, nunca passa adiante.
    for (let c = 0; c < out.length && c < 2; c++) {
      const ch = out[c];
      for (let i = 0; i < n; i++) {
        const x = ch[i];
        if (Number.isNaN(x)) ch[i] = 0;
        else if (x > 1) ch[i] = 1;
        else if (x < -1) ch[i] = -1;
      }
    }

    const s = M._web_current_step();
    if (s !== this.lastStep) {
      this.lastStep = s;
      this.port.postMessage({ type: 'step', step: s });
    }
    if (!this.parado && ++this.meterTick >= 8) {   // ~45 quadros por segundo; parado no STOP
      this.meterTick = 0;
      this.port.postMessage({
        type: 'peak', l: M._web_read_peak(0), r: M._web_read_peak(1),
        gr: [M._web_mb_gain_db(0), M._web_mb_gain_db(1), M._web_mb_gain_db(2)],
      });
    }
    return true;
  }
}

registerProcessor('drum-dealer', DrumDealerProcessor);
