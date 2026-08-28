// AudioWorkletProcessor que roda o motor C++ real do Drum Dealer (WASM).
// Sem SharedArrayBuffer: o módulo emcc é single-file e importado como ES module
// dentro do AudioWorkletGlobalScope; a UI conversa por port.postMessage.
import './url-shim.js'; // precisa vir antes: o glue referencia URL no top-level
import createEngine from './engine.mjs?v=2'; // casa com ENGINE_V em dd-main.js

const BLOCK = 128;

class DrumDealerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.M = null;
    this.pending = [];
    this.lastStep = -1;
    this.meterTick = 0;
    this.port.onmessage = (e) => {
      // O worklet não consegue buscar o .wasm sozinho (sem fetch/atob no escopo):
      // o main thread manda os bytes e só então o módulo é instanciado.
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
      const p = this.pending; this.pending = [];
      p.forEach((m) => this.safeHandle(m));
      this.port.postMessage({ type: 'ready' });
    }).catch((err) => {
      this.port.postMessage({ type: 'error', message: String(err && err.message || err) });
    });
  }

  // Sem isto, uma exceção aqui dentro morre em silêncio no worklet e a UI fica
  // esperando uma resposta que nunca vem.
  safeHandle(m) {
    try {
      this.handle(m);
    } catch (err) {
      this.port.postMessage({
        type: 'error',
        message: `falha ao tratar "${m && m.type}": ${String(err && err.message || err)}`,
      });
    }
  }

  handle(m) {
    const M = this.M;
    switch (m.type) {
      case 'param':   M._web_set_param(m.id, m.value); break;
      case 'step':    M._web_set_step(m.inst, m.step, m.on ? 1 : 0); break;
      case 'accent':  M._web_set_accent(m.step, m.value); break;
      case 'bpm':     M._web_set_bpm(m.value); break;
      case 'playing': M._web_set_playing(m.on ? 1 : 0); this.lastStep = -1; break;
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
      // MIDI GEN: mesma rota do plugin (pack embutido -> assembleFromClip). Roda
      // aqui porque o motor vive no worklet; a UI só recebe as notas prontas.
      case 'generate': {
        const MAX = 4096;
        M._web_generate(m.kind, m.root, m.scale, m.bars, m.seed >>> 0);
        const bars = M._web_gen_bars(m.kind);
        const ptr = M._malloc(MAX * 4 * 4);
        const n = M._web_gen_notes(m.kind, ptr, MAX);
        const notes = new Float32Array(M.HEAPF32.subarray(ptr / 4, ptr / 4 + n * 4));
        M._free(ptr);
        this.port.postMessage({ type: 'gen', kind: m.kind, bars, count: n, notes },
                              [notes.buffer]);
        break;
      }
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

    const s = M._web_current_step();
    if (s !== this.lastStep) {
      this.lastStep = s;
      this.port.postMessage({ type: 'step', step: s });
    }

    // Medidores L/R: ~45 quadros por segundo, não um por bloco de áudio.
    if (++this.meterTick >= 8) {
      this.meterTick = 0;
      this.port.postMessage({ type: 'peak', l: M._web_read_peak(0), r: M._web_read_peak(1) });
    }
    return true;
  }
}

registerProcessor('drum-dealer', DrumDealerProcessor);
