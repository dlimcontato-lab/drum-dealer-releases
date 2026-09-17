// EDIT do MASTER FX: páginas, contagem, fechar e o clique fora que só fecha.
import { abrir } from './cdp.mjs';

const url = process.argv[2] || 'http://localhost:8123/index.html';
const s = await abrir(url, { largura: 1680, altura: 1400 });
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'ok: ' : 'FAIL: ') + m); if (!c) falhas++; };
const visiveis = (sel) => `[...document.querySelectorAll('.p-edit-camada ${sel}')].filter((n) => n.offsetParent !== null).length`;
try {
  await s.esperar(2000);
  ok(await s.avaliar('!!(window.__dd && window.__dd.edit)'), 'existe __dd.edit');

  await s.clicar('[aria-label="Abrir o EDIT da SATURATION"]');
  await s.esperar(200);
  ok(await s.avaliar('__dd.edit.pagina()') === 0, 'EDIT da SATURATION abre a página 0');
  ok(await s.avaliar(visiveis('.knob')) === 10, 'SATURATION: 10 knobs');
  ok(await s.avaliar(visiveis('select')) === 1, 'SATURATION: seletor CLIP');
  ok(await s.avaliar(visiveis('.p-visor canvas')) === 1, 'SATURATION: visor da curva');
  ok(await s.avaliar(`[...document.querySelectorAll('.p-edit-camada .knob.apagado')].filter((n) => n.offsetParent).length`) === 6,
    'WAVESHAPER apagado fora do tipo Waveshaper');

  await s.clicar('[aria-label="Abrir o EDIT do MULTIBAND"]');
  await s.esperar(200);
  ok(await s.avaliar('__dd.edit.pagina()') === 1, 'EDIT do MULTIBAND troca para a página 1');
  ok(await s.avaliar(visiveis('.knob')) === 26, 'MULTIBAND: 26 knobs');
  ok(await s.avaliar(visiveis('.ms')) === 8, 'MULTIBAND: 8 teclas (SOFT KNEE, RMS, 3 ON, 3 S)');
  ok(await s.avaliar(visiveis('.p-gr')) === 3, 'MULTIBAND: 3 medidores GR');
  ok(await s.avaliar(`[...document.querySelectorAll('.p-edit-camada select')].filter((n) => n.offsetParent)[0].textContent`) === 'PRESETPadrãoOTT',
    'PRESET com Padrão e OTT');

  await s.clicar('.p-fechar');
  await s.esperar(200);
  ok(await s.avaliar('__dd.edit.pagina()') === -1, 'FECHAR fecha');

  await s.clicar('[aria-label="Abrir o EDIT da SATURATION"]');
  await s.esperar(200);
  await s.clicar('[aria-label="Mute do KICK"]');
  await s.esperar(200);
  ok(await s.avaliar('__dd.edit.pagina()') === -1, 'clique fora da faixa fecha o EDIT');
  ok(await s.avaliar(`document.querySelector('[aria-label="Mute do KICK"]').getAttribute('aria-pressed')`) === 'false',
    'o clique fora não aciona o MUTE de baixo');

  await s.clicar('[aria-label="Abrir o EDIT da SATURATION"]');
  await s.esperar(200);
  await s.clicar('[aria-label="Ligar a SATURATION"]');
  await s.esperar(200);
  ok(await s.avaliar('__dd.edit.pagina()') === 0, 'clique na faixa MASTER FX não fecha o EDIT');
  ok(await s.avaliar(`document.querySelector('[aria-label="Ligar a SATURATION"]').getAttribute('aria-pressed')`) === 'true',
    'a faixa continua viva: ON da SATURATION liga');
  await s.clicar('[aria-label="Abrir o EDIT da SATURATION"]');
  await s.esperar(200);
  ok(await s.avaliar('__dd.edit.pagina()') === -1, 'EDIT de novo na mesma página fecha');

  // centro de um elemento na tela, sem clicar e sem rolar (o aparelho inteiro cabe na janela de 1400)
  const centro = (sel) => s.avaliar(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await s.avaliar(`document.querySelector('.aparelho').scrollIntoView({ block: 'center' })`);
  const MUTE = '[aria-label="Mute do KICK"]';
  const muteOn = () => s.avaliar(`document.querySelector('${MUTE}').getAttribute('aria-pressed')`);

  // arrasto que começa num knob da faixa e termina fora: o EDIT fica aberto
  await s.clicar('[aria-label="Abrir o EDIT da SATURATION"]');
  await s.esperar(200);
  await s.avaliar(`document.querySelector('.aparelho').scrollIntoView({ block: 'center' })`);
  const k = await centro('[aria-label="DRIVE da SATURATION"]');
  const fora = await centro(MUTE);
  await s.cmd('Input.dispatchMouseEvent', { type: 'mousePressed', x: k.x, y: k.y, button: 'left', buttons: 1, clickCount: 1 });
  for (let i = 1; i <= 8; i++)
    await s.cmd('Input.dispatchMouseEvent', { type: 'mouseMoved', x: k.x + ((fora.x - k.x) * i) / 8, y: k.y + ((fora.y - k.y) * i) / 8, button: 'left', buttons: 1 });
  await s.cmd('Input.dispatchMouseEvent', { type: 'mouseReleased', x: fora.x, y: fora.y, button: 'left', buttons: 0, clickCount: 1 });
  await s.esperar(200);
  ok(await s.avaliar('__dd.edit.pagina()') === 0, 'arrasto de knob da faixa que termina fora não fecha o EDIT');
  ok(await muteOn() === 'false', 'o arrasto não aciona o MUTE onde terminou');

  // inert: com o EDIT aberto, os controles do MIDI GEN saem do Tab
  const genSel = `[...document.querySelectorAll('.aparelho button, .aparelho select')].filter((n) => !n.closest('.p-edit-camada')
    && (() => { const [x, y, w, h] = __dd.layout.midiGen.panel; const l = parseFloat(n.style.left), t = parseFloat(n.style.top); return l >= x && t >= y && l < x + w && t < y + h; })())`;
  ok(await s.avaliar(`${genSel}.length`) === 5, 'MIDI GEN tem 5 controles (3 seletores, BASS, LEAD)');
  ok(await s.avaliar(`${genSel}.every((n) => n.closest('[inert]'))`), 'com o EDIT aberto os controles do MIDI GEN ficam inert');
  await s.avaliar(`document.querySelector('[aria-label="Abrir o EDIT da SATURATION"]').focus()`);
  let chegou = false;
  for (let i = 0; i < 60 && !chegou; i++) {
    await s.cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    await s.cmd('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    chegou = await s.avaliar(`${genSel}.includes(document.activeElement)`);
  }
  ok(!chegou, 'Tab (60 vezes) não chega nos controles do MIDI GEN com o EDIT aberto');
  ok(await s.avaliar('__dd.edit.pagina()') === 0, 'o EDIT seguiu aberto durante o Tab');

  // Escape fecha e devolve o foco à tecla EDIT que abriu
  await s.avaliar(`document.querySelector('.p-edit-camada .knob').focus()`);
  await s.cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await s.cmd('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await s.esperar(200);
  ok(await s.avaliar('__dd.edit.pagina()') === -1, 'Escape fecha o EDIT');
  ok(await s.avaliar(`document.activeElement.getAttribute('aria-label')`) === 'Abrir o EDIT da SATURATION', 'Escape devolve o foco à tecla EDIT');
  ok(await s.avaliar(`${genSel}.every((n) => !n.closest('[inert]'))`), 'ao fechar, o MIDI GEN perde o inert');
  await s.clicar('[aria-label="Abrir o EDIT do MULTIBAND"]');
  await s.esperar(200);
  await s.cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await s.esperar(200);
  ok(await s.avaliar(`document.activeElement.getAttribute('aria-label')`) === 'Abrir o EDIT do MULTIBAND', 'Escape no MULTIBAND devolve o foco à tecla EDIT do MULTIBAND');

  // toque fora (celular): fecha e não aciona o MUTE embaixo
  await s.cmd('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  await s.clicar('[aria-label="Abrir o EDIT da SATURATION"]');
  await s.esperar(200);
  await s.avaliar(`document.querySelector('.aparelho').scrollIntoView({ block: 'center' })`);
  const t = await centro(MUTE);
  await s.cmd('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: t.x, y: t.y }] });
  await s.cmd('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await s.esperar(400);
  ok(await s.avaliar('__dd.edit.pagina()') === -1, 'toque fora da faixa fecha o EDIT');
  ok(await muteOn() === 'false', 'o toque fora não aciona o MUTE de baixo');

  // o mesmo toque num navegador que não entrega o click depois do preventDefault do pointerdown:
  // o Chrome entrega, então o click é cortado aqui na captura da window para simular esse caso
  await s.clicar('[aria-label="Abrir o EDIT da SATURATION"]');
  await s.esperar(200);
  await s.avaliar(`document.querySelector('.aparelho').scrollIntoView({ block: 'center' })`);
  await s.avaliar(`window.__semClick = (e) => e.stopImmediatePropagation(); window.addEventListener('click', __semClick, true)`);
  const t2 = await centro(MUTE);
  await s.cmd('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: t2.x, y: t2.y }] });
  await s.cmd('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await s.esperar(400);
  await s.avaliar(`window.removeEventListener('click', __semClick, true)`);
  ok(await s.avaliar('__dd.edit.pagina()') === -1, 'toque fora fecha mesmo sem click (fecha no pointerup)');
  ok(await muteOn() === 'false', 'e não aciona o MUTE de baixo');
} finally {
  s.fechar();
}
console.log(falhas === 0 ? 'EDIT: todos os testes passaram' : `${falhas} falhas`);
process.exit(falhas === 0 ? 0 : 1);
