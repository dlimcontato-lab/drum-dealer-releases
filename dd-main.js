// Demo do topo: o painel do plugin (dd-painel.js + dd-edit.js) tocando o motor C++ do plugin em WASM.
import { montarPainel, escalar, desenharRolo, GRADE_INICIAL, INST_IDS } from './dd-painel.js?v=20260925d';
import { montarEdit } from './dd-edit.js?v=20260925d';
import { criarAudio, carregarEspelho, escreverMidi } from './dd-audio.js?v=20260925d';
import { criarPal } from './dd-pal.js?v=20260925d';
import { t } from './dd-i18n.js';

const TESTE = new URLSearchParams(location.search).get('teste') === '1'; // mesma flag de dd-audio.js
const V = '20260925d';
const carregar = (u) => fetch(u + '?v=' + V).then((r) => {
  if (!r.ok) throw new Error(u + ': ' + r.status);
  return r.json();
});
const [layout, lista, palJson] = await Promise.all([
  carregar('painel/layout.json'), carregar('painel/params.json'), carregar('painel/pal.json'),
]);
const params = new Map(lista.map((p) => [p.id, p]));
const valores = new Map(lista.map((p) => [p.id, p.def]));
const SO_NA_PAGINA = new Set(['genRoot', 'genScale', 'genBars']);   // o MIDI GEN recebe na hora de gerar

// Task 15C (24/09): o motor WASM de hoje (6f13917) conhece todos os 149 IDs vivos do params.json,
// inclusive os 19 novos da Task 15B (grooveFamily, fillBeat/fillContra, echoBeat, gridLength,
// kickKey, kickPunch, <inst>Release ×6, <inst>EchoOn ×6). Todo parâmetro que não é SO_NA_PAGINA vai
// pro motor pelo próprio id — sem SO_VISUAL nem mapeamento pros legados (grooveType/echoDiv/
// fillRate), que o motor novo não conhece mais e nunca são enviados.
const $ = (id) => document.getElementById(id);

const grid = GRADE_INICIAL.map((l) => l.slice());
const accents = Array(16).fill(0.5);
const gerado = [null, null];
const gr = [0, 0, 0];
let bpm = 126;
let tocando = false;
let passo = -1;
let pal = null;
let edit = null;
let painel = null;

const falhaEl = $('falha');
const mostrarFalha = (msg) => { falhaEl.textContent = msg; falhaEl.hidden = false; };
const falhaMotor = (err) => { console.error('brdrum:', err); mostrarFalha(t('panel.motor-falha')); };

const audio = criarAudio({
  aoPasso(s) { passo = s; painel.playhead(s, tocando); },
  aoPico(l, r, g) {
    painel.medir(l, r);
    g.forEach((x, i) => { gr[i] = x; });
    if (edit.pagina() === 1) edit.setGr(gr);
  },
  aoGrade(g) {
    for (let r = 0; r < 6; r++) for (let c = 0; c < 16; c++) grid[r][c] = g[r][c] ? 1 : 0;
    painel.pintarGrade(grid);
  },
  aoGerado: receberGerado,
  aoParams(vals) {
    for (const [id, v] of Object.entries(vals)) {
      valores.set(id, v);
      const w = painel.controles.get(id);
      if (w) w.set(v);
    }
    edit.atualizar();
  },
  aoFalha: mostrarFalha,
  aoAmostraFalha(nomes) { painel.statusGen(nomes.join(', ') + t(nomes.length > 1 ? 'panel.amostra-suffix-many' : 'panel.amostra-suffix-one')); },
  estadoInicial() {
    const msgs = [{ type: 'bpm', value: bpm }];
    for (const id of painel.controles.keys())
      if (!SO_NA_PAGINA.has(id)) msgs.push({ type: 'param', id, value: valores.get(id) });
    for (let r = 0; r < 6; r++) for (let c = 0; c < 16; c++) msgs.push({ type: 'step', inst: r, step: c, on: !!grid[r][c] });
    accents.forEach((v, c) => msgs.push({ type: 'accent', step: c, value: v }));
    msgs.push({ type: 'playing', on: tocando });
    return msgs;
  },
});

const ao = {
  mudou(id, v) {
    valores.set(id, v);
    if (SO_NA_PAGINA.has(id)) { /* só na hora de gerar */ }
    else audio.enviar({ type: 'param', id, value: v });
    reagir(id);
  },
  clearRow(r) {
    for (let c = 0; c < 16; c++) { grid[r][c] = 0; audio.enviar({ type: 'step', inst: r, step: c, on: false }); }
    painel.pintarGrade(grid);
  },
  randRow(r) {
    for (let c = 0; c < 16; c++) {
      const on = Math.random() < 0.5;
      grid[r][c] = on ? 1 : 0;
      audio.enviar({ type: 'step', inst: r, step: c, on });
    }
    painel.pintarGrade(grid);
  },
  step(r, c, on) {
    grid[r][c] = on ? 1 : 0;
    audio.enviar({ type: 'step', inst: r, step: c, on });
    if (on) audio.garantir().then(() => audio.enviar({ type: 'trigger', inst: r })).catch(falhaMotor);
  },
  accent(c, v) { accents[c] = v; audio.enviar({ type: 'accent', step: c, value: v }); },
  pad(r) { audio.garantir().then(() => { audio.trocarAmostra(r); audio.enviar({ type: 'trigger', inst: r }); }).catch(falhaMotor); },
  rand() { audio.garantir().then(() => { audio.sortearAmostras(); audio.enviar({ type: 'rand' }); }).catch(falhaMotor); },
  gerar(kind) {
    comCarregando(painel.genKeys[kind], null, audio.garantir).then((ok) => {
      if (!ok) return;
      painel.statusGen(t('panel.gerando'));
      pedirGeracao(kind);
    });
  },
  edit(p) { edit.alternar(p); },
  editMudou(p) {
    painel.editTeclas.forEach((t, i) => t.classList.toggle('on-sync', i === p));
    if (p === 0) curvaAtual();
    if (p === 1) edit.setGr(gr);
  },
  preset(p) { audio.garantir().then(() => audio.enviar({ type: 'preset', preset: p })).catch(falhaMotor); },
  pal(evento) { if (pal) pal.evento(evento); },
  teclaEdit: (p) => painel.editTeclas[p],
};

painel = montarPainel($('aparelho'), layout, params, palJson, ao);
edit = montarEdit($('aparelho'), layout, params, painel.controles, ao);
painel.pintarGrade(grid);
escalar($('aparelho-rolo'), $('aparelho-caixa'), $('aparelho'));

function nomeEscolha(id) {
  return params.get(id).choices[Math.round(valores.get(id))];
}

function reagir(id) {
  if (id === 'toneX20') painel.armarToneX(valores.get('toneX20') > 0.5);
  // fillBeat é a serigrafia nova do RATE da virada (fillRate legado sai de cena, só recebe o valor
  // mapeado quando existe — dd-main.js topo)
  if (id === 'fillBeat') painel.legendas.rate.textContent = 'RATE ' + nomeEscolha('fillBeat');
  if (id === 'echoSync' || id === 'echoBeat') {
    const sync = valores.get('echoSync') > 0.5;
    painel.trocarTempoEcho(sync);
    painel.legendas.tempo.textContent = sync ? 'TIME ' + nomeEscolha('echoBeat') : 'TIME';
  }
  if (id === 'echoMod') painel.legendas.mod.textContent = 'MOD ' + Math.round(Math.min(1, Math.max(0, valores.get('echoMod'))) * 100) + '%';
  if (id.startsWith('sat')) { edit.atualizar(); curvaAtual(); }
  // visor da nota do KICK: KEY liga/desliga a fonte (MIDI GEN x TUNE); o TOM do MIDI GEN só conta
  // quando a KEY está ligada, mas repintar sempre é barato e mantém o visor sempre certo
  if (id === 'kickKey' || id === 'kickTone' || id === 'genRoot') painel.atualizarNota();
  if (SO_NA_PAGINA.has(id)) for (const k of [0, 1]) if (gerado[k]) pedirGeracao(k);
}
['toneX20', 'fillBeat', 'echoSync', 'echoMod', 'kickKey'].forEach(reagir);

async function curvaAtual() {
  if (edit.pagina() !== 0) return;
  const M = await carregarEspelho().catch(() => null);
  if (!M) { edit.setCurva(null); return; }
  const n = 256;
  const ptr = M._malloc(n * 4);
  const v = (id) => valores.get(id);
  M._web_sat_curve(Math.round(v('satType')), v('satDriveDb'), Math.round(v('satClip')),
    v('satWsDrive') / 100, v('satWsLin') / 100, v('satWsCurve') / 100, v('satWsDamp') / 100,
    v('satWsDepth') / 100, v('satWsPeriod') / 100, ptr, n);
  const pts = Array.from(M.HEAPF32.subarray(ptr / 4, ptr / 4 + n));
  M._free(ptr);
  edit.setCurva(pts);
}

// ---------- transporte (fora da moldura) ----------
async function comCarregando(btn, rotulo, fn) {
  const alvo = btn.querySelector('.rot') || btn;
  const antes = alvo.textContent;
  const jaTem = audio.ativo();
  if (!jaTem) { if (rotulo) alvo.textContent = rotulo; btn.disabled = true; }
  try {
    await fn();
  } catch (err) {
    falhaMotor(err);
    return false;
  } finally {
    if (!jaTem) { alvo.textContent = antes; btn.disabled = false; }
  }
  return true;
}

const playBtn = $('play');
async function alternarPlay() {
  // garantir() já tenta resume() de novo aqui (síncrono no boot, ou no AudioContext existente); se
  // depois do resume() assentar o contexto ainda não estiver 'running', não afirma que está tocando.
  if (!(await comCarregando(playBtn, t('common.carregando'), audio.garantir))) return;
  const vaiTocar = !tocando;
  if (vaiTocar && !audio.estaRodando()) {
    painel.statusGen(t('panel.toque-play-de-novo'));
    return;
  }
  tocando = vaiTocar;
  playBtn.classList.toggle('playing', tocando);
  playBtn.querySelector('.rot').textContent = tocando ? 'Stop' : 'Play';
  painel.tocando(tocando);
  audio.enviar({ type: 'playing', on: tocando });
  ao.pal(tocando ? 'play' : 'stop');
  if (!tocando) { passo = -1; painel.playhead(-1, false); painel.medir(0, 0); audio.pausar(); }
}
playBtn.addEventListener('click', alternarPlay);

// ---------- atalho de teclado: barra de espaço toca/pausa, como em qualquer DAW ----------
// Arma no pointerdown dentro da moldura do aparelho ou da barra de transporte; qualquer pointerdown
// fora desarma. Assim o resto da página (compra, conta, digitação) nunca perde a barra de espaço.
let atalhoArmado = false;
const CAMPO_DE_TEXTO = 'input, textarea, select, [contenteditable], [contenteditable=""]';
const ehCampoDeTexto = (el) => !!el && typeof el.matches === 'function' && el.matches(CAMPO_DE_TEXTO);
document.addEventListener('pointerdown', (e) => {
  atalhoArmado = !!e.target.closest?.('#aparelho, #transporte');
});
// focusin cobre o Tab: sair do aparelho/transporte por teclado desarma igual a um pointerdown fora.
document.addEventListener('focusin', (e) => {
  if (ehCampoDeTexto(e.target) || !e.target.closest?.('#aparelho, #transporte')) atalhoArmado = false;
});
document.addEventListener('keydown', (e) => {
  if (e.code !== 'Space' || e.repeat || !atalhoArmado) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (ehCampoDeTexto(document.activeElement)) return;
  if (playBtn.disabled) return; // não passa por cima do "Carregando…"
  e.preventDefault(); // não deixa a página rolar
  alternarPlay();
});
document.addEventListener('keyup', (e) => {
  // O navegador ativa um <button> focado no keyup do espaço (ex.: um passo focado após o clique
  // que armou o atalho); sem isso o espaço tocaria E alternaria o passo/tecla que está com foco.
  if (e.code !== 'Space' || !atalhoArmado) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (ehCampoDeTexto(document.activeElement)) return;
  e.preventDefault();
});

const setBpm = (d) => {
  bpm = Math.min(160, Math.max(90, bpm + d));
  $('bpm').textContent = bpm;
  audio.enviar({ type: 'bpm', value: bpm });
};
$('bpm-down').addEventListener('click', () => setBpm(-2));
$('bpm-up').addEventListener('click', () => setBpm(2));

// ---------- MIDI GEN ----------
function pedirGeracao(kind) {
  audio.enviar({
    type: 'generate', kind,
    root: Math.round(valores.get('genRoot')),
    scale: Math.round(valores.get('genScale')),
    bars: Number(nomeEscolha('genBars')),
    seed: (Math.random() * 0xffffffff) >>> 0,
  });
}

function receberGerado(m) {
  const notas = [];
  for (let i = 0; i < m.count; i++)
    notas.push({ pitch: m.notes[i * 4], start: m.notes[i * 4 + 1], len: m.notes[i * 4 + 2], vel: m.notes[i * 4 + 3] });
  gerado[m.kind] = { notes: notas, bars: m.bars };
  requestAnimationFrame(() => desenharRolo(painel.rolos[m.kind], gerado[m.kind], m.kind));
  const link = $(m.kind === 0 ? 'dl-bass' : 'dl-lead');
  if (link.dataset.blob) URL.revokeObjectURL(link.href);
  link.href = URL.createObjectURL(new Blob([escreverMidi(notas, bpm)], { type: 'audio/midi' }));
  link.dataset.blob = '1';
  link.removeAttribute('aria-disabled');
  const texto = t('panel.gerado-texto', { kind: m.kind === 0 ? 'BASS' : 'LEAD', count: m.count, bars: m.bars });
  painel.statusGen(texto);
}

if (location.hash === '#edit-sat') edit.abrir(0);
if (location.hash === '#edit-mb') edit.abrir(1);

if (TESTE) {
  window.__dd = {
    painel, edit, audio, layout, valores, params, INST_IDS,
    estado: () => ({ pronto: audio.pronto(), tocando, passo, pico: painel.picoAtual(), gr: gr.slice() }),
    curva: () => edit.pontosCurva(),
    get pal() { return pal; },
    set pal(p) { pal = p; },
  };
}

// ---------- o Pal ----------
// Carrega o espelho sem esperar o primeiro clique: o Pal vive antes do som. Até ele chegar, a tela mostra
// o quadro contente do pal.json.
const lerEntradasPal = () => {
  const v = (id) => valores.get(id);
  return {
    tocando,
    beat: tocando && passo >= 0 ? Math.floor(passo / 4) : 0,
    masterDb: v('masterGain'),
    vols: INST_IDS.map((id) => v(id + 'Vol')),
    // corte nos efeitos: DRY/WET da SATURATION e AMOUNT do MULTIBAND só contam ligados (igual ao editor)
    fx: [v('satOn') > 0.5 ? Math.min(1, Math.max(0, v('satDryWet') / 100)) : 0,
      v('mbOn') > 0.5 ? Math.min(1, Math.max(0, v('mbAmount') / 100)) : 0,
      v('echoMix')],
  };
};
carregarEspelho()
  .then((M) => { pal = criarPal({ espelho: M, pixels: painel.pixels, aparelho: $('aparelho'), lerEntradas: lerEntradasPal, pixelScreen: layout.pixelScreen }); })
  .catch((err) => console.error('brdrum: Pal sem motor', err));

// ---------- idioma: só o texto muda, o som e o estado seguem tocando ----------
document.addEventListener('dd-lang-changed', () => {
  painel.tocando(tocando); // repinta "Parado"/"Tocando" no idioma atual
  for (let k = 0; k < 2; k++) desenharRolo(painel.rolos[k], gerado[k], k); // placeholder "APERTE X PARA GERAR"
});
