// Conta o painel da demo contra a referência do plugin (Task 15B: painel/layout.json+params.json
// do dump de 24/09, seis linhas, KICK com 7 knobs e as outras com 6, CLEAR/RAND/ECHO por linha,
// STEPS/BAR no cabeçalho, MASTER sem moldura). node testes/painel.mjs [url] [largura]
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
      temEchoBeat: !!(window.__dd && window.__dd.painel.controles.get('echoBeat')),
      leds: q(':scope > .p-ledx'),
      pads: t(':scope > .lab'), acc: q(':scope > .acc'), pixels: q('.p-pixels i'), acesos: q('.p-pixels i.on'),
      selects: q(':scope > select'), teclas: t(':scope > button.key:not(.mini)'),
      minis: q(':scope > button.key.mini'), echoKeys: q(':scope > .p-echokey'),
      randZone: q(':scope > .p-randzone'), randZoneTab: q(':scope > .p-randzone-tab'),
      medidores: q(':scope > .p-meter'), ticks: q(':scope > .p-tick'),
      // .key.mini[disabled] é o BAR 2 desligado enquanto STEPS=16 (não é "só no plugin")
      desabilitadas: [...a.querySelectorAll(':scope > button.key:not(.mini)[disabled]')].map((n) => n.textContent.trim().toUpperCase()),
      textos: [...a.querySelectorAll(':scope > *')].map((n) => n.textContent).join(' ').toUpperCase(),
      transporteAbaixo: trans.top >= caixa.bottom - 1 && !caixaEl.contains(document.getElementById('transporte')), escala: +a.dataset.escala,
      larguraPagina: document.documentElement.scrollWidth, janela: innerWidth, caixaRight: caixa.right,
      rate: [...a.querySelectorAll('.p-leg')].some((n) => n.textContent === 'RATE 0'),
      steps16: document.querySelector('.p-num').textContent, stepsLegend: t('.p-leg').includes('STEPS'),
      barLegend: t('.p-leg').includes('BAR'), nota: document.querySelector('.p-nota-kick').textContent,
      transAltura: trans.height, tallyVisivel: visivel('tally'), genStatusVisivel: visivel('gen-status'),
    };
  })()`);
  ok(r !== null, 'existe #aparelho');
  if (r) {
    ok(r.steps === 96, `96 steps (${r.steps})`);
    ok(r.pads.join(',') === 'KICK,SNARE,CLAP,CHAT,OHAT,TOM', `teclas dos 6 instrumentos (${r.pads})`);
    ok(r.leds === 6, `6 LEDs de TONE X (${r.leds})`);
    ok(r.acc === 16, `16 faders de ACCENT (${r.acc})`);
    ok(r.knobsVisiveis === 68, `68 knobs visíveis: 49 dos canais (KICK 7 + 5x6 + REV/DEL), 3 SAT, 6 MB, 6 ECHO à vista (TIME ou divisão, nunca os dois), MASTER, GROOVE, RATE, VOLUME (${r.knobsVisiveis})`);
    ok(r.temEchoBeat, `o knob oculto echoBeat (TIME do ECHO em divisão do BPM) existe no modelo, mesmo escondido (${r.knobs} no total)`);
    ok(r.ms === 19, `19 teclas pequenas: 12 MUTE/SOLO, 2 ON, 2 EDIT, SYNC, KEY do KICK, OFFBEAT da FILL (${r.ms})`);
    ok(r.selects === 6, `6 seletores: KEY, SCALE, BARS, WAVE SHAPE, GROOVE, FILL (${r.selects})`);
    ok(r.teclas.join(',') === 'SAMPLER,TONE X,RANDOM,EXPORT,BASS,LEAD', `teclas grandes (${r.teclas})`);
    ok(r.minis === 16, `16 teclas mini: CLEAR+RAND por linha (12), STEPS 16|32 (2), BAR 1|2 (2) (${r.minis})`);
    ok(r.echoKeys === 6, `6 teclas ECHO altas, uma por linha (${r.echoKeys})`);
    ok(r.randZone === 1 && r.randZoneTab === 1, 'faixa em degrau (randZone) e a aba da tecla RANDOM (randZoneTab) existem');
    ok(r.medidores === 2 && r.ticks === 8, `2 medidores do MASTER com 8 marcas de dB (${r.medidores}/${r.ticks})`);
    ok(r.desabilitadas.join(',') === 'SAMPLER,EXPORT', 'SAMPLER e EXPORT desabilitados');
    ok(r.textos.includes('SÓ NO PLUGIN'), 'aviso "só no plugin" no painel');
    ok(r.textos.includes('RANDOM'), 'texto RANDOM na tecla do topo');
    ok(r.pixels === 260 && r.acesos > 20, `tela do Pal 26x10 com o quadro contente (${r.acesos} pontos acesos)`);
    ok(r.rate, 'legenda RATE 0 (fillBeat, default "0")');
    ok(r.stepsLegend, 'legenda STEPS no cabeçalho da grade');
    ok(r.barLegend, 'legenda BAR no cabeçalho da grade');
    ok(r.steps16 === '1', `números do passo começam em 1 (página 1 do BAR) (${r.steps16})`);
    ok(r.nota === 'F#', `visor da nota do KICK: KEY desligada mostra a nota do TUNE (def 0,5 -> F#) (${r.nota})`);
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
      // ~0,945 no desktop (1680px de rolo / 1600px do aparelho, descontada a moldura .unit) — a
      // mesma faixa de antes da Task 15B, sem regressão
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
  if (r && !movel) {
    // STEPS 32 + BAR 2: os números do cabeçalho viram 17..32 (só o rótulo — o motor ainda é de
    // 16 passos, isso é puramente visual até o motor novo, como o resto dos IDs sem legado)
    const pagina2 = await s.avaliar(`(() => {
      const a = document.getElementById('aparelho');
      const led = [...a.querySelectorAll('.p-led-key')].find((b) => b.textContent.trim() === '32');
      led.click();
      const bar2 = [...a.querySelectorAll('.p-bar-key')].find((b) => b.textContent.trim() === '2');
      bar2.click();
      return document.querySelector('.p-num').textContent;
    })()`);
    ok(pagina2 === '17', `STEPS 32 + BAR 2: o primeiro número do cabeçalho vira 17 (${pagina2})`);
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
