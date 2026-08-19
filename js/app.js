'use strict';

// ============================================================================
// App — estado, renderização, eventos e operações de leitura/gravação
// ============================================================================

const state = {
  conn: null,
  model: defaultModel(),
  view: 'bank', // 'config' | 'bank'
  activeBank: 0,
  busy: false,
};

const DELAY_VALUES = ['Off', '1', '2', '3', '4', '5'];

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function hzToMhz(freqHz) {
  if (!freqHz) return '';
  return (freqHz / 1e6).toFixed(6).replace(/\.?0+$/, '');
}

function parseMhz(text) {
  const s = String(text).trim().replace(',', '.');
  if (!s) return 0;
  const v = parseFloat(s);
  if (Number.isNaN(v)) return NaN;
  return Math.round(v * 1e6);
}

function delayOpts(cur) {
  return DELAY_VALUES.map((v) => (
    `<option value="${v}" ${v === cur ? 'selected' : ''}>${v === 'Off' ? 'Off' : v + ' s'}</option>`
  )).join('');
}

function dirOpts(cur) {
  return `<option value="Up" ${cur === 'Up' ? 'selected' : ''}>Cima (Up)</option>` +
         `<option value="Dw" ${cur === 'Dw' ? 'selected' : ''}>Baixo (Dw)</option>`;
}

function toast(msg, type = 'info') {
  const el = $('#toast');
  el.textContent = msg;
  el.className = `toast ${type}`;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, type === 'error' ? 6000 : 3500);
}

function setProgress(pct, label) {
  $('#progress').value = pct;
  $('#progress-label').textContent = label;
}

const tipEl = $('#tooltip');
function showTip(wrap) {
  const text = wrap.getAttribute('data-tip');
  if (!text) return;
  tipEl.textContent = text;
  tipEl.hidden = false;
  const r = wrap.getBoundingClientRect();
  const tw = tipEl.offsetWidth;
  const th = tipEl.offsetHeight;
  let x = Math.round(r.left + r.width / 2 - tw / 2);
  x = Math.max(8, Math.min(x, window.innerWidth - tw - 8));
  let y = r.bottom + 8;
  if (y + th > window.innerHeight - 8) y = r.top - th - 8;
  tipEl.style.left = `${x}px`;
  tipEl.style.top = `${y}px`;
}
function hideTip() {
  tipEl.hidden = true;
}

function assertOk(line, ctx) {
  if (line.startsWith('ERR')) throw new Error(`${ctx}: erro de comando (${line})`);
  if (line.startsWith('NG')) throw new Error(`${ctx}: comando inválido no momento (${line})`);
}

// ---------------------------------------------------------------------------
// Renderização
// ---------------------------------------------------------------------------

function renderStatus() {
  const connected = !!state.conn && state.conn.connected;
  const btn = $('#btn-connect');
  btn.classList.toggle('connected', connected);
  btn.title = connected
    ? 'Clique para desconectar o rádio'
    : 'Conecte o rádio ao computador e escolha a porta serial';
  const canOp = connected && !state.busy;
  $('#btn-read').disabled = !canOp;
  $('#btn-write').disabled = !canOp;
  $('#btn-import').disabled = state.busy;
  $('#btn-export').disabled = state.busy;
  $('#banner-unsupported').hidden = ScannerConnection.supported();
}

function renderInfo() {
  const m = state.model;
  $('#info-model').textContent = m.meta.model || '—';
  $('#info-firmware').textContent = m.meta.firmware || '—';
  $('#cfg-bandplan').value = m.misc.bandPlan;
  $('#cfg-priority').value = m.priority;
  $('#cfg-keylock').checked = m.misc.keyLock;
  $('#cfg-vol').value = m.misc.vol;
  $('#cfg-vol-label').textContent = m.misc.vol;
  $('#cfg-sql').value = m.misc.sq;
  $('#cfg-sql-label').textContent = m.misc.sq;
  $('#cfg-gs-dly').innerHTML = delayOpts(m.generalSearch.dly);
  $('#cfg-gs-dir').innerHTML = dirOpts(m.generalSearch.dir);
  $('#cfg-cs-dly').innerHTML = delayOpts(m.customSearch.dly);
  $('#cfg-cs-dir').innerHTML = dirOpts(m.customSearch.dir);
  $('#cfg-cc-mode').value = m.closeCall.mode;
  $('#cfg-cc-beep').checked = m.closeCall.altBeep === 'On';
  $('#cfg-cc-light').checked = m.closeCall.altLight === 'On';
  renderCustomRanges();
  renderServices();
  renderCCBands();
  renderGL();
}

function renderCustomRanges() {
  const wrap = $('#custom-ranges');
  wrap.innerHTML = '';
  state.model.customs.forEach((c) => {
    const row = document.createElement('div');
    row.className = 'range-row';
    row.innerHTML = `
      <label class="mini" title="Ativar faixa"><input type="checkbox" data-range-on="${c.index}" ${c.on ? 'checked' : ''}> On</label>
      <input type="text" data-range-name="${c.index}" value="${esc(c.name)}" title="Nome da faixa">
      <input type="text" inputmode="decimal" data-range-low="${c.index}" value="${hzToMhz(c.lower)}" placeholder="MHz" title="Limite inferior (MHz)">
      <span class="sep">—</span>
      <input type="text" inputmode="decimal" data-range-high="${c.index}" value="${hzToMhz(c.upper)}" placeholder="MHz" title="Limite superior (MHz)">
    `;
    wrap.appendChild(row);
  });
}

function renderServices() {
  const wrap = $('#services-list');
  wrap.innerHTML = '';
  state.model.services.forEach((sv) => {
    const row = document.createElement('div');
    row.className = 'svc-row';
    row.innerHTML = `
      <span class="svc-name">${sv.index}. ${esc(sv.name)}</span>
      <select data-svc-dly="${sv.index}" title="Delay">${delayOpts(sv.dly)}</select>
      <select data-svc-dir="${sv.index}" title="Direção">${dirOpts(sv.dir)}</select>
    `;
    wrap.appendChild(row);
  });
}

function renderCCBands() {
  const wrap = $('#cc-bands');
  wrap.innerHTML = '';
  // Índice 1 é RSV (reservado) — não é editável
  RADIO.CC_BAND_BITS.forEach((name, i) => {
    if (i === 1) return;
    const label = document.createElement('label');
    label.className = 'mini';
    label.title = name;
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.dataset.ccband = i;
    cb.checked = state.model.closeCallBands[i] === 'On';
    label.appendChild(cb);
    label.appendChild(document.createTextNode(' ' + name));
    wrap.appendChild(label);
  });
}

function renderGL() {
  const list = $('#gl-list');
  list.innerHTML = '';
  const gl = state.model.globalLockouts;
  $('#gl-count').textContent = gl.length;
  if (gl.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'Nenhum lockout global (somente leitura).';
    list.appendChild(li);
    return;
  }
  gl.forEach((f) => {
    const li = document.createElement('li');
    li.textContent = hzToMhz(f) + ' MHz';
    list.appendChild(li);
  });
}

function renderBanks() {
  // abas principais estilo planilha (Configurações | Bancos de memória)
  $$('.sheet-tab').forEach((t) => t.classList.toggle('active', t.dataset.view === state.view));

  // sub-abas dos bancos (1-10)
  const tabs = $('#bank-tabs');
  tabs.innerHTML = '';
  state.model.banks.forEach((b) => {
    const count = b.channels.filter((c) => c.freqHz > 0).length;
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'sub-tab' + (b.index - 1 === state.activeBank ? ' active' : '') + (b.enabled ? '' : ' off');
    tab.dataset.bank = b.index;
    tab.title = `${b.name} — ${count} canais${b.enabled ? '' : ' (desabilitado no scan)'}`;
    tab.textContent = b.index;
    tabs.appendChild(tab);
  });

  const inConfig = state.view === 'config';
  $('#view-config').hidden = !inConfig;
  $('#view-bank').hidden = inConfig;

  const active = state.model.banks[state.activeBank];
  $('#bank-enabled').checked = !!active && active.enabled;
  if (!inConfig) renderBankTable();
}

function renderBankTable() {
  const tbody = $('#ch-tbody');
  tbody.innerHTML = '';
  const bank = state.model.banks[state.activeBank];
  if (!bank) return;
  bank.channels.forEach((ch) => {
    const invalid = ch.freqHz !== 0 && (ch.freqHz < 25e6 || ch.freqHz > 512e6);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="ch-num">${ch.index}</td>
      <td><input type="text" inputmode="decimal" class="freq-input ${invalid ? 'invalid' : ''}" data-ch="${ch.index}" value="${hzToMhz(ch.freqHz)}" placeholder="—"></td>
      <td><input type="checkbox" class="ch-dly" data-ch="${ch.index}" ${ch.dly === 'On' ? 'checked' : ''} title="Delay"></td>
      <td><input type="checkbox" class="ch-lo" data-ch="${ch.index}" ${(ch.lo === '1' || ch.lo === 'On') ? 'checked' : ''} title="Lockout"></td>
      <td><input type="checkbox" class="ch-prio" data-ch="${ch.index}" ${(ch.prio === 'On' || ch.prio === '1') ? 'checked' : ''} title="Priority"></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderAll() {
  renderInfo();
  renderBanks();
  renderStatus();
}

// ---------------------------------------------------------------------------
// Conexão
// ---------------------------------------------------------------------------

async function onConnect() {
  if (state.busy) {
    toast('Aguarde a operação em andamento terminar.', 'error');
    return;
  }
  // Se já estiver conectado, o clique desconecta
  if (state.conn && state.conn.connected) {
    await state.conn.close();
    state.conn = null;
    renderStatus();
    toast('Desconectado.');
    return;
  }
  if (!ScannerConnection.supported()) {
    toast('Web Serial não suportado. Use Chrome ou Edge em uma página HTTPS.', 'error');
    return;
  }
  try {
    const conn = new ScannerConnection();
    await conn.requestPort();
    await conn.open();
    state.conn = conn;
    renderStatus();
    toast('Rádio conectado!');
    try {
      const mdl = (await conn.query('MDL', 3000)).split(',');
      state.model.meta.model = mdl[1] || '';
      const ver = (await conn.query('VER', 3000)).split(',');
      state.model.meta.firmware = ver[1] || '';
      renderInfo();
    } catch (err) {
      toast('Conectado à porta, mas o rádio não respondeu. Verifique o cabo e o estado do rádio.', 'error');
    }
  } catch (err) {
    toast(`Falha ao conectar: ${err.message}`, 'error');
  }
}

// ---------------------------------------------------------------------------
// Leitura / gravação
// ---------------------------------------------------------------------------

async function onRead() {
  if (!state.conn || !state.conn.connected) {
    toast('Conecte o rádio primeiro.', 'error');
    return;
  }
  state.busy = true;
  renderStatus();
  $('#progress-wrap').hidden = false;
  setProgress(0, 'Entrando em modo de programação...');
  let connectionOk = true;

  try {
    const conn = state.conn;
    const m = state.model;

    await conn.query('PRG');
    try {
      const mdl = (await conn.query('MDL')).split(',');
      m.meta.model = mdl[1] || '';

      const ver = (await conn.query('VER')).split(',');
      m.meta.firmware = ver[1] || '';

      const bpl = (await conn.query('BPL')).split(',');
      m.misc.bandPlan = RADIO.BANDPLAN_LABEL[bpl[1]] || m.misc.bandPlan;

      const kbp = (await conn.query('KBP')).split(',');
      m.misc.keyLock = (kbp[2] || '0') === '1';

      const pri = (await conn.query('PRI')).split(',');
      m.priority = RADIO.PRI_LABEL[pri[1]] || m.priority;

      const scg = (await conn.query('SCG')).split(',')[1] || '';
      m.banks.forEach((b, i) => { b.enabled = scg[i] === '0'; });

      const vol = (await conn.query('VOL')).split(',');
      m.misc.vol = parseInt(vol[1], 10) || 0;

      const sql = (await conn.query('SQL')).split(',');
      m.misc.sq = parseInt(sql[1], 10) || 0;

      const clc = (await conn.query('CLC')).split(',');
      m.closeCall.mode = RADIO.CC_MODE_LABEL[clc[1]] || 'Off';
      m.closeCall.altBeep = clc[2] === '1' ? 'On' : 'Off';
      m.closeCall.altLight = clc[3] === '1' ? 'On' : 'Off';
      const ccBits = String(clc[4] || '').padStart(5, '0').split('').map((x) => x === '1');
      m.closeCallBands = ccBits.map((on, i) => (i === 1 ? '' : (on ? 'On' : 'Off')));

      const csg = (await conn.query('CSG')).split(',');
      const csgBits = (csg[1] || '').split('');
      m.customs.forEach((c, i) => { c.on = csgBits[i] === '0'; });
      m.customSearch.dly = RADIO.radioToDly(csg[2]);
      m.customSearch.dir = RADIO.radioToDir(csg[3]);

      for (let i = 1; i <= 10; i++) {
        const csp = (await conn.query(`CSP,${i}`)).split(',');
        m.customs[i - 1].lower = RADIO.radioToFreq(csp[2]);
        m.customs[i - 1].upper = RADIO.radioToFreq(csp[3]);
      }

      const sco = (await conn.query('SCO')).split(',');
      m.generalSearch.dly = RADIO.radioToDly(sco[1]);
      m.generalSearch.dir = RADIO.radioToDir(sco[3]);

      for (let i = 1; i <= 10; i++) {
        const ssp = (await conn.query(`SSP,${i}`)).split(',');
        const sv = m.services[i - 1];
        sv.dly = RADIO.radioToDly(ssp[2]);
        sv.dir = RADIO.radioToDir(ssp[3]);
      }

      setProgress(5, 'Lendo canais...');
      for (let i = 1; i <= RADIO.NUM_CHANNELS; i++) {
        const cin = (await conn.query(`CIN,${i}`)).split(',');
        const bank = m.banks[Math.floor((i - 1) / RADIO.CHANNELS_PER_BANK)];
        const ch = bank.channels[(i - 1) % RADIO.CHANNELS_PER_BANK];
        ch.freqHz = RADIO.radioToFreq(cin[3]);
        ch.dly = cin[6] === '1' ? 'On' : 'Off';
        ch.lo = cin[7] || '0';
        ch.prio = cin[8] === '1' ? 'On' : 'Off';
        setProgress(Math.round(5 + (i / RADIO.NUM_CHANNELS) * 95), `Lendo canal ${i}/300...`);
      }

      // Lockouts globais (best-effort — não interrompe a leitura se falhar)
      m.globalLockouts = [];
      try {
        let last = '0';
        const seen = new Set();
        for (let n = 0; n < 200; n++) {
          const r = (await conn.query(`GLF,${last}`, 4000)).split(',');
          const v = r[1];
          if (v === undefined || v === '-1') break;
          if (seen.has(v)) break;
          seen.add(v);
          const f = RADIO.radioToFreq(v);
          if (f <= 0) break;
          m.globalLockouts.push(f);
          last = v;
        }
      } catch (err) {
        /* lockouts globais são opcionais */
      }
    } finally {
      try { await conn.query('EPG'); } catch (e) { /* noop */ }
    }

    connectionOk = state.conn.connected;
    if (connectionOk) {
      toast('Leitura concluída com sucesso!');
    } else {
      toast('Leitura concluída, mas a conexão foi perdida — reconecte o rádio.', 'error');
    }
  } catch (err) {
    toast(`Erro ao ler: ${err.message}`, 'error');
  } finally {
    state.busy = false;
    $('#progress-wrap').hidden = true;
    renderInfo();
    renderBanks();
    renderStatus();
  }
}

async function onWrite() {
  if (!state.conn || !state.conn.connected) {
    toast('Conecte o rádio primeiro.', 'error');
    return;
  }
  const m = state.model;
  if (m.banks.every((b) => !b.enabled)) {
    toast('Pelo menos um banco deve permanecer habilitado.', 'error');
    return;
  }
  openWriteModal();
}

function openWriteModal() {
  $('#modal-clear').checked = false;
  $('#write-modal').hidden = false;
  $('#modal-confirm').focus();
}

function closeWriteModal() {
  $('#write-modal').hidden = true;
}

function openHelpModal() {
  $('#help-modal').hidden = false;
  $('#help-modal-close').focus();
}

function closeHelpModal() {
  $('#help-modal').hidden = true;
}

async function confirmWrite() {
  const clearFirst = $('#modal-clear').checked;
  closeWriteModal();
  await doWrite(clearFirst);
}

async function doWrite(clearFirst) {
  const m = state.model;
  state.busy = true;
  renderStatus();
  $('#progress-wrap').hidden = false;
  setProgress(0, 'Preparando...');

  try {
    const conn = state.conn;

    await conn.query('PRG');
    try {
      if (clearFirst) {
        setProgress(0, 'Limpando memória (pode levar ~1 minuto)...');
        const r = await conn.query('CLR', 90000);
        assertOk(r, 'CLR');
        setProgress(1, 'Memória limpa.');
      }

      const bpl = (await conn.query(`BPL,${RADIO.BANDPLAN_VALUE[m.misc.bandPlan] || '0'}`));
      assertOk(bpl, 'BPL');
      const kbp = (await conn.query(`KBP,0,${m.misc.keyLock ? '1' : '0'}`));
      assertOk(kbp, 'KBP');
      const pri = (await conn.query(`PRI,${RADIO.PRI_VALUE[m.priority] || '0'}`));
      assertOk(pri, 'PRI');
      const scg = (await conn.query(`SCG,${m.banks.map((b) => (b.enabled ? '0' : '1')).join('')}`));
      assertOk(scg, 'SCG');

      const ccMode = RADIO.CC_MODE_VALUE[m.closeCall.mode] || '0';
      const ccBits = m.closeCallBands.map((v, i) => (i === 1 ? 0 : (v === 'On' ? 1 : 0))).join('');
      const clc = (await conn.query(`CLC,${ccMode},${m.closeCall.altBeep === 'On' ? 1 : 0},${m.closeCall.altLight === 'On' ? 1 : 0},${ccBits},`));
      assertOk(clc, 'CLC');

      const csgBits = m.customs.map((c) => (c.on ? '0' : '1')).join('');
      const csg = (await conn.query(`CSG,${csgBits},${RADIO.dlyToRadio(m.customSearch.dly)},${RADIO.dirToRadio(m.customSearch.dir)}`));
      assertOk(csg, 'CSG');

      for (let i = 1; i <= 10; i++) {
        const c = m.customs[i - 1];
        const csp = (await conn.query(`CSP,${i},${RADIO.freqToRadio(c.lower)},${RADIO.freqToRadio(c.upper)}`));
        assertOk(csp, `CSP ${i}`);
      }

      const sco = (await conn.query(`SCO,${RADIO.dlyToRadio(m.generalSearch.dly)},,${RADIO.dirToRadio(m.generalSearch.dir)}`));
      assertOk(sco, 'SCO');

      for (let i = 1; i <= 10; i++) {
        const sv = m.services[i - 1];
        const ssp = (await conn.query(`SSP,${i},${RADIO.dlyToRadio(sv.dly)},${RADIO.dirToRadio(sv.dir)}`));
        assertOk(ssp, `SSP ${i}`);
      }

      for (let i = 1; i <= RADIO.NUM_CHANNELS; i++) {
        const bank = m.banks[Math.floor((i - 1) / RADIO.CHANNELS_PER_BANK)];
        const ch = bank.channels[(i - 1) % RADIO.CHANNELS_PER_BANK];
        const frq = String(RADIO.freqToRadio(ch.freqHz)).padStart(8, '0');
        const dly = ch.dly === 'On' ? '1' : '0';
        const lo = (ch.lo === '1' || ch.lo === 'On') ? '1' : '0';
        const prio = (ch.prio === 'On' || ch.prio === '1') ? '1' : '0';
        const cin = (await conn.query(`CIN,${i},,${frq},,,${dly},${lo},${prio}`));
        assertOk(cin, `CIN ${i}`);
        setProgress(Math.round((i / RADIO.NUM_CHANNELS) * 100), `Gravando canal ${i}/300...`);
      }
    } finally {
      try { await conn.query('EPG'); } catch (e) { /* noop */ }
    }

    // Volume e squelch não exigem modo de programação
    await conn.query(`VOL,${m.misc.vol}`);
    await conn.query(`SQL,${m.misc.sq}`);

    toast('Configuração gravada no rádio!');
  } catch (err) {
    toast(`Erro ao gravar: ${err.message}`, 'error');
  } finally {
    state.busy = false;
    $('#progress-wrap').hidden = true;
    renderStatus();
  }
}

// ---------------------------------------------------------------------------
// Arquivo (importar / exportar)
// ---------------------------------------------------------------------------

function onExport() {
  const text = exportConfigFile(state.model);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = `bc75xlt_${stamp}.bc75xlt_ss`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast('Arquivo salvo!');
}

function onImport(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state.model = parseConfigFile(String(reader.result));
      state.model.meta.filename = file.name;
      renderInfo();
      renderBanks();
      toast(`Arquivo "${file.name}" importado!`);
    } catch (err) {
      toast(`Erro ao importar: ${err.message}`, 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// ---------------------------------------------------------------------------
// Eventos / inicialização
// ---------------------------------------------------------------------------

function init() {
  $('#btn-connect').addEventListener('click', onConnect);
  $('#btn-read').addEventListener('click', onRead);
  $('#btn-write').addEventListener('click', onWrite);
  $('#btn-import').addEventListener('click', () => $('#file-input').click());
  $('#btn-export').addEventListener('click', onExport);
  $('#file-input').addEventListener('change', onImport);

  $('#modal-confirm').addEventListener('click', confirmWrite);
  $('#modal-cancel').addEventListener('click', closeWriteModal);
  $('#write-modal').addEventListener('click', (e) => {
    if (e.target === $('#write-modal')) closeWriteModal();
  });
  $('#btn-help').addEventListener('click', openHelpModal);
  $('#help-modal-close').addEventListener('click', closeHelpModal);
  $('#help-modal').addEventListener('click', (e) => {
    if (e.target === $('#help-modal')) closeHelpModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$('#write-modal').hidden) closeWriteModal();
    else if (!$('#help-modal').hidden) closeHelpModal();
  });

  $$('.icon-wrap[data-tip]').forEach((wrap) => {
    wrap.addEventListener('mouseenter', () => showTip(wrap));
    wrap.addEventListener('mouseleave', hideTip);
  });
  window.addEventListener('scroll', hideTip, true);
  window.addEventListener('resize', hideTip);

  $('#cfg-bandplan').addEventListener('change', (e) => { state.model.misc.bandPlan = e.target.value; });
  $('#cfg-priority').addEventListener('change', (e) => { state.model.priority = e.target.value; });
  $('#cfg-keylock').addEventListener('change', (e) => { state.model.misc.keyLock = e.target.checked; });
  $('#cfg-vol').addEventListener('input', (e) => {
    state.model.misc.vol = +e.target.value;
    $('#cfg-vol-label').textContent = e.target.value;
  });
  $('#cfg-sql').addEventListener('input', (e) => {
    state.model.misc.sq = +e.target.value;
    $('#cfg-sql-label').textContent = e.target.value;
  });
  $('#cfg-gs-dly').addEventListener('change', (e) => { state.model.generalSearch.dly = e.target.value; });
  $('#cfg-gs-dir').addEventListener('change', (e) => { state.model.generalSearch.dir = e.target.value; });
  $('#cfg-cs-dly').addEventListener('change', (e) => { state.model.customSearch.dly = e.target.value; });
  $('#cfg-cs-dir').addEventListener('change', (e) => { state.model.customSearch.dir = e.target.value; });
  $('#cfg-cc-mode').addEventListener('change', (e) => { state.model.closeCall.mode = e.target.value; });
  $('#cfg-cc-beep').addEventListener('change', (e) => { state.model.closeCall.altBeep = e.target.checked ? 'On' : 'Off'; });
  $('#cfg-cc-light').addEventListener('change', (e) => { state.model.closeCall.altLight = e.target.checked ? 'On' : 'Off'; });

  $('#bank-enabled').addEventListener('change', (e) => {
    const bank = state.model.banks[state.activeBank];
    if (!bank) return;
    bank.enabled = e.target.checked;
    renderBanks();
    toast(`Banco ${bank.index} ${bank.enabled ? 'habilitado' : 'desabilitado'} no scan.`);
  });

  $('#custom-ranges').addEventListener('change', (e) => {
    const t = e.target;
    const idx = +(t.dataset.rangeOn ?? t.dataset.rangeName ?? t.dataset.rangeLow ?? t.dataset.rangeHigh);
    const c = state.model.customs.find((x) => x.index === idx);
    if (!c) return;
    if (t.dataset.rangeOn !== undefined) c.on = t.checked;
    else if (t.dataset.rangeName !== undefined) c.name = t.value;
    else if (t.dataset.rangeLow !== undefined) c.lower = parseMhz(t.value) || 0;
    else if (t.dataset.rangeHigh !== undefined) c.upper = parseMhz(t.value) || 0;
  });

  $('#services-list').addEventListener('change', (e) => {
    const t = e.target;
    const idx = +(t.dataset.svcDly ?? t.dataset.svcDir);
    const sv = state.model.services.find((x) => x.index === idx);
    if (!sv) return;
    if (t.dataset.svcDly !== undefined) sv.dly = t.value;
    else if (t.dataset.svcDir !== undefined) sv.dir = t.value;
  });

  $('#cc-bands').addEventListener('change', (e) => {
    const idx = +e.target.dataset.ccband;
    state.model.closeCallBands[idx] = e.target.checked ? 'On' : 'Off';
  });

  $('.sheet-tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.sheet-tab');
    if (!tab) return;
    state.view = tab.dataset.view;
    renderBanks();
  });

  $('#bank-tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('[data-bank]');
    if (!tab) return;
    state.view = 'bank';
    state.activeBank = +tab.dataset.bank - 1;
    renderBanks();
  });

  $('#btn-clear-bank').addEventListener('click', () => {
    const bank = state.model.banks[state.activeBank];
    if (bank) {
      bank.channels.forEach((c) => { c.freqHz = 0; });
      renderBanks();
      toast(`Banco ${bank.index} limpo.`);
    }
  });

  $('#ch-tbody').addEventListener('change', (e) => {
    const t = e.target;
    const idx = +t.dataset.ch;
    const bank = state.model.banks[state.activeBank];
    const ch = bank && bank.channels.find((x) => x.index === idx);
    if (!ch) return;
    if (t.classList.contains('freq-input')) {
      const v = parseMhz(t.value);
      if (Number.isNaN(v)) {
        toast('Frequência inválida.', 'error');
        return;
      }
      ch.freqHz = v;
      renderBankTable();
    } else if (t.classList.contains('ch-dly')) {
      ch.dly = t.checked ? 'On' : 'Off';
    } else if (t.classList.contains('ch-lo')) {
      ch.lo = t.checked ? '1' : '0';
    } else if (t.classList.contains('ch-prio')) {
      ch.prio = t.checked ? 'On' : 'Off';
    }
  });

  window.addEventListener('beforeunload', () => {
    if (state.conn) {
      try { state.conn.close(); } catch (err) { /* noop */ }
    }
  });

  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
