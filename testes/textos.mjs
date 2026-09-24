// Cartões de "O que tem dentro": 8 cartões, sem jargão nos textos, sem recurso que o plugin não tem.
import { abrir } from './cdp.mjs';

const url = process.argv[2] || 'http://localhost:8123/index.html';
const s = await abrir(url, { largura: 1680, altura: 1400 });
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'ok: ' : 'FAIL: ') + m); if (!c) falhas++; };
try {
  await s.esperar(1500);
  const r = await s.avaliar(`(() => {
    const cards = [...document.querySelectorAll('.feats .feat')];
    return { titulos: cards.map((c) => c.querySelector('legend').textContent.trim()),
             textos: cards.map((c) => c.querySelector('p').textContent.replace(/\\s+/g, ' ').trim()),
             tabela: document.querySelector('.spec-table').textContent.replace(/\\s+/g, ' '),
             alt: document.querySelector('meta[property="og:image:alt"]').content };
  })()`);
  ok(r.titulos.length === 8, `8 cartões (${r.titulos.join(' | ')})`);
  for (const t of ['Acabamento com OTT', 'Viradas de DJ', 'TONE X por instrumento', 'Um parceiro na tela'])
    ok(r.titulos.includes(t), `cartão novo: ${t}`);
  const todos = r.textos.join(' ');
  for (const jargao of [/\bkick\b/i, /\bsnare\b/i, /\bhi-?hat\b/i, /\bclap\b/i, /\b808\b/])
    ok(!jargao.test(todos), `cartões sem ${jargao}`);
  for (const inventado of [/depoimento/i, /\bestrelas?\b/i, /downloads/i, /usu[aá]rios/i, /milhares de produtores/i])
    ok(!inventado.test(todos), `cartões sem prova inventada (${inventado})`);
  ok(/OTT/.test(r.tabela) && /Viradas/.test(r.tabela), 'tabela cita OTT e viradas');
  ok(!/808/.test(r.alt) && /Pal/.test(r.alt), 'texto alternativo da imagem descreve o painel novo');
} finally {
  s.fechar();
}

// ---------- Task 5 (F10): nomeNoTopo() nunca usa o e-mail ----------
{
  const { nomeNoTopo } = await import('../dd-api.js');
  ok(nomeNoTopo(null, 'x@y.com', 'pt') === 'Minha conta', `nomeNoTopo(null,'pt') === 'Minha conta' (${nomeNoTopo(null, 'x@y.com', 'pt')})`);
  ok(nomeNoTopo('f1jornada+123', 'F1jornada+123@drumdealer.test', 'pt') === 'Minha conta', 'nome semeado pelo banco (parte do e-mail) vira Minha conta');
  ok(nomeNoTopo('Produtor', 'x@y.com', 'pt') === 'Minha conta', 'nome semeado "Produtor" vira Minha conta');
  ok(nomeNoTopo('Diogo Lima', 'x@y.com', 'pt') === 'Diogo', `nomeNoTopo('Diogo Lima','pt') === 'Diogo' (${nomeNoTopo('Diogo Lima', 'x@y.com', 'pt')})`);
  ok(nomeNoTopo(null, 'x@y.com', 'en') === 'My account', `nomeNoTopo(null,'en') === 'My account' (${nomeNoTopo(null, 'x@y.com', 'en')})`);
}

console.log(falhas === 0 ? 'TEXTOS: todos os testes passaram' : `${falhas} falhas`);
process.exit(falhas === 0 ? 0 : 1);
