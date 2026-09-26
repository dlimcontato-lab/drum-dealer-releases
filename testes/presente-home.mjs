// Janela do presente na home, servidor simulado. O cdp.mjs abre headless (navigator.webdriver
// = true), então os cenários de "pessoa" desligam o webdriver e trocam o UA antes de navegar.
import { abrir } from './cdp.mjs';
const BASE = process.argv[2] || 'http://localhost:8123';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
let falhas = 0; const ok = (c, m) => { console.log((c ? 'ok: ' : 'FAIL: ') + m); if (!c) falhas++; };
const PESSOA = `Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false });`;
const SERVIDOR = `
  const f = window.fetch.bind(window);
  const J = (b, st = 200) => Promise.resolve(new Response(JSON.stringify(b), { status: st, headers: { 'Content-Type': 'application/json' } }));
  window.fetch = (u, o) => {
    u = String(u);
    if (u.includes('/functions/v1/presente')) return J({ code: 'ABCDE12345', days: 5, expires_at: new Date(Date.now() + 172800000).toISOString() });
    if (u.includes('/rest/v1/licenses')) return J(window.__lics || []);
    return f(u, o);
  };`;
async function pessoa(porta, extra = '') {
  const s = await abrir('about:blank', { largura: 1280, altura: 900, porta });
  await s.cmd('Emulation.setUserAgentOverride', { userAgent: UA });
  await s.cmd('Page.addScriptToEvaluateOnNewDocument', { source: PESSOA + SERVIDOR + extra });
  return s;
}
const verPrecos = async (s) => { await s.avaliar(`(document.getElementById('precos').scrollIntoView(), 1)`); await s.esperar(2500); };

// 1) visitante: abre por interesse, gira, guarda, não repete no mesmo dia
{ const s = await pessoa(9611);
  try {
    await s.cmd('Page.navigate', { url: BASE + '/index.html?lang=pt' }); await s.esperar(2500);
    ok(await s.avaliar(`!document.getElementById('presente').open`), 'não abre sozinha no carregamento');
    await verPrecos(s);
    ok(await s.avaliar(`document.getElementById('presente').open`), 'abre quando Adquirir aparece');
    ok(await s.avaliar(`document.querySelectorAll('#presente .presente-step').length`) === 7, '7 casas (1 a 7 dias)');
    ok(!(await s.avaliar(`document.getElementById('presente').textContent.toLowerCase().includes('sorteio')`)), 'sem a palavra sorteio');
    await s.clicar('#presente-girar'); await s.esperar(4500);
    const r = await s.avaliar(`(() => ({ ganho: document.querySelector('#presente .presente-step.ganho')?.dataset.dias, href: document.getElementById('presente-ativar').getAttribute('href'), salvo: localStorage.getItem('dd.presente') }))()`);
    ok(r.ganho === '5', `a luz para no prêmio do servidor (${r.ganho})`);
    ok(r.href === 'conta.html?presente=ABCDE12345#licenca', `botão leva à conta com o código (${r.href})`);
    ok(JSON.parse(r.salvo || '{}').code === 'ABCDE12345', 'presente guardado no navegador');
    await s.avaliar(`(document.getElementById('presente').close(), 1)`);
    await s.cmd('Page.reload'); await s.esperar(2500); await verPrecos(s);
    ok(await s.avaliar(`!document.getElementById('presente').open`), 'não abre de novo no mesmo dia');
    ok(s.erros.length === 0, 'sem erro no console ' + JSON.stringify(s.erros));
  } finally { s.fechar(); } }

// 2) cliente com licença ativa não vê
{ const lic = `window.__lics = [{ status: 'active', expires_at: new Date(Date.now() + 20 * 864e5).toISOString(), period: 'monthly' }];
    localStorage.setItem('dd.session', JSON.stringify({ access_token: 'x', refresh_token: 'y', expires_at: Math.floor(Date.now() / 1000) + 3000, user: { id: '00000000-0000-4000-8000-000000000001', email: 't@example.com' } }));`;
  const s = await pessoa(9613, lic);
  try {
    await s.cmd('Page.navigate', { url: BASE + '/index.html?lang=pt' }); await s.esperar(2500); await verPrecos(s);
    ok(await s.avaliar(`!document.getElementById('presente').open`), 'cliente com licença ativa não vê a janela');
  } finally { s.fechar(); } }

// 3) quem já teve teste (licença period trial, mesmo vencida) não vê
{ const lic = `window.__lics = [{ status: 'active', expires_at: new Date(Date.now() - 864e5).toISOString(), period: 'trial' }];
    localStorage.setItem('dd.session', JSON.stringify({ access_token: 'x', refresh_token: 'y', expires_at: Math.floor(Date.now() / 1000) + 3000, user: { id: '00000000-0000-4000-8000-000000000001', email: 't@example.com' } }));`;
  const s = await pessoa(9614, lic);
  try {
    await s.cmd('Page.navigate', { url: BASE + '/index.html?lang=pt' }); await s.esperar(2500); await verPrecos(s);
    ok(await s.avaliar(`!document.getElementById('presente').open`), 'quem já teve teste não vê a janela');
  } finally { s.fechar(); } }

// 4) robô (headless puro) não vê
{ const s = await abrir(BASE + '/index.html?lang=pt', { largura: 1280, altura: 900, porta: 9612 });
  try { await s.esperar(2000); await verPrecos(s);
    ok(await s.avaliar(`!document.getElementById('presente').open`), 'robô/headless não vê a janela');
  } finally { s.fechar(); } }

// 5) rola até #precos assim que a página existe (ainda no reflow dos ~500ms) e fica: a presença
// sustentada (1500ms contínuos) não é derrubada pelo salto de layout e abre dentro de uns 4s
{ const s = await pessoa(9615);
  try {
    await s.cmd('Page.navigate', { url: BASE + '/index.html?lang=pt' });
    for (let i = 0; i < 50; i++) { if (await s.avaliar(`!!document.getElementById('precos')`)) break; await s.esperar(20); }
    await s.avaliar(`(document.getElementById('precos').scrollIntoView(), 1)`);
    const t0 = Date.now();
    let abriu = false;
    while (Date.now() - t0 < 4000) {
      if (await s.avaliar(`document.getElementById('presente').open`)) { abriu = true; break; }
      await s.esperar(100);
    }
    ok(abriu, 'rola cedo e fica: presença sustentada abre em até 4s');
    ok(s.erros.length === 0, 'sem erro no console ' + JSON.stringify(s.erros));
  } finally { s.fechar(); } }

process.exitCode = falhas;
if (!falhas) console.log('presente-home ok');
