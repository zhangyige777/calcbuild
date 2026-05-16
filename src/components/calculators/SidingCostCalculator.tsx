import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcSelect from '../calculator-ui/CalcSelect';
import CalcResult from '../calculator-ui/CalcResult';
import type { CalcResultItem } from '../../utils/types';

const MATERIAL_OPTIONS = [
  { value: 'vinyl', label: 'Vinyl Siding' },
  { value: 'hardie', label: 'Hardie/Fiber Cement' },
  { value: 'cedar', label: 'Cedar/Wood' },
  { value: 'metal', label: 'Metal/Steel' },
  { value: 'stucco', label: 'Stucco' },
];

const MATERIAL_COSTS: Record<string, { low: number; high: number }> = {
  vinyl: { low: 3, high: 7 },
  hardie: { low: 5, high: 10 },
  cedar: { low: 6, high: 12 },
  metal: { low: 5, high: 9 },
  stucco: { low: 6, high: 12 },
};

const REMOVAL_COST = { low: 1, high: 2 };

export default function SidingCostCalculator() {
  const [area, setArea] = useState('');
  const [materialType, setMaterialType] = useState('vinyl');
  const [includeRemoval, setIncludeRemoval] = useState(false);

  const debouncedArea = useDebouncedValue(area);
  const debouncedMaterialType = useDebouncedValue(materialType);
  const debouncedIncludeRemoval = useDebouncedValue(includeRemoval);

  const results: CalcResultItem[] = useMemo(() => {
    const a = parseFloat(debouncedArea);
    if (!a || a <= 0) return [];

    const costs = MATERIAL_COSTS[debouncedMaterialType] || MATERIAL_COSTS.vinyl;

    const materialLow = a * costs.low;
    const materialHigh = a * costs.high;

    // Labor typically equals material cost
    const laborLow = materialLow;
    const laborHigh = materialHigh;

    let removalLow = 0;
    let removalHigh = 0;
    if (debouncedIncludeRemoval) {
      removalLow = a * REMOVAL_COST.low;
      removalHigh = a * REMOVAL_COST.high;
    }

    const totalLow = materialLow + laborLow + removalLow;
    const totalHigh = materialHigh + laborHigh + removalHigh;

    const formatRange = (low: number, high: number) =>
      `$${low.toLocaleString(undefined, { maximumFractionDigits: 0 })} – $${high.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

    const resultItems: CalcResultItem[] = [
      { label: 'Material Cost', value: formatRange(materialLow, materialHigh), unit: '' },
      { label: 'Estimated Labor Cost', value: formatRange(laborLow, laborHigh), unit: '' },
    ];

    if (debouncedIncludeRemoval) {
      resultItems.push({
        label: 'Removal & Disposal',
        value: formatRange(removalLow, removalHigh),
        unit: '',
      });
    }

    resultItems.push({
      label: 'Total Estimated Cost',
      value: formatRange(totalLow, totalHigh),
      unit: '',
    });

    return resultItems;
  }, [debouncedArea, debouncedMaterialType, debouncedIncludeRemoval]);

  const hasValidInput = parseFloat(area) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label="Total Siding Area"
          value={area}
          onChange={setArea}
          unit="sq ft"
          placeholder="e.g. 1500"
          required
          min={0}
          step={1}
        />
        <CalcSelect
          label="Material Type"
          value={materialType}
          onChange={setMaterialType}
          options={MATERIAL_OPTIONS}
          required
        />
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="includeRemoval"
            checked={includeRemoval}
            onChange={(e) => setIncludeRemoval(e.target.checked)}
            className="w-[18px] h-[18px] accent-[#0F766E] cursor-pointer"
          />
          <label
            htmlFor="includeRemoval"
            className="text-[1.3rem] font-semibold text-[#949494] dark:text-[#D4D4D4] uppercase tracking-wide cursor-pointer"
          >
            Include Removal ($1-2/sq ft)
          </label>
        </div>
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
          onClick={() => { setArea(''); setMaterialType('vinyl'); setIncludeRemoval(false); }}
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
