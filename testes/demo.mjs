// A demo toca o motor do plugin: som, SAT, OTT + GR, curva, TONE X, FILL RATE e celular.
// node testes/demo.mjs [url] [desktop|movel]
import { abrir } from './cdp.mjs';

const urlBase = process.argv[2] || 'http://localhost:8123/index.html';
// ?teste=1: só assim window.__ddCtx existe, pra checar o estado real do AudioContext
const url = urlBase + (urlBase.includes('?') ? '&' : '?') + 'teste=1';
const movel = process.argv[3] === 'movel';
const s = await abrir(url, movel ? { largura: 390, altura: 844, movel: true } : { largura: 1680, altura: 1400 });
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'ok: ' : 'FAIL: ') + m); if (!c) falhas++; };
const ctl = (id) => `__dd.painel.controles.get(${JSON.stringify(id)})`;
// Nível do motor (pico retido do medidor real, não o valor do parâmetro) sobre uma janela fixa —
// prova que o som mudou de verdade, não só que o parâmetro foi lido de volta.
const nivel = async (ms) => {
  const fim = Date.now() + ms;
  const amostras = [];
  while (Date.now() < fim) {
    amostras.push(await s.avaliar('__dd.estado().pico'));
    await s.esperar(25);
  }
  return Math.sqrt(amostras.reduce((a, x) => a + x * x, 0) / amostras.length);
};
try {
  // A versão do engine vive em dois lugares (dd-processor.js não importa dd-audio.js: um worklet
  // module não consegue importar fácil) — prova que os dois números não descasaram.
  const baseUrl = urlBase.replace(/[^/]*$/, '');
  const [procTxt, audioTxt] = await Promise.all([
    fetch(baseUrl + 'dd-processor.js').then((r) => r.text()),
    fetch(baseUrl + 'dd-audio.js').then((r) => r.text()),
  ]);
  const vProc = procTxt.match(/engine\.mjs\?v=(\w+)/)?.[1];
  const vAudio = audioTxt.match(/ENGINE_V\s*=\s*'([^']+)'/)?.[1];
  ok(vProc != null && vProc === vAudio, `dd-processor.js ?v=${vProc} bate com ENGINE_V='${vAudio}' de dd-audio.js`);

  await s.esperar(2000);
  ok(await s.avaliar('typeof __dd.estado === "function"'), 'demo expõe __dd.estado');

  // ---------- atalho de teclado: barra de espaço toca/pausa, como em qualquer DAW ----------
  const espaco = (tipo) => s.cmd('Input.dispatchKeyEvent', { type: tipo, key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
  const bateEspaco = async () => { await espaco('keyDown'); await espaco('keyUp'); };

  // 1) antes de qualquer clique no aparelho, espaço não é o atalho: a página ainda rola normal
  await s.avaliar('window.scrollTo(0, 0)');
  const scrollAntes = await s.avaliar('scrollY');
  await bateEspaco();
  await s.esperar(200);
  ok(!(await s.avaliar('__dd.estado()')).tocando, 'espaço antes de clicar no aparelho não liga o play');
  // a rolagem padrão do espaço é comportamento nativo do Chrome, não algo que o nosso JS decide —
  // só registra, não reprova o teste se o headless não rolar por algum motivo de ambiente.
  const scrollDepois = await s.avaliar('scrollY');
  console.log((scrollDepois > scrollAntes ? 'ok: ' : 'obs: ') + `espaço fora do atalho ainda rola a página (scrollY ${scrollAntes} -> ${scrollDepois})`);

  // 2) clique no fundo do painel arma o atalho: espaço toca, espaço de novo para
  await s.clicar('.p-stripe');
  await bateEspaco();
  await s.esperar(1500);
  let eEsp = await s.avaliar('__dd.estado()');
  ok(eEsp.pronto && eEsp.tocando, 'espaço depois de clicar no fundo do painel liga o play');
  ok(await s.avaliar('document.querySelector(".p-status .rot").textContent') === 'Tocando', 'rodapé confirma TOCANDO pelo atalho de teclado');
  await bateEspaco();
  await s.esperar(300);
  ok(!(await s.avaliar('__dd.estado()')).tocando, 'espaço de novo para o play');

  // 3) focar um seletor do MIDI GEN desarma o atalho: espaço não deve tocar nem trocar a escala
  await s.clicar('.p-stripe');
  await s.avaliar(`${ctl('genScale')}.el.focus()`);
  await bateEspaco();
  await s.esperar(300);
  ok(!(await s.avaliar('__dd.estado()')).tocando, 'espaço com o seletor MIDI GEN focado não liga o play');

  // 4) clicar numa tecla de passo arma o atalho e foca o botão; espaço toca sem alternar o passo
  const passoAntes = await s.avaliar(`document.querySelector('.step').classList.contains('on')`);
  await s.clicar('.step');
  const passoDepoisClique = await s.avaliar(`document.querySelector('.step').classList.contains('on')`);
  ok(passoDepoisClique !== passoAntes, 'clicar no passo alterna o passo (clique normal, de controle)');
  await bateEspaco();
  await s.esperar(1500);
  let eStep = await s.avaliar('__dd.estado()');
  ok(eStep.pronto && eStep.tocando, 'espaço depois de clicar num passo ainda liga o play');
  ok(await s.avaliar(`document.querySelector('.step').classList.contains('on')`) === passoDepoisClique,
    'espaço não alterna o passo que ficou com foco (preventDefault no keyup)');
  await bateEspaco();
  await s.esperar(300);
  ok(!(await s.avaliar('__dd.estado()')).tocando, 'espaço de novo para (com o passo ainda focado)');
  await s.clicar('.step'); // devolve o passo ao estado original, pros testes seguintes
  ok(await s.avaliar(`document.querySelector('.step').classList.contains('on')`) === passoAntes, 'passo restaurado ao estado original');

  // 5) clicar fora da demo desarma o atalho
  await s.clicar('.p-stripe');
  await s.clicar('.compat-title');
  await bateEspaco();
  await s.esperar(300);
  ok(!(await s.avaliar('__dd.estado()')).tocando, 'clicar fora da demo desarma o atalho: espaço não liga o play');

  await s.clicar('#play');
  await s.esperar(4000);
  let e = await s.avaliar('__dd.estado()');
  ok(e.pronto && e.tocando, 'PLAY liga o motor e toca');
  ok(e.pico > 0.01, `sai som (pico ${e.pico.toFixed(3)})`);
  ok(await s.avaliar('document.querySelector(".p-status .rot").textContent') === 'Tocando', 'rodapé do aparelho em Tocando');
  ok(await s.avaliar('window.__ddCtx && window.__ddCtx.state') === 'running', 'AudioContext.state fica running depois do PLAY');
  if (movel) {
    const r = await s.avaliar('(() => { const b = document.getElementById("transporte").getBoundingClientRect(); return { topo: b.top, fundo: b.bottom, h: innerHeight }; })()');
    ok(r.fundo <= r.h + 1 && r.topo >= 0, 'no celular a barrinha fica na tela');
  }

  await s.avaliar(`(() => { ${ctl('satOn')}.el.click(); const sel = ${ctl('satType')}.el; sel.value = '4'; sel.dispatchEvent(new Event('change')); })()`);
  await s.esperar(300);
  ok(await s.avaliar('__dd.audio.lerParam("satOn")') === 1 && await s.avaliar('__dd.audio.lerParam("satType")') === 4,
    'SATURATION ligada e WAVE SHAPE Hard Curve chegam no motor');
  ok((await s.avaliar('Promise.all([__dd.audio.lerParam("satType"), __dd.audio.lerParam("satType")])')).every((v) => v === 4),
    'lerParam suporta duas leituras concorrentes do mesmo id');

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

  // SAT DRIVE: sobe de 0 dB pro máximo (36 dB) e mede o motor de verdade, não só o parâmetro
  await s.avaliar(`${ctl('satDriveDb')}.el.focus()`);
  await s.cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Home', code: 'Home', windowsVirtualKeyCode: 36 });
  await s.esperar(150);
  const nivelDriveAntes = await nivel(700);
  await s.cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'End', code: 'End', windowsVirtualKeyCode: 35 });
  await s.esperar(150);
  const nivelDriveDepois = await nivel(700);
  ok(await s.avaliar('__dd.audio.lerParam("satDriveDb")') === 36, 'SAT DRIVE no máximo chega no motor');
  ok(Math.abs(nivelDriveDepois - nivelDriveAntes) > 0.01,
    `SAT DRIVE muda o som de verdade (nível ${nivelDriveAntes.toFixed(3)} -> ${nivelDriveDepois.toFixed(3)})`);

  const legendas = new Set();
  await s.avaliar(`${ctl('fillRate')}.el.focus()`);
  await s.cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Home', code: 'Home', windowsVirtualKeyCode: 36 });
  for (let i = 0; i < 12; i++) {
    legendas.add(await s.avaliar('__dd.painel.legendas.rate.textContent'));
    await s.cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowUp', code: 'ArrowUp', windowsVirtualKeyCode: 38 });
  }
  ok(legendas.size === 12 && legendas.has('RATE 1/16·') && legendas.has('RATE 2'), `RATE percorre os 12 degraus (${[...legendas].join(', ')})`);
  ok(await s.avaliar('__dd.audio.lerParam("fillRate")') === 11, 'último degrau chega no motor');

  // FILL RATE muda o som (determinístico): alvo KICK (padrão de base denso + amostra sempre
  // audível), RATE 1/16 dispara a cada 1/16 (SequencerEngine::fillRateInterval32 = 2, ~119 ms a
  // 126 BPM) — a janela de 1500 ms contém ~12 viradas, longe do 1 falha em 6 do RATE "2" antigo
  // (1 nota a cada 2 compassos raramente cai na janela de 700 ms). Compara contra RATE OFF, mesmo
  // alvo e mesmo padrão de base.
  await s.avaliar(`(() => { const sel = ${ctl('fillTarget')}.el; sel.value = '0'; sel.dispatchEvent(new Event('change')); })()`);
  await s.avaliar(`${ctl('fillRate')}.el.focus()`);
  await s.cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Home', code: 'Home', windowsVirtualKeyCode: 36 });
  ok(await s.avaliar('__dd.audio.lerParam("fillRate")') === 0, 'RATE OFF chega no motor');
  await s.esperar(200);
  const nivelRateAntes = await nivel(1500);
  await s.cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowUp', code: 'ArrowUp', windowsVirtualKeyCode: 38 });
  ok(await s.avaliar('__dd.audio.lerParam("fillRate")') === 1, 'RATE 1/16 chega no motor');
  await s.esperar(200);
  const nivelRateDepois = await nivel(1500);
  ok(Math.abs(nivelRateDepois - nivelRateAntes) > 0.01,
    `FILL RATE muda o som de verdade (nível ${nivelRateAntes.toFixed(3)} -> ${nivelRateDepois.toFixed(3)})`);

  await s.avaliar(`${ctl('toneX20')}.el.click()`);
  await s.esperar(200);
  ok(await s.avaliar('document.querySelectorAll(".p-ledx.on.armada").length') === 6, 'TONE X ligado acende os 6 LEDs');
  const nivelToneXAntes = await nivel(700);
  await s.avaliar(`${ctl('kickToneX')}.el.click()`);
  await s.esperar(300);
  ok(await s.avaliar('__dd.audio.lerParam("kickToneX")') === 0 && await s.avaliar('__dd.audio.lerParam("snareToneX")') === 1,
    'LED do KICK apaga só o KICK no motor');
  const nivelToneXDepois = await nivel(700);
  ok(Math.abs(nivelToneXDepois - nivelToneXAntes) > 0.01,
    `armar/desarmar TONE X do KICK muda o som de verdade (nível ${nivelToneXAntes.toFixed(3)} -> ${nivelToneXDepois.toFixed(3)})`);

  await s.clicar('#play');
  await s.esperar(500);
  ok(!(await s.avaliar('__dd.estado()')).tocando, 'PLAY de novo para');
} finally {
  s.fechar();
}
console.log(falhas === 0 ? 'DEMO: todos os testes passaram' : `${falhas} falhas`);
process.exit(falhas === 0 ? 0 : 1);
