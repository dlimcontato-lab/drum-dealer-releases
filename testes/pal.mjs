// O Pal na página: contente ao abrir, segue o mouse, sorri no clique, dança no PLAY, cochila parado,
// e com reduced-motion não dança.
import { abrir } from './cdp.mjs';

const urlBase = process.argv[2] || 'http://localhost:8123/index.html';
// ?teste=1: só assim window.__dd existe (gate de debug em produção)
const url = urlBase + (urlBase.includes('?') ? '&' : '?') + 'teste=1';
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'ok: ' : 'FAIL: ') + m); if (!c) falhas++; };

const s = await abrir(url, { largura: 1680, altura: 1400 });
try {
  await s.esperar(3000);
  ok(await s.avaliar('!!(__dd.pal)'), 'Pal carregado');
  const [contente, olhaDireita] = await s.avaliar('fetch("painel/pal.json").then((r) => r.json()).then((p) => [p.sheet[0].join(""), p.sheet[2].join("")])');
  ok([0, 4].includes(await s.avaliar('__dd.pal.estado()')), 'abre contente');

  const alvo = await s.avaliar(`(() => { const a = document.getElementById('aparelho'); a.scrollIntoView({ block: 'center' });
    const r = a.getBoundingClientRect(); return { x: r.right - 10, y: r.top + r.height / 2 }; })()`);
  await s.cmd('Input.dispatchMouseEvent', { type: 'mouseMoved', x: alvo.x, y: alvo.y });
  await s.esperar(800);
  // a piscada (0,15 s a cada 3–6 s) pode cair no instante da leitura: tenta por até ~1 s
  let olhou = false;
  for (let t = 0; t < 10 && !olhou; t++) { olhou = (await s.avaliar('__dd.pal.quadro()')) === olhaDireita; if (!olhou) await new Promise(r => setTimeout(r, 100)); }
  ok(olhou, 'segue o mouse: olha para a direita');

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
