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
    const caixaEl = document.getElementById('aparelho-caixa');
    const caixa = caixaEl.getBoundingClientRect();
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
      transporteAbaixo: trans.top >= caixa.bottom - 1 && !caixaEl.contains(document.getElementById('transporte')), escala: +a.dataset.escala,
      larguraPagina: document.documentElement.scrollWidth, janela: innerWidth, caixaRight: caixa.right,
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
    if (movel) {
      // D13 (2026-09-24): abaixo de 900px de rolo a demo escala para caber, piso 0,2 (era 0,6
      // fixo); no rolo >= 900px (tablet/desktop estreito) o piso antigo de 0,6 continua valendo.
      const piso = largura < 900 ? 0.2 : 0.6;
      ok(r.escala >= piso - 1e-6 && r.escala <= 1, `no celular (${largura}px) escala dentro do piso ${piso} (${r.escala})`);
    } else {
      ok(r.escala > 0.9 && r.escala <= 1, `no desktop o painel quase em 100% (${r.escala})`);
    }
    if (movel) {
      ok(r.transAltura <= 52, `barrinha em 1 linha, altura <= 52px (${r.transAltura.toFixed(1)})`);
      ok(!r.tallyVisivel, '#tally não aparece na barrinha');
      ok(!r.genStatusVisivel, '#gen-status não aparece na barrinha');
    }
    if (largura === 390) {
      ok(r.larguraPagina === 390, `em 390px a página não rola na horizontal (scrollWidth=${r.larguraPagina})`);
      ok(r.caixaRight <= 390, `.aparelho-caixa cabe em 390px sem cortar (right=${r.caixaRight})`);
    }
    if (largura === 320) {
      ok(r.larguraPagina === 320, `em 320px a página não rola na horizontal (scrollWidth=${r.larguraPagina})`);
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
    // D13 (2026-09-24): abaixo de 900px de rolo a demo escala para caber (piso 0,2, sem piso de
    // 44px de toque) — a demo virou vitrine, não fica mais garantido que o LED do TONE X tenha
    // 24px de alvo de toque. A garantia de 24/44px continua valendo só onde o piso antigo (0,6)
    // ainda se aplica (rolo >= 900px). Abaixo disso o teste só registra o número, não falha.
    if (r.escala >= 0.6) {
      ok(hit.largura >= 24 && hit.altura >= 24,
        `área de toque do LED do TONE X >= 24px na tela, escala 0,6 (${hit.largura.toFixed(1)}x${hit.altura.toFixed(1)})`);
    } else {
      console.log(`info: área de toque do LED do TONE X na vitrine (escala ${r.escala}): ${hit.largura.toFixed(1)}x${hit.altura.toFixed(1)}px — aceito por D13, a demo não é alvo de toque preciso no celular`);
    }
    // D12: os controles NATIVOS (fora do `transform: scale()` da demo) não encolhem por causa
    // da escala da demo — o que os limita é a barrinha compacta (`.transporte`, <=900px,
    // pré-existente e fora do escopo desta correção), não a mudança do item 1. Conferido: PLAY e
    // a tela de BPM medem 40px aqui (regra "barrinha em 1 linha, altura <= 52px" já testada
    // acima), o mesmo valor de antes desta correção — não regrediu.
    const nativos = await s.avaliar(`(() => {
      const play = document.getElementById('play').getBoundingClientRect();
      const bpm = document.querySelector('.bpm-box .screen').getBoundingClientRect();
      return { playAltura: play.height, bpmAltura: bpm.height };
    })()`);
    ok(nativos.playAltura >= 40 && nativos.bpmAltura >= 40,
      `PLAY/BPM da barrinha não encolheram por causa da escala da demo (pré-existente, ${nativos.playAltura.toFixed(1)}/${nativos.bpmAltura.toFixed(1)})`);
  }
} finally {
  s.fechar();
}
console.log(falhas === 0 ? 'PAINEL: todos os testes passaram' : `${falhas} falhas`);
process.exit(falhas === 0 ? 0 : 1);
