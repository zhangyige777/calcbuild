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

export default function LoamCalculator() {
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

    const density = 1.15; // tons per cubic yard for loam
    const cubicYards = gravel.cubicYards(lengthFt, widthFt, depthFt);
    const tons = gravel.tons(cubicYards, density);
    const costEstimate = cubicYards * 25; // average $25 per cubic yard

    return [
      { label: 'Cubic Yards', value: cubicYards.toFixed(2), unit: 'yd³' },
      { label: 'Tons', value: tons.toFixed(2), unit: 'tons' },
      { label: 'Est. Cost', value: '$' + costEstimate.toFixed(2), unit: '' },
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
          placeholder="e.g. 6"
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
