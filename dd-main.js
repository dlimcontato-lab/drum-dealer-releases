// Demo do topo, etapa de tela: painel do plugin + EDIT do MASTER FX. Sem som até a Task 6.
import { montarPainel, escalar, GRADE_INICIAL } from './dd-painel.js';
import { montarEdit } from './dd-edit.js';

const V = '20260916b';
const carregar = (u) => fetch(u + '?v=' + V).then((r) => {
  if (!r.ok) throw new Error(u + ': ' + r.status);
  return r.json();
});
const [layout, lista, palJson] = await Promise.all([
  carregar('painel/layout.json'), carregar('painel/params.json'), carregar('painel/pal.json'),
]);
const params = new Map(lista.map((p) => [p.id, p]));
const aparelho = document.getElementById('aparelho');
const nada = () => {};
let edit = null;
const ao = {
  mudou(id) { if (id.startsWith('sat') && edit) edit.atualizar(); },
  step: nada, accent: nada, pad: nada, rand: nada, gerar: nada, pal: nada, preset: nada,
  edit(p) { edit.alternar(p); },
  editMudou(p) { painel.editTeclas.forEach((t, i) => t.classList.toggle('on-sync', i === p)); },
  teclaEdit: (p) => painel.editTeclas[p],
};
const painel = montarPainel(aparelho, layout, params, palJson, ao);
edit = montarEdit(aparelho, layout, params, painel.controles, ao);
painel.pintarGrade(GRADE_INICIAL);
escalar(document.getElementById('aparelho-rolo'), document.getElementById('aparelho-caixa'), aparelho);
if (location.hash === '#edit-sat') edit.abrir(0);
if (location.hash === '#edit-mb') edit.abrir(1);
window.__dd = { painel, edit, layout, params };
