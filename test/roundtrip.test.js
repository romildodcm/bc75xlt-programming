'use strict';

// Teste de round-trip do formato .bc75xlt_ss (Node.js)
// Executar:  node test/roundtrip.test.js
// Valida que parse(arquivo) -> export(model) reproduz o arquivo original byte a byte.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const src = (p) => fs.readFileSync(path.join(root, p), 'utf8');

// Carrega protocol.js + configfile.js no mesmo escopo global
vm.runInThisContext(src('js/protocol.js'), { filename: 'protocol.js' });
vm.runInThisContext(src('js/configfile.js'), { filename: 'configfile.js' });

function findSampleFile() {
  const candidates = [
    path.join(root, '20230716-airband-updated.bc75xlt_ss'),
    path.join(root, 'referencias', '20230716-airband-updated.bc75xlt_ss'),
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return null;
}

let failures = 0;
function check(name, cond, extra = '') {
  if (cond) {
    console.log(`  ✔ ${name}`);
  } else {
    failures++;
    console.error(`  ✘ ${name} ${extra}`);
  }
}

const sample = findSampleFile();
if (!sample) {
  console.error('Arquivo de exemplo não encontrado. Copie o .bc75xlt_ss para a raiz do projeto.');
  process.exit(1);
}

const original = fs.readFileSync(sample, 'utf8');
const model = parseConfigFile(original);
const exported = exportConfigFile(model);

console.log('Round-trip do arquivo de exemplo:');
check('export reproduz o original byte a byte', exported === original,
  `\n    diff de comprimento: ${exported.length} vs ${original.length}`);

// Verifica dados básicos extraídos
check('300 canais', model.banks.reduce((n, b) => n + b.channels.length, 0) === 300);
check('10 bancos', model.banks.length === 10);
check('10 serviços', model.services.length === 10);
check('10 faixas custom', model.customs.length === 10);

const ch1 = model.banks[0].channels[0];
check('canal 1 = 121.5 MHz (121500000 Hz)', ch1.freqHz === 121500000);
check('canal 1 dly=Off lo=0 prio=On',
  ch1.dly === 'Off' && ch1.lo === '0' && ch1.prio === 'On');
check('bandPlan = USA', model.misc.bandPlan === 'USA');
check('squelch=7 volume=4', model.misc.sq === 7 && model.misc.vol === 4);

// Verifica conversão de frequência MHz <-> rádio
check('freqToRadio(121.5 MHz) = 1215000', RADIO.freqToRadio(121500000) === 1215000);
check('radioToFreq(1215000) = 121500000 Hz', RADIO.radioToFreq('1215000') === 121500000);

// Verifica serialização de um canal como comando CIN
const frq = String(RADIO.freqToRadio(ch1.freqHz)).padStart(8, '0');
check('CIN FRQ 8 dígitos = 01215000', frq === '01215000');

// Testa um modelo modificado: exporta e reimporta
const model2 = defaultModel();
model2.banks[0].channels[0].freqHz = 118300000;
model2.banks[0].channels[0].prio = 'On';
model2.banks[2].enabled = false;
model2.misc.bandPlan = 'Canada';
model2.priority = 'DND';
const exported2 = exportConfigFile(model2);
const reimported = parseConfigFile(exported2);
check('reimport preserva frequência', reimported.banks[0].channels[0].freqHz === 118300000);
check('reimport preserva prio', reimported.banks[0].channels[0].prio === 'On');
check('reimport preserva banco desabilitado', reimported.banks[2].enabled === false);
check('reimport preserva band plan', reimported.misc.bandPlan === 'Canada');
check('reimport preserva prioridade', reimported.priority === 'DND');

console.log(failures === 0 ? '\n✅ Todos os testes passaram.' : `\n❌ ${failures} teste(s) falharam.`);
process.exit(failures === 0 ? 0 : 1);
