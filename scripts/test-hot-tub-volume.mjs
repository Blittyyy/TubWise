import {
  calculateVolume,
  toFeet,
  parseMeasurement,
  validateVolumeInputs,
  GALLONS_PER_CUBIC_FOOT,
  LITERS_PER_US_GALLON,
} from '../src/utils/hot-tub-volume.ts';

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

// 1. Rectangular 7 × 7 × 2.5 ft
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
}

// 2. Round diameter 7 ft, depth 2.5 ft
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

// 3. Equivalent units for 7 feet
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

// 4. Invalid inputs
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
}

console.log(`\nAll ${passed} checks passed.`);
