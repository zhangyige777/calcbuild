import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import CalcUnitToggle from '../calculator-ui/CalcUnitToggle';
import { asphalt, conversions } from '../../utils/formulas';
import type { CalcResultItem } from '../../utils/types';

const LENGTH_UNITS = [
  { value: 'ft', label: 'ft' },
  { value: 'yd', label: 'yd' },
  { value: 'm', label: 'm' },
];

const DEPTH_UNITS = [
  { value: 'in', label: 'in' },
  { value: 'ft', label: 'ft' },
  { value: 'cm', label: 'cm' },
];

export default function AsphaltCalculator() {
  const [length, setLength] = useState('');
  const [lengthUnit, setLengthUnit] = useState('ft');
  const [width, setWidth] = useState('');
  const [widthUnit, setWidthUnit] = useState('ft');
  const [depth, setDepth] = useState('');
  const [depthUnit, setDepthUnit] = useState('in');
  const [imperial, setImperial] = useState(true);

  const debouncedLength = useDebouncedValue(length);
  const debouncedWidth = useDebouncedValue(width);
  const debouncedDepth = useDebouncedValue(depth);

  const results: CalcResultItem[] = useMemo(() => {
    const l = parseFloat(debouncedLength);
    const w = parseFloat(debouncedWidth);
    const d = parseFloat(debouncedDepth);
    if (!l || !w || !d || l <= 0 || w <= 0 || d <= 0) return [];

    let lengthFt = l;
    if (lengthUnit === 'yd') lengthFt = conversions.yardsToFeet(l);
    else if (lengthUnit === 'm') lengthFt = conversions.metersToFeet(l);

    let widthFt = w;
    if (widthUnit === 'yd') widthFt = conversions.yardsToFeet(w);
    else if (widthUnit === 'm') widthFt = conversions.metersToFeet(w);

    let depthFt = d;
    if (depthUnit === 'in') depthFt = conversions.inchesToFeet(d);
    else if (depthUnit === 'cm') depthFt = d * 0.0328084;

    const cubicFeet = asphalt.cubicFeet(lengthFt, widthFt, depthFt);
    const cubicYards = asphalt.cubicYards(cubicFeet);
    const tons = asphalt.tons(cubicYards);

    if (imperial) {
      return [
        { label: 'Volume', value: cubicFeet.toFixed(2), unit: 'ft³' },
        { label: 'Cubic Yards', value: cubicYards.toFixed(2), unit: 'yd³' },
        { label: 'Tons', value: tons.toFixed(2), unit: 'tons' },
      ];
    } else {
      const cubicMeters = cubicFeet * 0.0283168;
      const metricTons = tons * 0.907185;
      return [
        { label: 'Volume', value: cubicMeters.toFixed(2), unit: 'm³' },
        { label: 'Metric Tons', value: metricTons.toFixed(2), unit: 't' },
      ];
    }
  }, [debouncedLength, debouncedWidth, debouncedDepth, lengthUnit, widthUnit, depthUnit, imperial]);

  const hasValidInput = parseFloat(length) > 0 && parseFloat(width) > 0 && parseFloat(depth) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Unit toggle */}
      <div className="flex justify-end mb-5">
        <CalcUnitToggle imperial={imperial} onChange={setImperial} />
      </div>

      {/* Inputs - stacked vertically like inchcalculator */}
      <div className="space-y-4">
        <CalcInput
          label="Length"
          value={length}
          onChange={setLength}
          units={LENGTH_UNITS}
          unit={lengthUnit}
          onUnitChange={setLengthUnit}
          placeholder="e.g. 20"
          required
          min={0}
          step={0.1}
        />
        <CalcInput
          label="Width"
          value={width}
          onChange={setWidth}
          units={LENGTH_UNITS}
          unit={widthUnit}
          onUnitChange={setWidthUnit}
          placeholder="e.g. 24"
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
          className="flex-1 py-2.5 bg-[#4D7C0F] text-white font-semibold rounded-[16px] hover:bg-[#3F6212] transition-colors text-[1.6rem]"
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
