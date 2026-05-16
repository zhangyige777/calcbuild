import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import { gravel, conversions } from '../../utils/formulas';
import type { CalcResultItem } from '../../utils/types';

const DEPTH_UNITS = [
  { value: 'in', label: 'in' },
  { value: 'ft', label: 'ft' },
  { value: 'cm', label: 'cm' },
];

export default function PeaGravelCalculator() {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');
  const [depthUnit, setDepthUnit] = useState('in');

  const debouncedLength = useDebouncedValue(length);
  const debouncedWidth = useDebouncedValue(width);
  const debouncedDepth = useDebouncedValue(depth);

  const results: CalcResultItem[] = useMemo(() => {
    const l = parseFloat(debouncedLength);
    const w = parseFloat(debouncedWidth);
    const d = parseFloat(debouncedDepth);
    if (!l || !w || !d || l <= 0 || w <= 0 || d <= 0) return [];

    const lengthFt = l;
    const widthFt = w;

    let depthFt = d;
    if (depthUnit === 'in') depthFt = conversions.inchesToFeet(d);
    else if (depthUnit === 'cm') depthFt = d * 0.0328084;

    const cubicYards = gravel.cubicYards(lengthFt, widthFt, depthFt);
    const density = 1.3;
    const tons = gravel.tons(cubicYards, density);
    const coverage = gravel.coverage(tons, depthFt * 12);
    const weightLbs = gravel.weight(cubicYards, density * 2000);
    const bags = Math.ceil(weightLbs / 50);

    return [
      { label: 'Cubic Yards', value: cubicYards.toFixed(2), unit: 'yd³' },
      { label: 'Tons', value: tons.toFixed(2), unit: 'tons' },
      { label: 'Coverage', value: coverage.toFixed(1), unit: 'sq ft/ton' },
      { label: 'Weight', value: weightLbs.toFixed(0), unit: 'lbs' },
      { label: '50lb Bags', value: bags.toString(), unit: 'bags' },
    ];
  }, [debouncedLength, debouncedWidth, debouncedDepth, depthUnit]);

  const hasValidInput = parseFloat(length) > 0 && parseFloat(width) > 0 && parseFloat(depth) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label="Length"
          value={length}
          onChange={setLength}
          units={[{ value: 'ft', label: 'ft' }]}
          unit="ft"
          onUnitChange={() => {}}
          placeholder="e.g. 20"
          required
          min={0}
          step={0.1}
        />
        <CalcInput
          label="Width"
          value={width}
          onChange={setWidth}
          units={[{ value: 'ft', label: 'ft' }]}
          unit="ft"
          onUnitChange={() => {}}
          placeholder="e.g. 10"
          required
          min={0}
          step={0.1}
        />
        <CalcInput
          label="Depth"
          value={depth}
          onChange={setDepth}
          units={DEPTH_UNITS}
          unit={depthUnit}
          onUnitChange={setDepthUnit}
          placeholder="e.g. 3"
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
          className="flex-1 py-2.5 bg-[#0F766E] text-white font-semibold rounded-[16px] hover:bg-[#0D6B63] transition-colors text-[1.6rem]"
        >
          Calculate
        </button>
        <button
          type="button"
          onClick={() => { setLength(''); setWidth(''); setDepth(''); }}
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
