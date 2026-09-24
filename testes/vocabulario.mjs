// Task 1 da jornada de compra (F4): uma palavra só para o posto de uso — "computador(es)" em vez
// de acesso(s)/vaga(s)/seat(s)/máquina(s)/machine(s). Lê o texto puro dos arquivos (sem executar
// nada em browser) e falha se algum valor de dd-i18n.js (pt ou en) ou o texto visível de
// index.html/conta.html ainda usar o vocabulário antigo. Segue o estilo Node puro dos outros
// testes de texto (testes/precos.mjs, item (i): leitura de arquivo + regex).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(__dirname, '..');
let falhas = 0;
const ok = (c, m) => { console.log((c ? 'ok: ' : 'FAIL: ') + m); if (!c) falhas++; };

const PROIBIDO = /\b(acessos?|vagas?|seats?|máquinas?|maquinas?|machines?)\b/i;

// {acessos}, {maquina} etc. são nomes de variável do template (t(chave, {acessos: seatWord(n)})),
// não texto que a pessoa lê — o valor já resolvido nunca contém a palavra proibida depois que
// seatWord()/common.seat-word-* viram "computador"/"computadores". Removidos antes de testar.
const semPlaceholders = (s) => s.replace(/\{[a-zA-Z0-9_]+\}/g, '');

// extrai todo par 'chave': 'valor' (ou "valor") de um bloco do dicionário
function extrairChaves(bloco) {
  const re = /'([a-zA-Z0-9_.-]+)':\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g;
  const mapa = new Map();
  let m;
  while ((m = re.exec(bloco))) {
    const chave = m[1];
    const valor = m[2] !== undefined ? m[2] : m[3];
    mapa.set(chave, valor);
  }
  return mapa;
}

const i18nSrc = readFileSync(join(RAIZ, 'dd-i18n.js'), 'utf8');
const iEn = i18nSrc.indexOf('\n  en: {');
const iDictFim = i18nSrc.indexOf('\n};', iEn);
if (iEn < 0 || iDictFim < 0) throw new Error('não achei os blocos pt:/en: em dd-i18n.js');
const blocoPt = i18nSrc.slice(0, iEn);
const blocoEn = i18nSrc.slice(iEn, iDictFim);
const pt = extrairChaves(blocoPt);
const en = extrairChaves(blocoEn);

let ocorrencias = 0;
for (const [chave, valor] of pt) {
  const bateu = PROIBIDO.test(semPlaceholders(valor));
  if (bateu) { ocorrencias++; ok(false, `pt['${chave}'] sem vocabulário proibido (${JSON.stringify(valor)})`); }
}
ok(true, `${pt.size} chaves PT varridas`);
for (const [chave, valor] of en) {
  const bateu = PROIBIDO.test(semPlaceholders(valor));
  if (bateu) { ocorrencias++; ok(false, `en['${chave}'] sem vocabulário proibido (${JSON.stringify(valor)})`); }
}
ok(true, `${en.size} chaves EN varridas`);

// ---------- index.html / conta.html: só o texto que a pessoa lê (sem tags, atributos, comentários, script/style) ----------
function textoVisivel(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ');
}

for (const arquivo of ['index.html', 'conta.html']) {
  const html = readFileSync(join(RAIZ, arquivo), 'utf8');
  const texto = textoVisivel(html);
  const achado = texto.match(PROIBIDO);
  if (achado) ocorrencias++;
  ok(!achado, `${arquivo}: texto visível sem vocabulário proibido${achado ? ` (achou "${achado[0]}")` : ''}`);
}

console.log(falhas === 0
  ? `vocabulario ok (${pt.size} chaves PT, ${en.size} chaves EN, ${ocorrencias} ocorrências)`
  : `${falhas} falhas`);
process.exit(falhas === 0 ? 0 : 1);
