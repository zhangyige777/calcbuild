import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcSelect from '../calculator-ui/CalcSelect';
import CalcResult from '../calculator-ui/CalcResult';
import type { CalcResultItem } from '../../utils/types';

const PROJECT_TYPES = [
  { value: 'basic', label: 'Basic Lawn Installation' },
  { value: 'standard', label: 'Standard Landscape' },
  { value: 'premium', label: 'Premium Hardscape' },
];

const COST_RATES: Record<string, { low: number; mid: number; high: number }> = {
  basic: { low: 5, mid: 7.5, high: 10 },
  standard: { low: 10, mid: 17.5, high: 25 },
  premium: { low: 25, mid: 37.5, high: 50 },
};

export default function LandscapeCostCalculator() {
  const [area, setArea] = useState('');
  const [projectType, setProjectType] = useState('basic');

  const debouncedArea = useDebouncedValue(area);
  const debouncedType = useDebouncedValue(projectType);

  const results: CalcResultItem[] = useMemo(() => {
    const areaNum = parseFloat(debouncedArea);
    if (!areaNum || areaNum <= 0) return [];

    const rates = COST_RATES[debouncedType] || COST_RATES.basic;
    const low = areaNum * rates.low;
    const mid = areaNum * rates.mid;
    const high = areaNum * rates.high;

    return [
      { label: 'Low Estimate', value: `$${low.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: '' },
      { label: 'Mid Estimate', value: `$${mid.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: '' },
      { label: 'High Estimate', value: `$${high.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: '' },
      { label: 'Cost per Sq Ft', value: `$${rates.low} – $${rates.high}`, unit: '/sq ft' },
    ];
  }, [debouncedArea, debouncedType]);

  const hasValidInput = parseFloat(area) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      <div className="space-y-4">
        <CalcInput
          label="Area"
          value={area}
          onChange={setArea}
          units={[{ value: 'sqft', label: 'sq ft' }]}
          unit="sqft"
          onUnitChange={() => {}}
          placeholder="e.g. 1000"
          required
          min={0}
          step={1}
        />
        <CalcSelect
          label="Project Type"
          value={projectType}
          onChange={setProjectType}
          options={PROJECT_TYPES}
          required
        />
      </div>

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
          onClick={() => { setArea(''); setProjectType('basic'); }}
          className="px-4 py-2.5 text-[1.4rem] text-[#949494] dark:text-[#D4D4D4] hover:text-[#444] dark:hover:text-[#F5F5F5] hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded-[16px] transition-colors"
        >
          Reset
        </button>
      </div>

      <CalcResult results={results} visible={hasValidInput} />
    </div>
  );
}
