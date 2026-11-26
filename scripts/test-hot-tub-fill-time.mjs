import {
  addMinutes,
  calculateFillTime,
  calculateFlowFromBucket,
  estimateWaterCost,
  exampleEmptyFillMinutes,
  formatDurationLabel,
  LITERS_PER_US_GALLON,
  parseLocalTimeInput,
  parseMeasurement,
  toDollarsPerGallon,
  validateFillTimeInputs,
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

function baseKnown(overrides = {}) {
  return {
    capacity: '400',
    capacityUnit: 'gal',
    fillPreset: 'empty',
    customPercent: '',
    flowInputMode: 'known',
    flowRate: '5',
    flowUnit: 'gpm',
    bucketPreset: '5',
    customBucketCapacity: '',
    bucketUnit: 'gal',
    bucketSeconds: '',
    waterRate: '',
    waterRateUnit: 'per_1000_gal',
    ...overrides,
  };
}

// 1. 400 gallons, empty, 5 gpm → 400 gal remaining, 80 minutes
{
  const result = calculateFillTime(baseKnown());
  assert(result.ok, 'case 1 should succeed');
  check('400 empty remaining gallons', result.result.displayRemainingGallons === 400);
  check('400 empty remaining liters', result.result.displayRemainingLiters === Math.round(400 * LITERS_PER_US_GALLON));
  check('400 empty duration exact', nearlyEqual(result.result.durationMinutesExact, 80));
  check('400 empty duration minutes', result.result.displayTotalMinutes === 80);
  check('400 empty duration label', result.result.durationLabel === '1 hour 20 minutes');
  check('400 empty cost unavailable', result.result.waterCost.available === false);
}

// 2. 400 gallons, 50% full, 5 gpm → 200 gal, 40 minutes
{
  const result = calculateFillTime(baseKnown({ fillPreset: '50' }));
  assert(result.ok, 'case 2 should succeed');
  check('50% remaining gallons', result.result.displayRemainingGallons === 200);
  check('50% duration exact', nearlyEqual(result.result.durationMinutesExact, 40));
  check('50% duration label', result.result.durationLabel === '40 minutes');
}

// 3. 1,500 liters, empty, 20 L/min → 1,500 L, 75 minutes
{
  const result = calculateFillTime(
    baseKnown({
      capacity: '1500',
      capacityUnit: 'L',
      flowRate: '20',
      flowUnit: 'lpm',
    }),
  );
  assert(result.ok, 'case 3 should succeed');
  check('1500 L remaining liters', result.result.displayRemainingLiters === 1500);
  check('1500 L duration exact', nearlyEqual(result.result.durationMinutesExact, 75));
  check('1500 L duration label', result.result.durationLabel === '1 hour 15 minutes');
}

// 4. Equivalent conversion: 400 gal @ 5 gpm vs liters / L/min
{
  const gallons = calculateFillTime(baseKnown());
  assert(gallons.ok, 'gallons case should succeed');

  const litersCapacity = String(400 * LITERS_PER_US_GALLON);
  const litersFlow = String(5 * LITERS_PER_US_GALLON);
  const liters = calculateFillTime(
    baseKnown({
      capacity: litersCapacity,
      capacityUnit: 'L',
      flowRate: litersFlow,
      flowUnit: 'lpm',
    }),
  );
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
  const blank = validateFillTimeInputs(baseKnown({ capacity: '' }));
  check('blank capacity invalid', blank.some((e) => e.field === 'capacity'));

  const blankFlow = validateFillTimeInputs(baseKnown({ flowRate: '' }));
  check('blank flow invalid', blankFlow.some((e) => e.field === 'flowRate'));

  const zeroCap = validateFillTimeInputs(baseKnown({ capacity: '0' }));
  check('zero capacity invalid', zeroCap.some((e) => e.field === 'capacity'));

  const zeroFlow = validateFillTimeInputs(baseKnown({ flowRate: '0' }));
  check('zero flow invalid', zeroFlow.some((e) => e.field === 'flowRate'));

  const negative = validateFillTimeInputs(baseKnown({ capacity: '-10' }));
  check('negative capacity invalid', negative.some((e) => e.field === 'capacity'));

  check('letters parse null', parseMeasurement('abc') === null);
  check('Infinity parse null', parseMeasurement('Infinity') === null);

  const letters = calculateFillTime(baseKnown({ capacity: 'nope' }));
  check('letters fail calculate', !letters.ok);

  const full = validateFillTimeInputs(baseKnown({ fillPreset: 'custom', customPercent: '100' }));
  check('100% full invalid', full.some((e) => e.field === 'fillPercent'));

  const over = validateFillTimeInputs(baseKnown({ fillPreset: 'custom', customPercent: '101' }));
  check('over 100% invalid', over.some((e) => e.field === 'fillPercent'));

  const below = validateFillTimeInputs(baseKnown({ fillPreset: 'custom', customPercent: '-1' }));
  check('below 0% invalid', below.some((e) => e.field === 'fillPercent'));

  const hugeCap = validateFillTimeInputs(baseKnown({ capacity: '100001' }));
  check('extreme capacity invalid', hugeCap.some((e) => e.field === 'capacity'));

  const hugeFlow = validateFillTimeInputs(baseKnown({ flowRate: '1001' }));
  check('extreme flow invalid', hugeFlow.some((e) => e.field === 'flowRate'));
}

check('formatDurationLabel 80', formatDurationLabel(80) === '1 hour 20 minutes');
check('formatDurationLabel 75', formatDurationLabel(75) === '1 hour 15 minutes');
check('formatDurationLabel 40', formatDurationLabel(40) === '40 minutes');

// 6. Bucket-derived flow rate: 5 gal in 60 seconds → 5 gpm
{
  const measured = calculateFlowFromBucket({
    bucketPreset: '5',
    customBucketCapacity: '',
    bucketUnit: 'gal',
    bucketSeconds: '60',
  });
  assert(measured.ok, '5 gal / 60 s should succeed');
  check('bucket 5/60 flow', nearlyEqual(measured.flowPerMinute, 5));
  check('bucket 5/60 unit gpm', measured.flowUnit === 'gpm');

  const result = calculateFillTime(
    baseKnown({
      flowInputMode: 'measure',
      flowRate: '',
      bucketPreset: '5',
      bucketUnit: 'gal',
      bucketSeconds: '60',
    }),
  );
  assert(result.ok, 'measure mode should succeed');
  check('measure mode remaining', result.result.displayRemainingGallons === 400);
  check('measure mode duration', result.result.displayTotalMinutes === 80);
  check('measure mode flagged', result.result.measuredFromBucket === true);
  check('measure mode flow value', nearlyEqual(result.result.flowValue, 5));
}

// 7. Bucket liters: 10 L in 30 seconds → 20 L/min
{
  const measured = calculateFlowFromBucket({
    bucketPreset: '10',
    customBucketCapacity: '',
    bucketUnit: 'L',
    bucketSeconds: '30',
  });
  assert(measured.ok, '10 L / 30 s should succeed');
  check('bucket 10L/30s flow', nearlyEqual(measured.flowPerMinute, 20));
  check('bucket 10L/30s unit lpm', measured.flowUnit === 'lpm');
}

// 8. Custom bucket capacity + fractional flow
{
  const measured = calculateFlowFromBucket({
    bucketPreset: 'custom',
    customBucketCapacity: '2.5',
    bucketUnit: 'gal',
    bucketSeconds: '45',
  });
  assert(measured.ok, 'custom bucket should succeed');
  check('fractional flow', nearlyEqual(measured.flowPerMinute, (2.5 * 60) / 45));

  const result = calculateFillTime(
    baseKnown({
      capacity: '300',
      flowInputMode: 'measure',
      flowRate: '',
      bucketPreset: 'custom',
      customBucketCapacity: '2.5',
      bucketSeconds: '45',
    }),
  );
  assert(result.ok, 'fractional measure fill should succeed');
  const expectedMinutes = 300 / ((2.5 * 60) / 45);
  check('fractional fill duration', nearlyEqual(result.result.durationMinutesExact, expectedMinutes));
}

// 9. Invalid bucket capacity / seconds
{
  const zeroBucket = calculateFlowFromBucket({
    bucketPreset: 'custom',
    customBucketCapacity: '0',
    bucketUnit: 'gal',
    bucketSeconds: '60',
  });
  check('zero bucket invalid', !zeroBucket.ok && zeroBucket.errors.some((e) => e.field === 'bucketCapacity'));

  const negativeBucket = calculateFlowFromBucket({
    bucketPreset: 'custom',
    customBucketCapacity: '-2',
    bucketUnit: 'gal',
    bucketSeconds: '60',
  });
  check(
    'negative bucket invalid',
    !negativeBucket.ok && negativeBucket.errors.some((e) => e.field === 'bucketCapacity'),
  );

  const blankBucket = calculateFlowFromBucket({
    bucketPreset: 'custom',
    customBucketCapacity: '',
    bucketUnit: 'gal',
    bucketSeconds: '60',
  });
  check('blank custom bucket invalid', !blankBucket.ok && blankBucket.errors.some((e) => e.field === 'bucketCapacity'));

  const zeroSeconds = calculateFlowFromBucket({
    bucketPreset: '5',
    customBucketCapacity: '',
    bucketUnit: 'gal',
    bucketSeconds: '0',
  });
  check('zero seconds invalid', !zeroSeconds.ok && zeroSeconds.errors.some((e) => e.field === 'bucketSeconds'));

  const negativeSeconds = calculateFlowFromBucket({
    bucketPreset: '5',
    customBucketCapacity: '',
    bucketUnit: 'gal',
    bucketSeconds: '-10',
  });
  check(
    'negative seconds invalid',
    !negativeSeconds.ok && negativeSeconds.errors.some((e) => e.field === 'bucketSeconds'),
  );

  const blankSeconds = calculateFlowFromBucket({
    bucketPreset: '5',
    customBucketCapacity: '',
    bucketUnit: 'gal',
    bucketSeconds: '',
  });
  check('blank seconds invalid', !blankSeconds.ok && blankSeconds.errors.some((e) => e.field === 'bucketSeconds'));

  const wrongPresetUnit = calculateFlowFromBucket({
    bucketPreset: '1',
    customBucketCapacity: '',
    bucketUnit: 'L',
    bucketSeconds: '60',
  });
  check(
    'gallon preset with liters invalid',
    !wrongPresetUnit.ok && wrongPresetUnit.errors.some((e) => e.field === 'bucketCapacity'),
  );
}

// 10. Partial fill with measure mode
{
  const result = calculateFillTime(
    baseKnown({
      fillPreset: '25',
      flowInputMode: 'measure',
      flowRate: '',
      bucketPreset: '5',
      bucketSeconds: '60',
    }),
  );
  assert(result.ok, 'partial measure should succeed');
  check('25% measure remaining', result.result.displayRemainingGallons === 300);
  check('25% measure duration', result.result.displayTotalMinutes === 60);
}

// 11. Water cost using remaining capacity
{
  // 400 gal empty @ $5 / 1000 gal → $2.00
  const full = calculateFillTime(
    baseKnown({
      waterRate: '5',
      waterRateUnit: 'per_1000_gal',
    }),
  );
  assert(full.ok, 'water cost full should succeed');
  check('water cost available', full.result.waterCost.available === true);
  check('water cost 400 gal', nearlyEqual(full.result.waterCost.costUsd, 2));
  check('water cost display', full.result.waterCost.displayCostUsd === '$2.00');

  // 400 gal at 50% → 200 remaining @ $5 / 1000 gal → $1.00
  const partial = calculateFillTime(
    baseKnown({
      fillPreset: '50',
      waterRate: '5',
      waterRateUnit: 'per_1000_gal',
    }),
  );
  assert(partial.ok, 'partial water cost should succeed');
  check('water cost uses remaining', nearlyEqual(partial.result.waterCost.costUsd, 1));

  // per-gallon rate
  const perGal = estimateWaterCost(200, '0.01', 'per_gal');
  assert(perGal.ok, 'per-gal estimate should succeed');
  check('per-gal cost', nearlyEqual(perGal.estimate.costUsd, 2));

  check('toDollarsPerGallon 1000', nearlyEqual(toDollarsPerGallon(5, 'per_1000_gal'), 0.005));
  check('toDollarsPerGallon per L', nearlyEqual(toDollarsPerGallon(1, 'per_L'), LITERS_PER_US_GALLON));
}

// 12. Missing optional cost rate
{
  const missing = estimateWaterCost(400, '', 'per_1000_gal');
  assert(missing.ok, 'blank rate should be ok');
  check('missing rate unavailable', missing.estimate.available === false);
  check('missing rate null cost', missing.estimate.costUsd === null);

  const blankInCalc = calculateFillTime(baseKnown({ waterRate: '   ' }));
  assert(blankInCalc.ok, 'whitespace rate should succeed');
  check('whitespace rate unavailable', blankInCalc.result.waterCost.available === false);

  const invalidRate = validateFillTimeInputs(baseKnown({ waterRate: 'abc' }));
  check('invalid water rate', invalidRate.some((e) => e.field === 'waterRate'));

  const negativeRate = validateFillTimeInputs(baseKnown({ waterRate: '-1' }));
  check('negative water rate', negativeRate.some((e) => e.field === 'waterRate'));
}

// 13. Start / completion time helpers
{
  const now = new Date(2026, 10, 26, 12, 0, 0);
  const parsed = parseLocalTimeInput('14:30', now);
  assert(parsed, 'parseLocalTimeInput should return a date');
  check('parse hours', parsed.getHours() === 14);
  check('parse minutes', parsed.getMinutes() === 30);
  check('blank time null', parseLocalTimeInput('') === null);
  check('bad time null', parseLocalTimeInput('25:00') === null);

  const finish = addMinutes(parsed, 80);
  check('addMinutes hours', finish.getHours() === 15);
  check('addMinutes minutes', finish.getMinutes() === 50);
}

// 14. Example table accuracy (empty spa, nearest minute)
{
  const expected = {
    200: { 4: 50, 6: 33, 8: 25, 10: 20 },
    300: { 4: 75, 6: 50, 8: 38, 10: 30 },
    400: { 4: 100, 6: 67, 8: 50, 10: 40 },
    500: { 4: 125, 6: 83, 8: 63, 10: 50 },
    600: { 4: 150, 6: 100, 8: 75, 10: 60 },
  };

  for (const [capacity, flows] of Object.entries(expected)) {
    for (const [flow, minutes] of Object.entries(flows)) {
      const actual = exampleEmptyFillMinutes(Number(capacity), Number(flow));
      check(`example ${capacity} gal @ ${flow} gpm`, actual === minutes, `got ${actual}`);
    }
  }
}

// 15. Known mode still preferred path when measure fields are blank
{
  const known = calculateFillTime(
    baseKnown({
      flowInputMode: 'known',
      flowRate: '8',
      bucketSeconds: '',
    }),
  );
  assert(known.ok, 'known mode ignores blank bucket fields');
  check('known mode not measured', known.result.measuredFromBucket === false);
  check('known mode duration 50', known.result.displayTotalMinutes === 50);
}

console.log(`\nAll ${passed} checks passed.`);
