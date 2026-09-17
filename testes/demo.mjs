// A demo toca o motor do plugin: som, SAT, OTT + GR, curva, TONE X, FILL RATE e celular.
// node testes/demo.mjs [url] [desktop|movel]
import { abrir } from './cdp.mjs';

const url = process.argv[2] || 'http://localhost:8123/index.html';
const movel = process.argv[3] === 'movel';
const s = await abrir(url, movel ? { largura: 390, altura: 844, movel: true } : { largura: 1680, altura: 1400 });
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'ok: ' : 'FAIL: ') + m); if (!c) falhas++; };
const ctl = (id) => `__dd.painel.controles.get(${JSON.stringify(id)})`;
try {
  await s.esperar(2000);
  ok(await s.avaliar('typeof __dd.estado === "function"'), 'demo expõe __dd.estado');

  await s.clicar('#play');
  await s.esperar(4000);
  let e = await s.avaliar('__dd.estado()');
  ok(e.pronto && e.tocando, 'PLAY liga o motor e toca');
  ok(e.pico > 0.01, `sai som (pico ${e.pico.toFixed(3)})`);
  ok(await s.avaliar('document.querySelector(".p-status .rot").textContent') === 'Tocando', 'rodapé do aparelho em Tocando');
  if (movel) {
    const r = await s.avaliar('(() => { const b = document.getElementById("transporte").getBoundingClientRect(); return { topo: b.top, fundo: b.bottom, h: innerHeight }; })()');
    ok(r.fundo <= r.h + 1 && r.topo >= 0, 'no celular a barrinha fica na tela');
  }

  await s.avaliar(`(() => { ${ctl('satOn')}.el.click(); const sel = ${ctl('satType')}.el; sel.value = '4'; sel.dispatchEvent(new Event('change')); })()`);
  await s.esperar(300);
  ok(await s.avaliar('__dd.audio.lerParam("satOn")') === 1 && await s.avaliar('__dd.audio.lerParam("satType")') === 4,
    'SATURATION ligada e WAVE SHAPE Hard Curve chegam no motor');

  await s.avaliar('__dd.edit.abrir(0)');
  await s.esperar(1500);
  const curvaA = await s.avaliar('__dd.curva()');
  await s.avaliar(`(() => { const sel = ${ctl('satType')}.el; sel.value = '0'; sel.dispatchEvent(new Event('change')); })()`);
  await s.esperar(500);
  const curvaB = await s.avaliar('__dd.curva()');
  ok(Array.isArray(curvaA) && curvaA.length === 256, 'EDIT SATURATION desenha a curva do motor');
  ok(Array.isArray(curvaB) && curvaA.some((v, i) => Math.abs(v - curvaB[i]) > 1e-3), 'trocar o tipo muda a curva');

  await s.avaliar('__dd.edit.abrir(1)');
  await s.avaliar(`(() => { const sel = document.querySelector('[aria-label="Preset do MULTIBAND"]'); sel.value = '1'; sel.dispatchEvent(new Event('change')); })()`);
  await s.esperar(3000);
  ok(await s.avaliar(`${ctl('mbOn')}.get()`) === 1 && Math.abs(await s.avaliar(`${ctl('mbLowInDb')}.get()`) - 5.2) < 1e-3,
    'PRESET OTT volta do motor e acende os controles');
  e = await s.avaliar('__dd.estado()');
  ok(Math.min(...e.gr) < -1, `GR se mexe tocando (${e.gr.map((x) => x.toFixed(1)).join(' / ')})`);
  ok(await s.avaliar(`[...document.querySelectorAll('.p-gr b')].some((b) => b.textContent !== '0.0 dB')`), 'medidor GR mostra o valor');
  await s.avaliar('__dd.edit.fechar()');

  const legendas = new Set();
  await s.avaliar(`${ctl('fillRate')}.el.focus()`);
  await s.cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Home', code: 'Home', windowsVirtualKeyCode: 36 });
  for (let i = 0; i < 12; i++) {
    legendas.add(await s.avaliar('__dd.painel.legendas.rate.textContent'));
    await s.cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowUp', code: 'ArrowUp', windowsVirtualKeyCode: 38 });
  }
  ok(legendas.size === 12 && legendas.has('RATE 1/16·') && legendas.has('RATE 2'), `RATE percorre os 12 degraus (${[...legendas].join(', ')})`);
  ok(await s.avaliar('__dd.audio.lerParam("fillRate")') === 11, 'último degrau chega no motor');

  await s.avaliar(`${ctl('toneX20')}.el.click()`);
  await s.esperar(200);
  ok(await s.avaliar('document.querySelectorAll(".p-ledx.on.armada").length') === 6, 'TONE X ligado acende os 6 LEDs');
  await s.avaliar(`${ctl('kickToneX')}.el.click()`);
  await s.esperar(300);
  ok(await s.avaliar('__dd.audio.lerParam("kickToneX")') === 0 && await s.avaliar('__dd.audio.lerParam("snareToneX")') === 1,
    'LED do KICK apaga só o KICK no motor');

  await s.clicar('#play');
  await s.esperar(500);
  ok(!(await s.avaliar('__dd.estado()')).tocando, 'PLAY de novo para');
} finally {
  s.fechar();
}
console.log(falhas === 0 ? 'DEMO: todos os testes passaram' : `${falhas} falhas`);
process.exit(falhas === 0 ? 0 : 1);
