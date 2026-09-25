// Barra do topo de todas as páginas: logado vira avatar + primeiro nome; deslogado,
// "Entrar". Admin ganha o link "Admin". O avatar é plástico: foto dentro de um disco
// com lábio de luz, ou as iniciais gravadas quando não há foto. Também monta o botão PT | EN.
import { getSession, loadProfile, avatarUrl, ehAdmin, iniciais, nomeNoTopo, DOWNLOADS } from './dd-api.js?v=20260925p1';
import { t, montarSeletorIdioma, getLang } from './dd-i18n.js';

export function avatarNode(perfil, user, classe = '') {
  const sp = document.createElement('span');
  sp.className = 'avatar' + (classe ? ' ' + classe : '');
  const path = perfil && perfil.avatar_path;
  if (path) {
    const img = document.createElement('img');
    img.src = avatarUrl(path);
    img.alt = '';
    img.decoding = 'async';
    img.addEventListener('error', () => {
      img.remove();
      sp.textContent = iniciais(perfil && perfil.display_name, user && user.email);
    });
    sp.appendChild(img);
  } else {
    sp.textContent = iniciais(perfil && perfil.display_name, user && user.email);
  }
  return sp;
}

async function executar() {
  const nav = document.querySelector('.topbar nav');
  const session = await getSession();

  // os botões de download da home (.dl[data-baixar]): logado baixa direto do GitHub, sem passar
  // pela tela de conta — regra do Diogo (24/09): quem tem conta SEMPRE consegue baixar o VST; só
  // quem não se cadastrou passa pelo login/cadastro em conta.html?baixar=mac|win.
  if (session) {
    document.querySelectorAll('.dl[data-baixar]').forEach((a) => {
      const url = DOWNLOADS[a.dataset.baixar];
      if (url) { a.href = url; a.rel = 'noopener'; }
    });
  }

  if (!nav) return null;
  nav.appendChild(montarSeletorIdioma());
  const link = nav.querySelector('#nav-conta') || nav.querySelector('a[href^="conta.html"]');

  if (!session) {
    if (link) {
      link.textContent = t('nav.entrar');
      link.setAttribute('data-i18n', 'nav.entrar'); // re-traduz sozinho ao trocar de idioma
      link.classList.remove('me');
      link.href = 'conta.html';
    }
    return null;
  }

  const perfil = await loadProfile(session.user.id);
  if (link) {
    link.removeAttribute('data-i18n'); // agora tem avatar + nome: não é mais texto puro
    link.textContent = '';
    link.classList.add('me');
    link.href = 'conta.html';
    link.append(avatarNode(perfil, session.user), document.createTextNode(nomeNoTopo(perfil && perfil.display_name, session.user.email, getLang())));
  }

  // o site só esconde ou mostra o link; quem decide é o servidor
  try {
    if (await ehAdmin(session.user.id)) {
      if (!nav.querySelector('a[href^="admin.html"]')) {
        const a = document.createElement('a');
        a.href = 'admin.html';
        a.textContent = t('nav.admin');
        a.setAttribute('data-i18n', 'nav.admin');
        a.className = 'nav-admin';
        nav.insertBefore(a, link || null);
      }
    }
  } catch { /* sem backend de admin: o link simplesmente não aparece */ }

  return { session, perfil };
}

// uma execução por página: quem também precisa da sessão e do perfil reaproveita
let pronto = null;
export function montarTopo() {
  if (!pronto) pronto = executar();
  return pronto;
}

montarTopo();
