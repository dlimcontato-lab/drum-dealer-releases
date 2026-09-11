// Vídeos de produtores usando o BRDRUM (seção REVIEW) e os links do rodapé.
// Para adicionar um vídeo: coloque o arquivo em video/ e acrescente uma entrada aqui.
// { src: 'video/produtor-1.mp4', poster: 'img/produtor-1.jpg', who: '@usuario' }
// Para embutir direto do Instagram: { embed: 'https://www.instagram.com/reel/XXXX/embed', who: '@usuario' }
export const REVIEWS = [];

// Links do rodapé e do balão de chat. Vazio = não aparece.
export const LINKS = {
  instagram: '',
  facebook: '',
  youtube: '',
  whatsapp: '',          // ex.: 'https://wa.me/55XXXXXXXXXXX'
  ajuda: 'conta.html',   // Central de ajuda
};

const ICONS = {
  instagram: '<svg viewBox="0 0 24 24"><path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zM17.3 5.5a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4zM21 8.3c-.1-1.7-.5-3.2-1.7-4.4S16.6 2.3 14.9 2.2C13.2 2.1 10.8 2.1 9.1 2.2 7.4 2.3 5.9 2.7 4.7 3.9S3 6.6 2.9 8.3c-.1 1.7-.1 6.7 0 8.4.1 1.7.5 3.2 1.7 4.4s2.7 1.6 4.4 1.7c1.7.1 6.7.1 8.4 0 1.7-.1 3.2-.5 4.4-1.7s1.6-2.7 1.7-4.4c.1-1.7.1-6.7 0-8.4zm-2.2 10.3c-.4.9-1.1 1.6-2 2-1.4.6-4.7.4-6.2.4s-4.8.1-6.2-.4c-.9-.4-1.6-1.1-2-2-.6-1.4-.4-4.7-.4-6.2s-.1-4.8.4-6.2c.4-.9 1.1-1.6 2-2C5.8 3.6 9.1 3.8 10.6 3.8s4.8-.1 6.2.4c.9.4 1.6 1.1 2 2 .6 1.4.4 4.7.4 6.2s.2 4.8-.4 6.2z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.4V14h2.8v8h3.3z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24"><path d="M23 7.2c-.3-1-1-1.8-2-2C19.2 4.7 12 4.7 12 4.7s-7.2 0-9 .5c-1 .3-1.8 1-2 2C.5 9 .5 12 .5 12s0 3 .5 4.8c.3 1 1 1.8 2 2 1.8.5 9 .5 9 .5s7.2 0 9-.5c1-.3 1.8-1 2-2 .5-1.8.5-4.8.5-4.8s0-3-.5-4.8zM9.7 15.3V8.7l6 3.3-6 3.3z"/></svg>',
};

const $ = (id) => document.getElementById(id);

// reviews
const sec = $('review'), row = $('reels');
if (sec && row && REVIEWS.length) {
  for (const r of REVIEWS) {
    const card = document.createElement('figure');
    card.className = 'reel';
    if (r.embed) card.innerHTML = `<iframe src="${r.embed}" loading="lazy" allow="autoplay; encrypted-media" title="${r.who || 'review'}"></iframe>`;
    else card.innerHTML = `<video src="${r.src}" poster="${r.poster || ''}" preload="none" playsinline controls muted loop></video>`;
    if (r.who && !r.embed) { const c = document.createElement('figcaption'); c.className = 'who'; c.textContent = r.who; card.appendChild(c); }
    row.appendChild(card);
  }
  sec.hidden = false;
}

// rodapé
const social = $('social');
if (social) for (const k of ['instagram', 'facebook', 'youtube']) {
  if (!LINKS[k]) continue;
  const a = document.createElement('a'); a.href = LINKS[k]; a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('aria-label', k);
  a.innerHTML = ICONS[k]; social.appendChild(a);
}
if ($('ajuda') && LINKS.ajuda) $('ajuda').href = LINKS.ajuda;
const bubble = $('chat-bubble');
if (bubble && LINKS.whatsapp) { bubble.href = LINKS.whatsapp; bubble.target = '_blank'; bubble.rel = 'noopener'; bubble.hidden = false; }

// vídeo de apresentação: autoplay mudo em loop; respeita "reduzir movimento"
const v = $('apresentacao'), tog = $('hero-toggle');
if (v && tog) {
  const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pinta = () => { tog.textContent = v.paused ? 'Tocar' : 'Pausar'; tog.setAttribute('aria-label', v.paused ? 'Tocar vídeo' : 'Pausar vídeo'); };
  if (reduz) { v.removeAttribute('autoplay'); v.pause(); }
  else v.play().catch(() => {});
  v.addEventListener('play', pinta); v.addEventListener('pause', pinta);
  tog.addEventListener('click', () => { v.paused ? v.play() : v.pause(); });
  pinta();
}
