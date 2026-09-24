// Testa textoCupom() (dd-admin.js) sem navegador: é função pura, mas o módulo que a exporta
// importa dd-topo.js/dd-i18n.js/dd-ui.js, que têm efeito colateral no carregamento (montam a
// barra do topo, aplicam i18n no <body>...). Por isso um shim mínimo de DOM antes do import —
// só o suficiente pra esses efeitos colaterais rodarem sem estourar (sessão nunca existe, então
// tudo cai cedo no caminho "sem login" de cada um). textoCupom em si não toca em nada disso.
// node testes/admin-cupom.mjs
const noop = () => {};
function makeEl() {
  return {
    style: {}, dataset: {}, hidden: false, disabled: false, value: '', textContent: '', className: '', innerHTML: '',
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    children: [], childNodes: [],
    addEventListener: noop, removeEventListener: noop,
    appendChild: (c) => c, append: noop, prepend: noop, remove: noop, insertBefore: (c) => c,
    setAttribute: noop, removeAttribute: noop, getAttribute: () => null,
    closest: () => null, matches: () => false,
    querySelector: () => null, querySelectorAll: () => [],
    focus: noop, select: noop, click: noop, reset: noop, scrollIntoView: noop,
  };
}
globalThis.document = {
  getElementById: () => makeEl(),
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => makeEl(),
  createTextNode: (t) => ({ textContent: t }),
  documentElement: makeEl(),
  body: makeEl(),
  addEventListener: noop,
  removeEventListener: noop,
  dispatchEvent: noop,
  readyState: 'complete',
};
globalThis.window = { addEventListener: noop, removeEventListener: noop };
globalThis.location = { hash: '', search: '', href: '', replace: noop };
// Node 21+ já tem um `navigator` global (read-only getter): sobrescreve com defineProperty.
Object.defineProperty(globalThis, 'navigator', {
  value: { language: 'pt-BR', clipboard: { writeText: async () => {} } }, configurable: true,
});
Object.defineProperty(globalThis, 'localStorage', {
  value: { getItem: () => null, setItem: noop, removeItem: noop }, configurable: true,
});

const { textoCupom } = await import('../dd-admin.js');

let falhas = 0;
const ok = (c, m) => { console.log((c ? 'ok: ' : 'FAIL: ') + m); if (!c) falhas++; };
const contem = (texto, trecho, m) => ok(texto.includes(trecho), `${m} — esperado conter: ${JSON.stringify(trecho)}`);
const naoContem = (texto, trecho, m) => ok(!texto.includes(trecho), `${m} — não deveria conter: ${JSON.stringify(trecho)}`);
const linha = (texto, prefixo) => texto.split('\n').find((l) => l.startsWith(prefixo));

// ---- caso 1: 100% (grátis), com validade e usos --------------------------------------------
{
  const c = {
    code: 'BRDFREE-A7K2-M9QX', kind: 'percent', value: 100, applies_to: 'all',
    valid_until: '2026-12-31T23:59:00.000Z', max_uses: 50,
  };
  const t = textoCupom(c);
  contem(t, 'Cupom BRDRUM: BRDFREE-A7K2-M9QX (acesso grátis, 100% de desconto)', 'caso 1 · primeira linha');
  contem(t, 'o desconto de 100% aparece no valor.', 'caso 1 · passo 3');
  contem(t, '4. Clique em Ativar grátis.', 'caso 1 · passo 4');
  naoContem(t, 'Clique em Pagar', 'caso 1 · passo 4 não deve falar em Pagar');
  contem(t, 'Válido até 31/12/2026.', 'caso 1 · válido até');
  contem(t, 'Cada cupom tem um número limitado de usos.', 'caso 1 · usos');
  console.log('--- texto completo do caso 1 ---\n' + t + '\n--------------------------------');
}

// ---- caso 2: fixo 4900 centavos (abaixo do limiar de grátis, 4999), sem validade -----------
{
  const c = { code: 'PROMO10', kind: 'fixed', value: 4900, applies_to: 'plans', valid_until: null, max_uses: null };
  const t = textoCupom(c);
  contem(t, 'Cupom BRDRUM: PROMO10 (R$ 49,00 de desconto)', 'caso 2 · primeira linha');
  contem(t, 'o desconto de R$ 49,00 aparece no valor.', 'caso 2 · passo 3');
  contem(t, '4. Clique em Pagar (ou em Ativar grátis, quando o valor for zero).', 'caso 2 · passo 4');
  ok(!linha(t, 'Válido até'), 'caso 2 · sem linha "Válido até"');
  naoContem(t, 'usos', 'caso 2 · sem frase de usos');
}

// ---- caso 3: percent 10 pra packs -----------------------------------------------------------
{
  const c = { code: 'PACK10', kind: 'percent', value: 10, applies_to: 'packs', valid_until: null, max_uses: null };
  const t = textoCupom(c);
  contem(t, 'Cupom BRDRUM: PACK10 (10% de desconto)', 'caso 3 · primeira linha');
  contem(t, 'o desconto de 10% aparece no valor.', 'caso 3 · passo 3');
  contem(t, '4. Clique em Pagar (ou em Ativar grátis, quando o valor for zero).', 'caso 3 · passo 4');
  contem(t, '2. Em Minha conta, na aba Packs, escolha o pack.', 'caso 3 · passo 2 (packs)');
  ok(!linha(t, 'Válido até'), 'caso 3 · sem linha "Válido até"');
}

console.log(falhas ? `\n${falhas} falha(s).` : '\nTudo certo.');
process.exit(falhas ? 1 : 0);
