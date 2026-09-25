// Seletor MENSAL | ANUAL nos preços (home) e na conta. Roda sem rede para o Supabase
// (Network.setBlockedURLs bloqueia *bwzngjvjxrqbalvoadpu.supabase.co*, via o helper
// bloquearHosts de cdp.mjs, chamado antes do Page.navigate): assim o teste não depende do
// banco ter (ou não) as colunas de período (migração do bloco "planos mensal e anual" ainda
// não rodou nesta task). Mesmo sem rede, dd-precos.js completa com PLANOS_PADRAO (a tabela
// da spec de 23/09) quando loadPlans() falha, então a pílula troca preço, off%, linha do
// período e href de verdade — não é decorativa.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { abrir } from './cdp.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(__dirname, '..');
const BASE = process.argv[2] || 'http://localhost:8123';
const BLOQUEIO = ['*bwzngjvjxrqbalvoadpu.supabase.co*'];
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'ok: ' : 'FAIL: ') + m); if (!c) falhas++; };

// ---------- (a)-(e): home em pt, sem rede ----------
{
  const s = await abrir(`${BASE}/index.html?lang=pt`, { largura: 1440, altura: 1400, bloquear: BLOQUEIO, porta: 9333 });
  try {
    await s.esperar(1000);

    const antes = await s.avaliar(`(() => {
      const opts = [...document.querySelectorAll('#period-switch .period-opt')];
      const solo = document.querySelector('.plan2[data-plan="solo"]');
      const nCards = document.querySelectorAll('.plan2').length;
      const ctas = [...document.querySelectorAll('.plan2 a.key')];
      return {
        nOpts: opts.length,
        annualSel: opts.find((b) => b.dataset.period === 'annual').classList.contains('sel'),
        soloAmount: solo.querySelector('.amount').textContent,
        soloCents: solo.querySelector('.cents').textContent,
        soloOffHidden: solo.querySelector('[data-economia]').hidden,
        soloOffTexto: solo.querySelector('[data-economia]').textContent.replace(/\\s/g, ' '),
        nCards,
        ctaHrefs: ctas.map((a) => a.getAttribute('href')),
        amountColor: getComputedStyle(solo.querySelector('.amount')).color,
        centsColor: getComputedStyle(solo.querySelector('.cents')).color,
      };
    })()`);
    ok(antes.nOpts === 2, `#period-switch tem 2 .period-opt (${antes.nOpts})`);
    // item 7 (24/09, pedido do Diogo): valor do plano em branco, sem o laranja/amarelo de alerta
    ok(antes.amountColor === 'rgb(255, 255, 255)', `.amount em branco (${antes.amountColor})`);
    ok(antes.centsColor === 'rgb(255, 255, 255)', `.cents em branco (${antes.centsColor})`);
    ok(antes.annualSel === true, 'a opção "annual" começa com .sel');
    // 25/09 (Diogo): só o Solo à venda. Anual 29,90/mês, mensal 39,90.
    ok(antes.nCards === 1, `só um card de plano na home, o Solo (${antes.nCards})`);
    // 25/09 (designer): a compra é laranja (mesma cor do Pagar da conta) e o card mostra o painel do plugin
    const oferta = await s.avaliar(`(() => { const c = document.querySelector('.plan2[data-plan="solo"]'); const b = c.querySelector('a.key');
      return { laranja: b.classList.contains('orange'), verde: b.classList.contains('green'), img: !!c.querySelector('.oferta-produto img[src*="painel-brdrum"]'),
               fecho: document.getElementById('close-buy-cta').classList.contains('orange'), txt: getComputedStyle(b).color }; })()`);
    ok(oferta.laranja && !oferta.verde && oferta.fecho, 'botões de compra da home em laranja, nenhum verde');
    // 25/09 (Diogo): a imagem do painel saiu do card da home (a demo tocável já está no topo); fica só na conta
    ok(!oferta.img, 'o card de preços da home não repete a imagem do painel');
    ok(oferta.txt === 'rgb(14, 14, 16)', `texto do botão em tinta sobre o laranja (${oferta.txt})`);
    ok(antes.soloAmount === '29' && antes.soloCents === ',90', `solo mostra 29,90 no anual (${antes.soloAmount}${antes.soloCents})`);
    ok(antes.soloOffHidden === false && antes.soloOffTexto === 'Economize R$ 120 em relação ao mensal', `economia do anual visível em reais (hidden=${antes.soloOffHidden} texto=${antes.soloOffTexto})`);
    ok(antes.ctaHrefs.length === 1 && antes.ctaHrefs.every((h) => h && h.includes('plano=solo') && h.includes('periodo=annual')), `o CTA tem plano=solo e periodo=annual no href (${antes.ctaHrefs.join(' | ')})`);

    await s.clicar('#period-switch .period-opt[data-period="monthly"]');
    await s.esperar(500);

    const depois = await s.avaliar(`(() => {
      const opts = [...document.querySelectorAll('#period-switch .period-opt')];
      const solo = document.querySelector('.plan2[data-plan="solo"]');
      const nCards = document.querySelectorAll('.plan2').length;
      const ctas = [...document.querySelectorAll('.plan2 a.key')];
      return {
        monthlySel: opts.find((b) => b.dataset.period === 'monthly').classList.contains('sel'),
        annualSel: opts.find((b) => b.dataset.period === 'annual').classList.contains('sel'),
        ariaMonthly: opts.find((b) => b.dataset.period === 'monthly').getAttribute('aria-selected'),
        soloAmount: solo.querySelector('.amount').textContent,
        soloCents: solo.querySelector('.cents').textContent,
        soloOffHidden: solo.querySelector('[data-economia]').hidden,
        soloLine: solo.querySelector('[data-period-line]').textContent,
        nCards,
        ctaHrefs: ctas.map((a) => a.getAttribute('href')),
        salvouStorage: localStorage.getItem('dd-period'),
      };
    })()`);
    ok(depois.monthlySel === true && depois.annualSel === false, 'clicar em "monthly" move a seleção da pílula');
    ok(depois.ariaMonthly === 'true', 'aria-selected acompanha o clique');
    ok(depois.salvouStorage === null, 'o período clicado não é guardado: a home sempre abre no anual');
    // mesmo sem rede pro Supabase, PLANOS_PADRAO (fallback local, tabela da spec) alimenta o
    // recálculo: a pílula não é decorativa.
    ok(depois.soloAmount === '39' && depois.soloCents === ',90',
      `no mensal o solo recalcula pra 39,90 mesmo sem rede (${depois.soloAmount}${depois.soloCents})`);
    ok(depois.soloOffHidden === true, 'no mensal a linha de economia some');
    ok(depois.soloLine.includes('vale 1 mês'), `a linha do período do solo é a de mensal (${depois.soloLine})`);
    ok(depois.ctaHrefs.every((h) => h && h.includes('periodo=monthly')), `o CTA passa a ter periodo=monthly no href (${depois.ctaHrefs.join(' | ')})`);
    ok(s.erros.length === 0, `sem console.error na home (${JSON.stringify(s.erros)})`);

    await s.clicar('#period-switch .period-opt[data-period="annual"]');
    await s.esperar(500);
    const volta = await s.avaliar(`(() => {
      const solo = document.querySelector('.plan2[data-plan="solo"]');
      return {
        amount: solo.querySelector('.amount').textContent, cents: solo.querySelector('.cents').textContent,
        offHidden: solo.querySelector('[data-economia]').hidden, offTexto: solo.querySelector('[data-economia]').textContent.replace(/\\s/g, ' '),
        href: solo.querySelector('a.key')?.getAttribute('href'),
      };
    })()`);
    ok(volta.amount === '29' && volta.cents === ',90', `voltando pro anual o solo mostra 29,90 de novo (${volta.amount}${volta.cents})`);
    ok(volta.offHidden === false && volta.offTexto === 'Economize R$ 120 em relação ao mensal', `voltando pro anual a economia volta (hidden=${volta.offHidden} texto=${volta.offTexto})`);
    ok(volta.href && volta.href.includes('periodo=annual'), `voltando pro anual o href do solo volta a periodo=annual (${volta.href})`);
  } finally { s.fechar(); }
}

// ---------- (f): home em en ----------
{
  const s = await abrir(`${BASE}/index.html?lang=en`, { largura: 1440, altura: 1400, bloquear: BLOQUEIO, porta: 9336 });
  try {
    await s.esperar(1000);
    const r = await s.avaliar(`(() => ({
      monthly: document.querySelector('#period-switch .period-opt[data-period="monthly"]').textContent.trim(),
      annual: document.querySelector('#period-switch .period-opt[data-period="annual"]').textContent.trim(),
    }))()`);
    ok(r.monthly === 'Monthly' && r.annual === 'Annual', `em ?lang=en a pílula lê Monthly/Annual (${r.monthly}/${r.annual})`);
    ok(s.erros.length === 0, `sem console.error na home em inglês (${JSON.stringify(s.erros)})`);
  } finally { s.fechar(); }
}

// ---------- (g): conta.html deslogado com plano e período na URL ----------
{
  const s = await abrir(`${BASE}/conta.html?plano=solo&periodo=monthly&lang=pt`, { largura: 1440, altura: 1400, bloquear: BLOQUEIO, porta: 9337 });
  try {
    await s.esperar(1000);
    const r = await s.avaliar(`(() => {
      const sw = document.getElementById('period-switch-conta');
      return {
        existe: !!sw,
        nOpts: sw ? sw.querySelectorAll('.period-opt').length : 0,
        viewAuthHidden: document.getElementById('view-auth').hidden,
        viewAccountHidden: document.getElementById('view-account').hidden,
      };
    })()`);
    ok(r.existe && r.nOpts === 2, `#period-switch-conta existe com 2 opções (${r.nOpts})`);
    // deslogado: a tela de entrar aparece e a conta (onde mora a pílula) fica escondida atrás do
    // login — pintarSeletorConta() só roda depois de logar (dentro de pintarCompra()), por isso
    // a pílula da conta só reflete o ?periodo= da URL depois que a pessoa entra.
    ok(r.viewAuthHidden === false && r.viewAccountHidden === true, 'deslogado: tela de entrar visível, conta escondida');
    ok(s.erros.length === 0, `sem console.error na conta deslogada (${JSON.stringify(s.erros)})`);
  } finally { s.fechar(); }
}

// ---------- (h): conta.html?renovar=1 ----------
{
  const s = await abrir(`${BASE}/conta.html?renovar=1`, { largura: 1440, altura: 1400, bloquear: BLOQUEIO, porta: 9338 });
  try {
    await s.esperar(1000);
    ok(s.erros.length === 0, `?renovar=1 sem console.error (${JSON.stringify(s.erros)})`);
  } finally { s.fechar(); }
}

// ---------- (i): cupom grátis (24/09) — asserção estática, sem servidor nem login ----------
{
  const i18n = readFileSync(join(RAIZ, 'dd-i18n.js'), 'utf8');
  const admin = readFileSync(join(RAIZ, 'admin.html'), 'utf8');
  const blocoPt = i18n.slice(0, i18n.indexOf('\n  en: {'));
  const blocoEn = i18n.slice(i18n.indexOf('\n  en: {'));
  ok(/'conta\.ativar-gratis':\s*'Ativar grátis'/.test(blocoPt), "dd-i18n.js (pt) tem 'conta.ativar-gratis'");
  ok(/'conta\.ativar-gratis':\s*'Activate for free'/.test(blocoEn), "dd-i18n.js (en) tem 'conta.ativar-gratis'");
  ok(admin.includes('12+ caracteres e usos máximos obrigatórios'), 'admin.html tem a legenda do cupom grátis');
}

// ---------- (j): Task 3 (F6) — estadoFaixaFinal(lic, plans, lang), função pura da faixa final ----------
// Sem DOM disponível em Node puro (dd-precos.js roda pintarTudo() ao importar, que mexe em
// document): a função é testada dentro da página via import() dinâmico, igual ao módulo já
// carregado por index.html.
{
  const s = await abrir(`${BASE}/index.html`, { largura: 1440, altura: 900, bloquear: BLOQUEIO, porta: 9339 });
  try {
    await s.esperar(500);
    const r = await s.avaliar(`(async () => {
      const { estadoFaixaFinal } = await import('/dd-precos.js?v=20260925h');
      const plans = [{ id: 'studio', name: 'Studio', seats: 3 }];
      const futuro = new Date(Date.now() + 30 * 86400000).toISOString();
      const passado = new Date(Date.now() - 5 * 86400000).toISOString();
      return {
        semLic: estadoFaixaFinal(null, plans, 'pt'),
        ativaComPrazo: estadoFaixaFinal({ seats: 3, expires_at: futuro }, plans, 'pt'),
        perpetua: estadoFaixaFinal({ seats: 3, expires_at: null }, plans, 'pt'),
        vencida: estadoFaixaFinal({ seats: 3, expires_at: passado }, plans, 'pt'),
        vencidaEn: estadoFaixaFinal({ seats: 3, expires_at: passado }, plans, 'en'),
      };
    })()`);
    ok(r.semLic.modo === 'comprar', `estadoFaixaFinal sem lic: modo comprar (${r.semLic.modo})`);
    ok(r.ativaComPrazo.modo === 'licenca' && r.ativaComPrazo.texto.includes('Studio') && r.ativaComPrazo.texto.includes('vale até'),
      `estadoFaixaFinal ativa com prazo: licença com data (${r.ativaComPrazo.texto})`);
    ok(r.ativaComPrazo.legenda.includes('Baixe ao lado'), `estadoFaixaFinal ativa com prazo: legenda de licença (${r.ativaComPrazo.legenda})`);
    ok(r.perpetua.modo === 'licenca' && r.perpetua.texto === 'Sua licença Studio não tem prazo', `estadoFaixaFinal perpétua: sem prazo (${r.perpetua.texto})`);
    ok(r.vencida.modo === 'renovar' && r.vencida.texto === 'Renovar Studio' && r.vencida.href === 'conta.html?renovar=1#licenca',
      `estadoFaixaFinal vencida: botão Renovar (${JSON.stringify(r.vencida)})`);
    ok(r.vencidaEn.texto === 'Renew Studio', `estadoFaixaFinal vencida (en): "Renew Studio" (${r.vencidaEn.texto})`);
    ok(s.erros.length === 0, `sem console.error na home (${JSON.stringify(s.erros)})`);
  } finally { s.fechar(); }
}

console.log(falhas === 0 ? 'precos ok' : `${falhas} falhas`);
process.exit(falhas === 0 ? 0 : 1);
