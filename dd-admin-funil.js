// Painel › Visão geral › Visitas e funil (25/09). Lê a Edge Function `funil` (só admin; a
// checagem é no servidor). Forma: funil em barras horizontais de uma série só (verde LED =
// "valor" no DESIGN.md), com número e taxa escritos ao lado, e a tabela por dia embaixo.
import { SUPABASE_URL, ANON_KEY, getSession, BRL } from './dd-api.js?v=20260925p13';

const PASSOS = [
  ['visitas', 'Visitas na home'],
  ['clique_comprar', 'Clicou em comprar'],
  ['conta_criada', 'Criou conta'],
  ['clique_pagar', 'Clicou em pagar'],
  ['pagos', 'Pagou'],
];
const $ = (id) => document.getElementById(id);
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);
const num = (n) => Number(n || 0).toLocaleString('pt-BR');
const dia = (iso) => { const [a, m, d] = iso.split('-'); return `${d}/${m}`; };

let dias = 7;

async function carregar() {
  const painel = $('panel-funil');
  if (!painel) return;
  const s = await getSession();
  if (!s) { painel.hidden = true; return; }
  $('msg-funil').textContent = 'Buscando…';
  let r;
  try {
    r = await fetch(`${SUPABASE_URL}/functions/v1/funil`, {
      method: 'POST',
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${s.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ dias }),
    });
  } catch { $('msg-funil').textContent = 'Sem conexão com o servidor. Tente de novo em instantes.'; return; }
  if (r.status === 401 || r.status === 403) { painel.hidden = true; return; }
  if (!r.ok) { $('msg-funil').textContent = 'O servidor não respondeu os números. Tente Atualizar em instantes.'; return; }
  const d = await r.json();
  painel.hidden = false;
  pintar(d.linhas || []);
  $('msg-funil').textContent = '';
}

function pintar(linhas) {
  const tot = Object.fromEntries(PASSOS.map(([k]) => [k, linhas.reduce((s, l) => s + (l[k] || 0), 0)]));
  const receita = linhas.reduce((s, l) => s + (l.receita_cents || 0), 0);
  const max = Math.max(tot.visitas, ...PASSOS.map(([k]) => tot[k]), 1);

  const barras = $('funil-barras');
  barras.innerHTML = '';
  PASSOS.forEach(([k, nome], i) => {
    const v = tot[k];
    const anterior = i > 0 ? tot[PASSOS[i - 1][0]] : 0;
    const linha = document.createElement('div');
    linha.className = 'funil-linha';
    linha.setAttribute('role', 'listitem');
    // contas e pagamentos vêm do banco inteiro; visitas só existem desde 25/09: acima de 100%
    // a taxa engana, então some
    const taxa = i === 0 || tot.visitas === 0 || v > tot.visitas ? '' : `${pct(v, tot.visitas)}% das visitas`;
    const dica = i === 0 ? `${num(v)} visitas` : `${num(v)} · ${pct(v, anterior)}% do passo anterior (${num(anterior)}) · ${pct(v, tot.visitas)}% das visitas`;
    linha.title = dica;
    linha.setAttribute('aria-label', `${nome}: ${dica}`);
    const rot = document.createElement('span'); rot.className = 'funil-nome'; rot.textContent = nome;
    const trilho = document.createElement('span'); trilho.className = 'funil-trilho';
    const barra = document.createElement('span'); barra.className = 'funil-barra';
    barra.style.width = v > 0 ? `max(4px, ${(v / max) * 100}%)` : '0';
    trilho.appendChild(barra);
    const val = document.createElement('span'); val.className = 'funil-valor';
    val.innerHTML = `<b>${num(v)}</b>${taxa ? ` <small>${taxa}</small>` : ''}`;
    linha.append(rot, trilho, val);
    barras.appendChild(linha);
  });
  $('funil-receita').textContent = receita > 0 ? `Receita de licenças no período: ${BRL(receita)}` : 'Nenhuma licença paga no período.';

  const tb = $('tbl-funil').querySelector('tbody');
  tb.innerHTML = '';
  for (const l of linhas) {
    const tr = document.createElement('tr');
    for (const c of [dia(l.day), num(l.visitas), num(l.clique_comprar), num(l.conta_criada), num(l.clique_pagar), num(l.pagos), l.receita_cents ? BRL(l.receita_cents) : '—']) {
      const td = document.createElement('td'); td.textContent = c; tr.appendChild(td);
    }
    tb.appendChild(tr);
  }
}

$('funil-periodo')?.addEventListener('click', (e) => {
  const b = e.target.closest('.period-opt');
  if (!b) return;
  dias = Number(b.dataset.dias) || 7;
  for (const x of $('funil-periodo').querySelectorAll('.period-opt')) {
    const on = x === b; x.classList.toggle('sel', on); x.setAttribute('aria-selected', on ? 'true' : 'false');
  }
  carregar();
});
$('btn-funil')?.addEventListener('click', carregar);
carregar();
