import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import type { CalcResultItem } from '../../utils/types';

export default function SidingSquareFootage() {
  const [wallHeight, setWallHeight] = useState('');
  const [wallWidth, setWallWidth] = useState('');
  const [numWalls, setNumWalls] = useState('');
  const [openingsArea, setOpeningsArea] = useState('');

  const debouncedWallHeight = useDebouncedValue(wallHeight);
  const debouncedWallWidth = useDebouncedValue(wallWidth);
  const debouncedNumWalls = useDebouncedValue(numWalls);
  const debouncedOpeningsArea = useDebouncedValue(openingsArea);

  const results: CalcResultItem[] = useMemo(() => {
    const h = parseFloat(debouncedWallHeight);
    const w = parseFloat(debouncedWallWidth);
    const n = parseFloat(debouncedNumWalls);
    if (!h || !w || !n || h <= 0 || w <= 0 || n <= 0) return [];

    const totalWallArea = h * w * n;
    const openings = parseFloat(debouncedOpeningsArea) || 0;
    const netSidingArea = Math.max(0, totalWallArea - openings);

    return [
      { label: 'Total Wall Area', value: totalWallArea.toFixed(2), unit: 'sq ft' },
      { label: 'Openings Area', value: openings.toFixed(2), unit: 'sq ft' },
      { label: 'Net Siding Area', value: netSidingArea.toFixed(2), unit: 'sq ft' },
    ];
  }, [debouncedWallHeight, debouncedWallWidth, debouncedNumWalls, debouncedOpeningsArea]);

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
          placeholder="e.g. 9"
          required
          min={0}
          step={0.1}
        />
        <CalcInput
          label="Wall Width"
          value={wallWidth}
          onChange={setWallWidth}
          unit="ft"
          placeholder="e.g. 50"
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
          label="Total Openings Area"
          value={openingsArea}
          onChange={setOpeningsArea}
          unit="sq ft"
          placeholder="e.g. 120"
          min={0}
          step={0.1}
        />
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
          onClick={() => { setWallHeight(''); setWallWidth(''); setNumWalls(''); setOpeningsArea(''); }}
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
