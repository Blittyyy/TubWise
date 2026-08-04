import {
  calculateFillTime,
  validateFillTimeInputs,
  parseMeasurement,
  formatDurationLabel,
  LITERS_PER_US_GALLON,
} from '../src/utils/hot-tub-fill-time.ts';

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

// 1. 400 gallons, empty, 5 gpm → 400 gal remaining, 80 minutes
{
  const result = calculateFillTime({
    capacity: '400',
    capacityUnit: 'gal',
    fillPreset: 'empty',
    customPercent: '',
    flowRate: '5',
    flowUnit: 'gpm',
  });
  assert(result.ok, 'case 1 should succeed');
  check('400 empty remaining gallons', result.result.displayRemainingGallons === 400);
  check('400 empty remaining liters', result.result.displayRemainingLiters === Math.round(400 * LITERS_PER_US_GALLON));
  check('400 empty duration exact', nearlyEqual(result.result.durationMinutesExact, 80));
  check('400 empty duration minutes', result.result.displayTotalMinutes === 80);
  check('400 empty duration label', result.result.durationLabel === '1 hour 20 minutes');
}

// 2. 400 gallons, 50% full, 5 gpm → 200 gal, 40 minutes
{
  const result = calculateFillTime({
    capacity: '400',
    capacityUnit: 'gal',
    fillPreset: '50',
    customPercent: '',
    flowRate: '5',
    flowUnit: 'gpm',
  });
  assert(result.ok, 'case 2 should succeed');
  check('50% remaining gallons', result.result.displayRemainingGallons === 200);
  check('50% duration exact', nearlyEqual(result.result.durationMinutesExact, 40));
  check('50% duration label', result.result.durationLabel === '40 minutes');
}

// 3. 1,500 liters, empty, 20 L/min → 1,500 L, 75 minutes
{
  const result = calculateFillTime({
    capacity: '1500',
    capacityUnit: 'L',
    fillPreset: 'empty',
    customPercent: '',
    flowRate: '20',
    flowUnit: 'lpm',
  });
  assert(result.ok, 'case 3 should succeed');
  check('1500 L remaining liters', result.result.displayRemainingLiters === 1500);
  check('1500 L duration exact', nearlyEqual(result.result.durationMinutesExact, 75));
  check('1500 L duration label', result.result.durationLabel === '1 hour 15 minutes');
}

// 4. Equivalent conversion: 400 gal @ 5 gpm vs liters / L/min
{
  const gallons = calculateFillTime({
    capacity: '400',
    capacityUnit: 'gal',
    fillPreset: 'empty',
    customPercent: '',
    flowRate: '5',
    flowUnit: 'gpm',
  });
  assert(gallons.ok, 'gallons case should succeed');

  const litersCapacity = String(400 * LITERS_PER_US_GALLON);
  const litersFlow = String(5 * LITERS_PER_US_GALLON);
  const liters = calculateFillTime({
    capacity: litersCapacity,
    capacityUnit: 'L',
    fillPreset: 'empty',
    customPercent: '',
    flowRate: litersFlow,
    flowUnit: 'lpm',
  });
  assert(liters.ok, 'liters equivalent should succeed');
  check(
    'equivalent duration',
    nearlyEqual(liters.result.durationMinutesExact, gallons.result.durationMinutesExact, 1e-9),
    `${liters.result.durationMinutesExact} vs ${gallons.result.durationMinutesExact}`,
  );
  check(
    'equivalent remaining gallons',
    nearlyEqual(liters.result.remainingGallons, gallons.result.remainingGallons, 1e-9),
  );
}

// 5. Invalid inputs
{
  const blank = validateFillTimeInputs({
    capacity: '',
    capacityUnit: 'gal',
    fillPreset: 'empty',
    customPercent: '',
    flowRate: '5',
    flowUnit: 'gpm',
  });
  check('blank capacity invalid', blank.some((e) => e.field === 'capacity'));

  const blankFlow = validateFillTimeInputs({
    capacity: '400',
    capacityUnit: 'gal',
    fillPreset: 'empty',
    customPercent: '',
    flowRate: '',
    flowUnit: 'gpm',
  });
  check('blank flow invalid', blankFlow.some((e) => e.field === 'flowRate'));

  const zeroCap = validateFillTimeInputs({
    capacity: '0',
    capacityUnit: 'gal',
    fillPreset: 'empty',
    customPercent: '',
    flowRate: '5',
    flowUnit: 'gpm',
  });
  check('zero capacity invalid', zeroCap.some((e) => e.field === 'capacity'));

  const zeroFlow = validateFillTimeInputs({
    capacity: '400',
    capacityUnit: 'gal',
    fillPreset: 'empty',
    customPercent: '',
    flowRate: '0',
    flowUnit: 'gpm',
  });
  check('zero flow invalid', zeroFlow.some((e) => e.field === 'flowRate'));

  const negative = validateFillTimeInputs({
    capacity: '-10',
    capacityUnit: 'gal',
    fillPreset: 'empty',
    customPercent: '',
    flowRate: '5',
    flowUnit: 'gpm',
  });
  check('negative capacity invalid', negative.some((e) => e.field === 'capacity'));

  check('letters parse null', parseMeasurement('abc') === null);
  check('Infinity parse null', parseMeasurement('Infinity') === null);

  const letters = calculateFillTime({
    capacity: 'nope',
    capacityUnit: 'gal',
    fillPreset: 'empty',
    customPercent: '',
    flowRate: '5',
    flowUnit: 'gpm',
  });
  check('letters fail calculate', !letters.ok);

  const full = validateFillTimeInputs({
    capacity: '400',
    capacityUnit: 'gal',
    fillPreset: 'custom',
    customPercent: '100',
    flowRate: '5',
    flowUnit: 'gpm',
  });
  check('100% full invalid', full.some((e) => e.field === 'fillPercent'));

  const over = validateFillTimeInputs({
    capacity: '400',
    capacityUnit: 'gal',
    fillPreset: 'custom',
    customPercent: '101',
    flowRate: '5',
    flowUnit: 'gpm',
  });
  check('over 100% invalid', over.some((e) => e.field === 'fillPercent'));

  const below = validateFillTimeInputs({
    capacity: '400',
    capacityUnit: 'gal',
    fillPreset: 'custom',
    customPercent: '-1',
    flowRate: '5',
    flowUnit: 'gpm',
  });
  check('below 0% invalid', below.some((e) => e.field === 'fillPercent'));

  const hugeCap = validateFillTimeInputs({
    capacity: '100001',
    capacityUnit: 'gal',
    fillPreset: 'empty',
    customPercent: '',
    flowRate: '5',
    flowUnit: 'gpm',
  });
  check('extreme capacity invalid', hugeCap.some((e) => e.field === 'capacity'));

  const hugeFlow = validateFillTimeInputs({
    capacity: '400',
    capacityUnit: 'gal',
    fillPreset: 'empty',
    customPercent: '',
    flowRate: '1001',
    flowUnit: 'gpm',
  });
  check('extreme flow invalid', hugeFlow.some((e) => e.field === 'flowRate'));
}

check('formatDurationLabel 80', formatDurationLabel(80) === '1 hour 20 minutes');
check('formatDurationLabel 75', formatDurationLabel(75) === '1 hour 15 minutes');
check('formatDurationLabel 40', formatDurationLabel(40) === '40 minutes');

console.log(`\nAll ${passed} checks passed.`);
