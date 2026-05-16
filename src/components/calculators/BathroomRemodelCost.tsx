import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcSelect from '../calculator-ui/CalcSelect';
import CalcResult from '../calculator-ui/CalcResult';
import type { CalcResultItem } from '../../utils/types';

const QUALITY_TIERS = [
  { value: 'budget', label: 'Budget' },
  { value: 'standard', label: 'Standard' },
  { value: 'upscale', label: 'Upscale' },
];

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

const COST_RATES: Record<string, { low: number; mid: number; high: number }> = {
  budget: { low: 70, mid: 95, high: 120 },
  standard: { low: 120, mid: 185, high: 250 },
  upscale: { low: 250, mid: 325, high: 400 },
};

const TUB_SURCHARGE = 0.15; // 15% additional for tub/shower replacement

export default function BathroomRemodelCost() {
  const [bathroomSize, setBathroomSize] = useState('');
  const [qualityTier, setQualityTier] = useState('standard');
  const [tubReplacement, setTubReplacement] = useState('no');

  const debouncedSize = useDebouncedValue(bathroomSize);
  const debouncedTier = useDebouncedValue(qualityTier);
  const debouncedTub = useDebouncedValue(tubReplacement);

  const results: CalcResultItem[] = useMemo(() => {
    const size = parseFloat(debouncedSize);
    if (!size || size <= 0) return [];

    const rates = COST_RATES[debouncedTier] || COST_RATES.standard;
    const multiplier = debouncedTub === 'yes' ? 1 + TUB_SURCHARGE : 1;

    const low = size * rates.low * multiplier;
    const mid = size * rates.mid * multiplier;
    const high = size * rates.high * multiplier;

    // Breakdown percentages (approximate industry averages)
    const fixturesPct = 0.30;
    const laborPct = 0.40;
    const materialsPct = 0.30;

    return [
      { label: 'Low Estimate', value: `$${low.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: '' },
      { label: 'Mid Estimate', value: `$${mid.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: '' },
      { label: 'High Estimate', value: `$${high.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: '' },
      { label: 'Fixtures', value: `$${(mid * fixturesPct).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: '~30%' },
      { label: 'Labor', value: `$${(mid * laborPct).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: '~40%' },
      { label: 'Materials', value: `$${(mid * materialsPct).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: '~30%' },
    ];
  }, [debouncedSize, debouncedTier, debouncedTub]);

  const hasValidInput = parseFloat(bathroomSize) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      <div className="space-y-4">
        <CalcInput
          label="Bathroom Size"
          value={bathroomSize}
          onChange={setBathroomSize}
          units={[{ value: 'sqft', label: 'sq ft' }]}
          unit="sqft"
          onUnitChange={() => {}}
          placeholder="e.g. 50"
          required
          min={0}
          step={1}
        />
        <CalcSelect
          label="Quality Tier"
          value={qualityTier}
          onChange={setQualityTier}
          options={QUALITY_TIERS}
          required
        />
        <CalcSelect
          label="Tub / Shower Replacement"
          value={tubReplacement}
          onChange={setTubReplacement}
          options={YES_NO}
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
          onClick={() => { setBathroomSize(''); setQualityTier('standard'); setTubReplacement('no'); }}
          className="px-4 py-2.5 text-[1.4rem] text-[#949494] dark:text-[#D4D4D4] hover:text-[#444] dark:hover:text-[#F5F5F5] hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded-[16px] transition-colors"
        >
          Reset
        </button>
      </div>

      <CalcResult results={results} visible={hasValidInput} />
    </div>
  );
}
