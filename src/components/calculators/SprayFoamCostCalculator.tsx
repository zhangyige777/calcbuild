import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import CalcSelect from '../calculator-ui/CalcSelect';
import type { CalcResultItem } from '../../utils/types';

const FOAM_TYPE_OPTIONS = [
  { value: 'open_cell', label: 'Open Cell' },
  { value: 'closed_cell', label: 'Closed Cell' },
];

// Cost per board foot
const COST_PER_BF: Record<string, number> = {
  open_cell: 0.44,
  closed_cell: 1.50,
};

export default function SprayFoamCostCalculator() {
  const [area, setArea] = useState('');
  const [thickness, setThickness] = useState('');
  const [foamType, setFoamType] = useState('open_cell');

  const debouncedArea = useDebouncedValue(area);
  const debouncedThickness = useDebouncedValue(thickness);

  const results: CalcResultItem[] = useMemo(() => {
    const a = parseFloat(debouncedArea);
    const t = parseFloat(debouncedThickness);
    if (!a || a <= 0 || !t || t <= 0) return [];

    // Board feet = area (sq ft) x thickness (inches)
    const boardFeet = a * t;

    const costPerBF = COST_PER_BF[foamType];
    const totalCost = boardFeet * costPerBF;

    // Coverage percentage (how much of the area is covered at given thickness)
    const coverage = a;

    return [
      { label: 'Board Feet', value: boardFeet.toLocaleString(undefined, { maximumFractionDigits: 1 }), unit: 'BF' },
      { label: 'Estimated Cost', value: `$${totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, unit: '' },
      { label: 'Coverage Area', value: coverage.toLocaleString(undefined, { maximumFractionDigits: 0 }), unit: 'sq ft' },
      { label: 'Cost per Board Foot', value: `$${costPerBF.toFixed(2)}`, unit: '' },
      { label: 'Cost per Sq Ft', value: `$${(totalCost / a).toFixed(2)}`, unit: '' },
    ];
  }, [debouncedArea, debouncedThickness, foamType]);

  const hasValidInput = parseFloat(area) > 0 && parseFloat(thickness) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label="Area"
          value={area}
          onChange={setArea}
          units={[{ value: 'sqft', label: 'sq ft' }]}
          unit="sqft"
          onUnitChange={() => {}}
          placeholder="e.g. 1500"
          required
          min={0}
          step={1}
        />
        <CalcInput
          label="Thickness"
          value={thickness}
          onChange={setThickness}
          units={[{ value: 'in', label: 'inches' }]}
          unit="in"
          onUnitChange={() => {}}
          placeholder="e.g. 3"
          required
          min={0}
          step={0.5}
        />
        <CalcSelect
          label="Foam Type"
          value={foamType}
          onChange={setFoamType}
          options={FOAM_TYPE_OPTIONS}
          required
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
          onClick={() => { setArea(''); setThickness(''); setFoamType('open_cell'); }}
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
