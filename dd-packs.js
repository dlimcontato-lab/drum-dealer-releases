// Loja de sample packs: vitrine aberta a todos, compra só para quem tem plano.
// Contrato: ~/Sistema AI/drum-dealer-backend/docs/SPEC-conta-loja-admin.md (seção 4).
import {
  getSession, select, call, loadPacks, meusPacks, packDownload, quote, publicUrl,
  precoEfetivo, emPromocao, BRL, TIPOS_PACK,
} from './dd-api.js?v=20260911p';
import { montarTopo } from './dd-topo.js?v=20260911p';
import { $, el, msg, aviso, recado, previa, pararPrevia, tamanho } from './dd-ui.js?v=20260911p';

const est = { session: null, lic: null, packs: [], meus: new Map(), atual: null, cupom: '' };

function setStatus(texto, on) {
  $('status-text').textContent = texto;
  $('status-led').classList.toggle('on', !!on);
}

function chipsConteudo(contents) {
  const out = [];
  if (!contents || typeof contents !== 'object') return out;
  for (const [k, v] of Object.entries(contents)) {
    if (v == null || v === '') continue;
    const rotulo = k.toUpperCase();
    out.push(typeof v === 'number' ? `${v} ${rotulo}` : `${rotulo} ${v}`);
  }
  return out;
}

function precoNode(p) {
  const box = el('p', 'price');
  const cents = precoEfetivo(p);
  if (emPromocao(p)) box.appendChild(el('span', 'was', BRL(p.price_cents)));
  box.appendChild(el('span', null, BRL(cents)));
  return box;
}

function botaoPrincipal(p, { grande = false } = {}) {
  const dono = est.meus.has(p.id);
  if (dono) {
    const bt = el('button', 'key green' + (grande ? '' : ''), 'Na sua conta · Baixar');
    bt.type = 'button';
    bt.addEventListener('click', () => baixar(p, bt));
    return bt;
  }
  if (!est.lic) {
    const a = el('a', 'key cream sub-only', 'Exclusivo para assinantes do BRDRUM · Ver planos');
    a.href = 'index.html#precos';
    return a;
  }
  const bt = el('button', 'key orange', `Comprar · ${BRL(precoEfetivo(p))}`);
  bt.type = 'button';
  bt.addEventListener('click', () => abrirDetalhe(p));
  return bt;
}

async function baixar(p, bt) {
  if (!est.session) { location.href = 'conta.html'; return; }
  const antes = bt.textContent;
  bt.disabled = true; bt.textContent = 'Preparando…';
  try {
    const r = await packDownload(p.id);
    const a = document.createElement('a');
    a.href = r.url; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove();
    recado('O download começou. O link vale 10 minutos.', 'ok');
  } catch (e) { recado(e.message, 'err'); }
  finally { bt.disabled = false; bt.textContent = antes; }
}

function cartao(p) {
  const card = el('div', 'pack');
  const cover = el('div', 'pack-cover');
  if (p.cover_path) {
    const img = document.createElement('img');
    img.src = publicUrl('pack-covers', p.cover_path); img.alt = ''; img.loading = 'lazy';
    cover.appendChild(img);
  } else cover.appendChild(el('span', 'none', 'BRDRUM'));
  if (p.preview_path) {
    const play = el('button', 'key orange small', 'Play');
    play.type = 'button';
    play.setAttribute('aria-label', `Tocar prévia de ${p.title}`);
    const led = el('span', 'led');
    led.setAttribute('aria-hidden', 'true');
    play.prepend(led);
    play.addEventListener('click', (e) => { e.stopPropagation(); previa(play, publicUrl('pack-previews', p.preview_path)); });
    cover.appendChild(play);
  }
  cover.addEventListener('click', () => abrirDetalhe(p));
  card.appendChild(cover);

  const h = el('h3', null, p.title || 'Pack');
  card.appendChild(h);
  card.appendChild(el('p', 'artist', p.artist || ''));

  const meta = el('div', 'meta');
  if (p.kind) meta.appendChild(el('span', 'chip', TIPOS_PACK[p.kind] || p.kind));
  for (const c of chipsConteudo(p.contents)) meta.appendChild(el('span', 'chip', c));
  if (p.file_size_bytes) meta.appendChild(el('span', 'chip', tamanho(p.file_size_bytes)));
  if (est.meus.has(p.id)) meta.appendChild(el('span', 'chip ok', 'seu'));
  card.appendChild(meta);

  card.appendChild(precoNode(p));
  card.appendChild(botaoPrincipal(p));
  return card;
}

// ---------- detalhe ----------
function abrirDetalhe(p) {
  est.atual = p;
  est.cupom = '';
  pararPrevia();
  $('det-legend').textContent = p.kind ? (TIPOS_PACK[p.kind] || p.kind) : 'Pack';
  $('det-titulo').textContent = p.title || 'Pack';
  $('det-artista').textContent = p.artist ? 'por ' + p.artist : '';
  $('det-desc').textContent = p.description || '';
  $('det-desc').hidden = !p.description;

  const cover = $('det-cover');
  cover.innerHTML = '';
  if (p.cover_path) {
    const img = document.createElement('img');
    img.src = publicUrl('pack-covers', p.cover_path); img.alt = '';
    cover.appendChild(img);
  } else cover.appendChild(el('span', 'none', 'BRDRUM'));

  const dl = $('det-dl');
  dl.innerHTML = '';
  const linhas = [];
  if (p.kind) linhas.push(['Tipo', TIPOS_PACK[p.kind] || p.kind]);
  const cont = chipsConteudo(p.contents);
  if (cont.length) linhas.push(['Conteúdo', cont.join(' · ')]);
  if (p.file_size_bytes) linhas.push(['Arquivo', '.zip · ' + tamanho(p.file_size_bytes)]);
  for (const [dt, dd] of linhas) {
    const d = el('div');
    d.append(el('dt', null, dt), el('dd', null, dd));
    dl.appendChild(d);
  }

  const previaBt = $('det-previa');
  previaBt.hidden = !p.preview_path;
  previaBt.classList.remove('playing');
  previaBt.onclick = () => previa(previaBt, publicUrl('pack-previews', p.preview_path));

  pintarValorDetalhe({ list_price_cents: p.price_cents, final_cents: precoEfetivo(p), discount_cents: 0 });

  const dono = est.meus.has(p.id);
  $('det-compra').hidden = dono || !est.lic;
  $('det-cupom').value = '';
  msg($('det-msg'), dono ? 'Este pack já é seu: baixe pela aba "Meus packs" da conta.' : '', dono ? 'ok' : '');
  if (dono) {
    const bt = el('button', 'key green', 'Baixar agora');
    bt.type = 'button';
    bt.addEventListener('click', () => baixar(p, bt));
    $('det-valor').appendChild(bt);
  }
  const compra = $('det-comprar');
  compra.textContent = `Comprar · ${BRL(precoEfetivo(p))}`;
  compra.onclick = () => comprar(p);

  if (!est.lic && !dono) msg($('det-msg'), 'Os sample packs são exclusivos para quem tem um plano do BRDRUM. <b>Veja os planos</b> para liberar a compra.');

  const fs = $('detalhe');
  fs.hidden = false;
  fs.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function pintarValorDetalhe(q) {
  const v = $('det-valor');
  v.innerHTML = '';
  if (q.discount_cents > 0) {
    v.appendChild(el('span', 'was', BRL(q.list_price_cents)));
    v.appendChild(el('span', 'agora', BRL(q.final_cents)));
    v.appendChild(el('span', 'legend', 'cupom aplicado'));
  } else if (emPromocao(est.atual)) {
    v.appendChild(el('span', 'was', BRL(est.atual.price_cents)));
    v.appendChild(el('span', 'agora', BRL(q.final_cents)));
    v.appendChild(el('span', 'legend', 'promoção'));
  } else {
    v.appendChild(el('span', 'agora', BRL(q.final_cents)));
  }
}

$('det-fechar').addEventListener('click', () => { pararPrevia(); $('detalhe').hidden = true; });

$('det-cupom-ok').addEventListener('click', async () => {
  const p = est.atual;
  if (!p) return;
  const code = $('det-cupom').value.trim().toUpperCase();
  est.cupom = code;
  msg($('det-msg'), code ? 'Conferindo o cupom…' : '');
  if (!code) { pintarValorDetalhe({ list_price_cents: p.price_cents, final_cents: precoEfetivo(p), discount_cents: 0 }); return; }
  try {
    const q = await quote({ pack_id: p.id, coupon_code: code });
    pintarValorDetalhe(q);
    $('det-comprar').textContent = `Comprar · ${BRL(q.final_cents)}`;
    msg($('det-msg'), q.discount_cents > 0 ? 'Cupom aplicado.' : 'Esse cupom não muda o valor deste pack.', q.discount_cents > 0 ? 'ok' : '');
  } catch (e) {
    est.cupom = '';
    pintarValorDetalhe({ list_price_cents: p.price_cents, final_cents: precoEfetivo(p), discount_cents: 0 });
    $('det-comprar').textContent = `Comprar · ${BRL(precoEfetivo(p))}`;
    msg($('det-msg'), e.message, 'err');
  }
});

async function comprar(p) {
  if (!est.session) { location.href = 'conta.html'; return; }
  const bt = $('det-comprar');
  bt.disabled = true;
  msg($('det-msg'), 'Abrindo o pagamento…');
  try {
    const corpo = est.cupom ? { pack_id: p.id, coupon_code: est.cupom } : { pack_id: p.id };
    const r = await call('checkout', corpo);
    if (r.simulated) {
      msg($('det-msg'), 'Pack liberado na sua conta.', 'ok');
      await carregar();
      pintar();
      return;
    }
    location.href = r.init_point;
  } catch (e) {
    if (e.code === 'plan_required') msg($('det-msg'), 'Os sample packs são exclusivos para quem tem um plano do BRDRUM.', 'err');
    else if (e.code === 'mp_not_configured') msg($('det-msg'), 'O pagamento online ainda não está ligado. Fale com a gente informando o e-mail da sua conta.', '');
    else if (e.code === 'already_owned') msg($('det-msg'), 'Este pack já é seu: baixe pela sua conta.', 'ok');
    else msg($('det-msg'), e.message, 'err');
  } finally { bt.disabled = false; }
}

// ---------- dados ----------
async function carregar() {
  est.session = await getSession();
  est.packs = await loadPacks();
  est.meus = new Map();
  est.lic = null;
  if (est.session) {
    const [lics, ents] = await Promise.all([
      select('licenses', 'select=id,seats,status&limit=1').catch(() => []),
      meusPacks(),
    ]);
    est.lic = lics.find((l) => l.status === 'active') || null;
    for (const e of ents) est.meus.set(e.pack_id, e);
  }
}

function pintar() {
  const grade = $('grade');
  grade.innerHTML = '';
  for (const p of est.packs) grade.appendChild(cartao(p));
  const vazio = est.packs.length === 0;
  $('vazio').hidden = !vazio;
  $('grade').hidden = vazio;
  $('nota').hidden = vazio;
  if (vazio) $('detalhe').hidden = true;

  if (!est.session) setStatus('Entre para comprar', false);
  else if (est.lic) setStatus('Plano ativo · pode comprar packs', true);
  else setStatus('Sem plano · packs são para assinantes', false);

  if (est.session && !est.lic && !vazio) {
    aviso($('aviso'), 'Os sample packs são exclusivos para quem tem um plano do BRDRUM. <a href="index.html#precos">Ver os planos</a>.');
  } else aviso($('aviso'), '');
}

(async () => {
  await montarTopo();
  try {
    await carregar();
    pintar();
  } catch (e) {
    setStatus('Não consegui carregar', false);
    aviso($('aviso'), e.message, 'err');
  }
})();
