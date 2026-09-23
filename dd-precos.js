// Preços da home: os valores no HTML são o placeholder; a tabela `plans` manda.
// Quem já tem licença vê "Fazer upgrade · R$ <diferença>" (valor vindo do /quote),
// o plano atual aparece como "Seu plano" e os menores ficam desabilitados.
import { loadPlans, getSession, select, quote, precoEfetivo, emPromocao, BRL } from './dd-api.js?v=20260923a';
import { t, seatsLabel, fmtBRLCompact } from './dd-i18n.js';

function perSeat(cents, seats) {
  return fmtBRLCompact(cents / seats);
}

function pintarPreco(card, cents) {
  const inteiro = Math.floor(cents / 100), resto = cents % 100;
  card.querySelector('.amount').textContent = String(inteiro);
  card.querySelector('.cents').textContent = resto ? ',' + String(resto).padStart(2, '0') : '';
}

async function pintarTudo() {
  let plans = [];
  try {
    plans = await loadPlans();
    for (const p of plans) {
      const card = document.querySelector(`.plan2[data-plan="${p.id}"]`);
      if (!card) continue;
      const cents = precoEfetivo(p);
      pintarPreco(card, cents);
      card.querySelector('.per-seat').textContent = perSeat(cents, p.seats);
      card.querySelector('.seats-n').textContent = seatsLabel(p.seats);
      if (emPromocao(p)) {
        const linha = card.querySelector('.per-line');
        if (linha && !linha.querySelector('.was')) {
          const was = document.createElement('span');
          was.className = 'was';
          was.textContent = BRL(p.price_cents);
          linha.prepend(was, document.createTextNode(' · '));
        }
      }
    }
  } catch {
    /* sem rede: o placeholder do HTML fica */
  }

  const s = await getSession();
  if (!s) return;

  // o topo já é cuidado por dd-topo.js; aqui só os botões de compra
  let lic = null;
  try {
    const lics = await select('licenses', 'select=id,seats,status&limit=1');
    lic = lics.find((l) => l.status === 'active') || null;
  } catch { /* sessão velha: segue como visitante */ }
  if (!lic) return;

  for (const p of plans) {
    const card = document.querySelector(`.plan2[data-plan="${p.id}"]`);
    if (!card) continue;
    const cta = card.querySelector('.key');
    if (!cta) continue;

    if (p.seats === lic.seats) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'key'; b.disabled = true; b.textContent = t('plans.seu-plano');
      cta.replaceWith(b);
      continue;
    }
    if (p.seats < lic.seats) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'key'; b.disabled = true; b.textContent = t('plans.menor-que-seu');
      cta.replaceWith(b);
      continue;
    }
    cta.textContent = t('plans.fazer-upgrade');
    cta.href = `conta.html?plano=${p.id}#licenca`;
    try {
      const q = await quote({ plan_id: p.id });
      cta.textContent = t('plans.fazer-upgrade-valor', { valor: BRL(q.final_cents) });
    } catch {
      const atual = plans.filter((x) => x.seats <= lic.seats).sort((a, b) => b.seats - a.seats)[0];
      const dif = atual ? Math.max(precoEfetivo(p) - precoEfetivo(atual), 99) : precoEfetivo(p);
      cta.textContent = t('plans.fazer-upgrade-valor', { valor: BRL(dif) });
    }
  }
}

pintarTudo();
document.addEventListener('dd-lang-changed', pintarTudo);
