import {
  calculateHeatUpTime,
  capacityToLiters,
  deltaFToDeltaC,
  exampleIdealHeatHours,
  formatDurationFromHours,
  gallonsToLiters,
  LITERS_PER_US_GALLON,
  MAX_TARGET_C,
  MAX_TARGET_F,
  parseMeasurement,
  SPECIFIC_HEAT_KJ_PER_KG_C,
  temperatureDifferenceInC,
  thermalEnergyKWh,
  validateHeatUpInputs,
} from '../src/utils/hot-tub-heat-up-time.ts';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function nearlyEqual(a, b, epsilon = 1e-9) {
  return Math.abs(a - b) <= epsilon;
}

let passed = 0;

function check(name, condition, detail = '') {
  if (!condition) {
    throw new Error(`FAIL: ${name}${detail ? ` — ${detail}` : ''}`);
  }
  passed += 1;
  console.log(`PASS: ${name}`);
}

function baseHeater(overrides = {}) {
  return {
    mode: 'heater',
    capacity: '400',
    capacityUnit: 'gal',
    currentTemp: '60',
    targetTemp: '100',
    tempUnit: 'F',
    heaterPreset: '4',
    customHeaterKw: '',
    heatLossPreset: 'none',
    customHeatLossPercent: '',
    observedRise: '',
    observationDuration: '',
    observationUnit: 'hours',
    electricityRate: '',
    electricityRateUnit: 'per_kwh',
    ...overrides,
  };
}

function baseMeasured(overrides = {}) {
  return {
    mode: 'measured',
    capacity: '',
    capacityUnit: 'gal',
    currentTemp: '70',
    targetTemp: '100',
    tempUnit: 'F',
    heaterPreset: '4',
    customHeaterKw: '',
    heatLossPreset: 'none',
    customHeatLossPercent: '',
    observedRise: '5',
    observationDuration: '2',
    observationUnit: 'hours',
    electricityRate: '',
    electricityRateUnit: 'per_kwh',
    ...overrides,
  };
}

// Conversions
check('gallons to liters', nearlyEqual(gallonsToLiters(1), LITERS_PER_US_GALLON));
check('capacity gallons', nearlyEqual(capacityToLiters(400, 'gal'), 400 * LITERS_PER_US_GALLON));
check('capacity liters', nearlyEqual(capacityToLiters(1500, 'L'), 1500));
check('deltaF to deltaC 40', nearlyEqual(deltaFToDeltaC(40), 40 * (5 / 9)));
check('temp diff F', nearlyEqual(temperatureDifferenceInC(60, 100, 'F'), 40 * (5 / 9)));
check('temp diff C', nearlyEqual(temperatureDifferenceInC(15, 38, 'C'), 23));

// Thermal energy: 400 gal, 60→100°F
{
  const liters = 400 * LITERS_PER_US_GALLON;
  const deltaC = 40 * (5 / 9);
  const expected = (liters * SPECIFIC_HEAT_KJ_PER_KG_C * deltaC) / 3600;
  check('thermal energy formula', nearlyEqual(thermalEnergyKWh(liters, deltaC), expected));

  const result = calculateHeatUpTime(baseHeater());
  assert(result.ok, 'heater ideal should succeed');
  check('ideal energy matches', nearlyEqual(result.result.thermalEnergyKWh, expected));
  check('ideal hours', nearlyEqual(result.result.idealHours, expected / 4));
  check('estimated equals ideal with no loss', nearlyEqual(result.result.estimatedHours, result.result.idealHours));
  check('cost unavailable without rate', result.result.estimatedHeaterCostUsd === null);
  check('duration label present', typeof result.result.durationLabel === 'string');
}

// Heat-loss adjustment: 20% → effective 3.2 kW
{
  const ideal = calculateHeatUpTime(baseHeater());
  assert(ideal.ok, 'ideal baseline');
  const withLoss = calculateHeatUpTime(baseHeater({ heatLossPreset: '20' }));
  assert(withLoss.ok, 'heat loss should succeed');
  check(
    'heat loss stretches time',
    nearlyEqual(withLoss.result.estimatedHours, ideal.result.idealHours / 0.8),
  );
  check('effective kw', nearlyEqual(withLoss.result.effectiveHeatingKw, 3.2));
  check(
    'heater energy uses wall time',
    nearlyEqual(
      withLoss.result.estimatedHeaterEnergyKWh,
      4 * withLoss.result.estimatedHours,
    ),
  );
}

// Electricity cost
{
  const result = calculateHeatUpTime(
    baseHeater({
      electricityRate: '0.15',
      electricityRateUnit: 'per_kwh',
    }),
  );
  assert(result.ok, 'cost case should succeed');
  const expectedCost =
    Math.round(result.result.estimatedHeaterEnergyKWh * 0.15 * 100) / 100;
  check('heater cost', nearlyEqual(result.result.estimatedHeaterCostUsd, expectedCost));

  const cents = calculateHeatUpTime(
    baseHeater({
      electricityRate: '15',
      electricityRateUnit: 'cents_per_kwh',
    }),
  );
  assert(cents.ok, 'cents rate should succeed');
  check(
    'cents equals dollars cost',
    nearlyEqual(cents.result.estimatedHeaterCostUsd, result.result.estimatedHeaterCostUsd),
  );
}

// Missing electricity rate remains optional
{
  const blank = calculateHeatUpTime(baseHeater({ electricityRate: '   ' }));
  assert(blank.ok, 'blank rate ok');
  check('blank rate no cost', blank.result.estimatedHeaterCostUsd === null);
}

// Measured heating rate: +5°F in 2 hours → 2.5°F/hr; 70→100 needs 30°F → 12 hours
{
  const result = calculateHeatUpTime(baseMeasured());
  assert(result.ok, 'measured should succeed');
  check('measured rate', nearlyEqual(result.result.heatingRatePerHourDisplay, 2.5));
  check('measured remaining hours', nearlyEqual(result.result.estimatedHours, 12));
  check('measured no thermal energy', result.result.thermalEnergyKWh === null);
  check('measured no heater energy', result.result.estimatedHeaterEnergyKWh === null);
  check('measured no cost', result.result.estimatedHeaterCostUsd === null);
}

// Minutes observation unit
{
  const result = calculateHeatUpTime(
    baseMeasured({
      observedRise: '2',
      observationDuration: '30',
      observationUnit: 'minutes',
      currentTemp: '80',
      targetTemp: '100',
    }),
  );
  assert(result.ok, 'minutes observation should succeed');
  // 2°F / 0.5 hr = 4°F/hr; remaining 20°F → 5 hours
  check('minutes-based rate', nearlyEqual(result.result.heatingRatePerHourDisplay, 4));
  check('minutes-based hours', nearlyEqual(result.result.estimatedHours, 5));
}

// Already at or above target
{
  const equal = calculateHeatUpTime(baseHeater({ currentTemp: '100', targetTemp: '100' }));
  assert(equal.ok, 'equal temps should succeed');
  check('equal already done', equal.result.alreadyAtOrAboveTarget === true);
  check('equal no duration', equal.result.durationLabel === null);

  const above = calculateHeatUpTime(baseHeater({ currentTemp: '102', targetTemp: '100' }));
  assert(above.ok, 'above target should succeed');
  check('above already done', above.result.alreadyAtOrAboveTarget === true);
}

// Max target enforcement
{
  const overF = validateHeatUpInputs(baseHeater({ targetTemp: '105' }));
  check('over 104F invalid', overF.some((e) => e.field === 'targetTemp'));
  check('max F constant', MAX_TARGET_F === 104);

  const overC = validateHeatUpInputs(
    baseHeater({
      tempUnit: 'C',
      currentTemp: '20',
      targetTemp: '41',
    }),
  );
  check('over 40C invalid', overC.some((e) => e.field === 'targetTemp'));
  check('max C constant', MAX_TARGET_C === 40);

  const atMax = calculateHeatUpTime(baseHeater({ targetTemp: '104' }));
  check('104F allowed', atMax.ok === true);
}

// Invalid capacity / heater / heat loss
{
  check(
    'blank capacity',
    validateHeatUpInputs(baseHeater({ capacity: '' })).some((e) => e.field === 'capacity'),
  );
  check(
    'zero capacity',
    validateHeatUpInputs(baseHeater({ capacity: '0' })).some((e) => e.field === 'capacity'),
  );
  check(
    'negative capacity',
    validateHeatUpInputs(baseHeater({ capacity: '-10' })).some((e) => e.field === 'capacity'),
  );
  check(
    'zero custom heater',
    validateHeatUpInputs(
      baseHeater({ heaterPreset: 'custom', customHeaterKw: '0' }),
    ).some((e) => e.field === 'heaterPower'),
  );
  check(
    'negative heater',
    validateHeatUpInputs(
      baseHeater({ heaterPreset: 'custom', customHeaterKw: '-2' }),
    ).some((e) => e.field === 'heaterPower'),
  );
  check(
    'blank custom heater',
    validateHeatUpInputs(
      baseHeater({ heaterPreset: 'custom', customHeaterKw: '' }),
    ).some((e) => e.field === 'heaterPower'),
  );
  check(
    'heat loss 100 invalid',
    validateHeatUpInputs(
      baseHeater({ heatLossPreset: 'custom', customHeatLossPercent: '100' }),
    ).some((e) => e.field === 'heatLoss'),
  );
  check(
    'heat loss negative invalid',
    validateHeatUpInputs(
      baseHeater({ heatLossPreset: 'custom', customHeatLossPercent: '-5' }),
    ).some((e) => e.field === 'heatLoss'),
  );
}

// Zero / negative observed rise and invalid duration
{
  const zeroRise = calculateHeatUpTime(baseMeasured({ observedRise: '0' }));
  check('zero rise fails', !zeroRise.ok && zeroRise.errors.some((e) => e.field === 'observedRise'));

  const negRise = validateHeatUpInputs(baseMeasured({ observedRise: '-1' }));
  check('negative rise invalid', negRise.some((e) => e.field === 'observedRise'));

  const zeroDur = validateHeatUpInputs(baseMeasured({ observationDuration: '0' }));
  check('zero duration invalid', zeroDur.some((e) => e.field === 'observationDuration'));

  const negDur = validateHeatUpInputs(baseMeasured({ observationDuration: '-2' }));
  check('negative duration invalid', negDur.some((e) => e.field === 'observationDuration'));

  const blankDur = validateHeatUpInputs(baseMeasured({ observationDuration: '' }));
  check('blank duration invalid', blankDur.some((e) => e.field === 'observationDuration'));
}

// Fractional inputs
{
  const result = calculateHeatUpTime(
    baseHeater({
      capacity: '375.5',
      heaterPreset: 'custom',
      customHeaterKw: '3.5',
      currentTemp: '62.5',
      targetTemp: '101.5',
    }),
  );
  assert(result.ok, 'fractional heater case should succeed');
  check('fractional estimated hours finite', Number.isFinite(result.result.estimatedHours));
  check('fractional energy finite', Number.isFinite(result.result.thermalEnergyKWh));
}

// Unit equivalence: same physical scenario in F/gal vs C/L
{
  const gal = calculateHeatUpTime(baseHeater());
  assert(gal.ok, 'gal case');
  const liters = String(400 * LITERS_PER_US_GALLON);
  const startC = ((60 - 32) * 5) / 9;
  const targetC = ((100 - 32) * 5) / 9;
  const lit = calculateHeatUpTime(
    baseHeater({
      capacity: liters,
      capacityUnit: 'L',
      currentTemp: String(startC),
      targetTemp: String(targetC),
      tempUnit: 'C',
    }),
  );
  assert(lit.ok, 'liter/C case');
  check(
    'unit-equivalent ideal hours',
    nearlyEqual(lit.result.idealHours, gal.result.idealHours, 1e-9),
  );
  check(
    'unit-equivalent energy',
    nearlyEqual(lit.result.thermalEnergyKWh, gal.result.thermalEnergyKWh, 1e-9),
  );
}

// Non-finite / letters
{
  check('letters parse null', parseMeasurement('abc') === null);
  check('Infinity parse null', parseMeasurement('Infinity') === null);
  const letters = calculateHeatUpTime(baseHeater({ capacity: 'nope' }));
  check('letters fail calculate', !letters.ok);
}

// Example table accuracy: 60°F → 100°F, ideal, selected capacities/kW
{
  const capacities = [300, 400, 500];
  const heaters = [1, 2, 4, 5.5, 6];
  for (const capacity of capacities) {
    for (const kw of heaters) {
      const hours = exampleIdealHeatHours(capacity, 60, 100, kw);
      const liters = capacity * LITERS_PER_US_GALLON;
      const deltaC = 40 * (5 / 9);
      const expected = thermalEnergyKWh(liters, deltaC) / kw;
      check(
        `example ${capacity}gal @ ${kw}kW`,
        nearlyEqual(hours, expected, 1e-9),
        `got ${hours} expected ${expected}`,
      );
    }
  }
}

check('formatDurationFromHours 1.5', formatDurationFromHours(1.5) === '1 hour 30 minutes');
check('formatDurationFromHours 0.5', formatDurationFromHours(0.5) === '30 minutes');

console.log(`\nAll ${passed} checks passed.`);
