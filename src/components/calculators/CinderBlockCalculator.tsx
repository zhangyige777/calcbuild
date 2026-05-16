import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import CalcSelect from '../calculator-ui/CalcSelect';
import type { CalcResultItem } from '../../utils/types';

const BLOCK_SIZES = [
  { value: '8x8x16', label: '8×8×16 Standard' },
  { value: '6x8x16', label: '6×8×16' },
  { value: '12x8x16', label: '12×8×16' },
];

// Block face area in sq ft (nominal dimensions including mortar joint)
const BLOCK_FACE_AREA: Record<string, number> = {
  '8x8x16': 0.89,  // (16 × 8) / 144
  '6x8x16': 0.89,  // same face, thinner depth
  '12x8x16': 0.89, // same face, wider depth
};

// Cubic feet of mortar per block (approximate)
const MORTAR_PER_BLOCK: Record<string, number> = {
  '8x8x16': 0.03,
  '6x8x16': 0.025,
  '12x8x16': 0.04,
};

// Cubic feet of fill volume per block core
const FILL_PER_BLOCK: Record<string, number> = {
  '8x8x16': 0.48,  // ~0.48 cubic ft per block (2 cores)
  '6x8x16': 0.36,
  '12x8x16': 0.72,
};

const CONCRETE_BAG_CUBIC_FT = 0.6; // 60lb bag of concrete ≈ 0.6 cubic ft
const MORTAR_BAG_CUBIC_FT = 0.7;   // 80lb bag of mortar ≈ 0.7 cubic ft

export default function CinderBlockCalculator() {
  const [wallLength, setWallLength] = useState('');
  const [wallHeight, setWallHeight] = useState('');
  const [blockSize, setBlockSize] = useState('8x8x16');

  const debouncedLength = useDebouncedValue(wallLength);
  const debouncedHeight = useDebouncedValue(wallHeight);

  const results: CalcResultItem[] = useMemo(() => {
    const l = parseFloat(debouncedLength);
    const h = parseFloat(debouncedHeight);
    if (!l || !h || l <= 0 || h <= 0) return [];

    const wallArea = l * h; // sq ft
    const faceArea = BLOCK_FACE_AREA[blockSize];
    const blocksRaw = wallArea / faceArea;
    const blocks = Math.ceil(blocksRaw); // round up for waste

    // Mortar: each block needs mortar, plus 10% waste
    const mortarPerBlock = MORTAR_PER_BLOCK[blockSize];
    const totalMortarCf = blocks * mortarPerBlock * 1.1;
    const mortarBags = Math.ceil(totalMortarCf / MORTAR_BAG_CUBIC_FT);

    // Fill volume for cores
    const fillPerBlock = FILL_PER_BLOCK[blockSize];
    const totalFillCf = blocks * fillPerBlock;
    const fillCubicYards = totalFillCf / 27;

    return [
      { label: 'Blocks Needed', value: blocks.toString(), unit: '' },
      { label: 'Wall Area', value: wallArea.toFixed(1), unit: 'sq ft' },
      { label: 'Mortar Bags', value: mortarBags.toString(), unit: '80lb bags' },
      { label: 'Fill Volume', value: fillCubicYards.toFixed(2), unit: 'cu yd' },
    ];
  }, [debouncedLength, debouncedHeight, blockSize]);

  const hasValidInput = parseFloat(wallLength) > 0 && parseFloat(wallHeight) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label="Wall Length"
          value={wallLength}
          onChange={setWallLength}
          units={[{ value: 'ft', label: 'ft' }]}
          unit="ft"
          onUnitChange={() => {}}
          placeholder="e.g. 50"
          required
          min={0}
          step={0.1}
        />
        <CalcInput
          label="Wall Height"
          value={wallHeight}
          onChange={setWallHeight}
          units={[{ value: 'ft', label: 'ft' }]}
          unit="ft"
          onUnitChange={() => {}}
          placeholder="e.g. 8"
          required
          min={0}
          step={0.1}
        />
        <CalcSelect
          label="Block Size"
          value={blockSize}
          onChange={setBlockSize}
          options={BLOCK_SIZES}
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
          onClick={() => { setWallLength(''); setWallHeight(''); setBlockSize('8x8x16'); }}
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
