// Preços da home: os valores no HTML são o placeholder; a tabela `plans` manda.
// Seletor MENSAL | ANUAL (referência de 23/09): o anual é o padrão. A etiqueta -N% é a
// economia do anual sobre o mensal; o bullet "% por computador em relação ao Solo" é
// calculado do período mostrado. Quem já tem licença vê Renovar/Upgrade/Seu plano.
import { loadPlans, getSession, select, quote, precosDoPlano, emPromocao, BRL, PLANOS_PADRAO, nomePlanoBonito } from './dd-api.js?v=20260925p13';
import { t, seatsLabel, fmtBRLCompact, getLang, DICT } from './dd-i18n.js';

let periodo = 'annual';
// 25/09 (Diogo): a home abre sempre no anual (R$ 29,90/mês); o período clicado não é mais lembrado

// PLANOS_PADRAO (fallback sem rede) mora em dd-api.js desde a Task 2 da jornada de compra
// (24/09): conta.html também precisa dele pro resumo do plano antes do cadastro.
function completar(p) {
  const base = PLANOS_PADRAO.find((x) => x.id === p.id) || {};
  return { ...p,
    monthly_cents: p.monthly_cents ?? base.monthly_cents ?? p.price_cents,
    annual_month_cents: p.annual_month_cents ?? base.annual_month_cents ?? p.price_cents,
    annual_cents: p.annual_cents ?? base.annual_cents ?? ((p.annual_month_cents ?? base.annual_month_cents ?? p.price_cents) * 12) };
}

// interpolação manual de {chave} num valor de DICT, igual ao t() de dd-i18n.js, mas para um
// idioma explícito — a faixa final precisa montar o texto certo mesmo quando `lang` (o idioma
// atual do módulo dd-i18n.js) já mudou, e a função de estado abaixo precisa ser pura e testável
// nos dois idiomas sem depender do estado global do módulo.
function traduz(idioma, chave, vars) {
  let s = (DICT[idioma] || DICT.pt)[chave];
  if (vars) for (const k of Object.keys(vars)) s = s.split('{' + k + '}').join(String(vars[k]));
  return s;
}

function fmtDataIdioma(iso, idioma) {
  const locale = idioma === 'en' ? 'en-US' : 'pt-BR';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(new Date(iso));
}

// Task 3 (F6): o que a faixa final da home mostra depende da licença de quem está vendo.
// Função pura, sem DOM, para ser testada com os 4 casos (sem lic, ativa com prazo, perpétua,
// vencida) — quem pinta o DOM é pintarFaixaFinal(), logo abaixo.
export function estadoFaixaFinal(lic, plans, lang) {
  const idioma = lang === 'en' ? 'en' : 'pt';
  if (!lic) return { modo: 'comprar', texto: null, legenda: null, href: null };
  const vencida = !!lic.expires_at && Date.parse(lic.expires_at) < Date.now();
  const perpetua = !lic.expires_at;
  const plano = nomePlanoBonito((plans.find((p) => p.seats === lic.seats) || {}).name);
  if (vencida) {
    return { modo: 'renovar', texto: traduz(idioma, 'close.renovar-cta', { plano }), legenda: null, href: 'conta.html?renovar=1#licenca' };
  }
  const texto = perpetua
    ? traduz(idioma, 'close.licenca-perpetua', { plano })
    : traduz(idioma, 'close.licenca-valida', { plano, data: fmtDataIdioma(lic.expires_at, idioma) });
  return { modo: 'licenca', texto, legenda: traduz(idioma, 'close.legenda-licenca'), href: null };
}

// pinta a faixa final (#close-buy-cta / #close-legend) conforme estadoFaixaFinal()
function pintarFaixaFinal(lic, plansAtual) {
  const btn = document.getElementById('close-buy-cta');
  const legend = document.getElementById('close-legend');
  let licP = document.getElementById('close-lic-text');
  const estado = estadoFaixaFinal(lic, plansAtual, getLang());

  if (estado.modo === 'comprar') {
    if (licP) licP.remove();
    if (btn) { btn.hidden = false; btn.textContent = t('close.buy-cta'); btn.href = 'conta.html?plano=solo&periodo=' + periodo; }
    if (legend) legend.textContent = t('close.legend');
    return;
  }
  if (estado.modo === 'renovar') {
    if (licP) licP.remove();
    if (btn) { btn.hidden = false; btn.textContent = estado.texto; btn.href = estado.href; }
    if (legend) legend.textContent = t('close.legend');
    return;
  }
  // modo 'licenca': o botão de comprar some, entra o parágrafo com o estado da licença
  if (btn) btn.hidden = true;
  if (legend) legend.textContent = estado.legenda;
  if (!licP) {
    licP = document.createElement('p');
    licP.className = 'close-lic';
    licP.id = 'close-lic-text';
    if (btn) btn.insertAdjacentElement('afterend', licP);
    else document.querySelector('.close-buy')?.appendChild(licP);
  }
  licP.textContent = estado.texto;
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
    const ps = card.querySelector('.per-seat');
    if (ps) ps.textContent = fmtBRLCompact(cents / p.seats);
    const sn = card.querySelector('.seats-n');
    if (sn) sn.textContent = seatsLabel(p.seats);
    // 25/09: a economia do anual em reais (12 × mensal − anual), só no anual
    const eco = card.querySelector('[data-economia]');
    if (eco) {
      const poupa = v.mensal * 12 - v.anualTotal;
      eco.hidden = !(periodo === 'annual' && poupa > 0);
      eco.textContent = t('plans.economia', { valor: fmtBRLCompact(poupa) });
    }
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
  if (!s) { pintarFaixaFinal(null, plans); return; }

  let lic = null;
  try {
    const lics = await select('licenses', 'select=id,seats,status,expires_at&limit=1');
    lic = lics.find((l) => l.status === 'active') || null;
  } catch { /* sessão velha: segue como visitante */ }
  pintarFaixaFinal(lic, plans);
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
  pintarTudo();
});

pintarTudo();
document.addEventListener('dd-lang-changed', pintarTudo);
