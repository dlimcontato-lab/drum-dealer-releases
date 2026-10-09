// Cliente mínimo do backend de licenças (Supabase Auth + PostgREST + Edge Functions).
// Sem SDK: são quatro chamadas HTTP e um localStorage. Contrato em
// ~/Sistema AI/drum-dealer-backend/API.md.
import { t, fmtBRL, DICT } from './dd-i18n.js';

export const SUPABASE_URL = 'https://bwzngjvjxrqbalvoadpu.supabase.co';
export const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3em5nanZqeHJxYmFsdm9hZHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NjM1MzQsImV4cCI6MjEwNDUzOTUzNH0.tZpL6lVNO9wQ4MagySs7mnCFmc0RxdAdxmh6gTNv7xs';

const KEY = 'dd.session';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
}
function save(s) {
  try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); } catch {}
}

function fromAuth(json) {
  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + (json.expires_in || 3600),
    user: { id: json.user?.id, email: json.user?.email },
  };
}

async function auth(path, body) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) {
    const code = json.error_code || json.code || json.error || '';
    const msg = json.msg || json.error_description || json.message || '';
    throw new ApiError(traduzAuth(code, msg, r.status), code, r.status);
  }
  return json;
}

export class ApiError extends Error {
  constructor(message, code, status, data) { super(message); this.code = code; this.status = status; this.data = data; }
}

function traduzAuth(code, msg, status) {
  const m = (code + ' ' + msg).toLowerCase();
  if (m.includes('invalid login') || m.includes('invalid_credentials')) return t('api.auth-credenciais');
  if (m.includes('already registered') || m.includes('user_already_exists')) return t('api.auth-ja-existe');
  if (m.includes('password') && m.includes('at least')) return t('api.auth-senha-curta');
  if (m.includes('known to be weak') || m.includes('pwned')) return t('api.auth-senha-vazada');
  if (m.includes('weak_password')) return t('api.auth-senha-fraca');
  if (m.includes('rate') || status === 429) return t('api.auth-rate-limit');
  if (m.includes('email') && m.includes('invalid')) return t('api.auth-email-invalido');
  if (m.includes('not confirmed')) return t('api.auth-nao-confirmado');
  return msg || t('api.auth-generico');
}

// meta (opcional): metadados do usuário no Supabase Auth (ex.: aceite dos Termos de Uso).
// A REST do GoTrue recebe esses dados no campo "data" do corpo de /signup — é o mesmo conteúdo
// que o cliente supabase-js chamaria de options.data, só que aqui é fetch cru, sem SDK.
export async function signUp(email, password, meta) {
  const json = await auth('signup', meta ? { email, password, data: meta } : { email, password });
  if (json.access_token) { const s = fromAuth(json); save(s); return s; }
  // confirmação por e-mail ligada no projeto: sem sessão ainda
  return null;
}

export async function signIn(email, password) {
  const s = fromAuth(await auth('token?grant_type=password', { email, password }));
  save(s); return s;
}

export async function signOut() {
  const s = load();
  if (s?.access_token) {
    fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST', headers: { apikey: ANON_KEY, Authorization: `Bearer ${s.access_token}` },
    }).catch(() => {});
  }
  save(null);
}

export async function getSession() {
  const s = load();
  if (!s) return null;
  if (s.expires_at - 60 > Date.now() / 1000) return s;
  try {
    const n = fromAuth(await auth('token?grant_type=refresh_token', { refresh_token: s.refresh_token }));
    save(n); return n;
  } catch {
    save(null); return null;
  }
}

async function bearerHeaders() {
  const s = await getSession();
  if (!s) throw new ApiError(t('api.no-session'), 'no_session', 401);
  return { apikey: ANON_KEY, Authorization: `Bearer ${s.access_token}` };
}

// leitura pelo PostgREST (RLS decide o que volta)
export async function select(table, query = '', { auth: needAuth = true } = {}) {
  const headers = needAuth ? await bearerHeaders() : { apikey: ANON_KEY };
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers });
  if (!r.ok) throw new ApiError(t('api.rest-error'), 'rest_error', r.status);
  return r.json();
}

// Edge Functions
export async function call(name, body) {
  const headers = { ...(await bearerHeaders()), 'Content-Type': 'application/json' };
  const r = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST', headers, body: JSON.stringify(body || {}),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new ApiError(json.message || t('api.fn-error'), json.error || 'fn_error', r.status, json);
  return json;
}

export function formatBRL(cents) {
  const v = cents / 100;
  return Number.isInteger(v)
    ? String(v)
    : v.toFixed(2).replace('.', ',');
}

// Fallback sem rede e completação enquanto o banco não tem as colunas novas (migração 0004).
// Os valores são a tabela da spec de 23/09; quem cobra é o servidor, aqui é só para mostrar.
// Movido de dd-precos.js (24/09, Task 2 da jornada de compra) para servir também o resumo do
// plano em conta.html antes do cadastro (view-auth), sem depender de rede.
export const PLANOS_PADRAO = [
  // 07/10: Solo a 39,90, licença vitalícia paga uma vez. Não existe mais venda mensal:
  // o servidor trata qualquer pedido de plano como anual.
  { id: 'solo',   name: 'Solo',   seats: 1, price_cents: 3990,  monthly_cents: 3990,  annual_month_cents: 333,   annual_cents: 3990,   badge: null,          sort: 1 },
];

export async function loadPlans() {
  const base = 'active=eq.true&order=sort.asc';
  const tentativas = [
    'select=id,name,seats,price_cents,monthly_cents,annual_month_cents,annual_cents,promo_price_cents,promo_starts_at,promo_ends_at,badge,sort',
    'select=id,name,seats,price_cents,promo_price_cents,promo_starts_at,promo_ends_at,badge,sort',
    'select=id,name,seats,price_cents,badge,sort',
  ];
  let erro;
  for (const sel of tentativas) {
    try { return await select('plans', `${sel}&${base}`, { auth: false }); } catch (e) { erro = e; }
  }
  throw erro;
}
// os valores de um plano; o servidor é quem cobra, aqui é só para mostrar.
// 07/10: a venda é só anual. anualTotal é o preço de lista; anualTotalEfetivo já leva a promoção
// vigente (promo_price_cents vale sobre o anual) e anualMesEfetivo é o valor da vitrine por mês.
// `mensal` fica só para licença e pedido antigos; não deriva mais anual como mês x 12 quando
// annual_cents existe.
export function precosDoPlano(p) {
  const mensal = p.monthly_cents ?? p.price_cents;
  const anualMes = p.annual_month_cents ?? mensal;
  const anualTotal = p.annual_cents ?? anualMes * 12;
  const anualTotalEfetivo = precoEfetivo({ ...p, price_cents: anualTotal });
  const anualMesEfetivo = anualTotalEfetivo === anualTotal ? anualMes : Math.round(anualTotalEfetivo / 12);
  return { mensal: precoEfetivo({ ...p, price_cents: mensal }), anualMes, anualTotal, anualTotalEfetivo, anualMesEfetivo };
}

// 24/09: o download virou um zip (instalador + tutorial PT/EN + LEIA-ME). Os .pkg/.exe soltos
// continuam existindo na release, mas o site só aponta pros zips a partir de agora.
export const DOWNLOADS = {
  mac: 'https://github.com/dlimcontato-lab/drum-dealer-releases/releases/latest/download/BRDRUM-macOS.zip',
  win: 'https://github.com/dlimcontato-lab/drum-dealer-releases/releases/latest/download/BRDRUM-Windows.zip',
};

// ============================================================================
// Conta, loja de packs e admin (contrato em
// ~/Sistema AI/drum-dealer-backend/docs/SPEC-conta-loja-admin.md).
// ============================================================================

// ---------- sessão crua (upload direto no Storage precisa do token) ----------
export async function accessToken() {
  const s = await getSession();
  return s ? s.access_token : null;
}

// ---------- perfil ----------
export async function loadProfile(uid) {
  try {
    const rows = await select('profiles', `select=user_id,display_name,avatar_path,created_at&user_id=eq.${uid}&limit=1`);
    return rows[0] || null;
  } catch { return null; }   // migração 0003 ainda não aplicada
}

export async function saveProfile(body) {
  return call('profile', body);
}

// caminho guardado é "avatars/<uid>/arquivo.webp" (com o bucket na frente)
export function avatarUrl(path) {
  if (!path) return '';
  const rel = String(path).replace(/^\/+/, '');
  return `${SUPABASE_URL}/storage/v1/object/public/${rel.startsWith('avatars/') ? rel : 'avatars/' + rel}`;
}

export function publicUrl(bucket, path) {
  if (!path) return '';
  const rel = String(path).replace(/^\/+/, '');
  return `${SUPABASE_URL}/storage/v1/object/public/${rel.startsWith(bucket + '/') ? rel : bucket + '/' + rel}`;
}

// upload direto no bucket `avatars` com a sessão do usuário; depois grava o caminho no perfil
export async function uploadAvatar(blob, uid) {
  const s = await getSession();
  if (!s) throw new ApiError(t('api.no-session'), 'no_session', 401);
  const path = `avatars/${uid}/avatar-${Date.now()}.webp`;
  const r = await fetch(`${SUPABASE_URL}/storage/v1/object/${path}`, {
    method: 'POST',
    headers: {
      apikey: ANON_KEY, Authorization: `Bearer ${s.access_token}`,
      'Content-Type': 'image/webp', 'x-upsert': 'true', 'cache-control': '3600',
    },
    body: blob,
  });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new ApiError(j.message || t('api.upload-erro'), j.error || 'storage_error', r.status);
  }
  await saveProfile({ avatar_path: path });
  return path;
}

// ---------- senha e sessões ----------
export async function changePassword(email, atual, nova) {
  try { await signIn(email, atual); }
  catch (e) {
    if (e.status === 400 || e.code === 'invalid_credentials') throw new ApiError(t('api.senha-atual-errada'), 'wrong_password', 400);
    throw e;
  }
  const s = await getSession();
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'PUT',
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${s.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: nova }),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) {
    const razoes = json.weak_password?.reasons || [];
    if (razoes.includes('pwned')) throw new ApiError(t('api.auth-senha-vazada'), 'pwned', r.status);
    if (razoes.includes('length')) throw new ApiError(t('api.auth-senha-curta'), 'short', r.status);
    throw new ApiError(
      traduzAuth(json.error_code || json.code || json.error || '', json.msg || json.message || '', r.status),
      json.error_code || 'auth_error', r.status);
  }
  return true;
}

export async function logoutAll() {
  const s = await getSession();
  if (s) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout?scope=global`, {
      method: 'POST', headers: { apikey: ANON_KEY, Authorization: `Bearer ${s.access_token}` },
    }).catch(() => {});
  }
  save(null);
}

// ---------- entrar com Google e recuperar senha (PKCE, plano 2026-10-09-login-google) ----------
// Os dois fluxos saem do site e voltam para conta.html?code=... (ou ?error=...). O code_verifier fica
// no localStorage (o link de recuperação abre em outra aba, vindo do e-mail) com validade curta, e os
// parâmetros da página de antes (?plano=, ?baixar=, ?renovar=) viajam junto para sobreviver à ida e volta.
// O token nunca passa pela URL: só o código, que vale uma vez e só com o verifier deste navegador.
const OAUTH_KEY = 'dd.oauth';
// Google: 30 min (a ida e volta leva segundos). Recuperação: 60 min, a mesma validade do link do e-mail (otp_exp 3600).
const ttlDe = (tipo) => (tipo === 'recovery' ? 60 : 30) * 60 * 1000;
// Volta sempre para a conta no mesmo endereço em que a pessoa está (brdrum.com ou localhost de teste);
// os dois estão na lista de retorno do Supabase. Qualquer outra origem cai em brdrum.com.
// (fora do navegador, como nos testes em Node, não há location: cai em brdrum.com)
const ORIGEM = typeof location !== 'undefined' ? location.origin : '';
const RETORNO = (/^https:\/\/(www\.)?brdrum\.com$/.test(ORIGEM) || /^http:\/\/localhost:\d+$/.test(ORIGEM))
  ? ORIGEM + '/conta.html' : 'https://brdrum.com/conta.html';

function b64url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function novoPkce(tipo, query) {
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));
  try { localStorage.setItem(OAUTH_KEY, JSON.stringify({ v: verifier, tipo, q: query || '', t: Date.now() })); } catch {}
  return challenge;
}

// Só os parâmetros da página que precisam voltar; nada de code/error de uma volta anterior.
function queryDeRetorno() {
  const p = new URLSearchParams(location.search);
  const q = new URLSearchParams();
  for (const k of ['plano', 'baixar', 'renovar']) if (p.get(k)) q.set(k, p.get(k));
  const s = q.toString();
  return s ? '?' + s : '';
}

export async function startGoogle() {
  const challenge = await novoPkce('google', queryDeRetorno());
  const u = new URL(`${SUPABASE_URL}/auth/v1/authorize`);
  u.searchParams.set('provider', 'google');
  u.searchParams.set('redirect_to', RETORNO);
  u.searchParams.set('code_challenge', challenge);
  u.searchParams.set('code_challenge_method', 's256');
  location.assign(u.toString());
}

// Resposta sempre igual, exista ou não a conta (anti-enumeração); só falha em erro de rede ou limite.
export async function sendRecovery(email) {
  const challenge = await novoPkce('recovery', '');
  const r = await fetch(`${SUPABASE_URL}/auth/v1/recover?redirect_to=${encodeURIComponent(RETORNO)}`, {
    method: 'POST',
    headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code_challenge: challenge, code_challenge_method: 's256' }),
  });
  if (r.status === 429) throw new ApiError(t('api.auth-rate-limit'), 'rate_limit', 429);
  if (r.status >= 500) throw new ApiError(t('api.auth-generico'), 'server_error', r.status);
  return true;
}

// Chamada síncrona no topo de conta.js, ANTES de ler ?plano=/?baixar=/?renovar=: se a página é a volta
// do Google ou do e-mail de recuperação, troca a URL pela da página de antes (sem code/error) e devolve
// o que veio. Fora de uma volta, devolve null e não mexe em nada.
export function lerRetornoOAuth() {
  const p = new URLSearchParams(location.search);
  const code = p.get('code');
  const error = p.get('error');
  if (!code && !error) return null;
  let guardado = null;
  try { guardado = JSON.parse(localStorage.getItem(OAUTH_KEY) || 'null'); } catch {}
  const valido = !!(guardado && guardado.v && Date.now() - (guardado.t || 0) < ttlDe(guardado.tipo));
  history.replaceState(null, '', 'conta.html' + (valido ? guardado.q : '') + location.hash);
  return { code, error, tipo: valido ? guardado.tipo : null, temVerifier: valido };
}

// Troca o código pela sessão. O verifier é apagado antes da chamada: código e verifier valem uma vez.
export async function finishOAuth(code) {
  let guardado = null;
  try { guardado = JSON.parse(localStorage.getItem(OAUTH_KEY) || 'null'); localStorage.removeItem(OAUTH_KEY); } catch {}
  if (!guardado || !guardado.v || Date.now() - (guardado.t || 0) >= ttlDe(guardado.tipo)) {
    throw new ApiError(t('api.oauth-expirado'), 'oauth_expired', 400);
  }
  const json = await auth('token?grant_type=pkce', { auth_code: code, code_verifier: guardado.v });
  const s = fromAuth(json);
  save(s);
  return { session: s, user: json.user || {}, tipo: guardado.tipo };
}

// Usuário completo do Auth (identidades e metadata): diz se a conta veio do Google e se já tem senha.
export async function getAuthUser() {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: await bearerHeaders() });
  if (!r.ok) throw new ApiError(t('api.no-session'), 'no_session', r.status);
  return r.json();
}

// Conta sem senha = só identidade social e nunca definiu senha pelo site (o GoTrue não diz se há senha).
export function contaSemSenha(user) {
  const ids = (user && user.identities) || [];
  if (!ids.length) return false;
  const temEmail = ids.some((i) => i.provider === 'email');
  return !temEmail && !(user.user_metadata && user.user_metadata.password_set_at);
}

export async function updateUserMeta(data) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'PUT',
    headers: { ...(await bearerHeaders()), 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
  if (!r.ok) throw new ApiError(t('api.auth-generico'), 'auth_error', r.status);
  return r.json();
}

// Definir senha sem a atual: conta do Google sem senha, ou sessão que veio do link de recuperação.
// Grava password_set_at junto, no mesmo PUT, para o site saber depois que a conta já tem senha.
export async function setPassword(nova) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'PUT',
    headers: { ...(await bearerHeaders()), 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: nova, data: { password_set_at: new Date().toISOString() } }),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) {
    const razoes = json.weak_password?.reasons || [];
    if (razoes.includes('pwned')) throw new ApiError(t('api.auth-senha-vazada'), 'pwned', r.status);
    if (razoes.includes('length')) throw new ApiError(t('api.auth-senha-curta'), 'short', r.status);
    throw new ApiError(
      traduzAuth(json.error_code || json.code || json.error || '', json.msg || json.message || '', r.status),
      json.error_code || 'auth_error', r.status);
  }
  return true;
}

// ---------- vagas e chaves ----------
export async function seats(action, extra = {}) {
  return call('seats', { action, ...extra });
}

// ---------- preço, cupom e compra ----------
export async function quote(body) {
  return call('quote', body);
}

// preço efetivo no cliente é só para MOSTRAR: quem decide é o servidor
export function precoEfetivo(item) {
  if (!item) return 0;
  const promo = item.promo_price_cents;
  if (promo == null) return item.price_cents;
  const agora = Date.now();
  const de = item.promo_starts_at ? Date.parse(item.promo_starts_at) : null;
  const ate = item.promo_ends_at ? Date.parse(item.promo_ends_at) : null;
  if ((de && agora < de) || (ate && agora > ate)) return item.price_cents;
  return promo;
}
export function emPromocao(item) {
  return !!item && item.promo_price_cents != null && precoEfetivo(item) !== item.price_cents;
}

// ---------- packs ----------
const PACK_COLS = 'id,slug,title,artist,description,kind,price_cents,promo_price_cents,promo_starts_at,promo_ends_at,cover_path,preview_path,file_size_bytes,contents,sort';

export async function loadPacks() {
  try {
    return await select('packs', `select=${PACK_COLS}&active=eq.true&order=sort.asc,created_at.desc`, { auth: false });
  } catch { return []; }   // tabela ainda não existe
}

export async function meusPacks() {
  try {
    return await select('pack_entitlements', 'select=pack_id,source,created_at&order=created_at.desc');
  } catch { return []; }
}

export async function packDownload(pack_id) {
  return call('pack-download', { pack_id });
}

// ---------- central de ajuda (support) ----------
// Só `action: 'send'`: funciona logado ou anônimo (usa a sessão quando existir, sem exigi-la —
// ao contrário de `call()`, que sempre pede bearer). Contrato:
// ~/Sistema AI/drum-dealer-backend/docs/ciclo/2026-09-24-central-de-ajuda-spec.md
export async function supportSend({ email, body, hp } = {}) {
  const s = await getSession();
  const headers = { apikey: ANON_KEY, 'Content-Type': 'application/json' };
  if (s) headers.Authorization = `Bearer ${s.access_token}`;
  const r = await fetch(`${SUPABASE_URL}/functions/v1/support`, {
    method: 'POST', headers,
    body: JSON.stringify({ action: 'send', email, body, ...(hp !== undefined ? { hp } : {}) }),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new ApiError(json.message || t('api.fn-error'), json.error || 'fn_error', r.status, json);
  return json;
}

const ERROS_SUPPORT = { bad_request: 'ajuda.erro-bad-request', rate_limited: 'ajuda.erro-rate-limited' };
export function mensagemSupport(e) {
  const chave = e && e.code && ERROS_SUPPORT[e.code];
  return chave ? t(chave) : (e && e.message) || t('ajuda.erro-generico');
}

// ---------- admin ----------
export async function admin(action, extra = {}) {
  return call('admin', { action, ...extra });
}

async function sondaAdmin() {
  try {
    const r = await call('admin', { action: 'whoami' });
    return typeof r.is_admin === 'boolean' ? r.is_admin : true;
  } catch (e) {
    if (e.status === 403 || e.status === 401) return false;
    try { await call('admin', { action: 'dashboard' }); return true; } catch { return false; }
  }
}

// é admin? tenta a própria linha em `admins` (RLS); se não der, pergunta à função
export async function ehAdmin(uid, { cache = true } = {}) {
  const chave = 'dd.admin.' + uid;
  if (cache) { try { const c = sessionStorage.getItem(chave); if (c !== null) return c === '1'; } catch {} }
  let ok = false;
  try {
    const rows = await select('admins', `select=user_id&user_id=eq.${uid}&limit=1`);
    ok = rows.length > 0 ? true : await sondaAdmin();
  } catch {
    ok = await sondaAdmin();
  }
  try { sessionStorage.setItem(chave, ok ? '1' : '0'); } catch {}
  return ok;
}

// ---------- formatos ----------
// moeda continua BRL nas duas línguas (o produto é pago em reais); só o formato do número muda
// (Intl.NumberFormat('pt-BR'|'en-US', {currency:'BRL'})), conforme dd-i18n.js.
export function BRL(cents) {
  return fmtBRL(cents);
}

export function primeiroNome(nome, email) {
  const base = (nome || '').trim() || (email || '').split('@')[0] || '';
  return base.split(/[\s.]+/)[0].replace(/^./, (c) => c.toUpperCase());
}

// Pílula do topo (Task 5 da jornada de compra, F10): nunca usa o e-mail. Com nome de exibição,
// o primeiro nome; sem nome, o rótulo genérico "Minha conta"/"My account". `lang` explícito (não
// o idioma global do módulo) pra ficar testável nos dois idiomas de uma vez.
// O banco semeia display_name com a parte do e-mail antes do @ (handle_new_user, migração 0003):
// esse valor também conta como "sem nome", senão o e-mail voltaria para a pílula pela porta dos fundos.
export function nomeNoTopo(displayName, email, lang) {
  const nome = (displayName || '').trim();
  const local = ((email || '').split('@')[0] || '').trim().toLowerCase();
  const semeado = !nome || nome.toLowerCase() === local || nome.toLowerCase() === 'produtor' || nome.includes('@');
  if (!semeado) return nome.split(/[\s.]+/)[0].replace(/^./, (c) => c.toUpperCase());
  return (DICT[lang === 'en' ? 'en' : 'pt'])['nav.minha-conta'];
}

// Nome do plano como o site escreve ("Studio"), venha do banco em caixa alta ("STUDIO") ou não.
export function nomePlanoBonito(name) {
  const s = String(name || '').trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '—';
}

export function iniciais(nome, email) {
  const base = (nome || '').trim() || (email || '').split('@')[0] || '?';
  const partes = base.split(/[\s._-]+/).filter(Boolean);
  const s = partes.length > 1 ? partes[0][0] + partes[1][0] : base.slice(0, 2);
  return s.toUpperCase();
}

// getter (não objeto congelado): assim cada leitura reflete o idioma atual
export const TIPOS_PACK = {
  get drums() { return t('api.tipo-bateria'); },
  get midi() { return t('api.tipo-midi'); },
  get 'drums+midi'() { return t('api.tipo-bateria-midi'); },
};
