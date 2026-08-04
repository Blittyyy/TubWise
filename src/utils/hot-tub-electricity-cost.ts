export type PowerUnit = 'W' | 'kW';
export type RateUnit = 'per_kwh' | 'cents_per_kwh';
export type ElectricityMode = 'simple' | 'detailed';

export const WATTS_PER_KW = 1_000;
/** Technical validation ceiling only — not a residential spa claim. */
export const MAX_POWER_KW = 100;
export const MAX_HOURS_PER_DAY = 24;
export const MIN_BILLING_DAYS = 1;
export const MAX_BILLING_DAYS = 366;
export const ANNUAL_DAYS = 365;

export const POWER_UNIT_LABELS: Record<PowerUnit, string> = {
  W: 'Watts',
  kW: 'Kilowatts',
};

export const RATE_UNIT_LABELS: Record<RateUnit, string> = {
  per_kwh: 'Dollars per kWh ($/kWh)',
  cents_per_kwh: 'Cents per kWh (¢/kWh)',
};

export function parseMeasurement(raw: string): number | null {
  const trimmed = raw.trim().replace(/,/g, '');
  if (!trimmed) return null;
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return null;
  return value;
}

export type DeviceId = 'heater' | 'circulationPump' | 'jetPump' | 'blower' | 'other';

export type ElectricityFieldKey =
  | 'heaterPower'
  | 'heaterRuntime'
  | 'circulationPumpPower'
  | 'circulationPumpRuntime'
  | 'jetPumpPower'
  | 'jetPumpRuntime'
  | 'blowerPower'
  | 'blowerRuntime'
  | 'otherPower'
  | 'otherRuntime'
  | 'rate'
  | 'days';

export interface ElectricityFieldError {
  field: ElectricityFieldKey;
  message: string;
}

export interface DeviceInput {
  power: string;
  runtimeHours: string;
}

export interface ElectricityInputs {
  mode: ElectricityMode;
  powerUnit: PowerUnit;
  rateUnit: RateUnit;
  heater: DeviceInput;
  circulationPump: DeviceInput;
  jetPump: DeviceInput;
  blower: DeviceInput;
  other: DeviceInput;
  rate: string;
  days: string;
}

export interface DeviceBreakdown {
  id: DeviceId;
  label: string;
  powerKw: number;
  runtimeHours: number;
  dailyKwh: number;
  displayDailyKwh: number;
  powerEntered: string;
  runtimeEntered: string;
}

export interface ElectricityResult {
  mode: ElectricityMode;
  powerUnit: PowerUnit;
  rateUnit: RateUnit;
  ratePerKwh: number;
  days: number;
  devices: DeviceBreakdown[];
  dailyKwh: number;
  dailyCost: number;
  periodKwh: number;
  periodCost: number;
  annualCost: number;
  displayDailyKwh: number;
  displayDailyCost: number;
  displayPeriodKwh: number;
  displayPeriodCost: number;
  displayAnnualCost: number;
  rateEntered: string;
  daysEntered: string;
}

export function toKilowatts(value: number, unit: PowerUnit): number {
  return unit === 'kW' ? value : value / WATTS_PER_KW;
}

export function toDollarsPerKwh(value: number, unit: RateUnit): number {
  return unit === 'per_kwh' ? value : value / 100;
}

export function formatKwh(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencyUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundKwh(value: number): number {
  return Math.round(value * 100) / 100;
}

const DEVICE_META: Record<
  DeviceId,
  { label: string; powerField: ElectricityFieldKey; runtimeField: ElectricityFieldKey; requiredInSimple: boolean }
> = {
  heater: {
    label: 'Heater',
    powerField: 'heaterPower',
    runtimeField: 'heaterRuntime',
    requiredInSimple: true,
  },
  circulationPump: {
    label: 'Circulation / filtration pump',
    powerField: 'circulationPumpPower',
    runtimeField: 'circulationPumpRuntime',
    requiredInSimple: true,
  },
  jetPump: {
    label: 'Jet pump',
    powerField: 'jetPumpPower',
    runtimeField: 'jetPumpRuntime',
    requiredInSimple: false,
  },
  blower: {
    label: 'Air blower',
    powerField: 'blowerPower',
    runtimeField: 'blowerRuntime',
    requiredInSimple: false,
  },
  other: {
    label: 'Other spa equipment',
    powerField: 'otherPower',
    runtimeField: 'otherRuntime',
    requiredInSimple: false,
  },
};

function validatePower(
  field: ElectricityFieldKey,
  raw: string,
  label: string,
  powerUnit: PowerUnit,
  required: boolean,
): { value: number | null; error?: ElectricityFieldError } {
  const trimmed = raw.trim();
  if (!trimmed) {
    if (required) {
      return { value: null, error: { field, message: `Enter ${label} power.` } };
    }
    return { value: null };
  }
  const parsed = parseMeasurement(raw);
  if (parsed === null) {
    return { value: null, error: { field, message: `${label} power must be a number.` } };
  }
  if (parsed < 0) {
    return { value: null, error: { field, message: `${label} power cannot be negative.` } };
  }
  if (parsed === 0) {
    return { value: null, error: { field, message: `${label} power must be greater than zero.` } };
  }
  const kw = toKilowatts(parsed, powerUnit);
  if (!Number.isFinite(kw) || kw > MAX_POWER_KW) {
    return {
      value: null,
      error: { field, message: `${label} power is too large for this calculator.` },
    };
  }
  return { value: parsed };
}

function validateRuntime(
  field: ElectricityFieldKey,
  raw: string,
  label: string,
  required: boolean,
): { value: number | null; error?: ElectricityFieldError } {
  const trimmed = raw.trim();
  if (!trimmed) {
    if (required) {
      return { value: null, error: { field, message: `Enter ${label} runtime hours per day.` } };
    }
    return { value: null };
  }
  const parsed = parseMeasurement(raw);
  if (parsed === null) {
    return { value: null, error: { field, message: `${label} runtime must be a number.` } };
  }
  if (parsed < 0) {
    return { value: null, error: { field, message: `${label} runtime cannot be negative.` } };
  }
  if (parsed === 0) {
    return {
      value: null,
      error: { field, message: `${label} runtime must be greater than zero when entered.` },
    };
  }
  if (parsed > MAX_HOURS_PER_DAY) {
    return {
      value: null,
      error: {
        field,
        message: `${label} runtime cannot exceed ${MAX_HOURS_PER_DAY} hours per day.`,
      },
    };
  }
  return { value: parsed };
}

function validateDevicePair(
  id: DeviceId,
  input: DeviceInput,
  powerUnit: PowerUnit,
  required: boolean,
): { power: number | null; runtime: number | null; errors: ElectricityFieldError[] } {
  const meta = DEVICE_META[id];
  const powerRaw = input.power.trim();
  const runtimeRaw = input.runtimeHours.trim();
  const errors: ElectricityFieldError[] = [];

  const hasPower = Boolean(powerRaw);
  const hasRuntime = Boolean(runtimeRaw);

  if (!required && !hasPower && !hasRuntime) {
    return { power: null, runtime: null, errors };
  }

  const power = validatePower(
    meta.powerField,
    input.power,
    meta.label,
    powerUnit,
    required || hasRuntime,
  );
  const runtime = validateRuntime(
    meta.runtimeField,
    input.runtimeHours,
    meta.label,
    required || hasPower,
  );
  if (power.error) errors.push(power.error);
  if (runtime.error) errors.push(runtime.error);

  return { power: power.value, runtime: runtime.value, errors };
}

export function validateElectricityInputs(inputs: ElectricityInputs): ElectricityFieldError[] {
  const errors: ElectricityFieldError[] = [];

  const heater = validateDevicePair('heater', inputs.heater, inputs.powerUnit, true);
  const pumpRequired = inputs.mode === 'simple';
  const pump = validateDevicePair(
    'circulationPump',
    inputs.circulationPump,
    inputs.powerUnit,
    pumpRequired,
  );
  errors.push(...heater.errors, ...pump.errors);

  if (inputs.mode === 'detailed') {
    for (const id of ['jetPump', 'blower', 'other'] as DeviceId[]) {
      const device = validateDevicePair(id, inputs[id], inputs.powerUnit, false);
      errors.push(...device.errors);
    }
  }

  const rateParsed = parseMeasurement(inputs.rate);
  if (rateParsed === null) {
    if (!inputs.rate.trim()) {
      errors.push({ field: 'rate', message: 'Enter your electricity rate.' });
    } else {
      errors.push({ field: 'rate', message: 'Electricity rate must be a number.' });
    }
  } else if (rateParsed < 0) {
    errors.push({ field: 'rate', message: 'Electricity rate cannot be negative.' });
  } else if (rateParsed === 0) {
    errors.push({ field: 'rate', message: 'Electricity rate must be greater than zero.' });
  } else {
    const perKwh = toDollarsPerKwh(rateParsed, inputs.rateUnit);
    if (!Number.isFinite(perKwh) || perKwh > 100) {
      errors.push({ field: 'rate', message: 'Electricity rate is too large for this calculator.' });
    }
  }

  const daysParsed = parseMeasurement(inputs.days);
  if (daysParsed === null) {
    if (!inputs.days.trim()) {
      errors.push({ field: 'days', message: 'Enter the number of days in the billing period.' });
    } else {
      errors.push({ field: 'days', message: 'Billing days must be a number.' });
    }
  } else if (daysParsed % 1 !== 0) {
    errors.push({ field: 'days', message: 'Billing days must be a whole number.' });
  } else if (daysParsed < MIN_BILLING_DAYS || daysParsed > MAX_BILLING_DAYS) {
    errors.push({
      field: 'days',
      message: `Billing days must be between ${MIN_BILLING_DAYS} and ${MAX_BILLING_DAYS}.`,
    });
  }

  return errors;
}

export function calculateElectricityCost(inputs: ElectricityInputs):
  | { ok: true; result: ElectricityResult }
  | { ok: false; errors: ElectricityFieldError[] } {
  const errors = validateElectricityInputs(inputs);
  if (errors.length > 0) return { ok: false, errors };

  const rateValue = parseMeasurement(inputs.rate)!;
  const days = parseMeasurement(inputs.days)!;
  const ratePerKwh = toDollarsPerKwh(rateValue, inputs.rateUnit);

  const deviceIds: DeviceId[] =
    inputs.mode === 'detailed'
      ? ['heater', 'circulationPump', 'jetPump', 'blower', 'other']
      : ['heater', 'circulationPump'];

  const devices: DeviceBreakdown[] = [];
  let dailyKwh = 0;

  for (const id of deviceIds) {
    const meta = DEVICE_META[id];
    const input = inputs[id];
    const powerRaw = input.power.trim();
    const runtimeRaw = input.runtimeHours.trim();
    if (!powerRaw && !runtimeRaw) continue;

    const powerValue = parseMeasurement(input.power)!;
    const runtimeHours = parseMeasurement(input.runtimeHours)!;
    const powerKw = toKilowatts(powerValue, inputs.powerUnit);
    const deviceDailyKwh = powerKw * runtimeHours;
    dailyKwh += deviceDailyKwh;

    devices.push({
      id,
      label: meta.label,
      powerKw,
      runtimeHours,
      dailyKwh: deviceDailyKwh,
      displayDailyKwh: roundKwh(deviceDailyKwh),
      powerEntered: powerRaw,
      runtimeEntered: runtimeRaw,
    });
  }

  if (devices.length === 0 || !Number.isFinite(dailyKwh)) {
    return {
      ok: false,
      errors: [{ field: 'heaterPower', message: 'Unable to calculate with these values.' }],
    };
  }

  const dailyCost = dailyKwh * ratePerKwh;
  const periodKwh = dailyKwh * days;
  const periodCost = dailyCost * days;
  const annualCost = dailyCost * ANNUAL_DAYS;

  return {
    ok: true,
    result: {
      mode: inputs.mode,
      powerUnit: inputs.powerUnit,
      rateUnit: inputs.rateUnit,
      ratePerKwh,
      days,
      devices,
      dailyKwh,
      dailyCost,
      periodKwh,
      periodCost,
      annualCost,
      displayDailyKwh: roundKwh(dailyKwh),
      displayDailyCost: roundMoney(dailyCost),
      displayPeriodKwh: roundKwh(periodKwh),
      displayPeriodCost: roundMoney(periodCost),
      displayAnnualCost: roundMoney(annualCost),
      rateEntered: inputs.rate.trim(),
      daysEntered: inputs.days.trim(),
    },
  };
}
