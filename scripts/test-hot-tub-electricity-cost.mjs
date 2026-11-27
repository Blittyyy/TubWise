import {
  calculateElectricityCost,
  calculateMeasuredElectricityCost,
  calculateStandbyElectricityCost,
  compareSeasonalHeaterRuntime,
  exampleDailyKwh,
  examplePeriodCost,
  validateElectricityInputs,
  parseMeasurement,
  toKilowatts,
  toDollarsPerKwh,
  formatCurrencyUsd,
  formatKwh,
} from '../src/utils/hot-tub-electricity-cost.ts';

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

const blankOptional = { power: '', runtimeHours: '' };

// 1. Heater: 4,000 W × 2 h/day × $0.15/kWh × 30 days (preserved)
{
  const result = calculateElectricityCost({
    mode: 'detailed',
    powerUnit: 'W',
    rateUnit: 'per_kwh',
    heater: { power: '4000', runtimeHours: '2' },
    circulationPump: blankOptional,
    jetPump: blankOptional,
    blower: blankOptional,
    other: blankOptional,
    rate: '0.15',
    days: '30',
  });
  assert(result.ok, 'case 1 should succeed');
  check('heater daily kWh', nearlyEqual(result.result.dailyKwh, 8));
  check('heater daily cost', nearlyEqual(result.result.dailyCost, 1.2));
  check('heater period kWh', nearlyEqual(result.result.periodKwh, 240));
  check('heater period cost', nearlyEqual(result.result.periodCost, 36));
  check('heater display daily kWh', result.result.displayDailyKwh === 8);
  check('heater display daily cost', result.result.displayDailyCost === 1.2);
  check('heater display period cost', result.result.displayPeriodCost === 36);
  check('currency format $36.00', formatCurrencyUsd(result.result.displayPeriodCost) === '$36.00');
  check('kWh format 8.00', formatKwh(result.result.displayDailyKwh) === '8.00');
  check('equipment estimation method', result.result.estimationMethod === 'equipment');
}

// 2. Heater + pump: 4 kW × 2 h + 0.25 kW × 8 h = 10 kWh/day (preserved)
{
  const result = calculateElectricityCost({
    mode: 'simple',
    powerUnit: 'kW',
    rateUnit: 'per_kwh',
    heater: { power: '4', runtimeHours: '2' },
    circulationPump: { power: '0.25', runtimeHours: '8' },
    jetPump: blankOptional,
    blower: blankOptional,
    other: blankOptional,
    rate: '0.15',
    days: '30',
  });
  assert(result.ok, 'case 2 should succeed');
  check('heater+pump daily kWh', nearlyEqual(result.result.dailyKwh, 10));
  check('heater+pump daily cost', nearlyEqual(result.result.dailyCost, 1.5));
  check('heater+pump period cost', nearlyEqual(result.result.periodCost, 45));
  check('heater+pump display period', result.result.displayPeriodCost === 45);
  check('breakdown count 2', result.result.devices.length === 2);
}

// 3. Detailed multiple devices (preserved)
{
  const result = calculateElectricityCost({
    mode: 'detailed',
    powerUnit: 'W',
    rateUnit: 'per_kwh',
    heater: { power: '4000', runtimeHours: '2' },
    circulationPump: { power: '250', runtimeHours: '8' },
    jetPump: { power: '1000', runtimeHours: '1' },
    blower: { power: '500', runtimeHours: '0.5' },
    other: { power: '100', runtimeHours: '2' },
    rate: '0.15',
    days: '30',
  });
  assert(result.ok, 'case 3 should succeed');
  check('detailed daily kWh', nearlyEqual(result.result.dailyKwh, 11.45));
  check('detailed device count', result.result.devices.length === 5);
  check('detailed daily cost', nearlyEqual(result.result.dailyCost, 11.45 * 0.15));
  check('annualized', nearlyEqual(result.result.annualCost, 11.45 * 0.15 * 365));
}

// 4. Unit equivalence (preserved)
{
  const watts = calculateElectricityCost({
    mode: 'simple',
    powerUnit: 'W',
    rateUnit: 'per_kwh',
    heater: { power: '4000', runtimeHours: '2' },
    circulationPump: { power: '250', runtimeHours: '8' },
    jetPump: blankOptional,
    blower: blankOptional,
    other: blankOptional,
    rate: '0.15',
    days: '30',
  });
  const kw = calculateElectricityCost({
    mode: 'simple',
    powerUnit: 'kW',
    rateUnit: 'per_kwh',
    heater: { power: '4', runtimeHours: '2' },
    circulationPump: { power: '0.25', runtimeHours: '8' },
    jetPump: blankOptional,
    blower: blankOptional,
    other: blankOptional,
    rate: '0.15',
    days: '30',
  });
  assert(watts.ok && kw.ok, 'unit equivalence should succeed');
  check('W equals kW daily', nearlyEqual(watts.result.dailyKwh, kw.result.dailyKwh));
  check('toKilowatts 4000 W', nearlyEqual(toKilowatts(4000, 'W'), 4));
  check('toKilowatts 4 kW', nearlyEqual(toKilowatts(4, 'kW'), 4));
}

// 5. Rate equivalence (preserved)
{
  const dollars = calculateElectricityCost({
    mode: 'simple',
    powerUnit: 'W',
    rateUnit: 'per_kwh',
    heater: { power: '4000', runtimeHours: '2' },
    circulationPump: { power: '250', runtimeHours: '8' },
    jetPump: blankOptional,
    blower: blankOptional,
    other: blankOptional,
    rate: '0.15',
    days: '30',
  });
  const cents = calculateElectricityCost({
    mode: 'simple',
    powerUnit: 'W',
    rateUnit: 'cents_per_kwh',
    heater: { power: '4000', runtimeHours: '2' },
    circulationPump: { power: '250', runtimeHours: '8' },
    jetPump: blankOptional,
    blower: blankOptional,
    other: blankOptional,
    rate: '15',
    days: '30',
  });
  assert(dollars.ok && cents.ok, 'rate equivalence should succeed');
  check('cents equals dollars cost', nearlyEqual(dollars.result.periodCost, cents.result.periodCost));
  check('toDollarsPerKwh 15 cents', nearlyEqual(toDollarsPerKwh(15, 'cents_per_kwh'), 0.15));
}

// 6. Measured consumption extrapolation
{
  const measured = calculateMeasuredElectricityCost({
    measuredKwh: '300',
    measurementDays: '30',
    rate: '0.15',
    rateUnit: 'per_kwh',
    days: '30',
  });
  assert(measured.ok, 'measured should succeed');
  check('measured daily kWh', nearlyEqual(measured.result.dailyKwh, 10));
  check('measured daily cost', nearlyEqual(measured.result.dailyCost, 1.5));
  check('measured period cost', nearlyEqual(measured.result.periodCost, 45));
  check('measured annual', nearlyEqual(measured.result.annualCost, 1.5 * 365));
  check('measured method', measured.result.estimationMethod === 'measured');
  check('measured no device breakdown', measured.result.devices.length === 0);

  const zeroUse = calculateMeasuredElectricityCost({
    measuredKwh: '0',
    measurementDays: '7',
    rate: '0.15',
    rateUnit: 'per_kwh',
    days: '30',
  });
  assert(zeroUse.ok, 'zero measured consumption allowed');
  check('zero measured daily kWh', nearlyEqual(zeroUse.result.dailyKwh, 0));
  check('zero measured period cost', nearlyEqual(zeroUse.result.periodCost, 0));
}

// 7. Standby watts and annual kWh
{
  const standbyW = calculateStandbyElectricityCost({
    inputMode: 'watts',
    standbyWatts: '100',
    annualStandbyKwh: '',
    rate: '0.15',
    rateUnit: 'per_kwh',
    days: '30',
  });
  assert(standbyW.ok, 'standby watts');
  check('standby daily kWh from watts', nearlyEqual(standbyW.result.dailyKwh, 2.4));
  check('standby period kWh', nearlyEqual(standbyW.result.periodKwh, 72));
  check('standby method', standbyW.result.estimationMethod === 'standby');
  check('standby devices empty (no double-count)', standbyW.result.devices.length === 0);

  const annual = calculateStandbyElectricityCost({
    inputMode: 'annualKwh',
    standbyWatts: '',
    annualStandbyKwh: '876',
    rate: '0.15',
    rateUnit: 'per_kwh',
    days: '30',
  });
  assert(annual.ok, 'annual standby');
  check('annual standby daily', nearlyEqual(annual.result.dailyKwh, 876 / 365));
  check('annual standby period cost', nearlyEqual(annual.result.periodCost, (876 / 365) * 0.15 * 30));

  const zeroStandby = calculateStandbyElectricityCost({
    inputMode: 'watts',
    standbyWatts: '0',
    annualStandbyKwh: '',
    rate: '0',
    rateUnit: 'per_kwh',
    days: '30',
  });
  assert(zeroStandby.ok, 'zero standby + zero rate allowed');
  check('zero standby cost', nearlyEqual(zeroStandby.result.periodCost, 0));
}

// 8. Seasonal scenario comparison
{
  const baselineInputs = {
    mode: 'simple',
    powerUnit: 'kW',
    rateUnit: 'per_kwh',
    heater: { power: '4', runtimeHours: '2' },
    circulationPump: { power: '0.25', runtimeHours: '8' },
    jetPump: blankOptional,
    blower: blankOptional,
    other: blankOptional,
    rate: '0.15',
    days: '30',
  };
  const seasonal = compareSeasonalHeaterRuntime(baselineInputs, '4');
  assert(seasonal.ok, 'seasonal comparison');
  // baseline 10 kWh; comparison heater 16 + pump 2 = 18
  check('seasonal baseline 10', nearlyEqual(seasonal.result.baseline.dailyKwh, 10));
  check('seasonal comparison 18', nearlyEqual(seasonal.result.comparison.dailyKwh, 18));
  check('seasonal daily diff +8', nearlyEqual(seasonal.result.dailyKwhDifference, 8));
  check('seasonal period cost diff', nearlyEqual(seasonal.result.periodCostDifference, 8 * 0.15 * 30));
}

// 9. Static example-table accuracy
{
  const rows = [
    [1, 6, 27],
    [2, 10, 45],
    [3, 14, 63],
    [4, 18, 81],
    [6, 26, 117],
  ];
  for (const [hours, daily, cost] of rows) {
    const d = exampleDailyKwh(4, hours, 0.25, 8);
    const c = examplePeriodCost(d, 0.15, 30);
    check(`example ${hours}h daily ${daily}`, nearlyEqual(d, daily));
    check(`example ${hours}h cost $${cost}`, nearlyEqual(c, cost));
  }
}

// 10. Invalid inputs (preserved + new)
{
  const blank = validateElectricityInputs({
    mode: 'simple',
    powerUnit: 'W',
    rateUnit: 'per_kwh',
    heater: { power: '', runtimeHours: '2' },
    circulationPump: { power: '250', runtimeHours: '8' },
    jetPump: blankOptional,
    blower: blankOptional,
    other: blankOptional,
    rate: '0.15',
    days: '30',
  });
  check('blank heater power invalid', blank.some((e) => e.field === 'heaterPower'));

  const zeroRate = validateElectricityInputs({
    mode: 'simple',
    powerUnit: 'W',
    rateUnit: 'per_kwh',
    heater: { power: '4000', runtimeHours: '2' },
    circulationPump: { power: '250', runtimeHours: '8' },
    jetPump: blankOptional,
    blower: blankOptional,
    other: blankOptional,
    rate: '0',
    days: '30',
  });
  check('zero rate invalid in equipment', zeroRate.some((e) => e.field === 'rate'));

  const negative = validateElectricityInputs({
    mode: 'simple',
    powerUnit: 'W',
    rateUnit: 'per_kwh',
    heater: { power: '-100', runtimeHours: '2' },
    circulationPump: { power: '250', runtimeHours: '8' },
    jetPump: blankOptional,
    blower: blankOptional,
    other: blankOptional,
    rate: '0.15',
    days: '30',
  });
  check('negative power invalid', negative.some((e) => e.field === 'heaterPower'));

  const overRuntime = validateElectricityInputs({
    mode: 'simple',
    powerUnit: 'W',
    rateUnit: 'per_kwh',
    heater: { power: '4000', runtimeHours: '25' },
    circulationPump: { power: '250', runtimeHours: '8' },
    jetPump: blankOptional,
    blower: blankOptional,
    other: blankOptional,
    rate: '0.15',
    days: '30',
  });
  check('runtime over 24 invalid', overRuntime.some((e) => e.field === 'heaterRuntime'));

  check('Infinity parse null', parseMeasurement('Infinity') === null);
  check('letters parse null', parseMeasurement('abc') === null);

  const extreme = validateElectricityInputs({
    mode: 'simple',
    powerUnit: 'kW',
    rateUnit: 'per_kwh',
    heater: { power: '101', runtimeHours: '2' },
    circulationPump: { power: '0.25', runtimeHours: '8' },
    jetPump: blankOptional,
    blower: blankOptional,
    other: blankOptional,
    rate: '0.15',
    days: '30',
  });
  check('extreme wattage invalid', extreme.some((e) => e.field === 'heaterPower'));

  const powerNoRuntime = validateElectricityInputs({
    mode: 'detailed',
    powerUnit: 'W',
    rateUnit: 'per_kwh',
    heater: { power: '4000', runtimeHours: '2' },
    circulationPump: blankOptional,
    jetPump: { power: '1000', runtimeHours: '' },
    blower: blankOptional,
    other: blankOptional,
    rate: '0.15',
    days: '30',
  });
  check(
    'optional power without runtime invalid',
    powerNoRuntime.some((e) => e.field === 'jetPumpRuntime'),
  );

  const runtimeNoPower = validateElectricityInputs({
    mode: 'detailed',
    powerUnit: 'W',
    rateUnit: 'per_kwh',
    heater: { power: '4000', runtimeHours: '2' },
    circulationPump: blankOptional,
    jetPump: { power: '', runtimeHours: '1' },
    blower: blankOptional,
    other: blankOptional,
    rate: '0.15',
    days: '30',
  });
  check(
    'optional runtime without power invalid',
    runtimeNoPower.some((e) => e.field === 'jetPumpPower'),
  );

  const badDays = validateElectricityInputs({
    mode: 'simple',
    powerUnit: 'W',
    rateUnit: 'per_kwh',
    heater: { power: '4000', runtimeHours: '2' },
    circulationPump: { power: '250', runtimeHours: '8' },
    jetPump: blankOptional,
    blower: blankOptional,
    other: blankOptional,
    rate: '0.15',
    days: '0',
  });
  check('days below 1 invalid', badDays.some((e) => e.field === 'days'));

  const tooManyDays = validateElectricityInputs({
    mode: 'simple',
    powerUnit: 'W',
    rateUnit: 'per_kwh',
    heater: { power: '4000', runtimeHours: '2' },
    circulationPump: { power: '250', runtimeHours: '8' },
    jetPump: blankOptional,
    blower: blankOptional,
    other: blankOptional,
    rate: '0.15',
    days: '367',
  });
  check('days above 366 invalid', tooManyDays.some((e) => e.field === 'days'));

  const badMeasureDays = calculateMeasuredElectricityCost({
    measuredKwh: '100',
    measurementDays: '0',
    rate: '0.15',
    rateUnit: 'per_kwh',
    days: '30',
  });
  check('invalid measurement period', !badMeasureDays.ok);

  const badBilling = calculateMeasuredElectricityCost({
    measuredKwh: '100',
    measurementDays: '10',
    rate: '0.15',
    rateUnit: 'per_kwh',
    days: '0',
  });
  check('invalid billing period measured', !badBilling.ok);

  const nonFiniteMeasured = calculateMeasuredElectricityCost({
    measuredKwh: 'Infinity',
    measurementDays: '10',
    rate: '0.15',
    rateUnit: 'per_kwh',
    days: '30',
  });
  check('non-finite measured invalid', !nonFiniteMeasured.ok);

  const badSeasonal = compareSeasonalHeaterRuntime(
    {
      mode: 'simple',
      powerUnit: 'kW',
      rateUnit: 'per_kwh',
      heater: { power: '4', runtimeHours: '2' },
      circulationPump: { power: '0.25', runtimeHours: '8' },
      jetPump: blankOptional,
      blower: blankOptional,
      other: blankOptional,
      rate: '0.15',
      days: '30',
    },
    '25',
  );
  check('seasonal runtime over 24 invalid', !badSeasonal.ok);
}

console.log(`\nAll ${passed} checks passed.`);
