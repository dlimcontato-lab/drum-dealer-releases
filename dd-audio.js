// Som da demo: o motor C++ do plugin em WASM num AudioWorklet (dd-processor.js), mais uma segunda
// instância na thread principal (o "espelho") para o Pal e para a curva do EDIT.
export const ENGINE_V = '5';
const FILES = ['kick', 'snare', 'clap', 'chat', 'ohat', 'tom'];
const VARIANTS = 4;

let espelhoPromessa = null;
export function carregarEspelho() {
  if (!espelhoPromessa) {
    espelhoPromessa = (async () => {
      const [bytes, mod] = await Promise.all([
        fetch('engine.wasm?v=' + ENGINE_V).then((r) => { if (!r.ok) throw new Error('engine.wasm ' + r.status); return r.arrayBuffer(); }),
        import('./engine.mjs?v=' + ENGINE_V),
      ]);
      return mod.default({ wasmBinary: bytes });
    })();
  }
  return espelhoPromessa;
}

export function criarAudio(cb) {
  let ctx = null;
  let node = null;
  let booting = null;
  let pronto = false;
  const amostras = {};
  const atual = [0, 0, 0, 0, 0, 0];
  const esperando = new Map();
  const enviar = (m) => { if (node) node.port.postMessage(m); };
  const empurrarAmostra = (i) => {
    const d = amostras[i] && amostras[i][atual[i]];
    if (d) enviar({ type: 'sample', inst: i, data: d });
  };

  async function subir() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const [bytes] = await Promise.all([
      fetch('engine.wasm?v=' + ENGINE_V).then((r) => r.arrayBuffer()),
      ctx.audioWorklet.addModule('dd-processor.js?v=' + ENGINE_V),
    ]);
    node = new AudioWorkletNode(ctx, 'drum-dealer', { outputChannelCount: [2] });
    node.connect(ctx.destination);
    node.port.onmessage = (e) => {
      const m = e.data;
      if (m.type === 'step') cb.aoPasso(m.step);
      else if (m.type === 'peak') cb.aoPico(m.l, m.r, m.gr);
      else if (m.type === 'ready') { pronto = true; cb.estadoInicial().forEach(enviar); }
      else if (m.type === 'grid') cb.aoGrade(m.grid);
      else if (m.type === 'gen') cb.aoGerado(m);
      else if (m.type === 'params') cb.aoParams(m.values);
      else if (m.type === 'valor') {
        const f = esperando.get(m.id);
        if (f) { esperando.delete(m.id); f(m.value); }
      } else if (m.type === 'error') {
        console.error('engine:', m.message);
        cb.aoFalha('O motor de áudio falhou: ' + m.message);
      }
    };
    node.port.postMessage({ type: 'wasm', data: bytes }, [bytes]);

    await Promise.all(FILES.flatMap((f, i) => {
      amostras[i] = [];
      return Array.from({ length: VARIANTS }, (_, v) =>
        fetch('audio/' + f + v + '.m4a')
          .then((r) => r.arrayBuffer())
          .then((ab) => ctx.decodeAudioData(ab))
          .then((buf) => { amostras[i][v] = buf.getChannelData(0).slice(); }));
    }));
    for (let i = 0; i < 6; i++) empurrarAmostra(i);
    ctx.resume().catch(() => {});
    window.__ddCtx = ctx;
  }

  async function garantir() {
    if (node) {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      return;
    }
    if (!booting) booting = subir();
    return booting;
  }

  const sorteia = (i) => {
    atual[i] = (atual[i] + 1 + Math.floor(Math.random() * (VARIANTS - 1))) % VARIANTS;
    empurrarAmostra(i);
  };

  return {
    garantir, enviar,
    pronto: () => pronto,
    ativo: () => !!node,
    trocarAmostra: sorteia,
    sortearAmostras: () => { for (let i = 0; i < 6; i++) sorteia(i); },
    lerParam: (id) => new Promise((ok) => { esperando.set(id, ok); enviar({ type: 'get', id }); }),
  };
}

// SMF tipo 0, 480 ticks por semínima; notas em tempos
export function escreverMidi(notas, tempo) {
  const TPQ = 480;
  const varlen = (v) => {
    const out = [v & 0x7f];
    let x = v >> 7;
    while (x > 0) { out.unshift((x & 0x7f) | 0x80); x >>= 7; }
    return out;
  };
  const eventos = [];
  for (const n of notas) {
    const on = Math.round(n.start * TPQ);
    const off = Math.max(on + 1, Math.round((n.start + n.len) * TPQ));
    const pitch = Math.max(0, Math.min(127, Math.round(n.pitch)));
    const vel = Math.max(1, Math.min(127, Math.round(n.vel)));
    eventos.push({ t: on, d: [0x90, pitch, vel] });
    eventos.push({ t: off, d: [0x80, pitch, 0] });
  }
  eventos.sort((a, b) => a.t - b.t || a.d[0] - b.d[0]);
  const faixa = [];
  const us = Math.round(60000000 / (tempo || 126));
  faixa.push(0x00, 0xff, 0x51, 0x03, (us >> 16) & 0xff, (us >> 8) & 0xff, us & 0xff);
  let ultimo = 0;
  for (const ev of eventos) { faixa.push(...varlen(ev.t - ultimo), ...ev.d); ultimo = ev.t; }
  faixa.push(0x00, 0xff, 0x2f, 0x00);
  const bytes = [0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, (TPQ >> 8) & 0xff, TPQ & 0xff];
  const len = faixa.length;
  bytes.push(0x4d, 0x54, 0x72, 0x6b, (len >>> 24) & 0xff, (len >>> 16) & 0xff, (len >>> 8) & 0xff, len & 0xff, ...faixa);
  return new Uint8Array(bytes);
}
