// Dicionário PT/EN do site (não do VST: o plugin continua em português) e o motor de troca de
// idioma. Chaves estáveis em inglês-kebab. Marcação no HTML: data-i18n="chave" (textContent),
// data-i18n-html="chave" (innerHTML, só quando o texto tem <b>/<a>/<br> embutido) e
// data-i18n-attr="attr:chave;attr2:chave2" (atributos: alt, title, aria-label, placeholder...).
// Texto gerado por JS chama t('chave', {vars}).
const STORAGE_KEY = 'dd-lang';

// ---------------------------------------------------------------------------------------------
export const DICT = {
  pt: {
    'brand.wordmark-html': '<img src="img/brdrum-logo-oficial.png" alt="BRDRUM Rhythm Composer - 001">',
    'daw.ableton': 'Ableton Live',
    'daw.fl-studio': 'FL Studio',
    'daw.logic': 'Logic Pro',
    'daw.cubase': 'Cubase',
    'daw.studio-one': 'Studio One',
    'daw.bitwig': 'Bitwig Studio',
    'daw.garageband': 'GarageBand',
    'lang.pt': 'PT',
    'lang.en': 'EN',
    'lang.switch-aria': 'Idioma do site',
    'lang.pt-aria': 'Ver o site em português',
    'lang.en-aria': 'Ver o site em inglês',

    // ---------- <head> (index.html) ----------
    'head.title': 'BRDRUM — Rhythm Composer - 001',
    'head.description': 'BRDRUM: sua bateria e baixo em 1 clique. Plugin para Mac e Windows (VST3 e AU). Toque aqui no navegador antes de comprar.',
    'head.og-description': 'Sua bateria e baixo em 1 clique. Plugin para Mac e Windows; a demo da página é o motor real do plugin rodando no navegador.',
    'head.og-image-alt': 'O painel do BRDRUM em aço grafite: a marca BRDRUM Rhythm Composer - 001, a faixa listrada, as teclas TONE X e RAND, a grade de 16 passos em vermelho, laranja, amarelo e creme, o medidor de GAIN e a telinha com o Pal.',
    'head.twitter-description': 'Sua bateria e baixo em 1 clique. Toque antes de comprar.',
    'head.twitter-image-alt': 'O painel do BRDRUM: a grade de 16 passos colorida e a telinha com o Pal.',

    // ---------- <head> (packs.html) ----------
    'packs.head-title': 'Sample Packs — BRDRUM',
    'packs.head-description': 'Sample packs do BRDRUM: bateria e MIDI prontos para o seu set. Exclusivos para quem tem um plano do BRDRUM.',

    // ---------- <head> (conta.html) ----------
    'conta.head-title': 'Conta — BRDRUM',
    'conta.head-description': 'Entre na sua conta do BRDRUM: licença, chaves de ativação, computadores, sample packs e pedidos.',

    // ---------- topo / navegação (todas as páginas) ----------
    'nav.aria': 'Seções',
    'nav.precos': 'Preços',
    'nav.packs': 'Sample Packs',
    'nav.download': 'Download',
    'nav.instalacao': 'Instalação',
    'nav.conta': 'Conta',
    'nav.entrar': 'Entrar',
    'nav.admin': 'Admin',

    // ---------- hero / vídeo / demo tocável ----------
    'hero.aparelho-aria': 'Painel do BRDRUM, tocável',
    'hero.video-aria': 'Apresentação do BRDRUM',
    'hero.sound-label': 'Som',
    'hero.sound-on-aria': 'Ligar o som do vídeo',
    'hero.sound-off-aria': 'Desligar o som do vídeo',
    'hero.play-text': 'Tocar',
    'hero.pause-text': 'Pausar',
    'hero.play-aria': 'Tocar vídeo',
    'hero.pause-aria': 'Pausar vídeo',
    'hero.note-1': 'Motor C++ do plugin em WebAssembly · samples de fábrica · não é vídeo, é o instrumento',
    'hero.note-2': 'Arraste os knobs · duplo clique volta ao padrão · clique no nome do instrumento pra trocar o som',
    'transporte.aria': 'Transporte da demo',
    'transporte.play-title': 'Tocar / pausar (Espaço, depois de clicar no aparelho)',
    'transporte.bpm-down': 'Diminuir BPM',
    'transporte.bpm-up': 'Aumentar BPM',
    'transporte.dl-bass': 'Baixar bass .mid',
    'transporte.dl-lead': 'Baixar lead .mid',
    'common.carregando': 'Carregando…',

    // ---------- compatibilidade (DAWs) ----------
    'compat.title-html': '<b>compatível</b> com todas as DAWs',
    'compat.aria': 'DAWs compatíveis',
    'compat.title-small-html': '<b>compatível</b> com todas as DAWs',

    // ---------- afirmação / statement ----------
    'statement.h1-html': 'Sua <b class="c-cream">bateria</b><br>e <b class="c-orange">baixo</b> em<br><b class="c-yellow">1 clique</b>',
    'statement.lead': 'Milhares de possibilidades com os seus samples e MIDIs, além dos pacotes que já vêm dentro. Aperta RAND e sai uma batida pronta; aperta BASS e ele sorteia um baixo da sua pasta de MIDIs, no tom certo.',

    // ---------- tabela de especificações ----------
    'spec.formatos-th': 'Formatos',
    'spec.formatos-td': 'VST3 · AU',
    'spec.sistemas-th': 'Sistemas',
    'spec.sistemas-td': 'macOS 10.15+ · Windows 10/11',
    'spec.bateria-th': 'Bateria',
    'spec.bateria-td': '6 instrumentos · 16 passos · batida pronta em 1 clique',
    'spec.sons-th': 'Sons',
    'spec.sons-td': '232 de fábrica + os seus',
    'spec.baixo-th': 'Baixo e melodia',
    'spec.baixo-td': 'sorteia um dos MIDIs da sua pasta, no tom da batida · arrasta pro DAW',
    'spec.viradas-th': 'Viradas',
    'spec.viradas-td': '11 velocidades, de 1/16 a 2 compassos, com contratempo',
    'spec.afinacao-th': 'Afinação',
    'spec.afinacao-td': 'TONE X: até 20x mais agudo ou grave, por instrumento',
    'spec.masterfx-th': 'Master FX',
    'spec.masterfx-td': 'saturação com 8 tipos, compressor de três faixas com preset OTT e echo',
    'spec.export-th': 'Export',
    'spec.export-td': 'um wav por instrumento (bumbo, caixa, palma, chimbais, tom) + um wav só dos efeitos (reverb e delay) + o mix completo',
    'spec.licenca-th': 'Licença',
    'spec.licenca-td': 'por conta · 1, 3 ou 5 computadores',

    // ---------- download ----------
    // download.title/legend/step1-3/manual-* ficaram sem uso na home 23/09 (a seção #download
    // "Baixe o instalador" saiu pelo bloco novo "DAW + download" + a tecla TUTORIAL); mantidas
    // porque nada é apagado do i18n sem precisar.
    'download.daw-shot-alt': 'O BRDRUM aberto no Ableton Live, com o gerador de MIDI de bass e lead e os clipes de áudio ao lado',
    'download.title': 'Baixe o instalador',
    'download.legend': 'VST3 · AU · precisa de conta',
    'download.mac-cta': 'Baixar para Mac',
    'download.mac-sub': '.pkg · Intel e Apple Silicon · macOS 10.15+',
    'download.win-cta': 'Baixar para Windows',
    'download.win-sub': '.exe · Windows 10/11, 64 bits',
    'download.manual-label': 'Manual do BRDRUM',
    'download.manual-pt': 'Português',
    'download.manual-en': 'English',
    'download.step1-legend': '1 · Crie a conta e instale',
    'download.step1-text-html': 'O download pede uma conta (é a mesma que destrava o plugin). O instalador já deixa o VST3, o AU (Mac) e os <b>232 samples de fábrica</b> no lugar. Nada pra configurar.',
    'download.step2-legend': '2 · Entre',
    'download.step2-text-html': 'Abra o BRDRUM no seu programa de música e entre com o <b>e-mail e a senha da sua conta</b>. É a mesma conta que fez a compra.',
    'download.step3-legend': '3 · Toque',
    'download.step3-text': 'Com o pagamento confirmado, a máquina destrava na hora. Sem chave pra copiar, sem arquivo pra guardar: a licença mora na conta. Sem pagar, o plugin abre mas fica em silêncio.',

    // ---------- planos ----------
    'plans.solo-name': 'Solo',
    'plans.solo-li1': '1 computador ativo por vez',
    'plans.solo-li2': 'VST3 e AU, Mac e Windows',
    'plans.solo-li3': '232 samples de fábrica e todas as atualizações',
    'plans.solo-cta': 'Comprar Solo',
    'plans.studio-name': 'Studio',
    'plans.studio-ribbon': 'Recomendado',
    'plans.studio-li1-html': '<b>3 computadores</b> ativos ao mesmo tempo: estúdio, notebook e a máquina do parceiro',
    'plans.studio-li2-html': '<b>15% de desconto</b> por computador em relação ao Solo',
    'plans.studio-li3': 'Troque de máquina quando quiser, direto no plugin',
    'plans.studio-cta': 'Comprar Studio',
    'plans.team-name': 'Equipe',
    'plans.team-li1': '5 computadores ativos ao mesmo tempo',
    'plans.team-li2': 'Para produtora, dupla ou coletivo com várias máquinas',
    'plans.team-li3-html': '<b>20% de desconto</b> por computador em relação ao Solo',
    'plans.team-cta': 'Comprar Equipe',
    'plans.note-html': 'Pagamento único, sem mensalidade. Pix, cartão ou boleto pelo <b>Mercado Pago</b>.\n    A licença fica na sua conta: você entra com e-mail e senha dentro do plugin, e cada computador que\n    entra ocupa um acesso. Precisa trocar de máquina? Desativa a antiga no próprio plugin ou na\n    <a href="conta.html">página da conta</a>.',
    'plans.per-computador': 'por computador',
    'plans.seat-one': '{n} acesso',
    'plans.seat-other': '{n} acessos',
    'common.seat-word-one': 'acesso',
    'common.seat-word-other': 'acessos',
    'plans.seu-plano': 'Seu plano',
    'plans.menor-que-seu': 'Menor que o seu plano',
    'plans.fazer-upgrade': 'Fazer upgrade',
    'plans.fazer-upgrade-valor': 'Fazer upgrade · {valor}',

    // ---------- review ----------
    'review.title': 'Review',
    'review.legend': 'Produtores usando o BRDRUM',

    // ---------- o que tem dentro ----------
    'feats.title': 'O que tem dentro',
    'feats.legend': '232 samples de fábrica',
    'feats.batida-legend': 'Batida pronta',
    'feats.batida-text-html': '<b>Aperta RAND e sai um groove completo</b>: bumbo, caixa, palma, chimbais e tom, já com os\n         sons escolhidos. Gostou, mantém. Não gostou, aperta de novo. Quer mexer? Cada tecla\n         colorida liga ou desliga uma batida.',
    'feats.batida-tag': '1 clique',
    'feats.sons-legend': 'Seus sons',
    'feats.sons-text-html': 'Vem com <b>232 sons de bateria</b> prontos. Quer usar os seus? Joga os arquivos numa pasta\n         e eles entram no sorteio junto com os que já vêm. Milhares de combinações.',
    'feats.sons-tag': '232 sons',
    'feats.baixo-legend': 'Baixo e melodia',
    'feats.baixo-text-html': 'Com um clique ele <b>sorteia um dos MIDIs da sua pasta</b> de Bass ou Lead (ou dos pacotes\n         que já vêm dentro), passa pro tom que você escolher e entrega o clipe pronto pra arrastar\n         pro seu programa de música.',
    'feats.baixo-tag': 'arrasta pro DAW',
    'feats.efeitos-legend': 'Efeitos e export',
    'feats.efeitos-text-html': '<b>Cada instrumento tem seu envio de reverb e delay</b> (REV e DEL). E o <b>EXPORT grava cada instrumento num\n         wav separado</b> (bumbo, caixa, palma, chimbais e tom), <b>mais um wav só com os efeitos</b> e\n         o mix completo, pra você mixar do seu jeito no programa de música.',
    'feats.efeitos-tag': 'wav separado',
    'feats.ott-legend': 'Acabamento com OTT',
    'feats.ott-text-html': '<b>Saturação com 8 tipos de som, compressor de três faixas e echo</b> no final. Escolhe o\n         <b>preset OTT</b> e a batida fica mais cheia e colada. Quer ajustar? O EDIT abre cada detalhe.',
    'feats.ott-tag': 'preset OTT pronto',
    'feats.viradas-legend': 'Viradas de DJ',
    'feats.viradas-text-html': '<b>A virada entra no tempo da música</b>, com as marcações dos mixers de DJ: de 1/16 até 2\n         compassos, e também no contratempo. Você escolhe o instrumento, a velocidade e o volume.',
    'feats.viradas-tag': '11 velocidades',
    'feats.tonex-legend': 'TONE X por instrumento',
    'feats.tonex-text-html': 'Liga o <b>TONE X</b> e o TONE de cada instrumento vai <b>até 20 vezes mais agudo ou mais\n         grave</b>. A luzinha de cada linha escolhe quais instrumentos entram.',
    'feats.tonex-tag': 'até 20x',
    'feats.pal-legend': 'Um parceiro na tela',
    'feats.pal-text-html': '<b>O Pal mora na telinha do BRDRUM</b> e reage ao que você faz: segue o mouse, sorri quando\n         você clica, dança quando a música toca, fica triste se você corta o volume e cochila se você\n         passa um minuto sem mexer.',
    'feats.pal-tag': 'dança no play',

    // ---------- instalação ----------
    'install.title': 'Do download ao primeiro som',
    'install.legend': 'Quatro passos',
    'install.mac-legend': 'Mac',
    'install.mac-h3': 'macOS 10.15 ou mais novo',
    'install.mac-li1-html': 'Crie sua conta e baixe o <b>BRDRUM-macOS.pkg</b> no botão acima.',
    'install.mac-li2': 'Dê dois cliques no .pkg e siga o instalador (avançar, avançar, instalar).',
    'install.mac-li3': 'Abra seu DAW e mande escanear os plugins de novo.',
    'install.mac-li4-html': 'Procure <b>BRDRUM</b> nos instrumentos, arraste pra uma track MIDI e entre com sua conta.',
    'install.mac-warn-html': 'Se o macOS bloquear o .pkg ("não foi possível verificar" ou "desenvolvedor não identificado"):\n        feche o aviso, abra <b>Ajustes do Sistema › Privacidade e Segurança</b>, role até o fim e clique em\n        <b>Abrir Mesmo Assim</b>. Confirme com a sua senha e o instalador abre. Vale para o macOS 13, 14 e 15.\n        Em macOS mais antigo também dá para abrir o .pkg com <b>botão direito › Abrir</b>.',
    'install.win-legend': 'Windows',
    'install.win-h3': 'Windows 10 e 11, 64 bits',
    'install.win-li1-html': 'Crie sua conta e baixe o <b>BRDRUM-Windows-Setup.exe</b> no botão acima.',
    'install.win-li2-html': 'Execute e siga o instalador. Se o SmartScreen avisar, clique em <b>Mais informações → Executar assim mesmo</b>.',
    'install.win-li3-html': 'Abra seu DAW e mande escanear os plugins (o VST3 vai pra pasta padrão <code>C:\\Program Files\\Common Files\\VST3</code>).',
    'install.win-li4-html': 'Procure <b>BRDRUM</b> nos instrumentos, arraste pra uma track MIDI e entre com sua conta.',
    'install.win-warn-html': 'No FL Studio: Options → Manage plugins → Find more plugins.\n        No Ableton: Preferences → Plug-Ins → Rescan.',

    // ---------- tutorial (23/09: baixa manual/BRDRUM-Manual-PT-EN.zip, PT e EN no mesmo arquivo) ----------
    'tutorial.cta': 'TUTORIAL',
    'tutorial.aria': 'Baixar o manual do BRDRUM em PDF, português e inglês',

    // ---------- samples ----------
    'samples.title': 'Seus próprios samples entram junto',
    'samples.legend': 'Soma, não substitui',
    'samples.panel-legend': 'Sampler',
    'samples.p1': 'O instalador já deixa a biblioteca de fábrica pronta. Não precisa configurar nada.',
    'samples.p2-html': 'Aperte <b>SAMPLER</b> dentro do plugin: abre a pasta <b>BRDRUM</b> com os samples, nas\n      subpastas <code>Kick</code>, <code>Snare</code>, <code>Clap</code>, <code>Hat</code> e\n      <code>Tom</code>. Jogue seus wavs lá e eles entram no sorteio <b>junto</b> com os de fábrica.\n      O mesmo vale pros MIDIs do gerador, nas pastas <code>Bass</code> e <code>Lead</code>.',

    // ---------- fecho ----------
    'close.buy-cta': 'Comprar Studio',
    'close.legend': 'Pagamento único, sem mensalidade. Pix, cartão ou boleto pelo Mercado Pago. A licença fica na sua conta.',
    'close.compat-title-html': '<b>compatível</b> com todas as DAWs',

    // ---------- rodapé ----------
    'footer.horario-html': 'Horário de atendimento:<br>de segunda a sábado, das 9h às 18h30',
    'footer.ajuda': 'Central de ajuda',
    'footer.institucional-title': 'Institucional',
    'footer.planos-link': 'Planos',
    'footer.packs-link': 'Sample Packs',
    'footer.instalacao-link': 'Instalação',
    'footer.suporte-title': 'Suporte',
    'footer.conta-link': 'Minha conta',
    'footer.download-link': 'Download',
    'footer.pay-pix': 'Pix',
    'footer.pay-cartao': 'Cartão',
    'footer.pay-boleto': 'Boleto',
    'footer.pay-mp': 'Mercado Pago',
    'footer.signature': 'BRDRUM · Rhythm Composer - 001 · criado por Brazilian Waves',
    'footer.chat-aria': 'Falar com a gente',
    'footer.payment-only': 'Pagamento único pelo Mercado Pago',

    // ---------- packs.html ----------
    // desligado 23/09 a pedido do Diogo: aviso estático no topo da página, sem link nenhum do site
    // apontando mais pra cá (nav e rodapé sem o item, aba "Meus packs" oculta na conta)
    'packs.desligado-titulo': 'A loja de packs volta em breve',
    'packs.desligado-voltar': 'Voltar para a home',
    'packs.title': 'Sample Packs',
    'packs.status-loading': 'Carregando…',
    'packs.det-legend-default': 'Pack',
    'packs.det-previa': 'Tocar prévia',
    'packs.det-fechar': 'Fechar',
    'packs.cupom-label': 'Cupom (opcional)',
    'packs.cupom-placeholder': 'tem um cupom? digite aqui',
    'packs.cupom-aplicar': 'Aplicar',
    'packs.det-comprar': 'Comprar',
    'packs.vazio-title': 'Os primeiros packs chegam em breve',
    'packs.vazio-text': 'Bateria e MIDI feitos para o BRDRUM, prontos pra jogar no sequencer. Quando o primeiro sair, ele aparece aqui.',
    'packs.vazio-cta': 'Ver os planos do BRDRUM',
    'packs.nota': 'Os sample packs são exclusivos para quem tem um plano do BRDRUM.\n    Com o plano ativo, o pack é pagamento único e fica na sua conta pra baixar quando quiser.',
    'packs.status-row': 'acessos',
    'packs.status-entre': 'Entre para comprar',
    'packs.status-ativo': 'Plano ativo · pode comprar packs',
    'packs.status-sem-plano': 'Sem plano · packs são para assinantes',
    'packs.status-erro': 'Não consegui carregar',
    'packs.aviso-exclusivo-html': 'Os sample packs são exclusivos para quem tem um plano do BRDRUM. <a href="index.html#precos">Ver os planos</a>.',
    'packs.na-conta-baixar': 'Na sua conta · Baixar',
    'packs.exclusivo-assinantes': 'Exclusivo para assinantes do BRDRUM · Ver planos',
    'packs.comprar-valor': 'Comprar · {valor}',
    'packs.preparando': 'Preparando…',
    'packs.download-comecou': 'O download começou. O link vale 10 minutos.',
    'packs.tocar-previa-de': 'Tocar prévia de {titulo}',
    'packs.pack-fallback': 'Pack',
    'packs.por-artista': 'por {artista}',
    'packs.tipo-label': 'Tipo',
    'packs.conteudo-label': 'Conteúdo',
    'packs.arquivo-label': 'Arquivo',
    'packs.ja-e-seu': 'Este pack já é seu: baixe pela aba "Meus packs" da conta.',
    'packs.baixar-agora': 'Baixar agora',
    'packs.exclusivo-veja-planos-html': 'Os sample packs são exclusivos para quem tem um plano do BRDRUM. <b>Veja os planos</b> para liberar a compra.',
    'packs.cupom-aplicado-tag': 'cupom aplicado',
    'packs.promocao-tag': 'promoção',
    'packs.conferindo-cupom': 'Conferindo o cupom…',
    'packs.cupom-aplicado': 'Cupom aplicado.',
    'packs.cupom-sem-efeito': 'Esse cupom não muda o valor deste pack.',
    'packs.abrindo-pagamento': 'Abrindo o pagamento…',
    'packs.pack-liberado': 'Pack liberado na sua conta.',
    'packs.plan-required': 'Os sample packs são exclusivos para quem tem um plano do BRDRUM.',
    'packs.mp-not-configured': 'O pagamento online ainda não está ligado. Fale com a gente informando o e-mail da sua conta.',
    'packs.already-owned': 'Este pack já é seu: baixe pela sua conta.',
    'packs.chip-seu': 'seu',

    // ---------- conta.html (estático) ----------
    'conta.titulo': 'Sua conta',
    'conta.status-verificando': 'Verificando…',
    'conta.entrar-legend': 'Entrar',
    'conta.email-label': 'E-mail',
    'conta.email-placeholder': 'voce@exemplo.com',
    'conta.senha-label': 'Senha',
    'conta.senha-placeholder': 'sua senha',
    'conta.entrar-cta': 'Entrar',
    'conta.criar-legend': 'Criar conta',
    'conta.criar-aviso': 'É a conta que você vai usar dentro do plugin. Guarde a senha: é ela que destrava a máquina.',
    'conta.senha8-label': 'Senha (8+ caracteres)',
    'conta.senha8-placeholder': 'crie uma senha',
    'conta.repita-senha-label': 'Repita a senha',
    'conta.repita-senha-placeholder': 'a mesma senha',
    'conta.criar-cta': 'Criar conta',
    'conta.tabs-aria': 'Áreas da conta',
    'conta.tab-perfil': 'Perfil',
    'conta.tab-licenca': 'Licença',
    'conta.tab-packs': 'Meus packs',
    'conta.tab-pedidos': 'Pedidos',
    'conta.tab-seguranca': 'Segurança',
    'conta.perfil-legend': 'Perfil',
    'conta.escolher-foto': 'Escolher foto',
    'conta.remover-foto': 'Remover',
    'conta.foto-ajuda': 'Quadrada, 256×256. PNG, JPG ou WEBP até 8 MB.',
    'conta.nome-exibicao-label': 'Nome de exibição',
    'conta.nome-exibicao-placeholder': 'como você quer ser chamado',
    'conta.email-nao-muda-label': 'E-mail (não muda)',
    'conta.salvar-perfil': 'Salvar perfil',
    'conta.download-legend': 'Download',
    'conta.download-ajuda-html': 'Instale, abra o BRDRUM no seu programa de música e entre com <b id="who"></b>.',
    'conta.baixar-mac': 'Baixar para Mac (.pkg)',
    'conta.baixar-win': 'Baixar para Windows (.exe)',
    'conta.sessao-legend': 'Sessão',
    'conta.sair': 'Sair',
    'conta.licenca-legend': 'Licença',
    'conta.slots-empty': 'Nenhuma vaga ocupada. Entre com esta conta dentro do plugin, ou gere uma chave para outra pessoa ativar.',
    'conta.comprar-legend': 'Comprar',
    'conta.meus-packs-legend': 'Meus packs',
    'conta.packs-vazio-title': 'Você ainda não tem sample packs',
    'conta.packs-vazio-text': 'Os packs do BRDRUM são exclusivos para quem tem um plano. Veja o que está na loja.',
    'conta.packs-vazio-cta': 'Ver a loja de packs',
    'conta.pedidos-legend': 'Pedidos',
    'conta.pedidos-th-quando': 'Quando',
    'conta.pedidos-th-item': 'Item',
    'conta.pedidos-th-valor': 'Valor',
    'conta.pedidos-th-desconto': 'Desconto',
    'conta.pedidos-th-cupom': 'Cupom',
    'conta.pedidos-th-status': 'Status',
    'conta.pedidos-empty': 'Nenhum pedido ainda.',
    'conta.trocar-senha-legend': 'Trocar senha',
    'conta.senha-atual-label': 'Senha atual',
    'conta.senha-atual-placeholder': 'a senha de agora',
    'conta.nova-senha-label': 'Nova senha (8+ caracteres)',
    'conta.nova-senha-placeholder': 'a nova senha',
    'conta.repita-nova-senha-label': 'Repita a nova senha',
    'conta.trocar-senha-cta': 'Trocar senha',
    'conta.dispositivos-legend': 'Dispositivos',
    'conta.dispositivos-ajuda': 'Sair de todos os dispositivos encerra a sessão em todo navegador e em todo plugin que entrou com esta conta. As licenças e as chaves continuam valendo: na próxima abertura o plugin pede a senha de novo.',
    'conta.sair-de-tudo': 'Sair de todos os dispositivos',
    'conta.footer-signature': 'BRDRUM · Rhythm Composer - 001 · criado por Brazilian Waves',
    'conta.footer-payment': 'Pagamento único pelo Mercado Pago',

    // ---------- conta.js (dinâmico) ----------
    'conta.titulo-comprar': 'Entre ou crie a conta para comprar',
    'conta.titulo-baixar': 'Crie sua conta para baixar',
    'conta.aviso-baixar': 'O download pede uma conta: é a mesma que você vai usar dentro do plugin. Leva 10 segundos, e o instalador começa a baixar sozinho depois.',
    'conta.nao-conectado': 'Não conectado',
    'conta.entrando': 'Entrando…',
    'conta.criando': 'Criando…',
    'conta.senha-min': 'A senha precisa ter pelo menos 8 caracteres.',
    'conta.senhas-diferentes': 'As senhas não são iguais.',
    'conta.abrindo-pagamento': 'Abrindo o pagamento…',
    'conta.licenca-liberada': 'Licença liberada nesta conta. Baixe o instalador e entre com este e-mail dentro do plugin.',
    'conta.mp-nao-ligado': 'O pagamento online ainda não está ligado. Sua conta já existe: fale com a gente informando este e-mail e a licença é liberada nela.',
    'conta.buy-title-upgrade': 'Fazer upgrade',
    'conta.buy-title-planos': 'Planos',
    'conta.buy-text-upgrade': 'Você paga só a diferença entre o seu plano e o maior. A licença passa a valer o novo número de computadores na hora da confirmação.',
    'conta.buy-text-normal': 'Pagamento único pelo Mercado Pago (Pix, cartão ou boleto). A licença cai nesta conta na hora da confirmação.',
    'conta.plano-e-acessos': '{nome} · {n}',
    'conta.upgrade-e-acessos': 'Fazer upgrade · {nome} · {n} acessos',
    'conta.menor-que-o-seu': 'menor que o seu',
    'conta.maior-plano-title': 'Licença',
    'conta.maior-plano-text': 'Você já tem o maior plano. Precisa de mais acessos? Escreva pra gente.',
    'conta.valor-com-cupom': '{nome} com o cupom {codigo}',
    'conta.valor-normal': '{nome} · {n}',
    'conta.pagar-valor': 'Pagar {valor}',
    'conta.pagar-fallback': 'Pagar',
    'conta.conferindo-cupom': 'Conferindo o cupom…',
    'conta.cupom-aplicado': 'Cupom aplicado.',
    'conta.cupom-sem-efeito': 'Esse cupom não muda o valor deste plano.',
    'conta.preparando-foto': 'Preparando a foto…',
    'conta.foto-recortada': 'Foto recortada em 256×256. Clique em "Salvar perfil" para enviar.',
    'conta.remover-foto-titulo': 'Remover foto',
    'conta.remover-foto-texto': 'A foto do perfil volta a ser as suas iniciais.',
    'conta.remover-foto-ok': 'Remover',
    'conta.foto-descartada': 'Foto descartada.',
    'conta.foto-removida': 'Foto removida.',
    'conta.nome-tamanho': 'O nome precisa ter de 1 a 60 caracteres.',
    'conta.salvando': 'Salvando…',
    'conta.perfil-salvo': 'Perfil salvo.',
    'conta.sem-licenca-status': '{email} · sem licença',
    'conta.licenca-ativa-status': '{email} · licença ativa',
    'conta.sem-licenca-texto': 'Esta conta ainda não tem licença.',
    'conta.sem-licenca-sub': 'Escolha um plano abaixo. O pagamento é único e a licença aparece aqui assim que o Mercado Pago confirmar.',
    'conta.licenca-texto': '{plano} · {usadas} de {total} {acessos} em uso.',
    'conta.licenca-sub-cheia-html': 'Todos os acessos estão ocupados. Libere uma vaga abaixo ou <b>faça upgrade</b> para mais computadores.',
    'conta.licenca-sub-livre-html': 'Cada vaga é um computador. Você pode entrar com a conta dentro do plugin, ou <b>gerar uma chave</b> para outra pessoa ativar sem saber a sua senha.',
    'conta.seats-legend': '{usadas} de {total} {acessos} em uso',
    'conta.seats-sem-licenca': 'sem licença',
    'conta.vaga-livre': 'Vaga livre',
    'conta.vaga-livre-legend': 'gere uma chave ou entre com a conta no plugin',
    'conta.gerar-chave': 'Gerar chave',
    'conta.licenca-cheia-aviso-html': 'A licença está cheia: todas as vagas ocupadas. Remova uma vaga acima ou <b>faça upgrade</b> para um plano com mais computadores.',
    'conta.computador-fallback': 'Computador',
    'conta.maquina-legend': 'máquina via conta · {os} · visto {quando}',
    'conta.remover-vaga': 'Remover',
    'conta.remover-computador-titulo': 'Remover computador',
    'conta.remover-computador-texto-html': '<b>{nome}</b> perde o acesso na próxima abertura do plugin e a vaga fica livre.',
    'conta.vaga-liberada': 'Vaga liberada.',
    'conta.chave-sem-apelido': 'Chave sem apelido',
    'conta.chave-ativa': 'ativa',
    'conta.chave-pendente': 'pendente',
    'conta.chave-legend-ativa': '{maquina} · {os} · visto {quando}',
    'conta.chave-legend-pendente': 'ainda não ativada: entregue esta chave para quem vai usar',
    'conta.chave-computador-fallback': 'computador',
    'conta.copiar': 'Copiar',
    'conta.chave-copiada': 'Chave copiada.',
    'conta.chave-copiar-falhou': 'Não consegui copiar. Selecione o código na tela.',
    'conta.renomear': 'Renomear',
    'conta.apelido-titulo': 'Apelido da chave',
    'conta.apelido-rotulo': 'Apelido',
    'conta.apelido-texto': 'Serve para você saber de quem é a chave. Ex.: "PC do Nana".',
    'conta.apelido-salvo': 'Apelido salvo.',
    'conta.apagar': 'Apagar',
    'conta.apagar-chave-titulo': 'Apagar chave',
    'conta.remover-chave-titulo': 'Remover chave',
    'conta.apagar-chave-texto': 'A chave deixa de funcionar e a vaga fica livre.',
    'conta.remover-chave-texto-html': 'O computador <b>{nome}</b> tranca na próxima renovação e a vaga fica livre.',
    'conta.chave-que-usa-fallback': 'que usa esta chave',
    'conta.gerando-chave': 'Gerando a chave…',
    'conta.nova-chave-titulo': 'Nova chave',
    'conta.apelido-opcional-rotulo': 'Apelido (opcional)',
    'conta.nova-chave-texto': 'A chave ativa um computador sem pedir a senha da sua conta.',
    'conta.chave-criada-copiada': 'Chave {codigo} criada e copiada. Entregue para quem vai ativar.',
    'conta.chave-criada': 'Chave criada.',
    'conta.seats-full': 'A licença está cheia. Libere uma vaga ou faça upgrade.',
    'conta.pack-fallback': 'Pack',
    'conta.pack-cortesia': 'cortesia',
    'conta.baixar': 'Baixar',
    'conta.preparando': 'Preparando…',
    'conta.download-comecou': 'O download começou. O link vale 10 minutos.',
    'conta.pedido-pack-titulo': 'Pack · {titulo}',
    'conta.pedido-pack-fallback': 'Sample pack',
    'conta.pedido-upgrade-prefixo': 'Upgrade · ',
    'conta.pedido-acessos-sufixo': ' · {n}',
    'conta.pedido-cupom-aplicado': 'cupom aplicado',
    'conta.senha-atual-errada': 'A senha atual não confere.',
    'conta.senha-nova-igual-atual': 'A nova senha é igual à atual.',
    'conta.senhas-novas-diferentes': 'As duas senhas novas não são iguais.',
    'conta.trocando-senha': 'Trocando…',
    'conta.senha-trocada': 'Senha trocada. Use a nova também dentro do plugin.',
    'conta.sair-de-tudo-titulo': 'Sair de todos os dispositivos',
    'conta.sair-de-tudo-texto': 'Toda sessão desta conta é encerrada: este navegador e todo plugin que entrou com ela. A licença continua valendo.',
    'conta.sair-de-tudo-ok': 'Sair de tudo',
    'conta.encerrando-sessoes': 'Encerrando as sessões…',
    'conta.nao-consegui-vagas': 'Não consegui ler as vagas agora. Recarregue a página em um minuto.',
    'conta.pagamento-confirmado': 'Confira o plano e o valor (e o cupom, se tiver) e aperte Pagar.',
    'conta.instalador-mac-baixando-com-licenca': 'O instalador para Mac está baixando. Instale e entre com esta conta no plugin.',
    'conta.instalador-win-baixando-com-licenca': 'O instalador para Windows está baixando. Instale e entre com esta conta no plugin.',
    'conta.instalador-mac-baixando-sem-licenca': 'O instalador para Mac está baixando. Pra destravar o plugin, escolha um plano abaixo e pague; ele libera na hora.',
    'conta.instalador-win-baixando-sem-licenca': 'O instalador para Windows está baixando. Pra destravar o plugin, escolha um plano abaixo e pague; ele libera na hora.',
    'conta.pagamento-confirmado-lic': 'Pagamento confirmado. Sua licença está ativa: baixe o instalador e entre com esta conta no plugin.',
    'conta.pagamento-recebido-sem-lic': 'O pagamento foi recebido mas a licença ainda não apareceu. Recarregue a página em um minuto; se não aparecer, escreva pra gente com o e-mail da conta.',
    'conta.pagamento-em-analise': 'Pagamento em análise (Pix ou boleto levam um pouco). A licença aparece aqui assim que o Mercado Pago confirmar.',
    'conta.pagamento-falhou': 'O pagamento não foi concluído. Você pode tentar de novo abaixo.',
    'conta.status-pedido-pending': 'aguardando pagamento',
    'conta.status-pedido-approved': 'pago',
    'conta.status-pedido-rejected': 'recusado',
    'conta.status-pedido-refunded': 'estornado',
    'conta.status-pedido-cancelled': 'cancelado',

    // ---------- dd-ui.js (genérico) ----------
    'ui.confirmar-titulo': 'Confirmar',
    'ui.confirmar-ok': 'Confirmar',
    'ui.cancelar': 'Cancelar',
    'ui.perguntar-titulo': 'Escrever',
    'ui.perguntar-rotulo': 'Valor',
    'ui.perguntar-ok': 'Salvar',
    'ui.agora': 'agora',
    'ui.ha-min': 'há {n} min',
    'ui.ha-h': 'há {n} h',
    'ui.tamanho-mb': '{n} MB',
    'ui.tamanho-gb': '{n} GB',
    'ui.imagem-invalida': 'Escolha uma imagem (png, jpg ou webp).',
    'ui.imagem-grande': 'Imagem grande demais. Use um arquivo de até 8 MB.',
    'ui.imagem-falhou-preparar': 'Não consegui preparar a imagem.',
    'ui.foto-grande-demais': 'A foto ficou grande demais. Tente outra imagem.',
    'ui.nao-consegui-abrir-imagem': 'Não consegui abrir essa imagem.',
    'ui.previa-falhou': 'Não consegui tocar a prévia.',

    // ---------- dd-topo.js ----------
    // (usa nav.entrar / nav.admin já listados acima)

    // ---------- dd-api.js (mensagens do servidor) ----------
    'api.no-session': 'Você precisa entrar na conta.',
    'api.rest-error': 'Não consegui carregar os dados.',
    'api.fn-error': 'O servidor não respondeu como esperado.',
    'api.upload-erro': 'Não consegui enviar a foto. Tente outra imagem.',
    'api.auth-credenciais': 'E-mail ou senha não conferem.',
    'api.auth-ja-existe': 'Já existe uma conta com esse e-mail. Entre com a senha.',
    'api.auth-senha-curta': 'A senha precisa ter pelo menos 8 caracteres.',
    'api.auth-senha-vazada': 'Essa senha já apareceu em vazamentos de dados. Escolha outra.',
    'api.auth-senha-fraca': 'Senha fraca demais. Use pelo menos 8 caracteres.',
    'api.auth-rate-limit': 'Muitas tentativas. Espere um minuto e tente de novo.',
    'api.auth-email-invalido': 'Esse e-mail não parece válido.',
    'api.auth-nao-confirmado': 'Confirme seu e-mail antes de entrar.',
    'api.auth-generico': 'Não deu certo. Tente de novo.',
    'api.senha-atual-errada': 'A senha atual não confere.',
    'api.tipo-bateria': 'Bateria',
    'api.tipo-midi': 'MIDI',
    'api.tipo-bateria-midi': 'Bateria + MIDI',

    // ---------- painel da demo (dd-painel.js / dd-edit.js / dd-main.js) ----------
    'panel.label-of': '{label} do {inst}',
    'panel.pad-title': 'Tocar e trocar o som do {inst}',
    'panel.step-aria': '{inst}, passo {n}',
    'panel.accent-aria': 'Volume do accent no passo {n}',
    'panel.only-plugin-note': 'Sampler e Export: só no plugin',
    'panel.only-plugin-title': 'Só no plugin instalado',
    'panel.tonex-rotulo': 'TONE X: amplia o TONE das linhas com o LED aceso',
    'panel.tom': 'TOM',
    'panel.escala': 'ESCALA',
    'panel.compassos': 'COMPASSOS',
    'panel.tom-rotulo': 'Tom',
    'panel.escala-rotulo': 'Escala',
    'panel.compassos-rotulo': 'Compassos',
    'panel.rolo-aria': 'Prévia da linha de {kind} gerada',
    'panel.knob-sat': '{leg} da SATURATION',
    'panel.knob-mb': '{leg} do MULTIBAND',
    'panel.knob-echo': '{leg} do ECHO',
    'panel.echo-time-divisao': 'TIME do ECHO em divisão do BPM',
    'panel.knob-groove': '{leg} do GROOVE',
    'panel.ligar-saturation': 'Ligar a SATURATION',
    'panel.ligar-multiband': 'Ligar o MULTIBAND',
    'panel.ligar-color': 'Ligar o COLOR',
    'panel.sync-echo': 'SYNC do ECHO',
    'panel.wave-shape-sat': 'Wave shape da SATURATION',
    'panel.clip-sat': 'CLIP da SATURATION',
    'panel.abrir-edit-sat': 'Abrir o EDIT da SATURATION',
    'panel.abrir-edit-mb': 'Abrir o EDIT do MULTIBAND',
    'panel.pal-aria': 'O Pal, o personagem do BRDRUM',
    'panel.groove-tipo': 'Tipo de groove',
    'panel.fill-instrumento': 'Instrumento da virada',
    'panel.fill-rate-rotulo': 'RATE da virada',
    'panel.fill-vol-rotulo': 'VOLUME da virada',
    'panel.parado': 'Parado',
    'panel.tocando': 'Tocando',
    'panel.gerando': 'gerando…',
    'panel.toque-play-de-novo': 'TOQUE PLAY DE NOVO PARA OUVIR',
    'panel.motor-falha': 'Não consegui carregar o motor de áudio. Recarregue a página.',
    'panel.motor-falhou-prefixo': 'O motor de áudio falhou: ',
    'panel.amostra-suffix-one': ': mudo',
    'panel.amostra-suffix-many': ': mudos',
    'panel.gerado-texto': '{kind}: {count} notas em {bars} compassos',
    'panel.aperte-para-gerar': 'APERTE {kind} PARA GERAR',
    'panel.fechar': 'Fechar',
    'panel.curva-sat-aria': 'Curva da SATURATION',
    'panel.preset-label': 'PRESET',
    'panel.preset-padrao': 'Padrão',
    'panel.preset-mb-aria': 'Preset do MULTIBAND',
    'panel.soft-knee-mb': 'SOFT KNEE do MULTIBAND',
    'panel.rms-mb': 'RMS do MULTIBAND',
    'panel.banda-nome-ligada': 'Banda {banda} ligada',
    'panel.solo-da-banda': 'Solo da banda {banda}',
    'panel.gr-aria': 'Redução de ganho da banda {banda}',
  },

  en: {
    'brand.wordmark-html': '<img src="img/brdrum-logo-oficial.png" alt="BRDRUM Rhythm Composer - 001">',
    'daw.ableton': 'Ableton Live',
    'daw.fl-studio': 'FL Studio',
    'daw.logic': 'Logic Pro',
    'daw.cubase': 'Cubase',
    'daw.studio-one': 'Studio One',
    'daw.bitwig': 'Bitwig Studio',
    'daw.garageband': 'GarageBand',
    'lang.pt': 'PT',
    'lang.en': 'EN',
    'lang.switch-aria': 'Site language',
    'lang.pt-aria': 'View the site in Portuguese',
    'lang.en-aria': 'View the site in English',

    'head.title': 'BRDRUM — Rhythm Composer - 001',
    'head.description': 'BRDRUM: your drums and bass in 1 click. Plugin for Mac and Windows (VST3 and AU). Play it here in the browser before you buy.',
    'head.og-description': 'Your drums and bass in 1 click. Plugin for Mac and Windows; the demo on this page is the real plugin engine running in your browser.',
    'head.og-image-alt': "The BRDRUM panel in graphite steel: the BRDRUM Rhythm Composer - 001 badge, the striped band, the TONE X and RAND keys, the 16-step grid in red, orange, yellow and cream, the GAIN meter and the little screen with the Pal.",
    'head.twitter-description': 'Your drums and bass in 1 click. Play it before you buy.',
    'head.twitter-image-alt': 'The BRDRUM panel: the colored 16-step grid and the little screen with the Pal.',

    'packs.head-title': 'Sample Packs — BRDRUM',
    'packs.head-description': 'BRDRUM sample packs: drums and MIDI ready for your set. Exclusive to BRDRUM plan owners.',

    'conta.head-title': 'Account — BRDRUM',
    'conta.head-description': 'Sign in to your BRDRUM account: license, activation keys, computers, sample packs and orders.',

    'nav.aria': 'Sections',
    'nav.precos': 'Pricing',
    'nav.packs': 'Sample Packs',
    'nav.download': 'Download',
    'nav.instalacao': 'Install',
    'nav.conta': 'Account',
    'nav.entrar': 'Sign in',
    'nav.admin': 'Admin',

    'hero.aparelho-aria': 'BRDRUM panel, playable',
    'hero.video-aria': 'BRDRUM presentation',
    'hero.sound-label': 'Sound',
    'hero.sound-on-aria': 'Turn on the video sound',
    'hero.sound-off-aria': 'Turn off the video sound',
    'hero.play-text': 'Play',
    'hero.pause-text': 'Pause',
    'hero.play-aria': 'Play video',
    'hero.pause-aria': 'Pause video',
    'hero.note-1': "The plugin's C++ engine in WebAssembly · factory samples · it's not a video, it's the instrument",
    'hero.note-2': 'Drag the knobs · double-click resets to default · click the instrument name to change the sound',
    'transporte.aria': 'Demo transport',
    'transporte.play-title': 'Play / pause (Space, after clicking the panel)',
    'transporte.bpm-down': 'Decrease BPM',
    'transporte.bpm-up': 'Increase BPM',
    'transporte.dl-bass': 'Download bass .mid',
    'transporte.dl-lead': 'Download lead .mid',
    'common.carregando': 'Loading…',

    'compat.title-html': '<b>compatible</b> with every DAW',
    'compat.aria': 'Compatible DAWs',
    'compat.title-small-html': '<b>compatible</b> with every DAW',

    'statement.h1-html': 'Your <b class="c-cream">drums</b><br>and <b class="c-orange">bass</b> in<br><b class="c-yellow">1 click</b>',
    'statement.lead': "Thousands of possibilities with your own samples and MIDIs, plus the packs that come built in. Hit RAND and a ready beat comes out; hit BASS and it draws a bassline from your MIDI folder, in the right key.",

    'spec.formatos-th': 'Formats',
    'spec.formatos-td': 'VST3 · AU',
    'spec.sistemas-th': 'Systems',
    'spec.sistemas-td': 'macOS 10.15+ · Windows 10/11',
    'spec.bateria-th': 'Drums',
    'spec.bateria-td': '6 instruments · 16 steps · ready beat in 1 click',
    'spec.sons-th': 'Sounds',
    'spec.sons-td': '232 factory + your own',
    'spec.baixo-th': 'Bass and melody',
    'spec.baixo-td': 'draws a MIDI from your folder, in the beat\'s key · drag it into your DAW',
    'spec.viradas-th': 'Fills',
    'spec.viradas-td': '11 rates, from 1/16 to 2 bars, with off-beat',
    'spec.afinacao-th': 'Tuning',
    'spec.afinacao-td': 'TONE X: up to 20x higher or lower, per instrument',
    'spec.masterfx-th': 'Master FX',
    'spec.masterfx-td': 'saturation with 8 types, 3-band compressor with OTT preset, and echo',
    'spec.export-th': 'Export',
    'spec.export-td': 'one wav per instrument (kick, snare, clap, hats, tom) + one wav with just the effects (reverb and delay) + the full mix',
    'spec.licenca-th': 'License',
    'spec.licenca-td': 'per account · 1, 3 or 5 computers',

    'download.daw-shot-alt': 'BRDRUM open in Ableton Live, with the bass and lead MIDI generator and the audio clips beside it',
    'download.title': 'Download the installer',
    'download.legend': 'VST3 · AU · needs an account',
    'download.mac-cta': 'Download for Mac',
    'download.mac-sub': '.pkg · Intel and Apple Silicon · macOS 10.15+',
    'download.win-cta': 'Download for Windows',
    'download.win-sub': '.exe · Windows 10/11, 64-bit',
    'download.manual-label': 'BRDRUM manual',
    'download.manual-pt': 'Portuguese',
    'download.manual-en': 'English',
    'download.step1-legend': '1 · Create your account and install',
    'download.step1-text-html': 'The download asks for an account (the same one that unlocks the plugin). The installer drops the VST3, the AU (Mac) and the <b>232 factory samples</b> in place. Nothing to configure.',
    'download.step2-legend': '2 · Sign in',
    'download.step2-text-html': 'Open BRDRUM in your music software and sign in with your <b>account e-mail and password</b>. It\'s the same account you bought with.',
    'download.step3-legend': '3 · Play',
    'download.step3-text': "Once the payment is confirmed, the machine unlocks right away. No key to copy, no file to keep: the license lives in your account. Without paying, the plugin opens but stays silent.",

    'plans.solo-name': 'Solo',
    'plans.solo-li1': '1 active computer at a time',
    'plans.solo-li2': 'VST3 and AU, Mac and Windows',
    'plans.solo-li3': '232 factory samples and every update',
    'plans.solo-cta': 'Buy Solo',
    'plans.studio-name': 'Studio',
    'plans.studio-ribbon': 'Recommended',
    'plans.studio-li1-html': '<b>3 computers</b> active at the same time: studio, laptop and your partner\'s machine',
    'plans.studio-li2-html': '<b>15% off</b> per computer compared to Solo',
    'plans.studio-li3': 'Switch machines whenever you want, right in the plugin',
    'plans.studio-cta': 'Buy Studio',
    'plans.team-name': 'Team',
    'plans.team-li1': '5 computers active at the same time',
    'plans.team-li2': 'For a production house, duo or collective with several machines',
    'plans.team-li3-html': '<b>20% off</b> per computer compared to Solo',
    'plans.team-cta': 'Buy Team',
    'plans.note-html': 'One-time payment, no subscription. Pix, card or boleto through <b>Mercado Pago</b>.\n    The license lives in your account: you sign in with e-mail and password inside the plugin, and each computer that\n    signs in takes up one seat. Need to switch machines? Deactivate the old one right in the plugin, or on the\n    <a href="conta.html">account page</a>.',
    'plans.per-computador': 'per computer',
    'plans.seat-one': '{n} seat',
    'plans.seat-other': '{n} seats',
    'common.seat-word-one': 'seat',
    'common.seat-word-other': 'seats',
    'plans.seu-plano': 'Your plan',
    'plans.menor-que-seu': 'Smaller than your plan',
    'plans.fazer-upgrade': 'Upgrade',
    'plans.fazer-upgrade-valor': 'Upgrade · {valor}',

    'review.title': 'Review',
    'review.legend': 'Producers using BRDRUM',

    'feats.title': "What's inside",
    'feats.legend': '232 factory samples',
    'feats.batida-legend': 'Ready-made beat',
    'feats.batida-text-html': "<b>Hit RAND and a full groove comes out</b>: kick, snare, clap, hats and tom, already with the\n         chosen sounds. Like it, keep it. Don't like it, hit it again. Want to tweak it? Each colored\n         key turns a hit on or off.",
    'feats.batida-tag': '1 click',
    'feats.sons-legend': 'Your own sounds',
    'feats.sons-text-html': 'Comes with <b>232 drum sounds</b> ready to go. Want to use your own? Drop the files into a folder\n         and they join the draw alongside the factory ones. Thousands of combinations.',
    'feats.sons-tag': '232 sounds',
    'feats.baixo-legend': 'Bass and melody',
    'feats.baixo-text-html': 'With one click it <b>draws a MIDI from your folder</b> for Bass or Lead (or from the packs\n         already built in), shifts it to the key you pick and hands you a clip ready to drag\n         into your music software.',
    'feats.baixo-tag': 'drag into your DAW',
    'feats.efeitos-legend': 'Effects and export',
    'feats.efeitos-text-html': '<b>Every instrument has its own reverb and delay send</b> (REV and DEL). And <b>EXPORT records each instrument as a\n         separate wav</b> (kick, snare, clap, hats and tom), <b>plus one wav with just the effects</b> and\n         the full mix, so you can mix it your way in your music software.',
    'feats.efeitos-tag': 'separate wav',
    'feats.ott-legend': 'OTT-finished sound',
    'feats.ott-text-html': '<b>Saturation with 8 sound types, a 3-band compressor and echo</b> at the end. Pick the\n         <b>OTT preset</b> and the beat gets fuller and tighter. Want to tweak it? EDIT opens every detail.',
    'feats.ott-tag': 'ready OTT preset',
    'feats.viradas-legend': 'DJ-style fills',
    'feats.viradas-text-html': "<b>The fill locks to the song's tempo</b>, with the same marks as DJ mixers: from 1/16 up to 2\n         bars, off-beat included. You pick the instrument, the rate and the volume.",
    'feats.viradas-tag': '11 rates',
    'feats.tonex-legend': 'TONE X per instrument',
    'feats.tonex-text-html': "Turn on <b>TONE X</b> and each instrument's TONE goes <b>up to 20 times higher or\n         lower</b>. Each row's little light picks which instruments join in.",
    'feats.tonex-tag': 'up to 20x',
    'feats.pal-legend': 'A partner on the screen',
    'feats.pal-text-html': "<b>The Pal lives on BRDRUM's little screen</b> and reacts to what you do: it follows the mouse, smiles when\n         you click, dances when the music plays, gets sad if you cut the volume, and dozes off if you\n         go a minute without touching anything.",
    'feats.pal-tag': 'dances on play',

    'install.title': 'From download to first sound',
    'install.legend': 'Four steps',
    'install.mac-legend': 'Mac',
    'install.mac-h3': 'macOS 10.15 or newer',
    'install.mac-li1-html': 'Create your account and download <b>BRDRUM-macOS.pkg</b> with the button above.',
    'install.mac-li2': 'Double-click the .pkg and follow the installer (next, next, install).',
    'install.mac-li3': 'Open your DAW and have it rescan the plugins.',
    'install.mac-li4-html': 'Look for <b>BRDRUM</b> in the instruments, drag it onto a MIDI track and sign in with your account.',
    'install.mac-warn-html': 'If macOS blocks the .pkg ("cannot be verified" or "unidentified developer"):\n        close the warning, open <b>System Settings › Privacy & Security</b>, scroll to the bottom and click\n        <b>Open Anyway</b>. Confirm with your password and the installer opens. Applies to macOS 13, 14 and 15.\n        On older macOS you can also open the .pkg with <b>right-click › Open</b>.',
    'install.win-legend': 'Windows',
    'install.win-h3': 'Windows 10 and 11, 64-bit',
    'install.win-li1-html': 'Create your account and download <b>BRDRUM-Windows-Setup.exe</b> with the button above.',
    'install.win-li2-html': 'Run it and follow the installer. If SmartScreen warns you, click <b>More info → Run anyway</b>.',
    'install.win-li3-html': 'Open your DAW and have it rescan the plugins (the VST3 goes to the default folder <code>C:\\Program Files\\Common Files\\VST3</code>).',
    'install.win-li4-html': 'Look for <b>BRDRUM</b> in the instruments, drag it onto a MIDI track and sign in with your account.',
    'install.win-warn-html': 'In FL Studio: Options → Manage plugins → Find more plugins.\n        In Ableton: Preferences → Plug-Ins → Rescan.',

    'tutorial.cta': 'TUTORIAL',
    'tutorial.aria': 'Download the BRDRUM manual as PDF, Portuguese and English',

    'samples.title': 'Your own samples join right in',
    'samples.legend': 'Adds, never replaces',
    'samples.panel-legend': 'Sampler',
    'samples.p1': 'The installer already sets up the factory library. Nothing to configure.',
    'samples.p2-html': 'Press <b>SAMPLER</b> inside the plugin: it opens the <b>BRDRUM</b> folder with the samples, in the\n      subfolders <code>Kick</code>, <code>Snare</code>, <code>Clap</code>, <code>Hat</code> and\n      <code>Tom</code>. Drop your wavs there and they join the draw <b>alongside</b> the factory ones.\n      The same goes for the generator\'s MIDIs, in the <code>Bass</code> and <code>Lead</code> folders.',

    'close.buy-cta': 'Buy Studio',
    'close.legend': 'One-time payment, no subscription. Pix, card or boleto through Mercado Pago. The license lives in your account.',
    'close.compat-title-html': '<b>compatible</b> with every DAW',

    'footer.horario-html': 'Support hours:<br>Monday to Saturday, 9am to 6:30pm (BRT)',
    'footer.ajuda': 'Help center',
    'footer.institucional-title': 'About',
    'footer.planos-link': 'Plans',
    'footer.packs-link': 'Sample Packs',
    'footer.instalacao-link': 'Install',
    'footer.suporte-title': 'Support',
    'footer.conta-link': 'My account',
    'footer.download-link': 'Download',
    'footer.pay-pix': 'Pix',
    'footer.pay-cartao': 'Card',
    'footer.pay-boleto': 'Boleto',
    'footer.pay-mp': 'Mercado Pago',
    'footer.signature': 'BRDRUM · Rhythm Composer - 001 · made by Brazilian Waves',
    'footer.chat-aria': 'Talk to us',
    'footer.payment-only': 'One-time payment through Mercado Pago',

    'packs.desligado-titulo': 'The packs store is coming back soon',
    'packs.desligado-voltar': 'Back to the homepage',
    'packs.title': 'Sample Packs',
    'packs.status-loading': 'Loading…',
    'packs.det-legend-default': 'Pack',
    'packs.det-previa': 'Play preview',
    'packs.det-fechar': 'Close',
    'packs.cupom-label': 'Coupon (optional)',
    'packs.cupom-placeholder': 'have a coupon? type it here',
    'packs.cupom-aplicar': 'Apply',
    'packs.det-comprar': 'Buy',
    'packs.vazio-title': 'The first packs are coming soon',
    'packs.vazio-text': 'Drums and MIDI made for BRDRUM, ready to drop into the sequencer. When the first one lands, it shows up here.',
    'packs.vazio-cta': "See BRDRUM's plans",
    'packs.nota': "Sample packs are exclusive to BRDRUM plan owners.\n    With an active plan, a pack is a one-time payment and stays in your account to download whenever you want.",
    'packs.status-row': 'seats',
    'packs.status-entre': 'Sign in to buy',
    'packs.status-ativo': 'Active plan · can buy packs',
    'packs.status-sem-plano': 'No plan · packs are for subscribers',
    'packs.status-erro': "Couldn't load",
    'packs.aviso-exclusivo-html': 'Sample packs are exclusive to BRDRUM plan owners. <a href="index.html#precos">See the plans</a>.',
    'packs.na-conta-baixar': 'In your account · Download',
    'packs.exclusivo-assinantes': 'Exclusive to BRDRUM subscribers · See plans',
    'packs.comprar-valor': 'Buy · {valor}',
    'packs.preparando': 'Preparing…',
    'packs.download-comecou': 'The download started. The link is valid for 10 minutes.',
    'packs.tocar-previa-de': 'Play preview of {titulo}',
    'packs.pack-fallback': 'Pack',
    'packs.por-artista': 'by {artista}',
    'packs.tipo-label': 'Type',
    'packs.conteudo-label': 'Contents',
    'packs.arquivo-label': 'File',
    'packs.ja-e-seu': 'You already own this pack: download it from the "My packs" tab in your account.',
    'packs.baixar-agora': 'Download now',
    'packs.exclusivo-veja-planos-html': 'Sample packs are exclusive to BRDRUM plan owners. <b>See the plans</b> to unlock this purchase.',
    'packs.cupom-aplicado-tag': 'coupon applied',
    'packs.promocao-tag': 'sale',
    'packs.conferindo-cupom': 'Checking the coupon…',
    'packs.cupom-aplicado': 'Coupon applied.',
    'packs.cupom-sem-efeito': "That coupon doesn't change this pack's price.",
    'packs.abrindo-pagamento': 'Opening payment…',
    'packs.pack-liberado': 'Pack unlocked in your account.',
    'packs.plan-required': 'Sample packs are exclusive to BRDRUM plan owners.',
    'packs.mp-not-configured': "Online payment isn't set up yet. Contact us with your account's e-mail.",
    'packs.already-owned': 'You already own this pack: download it from your account.',
    'packs.chip-seu': 'yours',

    'conta.titulo': 'Your account',
    'conta.status-verificando': 'Checking…',
    'conta.entrar-legend': 'Sign in',
    'conta.email-label': 'E-mail',
    'conta.email-placeholder': 'you@example.com',
    'conta.senha-label': 'Password',
    'conta.senha-placeholder': 'your password',
    'conta.entrar-cta': 'Sign in',
    'conta.criar-legend': 'Create account',
    'conta.criar-aviso': "It's the account you'll use inside the plugin. Keep the password safe: it's what unlocks the machine.",
    'conta.senha8-label': 'Password (8+ characters)',
    'conta.senha8-placeholder': 'create a password',
    'conta.repita-senha-label': 'Repeat the password',
    'conta.repita-senha-placeholder': 'the same password',
    'conta.criar-cta': 'Create account',
    'conta.tabs-aria': 'Account areas',
    'conta.tab-perfil': 'Profile',
    'conta.tab-licenca': 'License',
    'conta.tab-packs': 'My packs',
    'conta.tab-pedidos': 'Orders',
    'conta.tab-seguranca': 'Security',
    'conta.perfil-legend': 'Profile',
    'conta.escolher-foto': 'Choose photo',
    'conta.remover-foto': 'Remove',
    'conta.foto-ajuda': 'Square, 256×256. PNG, JPG or WEBP up to 8 MB.',
    'conta.nome-exibicao-label': 'Display name',
    'conta.nome-exibicao-placeholder': 'what should we call you',
    'conta.email-nao-muda-label': "E-mail (can't be changed)",
    'conta.salvar-perfil': 'Save profile',
    'conta.download-legend': 'Download',
    'conta.download-ajuda-html': 'Install it, open BRDRUM in your music software and sign in with <b id="who"></b>.',
    'conta.baixar-mac': 'Download for Mac (.pkg)',
    'conta.baixar-win': 'Download for Windows (.exe)',
    'conta.sessao-legend': 'Session',
    'conta.sair': 'Sign out',
    'conta.licenca-legend': 'License',
    'conta.slots-empty': 'No seats in use yet. Sign in with this account inside the plugin, or generate a key for someone else to activate.',
    'conta.comprar-legend': 'Buy',
    'conta.meus-packs-legend': 'My packs',
    'conta.packs-vazio-title': "You don't have any sample packs yet",
    'conta.packs-vazio-text': "BRDRUM's packs are exclusive to plan owners. See what's in the store.",
    'conta.packs-vazio-cta': 'See the pack store',
    'conta.pedidos-legend': 'Orders',
    'conta.pedidos-th-quando': 'When',
    'conta.pedidos-th-item': 'Item',
    'conta.pedidos-th-valor': 'Amount',
    'conta.pedidos-th-desconto': 'Discount',
    'conta.pedidos-th-cupom': 'Coupon',
    'conta.pedidos-th-status': 'Status',
    'conta.pedidos-empty': 'No orders yet.',
    'conta.trocar-senha-legend': 'Change password',
    'conta.senha-atual-label': 'Current password',
    'conta.senha-atual-placeholder': "today's password",
    'conta.nova-senha-label': 'New password (8+ characters)',
    'conta.nova-senha-placeholder': 'the new password',
    'conta.repita-nova-senha-label': 'Repeat the new password',
    'conta.trocar-senha-cta': 'Change password',
    'conta.dispositivos-legend': 'Devices',
    'conta.dispositivos-ajuda': "Signing out of every device ends the session in every browser and every plugin signed in with this account. Your licenses and keys stay valid: the plugin will just ask for the password again next time.",
    'conta.sair-de-tudo': 'Sign out of every device',
    'conta.footer-signature': 'BRDRUM · Rhythm Composer - 001 · made by Brazilian Waves',
    'conta.footer-payment': 'One-time payment through Mercado Pago',

    'conta.titulo-comprar': 'Sign in or create an account to buy',
    'conta.titulo-baixar': 'Create your account to download',
    'conta.aviso-baixar': "The download asks for an account: it's the same one you'll use inside the plugin. It takes 10 seconds, and the installer starts downloading right after.",
    'conta.nao-conectado': 'Not signed in',
    'conta.entrando': 'Signing in…',
    'conta.criando': 'Creating…',
    'conta.senha-min': 'The password needs at least 8 characters.',
    'conta.senhas-diferentes': "The passwords don't match.",
    'conta.abrindo-pagamento': 'Opening payment…',
    'conta.licenca-liberada': 'License unlocked on this account. Download the installer and sign in with this e-mail inside the plugin.',
    'conta.mp-nao-ligado': "Online payment isn't set up yet. Your account already exists: contact us with this e-mail and we'll unlock the license on it.",
    'conta.buy-title-upgrade': 'Upgrade',
    'conta.buy-title-planos': 'Plans',
    'conta.buy-text-upgrade': 'You only pay the difference between your plan and the bigger one. The license takes on the new number of computers as soon as it\'s confirmed.',
    'conta.buy-text-normal': 'One-time payment through Mercado Pago (Pix, card or boleto). The license lands on this account as soon as it\'s confirmed.',
    'conta.plano-e-acessos': '{nome} · {n}',
    'conta.upgrade-e-acessos': 'Upgrade · {nome} · {n} seats',
    'conta.menor-que-o-seu': 'smaller than yours',
    'conta.maior-plano-title': 'License',
    'conta.maior-plano-text': 'You already have the biggest plan. Need more seats? Write to us.',
    'conta.valor-com-cupom': '{nome} with coupon {codigo}',
    'conta.valor-normal': '{nome} · {n}',
    'conta.pagar-valor': 'Pay {valor}',
    'conta.pagar-fallback': 'Pay',
    'conta.conferindo-cupom': 'Checking the coupon…',
    'conta.cupom-aplicado': 'Coupon applied.',
    'conta.cupom-sem-efeito': "That coupon doesn't change this plan's price.",
    'conta.preparando-foto': 'Preparing the photo…',
    'conta.foto-recortada': 'Photo cropped to 256×256. Click "Save profile" to send it.',
    'conta.remover-foto-titulo': 'Remove photo',
    'conta.remover-foto-texto': 'Your profile photo goes back to your initials.',
    'conta.remover-foto-ok': 'Remove',
    'conta.foto-descartada': 'Photo discarded.',
    'conta.foto-removida': 'Photo removed.',
    'conta.nome-tamanho': 'The name needs to be 1 to 60 characters long.',
    'conta.salvando': 'Saving…',
    'conta.perfil-salvo': 'Profile saved.',
    'conta.sem-licenca-status': '{email} · no license',
    'conta.licenca-ativa-status': '{email} · active license',
    'conta.sem-licenca-texto': "This account doesn't have a license yet.",
    'conta.sem-licenca-sub': "Pick a plan below. It's a one-time payment and the license shows up here as soon as Mercado Pago confirms it.",
    'conta.licenca-texto': '{plano} · {usadas} of {total} {acessos} in use.',
    'conta.licenca-sub-cheia-html': 'Every seat is taken. Free one up below or <b>upgrade</b> for more computers.',
    'conta.licenca-sub-livre-html': 'Each seat is a computer. You can sign in with this account inside the plugin, or <b>generate a key</b> for someone else to activate without knowing your password.',
    'conta.seats-legend': '{usadas} of {total} {acessos} in use',
    'conta.seats-sem-licenca': 'no license',
    'conta.vaga-livre': 'Free seat',
    'conta.vaga-livre-legend': 'generate a key or sign in with this account in the plugin',
    'conta.gerar-chave': 'Generate key',
    'conta.licenca-cheia-aviso-html': 'The license is full: every seat is taken. Remove a seat above or <b>upgrade</b> to a plan with more computers.',
    'conta.computador-fallback': 'Computer',
    'conta.maquina-legend': 'machine via account · {os} · seen {quando}',
    'conta.remover-vaga': 'Remove',
    'conta.remover-computador-titulo': 'Remove computer',
    'conta.remover-computador-texto-html': "<b>{nome}</b> loses access the next time the plugin opens, and the seat frees up.",
    'conta.vaga-liberada': 'Seat freed up.',
    'conta.chave-sem-apelido': 'Unnamed key',
    'conta.chave-ativa': 'active',
    'conta.chave-pendente': 'pending',
    'conta.chave-legend-ativa': '{maquina} · {os} · seen {quando}',
    'conta.chave-legend-pendente': 'not activated yet: hand this key to whoever will use it',
    'conta.chave-computador-fallback': 'computer',
    'conta.copiar': 'Copy',
    'conta.chave-copiada': 'Key copied.',
    'conta.chave-copiar-falhou': "Couldn't copy. Select the code on the screen.",
    'conta.renomear': 'Rename',
    'conta.apelido-titulo': "Key's nickname",
    'conta.apelido-rotulo': 'Nickname',
    'conta.apelido-texto': 'Helps you remember whose key it is. E.g. "Nana\'s PC".',
    'conta.apelido-salvo': 'Nickname saved.',
    'conta.apagar': 'Delete',
    'conta.apagar-chave-titulo': 'Delete key',
    'conta.remover-chave-titulo': 'Remove key',
    'conta.apagar-chave-texto': 'The key stops working and the seat frees up.',
    'conta.remover-chave-texto-html': "The computer <b>{nome}</b> locks on its next renewal and the seat frees up.",
    'conta.chave-que-usa-fallback': 'using this key',
    'conta.gerando-chave': 'Generating the key…',
    'conta.nova-chave-titulo': 'New key',
    'conta.apelido-opcional-rotulo': 'Nickname (optional)',
    'conta.nova-chave-texto': 'The key activates a computer without asking for your account password.',
    'conta.chave-criada-copiada': 'Key {codigo} created and copied. Hand it to whoever will activate it.',
    'conta.chave-criada': 'Key created.',
    'conta.seats-full': 'The license is full. Free up a seat or upgrade.',
    'conta.pack-fallback': 'Pack',
    'conta.pack-cortesia': 'gift',
    'conta.baixar': 'Download',
    'conta.preparando': 'Preparing…',
    'conta.download-comecou': 'The download started. The link is valid for 10 minutes.',
    'conta.pedido-pack-titulo': 'Pack · {titulo}',
    'conta.pedido-pack-fallback': 'Sample pack',
    'conta.pedido-upgrade-prefixo': 'Upgrade · ',
    'conta.pedido-acessos-sufixo': ' · {n}',
    'conta.pedido-cupom-aplicado': 'coupon applied',
    'conta.senha-atual-errada': "The current password doesn't match.",
    'conta.senha-nova-igual-atual': 'The new password is the same as the current one.',
    'conta.senhas-novas-diferentes': "The two new passwords don't match.",
    'conta.trocando-senha': 'Changing…',
    'conta.senha-trocada': 'Password changed. Use the new one inside the plugin too.',
    'conta.sair-de-tudo-titulo': 'Sign out of every device',
    'conta.sair-de-tudo-texto': 'Every session on this account ends: this browser and every plugin signed in with it. The license stays valid.',
    'conta.sair-de-tudo-ok': 'Sign out everywhere',
    'conta.encerrando-sessoes': 'Ending the sessions…',
    'conta.nao-consegui-vagas': "Couldn't read the seats right now. Reload the page in a minute.",
    'conta.pagamento-confirmado': 'Check the plan and the price (and the coupon, if any) and hit Pay.',
    'conta.instalador-mac-baixando-com-licenca': 'The Mac installer is downloading. Install it and sign in with this account in the plugin.',
    'conta.instalador-win-baixando-com-licenca': 'The Windows installer is downloading. Install it and sign in with this account in the plugin.',
    'conta.instalador-mac-baixando-sem-licenca': 'The Mac installer is downloading. To unlock the plugin, pick a plan below and pay; it unlocks right away.',
    'conta.instalador-win-baixando-sem-licenca': 'The Windows installer is downloading. To unlock the plugin, pick a plan below and pay; it unlocks right away.',
    'conta.pagamento-confirmado-lic': 'Payment confirmed. Your license is active: download the installer and sign in with this account in the plugin.',
    'conta.pagamento-recebido-sem-lic': "The payment went through but the license hasn't shown up yet. Reload the page in a minute; if it still doesn't appear, write to us with the account's e-mail.",
    'conta.pagamento-em-analise': 'Payment under review (Pix or boleto take a little while). The license shows up here as soon as Mercado Pago confirms it.',
    'conta.pagamento-falhou': "The payment wasn't completed. You can try again below.",
    'conta.status-pedido-pending': 'awaiting payment',
    'conta.status-pedido-approved': 'paid',
    'conta.status-pedido-rejected': 'declined',
    'conta.status-pedido-refunded': 'refunded',
    'conta.status-pedido-cancelled': 'cancelled',

    'ui.confirmar-titulo': 'Confirm',
    'ui.confirmar-ok': 'Confirm',
    'ui.cancelar': 'Cancel',
    'ui.perguntar-titulo': 'Write',
    'ui.perguntar-rotulo': 'Value',
    'ui.perguntar-ok': 'Save',
    'ui.agora': 'now',
    'ui.ha-min': '{n} min ago',
    'ui.ha-h': '{n} h ago',
    'ui.tamanho-mb': '{n} MB',
    'ui.tamanho-gb': '{n} GB',
    'ui.imagem-invalida': 'Choose an image (png, jpg or webp).',
    'ui.imagem-grande': 'Image too big. Use a file up to 8 MB.',
    'ui.imagem-falhou-preparar': "Couldn't prepare the image.",
    'ui.foto-grande-demais': 'The photo came out too big. Try another image.',
    'ui.nao-consegui-abrir-imagem': "Couldn't open that image.",
    'ui.previa-falhou': "Couldn't play the preview.",

    'api.no-session': 'You need to sign in to your account.',
    'api.rest-error': "Couldn't load the data.",
    'api.fn-error': "The server didn't respond as expected.",
    'api.upload-erro': "Couldn't send the photo. Try another image.",
    'api.auth-credenciais': "E-mail or password don't match.",
    'api.auth-ja-existe': 'An account with that e-mail already exists. Sign in with your password.',
    'api.auth-senha-curta': 'The password needs at least 8 characters.',
    'api.auth-senha-vazada': 'That password has already shown up in a data breach. Choose another one.',
    'api.auth-senha-fraca': 'Password too weak. Use at least 8 characters.',
    'api.auth-rate-limit': 'Too many attempts. Wait a minute and try again.',
    'api.auth-email-invalido': "That e-mail doesn't look valid.",
    'api.auth-nao-confirmado': 'Confirm your e-mail before signing in.',
    'api.auth-generico': "That didn't work. Try again.",
    'api.senha-atual-errada': "The current password doesn't match.",
    'api.tipo-bateria': 'Drums',
    'api.tipo-midi': 'MIDI',
    'api.tipo-bateria-midi': 'Drums + MIDI',

    'panel.label-of': '{label} of {inst}',
    'panel.pad-title': 'Play and change the {inst} sound',
    'panel.step-aria': '{inst}, step {n}',
    'panel.accent-aria': 'Accent volume at step {n}',
    'panel.only-plugin-note': 'Sampler and Export: plugin only',
    'panel.only-plugin-title': 'Only in the installed plugin',
    'panel.tonex-rotulo': 'TONE X: boosts the TONE of the rows with the LED lit',
    'panel.tom': 'KEY',
    'panel.escala': 'SCALE',
    'panel.compassos': 'BARS',
    'panel.tom-rotulo': 'Key',
    'panel.escala-rotulo': 'Scale',
    'panel.compassos-rotulo': 'Bars',
    'panel.rolo-aria': 'Preview of the generated {kind} line',
    'panel.knob-sat': '{leg} · SATURATION',
    'panel.knob-mb': '{leg} · MULTIBAND',
    'panel.knob-echo': '{leg} · ECHO',
    'panel.echo-time-divisao': 'ECHO TIME, in BPM divisions',
    'panel.knob-groove': '{leg} · GROOVE',
    'panel.ligar-saturation': 'Turn on SATURATION',
    'panel.ligar-multiband': 'Turn on MULTIBAND',
    'panel.ligar-color': 'Turn on COLOR',
    'panel.sync-echo': 'ECHO SYNC',
    'panel.wave-shape-sat': 'SATURATION wave shape',
    'panel.clip-sat': 'SATURATION CLIP',
    'panel.abrir-edit-sat': 'Open the SATURATION EDIT',
    'panel.abrir-edit-mb': 'Open the MULTIBAND EDIT',
    'panel.pal-aria': 'The Pal, BRDRUM\'s character',
    'panel.groove-tipo': 'Groove type',
    'panel.fill-instrumento': 'Fill instrument',
    'panel.fill-rate-rotulo': 'Fill RATE',
    'panel.fill-vol-rotulo': 'Fill VOLUME',
    'panel.parado': 'Stopped',
    'panel.tocando': 'Playing',
    'panel.gerando': 'generating…',
    'panel.toque-play-de-novo': 'PRESS PLAY AGAIN TO LISTEN',
    'panel.motor-falha': "Couldn't load the audio engine. Reload the page.",
    'panel.motor-falhou-prefixo': 'The audio engine failed: ',
    'panel.amostra-suffix-one': ': muted',
    'panel.amostra-suffix-many': ': muted',
    'panel.gerado-texto': '{kind}: {count} notes in {bars} bars',
    'panel.aperte-para-gerar': 'PRESS {kind} TO GENERATE',
    'panel.fechar': 'Close',
    'panel.curva-sat-aria': 'SATURATION curve',
    'panel.preset-label': 'PRESET',
    'panel.preset-padrao': 'Default',
    'panel.preset-mb-aria': 'MULTIBAND preset',
    'panel.soft-knee-mb': 'MULTIBAND SOFT KNEE',
    'panel.rms-mb': 'MULTIBAND RMS',
    'panel.banda-nome-ligada': '{banda} band on',
    'panel.solo-da-banda': '{banda} band solo',
    'panel.gr-aria': '{banda} band gain reduction',
  },
};

// ---------------------------------------------------------------------------------------------
function paramLang() {
  try {
    const v = new URLSearchParams(location.search).get('lang');
    return v === 'pt' || v === 'en' ? v : null;
  } catch { return null; }
}
function storedLang() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
function saveLang(v) {
  try { localStorage.setItem(STORAGE_KEY, v); } catch { /* modo privado: segue só na sessão */ }
}
function detectLang() {
  const forcado = paramLang();
  if (forcado) { saveLang(forcado); return forcado; }
  const salvo = storedLang();
  if (salvo === 'pt' || salvo === 'en') return salvo;
  const nav = (navigator.language || 'pt').toLowerCase();
  return nav.startsWith('pt') ? 'pt' : 'en';
}

let lang = detectLang();
if (typeof document !== 'undefined') document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

export function getLang() { return lang; }

function resolver(key) {
  const dict = DICT[lang] || DICT.pt;
  if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
  if (Object.prototype.hasOwnProperty.call(DICT.pt, key)) {
    console.warn('dd-i18n: falta a chave "' + key + '" em "' + lang + '", usando pt');
    return DICT.pt[key];
  }
  console.warn('dd-i18n: chave desconhecida "' + key + '"');
  return key;
}

export function t(key, vars) {
  let s = resolver(key);
  if (vars) for (const k of Object.keys(vars)) s = s.split('{' + k + '}').join(String(vars[k]));
  return s;
}

// "1 acesso" / "3 acessos" (pt) · "1 seat" / "3 seats" (en) — plural simples, suficiente pro par pt/en
export function seatsLabel(n) {
  return t(n === 1 ? 'plans.seat-one' : 'plans.seat-other', { n });
}

// só a palavra ("acesso"/"acessos"), para compor frases que já têm o número em outro lugar
export function seatWord(n) {
  return t(n === 1 ? 'common.seat-word-one' : 'common.seat-word-other');
}

export function applyI18n(root) {
  const base = root || document;
  base.querySelectorAll('[data-i18n]').forEach((n) => { n.textContent = t(n.getAttribute('data-i18n')); });
  base.querySelectorAll('[data-i18n-html]').forEach((n) => { n.innerHTML = t(n.getAttribute('data-i18n-html')); });
  base.querySelectorAll('[data-i18n-attr]').forEach((n) => {
    for (const par of n.getAttribute('data-i18n-attr').split(';')) {
      const partes = par.split(':');
      const attr = partes[0] && partes[0].trim();
      const key = partes[1] && partes[1].trim();
      if (attr && key) n.setAttribute(attr, t(key));
    }
  });
}

export function setLang(novo) {
  if (novo !== 'pt' && novo !== 'en') return;
  if (novo === lang) return;
  lang = novo;
  saveLang(novo);
  document.documentElement.lang = novo === 'pt' ? 'pt-BR' : 'en';
  applyI18n();
  document.dispatchEvent(new CustomEvent('dd-lang-changed', { detail: { lang: novo } }));
}

// ---------- formatos (Intl): moeda continua BRL nas duas línguas, só o formato muda ----------
export function fmtBRL(cents) {
  const locale = lang === 'pt' ? 'pt-BR' : 'en-US';
  const v = (cents || 0) / 100;
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(v);
}

// versão "por computador": sem centavos quando o valor é inteiro (mantém o comportamento antigo)
export function fmtBRLCompact(cents) {
  const locale = lang === 'pt' ? 'pt-BR' : 'en-US';
  const v = (cents || 0) / 100;
  const casas = Number.isInteger(v) ? 0 : 2;
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL', minimumFractionDigits: casas, maximumFractionDigits: casas }).format(v);
}

export function fmtDate(iso) {
  if (!iso) return '—';
  const locale = lang === 'pt' ? 'pt-BR' : 'en-US';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(new Date(iso));
}

export function fmtDateTime(iso) {
  if (!iso) return '—';
  const locale = lang === 'pt' ? 'pt-BR' : 'en-US';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
}

// "agora" / "há 5 min" / "há 2 h" / data curta — mesmo corte do antigo quando(), com Intl.RelativeTimeFormat
export function fmtRelative(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 90) return t('ui.agora');
  if (diff < 3600) return t('ui.ha-min', { n: Math.round(diff / 60) });
  if (diff < 86400) return t('ui.ha-h', { n: Math.round(diff / 3600) });
  return fmtDate(iso);
}

// ---------- botão PT | EN, montado no topo por dd-topo.js ----------
export function montarSeletorIdioma() {
  const box = document.createElement('div');
  box.className = 'langsw';
  box.setAttribute('role', 'group');
  box.setAttribute('data-i18n-attr', 'aria-label:lang.switch-aria');
  box.setAttribute('aria-label', t('lang.switch-aria'));

  // Bandeiras (23/09, pedido do Diogo): Brasil ao lado do PT, Estados Unidos ao lado do EN. SVG inline
  // simplificado (emoji de bandeira nao renderiza no Windows). O texto fica num <span> proprio para o
  // applyI18n trocar so ele e nao apagar a bandeira.
  const bandeira = (qual) => {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'flag');
    svg.setAttribute('viewBox', '0 0 14 10');
    svg.setAttribute('aria-hidden', 'true');
    const el = (tag, attrs) => { const e = document.createElementNS(ns, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); svg.appendChild(e); return e; };
    if (qual === 'br') {
      el('rect', { width: 14, height: 10, fill: '#009c3b' });
      el('polygon', { points: '7,1.2 12.6,5 7,8.8 1.4,5', fill: '#ffdf00' });
      el('circle', { cx: 7, cy: 5, r: 2.1, fill: '#002776' });
    } else {
      el('rect', { width: 14, height: 10, fill: '#fff' });
      for (let i = 0; i < 7; i++) if (i % 2 === 0) el('rect', { y: i * 10 / 7, width: 14, height: 10 / 7, fill: '#b22234' });
      el('rect', { width: 6, height: 5.7, fill: '#3c3b6e' });
    }
    return svg;
  };
  const rotulo = (chave) => { const sp = document.createElement('span'); sp.setAttribute('data-i18n', chave); sp.textContent = t(chave); return sp; };

  const bPt = document.createElement('button');
  bPt.type = 'button';
  bPt.dataset.lang = 'pt';
  bPt.setAttribute('data-i18n-attr', 'aria-label:lang.pt-aria');
  bPt.appendChild(bandeira('br'));
  bPt.appendChild(rotulo('lang.pt'));
  bPt.setAttribute('aria-label', t('lang.pt-aria'));

  const sep = document.createElement('i');
  sep.textContent = '|';
  sep.setAttribute('aria-hidden', 'true');

  const bEn = document.createElement('button');
  bEn.type = 'button';
  bEn.dataset.lang = 'en';
  bEn.setAttribute('data-i18n-attr', 'aria-label:lang.en-aria');
  bEn.appendChild(bandeira('us'));
  bEn.appendChild(rotulo('lang.en'));
  bEn.setAttribute('aria-label', t('lang.en-aria'));

  const pinta = () => {
    bPt.classList.toggle('on', getLang() === 'pt');
    bPt.setAttribute('aria-current', getLang() === 'pt' ? 'true' : 'false');
    bEn.classList.toggle('on', getLang() === 'en');
    bEn.setAttribute('aria-current', getLang() === 'en' ? 'true' : 'false');
  };
  bPt.addEventListener('click', () => { setLang('pt'); pinta(); });
  bEn.addEventListener('click', () => { setLang('en'); pinta(); });
  document.addEventListener('dd-lang-changed', pinta);
  pinta();

  box.append(bPt, sep, bEn);
  return box;
}

// aplica assim que o módulo carrega: cobre o texto estático de todas as páginas antes de
// qualquer outro script (dd-topo.js, dd-precos.js etc.) rodar
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => applyI18n());
  else applyI18n();
}
