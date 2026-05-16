import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import type { CalcResultItem } from '../../utils/types';

const BOARD_FOOT_2X4 = 5.333 / 12; // A 2x4x12 = 8 board feet (nominal: 2×4 = 8 sq in / 144 × 12 ft)
// Actually: 2×4×12 / 12 = 8 board feet. So 1 board foot = 1/8 of a 2x4x12

export default function BoardFootCalculator() {
  const [thickness, setThickness] = useState('');
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [pricePerBf, setPricePerBf] = useState('');

  const debouncedThickness = useDebouncedValue(thickness);
  const debouncedWidth = useDebouncedValue(width);
  const debouncedLength = useDebouncedValue(length);
  const debouncedQuantity = useDebouncedValue(quantity);
  const debouncedPrice = useDebouncedValue(pricePerBf);

  const results: CalcResultItem[] = useMemo(() => {
    const t = parseFloat(debouncedThickness);
    const w = parseFloat(debouncedWidth);
    const l = parseFloat(debouncedLength);
    const q = parseInt(debouncedQuantity) || 1;
    const price = parseFloat(debouncedPrice);

    if (!t || !w || !l || t <= 0 || w <= 0 || l <= 0) return [];

    // Board feet = Thickness (in) × Width (in) × Length (ft) / 12
    const boardFeet = (t * w * l) / 12;
    const totalBoardFeet = boardFeet * q;

    const res: CalcResultItem[] = [
      { label: 'Board Feet', value: boardFeet.toFixed(2), unit: 'bf' },
      { label: `Total (${q}×)`, value: totalBoardFeet.toFixed(2), unit: 'bf' },
    ];

    if (price > 0) {
      const cost = totalBoardFeet * price;
      res.push({ label: 'Total Cost', value: `$${cost.toFixed(2)}`, unit: '' });
    }

    // 2x4x12 equivalent (8 board feet each)
    const equiv2x4 = Math.ceil(totalBoardFeet / 8);
    res.push({ label: '2×4×12 Equivalent', value: equiv2x4.toString(), unit: 'boards' });

    return res;
  }, [debouncedThickness, debouncedWidth, debouncedLength, debouncedQuantity, debouncedPrice]);

  const hasValidInput = parseFloat(thickness) > 0 && parseFloat(width) > 0 && parseFloat(length) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label="Thickness"
          value={thickness}
          onChange={setThickness}
          units={[{ value: 'in', label: 'in' }]}
          unit="in"
          onUnitChange={() => {}}
          placeholder="e.g. 2"
          required
          min={0}
          step={0.25}
        />
        <CalcInput
          label="Width"
          value={width}
          onChange={setWidth}
          units={[{ value: 'in', label: 'in' }]}
          unit="in"
          onUnitChange={() => {}}
          placeholder="e.g. 6"
          required
          min={0}
          step={0.25}
        />
        <CalcInput
          label="Length"
          value={length}
          onChange={setLength}
          units={[{ value: 'ft', label: 'ft' }]}
          unit="ft"
          onUnitChange={() => {}}
          placeholder="e.g. 8"
          required
          min={0}
          step={0.5}
        />
        <CalcInput
          label="Quantity"
          value={quantity}
          onChange={setQuantity}
          units={[{ value: 'pcs', label: 'pcs' }]}
          unit="pcs"
          onUnitChange={() => {}}
          placeholder="1"
          min={1}
          step={1}
        />
        <CalcInput
          label="Price per Board Foot"
          value={pricePerBf}
          onChange={setPricePerBf}
          units={[{ value: '$/bf', label: '$/bf' }]}
          unit="$/bf"
          onUnitChange={() => {}}
          placeholder="e.g. 4.50 (optional)"
          min={0}
          step={0.01}
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
          onClick={() => { setThickness(''); setWidth(''); setLength(''); setQuantity('1'); setPricePerBf(''); }}
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
