// Aceite dos Termos de Uso no cadastro (24/09, decisão do Diogo): termos.html mostra a versão
// certa do idioma, conta.html trava o botão de criar conta até marcar a caixa, e o rodapé da
// home leva pra lá com a identificação do vendedor. Ninguém é cadastrado aqui.
import { abrir } from './cdp.mjs';

const BASE = process.argv[2] || 'http://localhost:8123';
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'ok: ' : 'FAIL: ') + m); if (!c) falhas++; };

// ---------- termos.html?lang=pt: mostra a seção PT, esconde a EN ----------
{
  const s = await abrir(`${BASE}/termos.html?lang=pt`, { largura: 1440, altura: 1400, porta: 9470 });
  try {
    await s.esperar(600);
    const r = await s.avaliar(`(() => ({
      titulo: document.querySelector('h2[data-i18n="termos.titulo"]').textContent.trim(),
      ptHidden: document.getElementById('lang-pt').hidden,
      enHidden: document.getElementById('lang-en').hidden,
      ptTemSecao1: document.getElementById('lang-pt').textContent.includes('Aceitação dos termos'),
      semEndereco: !document.body.textContent.includes('{ENDERECO}'),
    }))()`);
    ok(r.titulo === 'Termos de Uso', `?lang=pt: título "Termos de Uso" (${r.titulo})`);
    ok(r.ptHidden === false && r.enHidden === true, `?lang=pt: seção PT visível, EN escondida (ptHidden=${r.ptHidden} enHidden=${r.enHidden})`);
    ok(r.ptTemSecao1, 'seção PT tem o texto da cláusula 1 (Aceitação)');
    ok(r.semEndereco, 'sem {ENDERECO} sobrando na página');
    ok(s.erros.length === 0, `sem console.error em termos.html?lang=pt (${JSON.stringify(s.erros)})`);
  } finally { s.fechar(); }
}

// ---------- termos.html?lang=en: o contrário ----------
{
  const s = await abrir(`${BASE}/termos.html?lang=en`, { largura: 1440, altura: 1400, porta: 9471 });
  try {
    await s.esperar(600);
    const r = await s.avaliar(`(() => ({
      titulo: document.querySelector('h2[data-i18n="termos.titulo"]').textContent.trim(),
      ptHidden: document.getElementById('lang-pt').hidden,
      enHidden: document.getElementById('lang-en').hidden,
      enTemSecao1: document.getElementById('lang-en').textContent.includes('Acceptance of these terms'),
    }))()`);
    ok(r.titulo === 'Terms of Use', `?lang=en: título "Terms of Use" (${r.titulo})`);
    ok(r.ptHidden === true && r.enHidden === false, `?lang=en: seção EN visível, PT escondida (ptHidden=${r.ptHidden} enHidden=${r.enHidden})`);
    ok(r.enTemSecao1, 'seção EN tem o texto da clause 1 (Acceptance)');
    ok(s.erros.length === 0, `sem console.error em termos.html?lang=en (${JSON.stringify(s.erros)})`);
  } finally { s.fechar(); }
}

// ---------- conta.html: caixa desmarcada, botão desabilitado; marcar habilita ----------
{
  const s = await abrir(`${BASE}/conta.html`, { largura: 1400, altura: 900, porta: 9472 });
  try {
    await s.esperar(600);
    const antes = await s.avaliar(`(() => {
      const cx = document.getElementById('aceite-termos');
      const btn = document.querySelector('#form-signup button[type="submit"]');
      return { existe: !!cx, marcada: cx ? cx.checked : null, btnDisabled: btn ? btn.disabled : null };
    })()`);
    ok(antes.existe, '#aceite-termos existe em conta.html');
    ok(antes.marcada === false, `#aceite-termos começa desmarcada (${antes.marcada})`);
    ok(antes.btnDisabled === true, `botão de criar conta começa disabled (${antes.btnDisabled})`);

    await s.clicar('#aceite-termos');
    await s.esperar(200);
    const depois = await s.avaliar(`(() => {
      const cx = document.getElementById('aceite-termos');
      const btn = document.querySelector('#form-signup button[type="submit"]');
      return { marcada: cx.checked, btnDisabled: btn.disabled };
    })()`);
    ok(depois.marcada === true, 'marcar a caixa deixa ela checked');
    ok(depois.btnDisabled === false, `marcar a caixa habilita o botão de criar conta (${depois.btnDisabled})`);
    ok(s.erros.length === 0, `sem console.error em conta.html (${JSON.stringify(s.erros)})`);
  } finally { s.fechar(); }
}

// ---------- rodapé da home: link para termos.html, sem CPF nem nome pessoal ----------
{
  const s = await abrir(`${BASE}/index.html`, { largura: 1400, altura: 900, porta: 9473 });
  try {
    await s.esperar(600);
    const r = await s.avaliar(`(() => {
      const link = document.querySelector('footer.store-footer a[href="termos.html"]');
      return {
        temLink: !!link,
        textoLink: link ? link.textContent.trim() : '',
        rodapeTexto: document.querySelector('footer.store-footer').textContent,
      };
    })()`);
    ok(r.temLink, 'rodapé da home tem link para termos.html');
    ok(r.textoLink === 'Termos de Uso', `link do rodapé lê "Termos de Uso" (${r.textoLink})`);
    ok(!r.rodapeTexto.includes("CPF") && !r.rodapeTexto.includes("Diogo") && !r.rodapeTexto.includes("@"), "rodapé da home não mostra CPF, nome pessoal nem e-mail");
    ok(s.erros.length === 0, `sem console.error na home (${JSON.stringify(s.erros)})`);
  } finally { s.fechar(); }
}

console.log(falhas === 0 ? 'TERMOS: todos os testes passaram' : `${falhas} falhas`);
process.exit(falhas === 0 ? 0 : 1);
