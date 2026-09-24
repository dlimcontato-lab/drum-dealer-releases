# Ficha de defesa — correção de layout mobile (2026-09-24)

Base: `~/SOIA/referencias/design/apple/APPLE-DESIGN.md`. Escopo: `dd-painel.js` (escala da demo),
`dd.css` (`.steps`, `code`), `testes/painel.mjs`. Autoridade de design do site continua sendo
`DESIGN.md` deste repositório; esta ficha só documenta as decisões desta correção pontual.

---

### D13 | Demo do painel (`.aparelho`, `escalar()` em `dd-painel.js`): a demo escala para caber, sem piso de 44px, abaixo de 900px de rolo

Valor: `rolo.clientWidth < 900` → escala = `max(0.2, min(1, rolo.clientWidth / 1600))`, sem o piso
fixo de 0,6 que existia antes; `rolo.clientWidth >= 900` → mantém o piso antigo de 0,6. A caixa
(`.aparelho-caixa`) acompanha a largura E a altura escaladas (`Math.round(1600*s)` /
`Math.round(1126*s)`), então não sobra vão nem corta control.

Antes: piso fixo de 0,6 em qualquer largura de rolo. Em 390px isso deixava a demo em 960px de
largura (960 = 1600×0,6) dentro de um contêiner de 366px, cortando REVERB/DELAY, MASTER FX e FILL
para fora da área visível sem rolar — o usuário via só a metade esquerda do aparelho a menos que
arrastasse horizontalmente dentro da vitrine.

Regra: "Decida por espaço disponível, não por aparelho" [OBRIGATÓRIO, tradução: container
queries/medida real, nunca heurística de dispositivo] · "Teste primeiro o maior e o menor layout,
em vários tamanhos de texto e idiomas" · "Mesma anatomia desenhada uma vez, que se reorganiza em
celular, tablet e desktop mantendo os grupos juntos" — APPLE-DESIGN.md §4.4 itens 1, 3 e 8.

Fonte Apple: HIG layout ("Decide based on the space available, not the device"); *new design
system* [13:32]-[15:04] (mesma anatomia, reorganizada por espaço).

Por quê: a demo é a primeira tela do site (Creative North Star "A 808 de Verdade", `DESIGN.md`
linha 309) — é ela que prova que o motor roda no navegador antes de qualquer prosa. Se o visitante
não vê o aparelho inteiro (moldura, os quatro grupos de cor, REV/DEL, MASTER FX, MIDI GEN) na
primeira dobra, a prova falha silenciosamente: ele acha que só existe metade de um sequencer.

Se violar: em 390/360/320px a demo continua cortada à direita dentro de `.aparelho-rolo`; o
visitante precisa descobrir sozinho que dá para arrastar dentro da vitrine (a maioria não tenta).

Alternativa descartada: manter o piso de 0,6 e deixar `.aparelho-rolo` como rolagem horizontal
permanente (era o comportamento anterior, tecnicamente "sem bug" porque a rolagem é contida e não
vaza para a página). Descartada porque rolagem horizontal escondida dentro de uma vitrine de
demonstração é o oposto do propósito da demo: a peça central da home não pode pedir ao usuário que
descubra uma interação de rolagem só para ver o produto inteiro (contraria §4.4.1 e §4.4.3 — o
teste do menor layout tem que mostrar a peça inteira, não uma fatia dela).

Como verificar: `testes/painel.mjs <url> 390` → `.aparelho-caixa` com `right <= 390` e
`document.documentElement.scrollWidth === 390`; `testes/painel.mjs <url> 320` →
`document.documentElement.scrollWidth === 320`; `testes/painel.mjs <url> 1680` → escala continua
em `0.9 < escala <= 1` (não regrediu no desktop).

---

### D12 | Alvo de toque: os controles NATIVOS da barrinha (`#play`, tela de BPM) ficam fora do escopo desta correção, e o alvo de 24/44px dentro da demo só é garantido acima do piso de 0,6

Valor: dentro da demo (`.aparelho`), o alvo de toque de um controle (ex.: LED do TONE X) só é
garantido `>= 24px` quando `escala >= 0,6` (rolo `>= 900px`). Abaixo disso (celular), a demo é
vitrine — toque preciso em controle individual dela não é uma promessa desta tela; o produto real
roda no plugin ou, na tela pequena, pelos controles nativos (`#play`, `-`/`+` do BPM), que ficam
**fora** do `transform: scale()` da demo e não encolheram por causa desta correção (medido: 40px
antes e depois, pré-existente e fora deste escopo).

Regra: HIG accessibility, buttons — alvo padrão iOS/iPadOS 44×44pt, **mínimo** 28×28pt
[OBRIGATÓRIO]; "Área de toque maior que o desenho visível"; tradução "`@media (pointer: coarse)`
mantém 44px" — APPLE-DESIGN.md §4.5.

Fonte Apple: HIG Accessibility, *Buttons*; *The Life of a Button* [13:50].

Por quê: a demo é vitrine no celular (ver D13) — ela troca precisão de toque por "mostrar o
aparelho inteiro". Isso só é aceitável porque a ação real (tocar, ouvir, comprar) continua
disponível em controles que não encolheram: o PLAY e o BPM da barrinha abaixo da demo.

Se violar: se os controles nativos da barrinha também encolhessem junto com a demo, o celular
ficaria sem nenhum alvo de toque confiável na primeira tela — aí sim seria uma violação de
§4.5 sem alternativa.

Alternativa descartada: forçar `escala >= 0,6` mesmo com o piso de 0,2 só para os hot-spots
tocáveis da demo (steps, LEDs), redesenhando o layout interno para dois tamanhos. Descartada por
custo/risco: o layout do painel vem 1:1 do plugin (`painel/layout.json`, gerado do C++) — criar um
segundo layout só para celular quebraria a regra "o site nunca manda no painel" (`DESIGN.md` linha
313) e este brief pediu a correção mínima, não um redesenho.

Como verificar: `testes/painel.mjs <url> 390` e `<url> 320` — assert `nativos.playAltura >= 40 &&
nativos.bpmAltura >= 40` (não regrediu); a mesma prova, a `>= 24` na área de toque do LED do TONE
X, roda só como log informativo abaixo de escala 0,6 (não falha o teste — é o trade-off aceito
aqui, registrado nesta ficha).

---

### Correção 1 | `.steps` (painéis Mac/Windows de "Instalação"): grid com track mínimo fixo de 320px

Valor: `grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr))` (era
`minmax(320px,1fr)`).

Antes: `minmax(320px,1fr)` força cada track do grid a nunca ficar menor que 320px, mesmo quando o
container tem menos espaço que isso disponível. Em viewport 320px, com o `.wrap` gastando 16px de
padding de cada lado, a área útil é 288px — mas o grid ainda desenhava uma coluna de 320px, e o
`fieldset.panel.os` (moldura MAC/WINDOWS) ficava com `left:16px` e `right:336px`: 16px para fora da
tela. Medido antes da correção: `document.documentElement.scrollWidth === 336` em viewport de
320px.

Regra: "Respeite a safe area" e o princípio geral de "decidir por espaço disponível, não por
valor fixo" — APPLE-DESIGN.md §4.4.1; é o mesmo princípio de D13, aplicado a CSS Grid em vez de
`transform: scale()`.

Fonte Apple: HIG layout ("Decide based on the space available, not the device").

Por quê: `minmax(320px, 1fr)` é uma armadilha comum de CSS Grid — o valor fixo do minmax vence o
espaço real do container, e o item estoura a página em vez de encolher. `min(320px, 100%)` deixa o
track pedir 320px quando cabe (telas maiores, onde o layout de 2 colunas continua idêntico) e
recuar para 100% do espaço disponível quando não cabe, sem tocar em nenhuma outra largura de
breakpoint.

Se violar: qualquer viewport abaixo de 336px (contando os 16px de padding do `.wrap` de cada lado)
volta a rolar horizontalmente por causa deste único elemento — a razão original do achado no
diagnóstico desta tarefa.

Alternativa descartada: reduzir o padding do `.wrap` em telas muito estreitas, ou aplicar
`overflow-x: hidden` local no `.steps`. Descartada porque não ataca a causa (o grid pedindo mais
espaço do que existe) e esconderia conteúdo em vez de deixá-lo caber.

Como verificar: `document.documentElement.scrollWidth === 320` em viewport 320px (adicionado a
`testes/painel.mjs`); varredura de overflow (item 3 desta tarefa) sem nenhum elemento com
`right > innerWidth` fora de `#aparelho-rolo`.

---

### Correção 2 | `<code>` do caminho `C:\Program Files\Common Files\VST3` (passo 3 da instalação Windows): sem quebra, min-content maior que o painel disponível

Valor: `.os code{white-space:normal;overflow-wrap:anywhere}` (novo seletor, escopado ao painel de
instalação `.os`; o `code{white-space:nowrap}` global continua valendo para os outros usos de
`<code>` do site — nomes de pasta curtos como `Kick`/`Snare`/`Bass`/`Lead`, que não têm por que
quebrar).

Antes: `code{white-space:nowrap}` (regra global, `dd.css` linha 69-71) impede a quebra de qualquer
texto dentro de `<code>`. Com o `fieldset.panel.os` forçado a caber no espaço disponível
(Correção 1), o caminho `C:\Program Files\Common Files\VST3` (232px de conteúdo, medido) passa a
ser o elemento mais largo da lista de passos do Windows e crescia o `min-content` do `<li>`/painel
além do espaço disponível — um segundo overflow, menor (~5px em 296px de largura), que só
apareceria depois de corrigida a Correção 1.

Regra: "Deixe espaço para o texto crescer" e o princípio de não fixar largura em conteúdo textual
variável — APPLE-DESIGN.md §4.4.9 (tradução: o mesmo raciocínio de texto que cresce em outro
idioma vale para um caminho de arquivo comprido que não pode ser abreviado sem virar impreciso).

Fonte Apple: HIG layout / *Writing for interfaces* [18:49] (texto que cresce muda o layout;
o layout tem que aceitar, não travar).

Por quê: o caminho do VST3 é informação técnica exata que o usuário vai copiar visualmente para
achar a pasta no Windows Explorer — abreviar ou truncar destruiria o valor da instrução. A única
opção correta é deixar o texto quebrar dentro do rebaixo, mantendo a fonte e a cor (regra do
sistema: `<code>` é Barlow 600 em rebaixo, `DESIGN.md` linha 520), só sem a restrição de uma linha
só.

Se violar: em qualquer largura abaixo de ~330px de painel disponível, o passo 3 da instalação
Windows estoura a moldura de novo, mesmo com a Correção 1 aplicada.

Alternativa descartada: `overflow-x: auto` no `<code>` (rolagem própria em vez de quebra).
Descartada porque é a mesma armadilha de "esconder em vez de caber" citada na Correção 1, e o
texto é curto o bastante (34 caracteres) para quebrar em 2-3 linhas de forma legível em vez de
pedir rolagem para um trecho de instrução.

Como verificar: nenhum item na varredura de overflow (item 3) aponta o `fieldset.panel.os` do
Windows fora do viewport; screenshot em 320px (`home-320-b4.png`) mostra o caminho quebrado em 2
linhas dentro do rebaixo, sem cortar a moldura.

---

## Resumo de uma linha por ficha

- **D13** — demo escala para caber abaixo de 900px de rolo, piso 0,2 em vez de 0,6 fixo; §4.4.1/3/8.
- **D12** — alvo de toque preciso na demo só garantido acima do piso 0,6; controles nativos (PLAY/BPM) ficam de fora da escala e não regrediram; §4.5.
- **Correção 1** — `.steps` trocou `minmax(320px,1fr)` por `minmax(min(320px,100%),1fr)`, fim do overstretch de 16px em 320px; §4.4.1.
- **Correção 2** — `.os code` ganhou `white-space:normal; overflow-wrap:anywhere` para o caminho do VST3 quebrar em vez de estourar; §4.4.9.
