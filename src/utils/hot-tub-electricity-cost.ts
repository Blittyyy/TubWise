export type PowerUnit = 'W' | 'kW';
export type RateUnit = 'per_kwh' | 'cents_per_kwh';
export type ElectricityMode = 'simple' | 'detailed';
export type EstimationMethod = 'equipment' | 'measured' | 'standby';
export type StandbyInputMode = 'watts' | 'annualKwh';

export const WATTS_PER_KW = 1_000;
/** Technical validation ceiling only — not a residential spa claim. */
export const MAX_POWER_KW = 100;
export const MAX_HOURS_PER_DAY = 24;
export const MIN_BILLING_DAYS = 1;
export const MAX_BILLING_DAYS = 366;
export const ANNUAL_DAYS = 365;
export const MAX_MEASURED_KWH = 100_000;
export const MAX_MEASUREMENT_DAYS = 366;
export const MAX_STANDBY_WATTS = 10_000;
export const MAX_ANNUAL_STANDBY_KWH = 50_000;

export const POWER_UNIT_LABELS: Record<PowerUnit, string> = {
  W: 'Watts',
  kW: 'Kilowatts',
};

export const RATE_UNIT_LABELS: Record<RateUnit, string> = {
  per_kwh: 'Dollars per kWh ($/kWh)',
  cents_per_kwh: 'Cents per kWh (¢/kWh)',
};

export const ESTIMATION_METHOD_LABELS: Record<EstimationMethod, string> = {
  equipment: 'Equipment wattage and runtime',
  measured: 'Measured electricity consumption',
  standby: 'Manufacturer energy-label (standby)',
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
  | 'days'
  | 'measuredKwh'
  | 'measurementDays'
  | 'standbyWatts'
  | 'annualStandbyKwh'
  | 'compareHeaterRuntime';

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

export interface MeasuredElectricityInputs {
  measuredKwh: string;
  measurementDays: string;
  rate: string;
  rateUnit: RateUnit;
  days: string;
}

export interface StandbyElectricityInputs {
  inputMode: StandbyInputMode;
  standbyWatts: string;
  annualStandbyKwh: string;
  rate: string;
  rateUnit: RateUnit;
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

export interface CostTotals {
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
}

export interface ElectricityResult extends CostTotals {
  estimationMethod: EstimationMethod;
  mode: ElectricityMode;
  powerUnit: PowerUnit;
  rateUnit: RateUnit;
  ratePerKwh: number;
  days: number;
  devices: DeviceBreakdown[];
  rateEntered: string;
  daysEntered: string;
  assumptions: string[];
  /** Present only for measured mode */
  measuredKwh?: number;
  measurementDays?: number;
  /** Present only for standby mode */
  standbyLabel?: 'standbyWatts' | 'annualKwh';
  standbyEntered?: string;
}

export interface SeasonalComparisonResult {
  baseline: ElectricityResult;
  comparison: ElectricityResult;
  dailyKwhDifference: number;
  periodCostDifference: number;
  displayDailyKwhDifference: number;
  displayPeriodCostDifference: number;
  compareHeaterRuntime: number;
  assumptions: string[];
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

function buildTotals(dailyKwh: number, ratePerKwh: number, days: number): CostTotals {
  const dailyCost = dailyKwh * ratePerKwh;
  const periodKwh = dailyKwh * days;
  const periodCost = dailyCost * days;
  const annualCost = dailyCost * ANNUAL_DAYS;
  return {
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
  };
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

function validateRateAndDays(
  rate: string,
  rateUnit: RateUnit,
  days: string,
  allowZeroRate = false,
): ElectricityFieldError[] {
  const errors: ElectricityFieldError[] = [];

  const rateParsed = parseMeasurement(rate);
  if (rateParsed === null) {
    if (!rate.trim()) {
      errors.push({ field: 'rate', message: 'Enter your electricity rate.' });
    } else {
      errors.push({ field: 'rate', message: 'Electricity rate must be a number.' });
    }
  } else if (rateParsed < 0) {
    errors.push({ field: 'rate', message: 'Electricity rate cannot be negative.' });
  } else if (rateParsed === 0 && !allowZeroRate) {
    errors.push({ field: 'rate', message: 'Electricity rate must be greater than zero.' });
  } else {
    const perKwh = toDollarsPerKwh(rateParsed, rateUnit);
    if (!Number.isFinite(perKwh) || perKwh > 100) {
      errors.push({ field: 'rate', message: 'Electricity rate is too large for this calculator.' });
    }
  }

  const daysParsed = parseMeasurement(days);
  if (daysParsed === null) {
    if (!days.trim()) {
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

  errors.push(...validateRateAndDays(inputs.rate, inputs.rateUnit, inputs.days));
  return errors;
}

/**
 * Equipment wattage × runtime estimate (Simple / Detailed). Preserves existing behavior.
 */
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

  const totals = buildTotals(dailyKwh, ratePerKwh, days);

  return {
    ok: true,
    result: {
      estimationMethod: 'equipment',
      mode: inputs.mode,
      powerUnit: inputs.powerUnit,
      rateUnit: inputs.rateUnit,
      ratePerKwh,
      days,
      devices,
      ...totals,
      rateEntered: inputs.rate.trim(),
      daysEntered: inputs.days.trim(),
      assumptions: [
        'Each device is assumed to draw its entered power for the entered runtime hours per day.',
        'Heater runtime means active heating time drawing rated power—not simply time the spa is powered on.',
        'Does not estimate heater wattage from breaker rating or supply voltage.',
        'Annualized cost is daily cost × 365 and is an extrapolation, not a utility forecast.',
      ],
    },
  };
}

export function calculateMeasuredElectricityCost(inputs: MeasuredElectricityInputs):
  | { ok: true; result: ElectricityResult }
  | { ok: false; errors: ElectricityFieldError[] } {
  const errors: ElectricityFieldError[] = [];

  const measured = parseMeasurement(inputs.measuredKwh);
  if (measured === null) {
    errors.push({
      field: 'measuredKwh',
      message: inputs.measuredKwh.trim()
        ? 'Measured consumption must be a number.'
        : 'Enter measured spa electricity consumption in kWh.',
    });
  } else if (measured < 0) {
    errors.push({ field: 'measuredKwh', message: 'Measured consumption cannot be negative.' });
  } else if (measured === 0) {
    // Zero consumption is a valid observation (e.g., spa unplugged for the period).
  } else if (!Number.isFinite(measured) || measured > MAX_MEASURED_KWH) {
    errors.push({
      field: 'measuredKwh',
      message: 'Measured consumption is too large for this calculator.',
    });
  }

  const measurementDays = parseMeasurement(inputs.measurementDays);
  if (measurementDays === null) {
    errors.push({
      field: 'measurementDays',
      message: inputs.measurementDays.trim()
        ? 'Measurement days must be a number.'
        : 'Enter the measurement period in days.',
    });
  } else if (measurementDays % 1 !== 0) {
    errors.push({ field: 'measurementDays', message: 'Measurement days must be a whole number.' });
  } else if (measurementDays <= 0) {
    errors.push({
      field: 'measurementDays',
      message: 'Measurement days must be greater than zero.',
    });
  } else if (measurementDays > MAX_MEASUREMENT_DAYS) {
    errors.push({
      field: 'measurementDays',
      message: `Measurement days must be ${MAX_MEASUREMENT_DAYS} or fewer.`,
    });
  }

  errors.push(...validateRateAndDays(inputs.rate, inputs.rateUnit, inputs.days, true));

  if (errors.length > 0) return { ok: false, errors };

  const measuredKwh = measured!;
  const periodDays = measurementDays!;
  const dailyKwh = measuredKwh / periodDays;
  if (!Number.isFinite(dailyKwh)) {
    return {
      ok: false,
      errors: [{ field: 'measuredKwh', message: 'Unable to calculate with these values.' }],
    };
  }

  const rateValue = parseMeasurement(inputs.rate)!;
  const days = parseMeasurement(inputs.days)!;
  const ratePerKwh = toDollarsPerKwh(rateValue, inputs.rateUnit);
  const totals = buildTotals(dailyKwh, ratePerKwh, days);

  return {
    ok: true,
    result: {
      estimationMethod: 'measured',
      mode: 'simple',
      powerUnit: 'W',
      rateUnit: inputs.rateUnit,
      ratePerKwh,
      days,
      devices: [],
      ...totals,
      rateEntered: inputs.rate.trim(),
      daysEntered: inputs.days.trim(),
      measuredKwh,
      measurementDays: periodDays,
      assumptions: [
        'Outputs are extrapolated from the entered spa-attributable observations.',
        'Measured consumption must be attributable to the spa, not total household electricity use.',
        'Accept readings from suitable manufacturer energy reporting or professionally installed monitoring systems.',
        'Extrapolation from a short measurement period assumes similar future usage and environmental conditions.',
        'Annualized cost is daily cost × 365 and is an extrapolation, not a utility forecast.',
      ],
    },
  };
}

export function calculateStandbyElectricityCost(inputs: StandbyElectricityInputs):
  | { ok: true; result: ElectricityResult }
  | { ok: false; errors: ElectricityFieldError[] } {
  const errors: ElectricityFieldError[] = [];
  let dailyStandbyKwh = NaN;
  let standbyEntered = '';
  let standbyLabel: 'standbyWatts' | 'annualKwh' = 'standbyWatts';

  if (inputs.inputMode === 'watts') {
    standbyLabel = 'standbyWatts';
    const watts = parseMeasurement(inputs.standbyWatts);
    if (watts === null) {
      errors.push({
        field: 'standbyWatts',
        message: inputs.standbyWatts.trim()
          ? 'Standby power must be a number.'
          : 'Enter published normalized standby power in watts.',
      });
    } else if (watts < 0) {
      errors.push({ field: 'standbyWatts', message: 'Standby power cannot be negative.' });
    } else if (watts === 0) {
      dailyStandbyKwh = 0;
      standbyEntered = '0';
    } else if (!Number.isFinite(watts) || watts > MAX_STANDBY_WATTS) {
      errors.push({
        field: 'standbyWatts',
        message: 'Standby power is too large for this calculator.',
      });
    } else {
      dailyStandbyKwh = (watts / WATTS_PER_KW) * 24;
      standbyEntered = inputs.standbyWatts.trim();
    }
  } else {
    standbyLabel = 'annualKwh';
    const annual = parseMeasurement(inputs.annualStandbyKwh);
    if (annual === null) {
      errors.push({
        field: 'annualStandbyKwh',
        message: inputs.annualStandbyKwh.trim()
          ? 'Annual standby electricity must be a number.'
          : 'Enter published annual standby electricity consumption in kWh.',
      });
    } else if (annual < 0) {
      errors.push({
        field: 'annualStandbyKwh',
        message: 'Annual standby electricity cannot be negative.',
      });
    } else if (annual === 0) {
      dailyStandbyKwh = 0;
      standbyEntered = '0';
    } else if (!Number.isFinite(annual) || annual > MAX_ANNUAL_STANDBY_KWH) {
      errors.push({
        field: 'annualStandbyKwh',
        message: 'Annual standby electricity is too large for this calculator.',
      });
    } else {
      dailyStandbyKwh = annual / ANNUAL_DAYS;
      standbyEntered = inputs.annualStandbyKwh.trim();
    }
  }

  errors.push(...validateRateAndDays(inputs.rate, inputs.rateUnit, inputs.days, true));
  if (errors.length > 0) return { ok: false, errors };

  if (!Number.isFinite(dailyStandbyKwh)) {
    return {
      ok: false,
      errors: [
        {
          field: inputs.inputMode === 'watts' ? 'standbyWatts' : 'annualStandbyKwh',
          message: 'Unable to calculate with these values.',
        },
      ],
    };
  }

  const rateValue = parseMeasurement(inputs.rate)!;
  const days = parseMeasurement(inputs.days)!;
  const ratePerKwh = toDollarsPerKwh(rateValue, inputs.rateUnit);
  const totals = buildTotals(dailyStandbyKwh, ratePerKwh, days);

  return {
    ok: true,
    result: {
      estimationMethod: 'standby',
      mode: 'simple',
      powerUnit: 'W',
      rateUnit: inputs.rateUnit,
      ratePerKwh,
      days,
      devices: [],
      ...totals,
      rateEntered: inputs.rate.trim(),
      daysEntered: inputs.days.trim(),
      standbyLabel,
      standbyEntered,
      assumptions: [
        'All outputs are standby-energy estimates, not total operating costs.',
        'Standardized test conditions differ from real-world usage.',
        'Published standby power may already include heating, circulation, and filtration required to maintain temperature—do not add equipment consumption on top automatically.',
        'Do not confuse maximum permitted standby power with actual tested standby power.',
        'Not every spa has an energy label. Prefer model-specific manufacturer or official appliance-efficiency listings.',
        'Annualized cost is daily standby cost × 365 and is an extrapolation, not a utility forecast.',
      ],
    },
  };
}

/**
 * Optional seasonal comparison in equipment mode: second user-entered heater runtime, other inputs held constant.
 */
export function compareSeasonalHeaterRuntime(
  baselineInputs: ElectricityInputs,
  compareHeaterRuntime: string,
):
  | { ok: true; result: SeasonalComparisonResult }
  | { ok: false; errors: ElectricityFieldError[] } {
  const baseline = calculateElectricityCost(baselineInputs);
  if (!baseline.ok) return baseline;

  const runtime = validateRuntime(
    'compareHeaterRuntime',
    compareHeaterRuntime,
    'Comparison heater',
    true,
  );
  if (runtime.error) return { ok: false, errors: [runtime.error] };

  const comparisonInputs: ElectricityInputs = {
    ...baselineInputs,
    heater: {
      ...baselineInputs.heater,
      runtimeHours: compareHeaterRuntime.trim(),
    },
  };
  const comparison = calculateElectricityCost(comparisonInputs);
  if (!comparison.ok) return comparison;

  const dailyKwhDifference = comparison.result.dailyKwh - baseline.result.dailyKwh;
  const periodCostDifference = comparison.result.periodCost - baseline.result.periodCost;

  return {
    ok: true,
    result: {
      baseline: baseline.result,
      comparison: comparison.result,
      dailyKwhDifference,
      periodCostDifference,
      displayDailyKwhDifference: roundKwh(dailyKwhDifference),
      displayPeriodCostDifference: roundMoney(periodCostDifference),
      compareHeaterRuntime: runtime.value!,
      assumptions: [
        'Holds all other equipment inputs and the electricity rate constant.',
        'Uses a second user-entered heater runtime only—does not assign automatic heating values from outdoor temperature, region, insulation, or cover quality.',
        'Scenario differences are illustrative comparisons, not predictions of actual seasonal bills.',
        'Do not reduce required filtration or disable freeze protection to chase a lower estimate.',
      ],
    },
  };
}

/** Illustrative example-table helper (heater kW × hours + pump kWh/day). */
export function exampleDailyKwh(
  heaterKw: number,
  heaterHours: number,
  pumpKw: number,
  pumpHours: number,
): number {
  return heaterKw * heaterHours + pumpKw * pumpHours;
}

export function examplePeriodCost(dailyKwh: number, ratePerKwh: number, days: number): number {
  return dailyKwh * ratePerKwh * days;
}
