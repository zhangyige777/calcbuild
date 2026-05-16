import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcSelect from '../calculator-ui/CalcSelect';
import CalcResult from '../calculator-ui/CalcResult';
import { pool } from '../../utils/formulas';
import type { CalcResultItem } from '../../utils/types';

const SHAPE_OPTIONS = [
  { value: 'rectangular', label: 'Rectangular' },
  { value: 'circular', label: 'Circular' },
  { value: 'oval', label: 'Oval' },
];

export default function PoolGallonsCalculator() {
  const [shape, setShape] = useState('rectangular');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');
  const [diameter, setDiameter] = useState('');
  const [longDiameter, setLongDiameter] = useState('');
  const [shortDiameter, setShortDiameter] = useState('');

  const debouncedLength = useDebouncedValue(length);
  const debouncedWidth = useDebouncedValue(width);
  const debouncedDepth = useDebouncedValue(depth);
  const debouncedDiameter = useDebouncedValue(diameter);
  const debouncedLongDiameter = useDebouncedValue(longDiameter);
  const debouncedShortDiameter = useDebouncedValue(shortDiameter);

  const results: CalcResultItem[] = useMemo(() => {
    const d = parseFloat(debouncedDepth);
    if (!d || d <= 0) return [];

    let gallons = 0;

    if (shape === 'rectangular') {
      const l = parseFloat(debouncedLength);
      const w = parseFloat(debouncedWidth);
      if (!l || !w || l <= 0 || w <= 0) return [];
      gallons = pool.rectangular(l, w, d);
    } else if (shape === 'circular') {
      const dia = parseFloat(debouncedDiameter);
      if (!dia || dia <= 0) return [];
      gallons = pool.circular(dia, d);
    } else if (shape === 'oval') {
      const ld = parseFloat(debouncedLongDiameter);
      const sd = parseFloat(debouncedShortDiameter);
      if (!ld || !sd || ld <= 0 || sd <= 0) return [];
      gallons = pool.oval(ld, sd, d);
    }

    if (gallons <= 0) return [];

    return [
      { label: 'Water Volume', value: Math.round(gallons).toLocaleString(), unit: 'gallons' },
    ];
  }, [shape, debouncedLength, debouncedWidth, debouncedDepth, debouncedDiameter, debouncedLongDiameter, debouncedShortDiameter]);

  const hasValidInput = useMemo(() => {
    const d = parseFloat(depth);
    if (!d || d <= 0) return false;
    if (shape === 'rectangular') return parseFloat(length) > 0 && parseFloat(width) > 0;
    if (shape === 'circular') return parseFloat(diameter) > 0;
    if (shape === 'oval') return parseFloat(longDiameter) > 0 && parseFloat(shortDiameter) > 0;
    return false;
  }, [shape, length, width, depth, diameter, longDiameter, shortDiameter]);

  const resetInputs = () => {
    setLength('');
    setWidth('');
    setDepth('');
    setDiameter('');
    setLongDiameter('');
    setShortDiameter('');
  };

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcSelect
          label="Pool Shape"
          value={shape}
          onChange={(val) => { setShape(val); resetInputs(); }}
          options={SHAPE_OPTIONS}
          required
        />

        {shape === 'rectangular' && (
          <>
            <CalcInput
              label="Length"
              value={length}
              onChange={setLength}
              placeholder="e.g. 24"
              required
              min={0}
              step={0.1}
            />
            <CalcInput
              label="Width"
              value={width}
              onChange={setWidth}
              placeholder="e.g. 12"
              required
              min={0}
              step={0.1}
            />
          </>
        )}

        {shape === 'circular' && (
          <CalcInput
            label="Diameter"
            value={diameter}
            onChange={setDiameter}
            placeholder="e.g. 24"
            required
            min={0}
            step={0.1}
          />
        )}

        {shape === 'oval' && (
          <>
            <CalcInput
              label="Long Diameter"
              value={longDiameter}
              onChange={setLongDiameter}
              placeholder="e.g. 30"
              required
              min={0}
              step={0.1}
            />
            <CalcInput
              label="Short Diameter"
              value={shortDiameter}
              onChange={setShortDiameter}
              placeholder="e.g. 15"
              required
              min={0}
              step={0.1}
            />
          </>
        )}

        <CalcInput
          label="Average Depth"
          value={depth}
          onChange={setDepth}
          placeholder="e.g. 4"
          required
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
          onClick={resetInputs}
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
