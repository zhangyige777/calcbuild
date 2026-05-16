import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import CalcSelect from '../calculator-ui/CalcSelect';
import type { CalcResultItem } from '../../utils/types';

const QUALITY_OPTIONS = [
  { value: 'economy', label: 'Economy' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
];

// Price per gallon by quality tier
const PRICE_PER_GALLON: Record<string, number> = {
  economy: 25,
  standard: 45,
  premium: 65,
};

const QUALITY_COVERAGE: Record<string, number> = {
  economy: 350,
  standard: 400,
  premium: 400,
};

// Average room wall area ~800 sq ft (10x12 room with 8ft ceilings)
const SQ_FT_PER_ROOM = 800;

export default function PaintCostCalculator() {
  const [wallArea, setWallArea] = useState('');
  const [numCoats, setNumCoats] = useState('2');
  const [quality, setQuality] = useState('standard');
  const [coveragePerGallon, setCoveragePerGallon] = useState('400');

  const debouncedArea = useDebouncedValue(wallArea);
  const debouncedCoats = useDebouncedValue(numCoats);
  const debouncedCoverage = useDebouncedValue(coveragePerGallon);

  const results: CalcResultItem[] = useMemo(() => {
    const a = parseFloat(debouncedArea);
    const coats = parseInt(debouncedCoats) || 2;
    const coverage = parseFloat(debouncedCoverage) || QUALITY_COVERAGE[quality];
    if (!a || a <= 0) return [];

    // Gallons = (area * coats) / coverage
    const gallonsRaw = (a * coats) / coverage;
    const gallons = Math.ceil(gallonsRaw);

    // Cost
    const pricePerGallon = PRICE_PER_GALLON[quality];
    const totalCost = gallons * pricePerGallon;

    // Rooms worth
    const roomsWorth = (a / SQ_FT_PER_ROOM).toFixed(1);

    return [
      { label: 'Gallons Needed', value: gallons.toString(), unit: 'gallons' },
      { label: 'Estimated Cost', value: `$${totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, unit: '' },
      { label: 'Rooms Worth', value: roomsWorth, unit: 'rooms' },
      { label: 'Cost per Gallon', value: `$${pricePerGallon}`, unit: '' },
      { label: 'Total Coverage', value: `${(a * coats).toLocaleString()}`, unit: 'sq ft' },
    ];
  }, [debouncedArea, debouncedCoats, debouncedCoverage, quality]);

  const hasValidInput = parseFloat(wallArea) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label="Wall Area"
          value={wallArea}
          onChange={setWallArea}
          units={[{ value: 'sqft', label: 'sq ft' }]}
          unit="sqft"
          onUnitChange={() => {}}
          placeholder="e.g. 1600"
          required
          min={0}
          step={1}
        />
        <CalcInput
          label="Number of Coats"
          value={numCoats}
          onChange={setNumCoats}
          units={[{ value: 'coats', label: 'coats' }]}
          unit="coats"
          onUnitChange={() => {}}
          placeholder="2"
          min={1}
          step={1}
        />
        <CalcSelect
          label="Paint Quality"
          value={quality}
          onChange={setQuality}
          options={QUALITY_OPTIONS}
          required
        />
        <CalcInput
          label="Coverage per Gallon"
          value={coveragePerGallon}
          onChange={setCoveragePerGallon}
          units={[{ value: 'sqft', label: 'sq ft' }]}
          unit="sqft"
          onUnitChange={() => {}}
          placeholder="400"
          min={100}
          step={10}
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
          onClick={() => { setWallArea(''); setNumCoats('2'); setQuality('standard'); setCoveragePerGallon('400'); }}
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
