// Conta o painel da demo contra a referência do plugin. node testes/painel.mjs [url] [largura]
import { abrir } from './cdp.mjs';

const urlBase = process.argv[2] || 'http://localhost:8123/index.html';
// ?teste=1: só assim window.__dd existe (gate de debug em produção)
const url = urlBase + (urlBase.includes('?') ? '&' : '?') + 'teste=1';
const largura = +(process.argv[3] || 1680);
const movel = largura <= 400;
const s = await abrir(url, { largura, altura: movel ? 844 : 1400, movel });
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'ok: ' : 'FAIL: ') + m); if (!c) falhas++; };
try {
  await s.esperar(2000);
  const r = await s.avaliar(`(() => {
    const a = document.getElementById('aparelho');
    if (!a) return null;
    const q = (sel) => a.querySelectorAll(sel).length;
    const t = (sel) => [...a.querySelectorAll(sel)].map((n) => n.textContent.trim().toUpperCase());
    // no celular a barrinha é sticky no pé da janela: medir com a demo inteira à vista,
    // senão ela aparece "sobre" o painel só porque o painel passa da altura da tela
    document.getElementById('demo').scrollIntoView({ block: 'end', behavior: 'instant' });
    const caixa = document.getElementById('aparelho-caixa').getBoundingClientRect();
    const trans = document.getElementById('transporte').getBoundingClientRect();
    const visivel = (id) => {
      const el = document.getElementById(id);
      if (!el) return false;
      if (getComputedStyle(el).display === 'none' || getComputedStyle(el).visibility === 'hidden') return false;
      const b = el.getBoundingClientRect();
      return b.width > 0 && b.height > 0;
    };
    return {
      steps: q(':scope > .step'), ms: q(':scope > .ms'),
      knobs: q(':scope > .knob'), knobsVisiveis: q(':scope > .knob:not([hidden])'),
      temEchoDiv: !!(window.__dd && window.__dd.painel.controles.get('echoDiv')),
      leds: q(':scope > .p-ledx'),
      pads: t(':scope > .lab'), acc: q(':scope > .acc'), pixels: q('.p-pixels i'), acesos: q('.p-pixels i.on'),
      selects: q(':scope > select'), teclas: t(':scope > button.key'),
      desabilitadas: [...a.querySelectorAll(':scope > button.key[disabled]')].map((n) => n.textContent.trim().toUpperCase()),
      textos: [...a.querySelectorAll(':scope > *')].map((n) => n.textContent).join(' ').toUpperCase(),
      transporteAbaixo: trans.top >= caixa.bottom - 1 && !document.getElementById('aparelho-caixa').contains(document.getElementById('transporte')), escala: +a.dataset.escala,
      larguraPagina: document.documentElement.scrollWidth, janela: innerWidth,
      rate: [...a.querySelectorAll('.p-leg')].some((n) => n.textContent === 'RATE OFF'),
      transAltura: trans.height, tallyVisivel: visivel('tally'), genStatusVisivel: visivel('gen-status'),
    };
  })()`);
  ok(r !== null, 'existe #aparelho');
  if (r) {
    ok(r.steps === 96, `96 steps (${r.steps})`);
    ok(r.pads.join(',') === 'KICK,SNARE,CLAP,CHAT,OHAT,TOM', `teclas dos 6 instrumentos (${r.pads})`);
    ok(r.leds === 6, `6 LEDs de TONE X (${r.leds})`);
    ok(r.acc === 16, `16 faders de ACCENT (${r.acc})`);
    ok(r.knobsVisiveis === 61, `61 knobs visíveis: 42 dos canais, 3 SAT, 6 MB, 6 ECHO à vista (TIME ou divisão, nunca os dois), GAIN, GROOVE, RATE, VOLUME (${r.knobsVisiveis})`);
    ok(r.temEchoDiv, `o knob oculto echoDiv (TIME do ECHO em divisão do BPM) existe no modelo, mesmo escondido (${r.knobs} no total)`);
    ok(r.ms === 17, `17 teclas pequenas: 12 MUTE/SOLO, 2 ON, 2 EDIT, SYNC (${r.ms})`);
    ok(r.selects === 6, `6 seletores: TOM, ESCALA, COMPASSOS, WAVE SHAPE, GROOVE, FILL (${r.selects})`);
    ok(r.teclas.join(',') === 'SAMPLER,TONE X,RAND,EXPORT,BASS,LEAD', `teclas grandes (${r.teclas})`);
    ok(r.desabilitadas.join(',') === 'SAMPLER,EXPORT', 'SAMPLER e EXPORT desabilitados');
    ok(r.textos.includes('SÓ NO PLUGIN'), 'aviso "só no plugin" no painel');
    ok(r.pixels === 260 && r.acesos > 20, `tela do Pal 26x10 com o quadro contente (${r.acesos} pontos acesos)`);
    ok(r.rate, 'legenda RATE OFF');
    for (const proibido of ['BPM', 'PLAY', '×20', 'X20', 'FASE', 'CONTRA'])
      ok(!r.textos.includes(proibido), `painel sem ${proibido}`);
    ok(r.transporteAbaixo, 'barrinha de transporte abaixo da moldura');
    ok(r.larguraPagina <= r.janela, `página sem rolagem horizontal (${r.larguraPagina} <= ${r.janela})`);
    if (movel) ok(r.escala >= 0.6, `no celular o painel fica em escala >= 0,6 (${r.escala})`);
    else ok(r.escala > 0.9 && r.escala <= 1, `no desktop o painel quase em 100% (${r.escala})`);
    if (movel) {
      ok(r.transAltura <= 52, `barrinha em 1 linha, altura <= 52px (${r.transAltura.toFixed(1)})`);
      ok(!r.tallyVisivel, '#tally não aparece na barrinha');
      ok(!r.genStatusVisivel, '#gen-status não aparece na barrinha');
    }
  }
  if (r && movel) {
    // área de toque do LED do TONE X (fix 2): sonda em elementFromPoint ao redor do centro,
    // já que ::before não tem getBoundingClientRect próprio
    const hit = await s.avaliar(`(() => {
      document.querySelector('.p-ledx').scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
      const el = document.querySelector('.p-ledx');
      const b = el.getBoundingClientRect();
      const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
      const dirs = { esq: [-1, 0], dir: [1, 0], cima: [0, -1], baixo: [0, 1] };
      const alcance = {};
      for (const [k, [dx, dy]] of Object.entries(dirs)) {
        let dist = 0;
        for (let d = 0; d <= 24; d += 0.5) {
          const alvo = document.elementFromPoint(cx + dx * d, cy + dy * d);
          if (alvo === el || el.contains(alvo)) dist = d; else break;
        }
        alcance[k] = dist;
      }
      return { largura: alcance.esq + alcance.dir, altura: alcance.cima + alcance.baixo, alcance };
    })()`);
    ok(hit.largura >= 24 && hit.altura >= 24,
      `área de toque do LED do TONE X >= 24px na tela, escala 0,6 (${hit.largura.toFixed(1)}x${hit.altura.toFixed(1)})`);
  }
} finally {
  s.fechar();
}
console.log(falhas === 0 ? 'PAINEL: todos os testes passaram' : `${falhas} falhas`);
process.exit(falhas === 0 ? 0 : 1);
