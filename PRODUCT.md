# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Site estático de duas páginas (`index.html` e `conta.html`) com uma folha de estilo compartilhada (`dd.css`), mais `dd-main.js`, `dd-processor.js` (AudioWorklet), `url-shim.js` e o motor `engine.mjs` + `engine.wasm`. `dd-api.js` é o cliente mínimo (sem SDK) do backend de licenças; `dd-precos.js` lê os preços da tabela `plans`; `conta.js` é a página da conta. Sem framework, sem build step. Backend: projeto Supabase `bwzngjvjxrqbalvoadpu` (auth por e-mail e senha, tabelas de licença e Edge Functions) e checkout pelo Mercado Pago; contrato em `~/Sistema AI/drum-dealer-backend/API.md`. Publicado por GitHub Pages no repo público `dlimcontato-lab/drum-dealer-releases`; a fonte vive em `~/Sistema AI/drum-dealer-site`.

## Users

Produtores de música eletrônica brasileiros trabalhando em casa, no Mac ou no Windows, dentro de Ableton Live ou FL Studio. O público é misto e o iniciante manda: a página precisa convencer o produtor experiente nos primeiros cinco segundos (ele já tem quarenta plugins e só quer saber se vale o slot) e ainda assim levar o iniciante pela mão até o plugin abrir no DAW. Ninguém chega aqui pra ler — chega pra ouvir e baixar.

## Product Purpose

Vender o Drum Dealer: uma drum machine com sequencer de 16 steps e gerador de MIDI, em VST3, AU e standalone, para Mac e Windows. Licença por conta, pagamento único, em três planos por número de computadores ativos (1, 3 ou 5 acessos; o de 3 é o que a página empurra). Sucesso é o visitante comprar, baixar o instalador certo e destravar o plugin dentro do DAW entrando com a conta — não é tempo de permanência.

## Positioning

A demo da própria página é o motor C++ do plugin compilado para WebAssembly, rodando com os samples de fábrica de verdade. Não é uma maquete em JavaScript imitando o produto: é o produto. Um concorrente não copia essa afirmação sem portar o próprio motor para o navegador. Tudo que o visitante ouve no site é exatamente o que ele vai ouvir depois de instalar.

## Operating Context

- O visitante compra na página da conta (`conta.html`): cria conta com e-mail e senha, escolhe o plano, paga no Mercado Pago (Pix, cartão, boleto) e volta; a licença cai na conta quando o webhook confirma.
- O download é público: baixa `.pkg` (macOS) ou `.exe` (Windows) a partir da Release `latest`, com nomes de asset fixos e sem versão. Sem licença o plugin abre trancado (silêncio + painel de ativação).
- Dentro do plugin ele entra com a mesma conta; cada computador ocupa um acesso. Licença cheia = o plugin lista as máquinas e deixa desativar uma. A página da conta também lista e desativa.
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
- O produto é pago desde 2026-09-09. Preços são placeholder (R$ 97 / 147 / 247) até o Diogo fixar; vivem na tabela `plans` e o site lê de lá, nunca hardcoded como verdade.
- O site não promete reembolso, suporte por e-mail nem prazo: nada disso foi definido.

## Brand Commitments

- Nome do produto: **BRDRUM** (decisão do Diogo em 2026-09-09; no painel e no site). O plugin foi renomeado no mesmo dia: no DAW e no instalador também é BRDRUM (assets `BRDRUM-macOS.pkg` e `BRDRUM-Windows-Setup.exe`). Designação de hardware: **Rhythm Composer - 001**.
- No DAW do cliente, o fabricante é "Drum Dealer" e o bundle id `com.drumdealer.plugin` — o nome pessoal do autor não aparece dentro do plugin. No site, a assinatura do rodapé é "por Drop Dealer" — o nome pessoal do autor não aparece nem no plugin nem na página.
- Voz: português do Brasil, direta, frases curtas, sem jargão de marketing e sem promessa que o produto não cumpre. **Sem jargão técnico na primeira dobra e nos blocos de features** (Diogo, 2026-09-09: "tenho medo do cliente não entender"): bumbo/caixa/chimbal em vez de kick/snare/hat, "programa de música" junto de DAW, benefício antes do termo.
- Frase de abertura escolhida por ele: "Sua bateria e baixo em 1 clique!" + "Milhares de possibilidades com seus samples e MIDIs, além dos pacotes". O produto NÃO se apresenta como referência à 808 (o slogan "A 808 de verdade" foi retirado).
- Referência musical do produto: tech house brasileiro e minimal (Beltran, Ragie Ban, DJ Glen, Michael Bibi, PAWSA).

## Evidence on Hand

- **A demo WASM tocável é a única prova que existe** — e é forte, porque é o motor real.
- Os 232 samples de fábrica e o print da interface do plugin (`drum-dealer-ui.png`, 340 KB) estão no repo.
- **Não existe** e não pode ser inventado: depoimento, nome de usuário, contagem de downloads, avaliação, logo de artista, menção de imprensa, selo de compatibilidade oficial, prêmio ou número de qualquer natureza. Nenhuma faixa de referência pronta feita com o plugin está disponível hoje.

## Product Principles

1. **O som prova, o texto só confirma.** A primeira coisa que o visitante pode fazer na página é ouvir o produto de verdade. Toda outra afirmação vem depois disso.
2. **Ninguém sai preso na instalação.** Os dois avisos de segurança (Gatekeeper e SmartScreen) são tratados de frente, sem eufemismo, porque são o ponto onde o iniciante desiste.
3. **Fricção só onde o dinheiro entra.** Download sem cadastro, dois botões, o certo para cada sistema. Conta e senha aparecem uma vez, na compra, e são as mesmas que destravam o plugin.
4. **Nada de prova inventada.** Sem números, sem depoimentos, sem selos. A página só afirma o que o binário entrega.
5. **Soma, não substitui.** É a regra do produto (samples do usuário entram junto com os de fábrica) e vale para a página: ela acrescenta contexto sem esconder o instrumento.

## Accessibility & Inclusion

Sem requisito formal estabelecido. O público usa teclado e mouse em telas grandes e chega bastante pelo celular, onde a demo precisa continuar tocável. Alvos de toque confortáveis, foco visível em tudo que é clicável, contraste legível e respeito a `prefers-reduced-motion` são obrigatórios porque o produto é sonoro e a página é o teste de audição.
