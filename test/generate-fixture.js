'use strict';

// Gera um arquivo de exemplo SANITIZADO para o teste de round-trip.
// Usa dados 100% fictícios (frequências em progressão artificial) para
// evitar vazar o conteúdo do arquivo original do usuário no repositório.
//
// Executar:  node test/generate-fixture.js
// Saída:     test/fixtures/sample.bc75xlt_ss  (versionado no git)

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const src = (p) => fs.readFileSync(path.join(root, p), 'utf8');

vm.runInThisContext(src('js/protocol.js'), { filename: 'protocol.js' });
vm.runInThisContext(src('js/configfile.js'), { filename: 'configfile.js' });

const m = defaultModel();

// Configurações que o teste espera (para manter os checks válidos)
m.misc.sq = 7;
m.misc.vol = 4;
m.misc.bandPlan = 'USA';

// Preenche todos os 300 canais com frequências fictícias (rampa artificial)
let n = 0;
for (const bank of m.banks) {
  bank.name = `Test Bank ${bank.index}`;
  for (const ch of bank.channels) {
    ch.name = '';
    ch.freqHz = 118000000 + n * 50000; // 118.000 MHz → 132.950 MHz (fictício)
    n++;
  }
}

// Canal 1 conforme esperado pelo teste
m.banks[0].channels[0].freqHz = 121500000; // 121.5 MHz
m.banks[0].channels[0].dly = 'Off';
m.banks[0].channels[0].lo = '0';
m.banks[0].channels[0].prio = 'On';

const exported = exportConfigFile(m);

// Valida round-trip antes de salvar
const re = parseConfigFile(exported);
if (exported !== exportConfigFile(re)) {
  console.error('✘ Fixture não fecha o round-trip. Abortando.');
  process.exit(1);
}

const dir = path.join(root, 'test', 'fixtures');
fs.mkdirSync(dir, { recursive: true });
const out = path.join(dir, 'sample.bc75xlt_ss');
fs.writeFileSync(out, exported);

console.log(`✔ Fixture sanitizado gerado: ${path.relative(root, out)}`);
console.log(`  ${m.banks.reduce((s, b) => s + b.channels.length, 0)} canais, ${m.banks.length} bancos, ${m.services.length} serviços, ${m.customs.length} customs.`);
console.log('  Round-trip validado byte a byte.');
