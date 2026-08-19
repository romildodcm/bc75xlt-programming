'use strict';

// ============================================================================
// Internacionalização (pt-BR / en)
// O idioma padrão vem do navegador (pt se for português, senão en).
// ============================================================================

const I18N = {
  pt: {
    pageTitle: 'BC75XLT Web Programmer — Programar o rádio scanner pelo navegador',
    pageDesc: 'Programador web para o rádio scanner Uniden BC75XLT / UBC75XLT via Web Serial API: leia, edite e grave frequências e configurações direto pelo navegador, sem instalar software. Funciona no Chrome e Edge.',
    subtitle: 'Programador do rádio via navegador (Web Serial) — Uniden BC75XLT / UBC75XLT',
    connect: 'Conectar',
    connectTipOff: 'Conecte o rádio ao computador e escolha a porta serial',
    connectTipOn: 'Clique para desconectar o rádio',
    readTip: 'Ler do rádio (carrega tudo)',
    writeTip: 'Gravar no rádio (envia tudo)',
    importTip: 'Importar arquivo (.bc75xlt_ss)',
    exportTip: 'Salvar arquivo (.bc75xlt_ss)',
    langTip: 'Idioma (Português / English)',
    banner: 'Seu navegador não suporta a <b>Web Serial API</b>. Use <b>Google Chrome</b> ou <b>Microsoft Edge</b> em uma página <b>HTTPS</b> (o GitHub Pages fornece HTTPS automaticamente).',
    helpTitle: 'Como usar',
    helpStep1: 'Conecte o rádio ao computador pelo cabo USB (driver CP210x instalado).',
    helpStep2: 'Clique em <b>Conectar rádio</b> e escolha a porta serial na janela do navegador.',
    helpStep3: 'Use o botão <b>Ler do rádio</b> (ícone de download, no topo) para carregar tudo do rádio, ou <b>Importar arquivo</b> para carregar um <code>.bc75xlt_ss</code>.',
    helpStep4: 'Edite as frequências nas abas de banco e as configurações na aba <b>Configurações</b>.',
    helpStep5: 'Use o botão <b>Gravar no rádio</b> (ícone de upload, no topo) para enviar ao rádio — um modal vai perguntar se você quer limpar a memória antes.',
    helpStep6: 'Use <b>Salvar arquivo</b> para baixar um arquivo <code>.bc75xlt_ss</code> compatível com o software original.',
    helpNote: 'A comunicação é feita direto pelo navegador (Web Serial API) — nenhum dado sai do seu computador. Requer <b>Chrome</b> ou <b>Edge</b> em uma página HTTPS.',
    gotIt: 'Entendi',
    tabConfig: 'Configurações',
    tabBanks: 'Bancos de memória',
    secRadio: 'Rádio',
    fieldModelo: 'Modelo',
    fieldFirmware: 'Firmware',
    fieldBandPlan: 'Band Plan',
    fieldPrioridade: 'Prioridade',
    fieldVolume: 'Volume',
    fieldSquelch: 'Squelch',
    fieldKeyLock: 'Key Lock',
    radioTip: 'Configurações gerais do rádio.',
    modeloTip: 'Modelo do rádio, lido do próprio rádio (ex.: BC75XLT).',
    firmwareTip: 'Versão do firmware do rádio, lida do próprio rádio.',
    bandPlanTip: 'Plano de banda: define a grade de passos de frequência (USA ou Canadá).',
    priorityTip: 'Modo de prioridade: verifica canais de prioridade durante a varredura (Off, On, Plus On ou DND).',
    volumeTip: 'Nível de volume do rádio (0 a 15).',
    squelchTip: 'Squelch: silencia o ruído de fundo entre transmissões (0 = aberto, 15 = fechado).',
    keyLockTip: 'Key Lock: trava o teclado do rádio para evitar acionamento acidental.',
    secPesquisaGeral: 'Pesquisa geral',
    generalSearchTip: 'Pesquisa livre por frequências, com delay e direção definidos.',
    fieldDelay: 'Delay',
    fieldDirecao: 'Direção',
    secPesquisaCustomizada: 'Pesquisa customizada',
    customSearchTip: 'Faixas de frequência customizadas para pesquisa (até 10, com limites e ativação).',
    hintCustom: 'Delay/direção das faixas customizadas e até 10 faixas de frequência (CSG/CSP).',
    secCloseCall: 'Close Call',
    closeCallTip: 'Close Call: captura sinais fortes próximos ao rádio, sem precisar digitar frequências.',
    fieldModo: 'Modo',
    fieldAlertaSonoro: 'Alerta sonoro',
    fieldAlertaVisual: 'Alerta visual',
    secServicos: 'Serviços (Service Search)',
    servicesTip: 'Pesquisa por serviços predefinidos (WX, Polícia, Bombeiros, Marinha, HAM, Ferrovias, CB, etc.).',
    lockouts: 'Lockouts globais',
    lockoutsTip: 'Frequências travadas globalmente (ignoradas em todas as pesquisas).',
    noGlobalLockouts: 'Nenhum lockout global (somente leitura).',
    scan: 'Scan',
    scanTip: 'Scan: habilita ou desabilita este banco na varredura (SCG). Quando desligado, o rádio pula este banco durante o scan.',
    clear: 'Limpar',
    clearTip: 'Limpar as frequências do banco atual',
    paste: 'Colar',
    pasteTip: 'Colar frequências de uma planilha (Excel)',
    pasteTitle: 'Colar frequências',
    pasteDesc: 'Cole uma coluna do Excel — uma frequência por linha (vírgula ou ponto como decimal). As frequências preenchem os canais a partir do canal escolhido abaixo.',
    pasteStart: 'Iniciar no canal',
    pasteConfirm: 'Colar',
    pasteResult: '{0} frequência(s) aplicada(s); {1} linha(s) ignorada(s).',
    pasteInvalid: 'Nenhuma frequência válida para colar.',
    colCH: 'CH',
    colFreq: 'Frequência (MHz)',
    colDLY: 'DLY',
    colLOCK: 'LOCK',
    colPRI: 'PRI',
    dlyTip: 'Delay: pausa a varredura por 2 segundos ao receber uma transmissão',
    lockTip: 'Lockout: ignora este canal durante a varredura',
    priTip: 'Prioridade: monitora este canal com prioridade durante a varredura',
    clearBankTitle: 'Limpar banco',
    clearBankDesc: 'Tem certeza que deseja apagar as frequências deste banco?',
    clearBankDescDyn: 'Tem certeza que deseja apagar todas as frequências do {0} (canais {1})?',
    cancel: 'Cancelar',
    confirmClear: 'Limpar',
    writeTitle: 'Gravar no rádio',
    writeDesc: 'A gravação enviará as configurações e frequências atuais da página para o rádio.',
    writeClearOption: 'Limpar toda a memória antes de gravar',
    writeClearExplanation: 'Executa o comando <b>CLR</b>: apaga todos os canais e configurações, voltando o rádio aos padrões de fábrica, antes de enviar os novos dados. Use quando quiser começar do zero (leva cerca de 1 minuto).',
    confirmWrite: 'Confirmar gravação',
    footerBy: 'Desenvolvido por',
    repoLink: 'Repositório no GitHub',
    needConnect: 'Conecte o rádio primeiro.',
    webSerialUnsupported: 'Web Serial não suportado. Use Chrome ou Edge em uma página HTTPS.',
    atLeastOneBank: 'Pelo menos um banco deve permanecer habilitado.',
    waitBusy: 'Aguarde a operação em andamento terminar.',
    disconnected: 'Desconectado.',
    connectedOk: 'Rádio conectado!',
    noResponse: 'Conectado à porta, mas o rádio não respondeu. Verifique o cabo e o estado do rádio.',
    connectFail: 'Falha ao conectar: {0}',
    invalidFreq: 'Frequência inválida.',
    readDone: 'Leitura concluída com sucesso!',
    readLostConn: 'Leitura concluída, mas a conexão foi perdida — reconecte o rádio.',
    readFail: 'Erro ao ler: {0}',
    writeDone: 'Configuração gravada no rádio!',
    writeFail: 'Erro ao gravar: {0}',
    fileSaved: 'Arquivo salvo!',
    fileImported: 'Arquivo "{0}" importado!',
    importFail: 'Erro ao importar: {0}',
    bankCleared: 'Banco {0} limpo.',
    bankEnabled: 'Banco {0} habilitado no scan.',
    bankDisabled: 'Banco {0} desabilitado no scan.',
    preparing: 'Preparando...',
    clearing: 'Limpando memória (pode levar ~1 minuto)...',
    clearedOk: 'Memória limpa.',
    readingCh: 'Lendo canal {0}/300...',
    writingCh: 'Gravando canal {0}/300...',
    enteringProg: 'Entrando em modo de programação...',
    readingChannels: 'Lendo canais...',
    timeout: 'Sem resposta do rádio (timeout de {0} ms).',
    connAborted: 'Conexão abortada.',
    portClosed: 'Porta serial fechada.',
    portNotOpen: 'Porta serial não está aberta.',
    channels: 'canais',
    disabledScan: ' (desabilitado no scan)',
  },

  en: {
    pageTitle: 'BC75XLT Web Programmer — Program your scanner radio from the browser',
    pageDesc: 'Web programmer for the Uniden BC75XLT / UBC75XLT scanner radio via Web Serial API: read, edit and write frequencies and settings directly from the browser, no software to install. Works on Chrome and Edge.',
    subtitle: 'Radio programmer via browser (Web Serial) — Uniden BC75XLT / UBC75XLT',
    connect: 'Connect',
    connectTipOff: 'Connect the radio to the computer and pick the serial port',
    connectTipOn: 'Click to disconnect the radio',
    readTip: 'Read from radio (loads everything)',
    writeTip: 'Write to radio (sends everything)',
    importTip: 'Import file (.bc75xlt_ss)',
    exportTip: 'Save file (.bc75xlt_ss)',
    langTip: 'Language (Português / English)',
    banner: 'Your browser does not support the <b>Web Serial API</b>. Use <b>Google Chrome</b> or <b>Microsoft Edge</b> on an <b>HTTPS</b> page (GitHub Pages provides HTTPS automatically).',
    helpTitle: 'How to use',
    helpStep1: 'Connect the radio to the computer via USB cable (CP210x driver installed).',
    helpStep2: 'Click <b>Connect radio</b> and choose the serial port in the browser window.',
    helpStep3: 'Use the <b>Read from radio</b> button (download icon, at the top) to load everything from the radio, or <b>Import file</b> to load a <code>.bc75xlt_ss</code>.',
    helpStep4: 'Edit the frequencies in the bank tabs and the settings in the <b>Settings</b> tab.',
    helpStep5: 'Use the <b>Write to radio</b> button (upload icon, at the top) to send to the radio — a modal will ask if you want to clear the memory first.',
    helpStep6: 'Use <b>Save file</b> to download a <code>.bc75xlt_ss</code> file compatible with the original software.',
    helpNote: 'Communication happens directly in the browser (Web Serial API) — nothing leaves your computer. Requires <b>Chrome</b> or <b>Edge</b> on an HTTPS page.',
    gotIt: 'Got it',
    tabConfig: 'Settings',
    tabBanks: 'Memory banks',
    secRadio: 'Radio',
    fieldModelo: 'Model',
    fieldFirmware: 'Firmware',
    fieldBandPlan: 'Band Plan',
    fieldPrioridade: 'Priority',
    fieldVolume: 'Volume',
    fieldSquelch: 'Squelch',
    fieldKeyLock: 'Key Lock',
    radioTip: 'General radio settings.',
    modeloTip: 'Radio model, read from the radio itself (e.g. BC75XLT).',
    firmwareTip: 'Radio firmware version, read from the radio itself.',
    bandPlanTip: 'Band plan: defines the frequency step grid (USA or Canada).',
    priorityTip: 'Priority mode: checks priority channels during scanning (Off, On, Plus On or DND).',
    volumeTip: 'Radio volume level (0 to 15).',
    squelchTip: 'Squelch: silences background noise between transmissions (0 = open, 15 = closed).',
    keyLockTip: 'Key Lock: locks the radio keypad to prevent accidental presses.',
    secPesquisaGeral: 'General search',
    generalSearchTip: 'Free frequency search, with defined delay and direction.',
    fieldDelay: 'Delay',
    fieldDirecao: 'Direction',
    secPesquisaCustomizada: 'Custom search',
    customSearchTip: 'Custom frequency ranges for search (up to 10, with limits and enabling).',
    hintCustom: 'Delay/direction of the custom ranges and up to 10 frequency ranges (CSG/CSP).',
    secCloseCall: 'Close Call',
    closeCallTip: 'Close Call: captures strong signals near the radio, without typing frequencies.',
    fieldModo: 'Mode',
    fieldAlertaSonoro: 'Alert beep',
    fieldAlertaVisual: 'Alert light',
    secServicos: 'Services (Service Search)',
    servicesTip: 'Search by predefined services (WX, Police, Fire, Marine, HAM, Railroad, CB, etc.).',
    lockouts: 'Global lockouts',
    lockoutsTip: 'Frequencies locked globally (ignored in all searches).',
    noGlobalLockouts: 'No global lockouts (read only).',
    scan: 'Scan',
    scanTip: 'Scan: enables or disables this bank during scanning (SCG). When off, the radio skips this bank while scanning.',
    clear: 'Clear',
    clearTip: 'Clear the current bank frequencies',
    paste: 'Paste',
    pasteTip: 'Paste frequencies from a spreadsheet (Excel)',
    pasteTitle: 'Paste frequencies',
    pasteDesc: 'Paste an Excel column — one frequency per line (comma or dot as decimal). Frequencies fill the channels starting at the channel chosen below.',
    pasteStart: 'Start at channel',
    pasteConfirm: 'Paste',
    pasteResult: '{0} frequency(ies) applied; {1} line(s) skipped.',
    pasteInvalid: 'No valid frequencies to paste.',
    colCH: 'CH',
    colFreq: 'Frequency (MHz)',
    colDLY: 'DLY',
    colLOCK: 'LOCK',
    colPRI: 'PRI',
    dlyTip: 'Delay: pauses scanning for 2 seconds when a transmission is received',
    lockTip: 'Lockout: ignores this channel during scanning',
    priTip: 'Priority: monitors this channel with priority during scanning',
    clearBankTitle: 'Clear bank',
    clearBankDesc: 'Are you sure you want to clear this bank\'s frequencies?',
    clearBankDescDyn: 'Are you sure you want to clear all frequencies of {0} (channels {1})?',
    cancel: 'Cancel',
    confirmClear: 'Clear',
    writeTitle: 'Write to radio',
    writeDesc: 'Writing will send the current settings and frequencies from the page to the radio.',
    writeClearOption: 'Clear all memory before writing',
    writeClearExplanation: 'Runs the <b>CLR</b> command: erases all channels and settings, returning the radio to factory defaults, before sending the new data. Use when you want to start from scratch (takes about 1 minute).',
    confirmWrite: 'Confirm write',
    footerBy: 'Developed by',
    repoLink: 'GitHub repository',
    needConnect: 'Connect the radio first.',
    webSerialUnsupported: 'Web Serial not supported. Use Chrome or Edge on an HTTPS page.',
    atLeastOneBank: 'At least one bank must remain enabled.',
    waitBusy: 'Wait for the current operation to finish.',
    disconnected: 'Disconnected.',
    connectedOk: 'Radio connected!',
    noResponse: 'Connected to the port, but the radio did not respond. Check the cable and the radio state.',
    connectFail: 'Connection failed: {0}',
    invalidFreq: 'Invalid frequency.',
    readDone: 'Read completed successfully!',
    readLostConn: 'Read completed, but the connection was lost — reconnect the radio.',
    readFail: 'Error reading: {0}',
    writeDone: 'Settings written to the radio!',
    writeFail: 'Error writing: {0}',
    fileSaved: 'File saved!',
    fileImported: 'File "{0}" imported!',
    importFail: 'Error importing: {0}',
    bankCleared: 'Bank {0} cleared.',
    bankEnabled: 'Bank {0} enabled in scan.',
    bankDisabled: 'Bank {0} disabled in scan.',
    preparing: 'Preparing...',
    clearing: 'Clearing memory (may take ~1 minute)...',
    clearedOk: 'Memory cleared.',
    readingCh: 'Reading channel {0}/300...',
    writingCh: 'Writing channel {0}/300...',
    enteringProg: 'Entering programming mode...',
    readingChannels: 'Reading channels...',
    timeout: 'No response from radio (timeout of {0} ms).',
    connAborted: 'Connection aborted.',
    portClosed: 'Serial port closed.',
    portNotOpen: 'Serial port is not open.',
    channels: 'channels',
    disabledScan: ' (disabled in scan)',
  },
};

let LANG = 'pt';

function detectLang() {
  try {
    const saved = localStorage.getItem('bc75xlt-lang');
    if (saved === 'pt' || saved === 'en') return saved;
  } catch (err) { /* noop */ }
  return (navigator.language || 'en').toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

function t(key, ...args) {
  let s = (I18N[LANG] && I18N[LANG][key]) || I18N.pt[key] || key;
  args.forEach((a, i) => {
    s = s.replace(new RegExp(`\\{${i}\\}`, 'g'), String(a));
  });
  return s;
}

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-tip]').forEach((el) => {
    el.setAttribute('data-tip', t(el.dataset.i18nTip));
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
  const langBtn = document.getElementById('btn-lang');
  if (langBtn) {
    langBtn.title = t('langTip');
    const label = langBtn.querySelector('.lang-label');
    if (label) label.textContent = LANG.toUpperCase();
    const wrap = langBtn.closest('.icon-wrap');
    if (wrap) wrap.setAttribute('data-tip', t('langTip'));
  }
  document.title = t('pageTitle');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('pageDesc'));
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', t('pageTitle'));
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', t('pageDesc'));
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', t('pageTitle'));
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', t('pageDesc'));
  document.documentElement.lang = LANG;
}

function setLang(lang) {
  LANG = (lang === 'en' || lang === 'pt') ? lang : (detectLang() === 'pt' ? 'pt' : 'en');
  try { localStorage.setItem('bc75xlt-lang', LANG); } catch (err) { /* noop */ }
  applyLang();
  if (typeof renderAll === 'function') renderAll();
}

function initLang() {
  LANG = detectLang();
  applyLang();
}
