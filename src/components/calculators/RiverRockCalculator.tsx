import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import { gravel, conversions } from '../../utils/formulas';
import type { CalcResultItem } from '../../utils/types';

const DEPTH_UNITS = [
  { value: 'in', label: 'in' },
  { value: 'ft', label: 'ft' },
  { value: 'cm', label: 'cm' },
];

const ROCK_SIZES = [
  { value: '1-3', label: '1-3 inch' },
  { value: '2', label: '2 inch' },
  { value: '3/4', label: '3/4 inch' },
];

const DENSITY_MAP: Record<string, number> = {
  '1-3': 1.35,
  '2': 1.4,
  '3/4': 1.45,
};

const fmt = (n: number) =>
  '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function RiverRockCalculator() {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');
  const [depthUnit, setDepthUnit] = useState('in');
  const [rockSize, setRockSize] = useState('1-3');
  const [pricePerTon, setPricePerTon] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');

  const debouncedLength = useDebouncedValue(length);
  const debouncedWidth = useDebouncedValue(width);
  const debouncedDepth = useDebouncedValue(depth);
  const debouncedPrice = useDebouncedValue(pricePerTon);
  const debouncedDelivery = useDebouncedValue(deliveryFee);

  const results: CalcResultItem[] = useMemo(() => {
    const l = parseFloat(debouncedLength);
    const w = parseFloat(debouncedWidth);
    const d = parseFloat(debouncedDepth);
    if (!l || !w || !d || l <= 0 || w <= 0 || d <= 0) return [];

    let depthFt = d;
    if (depthUnit === 'in') depthFt = conversions.inchesToFeet(d);
    else if (depthUnit === 'cm') depthFt = d * 0.0328084;

    const density = DENSITY_MAP[rockSize] || 1.35;
    const cubicYards = gravel.cubicYards(l, w, depthFt);
    const tons = gravel.tons(cubicYards, density);
    const depthInches = depthFt * 12;
    const coverage = gravel.coverage(tons, depthInches);
    const weightLbs = gravel.weight(cubicYards, density * 2000);

    const resultItems: CalcResultItem[] = [
      { label: 'Cubic Yards', value: cubicYards.toFixed(2), unit: 'yd³' },
      { label: 'Tons', value: tons.toFixed(2), unit: 'tons' },
      { label: 'Coverage', value: coverage.toFixed(1), unit: 'sq ft/ton' },
      { label: 'Total Weight', value: weightLbs.toFixed(0), unit: 'lbs' },
    ];

    const price = parseFloat(debouncedPrice);
    if (price > 0) {
      const materialCost = tons * price;
      const delivery = parseFloat(debouncedDelivery) || 0;
      const totalCost = materialCost + delivery;
      resultItems.push(
        { label: 'Material Cost', value: fmt(materialCost), unit: '' },
      );
      if (delivery > 0) {
        resultItems.push({ label: 'Delivery Fee', value: fmt(delivery), unit: '' });
      }
      resultItems.push({ label: 'Total Estimated Cost', value: fmt(totalCost), unit: '' });
    }

    return resultItems;
  }, [debouncedLength, debouncedWidth, debouncedDepth, depthUnit, rockSize, debouncedPrice, debouncedDelivery]);

  const hasValidInput = parseFloat(length) > 0 && parseFloat(width) > 0 && parseFloat(depth) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      <div className="space-y-4">
        <CalcInput
          label="Length"
          value={length}
          onChange={setLength}
          units={[{ value: 'ft', label: 'ft' }]}
          unit="ft"
          onUnitChange={() => {}}
          placeholder="e.g. 20"
          required
          min={0}
          step={0.1}
        />
        <CalcInput
          label="Width"
          value={width}
          onChange={setWidth}
          units={[{ value: 'ft', label: 'ft' }]}
          unit="ft"
          onUnitChange={() => {}}
          placeholder="e.g. 10"
          required
          min={0}
          step={0.1}
        />
        <CalcInput
          label="Depth"
          value={depth}
          onChange={setDepth}
          units={DEPTH_UNITS}
          unit={depthUnit}
          onUnitChange={setDepthUnit}
          placeholder="e.g. 3"
          required
          min={0}
          step={0.1}
        />
        <CalcInput
          label="Rock Size"
          value={rockSize}
          onChange={setRockSize}
          units={ROCK_SIZES}
          unit={rockSize}
          onUnitChange={setRockSize}
          placeholder=""
          required
          min={0}
          step={1}
        />
        <CalcInput
          label="Price per Ton (optional)"
          value={pricePerTon}
          onChange={setPricePerTon}
          units={[{ value: '$', label: '$' }]}
          unit="$"
          onUnitChange={() => {}}
          placeholder="e.g. 75"
          min={0}
          step={0.01}
        />
        <CalcInput
          label="Delivery Fee (optional)"
          value={deliveryFee}
          onChange={setDeliveryFee}
          units={[{ value: '$', label: '$' }]}
          unit="$"
          onUnitChange={() => {}}
          placeholder="e.g. 75"
          min={0}
          step={0.01}
        />
      </div>

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
          onClick={() => { setLength(''); setWidth(''); setDepth(''); setRockSize('1-3'); setPricePerTon(''); setDeliveryFee(''); }}
          className="px-4 py-2.5 text-[1.4rem] text-[#949494] dark:text-[#D4D4D4] hover:text-[#444] dark:hover:text-[#F5F5F5] hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded-[16px] transition-colors"
        >
          Reset
        </button>
      </div>

      <CalcResult results={results} visible={hasValidInput} />
    </div>
  );
}
