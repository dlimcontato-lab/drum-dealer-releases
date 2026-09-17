// Demo do topo, etapa de tela: o painel do plugin montado do layout gerado. Sem som até a Task 6.
import { montarPainel, escalar } from './dd-painel.js';

const V = '20260916a';
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
const painel = montarPainel(aparelho, layout, params, palJson, {
  mudou: nada, step: nada, accent: nada, pad: nada, rand: nada, gerar: nada, edit: nada, pal: nada,
});
painel.pintarGrade([
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
]);
escalar(document.getElementById('aparelho-rolo'), document.getElementById('aparelho-caixa'), aparelho);
window.__dd = { painel, layout, params };
