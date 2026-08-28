// UI da demo — controla o motor C++ real (WASM) via AudioWorklet (dd-processor.js).
// Ids de parâmetro casam com web/WebEngine.cpp: por instrumento = inst*16 + p;
// globais 1000+. Ranges idênticos ao APVTS do plugin.

// Versão do motor. O AudioWorklet e o .wasm são cacheados com força pelo
// navegador; sem esta query, publicar um motor novo deixa o usuário com o
// worklet antigo — e um 'case' que não existe mais falha em silêncio.
const ENGINE_V = '2';

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
// ACCENT é volume por step, como no painel do plugin: 0..1, neutro em 0.5.
const accents = Array(16).fill(0.5);

let ctx = null, node = null, ready = false;
let bpm = 126, playing = false;
const current = [0, 0, 0, 0, 0, 0];
const sampleData = {}; // sampleData[inst][variante] = Float32Array

const send = (msg) => { if (node) node.port.postMessage(msg); };

// ---------- knobs ----------
// range: {min,max,def,skew?}; envia via cb(valor)
function makeKnob(el, range, cb, label) {
  let val = range.def;
  // Um knob que só responde a arrasto exclui teclado e leitor de tela; o próprio
  // PRODUCT.md exige foco visível em tudo que é operável.
  el.setAttribute('role', 'slider');
  el.setAttribute('tabindex', '0');
  if (label) el.setAttribute('aria-label', label);
  el.setAttribute('aria-valuemin', String(range.min));
  el.setAttribute('aria-valuemax', String(range.max));
  const paint = () => {
    const t = (val - range.min) / (range.max - range.min);
    el.style.setProperty('--rot', (-135 + t * 270).toFixed(1) + 'deg');
    el.setAttribute('aria-valuenow', val.toFixed(2));
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
  el.addEventListener('keydown', (e) => {
    const passo = (range.max - range.min) / (e.shiftKey ? 50 : 20);
    let d = 0;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') d = passo;
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') d = -passo;
    else if (e.key === 'Home') { val = range.min; apply(); e.preventDefault(); return; }
    else if (e.key === 'End') { val = range.max; apply(); e.preventDefault(); return; }
    else return;
    val = Math.min(range.max, Math.max(range.min, val + d));
    apply();
    e.preventDefault();
  });
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
  // MUTE e SOLO empilhados numa coluna só, como no painel do plugin
  const stack = document.createElement('div');
  stack.className = 'ms-stack';

  const mute = document.createElement('button');
  mute.className = 'ms'; mute.textContent = 'MUTE';
  mute.setAttribute('aria-label', 'Mute do ' + INSTS[r]);
  mute.addEventListener('click', () => {
    mute.classList.toggle('on-mute');
    mute.setAttribute('aria-pressed', String(mute.classList.contains('on-mute')));
    send({ type: 'param', id: r * 16 + P.mute, value: mute.classList.contains('on-mute') ? 1 : 0 });
  });
  stack.appendChild(mute);

  const solo = document.createElement('button');
  solo.className = 'ms'; solo.textContent = 'SOLO';
  solo.setAttribute('aria-label', 'Solo do ' + INSTS[r]);
  solo.addEventListener('click', () => {
    solo.classList.toggle('on-solo');
    solo.setAttribute('aria-pressed', String(solo.classList.contains('on-solo')));
    send({ type: 'param', id: r * 16 + P.solo, value: solo.classList.contains('on-solo') ? 1 : 0 });
  });
  stack.appendChild(solo);
  seqEl.appendChild(stack);

  for (const [label, pid, range] of KNOB_DEFS) {
    const cell = document.createElement('div'); cell.className = 'kcell';
    const k = document.createElement('span'); k.className = 'knob';
    cell.appendChild(k);
    const cap = document.createElement('small'); cap.textContent = label;
    cell.appendChild(cap);
    seqEl.appendChild(cell);
    makeKnob(k, range, (v) => send({ type: 'param', id: r * 16 + pid, value: v }),
             label + ' do ' + INSTS[r]);
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
    b.className = 'step g' + (Math.floor(c / 4) + 1) + (c % 4 === 0 && c > 0 ? ' grp' : '')
                + (grid[r][c] ? ' on' : '');
    b.setAttribute('aria-label', INSTS[r] + ', step ' + (c + 1));
    b.addEventListener('click', async () => {
      grid[r][c] ^= 1; b.classList.toggle('on');
      send({ type: 'step', inst: r, step: c, on: !!grid[r][c] });
      if (grid[r][c]) { await ensureAudio(); send({ type: 'trigger', inst: r }); }
    });
    seqEl.appendChild(b); cells[r][c] = b;
  }

  // REV e DEL sao envios de FX: laranja, seguindo a regra de cor do painel
  // (laranja = painel/FX, grafite = canal).
  for (const [label, pid] of [['REV', P.rev], ['DEL', P.del]]) {
    const cell = document.createElement('div'); cell.className = 'kcell';
    const k = document.createElement('span'); k.className = 'knob orange';
    cell.appendChild(k);
    const cap = document.createElement('small'); cap.textContent = label;
    cell.appendChild(cap);
    seqEl.appendChild(cell);
    makeKnob(k, { min: 0, max: 1, def: 0 }, (v) => send({ type: 'param', id: r * 16 + pid, value: v }),
             label + ' do ' + INSTS[r]);
  }
}

// linha de accent
{
  const lab = document.createElement('div');
  lab.className = 'lab acc-lab'; lab.textContent = 'ACCENT';
  seqEl.appendChild(lab);
  for (let c = 0; c < 16; c++) {
    const b = document.createElement('button');
    b.className = 'acc';
    b.setAttribute('role', 'slider');
    b.setAttribute('aria-label', 'Volume do accent no step ' + (c + 1));
    b.setAttribute('aria-valuemin', '0');
    b.setAttribute('aria-valuemax', '1');

    const pinta = () => {
      b.style.setProperty('--v', accents[c].toFixed(3));
      b.setAttribute('aria-valuenow', accents[c].toFixed(2));
    };
    const aplica = (v) => {
      accents[c] = Math.min(1, Math.max(0, v));
      pinta();
      send({ type: 'accent', step: c, value: accents[c] });
    };

    let y0 = 0, v0 = 0;
    b.addEventListener('pointerdown', (e) => {
      y0 = e.clientY; v0 = accents[c];
      b.setPointerCapture(e.pointerId);
    });
    b.addEventListener('pointermove', (e) => {
      if (!b.hasPointerCapture?.(e.pointerId)) return;
      aplica(v0 + (y0 - e.clientY) / 90);
    });
    b.addEventListener('dblclick', () => aplica(0.5));
    b.addEventListener('keydown', (e) => {
      const passo = e.shiftKey ? 0.02 : 0.1;
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') aplica(accents[c] + passo);
      else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') aplica(accents[c] - passo);
      else if (e.key === 'Home') aplica(0);
      else if (e.key === 'End') aplica(1);
      else return;
      e.preventDefault();
    });

    pinta();
    seqEl.appendChild(b);
  }
  const fill1 = document.createElement('div'); fill1.className = 'acc-fill';
  seqEl.appendChild(fill1);
}

// linhas separadoras entre instrumentos, como no painel do plugin
for (let r = 1; r <= 5; r++) {
  const sep = document.createElement('div');
  sep.className = 'sep r' + r;
  sep.setAttribute('aria-hidden', 'true');
  seqEl.appendChild(sep);
}

// régua de compassos, alinhada à grade pelo mesmo template de colunas
{
  const ruler = document.getElementById('seq-ruler');
  const sp = document.createElement('span'); sp.className = 'sp';
  ruler.appendChild(sp);
  for (let c = 0; c < 16; c++) {
    const n = document.createElement('span');
    n.textContent = c + 1;
    if (c % 4 === 0 && c > 0) n.className = 'grp';
    ruler.appendChild(n);
  }
  const sp2 = document.createElement('span'); sp2.style.gridColumn = 'span 2';
  ruler.appendChild(sp2);
}

// ---------- painéis ----------
const grooveSel = document.getElementById('groove-type');
GROOVE_TYPES.forEach((n, i) => {
  const o = document.createElement('option'); o.value = i; o.textContent = n;
  grooveSel.appendChild(o);
});
grooveSel.addEventListener('change', () => send({ type: 'param', id: G.grooveType, value: +grooveSel.value }));

makeKnob(document.getElementById('groove-amt'), { min: 0, max: 1, def: 0 },
  (v) => send({ type: 'param', id: G.grooveAmt, value: v }), 'Groove amount');

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
let booting = null;

// Quem chamar durante a subida espera a MESMA promessa. Sem isto, um segundo
// clique enquanto o motor carrega vê ctx já criado, retorna cedo e manda a
// mensagem com node ainda nulo — que send() descarta em silêncio.
async function ensureAudio() {
  if (node) {
    // resume() fica pendente até o Chrome aceitar o gesto; não dá pra esperar por
    // ele, senão o MIDI GEN trava atrás da política de autoplay antes do play.
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return;
  }
  if (!booting) booting = bootAudio();
  return booting;
}

async function bootAudio() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  const [wasmBytes] = await Promise.all([
    fetch('engine.wasm?v=' + ENGINE_V).then((r) => r.arrayBuffer()),
    ctx.audioWorklet.addModule('dd-processor.js?v=' + ENGINE_V),
  ]);
  node = new AudioWorkletNode(ctx, 'drum-dealer', { outputChannelCount: [2] });
  node.connect(ctx.destination);
  node.port.postMessage({ type: 'wasm', data: wasmBytes }, [wasmBytes]);

  node.port.onmessage = (e) => {
    const m = e.data;
    if (m.type === 'step') paintPlayhead(m.step);
    else if (m.type === 'error') {
      console.error('engine:', m.message);
      mostrarFalha('O motor de áudio falhou: ' + m.message);
    }
    else if (m.type === 'ready') { ready = true; pushFullState(); }
    else if (m.type === 'grid') {
      for (let r = 0; r < 6; r++)
        for (let c = 0; c < 16; c++) {
          grid[r][c] = m.grid[r][c] ? 1 : 0;
          cells[r][c].classList.toggle('on', !!grid[r][c]);
        }
    }
    else if (m.type === 'peak') paintMeters(m.l, m.r);
    else if (m.type === 'gen') receiveGenerated(m);
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
  ctx.resume().catch(() => {}); // nasce suspenso; sem isto não há callbacks de áudio
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

const tallyEl = () => document.getElementById('tally');
const rulerCells = () => Array.from(document.getElementById('seq-ruler').children).slice(1, 17);

function paintPlayhead(s) {
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 16; c++)
      cells[r][c].classList.toggle('ph', playing && c === s);

  rulerCells().forEach((el, c) => el.classList.toggle('ph', playing && c === s));

  // a lâmpada bate no tempo forte, uma vez a cada quatro semicolcheias
  if (playing && s >= 0 && s % 4 === 0) {
    const t = tallyEl();
    t.classList.add('beat');
    setTimeout(() => t.classList.remove('beat'), 100);
  }
}

// ---------- transporte ----------
const playBtn = document.getElementById('play');
const falhaEl = document.getElementById('falha');

function mostrarFalha(msg) {
  falhaEl.textContent = msg;
  falhaEl.hidden = false;
}

// Carregar o motor é 1 MB de wasm mais a decodificação de todos os samples. Sem
// aviso, os primeiros segundos passam em silêncio e o visitante acha que quebrou.
async function comCarregando(btn, rotulo, fn) {
  const antes = btn.innerHTML;
  const jaTemMotor = !!node;
  if (!jaTemMotor) { btn.innerHTML = rotulo; btn.disabled = true; }
  try {
    await fn();
  } catch (err) {
    mostrarFalha('Não consegui carregar o motor de áudio. Recarregue a página.');
    console.error('drum dealer:', err);
    return false;
  } finally {
    if (!jaTemMotor) { btn.innerHTML = antes; btn.disabled = false; }
  }
  return true;
}

playBtn.addEventListener('click', async () => {
  if (!(await comCarregando(playBtn, 'Carregando…', ensureAudio))) return;
  playing = !playing;
  playBtn.classList.toggle('playing', playing);
  playBtn.innerHTML = playing ? '&#9632; Stop' : '&#9654; Play';
  document.getElementById('tally').classList.toggle('live', playing);
  document.getElementById('tally-label').textContent = playing ? 'Tocando' : 'Parado';
  send({ type: 'playing', on: playing });
  if (!playing) { paintPlayhead(-1); paintMeters(0, 0); }
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

// ---------- medidores L/R ----------
// Pico vindo do motor, com queda suave: sobe na hora, desce devagar, como
// medidor de verdade. Escala em dB para casar com a régua do plugin.
const meterEls = [document.getElementById('meter-l'), document.getElementById('meter-r')];
const meterHeld = [0, 0];

function paintMeters(l, r) {
  const vals = [l, r];
  for (let i = 0; i < 2; i++) {
    const v = vals[i] || 0;
    meterHeld[i] = v > meterHeld[i] ? v : meterHeld[i] * 0.82;
    // -48 dB .. +6 dB mapeados na altura da barra
    const db = 20 * Math.log10(Math.max(meterHeld[i], 1e-5));
    const pct = Math.max(0, Math.min(100, ((db + 48) / 54) * 100));
    meterEls[i].style.height = pct.toFixed(1) + '%';
  }
}

// ---------- MIDI GEN ----------
// Os selects espelham MidiGenerator::scaleNames() e o parâmetro genRoot do plugin.
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALES = ['Minor', 'Major', 'Dorian', 'Phrygian', 'Harmonic Minor', 'Pentatonic Minor'];

const genRootSel = document.getElementById('gen-root');
NOTE_NAMES.forEach((n, i) => {
  const o = document.createElement('option');
  o.value = i; o.textContent = n; genRootSel.appendChild(o);
});
genRootSel.value = 9; // A, o mesmo padrão do plugin

const genScaleSel = document.getElementById('gen-scale');
SCALES.forEach((n, i) => {
  const o = document.createElement('option');
  o.value = i; o.textContent = n; genScaleSel.appendChild(o);
});

const genBarsSel = document.getElementById('gen-bars');
const genStatus = document.getElementById('gen-status');
const generated = [null, null]; // 0 = bass, 1 = lead

function requestGen(kind) {
  send({
    type: 'generate',
    kind,
    root: parseInt(genRootSel.value, 10),
    scale: parseInt(genScaleSel.value, 10),
    bars: parseInt(genBarsSel.value, 10),
    seed: (Math.random() * 0xffffffff) >>> 0,
  });
}

function receiveGenerated(m) {
  const notes = [];
  for (let i = 0; i < m.count; i++) {
    notes.push({
      pitch: m.notes[i * 4],
      start: m.notes[i * 4 + 1],
      len: m.notes[i * 4 + 2],
      vel: m.notes[i * 4 + 3],
    });
  }
  generated[m.kind] = { notes, bars: m.bars };
  // a faixa só ocupa altura depois de ter o que mostrar
  document.getElementById(m.kind === 0 ? 'roll-bass' : 'roll-lead')
          .closest('.gen-lane').classList.add('cheia');
  requestAnimationFrame(() => drawRoll(m.kind));

  const link = document.getElementById(m.kind === 0 ? 'dl-bass' : 'dl-lead');
  if (link.href && link.dataset.blob) URL.revokeObjectURL(link.href);
  const blob = new Blob([writeMidiFile(notes, bpm)], { type: 'audio/midi' });
  link.href = URL.createObjectURL(blob);
  link.dataset.blob = '1';
  link.removeAttribute('aria-disabled');

  const nome = m.kind === 0 ? 'BASS' : 'LEAD';
  genStatus.textContent = `${nome}: ${m.count} notas em ${m.bars} compassos`;
}

// Prévia em piano-roll, no mesmo espírito da que o plugin mostra
function drawRoll(kind) {
  const canvas = document.getElementById(kind === 0 ? 'roll-bass' : 'roll-lead');
  const g = generated[kind];
  const ctx2 = canvas.getContext('2d');

  // O backing store precisa acompanhar o tamanho real em CSS e a densidade da
  // tela; fixo, o desenho sai esticado na horizontal e achatado na vertical.
  const dpr = window.devicePixelRatio || 1;
  const W = Math.max(1, Math.round(canvas.clientWidth));
  const H = Math.max(1, Math.round(canvas.clientHeight));
  if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
    canvas.width = W * dpr;
    canvas.height = H * dpr;
  }
  ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx2.clearRect(0, 0, W, H);
  ctx2.fillStyle = '#2b2925';
  ctx2.fillRect(0, 0, W, H);

  // Estado vazio: uma grade de compassos e o convite. Sem isto o painel parece
  // um retângulo preto quebrado antes do primeiro clique.
  if (!g || g.notes.length === 0) {
    ctx2.fillStyle = '#3f3a33';
    for (let b = 1; b < 8; b++) ctx2.fillRect(Math.round((b / 8) * W), 0, 1, H);
    for (let y = 1; y < 4; y++) ctx2.fillRect(0, Math.round((y / 4) * H), W, 1);
    ctx2.fillStyle = '#8d8271';
    ctx2.font = '600 13px "Martian Mono", ui-monospace, monospace';
    ctx2.textAlign = 'center';
    ctx2.textBaseline = 'middle';
    ctx2.fillText(kind === 0 ? 'clique BASS para gerar' : 'clique LEAD para gerar', W / 2, H / 2);
    return;
  }

  const totalBeats = g.bars * 4;
  let lo = Infinity, hi = -Infinity;
  for (const n of g.notes) { lo = Math.min(lo, n.pitch); hi = Math.max(hi, n.pitch); }
  const span = Math.max(12, hi - lo + 1);

  // linhas de compasso
  ctx2.fillStyle = '#3f3a33';
  for (let b = 1; b < g.bars; b++) ctx2.fillRect(Math.round((b * 4 / totalBeats) * W), 0, 1, H);

  ctx2.fillStyle = '#e8762c';
  for (const n of g.notes) {
    const x = (n.start / totalBeats) * W;
    const w = Math.max(1.5, (n.len / totalBeats) * W);
    const y = H - ((n.pitch - lo + 1) / span) * H;
    ctx2.fillRect(x, y, w, Math.max(2, H / span - 1));
  }
}

// Escreve um SMF tipo 0. As notas vêm em beats; 480 ticks por semínima.
function writeMidiFile(notes, tempo) {
  const TPQ = 480;
  const bytes = [];
  const push = (...b) => bytes.push(...b);
  const varlen = (v) => {
    const out = [v & 0x7f];
    v >>= 7;
    while (v > 0) { out.unshift((v & 0x7f) | 0x80); v >>= 7; }
    return out;
  };

  // eventos absolutos, note-on e note-off
  const events = [];
  for (const n of notes) {
    const on = Math.round(n.start * TPQ);
    const off = Math.max(on + 1, Math.round((n.start + n.len) * TPQ));
    const pitch = Math.max(0, Math.min(127, Math.round(n.pitch)));
    const vel = Math.max(1, Math.min(127, Math.round(n.vel)));
    events.push({ t: on, d: [0x90, pitch, vel] });
    events.push({ t: off, d: [0x80, pitch, 0] });
  }
  events.sort((a, b) => (a.t - b.t) || (a.d[0] - b.d[0]));

  const track = [];
  // tempo: microssegundos por semínima
  const usPerBeat = Math.round(60000000 / (tempo || 126));
  track.push(0x00, 0xff, 0x51, 0x03,
             (usPerBeat >> 16) & 0xff, (usPerBeat >> 8) & 0xff, usPerBeat & 0xff);
  let last = 0;
  for (const ev of events) {
    track.push(...varlen(ev.t - last), ...ev.d);
    last = ev.t;
  }
  track.push(0x00, 0xff, 0x2f, 0x00); // fim da track

  // cabeçalho MThd
  push(0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, (TPQ >> 8) & 0xff, TPQ & 0xff);
  // chunk MTrk
  const len = track.length;
  push(0x4d, 0x54, 0x72, 0x6b,
       (len >>> 24) & 0xff, (len >>> 16) & 0xff, (len >>> 8) & 0xff, len & 0xff);
  push(...track);

  return new Uint8Array(bytes);
}

for (const [id, kind] of [['gen-bass', 0], ['gen-lead', 1]]) {
  const btn = document.getElementById(id);
  btn.addEventListener('click', async () => {
    if (!(await comCarregando(btn, '…', ensureAudio))) return;
    genStatus.textContent = 'gerando…';
    requestGen(kind);
  });
}

// Trocar tom, escala ou compassos invalida o que já foi gerado
for (const sel of [genRootSel, genScaleSel, genBarsSel]) {
  sel.addEventListener('change', () => {
    for (const kind of [0, 1]) if (generated[kind]) requestGen(kind);
  });
}

drawRoll(0);
drawRoll(1);

let redesenho;
window.addEventListener('resize', () => {
  clearTimeout(redesenho);
  redesenho = setTimeout(() => { drawRoll(0); drawRoll(1); }, 120);
});
