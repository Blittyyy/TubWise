export type VolumeShape = 'rectangular' | 'round';
export type VolumeUnit = 'ft' | 'in' | 'cm' | 'm';

export const GALLONS_PER_CUBIC_FOOT = 7.48052;
export const LITERS_PER_US_GALLON = 3.785411784;
export const MAX_DIMENSION_FEET = 100;

export const UNIT_LABELS: Record<VolumeUnit, string> = {
  ft: 'Feet',
  in: 'Inches',
  cm: 'Centimeters',
  m: 'Meters',
};

export const SHAPE_LABELS: Record<VolumeShape, string> = {
  rectangular: 'Rectangular / Square',
  round: 'Round',
};

/** Convert a single measurement to feet. */
export function toFeet(value: number, unit: VolumeUnit): number {
  switch (unit) {
    case 'ft':
      return value;
    case 'in':
      return value / 12;
    case 'cm':
      return value / 30.48;
    case 'm':
      return value / 0.3048;
  }
}

export function parseMeasurement(raw: string): number | null {
  const trimmed = raw.trim().replace(/,/g, '');
  if (!trimmed) return null;
  // Plain decimal only; rejects letters, Infinity, and scientific notation.
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return null;
  return value;
}

export type FieldKey = 'length' | 'width' | 'diameter' | 'depth';

export interface FieldError {
  field: FieldKey;
  message: string;
}

export interface VolumeInputs {
  shape: VolumeShape;
  unit: VolumeUnit;
  length: string;
  width: string;
  diameter: string;
  depth: string;
}

export interface VolumeResult {
  shape: VolumeShape;
  unit: VolumeUnit;
  cubicFeet: number;
  gallons: number;
  liters: number;
  displayGallons: number;
  displayLiters: number;
  measurements: {
    lengthFt?: number;
    widthFt?: number;
    diameterFt?: number;
    depthFt: number;
    raw: Record<string, string>;
  };
  formula: string;
}

function validatePositiveDimension(
  field: FieldKey,
  raw: string,
  label: string,
  unit: VolumeUnit,
): { value: number; error?: FieldError } {
  const parsed = parseMeasurement(raw);
  if (parsed === null) {
    if (!raw.trim()) {
      return { value: NaN, error: { field, message: `Enter ${label}.` } };
    }
    return { value: NaN, error: { field, message: `${label} must be a number.` } };
  }
  if (parsed < 0) {
    return { value: NaN, error: { field, message: `${label} cannot be negative.` } };
  }
  if (parsed === 0) {
    return { value: NaN, error: { field, message: `${label} must be greater than zero.` } };
  }
  const feet = toFeet(parsed, unit);
  if (feet > MAX_DIMENSION_FEET) {
    return {
      value: NaN,
      error: {
        field,
        message: `${label} is too large. After conversion, each dimension must be 100 feet or less.`,
      },
    };
  }
  return { value: parsed };
}

export function validateVolumeInputs(inputs: VolumeInputs): FieldError[] {
  const errors: FieldError[] = [];
  const depth = validatePositiveDimension('depth', inputs.depth, 'Average water depth', inputs.unit);
  if (depth.error) errors.push(depth.error);

  if (inputs.shape === 'rectangular') {
    const length = validatePositiveDimension('length', inputs.length, 'Length', inputs.unit);
    const width = validatePositiveDimension('width', inputs.width, 'Width', inputs.unit);
    if (length.error) errors.push(length.error);
    if (width.error) errors.push(width.error);
  } else {
    const diameter = validatePositiveDimension('diameter', inputs.diameter, 'Diameter', inputs.unit);
    if (diameter.error) errors.push(diameter.error);
  }

  return errors;
}

export function calculateVolume(inputs: VolumeInputs):
  | { ok: true; result: VolumeResult }
  | { ok: false; errors: FieldError[] } {
  const errors = validateVolumeInputs(inputs);
  if (errors.length > 0) return { ok: false, errors };

  const depthValue = parseMeasurement(inputs.depth)!;
  const depthFt = toFeet(depthValue, inputs.unit);

  if (inputs.shape === 'rectangular') {
    const lengthValue = parseMeasurement(inputs.length)!;
    const widthValue = parseMeasurement(inputs.width)!;
    const lengthFt = toFeet(lengthValue, inputs.unit);
    const widthFt = toFeet(widthValue, inputs.unit);
    const cubicFeet = lengthFt * widthFt * depthFt;
    const gallons = cubicFeet * GALLONS_PER_CUBIC_FOOT;
    const liters = gallons * LITERS_PER_US_GALLON;

    if (!Number.isFinite(cubicFeet) || !Number.isFinite(gallons) || !Number.isFinite(liters)) {
      return {
        ok: false,
        errors: [{ field: 'length', message: 'Unable to calculate with these values.' }],
      };
    }

    return {
      ok: true,
      result: {
        shape: 'rectangular',
        unit: inputs.unit,
        cubicFeet,
        gallons,
        liters,
        displayGallons: Math.round(gallons),
        displayLiters: Math.round(liters),
        measurements: {
          lengthFt,
          widthFt,
          depthFt,
          raw: {
            length: inputs.length.trim(),
            width: inputs.width.trim(),
            depth: inputs.depth.trim(),
            unit: inputs.unit,
          },
        },
        formula: 'length × width × average water depth (in feet) × 7.48052',
      },
    };
  }

  const diameterValue = parseMeasurement(inputs.diameter)!;
  const diameterFt = toFeet(diameterValue, inputs.unit);
  const radiusFt = diameterFt / 2;
  const cubicFeet = Math.PI * radiusFt * radiusFt * depthFt;
  const gallons = cubicFeet * GALLONS_PER_CUBIC_FOOT;
  const liters = gallons * LITERS_PER_US_GALLON;

  if (!Number.isFinite(cubicFeet) || !Number.isFinite(gallons) || !Number.isFinite(liters)) {
    return {
      ok: false,
      errors: [{ field: 'diameter', message: 'Unable to calculate with these values.' }],
    };
  }

  return {
    ok: true,
    result: {
      shape: 'round',
      unit: inputs.unit,
      cubicFeet,
      gallons,
      liters,
      displayGallons: Math.round(gallons),
      displayLiters: Math.round(liters),
      measurements: {
        diameterFt,
        depthFt,
        raw: {
          diameter: inputs.diameter.trim(),
          depth: inputs.depth.trim(),
          unit: inputs.unit,
        },
      },
      formula: 'π × (diameter ÷ 2)² × average water depth (in feet) × 7.48052',
    },
  };
}

export function formatWholeNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}
