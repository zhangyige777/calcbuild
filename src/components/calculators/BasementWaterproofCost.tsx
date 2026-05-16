import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcSelect from '../calculator-ui/CalcSelect';
import CalcResult from '../calculator-ui/CalcResult';
import type { CalcResultItem } from '../../utils/types';

const METHODS = [
  { value: 'interior', label: 'Interior Sealant' },
  { value: 'exterior', label: 'Exterior Waterproofing' },
  { value: 'french', label: 'French Drain' },
];

const COST_RATES: Record<string, { low: number; mid: number; high: number; timeline: string }> = {
  interior: { low: 3, mid: 6.5, high: 10, timeline: '1–3 days' },
  exterior: { low: 50, mid: 75, high: 100, timeline: '3–7 days' },
  french: { low: 40, mid: 60, high: 80, timeline: '2–5 days' },
};

export default function BasementWaterproofCost() {
  const [perimeter, setPerimeter] = useState('');
  const [method, setMethod] = useState('interior');

  const debouncedPerimeter = useDebouncedValue(perimeter);
  const debouncedMethod = useDebouncedValue(method);

  const results: CalcResultItem[] = useMemo(() => {
    const perim = parseFloat(debouncedPerimeter);
    if (!perim || perim <= 0) return [];

    const rates = COST_RATES[debouncedMethod] || COST_RATES.interior;
    const low = perim * rates.low;
    const mid = perim * rates.mid;
    const high = perim * rates.high;

    // Breakdown percentages
    const materialsPct = debouncedMethod === 'interior' ? 0.25 : 0.35;
    const laborPct = debouncedMethod === 'interior' ? 0.55 : 0.45;
    const miscPct = 1 - materialsPct - laborPct;

    return [
      { label: 'Low Estimate', value: `$${low.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: '' },
      { label: 'Mid Estimate', value: `$${mid.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: '' },
      { label: 'High Estimate', value: `$${high.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: '' },
      { label: 'Materials', value: `$${(mid * materialsPct).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: `${(materialsPct * 100).toFixed(0)}%` },
      { label: 'Labor', value: `$${(mid * laborPct).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: `${(laborPct * 100).toFixed(0)}%` },
      { label: 'Misc & Cleanup', value: `$${(mid * miscPct).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: `${(miscPct * 100).toFixed(0)}%` },
      { label: 'Estimated Timeline', value: rates.timeline, unit: '' },
    ];
  }, [debouncedPerimeter, debouncedMethod]);

  const hasValidInput = parseFloat(perimeter) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      <div className="space-y-4">
        <CalcInput
          label="Basement Perimeter"
          value={perimeter}
          onChange={setPerimeter}
          units={[{ value: 'ft', label: 'ft' }]}
          unit="ft"
          onUnitChange={() => {}}
          placeholder="e.g. 120"
          required
          min={0}
          step={1}
        />
        <CalcSelect
          label="Waterproofing Method"
          value={method}
          onChange={setMethod}
          options={METHODS}
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
          onClick={() => { setPerimeter(''); setMethod('interior'); }}
          className="px-4 py-2.5 text-[1.4rem] text-[#949494] dark:text-[#D4D4D4] hover:text-[#444] dark:hover:text-[#F5F5F5] hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded-[16px] transition-colors"
        >
          Reset
        </button>
      </div>

      <CalcResult results={results} visible={hasValidInput} />
    </div>
  );
}
