// Visitas e funil de compra (25/09). Envia só três eventos anônimos para a Edge Function
// `track`: visita (home), clique_comprar (botões "Comprar licença") e clique_pagar (conta).
// Sem cookie e sem id que dure: a sessão é um código aleatório da aba (sessionStorage), que
// some quando a aba fecha. Quem pede para não ser rastreado (GPC / Do Not Track) e navegador
// automatizado (robô, headless, testes) não são contados. Nunca quebra a página.
import { SUPABASE_URL, ANON_KEY } from './dd-api.js?v=20260925p13';

function naoConta() {
  try {
    if (navigator.globalPrivacyControl === true) return true;
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return true;
    if (navigator.webdriver) return true;
    if (/bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|whatsapp/i.test(navigator.userAgent || '')) return true;
  } catch { /* sem navigator: não conta */ return true; }
  return false;
}

function novaSessao() {
  const a = new Uint8Array(15);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => (b % 36).toString(36)).join('') + Date.now().toString(36).slice(-5);
}

function sessao() {
  try {
    let s = sessionStorage.getItem('dd.sid');
    if (!s || !/^[a-z0-9]{16,32}$/.test(s)) { s = novaSessao(); sessionStorage.setItem('dd.sid', s); }
    return s;
  } catch { return novaSessao(); }
}

export function registrar(evento) {
  if (naoConta()) return;
  try {
    fetch(`${SUPABASE_URL}/functions/v1/track`, {
      method: 'POST',
      keepalive: true, // o clique em "Comprar licença" navega; o envio sobrevive à troca de página
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ e: evento, s: sessao() }),
    }).catch(() => { /* rede fora: sem contagem, sem erro */ });
  } catch { /* nunca quebra a página */ }
}
