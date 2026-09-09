// Preços da home: os valores no HTML são o placeholder; a tabela `plans` manda.
import { loadPlans, formatBRL, getSession } from './dd-api.js';

function perSeat(cents, seats) {
  const v = cents / seats / 100;
  return 'R$ ' + (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ','));
}

(async () => {
  try {
    const plans = await loadPlans();
    for (const p of plans) {
      const card = document.querySelector(`.plan[data-plan="${p.id}"]`);
      if (!card) continue;
      card.querySelector('.amount').textContent = formatBRL(p.price_cents);
      card.querySelector('.per-seat').textContent = perSeat(p.price_cents, p.seats);
      const sockets = card.querySelectorAll('.socket');
      sockets.forEach((s, i) => s.classList.toggle('on', i < p.seats));
      card.querySelector('.seats').setAttribute('aria-label', `${p.seats} acesso${p.seats > 1 ? 's' : ''}`);
      card.querySelector('.seats .legend').textContent = `${p.seats} acesso${p.seats > 1 ? 's' : ''}`;
    }
  } catch {
    /* sem rede: o placeholder do HTML fica */
  }

  const s = await getSession();
  if (s?.user?.email) {
    const nav = document.getElementById('nav-conta');
    if (nav) nav.textContent = 'Minha conta';
  }
})();
