import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import { stairs, conversions } from '../../utils/formulas';
import type { CalcResultItem } from '../../utils/types';

export default function StairCalculator() {
  const [totalRise, setTotalRise] = useState('');
  const [totalRun, setTotalRun] = useState('');
  const [treadDepth, setTreadDepth] = useState('');

  const debouncedRise = useDebouncedValue(totalRise);
  const debouncedRun = useDebouncedValue(totalRun);
  const debouncedTread = useDebouncedValue(treadDepth);

  const results: CalcResultItem[] = useMemo(() => {
    const rise = parseFloat(debouncedRise);
    const run = parseFloat(debouncedRun);
    const tread = parseFloat(debouncedTread);
    if (!rise || rise <= 0) return [];

    const steps = stairs.numberOfSteps(rise);
    const riserHeight = stairs.riserHeight(rise, steps);

    const runPerStep = tread > 0 ? tread : 10;
    const totalRunLength = steps * runPerStep;

    const effectiveRun = run > 0 ? run : totalRunLength;
    const angle = stairs.angle(rise, effectiveRun);

    const res: CalcResultItem[] = [
      { label: 'Number of Steps', value: steps.toString(), unit: 'steps' },
      { label: 'Riser Height', value: riserHeight.toFixed(2), unit: 'in' },
      { label: 'Going / Run per Step', value: runPerStep.toFixed(2), unit: 'in' },
      { label: 'Stair Angle', value: angle.toFixed(1), unit: '°' },
      { label: 'Total Run Length', value: totalRunLength.toFixed(1), unit: 'in' },
    ];

    if (riserHeight < 7 || riserHeight > 7.5) {
      res.push({
        label: 'Riser Note',
        value: riserHeight < 7 ? 'Below ideal (7–7.5 in)' : 'Above ideal (7–7.5 in)',
        unit: '',
      });
    }

    return res;
  }, [debouncedRise, debouncedRun, debouncedTread]);

  const hasValidInput = parseFloat(totalRise) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label="Total Rise"
          value={totalRise}
          onChange={setTotalRise}
          units={[{ value: 'in', label: 'in' }]}
          unit="in"
          onUnitChange={() => {}}
          placeholder="e.g. 108"
          required
          min={0}
          step={0.1}
        />
        <CalcInput
          label="Total Run"
          value={totalRun}
          onChange={setTotalRun}
          units={[{ value: 'in', label: 'in' }]}
          unit="in"
          onUnitChange={() => {}}
          placeholder="e.g. 120 (optional)"
          min={0}
          step={0.1}
        />
        <CalcInput
          label="Tread Depth"
          value={treadDepth}
          onChange={setTreadDepth}
          units={[{ value: 'in', label: 'in' }]}
          unit="in"
          onUnitChange={() => {}}
          placeholder="e.g. 10 (optional, default 10 in)"
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
          onClick={() => { setTotalRise(''); setTotalRun(''); setTreadDepth(''); }}
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
