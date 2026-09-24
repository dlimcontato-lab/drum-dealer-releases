// Task 15C (24/09): 3 provas que só o motor WASM novo (6f13917) passa — o de 17/09 não tinha
// grooveFamily, echoBeat sincronizado nem RELEASE por canal. node testes/motor.mjs [url]
//
// Primeiro confirma ao vivo (AudioContext real, PLAY, cliques na UI) que os parâmetros novos saem
// da tela e chegam no motor. Depois, pra provar que o SOM de verdade mudou, não dá pra usar o
// medidor do rodapé (pico retido, decaimento fixo de 0.82/quadro — dd-painel.js medir()): ele
// descola do áudio real rápido demais (a cauda do RELEASE já é indistinguível a partir de ~90 ms) e
// o CDP tem jitter grande demais pra cravar um desvio de swing de poucos ms ou uma repetição de eco
// certinha em 250 ms. Por isso as 3 checagens de áudio são renderizadas OFFLINE, fora do tempo
// real: pega o espelho (a mesma instância WASM que o EDIT/curva e o Pal já usam) e chama
// _web_process direto, sample a sample (48 kHz) — igual ao web/test-engine.cjs do repositório do
// plugin, só que rodando aqui na página em vez de Node standalone.
import { abrir } from './cdp.mjs';

const urlBase = process.argv[2] || 'http://localhost:8123/index.html';
const url = urlBase + (urlBase.includes('?') ? '&' : '?') + 'teste=1';
const s = await abrir(url, { largura: 1680, altura: 1400 });
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'ok: ' : 'FAIL: ') + m); if (!c) falhas++; };
const ctl = (id) => `__dd.painel.controles.get(${JSON.stringify(id)})`;

const definirKick = async (padrao) => {
  await s.avaliar(`(() => { const els = [...document.querySelectorAll('[aria-label^="KICK, passo"]')];
    const alvo = ${JSON.stringify(padrao)};
    els.forEach((el, i) => { if (el.classList.contains('on') !== !!alvo[i]) el.click(); }); })()`);
};
const soloKick = () => s.clicar('[aria-label="Solo do KICK"]');
const escolher = async (id, idx) => {
  await s.avaliar(`(() => { const sel = ${ctl(id)}.el; sel.value = '${idx}'; sel.dispatchEvent(new Event('change')); })()`);
};
const extremo = async (id, tecla) => {
  await s.avaliar(`${ctl(id)}.el.focus()`);
  await s.cmd('Input.dispatchKeyEvent', { type: 'keyDown', key: tecla, code: tecla, windowsVirtualKeyCode: tecla === 'Home' ? 36 : 35 });
};

try {
  await s.esperar(1500);
  await s.clicar('.p-status');
  await s.clicar('#play');
  let e = await s.avaliar('__dd.estado()');
  for (let t = 0; t < 40 && !(e.pronto && e.tocando); t++) { await s.esperar(250); e = await s.avaliar('__dd.estado()'); }
  ok(e.pronto && e.tocando, 'motor no ar (PLAY) antes das checagens');

  // ---------- parte 1 (ao vivo): os parâmetros novos saem da UI e chegam no motor ----------
  await soloKick();
  await s.esperar(200);
  ok(await s.avaliar('__dd.audio.lerParam("kickSolo")') === 1, 'SOLO do KICK chega no motor');

  await extremo('groove', 'End');
  ok(await s.avaliar('__dd.audio.lerParam("groove")') === 1, 'GROOVE AMOUNT no máximo chega no motor');
  await escolher('grooveFamily', 2); // Ableton Swing 8
  ok(await s.avaliar('__dd.audio.lerParam("grooveFamily")') === 2, 'grooveFamily (família nova) chega no motor pelo próprio id');
  await escolher('grooveFamily', 0);
  await extremo('groove', 'Home');

  await extremo('echoMix', 'End');
  ok(await s.avaliar('__dd.audio.lerParam("echoMix")') === 1, 'ECHO DRY/WET no máximo chega no motor');
  await s.avaliar(`${ctl('echoSync')}.el.click()`);
  ok(await s.avaliar('__dd.audio.lerParam("echoSync")') === 1, 'ECHO SYNC ligado chega no motor');
  await escolher('echoBeat', 3); // '1/8' (0=0, 1=1/32, 2=1/16, 3=1/8, 4=1/4, 5=1/2, 6=3/4, 7=1, 8=2)
  ok(await s.avaliar('__dd.audio.lerParam("echoBeat")') === 3, 'echoBeat (divisão nova) chega no motor pelo próprio id, sem mapear pro echoDiv legado');
  await s.avaliar(`${ctl('kickEchoOn')}.el.click()`);
  ok(await s.avaliar('__dd.audio.lerParam("kickEchoOn")') === 1, 'kickEchoOn chega no motor (ECHO por instrumento)');
  await s.avaliar(`${ctl('kickEchoOn')}.el.click()`);
  await escolher('echoBeat', 3);
  await s.avaliar(`${ctl('echoSync')}.el.click()`);
  await extremo('echoMix', 'Home');

  await extremo('kickRelease', 'End');
  ok(await s.avaliar('__dd.audio.lerParam("kickRelease")') === 2, 'kickRelease (RELEASE por canal, novo) chega no motor pelo próprio id');
  await extremo('kickRelease', 'Home');

  await definirKick([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]); // devolve o padrão original
  await soloKick();

  // ---------- parte 2 (offline, PCM bruto, 48 kHz sample-accurate): o som de verdade mudou ----------
  const offline = await s.avaliar(`(async () => {
    const mod = await import('./dd-audio.js?v=7');
    const M = await mod.carregarEspelho();
    M._web_init(48000);
    const idxCache = new Map();
    const idx = (id) => {
      let i = idxCache.get(id);
      if (i === undefined) { i = M.ccall('web_param_index', 'number', ['string'], [id]); idxCache.set(id, i); }
      return i;
    };
    const setar = (id, v) => { const i = idx(id); if (i >= 0) M._web_set(i, v); };
    const lista = await fetch('painel/params.json?v=20260925a').then((r) => r.json());
    lista.forEach((p) => setar(p.id, p.def)); // mesmo estado inicial da demo (estadoInicial())

    const ab = await fetch('audio/kick0.m4a').then((r) => r.arrayBuffer());
    const ctxTmp = new (window.AudioContext || window.webkitAudioContext)();
    const buf = await ctxTmp.decodeAudioData(ab);
    const chan = buf.getChannelData(0).slice();
    await ctxTmp.close();
    const ptr = M._malloc(chan.length * 4);
    M.HEAPF32.set(chan, ptr / 4);
    M._web_load_sample(0, ptr, chan.length);
    M._free(ptr);

    const BLOCK = 128;
    const outL = M._malloc(BLOCK * 4);
    const outR = M._malloc(BLOCK * 4);
    const processar = (n) => {
      const pcm = new Float32Array(n);
      let feito = 0;
      while (feito < n) {
        const chunk = Math.min(BLOCK, n - feito);
        M._web_process(outL, outR, chunk);
        pcm.set(M.HEAPF32.subarray(outL / 4, outL / 4 + chunk), feito);
        feito += chunk;
      }
      return pcm;
    };
    const rms = (pcm, deMs, ateMs) => {
      const a = pcm.subarray(Math.round(deMs * 48), Math.round(ateMs * 48)); // ms -> amostra (48/ms a 48 kHz)
      let soma = 0;
      for (let i = 0; i < a.length; i++) soma += a[i] * a[i];
      return Math.sqrt(soma / Math.max(1, a.length));
    };
    const pico = (pcm) => { let m = 0; for (let i = 0; i < pcm.length; i++) m = Math.max(m, Math.abs(pcm[i])); return m; };
    // Onsets por limiar relativo ao pico do próprio trecho, com histerese (sobe acima de LIMIAR,
    // só conta de novo depois de descer abaixo de LIMIAR/2) — sample-accurate, sem o jitter do
    // medidor/CDP: mede em amostras (1/48000 s), não em quadros de ~21 ms ou callbacks de CDP.
    // minGapMs: o ataque do kick balança acima e abaixo do limiar várias vezes num intervalo de
    // poucos ms (o transiente tem várias oscilações antes de assentar) — sem um piso de tempo entre
    // dois onsets registrados, cada uma dessas oscilações vira um "onset" falso.
    const onsetsPCM = (pcm, fracaoDoPico, minGapMs) => {
      const limiar = pico(pcm) * fracaoDoPico;
      const minGapAm = minGapMs * 48;
      const out = [];
      let acima = false;
      let ultimoAm = -Infinity;
      for (let i = 0; i < pcm.length; i++) {
        const v = Math.abs(pcm[i]);
        if (!acima && v >= limiar) {
          if (i - ultimoAm >= minGapAm) { out.push(i / 48); ultimoAm = i; }
          acima = true;
        } else if (acima && v < limiar / 3) acima = false;
      }
      return out;
    };

    // ---------- 1) GROOVE por família muda o swing (kick nos 16 passos, contra STRAIGHT) ----------
    // Com o KICK só nos passos pares (alternados) a Ableton Swing 8 não muda nada — o algoritmo de
    // swing desloca uma nota "off" em relação à nota "on" vizinha, e sem uma nota na posição "on" não
    // há o que comparar. Com o KICK nos 16 passos (grade cheia), sobra referência pro swing agir: a
    // Straight sai com o dobro de onsets "limpos" da Ableton Swing 8 (a swing aproxima/funde pares de
    // 16-avos), e os onsets que sobrevivem já divergem em dezenas de ms a partir do 6º ataque.
    setar('groove', 1.0); // AMOUNT no máximo: sem isso nenhuma família desvia o groove
    for (let i = 0; i < 16; i++) M._web_set_step(0, i, 1); // os 16 passos
    const bpmGroove = 120;
    const tocarBarra = (ms) => { M._web_set_bpm(bpmGroove); M._web_set_playing(1); const pcm = processar(Math.round(48000 * ms / 1000)); M._web_set_playing(0); return pcm; };
    setar('grooveFamily', 0); // Straight
    const onReto = onsetsPCM(tocarBarra(2100), 0.3, 40);
    setar('grooveFamily', 2); // Ableton Swing 8
    const onSwing = onsetsPCM(tocarBarra(2100), 0.3, 40);
    setar('grooveFamily', 0);
    setar('groove', 0);
    for (let i = 0; i < 16; i++) M._web_set_step(0, i, 0);

    // ---------- 2) ECHO por instrumento: kickEchoOn + echoBeat 1/8 repete o kick a ~250 ms (120 BPM) ----------
    setar('echoMix', 1.0); // sem DRY/WET o bus do ECHO fica mudo (def 0%)
    setar('echoFeedback', 0.6); // mais forte que o default (0.35) pra achar fácil, sem chegar em 1.0
    // (feedback 100% é um loop sem perda — o eco nunca cai abaixo do limiar e cada micro-oscilação
    // da cauda sustentada vira um "onset" falso).
    setar('echoSync', 1.0);
    setar('echoBeat', 3); // '1/8'
    setar('kickEchoOn', 1.0); // só o KICK alimenta o ECHO
    M._web_set_step(0, 0, 1); // um só ataque no compasso
    const bpmEco = 120;
    M._web_set_bpm(bpmEco);
    M._web_set_playing(1);
    const pcmEco = processar(Math.round(48000 * 1200 / 1000));
    M._web_set_playing(0);
    const onEco = onsetsPCM(pcmEco, 0.15, 160); // repetições a ~250 ms uma da outra (>160 ms descarta
    // a 2ª bossa do ataque do kick em si, ~65-100 ms depois da 1ª, sem descartar a repetição real)
    setar('echoMix', 0);
    setar('echoFeedback', 0.35);
    setar('echoSync', 0);
    setar('kickEchoOn', 0);
    M._web_set_step(0, 0, 0);

    // ---------- 3) kickRelease alto alonga a cauda do kick (RMS depois do note-off) ----------
    const renderRelease = (releaseVal, ms) => {
      setar('kickRelease', releaseVal);
      for (let i = 0; i < 16; i++) M._web_set_step(0, i, i === 0 ? 1 : 0);
      M._web_set_bpm(120);
      M._web_set_playing(1); // reinicia o playhead no passo 0: dispara o kick logo no 1º bloco
      const pcm = processar(Math.round(48000 * ms / 1000));
      M._web_set_playing(0);
      return { pico: pico(pcm), rms150_300: rms(pcm, 150, 300), rms300_500: rms(pcm, 300, 500) };
    };
    const releaseCurto = renderRelease(0.01, 900);
    const releaseLongo = renderRelease(2.0, 900);
    setar('kickRelease', 0.5);
    for (let i = 0; i < 16; i++) M._web_set_step(0, i, 0);

    return { onReto, onSwing, onEco, releaseCurto, releaseLongo };
  })()`);

  // ---------- 1) GROOVE: compara o onset de cada ataque (passos pares) entre STRAIGHT e SWING ----------
  console.log(`  groove: STRAIGHT ${offline.onReto.length} onsets ${offline.onReto.map((v) => v.toFixed(1)).join(',')}`);
  console.log(`  groove: SWING 8  ${offline.onSwing.length} onsets ${offline.onSwing.map((v) => v.toFixed(1)).join(',')}`);
  ok(offline.onReto.length >= 8 && offline.onSwing.length >= 8, `onsets suficientes pra comparar (retos ${offline.onReto.length}, swing ${offline.onSwing.length})`);
  // conta bem diferente já é sinal (a Swing 8 funde/aproxima pares de 16-avos, a Straight não); e
  // comparando índice a índice, os primeiros onsets do compasso já divergem em dezenas de ms.
  ok(offline.onReto.length !== offline.onSwing.length,
    `ABLETON SWING 8 muda quantos ataques de KICK sobrevivem no compasso em relação a STRAIGHT (retos ${offline.onReto.length}, swing ${offline.onSwing.length})`);
  const nGroove = Math.min(offline.onReto.length, offline.onSwing.length);
  const deltas = [];
  for (let i = 0; i < nGroove; i++) deltas.push(Math.abs(offline.onSwing[i] - offline.onReto[i]));
  const maiorDelta = deltas.length ? Math.max(...deltas) : 0;
  console.log(`  groove: deltas onset a onset (ms) = ${deltas.map((v) => v.toFixed(2)).join(', ')}`);
  ok(maiorDelta > 15, `ABLETON SWING 8 desloca o kick em relação a STRAIGHT (maior delta ${maiorDelta.toFixed(2)} ms, sample-accurate)`);

  // ---------- 2) ECHO: kickEchoOn + echoBeat 1/8 repete o kick a ~250 ms (120 BPM) ----------
  console.log(`  eco: onsets (ms) = ${offline.onEco.map((v) => v.toFixed(1)).join(', ')}`);
  ok(offline.onEco.length >= 3, `pelo menos 3 repetições captadas (kick + 2 ecos) (${offline.onEco.length})`);
  const iois = [];
  for (let i = 1; i < offline.onEco.length; i++) iois.push(offline.onEco[i] - offline.onEco[i - 1]);
  console.log(`  eco: intervalos entre onsets (ms) = ${iois.map((v) => v.toFixed(2)).join(', ')}`);
  const dentroDaFaixa = iois.filter((d) => Math.abs(d - 250) <= 15);
  ok(dentroDaFaixa.length >= 2, `repetições espaçadas em ~250 ms (1/8 a 120 BPM, sample-accurate) (${dentroDaFaixa.length} de ${iois.length} intervalos: ${iois.map((v) => v.toFixed(1)).join(', ')})`);

  // ---------- 3) RELEASE: kickRelease alto alonga a cauda (RMS 150-300 e 300-500 ms) ----------
  console.log(`  release: curto  pico=${offline.releaseCurto.pico.toFixed(3)} rms[150-300]=${offline.releaseCurto.rms150_300.toFixed(5)} rms[300-500]=${offline.releaseCurto.rms300_500.toFixed(5)}`);
  console.log(`  release: longo  pico=${offline.releaseLongo.pico.toFixed(3)} rms[150-300]=${offline.releaseLongo.rms150_300.toFixed(5)} rms[300-500]=${offline.releaseLongo.rms300_500.toFixed(5)}`);
  ok(offline.releaseLongo.rms150_300 > offline.releaseCurto.rms150_300 + 0.01 && offline.releaseLongo.rms300_500 > offline.releaseCurto.rms300_500 + 0.001,
    `kickRelease alto alonga a cauda do kick — RMS 150-300 ms (curto ${offline.releaseCurto.rms150_300.toFixed(5)} -> longo ${offline.releaseLongo.rms150_300.toFixed(5)}), RMS 300-500 ms (curto ${offline.releaseCurto.rms300_500.toFixed(5)} -> longo ${offline.releaseLongo.rms300_500.toFixed(5)})`);

  await s.clicar('#play');
  await s.esperar(300);
} finally {
  s.fechar();
}
console.log(falhas === 0 ? 'MOTOR: todos os testes passaram' : `${falhas} falhas`);
process.exit(falhas === 0 ? 0 : 1);
