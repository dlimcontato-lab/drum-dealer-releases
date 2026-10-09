// Entrar com Google e Esqueci a senha (plano docs/ciclo/2026-10-09-login-google-plano.md, tasks 4 e 5),
// sem rede do Supabase (bloqueada, como testes/conta-deslogado.mjs). Cobre o que roda no navegador:
// botão e textos, a ida para o /authorize com PKCE (challenge = SHA-256 do verifier guardado), a volta
// com ?error= (mensagem neutra, ?plano= preservado), a volta com ?code= (verifier usado uma vez, URL limpa)
// e o código sem verifier deste navegador. A troca real do código e a recusa da trava são provadas em
// produção (task 8). Uso: node testes/conta-google.mjs [http://localhost:8123]
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
  const altura = largura === 390 ? 1100 : 1400;
  const porta = largura === 390 ? 9482 : 9483;
  const s = await abrir(`${BASE}/conta.html?plano=solo`, { largura, altura, bloquear: BLOQUEIO, porta });
  const tag = `[${largura}px]`;
  try {
    await s.esperar(900);

    // A. botão, termos e "Esqueci a senha" sem e-mail
    const a = await s.avaliar(`(() => {
      const b = document.getElementById('btn-google');
      const links = [...document.querySelectorAll('.google-panel a')].map((x) => x.getAttribute('href'));
      return { visivel: !!b && b.offsetParent !== null, texto: b ? b.textContent.trim() : '', links,
        googleAntesLogin: !!(b && b.compareDocumentPosition(document.getElementById('form-login')) & Node.DOCUMENT_POSITION_FOLLOWING),
        esqueci: !!document.getElementById('btn-esqueci'),
        larga: [...document.querySelectorAll('body *')].filter((n) => n.getBoundingClientRect().right > innerWidth + 1).map((n) => n.tagName + '.' + n.className) };
    })()`);
    ok(a.visivel && a.texto === 'Continuar com Google', `${tag} botão "Continuar com Google" visível (${a.texto})`);
    ok(a.googleAntesLogin, `${tag} o Google vem antes do formulário de entrar`);
    ok(a.links.includes('termos.html') && a.links.includes('privacidade.html'), `${tag} frase do aceite com Termos e Privacidade (${a.links})`);
    ok(a.larga.length === 0, `${tag} nada passa da largura da tela (${JSON.stringify(a.larga)})`);
    await s.print(join(RAIZ, '.ciclo', `conta-google-${largura}.png`), '#view-auth');

    await s.clicar('#btn-esqueci');
    await s.esperar(200);
    const semEmail = await s.avaliar(`document.getElementById('msg-login').textContent`);
    ok(/Escreva seu e-mail/.test(semEmail), `${tag} Esqueci a senha sem e-mail pede o e-mail (${semEmail})`);

    // B. ida para o Google: /authorize com PKCE, retorno para este endereço
    // grava a URL de ida (a navegação de topo não é barrada pelo bloqueio e segue até o Google de verdade)
    await s.avaliar(`(() => { const o = URL.prototype.toString; URL.prototype.toString = function () {
      const r = o.call(this); if (r.includes('/auth/v1/authorize')) sessionStorage.setItem('ida', r); return r; }; })()`);
    await s.clicar('#btn-google');
    await s.esperar(2500);
    const destino = await s.avaliar('location.href');
    ok(/accounts\.google\.com/.test(destino) && destino.includes('851295919719'), `${tag} o Supabase aceitou e mandou para o Google com o client_id do BRDRUM`);
    await s.cmd('Page.navigate', { url: `${BASE}/termos.html` });
    await s.esperar(800);
    const ida = new URL(await s.avaliar(`sessionStorage.getItem('ida') || 'about:blank'`));
    ok(ida.origin === 'https://bwzngjvjxrqbalvoadpu.supabase.co' && ida.pathname === '/auth/v1/authorize', `${tag} clique vai para o /authorize do Supabase (${ida.origin}${ida.pathname})`);
    ok(ida.searchParams.get('provider') === 'google', `${tag} provider=google`);
    ok(ida.searchParams.get('redirect_to') === `${BASE}/conta.html`, `${tag} redirect_to = ${ida.searchParams.get('redirect_to')}`);
    ok(ida.searchParams.get('code_challenge_method') === 's256', `${tag} code_challenge_method=s256`);
    ok(!/access_token|refresh_token/.test(ida.href), `${tag} nenhum token na URL de ida`);
    const challenge = ida.searchParams.get('code_challenge') || '';

    // de volta ao site: o verifier guardado bate com o challenge enviado
    const conf = await s.avaliar(`(async () => {
      const g = JSON.parse(localStorage.getItem('dd.oauth') || 'null');
      if (!g) return { g: null };
      const d = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(g.v)));
      let x = ''; for (const b of d) x += String.fromCharCode(b);
      return { g, calc: btoa(x).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '') };
    })()`);
    ok(conf.g && conf.g.v.length >= 43 && conf.g.tipo === 'google', `${tag} verifier guardado (${conf.g && conf.g.v.length} caracteres, tipo ${conf.g && conf.g.tipo})`);
    ok(conf.calc === challenge && challenge.length === 43, `${tag} challenge = SHA-256 do verifier (base64url, 43)`);
    ok(conf.g && conf.g.q === '?plano=solo', `${tag} ?plano=solo guardado para a volta (${conf.g && conf.g.q})`);

    // C. volta com ?error= (cancelou, ou conta com senha recusada pela trava): mensagem neutra, plano preservado
    await s.cmd('Page.navigate', { url: `${BASE}/conta.html?error=server_error&error_code=unexpected_failure&error_description=x` });
    await s.esperar(1000);
    const c = await s.avaliar(`({ url: location.pathname + location.search, msg: document.getElementById('msg-google').textContent,
      titulo: document.getElementById('titulo').textContent.trim(), auth: !document.getElementById('view-auth').hidden })`);
    ok(c.url === '/conta.html?plano=solo', `${tag} volta com erro limpa a URL e mantém o plano (${c.url})`);
    ok(/Não deu para entrar com o Google/.test(c.msg) && /Esqueci a senha/.test(c.msg), `${tag} mensagem neutra com a saída por senha (${c.msg})`);
    ok(c.auth && c.titulo === 'Crie a conta para continuar', `${tag} segue na tela de entrar com o plano escolhido (${c.titulo})`);

    // D. volta com ?code= e verifier: o verifier é gasto antes da troca; sem rede, mensagem e URL limpa
    await s.avaliar(`localStorage.setItem('dd.oauth', JSON.stringify({ v: 'x'.repeat(43), tipo: 'google', q: '?plano=solo', t: Date.now() }))`);
    await s.cmd('Page.navigate', { url: `${BASE}/conta.html?code=codigo-de-teste` });
    await s.esperar(1200);
    const d = await s.avaliar(`({ url: location.pathname + location.search, msg: document.getElementById('msg-google').textContent,
      sobrou: localStorage.getItem('dd.oauth'), sessao: localStorage.getItem('dd.session') })`);
    ok(d.url === '/conta.html?plano=solo', `${tag} volta com código limpa a URL (${d.url})`);
    ok(d.sobrou === null, `${tag} verifier apagado depois de usado`);
    ok(d.sessao === null, `${tag} troca sem resposta não cria sessão`);
    ok(/Não deu para entrar com o Google/.test(d.msg), `${tag} troca falhou: mensagem (${d.msg})`);

    // E. código sem verifier deste navegador (link aberto em outro navegador)
    await s.cmd('Page.navigate', { url: `${BASE}/conta.html?code=outro-navegador` });
    await s.esperar(1000);
    const e = await s.avaliar(`({ url: location.pathname + location.search, msg: document.getElementById('msg-google').textContent })`);
    ok(e.url === '/conta.html', `${tag} código sem verifier: URL limpa (${e.url})`);
    ok(/outro navegador/.test(e.msg), `${tag} código sem verifier: explica o outro navegador (${e.msg})`);

    ok(s.erros.length === 0, `${tag} sem console.error (${JSON.stringify(s.erros)})`);
  } finally { s.fechar(); }
}

console.log(falhas ? `CONTA-GOOGLE: ${falhas} falha(s)` : 'CONTA-GOOGLE: todos os testes passaram');
process.exit(falhas ? 1 : 0);
