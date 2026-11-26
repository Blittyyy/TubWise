import {
  calculateWeight,
  convertFieldForUnitSwitch,
  exampleWeights,
  gallonsToLiters,
  KG_PER_LB,
  LB_PER_US_GALLON,
  LITERS_PER_US_GALLON,
  METERS_PER_FOOT,
  parseMeasurement,
  validateWeightInputs,
  waterWeightFromGallons,
  waterWeightFromLiters,
} from '../src/utils/hot-tub-weight.ts';

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

function base(overrides = {}) {
  return {
    unitSystem: 'us',
    dryWeight: '800',
    capacity: '400',
    occupants: '4',
    avgOccupantWeight: '175',
    additionalWeight: '0',
    footprintLength: '',
    footprintWidth: '',
    ...overrides,
  };
}

// Water weight conversion
check('USGS 8.34 constant', LB_PER_US_GALLON === 8.34);
check('400 gal water weight', nearlyEqual(waterWeightFromGallons(400), 3336));
check('explicit 400×8.34', nearlyEqual(400 * 8.34, 3336));

// Gallon/liter equivalence
{
  const liters = gallonsToLiters(400);
  check('400 gal to liters', nearlyEqual(liters, 400 * LITERS_PER_US_GALLON));
  check(
    'liter water weight matches gallon path',
    nearlyEqual(waterWeightFromLiters(liters), waterWeightFromGallons(400), 1e-9),
  );
}

// Core example: 800 dry + 400 gal + 4×175
{
  const result = calculateWeight(base());
  assert(result.ok, 'core case should succeed');
  check('water 3336', nearlyEqual(result.result.waterWeightLb, 3336));
  check('filled 4136', nearlyEqual(result.result.filledWeightLb, 4136));
  check('occupants 700', nearlyEqual(result.result.totalOccupantWeightLb, 700));
  check('total 4836', nearlyEqual(result.result.totalOccupiedWeightLb, 4836));
}

// Zero occupants
{
  const result = calculateWeight(base({ occupants: '0', avgOccupantWeight: '' }));
  assert(result.ok, 'zero occupants should succeed');
  check('zero occupant weight', result.result.totalOccupantWeightLb === 0);
  check('zero occ total equals filled', nearlyEqual(result.result.totalOccupiedWeightLb, 4136));
}

// Additional accessory weight
{
  const result = calculateWeight(base({ additionalWeight: '50' }));
  assert(result.ok, 'accessory case');
  check('filled with accessory', nearlyEqual(result.result.filledWeightLb, 4186));
  check('total with accessory', nearlyEqual(result.result.totalOccupiedWeightLb, 4886));
}

// Footprint average: 7×7 → 4836/49 ≈ 98.7
{
  const result = calculateWeight(base({ footprintLength: '7', footprintWidth: '7' }));
  assert(result.ok, 'footprint case');
  check('has footprint', result.result.hasFootprint === true);
  check('area 49', nearlyEqual(result.result.footprintAreaSqFt, 49));
  check('avg psf ~98.7', nearlyEqual(result.result.averageWeightPerSqFt, 4836 / 49, 1e-9));
  check('display avg 98.7', result.result.display.averageWeightPerArea === 98.7);
}

// Missing optional footprint
{
  const result = calculateWeight(base());
  assert(result.ok, 'no footprint');
  check('no footprint flag', result.result.hasFootprint === false);
  check('no avg weight', result.result.averageWeightPerSqFt === null);
}

// Invalid footprint dimensions
{
  check(
    'one-sided footprint invalid',
    validateWeightInputs(base({ footprintLength: '7', footprintWidth: '' })).some(
      (e) => e.field === 'footprintWidth',
    ),
  );
  check(
    'zero footprint invalid',
    validateWeightInputs(base({ footprintLength: '0', footprintWidth: '7' })).some(
      (e) => e.field === 'footprintLength',
    ),
  );
  check(
    'negative footprint invalid',
    validateWeightInputs(base({ footprintLength: '-2', footprintWidth: '7' })).some(
      (e) => e.field === 'footprintLength',
    ),
  );
}

// Invalid dry / capacity / occupants / avg weight
{
  check(
    'blank dry invalid',
    validateWeightInputs(base({ dryWeight: '' })).some((e) => e.field === 'dryWeight'),
  );
  check(
    'zero dry invalid',
    validateWeightInputs(base({ dryWeight: '0' })).some((e) => e.field === 'dryWeight'),
  );
  check(
    'negative dry invalid',
    validateWeightInputs(base({ dryWeight: '-10' })).some((e) => e.field === 'dryWeight'),
  );
  check(
    'negative capacity invalid',
    validateWeightInputs(base({ capacity: '-1' })).some((e) => e.field === 'capacity'),
  );
  check(
    'zero capacity invalid',
    validateWeightInputs(base({ capacity: '0' })).some((e) => e.field === 'capacity'),
  );
  check(
    'negative occupants invalid',
    validateWeightInputs(base({ occupants: '-1' })).some((e) => e.field === 'occupants'),
  );
  check(
    'fractional occupants invalid',
    validateWeightInputs(base({ occupants: '2.5' })).some((e) => e.field === 'occupants'),
  );
  check(
    'blank avg with occupants invalid',
    validateWeightInputs(base({ occupants: '2', avgOccupantWeight: '' })).some(
      (e) => e.field === 'avgOccupantWeight',
    ),
  );
  check(
    'zero avg with occupants invalid',
    validateWeightInputs(base({ occupants: '2', avgOccupantWeight: '0' })).some(
      (e) => e.field === 'avgOccupantWeight',
    ),
  );
  check(
    'negative avg invalid',
    validateWeightInputs(base({ avgOccupantWeight: '-10' })).some(
      (e) => e.field === 'avgOccupantWeight',
    ),
  );
}

// Non-finite / letters
{
  check('letters parse null', parseMeasurement('abc') === null);
  check('Infinity parse null', parseMeasurement('Infinity') === null);
  check('letters fail', !calculateWeight(base({ dryWeight: 'nope' })).ok);
}

// Fractional inputs
{
  const result = calculateWeight(
    base({
      dryWeight: '812.5',
      capacity: '387.25',
      avgOccupantWeight: '172.5',
      additionalWeight: '12.25',
    }),
  );
  assert(result.ok, 'fractional should succeed');
  check('fractional total finite', Number.isFinite(result.result.totalOccupiedWeightLb));
}

// Large valid values
{
  const result = calculateWeight(
    base({
      dryWeight: '2000',
      capacity: '800',
      occupants: '8',
      avgOccupantWeight: '180',
    }),
  );
  assert(result.ok, 'large valid should succeed');
  check('large water', nearlyEqual(result.result.waterWeightLb, 800 * 8.34));
}

// Example table accuracy
{
  const rows = [
    { dry: 400, gal: 200, occ: 2, filled: 2068, total: 2418 },
    { dry: 600, gal: 300, occ: 4, filled: 3102, total: 3802 },
    { dry: 800, gal: 400, occ: 4, filled: 4136, total: 4836 },
    { dry: 900, gal: 500, occ: 6, filled: 5070, total: 6120 },
    { dry: 1000, gal: 600, occ: 6, filled: 6004, total: 7054 },
  ];
  for (const row of rows) {
    const example = exampleWeights({
      dryWeightLb: row.dry,
      capacityGallons: row.gal,
      occupants: row.occ,
      avgOccupantWeightLb: 175,
    });
    check(
      `example filled ${row.dry}/${row.gal}`,
      nearlyEqual(example.filledWeightLb, row.filled),
      `got ${example.filledWeightLb}`,
    );
    check(
      `example total ${row.dry}/${row.gal}`,
      nearlyEqual(example.totalOccupiedWeightLb, row.total),
      `got ${example.totalOccupiedWeightLb}`,
    );
  }
}

// Pound/kilogram and unit equivalence
{
  const us = calculateWeight(base());
  assert(us.ok, 'us baseline');
  const dryKg = String(800 * KG_PER_LB);
  const capL = String(400 * LITERS_PER_US_GALLON);
  const avgKg = String(175 * KG_PER_LB);
  const metric = calculateWeight({
    unitSystem: 'metric',
    dryWeight: dryKg,
    capacity: capL,
    occupants: '4',
    avgOccupantWeight: avgKg,
    additionalWeight: '0',
    footprintLength: '',
    footprintWidth: '',
  });
  assert(metric.ok, 'metric equivalent');
  check(
    'unit-equivalent total lb',
    nearlyEqual(metric.result.totalOccupiedWeightLb, us.result.totalOccupiedWeightLb, 1e-6),
  );
  check(
    'unit-equivalent water lb',
    nearlyEqual(metric.result.waterWeightLb, us.result.waterWeightLb, 1e-6),
  );
}

// Foot/meter equivalence for footprint
{
  const us = calculateWeight(base({ footprintLength: '7', footprintWidth: '7' }));
  assert(us.ok, 'us footprint');
  const meters = String(7 * METERS_PER_FOOT);
  const metric = calculateWeight({
    unitSystem: 'metric',
    dryWeight: String(800 * KG_PER_LB),
    capacity: String(400 * LITERS_PER_US_GALLON),
    occupants: '4',
    avgOccupantWeight: String(175 * KG_PER_LB),
    additionalWeight: '0',
    footprintLength: meters,
    footprintWidth: meters,
  });
  assert(metric.ok, 'metric footprint');
  check(
    'unit-equivalent psf',
    nearlyEqual(metric.result.averageWeightPerSqFt, us.result.averageWeightPerSqFt, 1e-6),
  );
}

// Unit-switching helper
{
  const kg = convertFieldForUnitSwitch('dryWeight', '800', 'us', 'metric');
  check('switch dry to kg', nearlyEqual(Number(kg), 800 * KG_PER_LB, 1e-4));
  const back = convertFieldForUnitSwitch('dryWeight', kg, 'metric', 'us');
  check('switch dry back to lb', nearlyEqual(Number(back), 800, 1e-3));
  const liters = convertFieldForUnitSwitch('capacity', '400', 'us', 'metric');
  check('switch capacity to L', nearlyEqual(Number(liters), 400 * LITERS_PER_US_GALLON, 1e-4));
}

console.log(`\nAll ${passed} checks passed.`);
