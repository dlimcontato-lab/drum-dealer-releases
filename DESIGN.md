---
name: Drum Dealer — o painel BRDRUM virou página
description: O aparelho de aço pintado do plugin, estendido a uma página que também precisa vender. Skeuomorfismo lido do dd.css, herdado do painel; não inventado para a web.
colors:
  steel: "#2a2a2c"
  steel-light: "#353537"
  steel-dark: "#1e1e20"
  recess: "#161618"
  ink: "#0e0e10"
  silk: "#e9e6de"
  silk-dim: "#a39e93"
  white: "#ffffff"
  red: "#c8302a"
  orange: "#e0702a"
  yellow: "#e2be3a"
  cream: "#ece6d6"
  plastic: "#232325"
  plastic-hi: "#414144"
  pointer: "#f2f0ea"
  led-on: "#ff3b2f"
  led-off: "#4a1613"
  led-green: "#36d476"
  led-green-off: "#15522d"
  skirt: "#3b3b3e"
  tooth: "#151517"
  panel-fill: "rgba(14,14,16,0.25)"
  panel-line: "rgba(233,230,222,0.55)"
  lane-line: "rgba(233,230,222,0.20)"
typography:
  display:
    fontFamily: "Barlow, Arial Narrow, sans-serif"
    fontSize: "clamp(2.6rem, 7vw, 5.4rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.02em"
  headline:
    fontFamily: "Barlow, Arial Narrow, sans-serif"
    fontSize: "clamp(1.6rem, 3.4vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.03em"
  title:
    fontFamily: "Barlow, Arial Narrow, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.06em"
  lead:
    fontFamily: "Barlow, Arial Narrow, sans-serif"
    fontSize: "clamp(1.05rem, 1.5vw, 1.22rem)"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "normal"
  body:
    fontFamily: "Barlow, Arial Narrow, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.55
    letterSpacing: "normal"
  small:
    fontFamily: "Barlow, Arial Narrow, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  legend:
    fontFamily: "Barlow, Arial Narrow, sans-serif"
    fontSize: "0.66rem"
    fontWeight: 600
    lineHeight: 1.55
    letterSpacing: "0.03em"
  key:
    fontFamily: "Barlow, Arial Narrow, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.06em"
  small-key:
    fontFamily: "Barlow, Arial Narrow, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.03em"
  panel-title:
    fontFamily: "Barlow, Arial Narrow, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.08em"
  field:
    fontFamily: "Barlow, Arial Narrow, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.03em"
  knob-legend:
    fontFamily: "Barlow, Arial Narrow, sans-serif"
    fontSize: "9.5px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.02em"
  nav:
    fontFamily: "Barlow, Arial Narrow, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.55
    letterSpacing: "0.06em"
  script:
    fontFamily: "Yellowtail, Brush Script MT, cursive"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
rounded:
  pointer: "1.2px"
  cap: "2px"
  key: "3px"
  field: "4px"
  frame: "6px"
  panel: "8px"
  full: "50%"
spacing:
  s1: "0.5rem"
  s2: "0.875rem"
  s3: "1.25rem"
  s4: "2rem"
  s5: "3.25rem"
  s6: "5rem"
  key-gap: "8px"
  group-gap: "6px"
  knob-col: "38px"
  step-col: "minmax(28px, 36px)"
  step-row: "62px"
  panel-gap: "22px"
components:
  key:
    backgroundColor: "{colors.plastic}"
    textColor: "{colors.silk}"
    typography: "{typography.key}"
    rounded: "{rounded.key}"
    padding: "0 22px"
    height: "44px"
  key-cream:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    typography: "{typography.key}"
    rounded: "{rounded.key}"
    padding: "0 22px"
    height: "44px"
  key-orange:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.silk}"
    typography: "{typography.key}"
    rounded: "{rounded.key}"
    padding: "0 22px"
    height: "44px"
  key-big:
    typography: "{typography.key}"
    rounded: "{rounded.key}"
    padding: "0 30px"
    height: "56px"
  key-small:
    backgroundColor: "{colors.plastic}"
    textColor: "{colors.silk}"
    typography: "{typography.small-key}"
    rounded: "{rounded.key}"
    padding: "0 10px"
    height: "22px"
  key-disabled:
    backgroundColor: "{colors.steel}"
    textColor: "{colors.silk-dim}"
  key-download:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.key}"
    padding: "16px 22px 14px"
  key-mid:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.key}"
    padding: "0 6px"
    height: "44px"
  key-instrument:
    backgroundColor: "{colors.plastic}"
    textColor: "{colors.silk}"
    typography: "{typography.key}"
    rounded: "{rounded.key}"
    width: "68px"
    height: "44px"
  toggle-mute-solo:
    backgroundColor: "{colors.plastic}"
    textColor: "{colors.silk-dim}"
    typography: "{typography.small-key}"
    rounded: "{rounded.key}"
    padding: "0 0 0 14px"
    width: "56px"
    height: "22px"
  toggle-mute-solo-on:
    backgroundColor: "{colors.plastic-hi}"
    textColor: "{colors.silk}"
  step:
    backgroundColor: "{colors.cream}"
    rounded: "{rounded.key}"
    padding: "0"
    height: "42px"
  step-g1:
    backgroundColor: "{colors.red}"
  step-g2:
    backgroundColor: "{colors.orange}"
  step-g3:
    backgroundColor: "{colors.yellow}"
  step-g4:
    backgroundColor: "{colors.cream}"
  knob-channel:
    backgroundColor: "{colors.plastic}"
    rounded: "{rounded.full}"
    width: "38px"
    height: "38px"
  knob-fx:
    backgroundColor: "{colors.orange}"
    rounded: "{rounded.full}"
    width: "46px"
    height: "46px"
  knob-panel:
    backgroundColor: "{colors.orange}"
    rounded: "{rounded.full}"
    width: "60px"
    height: "60px"
  field-select:
    backgroundColor: "{colors.recess}"
    textColor: "{colors.silk}"
    typography: "{typography.field}"
    rounded: "{rounded.field}"
    padding: "0 26px 0 8px"
    height: "26px"
  field-input:
    backgroundColor: "{colors.recess}"
    textColor: "{colors.silk}"
    rounded: "{rounded.field}"
    padding: "0 12px"
    height: "40px"
  screen:
    backgroundColor: "{colors.recess}"
    textColor: "{colors.orange}"
    rounded: "{rounded.field}"
    padding: "0"
  screen-bpm:
    backgroundColor: "{colors.recess}"
    textColor: "{colors.orange}"
    rounded: "{rounded.field}"
    padding: "0 10px"
    width: "96px"
    height: "44px"
  screen-price:
    backgroundColor: "{colors.recess}"
    textColor: "{colors.orange}"
    rounded: "{rounded.field}"
    padding: "0 12px"
    height: "64px"
  panel:
    backgroundColor: "{colors.panel-fill}"
    textColor: "{colors.silk}"
    typography: "{typography.panel-title}"
    rounded: "{rounded.panel}"
    padding: "22px 18px 18px"
  panel-plan:
    backgroundColor: "{colors.panel-fill}"
    textColor: "{colors.silk}"
    typography: "{typography.panel-title}"
    rounded: "{rounded.panel}"
    padding: "28px 22px 22px"
  panel-plan-hot:
    backgroundColor: "rgba(14,14,16,0.38)"
    textColor: "{colors.silk}"
  socket:
    backgroundColor: "{colors.led-off}"
    rounded: "{rounded.full}"
    width: "11px"
    height: "11px"
  socket-on:
    backgroundColor: "{colors.led-on}"
  chip-daw:
    backgroundColor: "{colors.plastic}"
    textColor: "{colors.silk}"
    typography: "{typography.field}"
    rounded: "{rounded.key}"
    padding: "0 14px"
    height: "34px"
  nav-link:
    textColor: "{colors.silk-dim}"
    typography: "{typography.nav}"
  nav-link-active:
    textColor: "{colors.silk}"
  meter:
    backgroundColor: "{colors.recess}"
    rounded: "{rounded.key}"
    width: "20px"
    height: "180px"
  fader-accent:
    backgroundColor: "{colors.recess}"
    rounded: "{rounded.key}"
    height: "70px"
---

# Design System: Drum Dealer — o painel BRDRUM virou página

## Overview

**Creative North Star: "A 808 de Verdade"**

O site é o mesmo aparelho do plugin, parafusado numa página. A primeira tela é o painel inteiro, tocável, com moldura, parafusos e banda de identidade, rodando o motor C++ do plugin em WebAssembly; tudo que vem abaixo (afirmação, planos, download, instalação, conta) é feito das mesmas peças que o painel usa: teclas de plástico abauladas que afundam, LEDs que acendem com halo, knobs com saia serrilhada e anel de LEDs verdes, rebaixos cortados no aço para tudo que recebe ou mostra valor, molduras serigrafadas com o título vazado na linha. A cor mora nas teclas e nas luzes; o fundo é aço grafite com grão, do canto ao canto, e nunca ganha cor.

A autoridade visual não é este documento. **A ordem é: o painel do plugin (`Source/MaschinLookAndFeel.h`, `PluginEditor.cpp`) → `~/Sistema AI/MaschinDealer/DESIGN.md` → este arquivo.** Este DESIGN.md registra como o mundo do painel pousou em `dd.css`, `index.html`, `conta.html` e `dd-main.js`; quando uma receita daqui e uma do plugin discordarem, vale a do plugin, e a divergência é ou um erro a corrigir aqui ou uma adaptação nomeada na seção correspondente. O site nunca manda no painel.

O que o site acrescenta que o painel não tem, e que este documento existe para registrar: uma rampa de prosa em Barlow (o painel é só serigrafia; a página precisa de título, lead e corpo), a tecla larga de CTA com o brilho diagonal limitado a 160px, a moldura de painel como `fieldset/legend`, o display de preço em luz laranja, os soquetes de LED que contam acessos nos planos, a página da conta com campos rebaixados, a grade do sequencer com `minmax` nas colunas de step e a reordenação das colunas no celular, foco de teclado em LED verde, e um estado desabilitado para o que "só existe no plugin".

**Anti-referências confirmadas.** Duas, fechadas pelo Diogo em 2026-09-09:

1. **O neobrutalismo creme do site anterior** (creme de painel `#e8e0cf`, contorno preto de 2,5px, sombra dura de blur zero, Archivo Black). Foi o site até 2026-09-09 e foi descartado quando o painel do plugin virou skeuomórfico. Não é uma alternativa em aberto; o registro do descarte está em `.impeccable/mocks/DESCARTADO.md`, junto com a "Sala Técnica" (rack de alumínio anodizado) descartada em 2026-08-27.
2. **"O VST escuro genérico"** (degradê de carvão em superfície, anel de cromo em knob, halo de glow em tudo). Rejeitado como cartão do cânone no plugin; o site herda a rejeição. O único brilho difuso é o do LED aceso e o da luz laranja dentro de um rebaixo.

**Key Characteristics:**
- Mundo skeuomórfico herdado: cada controle é um objeto com material, espessura e sombra, e a página é feita das mesmas peças
- Uma luz só, do alto à esquerda; toda sombra cai 1,5px para a direita e 3px para baixo, macia, em três camadas
- Aço grafite com grão (`feTurbulence` a 11%, overlay) como único fundo; a cor mora nas teclas e nos LEDs
- Quatro plásticos da 808 na grade; laranja = painel/FX/ação primária; preto = canal/serviço; creme = ação secundária
- LED como linguagem de estado e de contagem: vermelho é vivo (e é acesso ocupado), amarelo é SOLO, verde é valor (e é foco de teclado)
- Serigrafia Barlow em caixa alta com tracking leve para tudo que é peça; prosa Barlow 500 para tudo que é página
- Rebaixo cortado no aço para tudo que recebe ou mostra valor: campo, tela, preço, medidor, código, número de passo
- Raios baixos (3/4/6/8), nunca canto reto, nunca pílula
- Movimento só onde o áudio se move: playhead, medidor e o LED de compasso

## Colors

A mesma paleta do painel, sem uma cor a mais: aço quase preto que só existe para as quatro cores da 808, a serigrafia branca e as luzes aparecerem.

O aço do site é `{colors.steel}` com uma luz radial de `{colors.steel-light}` (elipse de 1400×900px centrada em 16% −6%, fixa no viewport, voltando ao aço aos 70%), e por cima de tudo um grão de ruído fractal (`feTurbulence` com `baseFrequency` .85, duas oitavas, semente 8, ladrilho de 200px) a 11% em `mix-blend-mode: overlay`. O aparelho ainda escurece do meio para o pé com `{colors.steel-dark}` a 55%. É a tradução em CSS da luz radial, do escurecimento linear e do ruído por pixel do `PluginEditor.cpp`.

### Primary
- **Laranja de Painel** (`{colors.orange}`): a cor de comando. Capa dos knobs de painel e FX (MASTER, AMOUNT, RATE, VOLUME, REV, DEL), teclas PLAY e RAND, BASS e LEAD, a tecla de CTA "Comprar", a tecla "Comprar Studio" do plano recomendado, a tecla "Entrar" da conta, o preenchimento do fader de accent, as notas da tela do piano roll, o texto luminoso de todo display (BPM, preço, número de passo de instalação), o texto de `<code>`, as legendas REV/DEL, o selo "Recomendado", a seleção de texto e o sublinhado de link em hover. É a única cor que pode aparecer como texto sobre o aço, e só quando é luz dentro de um rebaixo ou legenda de FX.

### Secondary
- **Vermelho 808** (`{colors.red}`): plástico do primeiro grupo de steps (1 a 4) e a quarta faixa da banda de identidade. Nunca texto, nunca estado.
- **Amarelo 808** (`{colors.yellow}`): plástico do terceiro grupo (9 a 12), segunda faixa da banda, LED de SOLO ligado, faixa do meio do medidor (60% a 84%).
- **Creme 808** (`{colors.cream}`): plástico do quarto grupo (13 a 16), primeira faixa da banda, e a tecla de toda ação secundária ou de utilidade: SAMPLER e EXPORT (desabilitadas), "Baixar o instalador", os dois downloads, "Comprar Solo" e "Comprar Equipe", "Criar conta". Sobre creme o texto é tinta.
- **LED Vermelho** (`{colors.led-on}` aceso, `{colors.led-off}` apagado): toda luz de estado vivo. Step ativo, luz de corrida do playhead, MUTE ligado, LED da tecla PLAY tocando, LED de compasso no rodapé do aparelho, topo do medidor, o LED do selo "Recomendado", e no site também **acesso ocupado** nos soquetes dos planos e da licença. A cor de texto de erro (`.msg.err`, `.falha`) é este LED, não o vermelho de plástico.
- **LED Verde** (`{colors.led-green}` aceso, `{colors.led-green-off}` apagado): valor e nível. O anel de LEDs de todo knob, a base do medidor, o LED de status da conta (conectado), a cor de texto de sucesso (`.msg.ok`), e **o anel de foco de teclado** (2px, deslocado 3px) em todo botão, link, campo e `select`.

### Neutral
- **Aço** (`{colors.steel}`), **Aço à Luz** (`{colors.steel-light}`) e **Aço na Sombra** (`{colors.steel-dark}`): o único fundo. O aço cru é também a face de tecla desabilitada.
- **Rebaixo** (`{colors.recess}`): o fundo de tudo que é cortado no aço: `select`, `input`, tela de BPM, display de preço, tela do piano roll, medidor, fenda do fader, `<code>`, número de passo da instalação, aviso (`.warn`), linha de máquina e de pedido na conta, trilho da barra de rolagem.
- **Tinta** (`{colors.ink}`): contorno de 1px em rebaixo, moldura do aparelho e LED (a 80%); cor de toda sombra macia; texto sobre creme; texto sobre a seleção laranja.
- **Serigrafia** (`{colors.silk}`) e **Serigrafia Apagada** (`{colors.silk-dim}`): a serigrafia é a cor do corpo de texto do site, dos títulos, das teclas escuras e laranjas, do texto de campo, do valor em `dd`, do link, do item de navegação ativo. A apagada é legenda, `dt`, número de step, legenda de knob, escala de dB, MUTE/SOLO desligado, placeholder, texto de lista de plano, prosa de apoio (`.dim`, `.feat p`, `.after-dl p`), navegação em repouso, marcador de lista e a designação em script.
- **Branco** (`{colors.white}`): só `<b>`/`<strong>` dentro de prosa e do aviso. Meio ponto acima da serigrafia, para o destaque dentro do parágrafo ler como relevo e não como outra cor.
- **Plástico Preto** (`{colors.plastic}`) e **Plástico Claro** (`{colors.plastic-hi}`): material dos controles de canal e da tecla padrão (`.key` sem variante, "Sair", `−`/`+` do BPM, "Desativar", chips de DAW). O claro é a face de MUTE/SOLO ligados e o topo da capa do fader.
- **Ponteiro** (`{colors.pointer}`): ponteiro do knob e linha da capa do fader.
- **Saia** (`{colors.skirt}`) e **Dente** (`{colors.tooth}`): anel serrilhado do knob e seus dentes; cabeça e aro dos parafusos; polegar da barra de rolagem (saia sobre rebaixo).
- **Preenchimento de Painel**, **Linha de Painel** e **Linha de Pista** (`{colors.panel-fill}`, `{colors.panel-line}`, `{colors.lane-line}`): as três cores com alpha estruturais. O véu dentro de todo `fieldset.panel`, a linha de 1,5px da moldura, e o filete de 1px que separa pistas no sequencer e que o site reaproveita como régua de seção (`.sec-head`, `.close`, `footer`).

### Named Rules

**A Regra do Painel.** Herdada. Laranja marca painel/FX; preto marca canal. No site a mesma regra se estende à página: **laranja é a ação primária de cada bloco** (uma por bloco: PLAY, RAND, "Comprar", "Comprar Studio", "Entrar"), **creme é a ação secundária ou de utilidade** ("Baixar o instalador", downloads, "Comprar Solo/Equipe", "Criar conta"), **preto é o botão de serviço** ("Sair", "Desativar", `−`/`+`). Dois botões laranja lado a lado é erro.

**A Regra dos Quatro Grupos.** Herdada sem alteração: vermelho, laranja, amarelo, creme nos 16 steps, invertida na banda de identidade (creme, amarelo, laranja, vermelho de cima para baixo, com 1px de tinta entre as faixas). O site repete os quatro plásticos nos quatro painéis de "O que tem dentro" (uma tecla de step de 36×42 com LED aceso por painel, g1 a g4, na ordem) e repete a banda no fecho da página (560px de largura máxima, centrada).

**A Regra do LED.** Herdada: vermelho é vivo, amarelo é SOLO, verde é valor. O site acrescenta dois sentidos sem mudar a cor: **soquete aceso é acesso ocupado** (vermelho, porque a máquina está viva naquele acesso) e **verde é foco de teclado**, porque o foco é o valor que o teclado está apontando. Nenhum outro elemento brilha.

**A Regra da Luz no Rebaixo.** O que está dentro de um rebaixo e mostra valor é luz laranja com halo curto (`text-shadow: 0 0 6px rgba(224,112,42,.55)`, ou 5px a 50% nos números de passo): BPM, preço, número do passo, `<code>`. É a mesma luz das notas da tela do piano roll. Texto laranja fora de um rebaixo só existe como legenda REV/DEL e no selo "Recomendado".

**A Regra do Aço Contido.** Herdada. O fundo não tem cor, não tem campo de cor por seção, não tem degradê colorido. O site tem sete seções e nenhuma delas muda o fundo: a separação é um filete de 1px em `{colors.lane-line}` e espaço.

## Typography

**Display Font:** Barlow Bold (700), largura normal (fallback Arial Narrow, sans-serif)
**Body Font:** Barlow Medium (500) para prosa; Barlow SemiBold (600) para legendas e navegação
**Script de Plaqueta:** Yellowtail (fallback Brush Script MT, cursive)

**Character:** Barlow é a serigrafia do painel e, no site, também a voz da página. As três famílias são as mesmas que o plugin embute (`Resources/Fonts`), carregadas do Google Fonts com `display=swap` nos pesos 500, 600 e 700 mais Yellowtail 400. O peso 500 é o único que o site acrescenta ao plugin: o painel não tem prosa, a página tem, e o Medium é o que mantém um parágrafo de 68ch legível sobre aço sem virar serigrafia. Não há segunda família de texto, não há mono: `<code>` é Barlow 600 dentro de um rebaixo.

### Hierarchy
- **Display** (Barlow 700, `clamp(2.6rem, 7vw, 5.4rem)`, lh 1.05, ls 0.02em, caixa alta, `text-wrap: balance`): o `h1`. Na afirmação da home ele é contido a `clamp(2.3rem, 5.6vw, 4.6rem)` e 20ch, porque divide a linha com o painel de especificações. A plaqueta do fecho ("DRUM DEALER") usa `clamp(2.4rem, 7vw, 4.6rem)` a 0.04em.
- **Headline** (Barlow 700, `clamp(1.6rem, 3.4vw, 2.5rem)`, lh 1.05, ls 0.03em, caixa alta): o `h2` de cabeça de seção, com 24ch de largura máxima, ao lado de uma legenda alinhada à direita.
- **Title** (Barlow 700, 1.05rem, ls 0.06em, caixa alta): `h3` de subtítulo de painel (o sistema operacional dentro de "Instalação", a 15px).
- **Lead** (Barlow 500, `clamp(1.05rem, 1.5vw, 1.22rem)`, lh 1.45, 52ch): o parágrafo sob o `h1` e o texto da licença na conta.
- **Body** (Barlow 500, 1rem, lh 1.55, 68ch): prosa. `<b>` é 700 em branco.
- **Small** (Barlow 500, 0.9rem, lh 1.5): lista de plano, notas, prosa dentro de painel, linha de máquina, mensagens de formulário, `.warn` (0.86rem).
- **Legend** (Barlow 600, 0.66rem ≈ 10,5px, ls 0.03em, caixa alta, serigrafia apagada): a legenda do site. Cabeça de seção, rótulo de campo na conta, `dt` da especificação, "só no plugin" (0.6rem), contagem de acessos, rodapé do aparelho, rodapé da página, nota da home.
- **Key** (Barlow 700, 15px, ls 0.06em, caixa alta, sombra gravada): texto de toda tecla de 44px. Tecla grande (`.big`) sobe a 17px; tecla do MIDI GEN e do BPM desce a 13px; "Baixar .mid" a 11px / 0.04em.
- **Small Key** (Barlow 700, 10px, ls 0.03em, caixa alta): MUTE, SOLO, "Desativar", `−`/`+` (13px), legenda dentro da tecla de download.
- **Panel Title** (Barlow 700, 12px, ls 0.08em, caixa alta, serigrafia cheia): a `legend` de todo `fieldset.panel`. Variante: rótulo ACCENT a 0.06em; chips de DAW a 0.06em em 34px.
- **Field** (Barlow 700, 12px, ls 0.03em, caixa alta, centrado): texto de `select.recess`. O `input.recess` não é serigrafia: é Barlow 600 a 15px, caixa baixa, alinhado à esquerda, porque recebe e-mail e senha.
- **Screen** (Barlow 700, ls 0.02em, luz laranja): 22px no BPM (com "BPM" a 9,5px / 600 / 0.03em a 70%), 34px no preço (com "R$" a 14px / 0.04em e centavos a 16px).
- **Knob Legend** (Barlow 600, 9,5px, ls 0.02em, caixa alta, apagada): legenda de knob, escala de dB. Números da régua de steps a 10px / 600, sem tracking.
- **Brand** (Barlow 700, caixa alta): 19px / 0.06em na barra do topo; 30px / 0.03em na plaqueta BRDRUM dentro do aparelho.
- **Nav** (Barlow 600, 11px, ls 0.06em, caixa alta, apagada; cheia em hover e na página atual).
- **Script** (Yellowtail 400, sem caixa alta, apagada): só a designação "Rhythm Composer - 001" (15px na barra do topo e na plaqueta, `clamp(1.2rem, 2.6vw, 1.9rem)` no fecho), sempre logo abaixo ou ao lado do nome, sempre mais estreita que ele.

### Named Rules

**A Regra das Duas Vozes.** Peça fala em serigrafia (700 ou 600, caixa alta, tracking de 0.02 a 0.08em); página fala em prosa (500, caixa baixa, sem tracking). Um texto está numa das duas: tecla, legenda, título de painel, campo e display são serigrafia; `h1`, `h2`, lead, corpo e lista são prosa em Barlow Bold ou Medium. A única ponte é o `h1`/`h2`, que é caixa alta com tracking de 0.02 a 0.03em porque é a plaqueta da seção, não um parágrafo.

**A Regra da Caixa Alta Leve.** Herdada: tracking de 0.03em por padrão, 0.08em só no título de painel, 0 nos números. O site não abre além de 0.08em em lugar nenhum.

**A Regra do Texto Gravado.** Herdada e aplicada a toda tecla: `text-shadow: 0 1px 0 rgba(14,14,16,.6)` sobre preto e laranja, `0 1px 0 rgba(255,255,255,.35)` sobre creme (e sobre a tecla laranja de "Baixar .mid", que leva tinta). Texto sobre aço não tem sombra; texto em rebaixo tem halo, não sombra.

**A Regra da Plaqueta.** Herdada: o nome em Barlow Bold, a designação em Yellowtail, a designação nunca mais larga que o nome. O site escreve "Drum Dealer" na barra do topo e no fecho e "BRDRUM" na plaqueta dentro do aparelho, como o painel; as duas grafias coexistem até o Diogo decidir o nome.

## Layout

Duas larguras de página: `.wrap-wide` (1560px, recuo lateral `clamp(12px, 2.5vw, 24px)`) para o aparelho e a barra do topo, `.wrap` (1080px, recuo `clamp(16px, 4vw, 28px)`) para todo o resto. O aparelho é a primeira tela e ocupa a largura larga; a prosa vem depois na largura estreita, e o fecho volta a centralizar. Seções têm `{spacing.s6}` (5rem) de respiro vertical (`{spacing.s5}` no celular), abertas por um `.sec-head` com `h2` à esquerda, legenda à direita, 12px de folga e um filete de 1px em `{colors.lane-line}`.

**A escala de espaço** é a do site anterior, mantida porque é o que a prosa precisa: `{spacing.s1}` a `{spacing.s6}` (0.5 / 0.875 / 1.25 / 2 / 3.25 / 5rem). Dentro do aparelho não se usa a escala: usam-se os pixels do painel (`{spacing.key-gap}`, `{spacing.group-gap}`, 14px entre teclas da barra, 18px entre colunas, 22px entre painéis).

**O aparelho** (`.unit`) é um bloco de duas colunas: a principal (`minmax(0, 1fr)`) com o sequencer e a prévia larga do MIDI GEN, e a lateral fixa de **236px** com a plaqueta BRDRUM e os quatro painéis (GAIN, GROOVE, FILL, MIDI GEN) a 22px um do outro. Acima das duas, a barra do topo (SAMPLER, PLAY, BPM, RAND, EXPORT) e a banda de identidade (21px, margem lateral de 30px); abaixo, o rodapé de estado em legenda. Parafusos a 16px dos cantos; recuo interno de 18px em cima, 20px nos lados, 16px embaixo.

**A grade do sequencer** é um `grid` de 28 colunas, com `{spacing.key-gap}` de `column-gap`: `56px` (MUTE/SOLO) · `5 × 38px` (knobs) · `68px` (instrumento) · quatro blocos de `4 × minmax(28px, 36px)` (steps) separados por três colunas de `{spacing.group-gap}` · `46px 46px` (REV, DEL). O vão de compasso é coluna do template, como manda o painel: 8 + 6 + 8 = 22px entre grupos, contra 8px dentro do grupo. Os steps usam `minmax(28px, 36px)` em vez dos 36px fixos do painel para que a grade caiba na coluna principal sem rolagem em 1180px e acima; abaixo disso, `.seq-scroll` rola na horizontal. Cada linha tem `margin-block: 10px` nas peças (42px de step + 20 = 62px de pista, contra 90 no painel: o site é mais denso porque a legenda de knob fica colada ao knob) e um filete de 1px em `{colors.lane-line}` ao pé de cada uma menos a última. A régua de números fica acima da primeira pista, em `{typography.knob-legend}` a 10px; a linha de ACCENT, abaixo da sexta, com o rótulo ocupando as sete primeiras colunas e 16 faders alinhados às colunas de step.

**A prévia larga do MIDI GEN** (adaptação): as duas telas do piano roll (BASS e LEAD) não cabem na tela de 96×44 do painel e vieram para a coluna principal, abaixo do sequencer, como duas pistas de 96px de altura (`56px` de tecla-rótulo laranja + `minmax(0, 1fr)` de tela rebaixada com `canvas`). Os controles (tom, escala, compassos, teclas BASS/LEAD, "Baixar .mid") continuam no painel MIDI GEN da coluna lateral.

**Abaixo do aparelho**, a página é uma coluna de blocos: a afirmação (grid `minmax(0, 1fr) 340px`, alinhada pelo pé, `h1` + lead + duas teclas de CTA à esquerda, painel de especificações à direita), os três planos (`repeat(3, minmax(0, 1fr))` a `{spacing.s4}`), os dois downloads (duas colunas a `{spacing.s3}`) seguidos de três painéis de passo, os chips de DAW, os quatro painéis de "O que tem dentro", os dois painéis de instalação (`auto-fit, minmax(320px, 1fr)`), o painel do Sampler, e o fecho com plaqueta, banda, CTAs e rodapé. A conta é um grid de duas colunas iguais (`{spacing.s4}` de vão) de painéis: Entrar / Criar conta quando deslogado, Licença + Comprar / Download + Pedidos + Sessão quando logado.

**Responsivo.** Dois pontos de quebra:
- **≤ 1180px**: o aparelho vira uma coluna; a lateral vira um grid `auto-fit, minmax(220px, 1fr)` de painéis com a plaqueta alinhada à esquerda ocupando a linha inteira; planos, afirmação, passos e conta viram uma coluna (planos e especificações limitados a 520px, centrados); "O que tem dentro" vira duas colunas.
- **≤ 760px**: **a grade do sequencer se reordena**: a tecla do instrumento vem primeiro, os 16 steps em seguida (26px por coluna, vão de 6px), depois REV, os cinco knobs, DEL e MUTE/SOLO no fim; a grade fica com 940px de largura mínima e rola dentro de `.seq-scroll`. O que interessa (nome + padrão) está à esquerda, na parte visível; o resto está a uma rolagem. SAMPLER e EXPORT ("só no plugin") somem; a capa do fader encolhe para 22px; os parafusos vão a 10px; as teclas de CTA ocupam a largura toda; downloads e "O que tem dentro" viram uma coluna; a linha de máquina da conta empilha.

### Named Rules

**A Regra da Pista.** Herdada no desktop: estado → som → nome → padrão → envio. No celular a ordem muda de propósito (nome → padrão → envio → som → estado) e é a única exceção documentada; ela existe porque a tela é estreita e o padrão é o que se toca.

**A Regra do Vão de Compasso.** Herdada: o grupo de quatro é feito de uma coluna de `{spacing.group-gap}` no template, não de margem no item. Os faders de accent e a régua herdam as mesmas colunas.

**A Regra das Duas Larguras.** O aparelho é largo (1560); a página é estreita (1080). Nenhum bloco de prosa usa a largura larga, e nada além do aparelho e da barra do topo mora nela.

## Elevation & Depth

Profundidade física, herdada: uma luz do alto à esquerda ilumina objetos apoiados numa chapa de aço. Tecla tem 3px de corpo (`box-shadow: 0 3px 0 <corpo>`) mais a sombra macia; knob tem saia e capa em alturas diferentes; rebaixo é cortado na chapa com sombra interna no topo e fio de luz embaixo; LED é vidro com halo; o aparelho tem lábio de luz em cima e à esquerda e uma sombra grande embaixo. Não existe sombra dura de blur zero (era o site anterior), não existe glow em superfície (era o cânone rejeitado). O site não acrescenta nenhum degrau de elevação: painel de plano recomendado é a mesma moldura, só com a linha em serigrafia cheia, o véu a 38% e uma sombra de apoio.

### Shadow Vocabulary
- **Sombra de tecla** (`--sh-key`: `1.5px 3px 0 1.2px rgba(14,14,16,.25), 1.5px 3px 0 2.4px rgba(14,14,16,.1), 1.5px 3px 0 3.6px rgba(14,14,16,.05)`), sempre precedida do corpo `0 3px 0 var(--body)` (2px em MUTE/SOLO e `.key.small`): toda tecla em repouso. Apertada ou desabilitada, o corpo vira `0 1px 0` e a sombra macia some.
- **Sombra de knob** (`--sh-knob`: as mesmas três camadas a .325 / .13 / .065) sob a saia; a capa leva a sua própria, `.75px 1.5px 2px rgba(14,14,16,.6)`.
- **Sombra macia aproximada** (`--sh-soft`: `1.5px 3px 4px rgba(14,14,16,.45)`): declarada e disponível para peça nova sem as três camadas.
- **Sombra interna de rebaixo** (`inset 0 3px 6px -1px rgba(14,14,16,.7), 0 1px 0 rgba(255,255,255,.10)` com contorno de 1px em tinta): `select`, `input`, tela, preço, medidor, fenda do fader, `.warn`, linha de máquina. `<code>` e o número de passo usam a versão curta `inset 0 2px 3px rgba(14,14,16,.7)`; o soquete de acesso, `inset 0 1px 2px rgba(14,14,16,.6)`.
- **Sombra de capa de fader** (`1.5px 2px 3px rgba(14,14,16,.5)`): sob a capa de 28×13.
- **Sombra de parafuso** (`0 1.5px 2px rgba(14,14,16,.6)` + `inset 1px 1px 0 rgba(255,255,255,.25)`).
- **Sombra do aparelho** (`inset 1px 1px 0 rgba(255,255,255,.10), inset -1px -1px 0 rgba(14,14,16,.6), 4px 8px 18px rgba(14,14,16,.55)`): a única sombra grande do site; é o aparelho apoiado na página.
- **Sombra de plano recomendado** (`inset 1px 1px 0 rgba(255,255,255,.06), 2px 6px 16px rgba(14,14,16,.5)`): o painel `.hot` levantado meio dedo.
- **Halo de LED** (`0 0 0 3px rgba(255,59,47,.28), 0 0 9px 2px rgba(255,59,47,.55)` no LED de 7px; `0 0 0 2px .3, 0 0 6px 1px .55` no LED de 5,5px de MUTE/SOLO; `0 0 0 3px .25, 0 0 10px 2px .55` no soquete de 11px; sob o playhead com step ativo, `0 0 0 4px .3, 0 0 13px 3px .6`): só no LED aceso. Verde e amarelo seguem a mesma forma com a sua cor.
- **Halo do ponto do anel** (`0 0 0 1.4px rgba(54,212,118,.45)`): sob cada ponto aceso do knob.
- **Halo do medidor** (`filter: drop-shadow(0 0 1.5px rgba(54,212,118,.35))`) na escada acesa.

### Named Rules

**A Regra da Luz Única.** Herdada: sombra em (1,5, 3), brilho no canto superior esquerdo (a face da tecla tem um brilho diagonal branco a 30% que some aos 42%), lábio de luz em cima e à esquerda, rebaixo com sombra em cima e fio de luz embaixo. Peça nova que ponha luz embaixo ou sombra para cima está fora do mundo.

**A Regra do Curso da Tecla.** Herdada e implementada com `transform: translateY(2px)` (1px na tecla pequena) e o corpo encurtando a `0 1px 0`, com `transition: none`: a tecla afunda e encosta, sem animar. **Tecla desabilitada fica afundada**: é a leitura de "esta tecla não sobe aqui" (SAMPLER, EXPORT, "Baixar .mid" antes de gerar).

**A Regra do Halo Só no LED.** Herdada. O site tem uma segunda luz, a do texto laranja dentro de um rebaixo (ver **A Regra da Luz no Rebaixo**), e ela também é LED: é o display. Nada mais brilha, e nenhuma tecla, moldura ou link tem glow.

**A Regra do Brilho Curto.** O brilho diagonal da face da tecla é pintado num quadro de **160px de largura** (`background-size: 160px 100%`, sem repetição, ancorado à esquerda). Numa tecla de 44px ele cobre a face inteira; numa tecla larga (CTA de 180px+, botão de formulário a 100%, tecla de download) ele fica no canto superior esquerdo, como um reflexo de janela, em vez de se esticar até virar degradê. É o que deixa uma tecla de 400px continuar lendo como plástico, não como botão web com gradiente.

## Shapes

Os raios são os do painel, baixos e poucos, cada um com origem numa peça. Nunca canto reto, nunca pílula. Círculo só onde a peça é torneada: knob, LED, soquete, parafuso, marcador de lista.

| Degrau | Onde |
|---|---|
| `{rounded.pointer}` | ponteiro do knob (1,2px); preenchimento do fader (1,5px) |
| `{rounded.cap}` | capa do fader de accent; o brilho interno da tecla (`inset: 1.5px`, raio 2) |
| `{rounded.key}` | toda tecla e chip; fenda do fader; medidor; `<code>` |
| `{rounded.field}` | `select`, `input`, tela, preço, número de passo, `.warn`, linha de máquina, `canvas` do piano roll |
| `{rounded.frame}` | contorno do aparelho; polegar da barra de rolagem |
| `{rounded.panel}` | moldura serigrafada de todo `fieldset.panel` |
| `{rounded.full}` | knob (saia e capa), LED, soquete, parafuso, ponto do anel, marcador de lista |

Contornos: **1px** em tecla (na cor `--edge`, o `darker(0.7)` da cor), rebaixo (tinta), LED (tinta a 80%), capa de knob (tinta a 85%), aparelho (tinta); **1,5px** só na linha da moldura de painel e no aro do parafuso; **2px** só no anel de foco de teclado (verde, deslocado, não é borda de peça). Nenhuma borda de 2,5px sobrou do mundo anterior.

**Proporções fixas de peça**, herdadas: step 36×42 (LED de 7px a 10px do topo), tecla de instrumento 68×44, tecla de barra 44 de altura, MUTE/SOLO 56×22 (LED de 5,5px a 6px da esquerda, texto a partir de 14px), knob de canal 38 / FX 46 / painel 60 (capa a 70%, anel a 41,5% do diâmetro, ponteiro de 2,4px), fader 36×70 (fenda de 9px, capa 28×13), medidor 20 de largura, soquete 11, LED solto 7, parafuso 12. O site acrescenta: tecla grande 56 de altura, tecla pequena 22 (26×26 no `−`/`+` do BPM), tela de BPM 96×44, display de preço 64 de altura, chip de DAW 34, `input` 40 de altura.

### Named Rules

**A Regra do Raio Baixo.** Herdada: tecla é 3, campo é 4, painel é 8, aparelho é 6. Peça nova pega o raio da equivalente; sem equivalente, é 3.

**A Regra do Knob Torneado.** Herdada e feita em CSS: saia serrilhada em `repeating-conic-gradient` (dente `{colors.tooth}` de 6° a cada 13,33°, 27 dentes) sob um disco `{colors.skirt}` a 77%; anel de 11 pontos (15 em FX e painel) de 2,2px (2,8px) a −135°…+135°, acesos em verde do mínimo até o ponteiro; capa a 70% com gradiente diagonal (preto `#5c5c5e → #1b1b1c`, laranja `#e37d3d → #ac5620`) e ponteiro `{colors.pointer}`. Sem saia é botão; sem anel é knob de outro mundo.

## Components

Instrumento, não formulário, mesmo na página da conta. Cada controle é um objeto: a tecla afunda, o LED acende, o knob gira e mostra o valor no anel, o fader corre numa fenda, o display é luz num rebaixo. **Nenhuma tecla tem hover**; o site só tem hover em link de prosa (o sublinhado passa a laranja) e na navegação (a serigrafia acende). Todo elemento focável tem anel verde de 2px a 3px de distância (1px no `input`).

### Buttons
Todos os botões são a mesma peça, `.key`: face em gradiente vertical (`--face-a` → `--face-b`), corpo de 3px em `--body`, contorno de 1px em `--edge`, brilho diagonal de 160px, sombra macia, texto gravado, `transition: none`. Muda a cor do plástico.

- **Shape:** raio `{rounded.key}`, 44px de altura, `padding: 0 22px`, `inline-flex` centrado com `gap: .4em` para LED ou ícone.
- **Preto (padrão)** — face `#4b4b4c → #212123`, corpo `#171718`, borda `#151516`, serigrafia com sombra de tinta a 60%: "Sair", "Desativar", `−`/`+`, e a tecla do instrumento.
- **Creme (`.cream`)** — face `#efebdd → #dfd9ca`, corpo `#98948a`, borda `#8b877e`, tinta com sombra branca a 35%: ação secundária e utilidade. Desabilitada: face `#bdb8ab → #aaa497`, texto `#5a574f`.
- **Laranja (`.orange`)** — face `#e68a50 → #d36a28`, corpo `#91481b`, borda `#844219`, serigrafia com sombra de tinta a 60%: ação primária.
- **Grande (`.big`)** — 56px, 17px de texto, `padding: 0 30px`; 180px de largura mínima na fila de CTA; 100% no celular.
- **Pequena (`.small`)** — 22px, 10px / 0.03em, `padding: 0 10px`, corpo de 2px, curso de 1px.
- **Download (`.dl`)** — creme, em coluna, `padding: 16px 22px 14px`, 17px de texto com ícone SVG de 22px em cima e uma legenda de 10px / 600 a 80% embaixo.
- **"Baixar .mid" (`.dl` no MIDI GEN)** — tecla laranja de 44px com texto em tinta a 11px / 0.04em e sombra branca: é a regra do DRAG do painel (tecla laranja pequena demais para serigrafia leva tinta). Antes de gerar, fica afundada e cinza (`aria-disabled`).
- **Com LED** — PLAY leva um LED de 7px antes do texto; aceso (`.playing`) enquanto toca. Adaptação: o painel não tem PLAY (segue o DAW); o site precisa de transporte e de BPM.
- **Pressed:** `translateY(2px)`, corpo `0 1px 0`, sombra some, sem transição. **Desabilitada (`[disabled]`):** fica afundada, face `#3a3a3c → #2a2a2c`, texto apagado, `cursor: not-allowed`; SAMPLER e EXPORT vêm assim com a legenda "só no plugin" embaixo, e somem no celular.

### Toggles (MUTE / SOLO)
- **Style:** tecla preta de 56×22, corpo de 2px, LED de 5,5px a 6px da esquerda (`::after`), texto de 10px a partir de 14px, alinhado à esquerda, serigrafia apagada.
- **State:** ligado, face `#636366 → #3d3d40`, texto cheio, LED aceso: vermelho no MUTE, amarelo no SOLO. Empilhados em `grid-template-rows: 22px 22px; gap: 4px`.

### Knobs
- **Shape:** círculo de 38 (canal), 46 (FX: AMOUNT, RATE, VOLUME, REV, DEL), 60 (painel: MASTER). `cursor: ns-resize`, `touch-action: none`.
- **Material:** ver **A Regra do Knob Torneado**. Contorno de 1px em tinta, arco de luz `inset 1px 1px 0 rgba(255,255,255,.20)`, sombra `--sh-knob`; capa com contorno de tinta a 85%, arco a 12% e sombra própria.
- **Anel de LEDs:** pontos `<i>` posicionados por `--a` (JS distribui de −135° a +135°), apagados em `#0c0c0d`, acesos (`.lit`) em `{colors.led-green}` com halo de 1,4px a 45%, do mínimo até o valor. O ponteiro gira por `--rot`.
- **Legenda:** `.kcell small` a 9,5px / 600 / 0.02em, apagada, 6px abaixo do knob; `.fxlab` em laranja para REV/DEL.
- **Interação:** arrasto vertical; duplo clique volta ao padrão. O valor nunca aparece em número.

### Inputs / Fields
- **Rebaixo (`.recess`):** fundo `{colors.recess}`, 1px de tinta, raio `{rounded.field}`, sombra interna no topo e fio de luz embaixo. É a classe-base de campo, aviso, linha de lista e display.
- **Select:** 26px (24px no MIDI GEN), texto de campo centrado, `padding: 0 26px 0 8px`, seta serigrafada de 7×4,5px a 11px da direita; apertado, o fundo sobe a `#1d1d20`. Sem foco visual além do anel verde.
- **Input (adaptação da conta):** 40px, Barlow 600 a 15px, caixa baixa, `padding: 0 12px`, placeholder apagado a 500; foco: anel verde de 2px a 1px. O rótulo é uma legenda 5px acima. É a única peça do site em que se digita, e é o mesmo rebaixo do `select`, mais alto.
- **Mensagem de formulário (`.msg`):** 0.9rem, 1.3em de altura reservada; erro em `{colors.led-on}`, sucesso em `{colors.led-green}`.
- **Aviso (`.warn`):** rebaixo com `padding: 12px 14px`, 0.86rem, serigrafia cheia, `<b>` em branco.
- **Código (`<code>`):** rebaixo em linha, Barlow 600, laranja, `padding: 1px 6px`, raio 3.

### Screens (display)
- **Style:** rebaixo com texto em luz laranja (`{colors.orange}` + `text-shadow: 0 0 6px rgba(224,112,42,.55)`), Barlow 700 a 0.02em, centrado pela linha de base.
- **BPM:** 96×44, 22px, com "BPM" a 9,5px / 600 em laranja a 70%, entre duas teclas pequenas de 26×26.
- **Preço (assinatura do site):** 64px de altura, 34px, "R$" a 14px / 0.04em, centavos a 16px, `padding: 0 12px`. O preço é luz, não texto: é a mesma tela do BPM com um número maior.
- **Piano roll:** rebaixo de 96px de altura na prévia larga com um `canvas` de 900×96 (as notas laranja são desenhadas pelo JS); 44px dentro do painel MIDI GEN.
- **Número de passo (instalação):** rebaixo de 26×22 com o contador em laranja a 11px / 700 e halo de 5px a 50%, à esquerda de cada item da lista.

### Meters
- **Style:** dois rebaixos de 20×180 (o painel tem 520; o site encurta para caber no painel GAIN de 236px) com raio 3, 6px entre eles. Escada de segmentos de 4px com vão de 2px por `mask: repeating-linear-gradient`, 3px de folga lateral e 4px vertical; apagada em `#0f3b21 / #3f3510 / #47100d`, acesa em verde até 60%, amarelo até 84%, vermelho no topo, com halo verde curto. Escala à direita (+6, 0, −12, −24, −48) em 9,5px / 600 com traços de 3×1px.

### Faders (Accent)
- **Style:** 70px de altura na coluna do step. Fenda de 9px rebaixada (raio 3, sombra interna), preenchimento laranja de 5px de baixo até `--v`, capa preta de 28×13 (`#414144 → #1b1b1c`, raio 2, 1px de tinta, sombra `1.5px 2px 3px`) com uma linha `{colors.pointer}` de 1,5px no meio, presa em `bottom: calc(4px + (100% − 21px) · v)`. `cursor: ns-resize`; duplo clique volta a 0,5. No celular a capa encolhe para 22px.

### Cards / Containers (Panels)
Não há card: há a **moldura serigrafada de painel**, herdada, feita como `<fieldset class="panel">` com `<legend>` centrada.
- **Corner Style:** `{rounded.panel}`.
- **Background:** `{colors.panel-fill}` (véu de tinta a 25%).
- **Border:** 1,5px em `{colors.panel-line}`; a `legend` (12px / 700 / 0.08em, serigrafia cheia, `padding: 0 8px`) interrompe a linha de cima porque é `legend` de `fieldset`, o que dá o título vazado sem precisar do fundo exato do aço.
- **Internal Padding:** `22px 18px 18px` (a `legend` já ocupa metade da linha). Variantes: painéis da lateral do aparelho `20px 14px 14px`, plano `28px 22px 22px`, especificação `24px 20px 18px`, "O que tem dentro" `26px 18px 20px`, instalação e conta `26px 22px 22px`, sampler `30px 28px 26px`.
- **Plano recomendado (`.hot`):** linha em `{colors.silk}`, véu a 38%, sombra de apoio; a `legend` ganha o selo "Recomendado" em laranja com um LED aceso. É o único painel com elevação.
- **Uso:** todo bloco de conteúdo fora do aparelho é um painel: especificações, planos, três passos após o download, "O que tem dentro", Mac/Windows, Sampler, e os seis painéis da conta. A página é uma coluna de painéis sobre aço.

### Seats (soquetes de acesso; assinatura do site)
- **Style:** fila de cinco soquetes de 11px (`{colors.led-off}`, 1px de tinta a 80%, sombra interna curta: um LED encaixado num furo) a 10px, seguidos da legenda "N acessos". Aceso (`.on`): `{colors.led-on}` com halo. Solo acende um, Studio três, Equipe cinco; na conta, os acessos ocupados acendem. O número de máquinas não é um número, é uma contagem de luzes; a legenda ao lado é o texto acessível.

### Chips (DAWs compatíveis)
- **Style:** a tecla preta sem interação: 34px, 12px / 700 / 0.06em, `padding: 0 14px`, corpo de 3px, brilho e sombra de tecla, sem `:active`. Uma tecla por DAW, em `flex-wrap` a 10px.

### Navigation
- **Barra do topo:** marca à esquerda (nome 19px / 0.06em + designação em Yellowtail 15px, alinhados pela base, 12px entre eles), quatro links à direita em `{typography.nav}` apagados, cheios em hover e em `aria-current`, 22px entre eles (14px no celular). Sem fundo, sem borda, sem sticky: `padding: 18px 0 14px` sobre o aço. É serigrafia na chapa, acima do aparelho.
- **Fecho:** plaqueta grande centrada (nome + designação + banda de 560px), fila de CTA, rodapé em legenda com um filete de 1px acima.

### Sequencer (componente-assinatura, herdado)
Seis pistas, uma por instrumento, com 16 teclas de step em quatro grupos de cor, MUTE/SOLO e cinco knobs à esquerda, REV/DEL à direita, e a linha de accent embaixo. Ver Layout para a grade.
- **Step:** tecla de plástico de 42px na largura da coluna, raio `{rounded.key}`, na cor do grupo (`.g1` a `.g4`, cada uma com face, corpo, borda e um par `--ph-a/--ph-b` mais claro), sem texto, LED de 7px a 10px do topo. **Ativo (`.on`):** LED aceso com halo. **Sob o playhead (`.ph`):** a face inteira sobe para o par `--ph` e o LED acende a 55% mesmo no step vazio; ativo sob o playhead, o halo cresce (`0 0 0 4px .3, 0 0 13px 3px .6`). **Apertado:** curso de 2px, sombra some. Tudo com `transition: none`.
- **Régua:** números 1 a 16 em 10px / 600 apagados; o primeiro de cada grupo (`.grp`) e o do playhead (`.ph`) em serigrafia cheia, com uma transição de cor de 70ms.
- **Instrumento (`.lab`):** tecla preta de 68×44; clique troca o sample.
- **Rodapé de estado:** LED de compasso (`.tally`: 7px, aceso em vermelho enquanto toca, `scale(1.6)` por 100ms a cada batida com `cubic-bezier(.2,.9,.3,1)`), texto do MIDI GEN, e a mensagem de falha em `{colors.led-on}`. É o único movimento fora do playhead e do medidor; some em `prefers-reduced-motion`.

### Aparelho (moldura e aço)
`.unit`: contorno de 1px em tinta com raio `{rounded.frame}`, escurecimento do meio para o pé (`linear-gradient` transparente até 55%, `rgba(30,30,32,.55)` no fim), lábio de luz e sombra internos, sombra grande, e quatro parafusos (`.screw`: 12px, cabeça `{colors.tooth}`, aro de 1,5px `{colors.skirt}`, arco de luz a 25%, fenda de 1,8px em tinta girada num ângulo diferente por canto: 20°, −35°, 70°, −10°). A banda de identidade (`.band`) é um `linear-gradient` de 21px com nove paradas: tinta 1px, creme 4, tinta, amarelo 4, tinta, laranja 4, tinta, vermelho 4, tinta.

## Do's and Don'ts

### Do:
- **Do** tratar o painel do plugin e `~/Sistema AI/MaschinDealer/DESIGN.md` como a autoridade. Peça nova no site: achar a equivalente no painel e copiar a receita com os números; só depois adaptar, e registrar a adaptação aqui.
- **Do** fazer todo botão com `.key`: face em gradiente, corpo de 3px, contorno de 1px, brilho de 160px, sombra macia em três camadas, texto gravado, `transition: none`.
- **Do** afundar a tecla apertada (`translateY(2px)`, corpo `0 1px 0`, sombra some) e deixar a tecla desabilitada afundada.
- **Do** seguir **A Regra do Painel** na página: uma tecla laranja por bloco, creme para a secundária, preta para serviço.
- **Do** cortar no aço (`.recess`) tudo que recebe ou mostra valor: campo, tela, preço, medidor, código, número de passo, aviso.
- **Do** escrever valor dentro de rebaixo em luz laranja com halo de 6px a 55%.
- **Do** usar `<fieldset class="panel">` com `<legend>` para toda moldura de conteúdo; o título vazado vem do próprio `fieldset`.
- **Do** contar acessos com soquetes de LED (vermelho aceso = ocupado) e manter a legenda "N acessos" ao lado como texto acessível.
- **Do** manter a luz no alto à esquerda: sombra em (1,5, 3), brilho no canto superior esquerdo, rebaixo com sombra em cima e fio de luz embaixo.
- **Do** carregar Barlow 500, 600 e 700 e Yellowtail 400; prosa em 500, legenda em 600, tecla e título em 700.
- **Do** manter serigrafia em caixa alta com tracking de 0.02 a 0.08em e prosa em caixa baixa sem tracking (**A Regra das Duas Vozes**).
- **Do** reproduzir a grade do sequencer com `minmax(28px, 36px)` nas colunas de step e a coluna de 6px de vão de compasso no template, e reordenar as colunas no celular com a tecla do instrumento primeiro.
- **Do** dar anel de foco verde (2px, 3px de distância) a tudo que recebe teclado.
- **Do** marcar como "só no plugin" (tecla afundada + legenda) o que existe no painel e não pode existir na página, em vez de esconder.
- **Do** manter o movimento onde o áudio se move: playhead, medidor, LED de compasso; e desligar tudo em `prefers-reduced-motion`.

### Don't:
- **Don't** reconstruir o neobrutalismo creme do site anterior: fundo creme, contorno de 2,5px, sombra dura de blur zero, Archivo Black, Martian Mono. Descartado em 2026-09-09.
- **Don't** fazer o "VST escuro genérico": degradê de carvão em superfície, anel de cromo em knob, glow em borda, botão ou moldura.
- **Don't** colorir o fundo: sem campo de cor por seção, sem degradê colorido, sem faixa de destaque. Seção se separa com um filete de 1px e espaço.
- **Don't** usar sombra dura de blur zero, sombra para cima ou para a esquerda, nem sombra grande fora do aparelho e do plano recomendado.
- **Don't** pintar tecla chapada, nem esticar o brilho da face além de 160px numa tecla larga.
- **Don't** pôr duas teclas laranja lado a lado, nem usar laranja em tecla de serviço.
- **Don't** usar vermelho, amarelo ou creme como cor de estado ou de texto. Estado é LED; erro é `{colors.led-on}`, sucesso é `{colors.led-green}`.
- **Don't** mostrar preço, BPM ou número de passo como texto em serigrafia: é luz num rebaixo.
- **Don't** usar card com fundo sólido, borda de 1px cinza ou cabeçalho em barra. Contêiner de conteúdo é `fieldset.panel` com `legend`.
- **Don't** adicionar hover a tecla, knob, step ou campo. Hover só em link de prosa e navegação.
- **Don't** mostrar o valor do knob em número.
- **Don't** usar Barlow Condensed, outra família de texto ou uma fonte mono. `<code>` é Barlow 600 em rebaixo.
- **Don't** usar Yellowtail fora da designação "Rhythm Composer - 001", nem deixar a designação mais larga que o nome.
- **Don't** abrir o tracking além de 0.08em, nem usar caixa alta em prosa (lead, corpo, lista, placeholder, `input`).
- **Don't** inventar raio fora da escada (1,2 / 2 / 3 / 4 / 6 / 8 / círculo), nem canto reto, nem pílula.
- **Don't** engrossar contorno: 1px em peça, 1,5px em moldura de painel; 2px só no anel de foco.
- **Don't** juntar as quatro faixas da banda em degradê nem trocar a ordem; no site ela aparece duas vezes (aparelho e fecho) e nas duas é a mesma.
- **Don't** usar a largura larga (1560px) para prosa; só o aparelho e a barra do topo moram nela.
- **Don't** deixar o site mandar no painel. A ordem é painel → DESIGN.md do plugin → este arquivo.
