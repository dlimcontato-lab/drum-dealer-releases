// Task 2 da jornada de compra (F5/F9): resumo do plano antes do cadastro. Deslogado, com
// ?plano=<id>&periodo=<...> na URL, o #view-auth mostra um fieldset.panel.escolhido acima dos
// dois painéis (Entrar / Criar conta), com o plano, o período e o número de computadores, e o
// título muda para "Crie a conta para continuar". Bloqueia a rede do Supabase (como
// testes/precos.mjs) pra não depender do banco: dd-api.js completa com PLANOS_PADRAO.
import { abrir } from './cdp.mjs';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(__dirname, '..');
const BASE = process.argv[2] || 'http://localhost:8123';
const BLOQUEIO = ['*bwzngjvjxrqbalvoadpu.supabase.co*'];
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'ok: ' : 'FAIL: ') + m); if (!c) falhas++; };

mkdirSync(join(RAIZ, '.ciclo'), { recursive: true });

for (const largura of [390, 1440]) {
  const altura = largura === 390 ? 900 : 1400;
  const porta = largura === 390 ? 9480 : 9481;
  const s = await abrir(`${BASE}/conta.html?plano=studio&periodo=annual`, { largura, altura, bloquear: BLOQUEIO, porta });
  try {
    await s.esperar(900);
    const r = await s.avaliar(`(() => {
      const esc = document.querySelector('.panel.escolhido');
      const form = document.getElementById('form-login');
      return {
        titulo: document.getElementById('titulo').textContent.trim(),
        temEscolhido: !!esc,
        // .panel.escolhido precisa vir ANTES de #form-login no documento
        escolhidoAntes: !!(esc && form && (esc.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING)),
        textoEscolhido: esc ? esc.textContent.replace(/\\s+/g, ' ').trim() : '',
        viewAuthHidden: document.getElementById('view-auth').hidden,
        viewAccountHidden: document.getElementById('view-account').hidden,
        maiorQueViewport: [...document.querySelectorAll('body *')].filter((n) => n.getBoundingClientRect().right > window.innerWidth + 1).map((n) => n.tagName + '.' + n.className),
      };
    })()`);
    ok(r.titulo === 'Crie a conta para continuar', `[${largura}px] título "Crie a conta para continuar" (${r.titulo})`);
    ok(r.viewAuthHidden === false && r.viewAccountHidden === true, `[${largura}px] deslogado: tela de entrar visível, conta escondida`);
    ok(r.temEscolhido, `[${largura}px] .panel.escolhido existe`);
    ok(r.escolhidoAntes, `[${largura}px] .panel.escolhido vem antes de #form-login`);
    ok(r.textoEscolhido.includes('Studio'), `[${largura}px] resumo cita "Studio" (${r.textoEscolhido})`);
    ok(r.textoEscolhido.includes('1.318,80'), `[${largura}px] resumo cita "1.318,80" (${r.textoEscolhido})`);
    ok(r.textoEscolhido.includes('3 computadores'), `[${largura}px] resumo cita "3 computadores" (${r.textoEscolhido})`);
    ok(r.maiorQueViewport.length === 0, `[${largura}px] nenhum elemento passa de innerWidth (${JSON.stringify(r.maiorQueViewport)})`);
    ok(s.erros.length === 0, `[${largura}px] sem console.error (${JSON.stringify(s.erros)})`);
    await s.print(join(RAIZ, `.ciclo/f1-t2-${largura}.png`));
  } finally { s.fechar(); }
}

console.log(falhas === 0 ? 'CONTA-DESLOGADO: todos os testes passaram' : `${falhas} falhas`);
process.exit(falhas === 0 ? 0 : 1);
