// Presente de boas-vindas (26/09): abre por interesse (20 s depois do Play ou quando "Adquirir"
// aparece), uma vez por dia por navegador, nunca para quem tem licença ativa, para quem já teve
// teste, nem para robô. O prêmio vem do servidor (/presente spin); aqui é só a tela: 7 teclas de
// step e a luz de corrida do sequencer parando no prêmio. Sem a palavra "sorteio" (decisão 3b).
import { SUPABASE_URL, ANON_KEY, getSession, select } from './dd-api.js?v=20260925p13';
import { t } from './dd-i18n.js';

const hoje = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
const ler = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const gravar = (k, v) => { try { localStorage.setItem(k, v); } catch { /* sem storage */ } };
const robo = () => { try { return !!navigator.webdriver || /bot|crawl|spider|slurp|headless|lighthouse|preview/i.test(navigator.userAgent || ''); } catch { return true; } };
const reduzido = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };

const dlg = document.getElementById('presente');
let aberto = false;

async function podeAbrir() {
  if (!dlg || aberto || robo() || ler('dd.presente.dia') === hoje()) return false;
  try {
    const s = await getSession();
    if (s) {
      const lics = await select('licenses', 'select=status,expires_at,period&limit=1');
      const l = lics[0];
      if (l && l.period === 'trial') return false; // já teve teste
      if (l && l.status === 'active' && (!l.expires_at || Date.parse(l.expires_at) > Date.now())) return false;
    }
  } catch { /* fail-open de propósito: sessão/licença ilegível segue como visitante. Quem tem
              licença de verdade é barrado de novo no servidor (gift_claim devolve 409
              has_license/already_trial); aqui é só a tela, o banco decide. */ }
  return true;
}

async function abrir() {
  if (!(await podeAbrir())) return;
  aberto = true;
  gravar('dd.presente.dia', hoje());
  dlg.showModal();
}

function acender(dias) {
  for (const b of dlg.querySelectorAll('.presente-step')) b.classList.toggle('luz', Number(b.dataset.dias) === dias);
}

async function girar() {
  const btn = document.getElementById('presente-girar');
  const msg = document.getElementById('presente-msg');
  btn.disabled = true;
  msg.textContent = '';
  let d = null;
  try {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/presente`, {
      method: 'POST',
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'spin' }),
    });
    if (r.ok) d = await r.json();
  } catch { d = null; }
  if (!d || !/^[A-Z0-9]{10}$/.test(d.code || '') || !(d.days >= 1 && d.days <= 7)) {
    msg.textContent = t('presente.indisponivel');
    btn.disabled = false;
    return;
  }
  if (!reduzido()) {
    const passos = 21 + d.days - 1; // 3 voltas e para no prêmio
    for (let i = 0; i <= passos; i++) {
      acender((i % 7) + 1);
      await new Promise((ok) => setTimeout(ok, 60 + Math.max(0, i - 12) * 18));
    }
  }
  acender(d.days);
  dlg.querySelector(`.presente-step[data-dias="${d.days}"]`).classList.add('ganho');
  gravar('dd.presente', JSON.stringify({ code: d.code, days: d.days, expires_at: d.expires_at }));
  document.getElementById('presente-titulo').textContent = t(d.days === 1 ? 'presente.ganhou-1' : 'presente.ganhou-n', { n: d.days });
  document.getElementById('presente-texto').textContent = t('presente.ganhou-texto');
  btn.hidden = true;
  const ativar = document.getElementById('presente-ativar');
  ativar.href = `conta.html?presente=${d.code}#licenca`;
  ativar.hidden = false;
  ativar.focus();
}

if (dlg) {
  document.getElementById('presente-girar').addEventListener('click', girar);
  document.getElementById('presente-fechar').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  document.getElementById('play')?.addEventListener('click', () => { setTimeout(abrir, 20000); }, { once: true });
  const alvo = document.getElementById('precos');
  if (alvo && 'IntersectionObserver' in window) {
    // 26/09: presença sustentada. A home ainda reflui (fontes/áudio/wasm) nos primeiros ~500ms
    // do load: a seção #precos passa perto do topo do viewport por um instante antes de assentar
    // mais abaixo. Observar desde a carga e abrir no primeiro sinal de interseção pegava esse
    // salto e abria a janela sem o visitante ter rolado. Em vez de esperar o `load` da página,
    // exige 1500ms de interseção CONTÍNUA (>=40%): o salto do reflow entra e sai da interseção
    // bem antes disso e não dispara nada; quem realmente rola até "Adquirir" e fica ali abre.
    let temporizador = null;
    const io = new IntersectionObserver((es) => {
      const dentro = es.some((e) => e.isIntersecting);
      if (dentro && !temporizador) {
        temporizador = setTimeout(() => { io.disconnect(); abrir(); }, 1500);
      } else if (!dentro && temporizador) {
        clearTimeout(temporizador);
        temporizador = null;
      }
    }, { threshold: 0.4 });
    io.observe(alvo);
  }
}
