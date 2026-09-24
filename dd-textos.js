// Texto pronto (código + passo a passo) que a pessoa cola pra quem vai ativar o BRDRUM com uma
// chave — Task 4 da jornada de compra (F7, docs/ciclo/2026-09-24-jornada-compra-plano.md).
// Função pura: sem DOM, sem rede, sem depender do idioma global de dd-i18n.js — só string, fácil
// de testar em Node (testes/chave-texto.mjs) e de reusar em conta.js.
//
// A tela do plugin citada aqui ("I HAVE A KEY") é a de hoje. A Fase 3 (fora desta fase) troca o
// plugin pra "ACTIVATE WITH A KEY" — quando isso sair, esta função troca junto.
export function textoChave(codigo, apelido, lang) {
  const rotulo = apelido ? ` (${apelido})` : '';
  if (lang === 'en') {
    return `Your BRDRUM key${rotulo}: ${codigo}

1. Install BRDRUM: download it at https://brdrum.com (Mac or Windows) and run the installer.
2. Open the plugin in your DAW. On the ACTIVATION screen, click I HAVE A KEY.
3. Paste the key in the KEY field and click ACTIVATE.
4. Done. The key works on one computer.`;
  }
  return `Sua chave do BRDRUM${rotulo}: ${codigo}

1. Instale o BRDRUM: baixe em https://brdrum.com (Mac ou Windows) e rode o instalador.
2. Abra o plugin no seu programa de música. Na tela ACTIVATION, clique em I HAVE A KEY.
3. Cole a chave no campo KEY e clique em ACTIVATE.
4. Pronto. A chave vale para um computador.`;
}
