import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcSelect from '../calculator-ui/CalcSelect';
import CalcResult from '../calculator-ui/CalcResult';
import type { CalcResultItem } from '../../utils/types';

const WINDOW_TYPE_OPTIONS = [
  { value: 'standard_bay', label: 'Standard Bay' },
  { value: 'bow', label: 'Bow Window' },
  { value: 'garden', label: 'Garden Window' },
];

const MATERIAL_OPTIONS = [
  { value: 'vinyl', label: 'Vinyl' },
  { value: 'wood', label: 'Wood' },
  { value: 'fiberglass', label: 'Fiberglass' },
];

// Base cost ranges by window type
const WINDOW_BASE_COST: Record<string, { low: number; high: number }> = {
  standard_bay: { low: 1000, high: 3500 },
  bow: { low: 1500, high: 4500 },
  garden: { low: 2000, high: 5000 },
};

// Material cost multiplier
const MATERIAL_MULTIPLIER: Record<string, number> = {
  vinyl: 1.0,
  wood: 1.4,
  fiberglass: 1.25,
};

// Width factor: base costs assume ~6ft, scale proportionally
const BASE_WIDTH = 6;

// Installation adds 50–100% of window cost
const INSTALLATION_LOW = 0.5;
const INSTALLATION_HIGH = 1.0;

const fmt = (n: number) =>
  '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 });

export default function BayWindowCost() {
  const [windowWidth, setWindowWidth] = useState('');
  const [windowType, setWindowType] = useState('standard_bay');
  const [material, setMaterial] = useState('vinyl');

  const debouncedWidth = useDebouncedValue(windowWidth);
  const debouncedType = useDebouncedValue(windowType);
  const debouncedMaterial = useDebouncedValue(material);

  const results: CalcResultItem[] = useMemo(() => {
    const width = parseFloat(debouncedWidth);
    if (!width || width <= 0) return [];

    const baseCost = WINDOW_BASE_COST[debouncedType] || WINDOW_BASE_COST.standard_bay;
    const matMult = MATERIAL_MULTIPLIER[debouncedMaterial] || 1.0;

    // Scale base cost by width relative to standard 6ft
    const widthFactor = width / BASE_WIDTH;

    const windowLow = baseCost.low * matMult * widthFactor;
    const windowHigh = baseCost.high * matMult * widthFactor;

    const installLow = windowLow * INSTALLATION_LOW;
    const installHigh = windowHigh * INSTALLATION_HIGH;

    const totalLow = windowLow + installLow;
    const totalHigh = windowHigh + installHigh;

    return [
      {
        label: 'Window Cost',
        value: `${fmt(windowLow)} – ${fmt(windowHigh)}`,
        unit: '',
      },
      {
        label: 'Installation Cost',
        value: `${fmt(installLow)} – ${fmt(installHigh)}`,
        unit: '',
      },
      {
        label: 'Total Estimate',
        value: `${fmt(totalLow)} – ${fmt(totalHigh)}`,
        unit: '',
      },
    ];
  }, [debouncedWidth, debouncedType, debouncedMaterial]);

  const hasValidInput = parseFloat(windowWidth) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label="Window Width"
          value={windowWidth}
          onChange={setWindowWidth}
          unit="ft"
          placeholder="e.g. 6"
          required
          min={0}
          step={0.5}
        />
        <CalcSelect
          label="Window Type"
          value={windowType}
          onChange={setWindowType}
          options={WINDOW_TYPE_OPTIONS}
          required
        />
        <CalcSelect
          label="Material"
          value={material}
          onChange={setMaterial}
          options={MATERIAL_OPTIONS}
          required
        />
      </div>

      {/* Calculate + Reset */}
      <div className="flex items-center gap-3 mt-5">
        <button
          type="button"
          onClick={() => { /* auto-calc */ }}
          className="flex-1 py-2.5 bg-[#0F766E] text-white font-semibold rounded-[16px] hover:bg-[#0D6B63] transition-colors text-[1.6rem]"
        >
          Calculate
        </button>
        <button
          type="button"
          onClick={() => { setWindowWidth(''); setWindowType('standard_bay'); setMaterial('vinyl'); }}
          className="px-4 py-2.5 text-[1.4rem] text-[#949494] dark:text-[#D4D4D4] hover:text-[#444] dark:hover:text-[#F5F5F5] hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded-[16px] transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Results */}
      <CalcResult results={results} visible={hasValidInput} />
    </div>
  );
}
