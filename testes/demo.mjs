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
// Nível do motor (pico retido do medidor real, não o valor do parâmetro) — prova que o som mudou de
// verdade, não só que o parâmetro foi lido de volta. Duas armadilhas no jeito antigo:
// 1) uma janela solta de tempo cai numa fase qualquer do padrão rítmico — com nada mudando, dois
//    "antes" já variavam 0,04–0,12 (o próprio ritmo é maior que qualquer diferença real), contra um
//    limiar de 0,01 que nunca reprovava nada. Fix: sincroniza no início de um compasso (passo 0) e
//    mede por pelo menos 2 compassos inteiros — "antes" e "depois" sempre começam na mesma fase.
// 2) __dd.estado().pico é o pico da MISTURA INTEIRA (todos os 6 instrumentos), não só do instrumento
//    testado — o padrão dos outros 5 é ruído de sobra maior que a mudança real num só. Fix: dá SOLO
//    no instrumento testado antes de medir (ver `soloKick`), isolando o canal.
// Métrica: o maior pico batido nas N compassos (não a média/RMS) — o TONE, por exemplo, muda o
// timbre do ataque sem mudar a energia sustentada por igual, e a média lava a diferença; o pico não.
const esperaInicioDeCompasso = async () => {
  let anterior = await s.avaliar('__dd.estado().passo');
  for (let guarda = 0; guarda < 400; guarda++) {
    await s.esperar(8);
    const p = await s.avaliar('__dd.estado().passo');
    if (p === 0 && anterior !== 0) return;
    anterior = p;
  }
  throw new Error('não sincronizou no início do compasso (passo nunca voltou a 0 — o motor está tocando?)');
};
const nivelBarras = async (compassos = 2) => {
  await esperaInicioDeCompasso();
  let maximo = 0;
  let ultimo = 0;
  let feitos = 0;
  while (feitos < compassos) {
    const st = await s.avaliar('__dd.estado()');
    if (st.pico > maximo) maximo = st.pico;
    if (st.passo < ultimo) feitos++;
    ultimo = st.passo;
    await s.esperar(10);
  }
  return maximo;
};
// Ruído do próprio medidor: duas leituras de nivelBarras() de volta a volta, sem mudar nada entre
// elas, viram o "antes"/"antes de novo" de cada checagem abaixo. A diferença real (depois da
// mudança de parâmetro) tem que ser bem maior que esse ruído.
const LIMIAR_MINIMO = 0.01; // piso absoluto: guarda contra um ruído medido como ~0 por coincidência
const mudouDeVerdade = (delta, ruido) => delta > Math.max(LIMIAR_MINIMO, ruido * 3);
const soloKick = () => s.clicar('[aria-label="Solo do KICK"]'); // liga/desliga: é um toggle
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
  await s.clicar('.p-status');
  await bateEspaco();
  // o primeiro play carrega o motor e os samples: espera até 10 s (a frio pode passar de 1,5 s)
  let eEsp = await s.avaliar('__dd.estado()');
  for (let t = 0; t < 40 && !(eEsp.pronto && eEsp.tocando); t++) { await s.esperar(250); eEsp = await s.avaliar('__dd.estado()'); }
  ok(eEsp.pronto && eEsp.tocando, 'espaço depois de clicar no fundo do painel liga o play');
  ok(await s.avaliar('document.querySelector(".p-status .rot").textContent') === 'Tocando', 'rodapé confirma TOCANDO pelo atalho de teclado');
  await bateEspaco();
  await s.esperar(300);
  ok(!(await s.avaliar('__dd.estado()')).tocando, 'espaço de novo para o play');

  // 3) focar um seletor do MIDI GEN desarma o atalho: espaço não deve tocar nem trocar a escala
  await s.clicar('.p-status');
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
  await s.clicar('.p-status');
  await s.clicar('.compat-title');
  await bateEspaco();
  await s.esperar(300);
  ok(!(await s.avaliar('__dd.estado()')).tocando, 'clicar fora da demo desarma o atalho: espaço não liga o play');

  // 6) Tab (foco por teclado) pra fora do aparelho/transporte desarma o atalho, igual a um clique fora
  await s.clicar('.p-status');
  await s.avaliar(`document.getElementById('nav-conta').focus()`);
  await bateEspaco();
  await s.esperar(300);
  ok(!(await s.avaliar('__dd.estado()')).tocando, 'Tab pra fora da demo desarma o atalho: espaço não liga o play');

  // 7) espaço não passa por cima do "Carregando…": com o PLAY desabilitado, a barra de espaço não faz nada
  await s.clicar('.p-status');
  const tocandoAntesDoGuard = (await s.avaliar('__dd.estado()')).tocando;
  await s.avaliar(`document.getElementById('play').disabled = true`);
  await bateEspaco();
  await s.esperar(300);
  ok((await s.avaliar('__dd.estado()')).tocando === tocandoAntesDoGuard,
    'espaço não faz nada com o PLAY desabilitado (ex.: "Carregando…")');
  await s.avaliar(`document.getElementById('play').disabled = false`);

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

  // SAT DRIVE: sobe de 0 dB pro máximo (36 dB) e mede o motor de verdade, não só o parâmetro — em
  // compassos inteiros alinhados ao passo, contra o ruído do próprio medidor medido no ato.
  await s.avaliar(`${ctl('satDriveDb')}.el.focus()`);
  await s.cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Home', code: 'Home', windowsVirtualKeyCode: 36 });
  await s.esperar(150);
  const satAntes1 = await nivelBarras(2);
  const satAntes2 = await nivelBarras(2);
  const ruidoSat = Math.abs(satAntes2 - satAntes1);
  await s.cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'End', code: 'End', windowsVirtualKeyCode: 35 });
  await s.esperar(150);
  const nivelDriveDepois = await nivelBarras(2);
  const deltaSat = Math.abs(nivelDriveDepois - satAntes2);
  ok(await s.avaliar('__dd.audio.lerParam("satDriveDb")') === 36, 'SAT DRIVE no máximo chega no motor');
  ok(mudouDeVerdade(deltaSat, ruidoSat),
    `SAT DRIVE muda o som de verdade (ruído ${ruidoSat.toFixed(4)}, delta ${deltaSat.toFixed(4)}, nível ${satAntes2.toFixed(3)} -> ${nivelDriveDepois.toFixed(3)})`);

  // fillBeat (Task 15C): serigrafia nova do RATE da virada, 9 valores na ordem do painel/params.json
  // ('2','1','3/4','0','1/2','1/4','1/8','1/16','1/32' — '0' no meio é o OFF, igual ao fillRate
  // legado). O motor novo recebe o próprio id fillBeat, sem mapeamento pro legado.
  const legendas = new Set();
  await s.avaliar(`${ctl('fillBeat')}.el.focus()`);
  await s.cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Home', code: 'Home', windowsVirtualKeyCode: 36 });
  for (let i = 0; i < 9; i++) {
    legendas.add(await s.avaliar('__dd.painel.legendas.rate.textContent'));
    await s.cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowUp', code: 'ArrowUp', windowsVirtualKeyCode: 38 });
  }
  ok(legendas.size === 9 && legendas.has('RATE 2') && legendas.has('RATE 1/32'), `RATE percorre os 9 degraus (${[...legendas].join(', ')})`);
  ok(await s.avaliar('__dd.audio.lerParam("fillBeat")') === 8, 'último degrau (1/32) chega no motor');

  // FILL RATE e TONE X (abaixo) só mexem no KICK: dá SOLO nele antes de medir, senão o pico lido é
  // o da mistura inteira (6 instrumentos) e o padrão dos outros 5 é ruído bem maior que a mudança
  // real num só — foi isso que fazia os dois "antes" (sem trocar nada) variarem sozinhos.
  await soloKick();
  await s.esperar(300);
  ok(await s.avaliar('__dd.audio.lerParam("kickSolo")') === 1, 'SOLO do KICK chega no motor antes de medir');

  // FILL RATE muda o som (determinístico): alvo KICK, RATE 1/16 (índice 7 de fillBeat) contra OFF
  // (índice 3, o valor '0') — mas com o KICK esparso (só o passo 1 aceso). Com a base cheia (4
  // batidas por compasso) a virada soma pouca energia relativa e a diferença real fica perto do
  // ruído do medidor; esparso, a virada é a maior parte da energia do compasso e a diferença fica
  // gritante.
  const kickOnAntes = await s.avaliar(`[...document.querySelectorAll('[aria-label^="KICK, passo"]')].map((b) => b.classList.contains('on'))`);
  await s.avaliar(`(() => { const els = [...document.querySelectorAll('[aria-label^="KICK, passo"]')];
    els.forEach((el, i) => { const alvoOn = i === 0; if (el.classList.contains('on') !== alvoOn) el.click(); }); })()`);
  await s.avaliar(`(() => { const sel = ${ctl('fillTarget')}.el; sel.value = '0'; sel.dispatchEvent(new Event('change')); })()`);
  await s.avaliar(`${ctl('fillBeat')}.el.focus()`);
  await s.cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Home', code: 'Home', windowsVirtualKeyCode: 36 });
  for (let i = 0; i < 3; i++) await s.cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowUp', code: 'ArrowUp', windowsVirtualKeyCode: 38 });
  ok(await s.avaliar('__dd.audio.lerParam("fillBeat")') === 3, 'RATE 0 (OFF) chega no motor');
  await s.esperar(200);
  const rateAntes1 = await nivelBarras(2);
  const rateAntes2 = await nivelBarras(2);
  const ruidoRate = Math.abs(rateAntes2 - rateAntes1);
  for (let i = 0; i < 4; i++) await s.cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowUp', code: 'ArrowUp', windowsVirtualKeyCode: 38 });
  ok(await s.avaliar('__dd.audio.lerParam("fillBeat")') === 7, 'RATE 1/16 chega no motor');
  await s.esperar(200);
  const nivelRateDepois = await nivelBarras(2);
  const deltaRate = Math.abs(nivelRateDepois - rateAntes2);
  ok(mudouDeVerdade(deltaRate, ruidoRate),
    `FILL RATE muda o som de verdade (ruído ${ruidoRate.toFixed(4)}, delta ${deltaRate.toFixed(4)}, nível ${rateAntes2.toFixed(3)} -> ${nivelRateDepois.toFixed(3)})`);
  // devolve o padrão original do KICK pros testes seguintes (e pra quem olhar a demo depois)
  await s.avaliar(`(() => { const els = [...document.querySelectorAll('[aria-label^="KICK, passo"]')]; const antes = ${JSON.stringify(kickOnAntes)};
    els.forEach((el, i) => { if (el.classList.contains('on') !== antes[i]) el.click(); }); })()`);

  await s.avaliar(`${ctl('toneX20')}.el.click()`);
  await s.esperar(200);
  ok(await s.avaliar('document.querySelectorAll(".p-ledx.on.armada").length') === 6, 'TONE X ligado acende os 6 LEDs');
  await s.avaliar(`${ctl('kickToneX')}.el.click()`);
  await s.esperar(200);
  ok(await s.avaliar('__dd.audio.lerParam("kickToneX")') === 0 && await s.avaliar('__dd.audio.lerParam("snareToneX")') === 1,
    'LED do KICK apaga só o KICK no motor');
  await s.avaliar(`${ctl('kickToneX')}.el.click()`); // re-arma: o teste de som abaixo precisa do TONE X ativo no KICK
  await s.esperar(200);
  ok(await s.avaliar('__dd.audio.lerParam("kickToneX")') === 1, 'KICK TONE X re-armado antes do teste de som');

  // TONE X muda o som (determinístico): com TONE X ligado e o KICK armado, joga o KICK TONE de um
  // extremo a outro do knob — bem mais confiável do que medir a diferença sutil de ligar/desligar
  // um LED, que pode não se mover nada se o TONE já estiver perto do repouso.
  await s.avaliar(`${ctl('kickTone')}.el.focus()`);
  await s.cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Home', code: 'Home', windowsVirtualKeyCode: 36 });
  await s.esperar(150);
  const toneAntes1 = await nivelBarras(2);
  const toneAntes2 = await nivelBarras(2);
  const ruidoTone = Math.abs(toneAntes2 - toneAntes1);
  await s.cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'End', code: 'End', windowsVirtualKeyCode: 35 });
  await s.esperar(150);
  const nivelToneXDepois = await nivelBarras(2);
  const deltaTone = Math.abs(nivelToneXDepois - toneAntes2);
  ok(await s.avaliar('__dd.audio.lerParam("kickTone")') === 1, 'KICK TONE no extremo chega no motor');
  ok(mudouDeVerdade(deltaTone, ruidoTone),
    `TONE X do KICK muda o som de verdade (ruído ${ruidoTone.toFixed(4)}, delta ${deltaTone.toFixed(4)}, nível ${toneAntes2.toFixed(3)} -> ${nivelToneXDepois.toFixed(3)})`);
  await soloKick(); // desliga o SOLO: devolve a mistura normal pro resto da demo
  await s.esperar(200);
  ok(await s.avaliar('__dd.audio.lerParam("kickSolo")') === 0, 'SOLO do KICK desligado no fim');

  await s.clicar('#play');
  await s.esperar(500);
  ok(!(await s.avaliar('__dd.estado()')).tocando, 'PLAY de novo para');
} finally {
  s.fechar();
}
console.log(falhas === 0 ? 'DEMO: todos os testes passaram' : `${falhas} falhas`);
process.exit(falhas === 0 ? 0 : 1);
