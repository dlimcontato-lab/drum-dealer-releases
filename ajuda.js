// Central de ajuda para quem não tem conta (ajuda.html). Logado, a página redireciona para a aba
// Ajuda dentro de conta.html — a conversa fica ligada à conta, não a esta tela. Contrato:
// ~/Sistema AI/drum-dealer-backend/docs/ciclo/2026-09-24-central-de-ajuda-spec.md
import { getSession, supportSend, mensagemSupport } from './dd-api.js?v=20261009a';
import { montarTopo } from './dd-topo.js?v=20261009a';
import { $, msg } from './dd-ui.js?v=20261009a';
import { t } from './dd-i18n.js';

function atualizarContador() {
  $('ajuda-contador').textContent = t('ajuda.contador', { n: $('form-ajuda').body.value.length });
}

$('form-ajuda').body.addEventListener('input', atualizarContador);
atualizarContador();

$('form-ajuda').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const email = f.email.value.trim().toLowerCase();
  const corpo = f.body.value.trim();
  if (corpo.length < 10 || corpo.length > 2000) return msg($('msg-ajuda'), t('ajuda.mensagem-tamanho'), 'err');
  const botao = f.querySelector('button[type=submit]');
  botao.disabled = true;
  msg($('msg-ajuda'), t('ajuda.enviando'));
  try {
    await supportSend({ email, body: corpo, hp: f.hp.value });
    msg($('msg-ajuda'), t('ajuda.sucesso'), 'ok');
    f.reset();
    atualizarContador();
  } catch (err) {
    msg($('msg-ajuda'), mensagemSupport(err), 'err');
  } finally { botao.disabled = false; }
});

(async () => {
  await montarTopo();
  const session = await getSession();
  if (session) location.replace('conta.html#ajuda');
})();
