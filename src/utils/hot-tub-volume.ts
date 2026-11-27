import {
  calculateFlowFromBucket,
  type BucketPreset,
  type CapacityUnit,
  type FlowUnit,
} from './hot-tub-fill-time.ts';

export type VolumeShape = 'rectangular' | 'round' | 'octagonal';
export type VolumeUnit = 'ft' | 'in' | 'cm' | 'm';
export type VolumeMethod = 'dimensions' | 'fillTime' | 'meter';
export type FillDurationUnit = 'minutes' | 'hours';
export type FlowInputMode = 'known' | 'measure';
export type MeterVolumeUnit = 'gal' | 'L' | 'm3' | 'ft3';
export type MeterEntryMode = 'startEnd' | 'direct';

export const GALLONS_PER_CUBIC_FOOT = 7.48052;
export const LITERS_PER_US_GALLON = 3.785411784;
export const LITERS_PER_CUBIC_METER = 1_000;
export const MAX_DIMENSION_FEET = 100;
export const MAX_DISPLACEMENT_PERCENT = 90;
export const MAX_FILL_MINUTES = 10_000;
export const MAX_FLOW_GPM = 1_000;
export const MAX_METER_GALLONS = 1_000_000;

/** Regular octagon area across opposite parallel sides (width across flats). */
export const OCTAGON_AREA_FACTOR = 2 * (Math.SQRT2 - 1);

export const UNIT_LABELS: Record<VolumeUnit, string> = {
  ft: 'Feet',
  in: 'Inches',
  cm: 'Centimeters',
  m: 'Meters',
};

export const SHAPE_LABELS: Record<VolumeShape, string> = {
  rectangular: 'Rectangular / Square',
  round: 'Round',
  octagonal: 'Regular octagon',
};

export const METHOD_LABELS: Record<VolumeMethod, string> = {
  dimensions: 'Interior dimensions',
  fillTime: 'Measured filling time',
  meter: 'Water meter readings',
};

export const METER_UNIT_LABELS: Record<MeterVolumeUnit, string> = {
  gal: 'U.S. gallons',
  L: 'Liters',
  m3: 'Cubic meters',
  ft3: 'Cubic feet',
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
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return null;
  return value;
}

export function gallonsFromMeterUnit(value: number, unit: MeterVolumeUnit): number {
  switch (unit) {
    case 'gal':
      return value;
    case 'L':
      return value / LITERS_PER_US_GALLON;
    case 'm3':
      return (value * LITERS_PER_CUBIC_METER) / LITERS_PER_US_GALLON;
    case 'ft3':
      return value * GALLONS_PER_CUBIC_FOOT;
  }
}

export type FieldKey =
  | 'length'
  | 'width'
  | 'diameter'
  | 'octagonWidth'
  | 'depth'
  | 'displacement'
  | 'fillDuration'
  | 'flowRate'
  | 'bucketCapacity'
  | 'bucketSeconds'
  | 'meterStart'
  | 'meterEnd'
  | 'meterDirect';

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
  /** Regular octagon width across opposite parallel sides (flats). */
  octagonWidth?: string;
  /** Optional illustrative displacement %; blank or omitted = none. */
  displacementPercent?: string;
}

export interface FillTimeVolumeInputs {
  fillDuration: string;
  fillDurationUnit: FillDurationUnit;
  flowInputMode: FlowInputMode;
  flowRate: string;
  flowUnit: FlowUnit;
  bucketPreset: BucketPreset;
  customBucketCapacity: string;
  bucketUnit: CapacityUnit;
  bucketSeconds: string;
}

export interface MeterVolumeInputs {
  entryMode: MeterEntryMode;
  meterUnit: MeterVolumeUnit;
  meterStart: string;
  meterEnd: string;
  meterDirect: string;
}

export interface VolumeResult {
  method: VolumeMethod;
  shape?: VolumeShape;
  unit?: VolumeUnit;
  cubicFeet: number;
  gallons: number;
  liters: number;
  displayGallons: number;
  displayLiters: number;
  displacementPercent: number;
  unadjustedGallons: number | null;
  measurements: {
    lengthFt?: number;
    widthFt?: number;
    diameterFt?: number;
    octagonWidthFt?: number;
    depthFt?: number;
    raw: Record<string, string>;
  };
  formula: string;
  methodLabel: string;
  assumptions: string[];
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

function resolveDisplacement(raw: string | undefined): { value: number; error?: FieldError } {
  if (raw === undefined || !raw.trim()) return { value: 0 };
  const parsed = parseMeasurement(raw);
  if (parsed === null) {
    return { value: NaN, error: { field: 'displacement', message: 'Displacement percentage must be a number.' } };
  }
  if (parsed < 0) {
    return {
      value: NaN,
      error: { field: 'displacement', message: 'Displacement percentage cannot be negative.' },
    };
  }
  if (parsed >= 100) {
    return {
      value: NaN,
      error: {
        field: 'displacement',
        message: 'Displacement percentage must be below 100%.',
      },
    };
  }
  if (parsed > MAX_DISPLACEMENT_PERCENT) {
    return {
      value: NaN,
      error: {
        field: 'displacement',
        message: 'Displacement percentage is too large for this calculator.',
      },
    };
  }
  return { value: parsed };
}

export function octagonAreaSqFt(widthAcrossFlatsFt: number): number {
  return OCTAGON_AREA_FACTOR * widthAcrossFlatsFt * widthAcrossFlatsFt;
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
  } else if (inputs.shape === 'round') {
    const diameter = validatePositiveDimension('diameter', inputs.diameter, 'Diameter', inputs.unit);
    if (diameter.error) errors.push(diameter.error);
  } else {
    const octagonWidth = validatePositiveDimension(
      'octagonWidth',
      inputs.octagonWidth ?? '',
      'Octagon width across flats',
      inputs.unit,
    );
    if (octagonWidth.error) errors.push(octagonWidth.error);
  }

  const displacement = resolveDisplacement(inputs.displacementPercent);
  if (displacement.error) errors.push(displacement.error);

  return errors;
}

function finalizeVolume(options: {
  method: VolumeMethod;
  gallons: number;
  unadjustedGallons: number | null;
  displacementPercent: number;
  shape?: VolumeShape;
  unit?: VolumeUnit;
  cubicFeet: number;
  measurements: VolumeResult['measurements'];
  formula: string;
  assumptions: string[];
}): { ok: true; result: VolumeResult } | { ok: false; errors: FieldError[] } {
  const { gallons } = options;
  const liters = gallons * LITERS_PER_US_GALLON;
  if (!Number.isFinite(options.cubicFeet) || !Number.isFinite(gallons) || !Number.isFinite(liters) || gallons < 0) {
    return {
      ok: false,
      errors: [{ field: 'depth', message: 'Unable to calculate with these values.' }],
    };
  }

  return {
    ok: true,
    result: {
      method: options.method,
      shape: options.shape,
      unit: options.unit,
      cubicFeet: options.cubicFeet,
      gallons,
      liters,
      displayGallons: Math.round(gallons),
      displayLiters: Math.round(liters),
      displacementPercent: options.displacementPercent,
      unadjustedGallons: options.unadjustedGallons,
      measurements: options.measurements,
      formula: options.formula,
      methodLabel: METHOD_LABELS[options.method],
      assumptions: options.assumptions,
    },
  };
}

/**
 * Interior-dimension estimate. Preserves rectangular/round behavior and adds octagon + optional displacement.
 */
export function calculateVolume(inputs: VolumeInputs):
  | { ok: true; result: VolumeResult }
  | { ok: false; errors: FieldError[] } {
  const errors = validateVolumeInputs(inputs);
  if (errors.length > 0) return { ok: false, errors };

  const depthValue = parseMeasurement(inputs.depth)!;
  const depthFt = toFeet(depthValue, inputs.unit);
  const displacement = resolveDisplacement(inputs.displacementPercent).value;
  const factor = 1 - displacement / 100;

  let cubicFeetUnadjusted: number;
  let measurements: VolumeResult['measurements'];
  let formula: string;
  let shape: VolumeShape = inputs.shape;

  if (inputs.shape === 'rectangular') {
    const lengthValue = parseMeasurement(inputs.length)!;
    const widthValue = parseMeasurement(inputs.width)!;
    const lengthFt = toFeet(lengthValue, inputs.unit);
    const widthFt = toFeet(widthValue, inputs.unit);
    cubicFeetUnadjusted = lengthFt * widthFt * depthFt;
    measurements = {
      lengthFt,
      widthFt,
      depthFt,
      raw: {
        length: inputs.length.trim(),
        width: inputs.width.trim(),
        depth: inputs.depth.trim(),
        unit: inputs.unit,
        displacement: displacement ? String(displacement) : '0',
      },
    };
    formula = 'length × width × average water depth (in feet) × 7.48052';
  } else if (inputs.shape === 'round') {
    const diameterValue = parseMeasurement(inputs.diameter)!;
    const diameterFt = toFeet(diameterValue, inputs.unit);
    const radiusFt = diameterFt / 2;
    cubicFeetUnadjusted = Math.PI * radiusFt * radiusFt * depthFt;
    measurements = {
      diameterFt,
      depthFt,
      raw: {
        diameter: inputs.diameter.trim(),
        depth: inputs.depth.trim(),
        unit: inputs.unit,
        displacement: displacement ? String(displacement) : '0',
      },
    };
    formula = 'π × (diameter ÷ 2)² × average water depth (in feet) × 7.48052';
  } else {
    const widthValue = parseMeasurement(inputs.octagonWidth ?? '')!;
    const widthFt = toFeet(widthValue, inputs.unit);
    cubicFeetUnadjusted = octagonAreaSqFt(widthFt) * depthFt;
    measurements = {
      octagonWidthFt: widthFt,
      depthFt,
      raw: {
        octagonWidth: (inputs.octagonWidth ?? '').trim(),
        depth: inputs.depth.trim(),
        unit: inputs.unit,
        displacement: displacement ? String(displacement) : '0',
      },
    };
    formula =
      '2 × (√2 − 1) × (width across flats)² × average water depth (in feet) × 7.48052';
    shape = 'octagonal';
  }

  const unadjustedGallons = cubicFeetUnadjusted * GALLONS_PER_CUBIC_FOOT;
  const cubicFeet = cubicFeetUnadjusted * factor;
  const gallons = unadjustedGallons * factor;

  const assumptions = [
    'Uses interior water dimensions and average filled-water depth.',
    'Manufacturer-listed operating capacity is preferable when available.',
    'Molded seats, footwells, and shell geometry can make actual capacity lower than a simple geometric estimate.',
  ];
  if (displacement > 0) {
    assumptions.push(
      `Applied an illustrative ${displacement}% displacement adjustment to the unadjusted geometric volume. This percentage is not universally accurate for hot tubs.`,
    );
    assumptions.push(
      'Do not also reduce average water depth for the same seats or shell features when using a displacement percentage.',
    );
  } else {
    assumptions.push('No displacement adjustment was applied (ideal geometric estimate).');
  }

  return finalizeVolume({
    method: 'dimensions',
    gallons,
    unadjustedGallons: displacement > 0 ? unadjustedGallons : null,
    displacementPercent: displacement,
    shape,
    unit: inputs.unit,
    cubicFeet,
    measurements,
    formula:
      displacement > 0
        ? `${formula}, then × (1 − ${displacement}/100)`
        : formula,
    assumptions,
  });
}

function validatePositiveFlow(
  raw: string,
  unit: FlowUnit,
): { value: number; error?: FieldError } {
  const parsed = parseMeasurement(raw);
  if (parsed === null) {
    if (!raw.trim()) return { value: NaN, error: { field: 'flowRate', message: 'Enter hose flow rate.' } };
    return { value: NaN, error: { field: 'flowRate', message: 'Hose flow rate must be a number.' } };
  }
  if (parsed < 0) {
    return { value: NaN, error: { field: 'flowRate', message: 'Hose flow rate cannot be negative.' } };
  }
  if (parsed === 0) {
    return {
      value: NaN,
      error: { field: 'flowRate', message: 'Hose flow rate must be greater than zero.' },
    };
  }
  const gpm = unit === 'gpm' ? parsed : parsed / LITERS_PER_US_GALLON;
  if (!Number.isFinite(gpm) || gpm > MAX_FLOW_GPM) {
    return {
      value: NaN,
      error: { field: 'flowRate', message: 'Hose flow rate is too large for this calculator.' },
    };
  }
  return { value: parsed };
}

export function calculateVolumeFromFillTime(inputs: FillTimeVolumeInputs):
  | { ok: true; result: VolumeResult }
  | { ok: false; errors: FieldError[] } {
  const errors: FieldError[] = [];

  const durationParsed = parseMeasurement(inputs.fillDuration);
  if (durationParsed === null) {
    errors.push({
      field: 'fillDuration',
      message: inputs.fillDuration.trim()
        ? 'Fill duration must be a number.'
        : 'Enter the time taken to fill the spa.',
    });
  } else if (durationParsed < 0) {
    errors.push({ field: 'fillDuration', message: 'Fill duration cannot be negative.' });
  } else if (durationParsed === 0) {
    errors.push({ field: 'fillDuration', message: 'Fill duration must be greater than zero.' });
  }

  let flowGpm = NaN;
  let flowSummary = '';

  if (inputs.flowInputMode === 'measure') {
    const measured = calculateFlowFromBucket({
      bucketPreset: inputs.bucketPreset,
      customBucketCapacity: inputs.customBucketCapacity,
      bucketUnit: inputs.bucketUnit,
      bucketSeconds: inputs.bucketSeconds,
    });
    if (!measured.ok) {
      for (const err of measured.errors) {
        const field: FieldKey =
          err.field === 'bucketCapacity'
            ? 'bucketCapacity'
            : err.field === 'bucketSeconds'
              ? 'bucketSeconds'
              : 'flowRate';
        errors.push({ field, message: err.message });
      }
    } else {
      flowGpm =
        measured.flowUnit === 'gpm'
          ? measured.flowPerMinute
          : measured.flowPerMinute / LITERS_PER_US_GALLON;
      flowSummary = `${measured.displayFlow} ${measured.flowUnit} from bucket measurement`;
    }
  } else {
    const flow = validatePositiveFlow(inputs.flowRate, inputs.flowUnit);
    if (flow.error) errors.push(flow.error);
    else {
      flowGpm =
        inputs.flowUnit === 'gpm' ? flow.value : flow.value / LITERS_PER_US_GALLON;
      flowSummary = `${inputs.flowRate.trim()} ${inputs.flowUnit}`;
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  const durationMinutes =
    inputs.fillDurationUnit === 'hours' ? durationParsed! * 60 : durationParsed!;
  if (!Number.isFinite(durationMinutes) || durationMinutes > MAX_FILL_MINUTES) {
    return {
      ok: false,
      errors: [
        {
          field: 'fillDuration',
          message: 'Fill duration is too large for this calculator.',
        },
      ],
    };
  }

  const gallons = flowGpm * durationMinutes;
  const cubicFeet = gallons / GALLONS_PER_CUBIC_FOOT;

  return finalizeVolume({
    method: 'fillTime',
    gallons,
    unadjustedGallons: null,
    displacementPercent: 0,
    cubicFeet,
    measurements: {
      raw: {
        fillDuration: inputs.fillDuration.trim(),
        fillDurationUnit: inputs.fillDurationUnit,
        flow: flowSummary,
      },
    },
    formula: 'hose flow per minute × spa fill duration in minutes',
    assumptions: [
      'Assumes the spa started empty and filling stopped at the manufacturer’s recommended waterline.',
      'Assumes the same hose, faucet setting, and attachments were used, with approximately constant flow.',
      'Filling duration should exclude interruptions.',
      'If the spa started partially filled, the result is water added, not total capacity.',
      'This method is a planning estimate, not a perfect measurement.',
    ],
  });
}

export function calculateVolumeFromMeter(inputs: MeterVolumeInputs):
  | { ok: true; result: VolumeResult }
  | { ok: false; errors: FieldError[] } {
  const errors: FieldError[] = [];
  let gallons = NaN;
  let summary = '';

  if (inputs.entryMode === 'direct') {
    const parsed = parseMeasurement(inputs.meterDirect);
    if (parsed === null) {
      errors.push({
        field: 'meterDirect',
        message: inputs.meterDirect.trim()
          ? 'Water amount must be a number.'
          : 'Enter the measured amount of water added.',
      });
    } else if (parsed < 0) {
      errors.push({ field: 'meterDirect', message: 'Water amount cannot be negative.' });
    } else if (parsed === 0) {
      errors.push({
        field: 'meterDirect',
        message: 'Water amount must be greater than zero.',
      });
    } else {
      gallons = gallonsFromMeterUnit(parsed, inputs.meterUnit);
      summary = `${inputs.meterDirect.trim()} ${METER_UNIT_LABELS[inputs.meterUnit]}`;
    }
  } else {
    const start = parseMeasurement(inputs.meterStart);
    const end = parseMeasurement(inputs.meterEnd);
    if (start === null) {
      errors.push({
        field: 'meterStart',
        message: inputs.meterStart.trim()
          ? 'Starting meter reading must be a number.'
          : 'Enter the starting meter reading.',
      });
    }
    if (end === null) {
      errors.push({
        field: 'meterEnd',
        message: inputs.meterEnd.trim()
          ? 'Ending meter reading must be a number.'
          : 'Enter the ending meter reading.',
      });
    }
    if (start !== null && end !== null) {
      const delta = end - start;
      if (delta < 0) {
        errors.push({
          field: 'meterEnd',
          message: 'Ending reading cannot be less than the starting reading.',
        });
      } else if (delta === 0) {
        errors.push({
          field: 'meterEnd',
          message: 'Meter difference must be greater than zero.',
        });
      } else {
        gallons = gallonsFromMeterUnit(delta, inputs.meterUnit);
        summary = `${inputs.meterEnd.trim()} − ${inputs.meterStart.trim()} ${METER_UNIT_LABELS[inputs.meterUnit]}`;
      }
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  if (!Number.isFinite(gallons) || gallons > MAX_METER_GALLONS) {
    return {
      ok: false,
      errors: [
        {
          field: inputs.entryMode === 'direct' ? 'meterDirect' : 'meterEnd',
          message: 'Measured water volume is too large for this calculator.',
        },
      ],
    };
  }

  return finalizeVolume({
    method: 'meter',
    gallons,
    unadjustedGallons: null,
    displacementPercent: 0,
    cubicFeet: gallons / GALLONS_PER_CUBIC_FOOT,
    measurements: {
      raw: {
        entryMode: inputs.entryMode,
        meterUnit: inputs.meterUnit,
        summary,
      },
    },
    formula:
      inputs.entryMode === 'direct'
        ? 'measured water amount converted to U.S. gallons'
        : 'ending meter reading − starting meter reading, converted to U.S. gallons',
    assumptions: [
      'A whole-property meter is useful only when other water use is excluded during the measurement period.',
      'A suitable dedicated hose meter can measure water added directly.',
      'If the spa started partially filled, the result is not total capacity.',
      'Meter precision and measurement uncertainty affect accuracy.',
    ],
  });
}

/** Worked example helper: flow × minutes. */
export function volumeFromFlowAndMinutes(flowGpm: number, minutes: number): number {
  return flowGpm * minutes;
}

export function formatWholeNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}
