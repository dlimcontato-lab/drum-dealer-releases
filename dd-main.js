// UI da demo — controla o motor C++ real (WASM) via AudioWorklet (dd-processor.js).
// Ids de parâmetro casam com web/WebEngine.cpp: por instrumento = inst*16 + p;
// globais 1000+. Ranges idênticos ao APVTS do plugin.

const INSTS = ['KICK', 'SNARE', 'CLAP', 'CHAT', 'OHAT', 'TOM'];
const FILES = ['kick', 'snare', 'clap', 'chat', 'ohat', 'tom'];
const VARIANTS = 4;
const P = { mute: 0, solo: 1, decay: 2, tone: 3, vol: 4, pan: 5, noise: 6, rev: 7, del: 8 };
const G = { gain: 1000, grooveType: 1001, grooveAmt: 1002, reverbMix: 1003, delayTime: 1004,
            fillRate: 1005, fillVol: 1006, fillTarget: 1007, fillPhase: 1008 };
// mesma ordem de SequencerEngine::grooveTemplates()
const GROOVE_TYPES = ['Straight', 'Random', 'Ableton Swing 8', 'Ableton Swing 16',
  'MPC 16 Swing 54%', 'MPC 16 Swing 58%', 'MPC 16 Swing 62%', 'MPC 16 Swing 66%',
  'MPC 16 Swing 70%', 'MPC 16 Swing 75%', 'SP-1200 Swing 54%', 'SP-1200 Swing 58%',
  'SP-1200 Swing 62%', 'SP-1200 Swing 66%', 'TR-909 Shuffle 2', 'TR-909 Shuffle 4',
  'TR-909 Shuffle 6', 'FL Swing 25%', 'FL Swing 50%', 'FL Swing 75%', 'FL Swing 100%'];

// mesmo groove inicial de sempre
const grid = [
  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0],
  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
  [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
  [0,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
  [0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,0],
];
const accents = Array(16).fill(false);

let ctx = null, node = null, ready = false;
let bpm = 126, playing = false;
const current = [0, 0, 0, 0, 0, 0];
const sampleData = {}; // sampleData[inst][variante] = Float32Array

const send = (msg) => { if (node) node.port.postMessage(msg); };

// ---------- knobs ----------
// range: {min,max,def,skew?}; envia via cb(valor)
function makeKnob(el, range, cb) {
  let val = range.def;
  const paint = () => {
    const t = (val - range.min) / (range.max - range.min);
    el.style.setProperty('--rot', (-135 + t * 270).toFixed(1) + 'deg');
  };
  const apply = () => { paint(); cb(val); };
  let startY = 0, startVal = 0;
  el.addEventListener('pointerdown', (e) => {
    startY = e.clientY; startVal = val;
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', (e) => {
    if (!el.hasPointerCapture?.(e.pointerId)) return;
    const dy = startY - e.clientY;
    val = Math.min(range.max, Math.max(range.min, startVal + dy / 150 * (range.max - range.min)));
    apply();
  });
  el.addEventListener('dblclick', () => { val = range.def; apply(); });
  paint();
  return { set: (v) => { val = v; apply(); } };
}

// ---------- monta a grade ----------
const seqEl = document.getElementById('seq');
const cells = [];
const KNOB_DEFS = [
  ['DECAY', P.decay, { min: 0.01, max: 2, def: 0.5 }],
  ['TONE',  P.tone,  { min: 0, max: 1, def: 0.5 }],
  ['VOL',   P.vol,   { min: 0, max: 1, def: 0.8 }],
  ['PAN',   P.pan,   { min: -1, max: 1, def: 0 }],
  ['NOISE', P.noise, { min: 0, max: 1, def: 0 }],
];

for (let r = 0; r < 6; r++) {
  const mute = document.createElement('button');
  mute.className = 'ms'; mute.textContent = 'MUTE';
  mute.addEventListener('click', () => {
    mute.classList.toggle('on-mute');
    send({ type: 'param', id: r * 16 + P.mute, value: mute.classList.contains('on-mute') ? 1 : 0 });
  });
  seqEl.appendChild(mute);

  const solo = document.createElement('button');
  solo.className = 'ms'; solo.textContent = 'SOLO';
  solo.addEventListener('click', () => {
    solo.classList.toggle('on-solo');
    send({ type: 'param', id: r * 16 + P.solo, value: solo.classList.contains('on-solo') ? 1 : 0 });
  });
  seqEl.appendChild(solo);

  for (const [label, pid, range] of KNOB_DEFS) {
    const cell = document.createElement('div'); cell.className = 'kcell';
    const k = document.createElement('span'); k.className = 'knob';
    cell.appendChild(k);
    const cap = document.createElement('small'); cap.textContent = label;
    cell.appendChild(cap);
    seqEl.appendChild(cell);
    makeKnob(k, range, (v) => send({ type: 'param', id: r * 16 + pid, value: v }));
  }

  const lab = document.createElement('button');
  lab.className = 'lab'; lab.textContent = INSTS[r];
  lab.title = 'Trocar o sample de ' + INSTS[r];
  lab.addEventListener('click', async () => {
    await ensureAudio();
    current[r] = (current[r] + 1 + Math.floor(Math.random() * (VARIANTS - 1))) % VARIANTS;
    pushSample(r);
    send({ type: 'trigger', inst: r });
    lab.animate([{ transform: 'translate(2px,2px)' }, { transform: 'none' }], { duration: 120 });
  });
  seqEl.appendChild(lab);
  cells[r] = [];

  for (let c = 0; c < 16; c++) {
    const b = document.createElement('button');
    b.className = 'step g' + (Math.floor(c / 4) + 1) + (grid[r][c] ? ' on' : '');
    b.addEventListener('click', async () => {
      grid[r][c] ^= 1; b.classList.toggle('on');
      send({ type: 'step', inst: r, step: c, on: !!grid[r][c] });
      if (grid[r][c]) { await ensureAudio(); send({ type: 'trigger', inst: r }); }
    });
    seqEl.appendChild(b); cells[r][c] = b;
  }

  for (const [label, pid] of [['REV', P.rev], ['DEL', P.del]]) {
    const cell = document.createElement('div'); cell.className = 'kcell';
    const k = document.createElement('span'); k.className = 'knob';
    cell.appendChild(k);
    const cap = document.createElement('small'); cap.textContent = label;
    cell.appendChild(cap);
    seqEl.appendChild(cell);
    makeKnob(k, { min: 0, max: 1, def: 0 }, (v) => send({ type: 'param', id: r * 16 + pid, value: v }));
  }
}

// linha de accent
{
  const lab = document.createElement('div');
  lab.className = 'lab'; lab.textContent = 'ACCENT';
  lab.style.gridColumn = '1 / 9';
  seqEl.appendChild(lab);
  for (let c = 0; c < 16; c++) {
    const b = document.createElement('button');
    b.className = 'acc';
    b.addEventListener('click', () => {
      accents[c] = !accents[c];
      b.classList.toggle('on', accents[c]);
      send({ type: 'accent', step: c, value: accents[c] ? 1.0 : 0.5 });
    });
    seqEl.appendChild(b);
  }
  const fill1 = document.createElement('div'); fill1.style.gridColumn = 'span 2';
  seqEl.appendChild(fill1);
}

// ---------- painéis ----------
const grooveSel = document.getElementById('groove-type');
GROOVE_TYPES.forEach((n, i) => {
  const o = document.createElement('option'); o.value = i; o.textContent = n;
  grooveSel.appendChild(o);
});
grooveSel.addEventListener('change', () => send({ type: 'param', id: G.grooveType, value: +grooveSel.value }));

makeKnob(document.getElementById('groove-amt'), { min: 0, max: 1, def: 0 },
  (v) => send({ type: 'param', id: G.grooveAmt, value: v }));

// FILL: mesmo painel do VST (alvo, rate, fase, volume)
const fillTargetSel = document.getElementById('fill-target');
INSTS.forEach((n, i) => {
  const o = document.createElement('option'); o.value = i; o.textContent = n;
  fillTargetSel.appendChild(o);
});
fillTargetSel.value = 1; // SNARE, padrão do plugin
fillTargetSel.addEventListener('change', () => send({ type: 'param', id: G.fillTarget, value: +fillTargetSel.value }));
document.getElementById('fill-phase').addEventListener('change', (e) =>
  send({ type: 'param', id: G.fillPhase, value: +e.target.value }));
makeKnob(document.getElementById('fill-rate'), { min: 0, max: 1, def: 0 },
  (v) => send({ type: 'param', id: G.fillRate, value: v }));
makeKnob(document.getElementById('fill-vol'), { min: 0, max: 1, def: 0.8 },
  (v) => send({ type: 'param', id: G.fillVol, value: v }));

makeKnob(document.getElementById('master-gain'), { min: -24, max: 6, def: 0 },
  (v) => send({ type: 'param', id: G.gain, value: v }));

// ---------- áudio ----------
async function ensureAudio() {
  if (ctx) { if (ctx.state === 'suspended') await ctx.resume(); return; }
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  const [wasmBytes] = await Promise.all([
    fetch('engine.wasm').then((r) => r.arrayBuffer()),
    ctx.audioWorklet.addModule('dd-processor.js'),
  ]);
  node = new AudioWorkletNode(ctx, 'drum-dealer', { outputChannelCount: [2] });
  node.connect(ctx.destination);
  node.port.postMessage({ type: 'wasm', data: wasmBytes }, [wasmBytes]);

  node.port.onmessage = (e) => {
    const m = e.data;
    if (m.type === 'step') paintPlayhead(m.step);
    else if (m.type === 'error') console.error('engine:', m.message);
    else if (m.type === 'ready') { ready = true; pushFullState(); }
    else if (m.type === 'grid') {
      for (let r = 0; r < 6; r++)
        for (let c = 0; c < 16; c++) {
          grid[r][c] = m.grid[r][c] ? 1 : 0;
          cells[r][c].classList.toggle('on', !!grid[r][c]);
        }
    }
  };

  // decodifica os samples de fábrica (todas as variantes)
  await Promise.all(FILES.flatMap((f, i) => {
    sampleData[i] = [];
    return Array.from({ length: VARIANTS }, (_, v) =>
      fetch('audio/' + f + v + '.m4a')
        .then((r) => r.arrayBuffer())
        .then((ab) => ctx.decodeAudioData(ab))
        .then((buf) => { sampleData[i][v] = buf.getChannelData(0).slice(); }));
  }));
  for (let i = 0; i < 6; i++) pushSample(i);
  await ctx.resume(); // o contexto nasce suspenso; sem isto não há callbacks de áudio
  window.__dd = { ctx, node }; // handle de depuração/suporte
}

function pushSample(i) {
  const d = sampleData[i] && sampleData[i][current[i]];
  if (d) send({ type: 'sample', inst: i, data: d });
}

function pushFullState() {
  send({ type: 'bpm', value: bpm });
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 16; c++)
      if (grid[r][c]) send({ type: 'step', inst: r, step: c, on: true });
}

function paintPlayhead(s) {
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 16; c++)
      cells[r][c].classList.toggle('ph', playing && c === s);
}

// ---------- transporte ----------
const playBtn = document.getElementById('play');
playBtn.addEventListener('click', async () => {
  await ensureAudio();
  playing = !playing;
  playBtn.classList.toggle('playing', playing);
  playBtn.innerHTML = playing ? '&#9632; Stop' : '&#9654; Play';
  send({ type: 'playing', on: playing });
  if (!playing) paintPlayhead(-1);
});

const bpmEl = document.getElementById('bpm');
const setBpm = (d) => {
  bpm = Math.min(160, Math.max(90, bpm + d));
  bpmEl.textContent = bpm;
  send({ type: 'bpm', value: bpm });
};
document.getElementById('bpm-down').addEventListener('click', () => setBpm(-2));
document.getElementById('bpm-up').addEventListener('click', () => setBpm(2));

document.getElementById('rand').addEventListener('click', async () => {
  await ensureAudio();
  for (let r = 0; r < 6; r++) {
    current[r] = (current[r] + 1 + Math.floor(Math.random() * (VARIANTS - 1))) % VARIANTS;
    pushSample(r);
  }
  send({ type: 'rand' }); // randomizeGrid() do motor real; grade volta via 'grid'
});
