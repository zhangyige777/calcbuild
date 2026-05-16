import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import type { CalcResultItem } from '../../utils/types';

export default function GambrelRoofCalculator() {
  const [span, setSpan] = useState('');
  const [lowerRise, setLowerRise] = useState('12');
  const [lowerRun, setLowerRun] = useState('12');
  const [upperRise, setUpperRise] = useState('5');
  const [upperRun, setUpperRun] = useState('12');
  const [buildingLength, setBuildingLength] = useState('');

  const debouncedSpan = useDebouncedValue(span);
  const debouncedLowerRise = useDebouncedValue(lowerRise);
  const debouncedLowerRun = useDebouncedValue(lowerRun);
  const debouncedUpperRise = useDebouncedValue(upperRise);
  const debouncedUpperRun = useDebouncedValue(upperRun);
  const debouncedBuildingLength = useDebouncedValue(buildingLength);

  const results: CalcResultItem[] = useMemo(() => {
    const s = parseFloat(debouncedSpan);
    const lr = parseFloat(debouncedLowerRise);
    const lru = parseFloat(debouncedLowerRun);
    const ur = parseFloat(debouncedUpperRise);
    const uru = parseFloat(debouncedUpperRun);
    const bl = parseFloat(debouncedBuildingLength);

    if (!s || !lr || !lru || !ur || !uru || !bl || s <= 0 || lr <= 0 || lru <= 0 || ur <= 0 || uru <= 0 || bl <= 0) return [];

    const halfSpan = s / 2; // ft

    // Rafter length per foot of horizontal run
    const lowerRafterPerFt = Math.sqrt((lr / 12) * (lr / 12) + 1); // per foot of horizontal run
    const upperRafterPerFt = Math.sqrt((ur / 12) * (ur / 12) + 1);

    // Split half-span proportionally by run values
    const lowerHoriz = halfSpan * (lru / (lru + uru));
    const upperHoriz = halfSpan * (uru / (lru + uru));

    const lowerRafterLen = lowerRafterPerFt * lowerHoriz;
    const upperRafterLen = upperRafterPerFt * upperHoriz;

    // Angles
    const lowerAngle = Math.atan(lr / lru) * (180 / Math.PI);
    const upperAngle = Math.atan(ur / uru) * (180 / Math.PI);

    // Total roof area (both sides)
    const totalArea = 2 * (lowerRafterLen + upperRafterLen) * bl;

    const items: CalcResultItem[] = [
      { label: 'Lower Rafter Length', value: lowerRafterLen.toFixed(2), unit: 'ft per side' },
      { label: 'Upper Rafter Length', value: upperRafterLen.toFixed(2), unit: 'ft per side' },
      { label: 'Lower Slope Angle', value: lowerAngle.toFixed(2), unit: 'degrees' },
      { label: 'Upper Slope Angle', value: upperAngle.toFixed(2), unit: 'degrees' },
      { label: 'Total Roof Area', value: totalArea.toFixed(1), unit: 'sq ft' },
    ];

    return items;
  }, [debouncedSpan, debouncedLowerRise, debouncedLowerRun, debouncedUpperRise, debouncedUpperRun, debouncedBuildingLength]);

  const hasValidInput = parseFloat(span) > 0 && parseFloat(lowerRise) > 0 && parseFloat(lowerRun) > 0 && parseFloat(upperRise) > 0 && parseFloat(upperRun) > 0 && parseFloat(buildingLength) > 0;

  return (
    <div className="space-y-6">
      {/* Calculator Widget */}
      <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
        <div className="space-y-4">
          <CalcInput label="Building Span" value={span} onChange={setSpan} unit="ft" placeholder="e.g. 24" required min={0} step={0.5} />
          <CalcInput label="Lower Slope Rise" value={lowerRise} onChange={setLowerRise} unit="in" placeholder="e.g. 12" required min={0} step={0.5} />
          <CalcInput label="Lower Slope Run" value={lowerRun} onChange={setLowerRun} unit="in" placeholder="e.g. 12" required min={0} step={0.5} />
          <CalcInput label="Upper Slope Rise" value={upperRise} onChange={setUpperRise} unit="in" placeholder="e.g. 5" required min={0} step={0.5} />
          <CalcInput label="Upper Slope Run" value={upperRun} onChange={setUpperRun} unit="in" placeholder="e.g. 12" required min={0} step={0.5} />
          <CalcInput label="Building Length" value={buildingLength} onChange={setBuildingLength} unit="ft" placeholder="e.g. 40" required min={0} step={0.5} />
        </div>

        <div className="flex items-center gap-3 mt-5">
          <button type="button" className="flex-1 py-2.5 bg-[#0F766E] text-white font-semibold rounded-[16px] hover:bg-[#0D6B63] transition-colors text-[1.6rem]">
            Calculate
          </button>
          <button type="button" onClick={() => { setSpan(''); setLowerRise('12'); setLowerRun('12'); setUpperRise('5'); setUpperRun('12'); setBuildingLength(''); }} className="px-4 py-2.5 text-[1.4rem] text-[#949494] dark:text-[#D4D4D4] hover:text-[#444] dark:hover:text-[#F5F5F5] hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded-[16px] transition-colors">
            Reset
          </button>
        </div>

        <CalcResult results={results} visible={hasValidInput} />
      </div>
    </div>
  );
}
