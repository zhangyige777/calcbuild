import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import { sod } from '../../utils/formulas';
import type { CalcResultItem } from '../../utils/types';

export default function SodCalculator() {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');

  const debouncedLength = useDebouncedValue(length);
  const debouncedWidth = useDebouncedValue(width);

  const results: CalcResultItem[] = useMemo(() => {
    const l = parseFloat(debouncedLength);
    const w = parseFloat(debouncedWidth);
    if (!l || !w || l <= 0 || w <= 0) return [];

    const totalArea = l * w;
    const pallets = sod.pallets(totalArea);
    const rolls = sod.rolls(totalArea);
    const pieces = sod.pieces(totalArea);
    const weight = sod.palletWeight(Math.ceil(pallets));

    return [
      { label: 'Total Area', value: totalArea.toFixed(2), unit: 'sq ft' },
      { label: 'Pallets Needed', value: Math.ceil(pallets).toString(), unit: `pallets (${pallets.toFixed(2)})` },
      { label: 'Rolls Needed', value: Math.ceil(rolls).toString(), unit: `rolls (${rolls.toFixed(2)})` },
      { label: 'Pieces Needed', value: Math.ceil(pieces).toString(), unit: `pieces (${pieces.toFixed(2)})` },
      { label: 'Estimated Weight', value: weight.toLocaleString(), unit: 'lbs' },
    ];
  }, [debouncedLength, debouncedWidth]);

  const hasValidInput = parseFloat(length) > 0 && parseFloat(width) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label="Length"
          value={length}
          onChange={setLength}
          placeholder="e.g. 50"
          required
          min={0}
          step={0.1}
        />
        <CalcInput
          label="Width"
          value={width}
          onChange={setWidth}
          placeholder="e.g. 30"
          required
          min={0}
          step={0.1}
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
          onClick={() => { setLength(''); setWidth(''); }}
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
