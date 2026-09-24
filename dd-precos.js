// Preços da home: os valores no HTML são o placeholder; a tabela `plans` manda.
// Seletor MENSAL | ANUAL (referência de 23/09): o anual é o padrão. A etiqueta -N% é a
// economia do anual sobre o mensal; o bullet "% por computador em relação ao Solo" é
// calculado do período mostrado. Quem já tem licença vê Renovar/Upgrade/Seu plano.
import { loadPlans, getSession, select, quote, precosDoPlano, emPromocao, BRL } from './dd-api.js?v=20260924b';
import { t, seatsLabel, fmtBRLCompact } from './dd-i18n.js';

let periodo = 'annual';
try { const s = localStorage.getItem('dd-period'); if (s === 'monthly' || s === 'annual') periodo = s; } catch { /* sem storage */ }

// Fallback sem rede e completação enquanto o banco não tem as colunas novas (migração 0004).
// Os valores são a tabela da spec de 23/09; quem cobra é o servidor, aqui é só para mostrar.
const PLANOS_PADRAO = [
  { id: 'solo',   name: 'SOLO',   seats: 1, price_cents: 4999,  monthly_cents: 4999,  annual_month_cents: 3990,  annual_cents: 47880,  badge: null,          sort: 1 },
  { id: 'studio', name: 'STUDIO', seats: 3, price_cents: 12999, monthly_cents: 12999, annual_month_cents: 10990, annual_cents: 131880, badge: 'RECOMENDADO', sort: 2 },
  { id: 'team',   name: 'EQUIPE', seats: 5, price_cents: 20999, monthly_cents: 20999, annual_month_cents: 17999, annual_cents: 215988, badge: null,          sort: 3 },
];
function completar(p) {
  const base = PLANOS_PADRAO.find((x) => x.id === p.id) || {};
  return { ...p,
    monthly_cents: p.monthly_cents ?? base.monthly_cents ?? p.price_cents,
    annual_month_cents: p.annual_month_cents ?? base.annual_month_cents ?? p.price_cents,
    annual_cents: p.annual_cents ?? base.annual_cents ?? ((p.annual_month_cents ?? base.annual_month_cents ?? p.price_cents) * 12) };
}

function pintarPreco(card, cents) {
  const inteiro = Math.floor(cents / 100), resto = cents % 100;
  card.querySelector('.amount').textContent = String(inteiro);
  card.querySelector('.cents').textContent = resto ? ',' + String(resto).padStart(2, '0') : '';
}

function precoMostrado(p) {
  const v = precosDoPlano(p);
  return periodo === 'annual' ? v.anualMes : v.mensal;
}

function pintarSeletor() {
  for (const b of document.querySelectorAll('#period-switch .period-opt')) {
    const on = b.dataset.period === periodo;
    b.classList.toggle('sel', on);
    b.setAttribute('aria-selected', on ? 'true' : 'false');
  }
}

async function pintarTudo() {
  pintarSeletor();
  let plans;
  try { plans = (await loadPlans()).map(completar); } catch { plans = PLANOS_PADRAO; }

  const solo = plans.find((p) => p.seats === 1) || plans[0];
  const porComputadorSolo = solo ? precoMostrado(solo) / solo.seats : 0;
  for (const p of plans) {
    const card = document.querySelector(`.plan2[data-plan="${p.id}"]`);
    if (!card) continue;
    const v = precosDoPlano(p);
    const cents = precoMostrado(p);
    pintarPreco(card, cents);
    card.querySelector('.per-seat').textContent = fmtBRLCompact(cents / p.seats);
    card.querySelector('.seats-n').textContent = seatsLabel(p.seats);
    card.querySelector('[data-period-line]').textContent = periodo === 'annual'
      ? t('plans.period-line-annual', { total: BRL(v.anualTotal) })
      : t('plans.period-line-monthly');
    const off = card.querySelector('.off');
    if (off) {
      const pct = v.mensal > 0 ? Math.round((1 - v.anualMes / v.mensal) * 100) : 0;
      off.hidden = !(periodo === 'annual' && pct > 0);
      off.textContent = t('plans.off-annual', { pct });
    }
    const li = card.querySelector('[data-li-desconto]');
    if (li) {
      const pct = porComputadorSolo > 0 ? Math.round((1 - (cents / p.seats) / porComputadorSolo) * 100) : 0;
      li.hidden = pct <= 0;
      li.innerHTML = t('plans.li-desconto-solo-html', { pct });
    }
    const linha = card.querySelector('.per-line');
    const wasWrap = linha && linha.querySelector('.was-wrap');
    if (wasWrap) wasWrap.remove();
    if (periodo === 'monthly' && emPromocao({ ...p, price_cents: p.monthly_cents ?? p.price_cents }) && linha) {
      const w = document.createElement('span');
      w.className = 'was-wrap';
      w.innerHTML = `<span class="was">${BRL(p.monthly_cents ?? p.price_cents)}</span> · `;
      linha.prepend(w);
    }
    // pintarTudo roda a cada clique na pílula: o CTA original fica guardado e é
    // restaurado antes de qualquer troca por botão desabilitado
    let cta = card.querySelector('.key');
    if (cta && !card.dataset.ctaHtml) card.dataset.ctaHtml = cta.outerHTML;
    if (cta && card.dataset.ctaHtml && cta.tagName !== 'A') {
      cta.outerHTML = card.dataset.ctaHtml;
      cta = card.querySelector('.key');
    }
    if (cta) cta.href = `conta.html?plano=${p.id}&periodo=${periodo}`;
  }

  const s = await getSession();
  if (!s) return;

  let lic = null;
  try {
    const lics = await select('licenses', 'select=id,seats,status,expires_at&limit=1');
    lic = lics.find((l) => l.status === 'active') || null;
  } catch { /* sessão velha: segue como visitante */ }
  if (!lic) return;
  const vencida = !!lic.expires_at && Date.parse(lic.expires_at) < Date.now();
  const perpetua = !lic.expires_at;

  for (const p of plans) {
    const card = document.querySelector(`.plan2[data-plan="${p.id}"]`);
    if (!card) continue;
    const cta = card.querySelector('.key');
    if (!cta) continue;
    const desabilita = (texto) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'key'; b.disabled = true; b.textContent = texto;
      cta.replaceWith(b);
    };
    if (perpetua && p.seats === lic.seats) { desabilita(t('plans.seu-plano')); continue; }
    if (perpetua && p.seats < lic.seats) { desabilita(t('plans.menor-que-seu')); continue; }
    if (!perpetua && !vencida && p.seats < lic.seats) { desabilita(t('plans.menor-que-seu')); continue; }
    cta.href = `conta.html?plano=${p.id}&periodo=${periodo}#licenca`;
    cta.textContent = p.seats > lic.seats ? t('plans.fazer-upgrade') : t('conta.periodo-renovar');
    try {
      const q = await quote({ plan_id: p.id, period: periodo });
      cta.textContent = (p.seats > lic.seats ? t('plans.fazer-upgrade-valor', { valor: BRL(q.final_cents) })
                                              : t('plans.renovar-valor', { valor: BRL(q.final_cents) }));
    } catch { /* fica o texto sem valor */ }
  }
}

document.getElementById('period-switch')?.addEventListener('click', (e) => {
  const b = e.target.closest('.period-opt');
  if (!b) return;
  periodo = b.dataset.period;
  try { localStorage.setItem('dd-period', periodo); } catch { /* sem storage */ }
  pintarTudo();
});

pintarTudo();
document.addEventListener('dd-lang-changed', pintarTudo);
