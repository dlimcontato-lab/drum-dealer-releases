// Cliente mínimo do backend de licenças (Supabase Auth + PostgREST + Edge Functions).
// Sem SDK: são quatro chamadas HTTP e um localStorage. Contrato em
// ~/Sistema AI/drum-dealer-backend/API.md.

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
  if (m.includes('invalid login') || m.includes('invalid_credentials')) return 'E-mail ou senha não conferem.';
  if (m.includes('already registered') || m.includes('user_already_exists')) return 'Já existe uma conta com esse e-mail. Entre com a senha.';
  if (m.includes('password') && m.includes('at least')) return 'A senha precisa ter pelo menos 8 caracteres.';
  if (m.includes('weak_password')) return 'Senha fraca demais. Use pelo menos 8 caracteres.';
  if (m.includes('rate') || status === 429) return 'Muitas tentativas. Espere um minuto e tente de novo.';
  if (m.includes('email') && m.includes('invalid')) return 'Esse e-mail não parece válido.';
  if (m.includes('not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  return msg || 'Não deu certo. Tente de novo.';
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
  if (!s) throw new ApiError('Você precisa entrar na conta.', 'no_session', 401);
  return { apikey: ANON_KEY, Authorization: `Bearer ${s.access_token}` };
}

// leitura pelo PostgREST (RLS decide o que volta)
export async function select(table, query = '', { auth: needAuth = true } = {}) {
  const headers = needAuth ? await bearerHeaders() : { apikey: ANON_KEY };
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers });
  if (!r.ok) throw new ApiError('Não consegui carregar os dados.', 'rest_error', r.status);
  return r.json();
}

// Edge Functions
export async function call(name, body) {
  const headers = { ...(await bearerHeaders()), 'Content-Type': 'application/json' };
  const r = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST', headers, body: JSON.stringify(body || {}),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new ApiError(json.message || 'O servidor não respondeu como esperado.', json.error || 'fn_error', r.status, json);
  return json;
}

export function formatBRL(cents) {
  const v = cents / 100;
  return Number.isInteger(v)
    ? String(v)
    : v.toFixed(2).replace('.', ',');
}

export async function loadPlans() {
  return select('plans', 'select=id,name,seats,price_cents,badge,sort&active=eq.true&order=sort.asc', { auth: false });
}

export const DOWNLOADS = {
  mac: 'https://github.com/dlimcontato-lab/drum-dealer-releases/releases/latest/download/Drumsfull-macOS.pkg',
  win: 'https://github.com/dlimcontato-lab/drum-dealer-releases/releases/latest/download/Drumsfull-Windows-Setup.exe',
};
