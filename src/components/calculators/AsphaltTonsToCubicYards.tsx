import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import { asphalt, conversions } from '../../utils/formulas';
import type { CalcResultItem } from '../../utils/types';

const MODE_OPTIONS = [
  { value: 'tons-to-cy', label: 'Tons → Cubic Yards' },
  { value: 'cy-to-tons', label: 'Cubic Yards → Tons' },
];

export default function AsphaltTonsToCubicYards() {
  const [value, setValue] = useState('');
  const [mode, setMode] = useState('tons-to-cy');

  const debouncedValue = useDebouncedValue(value);

  const results: CalcResultItem[] = useMemo(() => {
    const v = parseFloat(debouncedValue);
    if (!v || v <= 0) return [];

    if (mode === 'tons-to-cy') {
      const cubicYards = v / 1.4;
      return [
        { label: 'Tons', value: v.toFixed(2), unit: 'tons' },
        { label: 'Cubic Yards', value: cubicYards.toFixed(2), unit: 'yd³' },
      ];
    } else {
      const tons = v * 1.4;
      return [
        { label: 'Cubic Yards', value: v.toFixed(2), unit: 'yd³' },
        { label: 'Tons', value: tons.toFixed(2), unit: 'tons' },
      ];
    }
  }, [debouncedValue, mode]);

  const hasValidInput = parseFloat(value) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Mode toggle */}
      <div className="flex justify-center mb-5">
        <div className="flex rounded-[16px] border border-[#D4D4D4] dark:border-[#525252] overflow-hidden">
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMode(opt.value)}
              className={`px-4 py-2 text-[1.3rem] font-medium transition-colors ${
                mode === opt.value
                  ? 'bg-[#4D7C0F] text-white'
                  : 'bg-white dark:bg-[#333] text-[#737373] dark:text-[#D4D4D4] hover:bg-[#F5F5F5] dark:hover:bg-[#404040]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label={mode === 'tons-to-cy' ? 'Tons' : 'Cubic Yards'}
          value={value}
          onChange={setValue}
          unit={mode === 'tons-to-cy' ? 'tons' : 'yd³'}
          placeholder={mode === 'tons-to-cy' ? 'e.g. 10' : 'e.g. 7'}
          required
          min={0}
          step={0.1}
        />
      </div>

      {/* Reset */}
      <div className="flex items-center gap-3 mt-5">
        <button
          type="button"
          onClick={() => { setValue(''); }}
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
