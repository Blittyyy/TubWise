export type UnitSystem = 'us' | 'metric';
export type MassUnit = 'lb' | 'kg';
export type VolumeUnit = 'gal' | 'L';
export type LengthUnit = 'ft' | 'm';

/** USGS Circular 1268: 1 gallon = 8.34 pounds. */
export const LB_PER_US_GALLON = 8.34;
export const LITERS_PER_US_GALLON = 3.785411784;
export const KG_PER_LB = 0.45359237;
export const METERS_PER_FOOT = 0.3048;

/** Technical validation ceilings only — not residential claims. */
export const MAX_DRY_WEIGHT_LB = 50_000;
export const MAX_CAPACITY_GALLONS = 100_000;
export const MAX_OCCUPANTS = 100;
export const MAX_OCCUPANT_WEIGHT_LB = 2_000;
export const MAX_ADDITIONAL_WEIGHT_LB = 20_000;
export const MAX_FOOTPRINT_FT = 100;

export const UNIT_SYSTEM_LABELS: Record<UnitSystem, string> = {
  us: 'U.S. / Imperial',
  metric: 'Metric',
};

export function parseMeasurement(raw: string): number | null {
  const trimmed = raw.trim().replace(/,/g, '');
  if (!trimmed) return null;
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return null;
  return value;
}

export type WeightFieldKey =
  | 'dryWeight'
  | 'capacity'
  | 'occupants'
  | 'avgOccupantWeight'
  | 'additionalWeight'
  | 'footprintLength'
  | 'footprintWidth';

export interface WeightFieldError {
  field: WeightFieldKey;
  message: string;
}

export interface WeightInputs {
  unitSystem: UnitSystem;
  dryWeight: string;
  capacity: string;
  occupants: string;
  avgOccupantWeight: string;
  additionalWeight: string;
  footprintLength: string;
  footprintWidth: string;
}

export interface WeightBreakdownShare {
  id: 'dry' | 'water' | 'additional' | 'occupants';
  label: string;
  weightLb: number;
  percent: number;
}

export interface WeightResult {
  unitSystem: UnitSystem;
  massUnit: MassUnit;
  volumeUnit: VolumeUnit;
  lengthUnit: LengthUnit;
  dryWeightLb: number;
  waterWeightLb: number;
  additionalWeightLb: number;
  filledWeightLb: number;
  occupantCount: number;
  avgOccupantWeightLb: number;
  totalOccupantWeightLb: number;
  totalOccupiedWeightLb: number;
  capacityGallons: number;
  footprintAreaSqFt: number | null;
  averageWeightPerSqFt: number | null;
  averageWeightPerSqM: number | null;
  hasFootprint: boolean;
  breakdown: WeightBreakdownShare[];
  display: {
    dryWeight: number;
    waterWeight: number;
    additionalWeight: number;
    filledWeight: number;
    totalOccupantWeight: number;
    totalOccupiedWeight: number;
    footprintArea: number | null;
    averageWeightPerArea: number | null;
    areaUnitLabel: string;
    massUnitLabel: string;
  };
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function gallonsToLiters(gallons: number): number {
  return gallons * LITERS_PER_US_GALLON;
}

export function litersToGallons(liters: number): number {
  return liters / LITERS_PER_US_GALLON;
}

export function feetToMeters(feet: number): number {
  return feet * METERS_PER_FOOT;
}

export function metersToFeet(meters: number): number {
  return meters / METERS_PER_FOOT;
}

/** USGS approximation: water weight (lb) = US gallons × 8.34 */
export function waterWeightFromGallons(gallons: number): number {
  return gallons * LB_PER_US_GALLON;
}

export function waterWeightFromLiters(liters: number): number {
  return waterWeightFromGallons(litersToGallons(liters));
}

export function formatWeight(value: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatAreaWeight(value: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(value);
}

function validateNonNegativeMass(
  field: WeightFieldKey,
  raw: string,
  label: string,
  unitSystem: UnitSystem,
  maxLb: number,
  allowBlank = false,
): { valueLb: number; error?: WeightFieldError } {
  if (allowBlank && !raw.trim()) return { valueLb: 0 };

  const parsed = parseMeasurement(raw);
  if (parsed === null) {
    if (!raw.trim()) {
      return { valueLb: NaN, error: { field, message: `Enter ${label}.` } };
    }
    return { valueLb: NaN, error: { field, message: `${label} must be a number.` } };
  }
  if (parsed < 0) {
    return { valueLb: NaN, error: { field, message: `${label} cannot be negative.` } };
  }
  const valueLb = unitSystem === 'us' ? parsed : kgToLb(parsed);
  if (!Number.isFinite(valueLb) || valueLb > maxLb) {
    return {
      valueLb: NaN,
      error: { field, message: `${label} is too large for this calculator.` },
    };
  }
  return { valueLb };
}

function validateCapacity(
  raw: string,
  unitSystem: UnitSystem,
): { gallons: number; error?: WeightFieldError } {
  const parsed = parseMeasurement(raw);
  if (parsed === null) {
    if (!raw.trim()) {
      return { gallons: NaN, error: { field: 'capacity', message: 'Enter water capacity.' } };
    }
    return { gallons: NaN, error: { field: 'capacity', message: 'Water capacity must be a number.' } };
  }
  if (parsed < 0) {
    return {
      gallons: NaN,
      error: { field: 'capacity', message: 'Water capacity cannot be negative.' },
    };
  }
  if (parsed === 0) {
    return {
      gallons: NaN,
      error: { field: 'capacity', message: 'Water capacity must be greater than zero.' },
    };
  }
  const gallons = unitSystem === 'us' ? parsed : litersToGallons(parsed);
  if (!Number.isFinite(gallons) || gallons > MAX_CAPACITY_GALLONS) {
    return {
      gallons: NaN,
      error: { field: 'capacity', message: 'Water capacity is too large for this calculator.' },
    };
  }
  return { gallons };
}

function validateOccupants(raw: string): { count: number; error?: WeightFieldError } {
  const parsed = parseMeasurement(raw);
  if (parsed === null) {
    if (!raw.trim()) {
      return { count: NaN, error: { field: 'occupants', message: 'Enter the number of occupants.' } };
    }
    return {
      count: NaN,
      error: { field: 'occupants', message: 'Number of occupants must be a number.' },
    };
  }
  if (parsed < 0) {
    return {
      count: NaN,
      error: { field: 'occupants', message: 'Number of occupants cannot be negative.' },
    };
  }
  if (!Number.isInteger(parsed)) {
    return {
      count: NaN,
      error: { field: 'occupants', message: 'Number of occupants must be a whole number.' },
    };
  }
  if (parsed > MAX_OCCUPANTS) {
    return {
      count: NaN,
      error: {
        field: 'occupants',
        message: 'Number of occupants is too large for this calculator.',
      },
    };
  }
  return { count: parsed };
}

function validateFootprintPair(
  lengthRaw: string,
  widthRaw: string,
  unitSystem: UnitSystem,
):
  | { ok: true; hasFootprint: false }
  | { ok: true; hasFootprint: true; lengthFt: number; widthFt: number; areaSqFt: number }
  | { ok: false; errors: WeightFieldError[] } {
  const lengthBlank = !lengthRaw.trim();
  const widthBlank = !widthRaw.trim();

  if (lengthBlank && widthBlank) return { ok: true, hasFootprint: false };

  const errors: WeightFieldError[] = [];

  const parseSide = (
    field: 'footprintLength' | 'footprintWidth',
    raw: string,
    label: string,
  ): number => {
    const parsed = parseMeasurement(raw);
    if (parsed === null) {
      if (!raw.trim()) {
        errors.push({ field, message: `Enter footprint ${label}, or clear both footprint fields.` });
      } else {
        errors.push({ field, message: `Footprint ${label} must be a number.` });
      }
      return NaN;
    }
    if (parsed <= 0) {
      errors.push({
        field,
        message: `Footprint ${label} must be greater than zero.`,
      });
      return NaN;
    }
    const feet = unitSystem === 'us' ? parsed : metersToFeet(parsed);
    if (!Number.isFinite(feet) || feet > MAX_FOOTPRINT_FT) {
      errors.push({
        field,
        message: `Footprint ${label} is too large for this calculator.`,
      });
      return NaN;
    }
    return feet;
  };

  const lengthFt = parseSide('footprintLength', lengthRaw, 'length');
  const widthFt = parseSide('footprintWidth', widthRaw, 'width');
  if (errors.length > 0) return { ok: false, errors };

  const areaSqFt = lengthFt * widthFt;
  if (!Number.isFinite(areaSqFt) || areaSqFt <= 0) {
    return {
      ok: false,
      errors: [
        {
          field: 'footprintLength',
          message: 'Unable to calculate footprint area with these dimensions.',
        },
      ],
    };
  }

  return { ok: true, hasFootprint: true, lengthFt, widthFt, areaSqFt };
}

export function validateWeightInputs(inputs: WeightInputs): WeightFieldError[] {
  const errors: WeightFieldError[] = [];

  const dry = validateNonNegativeMass(
    'dryWeight',
    inputs.dryWeight,
    'empty/dry hot tub weight',
    inputs.unitSystem,
    MAX_DRY_WEIGHT_LB,
  );
  if (dry.error) errors.push(dry.error);
  else if (dry.valueLb === 0) {
    errors.push({
      field: 'dryWeight',
      message: 'Empty/dry hot tub weight must be greater than zero.',
    });
  }

  const capacity = validateCapacity(inputs.capacity, inputs.unitSystem);
  if (capacity.error) errors.push(capacity.error);

  const occupants = validateOccupants(inputs.occupants);
  if (occupants.error) errors.push(occupants.error);

  if (!occupants.error && occupants.count > 0) {
    const avg = validateNonNegativeMass(
      'avgOccupantWeight',
      inputs.avgOccupantWeight,
      'average occupant weight',
      inputs.unitSystem,
      MAX_OCCUPANT_WEIGHT_LB,
    );
    if (avg.error) errors.push(avg.error);
    else if (avg.valueLb === 0) {
      errors.push({
        field: 'avgOccupantWeight',
        message: 'Average occupant weight must be greater than zero when occupants are greater than zero.',
      });
    }
  }

  const additional = validateNonNegativeMass(
    'additionalWeight',
    inputs.additionalWeight,
    'additional accessory weight',
    inputs.unitSystem,
    MAX_ADDITIONAL_WEIGHT_LB,
    true,
  );
  if (additional.error) errors.push(additional.error);

  const footprint = validateFootprintPair(
    inputs.footprintLength,
    inputs.footprintWidth,
    inputs.unitSystem,
  );
  if (!footprint.ok) errors.push(...footprint.errors);

  return errors;
}

function roundDisplayMass(value: number): number {
  return Math.round(value);
}

function buildBreakdown(
  dryWeightLb: number,
  waterWeightLb: number,
  additionalWeightLb: number,
  totalOccupantWeightLb: number,
  totalOccupiedWeightLb: number,
): WeightBreakdownShare[] {
  const parts: Omit<WeightBreakdownShare, 'percent'>[] = [
    { id: 'dry', label: 'Empty/dry spa', weightLb: dryWeightLb },
    { id: 'water', label: 'Water', weightLb: waterWeightLb },
  ];
  if (additionalWeightLb > 0) {
    parts.push({ id: 'additional', label: 'Accessories', weightLb: additionalWeightLb });
  }
  if (totalOccupantWeightLb > 0) {
    parts.push({ id: 'occupants', label: 'Occupants', weightLb: totalOccupantWeightLb });
  }

  const total = totalOccupiedWeightLb > 0 ? totalOccupiedWeightLb : 1;
  return parts.map((part) => ({
    ...part,
    percent: Math.round((part.weightLb / total) * 1000) / 10,
  }));
}

/**
 * Example-table helper using the same calculation path as the live calculator.
 */
export function exampleWeights(options: {
  dryWeightLb: number;
  capacityGallons: number;
  occupants: number;
  avgOccupantWeightLb?: number;
}): {
  waterWeightLb: number;
  filledWeightLb: number;
  totalOccupiedWeightLb: number;
} {
  const avg = options.avgOccupantWeightLb ?? 175;
  const outcome = calculateWeight({
    unitSystem: 'us',
    dryWeight: String(options.dryWeightLb),
    capacity: String(options.capacityGallons),
    occupants: String(options.occupants),
    avgOccupantWeight: String(avg),
    additionalWeight: '0',
    footprintLength: '',
    footprintWidth: '',
  });
  if (!outcome.ok) {
    throw new Error(
      `Unable to build example for ${options.dryWeightLb} lb / ${options.capacityGallons} gal / ${options.occupants} occupants`,
    );
  }
  return {
    waterWeightLb: outcome.result.waterWeightLb,
    filledWeightLb: outcome.result.filledWeightLb,
    totalOccupiedWeightLb: outcome.result.totalOccupiedWeightLb,
  };
}

export function calculateWeight(inputs: WeightInputs):
  | { ok: true; result: WeightResult }
  | { ok: false; errors: WeightFieldError[] } {
  const errors = validateWeightInputs(inputs);
  if (errors.length > 0) return { ok: false, errors };

  const dry = validateNonNegativeMass(
    'dryWeight',
    inputs.dryWeight,
    'empty/dry hot tub weight',
    inputs.unitSystem,
    MAX_DRY_WEIGHT_LB,
  );
  const capacity = validateCapacity(inputs.capacity, inputs.unitSystem);
  const occupants = validateOccupants(inputs.occupants);
  const additional = validateNonNegativeMass(
    'additionalWeight',
    inputs.additionalWeight,
    'additional accessory weight',
    inputs.unitSystem,
    MAX_ADDITIONAL_WEIGHT_LB,
    true,
  );

  let avgOccupantWeightLb = 0;
  if (occupants.count > 0) {
    const avg = validateNonNegativeMass(
      'avgOccupantWeight',
      inputs.avgOccupantWeight,
      'average occupant weight',
      inputs.unitSystem,
      MAX_OCCUPANT_WEIGHT_LB,
    );
    avgOccupantWeightLb = avg.valueLb;
  }

  const footprint = validateFootprintPair(
    inputs.footprintLength,
    inputs.footprintWidth,
    inputs.unitSystem,
  );
  if (!footprint.ok) return { ok: false, errors: footprint.errors };

  const waterWeightLb = waterWeightFromGallons(capacity.gallons);
  const filledWeightLb = dry.valueLb + waterWeightLb + additional.valueLb;
  const totalOccupantWeightLb = occupants.count * avgOccupantWeightLb;
  const totalOccupiedWeightLb = filledWeightLb + totalOccupantWeightLb;

  if (
    ![waterWeightLb, filledWeightLb, totalOccupantWeightLb, totalOccupiedWeightLb].every(
      (value) => Number.isFinite(value) && value >= 0,
    )
  ) {
    return {
      ok: false,
      errors: [{ field: 'dryWeight', message: 'Unable to calculate with these values.' }],
    };
  }

  let footprintAreaSqFt: number | null = null;
  let averageWeightPerSqFt: number | null = null;
  let averageWeightPerSqM: number | null = null;
  if (footprint.hasFootprint) {
    footprintAreaSqFt = footprint.areaSqFt;
    averageWeightPerSqFt = totalOccupiedWeightLb / footprint.areaSqFt;
    const areaSqM = footprint.areaSqFt * METERS_PER_FOOT * METERS_PER_FOOT;
    averageWeightPerSqM = lbToKg(totalOccupiedWeightLb) / areaSqM;
  }

  const massUnit: MassUnit = inputs.unitSystem === 'us' ? 'lb' : 'kg';
  const volumeUnit: VolumeUnit = inputs.unitSystem === 'us' ? 'gal' : 'L';
  const lengthUnit: LengthUnit = inputs.unitSystem === 'us' ? 'ft' : 'm';
  const toDisplayMass = (lb: number) =>
    roundDisplayMass(inputs.unitSystem === 'us' ? lb : lbToKg(lb));

  return {
    ok: true,
    result: {
      unitSystem: inputs.unitSystem,
      massUnit,
      volumeUnit,
      lengthUnit,
      dryWeightLb: dry.valueLb,
      waterWeightLb,
      additionalWeightLb: additional.valueLb,
      filledWeightLb,
      occupantCount: occupants.count,
      avgOccupantWeightLb,
      totalOccupantWeightLb,
      totalOccupiedWeightLb,
      capacityGallons: capacity.gallons,
      footprintAreaSqFt,
      averageWeightPerSqFt,
      averageWeightPerSqM,
      hasFootprint: footprint.hasFootprint,
      breakdown: buildBreakdown(
        dry.valueLb,
        waterWeightLb,
        additional.valueLb,
        totalOccupantWeightLb,
        totalOccupiedWeightLb,
      ),
      display: {
        dryWeight: toDisplayMass(dry.valueLb),
        waterWeight: toDisplayMass(waterWeightLb),
        additionalWeight: toDisplayMass(additional.valueLb),
        filledWeight: toDisplayMass(filledWeightLb),
        totalOccupantWeight: toDisplayMass(totalOccupantWeightLb),
        totalOccupiedWeight: toDisplayMass(totalOccupiedWeightLb),
        footprintArea:
          footprintAreaSqFt === null
            ? null
            : inputs.unitSystem === 'us'
              ? Math.round(footprintAreaSqFt * 10) / 10
              : Math.round(footprintAreaSqFt * METERS_PER_FOOT * METERS_PER_FOOT * 100) / 100,
        averageWeightPerArea:
          averageWeightPerSqFt === null
            ? null
            : inputs.unitSystem === 'us'
              ? Math.round(averageWeightPerSqFt * 10) / 10
              : Math.round((averageWeightPerSqM as number) * 10) / 10,
        areaUnitLabel: inputs.unitSystem === 'us' ? 'lb/ft²' : 'kg/m²',
        massUnitLabel: inputs.unitSystem === 'us' ? 'lb' : 'kg',
      },
    },
  };
}

/** Convert a numeric field value between unit systems for UI switching. */
export function convertFieldForUnitSwitch(
  field: WeightFieldKey,
  raw: string,
  from: UnitSystem,
  to: UnitSystem,
): string {
  if (from === to) return raw;
  const parsed = parseMeasurement(raw);
  if (parsed === null) return raw;

  let converted: number;
  switch (field) {
    case 'dryWeight':
    case 'avgOccupantWeight':
    case 'additionalWeight':
      converted = from === 'us' ? lbToKg(parsed) : kgToLb(parsed);
      break;
    case 'capacity':
      converted = from === 'us' ? gallonsToLiters(parsed) : litersToGallons(parsed);
      break;
    case 'footprintLength':
    case 'footprintWidth':
      converted = from === 'us' ? feetToMeters(parsed) : metersToFeet(parsed);
      break;
    case 'occupants':
      return raw;
    default:
      return raw;
  }

  return String(Number(converted.toFixed(4)));
}
