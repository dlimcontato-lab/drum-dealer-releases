// Página da conta: entrar / criar conta, licença e máquinas, compra pelo Mercado Pago.
import { signIn, signUp, signOut, getSession, select, call, loadPlans, formatBRL, ApiError, DOWNLOADS } from './dd-api.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const planoPedido = params.get('plano');
const pagamento = params.get('pagamento');
const baixarPedido = params.get('baixar');   // 'mac' | 'win': veio do botão de download

let plans = [];

function aviso(texto, tipo = '') {
  const el = $('aviso');
  if (!texto) { el.hidden = true; return; }
  el.hidden = false;
  el.innerHTML = texto;
  el.style.color = tipo === 'err' ? 'var(--led-on)' : tipo === 'ok' ? 'var(--led-green)' : '';
}

function setStatus(texto, on) {
  $('status-text').textContent = texto;
  $('status-led').classList.toggle('on', !!on);
}

function msg(id, texto, tipo = '') {
  const el = $(id);
  el.textContent = texto;
  el.className = 'msg' + (tipo ? ' ' + tipo : '');
}

function quando(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 90) return 'agora';
  if (diff < 3600) return `há ${Math.round(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.round(diff / 3600)} h`;
  return d.toLocaleDateString('pt-BR');
}

function statusPedido(s) {
  return { pending: 'aguardando pagamento', approved: 'pago', rejected: 'recusado', refunded: 'estornado', cancelled: 'cancelado' }[s] || s;
}

// ---------- compra ----------
async function comprar(planId) {
  msg('msg-buy', 'Abrindo o pagamento…');
  try {
    const { init_point } = await call('checkout', { plan_id: planId });
    location.href = init_point;
  } catch (e) {
    if (e.code === 'mp_not_configured') msg('msg-buy', 'O pagamento online ainda não está ligado. Sua conta já existe: fale com a gente informando este e-mail e a licença é liberada nela.', '');
    else msg('msg-buy', e.message, 'err');
  }
}

// ---------- conta ----------
async function renderConta(session) {
  $('view-auth').hidden = true;
  $('view-account').hidden = false;
  $('titulo').textContent = 'Sua conta';
  $('who').textContent = session.user.email;

  const [lics, acts, orders] = await Promise.all([
    select('licenses', 'select=id,seats,status,created_at&limit=1'),
    select('activations', 'select=id,machine_name,os,plugin_version,last_seen_at,revoked_at&revoked_at=is.null&order=last_seen_at.desc'),
    select('orders', 'select=id,plan_id,seats,amount_cents,status,created_at&order=created_at.desc&limit=8'),
  ]);
  const lic = lics.find((l) => l.status === 'active');
  const seats = lic ? lic.seats : 0;

  // acessos como LEDs
  const sockets = Math.max(5, seats);
  $('seats').innerHTML = Array.from({ length: sockets }, (_, i) => `<span class="socket${i < seats ? ' on' : ''}"></span>`).join('')
    + `<span class="legend">${seats ? `${seats} acesso${seats > 1 ? 's' : ''}` : 'sem licença'}</span>`;

  if (lic) {
    setStatus(session.user.email + ' · licença ativa', true);
    $('lic-text').textContent = `${acts.length} de ${seats} acesso${seats > 1 ? 's' : ''} em uso.`;
    $('lic-sub').textContent = acts.length >= seats
      ? 'Todos os acessos ocupados. Para usar em outro computador, desative um abaixo ou amplie a licença.'
      : 'Entre com esta conta dentro do plugin em qualquer computador: ele ocupa um acesso automaticamente.';
  } else {
    setStatus(session.user.email + ' · sem licença', false);
    $('lic-text').textContent = 'Esta conta ainda não tem licença.';
    $('lic-sub').textContent = 'Escolha um plano ao lado. O pagamento é único e a licença aparece aqui assim que o Mercado Pago confirmar.';
  }

  // máquinas
  const ul = $('machines');
  ul.innerHTML = '';
  $('machines-empty').hidden = !(lic && acts.length === 0);
  for (const a of acts) {
    const li = document.createElement('li');
    li.className = 'recess';
    li.innerHTML = `<span class="who"><b></b><span class="legend"></span></span>`;
    li.querySelector('b').textContent = a.machine_name || 'Computador';
    li.querySelector('.legend').textContent = `${a.os || ''} · v${a.plugin_version || '?'} · visto ${quando(a.last_seen_at)}`;
    const btn = document.createElement('button');
    btn.className = 'key small'; btn.type = 'button'; btn.textContent = 'Desativar';
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try { await call('deactivate', { activation_id: a.id }); await renderConta(session); }
      catch (e) { aviso(e.message, 'err'); btn.disabled = false; }
    });
    li.appendChild(btn);
    ul.appendChild(li);
  }

  // comprar / ampliar
  const up = $('upgrade');
  up.innerHTML = '';
  const opcoes = plans.filter((p) => p.seats > seats);
  $('buy-title').textContent = lic ? 'Ampliar' : 'Comprar';
  if (opcoes.length === 0) {
    $('buy-text').textContent = 'Você já tem o maior plano. Precisa de mais acessos? Escreva pra gente.';
  } else {
    $('buy-text').textContent = lic
      ? `Subir de ${seats} para mais acessos é pagar o plano maior; a licença passa a valer o novo número de computadores.`
      : 'Pagamento único pelo Mercado Pago (Pix, cartão ou boleto). A licença cai nesta conta na hora da confirmação.';
    for (const p of opcoes) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'key ' + (p.badge ? 'orange' : 'cream');
      b.innerHTML = `<span></span><span></span>`;
      b.firstChild.textContent = `${p.name} · ${p.seats} acesso${p.seats > 1 ? 's' : ''}`;
      b.lastChild.textContent = `R$ ${formatBRL(p.price_cents)}`;
      b.addEventListener('click', () => comprar(p.id));
      up.appendChild(b);
    }
  }

  // pedidos
  const ol = $('orders');
  ol.innerHTML = '';
  $('orders-empty').hidden = orders.length > 0;
  for (const o of orders) {
    const p = plans.find((x) => x.id === o.plan_id);
    const li = document.createElement('li');
    li.className = 'recess';
    li.innerHTML = `<span class="who"><b></b><span class="legend"></span></span><span class="legend"></span>`;
    li.querySelector('b').textContent = `${p ? p.name : o.plan_id} · ${o.seats} acesso${o.seats > 1 ? 's' : ''} · R$ ${formatBRL(o.amount_cents)}`;
    li.querySelector('.who .legend').textContent = new Date(o.created_at).toLocaleString('pt-BR');
    li.lastChild.textContent = statusPedido(o.status);
    if (o.status === 'approved') li.lastChild.style.color = 'var(--led-green)';
    ol.appendChild(li);
  }

  return { lic, acts, orders };
}

// depois do retorno do Mercado Pago, a licença pode levar alguns segundos para cair
async function esperarLicenca(session) {
  for (let i = 0; i < 12; i++) {
    const { lic } = await renderConta(session);
    if (lic) { aviso('Pagamento confirmado. Sua licença está ativa: baixe o instalador e entre com esta conta no plugin.', 'ok'); return; }
    await new Promise((r) => setTimeout(r, 2500));
  }
  aviso('O pagamento foi recebido mas a licença ainda não apareceu. Recarregue a página em um minuto; se não aparecer, escreva pra gente com o e-mail da conta.');
}

// ---------- auth ----------
function renderAuth() {
  $('view-account').hidden = true;
  $('view-auth').hidden = false;
  $('titulo').textContent = planoPedido ? 'Entre ou crie a conta para comprar'
    : baixarPedido ? 'Crie sua conta para baixar' : 'Sua conta';
  if (baixarPedido) aviso('O download pede uma conta: é a mesma que você vai usar dentro do plugin. Leva 10 segundos, e o instalador começa a baixar sozinho depois.');
  setStatus('Não conectado', false);
}

$('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  msg('msg-login', 'Entrando…');
  try {
    const s = await signIn(f.email.value.trim(), f.password.value);
    msg('msg-login', '');
    await depoisDoLogin(s);
  } catch (err) { msg('msg-login', err.message, 'err'); }
});

$('form-signup').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  if (f.password.value.length < 8) return msg('msg-signup', 'A senha precisa ter pelo menos 8 caracteres.', 'err');
  if (f.password.value !== f.confirm.value) return msg('msg-signup', 'As senhas não são iguais.', 'err');
  msg('msg-signup', 'Criando…');
  try {
    let s = await signUp(f.email.value.trim(), f.password.value);
    if (!s) s = await signIn(f.email.value.trim(), f.password.value);
    msg('msg-signup', '');
    await depoisDoLogin(s);
  } catch (err) { msg('msg-signup', err.message, 'err'); }
});

$('btn-logout').addEventListener('click', async () => {
  await signOut();
  location.href = 'conta.html';
});

async function depoisDoLogin(session) {
  const { lic } = await renderConta(session);
  if (planoPedido && plans.some((p) => p.id === planoPedido)) {
    history.replaceState(null, '', 'conta.html');
    await comprar(planoPedido);
  } else if (baixarPedido && DOWNLOADS[baixarPedido]) {
    history.replaceState(null, '', 'conta.html');
    const a = document.createElement('a');
    a.href = DOWNLOADS[baixarPedido]; a.download = ''; document.body.appendChild(a); a.click(); a.remove();
    if (lic) {
      aviso(`O instalador para ${baixarPedido === 'mac' ? 'Mac' : 'Windows'} está baixando. Instale e entre com esta conta no plugin.`, 'ok');
    } else {
      // sem licença o plugin abre em silêncio: o caminho volta sempre para o pagamento
      aviso(`O instalador para ${baixarPedido === 'mac' ? 'Mac' : 'Windows'} está baixando. Pra destravar o plugin, escolha um plano abaixo e pague; ele libera na hora.`, 'ok');
      $('panel-buy').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

// ---------- início ----------
(async () => {
  try { plans = await loadPlans(); } catch { plans = []; }
  const session = await getSession();
  if (!session) { renderAuth(); return; }
  try {
    if (pagamento === 'sucesso' || pagamento === 'pendente') {
      history.replaceState(null, '', 'conta.html');
      if (pagamento === 'pendente') aviso('Pagamento em análise (Pix ou boleto levam um pouco). A licença aparece aqui assim que o Mercado Pago confirmar.');
      await esperarLicenca(session);
    } else {
      if (pagamento === 'falha') { history.replaceState(null, '', 'conta.html'); aviso('O pagamento não foi concluído. Você pode tentar de novo abaixo.', 'err'); }
      await depoisDoLogin(session);
    }
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) { await signOut(); renderAuth(); }
    else aviso(e.message, 'err');
  }
})();
