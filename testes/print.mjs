// node testes/print.mjs <url> <arquivo.png> [largura] [seletor] [movel|reduzido]
import { abrir } from './cdp.mjs';

const [url, arquivo, largura = '1680', seletor = '#demo', modo = ''] = process.argv.slice(2);
const s = await abrir(url, { largura: +largura, altura: +largura <= 400 ? 844 : 1200, movel: modo === 'movel', reduzido: modo === 'reduzido' });
try {
  await s.esperar(2500);
  await s.print(arquivo, seletor);
  console.log('print salvo em', arquivo);
} finally {
  s.fechar();
}
