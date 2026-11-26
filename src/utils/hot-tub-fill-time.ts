export type CapacityUnit = 'gal' | 'L';
export type FlowUnit = 'gpm' | 'lpm';
export type FillPreset = 'empty' | '25' | '50' | '75' | 'custom';
export type FlowInputMode = 'known' | 'measure';
export type BucketPreset = '1' | '2' | '5' | '10' | '15' | '20' | 'custom';
export type WaterRateUnit = 'per_1000_gal' | 'per_gal' | 'per_1000_L' | 'per_L';

export const LITERS_PER_US_GALLON = 3.785411784;

/** Technical validation ceiling only — not a residential spa claim. */
export const MAX_CAPACITY_GALLONS = 100_000;
/** Technical validation ceiling only — not a typical hose claim. */
export const MAX_FLOW_GPM = 1_000;
/** Technical validation ceiling for a measurement bucket — not a spa claim. */
export const MAX_BUCKET_GALLONS = 100;
/** Technical validation ceiling for bucket timing (seconds). */
export const MAX_BUCKET_SECONDS = 3_600;
/** Technical validation ceiling for water rate inputs. */
export const MAX_WATER_RATE = 10_000;

export const CAPACITY_UNIT_LABELS: Record<CapacityUnit, string> = {
  gal: 'U.S. gallons',
  L: 'Liters',
};

export const FLOW_UNIT_LABELS: Record<FlowUnit, string> = {
  gpm: 'Gallons per minute',
  lpm: 'Liters per minute',
};

export const FILL_PRESET_LABELS: Record<FillPreset, string> = {
  empty: 'Empty',
  '25': '25% full',
  '50': '50% full',
  '75': '75% full',
  custom: 'Custom percentage',
};

export const FLOW_INPUT_MODE_LABELS: Record<FlowInputMode, string> = {
  known: 'I know my hose flow rate',
  measure: 'Measure my hose flow with a bucket',
};

export const WATER_RATE_UNIT_LABELS: Record<WaterRateUnit, string> = {
  per_1000_gal: 'Dollars per 1,000 gallons',
  per_gal: 'Dollars per gallon',
  per_1000_L: 'Dollars per 1,000 liters',
  per_L: 'Dollars per liter',
};

/** Common bucket sizes for U.S. gallons mode. */
export const BUCKET_PRESETS_GAL: Exclude<BucketPreset, 'custom'>[] = ['1', '2', '5', '10'];
/** Common bucket sizes for liters mode. */
export const BUCKET_PRESETS_L: Exclude<BucketPreset, 'custom'>[] = ['5', '10', '15', '20'];

export function parseMeasurement(raw: string): number | null {
  const trimmed = raw.trim().replace(/,/g, '');
  if (!trimmed) return null;
  // Plain decimal only; rejects letters, Infinity, and scientific notation.
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return null;
  return value;
}

export type FillTimeFieldKey =
  | 'capacity'
  | 'fillPercent'
  | 'flowRate'
  | 'bucketCapacity'
  | 'bucketSeconds'
  | 'waterRate'
  | 'startTime';

export interface FillTimeFieldError {
  field: FillTimeFieldKey;
  message: string;
}

export interface FillTimeInputs {
  capacity: string;
  capacityUnit: CapacityUnit;
  fillPreset: FillPreset;
  customPercent: string;
  flowInputMode: FlowInputMode;
  flowRate: string;
  flowUnit: FlowUnit;
  bucketPreset: BucketPreset;
  customBucketCapacity: string;
  bucketUnit: CapacityUnit;
  bucketSeconds: string;
  waterRate: string;
  waterRateUnit: WaterRateUnit;
}

export interface WaterCostEstimate {
  available: boolean;
  costUsd: number | null;
  displayCostUsd: string | null;
  rateEntered: string | null;
  rateUnit: WaterRateUnit | null;
  remainingVolumeForCost: number;
  remainingVolumeUnit: CapacityUnit;
}

export interface FillTimeResult {
  capacityUnit: CapacityUnit;
  flowUnit: FlowUnit;
  fillPercent: number;
  fillPreset: FillPreset;
  capacityValue: number;
  flowValue: number;
  flowInputMode: FlowInputMode;
  measuredFromBucket: boolean;
  remainingGallons: number;
  remainingLiters: number;
  displayRemainingGallons: number;
  displayRemainingLiters: number;
  durationMinutesExact: number;
  displayTotalMinutes: number;
  displayHours: number;
  displayMinutesPart: number;
  durationLabel: string;
  waterCost: WaterCostEstimate;
  inputsSummary: {
    capacity: string;
    capacityUnit: CapacityUnit;
    fillLabel: string;
    flowRate: string;
    flowUnit: FlowUnit;
    flowSourceLabel: string;
  };
}

export function resolveFillPercent(
  preset: FillPreset,
  customPercent: string,
): { percent: number; error?: FillTimeFieldError } {
  if (preset === 'empty') return { percent: 0 };
  if (preset === '25') return { percent: 25 };
  if (preset === '50') return { percent: 50 };
  if (preset === '75') return { percent: 75 };

  const parsed = parseMeasurement(customPercent);
  if (parsed === null) {
    if (!customPercent.trim()) {
      return {
        percent: NaN,
        error: { field: 'fillPercent', message: 'Enter a custom fill percentage.' },
      };
    }
    return {
      percent: NaN,
      error: { field: 'fillPercent', message: 'Fill percentage must be a number.' },
    };
  }
  if (parsed < 0) {
    return {
      percent: NaN,
      error: { field: 'fillPercent', message: 'Fill percentage cannot be below 0.' },
    };
  }
  if (parsed >= 100) {
    return {
      percent: NaN,
      error: {
        field: 'fillPercent',
        message: 'Fill percentage must be below 100%. At 100% full, no filling time remains.',
      },
    };
  }
  return { percent: parsed };
}

function capacityToGallons(value: number, unit: CapacityUnit): number {
  return unit === 'gal' ? value : value / LITERS_PER_US_GALLON;
}

function flowToGpm(value: number, unit: FlowUnit): number {
  return unit === 'gpm' ? value : value / LITERS_PER_US_GALLON;
}

function validatePositiveQuantity(
  field: 'capacity' | 'flowRate' | 'bucketCapacity' | 'bucketSeconds',
  raw: string,
  label: string,
  maxNormalized: number,
  toNormalized: (value: number) => number,
): { value: number; error?: FillTimeFieldError } {
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
  const normalized = toNormalized(parsed);
  if (!Number.isFinite(normalized) || normalized > maxNormalized) {
    return {
      value: NaN,
      error: {
        field,
        message: `${label} is too large for this calculator.`,
      },
    };
  }
  return { value: parsed };
}

export function resolveBucketCapacity(
  preset: BucketPreset,
  customCapacity: string,
  unit: CapacityUnit,
): { value: number; error?: FillTimeFieldError } {
  const allowed = unit === 'gal' ? BUCKET_PRESETS_GAL : BUCKET_PRESETS_L;
  if (preset !== 'custom') {
    if (!allowed.includes(preset as Exclude<BucketPreset, 'custom'>)) {
      return {
        value: NaN,
        error: {
          field: 'bucketCapacity',
          message: 'Choose a bucket capacity that matches the selected unit.',
        },
      };
    }
    return { value: Number(preset) };
  }

  return validatePositiveQuantity(
    'bucketCapacity',
    customCapacity,
    'Bucket capacity',
    MAX_BUCKET_GALLONS,
    (value) => capacityToGallons(value, unit),
  );
}

/**
 * Flow per minute = bucket capacity × 60 / seconds.
 * Result unit matches the bucket unit (gal → gpm, L → lpm).
 */
export function calculateFlowFromBucket(inputs: {
  bucketPreset: BucketPreset;
  customBucketCapacity: string;
  bucketUnit: CapacityUnit;
  bucketSeconds: string;
}):
  | {
      ok: true;
      bucketCapacity: number;
      bucketUnit: CapacityUnit;
      seconds: number;
      flowPerMinute: number;
      flowUnit: FlowUnit;
      displayFlow: string;
    }
  | { ok: false; errors: FillTimeFieldError[] } {
  const errors: FillTimeFieldError[] = [];
  const capacity = resolveBucketCapacity(
    inputs.bucketPreset,
    inputs.customBucketCapacity,
    inputs.bucketUnit,
  );
  if (capacity.error) errors.push(capacity.error);

  const seconds = validatePositiveQuantity(
    'bucketSeconds',
    inputs.bucketSeconds,
    'Bucket fill time',
    MAX_BUCKET_SECONDS,
    (value) => value,
  );
  if (seconds.error) errors.push(seconds.error);

  if (errors.length > 0) return { ok: false, errors };

  const flowPerMinute = (capacity.value * 60) / seconds.value;
  if (!Number.isFinite(flowPerMinute) || flowPerMinute <= 0) {
    return {
      ok: false,
      errors: [
        {
          field: 'bucketSeconds',
          message: 'Unable to calculate hose flow from these bucket values.',
        },
      ],
    };
  }

  const flowGpm = capacityToGallons(flowPerMinute, inputs.bucketUnit);
  if (flowGpm > MAX_FLOW_GPM) {
    return {
      ok: false,
      errors: [
        {
          field: 'bucketCapacity',
          message: 'Measured hose flow rate is too large for this calculator.',
        },
      ],
    };
  }

  const flowUnit: FlowUnit = inputs.bucketUnit === 'gal' ? 'gpm' : 'lpm';
  return {
    ok: true,
    bucketCapacity: capacity.value,
    bucketUnit: inputs.bucketUnit,
    seconds: seconds.value,
    flowPerMinute,
    flowUnit,
    displayFlow: trimTrailingZeros(Number(flowPerMinute.toFixed(4))),
  };
}

export function toDollarsPerGallon(rate: number, unit: WaterRateUnit): number {
  switch (unit) {
    case 'per_gal':
      return rate;
    case 'per_1000_gal':
      return rate / 1000;
    case 'per_L':
      return rate * LITERS_PER_US_GALLON;
    case 'per_1000_L':
      return (rate * LITERS_PER_US_GALLON) / 1000;
  }
}

/**
 * Optional water-cost estimate from remaining fill volume.
 * Blank rate → unavailable (not an error). Invalid non-blank rate → error.
 */
export function estimateWaterCost(
  remainingGallons: number,
  waterRate: string,
  waterRateUnit: WaterRateUnit,
): { ok: true; estimate: WaterCostEstimate } | { ok: false; error: FillTimeFieldError } {
  if (!waterRate.trim()) {
    return {
      ok: true,
      estimate: {
        available: false,
        costUsd: null,
        displayCostUsd: null,
        rateEntered: null,
        rateUnit: null,
        remainingVolumeForCost: remainingGallons,
        remainingVolumeUnit: 'gal',
      },
    };
  }

  const parsed = parseMeasurement(waterRate);
  if (parsed === null) {
    return {
      ok: false,
      error: { field: 'waterRate', message: 'Water rate must be a number.' },
    };
  }
  if (parsed < 0) {
    return {
      ok: false,
      error: { field: 'waterRate', message: 'Water rate cannot be negative.' },
    };
  }
  if (parsed > MAX_WATER_RATE) {
    return {
      ok: false,
      error: { field: 'waterRate', message: 'Water rate is too large for this calculator.' },
    };
  }

  const dollarsPerGallon = toDollarsPerGallon(parsed, waterRateUnit);
  if (!Number.isFinite(dollarsPerGallon)) {
    return {
      ok: false,
      error: { field: 'waterRate', message: 'Unable to calculate water cost with this rate.' },
    };
  }

  const costUsd = remainingGallons * dollarsPerGallon;
  if (!Number.isFinite(costUsd) || costUsd < 0) {
    return {
      ok: false,
      error: { field: 'waterRate', message: 'Unable to calculate water cost with this rate.' },
    };
  }

  const rounded = Math.round(costUsd * 100) / 100;
  return {
    ok: true,
    estimate: {
      available: true,
      costUsd: rounded,
      displayCostUsd: formatCurrencyUsd(rounded),
      rateEntered: waterRate.trim(),
      rateUnit: waterRateUnit,
      remainingVolumeForCost: remainingGallons,
      remainingVolumeUnit: 'gal',
    },
  };
}

export function formatCurrencyUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function validateFillTimeInputs(inputs: FillTimeInputs): FillTimeFieldError[] {
  const errors: FillTimeFieldError[] = [];

  const capacity = validatePositiveQuantity(
    'capacity',
    inputs.capacity,
    'Spa capacity',
    MAX_CAPACITY_GALLONS,
    (value) => capacityToGallons(value, inputs.capacityUnit),
  );
  if (capacity.error) errors.push(capacity.error);

  const fill = resolveFillPercent(inputs.fillPreset, inputs.customPercent);
  if (fill.error) errors.push(fill.error);

  if (inputs.flowInputMode === 'measure') {
    const measured = calculateFlowFromBucket({
      bucketPreset: inputs.bucketPreset,
      customBucketCapacity: inputs.customBucketCapacity,
      bucketUnit: inputs.bucketUnit,
      bucketSeconds: inputs.bucketSeconds,
    });
    if (!measured.ok) errors.push(...measured.errors);
  } else {
    const flow = validatePositiveQuantity(
      'flowRate',
      inputs.flowRate,
      'Hose flow rate',
      MAX_FLOW_GPM,
      (value) => flowToGpm(value, inputs.flowUnit),
    );
    if (flow.error) errors.push(flow.error);
  }

  // Optional water rate: only validate when provided.
  if (inputs.waterRate.trim()) {
    const rateCheck = estimateWaterCost(0, inputs.waterRate, inputs.waterRateUnit);
    if (!rateCheck.ok) errors.push(rateCheck.error);
  }

  return errors;
}

export function formatDurationLabel(totalMinutesRounded: number): string {
  const hours = Math.floor(totalMinutesRounded / 60);
  const minutes = totalMinutesRounded % 60;

  if (hours === 0) {
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
  }

  const hourLabel = hours === 1 ? '1 hour' : `${hours} hours`;
  if (minutes === 0) return hourLabel;
  const minuteLabel = minutes === 1 ? '1 minute' : `${minutes} minutes`;
  return `${hourLabel} ${minuteLabel}`;
}

export function formatWholeNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

/**
 * Illustrative empty-spa fill minutes at a constant GPM, rounded like the live calculator.
 */
export function exampleEmptyFillMinutes(capacityGallons: number, flowGpm: number): number {
  const outcome = calculateFillTime({
    capacity: String(capacityGallons),
    capacityUnit: 'gal',
    fillPreset: 'empty',
    customPercent: '',
    flowInputMode: 'known',
    flowRate: String(flowGpm),
    flowUnit: 'gpm',
    bucketPreset: '5',
    customBucketCapacity: '',
    bucketUnit: 'gal',
    bucketSeconds: '',
    waterRate: '',
    waterRateUnit: 'per_1000_gal',
  });
  if (!outcome.ok) {
    throw new Error(
      `Unable to build example for ${capacityGallons} gal at ${flowGpm} gpm: ${outcome.errors[0]?.message}`,
    );
  }
  return outcome.result.displayTotalMinutes;
}

export function calculateFillTime(inputs: FillTimeInputs):
  | { ok: true; result: FillTimeResult }
  | { ok: false; errors: FillTimeFieldError[] } {
  const errors = validateFillTimeInputs(inputs);
  if (errors.length > 0) return { ok: false, errors };

  let flowValue: number;
  let flowUnit: FlowUnit;
  let flowRateSummary: string;
  let measuredFromBucket = false;
  let flowSourceLabel = 'Entered hose flow rate';

  if (inputs.flowInputMode === 'measure') {
    const measured = calculateFlowFromBucket({
      bucketPreset: inputs.bucketPreset,
      customBucketCapacity: inputs.customBucketCapacity,
      bucketUnit: inputs.bucketUnit,
      bucketSeconds: inputs.bucketSeconds,
    });
    if (!measured.ok) return { ok: false, errors: measured.errors };
    flowValue = measured.flowPerMinute;
    flowUnit = measured.flowUnit;
    flowRateSummary = measured.displayFlow;
    measuredFromBucket = true;
    flowSourceLabel = `Measured from bucket (${trimTrailingZeros(measured.bucketCapacity)} ${
      CAPACITY_UNIT_LABELS[measured.bucketUnit].toLowerCase()
    } in ${trimTrailingZeros(measured.seconds)} seconds)`;
  } else {
    flowValue = parseMeasurement(inputs.flowRate)!;
    flowUnit = inputs.flowUnit;
    flowRateSummary = inputs.flowRate.trim();
  }

  const capacityValue = parseMeasurement(inputs.capacity)!;
  const fillPercent = resolveFillPercent(inputs.fillPreset, inputs.customPercent).percent;

  const capacityGallons = capacityToGallons(capacityValue, inputs.capacityUnit);
  const flowGpm = flowToGpm(flowValue, flowUnit);
  const remainingFraction = 1 - fillPercent / 100;
  const remainingGallons = capacityGallons * remainingFraction;
  const remainingLiters = remainingGallons * LITERS_PER_US_GALLON;
  const durationMinutesExact = remainingGallons / flowGpm;

  if (
    !Number.isFinite(remainingGallons) ||
    !Number.isFinite(remainingLiters) ||
    !Number.isFinite(durationMinutesExact) ||
    durationMinutesExact < 0
  ) {
    return {
      ok: false,
      errors: [{ field: 'capacity', message: 'Unable to calculate with these values.' }],
    };
  }

  const waterCostOutcome = estimateWaterCost(
    remainingGallons,
    inputs.waterRate,
    inputs.waterRateUnit,
  );
  if (!waterCostOutcome.ok) {
    return { ok: false, errors: [waterCostOutcome.error] };
  }

  const displayTotalMinutes = Math.round(durationMinutesExact);
  const displayHours = Math.floor(displayTotalMinutes / 60);
  const displayMinutesPart = displayTotalMinutes % 60;

  const fillLabel =
    inputs.fillPreset === 'custom'
      ? `${trimTrailingZeros(fillPercent)}% full`
      : FILL_PRESET_LABELS[inputs.fillPreset];

  return {
    ok: true,
    result: {
      capacityUnit: inputs.capacityUnit,
      flowUnit,
      fillPercent,
      fillPreset: inputs.fillPreset,
      capacityValue,
      flowValue,
      flowInputMode: inputs.flowInputMode,
      measuredFromBucket,
      remainingGallons,
      remainingLiters,
      displayRemainingGallons: Math.round(remainingGallons),
      displayRemainingLiters: Math.round(remainingLiters),
      durationMinutesExact,
      displayTotalMinutes,
      displayHours,
      displayMinutesPart,
      durationLabel: formatDurationLabel(displayTotalMinutes),
      waterCost: waterCostOutcome.estimate,
      inputsSummary: {
        capacity: inputs.capacity.trim(),
        capacityUnit: inputs.capacityUnit,
        fillLabel,
        flowRate: flowRateSummary,
        flowUnit,
        flowSourceLabel,
      },
    },
  };
}

function trimTrailingZeros(value: number): string {
  return String(Number(value.toFixed(4)));
}

/** Add duration to a local Date; returns a new Date. */
export function addMinutes(start: Date, minutesExact: number): Date {
  return new Date(start.getTime() + minutesExact * 60_000);
}

export function formatLocalTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatLocalDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

/**
 * Parse an HTML time input (HH:MM or HH:MM:SS) into today's local Date.
 * Returns null when the string is blank or malformed.
 */
export function parseLocalTimeInput(raw: string, now = new Date()): Date | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const match = /^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(trimmed);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = match[3] ? Number(match[3]) : 0;
  const result = new Date(now);
  result.setHours(hours, minutes, seconds, 0);
  if (
    result.getHours() !== hours ||
    result.getMinutes() !== minutes ||
    result.getSeconds() !== seconds
  ) {
    return null;
  }
  return result;
}
