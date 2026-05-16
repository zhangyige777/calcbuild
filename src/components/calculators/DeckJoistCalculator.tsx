import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import CalcSelect from '../calculator-ui/CalcSelect';
import type { CalcResultItem } from '../../utils/types';

const SPACING_OPTIONS = [
  { value: '12', label: '12" OC' },
  { value: '16', label: '16" OC' },
  { value: '24', label: '24" OC' },
];

const JOIST_SIZE_OPTIONS = [
  { value: '2x6', label: '2x6' },
  { value: '2x8', label: '2x8' },
  { value: '2x10', label: '2x10' },
  { value: '2x12', label: '2x12' },
];

// Approximate price per linear foot by joist size (pressure-treated)
const PRICE_PER_LF: Record<string, number> = {
  '2x6': 2.50,
  '2x8': 3.25,
  '2x10': 4.00,
  '2x12': 5.50,
};

export default function DeckJoistCalculator() {
  const [deckLength, setDeckLength] = useState('');
  const [deckWidth, setDeckWidth] = useState('');
  const [joistSpacing, setJoistSpacing] = useState('16');
  const [joistSize, setJoistSize] = useState('2x8');

  const debouncedLength = useDebouncedValue(deckLength);
  const debouncedWidth = useDebouncedValue(deckWidth);

  const results: CalcResultItem[] = useMemo(() => {
    const length = parseFloat(debouncedLength);
    const width = parseFloat(debouncedWidth);
    const spacing = parseFloat(joistSpacing);
    if (!length || length <= 0 || !width || width <= 0 || !spacing || spacing <= 0) return [];

    // Number of joists = (length / spacing_in_ft) + 1
    const spacingFt = spacing / 12;
    const numJoists = Math.ceil(length / spacingFt) + 1;

    // Each joist spans the deck width
    const totalLinearFeet = numJoists * width;

    // Cost estimate
    const pricePerLF = PRICE_PER_LF[joistSize];
    const estimatedCost = totalLinearFeet * pricePerLF;

    return [
      { label: 'Number of Joists', value: numJoists.toString(), unit: '' },
      { label: 'Total Linear Feet', value: totalLinearFeet.toLocaleString(undefined, { maximumFractionDigits: 1 }), unit: 'lin ft' },
      { label: 'Estimated Lumber Cost', value: `$${estimatedCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, unit: '' },
      { label: 'Joist Size', value: joistSize, unit: '' },
      { label: 'Spacing', value: `${spacing}"`, unit: 'OC' },
    ];
  }, [debouncedLength, debouncedWidth, joistSpacing, joistSize]);

  const hasValidInput = parseFloat(deckLength) > 0 && parseFloat(deckWidth) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label="Deck Length"
          value={deckLength}
          onChange={setDeckLength}
          units={[{ value: 'ft', label: 'ft' }]}
          unit="ft"
          onUnitChange={() => {}}
          placeholder="e.g. 16"
          required
          min={0}
          step={0.5}
        />
        <CalcInput
          label="Deck Width (Joist Span)"
          value={deckWidth}
          onChange={setDeckWidth}
          units={[{ value: 'ft', label: 'ft' }]}
          unit="ft"
          onUnitChange={() => {}}
          placeholder="e.g. 12"
          required
          min={0}
          step={0.5}
        />
        <CalcSelect
          label="Joist Spacing"
          value={joistSpacing}
          onChange={setJoistSpacing}
          options={SPACING_OPTIONS}
          required
        />
        <CalcSelect
          label="Joist Size"
          value={joistSize}
          onChange={setJoistSize}
          options={JOIST_SIZE_OPTIONS}
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
          onClick={() => { setDeckLength(''); setDeckWidth(''); setJoistSpacing('16'); setJoistSize('2x8'); }}
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
