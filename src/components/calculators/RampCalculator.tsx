import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import CalcSelect from '../calculator-ui/CalcSelect';
import { ramp, conversions } from '../../utils/formulas';
import type { CalcResultItem } from '../../utils/types';

const SLOPE_OPTIONS = [
  { value: '8', label: '1:8' },
  { value: '10', label: '1:10' },
  { value: '12', label: '1:12' },
  { value: '14', label: '1:14' },
  { value: '16', label: '1:16' },
  { value: '20', label: '1:20' },
];

const RISE_UNITS = [
  { value: 'in', label: 'in' },
  { value: 'ft', label: 'ft' },
];

export default function RampCalculator() {
  const [rise, setRise] = useState('');
  const [riseUnit, setRiseUnit] = useState('in');
  const [slopeRatio, setSlopeRatio] = useState('12');
  const [rampWidth, setRampWidth] = useState('');

  const debouncedRise = useDebouncedValue(rise);
  const debouncedWidth = useDebouncedValue(rampWidth);

  const results: CalcResultItem[] = useMemo(() => {
    const r = parseFloat(debouncedRise);
    const w = parseFloat(debouncedWidth);
    const ratio = parseFloat(slopeRatio);
    if (!r || r <= 0) return [];

    // Convert rise to inches if needed, then to feet for length calc
    let riseIn = r;
    if (riseUnit === 'ft') riseIn = conversions.feetToInches(r);

    const riseFt = conversions.inchesToFeet(riseIn);
    const rampLengthFt = ramp.length(riseFt, ratio);
    const angle = ramp.angle(riseFt, rampLengthFt);

    const res: CalcResultItem[] = [
      { label: 'Ramp Length', value: rampLengthFt.toFixed(2), unit: 'ft' },
      { label: 'Ramp Angle', value: angle.toFixed(1), unit: '°' },
    ];

    if (w > 0) {
      const surfaceArea = ramp.surfaceArea(rampLengthFt, w);
      const volume = ramp.volume(rampLengthFt, w, riseFt);
      res.push(
        { label: 'Surface Area', value: surfaceArea.toFixed(2), unit: 'sq ft' },
        { label: 'Volume', value: volume.toFixed(2), unit: 'ft³' },
      );
    } else {
      // Show surface area note
      res.push({
        label: 'Surface Area',
        value: 'Enter width to calculate',
        unit: '',
      });
    }

    return res;
  }, [debouncedRise, debouncedWidth, slopeRatio, riseUnit]);

  const hasValidInput = parseFloat(rise) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label="Rise"
          value={rise}
          onChange={setRise}
          units={RISE_UNITS}
          unit={riseUnit}
          onUnitChange={setRiseUnit}
          placeholder="e.g. 24"
          required
          min={0}
          step={0.1}
        />
        <CalcSelect
          label="Slope Ratio"
          value={slopeRatio}
          onChange={setSlopeRatio}
          options={SLOPE_OPTIONS}
          required
        />
        <CalcInput
          label="Ramp Width"
          value={rampWidth}
          onChange={setRampWidth}
          units={[{ value: 'ft', label: 'ft' }]}
          unit="ft"
          onUnitChange={() => {}}
          placeholder="e.g. 5 (optional)"
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
          onClick={() => { setRise(''); setSlopeRatio('12'); setRampWidth(''); }}
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
