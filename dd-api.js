// Cliente mínimo do backend de licenças (Supabase Auth + PostgREST + Edge Functions).
// Sem SDK: são quatro chamadas HTTP e um localStorage. Contrato em
// ~/Sistema AI/drum-dealer-backend/API.md.
import { t, fmtBRL } from './dd-i18n.js';

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

export async function signUp(email, password) {
  const json = await auth('signup', { email, password });
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
// os três valores de um plano; o servidor é quem cobra, aqui é só para mostrar
export function precosDoPlano(p) {
  const mensal = p.monthly_cents ?? p.price_cents;
  const anualMes = p.annual_month_cents ?? mensal;
  const anualTotal = p.annual_cents ?? anualMes * 12;
  return { mensal: precoEfetivo({ ...p, price_cents: mensal }), anualMes, anualTotal };
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
