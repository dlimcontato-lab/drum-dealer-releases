// Preço único anual (07/10: Solo a R$ 39,90, licença vitalícia, sem preço por mês) na home e na conta.
// Roda sem rede para o Supabase (bloquearHosts de cdp.mjs): dd-precos.js e conta.js completam
// com PLANOS_PADRAO de dd-api.js, então o teste confere o fallback, não o banco.
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { abrir } from './cdp.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(__dirname, '..');
const BASE = process.argv[2] || 'http://localhost:8123';
const BLOQUEIO = ['*bwzngjvjxrqbalvoadpu.supabase.co*'];
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'ok: ' : 'FAIL: ') + m); if (!c) falhas++; };

// ---------- home em pt e en, desktop e celular ----------
for (const [lang, largura, movel] of [['pt', 1440, false], ['pt', 390, true], ['en', 1440, false]]) {
  const s = await abrir(`${BASE}/index.html?lang=${lang}`, { largura, altura: 1400, movel, bloquear: BLOQUEIO, porta: 9333 });
  try {
    await s.esperar(1000);
    const r = await s.avaliar(`(() => {
      const sec = document.getElementById('precos');
      return {
        opts: document.querySelectorAll('#precos .period-opt').length,
        amount: sec.querySelector('.big-price .amount')?.textContent.trim(),
        cents: sec.querySelector('.big-price .cents')?.textContent.trim(),
        linha: sec.querySelector('[data-period-line]')?.textContent.trim(),
        href: sec.querySelector('a.chamada')?.getAttribute('href'),
        texto: sec.innerText,
        largo: [...document.querySelectorAll('body *')].filter((n) => n.getBoundingClientRect().right > window.innerWidth + 1).length,
      };
    })()`);
    const tag = `[${lang} ${largura}px]`;
    ok(r.opts === 0, `${tag} sem seletor de período (${r.opts})`);
    ok(r.amount === '39' && /90/.test(r.cents), `${tag} preço grande 39,90 (${r.amount}${r.cents})`);
    ok(/vital[íi]cia|lifetime/i.test(r.linha), `${tag} linha diz licença vitalícia (${r.linha})`);
    ok(!/\/m[êo]s|\/mo\b|3,33/.test(r.texto), `${tag} sem preço por mês`);
    ok(/plano=solo/.test(r.href || ''), `${tag} CTA leva ao plano solo (${r.href})`);
    ok(!/358|29,90|Economi|Save |% off|Mensal|Monthly/.test(r.texto), `${tag} sem mensal, 358, 29,90 ou economia`);
    ok(r.largo === 0, `${tag} nada passa da largura da tela`);
    ok(s.erros.length === 0, `${tag} sem console.error (${JSON.stringify(s.erros)})`);
  } finally { s.fechar(); }
}

// ---------- conta deslogada: link antigo com periodo=monthly também mostra o anual ----------
{
  const s = await abrir(`${BASE}/conta.html?plano=solo&periodo=monthly&lang=pt`, { largura: 1440, altura: 1400, bloquear: BLOQUEIO, porta: 9333 });
  try {
    await s.esperar(1000);
    const r = await s.avaliar(`({ sw: !!document.getElementById('period-switch-conta'),
      esc: document.querySelector('.panel.escolhido')?.innerText || '' })`);
    ok(!r.sw, 'conta sem #period-switch-conta');
    ok(/39,90/.test(r.esc) && /vital[íi]cia/i.test(r.esc) && !/3,33|1 ano/i.test(r.esc), `conta: periodo=monthly mostra o anual (${r.esc.replace(/\s+/g, ' ')})`);
    ok(s.erros.length === 0, `conta sem console.error (${JSON.stringify(s.erros)})`);
  } finally { s.fechar(); }
}

console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo ok');
process.exit(falhas ? 1 : 0);
