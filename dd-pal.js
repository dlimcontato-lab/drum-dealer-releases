// O Pal na tela de pixels: o cérebro e os quadros são os do plugin (pal::Brain e pal::compose no WASM,
// instância "espelho" da thread principal). Aqui só chegam os Inputs e sai o quadro, a 30 Hz.
const DT = 1 / 30;
const EVENTOS = { click: 0, decision: 1, rand: 2, play: 3, stop: 4 };

export function criarPal({ espelho: M, pixels, aparelho, lerEntradas, pixelScreen }) {
  M._web_pal_reset(0);
  const entrada = M._malloc(15 * 4);
  const saida = M._malloc(260);
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mouse = { nx: 0, ny: 0, dentro: false };
  let ultimoQuadro = '';

  // O olhar mira o CENTRO DA TELA DE LED (o rosto do Pal), não o centro do painel inteiro —
  // mesma regra do plugin (Source/UiLayout.h: kPalGazeCx/Cy = centro de kPixelScreen,
  // kPalGazeReachX/Y = 400/240). pixelScreen vem de painel/layout.json, nunca constante fixa.
  const [psx, psy, psw, psh] = pixelScreen;
  const gazeCx = psx + psw / 2;
  const gazeCy = psy + psh / 2;
  const REACH_X = 400;
  const REACH_Y = 240;

  aparelho.addEventListener('pointermove', (e) => {
    const r = aparelho.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 1600;
    const y = ((e.clientY - r.top) / r.height) * 1126;
    mouse.nx = Math.max(-1, Math.min(1, (x - gazeCx) / REACH_X));
    mouse.ny = Math.max(-1, Math.min(1, (y - gazeCy) / REACH_Y));
    mouse.dentro = true;
  });
  aparelho.addEventListener('pointerleave', () => { mouse.dentro = false; });

  function passo() {
    const e = lerEntradas();
    const f = M.HEAPF32;
    const o = entrada / 4;
    f[o] = e.tocando ? 1 : 0;
    f[o + 1] = e.beat;
    f[o + 2] = mouse.nx;
    f[o + 3] = mouse.ny;
    f[o + 4] = mouse.dentro ? 1 : 0;
    f[o + 5] = e.masterDb;
    for (let i = 0; i < 6; i++) f[o + 6 + i] = e.vols[i];
    for (let i = 0; i < 3; i++) f[o + 12 + i] = e.fx[i];
    M._web_pal_tick(DT, entrada);
  }

  function pinta() {
    M._web_pal_frame(saida, reduzido.matches ? 1 : 0);
    const texto = String.fromCharCode(...M.HEAPU8.subarray(saida, saida + 260));
    if (texto === ultimoQuadro) return;
    ultimoQuadro = texto;
    for (let k = 0; k < 260; k++) {
      const c = texto[k];
      pixels[k].className = c === '#' ? 'on' : c === 'o' ? 'furo' : '';
    }
  }

  let acumulado = 0;
  let ultimo = performance.now();
  function laco(agora) {
    acumulado += Math.min(1, (agora - ultimo) / 1000);   // aba escondida não acumula mais de 1 s
    ultimo = agora;
    let n = 0;
    while (acumulado >= DT && n < 30) { passo(); acumulado -= DT; n++; }
    if (n > 0) pinta();
    requestAnimationFrame(laco);
  }
  requestAnimationFrame(laco);
  pinta();

  return {
    evento(nome) { if (nome in EVENTOS) M._web_pal_event(EVENTOS[nome]); },
    estado: () => M._web_pal_state(),
    quadro: () => ultimoQuadro,
    avancar(segundos) { for (let i = 0; i < Math.round(segundos * 30); i++) passo(); pinta(); },
    mouseNormalizado: () => ({ nx: mouse.nx, ny: mouse.ny }),   // só leitura, pra teste (testes/pal.mjs)
  };
}
