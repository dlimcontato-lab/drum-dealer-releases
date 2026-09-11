// Página da conta: entrar / criar conta e cinco abas — perfil, licença (vagas e
// chaves), meus packs, pedidos e segurança. Contrato:
// ~/Sistema AI/drum-dealer-backend/docs/SPEC-conta-loja-admin.md
import {
  signIn, signUp, signOut, getSession, select, call, loadPlans, loadProfile, saveProfile,
  uploadAvatar, changePassword, logoutAll, seats as fnSeats, quote, packDownload, loadPacks,
  precoEfetivo, BRL, ApiError, DOWNLOADS, TIPOS_PACK, publicUrl, primeiroNome,
} from './dd-api.js?v=20260911p';
import { montarTopo, avatarNode } from './dd-topo.js?v=20260911p';
import {
  $, el, msg, aviso as avisoUI, confirmar, perguntar, recado, abas, quando, dataHora,
  STATUS_PEDIDO, corStatus, tamanho, copiar, recortarQuadrado,
} from './dd-ui.js?v=20260911p';

const params = new URLSearchParams(location.search);
const planoPedido = params.get('plano');
const pagamento = params.get('pagamento');
const baixarPedido = params.get('baixar');   // 'mac' | 'win': veio do botão de download

let plans = [];
const est = {                 // estado da página
  session: null, perfil: null, lic: null, vagas: null, vagasErro: null,
  orders: [], packs: [], cupom: '', cotacoes: new Map(),
};

const aviso = (texto, tipo) => avisoUI($('aviso'), texto, tipo);

function setStatus(texto, on) {
  $('status-text').textContent = texto;
  $('status-led').classList.toggle('on', !!on);
}

const nomePlano = (id) => (plans.find((p) => p.id === id) || {}).name || id || '—';

// ============================ compra ============================
async function cotar(planId) {
  const chave = planId + '|' + est.cupom;
  if (est.cotacoes.has(chave)) return est.cotacoes.get(chave);
  const plano = plans.find((p) => p.id === planId);
  let r;
  try {
    r = await quote(est.cupom ? { plan_id: planId, coupon_code: est.cupom } : { plan_id: planId });
  } catch (e) {
    if (est.cupom && e.code === 'invalid_coupon') throw e;
    // servidor sem /quote ainda: estimativa local só para mostrar o valor
    const atual = plans.filter((p) => est.lic && p.seats <= est.lic.seats).sort((a, b) => b.seats - a.seats)[0];
    const cheio = precoEfetivo(plano);
    const dif = est.lic && atual ? Math.max(cheio - precoEfetivo(atual), 99) : cheio;
    r = { list_price_cents: cheio, discount_cents: 0, final_cents: dif, is_upgrade: !!est.lic, estimado: true };
  }
  est.cotacoes.set(chave, r);
  return r;
}

async function comprar(planId) {
  msg($('msg-buy'), 'Abrindo o pagamento…');
  try {
    const corpo = est.cupom ? { plan_id: planId, coupon_code: est.cupom } : { plan_id: planId };
    const r = await call('checkout', corpo);
    if (r.simulated) {
      msg($('msg-buy'), '');
      await carregar();
      pintarTudo();
      aviso('Licença liberada nesta conta. Baixe o instalador e entre com este e-mail dentro do plugin.', 'ok');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    location.href = r.init_point;
  } catch (e) {
    if (e.code === 'mp_not_configured') msg($('msg-buy'), 'O pagamento online ainda não está ligado. Sua conta já existe: fale com a gente informando este e-mail e a licença é liberada nela.', '');
    else msg($('msg-buy'), e.message, 'err');
  }
}

async function pintarCompra() {
  const up = $('upgrade');
  up.innerHTML = '';
  const lic = est.lic;
  const seats = lic ? lic.seats : 0;
  $('buy-title').textContent = lic ? 'Fazer upgrade' : 'Planos';
  $('cupom-box').hidden = false;
  $('buy-text').textContent = lic
    ? 'Você paga só a diferença entre o seu plano e o maior. A licença passa a valer o novo número de computadores na hora da confirmação.'
    : 'Pagamento único pelo Mercado Pago (Pix, cartão ou boleto). A licença cai nesta conta na hora da confirmação.';

  for (const p of plans) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'key ' + (p.badge ? 'orange' : 'cream');
    const esq = el('span', null, `${p.name} · ${p.seats} acesso${p.seats > 1 ? 's' : ''}`);
    const dir = el('span', null, '…');
    b.append(esq, dir);

    if (lic && p.seats === seats) {
      b.disabled = true; b.className = 'key';
      dir.textContent = 'Seu plano';
      up.appendChild(b);
      continue;
    }
    if (lic && p.seats < seats) {
      b.disabled = true; b.className = 'key';
      dir.textContent = 'menor que o seu';
      up.appendChild(b);
      continue;
    }
    up.appendChild(b);
    cotar(p.id).then((q) => {
      const valor = BRL(q.final_cents);
      if (q.is_upgrade || lic) {
        esq.textContent = `Fazer upgrade · ${p.name} · ${p.seats} acessos`;
        dir.textContent = valor;
      } else {
        dir.textContent = valor;
      }
      if (q.discount_cents > 0) dir.innerHTML = `<span class="was">${BRL(q.list_price_cents)}</span> ${valor}`;
    }).catch((e) => {
      dir.textContent = BRL(precoEfetivo(p));
      if (e.code === 'invalid_coupon') msg($('msg-buy'), e.message, 'err');
    });
    b.addEventListener('click', () => comprar(p.id));
  }

  if (lic && !plans.some((p) => p.seats > seats)) {
    $('buy-title').textContent = 'Licença';
    $('buy-text').textContent = 'Você já tem o maior plano. Precisa de mais acessos? Escreva pra gente.';
    $('cupom-box').hidden = true;
  }
}

$('btn-cupom').addEventListener('click', async () => {
  const code = $('cupom').value.trim().toUpperCase();
  est.cupom = code;
  est.cotacoes.clear();
  msg($('msg-buy'), code ? 'Conferindo o cupom…' : '');
  const v = $('valor');
  v.hidden = true; v.innerHTML = '';
  await pintarCompra();
  if (!code) return;
  try {
    const alvo = plans.filter((p) => !est.lic || p.seats > est.lic.seats)[0];
    if (!alvo) return;
    const q = await cotar(alvo.id);
    if (q.discount_cents > 0) {
      v.hidden = false;
      v.innerHTML = `<span class="legend">com o cupom ${q.coupon ? q.coupon.code : code}</span>
        <span class="was">${BRL(q.list_price_cents)}</span><span class="agora">${BRL(q.final_cents)}</span>`;
      msg($('msg-buy'), 'Cupom aplicado.', 'ok');
    } else {
      msg($('msg-buy'), 'Esse cupom não muda o valor deste plano.', '');
    }
  } catch (e) {
    est.cupom = '';
    est.cotacoes.clear();
    await pintarCompra();
    msg($('msg-buy'), e.message, 'err');
  }
});

// ============================ perfil ============================
let fotoPendente = null;

function pintarPerfil() {
  const { session, perfil } = est;
  $('perfil-email').value = session.user.email;
  $('who').textContent = session.user.email;
  const slot = $('avatar-slot');
  slot.innerHTML = '';
  slot.appendChild(avatarNode(perfil, session.user, 'big'));
  $('btn-foto-rm').hidden = !(perfil && perfil.avatar_path);
  const inp = $('form-perfil').display_name;
  if (!inp.dataset.tocado) inp.value = (perfil && perfil.display_name) || session.user.email.split('@')[0];
}

$('btn-foto').addEventListener('click', () => $('file-foto').click());
$('form-perfil').display_name.addEventListener('input', (e) => { e.target.dataset.tocado = '1'; });

$('file-foto').addEventListener('change', async (e) => {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file) return;
  msg($('msg-perfil'), 'Preparando a foto…');
  try {
    const { blob, url } = await recortarQuadrado(file, 256);
    fotoPendente = blob;
    const slot = $('avatar-slot');
    slot.innerHTML = '';
    const sp = el('span', 'avatar big');
    const img = document.createElement('img'); img.src = url; img.alt = '';
    sp.appendChild(img); slot.appendChild(sp);
    $('btn-foto-rm').hidden = false;
    msg($('msg-perfil'), 'Foto recortada em 256×256. Clique em "Salvar perfil" para enviar.', 'ok');
  } catch (err) {
    msg($('msg-perfil'), err.message, 'err');
  }
});

$('btn-foto-rm').addEventListener('click', async () => {
  if (fotoPendente) { fotoPendente = null; pintarPerfil(); msg($('msg-perfil'), 'Foto descartada.'); return; }
  if (!await confirmar({ titulo: 'Remover foto', texto: 'A foto do perfil volta a ser as suas iniciais.', ok: 'Remover', perigo: true })) return;
  try {
    await saveProfile({ avatar_path: null });
    est.perfil = { ...(est.perfil || {}), avatar_path: null };
    pintarPerfil();
    await montarTopoDeNovo();
    recado('Foto removida.', 'ok');
  } catch (e) { msg($('msg-perfil'), e.message, 'err'); }
});

$('form-perfil').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = e.target.display_name.value.trim();
  if (nome.length < 1 || nome.length > 60) return msg($('msg-perfil'), 'O nome precisa ter de 1 a 60 caracteres.', 'err');
  const botao = e.target.querySelector('button[type=submit]');
  botao.disabled = true;
  msg($('msg-perfil'), 'Salvando…');
  try {
    if (fotoPendente) {
      const path = await uploadAvatar(fotoPendente, est.session.user.id);
      est.perfil = { ...(est.perfil || {}), avatar_path: path };
      fotoPendente = null;
    }
    await saveProfile({ display_name: nome });
    est.perfil = { ...(est.perfil || {}), display_name: nome };
    pintarPerfil();
    await montarTopoDeNovo();
    msg($('msg-perfil'), 'Perfil salvo.', 'ok');
  } catch (err) {
    msg($('msg-perfil'), err.message, 'err');
  } finally { botao.disabled = false; }
});

// o topo é montado uma vez por página; depois de mudar o perfil, repinta na mão
async function montarTopoDeNovo() {
  const link = document.querySelector('.topbar nav #nav-conta');
  if (!link) return;
  link.textContent = '';
  link.classList.add('me');
  link.append(avatarNode(est.perfil, est.session.user), document.createTextNode(primeiroNome(est.perfil && est.perfil.display_name, est.session.user.email)));
}

// ============================ licença e vagas ============================
function pintarLicenca() {
  const lic = est.lic;
  const v = est.vagas;
  const total = lic ? lic.seats : 0;
  const usadas = v ? v.used : 0;

  const sockets = total || 5;   // um soquete por acesso da licença
  $('seats').innerHTML = Array.from({ length: sockets }, (_, i) =>
    `<span class="socket${i < usadas ? ' on' : ''}"></span>`).join('')
    + `<span class="legend">${total ? `${usadas} de ${total} acesso${total > 1 ? 's' : ''} em uso` : 'sem licença'}</span>`;

  const ul = $('slots');
  ul.innerHTML = '';
  const acts = $('lic-acts');
  acts.innerHTML = '';
  acts.hidden = true;

  if (!lic) {
    setStatus(est.session.user.email + ' · sem licença', false);
    $('lic-text').textContent = 'Esta conta ainda não tem licença.';
    $('lic-sub').textContent = 'Escolha um plano abaixo. O pagamento é único e a licença aparece aqui assim que o Mercado Pago confirmar.';
    $('slots-empty').hidden = true;
    return;
  }

  setStatus(est.session.user.email + ' · licença ativa', true);
  $('lic-text').textContent = `${nomePlano(v && v.plan_id)} · ${usadas} de ${total} acesso${total > 1 ? 's' : ''} em uso.`;
  $('lic-sub').innerHTML = usadas >= total
    ? 'Todos os acessos estão ocupados. Libere uma vaga abaixo ou <b>faça upgrade</b> para mais computadores.'
    : 'Cada vaga é um computador. Você pode entrar com a conta dentro do plugin, ou <b>gerar uma chave</b> para outra pessoa ativar sem saber a sua senha.';

  if (est.vagasErro) {
    $('slots-empty').hidden = true;
    const li = el('li', 'recess');
    li.append(el('span', 'who', est.vagasErro));
    ul.appendChild(li);
    return;
  }

  const lista = (v && v.slots) || [];
  $('slots-empty').hidden = lista.length > 0;

  for (const s of lista) ul.appendChild(linhaVaga(s));

  // vagas livres: uma linha por vaga, com "Gerar chave"
  for (let i = lista.length; i < total; i++) {
    const li = el('li', 'recess free');
    const who = el('span', 'who');
    who.append(el('b', null, 'Vaga livre'), el('span', 'legend', 'gere uma chave ou entre com a conta no plugin'));
    const bt = el('button', 'key small cream', 'Gerar chave'); bt.type = 'button';
    bt.addEventListener('click', () => gerarChave(bt));
    const acts2 = el('span', 'acts'); acts2.appendChild(bt);
    li.append(who, acts2);
    ul.appendChild(li);
  }

  if (usadas >= total) {
    acts.hidden = false;
    const w = el('div', 'recess warn');
    w.innerHTML = 'A licença está cheia: todas as vagas ocupadas. Remova uma vaga acima ou <b>faça upgrade</b> para um plano com mais computadores.';
    w.style.flex = '1 1 100%';
    acts.appendChild(w);
    const bt = el('button', 'key orange', 'Fazer upgrade'); bt.type = 'button';
    bt.addEventListener('click', () => {
      $('panel-buy').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    acts.appendChild(bt);
  }
}

function linhaVaga(s) {
  const li = el('li', 'recess');
  const who = el('span', 'who');
  const acts = el('span', 'acts');

  if (s.type === 'machine') {
    who.append(el('b', null, s.machine_name || 'Computador'));
    who.append(el('span', 'legend', `máquina via conta · ${s.os || '—'} · visto ${quando(s.last_seen_at)}`));
    const bt = el('button', 'key small', 'Remover'); bt.type = 'button';
    bt.addEventListener('click', async () => {
      if (!await confirmar({
        titulo: 'Remover computador',
        texto: `<b>${escapar(s.machine_name || 'Computador')}</b> perde o acesso na próxima abertura do plugin e a vaga fica livre.`,
        ok: 'Remover', perigo: true,
      })) return;
      await acaoVaga(bt, 'release_machine', { activation_id: s.id }, 'Vaga liberada.');
    });
    acts.appendChild(bt);
  } else {
    const nome = s.label || 'Chave sem apelido';
    who.append(el('b', null, nome));
    const linha = el('span', 'status-row');
    const code = el('span', 'code-key', s.code || '—');
    linha.appendChild(code);
    linha.appendChild(el('span', 'chip' + (s.status === 'active' ? ' ok' : ''), s.status === 'active' ? 'ativa' : 'pendente'));
    who.appendChild(linha);
    who.append(el('span', 'legend', s.status === 'active'
      ? `${s.machine_name || 'computador'} · ${s.os || '—'} · visto ${quando(s.last_seen_at)}`
      : 'ainda não ativada: entregue esta chave para quem vai usar'));

    if (s.status === 'pending') {
      const bc = el('button', 'key small cream', 'Copiar'); bc.type = 'button';
      bc.addEventListener('click', async () => {
        recado(await copiar(s.code) ? 'Chave copiada.' : 'Não consegui copiar. Selecione o código na tela.', 'ok');
      });
      acts.appendChild(bc);
    }
    const br = el('button', 'key small', 'Renomear'); br.type = 'button';
    br.addEventListener('click', async () => {
      const novo = await perguntar({ titulo: 'Apelido da chave', rotulo: 'Apelido', valor: s.label || '', texto: 'Serve para você saber de quem é a chave. Ex.: "PC do Nana".' });
      if (novo == null) return;
      await acaoVaga(br, 'rename_key', { key_id: s.id, label: novo }, 'Apelido salvo.');
    });
    acts.appendChild(br);
    const bd = el('button', 'key small', s.status === 'pending' ? 'Apagar' : 'Remover'); bd.type = 'button';
    bd.addEventListener('click', async () => {
      if (!await confirmar({
        titulo: s.status === 'pending' ? 'Apagar chave' : 'Remover chave',
        texto: s.status === 'pending'
          ? 'A chave deixa de funcionar e a vaga fica livre.'
          : `O computador <b>${escapar(s.machine_name || 'que usa esta chave')}</b> tranca na próxima renovação e a vaga fica livre.`,
        ok: s.status === 'pending' ? 'Apagar' : 'Remover', perigo: true,
      })) return;
      await acaoVaga(bd, 'revoke_key', { key_id: s.id }, 'Vaga liberada.');
    });
    acts.appendChild(bd);
  }

  li.append(who, acts);
  return li;
}

async function acaoVaga(botao, action, corpo, ok) {
  botao.disabled = true;
  msg($('msg-lic'), '');
  try {
    await fnSeats(action, corpo);
    await carregarVagas();
    pintarLicenca();
    recado(ok, 'ok');
  } catch (e) {
    msg($('msg-lic'), e.message, 'err');
    botao.disabled = false;
  }
}

async function gerarChave(botao) {
  botao.disabled = true;
  msg($('msg-lic'), 'Gerando a chave…');
  try {
    const label = await perguntar({ titulo: 'Nova chave', rotulo: 'Apelido (opcional)', texto: 'A chave ativa um computador sem pedir a senha da sua conta.', ok: 'Gerar chave', valor: '' });
    if (label == null) { botao.disabled = false; msg($('msg-lic'), ''); return; }
    const r = await fnSeats('create_key', label ? { label } : {});
    await carregarVagas();
    pintarLicenca();
    const code = r.code || (r.key && r.key.code);
    if (code) {
      await copiar(code);
      msg($('msg-lic'), `Chave ${code} criada e copiada. Entregue para quem vai ativar.`, 'ok');
    } else msg($('msg-lic'), 'Chave criada.', 'ok');
  } catch (e) {
    botao.disabled = false;
    if (e.code === 'seats_full') {
      msg($('msg-lic'), 'A licença está cheia. Libere uma vaga ou faça upgrade.', 'err');
      if (e.data && e.data.slots) { est.vagas = { ...est.vagas, ...e.data }; pintarLicenca(); }
    } else msg($('msg-lic'), e.message, 'err');
  }
}

// ============================ meus packs ============================
function pintarPacks() {
  const grade = $('meus-packs');
  grade.innerHTML = '';
  const lista = est.packs;
  $('packs-empty').hidden = lista.length > 0;
  for (const p of lista) {
    const card = el('div', 'pack');
    const cover = el('div', 'pack-cover');
    if (p.cover_url) {
      const img = document.createElement('img'); img.src = p.cover_url; img.alt = ''; img.loading = 'lazy';
      cover.appendChild(img);
    } else cover.appendChild(el('span', 'none', 'BRDRUM'));
    card.appendChild(cover);
    card.appendChild(el('h3', null, p.title || 'Pack'));
    card.appendChild(el('p', 'artist', p.artist || ''));
    const meta = el('div', 'meta');
    if (p.kind) meta.appendChild(el('span', 'chip', TIPOS_PACK[p.kind] || p.kind));
    if (p.file_size_bytes) meta.appendChild(el('span', 'chip', tamanho(p.file_size_bytes)));
    if (p.source === 'grant') meta.appendChild(el('span', 'chip ok', 'cortesia'));
    card.appendChild(meta);
    const bt = el('button', 'key orange', 'Baixar'); bt.type = 'button';
    bt.addEventListener('click', async () => {
      bt.disabled = true;
      const antes = bt.textContent;
      bt.textContent = 'Preparando…';
      try {
        const r = await packDownload(p.pack_id);
        const a = document.createElement('a');
        a.href = r.url; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove();
        recado('O download começou. O link vale 10 minutos.', 'ok');
      } catch (e) { recado(e.message, 'err'); }
      finally { bt.disabled = false; bt.textContent = antes; }
    });
    card.appendChild(bt);
    grade.appendChild(card);
  }
}

// ============================ pedidos ============================
function pintarPedidos() {
  const tb = $('tbl-pedidos').querySelector('tbody');
  tb.innerHTML = '';
  $('pedidos-empty').hidden = est.orders.length > 0;
  $('tbl-pedidos').parentElement.hidden = est.orders.length === 0;
  for (const o of est.orders) {
    const tr = document.createElement('tr');
    const item = o.kind === 'pack'
      ? (o.pack && o.pack.title ? `Pack · ${o.pack.title}` : 'Sample pack')
      : `${o.is_upgrade ? 'Upgrade · ' : ''}${nomePlano(o.plan_id)}${o.seats ? ` · ${o.seats} acesso${o.seats > 1 ? 's' : ''}` : ''}`;
    const cells = [
      dataHora(o.created_at),
      item,
      BRL(o.amount_cents),
      o.discount_cents ? '− ' + BRL(o.discount_cents) : '—',
      (o.coupon && o.coupon.code) || o.coupon_code || (o.coupon_id ? 'cupom aplicado' : '—'),
      STATUS_PEDIDO[o.status] || o.status,
    ];
    cells.forEach((c, i) => {
      const td = el('td', null, c);
      if (i === 5) td.style.color = corStatus(o.status);
      tr.appendChild(td);
    });
    tb.appendChild(tr);
  }
}

// ============================ segurança ============================
$('form-senha').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const nova = f.nova.value;
  if (nova.length < 8) return msg($('msg-senha'), 'A nova senha precisa ter pelo menos 8 caracteres.', 'err');
  if (nova !== f.confirm.value) return msg($('msg-senha'), 'As duas senhas novas não são iguais.', 'err');
  if (nova === f.atual.value) return msg($('msg-senha'), 'A nova senha é igual à atual.', 'err');
  const botao = f.querySelector('button[type=submit]');
  botao.disabled = true;
  msg($('msg-senha'), 'Trocando…');
  try {
    await changePassword(est.session.user.email, f.atual.value, nova);
    f.reset();
    msg($('msg-senha'), 'Senha trocada. Use a nova também dentro do plugin.', 'ok');
  } catch (err) {
    msg($('msg-senha'), err.message, 'err');
  } finally { botao.disabled = false; }
});

$('btn-logout-all').addEventListener('click', async () => {
  if (!await confirmar({
    titulo: 'Sair de todos os dispositivos',
    texto: 'Toda sessão desta conta é encerrada: este navegador e todo plugin que entrou com ela. A licença continua valendo.',
    ok: 'Sair de tudo', perigo: true,
  })) return;
  msg($('msg-dev'), 'Encerrando as sessões…');
  try {
    await logoutAll();
    location.href = 'conta.html';
  } catch (e) { msg($('msg-dev'), e.message, 'err'); }
});

$('btn-logout').addEventListener('click', async () => {
  await signOut();
  location.href = 'conta.html';
});

// ============================ dados ============================
async function carregarVagas() {
  est.vagasErro = null;
  if (!est.lic) { est.vagas = { seats: 0, used: 0, slots: [] }; return; }
  try {
    est.vagas = await fnSeats('list');
  } catch (e) {
    // servidor sem /seats ainda: conta as máquinas pelo PostgREST
    try {
      const acts = await select('activations', 'select=id,machine_name,os,plugin_version,last_seen_at&revoked_at=is.null&order=last_seen_at.desc');
      est.vagas = {
        seats: est.lic.seats, used: acts.length, plan_id: null,
        slots: acts.map((a) => ({ type: 'machine', id: a.id, machine_name: a.machine_name, os: a.os, last_seen_at: a.last_seen_at })),
      };
      est.vagasErro = null;
    } catch {
      est.vagas = { seats: est.lic.seats, used: 0, slots: [] };
      est.vagasErro = 'Não consegui ler as vagas agora. Recarregue a página em um minuto.';
    }
  }
}

async function carregarPedidos() {
  const base = 'order=created_at.desc&limit=20';
  // a tabela `coupons` não é legível pelo comprador (RLS), então o código do cupom
  // só aparece quando o servidor mandar `coupon_code` junto do pedido
  try {
    return await select('orders', `select=id,kind,plan_id,pack_id,seats,amount_cents,list_price_cents,discount_cents,is_upgrade,status,created_at,coupon_id,pack:packs(title)&${base}`);
  } catch {}
  try {
    return await select('orders', `select=id,kind,plan_id,pack_id,seats,amount_cents,discount_cents,is_upgrade,status,created_at&${base}`);
  } catch {}
  try {
    return await select('orders', `select=id,plan_id,seats,amount_cents,status,created_at&${base}`);
  } catch { return []; }
}

async function carregarMeusPacks() {
  try {
    const rows = await select('pack_entitlements',
      'select=pack_id,source,created_at,packs(title,artist,kind,cover_path,file_size_bytes)&order=created_at.desc');
    return rows.map((r) => ({
      pack_id: r.pack_id, source: r.source,
      ...(r.packs || {}),
      cover_url: r.packs && r.packs.cover_path ? publicUrl('pack-covers', r.packs.cover_path) : '',
    }));
  } catch {}
  try {
    const [ents, packs] = await Promise.all([
      select('pack_entitlements', 'select=pack_id,source,created_at&order=created_at.desc'),
      loadPacks(),
    ]);
    return ents.map((e) => {
      const p = packs.find((x) => x.id === e.pack_id) || {};
      return { pack_id: e.pack_id, source: e.source, ...p, cover_url: p.cover_path ? publicUrl('pack-covers', p.cover_path) : '' };
    });
  } catch { return []; }
}

async function carregar() {
  const [perfil, lics, orders, packs] = await Promise.all([
    loadProfile(est.session.user.id),
    select('licenses', 'select=id,seats,status,created_at&limit=1').catch(() => []),
    carregarPedidos(),
    carregarMeusPacks(),
  ]);
  est.perfil = perfil;
  est.lic = lics.find((l) => l.status === 'active') || null;
  est.orders = orders;
  est.packs = packs;
  est.cotacoes.clear();
  await carregarVagas();
}

function pintarTudo() {
  pintarPerfil();
  pintarLicenca();
  pintarPacks();
  pintarPedidos();
  pintarCompra();
}

function escapar(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// ============================ auth ============================
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
  msg($('msg-login'), 'Entrando…');
  try {
    const s = await signIn(f.email.value.trim(), f.password.value);
    msg($('msg-login'), '');
    await depoisDoLogin(s);
  } catch (err) { msg($('msg-login'), err.message, 'err'); }
});

$('form-signup').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  if (f.password.value.length < 8) return msg($('msg-signup'), 'A senha precisa ter pelo menos 8 caracteres.', 'err');
  if (f.password.value !== f.confirm.value) return msg($('msg-signup'), 'As senhas não são iguais.', 'err');
  msg($('msg-signup'), 'Criando…');
  try {
    let s = await signUp(f.email.value.trim(), f.password.value);
    if (!s) s = await signIn(f.email.value.trim(), f.password.value);
    msg($('msg-signup'), '');
    await depoisDoLogin(s);
  } catch (err) { msg($('msg-signup'), err.message, 'err'); }
});

async function abrirConta(session) {
  est.session = session;
  $('view-auth').hidden = true;
  $('view-account').hidden = false;
  $('titulo').textContent = 'Sua conta';
  await carregar();
  pintarTudo();
}

async function depoisDoLogin(session) {
  await abrirConta(session);
  if (planoPedido && plans.some((p) => p.id === planoPedido)) {
    history.replaceState(null, '', 'conta.html#licenca');
    location.hash = '#licenca';
    await comprar(planoPedido);
  } else if (baixarPedido && DOWNLOADS[baixarPedido]) {
    history.replaceState(null, '', 'conta.html');
    const a = document.createElement('a');
    a.href = DOWNLOADS[baixarPedido]; a.download = ''; document.body.appendChild(a); a.click(); a.remove();
    if (est.lic) {
      aviso(`O instalador para ${baixarPedido === 'mac' ? 'Mac' : 'Windows'} está baixando. Instale e entre com esta conta no plugin.`, 'ok');
    } else {
      location.hash = '#licenca';
      aviso(`O instalador para ${baixarPedido === 'mac' ? 'Mac' : 'Windows'} está baixando. Pra destravar o plugin, escolha um plano abaixo e pague; ele libera na hora.`, 'ok');
      $('panel-buy').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

// depois do retorno do Mercado Pago, a licença pode levar alguns segundos para cair
async function esperarLicenca() {
  for (let i = 0; i < 12; i++) {
    await carregar();
    pintarTudo();
    if (est.lic) { aviso('Pagamento confirmado. Sua licença está ativa: baixe o instalador e entre com esta conta no plugin.', 'ok'); return; }
    await new Promise((r) => setTimeout(r, 2500));
  }
  aviso('O pagamento foi recebido mas a licença ainda não apareceu. Recarregue a página em um minuto; se não aparecer, escreva pra gente com o e-mail da conta.');
}

// ============================ início ============================
(async () => {
  abas($('tabs'), {
    '#perfil': { node: $('pane-perfil') },
    '#licenca': { node: $('pane-licenca') },
    '#packs': { node: $('pane-packs') },
    '#pedidos': { node: $('pane-pedidos') },
    '#seguranca': { node: $('pane-seguranca') },
  }, planoPedido || baixarPedido ? '#licenca' : '#perfil');

  try { plans = await loadPlans(); } catch { plans = []; }
  await montarTopo();
  const session = await getSession();
  if (!session) { renderAuth(); return; }
  est.session = session;
  try {
    if (pagamento === 'sucesso' || pagamento === 'pendente') {
      history.replaceState(null, '', 'conta.html#licenca');
      location.hash = '#licenca';
      if (pagamento === 'pendente') aviso('Pagamento em análise (Pix ou boleto levam um pouco). A licença aparece aqui assim que o Mercado Pago confirmar.');
      await abrirConta(session);
      await esperarLicenca();
    } else {
      if (pagamento === 'falha') { history.replaceState(null, '', 'conta.html'); aviso('O pagamento não foi concluído. Você pode tentar de novo abaixo.', 'err'); }
      await depoisDoLogin(session);
    }
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) { await signOut(); renderAuth(); }
    else aviso(e.message, 'err');
  }
})();
