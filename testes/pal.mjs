// O Pal na página: contente ao abrir, segue o mouse, sorri no clique, dança no PLAY, cochila parado,
// e com reduced-motion não dança.
import { abrir } from './cdp.mjs';

const urlBase = process.argv[2] || 'http://localhost:8123/index.html';
// ?teste=1: só assim window.__dd existe (gate de debug em produção)
const url = urlBase + (urlBase.includes('?') ? '&' : '?') + 'teste=1';
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'ok: ' : 'FAIL: ') + m); if (!c) falhas++; };

// Centro da tela de pixels (o rosto do Pal) em coordenadas reais de tela, e a escala do .aparelho
// (transform:scale, dd-painel.js:escalar) — pra converter o alcance de 400/240 px do painel (espaço
// de 1600) pra px de verdade na página.
const centroTela = async (sessao) => sessao.avaliar(`(() => {
  document.querySelector('.p-pixels').scrollIntoView({ block: 'center' });
  const ap = document.getElementById('aparelho').getBoundingClientRect();
  const [x, y, w, h] = __dd.layout.pixelScreen;
  const escala = ap.width / 1600;
  return { x: ap.left + (x + w / 2) * escala, y: ap.top + (y + h / 2) * escala, escala };
})()`);

const s = await abrir(url, { largura: 2000, altura: 1400 });
try {
  await s.esperar(3000);
  ok(await s.avaliar('!!(__dd.pal)'), 'Pal carregado');
  const [contente, olhaEsquerda] = await s.avaliar('fetch("painel/pal.json").then((r) => r.json()).then((p) => [p.sheet[0].join(""), p.sheet[1].join("")])');
  ok([0, 4].includes(await s.avaliar('__dd.pal.estado()')), 'abre contente');

  // (a) o sprite (células .on) nunca vaza da caixa .p-pixels — bug 24/09: célula fixa de 9px em
  // dd.css fazia a cabeça e os pés do Pal saírem por cima e por baixo da telinha.
  const contencao = await s.avaliar(`(() => {
    const caixa = document.querySelector('.p-pixels').getBoundingClientRect();
    const folga = 0.5; // arredondamento de subpixel
    let fora = 0;
    for (const n of document.querySelectorAll('.p-pixels i.on')) {
      const r = n.getBoundingClientRect();
      if (r.left < caixa.left - folga || r.right > caixa.right + folga ||
          r.top < caixa.top - folga || r.bottom > caixa.bottom + folga) fora++;
    }
    return { fora, total: document.querySelectorAll('.p-pixels i.on').length };
  })()`);
  ok(contencao.total > 0 && contencao.fora === 0,
    `sprite do Pal cabe inteiro dentro de .p-pixels (${contencao.total} células acesas, ${contencao.fora} fora)`);

  // (b) mouse no centro da tela de pixels: nx/ny ~0 e o Pal olha de frente (mesmo quadro do
  // "frente"/parado — pal.json sheet[0], igual ao roteiro "volta no stop": nx 0, ny 0)
  const centro = await centroTela(s);
  await s.cmd('Input.dispatchMouseEvent', { type: 'mouseMoved', x: centro.x, y: centro.y });
  await s.esperar(500);
  const { nx: nxCentro, ny: nyCentro } = await s.avaliar('__dd.pal.mouseNormalizado()');
  ok(Math.abs(nxCentro) <= 0.02 && Math.abs(nyCentro) <= 0.02,
    `mouse no centro do LCD: nx/ny ~0 (nx=${nxCentro.toFixed(3)}, ny=${nyCentro.toFixed(3)})`);
  let deFrente = false;
  for (let t = 0; t < 10 && !deFrente; t++) { deFrente = (await s.avaliar('__dd.pal.quadro()')) === contente; if (!deFrente) await new Promise((r) => setTimeout(r, 100)); }
  ok(deFrente, 'mouse no centro do LCD: o Pal olha de frente (quadro igual ao "frente"/parado)');

  // (c) mouse a 400 px (espaço do painel, igual ao kPalGazeReachX do plugin) à ESQUERDA do centro:
  // nx ~-1 (clamp) e o Pal olha para o lado. Testado pra esquerda, não pra direita: o centro do
  // olhar é o centro do LCD (x=1382 no espaço de 1600), e o painel (o próprio <div id="aparelho">,
  // 1600 px) acaba 218 px depois disso — exatamente o que o comentário do plugin documenta
  // (Source/UiLayout.h:271: "vira a cabeça (só cabe à esquerda: à direita o painel acaba a 218 px)").
  // Um alcance de 400 px pra direita do centro do LCD, portanto, cai FORA do <div id="aparelho"> —
  // não existe ponto de mouse real (nem no plugin, nem na demo) que produza nx=+1; só pra esquerda,
  // onde o painel sobra (1382 px de folga), dá pra mover o mouse 400 px inteiros e testar o clamp.
  const alvo = { x: centro.x - 400 * centro.escala, y: centro.y };
  await s.cmd('Input.dispatchMouseEvent', { type: 'mouseMoved', x: alvo.x, y: alvo.y });
  await s.esperar(800);
  const { nx: nxEsquerda } = await s.avaliar('__dd.pal.mouseNormalizado()');
  ok(nxEsquerda <= -0.95, `mouse 400 px (painel) à esquerda do centro do LCD: nx ~-1 (nx=${nxEsquerda.toFixed(3)})`);
  // a piscada (0,15 s a cada 3–6 s) pode cair no instante da leitura: tenta por até ~1 s
  let olhou = false;
  for (let t = 0; t < 10 && !olhou; t++) { olhou = (await s.avaliar('__dd.pal.quadro()')) === olhaEsquerda; if (!olhou) await new Promise(r => setTimeout(r, 100)); }
  ok(olhou, 'segue o mouse: olha para a esquerda');

  // regressão do bug: no ponto real MAIS à direita que existe (a borda do próprio .aparelho), o
  // alcance correto (400 px a partir do centro do LCD, não do painel inteiro) nunca deixa nx
  // chegar a 1 — o bug antigo (centro/alcance do painel inteiro) deixava, e por isso o Pal virava
  // a cabeça pra direita cedo demais, sem bater com o plugin.
  const apRight = await s.avaliar(`document.getElementById('aparelho').getBoundingClientRect().right`);
  await s.cmd('Input.dispatchMouseEvent', { type: 'mouseMoved', x: apRight - 2, y: centro.y });
  await s.esperar(500);
  const { nx: nxBordaDireita } = await s.avaliar('__dd.pal.mouseNormalizado()');
  ok(nxBordaDireita > 0 && nxBordaDireita < 0.7,
    `na borda direita real do painel, nx fica bem abaixo de 1 (nx=${nxBordaDireita.toFixed(3)}) — alcance de 400 px a partir do centro do LCD, não do painel inteiro`);

  // arrastar um knob da faixa (não do EDIT) manda Decision, igual ao PluginEditor.cpp:1101-1104
  const kdecay = await s.avaliar(`(() => { const r = document.querySelector('[aria-label="DECAY do KICK"]').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await s.cmd('Input.dispatchMouseEvent', { type: 'mousePressed', x: kdecay.x, y: kdecay.y, button: 'left', buttons: 1, clickCount: 1 });
  await s.esperar(150);
  ok(await s.avaliar('__dd.pal.estado()') === 1, 'arrastar um knob da faixa (DECAY do KICK) manda Decision: Pal sorri');
  await s.cmd('Input.dispatchMouseEvent', { type: 'mouseReleased', x: kdecay.x, y: kdecay.y, button: 'left', buttons: 0, clickCount: 1 });

  await s.clicar('[aria-label="Mute do KICK"]');
  await s.esperar(150);
  ok(await s.avaliar('__dd.pal.estado()') === 1, 'sorri no clique');

  await s.clicar('#play');
  await s.esperar(4000);
  ok(await s.avaliar('__dd.pal.estado()') === 8, 'dança no PLAY');
  // quadros alternam a cada batida (476 ms a 126 BPM): uma única leitura 600 ms depois pode cair
  // duas batidas à frente e repetir o quadro; amostra a cada 120 ms por 1,5 s e exige mudança
  const q1 = await s.avaliar('__dd.pal.quadro()');
  let mudou = false;
  for (let t = 0; t < 12 && !mudou; t++) { await s.esperar(120); mudou = (await s.avaliar('__dd.pal.quadro()')) !== q1; }
  ok(mudou, 'a dança muda no tempo do BPM');

  await s.clicar('#play');
  await s.avaliar('__dd.pal.avancar(61)');
  ok(await s.avaliar('__dd.pal.estado()') === 6, 'cochila depois de 1 minuto parado');
  ok(await s.avaliar('__dd.pal.quadro()') !== contente, 'quadro de cochilo diferente do contente');
} finally {
  s.fechar();
}

const r = await abrir(url, { largura: 1680, altura: 1400, reduzido: true, porta: 9334 });
try {
  await r.esperar(3000);
  await r.clicar('#play');
  await r.esperar(4000);
  ok(await r.avaliar('__dd.pal.estado()') === 8, 'reduced-motion: estado de dança (expressão)');
  const a = await r.avaliar('__dd.pal.quadro()');
  await r.esperar(1200);
  const b = await r.avaliar('__dd.pal.quadro()');
  ok(a === b, 'reduced-motion: o Pal fica parado');
  ok(a.slice(234, 260) === '.......############.......', 'reduced-motion: corpo na pose normal');
} finally {
  r.fechar();
}
console.log(falhas === 0 ? 'PAL: todos os testes passaram' : `${falhas} falhas`);
process.exit(falhas === 0 ? 0 : 1);
