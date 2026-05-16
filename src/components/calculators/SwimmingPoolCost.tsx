import { useState, useMemo } from 'react';
import CalcSelect from '../calculator-ui/CalcSelect';
import CalcResult from '../calculator-ui/CalcResult';
import type { CalcResultItem } from '../../utils/types';
import { useDebouncedValue } from '../calculator-ui/CalcInput';

const POOL_TYPE_OPTIONS = [
  { value: 'concrete', label: 'Inground Concrete' },
  { value: 'fiberglass', label: 'Inground Fiberglass' },
  { value: 'above_ground', label: 'Above Ground' },
];

const POOL_SIZE_OPTIONS = [
  { value: 'small', label: 'Small (12×24 ft)' },
  { value: 'medium', label: 'Medium (16×32 ft)' },
  { value: 'large', label: 'Large (20×40 ft)' },
];

const POOL_SIZES: Record<string, { sqft: number; label: string }> = {
  small: { sqft: 12 * 24, label: '12×24' },
  medium: { sqft: 16 * 32, label: '16×32' },
  large: { sqft: 20 * 40, label: '20×40' },
};

// Cost per sq ft ranges
const CONCRETE_COST = { low: 50, mid: 75, high: 100 };
const FIBERGLASS_COST = { low: 40, mid: 57, high: 75 };

// Above ground flat rates
const ABOVE_GROUND_COST = { low: 1500, mid: 3250, high: 5000 };

// Monthly maintenance
const MAINTENANCE: Record<string, { low: number; high: number }> = {
  concrete: { low: 150, high: 400 },
  fiberglass: { low: 100, high: 300 },
  above_ground: { low: 50, high: 150 },
};

const fmt = (n: number) =>
  '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 });

export default function SwimmingPoolCost() {
  const [poolType, setPoolType] = useState('concrete');
  const [poolSize, setPoolSize] = useState('medium');

  const debouncedPoolType = useDebouncedValue(poolType);
  const debouncedPoolSize = useDebouncedValue(poolSize);

  const results: CalcResultItem[] = useMemo(() => {
    const size = POOL_SIZES[debouncedPoolSize] || POOL_SIZES.medium;

    let lowEst: number, midEst: number, highEst: number;

    if (debouncedPoolType === 'above_ground') {
      lowEst = ABOVE_GROUND_COST.low;
      midEst = ABOVE_GROUND_COST.mid;
      highEst = ABOVE_GROUND_COST.high;
    } else {
      const rates =
        debouncedPoolType === 'fiberglass' ? FIBERGLASS_COST : CONCRETE_COST;
      lowEst = size.sqft * rates.low;
      midEst = size.sqft * rates.mid;
      highEst = size.sqft * rates.high;
    }

    const maint = MAINTENANCE[debouncedPoolType] || MAINTENANCE.concrete;

    return [
      { label: 'Low Estimate', value: fmt(lowEst), unit: '' },
      { label: 'Mid Estimate', value: fmt(midEst), unit: '' },
      { label: 'High Estimate', value: fmt(highEst), unit: '' },
      {
        label: 'Monthly Maintenance',
        value: `${fmt(maint.low)} – ${fmt(maint.high)}`,
        unit: '/month',
      },
    ];
  }, [debouncedPoolType, debouncedPoolSize]);

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcSelect
          label="Pool Type"
          value={poolType}
          onChange={setPoolType}
          options={POOL_TYPE_OPTIONS}
          required
        />
        <CalcSelect
          label="Pool Size"
          value={poolSize}
          onChange={setPoolSize}
          options={POOL_SIZE_OPTIONS}
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
          onClick={() => { setPoolType('concrete'); setPoolSize('medium'); }}
          className="px-4 py-2.5 text-[1.4rem] text-[#949494] dark:text-[#D4D4D4] hover:text-[#444] dark:hover:text-[#F5F5F5] hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded-[16px] transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Results */}
      <CalcResult results={results} visible={true} />
    </div>
  );
}
