---
name: Drum Dealer — Rhythm Composer DD 001
description: O painel do plugin virou página. Neobrutalismo herdado do próprio aparelho, não inventado para a web.
colors:
  bg: "#e8e0cf"
  card: "#f2ead9"
  ink: "#14120f"
  orange: "#e8762c"
  red: "#d92b26"
  yellow: "#e8c53a"
  graphite: "#2b2925"
  rack: "#1b1916"
  rack-line: "#3a352e"
  ink-muted: "#5f5849"
  rack-muted: "#8f8676"
  contrast-white: "#ffffff"
typography:
  display:
    fontFamily: "Archivo Black, Archivo, sans-serif"
    fontSize: "clamp(3.2rem, 11vw, 8.5rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Archivo Black, Archivo, sans-serif"
    fontSize: "clamp(1.9rem, 4.4vw, 3.1rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Archivo Black, Archivo, sans-serif"
    fontSize: "clamp(1.15rem, 2vw, 1.45rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  plate:
    fontFamily: "Georgia, Times New Roman, serif"
    fontSize: "clamp(1.05rem, 1.6vw, 1.28rem)"
    fontWeight: 400
    lineHeight: 1.2
  lead:
    fontFamily: "Archivo, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(1.05rem, 1.6vw, 1.28rem)"
    fontWeight: 500
    lineHeight: 1.45
  body:
    fontFamily: "Archivo, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.55
  label:
    fontFamily: "Archivo Black, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    letterSpacing: "0.04em"
  mono:
    fontFamily: "Martian Mono, SFMono-Regular, ui-monospace, monospace"
    fontSize: "0.78rem"
    fontWeight: 400
    letterSpacing: "-0.04em"
  legend:
    fontFamily: "Martian Mono, monospace"
    fontSize: "0.56rem"
    fontWeight: 600
    letterSpacing: "-0.03em"
rounded:
  none: "0"
  pointer: "2px"
  inline: "3px"
  key: "4px"
  field: "5px"
  control: "6px"
  surface: "8px"
  full: "50%"
spacing:
  s1: "0.5rem"
  s2: "0.875rem"
  s3: "1.25rem"
  s4: "2rem"
  s5: "3.25rem"
  s6: "5rem"
components:
  button-primary:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 20px"
  button-primary-hover:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.ink}"
  button-primary-playing:
    backgroundColor: "{colors.red}"
    textColor: "{colors.card}"
  button-primary-disabled:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink-muted}"
  button-ghost:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 20px"
  button-yellow:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 20px"
  download-primary:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "1.25rem 0.875rem"
  download-alt:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "1.25rem 0.875rem"
  panel:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "0.875rem"
  panel-title:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "2px 9px"
  step:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.key}"
    padding: "0"
    height: "46px"
  step-g1:
    backgroundColor: "{colors.red}"
  step-g2:
    backgroundColor: "{colors.orange}"
  step-g3:
    backgroundColor: "{colors.yellow}"
  step-g4:
    backgroundColor: "{colors.card}"
  knob-channel:
    backgroundColor: "{colors.graphite}"
    rounded: "{rounded.full}"
    width: "36px"
    height: "36px"
  knob-panel:
    backgroundColor: "{colors.orange}"
    rounded: "{rounded.full}"
    width: "52px"
    height: "52px"
  label-instrument:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.card}"
    rounded: "{rounded.control}"
    padding: "0"
  toggle-mute:
    backgroundColor: "{colors.red}"
    textColor: "{colors.card}"
    rounded: "{rounded.key}"
  toggle-solo:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.key}"
---

# Design System: Drum Dealer — Rhythm Composer DD 001

## Overview

**Creative North Star: "O Painel Virou Página"**

Este mundo visual não foi inventado para a web. Ele já existia, parafusado dentro do plugin, e a página apenas se estendeu a partir dele. A autoridade visual é dupla e tem endereço: `drum-dealer-ui.png` para o que se vê, e `MaschinLookAndFeel.h` — o código que desenha o painel — para os números. O site é neobrutalista porque o aparelho é neobrutalista: creme de painel, contorno preto grosso, sombra dura sem desfoque, canto suavemente arredondado na medida do plugin, cor chapada. Nada aqui é estilo aplicado por cima; é a mesma serigrafia continuando fora do plugin.

A consequência prática é que a página não tem liberdade de paleta nem de forma. Quando um controle da demo precisa de cor, a resposta já está no painel: laranja se for painel/FX, grafite se for canal. Quando um bloco de conteúdo precisa de cor, a resposta também já está lá: os quatro quartos do sequencer. A página é densa onde a máquina é densa (a unidade, com 96 steps, 42 knobs e a coluna de painéis) e larga onde é texto. Ela alterna campos de cor em escala de página — creme, rack escuro, creme, amarelo, creme, rack escuro — de modo que a máquina apareça montada num rack e o fecho devolva o visitante ao mesmo escuro em que ele a viu tocar.

**Anti-referência confirmada.** Existiu uma tentativa de substituir este mundo por um painel de rack preto anodizado com fita de gaffer e etiqueta Dymo — a direção "Sala Técnica", seed `7ca4ebdb`. Ela foi travada e depois **revertida explicitamente pelo Diogo** em 2026-08-27, com a instrução de voltar a ser fiel ao VST de hoje e seguir o neobrutalismo. O veredito e as comps estão em `.impeccable/mocks/DESCARTADO.md`. Nenhuma sessão futura deve reconstruir aquela direção: não é uma alternativa em aberto, é uma direção descartada.

**Key Characteristics:**
- Mundo incumbente: a autoridade é o painel do plugin, não a página
- Contorno preto de 2,5px (2px nas peças internas) em tudo que é superfície
- Sombra dura deslocada, sem blur e sem alpha; a sombra é curso de tecla, não profundidade
- Escada de raios herdada do `MaschinLookAndFeel.h` (2/3/4/5/6/8), círculo só onde o aparelho é redondo
- Cor chapada; gradiente só como corte duro, nunca como transição
- Quatro cores de grupo do sequencer governando a página inteira
- Um único momento de movimento na página inteira, e ele é a batida

## Colors

A paleta inteira é lida do painel do plugin. Os neutros batem quase em pixel; os três cromáticos foram saturados para aguentar tela grande.

O que a amostragem de `drum-dealer-ui.png` devolve, contra o que o CSS declara: o creme dominante do plugin é `#e7e0d1` e o do site é `#e8e0cf` (um ponto de diferença em cada canal); a superfície de painel do plugin é `#f1eadb` contra `#f2ead9` do site; o grafite `#2b2925` e a tinta `#14120f` são **idênticos**. Os cromáticos divergem de propósito: o laranja do plugin é `#d97c3f` e o do site `#e8762c`; o vermelho `#c83d31` virou `#d92b26`; o amarelo `#e2c656` virou `#e8c53a`. O aparelho é mais lavado porque é pequeno na tela do DAW; a página empurrou a saturação sem trocar o matiz.

### Primary
- **Laranja de Painel** (`{colors.orange}`): a cor de comando. Botões primários, títulos flutuantes dos painéis (`.ptitle`), knobs de painel e de FX, metade acesa do accent, notas do piano roll, seleção de texto do navegador, botão de download do Mac. É a cor que o plugin usa para dizer "isto é controle global".

### Secondary
- **Amarelo de Serigrafia** (`{colors.yellow}`): o segundo comando. Botão RAND, botão de download do Windows, SOLO ligado, os `+/−` de BPM, o link `baixar .mid`, o campo de cor inteiro da seção de instalação e a faixa alta do medidor.
- **Vermelho de Alerta** (`{colors.red}`): estado quente e primeiro quarto do compasso. MUTE ligado, botão Play em execução, LED de tocando, texto de falha, topo do medidor, primeiro bloco de feature.

### Neutral
- **Creme de Painel** (`{colors.bg}`): o fundo da página e o fundo do próprio aparelho. É o mesmo creme do plugin.
- **Creme de Superfície** (`{colors.card}`): um degrau mais claro que o fundo. Toda superfície que se destaca do painel: a unidade, os painéis da coluna direita, os cards de instalação, o step apagado, o texto claro sobre grafite.
- **Tinta** (`{colors.ink}`): preto esverdeado. Texto, **todas** as bordas e **todas** as sombras. Nunca é usado como fundo grande.
- **Grafite** (`{colors.graphite}`): o preto de controle de canal. Corpo dos knobs de canal, botão de nome do instrumento, plaqueta de marca, tag de lane, fundo do piano roll, `<code>`, polegar da barra de rolagem.
- **Rack** (`{colors.rack}`) e **Linha de Rack** (`{colors.rack-line}`): estes dois **não** vêm do plugin. São invenção do site: o escuro em que a máquina é parafusada e a linha divisória dentro dele. Também é o `theme-color` do documento.
- **Tinta Apagada** (`{colors.ink-muted}`): texto de apoio e estado desabilitado sobre creme — legenda de knob, escala do medidor, régua de compassos, `só no plugin`, botão desativado, link `.mid` inerte. Mede **5,89:1** sobre a superfície e 5,37:1 sobre o fundo.
- **Cinza de Rack** (`{colors.rack-muted}`): texto secundário sobre o campo escuro (metadado de seção no rack, rodapé). Mede 4,88:1 sobre o rack.
- **Branco de Contraste** (`{colors.contrast-white}`): branco puro, e não o creme, no texto dos blocos `.f1` (vermelho) e `.f4` (grafite). Não é deslize: sobre o vermelho, o creme de superfície entrega 4,06:1 e reprova; o branco entrega 4,86:1 e passa. Sobre o grafite os dois passam com folga (14,52:1 contra 12,13:1), e o branco fica por coerência do par.

### Named Rules

**A Regra do Painel.** Laranja marca controle de painel/FX; grafite marca controle de canal. Os cinco knobs por instrumento (DECAY, TONE, VOL, PAN, NOISE) são grafite; REV, DEL, MASTER, GROOVE AMOUNT, FILL RATE e FILL VOLUME são laranja. Sem essa regra os dois viram a mesma coisa — é o comentário que está no CSS e no `dd-main.js`, e é como o plugin se lê.

**A Regra dos Quatro Grupos.** Os 16 steps são quatro quartos de cor: vermelho, laranja, amarelo, creme (`.g1`–`.g4`). Essa sequência não fica presa ao sequencer: os quatro blocos da seção "O que tem dentro" repetem a mesma ordem (`.f1`–`.f4`). A única substituição é o quarto bloco, que troca creme por grafite — creme sobre creme desapareceria fora da grade. O agrupamento também nunca vive só na cor: entre cada bloco de quatro há uma coluna de vão de 12px no template da grade, e uma régua numerada de 1 a 16 por cima, com o tempo forte em tinta cheia.

**A Regra da Sombra Preta no Rack.** Dentro do campo escuro, a sombra dura deixa de ser `{colors.ink}` e passa a `#000` (`.btn.on-rack`, `.chip.on-rack`). Tinta sobre rack não aparece; preto puro sim.

**A Regra do Contorno Único.** Toda borda da página é preta e sólida. Não existe borda colorida, borda clara, nem divisória de opacidade — a única exceção é o `border-top` do rodapé, que usa `{colors.rack-line}` porque preto sobre rack seria invisível.

**A Regra do Piso de Contraste.** Nenhuma cor entra por gosto: ela passa por um piso medido. Texto claro sobre cor chapada usa creme de superfície por padrão e **branco puro quando o creme não alcança 4,5:1** — é o que decide entre `{colors.card}` e `{colors.contrast-white}`, e é por isso que os dois convivem. Os cinzas de apoio seguem a mesma lógica, cada um calibrado para o seu fundo: `#6b6355` (4,52:1) sobre creme de painel, `#a99f8d` (6,71:1) e `#cbc2b2` (9,94:1) sobre rack. **Elemento não textual tem piso próprio, de 3:1**, e ele vale igual: o LED do tally apagado é `#7a6b58` a 3,93:1 sobre o fundo, e aceso é `{colors.red}` a 3,70:1 — os dois estados passam.

**A Regra do Sinal Duplo.** Neste sistema, estado nunca é comunicado só por cor. Toda mudança de estado carrega um segundo sinal, de outra natureza: o step ligado enche o LED de tinta (forma, não cor); MUTE e SOLO carregam `aria-pressed`; o accent expõe o valor como altura de preenchimento e como `aria-valuenow`; o quarto de compasso tem a coluna de vão e a régua numerada além da cor do grupo; o playhead tem anel e deslocamento; o botão desativado afunda e perde a sombra; o LED do tally é acompanhado de um rótulo que **alterna entre "Parado" e "Tocando"**. Cor é sempre o reforço, nunca o portador único da informação.

## Typography

**Display Font:** Archivo Black (fallback Archivo, sans-serif)
**Body Font:** Archivo, pesos 500/600/700 (fallback `system-ui`, `-apple-system`)
**Label/Mono Font:** Martian Mono, pesos 400/600/700 (fallback `SFMono-Regular`, `ui-monospace`)
**Serif de Plaqueta:** Georgia, itálico (fallback Times New Roman)

**Character:** Archivo Black faz o barulho — grotesco pesado, tracking apertado, caixa alta, exatamente o silk-screen do painel. Martian Mono faz a legenda: é uma mono larga e técnica, usada em corpo pequeno para tudo que é aferição (BPM, dB, contagem de sample, nome de arquivo, status). Georgia itálico aparece em um lugar só e sempre no mesmo lugar: a designação "Rhythm Composer — DD 001", que no plugin também é serifada e itálica.

**Substituição registrada.** O CSS anterior pedia `'IBM Plex Mono'` em cinco lugares e **nunca carregava a fonte** — o único `<link>` de fontes trazia Archivo e Archivo Black. Na prática o site caía no `monospace` do sistema. A build atual carrega Martian Mono de verdade e a usa em todos esses lugares. Não reintroduzir IBM Plex Mono.

### Hierarchy
- **Display** (Archivo Black 400, `clamp(3.2rem, 11vw, 8.5rem)`, lh 1.02, ls -0.035em): só o `h1` "DRUM DEALER". Um por página.
- **Headline** (Archivo Black 400, `clamp(1.9rem, 4.4vw, 3.1rem)`, lh 1.02): títulos de seção, limitados a `18ch` no cabeçalho de seção e `16ch` no fecho.
- **Title** (Archivo Black 400, `clamp(1.15rem, 2vw, 1.45rem)`, caixa alta): títulos dos blocos de feature e dos cards de sistema operacional.
- **Plate** (Georgia itálico, `clamp(1.05rem, 1.6vw, 1.28rem)`): a designação de hardware. Aparece em três lugares e sempre com o mesmo texto.
- **Lead** (Archivo 500, mesmo tamanho do plate, lh 1.45): o parágrafo de abertura, limitado a `46ch`.
- **Body** (Archivo 500, 1rem, lh 1.55): texto corrido. Larguras máximas observadas: `64ch` na nota de download, `70ch` na nota da máquina, `72ch` na compatibilidade, `74ch` nos samples.
- **Label** (Archivo Black 400, 0.56rem a 0.9rem, ls 0.02–0.1em, caixa alta): tudo que é botão, MUTE/SOLO, nome de instrumento, título de painel, tag de lane.
- **Mono** (Martian Mono 400, 0.78rem, ls -0.04em): metadados de seção, notas técnicas, `<code>`.
- **Legend** (Martian Mono 600, 0.53–0.68rem, ls -0.03 a -0.06em, caixa alta): legendas de knob, régua de steps, escala do medidor, "só no plugin", tally, rodapé.

Os pesos 400 nos títulos não são erro: 'Archivo Black' só tem um peso, e ele já é o preto.

**A rampa tem dois andares, e isso é do sistema, não descuido.** As variáveis `--t-*` governam a prosa: mega, h2, h3, lead, body, small. Abaixo de `{typography.body}` a página não usa a rampa — as peças da máquina são dimensionadas por peça, em literais entre 0,53rem e 0,9rem (0.53, 0.55, 0.56, 0.58, 0.6, 0.62, 0.66, 0.68, 0.7, 0.72, 0.75, 0.76, 0.78, 0.8, 0.82, 0.9). Um detector de rampa vai apontar cada um deles como fora da escala; eles não são. São serigrafia de painel, onde a legenda do knob e o título do painel precisam caber em 35px e 52px de peça, e uma escala de prosa não resolve isso. O que **é** inconsistência: `--t-legend` existe declarada em 0,68rem e nunca é referenciada, enquanto `.lab` escreve `.68rem` literal.

### Named Rules

**A Regra do Mono Apertado.** Martian Mono nunca é usada com tracking neutro. Todas as ocorrências carregam tracking negativo, de `-0.03em` a `-0.06em`, apertando mais quanto menor o corpo. É uma mono larga; sem isso ela ocupa o dobro do espaço e deixa de parecer serigrafia.

**A Regra da Plaqueta.** O nome do produto é sempre Archivo Black; a designação "Rhythm Composer — DD 001" é sempre Georgia itálico. As duas nunca trocam de face, nem no cabeçalho, nem na plaqueta lateral da unidade, nem no bloco de marca do topo da máquina.

**A Regra da Legenda Técnica.** Número, unidade, formato de arquivo e status são sempre mono. Nunca em Archivo. É o que separa "o que a máquina informa" de "o que a página afirma".

## Layout

Dois contêineres, não um: `.wrap` a `1080px` para texto e `.wrap-wide` a `1480px` para a máquina — a unidade precisa da largura extra ou o sequencer nasce cortado. O padding lateral é fluido (`clamp(16px, 4vw, 28px)` no estreito, `clamp(16px, 3vw, 28px)` no largo).

O ritmo de espaçamento é um só, em variáveis, e a página inteira usa esses degraus: `0.5rem`, `0.875rem`, `1.25rem`, `2rem`, `3.25rem`, `5rem`. Na prática o peso está no meio da escala — `{spacing.s3}` e `{spacing.s2}` respondem por quase todo o espaçamento interno; `{spacing.s6}` é o respiro entre seções e `{spacing.s5}` o respiro dentro dos campos de cor.

**Pacing por campo de cor.** A página não é uma sequência de seções iguais: ela alterna fundos em largura total. Creme (cabeçalho) → rack escuro com borda em cima e embaixo (a máquina) → creme (download, compatibilidade, features) → amarelo de ponta a ponta (instalação) → creme (samples) → rack escuro (fecho + rodapé). O rack abre e fecha; o amarelo marca o único trecho que é instrução passo a passo.

**A grade da unidade.** `minmax(0,1fr) 288px` — a máquina à esquerda, a coluna de painéis à direita, exatamente como o plugin. O sequencer é uma grade de **28 colunas**: `54px` de MUTE/SOLO, cinco knobs de `42px`, `68px` de nome do instrumento, quatro blocos de quatro steps `minmax(24px,1fr)` separados por **três colunas de vão de 12px**, e dois knobs de FX de `46px`. `gap: 5px`, `min-width: 1000px`.

**O vão de compasso é coluna, não margem.** Esta é a decisão estrutural da grade, e ela é o oposto do que parece mais simples. O agrupamento de quatro em quatro não vem de `margin-left` na primeira tecla de cada bloco: vem de uma coluna de 12px declarada no próprio `grid-template-columns` (14px abaixo de 760px). O motivo é que **as duas grades irmãs precisam concordar por construção**. Com a margem no item, `#seq` e `#seq-ruler` calculavam larguras diferentes a partir do `min-content` — a margem entrava na conta de uma e não da outra —, o que amassava justamente as teclas de início de tempo e desalinhava a régua. Com a coluna, as duas resolvem o mesmo template e o desvio é zero. O resultado medido: **5px entre teclas dentro do bloco, 22px entre blocos** (5 de gap + 12 de vão + 5 de gap), régua e linha de accent com desvio zero.

**A colocação é explícita nas duas grades.** Com colunas de vão no meio, deixar o fluxo automático decidir faria a régua e a grade divergirem. Então cada célula recebe `grid-column` nomeado: `#seq >` por `:nth-child(25n+k)` para as 150 células dos seis instrumentos, `#seq-ruler >` por posição para os 17 numerais, e posições absolutas (152 a 167) para a linha de accent. É verboso de propósito; a alternativa é uma grade que se desmonta sozinha.

**A régua é grade irmã, não enfeite.** `.seq-ruler` é um segundo elemento `.seq` dentro do mesmo `.seq-scroll`, com o mesmo `grid-template-columns`. A primeira célula é um vão `1/8` que cobre MUTE/SOLO, os cinco knobs e o nome do instrumento. O tempo forte se marca ali, e só ali: `.seq-ruler .grp` pinta o numeral em tinta cheia e peso 700. Não há mais nenhuma marcação de grupo na tecla — o vão de coluna já faz esse trabalho.

**Linhas separadoras entre instrumentos.** Cinco `div.sep`, `grid-column: 1/-1`, `align-self: end`, 1px em `rgba(20,18,15,.16)` com `margin-bottom: -3px`, uma ao pé de cada linha de instrumento menos a última. Vêm do painel, onde os seis canais são separados por filete. São `aria-hidden` e `pointer-events: none`. A linha de grade vai na classe dupla (`#seq > .sep.r3`) porque a regra genérica de posição (`:nth-child(n+151)`) jogaria todas para a linha do accent; a especificidade maior é o que segura cada filete no seu canal.

**A coluna esquerda não deixa creme morto.** `.unit-main` é uma coluna flex e as faixas de piano roll absorvem a sobra de altura: `.gen-lanes{flex:1;min-height:0}`, `.gen-lane{flex:1;min-height:74px}` e `.roll{height:100%}`. Quando a coluna de painéis à direita fica mais alta que o sequencer, a diferença vira faixa de bass e lead, não vazio. O piso de 74px garante que a faixa continue legível quando não há sobra.

**Grade das features.** Seis colunas com blocos de 4+2 / 2+4 — dois pares assimétricos que se espelham, em vez de quatro caixas iguais.

### Named Rules

**A Regra do Aparelho Inteiro.** A máquina rola horizontalmente; ela nunca perde controle para caber. Em telas pequenas o `min-width` cai de `1000px` para `880px`, mas os 96 steps, os 42 knobs, os cinco filetes e a linha de accent continuam todos lá.

**A Regra dos Dois Contêineres.** Texto a 1080px, máquina a 1480px. Não alargar o texto para acompanhar a máquina.

### Responsivo

Dois pontos de quebra, ambos `max-width`.

**≤1080px.** A coluna de painéis desce para baixo da máquina: `.unit-side` perde a borda esquerda, ganha borda superior e vira uma grade `auto-fit` de `minmax(232px,1fr)`. A plaqueta de marca passa a ocupar a linha inteira e alinha à esquerda.

**≤760px.** A grade do sequencer é **reordenada**, não só encolhida, e a reordenação é estrutural — três detalhes que a fazem funcionar e que quebram se forem mexidos:

1. **O template vira `58px` + quatro blocos de `repeat(4,24px)` separados por vãos de `14px` + `46px` + `repeat(5,40px)` + dois de `40px`.** O nome do instrumento e os 16 steps vêm primeiro; o banco de knobs vai para depois. As colunas de step são **fixas em 24px**, não `minmax`: as duas grades irmãs precisam calcular a mesma largura, e uma coluna flexível resolveria diferente em cada uma, desalinhando a régua dos steps. O vão sobe de 12px para 14px porque, com tecla de 24px, 12px já não lia como separação.
2. **O seletor é `#seq >`, nunca `.seq >`.** A régua também carrega a classe `.seq` e entraria na conta do `25n`, deslocando todos os numerais. A trava `:nth-child(-n+150)` limita a reordenação às 150 células dos seis instrumentos, deixando a linha de accent (a partir da 151ª) fora.
3. **A linha vai declarada junto da coluna.** Cada bloco de 25 filhos recebe `grid-row` explícito (1 a 6, e 7 para o accent). Sem isso, a auto-colocação abre uma linha nova toda vez que o cursor de coluna anda para trás — e cada instrumento passa a ocupar duas linhas de grade.

O motivo da reordenação está escrito no CSS: no celular a grade abria num banco de knobs e os 16 steps — a única coisa que diz "drum machine" — ficavam atrás de rolagem sem afordância nenhuma. Junto disso: features viram coluna única, downloads viram coluna única, os espaçamentos de seção caem de `{spacing.s6}` para `{spacing.s5}`, e o bloco de marca do topo da unidade some.

**`prefers-reduced-motion: reduce`.** Todas as transições e animações são desligadas globalmente. O playhead perde o `translateY(-2px)` e a sombra de apoio, mas **mantém o anel interno de 3px** — o step tocando continua identificável. A lâmpada tally perde o `scale(1.6)` e fica só na troca de cor. O estado nunca depende só de movimento.

## Elevation & Depth

Não há profundidade fingida. Nenhuma sombra desfocada, nenhum brilho, nenhum bisel, nenhuma textura de material. A profundidade é uma coisa só: um retângulo preto sólido deslocado para baixo e para a direita, do mesmo tamanho da peça. Fora isso, o que separa planos é borda preta e troca de campo de cor. O alpha aparece em exatamente três lugares, todos nomeáveis: a sombra de apoio do playhead (que ainda assim tem blur zero, e existe porque é a única peça que se move), o filete de 1px entre instrumentos, e a scanline do rack. Fora esses três, cor é chapada.

A sombra dura também vem do plugin: `MaschinLookAndFeel.h` tem uma função `hardShadow` que desenha exatamente isso — retângulo deslocado, sem blur — e a chama **com o mesmo raio da peça** (`hardShadow(g, face, shift, shift, kRadius)`). Sombra e canto andam juntos; não existe sombra dura de canto reto sob uma peça arredondada.

### Shadow Vocabulary
- **Sombra de peça** (`box-shadow: 5px 5px 0 {colors.ink}`): cards, botões de download, painéis grandes, blocos de feature, cards de instalação.
- **Sombra pequena** (`box-shadow: 3px 3px 0 {colors.ink}`): peças internas — botões da máquina, painéis da coluna direita, caixa de BPM, chips de DAW, caixa de aviso.
- **Sombra de aparelho** (`box-shadow: 8px 8px 0 {colors.ink}`): usada uma vez só, na unidade inteira. É o que faz a máquina flutuar acima do rack.
- **Sombra sobre rack** (`box-shadow: 5px 5px 0 #000` / `7px 7px 0 #000` no hover): a mesma sombra, em preto puro, quando a peça está no campo escuro.
- **Apoio do playhead** (`box-shadow: inset 0 0 0 3px {colors.ink}, 0 3px 0 rgba(20,18,15,.35)`): a **única** sombra com alpha da página inteira, e a única que não é dura. Existe para sustentar os 2px que o step sobe enquanto toca. Não estender esse tratamento a outras peças.

### Named Rules

**A Regra do Curso da Tecla.** A sombra é a distância de curso do botão, não uma sombra de luz. Em repouso o botão está a 3px (ou 5px) do painel. No hover ele sobe: `translate(-1px,-1px)` e a sombra cresce para 4px (nos downloads, `translate(-2px,-2px)` e 7px). No clique ele afunda até encostar: `translate(3px,3px)` e `box-shadow: 0`. O botão desativado já nasce afundado — deslocado 3px, sem sombra nenhuma, em `{colors.bg}` com texto `{colors.ink-muted}`. Some a sombra, some o botão.

**A Regra do Único Movimento.** A página tem um momento de movimento, e ele é a batida. Quando a máquina toca, três coisas acontecem juntas e nenhuma outra: a coluna do playhead **acende** (anel interno de 3px em tinta, `translateY(-2px)` e uma sombra de apoio `0 3px 0 rgba(20,18,15,.35)`, em 70ms `ease-out`), o numeral correspondente da régua vira tinta cheia em peso 700 (70ms), e a lâmpada tally pulsa `scale(1.6)` no tempo forte — uma vez a cada quatro semicolcheias, por 100ms, em `cubic-bezier(.2,.9,.3,1)`. O playhead **acende, não escurece**: a versão anterior usava `filter: brightness(.5)`, que apagava a cor do grupo justamente na coluna que o olho precisa achar. Aqui o site **diverge do plugin de propósito** — o `MaschinLookAndFeel.h` escurece a própria cor (`fill.darker(0.35f)`) e anota que moldura "embolava". Na tela do DAW, escura e pequena, escurecer resolve; na página, sobre creme e com a tecla maior, o anel lê melhor. É a única divergência deliberada de tratamento entre painel e página. Fora desse momento e do curso de 60ms dos botões, a única animação da página é o empurrão de 120ms ao trocar um sample. Não espalhar movimento: ele vale porque é um só.

**A Regra do Corte Duro.** Gradiente existe na página, mas nunca como transição. São todos cortes secos: a faixa de identidade é `linear-gradient(90deg)` em quatro quartos exatos (vermelho, laranja, amarelo, grafite); o accent é um corte a 55% entre grafite e o fundo (ou laranja, quando ligado); o medidor é uma pilha de três faixas duras (amarelo até 62%, laranja até 86%, vermelho no topo). A única exceção é a textura de scanline do rack — `repeating-linear-gradient` de 1px branco a 3,5% de opacidade a cada 4px — e ela é ruído de superfície, não sombreamento.

## Shapes

O canto é arredondado, e o raio não foi escolhido aqui: veio do `MaschinLookAndFeel.h` do plugin. É lá que estão `kBorder = 2.5f` e `kRadius = 6.0f`, e é de lá que a escada inteira desce. Cada degrau tem uma contraparte verificável no desenho do aparelho:

| Degrau | Onde | Origem no plugin |
|---|---|---|
| `{rounded.pointer}` | ponteiro do knob | `fillRoundedRectangle(fill.reduced(2), 2.0f)` no medidor |
| `{rounded.inline}` | `code` | `fillRoundedRectangle(bounds, 3.0f)` no `drawLinearSlider` |
| `{rounded.key}` | step, accent, MUTE/SOLO, faixa de identidade, medidor | `fillRoundedRectangle(face, 4.0f)` no botão de step |
| `{rounded.field}` | select, etiqueta de painel, chip de DAW, link `.mid` | `fillRoundedRectangle(face, 5.0f)` no `drawComboBox` |
| `{rounded.control}` | botões, `.chip`, `.card`, nome do instrumento, plaqueta, tag de lane, `.roll`, caixa de BPM, aviso | `kRadius = 6.0f` no `drawButtonBackground` |
| `{rounded.surface}` | unidade, painel, bloco de feature, card de SO, bloco de samples | sem contraparte: é o degrau de superfície de página |
| `{rounded.full}` | corpo do knob, LED do step, LED do tally | `drawEllipse` |

Só duas coisas mantêm raio zero, e as duas de propósito: o polegar da barra de rolagem, que declara `border-radius: 0` explicitamente para desfazer o padrão do navegador, e os campos de cor de largura total, que não têm canto porque não têm borda lateral.

**Altura explícita, nunca `aspect-ratio`.** O step tem `height: 46px` e `min-width: 0`; o accent, os mesmos 46px. A razão está escrita no CSS e é um defeito já pago: com razão de aspecto, a largura era resolvida a partir da altura, a tecla transbordava a trilha e engolia o gap — teclas de início de tempo largas, as seguintes amassadas e o LED cortado pela borda. O `min-width: 0` é o que deixa a tecla caber na coluna que ela ocupa em vez de forçar a coluna a caber nela.

Duas espessuras de borda, e a divisão é a mesma do plugin: `2.5px` (o `kBorder`) para o que é superfície de página e para os botões, `2px` para o que é peça dentro da máquina (steps, knobs, painéis, MUTE/SOLO, medidores, divisórias internas) — que é também a espessura que o plugin usa no traço do step e do combo.

### Named Rules

**A Regra do Raio Herdado.** O raio de uma peça nova se decide olhando a peça equivalente no `MaschinLookAndFeel.h`, não pelo que parece bonito: tecla é 4, campo é 5, controle é 6, superfície de página é 8. Não inventar um degrau intermediário, e não voltar a zerar o canto — o aparelho nunca teve canto reto, o site é que estava errado.

## Components

### Buttons
- **Shape:** raio `{rounded.control}` (o `kRadius` do plugin), borda de 2,5px em tinta (o `kBorder`), sombra dura de 3px.
- **Primary (`.dd-btn`):** laranja sobre tinta, Archivo Black caixa alta 0.9rem com tracking 0.04em, padding `11px 20px`.
- **Hover / Active:** `transition: transform .06s, box-shadow .06s`. Ver **A Regra do Curso da Tecla**.
- **Playing:** o botão Play troca para vermelho com texto creme enquanto a máquina toca.
- **Ghost (`.dd-btn.ghost`):** fundo creme de superfície. Usado nos dois controles que só existem no plugin (SAMPLER e EXPORT), sempre desativados e sempre acompanhados da legenda "só no plugin" em mono 0.58rem.
- **Yellow (`.dd-btn.yellow`):** amarelo. Reservado ao RAND.
- **Download (`.btn`):** bloco inteiro, `clamp(1.05rem, 2vw, 1.4rem)`, borda de 2,5px, sombra de 5px, padding `{spacing.s3} {spacing.s2}`, com ícone SVG inline de 1em e uma linha `<small>` em mono 0.66rem embaixo. Mac é laranja, Windows é amarelo. No fecho escuro os dois ganham `.on-rack` e a sombra vira preto puro.

### Chips
- **Style:** os chips de DAW da seção de compatibilidade são `li` com creme de superfície, borda de 2px, padding `7px 14px`, peso 700 e sombra de 3px.
- **Nota de inconsistência:** existe também uma classe `.chip` completa na folha, com quatro variantes de cor (`.c1`–`.c4`) e uma variante `.on-rack`, **que não é usada em nenhum lugar** do HTML nem do JS. É CSS morto de uma versão anterior, não um componente do sistema. O mesmo vale para `.card`, e para `.cheia`, que `dd-main.js` ainda aplica à faixa de lead mas que **não tem mais nenhuma regra CSS**: a altura das faixas agora vem do `flex:1` e a classe não faz nada.

### Cards / Containers
- **Corner Style:** reto.
- **Background:** creme de superfície (`{colors.card}`) sobre o creme de painel (`{colors.bg}`); grafite ou vermelho quando o card é um bloco de feature.
- **Shadow Strategy:** sombra de peça (5px). Ver Elevation & Depth.
- **Border:** 2,5px em tinta.
- **Internal Padding:** `{spacing.s3}` no padrão, `{spacing.s4}` no bloco de samples.
- **Feature blocks:** herdam as quatro cores dos grupos do sequencer, com `min-height: 230px` e uma legenda mono empurrada para o rodapé do bloco por `margin-top: auto`.

### Inputs / Fields
- **Selects (`.panel select`):** Archivo 700 a 0.8rem, borda de 2px, fundo em creme de painel (um degrau mais escuro que o painel, para o campo afundar), padding `6px 7px`, largura total, sem raio e sem seta customizada.
- **Focus:** contorno de 3px em tinta com `outline-offset: 3px`, aplicado a `button, a, select, input, summary`. Dentro do campo escuro do rack o mesmo contorno troca para amarelo, senão desapareceria.
- **BPM box:** três peças coladas numa moldura só — `−` e `+` em amarelo separados por bordas internas de 2px, e o valor em Martian Mono 700 com tracking `-0.05em` e `min-width: 104px` para o número não empurrar a caixa ao mudar de 99 para 100.

### Navigation
Não existe. A página não tem barra de navegação, menu, nem âncoras internas — a rolagem é a navegação, e a única ação repetida é o par de botões de download, que aparece duas vezes: acima da dobra de conteúdo e no fecho.

### Sequencer (componente-assinatura)
A peça que define o sistema. Uma linha por instrumento, seis linhas, na mesma ordem de colunas em que `dd-main.js` monta os elementos: pilha MUTE/SOLO → cinco knobs de canal → nome do instrumento → 16 steps → REV → DEL. Abaixo, a linha de ACCENT, cujo rótulo ocupa as sete primeiras colunas.

- **Step:** tecla de `46px` de altura, raio `{rounded.key}`, borda de 2px, `min-width: 0`, colorida pelo quarto de compasso a que pertence, com o LED redondo no topo. Ligado, o LED enche de tinta. Tocando (`.ph`), a tecla **acende e sobe**: anel interno de 3px em tinta, `translateY(-2px)` e sombra de apoio, em 70ms. Ver **A Regra do Único Movimento**.
- **Accent:** **não é mais liga/desliga — é volume por step**, como no painel. Cada accent é um `role="slider"` de 0 a 1 com neutro em 0.5, operado por arraste vertical (`pointermove`, 90px de curso para o intervalo inteiro), duplo clique para voltar a 0.5, e setas / Home / End no teclado (passo de 0.1, ou 0.02 com Shift). O valor é pintado como preenchimento: `linear-gradient(0deg, laranja 0 calc(var(--v)*100%), grafite …)` — a coluna enche de baixo para cima, e a altura da faixa laranja *é* o valor. Mesma altura e mesmo raio da tecla (`46px`, `{rounded.key}`).
- **Rótulo ACCENT:** texto solto, sem moldura e sem fundo. `.acc-lab` carrega `.lab` para herdar a tipografia, mas anula `background`, `border` e cor, alinha à direita com `padding-right` e abre o tracking para `.08em`. É legenda de painel, não botão — e, ao contrário dos nomes de instrumento, não é clicável (`cursor: default`).
- **Separador (`.sep`):** filete de 1px em `rgba(20,18,15,.16)` ao pé de cada linha de instrumento, atravessando a grade inteira. Cinco deles, um por par de canais adjacentes. Ver Layout.
- **Knob:** disco de `36px` com borda de 2px e um ponteiro de 3px×12px, raio `{rounded.pointer}` na ponta. O ponteiro gira de −135° a +135° via `--rot`, com `transform-origin` no centro do disco. Os knobs de canal são grafite; os de painel são laranja de 52px, com ponteiro em tinta e proporcionalmente maior (17px). O knob é `role="slider"` com `tabindex`, setas, Home/End e reset por duplo clique — ele é operável sem mouse, e por isso precisa do anel de foco.
- **Nome do instrumento (`.lab`):** botão grafite com texto creme, Archivo Black 0.68rem. Clicar troca o sample; a resposta visual é um empurrão de `translate(2px,2px)` por 120ms, via `Element.animate()` — a mesma física de tecla dos botões, aplicada a um rótulo que também é controle.
- **MUTE / SOLO (`.ms`):** dois botões de 0.6rem empilhados numa coluna de 54px, raio `{rounded.key}`, creme quando desligados, vermelho (mute) e amarelo (solo) quando ligados, com `aria-pressed`.
- **Régua:** grade irmã da `.seq`, com o mesmo template de colunas, dentro do mesmo scroller. Os 16 números em Martian Mono 0.56rem peso 600, tracking `-0.06em`, em tinta apagada e alinhados pela base. O numeral da coluna que está tocando recebe `.ph` e vira tinta cheia em peso 700 — a régua diz *onde* estamos, os steps dizem *o quê*. O agrupamento de 4 em 4 é o mesmo `.grp` de 9px que a grade usa.
- **Tally:** LED de 11px com borda de 2px no rodapé da unidade, ao lado de um rótulo em mono 0.58rem. Apagado é `#7a6b58` (3,93:1 sobre o fundo); tocando (`.live`) vira `{colors.red}` (3,70:1); no tempo forte (`.beat`) pulsa `scale(1.6)` por 100ms. O rótulo não é fixo: `#tally-label` alterna entre **"Parado"** e **"Tocando"**, escrito pelo mesmo trecho que liga a classe `.live`. Cor e palavra dizem a mesma coisa — ver **A Regra do Sinal Duplo**.

### Piano Roll Lanes
Duas faixas — bass e lead — no pé da coluna esquerda, cada uma com uma tag grafite de 58px e um `<canvas>` de fundo grafite com borda de 2px. Elas são elásticas: `flex:1` com piso de 74px, absorvendo a sobra de altura da coluna em vez de deixar creme morto embaixo do sequencer. O desenho usa quatro cores fixas no JS — fundo `#2b2925`, grade `#3f3a33`, rótulo `#8d8271`, nota `{colors.orange}`. As notas em laranja seguem **A Regra do Painel**: é saída de painel, não de canal.

### Ícones
Seis SVG inline, dois desenhos (maçã e janela) usados três vezes cada: nos dois botões de download do topo, nos dois títulos dos cards de instalação e nos dois botões do fecho. A classe `.ico` os fixa em `1em × 1em`, `fill: currentColor`, `vertical-align: -.09em` e `margin-right: .45em`, com `flex: none` para não encolherem dentro de um flex container. Ficam `aria-hidden`, porque o rótulo ao lado já diz "Baixar para Mac".

Eles substituíram glifos de fonte que caíam na área privativa do Unicode e saíam como tofu (o retângulo vazio) no Windows e no Android — exatamente os dois sistemas que os ícones identificam. **Ícone aqui é caminho SVG inline em `currentColor`, nunca glifo de fonte e nunca `<img>`.**

### Panels (componente-assinatura)
Os painéis da coluna direita reproduzem a moldura do plugin: caixa de creme de superfície com borda de 2px e sombra de 3px, e o título encaixado **por cima da borda superior** — `position: absolute; top: -11px; left: 10px`, em laranja com borda própria e Archivo Black 0.62rem. É a etiqueta serigrafada mordendo a moldura, exatamente como GROOVE, FILL e MIDI GEN no painel do VST.

### Meters
Duas colunas de 118px de altura com borda de 2px sobre creme de painel, preenchendo de baixo para cima com a pilha dura amarelo/laranja/vermelho, e a escala em mono 0.55rem ao lado (+6, 0, −12, −24, −48).

### Superfícies do navegador
Tratadas como parte do design, não como padrão herdado. Seleção de texto em laranja com texto em tinta. Barra de rolagem de 12px com trilho no creme de painel e polegar grafite com borda de 2px na cor do trilho, raio zero — dentro do rack, o trilho vira linha de rack e o polegar vira laranja. Anel de foco de 3px em tinta, ou amarelo dentro do rack. `theme-color` do documento no escuro do rack. Favicon SVG inline: quadrado laranja com borda em tinta e círculo creme no centro — o knob, reduzido a ícone.

## Do's and Don'ts

### Do:
- **Do** tratar `drum-dealer-ui.png` e `MaschinLookAndFeel.h` como a autoridade visual. Antes de escolher cor, raio ou forma para um controle novo, olhe como o plugin resolve o mesmo controle — a imagem mostra, o header dá o número.
- **Do** seguir **A Regra do Painel**: laranja para controle de painel/FX, grafite para controle de canal.
- **Do** repetir a sequência vermelho → laranja → amarelo → creme quando um conjunto de quatro itens precisar de cor, trocando creme por grafite se o item ficar sobre fundo creme.
- **Do** usar sombra dura deslocada (3px interno, 5px de peça, 8px só para a unidade) e trocar para `#000` sobre o campo do rack.
- **Do** tirar o raio de uma peça nova da peça equivalente no `MaschinLookAndFeel.h`: tecla 4px, campo 5px, controle 6px, superfície de página 8px, círculo só em knob e LED.
- **Do** abrir agrupamento com coluna de vão no template da grade, nunca com margem no item — é o que mantém `#seq` e `#seq-ruler` concordando.
- **Do** dar altura explícita a tecla e accent (`46px`) com `min-width: 0`, nunca `aspect-ratio`.
- **Do** escrever número, unidade, formato e status em Martian Mono, sempre com tracking negativo.
- **Do** garantir que todo estado tenha um sinal além da cor: LED preenchido no step, `aria-pressed` no MUTE/SOLO, coluna de vão a cada quatro steps, régua numerada com o tempo forte em tinta cheia, rótulo que alterna entre "Parado" e "Tocando".
- **Do** medir também o que não é texto: LED, indicador e afim têm piso de 3:1 contra o fundo em que sentam.
- **Do** dar anel de foco visível a tudo que é operável, inclusive aos knobs, e trocá-lo para amarelo dentro do rack.
- **Do** deixar a máquina rolar por inteiro em vez de esconder controles em tela pequena.
- **Do** manter o movimento concentrado na batida: playhead que acende, numeral da régua e pulso do tally, e nada mais.
- **Do** medir antes de escolher entre creme e branco em texto sobre cor chapada; o piso é 4,5:1.
- **Do** desenhar ícone como caminho SVG inline em `currentColor`, dimensionado em `1em`.
- **Do** manter a régua e a grade com o mesmo `grid-template-columns` e travar as colunas de step em 24px no celular, senão as duas desalinham.

### Don't:
- **Don't** reconstruir a direção "Sala Técnica" (rack preto anodizado, gaffer, Dymo, paleta `0E0F0F / B7BCBD / FF5A1F / C2211A / EDEAE3`). Foi rejeitada pelo Diogo; ver `.impeccable/mocks/DESCARTADO.md`.
- **Don't** introduzir sombra desfocada, alpha em sombra, bisel, brilho, textura de material ou qualquer fisicalidade fingida. A única textura do site é a scanline de 3,5% no rack.
- **Don't** usar gradiente como transição. Gradiente aqui é corte duro entre cores chapadas.
- **Don't** zerar o canto de um retângulo. O aparelho nunca teve canto reto; a versão do site que tinha estava errada, e voltar a ela desalinha o site do plugin de novo.
- **Don't** inventar degrau de raio fora da escada (2 / 3 / 4 / 5 / 6 / 8 / 50%).
- **Don't** usar `aspect-ratio` em tecla ou accent: a largura passa a ser resolvida a partir da altura, a peça transborda a trilha, engole o gap e corta o LED na borda.
- **Don't** criar borda colorida, borda clara ou divisória por opacidade. Borda é preta e sólida; `{colors.rack-line}` só existe onde preto seria invisível.
- **Don't** reintroduzir `'IBM Plex Mono'`: ela era pedida no CSS antigo e nunca era carregada. A mono do sistema é Martian Mono.
- **Don't** usar Archivo em legenda técnica nem Martian Mono em texto corrido.
- **Don't** deixar cor sozinha carregando um estado. Se um indicador mudar de cor, alguma outra coisa muda junto — forma, posição, atributo ARIA ou palavra.
- **Don't** espalhar movimento. O inventário inteiro é: curso de 60ms nos botões, 70ms no playhead e no numeral da régua, 100ms no pulso do tally, 120ms no empurrão de troca de sample. Uma transição nova precisa justificar por que não cabe nesse conjunto.
- **Don't** voltar a escurecer o playhead com `filter: brightness()`: apaga a cor do grupo justamente na coluna que o olho procura.
- **Don't** usar glifo de fonte como ícone. Os que estavam ali caíam na área privativa do Unicode e viravam tofu no Windows e no Android.
- **Don't** trocar `#seq >` por `.seq >` na reordenação de celular, nem tirar o `grid-row` explícito: a régua entra na conta do `25n` e cada instrumento passa a ocupar duas linhas.
- **Don't** tratar os tamanhos abaixo de `{typography.body}` como fora da rampa. Peça de máquina é dimensionada por peça; a rampa `--t-*` governa a prosa.
- **Don't** reviver `.chip`, `.card`, `.cheia` ou os degraus `--s7` e `--t-legend`: são resíduo declarado e não usado, não vocabulário do sistema.
