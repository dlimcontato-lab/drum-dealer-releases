// Preços da home: os valores no HTML são o placeholder; a tabela `plans` manda.
import { loadPlans, formatBRL, getSession } from './dd-api.js?v=20260911a';

function perSeat(cents, seats) {
  const v = cents / seats / 100;
  return 'R$ ' + (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ','));
}

(async () => {
  try {
    const plans = await loadPlans();
    for (const p of plans) {
      const card = document.querySelector(`.plan2[data-plan="${p.id}"]`);
      if (!card) continue;
      const inteiro = Math.floor(p.price_cents / 100), cents = p.price_cents % 100;
      card.querySelector('.amount').textContent = String(inteiro);
      card.querySelector('.cents').textContent = cents ? ',' + String(cents).padStart(2, '0') : '';
      card.querySelector('.per-seat').textContent = perSeat(p.price_cents, p.seats);
      card.querySelector('.seats-n').textContent = `${p.seats} acesso${p.seats > 1 ? 's' : ''}`;
    }
  } catch {
    /* sem rede: o placeholder do HTML fica */
  }

  const s = await getSession();
  if (s?.user?.email) {
    const nav = document.getElementById('nav-conta');
    if (nav) nav.textContent = 'Minha conta';
    // já tem conta: o botão vai pra conta e o download começa lá (e a página leva pro pagamento)
  }
})();
