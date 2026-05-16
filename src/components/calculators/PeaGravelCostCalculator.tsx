import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import type { CalcResultItem } from '../../utils/types';

const UNIT_OPTIONS = [
  { value: 'cubic-yards', label: 'Cubic Yards' },
  { value: 'tons', label: 'Tons' },
];

export default function PeaGravelCostCalculator() {
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('cubic-yards');
  const [pricePerUnit, setPricePerUnit] = useState('');

  const debouncedQuantity = useDebouncedValue(quantity);
  const debouncedPrice = useDebouncedValue(pricePerUnit);

  const results: CalcResultItem[] = useMemo(() => {
    const q = parseFloat(debouncedQuantity);
    const p = parseFloat(debouncedPrice);
    if (!q || !p || q <= 0 || p <= 0) return [];

    const density = 1.3; // tons per cubic yard for pea gravel
    const totalCost = q * p;

    let costPerCubicYard: number;
    let costPerTon: number;

    if (unit === 'cubic-yards') {
      costPerCubicYard = p;
      costPerTon = p / density;
    } else {
      costPerTon = p;
      costPerCubicYard = p * density;
    }

    return [
      { label: 'Total Cost', value: '$' + totalCost.toFixed(2), unit: '' },
      { label: 'Cost per Cubic Yard', value: '$' + costPerCubicYard.toFixed(2), unit: '/yd³' },
      { label: 'Cost per Ton', value: '$' + costPerTon.toFixed(2), unit: '/ton' },
    ];
  }, [debouncedQuantity, debouncedPrice, unit]);

  const hasValidInput = parseFloat(quantity) > 0 && parseFloat(pricePerUnit) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label="Quantity"
          value={quantity}
          onChange={setQuantity}
          units={UNIT_OPTIONS}
          unit={unit}
          onUnitChange={setUnit}
          placeholder="e.g. 5"
          required
          min={0}
          step={0.1}
        />
        <CalcInput
          label="Price per Unit"
          value={pricePerUnit}
          onChange={setPricePerUnit}
          units={[{ value: '$', label: '$' }]}
          unit="$"
          onUnitChange={() => {}}
          placeholder="e.g. 50"
          required
          min={0}
          step={0.01}
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
          onClick={() => { setQuantity(''); setUnit('cubic-yards'); setPricePerUnit(''); }}
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
