import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcSelect from '../calculator-ui/CalcSelect';
import CalcResult from '../calculator-ui/CalcResult';
import type { CalcResultItem } from '../../utils/types';

const SEVERITY_LEVELS = [
  { value: 'surface', label: 'Surface Mold' },
  { value: 'moderate', label: 'Moderate Growth' },
  { value: 'severe', label: 'Severe Infestation' },
];

const LOCATIONS = [
  { value: 'basement', label: 'Basement' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'attic', label: 'Attic' },
  { value: 'other', label: 'Other' },
];

const COST_RATES: Record<string, { low: number; mid: number; high: number }> = {
  surface: { low: 10, mid: 12.5, high: 15 },
  moderate: { low: 15, mid: 22.5, high: 30 },
  severe: { low: 30, mid: 40, high: 50 },
};

const LOCATION_MULTIPLIER: Record<string, number> = {
  basement: 1.0,
  bathroom: 0.95,
  attic: 1.1,
  other: 1.0,
};

export default function MoldRemediationCost() {
  const [affectedArea, setAffectedArea] = useState('');
  const [severity, setSeverity] = useState('surface');
  const [location, setLocation] = useState('basement');

  const debouncedArea = useDebouncedValue(affectedArea);
  const debouncedSeverity = useDebouncedValue(severity);
  const debouncedLocation = useDebouncedValue(location);

  const results: CalcResultItem[] = useMemo(() => {
    const areaNum = parseFloat(debouncedArea);
    if (!areaNum || areaNum <= 0) return [];

    const rates = COST_RATES[debouncedSeverity] || COST_RATES.surface;
    const locMult = LOCATION_MULTIPLIER[debouncedLocation] || 1.0;

    const low = areaNum * rates.low * locMult;
    const mid = areaNum * rates.mid * locMult;
    const high = areaNum * rates.high * locMult;

    // Breakdown: testing ~10%, removal ~55%, repair ~35%
    const testingPct = 0.10;
    const removalPct = 0.55;
    const repairPct = 0.35;

    return [
      { label: 'Low Estimate', value: `$${low.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: '' },
      { label: 'Mid Estimate', value: `$${mid.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: '' },
      { label: 'High Estimate', value: `$${high.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: '' },
      { label: 'Testing & Inspection', value: `$${(mid * testingPct).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: '~10%' },
      { label: 'Mold Removal', value: `$${(mid * removalPct).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: '~55%' },
      { label: 'Repairs & Restoration', value: `$${(mid * repairPct).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, unit: '~35%' },
    ];
  }, [debouncedArea, debouncedSeverity, debouncedLocation]);

  const hasValidInput = parseFloat(affectedArea) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      <div className="space-y-4">
        <CalcInput
          label="Affected Area"
          value={affectedArea}
          onChange={setAffectedArea}
          units={[{ value: 'sqft', label: 'sq ft' }]}
          unit="sqft"
          onUnitChange={() => {}}
          placeholder="e.g. 100"
          required
          min={0}
          step={1}
        />
        <CalcSelect
          label="Mold Severity"
          value={severity}
          onChange={setSeverity}
          options={SEVERITY_LEVELS}
          required
        />
        <CalcSelect
          label="Location"
          value={location}
          onChange={setLocation}
          options={LOCATIONS}
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
          onClick={() => { setAffectedArea(''); setSeverity('surface'); setLocation('basement'); }}
          className="px-4 py-2.5 text-[1.4rem] text-[#949494] dark:text-[#D4D4D4] hover:text-[#444] dark:hover:text-[#F5F5F5] hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded-[16px] transition-colors"
        >
          Reset
        </button>
      </div>

      <CalcResult results={results} visible={hasValidInput} />
    </div>
  );
}
