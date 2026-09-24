// Página da conta: entrar / criar conta e cinco abas — perfil, licença (vagas e
// chaves), meus packs, pedidos e segurança. Contrato:
// ~/Sistema AI/drum-dealer-backend/docs/SPEC-conta-loja-admin.md
import {
  signIn, signUp, signOut, getSession, select, call, loadPlans, loadProfile, saveProfile,
  uploadAvatar, changePassword, logoutAll, seats as fnSeats, quote, packDownload, loadPacks,
  precosDoPlano, BRL, ApiError, DOWNLOADS, TIPOS_PACK, publicUrl, primeiroNome,
} from './dd-api.js?v=20260925f';
import { montarTopo, avatarNode } from './dd-topo.js?v=20260925f';
import {
  $, el, msg, aviso as avisoUI, confirmar, perguntar, recado, abas, quando, dataHora,
  statusPedidoLabel, corStatus, tamanho, copiar, recortarQuadrado,
} from './dd-ui.js?v=20260925f';
import { t, seatsLabel, seatWord, fmtDate } from './dd-i18n.js';

const params = new URLSearchParams(location.search);
const planoPedido = params.get('plano');
const pagamento = params.get('pagamento');
const baixarPedido = params.get('baixar');   // 'mac' | 'win': veio do botão de download
const renovar = params.get('renovar') === '1';

let plans = [];
const est = {                 // estado da página
  session: null, perfil: null, lic: null, vagas: null, vagasErro: null,
  orders: [], packs: [], cupom: '', cotacoes: new Map(), planoSel: null, periodo: 'annual',
};

const periodoUrl = new URLSearchParams(location.search).get('periodo');
if (periodoUrl === 'monthly' || periodoUrl === 'annual') est.periodo = periodoUrl;
const chaveCotacao = (planId) => planId + '|' + est.periodo + '|' + est.cupom;
const licVencida = (lic) => !!lic && !!lic.expires_at && Date.parse(lic.expires_at) < Date.now();
const licPerpetua = (lic) => !!lic && !lic.expires_at;

const aviso = (texto, tipo) => avisoUI($('aviso'), texto, tipo);

function setStatus(texto, on) {
  $('status-text').textContent = texto;
  $('status-led').classList.toggle('on', !!on);
}

const nomePlano = (id) => (plans.find((p) => p.id === id) || {}).name || id || '—';

// ============================ compra ============================
async function cotar(planId) {
  const chave = chaveCotacao(planId);
  if (est.cotacoes.has(chave)) return est.cotacoes.get(chave);
  const plano = plans.find((p) => p.id === planId);
  let r;
  try {
    const corpo = { plan_id: planId, period: est.periodo };
    if (est.cupom) corpo.coupon_code = est.cupom;
    r = await quote(corpo);
  } catch (e) {
    if (est.cupom && e.code === 'invalid_coupon') throw e;
    if (e.code === 'plan_smaller_than_current' || e.code === 'plan_not_upgrade') throw e;
    // servidor fora: estimativa local só para mostrar o valor (sem crédito, decisão 23/09)
    const v = precosDoPlano(plano);
    const cheio = est.periodo === 'annual' ? v.anualTotal : v.mensal;
    r = { list_price_cents: cheio, discount_cents: 0, final_cents: cheio, period: est.periodo,
          is_upgrade: !!est.lic && plano.seats > est.lic.seats, is_renewal: !!est.lic && !licPerpetua(est.lic), estimado: true };
  }
  est.cotacoes.set(chave, r);
  return r;
}

async function comprar(planId) {
  msg($('msg-buy'), t('conta.abrindo-pagamento'));
  try {
    const corpo = { plan_id: planId, period: est.periodo };
    if (est.cupom) corpo.coupon_code = est.cupom;
    const r = await call('checkout', corpo);
    if (r.simulated || r.free) {
      msg($('msg-buy'), '');
      await carregar();
      pintarTudo();
      aviso(t('conta.licenca-liberada'), 'ok');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    location.href = r.init_point;
  } catch (e) {
    if (e.code === 'mp_not_configured') msg($('msg-buy'), t('conta.mp-nao-ligado'), '');
    else msg($('msg-buy'), e.message, 'err');
  }
}

async function pintarCompra() {
  pintarSeletorConta();
  const up = $('upgrade');
  up.innerHTML = '';
  const lic = est.lic;
  const seats = lic ? lic.seats : 0;
  $('buy-title').textContent = lic ? t('conta.buy-title-upgrade') : t('conta.buy-title-planos');
  $('cupom-box').hidden = false;
  $('buy-text').textContent = lic ? t('conta.buy-text-upgrade') : t('conta.buy-text-normal');

  const vencida = licVencida(lic), perpetua = licPerpetua(lic);
  if (lic && vencida) $('buy-text').textContent = t('conta.plano-vencido-renove', { data: fmtDate(lic.expires_at) });
  for (const p of plans) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'key ' + (p.badge ? 'orange' : 'cream');
    const esq = el('span', null, t('conta.plano-e-acessos', { nome: p.name, n: seatsLabel(p.seats) }));
    const dir = el('span', null, '…');
    b.append(esq, dir);

    const desabilita = (texto) => { b.disabled = true; b.className = 'key'; dir.textContent = texto; up.appendChild(b); };
    if (lic && perpetua && p.seats === seats) { desabilita(t('plans.seu-plano')); continue; }
    if (lic && perpetua && p.seats < seats) { desabilita(t('conta.menor-que-o-seu')); continue; }
    if (lic && !perpetua && !vencida && p.seats < seats) { desabilita(t('conta.menor-que-o-seu')); continue; }

    b.dataset.plano = p.id;
    b.classList.toggle('sel', est.planoSel === p.id);
    up.appendChild(b);
    cotar(p.id).then((q) => {
      const valor = BRL(q.final_cents);
      if (lic && p.seats > seats) esq.textContent = t('conta.upgrade-e-acessos', { nome: p.name, n: p.seats });
      else if (lic && !perpetua) esq.textContent = t('conta.renovar-e-acessos', { nome: p.name, n: seatsLabel(p.seats) });
      const legenda = est.periodo === 'annual'
        ? t('conta.periodo-anual-legend')
        : t('conta.periodo-mensal-legend');
      dir.innerHTML = (q.discount_cents > 0 ? `<span class="was">${BRL(q.list_price_cents)}</span> ` : '')
        + `${valor} <span class="legend">${legenda}</span>`;
    }).catch((e) => {
      const v = precosDoPlano(p);
      dir.textContent = BRL(est.periodo === 'annual' ? v.anualTotal : v.mensal);
      if (e.code === 'invalid_coupon') msg($('msg-buy'), e.message, 'err');
    });
    b.addEventListener('click', () => selecionarPlano(p.id));
  }

  if (lic && perpetua && !plans.some((p) => p.seats > seats)) {
    $('buy-title').textContent = t('conta.maior-plano-title');
    $('buy-text').textContent = t('conta.maior-plano-text');
    $('cupom-box').hidden = true;
  }
  await mostrarValor();
}

// Escolher o plano é um passo: destaca, mostra o valor (com o cupom, se houver) e o botão
// Pagar. Antes, clicar no plano já abria o Mercado Pago, sem valor nem cupom na frente.
async function selecionarPlano(planId) {
  est.planoSel = planId;
  for (const b of $('upgrade').querySelectorAll('.key')) b.classList.toggle('sel', b.dataset.plano === planId);
  msg($('msg-buy'), '');
  await mostrarValor();
}

async function mostrarValor() {
  const v = $('valor');
  const pagar = $('btn-pagar');
  const plano = plans.find((p) => p.id === est.planoSel);
  if (!plano || $('cupom-box').hidden) { v.hidden = true; v.innerHTML = ''; pagar.hidden = true; return; }
  try {
    const q = await cotar(plano.id);
    const valor = BRL(q.final_cents);
    const gratis = q.is_free || q.final_cents === 0;
    const prefixoPeriodo = t(est.periodo === 'annual' ? 'conta.periodo-anual' : 'conta.periodo-mensal') + ' · ';
    v.hidden = false;
    v.innerHTML = q.discount_cents > 0
      ? `<span class="legend">${prefixoPeriodo}${t('conta.valor-com-cupom', { nome: plano.name, codigo: q.coupon ? q.coupon.code : est.cupom })}</span>
         <span class="was">${BRL(q.list_price_cents)}</span><span class="agora">${valor}</span>`
      : `<span class="legend">${prefixoPeriodo}${t('conta.valor-normal', { nome: plano.name, n: seatsLabel(plano.seats) })}</span><span class="agora">${valor}</span>`;
    pagar.textContent = gratis ? t('conta.ativar-gratis') : t('conta.pagar-valor', { valor });
    pagar.hidden = false;
  } catch (e) {
    v.hidden = true; v.innerHTML = ''; pagar.hidden = true;
    msg($('msg-buy'), e.message, 'err');
  }
}

$('btn-pagar').addEventListener('click', () => { if (est.planoSel) comprar(est.planoSel); });

function pintarSeletorConta() {
  for (const b of $('period-switch-conta').querySelectorAll('.period-opt')) {
    const on = b.dataset.period === est.periodo;
    b.classList.toggle('sel', on);
    b.setAttribute('aria-selected', on ? 'true' : 'false');
  }
}
$('period-switch-conta').addEventListener('click', (e) => {
  const b = e.target.closest('.period-opt');
  if (!b || b.dataset.period === est.periodo) return;
  est.periodo = b.dataset.period;
  est.cotacoes.clear();
  pintarCompra();
});

$('btn-cupom').addEventListener('click', async () => {
  const code = $('cupom').value.trim().toUpperCase();
  est.cupom = code;
  est.cotacoes.clear();
  msg($('msg-buy'), code ? t('conta.conferindo-cupom') : '');
  if (!est.planoSel) {
    const alvo = plans.filter((p) => !est.lic || p.seats > est.lic.seats)[0];
    if (alvo) est.planoSel = alvo.id;
  }
  try {
    if (code && est.planoSel) await cotar(est.planoSel); // valida o cupom antes de repintar
    await pintarCompra();
    if (!code) return;
    const q = est.planoSel ? est.cotacoes.get(chaveCotacao(est.planoSel)) : null;
    if (q && q.discount_cents > 0) msg($('msg-buy'), t('conta.cupom-aplicado'), 'ok');
    else msg($('msg-buy'), t('conta.cupom-sem-efeito'), '');
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
  msg($('msg-perfil'), t('conta.preparando-foto'));
  try {
    const { blob, url } = await recortarQuadrado(file, 256);
    fotoPendente = blob;
    const slot = $('avatar-slot');
    slot.innerHTML = '';
    const sp = el('span', 'avatar big');
    const img = document.createElement('img'); img.src = url; img.alt = '';
    sp.appendChild(img); slot.appendChild(sp);
    $('btn-foto-rm').hidden = false;
    msg($('msg-perfil'), t('conta.foto-recortada'), 'ok');
  } catch (err) {
    msg($('msg-perfil'), err.message, 'err');
  }
});

$('btn-foto-rm').addEventListener('click', async () => {
  if (fotoPendente) { fotoPendente = null; pintarPerfil(); msg($('msg-perfil'), t('conta.foto-descartada')); return; }
  if (!await confirmar({ titulo: t('conta.remover-foto-titulo'), texto: t('conta.remover-foto-texto'), ok: t('conta.remover-foto-ok'), perigo: true })) return;
  try {
    await saveProfile({ avatar_path: null });
    est.perfil = { ...(est.perfil || {}), avatar_path: null };
    pintarPerfil();
    await montarTopoDeNovo();
    recado(t('conta.foto-removida'), 'ok');
  } catch (e) { msg($('msg-perfil'), e.message, 'err'); }
});

$('form-perfil').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = e.target.display_name.value.trim();
  if (nome.length < 1 || nome.length > 60) return msg($('msg-perfil'), t('conta.nome-tamanho'), 'err');
  const botao = e.target.querySelector('button[type=submit]');
  botao.disabled = true;
  msg($('msg-perfil'), t('conta.salvando'));
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
    msg($('msg-perfil'), t('conta.perfil-salvo'), 'ok');
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
    + `<span class="legend">${total ? t('conta.seats-legend', { usadas, total, acessos: seatWord(total) }) : t('conta.seats-sem-licenca')}</span>`;

  const ul = $('slots');
  ul.innerHTML = '';
  const acts = $('lic-acts');
  acts.innerHTML = '';
  acts.hidden = true;

  if (!lic) {
    setStatus(t('conta.sem-licenca-status', { email: est.session.user.email }), false);
    $('lic-text').textContent = t('conta.sem-licenca-texto');
    $('lic-sub').textContent = t('conta.sem-licenca-sub');
    $('slots-empty').hidden = true;
    return;
  }

  const vencida = licVencida(lic);
  const prazo = lic.expires_at
    ? t('conta.licenca-valida-ate', { data: fmtDate(lic.expires_at), periodo: t(lic.period === 'annual' ? 'conta.periodo-anual' : 'conta.periodo-mensal') })
    : t('conta.licenca-sem-prazo');
  if (vencida) {
    setStatus(t('conta.licenca-vencida-status', { email: est.session.user.email }), false);
    $('lic-text').textContent = t('conta.licenca-vencida-texto', { data: fmtDate(lic.expires_at) });
    $('lic-sub').textContent = t('conta.licenca-vencida-sub');
  } else {
    setStatus(t('conta.licenca-ativa-status', { email: est.session.user.email }), true);
    $('lic-text').textContent = t('conta.licenca-texto', { plano: nomePlano(v && v.plan_id), usadas, total, acessos: seatWord(total) });
    $('lic-sub').innerHTML = (usadas >= total ? t('conta.licenca-sub-cheia-html') : t('conta.licenca-sub-livre-html')) + ` <span class="legend">${prazo}</span>`;
  }

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
    who.append(el('b', null, t('conta.vaga-livre')), el('span', 'legend', t('conta.vaga-livre-legend')));
    const bt = el('button', 'key small cream', t('conta.gerar-chave')); bt.type = 'button';
    bt.addEventListener('click', () => gerarChave(bt));
    const acts2 = el('span', 'acts'); acts2.appendChild(bt);
    li.append(who, acts2);
    ul.appendChild(li);
  }

  if (usadas >= total) {
    acts.hidden = false;
    const w = el('div', 'recess warn');
    w.innerHTML = t('conta.licenca-cheia-aviso-html');
    w.style.flex = '1 1 100%';
    acts.appendChild(w);
    const bt = el('button', 'key orange', t('plans.fazer-upgrade')); bt.type = 'button';
    bt.addEventListener('click', () => {
      $('panel-buy').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    acts.appendChild(bt);
  }

  if (lic.expires_at) {
    acts.hidden = false;
    const bt = el('button', vencida ? 'key orange' : 'key cream', t('conta.renovar')); bt.type = 'button';
    bt.addEventListener('click', () => $('panel-buy').scrollIntoView({ behavior: 'smooth', block: 'center' }));
    acts.appendChild(bt);
  }
}

function linhaVaga(s) {
  const li = el('li', 'recess');
  const who = el('span', 'who');
  const acts = el('span', 'acts');

  if (s.type === 'machine') {
    who.append(el('b', null, s.machine_name || t('conta.computador-fallback')));
    who.append(el('span', 'legend', t('conta.maquina-legend', { os: s.os || '—', quando: quando(s.last_seen_at) })));
    const bt = el('button', 'key small', t('conta.remover-vaga')); bt.type = 'button';
    bt.addEventListener('click', async () => {
      if (!await confirmar({
        titulo: t('conta.remover-computador-titulo'),
        texto: t('conta.remover-computador-texto-html', { nome: escapar(s.machine_name || t('conta.computador-fallback')) }),
        ok: t('conta.remover-vaga'), perigo: true,
      })) return;
      await acaoVaga(bt, 'release_machine', { activation_id: s.id }, t('conta.vaga-liberada'));
    });
    acts.appendChild(bt);
  } else {
    const nome = s.label || t('conta.chave-sem-apelido');
    who.append(el('b', null, nome));
    const linha = el('span', 'status-row');
    const code = el('span', 'code-key', s.code || '—');
    linha.appendChild(code);
    linha.appendChild(el('span', 'chip' + (s.status === 'active' ? ' ok' : ''), s.status === 'active' ? t('conta.chave-ativa') : t('conta.chave-pendente')));
    who.appendChild(linha);
    who.append(el('span', 'legend', s.status === 'active'
      ? t('conta.chave-legend-ativa', { maquina: s.machine_name || t('conta.chave-computador-fallback'), os: s.os || '—', quando: quando(s.last_seen_at) })
      : t('conta.chave-legend-pendente')));

    if (s.status === 'pending') {
      const bc = el('button', 'key small cream', t('conta.copiar')); bc.type = 'button';
      bc.addEventListener('click', async () => {
        recado(await copiar(s.code) ? t('conta.chave-copiada') : t('conta.chave-copiar-falhou'), 'ok');
      });
      acts.appendChild(bc);
    }
    const br = el('button', 'key small', t('conta.renomear')); br.type = 'button';
    br.addEventListener('click', async () => {
      const novo = await perguntar({ titulo: t('conta.apelido-titulo'), rotulo: t('conta.apelido-rotulo'), valor: s.label || '', texto: t('conta.apelido-texto') });
      if (novo == null) return;
      await acaoVaga(br, 'rename_key', { key_id: s.id, label: novo }, t('conta.apelido-salvo'));
    });
    acts.appendChild(br);
    const bd = el('button', 'key small', s.status === 'pending' ? t('conta.apagar') : t('conta.remover-vaga')); bd.type = 'button';
    bd.addEventListener('click', async () => {
      if (!await confirmar({
        titulo: s.status === 'pending' ? t('conta.apagar-chave-titulo') : t('conta.remover-chave-titulo'),
        texto: s.status === 'pending'
          ? t('conta.apagar-chave-texto')
          : t('conta.remover-chave-texto-html', { nome: escapar(s.machine_name || t('conta.chave-que-usa-fallback')) }),
        ok: s.status === 'pending' ? t('conta.apagar') : t('conta.remover-vaga'), perigo: true,
      })) return;
      await acaoVaga(bd, 'revoke_key', { key_id: s.id }, t('conta.vaga-liberada'));
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
  msg($('msg-lic'), t('conta.gerando-chave'));
  try {
    const label = await perguntar({ titulo: t('conta.nova-chave-titulo'), rotulo: t('conta.apelido-opcional-rotulo'), texto: t('conta.nova-chave-texto'), ok: t('conta.gerar-chave'), valor: '' });
    if (label == null) { botao.disabled = false; msg($('msg-lic'), ''); return; }
    const r = await fnSeats('create_key', label ? { label } : {});
    await carregarVagas();
    pintarLicenca();
    const code = r.code || (r.key && r.key.code);
    if (code) {
      await copiar(code);
      msg($('msg-lic'), t('conta.chave-criada-copiada', { codigo: code }), 'ok');
    } else msg($('msg-lic'), t('conta.chave-criada'), 'ok');
  } catch (e) {
    botao.disabled = false;
    if (e.code === 'seats_full') {
      msg($('msg-lic'), t('conta.seats-full'), 'err');
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
    card.appendChild(el('h3', null, p.title || t('conta.pack-fallback')));
    card.appendChild(el('p', 'artist', p.artist || ''));
    const meta = el('div', 'meta');
    if (p.kind) meta.appendChild(el('span', 'chip', TIPOS_PACK[p.kind] || p.kind));
    if (p.file_size_bytes) meta.appendChild(el('span', 'chip', tamanho(p.file_size_bytes)));
    if (p.source === 'grant') meta.appendChild(el('span', 'chip ok', t('conta.pack-cortesia')));
    card.appendChild(meta);
    const bt = el('button', 'key orange', t('conta.baixar')); bt.type = 'button';
    bt.addEventListener('click', async () => {
      bt.disabled = true;
      const antes = bt.textContent;
      bt.textContent = t('conta.preparando');
      try {
        const r = await packDownload(p.pack_id);
        const a = document.createElement('a');
        a.href = r.url; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove();
        recado(t('conta.download-comecou'), 'ok');
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
      ? (o.pack && o.pack.title ? t('conta.pedido-pack-titulo', { titulo: o.pack.title }) : t('conta.pedido-pack-fallback'))
      : `${o.is_upgrade ? t('conta.pedido-upgrade-prefixo') : ''}${nomePlano(o.plan_id)}${o.seats ? t('conta.pedido-acessos-sufixo', { n: seatsLabel(o.seats) }) : ''}`
        + (o.period ? ' · ' + t(o.period === 'annual' ? 'conta.pedido-periodo-anual' : 'conta.pedido-periodo-mensal') : '');
    const cells = [
      dataHora(o.created_at),
      item,
      BRL(o.amount_cents),
      o.discount_cents ? '− ' + BRL(o.discount_cents) : '—',
      (o.coupon && o.coupon.code) || o.coupon_code || (o.coupon_id ? t('conta.pedido-cupom-aplicado') : '—'),
      statusPedidoLabel(o.status),
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
  if (nova.length < 8) return msg($('msg-senha'), t('conta.senha-min'), 'err');
  if (nova !== f.confirm.value) return msg($('msg-senha'), t('conta.senhas-novas-diferentes'), 'err');
  if (nova === f.atual.value) return msg($('msg-senha'), t('conta.senha-nova-igual-atual'), 'err');
  const botao = f.querySelector('button[type=submit]');
  botao.disabled = true;
  msg($('msg-senha'), t('conta.trocando-senha'));
  try {
    await changePassword(est.session.user.email, f.atual.value, nova);
    f.reset();
    msg($('msg-senha'), t('conta.senha-trocada'), 'ok');
  } catch (err) {
    msg($('msg-senha'), err.message, 'err');
  } finally { botao.disabled = false; }
});

$('btn-logout-all').addEventListener('click', async () => {
  if (!await confirmar({
    titulo: t('conta.sair-de-tudo-titulo'),
    texto: t('conta.sair-de-tudo-texto'),
    ok: t('conta.sair-de-tudo-ok'), perigo: true,
  })) return;
  msg($('msg-dev'), t('conta.encerrando-sessoes'));
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
      est.vagasErro = t('conta.nao-consegui-vagas');
    }
  }
}

async function carregarPedidos() {
  const base = 'order=created_at.desc&limit=20';
  // a tabela `coupons` não é legível pelo comprador (RLS), então o código do cupom
  // só aparece quando o servidor mandar `coupon_code` junto do pedido
  try {
    return await select('orders', `select=id,kind,plan_id,pack_id,seats,amount_cents,list_price_cents,discount_cents,is_upgrade,status,created_at,coupon_id,period,months,pack:packs(title)&${base}`);
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
    select('licenses', 'select=id,seats,status,created_at,expires_at,period&limit=1').catch(() => []),
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
  $('titulo').textContent = planoPedido ? t('conta.titulo-comprar')
    : baixarPedido ? t('conta.titulo-baixar') : t('conta.titulo');
  if (baixarPedido) aviso(t('conta.aviso-baixar'));
  setStatus(t('conta.nao-conectado'), false);
}

$('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  msg($('msg-login'), t('conta.entrando'));
  try {
    const s = await signIn(f.email.value.trim(), f.password.value);
    msg($('msg-login'), '');
    await depoisDoLogin(s);
  } catch (err) { msg($('msg-login'), err.message, 'err'); }
});

// aceite dos Termos de Uso (24/09, decisão do Diogo): a caixa começa desmarcada e o botão de
// criar conta fica desabilitado até marcar; o listener de submit confere de novo (defesa contra
// alguém que reative o botão pelo devtools ou algum outro caminho que não passe por aqui).
const btnCriarConta = document.querySelector('#form-signup button[type="submit"]');
$('aceite-termos').addEventListener('change', () => {
  btnCriarConta.disabled = !$('aceite-termos').checked;
});

$('form-signup').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  if (!$('aceite-termos').checked) return msg($('msg-signup'), t('signup.aceite-obrigatorio'), 'err');
  if (f.password.value.length < 8) return msg($('msg-signup'), t('conta.senha-min'), 'err');
  if (f.password.value !== f.confirm.value) return msg($('msg-signup'), t('conta.senhas-diferentes'), 'err');
  msg($('msg-signup'), t('conta.criando'));
  try {
    const meta = { terms_version: 'v1', terms_accepted_at: new Date().toISOString() };
    let s = await signUp(f.email.value.trim(), f.password.value, meta);
    if (!s) s = await signIn(f.email.value.trim(), f.password.value);
    msg($('msg-signup'), '');
    await depoisDoLogin(s);
  } catch (err) { msg($('msg-signup'), err.message, 'err'); }
});

async function abrirConta(session) {
  est.session = session;
  $('view-auth').hidden = true;
  $('view-account').hidden = false;
  $('titulo').textContent = t('conta.titulo');
  await carregar();
  pintarTudo();
  if (renovar) $('panel-buy').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Dispara o download clicando num <a href> de verdade, sem `download=""` (o arquivo vem de
// github.com com redirect pra objects.githubusercontent.com — outra origem, onde o atributo é
// ignorado pelo navegador; quem decide se baixa ou abre é o cabeçalho Content-Disposition do
// GitHub). É só a tentativa automática: nunca é a única forma de baixar (ver mostrarAvisoDownload).
function dispararDownload(sistema) {
  const a = document.createElement('a');
  a.href = DOWNLOADS[sistema];
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Aviso neutro com o link permanente de fallback — regra do Diogo (24/09): quem tem conta SEMPRE
// consegue baixar, com ou sem licença; o aviso nunca fala de plano nem manda pra aba de compra.
// Guarda o sistema pra repintar se o idioma mudar (dd-lang-changed, mais abaixo).
let avisoDownloadAtivo = null;
function mostrarAvisoDownload(sistema) {
  avisoDownloadAtivo = sistema;
  const status = t(sistema === 'mac' ? 'conta.instalador-mac-baixando' : 'conta.instalador-win-baixando');
  const rotulo = t(sistema === 'mac' ? 'conta.baixar-mac' : 'conta.baixar-win');
  const linkTexto = t('conta.download-nao-comecou');
  aviso(`<p>${escapar(status)}</p><p class="dl-fallback">${escapar(linkTexto)} <a class="key cream small" href="${DOWNLOADS[sistema]}" rel="noopener">${escapar(rotulo)}</a></p>`, 'ok');
}

async function depoisDoLogin(session) {
  // o mais cedo possível, antes de esperar a conta (await abrirConta faz várias chamadas de
  // rede): Safari e o bloqueador de pop-up do Chrome descartam clique programático fora do gesto
  // do usuário, e cada await depois do submit do formulário afasta mais o clique desse gesto.
  // Mesmo assim, nunca é a única forma de baixar — o link permanente do aviso é que garante.
  if (baixarPedido && DOWNLOADS[baixarPedido]) dispararDownload(baixarPedido);
  await abrirConta(session);
  if (planoPedido && plans.some((p) => p.id === planoPedido)) {
    history.replaceState(null, '', 'conta.html#licenca');
    location.hash = '#licenca';
    await selecionarPlano(planoPedido);   // só pré-seleciona: o pagamento sai pelo botão Pagar, depois do valor e do cupom
    aviso(t('conta.pagamento-confirmado'), '');
  } else if (baixarPedido && DOWNLOADS[baixarPedido]) {
    history.replaceState(null, '', 'conta.html');
    // com ou sem licença: o download sempre acontece, o aviso é sempre o mesmo (neutro), nunca
    // manda pra aba de compra — ter conta já é o suficiente pra baixar o instalador
    mostrarAvisoDownload(baixarPedido);
  }
}

// depois do retorno do Mercado Pago, a licença pode levar alguns segundos para cair
async function esperarLicenca() {
  for (let i = 0; i < 12; i++) {
    await carregar();
    pintarTudo();
    if (est.lic) { aviso(t('conta.pagamento-confirmado-lic'), 'ok'); return; }
    await new Promise((r) => setTimeout(r, 2500));
  }
  aviso(t('conta.pagamento-recebido-sem-lic'));
}

// ============================ início ============================
(async () => {
  abas($('tabs'), {
    '#perfil': { node: $('pane-perfil') },
    '#licenca': { node: $('pane-licenca') },
    '#packs': { node: $('pane-packs') },
    '#pedidos': { node: $('pane-pedidos') },
    '#seguranca': { node: $('pane-seguranca') },
  }, planoPedido || baixarPedido || renovar ? '#licenca' : '#perfil');

  try { plans = await loadPlans(); } catch { plans = []; }
  await montarTopo();
  const session = await getSession();
  if (!session) { renderAuth(); return; }
  est.session = session;
  try {
    if (pagamento === 'sucesso' || pagamento === 'pendente') {
      history.replaceState(null, '', 'conta.html#licenca');
      location.hash = '#licenca';
      if (pagamento === 'pendente') aviso(t('conta.pagamento-em-analise'));
      await abrirConta(session);
      await esperarLicenca();
    } else {
      if (pagamento === 'falha') { history.replaceState(null, '', 'conta.html'); aviso(t('conta.pagamento-falhou'), 'err'); }
      await depoisDoLogin(session);
    }
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) { await signOut(); renderAuth(); }
    else aviso(e.message, 'err');
  }
})();

// idioma: repinta a página logada (ou a tela de entrar) sem recarregar nem repetir chamadas de rede
document.addEventListener('dd-lang-changed', () => {
  if (est.session) { pintarTudo(); if (avisoDownloadAtivo) mostrarAvisoDownload(avisoDownloadAtivo); }
  else renderAuth();
});
