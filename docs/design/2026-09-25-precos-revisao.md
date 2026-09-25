# Seção de preços: revisão e proposta (2026-09-25)

Skill `designer`, modo 2 (Melhorar). Contexto: desde 25/09 só existe uma licença (Solo): mensal R$ 39,90, anual R$ 29,90/mês = R$ 358,80. Pedido do Diogo: "deixar mais atrativa e fácil a venda para o cliente".
Base: `SOIA/referencias/design/apple/APPLE-DESIGN.md` §1, §2.1, §2.12, §4.1, §4.2, §5.1, §6.6, §7.2, §11.5, §12.1.
Protótipo: cópia do site em scratchpad, capturas 1440 e 390 px (antes: `precos-1440.png`; depois: `depois-1440.png`, `depois-390.png`).

## Medições

- Contraste: texto secundário #a39e93 sobre o card #1e1e20 = 6,24:1; branco sobre o card = 16,64:1; texto do botão #0b1a10 sobre #36d476 = 9,27:1. Tudo passa 4.5:1.
- Famílias: 2 (Barlow + a de título). Primárias na seção: 1. Alvos: botão e pílula ≥ 44 px.

O problema não é acabamento. É venda: a seção não diz o que é, não diz o que a pessoa leva e não dá saída para quem ainda está em dúvida ou já comprou.

## Achados e decisões

### A1 (Alto) | Seção sem título: "onde estou" não está respondido
Valor: título "Uma licença, tudo liberado" + legenda "Todos os recursos em qualquer período", no mesmo `.sec-head` das outras seções.
Antes: pílula Mensal/Anual solta logo depois da ficha técnica, sem título.
Regra: toda tela responde onde estou, o que posso fazer, para onde vou | §3.1, §12.1 item 1. Tela de oferta com proposta de valor concisa | §6.6 item 6.
Fonte Apple: Design foundations from idea to interface [01:45]; Designing for Subscription Success [04:39].
Por quê: quem rola até aqui precisa saber, num relance, que chegou no preço e que não existe versão capada.
Se violar: o card parece continuação da ficha técnica, e o visitante que procura "quanto custa" passa direto.
Alternativa descartada: "Preços" (genérico, não diz nada que o card já não diga).
Como verificar: squint test; o título é a primeira coisa lida ao entrar na seção.

### A2 (Alto) | "Solo" num plano único sugere que existem outros
Valor: o card perde o título "Solo"; o botão vira "Comprar licença". O id `solo` continua no banco e na URL.
Antes: título "Solo", botão "Comprar Solo".
Regra: nome pelo que a pessoa entende, não pelo nome interno | §7.3; §5.1 item 5.
Fonte Apple: The Life of a Button [09:48]; Craft clear names.
Por quê: "Solo" só faz sentido em comparação com Studio e Equipe, que saíram.
Se violar: o cliente procura o "outro plano" ou acha que está comprando a versão menor.
Alternativa descartada: "Comprar BRDRUM" (a pessoa compra o direito de uso por um período, não o produto; "licença" é a palavra do contrato e da conta).
Como verificar: nenhum texto da home cita "Solo" (`grep`).

### A3 (Alto) | O card não diz o que a pessoa leva
Valor: lista "O que vem na licença" com o que vende primeiro: batida pronta em um clique e baixo/melodia no tom; 232 samples de fábrica mais os seus; export em stems; VST3 e AU, Mac e Windows, 1 computador por vez; atualizações no período.
Antes: "1 computador ativo por vez", "VST3 e AU, Mac e Windows", "232 samples e todas as atualizações": três linhas de restrição técnica, nenhum benefício.
Regra: proposta de valor concisa na tela de oferta | §6.6 item 6; comece pelo porquê | §7.2 item 3.
Fonte Apple: Designing for Subscription Success [04:39]; Small writing changes [08:33].
Por quê: o produtor experiente decide em cinco segundos se vale o slot (PRODUCT.md). O que ele compra é "batida pronta e baixo no tom", não "1 computador".
Se violar: o preço aparece sem o motivo, e o card responde "quanto" sem responder "por quê".
Alternativa descartada: repetir a ficha técnica inteira (10 linhas; densidade atrasa a decisão, §4.2 item 3).
Como verificar: leitura em voz alta; cada item começa pelo ganho em negrito.

### A4 (Médio) | Linha redundante "R$ 29,90 por computador · 1 computador"
Valor: removida.
Antes: repetia o preço e o "1 computador" da lista.
Regra: corte enchimento e repetição | §7.2 itens 1 e 2.
Fonte Apple: Small writing changes [01:09], [04:52].
Por quê: com um computador, preço por computador = preço. Era resto do comparativo entre 3 planos.
Se violar: três números na mesma área de olho, dois iguais.
Como verificar: um valor em R$ grande, um em R$ pequeno (total do período), nenhum repetido.

### A5 (Médio) | Economia do anual em porcentagem abstrata
Valor: "Economize R$ 120 em relação ao mensal" (verde, só no anual; calculado: 12 × mensal − total anual). O selo "-25%" sai.
Antes: selo "-25%" no canto.
Regra: preços e termos claros num relance | §6.6 item 6; texto que esclarece comportamento | §7.2 item 1.
Fonte Apple: Designing for Subscription Success [04:39].
Por quê: "R$ 120" o cliente converte na hora em algo concreto; "-25%" exige conta, e sem o mensal ao lado nem dá para saber 25% de quê.
Se violar: o anual parece desconto genérico de loja, sem motivo claro para escolher.
Alternativa descartada: manter os dois (dois sinais para a mesma coisa).
Verde aqui: é status de ganho, não decoração; a cor da marca continua só em primária, pílula ativa e esse status (§2.3).
Como verificar: some ao trocar para Mensal; o valor muda sozinho se o preço mudar no banco.

### A6 (Médio) | "/mês" ausente no preço grande
Valor: "/mês" junto do número, em cinza. Linha de baixo: "R$ 358,80 cobrado uma vez, vale 12 meses" (anual) ou "Cobrado uma vez, vale 1 mês" (mensal).
Antes: "por mês" só na linha pequena de baixo.
Regra: preço e termo num relance | §6.6 item 6.
Por quê: R$ 29,90 sozinho pode ser lido como o preço total.
Se violar: o cliente chega no checkout, vê R$ 358,80 e desiste por surpresa.
Como verificar: a unidade está a menos de 20 px do número.

### A7 (Médio) | Termos longe do botão
Valor: logo abaixo do botão, "Pix, cartão ou boleto · sem renovação automática".
Antes: "sem renovação automática" só no rodapé da página, na faixa final.
Regra: termos visíveis na tela de compra | §6.6 item 6, §11.5.
Por quê: quem hesita em comprar online hesita por medo de cobrança recorrente. A resposta tem que estar colada no botão.
Se violar: o cliente sai para procurar a regra de cobrança e não volta.
Como verificar: a frase está no mesmo bloco do botão, em 390 e em 1440 px.

### A8 (Médio) | Sem saída para quem está em dúvida ou já comprou
Valor: "Ainda na dúvida? Toque a demo: é o mesmo motor do plugin. Já comprou? Entrar na conta".
Antes: nada.
Regra: experimentar antes de pagar; login para quem já comprou | §6.6 itens 6 e 8, §11.5.
Fonte Apple: Designing for Subscription Success [04:39], [06:11].
Por quê: a demo da página é o teste grátis do BRDRUM (PRODUCT.md, Positioning). E quem já comprou não deve cair no fluxo de compra.
Se violar: quem tem dúvida sai da página; quem já comprou clica em "Comprar" e se perde no cadastro.
Como verificar: "Toque a demo" rola até `#demo`; "Entrar na conta" abre `conta.html`.

### A9 (Médio) | Controle longe do que afeta, lateral vazia no desktop
Valor: a pílula Mensal/Anual entra no card, acima do preço. No desktop (≥ 860 px) o card vira duas colunas: compra à esquerda, "O que vem na licença" à direita. No celular, uma coluna na mesma ordem.
Antes: pílula fora do card; card de 440 px isolado no meio de 1080 px.
Regra: controle perto do que afeta | §4.1 item 6; adaptar do celular ao desktop sem mudar função | §4.4.
Fonte Apple: Essential Design Principles [35:38].
Por quê: trocar o período muda o número logo abaixo. No desktop, preço e motivo ficam lado a lado, e a decisão cabe numa tela sem rolar.
Se violar: no desktop a pessoa rola para ler o que leva e perde o preço de vista.
Como verificar: em 1440 px, o card inteiro cabe acima da dobra depois do título.

## Detector 2.12 e checklist 12.1

- Detector: nenhum item marcado (sem card dentro de card, sem vidro, sem "premium", uma primária, sem emoji).
- 12.1: 1 passa (com A1), 2 passa (preço é a âncora), 3 passa, 4 passa, 5 passa (divisor fino, não card aninhado), 6 passa (medido), 7 passa, 8 n/a, 9 passa, 10 n/a (seção estática; carregamento usa o fallback PLANOS_PADRAO), 11 passa, 12 passa (economia tem texto), 13 a conferir no código final, 14 site só escuro por decisão de identidade, 15 n/a, 16 n/a, 17 passa (links e pílula são botões/âncoras), 18 passa (preço real do banco), 19 n/a, 20 passa.

## Para implementar (depois do OK)

- `index.html` #precos, `dd.css` (bloco `.plan2.oferta`), `dd-precos.js` (economia em R$; `.per-seat`/`.seats-n` opcionais), `dd-i18n.js` (chaves PT e EN novas), bump do `?v=`.
- Testes: `testes/precos.mjs` (off% vira linha de economia; sem título "Solo").

# Conta › Licença (pedido do Diogo: "ter a imagem do vst na hora da pessoa clicar para pagar")

Capturas: `4-CONTA-ANTES.png`, `5-CONTA-DEPOIS-desktop.png`, `6-CONTA-DEPOIS-celular.png` (conta temporária, apagada depois).

### C1 (Alto) | Sem o produto na hora de pagar
Valor: imagem do painel real do BRDRUM (capturada da demo do site, com baixo e melodia gerados, sem e-mail nem aviso de demo), 1200 px, webp 73 KB com jpg de reserva, à esquerda no desktop e no topo no celular. Legenda: "O que você destrava: o plugin inteiro, no Mac e no Windows, dentro do seu DAW".
Regra: valor antes de compromisso; resumo antes do compromisso | §1.2 item 8, §6.6 item 9. A marca vive na camada de conteúdo | §2.1.
Fonte Apple: Iterative UI Design [36:15]; Communicate your brand identity on iOS [02:43].
Por quê: no último clique a pessoa precisa ver o que está comprando, não só um número.
Se violar: o pagamento parece cobrança de serviço abstrato; aumenta a desistência no último passo.
Alternativa descartada: `img/daw-e-vst.png` (print real no Ableton, mas mostra o e-mail do Diogo na barra de licença).
Como verificar: a imagem não tem dado pessoal; `alt` descreve o painel.

### C2 (Alto) | Escolher entre uma opção só
Valor: com um plano ativo e sem licença perpétua, o plano já vem selecionado e o botão "Pagar R$ …" aparece direto.
Antes: botão "SOLO · 1 COMPUTADOR" que precisava ser clicado para o Pagar aparecer.
Regra: menos cliques | §6.6 item 5 (3 cliques 61%, 4 cliques 48%).
Fonte Apple: Designing for Subscription Success [03:39].
Se violar: um clique a mais sem decisão nenhuma; parte das pessoas para ali.

### C3 (Alto) | Botão do plano vaza do card no celular (390 px)
Valor: some junto com C2.
Se violar: texto cortado ("UMA VEZ") e borda fora do card.

### C4 (Médio) | Cupom no caminho do pagamento
Valor: "Tenho um cupom" recolhido abaixo do Pagar (alvo de 44 px).
Regra: divulgação progressiva, 80/20 | §4.2 itens 1 e 4.
Por quê: campo aberto de cupom faz quem não tem cupom sair para procurar um.

### C5 (Médio) | Laranja em três lugares
Valor: preço em branco; laranja só no botão Pagar.
Regra: "When every element is tinted, nothing stands out" | §2.12, §5.1 item 3.
Fonte Apple: Meet Liquid Glass [17:21].

### C6 (Médio) | Texto repetido e legenda com nome interno
Valor: painel da licença: "Compre logo abaixo. A licença aparece aqui assim que o Mercado Pago confirmar." Termos uma vez só, abaixo do botão. Legenda do preço: "R$ 29,90/mês · 12 meses, pago uma vez" (anual) ou "1 mês, pago uma vez"; sai "Solo".
Regra: corte repetição | §7.2 item 2.

# Cor única nas duas telas de compra (pedido do Diogo: "as 2 tem que seguir o mesmo design de cor")

### K1 (Alto) | A mesma ação com duas cores
Valor: laranja (`--orange` #e0702a, tecla `key orange`) só no botão que compra ou paga, nas duas telas ("Comprar licença" na home, inclusive no fecho da página; "Pagar R$ …" na conta). Verde LED (#36d476) só para valor escolhido e ganho: a pílula Mensal/Anual e a linha "Economize R$ 120 em relação ao mensal", nas duas. Preço em branco nas duas.
Antes: home com "Comprar Solo" verde; conta com "Pagar" laranja e preço laranja.
Regra: uma cor, um significado; accent em um único controle por tela | APPLE-DESIGN.md §2.5 itens 7 e 8; §2.3 item 4. E a Regra do Painel do próprio `DESIGN.md` do site: "laranja é a ação primária de cada bloco"; "verde é valor".
Fonte Apple: HIG color; Meet Liquid Glass [17:21].
Por quê: o cliente aprende na home que o botão laranja é o que compra, e reconhece o mesmo botão na hora de pagar.
Se violar: na conta, o verde da home vira "outra coisa"; o olho procura o botão de compra em vez de reconhecer.
Alternativa descartada: tudo verde (contradiz o DESIGN.md, em que verde é valor e foco de teclado; um botão verde de pagar competiria com o anel de foco).
Como verificar: contraste do texto claro sobre o laranja da tecla medido na implementação; nenhum outro controle laranja nas duas seções de compra.

- Contraste medido: serigrafia #e9e6de sobre laranja #e0702a = 2,58:1 (reprova 3:1 de texto em negrito); tinta #0e0e10 sobre laranja = 5,99:1. Botões de compra passam a usar tinta. As outras teclas laranja do site (PLAY, RAND, Entrar) têm o mesmo defeito: fica anotado, fora deste bloco.
