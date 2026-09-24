// Loja de sample packs: vitrine aberta a todos, compra só para quem tem plano.
// Contrato: ~/Sistema AI/drum-dealer-backend/docs/SPEC-conta-loja-admin.md (seção 4).
import {
  getSession, select, call, loadPacks, meusPacks, packDownload, quote, publicUrl,
  precoEfetivo, emPromocao, BRL, TIPOS_PACK,
} from './dd-api.js?v=20260925i';
import { montarTopo } from './dd-topo.js?v=20260925i';
import { $, el, msg, aviso, recado, previa, pararPrevia, tamanho } from './dd-ui.js?v=20260925i';
import { t } from './dd-i18n.js';

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
    const bt = el('button', 'key green' + (grande ? '' : ''), t('packs.na-conta-baixar'));
    bt.type = 'button';
    bt.addEventListener('click', () => baixar(p, bt));
    return bt;
  }
  if (!est.lic) {
    const a = el('a', 'key cream sub-only', t('packs.exclusivo-assinantes'));
    a.href = 'index.html#precos';
    return a;
  }
  const bt = el('button', 'key orange', t('packs.comprar-valor', { valor: BRL(precoEfetivo(p)) }));
  bt.type = 'button';
  bt.addEventListener('click', () => abrirDetalhe(p));
  return bt;
}

async function baixar(p, bt) {
  if (!est.session) { location.href = 'conta.html'; return; }
  const antes = bt.textContent;
  bt.disabled = true; bt.textContent = t('packs.preparando');
  try {
    const r = await packDownload(p.id);
    const a = document.createElement('a');
    a.href = r.url; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove();
    recado(t('packs.download-comecou'), 'ok');
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
    play.setAttribute('aria-label', t('packs.tocar-previa-de', { titulo: p.title }));
    const led = el('span', 'led');
    led.setAttribute('aria-hidden', 'true');
    play.prepend(led);
    play.addEventListener('click', (e) => { e.stopPropagation(); previa(play, publicUrl('pack-previews', p.preview_path)); });
    cover.appendChild(play);
  }
  cover.addEventListener('click', () => abrirDetalhe(p));
  card.appendChild(cover);

  const h = el('h3', null, p.title || t('packs.pack-fallback'));
  card.appendChild(h);
  card.appendChild(el('p', 'artist', p.artist || ''));

  const meta = el('div', 'meta');
  if (p.kind) meta.appendChild(el('span', 'chip', TIPOS_PACK[p.kind] || p.kind));
  for (const c of chipsConteudo(p.contents)) meta.appendChild(el('span', 'chip', c));
  if (p.file_size_bytes) meta.appendChild(el('span', 'chip', tamanho(p.file_size_bytes)));
  if (est.meus.has(p.id)) meta.appendChild(el('span', 'chip ok', t('packs.chip-seu')));
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
  $('det-legend').textContent = p.kind ? (TIPOS_PACK[p.kind] || p.kind) : t('packs.det-legend-default');
  $('det-titulo').textContent = p.title || t('packs.pack-fallback');
  $('det-artista').textContent = p.artist ? t('packs.por-artista', { artista: p.artist }) : '';
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
  if (p.kind) linhas.push([t('packs.tipo-label'), TIPOS_PACK[p.kind] || p.kind]);
  const cont = chipsConteudo(p.contents);
  if (cont.length) linhas.push([t('packs.conteudo-label'), cont.join(' · ')]);
  if (p.file_size_bytes) linhas.push([t('packs.arquivo-label'), '.zip · ' + tamanho(p.file_size_bytes)]);
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
  msg($('det-msg'), dono ? t('packs.ja-e-seu') : '', dono ? 'ok' : '');
  if (dono) {
    const bt = el('button', 'key green', t('packs.baixar-agora'));
    bt.type = 'button';
    bt.addEventListener('click', () => baixar(p, bt));
    $('det-valor').appendChild(bt);
  }
  const compra = $('det-comprar');
  compra.textContent = t('packs.comprar-valor', { valor: BRL(precoEfetivo(p)) });
  compra.onclick = () => comprar(p);

  if (!est.lic && !dono) msg($('det-msg'), t('packs.exclusivo-veja-planos-html'));

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
    v.appendChild(el('span', 'legend', t('packs.cupom-aplicado-tag')));
  } else if (emPromocao(est.atual)) {
    v.appendChild(el('span', 'was', BRL(est.atual.price_cents)));
    v.appendChild(el('span', 'agora', BRL(q.final_cents)));
    v.appendChild(el('span', 'legend', t('packs.promocao-tag')));
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
  msg($('det-msg'), code ? t('packs.conferindo-cupom') : '');
  if (!code) { pintarValorDetalhe({ list_price_cents: p.price_cents, final_cents: precoEfetivo(p), discount_cents: 0 }); return; }
  try {
    const q = await quote({ pack_id: p.id, coupon_code: code });
    pintarValorDetalhe(q);
    $('det-comprar').textContent = t('packs.comprar-valor', { valor: BRL(q.final_cents) });
    msg($('det-msg'), q.discount_cents > 0 ? t('packs.cupom-aplicado') : t('packs.cupom-sem-efeito'), q.discount_cents > 0 ? 'ok' : '');
  } catch (e) {
    est.cupom = '';
    pintarValorDetalhe({ list_price_cents: p.price_cents, final_cents: precoEfetivo(p), discount_cents: 0 });
    $('det-comprar').textContent = t('packs.comprar-valor', { valor: BRL(precoEfetivo(p)) });
    msg($('det-msg'), e.message, 'err');
  }
});

async function comprar(p) {
  if (!est.session) { location.href = 'conta.html'; return; }
  const bt = $('det-comprar');
  bt.disabled = true;
  msg($('det-msg'), t('packs.abrindo-pagamento'));
  try {
    const corpo = est.cupom ? { pack_id: p.id, coupon_code: est.cupom } : { pack_id: p.id };
    const r = await call('checkout', corpo);
    if (r.simulated) {
      msg($('det-msg'), t('packs.pack-liberado'), 'ok');
      await carregar();
      pintar();
      return;
    }
    location.href = r.init_point;
  } catch (e) {
    if (e.code === 'plan_required') msg($('det-msg'), t('packs.plan-required'), 'err');
    else if (e.code === 'mp_not_configured') msg($('det-msg'), t('packs.mp-not-configured'), '');
    else if (e.code === 'already_owned') msg($('det-msg'), t('packs.already-owned'), 'ok');
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

  if (!est.session) setStatus(t('packs.status-entre'), false);
  else if (est.lic) setStatus(t('packs.status-ativo'), true);
  else setStatus(t('packs.status-sem-plano'), false);

  if (est.session && !est.lic && !vazio) {
    aviso($('aviso'), t('packs.aviso-exclusivo-html'));
  } else aviso($('aviso'), '');
}

(async () => {
  await montarTopo();
  try {
    await carregar();
    pintar();
  } catch (e) {
    setStatus(t('packs.status-erro'), false);
    aviso($('aviso'), e.message, 'err');
  }
})();

document.addEventListener('dd-lang-changed', pintar);
