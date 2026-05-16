import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import CalcSelect from '../calculator-ui/CalcSelect';
import type { CalcResultItem } from '../../utils/types';

const STYLE_OPTIONS = [
  { value: 'picket', label: 'Picket' },
  { value: 'chainlink', label: 'Chain Link' },
  { value: 'privacy', label: 'Privacy' },
];

const RAIL_OPTIONS = [
  { value: '2', label: '2 Rails' },
  { value: '3', label: '3 Rails' },
];

const PICKET_WIDTH = 3.5; // inches (standard 1x4)
const PICKET_SPACING = 2.5; // inches between pickets
const CONCRETE_PER_POST = 0.5; // 60lb bags

export default function FenceCalculator() {
  const [perimeter, setPerimeter] = useState('');
  const [postSpacing, setPostSpacing] = useState('8');
  const [numRails, setNumRails] = useState('2');
  const [style, setStyle] = useState('picket');

  const debouncedPerimeter = useDebouncedValue(perimeter);
  const debouncedSpacing = useDebouncedValue(postSpacing);

  const results: CalcResultItem[] = useMemo(() => {
    const p = parseFloat(debouncedPerimeter);
    const spacing = parseFloat(debouncedSpacing);
    const rails = parseInt(numRails);
    if (!p || p <= 0 || !spacing || spacing <= 0) return [];

    // Posts: one every X feet + 1 for the start, minus overlap for closed loop
    const posts = Math.ceil(p / spacing);
    const totalRails = posts * rails;

    // Concrete bags (one per post)
    const concreteBags = Math.ceil(posts * CONCRETE_PER_POST);

    const res: CalcResultItem[] = [
      { label: 'Posts Needed', value: posts.toString(), unit: '' },
      { label: 'Rails Needed', value: totalRails.toString(), unit: `(${rails}-rail)` },
      { label: 'Concrete Bags', value: concreteBags.toString(), unit: '60lb bags' },
    ];

    if (style === 'picket') {
      // Pickets per section = (spacing ft * 12) / (picket width + spacing)
      const sectionLengthIn = spacing * 12;
      const picketsPerSection = Math.ceil(sectionLengthIn / (PICKET_WIDTH + PICKET_SPACING));
      const totalPickets = picketsPerSection * posts;
      res.push(
        { label: 'Pickets Needed', value: totalPickets.toString(), unit: '' },
        { label: 'Picket Width', value: PICKET_WIDTH.toString(), unit: 'in' },
        { label: 'Picket Spacing', value: PICKET_SPACING.toString(), unit: 'in' },
      );
    } else if (style === 'chainlink') {
      // Chain link fabric in linear feet
      const fabricFt = Math.ceil(p);
      res.push({ label: 'Chain Link Fabric', value: fabricFt.toString(), unit: 'lin ft' });
    } else if (style === 'privacy') {
      // Privacy: boards edge-to-edge
      const sectionLengthIn = spacing * 12;
      const boardsPerSection = Math.ceil(sectionLengthIn / PICKET_WIDTH);
      const totalBoards = boardsPerSection * posts;
      res.push({ label: 'Privacy Boards', value: totalBoards.toString(), unit: '' });
    }

    return res;
  }, [debouncedPerimeter, debouncedSpacing, numRails, style]);

  const hasValidInput = parseFloat(perimeter) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label="Perimeter"
          value={perimeter}
          onChange={setPerimeter}
          units={[{ value: 'ft', label: 'ft' }]}
          unit="ft"
          onUnitChange={() => {}}
          placeholder="e.g. 200"
          required
          min={0}
          step={0.1}
        />
        <CalcInput
          label="Post Spacing"
          value={postSpacing}
          onChange={setPostSpacing}
          units={[{ value: 'ft', label: 'ft' }]}
          unit="ft"
          onUnitChange={() => {}}
          placeholder="8"
          min={0}
          step={0.5}
        />
        <CalcSelect
          label="Number of Rails"
          value={numRails}
          onChange={setNumRails}
          options={RAIL_OPTIONS}
        />
        <CalcSelect
          label="Fence Style"
          value={style}
          onChange={setStyle}
          options={STYLE_OPTIONS}
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
          onClick={() => { setPerimeter(''); setPostSpacing('8'); setNumRails('2'); setStyle('picket'); }}
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
