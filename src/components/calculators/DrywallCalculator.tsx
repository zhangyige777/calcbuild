import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import CalcSelect from '../calculator-ui/CalcSelect';
import type { CalcResultItem } from '../../utils/types';

const SHEET_SIZE_OPTIONS = [
  { value: '4x8', label: '4 x 8 ft' },
  { value: '4x10', label: '4 x 10 ft' },
  { value: '4x12', label: '4 x 12 ft' },
];

// Sheet area in sq ft
const SHEET_AREA: Record<string, number> = {
  '4x8': 32,
  '4x10': 40,
  '4x12': 48,
};

// Cost per sheet by size (standard 1/2" drywall)
const COST_PER_SHEET: Record<string, number> = {
  '4x8': 12,
  '4x10': 15,
  '4x12': 18,
};

// Screws: ~1 screw per sq ft
const SCREWS_PER_SQFT = 1;
// Joint compound: ~0.05 gallons per sq ft
const COMPOUND_PER_SQFT = 0.05;

export default function DrywallCalculator() {
  const [wallLength, setWallLength] = useState('');
  const [wallHeight, setWallHeight] = useState('');
  const [numRooms, setNumRooms] = useState('1');
  const [sheetSize, setSheetSize] = useState('4x8');

  const debouncedLength = useDebouncedValue(wallLength);
  const debouncedHeight = useDebouncedValue(wallHeight);
  const debouncedRooms = useDebouncedValue(numRooms);

  const results: CalcResultItem[] = useMemo(() => {
    const length = parseFloat(debouncedLength);
    const height = parseFloat(debouncedHeight);
    const rooms = parseInt(debouncedRooms) || 1;
    if (!length || length <= 0 || !height || height <= 0) return [];

    // Total wall area = perimeter (length * 4 walls) * height * rooms
    // Using a simplified model: wall length is the perimeter of one room
    const totalWallArea = length * height * rooms;

    // Add 10% waste
    const totalWithWaste = totalWallArea * 1.1;

    const sheetArea = SHEET_AREA[sheetSize];
    const sheetsRaw = totalWithWaste / sheetArea;
    const sheets = Math.ceil(sheetsRaw);

    const costPerSheet = COST_PER_SHEET[sheetSize];
    const estimatedCost = sheets * costPerSheet;

    const screws = Math.ceil(totalWallArea * SCREWS_PER_SQFT);
    const compound = Math.ceil(totalWallArea * COMPOUND_PER_SQFT);

    return [
      { label: 'Total Wall Area', value: totalWallArea.toLocaleString(undefined, { maximumFractionDigits: 0 }), unit: 'sq ft' },
      { label: 'Drywall Sheets', value: sheets.toString(), unit: `(${sheetSize})` },
      { label: 'Estimated Cost', value: `$${estimatedCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, unit: '' },
      { label: 'Screws Needed', value: screws.toLocaleString(), unit: 'screws' },
      { label: 'Joint Compound', value: compound.toString(), unit: 'gallons' },
    ];
  }, [debouncedLength, debouncedHeight, debouncedRooms, sheetSize]);

  const hasValidInput = parseFloat(wallLength) > 0 && parseFloat(wallHeight) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label="Total Wall Length"
          value={wallLength}
          onChange={setWallLength}
          units={[{ value: 'ft', label: 'ft' }]}
          unit="ft"
          onUnitChange={() => {}}
          placeholder="e.g. 48 (perimeter)"
          required
          min={0}
          step={0.5}
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
          step={0.5}
        />
        <CalcInput
          label="Number of Rooms"
          value={numRooms}
          onChange={setNumRooms}
          units={[{ value: 'rooms', label: 'rooms' }]}
          unit="rooms"
          onUnitChange={() => {}}
          placeholder="1"
          min={1}
          step={1}
        />
        <CalcSelect
          label="Sheet Size"
          value={sheetSize}
          onChange={setSheetSize}
          options={SHEET_SIZE_OPTIONS}
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
          onClick={() => { setWallLength(''); setWallHeight(''); setNumRooms('1'); setSheetSize('4x8'); }}
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
