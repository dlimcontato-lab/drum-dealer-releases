// Central de ajuda (24/09): ajuda.html (visitante sem conta), a aba Ajuda em conta.html e a aba
// Mensagens no admin. Escopo mínimo (decisão do Diogo, mesma data): sem histórico de conversa na
// conta, sem resposta pelo painel — só formulário público + lista/leitura no admin. Este teste é
// deslogado (CDP, rede do Supabase bloqueada como em testes/conta-deslogado.mjs): confere DOM,
// honeypot, responsividade e os rodapés/abas que não dependem de sessão nem do backend `support`.
import { abrir } from './cdp.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(__dirname, '..');
const BASE = process.argv[2] || 'http://localhost:8123';
const BLOQUEIO = ['*bwzngjvjxrqbalvoadpu.supabase.co*'];
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'ok: ' : 'FAIL: ') + m); if (!c) falhas++; };

// ---------- ajuda.html em 390 e 1440: e-mail, textarea, botão, honeypot fora da tela ----------
for (const largura of [390, 1440]) {
  const altura = largura === 390 ? 900 : 1400;
  const porta = largura === 390 ? 9490 : 9491;
  const s = await abrir(`${BASE}/ajuda.html`, { largura, altura, bloquear: BLOQUEIO, porta });
  try {
    await s.esperar(700);
    const r = await s.avaliar(`(() => {
      const form = document.getElementById('form-ajuda');
      const email = form ? form.email : null;
      const corpo = form ? form.body : null;
      const botao = form ? form.querySelector('button[type=submit]') : null;
      const hp = document.getElementById('ajuda-hp');
      const rHp = hp ? hp.getBoundingClientRect() : null;
      return {
        temForm: !!form,
        temEmail: !!email && email.type === 'email' && email.required,
        temTextarea: !!corpo && corpo.tagName === 'TEXTAREA',
        temBotao: !!botao,
        hpForaDaTela: !!hp && (rHp.left < 0 || hp.offsetParent === null),
        hpTabindex: hp ? hp.getAttribute('tabindex') : null,
        hpAutocomplete: hp ? hp.getAttribute('autocomplete') : null,
        maiorQueViewport: [...document.querySelectorAll('body *')].filter((n) => n.getBoundingClientRect().right > window.innerWidth + 1).map((n) => n.tagName + '.' + n.className),
      };
    })()`);
    ok(r.temForm, `[${largura}px] ajuda.html tem #form-ajuda`);
    ok(r.temEmail, `[${largura}px] campo de e-mail obrigatório`);
    ok(r.temTextarea, `[${largura}px] textarea da mensagem`);
    ok(r.temBotao, `[${largura}px] botão de enviar`);
    ok(r.hpForaDaTela, `[${largura}px] honeypot fora da tela (left<0 ou offsetParent null)`);
    ok(r.hpTabindex === '-1', `[${largura}px] honeypot com tabindex="-1" (${r.hpTabindex})`);
    ok(r.hpAutocomplete === 'off', `[${largura}px] honeypot com autocomplete="off" (${r.hpAutocomplete})`);
    ok(r.maiorQueViewport.length === 0, `[${largura}px] nenhum elemento passa de innerWidth (${JSON.stringify(r.maiorQueViewport)})`);
    ok(s.erros.length === 0, `[${largura}px] sem console.error em ajuda.html (${JSON.stringify(s.erros)})`);
  } finally { s.fechar(); }
}

// ---------- rodapé: index.html, conta.html e termos.html apontam para ajuda.html ----------
{
  const paginas = [
    { arquivo: 'index.html', seletor: 'footer.store-footer a[href="ajuda.html"]', porta: 9492 },
    { arquivo: 'conta.html', seletor: 'footer a[href="ajuda.html"]', porta: 9493 },
    { arquivo: 'termos.html', seletor: 'footer a[href="ajuda.html"]', porta: 9494 },
  ];
  for (const p of paginas) {
    const s = await abrir(`${BASE}/${p.arquivo}`, { largura: 1400, altura: 900, bloquear: BLOQUEIO, porta: p.porta });
    try {
      await s.esperar(600);
      const r = await s.avaliar(`(() => {
        const a = document.querySelector(${JSON.stringify(p.seletor)});
        return { temLink: !!a, texto: a ? a.textContent.trim() : '' };
      })()`);
      ok(r.temLink, `${p.arquivo}: rodapé tem link para ajuda.html`);
      ok(r.texto === 'Central de ajuda', `${p.arquivo}: link do rodapé lê "Central de ajuda" (${r.texto})`);
    } finally { s.fechar(); }
  }
}

// ---------- conta.html: aba Ajuda no DOM (deslogado, mas o markup já existe na página) ----------
{
  const s = await abrir(`${BASE}/conta.html`, { largura: 1400, altura: 900, bloquear: BLOQUEIO, porta: 9495 });
  try {
    await s.esperar(600);
    const r = await s.avaliar(`(() => ({
      temAba: !!document.querySelector('[data-aba="ajuda"]'),
      temPane: !!document.getElementById('pane-ajuda'),
      temForm: !!document.getElementById('form-ajuda-conta'),
    }))()`);
    ok(r.temAba, 'conta.html: botão [data-aba="ajuda"] existe');
    ok(r.temPane, 'conta.html: #pane-ajuda existe no DOM');
    ok(r.temForm, 'conta.html: #form-ajuda-conta existe dentro do pane');
    ok(s.erros.length === 0, `conta.html: sem console.error (${JSON.stringify(s.erros)})`);
  } finally { s.fechar(); }
}

// ---------- admin.html: aba Mensagens no markup ----------
// Leitura estática, não CDP: deslogado, admin.html faz location.replace('conta.html') assim que
// confirma que não há sessão (dd-admin.js), o que navegaria a aba pra fora antes de conseguirmos
// inspecionar o DOM. O botão e o pane já existem no HTML servido, sessão ou não.
{
  const html = readFileSync(join(RAIZ, 'admin.html'), 'utf8');
  ok(html.includes('data-aba="mensagens"'), 'admin.html: botão [data-aba="mensagens"] existe no markup');
  ok(html.includes('id="pane-mensagens"'), 'admin.html: #pane-mensagens existe no markup');
}

console.log(falhas === 0 ? 'AJUDA: todos os testes passaram' : `${falhas} falhas`);
process.exit(falhas === 0 ? 0 : 1);
