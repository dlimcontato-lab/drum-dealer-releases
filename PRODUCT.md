# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Site estático de arquivo único (`index.html` com CSS e markup inline), mais `dd-main.js`, `dd-processor.js` (AudioWorklet), `url-shim.js` e o motor `engine.mjs` + `engine.wasm`. Sem framework, sem build step, sem backend. Publicado por GitHub Pages no repo público `dlimcontato-lab/drum-dealer-releases`; a fonte vive em `~/Sistema AI/drum-dealer-site`.

## Users

Produtores de música eletrônica brasileiros trabalhando em casa, no Mac ou no Windows, dentro de Ableton Live ou FL Studio. O público é misto e o iniciante manda: a página precisa convencer o produtor experiente nos primeiros cinco segundos (ele já tem quarenta plugins e só quer saber se vale o slot) e ainda assim levar o iniciante pela mão até o plugin abrir no DAW. Ninguém chega aqui pra ler — chega pra ouvir e baixar.

## Product Purpose

Distribuir gratuitamente o Drum Dealer: uma drum machine com sequencer de 16 steps e gerador de MIDI, em VST3, AU e standalone, para Mac e Windows. Sucesso é o visitante sair com o instalador certo baixado e o plugin tocando dentro do DAW dele — não é tempo de permanência nem inscrição.

## Positioning

A demo da própria página é o motor C++ do plugin compilado para WebAssembly, rodando com os samples de fábrica de verdade. Não é uma maquete em JavaScript imitando o produto: é o produto. Um concorrente não copia essa afirmação sem portar o próprio motor para o navegador. Tudo que o visitante ouve no site é exatamente o que ele vai ouvir depois de instalar.

## Operating Context

- O visitante baixa `.pkg` (macOS) ou `.exe` (Windows) a partir da Release `latest`, com nomes de asset fixos e sem versão.
- Instala, manda o DAW reescanear os plugins, procura "Drum Dealer" nos instrumentos e arrasta para uma track MIDI.
- O instalador já deixa a biblioteca de fábrica pronta; nada a configurar para ter som.
- Para usar sons próprios, o botão SAMPLER dentro do plugin cria a pasta `Vst Dealer` na área de trabalho, com subpastas por instrumento. Os arquivos do usuário entram no sorteio **junto** com os de fábrica, nunca no lugar deles.
- O plugin não é assinado: o macOS mostra "desenvolvedor não identificado" e o Windows dispara o SmartScreen. Contornar esses dois avisos é parte obrigatória do caminho até o primeiro som.

## Capabilities and Constraints

- Sequencer de 16 steps, 6 instrumentos (kick, snare, clap, hat fechado, hat aberto, tom), accent por step, groove straight/swing com amount, mute/solo e ganho por canal, botão RAND que sorteia padrão e samples.
- Sampler com 232 samples de fábrica versionados; troca de sample por instrumento.
- MIDI GEN de bass e lead seguindo o kick, na escala escolhida, com clipe arrastável para o DAW.
- Fills automáticos por instrumento (rate, fase grid/contra, volume), reverb e delay por canal, export de stems separados + master em wav.
- Formatos VST3 e AU. Pro Tools só aceita AAX, então lá o caminho é o app standalone.
- Requisitos: macOS 10.15 ou mais novo (Intel e Apple Silicon, binário universal) e Windows 10/11 64 bits.
- Site sem backend: qualquer captura de dado exige serviço externo.
- **Indefinido:** o produto é gratuito hoje, com a intenção declarada de, em algum momento, pedir e-mail em troca do download. O site não deve prometer "grátis para sempre" nem anunciar cadastro antes de ele existir.

## Brand Commitments

- Nome do produto: **Drum Dealer**. Designação de hardware: **Rhythm Composer DD 001**.
- No DAW do cliente, o fabricante é "Drum Dealer" e o bundle id `com.drumdealer.plugin` — o nome pessoal do autor não aparece dentro do plugin. No site, a assinatura do rodapé é "por Drop Dealer" — o nome pessoal do autor não aparece nem no plugin nem na página.
- Voz: português do Brasil, direta, frases curtas, sem jargão de marketing e sem promessa que o produto não cumpre.
- Referência musical do produto: tech house brasileiro e minimal (Beltran, Ragie Ban, DJ Glen, Michael Bibi, PAWSA).

## Evidence on Hand

- **A demo WASM tocável é a única prova que existe** — e é forte, porque é o motor real.
- Os 232 samples de fábrica e o print da interface do plugin (`drum-dealer-ui.png`, 340 KB) estão no repo.
- **Não existe** e não pode ser inventado: depoimento, nome de usuário, contagem de downloads, avaliação, logo de artista, menção de imprensa, selo de compatibilidade oficial, prêmio ou número de qualquer natureza. Nenhuma faixa de referência pronta feita com o plugin está disponível hoje.

## Product Principles

1. **O som prova, o texto só confirma.** A primeira coisa que o visitante pode fazer na página é ouvir o produto de verdade. Toda outra afirmação vem depois disso.
2. **Ninguém sai preso na instalação.** Os dois avisos de segurança (Gatekeeper e SmartScreen) são tratados de frente, sem eufemismo, porque são o ponto onde o iniciante desiste.
3. **Zero fricção antes do download.** Sem cadastro, sem e-mail, sem escolha de versão: dois botões, o certo para cada sistema.
4. **Nada de prova inventada.** Sem números, sem depoimentos, sem selos. A página só afirma o que o binário entrega.
5. **Soma, não substitui.** É a regra do produto (samples do usuário entram junto com os de fábrica) e vale para a página: ela acrescenta contexto sem esconder o instrumento.

## Accessibility & Inclusion

Sem requisito formal estabelecido. O público usa teclado e mouse em telas grandes e chega bastante pelo celular, onde a demo precisa continuar tocável. Alvos de toque confortáveis, foco visível em tudo que é clicável, contraste legível e respeito a `prefers-reduced-motion` são obrigatórios porque o produto é sonoro e a página é o teste de audição.
