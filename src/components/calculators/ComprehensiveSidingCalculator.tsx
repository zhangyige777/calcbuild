import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcSelect from '../calculator-ui/CalcSelect';
import CalcResult from '../calculator-ui/CalcResult';
import type { CalcResultItem } from '../../utils/types';

const MATERIAL_OPTIONS = [
  { value: 'vinyl', label: 'Vinyl' },
  { value: 'hardie', label: 'Hardie/Fiber Cement' },
  { value: 'cedar', label: 'Cedar/Wood' },
  { value: 'lap', label: 'Lap Siding (Wood)' },
  { value: 'metal', label: 'Metal/Steel' },
  { value: 'stucco', label: 'Stucco' },
  { value: 'engineered', label: 'Engineered Wood' },
];

const STYLE_OPTIONS = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
  { value: 'shake', label: 'Shake/Shingle' },
  { value: 'boardbatten', label: 'Board and Batten' },
];

const MATERIAL_COSTS: Record<string, { low: number; high: number }> = {
  vinyl: { low: 3, high: 7 },
  hardie: { low: 5, high: 10 },
  cedar: { low: 6, high: 12 },
  lap: { low: 5, high: 11 },
  metal: { low: 5, high: 9 },
  stucco: { low: 6, high: 12 },
  engineered: { low: 4, high: 8 },
};

const REMOVAL_COST = { low: 1, high: 2 };

export default function ComprehensiveSidingCalculator() {
  const [wallHeight, setWallHeight] = useState('');
  const [wallWidth, setWallWidth] = useState('');
  const [numWalls, setNumWalls] = useState('');
  const [openingsArea, setOpeningsArea] = useState('');
  const [materialType, setMaterialType] = useState('vinyl');
  const [sidingStyle, setSidingStyle] = useState('horizontal');
  const [wasteFactor, setWasteFactor] = useState('10');
  const [includeRemoval, setIncludeRemoval] = useState(false);

  const debouncedWallHeight = useDebouncedValue(wallHeight);
  const debouncedWallWidth = useDebouncedValue(wallWidth);
  const debouncedNumWalls = useDebouncedValue(numWalls);
  const debouncedOpeningsArea = useDebouncedValue(openingsArea);
  const debouncedMaterialType = useDebouncedValue(materialType);
  const debouncedWasteFactor = useDebouncedValue(wasteFactor);
  const debouncedIncludeRemoval = useDebouncedValue(includeRemoval);

  const results: CalcResultItem[] = useMemo(() => {
    const h = parseFloat(debouncedWallHeight);
    const w = parseFloat(debouncedWallWidth);
    const n = parseFloat(debouncedNumWalls);
    if (!h || !w || !n || h <= 0 || w <= 0 || n <= 0) return [];

    const totalArea = h * w * n;
    const openings = parseFloat(debouncedOpeningsArea) || 0;
    const waste = parseFloat(debouncedWasteFactor) || 0;

    const netArea = Math.max(0, totalArea - openings);
    const wasteAmount = netArea * (waste / 100);
    const totalWithWaste = netArea + wasteAmount;
    const squares = totalWithWaste / 100;

    const costs = MATERIAL_COSTS[debouncedMaterialType] || MATERIAL_COSTS.vinyl;

    const materialLow = totalWithWaste * costs.low * 0.5;
    const materialHigh = totalWithWaste * costs.high * 0.5;

    const laborLow = totalWithWaste * costs.low * 0.5;
    const laborHigh = totalWithWaste * costs.high * 0.5;

    let removalLow = 0;
    let removalHigh = 0;
    if (debouncedIncludeRemoval) {
      removalLow = totalWithWaste * REMOVAL_COST.low;
      removalHigh = totalWithWaste * REMOVAL_COST.high;
    }

    const totalLow = materialLow + laborLow + removalLow;
    const totalHigh = materialHigh + laborHigh + removalHigh;

    const formatRange = (low: number, high: number) =>
      `$${low.toLocaleString(undefined, { maximumFractionDigits: 0 })} – $${high.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

    const resultItems: CalcResultItem[] = [
      { label: 'Net Siding Area', value: netArea.toFixed(0), unit: 'sq ft' },
      { label: 'Total with Waste', value: totalWithWaste.toFixed(0), unit: 'sq ft' },
      { label: 'Squares', value: squares.toFixed(2), unit: 'squares (100 sq ft)' },
      { label: 'Material Cost', value: formatRange(materialLow, materialHigh), unit: '' },
      { label: 'Labor Cost', value: formatRange(laborLow, laborHigh), unit: '' },
    ];

    if (debouncedIncludeRemoval) {
      resultItems.push({
        label: 'Removal & Disposal',
        value: formatRange(removalLow, removalHigh),
        unit: '',
      });
    }

    resultItems.push({
      label: 'Total Project Cost',
      value: formatRange(totalLow, totalHigh),
      unit: '',
    });

    return resultItems;
  }, [debouncedWallHeight, debouncedWallWidth, debouncedNumWalls, debouncedOpeningsArea, debouncedMaterialType, debouncedWasteFactor, debouncedIncludeRemoval]);

  const hasValidInput = parseFloat(wallHeight) > 0 && parseFloat(wallWidth) > 0 && parseFloat(numWalls) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label="Wall Height"
          value={wallHeight}
          onChange={setWallHeight}
          unit="ft"
          placeholder="e.g. 10"
          required
          min={0}
          step={0.1}
        />
        <CalcInput
          label="Wall Width"
          value={wallWidth}
          onChange={setWallWidth}
          unit="ft"
          placeholder="e.g. 40"
          required
          min={0}
          step={0.1}
        />
        <CalcInput
          label="Number of Walls"
          value={numWalls}
          onChange={setNumWalls}
          placeholder="e.g. 4"
          required
          min={1}
          step={1}
        />
        <CalcInput
          label="Openings Area (doors/windows)"
          value={openingsArea}
          onChange={setOpeningsArea}
          unit="sq ft"
          placeholder="e.g. 80"
          min={0}
          step={0.1}
        />
        <CalcSelect
          label="Siding Material"
          value={materialType}
          onChange={setMaterialType}
          options={MATERIAL_OPTIONS}
          required
        />
        <CalcSelect
          label="Siding Style"
          value={sidingStyle}
          onChange={setSidingStyle}
          options={STYLE_OPTIONS}
          required
        />
        <CalcInput
          label="Waste Factor"
          value={wasteFactor}
          onChange={setWasteFactor}
          unit="%"
          placeholder="e.g. 10"
          min={0}
          step={1}
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
          onClick={() => { setWallHeight(''); setWallWidth(''); setNumWalls(''); setOpeningsArea(''); setMaterialType('vinyl'); setSidingStyle('horizontal'); setWasteFactor('10'); setIncludeRemoval(false); }}
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
