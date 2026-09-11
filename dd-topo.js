// Barra do topo de todas as páginas: logado vira avatar + primeiro nome; deslogado,
// "Entrar". Admin ganha o link "Admin". O avatar é plástico: foto dentro de um disco
// com lábio de luz, ou as iniciais gravadas quando não há foto.
import { getSession, loadProfile, avatarUrl, ehAdmin, iniciais, primeiroNome } from './dd-api.js?v=20260911p';

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
  if (!nav) return null;
  const link = nav.querySelector('#nav-conta') || nav.querySelector('a[href^="conta.html"]');
  const session = await getSession();

  if (!session) {
    if (link) {
      link.textContent = 'Entrar';
      link.classList.remove('me');
      link.href = 'conta.html';
    }
    return null;
  }

  const perfil = await loadProfile(session.user.id);
  if (link) {
    link.textContent = '';
    link.classList.add('me');
    link.href = 'conta.html';
    link.append(avatarNode(perfil, session.user), document.createTextNode(primeiroNome(perfil && perfil.display_name, session.user.email)));
  }

  // o site só esconde ou mostra o link; quem decide é o servidor
  try {
    if (await ehAdmin(session.user.id)) {
      if (!nav.querySelector('a[href^="admin.html"]')) {
        const a = document.createElement('a');
        a.href = 'admin.html';
        a.textContent = 'Admin';
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
