import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import CalcSelect from '../calculator-ui/CalcSelect';
import type { CalcResultItem } from '../../utils/types';

const INSULATION_TYPE_OPTIONS = [
  { value: 'fiberglass', label: 'Fiberglass Batt' },
  { value: 'cellulose', label: 'Blown-In Cellulose' },
  { value: 'rigid_foam', label: 'Rigid Foam Board' },
];

// R-value per inch for each insulation type
const R_PER_INCH: Record<string, number> = {
  fiberglass: 3.2,
  cellulose: 3.5,
  rigid_foam: 5.0,
};

// Cost per sq ft per inch of thickness (approximate)
const COST_PER_SQFT_INCH: Record<string, number> = {
  fiberglass: 0.15,
  cellulose: 0.12,
  rigid_foam: 0.55,
};

// Coverage per bag/batt in sq ft (approximate)
const COVERAGE_PER_UNIT: Record<string, number> = {
  fiberglass: 40,   // one batt covers ~40 sq ft
  cellulose: 30,    // one bag covers ~30 sq ft at standard depth
  rigid_foam: 32,   // one 4x8 sheet = 32 sq ft
};

export default function InsulationCalculator() {
  const [area, setArea] = useState('');
  const [desiredRValue, setDesiredRValue] = useState('');
  const [insulationType, setInsulationType] = useState('fiberglass');

  const debouncedArea = useDebouncedValue(area);
  const debouncedRValue = useDebouncedValue(desiredRValue);

  const results: CalcResultItem[] = useMemo(() => {
    const a = parseFloat(debouncedArea);
    const r = parseFloat(debouncedRValue);
    if (!a || a <= 0 || !r || r <= 0) return [];

    const rPerInch = R_PER_INCH[insulationType];
    const costPerSqftInch = COST_PER_SQFT_INCH[insulationType];
    const coveragePerUnit = COVERAGE_PER_UNIT[insulationType];

    // Thickness needed: R-value / R per inch
    const thicknessInches = r / rPerInch;

    // Units (bags/batts/sheets) needed
    const unitsNeeded = Math.ceil(a / coveragePerUnit);

    // Cost estimate: area * thickness * cost per sq ft per inch
    const cost = a * thicknessInches * costPerSqftInch;

    const unitLabel = insulationType === 'fiberglass' ? 'batts'
      : insulationType === 'cellulose' ? 'bags'
      : 'sheets';

    return [
      { label: 'Required Thickness', value: thicknessInches.toFixed(1), unit: 'inches' },
      { label: `${unitLabel.charAt(0).toUpperCase() + unitLabel.slice(1)} Needed`, value: unitsNeeded.toString(), unit: unitLabel },
      { label: 'Estimated Cost', value: `$${cost.toFixed(2)}`, unit: '' },
      { label: 'R-Value per Inch', value: rPerInch.toFixed(1), unit: 'R/inch' },
      { label: 'Total Area', value: a.toLocaleString(), unit: 'sq ft' },
    ];
  }, [debouncedArea, debouncedRValue, insulationType]);

  const hasValidInput = parseFloat(area) > 0 && parseFloat(desiredRValue) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label="Area to Insulate"
          value={area}
          onChange={setArea}
          units={[{ value: 'sqft', label: 'sq ft' }]}
          unit="sqft"
          onUnitChange={() => {}}
          placeholder="e.g. 1000"
          required
          min={0}
          step={1}
        />
        <CalcInput
          label="Desired R-Value"
          value={desiredRValue}
          onChange={setDesiredRValue}
          units={[{ value: 'R', label: 'R-value' }]}
          unit="R"
          onUnitChange={() => {}}
          placeholder="e.g. 38"
          required
          min={0}
          step={1}
        />
        <CalcSelect
          label="Insulation Type"
          value={insulationType}
          onChange={setInsulationType}
          options={INSULATION_TYPE_OPTIONS}
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
          onClick={() => { setArea(''); setDesiredRValue(''); setInsulationType('fiberglass'); }}
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
