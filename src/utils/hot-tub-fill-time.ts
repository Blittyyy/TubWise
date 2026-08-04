export type CapacityUnit = 'gal' | 'L';
export type FlowUnit = 'gpm' | 'lpm';
export type FillPreset = 'empty' | '25' | '50' | '75' | 'custom';

export const LITERS_PER_US_GALLON = 3.785411784;

/** Technical validation ceiling only — not a residential spa claim. */
export const MAX_CAPACITY_GALLONS = 100_000;
/** Technical validation ceiling only — not a typical hose claim. */
export const MAX_FLOW_GPM = 1_000;

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

export function parseMeasurement(raw: string): number | null {
  const trimmed = raw.trim().replace(/,/g, '');
  if (!trimmed) return null;
  // Plain decimal only; rejects letters, Infinity, and scientific notation.
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return null;
  return value;
}

export type FillTimeFieldKey = 'capacity' | 'fillPercent' | 'flowRate' | 'startTime';

export interface FillTimeFieldError {
  field: FillTimeFieldKey;
  message: string;
}

export interface FillTimeInputs {
  capacity: string;
  capacityUnit: CapacityUnit;
  fillPreset: FillPreset;
  customPercent: string;
  flowRate: string;
  flowUnit: FlowUnit;
}

export interface FillTimeResult {
  capacityUnit: CapacityUnit;
  flowUnit: FlowUnit;
  fillPercent: number;
  fillPreset: FillPreset;
  capacityValue: number;
  flowValue: number;
  remainingGallons: number;
  remainingLiters: number;
  displayRemainingGallons: number;
  displayRemainingLiters: number;
  durationMinutesExact: number;
  displayTotalMinutes: number;
  displayHours: number;
  displayMinutesPart: number;
  durationLabel: string;
  inputsSummary: {
    capacity: string;
    capacityUnit: CapacityUnit;
    fillLabel: string;
    flowRate: string;
    flowUnit: FlowUnit;
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
  field: 'capacity' | 'flowRate',
  raw: string,
  label: string,
  maxGallonsOrGpm: number,
  toGallonsOrGpm: (value: number) => number,
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
  const normalized = toGallonsOrGpm(parsed);
  if (!Number.isFinite(normalized) || normalized > maxGallonsOrGpm) {
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

  const flow = validatePositiveQuantity(
    'flowRate',
    inputs.flowRate,
    'Hose flow rate',
    MAX_FLOW_GPM,
    (value) => flowToGpm(value, inputs.flowUnit),
  );
  if (flow.error) errors.push(flow.error);

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

export function calculateFillTime(inputs: FillTimeInputs):
  | { ok: true; result: FillTimeResult }
  | { ok: false; errors: FillTimeFieldError[] } {
  const errors = validateFillTimeInputs(inputs);
  if (errors.length > 0) return { ok: false, errors };

  const capacityValue = parseMeasurement(inputs.capacity)!;
  const flowValue = parseMeasurement(inputs.flowRate)!;
  const fillPercent = resolveFillPercent(inputs.fillPreset, inputs.customPercent).percent;

  const capacityGallons = capacityToGallons(capacityValue, inputs.capacityUnit);
  const flowGpm = flowToGpm(flowValue, inputs.flowUnit);
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
      flowUnit: inputs.flowUnit,
      fillPercent,
      fillPreset: inputs.fillPreset,
      capacityValue,
      flowValue,
      remainingGallons,
      remainingLiters,
      displayRemainingGallons: Math.round(remainingGallons),
      displayRemainingLiters: Math.round(remainingLiters),
      durationMinutesExact,
      displayTotalMinutes,
      displayHours,
      displayMinutesPart,
      durationLabel: formatDurationLabel(displayTotalMinutes),
      inputsSummary: {
        capacity: inputs.capacity.trim(),
        capacityUnit: inputs.capacityUnit,
        fillLabel,
        flowRate: inputs.flowRate.trim(),
        flowUnit: inputs.flowUnit,
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
