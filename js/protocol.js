'use strict';

// ============================================================================
// Uniden BC75XLT — protocolo serial via Web Serial API
// Baseado em BC75XLT_Protocol.pdf (Uniden) e no projeto mateusza/bearcatctl
//
// Protocolo:
//   - comandos em texto ASCII terminados com \r (CR)
//   - respostas são linhas terminadas com \r
//   - 57600 bps, 8N1, sem controle de fluxo
//   - comandos de acesso à memória só funcionam em Modo de Programação
//     (PRG entra, EPG sai)
// ============================================================================

const RADIO = {
  BAUD: 57600,
  NUM_BANKS: 10,
  CHANNELS_PER_BANK: 30,
  NUM_CHANNELS: 300,

  BANDPLAN_LABEL: { 0: 'USA', 1: 'Canada' },
  BANDPLAN_VALUE: { USA: '0', Canada: '1' },

  PRI_LABEL: { 0: 'Off', 1: 'On', 2: 'Plus', 3: 'DND' },
  PRI_VALUE: { Off: '0', On: '1', Plus: '2', DND: '3' },

  CC_MODE_LABEL: { 0: 'Off', 1: 'CC PRI', 2: 'CC DND' },
  CC_MODE_VALUE: { Off: '0', 'CC PRI': '1', 'CC DND': '2' },

  // Ordem dos bits de CC_BAND conforme o manual (bit0 = LSB)
  CC_BAND_BITS: ['UHF', 'RSV', 'VHF HIGH', 'AIR', 'VHF LOW'],

  SERVICE_NAMES: [
    'WX', 'Police', 'Fire/Emergency', 'Marine', 'Racing',
    'Civil Air', 'HAM Radio', 'Railroad', 'CB Radio', 'Other (FRS/GMRS/MURS)',
  ],

  // O campo FRQ do rádio é a frequência em unidades de 100 Hz (MHz * 10000)
  freqToRadio(freqHz) { return Math.round((freqHz || 0) / 100); },
  radioToFreq(frq) { return Math.round(parseInt(frq, 10) || 0) * 100; },

  dirToRadio(dir) { return dir === 'Dw' ? '1' : '0'; },
  radioToDir(d) { return d === '1' ? 'Dw' : 'Up'; },

  // O rádio guarda apenas 0 (off) / 1 (on) para delay
  dlyToRadio(dly) { return (dly === 'Off' || dly === '0' || dly === '') ? '0' : '1'; },
  radioToDly(d) { return d === '1' ? '2' : 'Off'; },
};

class ScannerConnection {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.buffer = '';
    this.broken = false;
  }

  static supported() {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  get connected() {
    return !!this.port && !!this.port.readable && !this.broken;
  }

  async requestPort() {
    this.port = await navigator.serial.requestPort();
    return this.port;
  }

  async open(baudRate = RADIO.BAUD) {
    await this.port.open({
      baudRate,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none',
      bufferSize: 4096,
    });
    this.reader = this.port.readable.getReader();
    this.writer = this.port.writable.getWriter();
    this.buffer = '';
    this.broken = false;
    try {
      // Descarta qualquer lixo que tenha ficado no buffer do rádio
      await this.send('');
      await this.readLine(1500);
    } catch (err) {
      /* não é problema */
    }
  }

  async send(command) {
    if (!this.writer) throw new Error(t('portNotOpen'));
    await this.writer.write(new TextEncoder().encode(command + '\r'));
  }

  async _readChunk() {
    for (;;) {
      const idx = this.buffer.indexOf('\r');
      if (idx >= 0) {
        const line = this.buffer.slice(0, idx);
        this.buffer = this.buffer.slice(idx + 1);
        return line;
      }
      let res;
      try {
        res = await this.reader.read();
      } catch (err) {
        if (this.broken) throw new Error(t('connAborted'));
        throw err;
      }
      if (res.done) throw new Error(t('portClosed'));
      if (res.value && res.value.length) {
        this.buffer += new TextDecoder().decode(res.value);
      }
    }
  }

  async readLine(timeoutMs = 3000) {
    if (this.broken) throw new Error(t('connAborted'));
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        this.broken = true;
        try { if (this.reader) this.reader.cancel('timeout'); } catch (e) { /* noop */ }
        reject(new Error(t('timeout', timeoutMs)));
      }, timeoutMs);
    });
    try {
      return await Promise.race([this._readChunk(), timeoutPromise]);
    } finally {
      clearTimeout(timer);
    }
  }

  async query(command, timeoutMs = 3000) {
    await this.send(command);
    return this.readLine(timeoutMs);
  }

  async close() {
    this.broken = true;
    try { if (this.reader) await this.reader.cancel(); } catch (e) { /* noop */ }
    try { if (this.writer) this.writer.releaseLock(); } catch (e) { /* noop */ }
    try { if (this.port && this.port.readable) await this.port.close(); } catch (e) { /* noop */ }
    this.port = null;
    this.reader = null;
    this.writer = null;
  }
}
