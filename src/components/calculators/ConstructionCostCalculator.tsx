import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcSelect from '../calculator-ui/CalcSelect';
import CalcResult from '../calculator-ui/CalcResult';
import type { CalcResultItem } from '../../utils/types';

const QUALITY_OPTIONS = [
  { value: 'economy', label: 'Economy' },
  { value: 'standard', label: 'Standard' },
  { value: 'custom', label: 'Custom' },
  { value: 'luxury', label: 'Luxury' },
];

const BUILDING_TYPE_OPTIONS = [
  { value: 'house', label: 'House' },
  { value: 'garage', label: 'Garage' },
  { value: 'addition', label: 'Addition' },
];

// Cost per sq ft ranges by quality
const QUALITY_COSTS: Record<string, { low: number; high: number }> = {
  economy: { low: 100, high: 150 },
  standard: { low: 150, high: 250 },
  custom: { low: 250, high: 400 },
  luxury: { low: 400, high: 600 },
};

// Multipliers by building type
const TYPE_MULTIPLIER: Record<string, number> = {
  house: 1.0,
  garage: 0.6,
  addition: 0.85,
};

// Breakdown percentages (materials, labor, permits)
const BREAKDOWN = {
  materials: 0.50,
  labor: 0.40,
  permits: 0.10,
};

const fmt = (n: number) =>
  '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 });

export default function ConstructionCostCalculator() {
  const [buildingSize, setBuildingSize] = useState('');
  const [quality, setQuality] = useState('standard');
  const [buildingType, setBuildingType] = useState('house');

  const debouncedSize = useDebouncedValue(buildingSize);
  const debouncedQuality = useDebouncedValue(quality);
  const debouncedType = useDebouncedValue(buildingType);

  const results: CalcResultItem[] = useMemo(() => {
    const size = parseFloat(debouncedSize);
    if (!size || size <= 0) return [];

    const costs = QUALITY_COSTS[debouncedQuality] || QUALITY_COSTS.standard;
    const mult = TYPE_MULTIPLIER[debouncedType] || 1.0;

    const totalLow = size * costs.low * mult;
    const totalHigh = size * costs.high * mult;

    const avgCost = (totalLow + totalHigh) / 2;
    const avgPerSqFt = avgCost / size;

    const materialsCost = avgCost * BREAKDOWN.materials;
    const laborCost = avgCost * BREAKDOWN.labor;
    const permitsCost = avgCost * BREAKDOWN.permits;

    return [
      {
        label: 'Total Cost Range',
        value: `${fmt(totalLow)} – ${fmt(totalHigh)}`,
        unit: '',
      },
      {
        label: 'Cost per Sq Ft',
        value: `${fmt(costs.low * mult)} – ${fmt(costs.high * mult)}`,
        unit: '/sq ft',
      },
      { label: 'Materials (50%)', value: fmt(materialsCost), unit: '' },
      { label: 'Labor (40%)', value: fmt(laborCost), unit: '' },
      { label: 'Permits & Fees (10%)', value: fmt(permitsCost), unit: '' },
    ];
  }, [debouncedSize, debouncedQuality, debouncedType]);

  const hasValidInput = parseFloat(buildingSize) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label="Building Size"
          value={buildingSize}
          onChange={setBuildingSize}
          unit="sq ft"
          placeholder="e.g. 2000"
          required
          min={0}
          step={1}
        />
        <CalcSelect
          label="Quality Level"
          value={quality}
          onChange={setQuality}
          options={QUALITY_OPTIONS}
          required
        />
        <CalcSelect
          label="Building Type"
          value={buildingType}
          onChange={setBuildingType}
          options={BUILDING_TYPE_OPTIONS}
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
          onClick={() => { setBuildingSize(''); setQuality('standard'); setBuildingType('house'); }}
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
