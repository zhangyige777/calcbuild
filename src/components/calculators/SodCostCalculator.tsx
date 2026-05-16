import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import { sod } from '../../utils/formulas';
import type { CalcResultItem } from '../../utils/types';

export default function SodCostCalculator() {
  const [area, setArea] = useState('');
  const [pricePerPallet, setPricePerPallet] = useState('');

  const debouncedArea = useDebouncedValue(area);
  const debouncedPrice = useDebouncedValue(pricePerPallet);

  const results: CalcResultItem[] = useMemo(() => {
    const a = parseFloat(debouncedArea);
    const p = parseFloat(debouncedPrice);
    if (!a || a <= 0) return [];

    const palletsNeeded = sod.pallets(a);
    const ceilPallets = Math.ceil(palletsNeeded);
    const weight = sod.palletWeight(ceilPallets);

    const resultItems: CalcResultItem[] = [
      { label: 'Pallets Needed', value: ceilPallets.toString(), unit: `pallets (${palletsNeeded.toFixed(2)})` },
      { label: 'Estimated Weight', value: weight.toLocaleString(), unit: 'lbs' },
    ];

    if (p && p > 0) {
      const totalCost = ceilPallets * p;
      const costPerSqFt = totalCost / a;
      resultItems.splice(1, 0,
        { label: 'Total Cost', value: `$${totalCost.toFixed(2)}`, unit: '' },
        { label: 'Cost per sq ft', value: `$${costPerSqFt.toFixed(2)}`, unit: '' },
      );
    }

    return resultItems;
  }, [debouncedArea, debouncedPrice]);

  const hasValidInput = parseFloat(area) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label="Area"
          value={area}
          onChange={setArea}
          placeholder="e.g. 1000"
          required
          min={0}
          step={1}
        />
        <CalcInput
          label="Price per Pallet"
          value={pricePerPallet}
          onChange={setPricePerPallet}
          placeholder="e.g. 150"
          min={0}
          step={0.01}
        />
      </div>

      {/* Calculate + Reset */}
      <div className="flex items-center gap-3 mt-5">
        <button
          type="button"
          onClick={() => { /* auto-calc */ }}
          className="flex-1 py-2.5 bg-[#0F766E] text-white font-semibold rounded-[16px] hover:bg-[#0D6B64] transition-colors text-[1.6rem]"
        >
          Calculate
        </button>
        <button
          type="button"
          onClick={() => { setArea(''); setPricePerPallet(''); }}
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
