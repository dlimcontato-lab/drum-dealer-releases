import { abrir } from './cdp.mjs';
const BASE = process.argv[2] || 'http://localhost:8123';
let falhas = 0; const ok = (c, m) => { console.log((c ? 'ok: ' : 'FAIL: ') + m); if (!c) falhas++; };
const SESS = JSON.stringify({ access_token: 'x', refresh_token: 'y', expires_at: Math.floor(Date.now() / 1000) + 3000, user: { id: '00000000-0000-4000-8000-000000000001', email: 'teste@example.com' } });
const D = 864e5;
function simular({ estado, lic }) {
  return `localStorage.setItem('dd.session', ${JSON.stringify(SESS)});
    localStorage.setItem('dd.presente', JSON.stringify({ code: 'ABCDE12345', days: 5, expires_at: new Date(Date.now() + 2 * ${D}).toISOString() }));
    const f = window.fetch.bind(window);
    const J = (b, st = 200) => Promise.resolve(new Response(JSON.stringify(b), { status: st, headers: { 'Content-Type': 'application/json' } }));
    window.__claims = 0; window.__quotes = [];
    window.fetch = (u, o) => {
      u = String(u);
      if (u.includes('/functions/v1/presente')) {
        const b = JSON.parse(o.body);
        if (b.action === 'status') return J(${JSON.stringify(estado)});
        if (b.action === 'claim') { window.__claims++; return J({ ok: true, days: 5, expires_at: new Date(Date.now() + 5 * ${D}).toISOString(), coupon: { code: 'VOLTA20ABCDEF12', valid_from: new Date(Date.now() + 5 * ${D}).toISOString(), valid_until: new Date(Date.now() + 12 * ${D}).toISOString() } }); }
      }
      if (u.includes('/functions/v1/quote')) { const b = JSON.parse(o.body); window.__quotes.push(b.coupon_code || ''); return J({ kind: 'ok', final_cents: b.coupon_code ? 3192 : 3990, list_price_cents: 3990, discount_cents: b.coupon_code ? 798 : 0, price_cents: 3990 }); }
      if (u.includes('/rest/v1/licenses')) return J(${JSON.stringify(lic)});
      if (u.includes('/rest/v1/plans')) return J([{ id: 'solo', name: 'Solo', seats: 1, price_cents: 3990, monthly_cents: 3990, annual_month_cents: 2990, annual_cents: 35880, promo_price_cents: null, promo_starts_at: null, promo_ends_at: null, badge: null, sort: 1 }]);
      if (u.includes('/rest/v1/')) return J([]);
      if (u.includes('/auth/v1/user')) return J({ id: '00000000-0000-4000-8000-000000000001', email: 'teste@example.com' });
      return f(u, o);
    };`;
}
async function cenario(nome, cfg, porta, verificar) {
  const s = await abrir('about:blank', { largura: 1280, altura: 1000, porta });
  try {
    await s.cmd('Page.addScriptToEvaluateOnNewDocument', { source: simular(cfg) });
    await s.cmd('Page.navigate', { url: BASE + '/conta.html?presente=ABCDE12345#licenca' }); await s.esperar(4000);
    await verificar(s);
    ok(s.erros.length === 0, `[${nome}] sem erro no console ` + JSON.stringify(s.erros));
  } finally { s.fechar(); }
}
await cenario('nunca', { estado: { estado: 'nunca', trial_expires_at: null, coupon: null }, lic: [] }, 9621, async (s) => {
  ok(await s.avaliar(`!document.getElementById('panel-presente').hidden`), '[nunca] painel do presente aparece');
  ok((await s.avaliar(`document.getElementById('panel-presente').textContent`)).includes('5 dias'), '[nunca] mostra os dias do presente');
  await s.clicar('#btn-ativar-presente'); await s.esperar(2500);
  ok(await s.avaliar(`window.__claims`) === 1, '[nunca] Ativar teste chama o claim uma vez');
  ok(await s.avaliar(`localStorage.getItem('dd.presente') === null`), '[nunca] presente sai do navegador depois de ativado');
});
await cenario('ativo', { estado: { estado: 'ativo', trial_expires_at: new Date(Date.now() + 3 * D).toISOString(), coupon: null },
  lic: [{ id: 'l1', seats: 1, status: 'active', created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 3 * D).toISOString(), period: 'trial' }] }, 9622, async (s) => {
  ok(await s.avaliar(`document.getElementById('panel-presente').hidden`), '[ativo] painel de ativar não aparece');
  ok((await s.avaliar(`document.getElementById('lic-text').textContent`)).includes('Teste grátis'), '[ativo] licença diz Teste grátis');
  ok(await s.avaliar(`document.getElementById('buy-title').textContent`) === 'Licença BRDRUM', '[ativo] compra não fala em renovar/upgrade');
  ok(await s.avaliar(`document.querySelector('#slots .free .key') === null`), '[ativo] sem "Nova chave" na vaga livre');
  ok(await s.avaliar(`!document.querySelector('#lic-acts .key')`), '[ativo] sem botão Renovar');
  ok((await s.avaliar(`document.getElementById('buy-text').textContent`)).includes('soma o período'), '[ativo] buy-text fala em somar o período do teste');
});
await cenario('vencido-com-desconto', { estado: { estado: 'vencido', trial_expires_at: new Date(Date.now() - D).toISOString(), coupon: { code: 'VOLTA20ABCDEF12', valid_from: new Date(Date.now() - D).toISOString(), valid_until: new Date(Date.now() + 6 * D).toISOString(), usado: false } },
  lic: [{ id: 'l1', seats: 1, status: 'active', created_at: new Date().toISOString(), expires_at: new Date(Date.now() - D).toISOString(), period: 'trial' }] }, 9623, async (s) => {
  ok((await s.avaliar(`document.getElementById('presente-desconto').textContent`)).includes('20%'), '[vencido] aviso de 20% aparece');
  ok(await s.avaliar(`document.getElementById('cupom').value`) === 'VOLTA20ABCDEF12', '[vencido] cupom pessoal preenchido');
  ok((await s.avaliar(`window.__quotes`)).includes('VOLTA20ABCDEF12'), '[vencido] a cotação foi refeita com o cupom (Pagar com 20%)');
  ok(await s.avaliar(`document.querySelector('#slots .free .key') === null`), '[vencido-com-desconto] sem "Nova chave" na vaga livre');
  ok(await s.avaliar(`!document.querySelector('#lic-acts .key')`), '[vencido-com-desconto] sem botão Renovar');
  ok(!(await s.avaliar(`document.getElementById('buy-text').textContent`)).includes('soma o período'), '[vencido-com-desconto] buy-text não fala em somar o período (teste já acabou)');
});
await cenario('vencido-sem-desconto', { estado: { estado: 'vencido', trial_expires_at: new Date(Date.now() - 20 * D).toISOString(), coupon: { code: 'VOLTA20ABCDEF12', valid_from: new Date(Date.now() - 20 * D).toISOString(), valid_until: new Date(Date.now() - 13 * D).toISOString(), usado: false } },
  lic: [{ id: 'l1', seats: 1, status: 'active', created_at: new Date().toISOString(), expires_at: new Date(Date.now() - 20 * D).toISOString(), period: 'trial' }] }, 9624, async (s) => {
  ok(await s.avaliar(`document.getElementById('presente-desconto').hidden`), '[vencido sem desconto] sem aviso de 20%');
  ok(await s.avaliar(`document.getElementById('cupom').value`) === '', '[vencido sem desconto] cupom não preenchido');
  ok(await s.avaliar(`document.querySelector('#slots .free .key') === null`), '[vencido-sem-desconto] sem "Nova chave" na vaga livre');
  ok(await s.avaliar(`!document.querySelector('#lic-acts .key')`), '[vencido-sem-desconto] sem botão Renovar');
});
process.exitCode = falhas;
if (!falhas) console.log('presente-conta ok');
