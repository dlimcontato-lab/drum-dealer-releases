// Painel da demo = painel do plugin. Todas as posições vêm de painel/layout.json, gerado de
// Source/UiLayout.h pelo MaschinTests (MASCHIN_WEB_DUMP). Aqui mora só a aparência e o clique.
// Os nomes das teclas/controles (SAMPLER, RAND, EXPORT, FILL, GROOVE, MASTER FX, ECHO, TONE X...)
// ficam iguais nos dois idiomas; só o texto ao redor (rótulos, aria-label, status) traduz.
import { faixa, textoValor, fracaoDb } from './dd-norm.js?v=20260917c';
import { t } from './dd-i18n.js';

export const INSTS = ['KICK', 'SNARE', 'CLAP', 'CHAT', 'OHAT', 'TOM'];
export const INST_IDS = ['kick', 'snare', 'clap', 'chat', 'ohat', 'tom'];
export const GRADE_INICIAL = [
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
];
const CANAL = [['Decay', 'DECAY'], ['Tone', 'TONE'], ['Vol', 'VOL'], ['Pan', 'PAN'], ['Noise', 'NOISE']];

export function posiciona(n, [x, y, w, h]) {
  n.style.left = x + 'px';
  n.style.top = y + 'px';
  n.style.width = w + 'px';
  n.style.height = h + 'px';
}

export function peca(pai, tag, cls, caixa, texto) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (caixa) { n.classList.add('p-abs'); posiciona(n, caixa); }
  if (texto != null) n.textContent = texto;
  if (tag === 'button') n.type = 'button';
  pai.appendChild(n);
  return n;
}

export function legenda(pai, caixa, texto, extra = '') {
  const n = peca(pai, 'span', ('p-leg ' + extra).trim(), caixa, texto);
  n.setAttribute('aria-hidden', 'true');
  return n;
}

export function moldura(pai, caixa, titulo, grande = false) {
  const m = peca(pai, 'div', 'p-moldura', caixa);
  m.setAttribute('aria-hidden', 'true');
  peca(m, 'span', 'p-titulo' + (grande ? ' grande' : ''), null, titulo);
  return m;
}

// Knob: arrasto vertical no espaço normalizado do parâmetro (200 px = curso inteiro),
// setas do teclado, Home/End e duplo clique volta ao padrão do plugin.
export function criarKnob(n, param, { rotulo, laranja = false, aoMudar, aoTocar }) {
  const f = faixa(param);
  let valor = param.def;
  const d = parseFloat(n.style.width) || 38;
  n.classList.add('knob', 'p-knob');
  if (laranja) n.classList.add('orange');
  n.style.setProperty('--d', d + 'px');
  n.setAttribute('role', 'slider');
  n.tabIndex = 0;
  n.setAttribute('aria-label', rotulo);
  n.setAttribute('aria-valuemin', String(param.min));
  n.setAttribute('aria-valuemax', String(param.max));
  const nPontos = d >= 45 ? 15 : 11;
  const pontos = [];
  for (let i = 0; i < nPontos; i++) {
    const p = document.createElement('i');
    p.style.setProperty('--a', (-135 + (270 * i) / (nPontos - 1)).toFixed(1) + 'deg');
    n.appendChild(p);
    pontos.push(p);
  }
  const pinta = () => {
    const t = f.to01(valor);
    n.style.setProperty('--rot', (-135 + t * 270).toFixed(1) + 'deg');
    n.setAttribute('aria-valuenow', String(valor));
    n.setAttribute('aria-valuetext', param.choices ? param.choices[Math.round(valor)] : textoValor(param.id, valor));
    const acesos = Math.round(t * (nPontos - 1));
    pontos.forEach((p, i) => p.classList.toggle('lit', i <= acesos));
  };
  const muda = (v) => {
    if (v === valor) return;
    valor = v;
    pinta();
    aoMudar(valor);
  };
  let y0 = 0;
  let t0 = 0;
  n.addEventListener('pointerdown', (e) => {
    y0 = e.clientY;
    t0 = f.to01(valor);
    n.setPointerCapture(e.pointerId);
    n.classList.add('arrastando');
    if (aoTocar) aoTocar();
    e.preventDefault();
  });
  n.addEventListener('pointermove', (e) => {
    if (!n.hasPointerCapture(e.pointerId)) return;
    muda(f.from01(t0 + (y0 - e.clientY) / 200));
  });
  const solta = () => n.classList.remove('arrastando');
  n.addEventListener('pointerup', solta);
  n.addEventListener('pointercancel', solta);
  n.addEventListener('dblclick', () => muda(param.def));
  n.addEventListener('keydown', (e) => {
    const passo = param.choices ? 1 / (param.choices.length - 1) : e.shiftKey ? 0.01 : 0.05;
    const t = f.to01(valor);
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') muda(f.from01(t + passo));
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') muda(f.from01(t - passo));
    else if (e.key === 'Home') muda(f.from01(0));
    else if (e.key === 'End') muda(f.from01(1));
    else return;
    if (aoTocar) aoTocar();
    e.preventDefault();
  });
  pinta();
  return {
    get: () => valor,
    set: (v) => { valor = Math.min(param.max, Math.max(param.min, v)); pinta(); },
    el: n,
    param,
  };
}

// Tecla liga/desliga (MUTE, SOLO, ON, SYNC, LED do TONE X, TONE X do topo)
export function criarTecla(n, param, { classeOn, led = null, rotulo, aoMudar }) {
  let valor = param.def > 0.5 ? 1 : 0;
  n.setAttribute('aria-label', rotulo);
  const pinta = () => {
    n.classList.toggle(classeOn, valor === 1);
    if (led) led.classList.toggle('on', valor === 1);
    n.setAttribute('aria-pressed', String(valor === 1));
  };
  n.addEventListener('click', () => {
    valor = valor ? 0 : 1;
    pinta();
    aoMudar(valor);
  });
  pinta();
  return { get: () => valor, set: (v) => { valor = v > 0.5 ? 1 : 0; pinta(); }, el: n, param };
}

// Seletor de escolha (os nomes vêm do AudioParameterChoice, em caixa alta como a serigrafia)
export function criarSeletor(n, param, { rotulo, aoMudar }) {
  (param.choices || []).forEach((c, i) => {
    const o = document.createElement('option');
    o.value = String(i);
    o.textContent = c.toUpperCase();
    n.appendChild(o);
  });
  n.value = String(Math.round(param.def));
  n.setAttribute('aria-label', rotulo);
  n.addEventListener('change', () => aoMudar(+n.value));
  return { get: () => +n.value, set: (v) => { n.value = String(Math.round(v)); }, el: n, param };
}

function criarAccent(n, c, aoMudar) {
  let v = 0.5;
  n.setAttribute('role', 'slider');
  n.setAttribute('aria-label', t('panel.accent-aria', { n: c + 1 }));
  n.setAttribute('aria-valuemin', '0');
  n.setAttribute('aria-valuemax', '1');
  const pinta = () => {
    n.style.setProperty('--v', v.toFixed(3));
    n.setAttribute('aria-valuenow', v.toFixed(2));
  };
  const aplica = (x) => {
    v = Math.min(1, Math.max(0, x));
    pinta();
    aoMudar(c, v);
  };
  let y0 = 0;
  let v0 = 0;
  n.addEventListener('pointerdown', (e) => { y0 = e.clientY; v0 = v; n.setPointerCapture(e.pointerId); e.preventDefault(); });
  n.addEventListener('pointermove', (e) => { if (n.hasPointerCapture(e.pointerId)) aplica(v0 + (y0 - e.clientY) / 64); });
  n.addEventListener('dblclick', () => aplica(0.5));
  n.addEventListener('keydown', (e) => {
    const passo = e.shiftKey ? 0.02 : 0.1;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') aplica(v + passo);
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') aplica(v - passo);
    else if (e.key === 'Home') aplica(0);
    else if (e.key === 'End') aplica(1);
    else return;
    e.preventDefault();
  });
  pinta();
  return { get: () => v, set: (x) => { v = x; pinta(); }, el: n };
}

// Visor do MIDI GEN: prévia em piano-roll (mesmo desenho da demo anterior)
export function desenharRolo(canvas, g, kind) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = Math.max(1, Math.round(canvas.clientWidth));
  const H = Math.max(1, Math.round(canvas.clientHeight));
  if (canvas.width !== W * dpr || canvas.height !== H * dpr) { canvas.width = W * dpr; canvas.height = H * dpr; }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#161618';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(233,230,222,.16)';
  if (!g || g.notes.length === 0) {
    for (let b = 1; b < 8; b++) ctx.fillRect(Math.round((b / 8) * W), 0, 1, H);
    for (let y = 1; y < 4; y++) ctx.fillRect(0, Math.round((y / 4) * H), W, 1);
    ctx.fillStyle = '#a39e93';
    ctx.font = '600 11px Barlow, "Arial Narrow", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t('panel.aperte-para-gerar', { kind: kind === 0 ? 'BASS' : 'LEAD' }), W / 2, H / 2);
    return;
  }
  const total = g.bars * 4;
  let lo = Infinity;
  let hi = -Infinity;
  for (const n of g.notes) { lo = Math.min(lo, n.pitch); hi = Math.max(hi, n.pitch); }
  const span = Math.max(12, hi - lo + 1);
  for (let b = 1; b < g.bars; b++) ctx.fillRect(Math.round(((b * 4) / total) * W), 0, 1, H);
  ctx.fillStyle = '#e0702a';
  ctx.shadowColor = 'rgba(224,112,42,.6)';
  ctx.shadowBlur = 4;
  for (const n of g.notes) {
    const x = (n.start / total) * W;
    const w = Math.max(1.5, (n.len / total) * W);
    const y = H - ((n.pitch - lo + 1) / span) * H;
    ctx.fillRect(x, y, w, Math.max(2, H / span - 1));
  }
}

export function pintarPal(pixels, texto) {
  for (let k = 0; k < pixels.length; k++) {
    const c = texto[k];
    pixels[k].className = c === '#' ? 'on' : c === 'o' ? 'furo' : '';
  }
}

// Escala do aparelho: cabe na largura, nunca acima de 100%.
// No desktop/tablet (rolo.clientWidth >= 900) o piso continua 0,6: aqui a demo é tocável e os
// steps não podem ficar pequenos demais para o dedo/mouse, então abaixo de 900px de rolo o
// aparelho preferia rolar na horizontal a encolher mais (D13 antiga).
// No celular (rolo.clientWidth < 900) o piso cai para 0,2 e a caixa acompanha a altura escalada:
// a demo é vitrine, não painel de trabalho (D13, 2026-09-24) — ela precisa caber inteira na tela,
// sem cortar REVERB/DELAY/MASTER FX/FILL, mesmo que os alvos de toque da demo fiquem abaixo de
// 44px; os controles nativos abaixo dela (PLAY, BPM, etc) continuam com 44px (D12).
export function escalar(rolo, caixa, aparelho) {
  const ajusta = () => {
    const piso = rolo.clientWidth < 900 ? 0.2 : 0.6;
    const s = Math.max(piso, Math.min(1, rolo.clientWidth / 1600));
    aparelho.style.transform = `scale(${s})`;
    caixa.style.width = Math.round(1600 * s) + 'px';
    caixa.style.height = Math.round(1126 * s) + 'px';
    aparelho.dataset.escala = s.toFixed(3);
  };
  new ResizeObserver(ajusta).observe(rolo);
  ajusta();
}

export function montarPainel(raiz, L, params, palJson, ao) {
  const P = (id) => {
    const p = params.get(id);
    if (!p) throw new Error('painel/params.json sem ' + id);
    return p;
  };
  const controles = new Map();
  const liga = (id, w) => { controles.set(id, w); return w; };
  const knob = (caixa, id, rotulo, laranja = false, aoTocar = () => ao.pal('decision')) =>
    liga(id, criarKnob(peca(raiz, 'span', '', caixa), P(id), { rotulo, laranja, aoMudar: (v) => ao.mudou(id, v), aoTocar }));
  const tecla = (caixa, cls, texto, id, classeOn, rotulo) =>
    liga(id, criarTecla(peca(raiz, 'button', cls, caixa, texto), P(id), { classeOn, rotulo, aoMudar: (v) => { ao.pal('click'); ao.mudou(id, v); } }));
  const seletor = (caixa, id, rotulo) =>
    liga(id, criarSeletor(peca(raiz, 'select', 'recess', caixa), P(id), { rotulo, aoMudar: (v) => { ao.pal('decision'); ao.mudou(id, v); } }));

  // aço: parafusos, faixa de identidade e marca
  const s = L.screwInset;
  for (const [x, y] of [[s, s], [1600 - s, s], [s, 1126 - s], [1600 - s, 1126 - s]]) {
    const p = peca(raiz, 'span', 'p-screw');
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.setAttribute('aria-hidden', 'true');
  }
  const [fx, fy, fw] = L.top.stripe;
  const faixaCores = peca(raiz, 'div', 'p-stripe', [fx - 1, fy - 1, fw + 2, 21]);
  faixaCores.setAttribute('aria-hidden', 'true');
  ['var(--cream)', 'var(--yellow)', 'var(--orange)', 'var(--red)'].forEach((cor, k) => {
    const i = peca(faixaCores, 'i', '');
    i.style.top = 1 + k * 5 + 'px';
    i.style.background = cor;
  });
  const logo = peca(raiz, 'div', 'p-logo', L.top.logo);
  logo.innerHTML = '<img src="img/brdrum-logo-oficial.png" alt="BRDRUM Rhythm Composer - 001">';   // LOGO OFICIAL (23/09), a mesma do aparelho
  logo.setAttribute('aria-hidden', 'true');

  // topo: SAMPLER e EXPORT só no plugin
  const nota = peca(raiz, 'span', 'p-nota', L.top.license, t('panel.only-plugin-note'));
  nota.id = 'p-so-plugin';
  for (const [caixa, texto] of [[L.top.sampler, 'Sampler'], [L.top.export, 'Export']]) {
    const b = peca(raiz, 'button', 'key cream', caixa, texto);
    b.disabled = true;
    b.title = t('panel.only-plugin-title');
    b.setAttribute('aria-describedby', 'p-so-plugin');
  }
  const toneX = peca(raiz, 'button', 'key', L.top.toneX);
  toneX.innerHTML = '<span class="led" aria-hidden="true"></span>Tone X';
  liga('toneX20', criarTecla(toneX, P('toneX20'), {
    classeOn: 'ligada', led: toneX.firstChild, rotulo: t('panel.tonex-rotulo'),
    aoMudar: (v) => { ao.pal('click'); ao.mudou('toneX20', v); },
  }));
  const rand = peca(raiz, 'button', 'key orange', L.top.rand, 'Rand');
  rand.addEventListener('click', () => { ao.pal('rand'); ao.rand(); });
  // ordem no DOM igual à do painel: SAMPLER, TONE X, RAND, EXPORT (o EXPORT vai para depois do RAND)
  raiz.appendChild(raiz.querySelectorAll(':scope > button.key[disabled]')[1]);

  // números dos passos e filetes
  L.stepNumbers.forEach((b, i) => peca(raiz, 'span', 'p-num' + (i % 4 === 0 ? ' forte' : ''), b, String(i + 1)).setAttribute('aria-hidden', 'true'));
  L.rowLines.forEach((b) => peca(raiz, 'i', 'p-linha', b));

  // linhas dos instrumentos
  const steps = [];
  const pads = [];
  const toneXLeds = [];
  L.rows.forEach((row, r) => {
    const id = INST_IDS[r];
    const nome = INSTS[r];
    tecla(row.mute, 'ms ms-pair', 'MUTE', id + 'Mute', 'on-mute', t('panel.label-of', { label: 'Mute', inst: nome }));
    tecla(row.solo, 'ms ms-pair', 'SOLO', id + 'Solo', 'on-solo', t('panel.label-of', { label: 'Solo', inst: nome }));
    CANAL.forEach(([suf, leg], k) => {
      knob(row.knobs[k], id + suf, t('panel.label-of', { label: leg, inst: nome }));
      legenda(raiz, row.knobLegends[k], leg);
    });
    const led = peca(raiz, 'button', 'p-ledx', row.toneXLed);
    toneXLeds[r] = led;
    liga(id + 'ToneX', criarTecla(led, P(id + 'ToneX'), { classeOn: 'on', rotulo: t('panel.label-of', { label: 'TONE X', inst: nome }), aoMudar: (v) => { ao.pal('click'); ao.mudou(id + 'ToneX', v); } }));
    const pad = peca(raiz, 'button', 'lab', row.pad, nome);
    pad.title = t('panel.pad-title', { inst: nome });
    pad.addEventListener('click', () => { ao.pal('decision'); ao.pad(r); });
    pads[r] = pad;
    steps[r] = row.steps.map((b, c) => {
      const st = peca(raiz, 'button', 'step g' + (Math.floor(c / 4) + 1), b);
      st.setAttribute('aria-label', t('panel.step-aria', { inst: nome, n: c + 1 }));
      st.setAttribute('aria-pressed', 'false');
      st.addEventListener('click', () => {
        const on = !st.classList.contains('on');
        st.classList.toggle('on', on);
        st.setAttribute('aria-pressed', String(on));
        ao.pal('decision');
        ao.step(r, c, on);
      });
      return st;
    });
    knob(row.rev, id + 'RevSend', t('panel.label-of', { label: 'REV', inst: nome }), true);
    legenda(raiz, row.revLegend, 'REV', 'laranja');
    knob(row.del, id + 'DelSend', t('panel.label-of', { label: 'DEL', inst: nome }), true);
    legenda(raiz, row.delLegend, 'DEL', 'laranja');
  });

  // ACCENT
  legenda(raiz, L.accentLabel, 'ACCENT', 'p-acc-leg');
  // preenchimento na cor do grupo do passo, como o drawLinearSlider do plugin (stepGroup)
  const COR_GRUPO = ['var(--red)', 'var(--orange)', 'var(--yellow)', 'var(--cream)'];
  const accents = L.accents.map((b, c) => {
    const n = peca(raiz, 'button', 'acc', b);
    n.style.setProperty('--acc', COR_GRUPO[Math.floor(c / 4)]);
    return criarAccent(n, c, (i, v) => ao.accent(i, v));
  });

  // MIDI GEN
  moldura(raiz, L.midiGen.panel, 'MIDI Gen');
  [t('panel.tom'), t('panel.escala'), t('panel.compassos')].forEach((leg, k) => legenda(raiz, L.midiGen.legends[k], leg));
  seletor(L.midiGen.selectors[0], 'genRoot', t('panel.tom-rotulo'));
  seletor(L.midiGen.selectors[1], 'genScale', t('panel.escala-rotulo'));
  seletor(L.midiGen.selectors[2], 'genBars', t('panel.compassos-rotulo'));
  const genKeys = [];
  const rolos = [];
  [['bass', 'Bass'], ['lead', 'Lead']].forEach(([k, nome], kind) => {
    const tk = peca(raiz, 'button', 'key orange', L.midiGen[k + 'Key'], nome);
    tk.addEventListener('click', () => { ao.pal('decision'); ao.gerar(kind); });
    genKeys[kind] = tk;
    const tela = peca(raiz, 'div', 'p-roll', L.midiGen[k + 'Roll']);
    const cv = document.createElement('canvas');
    cv.setAttribute('aria-label', t('panel.rolo-aria', { kind: nome.toUpperCase() }));
    tela.appendChild(cv);
    rolos[kind] = cv;
  });

  // MASTER FX
  const M = L.master;
  moldura(raiz, M.panel, 'Master FX');
  M.lines.forEach((b) => peca(raiz, 'i', 'p-linha', b));
  legenda(raiz, M.sat.title, 'SATURATION', 'esq');
  tecla(M.sat.on, 'ms', 'ON', 'satOn', 'on-sync', t('panel.ligar-saturation'));
  seletor(M.sat.type, 'satType', t('panel.wave-shape-sat'));
  legenda(raiz, M.sat.typeLegend, 'WAVE SHAPE');
  [['satDriveDb', 'DRIVE'], ['satOutDb', 'OUTPUT'], ['satDryWet', 'DRY/WET']].forEach(([id, leg], k) => {
    knob(M.sat.knobs[k], id, t('panel.knob-sat', { leg }), true);
    legenda(raiz, M.sat.legends[k], leg);
  });
  const editSat = peca(raiz, 'button', 'ms p-edit-tecla', M.sat.edit, 'EDIT');
  editSat.setAttribute('aria-label', t('panel.abrir-edit-sat'));
  editSat.addEventListener('click', () => { ao.pal('click'); ao.edit(0); });
  legenda(raiz, M.mb.title, 'MULTIBAND', 'esq');
  tecla(M.mb.on, 'ms', 'ON', 'mbOn', 'on-sync', t('panel.ligar-multiband'));
  [['mbAmount', 'AMOUNT'], ['mbTime', 'TIME'], ['mbOutDb', 'OUTPUT'], ['mbLowOutDb', 'LOW'], ['mbMidOutDb', 'MID'], ['mbHighOutDb', 'HIGH']].forEach(([id, leg], k) => {
    knob(M.mb.knobs[k], id, t('panel.knob-mb', { leg }), true);
    legenda(raiz, M.mb.legends[k], leg);
  });
  const editMb = peca(raiz, 'button', 'ms p-edit-tecla', M.mb.edit, 'EDIT');
  editMb.setAttribute('aria-label', t('panel.abrir-edit-mb'));
  editMb.addEventListener('click', () => { ao.pal('click'); ao.edit(1); });
  legenda(raiz, M.echo.title, 'ECHO', 'esq');
  tecla(M.echo.sync, 'ms', 'SYNC', 'echoSync', 'on-sync', t('panel.sync-echo'));
  const tempo = knob(M.echo.knobs[0], 'echoTime', t('panel.knob-echo', { leg: 'TIME' }), true);
  const divisao = knob(M.echo.knobs[0], 'echoDiv', t('panel.echo-time-divisao'), true);
  divisao.el.hidden = true;
  const legTempo = legenda(raiz, M.echo.legends[0], 'TIME');
  [['echoFeedback', 'FEEDBACK'], ['echoInput', 'INPUT'], ['echoFilter', 'FILTER'], ['echoMod', 'MOD'], ['echoMix', 'DRY/WET']].forEach(([id, leg], j) => {
    knob(M.echo.knobs[j + 1], id, t('panel.knob-echo', { leg }), true);
  });
  legenda(raiz, M.echo.legends[1], 'FEEDBACK');
  legenda(raiz, M.echo.legends[2], 'INPUT');
  legenda(raiz, M.echo.legends[3], 'FILTER');
  const legMod = legenda(raiz, M.echo.legends[4], 'MOD 0%');
  legenda(raiz, M.echo.legends[5], 'DRY/WET');

  // rodapé do aparelho (LED PARADO/TOCANDO e a última linha gerada)
  const status = peca(raiz, 'div', 'p-status', L.status);
  status.innerHTML = '<b aria-hidden="true"></b><span class="rot"></span><span class="gen"></span>';
  status.querySelector('.rot').textContent = t('panel.parado');

  // GAIN
  moldura(raiz, L.gain.panel, 'Gain', true);
  knob(L.gain.knob, 'masterGain', 'GAIN master', true);
  legenda(raiz, L.gain.legend, 'MASTER');
  const medidores = [L.gain.meterL, L.gain.meterR].map((b) => peca(peca(raiz, 'div', 'p-meter', b), 'i', ''));
  L.gain.marks.forEach((m) => { legenda(raiz, m.text, m.label, 'esq'); peca(raiz, 'i', 'p-tick', m.tick); });

  // tela de pixels com o Pal
  const tela = peca(raiz, 'div', 'p-pixels', L.pixelScreen);
  tela.setAttribute('role', 'img');
  tela.setAttribute('aria-label', t('panel.pal-aria'));
  const pixels = [];
  for (let k = 0; k < palJson.cols * palJson.rows; k++) pixels.push(peca(tela, 'i', ''));
  pintarPal(pixels, palJson.sheet[0].join(''));

  // GROOVE e FILL
  moldura(raiz, L.groove.panel, 'Groove');
  seletor(L.groove.type, 'grooveType', t('panel.groove-tipo'));
  knob(L.groove.knob, 'groove', t('panel.knob-groove', { leg: 'AMOUNT' }), true);
  legenda(raiz, L.groove.legend, 'AMOUNT');
  moldura(raiz, L.fill.panel, 'Fill');
  seletor(L.fill.target, 'fillTarget', t('panel.fill-instrumento'));
  knob(L.fill.rate, 'fillRate', t('panel.fill-rate-rotulo'), true);
  const legRate = legenda(raiz, L.fill.rateLegend, 'RATE OFF');
  knob(L.fill.vol, 'fillVol', t('panel.fill-vol-rotulo'), true);
  legenda(raiz, L.fill.volLegend, 'VOLUME');

  rolos.forEach((cv, kind) => desenharRolo(cv, null, kind));

  const retido = [0, 0];
  return {
    controles, steps, pads, accents, toneXLeds, genKeys, rolos, pixels,
    editTeclas: [editSat, editMb],
    legendas: { rate: legRate, tempo: legTempo, mod: legMod },
    pintarGrade(grid) {
      steps.forEach((linha, r) => linha.forEach((st, c) => {
        st.classList.toggle('on', !!grid[r][c]);
        st.setAttribute('aria-pressed', String(!!grid[r][c]));
      }));
    },
    armarToneX(on) { toneXLeds.forEach((l) => l.classList.toggle('armada', !!on)); },
    trocarTempoEcho(sync) { tempo.el.hidden = !!sync; divisao.el.hidden = !sync; },
    playhead(passo, tocando) {
      steps.forEach((linha) => linha.forEach((st, c) => st.classList.toggle('ph', tocando && c === passo)));
    },
    medir(l, r) {
      [l, r].forEach((v, i) => {
        const x = v || 0;
        retido[i] = x > retido[i] ? x : retido[i] * 0.82;
        const db = 20 * Math.log10(Math.max(retido[i], 1e-6));
        medidores[i].style.height = (fracaoDb(db) * 100).toFixed(1) + '%';
      });
    },
    picoAtual: () => Math.max(retido[0], retido[1]),
    tocando(on) {
      status.classList.toggle('tocando', on);
      status.querySelector('.rot').textContent = t(on ? 'panel.tocando' : 'panel.parado');
    },
    statusGen(texto) { status.querySelector('.gen').textContent = texto; },
  };
}
