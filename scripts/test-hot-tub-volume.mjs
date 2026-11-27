import {
  calculateVolume,
  calculateVolumeFromFillTime,
  calculateVolumeFromMeter,
  gallonsFromMeterUnit,
  octagonAreaSqFt,
  toFeet,
  parseMeasurement,
  validateVolumeInputs,
  volumeFromFlowAndMinutes,
  GALLONS_PER_CUBIC_FOOT,
  LITERS_PER_US_GALLON,
  LITERS_PER_CUBIC_METER,
  OCTAGON_AREA_FACTOR,
} from '../src/utils/hot-tub-volume.ts';
import { calculateFlowFromBucket } from '../src/utils/hot-tub-fill-time.ts';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function nearlyEqual(a, b, epsilon = 0.05) {
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

// 1. Rectangular 7 × 7 × 2.5 ft (preserved)
{
  const cubicFeet = 7 * 7 * 2.5;
  check('rect cubic feet', nearlyEqual(cubicFeet, 122.5), String(cubicFeet));
  const expectedGallons = cubicFeet * GALLONS_PER_CUBIC_FOOT;
  const expectedLiters = expectedGallons * LITERS_PER_US_GALLON;
  const result = calculateVolume({
    shape: 'rectangular',
    unit: 'ft',
    length: '7',
    width: '7',
    diameter: '',
    depth: '2.5',
  });
  assert(result.ok, 'rect calculation should succeed');
  check('rect gallons ~916.36', nearlyEqual(result.result.gallons, expectedGallons, 0.01));
  check('rect gallons ~916.36 absolute', nearlyEqual(result.result.gallons, 916.36, 0.01));
  check('rect liters ~3468.7', nearlyEqual(result.result.liters, expectedLiters, 0.1));
  check('rect liters ~3468.8 absolute', nearlyEqual(result.result.liters, 3468.8, 0.1));
  check('rect display gallons', result.result.displayGallons === Math.round(expectedGallons));
  check('rect method dimensions', result.result.method === 'dimensions');
  check('rect no displacement by default', result.result.displacementPercent === 0);
  check('rect unadjusted null when no displacement', result.result.unadjustedGallons === null);
}

// 2. Round diameter 7 ft, depth 2.5 ft (preserved)
{
  const cubicFeet = Math.PI * (7 / 2) ** 2 * 2.5;
  const expectedGallons = cubicFeet * GALLONS_PER_CUBIC_FOOT;
  const result = calculateVolume({
    shape: 'round',
    unit: 'ft',
    length: '',
    width: '',
    diameter: '7',
    depth: '2.5',
  });
  assert(result.ok, 'round calculation should succeed');
  check('round gallons ~719.7', nearlyEqual(result.result.gallons, expectedGallons, 0.05));
  check('round gallons ~719.7 absolute', nearlyEqual(result.result.gallons, 719.7, 0.1));
}

// 3. Regular octagon across flats
{
  const widthFt = 7;
  const depthFt = 2.5;
  const area = OCTAGON_AREA_FACTOR * widthFt * widthFt;
  check('octagon area factor', nearlyEqual(OCTAGON_AREA_FACTOR, 2 * (Math.SQRT2 - 1), 1e-12));
  check('octagonAreaSqFt helper', nearlyEqual(octagonAreaSqFt(widthFt), area, 1e-12));
  const expectedGallons = area * depthFt * GALLONS_PER_CUBIC_FOOT;
  const result = calculateVolume({
    shape: 'octagonal',
    unit: 'ft',
    length: '',
    width: '',
    diameter: '',
    octagonWidth: '7',
    depth: '2.5',
  });
  assert(result.ok, 'octagon calculation should succeed');
  check('octagon gallons', nearlyEqual(result.result.gallons, expectedGallons, 0.05));
  check('octagon shape label path', result.result.shape === 'octagonal');
}

// 4. Optional displacement — no accidental double adjustment
{
  const base = calculateVolume({
    shape: 'rectangular',
    unit: 'ft',
    length: '7',
    width: '7',
    diameter: '',
    depth: '2.5',
  });
  assert(base.ok, 'base for displacement');
  const adjusted = calculateVolume({
    shape: 'rectangular',
    unit: 'ft',
    length: '7',
    width: '7',
    diameter: '',
    depth: '2.5',
    displacementPercent: '10',
  });
  assert(adjusted.ok, 'displacement calc');
  check(
    'displacement 10% reduces volume',
    nearlyEqual(adjusted.result.gallons, base.result.gallons * 0.9, 0.01),
  );
  check('displacement stores unadjusted', nearlyEqual(adjusted.result.unadjustedGallons, base.result.gallons, 0.01));
  check('displacement percent recorded', adjusted.result.displacementPercent === 10);

  // Blank displacement preserves simple path
  const blankDisp = calculateVolume({
    shape: 'rectangular',
    unit: 'ft',
    length: '7',
    width: '7',
    diameter: '',
    depth: '2.5',
    displacementPercent: '',
  });
  assert(blankDisp.ok, 'blank displacement');
  check('blank displacement equals base', nearlyEqual(blankDisp.result.gallons, base.result.gallons, 0.01));

  // Depth already reduced AND displacement would be double adjustment if user does both —
  // calculator applies displacement only to geometric volume; no automatic seat depth reduction.
  const halfDepth = calculateVolume({
    shape: 'rectangular',
    unit: 'ft',
    length: '7',
    width: '7',
    diameter: '',
    depth: '1.25',
    displacementPercent: '10',
  });
  assert(halfDepth.ok, 'half depth with displacement');
  check(
    'no hidden second seat adjustment',
    nearlyEqual(halfDepth.result.gallons, base.result.gallons * 0.5 * 0.9, 0.05),
  );
}

// 5. Equivalent units for 7 feet (preserved)
{
  check('7 ft', nearlyEqual(toFeet(7, 'ft'), 7));
  check('84 in', nearlyEqual(toFeet(84, 'in'), 7));
  check('213.36 cm', nearlyEqual(toFeet(213.36, 'cm'), 7, 1e-9));
  check('2.1336 m', nearlyEqual(toFeet(2.1336, 'm'), 7, 1e-9));

  const base = calculateVolume({
    shape: 'rectangular',
    unit: 'ft',
    length: '7',
    width: '7',
    diameter: '',
    depth: '2.5',
  });
  assert(base.ok, 'base ft calc');

  for (const [unit, length, width, depth] of [
    ['in', '84', '84', '30'],
    ['cm', '213.36', '213.36', '76.2'],
    ['m', '2.1336', '2.1336', '0.762'],
  ]) {
    const alt = calculateVolume({
      shape: 'rectangular',
      unit,
      length,
      width,
      diameter: '',
      depth,
    });
    assert(alt.ok, `${unit} calc`);
    check(
      `equivalent ${unit}`,
      nearlyEqual(alt.result.gallons, base.result.gallons, 0.05),
      `${alt.result.gallons} vs ${base.result.gallons}`,
    );
  }
}

// 6. Bucket-derived flow + fill-time capacity (worked example)
{
  const bucket = calculateFlowFromBucket({
    bucketPreset: '5',
    customBucketCapacity: '',
    bucketUnit: 'gal',
    bucketSeconds: '30',
  });
  assert(bucket.ok, 'bucket flow should succeed');
  check('bucket flow 10 gpm', nearlyEqual(bucket.flowPerMinute, 10, 1e-9));

  const fill = calculateVolumeFromFillTime({
    fillDuration: '40',
    fillDurationUnit: 'minutes',
    flowInputMode: 'known',
    flowRate: '10',
    flowUnit: 'gpm',
    bucketPreset: '5',
    customBucketCapacity: '',
    bucketUnit: 'gal',
    bucketSeconds: '',
  });
  assert(fill.ok, 'fill-time volume should succeed');
  check('fill-time 400 gallons', nearlyEqual(fill.result.gallons, 400, 1e-9));
  check('fill-time liters', nearlyEqual(fill.result.liters, 400 * LITERS_PER_US_GALLON, 0.01));
  check('worked example helper', volumeFromFlowAndMinutes(10, 40) === 400);
  check('fill method label', fill.result.method === 'fillTime');

  const fromBucket = calculateVolumeFromFillTime({
    fillDuration: '40',
    fillDurationUnit: 'minutes',
    flowInputMode: 'measure',
    flowRate: '',
    flowUnit: 'gpm',
    bucketPreset: '5',
    customBucketCapacity: '',
    bucketUnit: 'gal',
    bucketSeconds: '30',
  });
  assert(fromBucket.ok, 'bucket fill-time volume');
  check('bucket-derived capacity 400', nearlyEqual(fromBucket.result.gallons, 400, 1e-9));

  const hours = calculateVolumeFromFillTime({
    fillDuration: '1',
    fillDurationUnit: 'hours',
    flowInputMode: 'known',
    flowRate: '10',
    flowUnit: 'gpm',
    bucketPreset: '5',
    customBucketCapacity: '',
    bucketUnit: 'gal',
    bucketSeconds: '',
  });
  assert(hours.ok, 'hours duration');
  check('1 hour at 10 gpm = 600 gal', nearlyEqual(hours.result.gallons, 600, 1e-9));
}

// 7. Gallon/liter flow and meter conversions
{
  const litersFlow = calculateVolumeFromFillTime({
    fillDuration: '40',
    fillDurationUnit: 'minutes',
    flowInputMode: 'known',
    flowRate: String(10 * LITERS_PER_US_GALLON),
    flowUnit: 'lpm',
    bucketPreset: '5',
    customBucketCapacity: '',
    bucketUnit: 'gal',
    bucketSeconds: '',
  });
  assert(litersFlow.ok, 'lpm flow');
  check('lpm equivalent to 400 gal', nearlyEqual(litersFlow.result.gallons, 400, 0.05));

  check('gal from L', nearlyEqual(gallonsFromMeterUnit(LITERS_PER_US_GALLON, 'L'), 1, 1e-9));
  check(
    'gal from m3',
    nearlyEqual(gallonsFromMeterUnit(1, 'm3'), LITERS_PER_CUBIC_METER / LITERS_PER_US_GALLON, 1e-6),
  );
  check('gal from ft3', nearlyEqual(gallonsFromMeterUnit(1, 'ft3'), GALLONS_PER_CUBIC_FOOT, 1e-9));
}

// 8. Meter reading differences
{
  const startEnd = calculateVolumeFromMeter({
    entryMode: 'startEnd',
    meterUnit: 'gal',
    meterStart: '1200',
    meterEnd: '1600',
    meterDirect: '',
  });
  assert(startEnd.ok, 'meter start/end');
  check('meter delta 400 gal', nearlyEqual(startEnd.result.gallons, 400, 1e-9));
  check('meter method', startEnd.result.method === 'meter');

  const direct = calculateVolumeFromMeter({
    entryMode: 'direct',
    meterUnit: 'L',
    meterStart: '',
    meterEnd: '',
    meterDirect: String(400 * LITERS_PER_US_GALLON),
  });
  assert(direct.ok, 'meter direct liters');
  check('direct liters ~400 gal', nearlyEqual(direct.result.gallons, 400, 0.01));

  const m3 = calculateVolumeFromMeter({
    entryMode: 'direct',
    meterUnit: 'm3',
    meterStart: '',
    meterEnd: '',
    meterDirect: '1',
  });
  assert(m3.ok, 'm3 meter');
  check(
    '1 m3 gallons',
    nearlyEqual(m3.result.gallons, LITERS_PER_CUBIC_METER / LITERS_PER_US_GALLON, 0.01),
  );

  const ft3 = calculateVolumeFromMeter({
    entryMode: 'startEnd',
    meterUnit: 'ft3',
    meterStart: '10',
    meterEnd: '20',
    meterDirect: '',
  });
  assert(ft3.ok, 'ft3 meter');
  check('10 ft3 gallons', nearlyEqual(ft3.result.gallons, 10 * GALLONS_PER_CUBIC_FOOT, 0.01));
}

// 9. Invalid / negative / zero / non-finite
{
  const blank = validateVolumeInputs({
    shape: 'rectangular',
    unit: 'ft',
    length: '',
    width: '7',
    diameter: '',
    depth: '2.5',
  });
  check('blank length invalid', blank.some((e) => e.field === 'length'));

  const zero = validateVolumeInputs({
    shape: 'rectangular',
    unit: 'ft',
    length: '0',
    width: '7',
    diameter: '',
    depth: '2.5',
  });
  check('zero invalid', zero.some((e) => e.field === 'length'));

  const negative = validateVolumeInputs({
    shape: 'round',
    unit: 'ft',
    length: '',
    width: '',
    diameter: '-3',
    depth: '2',
  });
  check('negative invalid', negative.some((e) => e.field === 'diameter'));

  check('letters parse null', parseMeasurement('abc') === null);
  check('Infinity parse null', parseMeasurement('Infinity') === null);
  check('empty parse null', parseMeasurement('  ') === null);

  const huge = validateVolumeInputs({
    shape: 'rectangular',
    unit: 'ft',
    length: '101',
    width: '7',
    diameter: '',
    depth: '2.5',
  });
  check('extremely large invalid', huge.some((e) => e.field === 'length'));

  const badCalc = calculateVolume({
    shape: 'rectangular',
    unit: 'ft',
    length: 'nope',
    width: '7',
    diameter: '',
    depth: '2.5',
  });
  check('letters fail calculate', !badCalc.ok);

  const badDisp = calculateVolume({
    shape: 'rectangular',
    unit: 'ft',
    length: '7',
    width: '7',
    diameter: '',
    depth: '2.5',
    displacementPercent: '100',
  });
  check('100% displacement invalid', !badDisp.ok);

  const zeroFlow = calculateVolumeFromFillTime({
    fillDuration: '40',
    fillDurationUnit: 'minutes',
    flowInputMode: 'known',
    flowRate: '0',
    flowUnit: 'gpm',
    bucketPreset: '5',
    customBucketCapacity: '',
    bucketUnit: 'gal',
    bucketSeconds: '',
  });
  check('zero flow invalid', !zeroFlow.ok);

  const zeroDuration = calculateVolumeFromFillTime({
    fillDuration: '0',
    fillDurationUnit: 'minutes',
    flowInputMode: 'known',
    flowRate: '10',
    flowUnit: 'gpm',
    bucketPreset: '5',
    customBucketCapacity: '',
    bucketUnit: 'gal',
    bucketSeconds: '',
  });
  check('zero duration invalid', !zeroDuration.ok);

  const negMeter = calculateVolumeFromMeter({
    entryMode: 'startEnd',
    meterUnit: 'gal',
    meterStart: '500',
    meterEnd: '400',
    meterDirect: '',
  });
  check('negative meter difference invalid', !negMeter.ok);

  const zeroMeter = calculateVolumeFromMeter({
    entryMode: 'startEnd',
    meterUnit: 'gal',
    meterStart: '400',
    meterEnd: '400',
    meterDirect: '',
  });
  check('zero meter difference invalid', !zeroMeter.ok);

  const infMeter = calculateVolumeFromMeter({
    entryMode: 'direct',
    meterUnit: 'gal',
    meterStart: '',
    meterEnd: '',
    meterDirect: 'Infinity',
  });
  check('non-finite meter invalid', !infMeter.ok);
}

console.log(`\nAll ${passed} checks passed.`);
