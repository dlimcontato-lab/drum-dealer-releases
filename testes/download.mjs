// Bug real (24/09, relato do Diogo): "Baixar para Mac" na conta não baixava nada — a.click()
// disparado programático fora do gesto do usuário (depois de um await) é descartado pelo Safari
// e por bloqueadores de pop-up, e a.download é ignorado em URL de outra origem (github.com com
// redirect pra objects.githubusercontent.com). Este teste confere só o que dá pra confirmar sem
// login de verdade (deslogado): os 4 botões da home apontam pra conta.html?baixar=; conta.html
// deslogado com ?baixar= mostra o aviso pedindo conta; e o bloco "Instaladores" (só visível
// logado, mas presente no DOM) aponta direto pros .zip da release. O fluxo logado (aviso neutro +
// clique cedo + link permanente de fallback, em depoisDoLogin/conta.js) foi conferido por leitura
// de código, não por este teste — precisa de uma sessão de verdade pra simular.
import { abrir } from './cdp.mjs';

const BASE = process.argv[2] || 'http://localhost:8123';
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'ok: ' : 'FAIL: ') + m); if (!c) falhas++; };

// ---------- home deslogada: os 4 botões .dl[data-baixar] vão pra conta.html?baixar=... ----------
{
  const s = await abrir(`${BASE}/index.html`, { largura: 1400, altura: 900, porta: 9460 });
  try {
    await s.esperar(600);
    const hrefs = await s.avaliar(`[...document.querySelectorAll('.dl[data-baixar]')].map((a) => a.getAttribute('href'))`);
    ok(hrefs.length === 4, `4 botões .dl[data-baixar] na home (${hrefs.length})`);
    ok(hrefs.every((h) => h === 'conta.html?baixar=mac' || h === 'conta.html?baixar=win'),
      `todos apontam pra conta.html?baixar=mac|win, deslogado (${JSON.stringify(hrefs)})`);
  } finally { s.fechar(); }
}

// ---------- conta.html deslogado com ?baixar=mac|win: pede login, nunca baixa sozinho ----------
for (const sistema of ['mac', 'win']) {
  const c = await abrir(`${BASE}/conta.html?baixar=${sistema}`, { largura: 1400, altura: 900, porta: sistema === 'mac' ? 9461 : 9462 });
  try {
    await c.esperar(800);
    const r = await c.avaliar(`(() => ({
      authVisivel: !document.getElementById('view-auth').hidden,
      accountEscondido: document.getElementById('view-account').hidden,
      aviso: document.getElementById('aviso').textContent,
    }))()`);
    ok(r.authVisivel && r.accountEscondido, `?baixar=${sistema} deslogado: mostra a tela de entrar/criar conta, não a de conta`);
    ok(r.aviso.length > 0, `?baixar=${sistema} deslogado: mostra um aviso pedindo conta (${JSON.stringify(r.aviso)})`);
  } finally { c.fechar(); }
}

// ---------- bloco "Instaladores" (conta.html, pane-perfil): link direto termina em .zip ----------
{
  const c = await abrir(`${BASE}/conta.html`, { largura: 1400, altura: 900, porta: 9463 });
  try {
    await c.esperar(600);
    const links = await c.avaliar(`[...document.querySelectorAll('a[href*="BRDRUM-macOS"],a[href*="BRDRUM-Windows"]')].map((a) => a.getAttribute('href'))`);
    ok(links.length === 2, `2 links diretos no bloco Instaladores (${links.length})`);
    ok(links.every((h) => h.endsWith('.zip')), `os links diretos terminam em .zip, não .pkg/.exe soltos (${JSON.stringify(links)})`);
  } finally { c.fechar(); }
}

console.log(falhas === 0 ? 'DOWNLOAD: todos os testes passaram' : `${falhas} falhas`);
process.exit(falhas === 0 ? 0 : 1);
