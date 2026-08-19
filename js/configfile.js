'use strict';

// ============================================================================
// Formato de arquivo de configuração do BC75XLT (.bc75xlt_ss)
// Texto com campos separados por TAB e linhas terminadas em CRLF.
// Mesmo formato usado pelo software original da Uniden.
//
// Estrutura das linhas (índice do campo separado por TAB):
//   Misc              Misc  [ ]  [ ]  [Off]  [ ]  [ ]  [sq] [vol] [bandPlan]
//   Priority          Priority [mode]
//   Service           Service [idx] [nome] [ ] [dly] [dir]
//   CustomSearch      CustomSearch [dly] [dir]
//   Custom            Custom [idx] [nome] [limiteBaixoHz] [limiteAltoHz] [On/Off]
//   CloseCall         CloseCall [mode] [beep] [light] [ ]
//   CloseCallBands    CloseCallBands [b1] [b2] [b3] [b4] [b5]
//   GeneralSearch     GeneralSearch [dly] [ ] [dir]
//   Conventional      Conventional [bank] [nome] [On/Off]
//   C-Freq            C-Freq [idx1-300] [nome] [freqHz] [ ] [ ] [dly] [lo] [prio]
// ============================================================================

const T = '\t';

function defaultModel() {
  const services = RADIO.SERVICE_NAMES.map((name, i) => ({
    index: i + 1,
    name,
    dly: '2',
    dir: 'Up',
  }));

  const customs = Array.from({ length: 10 }, (_, i) => ({
    index: i + 1,
    name: `Search Bank${i + 1}`,
    lower: 0,
    upper: 0,
    on: false,
  }));

  const banks = Array.from({ length: 10 }, (_, i) => ({
    index: i + 1,
    name: `Bank ${i + 1}`,
    enabled: true,
    channels: Array.from({ length: 30 }, (_, j) => ({
      index: i * 30 + j + 1,
      name: '',
      freqHz: 0,
      dly: 'Off',
      lo: '0',
      prio: 'Off',
    })),
  }));

  return {
    meta: { filename: '', model: '', firmware: '' },
    misc: { f3: 'Off', sq: 3, vol: 3, bandPlan: 'USA', keyLock: false },
    priority: 'Off',
    services,
    customSearch: { dly: '2', dir: 'Up' },
    customs,
    closeCall: { mode: 'Off', altBeep: 'Off', altLight: 'Off' },
    closeCallBands: ['Off', '', 'Off', 'Off', 'Off'],
    generalSearch: { dly: '2', dir: 'Up' },
    banks,
    globalLockouts: [],
  };
}

function parseConfigFile(text) {
  const m = defaultModel();
  const lines = text.split(/\r?\n/);

  for (const raw of lines) {
    if (!raw.trim()) continue;
    const f = raw.split('\t');
    switch (f[0]) {
      case 'Misc':
        m.misc.f3 = f[3] !== undefined ? f[3] : 'Off';
        m.misc.sq = parseInt(f[6], 10) || 7;
        m.misc.vol = parseInt(f[7], 10) || 4;
        m.misc.bandPlan = f[8] || 'USA';
        break;

      case 'Priority':
        m.priority = f[1] || 'Off';
        break;

      case 'Service': {
        const sv = m.services.find((s) => s.index === parseInt(f[1], 10));
        if (sv) {
          if (f[2] !== undefined) sv.name = f[2];
          if (f[4] !== undefined) sv.dly = f[4];
          if (f[5] !== undefined) sv.dir = f[5];
        }
        break;
      }

      case 'CustomSearch':
        m.customSearch = { dly: f[1], dir: f[2] };
        break;

      case 'Custom': {
        const c = m.customs.find((x) => x.index === parseInt(f[1], 10));
        if (c) {
          if (f[2] !== undefined) c.name = f[2];
          c.lower = parseInt(f[3], 10) || 0;
          c.upper = parseInt(f[4], 10) || 0;
          c.on = f[5] === 'On';
        }
        break;
      }

      case 'CloseCall':
        m.closeCall = { mode: f[1], altBeep: f[2], altLight: f[3] };
        break;

      case 'CloseCallBands':
        m.closeCallBands = [f[1], f[2], f[3], f[4], f[5]];
        break;

      case 'GeneralSearch':
        m.generalSearch = { dly: f[1], dir: f[3] };
        break;

      case 'Conventional': {
        const b = m.banks.find((x) => x.index === parseInt(f[1], 10));
        if (b) {
          if (f[2] !== undefined) b.name = f[2];
          b.enabled = f[3] === 'On';
        }
        break;
      }

      case 'C-Freq': {
        const gidx = parseInt(f[1], 10);
        if (gidx >= 1 && gidx <= RADIO.NUM_CHANNELS) {
          const bank = m.banks[Math.floor((gidx - 1) / RADIO.CHANNELS_PER_BANK)];
          const ch = bank.channels[(gidx - 1) % RADIO.CHANNELS_PER_BANK];
          ch.name = f[2] || '';
          ch.freqHz = parseInt(f[3], 10) || 0;
          if (f[6] !== undefined) ch.dly = f[6];
          if (f[7] !== undefined) ch.lo = f[7];
          if (f[8] !== undefined) ch.prio = f[8];
        }
        break;
      }

      default:
        break;
    }
  }

  return m;
}

function exportConfigFile(m) {
  const L = [];

  L.push(`Misc${T}${T}${T}${m.misc.f3}${T}${T}${T}${m.misc.sq}${T}${m.misc.vol}${T}${m.misc.bandPlan}`);
  L.push(`Priority${T}${m.priority}`);

  for (const sv of m.services) {
    L.push(`Service${T}${sv.index}${T}${sv.name}${T}${T}${sv.dly}${T}${sv.dir}`);
  }

  L.push(`CustomSearch${T}${m.customSearch.dly}${T}${m.customSearch.dir}`);
  for (const c of m.customs) {
    L.push(`Custom${T}${c.index}${T}${c.name}${T}${c.lower}${T}${c.upper}${T}${c.on ? 'On' : 'Off'}`);
  }

  L.push(`CloseCall${T}${m.closeCall.mode}${T}${m.closeCall.altBeep}${T}${m.closeCall.altLight}${T}`);
  L.push(`CloseCallBands${T}${m.closeCallBands.join(T)}`);
  L.push(`GeneralSearch${T}${m.generalSearch.dly}${T}${T}${m.generalSearch.dir}`);

  for (const b of m.banks) {
    L.push(`Conventional${T}${b.index}${T}${b.name}${T}${b.enabled ? 'On' : 'Off'}`);
    for (const ch of b.channels) {
      L.push(`C-Freq${T}${ch.index}${T}${ch.name}${T}${ch.freqHz}${T}${T}${T}${ch.dly}${T}${ch.lo}${T}${ch.prio}`);
    }
  }

  return L.join('\r\n') + '\r\n';
}
