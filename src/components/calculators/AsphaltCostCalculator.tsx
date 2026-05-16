import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import { asphalt, conversions } from '../../utils/formulas';
import type { CalcResultItem } from '../../utils/types';

export default function AsphaltCostCalculator() {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');
  const [pricePerTon, setPricePerTon] = useState('');

  const debouncedLength = useDebouncedValue(length);
  const debouncedWidth = useDebouncedValue(width);
  const debouncedDepth = useDebouncedValue(depth);
  const debouncedPrice = useDebouncedValue(pricePerTon);

  const results: CalcResultItem[] = useMemo(() => {
    const l = parseFloat(debouncedLength);
    const w = parseFloat(debouncedWidth);
    const d = parseFloat(debouncedDepth);
    const p = parseFloat(debouncedPrice);
    if (!l || !w || !d || !p || l <= 0 || w <= 0 || d <= 0 || p <= 0) return [];

    const depthFt = conversions.inchesToFeet(d);
    const cubicFeet = asphalt.cubicFeet(l, w, depthFt);
    const cubicYards = asphalt.cubicYards(cubicFeet);
    const tons = asphalt.tons(cubicYards);
    const totalCost = tons * p;

    return [
      { label: 'Tons Needed', value: tons.toFixed(2), unit: 'tons' },
      { label: 'Cubic Yards', value: cubicYards.toFixed(2), unit: 'yd³' },
      { label: 'Total Cost', value: '$' + totalCost.toFixed(2), unit: '' },
    ];
  }, [debouncedLength, debouncedWidth, debouncedDepth, debouncedPrice]);

  const hasValidInput = parseFloat(length) > 0 && parseFloat(width) > 0 && parseFloat(depth) > 0 && parseFloat(pricePerTon) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label="Length"
          value={length}
          onChange={setLength}
          unit="ft"
          placeholder="e.g. 50"
          required
          min={0}
          step={0.1}
        />
        <CalcInput
          label="Width"
          value={width}
          onChange={setWidth}
          unit="ft"
          placeholder="e.g. 20"
          required
          min={0}
          step={0.1}
        />
        <CalcInput
          label="Depth"
          value={depth}
          onChange={setDepth}
          unit="in"
          placeholder="e.g. 3"
          required
          min={0}
          step={0.1}
        />
        <CalcInput
          label="Price per Ton"
          value={pricePerTon}
          onChange={setPricePerTon}
          unit="$"
          placeholder="e.g. 150"
          required
          min={0}
          step={1}
        />
      </div>

      {/* Calculate + Reset */}
      <div className="flex items-center gap-3 mt-5">
        <button
          type="button"
          onClick={() => { /* auto-calc */ }}
          className="flex-1 py-2.5 bg-[#4D7C0F] text-white font-semibold rounded-[16px] hover:bg-[#3F6212] transition-colors text-[1.6rem]"
        >
          Calculate
        </button>
        <button
          type="button"
          onClick={() => { setLength(''); setWidth(''); setDepth(''); setPricePerTon(''); }}
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
