// Painel do administrador. Quem decide é o servidor (`is_admin` em toda ação do
// `admin`); esta página só esconde, mostra e pede confirmação no próprio painel.
// Contrato: ~/Sistema AI/drum-dealer-backend/docs/SPEC-conta-loja-admin.md (seção 3).
import {
  SUPABASE_URL, getSession, select, admin, ehAdmin, loadPlans, loadPacks, publicUrl,
  avatarUrl, BRL, iniciais, TIPOS_PACK, ApiError,
} from './dd-api.js?v=20260925d';
import { montarTopo } from './dd-topo.js?v=20260925d';
import { fmtDate } from './dd-i18n.js';
import {
  $, el, msg, aviso as avisoUI, confirmar, perguntar, recado, abas, dataHora, quando,
  STATUS_PEDIDO, corStatus, tamanho,
} from './dd-ui.js?v=20260925d';

const est = {
  session: null, plans: [], packs: [], packAtual: null,
  uPage: 1, uQ: '', lPage: 1, lQ: '', lStatus: '', oPage: 1,
};
let pronto = false;          // só carrega tabela depois de confirmar o acesso
const aviso = (t, tipo) => avisoUI($('aviso'), t, tipo);
const lista = (r) => (Array.isArray(r) ? r : r && (r.users || r.items || r.rows || r.data || r.licenses || r.orders || r.coupons || r.packs)) || [];
const num = (x) => (Array.isArray(x) ? x.length : (x == null ? 0 : x));
const temMais = (r, arr) => {
  if (r && typeof r.total === 'number') return (r.page || 1) * 25 < r.total;
  if (r && (r.has_more ?? r.more) != null) return !!(r.has_more ?? r.more);
  return arr.length >= 25;
};

function erro(node, e) {
  if (e instanceof ApiError && e.status === 404) msg(node, 'Essa ação ainda não existe no servidor.', 'err');
  else if (e instanceof ApiError && e.status === 403) msg(node, 'O servidor recusou: esta conta não é admin.', 'err');
  else msg(node, e.message || 'Não deu certo.', 'err');
}

// ============================ visão geral ============================
const ROTULOS = {
  users: 'Usuários', users_total: 'Usuários', usuarios: 'Usuários', total_users: 'Usuários',
  licenses_active: 'Licenças ativas', licencas_ativas: 'Licenças ativas', active_licenses: 'Licenças ativas',
  seats_used: 'Vagas em uso', vagas_usadas: 'Vagas em uso',
  seats_total: 'Vagas contratadas',
  orders_approved: 'Pedidos pagos', pedidos_aprovados: 'Pedidos pagos',
  revenue_today: 'Receita hoje', revenue_7d: 'Receita 7 dias', revenue_30d: 'Receita 30 dias',
  revenue_total: 'Receita total', receita_hoje: 'Receita hoje', receita_7d: 'Receita 7 dias',
  receita_30d: 'Receita 30 dias', receita_total: 'Receita total',
  packs_sold: 'Packs vendidos', packs_vendidos: 'Packs vendidos',
  coupons_used: 'Cupons usados', cupons_usados: 'Cupons usados',
  keys_pending: 'Chaves pendentes', keys_active: 'Chaves ativas',
  licenses_by_plan: 'Licenças', licencas_por_plano: 'Licenças',
  orders: 'Pedidos', packs: 'Packs', coupons: 'Cupons', keys: 'Chaves', seats: 'Vagas contratadas',
  active: 'ativos', pending: 'pendentes', revoked: 'revogadas', sold: 'vendidos', total: 'total',
  entitlements: 'liberados', uses: 'usos', approved_today: 'pagos hoje', approved_7d: 'pagos 7 dias',
  approved_30d: 'pagos 30 dias', approved_total: 'pagos no total', refunded: 'estornados',
};
const PULAR = new Set(['kind', 'ok', 'status', 'page']);
const STATUS_CHAVE = { pending: 'pendente', active: 'ativa', revoked: 'revogada' };
const ORIGEM_PACK = { purchase: 'compra', grant: 'cortesia' };
const humano = (k) => ROTULOS[k] || k.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
const ehDinheiro = (k) => /cents|revenue|receita|valor/i.test(k);

function achatar(obj, prefixo = '', nivel = 0, saida = []) {
  for (const [k, v] of Object.entries(obj || {})) {
    if (v == null || PULAR.has(k)) continue;
    const rot = prefixo ? `${prefixo} · ${humano(k)}` : humano(k);
    if (typeof v === 'number') saida.push([rot, ehDinheiro(k) || ehDinheiro(prefixo) ? BRL(v) : String(v)]);
    else if (typeof v === 'string') saida.push([rot, v]);
    else if (Array.isArray(v)) {
      if (v.every((x) => x && typeof x === 'object')) for (const item of v) {
        const nome = item.name || item.plan_id || item.id || '';
        const valor = item.licenses ?? item.count ?? item.total ?? item.n ?? item.seats;
        if (valor != null) saida.push([`${rot} · ${nome}`, String(valor)]);
      } else saida.push([rot, String(v.length)]);
    } else if (typeof v === 'object' && nivel < 2) achatar(v, rot, nivel + 1, saida);
  }
  return saida;
}

async function carregarVisao() {
  msg($('msg-visao'), 'Buscando…');
  try {
    const d = await admin('dashboard');
    const caixas = achatar(d.totals || d.dashboard || d);
    const g = $('stats');
    g.innerHTML = '';
    for (const [rot, valor] of caixas) {
      const c = el('div', 'recess stat');
      c.append(el('span', 'n', valor), el('span', 'legend', rot));
      g.appendChild(c);
    }
    $('visao-sub').textContent = `Números do servidor · ${dataHora(new Date().toISOString())}`;
    msg($('msg-visao'), caixas.length ? '' : 'O servidor respondeu sem números.');
  } catch (e) { erro($('msg-visao'), e); }
}

// ============================ usuários ============================
function celulaUsuario(u) {
  const td = el('td');
  const who = el('div', 'who');
  const av = el('span', 'avatar mini');
  if (u.avatar_path) {
    const img = document.createElement('img');
    img.src = avatarUrl(u.avatar_path); img.alt = '';
    img.addEventListener('error', () => { img.remove(); av.textContent = iniciais(u.display_name, u.email); });
    av.appendChild(img);
  } else av.textContent = iniciais(u.display_name, u.email);
  const t = el('span', 't');
  t.append(el('b', null, u.display_name || (u.email || '').split('@')[0]), el('span', 'legend', u.email || ''));
  who.append(av, t);
  td.appendChild(who);
  return td;
}

async function carregarUsuarios() {
  msg($('msg-users'), 'Buscando…');
  try {
    const r = await admin('users.list', { q: est.uQ || undefined, page: est.uPage });
    const rows = lista(r);
    const tb = $('tbl-users').querySelector('tbody');
    tb.innerHTML = '';
    $('u-empty').hidden = rows.length > 0;
    for (const u of rows) {
      const tr = document.createElement('tr');
      tr.appendChild(celulaUsuario(u));
      const lic = u.license || u.licenca || null;
      tr.append(
        el('td', null, quando(u.created_at)),
        el('td', null, quando(u.last_sign_in_at || u.last_login_at)),
        el('td', null, lic ? `${lic.seats} acesso${lic.seats > 1 ? 's' : ''} · ${lic.status === 'active' ? 'ativa' : 'revogada'}` : '—'),
        el('td', null, String(num(u.packs))),
        el('td', null, String(num(u.orders != null ? u.orders : u.orders_approved))),
      );
      const acts = el('td', 'acts');
      const bt = el('button', 'key small cream', 'Abrir'); bt.type = 'button';
      bt.addEventListener('click', () => abrirUsuario(u.user_id || u.id, u));
      acts.appendChild(bt);
      tr.appendChild(acts);
      tb.appendChild(tr);
    }
    $('u-page').textContent = 'página ' + est.uPage;
    $('u-prev').disabled = est.uPage <= 1;
    $('u-next').disabled = !temMais(r, rows);
    msg($('msg-users'), '');
  } catch (e) { erro($('msg-users'), e); }
}

$('u-buscar').addEventListener('click', () => { est.uQ = $('u-q').value.trim(); est.uPage = 1; carregarUsuarios(); });
$('u-q').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('u-buscar').click(); } });
$('u-prev').addEventListener('click', () => { if (est.uPage > 1) { est.uPage--; carregarUsuarios(); } });
$('u-next').addEventListener('click', () => { est.uPage++; carregarUsuarios(); });

function blocoTabela(titulo, colunas, linhas) {
  const box = el('div');
  box.style.marginTop = 'var(--s3)';
  box.appendChild(el('span', 'legend', titulo));
  if (!linhas.length) { box.appendChild(el('p', 'empty', 'nada aqui')); return box; }
  const w = el('div', 'tbl-wrap recess');
  const t = el('table', 'tbl');
  const thead = document.createElement('thead');
  const trh = document.createElement('tr');
  for (const c of colunas) trh.appendChild(el('th', null, c));
  thead.appendChild(trh);
  const tb = document.createElement('tbody');
  for (const cels of linhas) {
    const tr = document.createElement('tr');
    for (const c of cels) {
      if (c instanceof Node) { const td = el('td', 'acts'); td.appendChild(c); tr.appendChild(td); }
      else tr.appendChild(el('td', null, c == null ? '—' : String(c)));
    }
    tb.appendChild(tr);
  }
  t.append(thead, tb);
  w.appendChild(t);
  box.appendChild(w);
  return box;
}

// ISO -> "AAAA-MM-DD HH:MM" na hora local (o que o admin digita no campo de vencimento)
function dataLocalCurta(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function teclinha(rotulo, classe, fn) {
  const b = el('button', 'key small' + (classe ? ' ' + classe : ''), rotulo);
  b.type = 'button';
  b.addEventListener('click', async () => { b.disabled = true; try { await fn(); } finally { b.disabled = false; } });
  return b;
}

async function abrirUsuario(user_id, resumo) {
  const painel = $('u-det');
  const corpo = $('u-det-body');
  painel.hidden = false;
  corpo.innerHTML = '';
  corpo.appendChild(el('p', 'sub', 'Carregando…'));
  painel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  let d = null;
  try { d = await admin('users.get', { user_id }); }
  catch (e) { corpo.innerHTML = ''; const p = el('p', 'msg err', e.message); corpo.appendChild(p); return; }

  const u = d.user || d.usuario || resumo || {};
  const lic = d.license || u.license || null;
  const chaves = lista(d.keys || d.license_keys || []);
  const maquinas = lista(d.machines || d.activations || []);
  const packs = lista(d.packs || d.entitlements || []);
  const pedidos = lista(d.orders || []);

  $('u-det-legend').textContent = u.email || 'Usuário';
  corpo.innerHTML = '';

  const cab = el('div', 'status-row');
  cab.style.gap = '14px';
  const av = el('span', 'avatar');
  if (u.avatar_path) { const i = document.createElement('img'); i.src = avatarUrl(u.avatar_path); i.alt = ''; av.appendChild(i); }
  else av.textContent = iniciais(u.display_name, u.email);
  const t = el('span');
  t.append(el('b', null, u.display_name || '—'), document.createElement('br'), el('span', 'legend', `${u.email || ''} · criado ${quando(u.created_at)} · último login ${quando(u.last_sign_in_at || u.last_login_at)}`));
  cab.append(av, t);
  corpo.appendChild(cab);

  // licença
  const licBox = el('div');
  licBox.style.marginTop = 'var(--s3)';
  licBox.appendChild(el('span', 'legend', 'Licença'));
  const licLinha = el('div', 'status-row');
  licLinha.style.marginTop = '8px';
  if (lic) {
    licLinha.appendChild(el('span', 'chip' + (lic.status === 'active' ? ' ok' : ' bad'), `${lic.seats} acesso${lic.seats > 1 ? 's' : ''} · ${lic.status === 'active' ? 'ativa' : 'revogada'}${lic.expires_at ? ' · até ' + fmtDate(lic.expires_at) : ' · sem prazo'}`));
    licLinha.appendChild(teclinha('Mudar acessos', 'cream', async () => {
      const v = await perguntar({ titulo: 'Acessos da licença', rotulo: 'Número de acessos', valor: String(lic.seats), texto: 'Quantos computadores esta licença libera ao mesmo tempo.' });
      if (v == null) return;
      const n = parseInt(v, 10);
      if (!(n >= 1 && n <= 99)) return recado('Número de acessos inválido.', 'err');
      await acaoAdmin('licenses.set_seats', { license_id: lic.id, seats: n }, 'Acessos atualizados.', () => abrirUsuario(user_id, resumo));
    }));
    licLinha.appendChild(teclinha('Vencimento', 'cream', async () => {
      const v = await perguntar({
        titulo: 'Vencimento da licença',
        rotulo: 'Data e hora (AAAA-MM-DD HH:MM, hora local) ou "sem prazo"',
        valor: lic.expires_at ? dataLocalCurta(lic.expires_at) : '',
        texto: 'Depois dessa data o plugin fica sem som e a conta pede renovação. "sem prazo" volta a licença para perpétua.',
      });
      if (v == null) return;
      const txt = String(v).trim().toLowerCase();
      if (txt === 'sem prazo') {
        await acaoAdmin('licenses.set_expiry', { license_id: lic.id, clear_expiry: true }, 'Licença sem prazo.', () => abrirUsuario(user_id, resumo));
        return;
      }
      const d = new Date(txt.replace(' ', 'T'));
      if (Number.isNaN(d.getTime())) return recado('Data inválida. Use AAAA-MM-DD HH:MM.', 'err');
      await acaoAdmin('licenses.set_expiry', { license_id: lic.id, expires_at: d.toISOString() }, 'Vencimento atualizado.', () => abrirUsuario(user_id, resumo));
    }));
    if (lic.status === 'active') {
      licLinha.appendChild(teclinha('Revogar licença', null, async () => {
        if (!await confirmar({ titulo: 'Revogar licença', texto: 'O plugin tranca na próxima renovação em todas as máquinas desta licença.', ok: 'Revogar', perigo: true })) return;
        await acaoAdmin('licenses.revoke', { license_id: lic.id }, 'Licença revogada.', () => abrirUsuario(user_id, resumo));
      }));
    } else {
      licLinha.appendChild(teclinha('Restaurar licença', 'green', async () => {
        await acaoAdmin('licenses.restore', { license_id: lic.id }, 'Licença restaurada.', () => abrirUsuario(user_id, resumo));
      }));
    }
  } else {
    licLinha.appendChild(el('span', 'chip', 'sem licença'));
  }
  licLinha.appendChild(teclinha('Conceder licença', 'green', async () => {
    const v = await perguntar({ titulo: 'Conceder licença', rotulo: 'Acessos', valor: '1', texto: 'Cria a licença (ou sobe os acessos) sem pagamento.' });
    if (v == null) return;
    const n = parseInt(v, 10);
    if (!(n >= 1 && n <= 99)) return recado('Número de acessos inválido.', 'err');
    await acaoAdmin('licenses.grant', { user_id, seats: n }, 'Licença concedida.', () => abrirUsuario(user_id, resumo));
  }));
  licBox.appendChild(licLinha);
  corpo.appendChild(licBox);

  // chaves e máquinas
  corpo.appendChild(blocoTabela('Chaves de ativação', ['Código', 'Apelido', 'Status', 'Computador', ''],
    chaves.map((k) => [k.code, k.label, STATUS_CHAVE[k.status] || k.status, k.machine_name, teclinha('Revogar', null, async () => {
      if (!await confirmar({ titulo: 'Revogar chave', texto: 'A chave deixa de funcionar e a vaga fica livre.', ok: 'Revogar', perigo: true })) return;
      await acaoAdmin('keys.revoke', { key_id: k.id }, 'Chave revogada.', () => abrirUsuario(user_id, resumo));
    })])));

  corpo.appendChild(blocoTabela('Computadores', ['Nome', 'Sistema', 'Visto', ''],
    maquinas.map((m) => [m.machine_name, m.os, quando(m.last_seen_at), teclinha('Liberar', null, async () => {
      if (!await confirmar({ titulo: 'Liberar computador', texto: 'A máquina perde o acesso e a vaga fica livre.', ok: 'Liberar', perigo: true })) return;
      await acaoAdmin('machines.release', { activation_id: m.id }, 'Vaga liberada.', () => abrirUsuario(user_id, resumo));
    })])));

  corpo.appendChild(blocoTabela('Packs', ['Pack', 'Origem', 'Quando', ''],
    packs.map((p) => [p.title || (p.packs && p.packs.title) || p.pack_id, ORIGEM_PACK[p.source] || p.source, quando(p.created_at),
      teclinha('Tirar', null, async () => {
        if (!await confirmar({ titulo: 'Tirar o pack', texto: 'O usuário perde o acesso ao download deste pack.', ok: 'Tirar', perigo: true })) return;
        await acaoAdmin('packs.revoke_grant', { user_id, pack_id: p.pack_id || p.id }, 'Pack removido.', () => abrirUsuario(user_id, resumo));
      })])));

  const conceder = el('div', 'cupom');
  conceder.style.marginTop = '14px';
  const lab = el('label');
  lab.appendChild(el('span', 'legend', 'Conceder pack'));
  const sel = el('select', 'recess');
  sel.appendChild(el('option', null, est.packs.length ? 'escolha um pack' : 'nenhum pack cadastrado'));
  for (const p of est.packs) {
    const o = el('option', null, p.title);
    o.value = p.id;
    sel.appendChild(o);
  }
  lab.appendChild(sel);
  conceder.appendChild(lab);
  conceder.appendChild(teclinha('Conceder', 'green', async () => {
    if (!sel.value) return recado('Escolha um pack.', 'err');
    await acaoAdmin('packs.grant', { user_id, pack_id: sel.value }, 'Pack concedido.', () => abrirUsuario(user_id, resumo));
  }));
  corpo.appendChild(conceder);

  corpo.appendChild(blocoTabela('Pedidos', ['Quando', 'Item', 'Valor', 'Status'],
    pedidos.map((o) => [dataHora(o.created_at), o.kind === 'pack' ? 'pack' : (o.plan_id || 'plano'), BRL(o.amount_cents || 0), STATUS_PEDIDO[o.status] || o.status])));
}

async function acaoAdmin(action, corpo, ok, depois) {
  try {
    await admin(action, corpo);
    recado(ok, 'ok');
    if (depois) await depois();
  } catch (e) { recado(e.message, 'err'); }
}

// ============================ licenças ============================
async function carregarLicencas() {
  msg($('msg-lics'), 'Buscando…');
  const tb = $('tbl-lics').querySelector('tbody');
  tb.innerHTML = '';
  let rows = [];
  let r = null;
  try {
    // o contrato não tem `licenses.list`: a lista sai de `users.list`, que já traz
    // a licença de cada usuário (id, acessos, vagas em uso e status)
    r = await admin('users.list', { q: est.lQ || undefined, page: est.lPage });
    rows = lista(r)
      .filter((u) => u.license)
      .map((u) => ({
        id: u.license.id, user_id: u.user_id, email: u.email, display_name: u.display_name,
        seats: u.license.seats, used: u.license.used, status: u.license.status,
      }));
    if (est.lStatus) rows = rows.filter((l) => l.status === est.lStatus);
  } catch (e) {
    erro($('msg-lics'), e);
    $('l-empty').hidden = false;
    return;
  }
  $('l-empty').hidden = rows.length > 0;
  for (const l of rows) {
    const tr = document.createElement('tr');
    tr.append(
      el('td', null, l.email || l.display_name || l.user_id),
      el('td', null, String(l.seats)),
      el('td', null, l.used != null ? `${l.used} de ${l.seats}` : '—'),
      el('td', null, l.status === 'active' ? 'ativa' : 'revogada'),
    );
    const acts = el('td', 'acts');
    acts.appendChild(teclinha('Vagas', 'cream', () => abrirLicenca(l)));
    acts.appendChild(teclinha(l.status === 'active' ? 'Revogar' : 'Restaurar', l.status === 'active' ? null : 'green', async () => {
      if (l.status === 'active' && !await confirmar({ titulo: 'Revogar licença', texto: 'Todas as máquinas desta licença trancam na próxima renovação.', ok: 'Revogar', perigo: true })) return;
      await acaoAdmin(l.status === 'active' ? 'licenses.revoke' : 'licenses.restore', { license_id: l.id }, 'Licença atualizada.', carregarLicencas);
    }));
    tr.appendChild(acts);
    tb.appendChild(tr);
  }
  $('l-page').textContent = 'página ' + est.lPage;
  $('l-prev').disabled = est.lPage <= 1;
  $('l-next').disabled = !temMais(r, lista(r));
  msg($('msg-lics'), rows.length ? '' : 'Nenhum usuário com licença nesta página.');
}

async function abrirLicenca(l) {
  const painel = $('l-det');
  const corpo = $('l-det-body');
  painel.hidden = false;
  corpo.innerHTML = '';
  $('l-det-legend').textContent = `Vagas · ${l.email || (l.user && l.user.email) || l.id}`;
  painel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  let chaves = [], maquinas = [];
  try {
    const d = await admin('users.get', { user_id: l.user_id });
    chaves = lista(d.keys || d.license_keys || []);
    maquinas = lista(d.machines || d.activations || []);
  } catch {
    try {
      chaves = await select('license_keys', `select=id,code,label,status,machine_name,os,last_seen_at&license_id=eq.${l.id}`);
      maquinas = await select('activations', `select=id,machine_name,os,last_seen_at&license_id=eq.${l.id}&revoked_at=is.null`);
    } catch { corpo.appendChild(el('p', 'msg err', 'Não consegui ler as vagas desta licença.')); return; }
  }
  corpo.appendChild(blocoTabela('Chaves', ['Código', 'Apelido', 'Status', 'Computador', ''],
    chaves.map((k) => [k.code, k.label, STATUS_CHAVE[k.status] || k.status, k.machine_name, teclinha('Revogar', null, async () => {
      if (!await confirmar({ titulo: 'Revogar chave', texto: 'A chave deixa de funcionar e a vaga fica livre.', ok: 'Revogar', perigo: true })) return;
      await acaoAdmin('keys.revoke', { key_id: k.id }, 'Chave revogada.', () => abrirLicenca(l));
    })])));
  corpo.appendChild(blocoTabela('Computadores', ['Nome', 'Sistema', 'Visto', ''],
    maquinas.map((m) => [m.machine_name, m.os, quando(m.last_seen_at), teclinha('Liberar', null, async () => {
      if (!await confirmar({ titulo: 'Liberar computador', texto: 'A máquina perde o acesso e a vaga fica livre.', ok: 'Liberar', perigo: true })) return;
      await acaoAdmin('machines.release', { activation_id: m.id }, 'Vaga liberada.', () => abrirLicenca(l));
    })])));
}

$('l-buscar').addEventListener('click', () => { est.lQ = $('l-q').value.trim(); est.lStatus = $('l-status').value; est.lPage = 1; carregarLicencas(); });
$('l-prev').addEventListener('click', () => { if (est.lPage > 1) { est.lPage--; carregarLicencas(); } });
$('l-next').addEventListener('click', () => { est.lPage++; carregarLicencas(); });

// ============================ pagamentos ============================
async function carregarPedidos() {
  msg($('msg-orders'), 'Buscando…');
  try {
    const r = await admin('orders.list', {
      status: $('o-status').value || undefined, kind: $('o-kind').value || undefined, page: est.oPage,
    });
    const rows = lista(r);
    const tb = $('tbl-orders').querySelector('tbody');
    tb.innerHTML = '';
    $('o-empty').hidden = rows.length > 0;
    for (const o of rows) {
      const tr = document.createElement('tr');
      const item = o.kind === 'pack'
        ? 'Pack · ' + ((o.pack && o.pack.title) || o.pack_title || o.pack_id || '')
        : `${o.is_upgrade ? 'Upgrade · ' : ''}${o.plan_id || 'plano'}${o.seats ? ` · ${o.seats} acessos` : ''}`;
      const st = el('td', null, STATUS_PEDIDO[o.status] || o.status);
      st.style.color = corStatus(o.status);
      tr.append(
        el('td', null, dataHora(o.created_at)),
        el('td', null, o.email || (o.user && o.user.email) || o.user_id || '—'),
        el('td', null, item),
        el('td', null, BRL(o.amount_cents || 0)),
        el('td', null, o.discount_cents ? '− ' + BRL(o.discount_cents) : '—'),
        el('td', null, (o.coupon && o.coupon.code) || o.coupon_code || '—'),
        st,
      );
      const acts = el('td', 'acts');
      if (o.status === 'approved') {
        acts.appendChild(teclinha('Marcar estornado', null, async () => {
          if (!await confirmar({
            titulo: 'Marcar como estornado',
            texto: 'Só marca o pedido. Revogar a licença ou tirar o pack é ação separada, na aba do usuário.',
            ok: 'Marcar', perigo: true,
          })) return;
          await acaoAdmin('orders.mark_refunded', { order_id: o.id }, 'Pedido marcado como estornado.', carregarPedidos);
        }));
      }
      tr.appendChild(acts);
      tb.appendChild(tr);
    }
    $('o-page').textContent = 'página ' + est.oPage;
    $('o-prev').disabled = est.oPage <= 1;
    $('o-next').disabled = !temMais(r, rows);
    msg($('msg-orders'), '');
  } catch (e) { erro($('msg-orders'), e); }
}

$('o-buscar').addEventListener('click', () => { est.oPage = 1; carregarPedidos(); });
$('o-prev').addEventListener('click', () => { if (est.oPage > 1) { est.oPage--; carregarPedidos(); } });
$('o-next').addEventListener('click', () => { est.oPage++; carregarPedidos(); });

// ============================ promoções ============================
const paraISO = (v) => (v ? new Date(v).toISOString() : null);
const paraLocal = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

async function carregarCupons() {
  try {
    const rows = lista(await admin('coupons.list', {}));
    const tb = $('tbl-cupons').querySelector('tbody');
    tb.innerHTML = '';
    $('c-empty').hidden = rows.length > 0;
    for (const c of rows) {
      const tr = document.createElement('tr');
      tr.append(
        el('td', null, c.code),
        el('td', null, c.kind === 'percent' ? c.value + '%' : BRL(c.value)),
        el('td', null, { all: 'tudo', plans: 'planos', packs: 'packs' }[c.applies_to] || c.applies_to),
        el('td', null, `${c.valid_from ? dataHora(c.valid_from) : 'já vale'} → ${c.valid_until ? dataHora(c.valid_until) : 'sem fim'}`),
        el('td', null, `${c.uses || 0}${c.max_uses ? ' de ' + c.max_uses : ''}`),
        el('td', null, c.active ? 'ativo' : 'desligado'),
      );
      const acts = el('td', 'acts');
      acts.appendChild(teclinha(c.active ? 'Desligar' : 'Ligar', c.active ? null : 'green', () =>
        acaoAdmin('coupons.update', { id: c.id, coupon_id: c.id, active: !c.active }, 'Cupom atualizado.', carregarCupons)));
      acts.appendChild(teclinha('Apagar', null, async () => {
        if (!await confirmar({ titulo: 'Apagar cupom', texto: `O cupom <b>${c.code}</b> sai do ar. Se já foi usado, ele só é desligado (o histórico fica).`, ok: 'Apagar', perigo: true })) return;
        await acaoAdmin('coupons.delete', { id: c.id, coupon_id: c.id }, 'Cupom apagado.', carregarCupons);
      }));
      tr.appendChild(acts);
      tb.appendChild(tr);
    }
  } catch (e) { erro($('msg-cupom'), e); }
}

$('form-cupom').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const corpo = {
    code: f.code.value.trim().toUpperCase(),
    kind: f.kind.value,
    value: parseInt(f.value.value, 10),
    applies_to: f.applies_to.value,
    valid_from: paraISO(f.valid_from.value),
    valid_until: paraISO(f.valid_until.value),
    max_uses: f.max_uses.value ? parseInt(f.max_uses.value, 10) : null,
    active: true,
  };
  if (!corpo.code) return msg($('msg-cupom'), 'Escreva o código do cupom.', 'err');
  if (corpo.kind === 'percent' && !(corpo.value >= 1 && corpo.value <= 90)) return msg($('msg-cupom'), 'Porcentagem de 1 a 90.', 'err');
  if (corpo.kind === 'fixed' && !(corpo.value >= 1)) return msg($('msg-cupom'), 'Valor fixo em centavos, a partir de 1.', 'err');
  msg($('msg-cupom'), 'Criando…');
  try {
    await admin('coupons.create', corpo);
    f.reset();
    msg($('msg-cupom'), 'Cupom criado.', 'ok');
    await carregarCupons();
  } catch (err) { erro($('msg-cupom'), err); }
});

function linhaPromo(item, { plano }) {
  const box = el('div', 'recess');
  box.style.padding = '14px';
  const head = el('div', 'adm-head');
  head.append(el('b', null, plano ? `${item.name} · ${item.seats} acesso${item.seats > 1 ? 's' : ''}` : item.title));
  box.appendChild(head);
  const form = el('div', 'grid-form');
  form.style.marginTop = '10px';
  const campo = (rotulo, tipo, valor, attrs = {}) => {
    const l = el('label');
    l.appendChild(el('span', 'legend', rotulo));
    const i = el('input', 'recess');
    i.type = tipo; i.value = valor == null ? '' : valor;
    Object.assign(i, attrs);
    l.appendChild(i);
    form.appendChild(l);
    return i;
  };
  const preco = campo('Preço (centavos)', 'number', item.price_cents, { min: 1 });
  const promo = campo('Promocional (centavos)', 'number', item.promo_price_cents ?? '', { min: 1, placeholder: 'sem promoção' });
  const de = campo('Começa', 'datetime-local', paraLocal(item.promo_starts_at));
  const ate = campo('Termina', 'datetime-local', paraLocal(item.promo_ends_at));
  const acao = el('div');
  acao.style.display = 'flex'; acao.style.alignItems = 'end';
  const aviso2 = el('p', 'msg');
  aviso2.style.fontSize = 'var(--t-small)';
  acao.appendChild(teclinha('Salvar', 'orange', async () => {
    const p = parseInt(preco.value, 10);
    const pp = promo.value ? parseInt(promo.value, 10) : null;
    if (!(p >= 1)) return msg(aviso2, 'Preço inválido.', 'err');
    if (pp != null && pp >= p) return msg(aviso2, 'O preço promocional tem de ser menor que o cheio.', 'err');
    try {
      if (plano) {
        if (p !== item.price_cents) await admin('plans.update_price', { plan_id: item.id, price_cents: p });
        await admin('plans.update_promo', { plan_id: item.id, promo_price_cents: pp, promo_starts_at: paraISO(de.value), promo_ends_at: paraISO(ate.value) });
      } else {
        await admin('packs.update', {
          id: item.id, price_cents: p, promo_price_cents: pp,
          promo_starts_at: paraISO(de.value), promo_ends_at: paraISO(ate.value),
        });
      }
      msg(aviso2, 'Salvo.', 'ok');
      item.price_cents = p; item.promo_price_cents = pp;
    } catch (e) { erro(aviso2, e); }
  }));
  form.appendChild(acao);
  box.append(form, aviso2);
  return box;
}

async function carregarPromocoes() {
  const gp = $('promo-planos');
  gp.innerHTML = '';
  for (const p of est.plans) gp.appendChild(linhaPromo(p, { plano: true }));
  const gk = $('promo-packs');
  gk.innerHTML = '';
  $('pp-empty').hidden = est.packs.length > 0;
  for (const p of est.packs) gk.appendChild(linhaPromo(p, { plano: false }));
  await carregarCupons();
}

// ============================ packs ============================
async function carregarPacks() {
  msg($('msg-packs'), 'Buscando…');
  try {
    try { est.packs = lista(await admin('packs.list', {})); }
    catch (e) { if (e.status === 404 || e.status === 400) est.packs = await loadPacks(); else throw e; }
    const tb = $('tbl-packs').querySelector('tbody');
    tb.innerHTML = '';
    $('p-empty').hidden = est.packs.length > 0;
    est.packs.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    est.packs.forEach((p, i) => {
      const tr = document.createElement('tr');
      const nome = el('td');
      const who = el('div', 'who');
      const cap = el('span', 'avatar mini');
      if (p.cover_path) { const img = document.createElement('img'); img.src = publicUrl('pack-covers', p.cover_path); img.alt = ''; cap.appendChild(img); }
      else cap.textContent = 'BR';
      const t = el('span', 't');
      t.append(el('b', null, p.title || '—'), el('span', 'legend', p.artist || p.slug || ''));
      who.append(cap, t);
      nome.appendChild(who);
      const precoTxt = p.promo_price_cents ? `${BRL(p.promo_price_cents)} (de ${BRL(p.price_cents)})` : BRL(p.price_cents);
      const arquivos = [p.cover_path ? 'capa' : null, p.preview_path ? 'prévia' : null,
        p.file_path ? 'zip' + (p.file_size_bytes ? ' ' + tamanho(p.file_size_bytes) : '') : null].filter(Boolean).join(' · ') || '—';
      tr.append(el('td', null, String(p.sort ?? 0)), nome, el('td', null, TIPOS_PACK[p.kind] || p.kind || '—'),
        el('td', null, precoTxt), el('td', null, arquivos), el('td', null, p.active ? 'na loja' : 'rascunho'));
      const acts = el('td', 'acts');
      acts.appendChild(teclinha('Editar', 'cream', () => abrirEditor(p)));
      acts.appendChild(teclinha(p.active ? 'Desativar' : 'Ativar', p.active ? null : 'green', async () => {
        if (p.active && !await confirmar({ titulo: 'Tirar da loja', texto: `<b>${p.title}</b> sai da vitrine. Quem já comprou continua baixando.`, ok: 'Tirar', perigo: true })) return;
        await acaoAdmin('packs.update', { id: p.id, active: !p.active }, 'Pack atualizado.', carregarPacks);
      }));
      if (i > 0) acts.appendChild(teclinha('↑', null, () => trocarOrdem(p, est.packs[i - 1])));
      if (i < est.packs.length - 1) acts.appendChild(teclinha('↓', null, () => trocarOrdem(p, est.packs[i + 1])));
      tr.appendChild(acts);
      tb.appendChild(tr);
    });
    msg($('msg-packs'), '');
  } catch (e) { erro($('msg-packs'), e); }
}

async function trocarOrdem(a, b) {
  const sa = a.sort ?? 0, sb = b.sort ?? 0;
  try {
    await admin('packs.update', { id: a.id, sort: sb === sa ? sb - 1 : sb });
    await admin('packs.update', { id: b.id, sort: sa === sb ? sa + 1 : sa });
    await carregarPacks();
  } catch (e) { recado(e.message, 'err'); }
}

function abrirEditor(p) {
  est.packAtual = p || null;
  const f = $('form-pack');
  $('p-editor').hidden = false;
  $('p-editor-legend').textContent = p ? 'Editar · ' + (p.title || '') : 'Novo pack';
  f.title.value = p ? p.title || '' : '';
  f.artist.value = p ? p.artist || '' : '';
  f.slug.value = p ? p.slug || '' : '';
  f.kind.value = p ? p.kind || 'drums' : 'drums';
  f.price_cents.value = p ? p.price_cents : 2990;
  f.promo_price_cents.value = p && p.promo_price_cents != null ? p.promo_price_cents : '';
  f.promo_starts_at.value = p ? paraLocal(p.promo_starts_at) : '';
  f.promo_ends_at.value = p ? paraLocal(p.promo_ends_at) : '';
  f.sort.value = p ? p.sort ?? 0 : 0;
  f.active.value = p && p.active ? 'true' : 'false';
  f.description.value = p ? p.description || '' : '';
  f.contents.value = JSON.stringify((p && p.contents) || {}, null, 0);
  msg($('msg-pack'), '');
  pintarUploads();
  $('p-editor').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

$('p-novo').addEventListener('click', () => abrirEditor(null));
$('p-fechar').addEventListener('click', () => { $('p-editor').hidden = true; est.packAtual = null; });

$('form-pack').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  let contents = {};
  try { contents = JSON.parse(f.contents.value || '{}'); }
  catch { return msg($('msg-pack'), 'O campo de conteúdo não é um JSON válido.', 'err'); }
  const preco = parseInt(f.price_cents.value, 10);
  const promo = f.promo_price_cents.value ? parseInt(f.promo_price_cents.value, 10) : null;
  if (!(preco >= 1)) return msg($('msg-pack'), 'Preço inválido.', 'err');
  if (promo != null && promo >= preco) return msg($('msg-pack'), 'O preço promocional tem de ser menor que o cheio.', 'err');
  const corpo = {
    title: f.title.value.trim(), artist: f.artist.value.trim(), slug: f.slug.value.trim().toLowerCase(),
    kind: f.kind.value, price_cents: preco, promo_price_cents: promo,
    promo_starts_at: paraISO(f.promo_starts_at.value), promo_ends_at: paraISO(f.promo_ends_at.value),
    sort: parseInt(f.sort.value, 10) || 0, active: f.active.value === 'true',
    description: f.description.value.trim(), contents,
  };
  msg($('msg-pack'), 'Salvando…');
  try {
    if (est.packAtual) {
      await admin('packs.update', { id: est.packAtual.id, ...corpo });
      msg($('msg-pack'), 'Pack salvo.', 'ok');
    } else {
      const r = await admin('packs.create', corpo);
      const novo = r.pack || r;
      est.packAtual = { ...corpo, id: novo.id || novo.pack_id };
      msg($('msg-pack'), 'Pack criado. Agora envie a capa, a prévia e o .zip.', 'ok');
      pintarUploads();
    }
    await carregarPacks();
  } catch (err) { erro($('msg-pack'), err); }
});

const SLOTS = [
  { slot: 'cover', box: 'upl-cover', rotulo: 'Capa (jpg/png/webp quadrada)', accept: 'image/*', campo: 'cover_path' },
  { slot: 'preview', box: 'upl-preview', rotulo: 'Prévia (mp3/ogg curto)', accept: 'audio/*', campo: 'preview_path' },
  { slot: 'file', box: 'upl-file', rotulo: 'Arquivo do pack (.zip)', accept: '.zip,application/zip', campo: 'file_path' },
];

function pintarUploads() {
  const zona = $('p-uploads');
  zona.hidden = !est.packAtual;
  if (!est.packAtual) return;
  for (const s of SLOTS) {
    const box = $(s.box);
    box.innerHTML = '';
    box.appendChild(el('span', 'legend', s.rotulo));
    const row = el('div', 'row');
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = s.accept;
    const bt = el('button', 'key small cream', 'Escolher arquivo'); bt.type = 'button';
    bt.addEventListener('click', () => inp.click());
    const atual = est.packAtual[s.campo];
    const nome = el('span', 'legend', atual ? String(atual).split('/').pop() : 'nada enviado');
    row.append(bt, inp, nome);
    const bar = el('div', 'bar');
    const fill = el('i');
    bar.appendChild(fill);
    const estado = el('p', 'msg');
    estado.style.fontSize = 'var(--t-small)';
    box.append(row, bar, estado);
    inp.addEventListener('change', async () => {
      const file = inp.files && inp.files[0];
      inp.value = '';
      if (!file) return;
      try {
        await enviarArquivo(s, file, fill, estado);
        nome.textContent = file.name;
        await carregarPacks();
      } catch (e) { msg(estado, e.message, 'err'); fill.style.width = '0%'; }
    });
  }
}

// o servidor só aceita nome de arquivo simples: letras, números, ponto, hífen e _
function nomeSeguro(nome) {
  const limpo = String(nome).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9._-]/g, '-').replace(/^[^A-Za-z0-9]+/, '').replace(/\.\.+/g, '.');
  return limpo.slice(0, 100) || 'arquivo';
}

function urlAbsoluta(u) {
  if (!u) return '';
  return /^https?:\/\//.test(u) ? u : SUPABASE_URL.replace(/\/$/, '') + (u.startsWith('/') ? '' : '/') + u;
}

async function enviarArquivo(s, file, fill, estado) {
  msg(estado, 'Pedindo a URL de upload…');
  const r = await admin('packs.upload_url', {
    pack_id: est.packAtual.id, slot: s.slot, filename: nomeSeguro(file.name),
    content_type: file.type || 'application/octet-stream',
    size_bytes: file.size,
  });
  const dados = r.data || r;
  const url = urlAbsoluta(dados.url || dados.signed_url || dados.signedUrl || dados.signedURL);
  const token = dados.token || null;
  const path = dados.path || dados.key || null;
  if (!url) throw new Error('O servidor não devolveu a URL de upload.');

  msg(estado, 'Enviando…');
  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    xhr.setRequestHeader('content-type', file.type || 'application/octet-stream');
    xhr.setRequestHeader('x-upsert', 'true');
    if (token && !/[?&]token=/.test(url)) xhr.setRequestHeader('authorization', 'Bearer ' + token);
    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const pct = Math.round((e.loaded / e.total) * 100);
      fill.style.width = pct + '%';
      msg(estado, `Enviando… ${pct}%`);
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300
      ? resolve()
      : reject(new Error(`O upload falhou (${xhr.status}).`)));
    xhr.onerror = () => reject(new Error('O upload falhou: sem rede ou CORS.'));
    xhr.send(file);
  });
  fill.style.width = '100%';

  // o caminho e o tamanho já foram gravados pelo servidor ao assinar a URL
  const guardado = dados.stored_path || (dados.bucket && path ? `${dados.bucket}/${path}` : path);
  if (guardado) est.packAtual[s.campo] = guardado;
  if (s.slot === 'file') est.packAtual.file_size_bytes = file.size;
  msg(estado, 'Enviado.', 'ok');
}

// ============================ início ============================
(async () => {
  abas($('tabs'), {
    '#visao': { node: $('pane-visao'), abrir: () => { if (pronto) carregarVisao(); } },
    '#usuarios': { node: $('pane-usuarios'), abrir: () => { if (pronto) carregarUsuarios(); } },
    '#licencas': { node: $('pane-licencas'), abrir: () => { if (pronto) carregarLicencas(); } },
    '#pagamentos': { node: $('pane-pagamentos'), abrir: () => { if (pronto) carregarPedidos(); } },
    '#promocoes': { node: $('pane-promocoes'), abrir: () => { if (pronto) carregarPromocoes(); } },
    '#packs': { node: $('pane-packs'), abrir: () => { if (pronto) carregarPacks(); } },
  }, '#visao');

  await montarTopo();
  const session = await getSession();
  if (!session) { location.replace('conta.html'); return; }
  est.session = session;
  $('quem').textContent = session.user.email;

  const ok = await ehAdmin(session.user.id, { cache: false });
  if (!ok) {
    $('status-text').textContent = 'sem acesso';
    $('bloqueio').hidden = false;
    aviso('Esta conta não é administradora. Voltando para a home…', 'err');
    setTimeout(() => location.replace('./'), 2200);
    return;
  }

  $('status-text').textContent = 'admin · ' + session.user.email;
  $('status-led').classList.add('on');
  $('app').hidden = false;

  try { est.plans = await loadPlans(); } catch { est.plans = []; }
  try { est.packs = lista(await admin('packs.list', {})); } catch { est.packs = await loadPacks(); }

  pronto = true;
  const hash = location.hash || '#visao';
  const mapa = {
    '#visao': carregarVisao, '#usuarios': carregarUsuarios, '#licencas': carregarLicencas,
    '#pagamentos': carregarPedidos, '#promocoes': carregarPromocoes, '#packs': carregarPacks,
  };
  (mapa[hash] || carregarVisao)();
})();
