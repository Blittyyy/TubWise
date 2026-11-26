export type CapacityUnit = 'gal' | 'L';
export type TempUnit = 'F' | 'C';
export type HeatUpMode = 'heater' | 'measured';
export type HeaterPreset = '1' | '1.5' | '2' | '3' | '4' | '5.5' | '6' | 'custom';
export type HeatLossPreset = 'none' | '10' | '20' | '30' | 'custom';
export type DurationUnit = 'minutes' | 'hours';
export type RateUnit = 'per_kwh' | 'cents_per_kwh';

export const LITERS_PER_US_GALLON = 3.785411784;
/** Specific heat of liquid water (OpenStax College Physics Table 14.1): 4186 J/kg°C = 4.186 kJ/kg°C. */
export const SPECIFIC_HEAT_KJ_PER_KG_C = 4.186;
/** CDC states water temperature should not be higher than 104°F (40°C). */
export const MAX_TARGET_F = 104;
export const MAX_TARGET_C = 40;

/** Technical validation ceiling only — not a residential spa claim. */
export const MAX_CAPACITY_GALLONS = 100_000;
/** Technical validation ceiling only — not a typical heater claim. */
export const MAX_HEATER_KW = 50;
/** Technical validation ceiling for illustrative heat-loss % (must stay below 100). */
export const MAX_HEAT_LOSS_PERCENT = 90;
export const MAX_OBSERVATION_HOURS = 168;
export const MAX_ELECTRICITY_RATE = 10_000;

export const CAPACITY_UNIT_LABELS: Record<CapacityUnit, string> = {
  gal: 'U.S. gallons',
  L: 'Liters',
};

export const TEMP_UNIT_LABELS: Record<TempUnit, string> = {
  F: 'Fahrenheit (°F)',
  C: 'Celsius (°C)',
};

export const HEATER_PRESET_LABELS: Record<HeaterPreset, string> = {
  '1': '1 kW',
  '1.5': '1.5 kW',
  '2': '2 kW',
  '3': '3 kW',
  '4': '4 kW',
  '5.5': '5.5 kW',
  '6': '6 kW',
  custom: 'Custom',
};

export const HEATER_PRESET_VALUES: Exclude<HeaterPreset, 'custom'>[] = [
  '1',
  '1.5',
  '2',
  '3',
  '4',
  '5.5',
  '6',
];

export const HEAT_LOSS_PRESET_LABELS: Record<HeatLossPreset, string> = {
  none: 'None (ideal minimum)',
  '10': '10% illustrative',
  '20': '20% illustrative',
  '30': '30% illustrative',
  custom: 'Custom percentage',
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

export type HeatUpFieldKey =
  | 'capacity'
  | 'currentTemp'
  | 'targetTemp'
  | 'heaterPower'
  | 'heatLoss'
  | 'observedRise'
  | 'observationDuration'
  | 'electricityRate';

export interface HeatUpFieldError {
  field: HeatUpFieldKey;
  message: string;
}

export interface HeatUpInputs {
  mode: HeatUpMode;
  capacity: string;
  capacityUnit: CapacityUnit;
  currentTemp: string;
  targetTemp: string;
  tempUnit: TempUnit;
  heaterPreset: HeaterPreset;
  customHeaterKw: string;
  heatLossPreset: HeatLossPreset;
  customHeatLossPercent: string;
  observedRise: string;
  observationDuration: string;
  observationUnit: DurationUnit;
  electricityRate: string;
  electricityRateUnit: RateUnit;
}

export interface HeatUpResult {
  mode: HeatUpMode;
  alreadyAtOrAboveTarget: boolean;
  tempUnit: TempUnit;
  capacityUnit: CapacityUnit;
  currentTemp: number;
  targetTemp: number;
  deltaTempDisplay: number;
  deltaTempC: number;
  capacityValue: number;
  capacityLiters: number;
  thermalEnergyKWh: number | null;
  idealHours: number | null;
  estimatedHours: number | null;
  heatingRatePerHourDisplay: number | null;
  heaterKw: number | null;
  heatLossPercent: number | null;
  effectiveHeatingKw: number | null;
  estimatedHeaterEnergyKWh: number | null;
  estimatedHeaterCostUsd: number | null;
  electricityRateEntered: string | null;
  electricityRateUnit: RateUnit | null;
  durationLabel: string | null;
  idealDurationLabel: string | null;
  displayEstimatedTotalMinutes: number | null;
  displayIdealTotalMinutes: number | null;
  measuredObservationHours: number | null;
  measuredObservedRise: number | null;
  inputsSummary: {
    modeLabel: string;
    capacityLabel: string | null;
    currentTempLabel: string;
    targetTempLabel: string;
    heaterLabel: string | null;
    heatLossLabel: string | null;
    measuredLabel: string | null;
  };
  troubleshootingHint: string | null;
}

export function gallonsToLiters(gallons: number): number {
  return gallons * LITERS_PER_US_GALLON;
}

export function litersToGallons(liters: number): number {
  return liters / LITERS_PER_US_GALLON;
}

export function capacityToLiters(value: number, unit: CapacityUnit): number {
  return unit === 'L' ? value : gallonsToLiters(value);
}

/** Convert a temperature *difference* from °F to °C (not an absolute temperature). */
export function deltaFToDeltaC(deltaF: number): number {
  return deltaF * (5 / 9);
}

export function deltaCToDeltaF(deltaC: number): number {
  return deltaC * (9 / 5);
}

export function temperatureDifferenceInC(
  current: number,
  target: number,
  unit: TempUnit,
): number {
  const delta = target - current;
  return unit === 'C' ? delta : deltaFToDeltaC(delta);
}

export function maxTargetForUnit(unit: TempUnit): number {
  return unit === 'F' ? MAX_TARGET_F : MAX_TARGET_C;
}

export function toDollarsPerKwh(value: number, unit: RateUnit): number {
  return unit === 'per_kwh' ? value : value / 100;
}

export function formatCurrencyUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatKwh(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatRate(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatWholeNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

export function formatDurationFromHours(hoursExact: number): string {
  const totalMinutes = Math.round(hoursExact * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
  }

  const hourLabel = hours === 1 ? '1 hour' : `${hours} hours`;
  if (minutes === 0) return hourLabel;
  const minuteLabel = minutes === 1 ? '1 minute' : `${minutes} minutes`;
  return `${hourLabel} ${minuteLabel}`;
}

/**
 * Thermal energy to raise water temperature:
 * Q (kWh) = massKg × 4.186 × ΔT°C / 3600
 * Approximate massKg = liters (≈ 1 kg/L for liquid water).
 */
export function thermalEnergyKWh(liters: number, deltaTempC: number): number {
  return (liters * SPECIFIC_HEAT_KJ_PER_KG_C * deltaTempC) / 3600;
}

export function idealHeatingHours(energyKWh: number, heaterKw: number): number {
  return energyKWh / heaterKw;
}

export function effectiveHeatingKw(heaterKw: number, heatLossPercent: number): number {
  return heaterKw * (1 - heatLossPercent / 100);
}

export function resolveHeaterKw(
  preset: HeaterPreset,
  customKw: string,
): { value: number; error?: HeatUpFieldError } {
  if (preset !== 'custom') {
    const value = Number(preset);
    if (!Number.isFinite(value) || value <= 0) {
      return {
        value: NaN,
        error: { field: 'heaterPower', message: 'Choose a heater power preset.' },
      };
    }
    return { value };
  }

  const parsed = parseMeasurement(customKw);
  if (parsed === null) {
    if (!customKw.trim()) {
      return { value: NaN, error: { field: 'heaterPower', message: 'Enter custom heater power.' } };
    }
    return {
      value: NaN,
      error: { field: 'heaterPower', message: 'Heater power must be a number.' },
    };
  }
  if (parsed < 0) {
    return {
      value: NaN,
      error: { field: 'heaterPower', message: 'Heater power cannot be negative.' },
    };
  }
  if (parsed === 0) {
    return {
      value: NaN,
      error: { field: 'heaterPower', message: 'Heater power must be greater than zero.' },
    };
  }
  if (parsed > MAX_HEATER_KW) {
    return {
      value: NaN,
      error: {
        field: 'heaterPower',
        message: 'Heater power is too large for this calculator.',
      },
    };
  }
  return { value: parsed };
}

export function resolveHeatLossPercent(
  preset: HeatLossPreset,
  customPercent: string,
): { value: number; error?: HeatUpFieldError } {
  if (preset === 'none') return { value: 0 };
  if (preset === '10' || preset === '20' || preset === '30') return { value: Number(preset) };

  const parsed = parseMeasurement(customPercent);
  if (parsed === null) {
    if (!customPercent.trim()) {
      return {
        value: NaN,
        error: { field: 'heatLoss', message: 'Enter a custom heat-loss percentage.' },
      };
    }
    return {
      value: NaN,
      error: { field: 'heatLoss', message: 'Heat-loss percentage must be a number.' },
    };
  }
  if (parsed < 0) {
    return {
      value: NaN,
      error: { field: 'heatLoss', message: 'Heat-loss percentage cannot be negative.' },
    };
  }
  if (parsed >= 100) {
    return {
      value: NaN,
      error: {
        field: 'heatLoss',
        message: 'Heat-loss percentage must be below 100%.',
      },
    };
  }
  if (parsed > MAX_HEAT_LOSS_PERCENT) {
    return {
      value: NaN,
      error: {
        field: 'heatLoss',
        message: 'Heat-loss percentage is too large for this calculator.',
      },
    };
  }
  return { value: parsed };
}

function validatePositiveCapacity(
  raw: string,
  unit: CapacityUnit,
): { value: number; error?: HeatUpFieldError } {
  const parsed = parseMeasurement(raw);
  if (parsed === null) {
    if (!raw.trim()) {
      return { value: NaN, error: { field: 'capacity', message: 'Enter spa capacity.' } };
    }
    return { value: NaN, error: { field: 'capacity', message: 'Spa capacity must be a number.' } };
  }
  if (parsed < 0) {
    return { value: NaN, error: { field: 'capacity', message: 'Spa capacity cannot be negative.' } };
  }
  if (parsed === 0) {
    return {
      value: NaN,
      error: { field: 'capacity', message: 'Spa capacity must be greater than zero.' },
    };
  }
  const gallons = unit === 'gal' ? parsed : litersToGallons(parsed);
  if (!Number.isFinite(gallons) || gallons > MAX_CAPACITY_GALLONS) {
    return {
      value: NaN,
      error: { field: 'capacity', message: 'Spa capacity is too large for this calculator.' },
    };
  }
  return { value: parsed };
}

function validateTemperature(
  field: 'currentTemp' | 'targetTemp',
  raw: string,
  label: string,
  unit: TempUnit,
  enforceMax: boolean,
): { value: number; error?: HeatUpFieldError } {
  const parsed = parseMeasurement(raw);
  if (parsed === null) {
    if (!raw.trim()) {
      return { value: NaN, error: { field, message: `Enter ${label}.` } };
    }
    return { value: NaN, error: { field, message: `${label} must be a number.` } };
  }
  if (!Number.isFinite(parsed)) {
    return { value: NaN, error: { field, message: `${label} must be a finite number.` } };
  }
  if (enforceMax && parsed > maxTargetForUnit(unit)) {
    const limitLabel = unit === 'F' ? '104°F' : '40°C';
    return {
      value: NaN,
      error: {
        field,
        message: `Target temperature cannot exceed ${limitLabel}. That limit is a maximum, not a recommended target for everyone.`,
      },
    };
  }
  return { value: parsed };
}

function validateObservationDuration(
  raw: string,
  unit: DurationUnit,
): { hours: number; error?: HeatUpFieldError } {
  const parsed = parseMeasurement(raw);
  if (parsed === null) {
    if (!raw.trim()) {
      return {
        hours: NaN,
        error: { field: 'observationDuration', message: 'Enter the measurement duration.' },
      };
    }
    return {
      hours: NaN,
      error: {
        field: 'observationDuration',
        message: 'Measurement duration must be a number.',
      },
    };
  }
  if (parsed < 0) {
    return {
      hours: NaN,
      error: {
        field: 'observationDuration',
        message: 'Measurement duration cannot be negative.',
      },
    };
  }
  if (parsed === 0) {
    return {
      hours: NaN,
      error: {
        field: 'observationDuration',
        message: 'Measurement duration must be greater than zero.',
      },
    };
  }
  const hours = unit === 'hours' ? parsed : parsed / 60;
  if (!Number.isFinite(hours) || hours > MAX_OBSERVATION_HOURS) {
    return {
      hours: NaN,
      error: {
        field: 'observationDuration',
        message: 'Measurement duration is too large for this calculator.',
      },
    };
  }
  return { hours };
}

function validateOptionalElectricityRate(
  raw: string,
  unit: RateUnit,
):
  | { ok: true; available: false }
  | { ok: true; available: true; ratePerKwh: number; entered: string; unit: RateUnit }
  | { ok: false; error: HeatUpFieldError } {
  if (!raw.trim()) return { ok: true, available: false };

  const parsed = parseMeasurement(raw);
  if (parsed === null) {
    return {
      ok: false,
      error: { field: 'electricityRate', message: 'Electricity rate must be a number.' },
    };
  }
  if (parsed < 0) {
    return {
      ok: false,
      error: { field: 'electricityRate', message: 'Electricity rate cannot be negative.' },
    };
  }
  if (parsed > MAX_ELECTRICITY_RATE) {
    return {
      ok: false,
      error: {
        field: 'electricityRate',
        message: 'Electricity rate is too large for this calculator.',
      },
    };
  }
  const ratePerKwh = toDollarsPerKwh(parsed, unit);
  if (!Number.isFinite(ratePerKwh)) {
    return {
      ok: false,
      error: {
        field: 'electricityRate',
        message: 'Unable to use this electricity rate.',
      },
    };
  }
  return {
    ok: true,
    available: true,
    ratePerKwh,
    entered: raw.trim(),
    unit,
  };
}

export function validateHeatUpInputs(inputs: HeatUpInputs): HeatUpFieldError[] {
  const errors: HeatUpFieldError[] = [];

  const current = validateTemperature(
    'currentTemp',
    inputs.currentTemp,
    'current water temperature',
    inputs.tempUnit,
    false,
  );
  if (current.error) errors.push(current.error);

  const target = validateTemperature(
    'targetTemp',
    inputs.targetTemp,
    'target water temperature',
    inputs.tempUnit,
    true,
  );
  if (target.error) errors.push(target.error);

  if (inputs.mode === 'heater') {
    const capacity = validatePositiveCapacity(inputs.capacity, inputs.capacityUnit);
    if (capacity.error) errors.push(capacity.error);

    const heater = resolveHeaterKw(inputs.heaterPreset, inputs.customHeaterKw);
    if (heater.error) errors.push(heater.error);

    const loss = resolveHeatLossPercent(inputs.heatLossPreset, inputs.customHeatLossPercent);
    if (loss.error) errors.push(loss.error);

    const rate = validateOptionalElectricityRate(
      inputs.electricityRate,
      inputs.electricityRateUnit,
    );
    if (!rate.ok) errors.push(rate.error);
  } else {
    const rise = parseMeasurement(inputs.observedRise);
    if (rise === null) {
      if (!inputs.observedRise.trim()) {
        errors.push({
          field: 'observedRise',
          message: 'Enter the observed temperature increase.',
        });
      } else {
        errors.push({
          field: 'observedRise',
          message: 'Observed temperature increase must be a number.',
        });
      }
    } else if (rise < 0) {
      errors.push({
        field: 'observedRise',
        message: 'Observed temperature increase cannot be negative.',
      });
    }

    const duration = validateObservationDuration(
      inputs.observationDuration,
      inputs.observationUnit,
    );
    if (duration.error) errors.push(duration.error);
  }

  return errors;
}

function trimTrailingZeros(value: number): string {
  return String(Number(value.toFixed(4)));
}

function tempLabel(value: number, unit: TempUnit): string {
  return `${trimTrailingZeros(value)}°${unit}`;
}

/**
 * Ideal empty-loss heating hours for example tables, using the same utility path as the live calculator.
 */
export function exampleIdealHeatHours(
  capacityGallons: number,
  startF: number,
  targetF: number,
  heaterKw: number,
): number {
  const outcome = calculateHeatUpTime({
    mode: 'heater',
    capacity: String(capacityGallons),
    capacityUnit: 'gal',
    currentTemp: String(startF),
    targetTemp: String(targetF),
    tempUnit: 'F',
    heaterPreset: 'custom',
    customHeaterKw: String(heaterKw),
    heatLossPreset: 'none',
    customHeatLossPercent: '',
    observedRise: '',
    observationDuration: '',
    observationUnit: 'hours',
    electricityRate: '',
    electricityRateUnit: 'per_kwh',
  });
  if (!outcome.ok || outcome.result.idealHours === null) {
    throw new Error(
      `Unable to build example for ${capacityGallons} gal, ${startF}→${targetF}°F at ${heaterKw} kW`,
    );
  }
  return outcome.result.idealHours;
}

export function calculateHeatUpTime(inputs: HeatUpInputs):
  | { ok: true; result: HeatUpResult }
  | { ok: false; errors: HeatUpFieldError[] } {
  const errors = validateHeatUpInputs(inputs);
  if (errors.length > 0) return { ok: false, errors };

  const currentTemp = parseMeasurement(inputs.currentTemp)!;
  const targetTemp = parseMeasurement(inputs.targetTemp)!;
  const deltaDisplay = targetTemp - currentTemp;
  const deltaTempC = temperatureDifferenceInC(currentTemp, targetTemp, inputs.tempUnit);

  if (deltaTempC <= 0) {
    return {
      ok: true,
      result: {
        mode: inputs.mode,
        alreadyAtOrAboveTarget: true,
        tempUnit: inputs.tempUnit,
        capacityUnit: inputs.capacityUnit,
        currentTemp,
        targetTemp,
        deltaTempDisplay: deltaDisplay,
        deltaTempC,
        capacityValue: NaN,
        capacityLiters: NaN,
        thermalEnergyKWh: null,
        idealHours: null,
        estimatedHours: null,
        heatingRatePerHourDisplay: null,
        heaterKw: null,
        heatLossPercent: null,
        effectiveHeatingKw: null,
        estimatedHeaterEnergyKWh: null,
        estimatedHeaterCostUsd: null,
        electricityRateEntered: null,
        electricityRateUnit: null,
        durationLabel: null,
        idealDurationLabel: null,
        displayEstimatedTotalMinutes: null,
        displayIdealTotalMinutes: null,
        measuredObservationHours: null,
        measuredObservedRise: null,
        inputsSummary: {
          modeLabel:
            inputs.mode === 'heater' ? 'Heater power estimate' : 'Measured heating rate',
          capacityLabel: null,
          currentTempLabel: tempLabel(currentTemp, inputs.tempUnit),
          targetTempLabel: tempLabel(targetTemp, inputs.tempUnit),
          heaterLabel: null,
          heatLossLabel: null,
          measuredLabel: null,
        },
        troubleshootingHint: null,
      },
    };
  }

  if (inputs.mode === 'measured') {
    const observedRise = parseMeasurement(inputs.observedRise)!;
    const duration = validateObservationDuration(
      inputs.observationDuration,
      inputs.observationUnit,
    );
    if (duration.error) return { ok: false, errors: [duration.error] };

    if (observedRise === 0) {
      return {
        ok: false,
        errors: [
          {
            field: 'observedRise',
            message:
              'Observed temperature did not rise. If the water is not warming, see Why Is My Hot Tub Taking So Long to Heat Up? or Hot Tub Not Heating for safe checks.',
          },
        ],
      };
    }

    const ratePerHourDisplay = observedRise / duration.hours!;
    if (!Number.isFinite(ratePerHourDisplay) || ratePerHourDisplay <= 0) {
      return {
        ok: false,
        errors: [
          {
            field: 'observedRise',
            message:
              'Unable to calculate a heating rate from these measurements. If the spa is not warming, use the slow-heating or not-heating troubleshooting guides.',
          },
        ],
      };
    }

    const remainingHours = deltaDisplay / ratePerHourDisplay;
    if (!Number.isFinite(remainingHours) || remainingHours < 0) {
      return {
        ok: false,
        errors: [
          {
            field: 'observedRise',
            message: 'Unable to extrapolate remaining heat-up time from these measurements.',
          },
        ],
      };
    }

    const displayMinutes = Math.round(remainingHours * 60);
    const durationUnitLabel = inputs.observationUnit === 'hours' ? 'hours' : 'minutes';

    return {
      ok: true,
      result: {
        mode: 'measured',
        alreadyAtOrAboveTarget: false,
        tempUnit: inputs.tempUnit,
        capacityUnit: inputs.capacityUnit,
        currentTemp,
        targetTemp,
        deltaTempDisplay: deltaDisplay,
        deltaTempC,
        capacityValue: NaN,
        capacityLiters: NaN,
        thermalEnergyKWh: null,
        idealHours: null,
        estimatedHours: remainingHours,
        heatingRatePerHourDisplay: ratePerHourDisplay,
        heaterKw: null,
        heatLossPercent: null,
        effectiveHeatingKw: null,
        estimatedHeaterEnergyKWh: null,
        estimatedHeaterCostUsd: null,
        electricityRateEntered: null,
        electricityRateUnit: null,
        durationLabel: formatDurationFromHours(remainingHours),
        idealDurationLabel: null,
        displayEstimatedTotalMinutes: displayMinutes,
        displayIdealTotalMinutes: null,
        measuredObservationHours: duration.hours!,
        measuredObservedRise: observedRise,
        inputsSummary: {
          modeLabel: 'Measured heating rate',
          capacityLabel: null,
          currentTempLabel: tempLabel(currentTemp, inputs.tempUnit),
          targetTempLabel: tempLabel(targetTemp, inputs.tempUnit),
          heaterLabel: null,
          heatLossLabel: null,
          measuredLabel: `${trimTrailingZeros(observedRise)}°${inputs.tempUnit} in ${trimTrailingZeros(
            parseMeasurement(inputs.observationDuration)!,
          )} ${durationUnitLabel}`,
        },
        troubleshootingHint: null,
      },
    };
  }

  // Mode A — heater power
  const capacityValue = parseMeasurement(inputs.capacity)!;
  const capacityLiters = capacityToLiters(capacityValue, inputs.capacityUnit);
  const heater = resolveHeaterKw(inputs.heaterPreset, inputs.customHeaterKw);
  if (heater.error) return { ok: false, errors: [heater.error] };
  const loss = resolveHeatLossPercent(inputs.heatLossPreset, inputs.customHeatLossPercent);
  if (loss.error) return { ok: false, errors: [loss.error] };

  const energy = thermalEnergyKWh(capacityLiters, deltaTempC);
  const idealHours = idealHeatingHours(energy, heater.value);
  const effectiveKw = effectiveHeatingKw(heater.value, loss.value);
  if (!Number.isFinite(effectiveKw) || effectiveKw <= 0) {
    return {
      ok: false,
      errors: [
        {
          field: 'heatLoss',
          message: 'Effective heating power must remain greater than zero.',
        },
      ],
    };
  }
  const estimatedHours = energy / effectiveKw;
  const estimatedHeaterEnergyKWh = heater.value * estimatedHours;

  if (
    !Number.isFinite(energy) ||
    !Number.isFinite(idealHours) ||
    !Number.isFinite(estimatedHours) ||
    !Number.isFinite(estimatedHeaterEnergyKWh) ||
    energy < 0 ||
    idealHours < 0 ||
    estimatedHours < 0
  ) {
    return {
      ok: false,
      errors: [{ field: 'capacity', message: 'Unable to calculate with these values.' }],
    };
  }

  const rateOutcome = validateOptionalElectricityRate(
    inputs.electricityRate,
    inputs.electricityRateUnit,
  );
  if (!rateOutcome.ok) return { ok: false, errors: [rateOutcome.error] };

  let estimatedHeaterCostUsd: number | null = null;
  let electricityRateEntered: string | null = null;
  let electricityRateUnit: RateUnit | null = null;
  if (rateOutcome.available) {
    estimatedHeaterCostUsd =
      Math.round(estimatedHeaterEnergyKWh * rateOutcome.ratePerKwh * 100) / 100;
    electricityRateEntered = rateOutcome.entered;
    electricityRateUnit = rateOutcome.unit;
  }

  const heatingRatePerHourDisplay =
    inputs.tempUnit === 'C'
      ? deltaTempC / estimatedHours
      : deltaCToDeltaF(deltaTempC) / estimatedHours;

  const capacityLabel = `${trimTrailingZeros(capacityValue)} ${CAPACITY_UNIT_LABELS[
    inputs.capacityUnit
  ].toLowerCase()}`;
  const heaterLabel =
    inputs.heaterPreset === 'custom'
      ? `${trimTrailingZeros(heater.value)} kW (custom)`
      : HEATER_PRESET_LABELS[inputs.heaterPreset];
  const heatLossLabel =
    loss.value === 0
      ? HEAT_LOSS_PRESET_LABELS.none
      : `${trimTrailingZeros(loss.value)}% illustrative heat-loss assumption`;

  return {
    ok: true,
    result: {
      mode: 'heater',
      alreadyAtOrAboveTarget: false,
      tempUnit: inputs.tempUnit,
      capacityUnit: inputs.capacityUnit,
      currentTemp,
      targetTemp,
      deltaTempDisplay: deltaDisplay,
      deltaTempC,
      capacityValue,
      capacityLiters,
      thermalEnergyKWh: energy,
      idealHours,
      estimatedHours,
      heatingRatePerHourDisplay,
      heaterKw: heater.value,
      heatLossPercent: loss.value,
      effectiveHeatingKw: effectiveKw,
      estimatedHeaterEnergyKWh,
      estimatedHeaterCostUsd,
      electricityRateEntered,
      electricityRateUnit,
      durationLabel: formatDurationFromHours(estimatedHours),
      idealDurationLabel: formatDurationFromHours(idealHours),
      displayEstimatedTotalMinutes: Math.round(estimatedHours * 60),
      displayIdealTotalMinutes: Math.round(idealHours * 60),
      measuredObservationHours: null,
      measuredObservedRise: null,
      inputsSummary: {
        modeLabel: 'Heater power estimate',
        capacityLabel,
        currentTempLabel: tempLabel(currentTemp, inputs.tempUnit),
        targetTempLabel: tempLabel(targetTemp, inputs.tempUnit),
        heaterLabel,
        heatLossLabel,
        measuredLabel: null,
      },
      troubleshootingHint: null,
    },
  };
}
