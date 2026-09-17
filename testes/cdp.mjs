// Chrome headless pelo DevTools Protocol, sem dependência: o Node 26 já tem fetch e WebSocket.
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

export async function abrir(url, { largura = 1680, altura = 1400, movel = false, reduzido = false, porta = 9333 } = {}) {
  const perfil = mkdtempSync(join(tmpdir(), 'brdrum-cdp-'));
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${porta}`, `--user-data-dir=${perfil}`,
    `--window-size=${largura},${altura}`, '--autoplay-policy=no-user-gesture-required', '--hide-scrollbars',
    '--no-first-run', 'about:blank'], { stdio: 'ignore' });

  let alvos = null;
  for (let i = 0; i < 80 && !alvos; i++) {
    try { alvos = await (await fetch(`http://127.0.0.1:${porta}/json`)).json(); } catch { await esperar(100); }
  }
  if (!alvos) { chrome.kill(); throw new Error('o Chrome não abriu a porta de depuração'); }
  const pagina = alvos.find((a) => a.type === 'page');
  const ws = new WebSocket(pagina.webSocketDebuggerUrl);
  await new Promise((ok, erro) => { ws.onopen = ok; ws.onerror = erro; });

  let seq = 0;
  const pendentes = new Map();
  const ouvintes = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pendentes.has(m.id)) { pendentes.get(m.id)(m); pendentes.delete(m.id); }
    else ouvintes.forEach((f) => f(m));
  };
  const cmd = (method, params = {}) => new Promise((ok, erro) => {
    const id = ++seq;
    pendentes.set(id, (m) => (m.error ? erro(new Error(`${method}: ${m.error.message}`)) : ok(m.result)));
    ws.send(JSON.stringify({ id, method, params }));
  });

  await cmd('Page.enable');
  await cmd('Runtime.enable');
  if (movel) await cmd('Emulation.setDeviceMetricsOverride', { width: largura, height: altura, deviceScaleFactor: 2, mobile: true });
  if (reduzido) await cmd('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const carregou = new Promise((ok) => ouvintes.push((m) => { if (m.method === 'Page.loadEventFired') ok(); }));
  await cmd('Page.navigate', { url });
  await carregou;

  const avaliar = async (expr) => {
    const r = await cmd('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true, userGesture: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const print = async (arquivo, seletor) => {
    const clip = seletor ? await avaliar(`(() => { const r = document.querySelector(${JSON.stringify(seletor)}).getBoundingClientRect();
      return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height, scale: 1 }; })()`) : undefined;
    const r = await cmd('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, ...(clip ? { clip } : {}) });
    writeFileSync(arquivo, Buffer.from(r.data, 'base64'));
  };
  // Clique de verdade (passa pelo hit-test, ao contrário de element.click()): no centro do elemento
  const clicar = async (seletor) => {
    const p = await avaliar(`(() => { const n = document.querySelector(${JSON.stringify(seletor)}); n.scrollIntoView({ block: 'center', inline: 'center' });
      const r = n.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
    for (const type of ['mousePressed', 'mouseReleased'])
      await cmd('Input.dispatchMouseEvent', { type, x: p.x, y: p.y, button: 'left', clickCount: 1 });
    return p;
  };
  const fechar = () => { try { ws.close(); } catch { /* já fechado */ } chrome.kill(); };
  return { avaliar, print, clicar, esperar, fechar, cmd };
}
