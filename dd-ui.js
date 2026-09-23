// Peças de interface compartilhadas por conta.html, packs.html e admin.html.
// Nada de widget do navegador: confirmação é um painel na própria página, aviso é
// uma placa de aço, campo é rebaixo e botão é tecla de plástico.
import { t, getLang, fmtRelative, fmtDateTime } from './dd-i18n.js';

export const $ = (id) => document.getElementById(id);
export const el = (tag, cls, txt) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (txt != null) n.textContent = txt;
  return n;
};

export function msg(node, texto, tipo = '') {
  if (!node) return;
  node.textContent = texto || '';
  node.className = 'msg' + (tipo ? ' ' + tipo : '');
}

// ---------- aviso de página (placa rebaixada no topo) ----------
export function aviso(node, texto, tipo = '') {
  if (!node) return;
  if (!texto) { node.hidden = true; node.textContent = ''; return; }
  node.hidden = false;
  node.innerHTML = texto;
  node.style.color = tipo === 'err' ? 'var(--led-on)' : tipo === 'ok' ? 'var(--led-green)' : '';
}

// ---------- confirmação dentro da página ----------
// confirmar({ titulo, texto, ok, cancelar, perigo }) -> Promise<boolean>
export function confirmar({ titulo = t('ui.confirmar-titulo'), texto = '', ok = t('ui.confirmar-ok'), cancelar = t('ui.cancelar'), perigo = false } = {}) {
  return new Promise((resolve) => {
    const back = el('div', 'dlg-back');
    const fs = document.createElement('fieldset');
    fs.className = 'panel dlg';
    const lg = document.createElement('legend');
    lg.textContent = titulo;
    fs.appendChild(lg);
    const p = el('p', 'dlg-text');
    p.innerHTML = texto;
    fs.appendChild(p);
    const row = el('div', 'dlg-row');
    const bNo = el('button', 'key', cancelar); bNo.type = 'button';
    const bYes = el('button', 'key ' + (perigo ? 'orange' : 'green'), ok); bYes.type = 'button';
    row.append(bNo, bYes);
    fs.appendChild(row);
    back.appendChild(fs);
    document.body.appendChild(back);
    const fim = (v) => { back.remove(); document.removeEventListener('keydown', tecla); resolve(v); };
    const tecla = (e) => { if (e.key === 'Escape') fim(false); };
    document.addEventListener('keydown', tecla);
    back.addEventListener('click', (e) => { if (e.target === back) fim(false); });
    bNo.addEventListener('click', () => fim(false));
    bYes.addEventListener('click', () => fim(true));
    bYes.focus();
  });
}

// perguntar({ titulo, texto, rotulo, valor, ok }) -> Promise<string|null>
export function perguntar({ titulo = t('ui.perguntar-titulo'), texto = '', rotulo = t('ui.perguntar-rotulo'), valor = '', ok = t('ui.perguntar-ok'), max = 60 } = {}) {
  return new Promise((resolve) => {
    const back = el('div', 'dlg-back');
    const fs = document.createElement('fieldset');
    fs.className = 'panel dlg';
    const lg = document.createElement('legend');
    lg.textContent = titulo;
    fs.appendChild(lg);
    if (texto) { const p = el('p', 'dlg-text'); p.innerHTML = texto; fs.appendChild(p); }
    const lab = el('label');
    lab.style.display = 'grid'; lab.style.gap = '5px'; lab.style.marginTop = '14px';
    lab.appendChild(el('span', 'legend', rotulo));
    const inp = document.createElement('input');
    inp.className = 'recess'; inp.type = 'text'; inp.value = valor; inp.maxLength = max;
    lab.appendChild(inp);
    fs.appendChild(lab);
    const row = el('div', 'dlg-row');
    const bNo = el('button', 'key', t('ui.cancelar')); bNo.type = 'button';
    const bYes = el('button', 'key green', ok); bYes.type = 'button';
    row.append(bNo, bYes);
    fs.appendChild(row);
    back.appendChild(fs);
    document.body.appendChild(back);
    const fim = (v) => { back.remove(); document.removeEventListener('keydown', tecla); resolve(v); };
    const tecla = (e) => { if (e.key === 'Escape') fim(null); if (e.key === 'Enter' && document.activeElement === inp) fim(inp.value.trim()); };
    document.addEventListener('keydown', tecla);
    back.addEventListener('click', (e) => { if (e.target === back) fim(null); });
    bNo.addEventListener('click', () => fim(null));
    bYes.addEventListener('click', () => fim(inp.value.trim()));
    inp.focus(); inp.select();
  });
}

// ---------- recado flutuante (uma linha, sem bloquear) ----------
let recadoTimer = null;
export function recado(texto, tipo = '') {
  let n = document.getElementById('dd-recado');
  if (!n) {
    n = el('div', 'recado recess');
    n.id = 'dd-recado';
    n.setAttribute('role', 'status');
    document.body.appendChild(n);
  }
  n.textContent = texto;
  n.classList.toggle('err', tipo === 'err');
  n.classList.toggle('ok', tipo === 'ok');
  n.classList.add('on');
  clearTimeout(recadoTimer);
  recadoTimer = setTimeout(() => n.classList.remove('on'), 4200);
}

// ---------- abas por hash ----------
// abas(container, { '#perfil': fn, ... }, padrao) — o seletor é uma fila de teclas
export function abas(seletor, paineis, padrao) {
  const nomes = Object.keys(paineis);
  const ativa = (hash) => {
    const h = nomes.includes(hash) ? hash : padrao;
    for (const n of nomes) {
      const painel = paineis[n];
      if (painel.node) painel.node.hidden = n !== h;
    }
    for (const b of seletor.querySelectorAll('[data-aba]')) {
      const on = '#' + b.dataset.aba === h;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    }
    const p = paineis[h];
    if (p && typeof p.abrir === 'function') p.abrir();
    return h;
  };
  seletor.addEventListener('click', (e) => {
    const b = e.target.closest('[data-aba]');
    if (!b) return;
    const h = '#' + b.dataset.aba;
    if (location.hash !== h) history.replaceState(null, '', h);
    ativa(h);
  });
  window.addEventListener('hashchange', () => ativa(location.hash));
  return ativa(location.hash);
}

// ---------- datas e rótulos ----------
export function quando(iso) {
  return fmtRelative(iso);
}

export function dataHora(iso) {
  return fmtDateTime(iso);
}

// mantido em português: usado por admin.html/dd-admin.js (interno, não traduzido)
export const STATUS_PEDIDO = {
  pending: 'aguardando pagamento', approved: 'pago', rejected: 'recusado',
  refunded: 'estornado', cancelled: 'cancelado',
};

const STATUS_PEDIDO_KEYS = {
  pending: 'conta.status-pedido-pending', approved: 'conta.status-pedido-approved', rejected: 'conta.status-pedido-rejected',
  refunded: 'conta.status-pedido-refunded', cancelled: 'conta.status-pedido-cancelled',
};
// versão traduzida, para o site público (conta.js)
export function statusPedidoLabel(status) {
  return STATUS_PEDIDO_KEYS[status] ? t(STATUS_PEDIDO_KEYS[status]) : status;
}

export function corStatus(s) {
  return s === 'approved' ? 'var(--led-green)' : s === 'rejected' || s === 'refunded' ? 'var(--led-on)' : '';
}

export function tamanho(bytes) {
  if (!bytes) return '';
  const mb = bytes / 1048576;
  return mb >= 1024 ? t('ui.tamanho-gb', { n: (mb / 1024).toFixed(1).replace('.', getLang() === 'pt' ? ',' : '.') }) : t('ui.tamanho-mb', { n: Math.round(mb) });
}

// ---------- copiar ----------
export async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    try {
      const t = el('textarea'); t.value = texto; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select(); const ok = document.execCommand('copy'); t.remove();
      return ok;
    } catch { return false; }
  }
}

// ---------- recorte quadrado no navegador -> webp 256x256 ----------
// Retorna { blob, url } ou lança com mensagem pronta.
export async function recortarQuadrado(file, lado = 256) {
  if (!file.type.startsWith('image/')) throw new Error(t('ui.imagem-invalida'));
  if (file.size > 8 * 1024 * 1024) throw new Error(t('ui.imagem-grande'));
  const bitmap = await (window.createImageBitmap ? createImageBitmap(file) : carregarImg(file));
  const lado0 = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - lado0) / 2, sy = (bitmap.height - lado0) / 2;
  const c = document.createElement('canvas');
  c.width = c.height = lado;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, sx, sy, lado0, lado0, 0, 0, lado, lado);
  const blob = await new Promise((res, rej) => c.toBlob((b) => b ? res(b) : rej(new Error(t('ui.imagem-falhou-preparar'))), 'image/webp', 0.88));
  if (blob.size > 2 * 1024 * 1024) throw new Error(t('ui.foto-grande-demais'));
  return { blob, url: c.toDataURL('image/webp', 0.88) };
}

function carregarImg(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { res(img); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error(t('ui.nao-consegui-abrir-imagem'))); };
    img.src = url;
  });
}

// ---------- player de prévia (uma faixa por vez na página) ----------
const tocando = { audio: null, botao: null };
export function previa(botao, src) {
  if (tocando.audio && tocando.botao === botao) {
    if (tocando.audio.paused) { tocando.audio.play().catch(() => {}); botao.classList.add('playing'); }
    else { tocando.audio.pause(); botao.classList.remove('playing'); }
    return;
  }
  pararPrevia();
  const a = new Audio(src);
  a.addEventListener('ended', () => { botao.classList.remove('playing'); });
  a.addEventListener('error', () => { botao.classList.remove('playing'); recado(t('ui.previa-falhou'), 'err'); });
  a.play().then(() => botao.classList.add('playing')).catch(() => recado(t('ui.previa-falhou'), 'err'));
  tocando.audio = a; tocando.botao = botao;
}

export function pararPrevia() {
  if (tocando.audio) { tocando.audio.pause(); tocando.audio.src = ''; }
  if (tocando.botao) tocando.botao.classList.remove('playing');
  tocando.audio = null; tocando.botao = null;
}
