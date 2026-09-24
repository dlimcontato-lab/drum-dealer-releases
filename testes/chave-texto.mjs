// Task 4 da jornada de compra (F7): textoChave() é o texto pronto (código + passo a passo) que
// a pessoa copia e manda pra quem vai ativar o BRDRUM com uma chave. Função pura, sem DOM: Node
// puro basta, sem CDP.
import { textoChave } from '../dd-textos.js';

let falhas = 0;
const ok = (c, m) => { console.log((c ? 'ok: ' : 'FAIL: ') + m); if (!c) falhas++; };

const casos = [
  { label: 'pt sem apelido', lang: 'pt', apelido: '' },
  { label: 'pt com apelido', lang: 'pt', apelido: 'PC da Nana' },
  { label: 'en sem apelido', lang: 'en', apelido: '' },
  { label: 'en com apelido', lang: 'en', apelido: "Nana's PC" },
];

for (const c of casos) {
  const texto = textoChave('ABCD-1234', c.apelido, c.lang);
  ok(texto.includes('ABCD-1234'), `${c.label}: contém o código (${JSON.stringify(texto)})`);
  const linhas = texto.split('\n').filter((l) => /^[1-4]\./.test(l.trim()));
  ok(linhas.length === 4, `${c.label}: 4 linhas numeradas (achou ${linhas.length})`);
  ok(texto.includes('I HAVE A KEY'), `${c.label}: cita "I HAVE A KEY"`);
  ok(texto.includes('ACTIVATE'), `${c.label}: cita "ACTIVATE"`);
  ok(!/\b(seats?|vagas?|acessos?)\b/i.test(texto), `${c.label}: sem seat/vaga/acesso`);
  if (c.apelido) ok(texto.includes(c.apelido), `${c.label}: contém o apelido "${c.apelido}"`);
  else ok(!texto.includes('()'), `${c.label}: sem apelido não deixa parênteses vazios`);
}

console.log(falhas === 0 ? 'chave-texto ok (4 casos)' : `${falhas} falhas`);
process.exit(falhas === 0 ? 0 : 1);
