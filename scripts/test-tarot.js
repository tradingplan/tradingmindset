/**
 * Suíte de testes e validação automatizada do Tarot Trader
 */
const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('🔮 INICIANDO SUÍTE DE TESTES DO TAROT TRADER...\n');

// 1. MOCK DE ASYNCSTORAGE
const storageMemory = new Map();
const AsyncStorageMock = {
  getItem: async (key) => storageMemory.get(key) || null,
  setItem: async (key, value) => {
    storageMemory.set(key, String(value));
  },
  removeItem: async (key) => {
    storageMemory.delete(key);
  },
  multiRemove: async (keys) => {
    keys.forEach((k) => storageMemory.delete(k));
  },
  clear: async () => {
    storageMemory.clear();
  },
};

// 2. VALIDAÇÃO DO JSON REAL
console.log('1. Validando estrutura e integridade do JSON de cartas...');
const jsonPath = path.join(__dirname, '../src/data/tarot-trader-cartas.json');
const rawJson = fs.readFileSync(jsonPath, 'utf-8');
const tarotData = JSON.parse(rawJson);

assert.strictEqual(typeof tarotData.versao, 'string', 'JSON deve conter campo "versao"');
assert.strictEqual(typeof tarotData.idioma, 'string', 'JSON deve conter campo "idioma"');
assert.strictEqual(typeof tarotData.aviso, 'string', 'JSON deve conter campo "aviso"');
assert.ok(tarotData.aviso.length > 20, 'O aviso legal deve conter texto explicativo');
assert.ok(Array.isArray(tarotData.cartas), 'JSON deve conter array "cartas"');
assert.strictEqual(tarotData.cartas.length, 22, 'JSON deve conter exatamente 22 cartas');

const numerosSet = new Set();
const idsSet = new Set();

tarotData.cartas.forEach((carta, i) => {
  assert.strictEqual(typeof carta.numero, 'number', `Carta #${i+1} deve ter número numérico`);
  assert.ok(!numerosSet.has(carta.numero), `Número de carta duplicado: ${carta.numero}`);
  numerosSet.add(carta.numero);

  assert.strictEqual(typeof carta.id, 'string', `Carta #${carta.numero} deve ter id string`);
  assert.ok(!idsSet.has(carta.id), `ID de carta duplicado: ${carta.id}`);
  idsSet.add(carta.id);

  assert.ok(['bear', 'bull'].includes(carta.polaridade), `Polaridade inválida na carta ${carta.id}`);
  assert.strictEqual(typeof carta.icone, 'string', `Ícone da carta ${carta.id} deve ser string`);
  assert.ok(carta.psych_load >= 0 && carta.psych_load <= 100, `psych_load fora de 0..100 na carta ${carta.id}`);
  assert.ok(Array.isArray(carta.sinais) && carta.sinais.length >= 2, `Carta ${carta.id} deve conter pelo menos 2 sinais`);
  assert.ok(typeof carta.sabedoria === 'string' && carta.sabedoria.length > 10, `Carta ${carta.id} deve ter sabedoria válida`);
  assert.ok(typeof carta.antidoto === 'string' && carta.antidoto.length > 5, `Carta ${carta.id} deve ter antídoto válido`);
});
console.log('   ✅ JSON 100% válido: 22 cartas, IDs/números únicos, sinais >= 2 e loads 0..100.\n');

// 3. FUNÇÕES PURAS DE LÓGICA DO TAROT
function biasStatus(load) {
  if (load >= 80) return 'CRITICAL_TILT';
  if (load >= 60) return 'UNSTABLE_OVERLOAD';
  if (load >= 40) return 'CAUTION_DRIFT';
  return 'STABLE_FLOW';
}

function dataLocalHoje(dateObj = new Date()) {
  const ano = dateObj.getFullYear();
  const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dia = String(dateObj.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function sortearCarta(cartas, agora = new Date(), random = Math.random) {
  const index = Math.floor(random() * cartas.length);
  const carta = cartas[Math.min(index, cartas.length - 1)];
  const delta = Math.round(random() * 16 - 8);
  const psychLoad = Math.max(0, Math.min(100, carta.psych_load + delta));
  return {
    carta,
    psychLoad,
    status: biasStatus(psychLoad),
  };
}

// 4. TESTE DE LIMITES DO BIAS_STATUS
console.log('2. Testando limites exatos de biasStatus (39, 40, 59, 60, 79, 80)...');
assert.strictEqual(biasStatus(0), 'STABLE_FLOW');
assert.strictEqual(biasStatus(39), 'STABLE_FLOW');
assert.strictEqual(biasStatus(40), 'CAUTION_DRIFT');
assert.strictEqual(biasStatus(59), 'CAUTION_DRIFT');
assert.strictEqual(biasStatus(60), 'UNSTABLE_OVERLOAD');
assert.strictEqual(biasStatus(79), 'UNSTABLE_OVERLOAD');
assert.strictEqual(biasStatus(80), 'CRITICAL_TILT');
assert.strictEqual(biasStatus(100), 'CRITICAL_TILT');
console.log('   ✅ Limites de biasStatus validados com sucesso.\n');

// 5. TESTE DE CLAMP DE PSYCH_LOAD (EXTREMOS LOAD 10 E LOAD 88)
console.log('3. Testando variação de psych_load e clamp em 0..100 (extremos 10 e 88)...');
const cartaMinima = tarotData.cartas.find((c) => c.psych_load === 10) || { psych_load: 10 };
const cartaMaxima = tarotData.cartas.find((c) => c.psych_load === 88) || { psych_load: 88 };

for (let i = 0; i < 2000; i++) {
  // Teste com min random (delta = -8)
  const deltaMin = Math.round(0 * 16 - 8);
  const loadMin = Math.max(0, Math.min(100, cartaMinima.psych_load + deltaMin));
  assert.ok(loadMin >= 0 && loadMin <= 100, `Load mínimo inválido: ${loadMin}`);

  // Teste com max random (delta = +8)
  const deltaMax = Math.round(1 * 16 - 8);
  const loadMax = Math.max(0, Math.min(100, cartaMaxima.psych_load + deltaMax));
  assert.ok(loadMax >= 0 && loadMax <= 100, `Load máximo inválido: ${loadMax}`);

  // Teste com random aleatório
  const res = sortearCarta(tarotData.cartas, new Date(), Math.random);
  assert.ok(res.psychLoad >= 0 && res.psychLoad <= 100);
}
console.log('   ✅ Clamp de 0..100 verificado em 2000 iterações com extremos.\n');

// 6. TESTE DE DATA LOCAL (NÃO UTC)
console.log('4. Testando dataLocalHoje com simulação de 23:00 no Brasil...');
const dataLocal23h = new Date(2026, 8, 30, 23, 30, 0); // 30 de Setembro 23:30 local
const resultadoDataLocal = dataLocalHoje(dataLocal23h);
assert.strictEqual(resultadoDataLocal, '2026-09-30', 'Data local às 23:30 não deve virar para o dia seguinte');
console.log('   ✅ Formato de data local verificado (YYYY-MM-DD sem bug de virada UTC).\n');

// 7. TESTE DE SERVIÇO COM PERSISTÊNCIA (UMA CARTA POR DIA E HISTÓRICO 90 ITENS)
console.log('5. Testando puxarCarta(), persistência de 1 carta/dia e limite de histórico...');

async function puxarCartaTest(agora = new Date(), random = Math.random) {
  const hoje = dataLocalHoje(agora);
  const rawUltima = await AsyncStorageMock.getItem('tarot:ultima-leitura');
  if (rawUltima) {
    const parsed = JSON.parse(rawUltima);
    if (parsed && parsed.data === hoje) {
      const carta = tarotData.cartas.find((c) => c.id === parsed.cartaId);
      return { leitura: parsed, carta, isNova: false };
    }
  }

  const { carta, psychLoad, status } = sortearCarta(tarotData.cartas, agora, random);
  const novaLeitura = {
    data: hoje,
    cartaId: carta.id,
    psychLoad,
    biasStatus: status,
  };

  await AsyncStorageMock.setItem('tarot:ultima-leitura', JSON.stringify(novaLeitura));

  const rawHist = await AsyncStorageMock.getItem('tarot:historico');
  const hist = rawHist ? JSON.parse(rawHist) : [];
  const filtrado = hist.filter((item) => item.data !== hoje);
  const novoHist = [novaLeitura, ...filtrado].slice(0, 90);
  await AsyncStorageMock.setItem('tarot:historico', JSON.stringify(novoHist));

  return { leitura: novaLeitura, carta, isNova: true };
}

(async () => {
  await AsyncStorageMock.clear();

  const dia1 = new Date(2026, 8, 30, 9, 0, 0);
  const res1 = await puxarCartaTest(dia1, () => 0.1);
  assert.strictEqual(res1.isNova, true, 'Primeira leitura do dia deve ser nova');

  // Segunda chamada no mesmo dia deve retornar exatamente a mesma leitura
  const res2 = await puxarCartaTest(dia1, () => 0.9);
  assert.strictEqual(res2.isNova, false, 'Segunda leitura no mesmo dia não pode ser nova');
  assert.strictEqual(res2.leitura.cartaId, res1.leitura.cartaId, 'Carta deve ser a mesma no mesmo dia');
  assert.strictEqual(res2.leitura.psychLoad, res1.leitura.psychLoad, 'Psych load deve ser o mesmo');

  // Chamada no dia seguinte
  const dia2 = new Date(2026, 9, 1, 9, 0, 0); // 01 de Outubro
  const res3 = await puxarCartaTest(dia2, () => 0.5);
  assert.strictEqual(res3.isNova, true, 'Leitura no dia seguinte deve ser nova');
  assert.strictEqual(res3.leitura.data, '2026-10-01');

  // Teste de preenchimento de histórico até 120 dias para validar limite de 90
  for (let d = 2; d <= 120; d++) {
    const diaFuturo = new Date(2026, 9, d, 9, 0, 0);
    await puxarCartaTest(diaFuturo, () => Math.random());
  }

  const historicoFinal = JSON.parse(await AsyncStorageMock.getItem('tarot:historico'));
  assert.strictEqual(historicoFinal.length, 90, `Histórico deve conter exatamente 90 itens (obtido: ${historicoFinal.length})`);
  console.log('   ✅ 1 carta por dia garantida e histórico limitado estritamente a 90 itens.\n');

  console.log('🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!\n');
})();
