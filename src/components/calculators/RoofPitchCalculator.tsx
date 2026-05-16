import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import { roofPitch } from '../../utils/formulas';
import type { CalcResultItem } from '../../utils/types';

const PITCH_CHART = [
  { rise: 1, run: 12, angle: '4.76°', factor: '1.003' },
  { rise: 2, run: 12, angle: '9.46°', factor: '1.014' },
  { rise: 3, run: 12, angle: '14.04°', factor: '1.031' },
  { rise: 4, run: 12, angle: '18.43°', factor: '1.054' },
  { rise: 5, run: 12, angle: '22.62°', factor: '1.083' },
  { rise: 6, run: 12, angle: '26.57°', factor: '1.118' },
  { rise: 7, run: 12, angle: '30.26°', factor: '1.158' },
  { rise: 8, run: 12, angle: '33.69°', factor: '1.202' },
  { rise: 9, run: 12, angle: '36.87°', factor: '1.250' },
  { rise: 10, run: 12, angle: '39.81°', factor: '1.302' },
  { rise: 11, run: 12, angle: '42.51°', factor: '1.357' },
  { rise: 12, run: 12, angle: '45.00°', factor: '1.414' },
];

export default function RoofPitchCalculator() {
  const [rise, setRise] = useState('');
  const [run, setRun] = useState('12');
  const [baseArea, setBaseArea] = useState('');

  const debouncedRise = useDebouncedValue(rise);
  const debouncedRun = useDebouncedValue(run);
  const debouncedBaseArea = useDebouncedValue(baseArea);

  const results: CalcResultItem[] = useMemo(() => {
    const r = parseFloat(debouncedRise);
    const ru = parseFloat(debouncedRun);
    if (!r || !ru || r <= 0 || ru <= 0) return [];

    const factor = roofPitch.factor(r, ru);
    const angle = roofPitch.angleDeg(r, ru);
    const gcdVal = gcd(Math.round(r * 100), Math.round(ru * 100));
    const simpleRise = Math.round(r * 100) / gcdVal;
    const simpleRun = Math.round(ru * 100) / gcdVal;

    const items: CalcResultItem[] = [
      { label: 'Pitch Ratio', value: `${Math.round(simpleRise)}/${Math.round(simpleRun)}`, unit: '' },
      { label: 'Angle', value: angle.toFixed(2), unit: 'degrees' },
      { label: 'Pitch Factor', value: factor.toFixed(3), unit: '' },
    ];

    const area = parseFloat(debouncedBaseArea);
    if (area > 0) {
      items.push({ label: 'Roof Area', value: roofPitch.roofArea(area, factor).toFixed(1), unit: 'sq ft' });
    }
    return items;
  }, [debouncedRise, debouncedRun, debouncedBaseArea]);

  const hasValidInput = parseFloat(rise) > 0 && parseFloat(run) > 0;

  return (
    <div className="space-y-6">
      {/* Calculator Widget */}
      <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
        <div className="space-y-4">
          <CalcInput label="Rise" value={rise} onChange={setRise} unit="in" placeholder="e.g. 6" required min={0} step={0.5} />
          <CalcInput label="Run" value={run} onChange={setRun} unit="in" placeholder="e.g. 12" required min={0} step={0.5} />
          <CalcInput label="Base Area (optional)" value={baseArea} onChange={setBaseArea} unit="sq ft" placeholder="e.g. 1000" min={0} step={1} />
        </div>

        <div className="flex items-center gap-3 mt-5">
          <button type="button" className="flex-1 py-2.5 bg-[#4D7C0F] text-white font-semibold rounded-[16px] hover:bg-[#3F6212] transition-colors text-[1.6rem]">
            Calculate
          </button>
          <button type="button" onClick={() => { setRise(''); setRun('12'); setBaseArea(''); }} className="px-4 py-2.5 text-[1.4rem] text-[#949494] dark:text-[#D4D4D4] hover:text-[#444] dark:hover:text-[#F5F5F5] hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded-[16px] transition-colors">
            Reset
          </button>
        </div>

        <CalcResult results={results} visible={hasValidInput} />
      </div>

      {/* Pitch Factor Chart */}
      <div>
        <h2 className="text-[2.2rem] font-bold text-[#444] dark:text-[#F5F5F5] mb-[15px]">Common Roof Pitch Factors</h2>
        <div className="border border-[#D4D4D4] dark:border-[#525252] rounded-[16px] overflow-hidden">
          <table className="w-full text-[1.6rem]">
            <thead>
              <tr className="bg-[#F5F5F5] dark:bg-[#333] border-b border-[#D4D4D4] dark:border-[#525252]">
                <th className="text-left px-[15px] py-[10px] text-[1.3rem] font-semibold text-[#949494] dark:text-[#D4D4D4] uppercase">Pitch</th>
                <th className="text-left px-[15px] py-[10px] text-[1.3rem] font-semibold text-[#949494] dark:text-[#D4D4D4] uppercase">Angle</th>
                <th className="text-left px-[15px] py-[10px] text-[1.3rem] font-semibold text-[#949494] dark:text-[#D4D4D4] uppercase">Factor</th>
              </tr>
            </thead>
            <tbody>
              {PITCH_CHART.map((row, i) => (
                <tr key={row.rise} className={`border-b border-[#D4D4D4] dark:border-[#444] last:border-0 ${i % 2 === 1 ? 'bg-[#FAFAFA] dark:bg-[#2a2a2a]' : 'bg-white dark:bg-[#262626]'}`}>
                  <td className="px-[15px] py-[8px] font-mono text-[#444] dark:text-[#F5F5F5]">{row.rise}/{row.run}</td>
                  <td className="px-[15px] py-[8px] text-[#737373] dark:text-[#D4D4D4]">{row.angle}</td>
                  <td className="px-[15px] py-[8px] text-[#737373] dark:text-[#D4D4D4]">{row.factor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}
