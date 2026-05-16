import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import { asphalt, conversions } from '../../utils/formulas';
import type { CalcResultItem } from '../../utils/types';

export default function AsphaltSqYardsToTons() {
  const [squareYards, setSquareYards] = useState('');
  const [depth, setDepth] = useState('');

  const debouncedSqYards = useDebouncedValue(squareYards);
  const debouncedDepth = useDebouncedValue(depth);

  const results: CalcResultItem[] = useMemo(() => {
    const sy = parseFloat(debouncedSqYards);
    const d = parseFloat(debouncedDepth);
    if (!sy || !d || sy <= 0 || d <= 0) return [];

    const tons = asphalt.sqYardsToTons(sy, d);
    const cubicYards = (sy * d) / 324;

    return [
      { label: 'Tons', value: tons.toFixed(2), unit: 'tons' },
      { label: 'Cubic Yards', value: cubicYards.toFixed(2), unit: 'yd³' },
    ];
  }, [debouncedSqYards, debouncedDepth]);

  const hasValidInput = parseFloat(squareYards) > 0 && parseFloat(depth) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label="Square Yards"
          value={squareYards}
          onChange={setSquareYards}
          unit="sq yd"
          placeholder="e.g. 100"
          required
          min={0}
          step={0.1}
        />
        <CalcInput
          label="Depth"
          value={depth}
          onChange={setDepth}
          unit="in"
          placeholder="e.g. 2"
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
          className="flex-1 py-2.5 bg-[#4D7C0F] text-white font-semibold rounded-[16px] hover:bg-[#3F6212] transition-colors text-[1.6rem]"
        >
          Calculate
        </button>
        <button
          type="button"
          onClick={() => { setSquareYards(''); setDepth(''); }}
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
