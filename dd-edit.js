// Painel EDIT do MASTER FX: abre por cima do MIDI GEN, como o MasterFxEditPanel do plugin.
// Fecha pela tecla EDIT, por FECHAR, por Escape ou por toque/clique fora da faixa MASTER FX; o toque fora SÓ fecha
// (quatro apanhadores em volta da faixa engolem o gesto). Posições: layout.edit.
import { peca, legenda, criarKnob, criarTecla, criarSeletor } from './dd-painel.js?v=20260925i';
import { textoValor } from './dd-norm.js?v=20260917c';
import { t } from './dd-i18n.js';

const PAG_SAT = 0;
const PAG_MB = 1;
const BANDAS = [['High', 'HIGH'], ['Mid', 'MID'], ['Low', 'LOW']];   // linha 0 em cima = banda alta
const MB_SUF = ['InDb', 'BelowThr', 'BelowRatio', 'AboveThr', 'AboveRatio', 'Attack', 'Release', 'OutDb'];
const MB_NOMES = ['INPUT', 'BELOW THR', 'BELOW RATIO', 'ABOVE THR', 'ABOVE RATIO', 'ATTACK', 'RELEASE', 'OUTPUT'];

// Mesmo desenho do CurveDisplay::paint: entrada -1..1, saída -1,25..1,25
export function desenharCurva(canvas, pontos, tipo, driveDb) {
  const dpr = window.devicePixelRatio || 1;
  const W = Math.max(1, Math.round(canvas.clientWidth));
  const H = Math.max(1, Math.round(canvas.clientHeight));
  if (canvas.width !== W * dpr || canvas.height !== H * dpr) { canvas.width = W * dpr; canvas.height = H * dpr; }
  const g = canvas.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, W, H);
  const x0 = 16;
  const y0 = 14;
  const pw = W - 32;
  const ph = H - 28;
  const yR = 1.25;
  const px = (x) => x0 + (x + 1) * 0.5 * pw;
  const py = (y) => y0 + ph / 2 - (y / yR) * ph * 0.5;
  g.fillStyle = 'rgba(233,230,222,.10)';
  g.fillRect(x0, py(0), pw, 1);
  g.fillRect(px(0), y0, 1, ph);
  g.fillStyle = 'rgba(233,230,222,.05)';
  g.fillRect(x0, py(1), pw, 1);
  g.fillRect(x0, py(-1), pw, 1);
  g.strokeStyle = 'rgba(233,230,222,.12)';
  g.lineWidth = 1;
  g.setLineDash([4, 4]);
  g.beginPath();
  g.moveTo(px(-1), py(-1));
  g.lineTo(px(1), py(1));
  g.stroke();
  g.setLineDash([]);
  if (pontos && pontos.length > 1) {
    g.save();
    g.beginPath();
    g.rect(2, 2, W - 4, H - 4);
    g.clip();
    g.beginPath();
    pontos.forEach((y, i) => {
      const x = -1 + (2 * i) / (pontos.length - 1);
      const yc = Math.max(-yR * 1.2, Math.min(yR * 1.2, y));
      if (i === 0) g.moveTo(px(x), py(yc)); else g.lineTo(px(x), py(yc));
    });
    g.lineJoin = 'round';
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(224,112,42,.25)';
    g.lineWidth = 4;
    g.stroke();
    g.strokeStyle = '#e0702a';
    g.lineWidth = 1.8;
    g.stroke();
    g.restore();
  }
  g.font = '600 9.5px Barlow, "Arial Narrow", sans-serif';
  g.fillStyle = '#a39e93';
  g.textBaseline = 'top';
  g.textAlign = 'left';
  g.fillText(`${tipo}   DRIVE ${textoValor('satDriveDb', driveDb)}`, 10, 6);
  g.textAlign = 'right';
  g.fillText('OUT', W - 10, 6);
  g.textBaseline = 'bottom';
  g.fillText('IN', W - 10, H - 6);
}

export function montarEdit(aparelho, L, params, controles, ao) {
  const E = L.edit;
  const P = (id) => params.get(id);
  const v = (id) => controles.get(id).get();
  let pagina = -1;
  let pontos = null;
  const WAVESHAPER = P('satType').choices.indexOf('Waveshaper');

  const camada = peca(aparelho, 'div', 'p-edit-camada', [0, 0, 1600, 1126]);
  camada.hidden = true;

  // Apanhadores: tudo menos a faixa MASTER FX. Fecham no pointerup do MESMO ponteiro que desceu neles
  // (mouse, toque ou caneta). O click do toque some com o preventDefault do pointerdown, por isso não dá
  // para fechar no click. Arrasto que começa num knob da faixa não desce aqui (o knob captura o ponteiro).
  // O click de compatibilidade do mouse, que viria logo depois, é engolido para não acionar nada embaixo.
  const [mx, my, mw, mh] = L.master.panel;
  let apertado = null;
  const engolirClick = (e) => { e.stopPropagation(); e.preventDefault(); };
  for (const b of [[0, 0, 1600, my], [0, my + mh, 1600, 1126 - my - mh], [0, my, mx, mh], [mx + mw, my, 1600 - mx - mw, mh]]) {
    const ap = peca(camada, 'div', 'p-apanhador', b);
    ap.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (!e.isPrimary) return;
      apertado = e.pointerId;
      try { ap.setPointerCapture(e.pointerId); } catch { /* ponteiro já solto */ }
    });
    ap.addEventListener('pointerup', (e) => {
      if (e.pointerId !== apertado) return;
      apertado = null;
      e.preventDefault();
      window.addEventListener('click', engolirClick, { capture: true, once: true });
      setTimeout(() => window.removeEventListener('click', engolirClick, { capture: true }), 0);
      fechar();
    });
    ap.addEventListener('pointercancel', (e) => { if (e.pointerId === apertado) apertado = null; });
    ap.addEventListener('click', engolirClick);
  }

  // Controles do MIDI GEN que a placa cobre: inert enquanto o EDIT está aberto (o Tab não chega neles)
  const [gx, gy, gw, gh] = L.midiGen.panel;
  const cobertos = [...aparelho.children].filter((n) => {
    if (n === camada || !n.classList.contains('p-abs')) return false;
    const x = parseFloat(n.style.left);
    const y = parseFloat(n.style.top);
    return x >= gx && y >= gy && x + parseFloat(n.style.width) <= gx + gw && y + parseFloat(n.style.height) <= gy + gh;
  });

  const placa = peca(camada, 'div', 'p-edit-placa', E.panel);
  // posição da placa na altura do aparelho, para o gradiente do aço continuar de onde está (dd.css)
  placa.style.setProperty('--edit-y', gy + 'px');
  const titulo = peca(placa, 'span', 'p-titulo', null, 'SATURATION');
  const paginas = [peca(camada, 'div', 'p-edit-pagina', [0, 0, 1600, 1126]), peca(camada, 'div', 'p-edit-pagina', [0, 0, 1600, 1126])];

  const knob = (pai, id, nome, caixa, caixaLeg) => {
    const leg = legenda(pai, caixaLeg, nome);
    const kn = peca(pai, 'span', '', caixa);
    const w = criarKnob(kn, P(id), {
      rotulo: nome, laranja: true,
      aoMudar: (x) => { leg.textContent = textoValor(id, x); ao.mudou(id, x); },
      aoTocar: () => ao.pal('decision'),
    });
    kn.addEventListener('pointerenter', () => { leg.textContent = textoValor(id, w.get()); });
    kn.addEventListener('pointerleave', () => { if (!kn.classList.contains('arrastando')) leg.textContent = nome; });
    kn.addEventListener('pointerup', () => { if (!kn.matches(':hover')) leg.textContent = nome; });
    controles.set(id, w);
    return { w, leg, kn };
  };
  const tecla = (pai, id, texto, caixa, rotulo) => {
    const w = criarTecla(peca(pai, 'button', 'ms', caixa, texto), P(id), {
      classeOn: 'on-sync', rotulo, aoMudar: (x) => { ao.pal('decision'); ao.mudou(id, x); },
    });
    controles.set(id, w);
    return w;
  };

  // ---- SATURATION
  const S = E.sat;
  const ps = paginas[PAG_SAT];
  const visor = peca(ps, 'div', 'p-visor', S.display);
  const curva = document.createElement('canvas');
  curva.setAttribute('aria-label', t('panel.curva-sat-aria'));
  visor.appendChild(curva);
  peca(ps, 'i', 'p-linha', S.displayLine);
  legenda(ps, S.colorTitle, 'COLOR', 'esq');
  tecla(ps, 'satColorOn', 'ON', S.colorOn, t('panel.ligar-color'));
  const cor = [['satAmtLo', 'AMT LO'], ['satAmtHi', 'AMT HI'], ['satColorFreq', 'FREQ'], ['satColorWidth', 'WIDTH']]
    .map(([id, nome], k) => knob(ps, id, nome, S.colorKnobs[k], S.colorLegends[k]));
  peca(ps, 'i', 'p-linha', S.rowALine);
  legenda(ps, S.clipTitle, 'CLIP', 'esq');
  controles.set('satClip', criarSeletor(peca(ps, 'select', 'recess', S.clip), P('satClip'), {
    rotulo: t('panel.clip-sat'), aoMudar: (x) => { ao.pal('decision'); ao.mudou('satClip', x); },
  }));
  peca(ps, 'i', 'p-linha', S.rowsLine);
  const tituloWs = legenda(ps, S.wsTitle, 'WAVESHAPER', 'esq');
  const ws = [['satWsDrive', 'DRIVE'], ['satWsLin', 'LINEAR'], ['satWsCurve', 'CURVE'], ['satWsDamp', 'DAMP'], ['satWsDepth', 'DEPTH'], ['satWsPeriod', 'PERIOD']]
    .map(([id, nome], k) => knob(ps, id, nome, S.wsKnobs[k], S.wsLegends[k]));

  // ---- MULTIBAND
  const B = E.mb;
  const pm = paginas[PAG_MB];
  tecla(pm, 'mbSoftKnee', 'SOFT KNEE', B.softKnee, t('panel.soft-knee-mb'));
  tecla(pm, 'mbRms', 'RMS', B.rms, t('panel.rms-mb'));
  const preset = peca(pm, 'select', 'recess p-preset', B.preset);
  preset.setAttribute('aria-label', t('panel.preset-mb-aria'));
  const pintarPreset = () => {
    preset.innerHTML = `<option value="" selected>${t('panel.preset-label')}</option><option value="0">${t('panel.preset-padrao')}</option><option value="1">OTT</option>`;
  };
  pintarPreset();
  document.addEventListener('dd-lang-changed', pintarPreset);
  preset.addEventListener('change', () => {
    if (preset.value === '') return;
    ao.pal('decision');
    ao.preset(+preset.value);
    preset.value = '';
  });
  knob(pm, 'mbXoHigh', 'HI/MID', B.splitKnobs[0], B.splitLegends[0]);
  knob(pm, 'mbXoLow', 'MID/LO', B.splitKnobs[1], B.splitLegends[1]);
  peca(pm, 'i', 'p-linha', B.headLine);
  peca(pm, 'i', 'p-linha', B.grLine);
  const grs = BANDAS.map(([banda, nome], r) => {
    legenda(pm, B.bandNames[r], nome, 'clara esq');
    tecla(pm, `mb${banda}On`, 'ON', B.bandOn[r], t('panel.banda-nome-ligada', { banda: nome }));
    tecla(pm, `mb${banda}Solo`, 'S', B.bandSolo[r], t('panel.solo-da-banda', { banda: nome }));
    MB_SUF.forEach((suf, k) => knob(pm, `mb${banda}${suf}`, MB_NOMES[k], B.knobs[r][k], B.legends[r][k]));
    const gr = peca(pm, 'div', 'p-gr', B.gr[r]);
    gr.setAttribute('role', 'meter');
    gr.setAttribute('aria-label', t('panel.gr-aria', { banda: nome }));
    gr.innerHTML = '<span class="trilho"><i class="barra"></i><i class="zero"></i></span><b>0.0 dB</b>';
    legenda(pm, B.grLegends[r], 'GR');
    return gr;
  });
  // Cache dos 6 elementos que o GR redesenha (3 bandas x barra + número): setGr chega a ~45x por
  // segundo tocando, sem repetir querySelector. Threshold de 0.05 dB, igual GainMeter::setGainDb do
  // plugin. As escritas no DOM ficam num único requestAnimationFrame por leva de mensagens.
  const grEls = grs.map((gr) => ({ el: gr, barra: gr.querySelector('.barra'), num: gr.querySelector('b') }));
  const grUltimo = [NaN, NaN, NaN];
  let grPendente = null;
  let grRaf = null;
  function pintarGr(db) {
    grEls.forEach(({ el, barra, num }, r) => {
      const x = db[2 - r] || 0;
      if (Math.abs(x - grUltimo[r]) < 0.05) return;
      grUltimo[r] = x;
      const f = Math.max(-1, Math.min(1, x / 24));
      barra.style.left = (f < 0 ? 50 + f * 50 : 50) + '%';
      barra.style.width = Math.abs(f) * 50 + '%';
      barra.classList.toggle('sobe', f > 0);
      num.textContent = textoValor('gainDb', Math.abs(x) < 0.05 ? 0 : x);
      el.setAttribute('aria-valuenow', x.toFixed(1));
    });
  }

  const botaoFechar = peca(camada, 'button', 'key p-fechar', E.close, t('panel.fechar'));
  botaoFechar.setAttribute('data-i18n', 'panel.fechar');
  botaoFechar.addEventListener('click', () => fechar());

  function desenharVisor() {
    if (pagina !== PAG_SAT) return;
    const tipo = P('satType').choices[Math.round(v('satType'))].toUpperCase();
    desenharCurva(curva, pontos, tipo, v('satDriveDb'));
  }
  function atualizar() {
    const wsAtivo = Math.round(v('satType')) === WAVESHAPER;
    const corAtiva = v('satColorOn') > 0.5;
    ws.forEach(({ kn, leg }) => {
      kn.classList.toggle('apagado', !wsAtivo);
      leg.classList.toggle('apagado', !wsAtivo);
      kn.tabIndex = wsAtivo ? 0 : -1;
    });
    tituloWs.classList.toggle('apagado', !wsAtivo);
    cor.forEach(({ kn, leg }) => { kn.classList.toggle('meio', !corAtiva); leg.classList.toggle('meio', !corAtiva); });
    desenharVisor();
  }
  function abrir(p) {
    pagina = p;
    camada.hidden = false;
    paginas.forEach((n, i) => { n.hidden = i !== p; });
    cobertos.forEach((n) => { n.inert = true; });
    titulo.textContent = p === PAG_SAT ? 'SATURATION' : 'MULTIBAND';
    atualizar();
    ao.editMudou(p);
  }
  function fechar() {
    if (pagina < 0) return;
    pagina = -1;
    apertado = null;
    camada.hidden = true;
    cobertos.forEach((n) => { n.inert = false; });
    ao.editMudou(-1);
  }
  // Escape fecha e devolve o foco à tecla EDIT da página que estava aberta
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || pagina < 0) return;
    const tecla = ao.teclaEdit ? ao.teclaEdit(pagina) : null;
    e.preventDefault();
    fechar();
    if (tecla) tecla.focus();
  });
  return {
    abrir, fechar, atualizar,
    alternar: (p) => (pagina === p ? fechar() : abrir(p)),
    pagina: () => pagina,
    setCurva(pts) { pontos = pts; desenharVisor(); },
    pontosCurva: () => pontos,
    setGr(db) {
      grPendente = db;
      if (grRaf) return;
      grRaf = requestAnimationFrame(() => {
        grRaf = null;
        const vals = grPendente;
        grPendente = null;
        pintarGr(vals);
      });
    },
  };
}
