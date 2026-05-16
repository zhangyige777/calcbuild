import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcResult from '../calculator-ui/CalcResult';
import type { CalcResultItem } from '../../utils/types';

// IPC standard drainage capacities (sq ft at 1 in/hr)
const GUTTER_CAPACITIES = {
  '5': 5520,  // 5" K-style
  '6': 7960,  // 6" K-style
};

const DOWNSPOUT_CAPACITY = 340; // sq ft per downspout at 1 in/hr (2x3 in)

export default function GutterCalculator() {
  const [roofArea, setRoofArea] = useState('');
  const [rainfallIntensity, setRainfallIntensity] = useState('1');
  const [roofPitch, setRoofPitch] = useState('');

  const debouncedArea = useDebouncedValue(roofArea);
  const debouncedRainfall = useDebouncedValue(rainfallIntensity);
  const debouncedPitch = useDebouncedValue(roofPitch);

  const results: CalcResultItem[] = useMemo(() => {
    const area = parseFloat(debouncedArea);
    const rainfall = parseFloat(debouncedRainfall);
    if (!area || area <= 0 || !rainfall || rainfall <= 0) return [];

    // Adjusted drainage area based on rainfall intensity
    const adjustedArea = area * rainfall;

    // Pitch adjustment factor
    const pitch = parseFloat(debouncedPitch);
    let pitchFactor = 1;
    if (pitch > 0) {
      pitchFactor = Math.sqrt(1 + (pitch / 12) * (pitch / 12));
    }

    const effectiveArea = adjustedArea * pitchFactor;

    // Determine recommended gutter size
    const recommendedSize = effectiveArea <= GUTTER_CAPACITIES['5'] ? '5' : '6';
    const gutterCapacity = GUTTER_CAPACITIES[recommendedSize as keyof typeof GUTTER_CAPACITIES];

    // Downspouts needed
    const downspouts = Math.max(1, Math.ceil(effectiveArea / (DOWNSPOUT_CAPACITY * rainfall)));

    // Drainage capacity as percentage
    const drainagePercent = (gutterCapacity / effectiveArea) * 100;

    return [
      { label: 'Recommended Gutter Size', value: `${recommendedSize}"`, unit: 'K-style' },
      { label: 'Gutter Capacity', value: gutterCapacity.toLocaleString(), unit: 'sq ft @ 1"/hr' },
      { label: 'Effective Drainage Area', value: effectiveArea.toFixed(0), unit: 'sq ft' },
      { label: 'Downspouts Needed', value: downspouts.toString(), unit: '' },
      { label: 'Drainage Capacity', value: drainagePercent.toFixed(1), unit: '%' },
    ];
  }, [debouncedArea, debouncedRainfall, debouncedPitch]);

  const hasValidInput = parseFloat(roofArea) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      {/* Inputs */}
      <div className="space-y-4">
        <CalcInput
          label="Roof Area"
          value={roofArea}
          onChange={setRoofArea}
          units={[{ value: 'sqft', label: 'sq ft' }]}
          unit="sqft"
          onUnitChange={() => {}}
          placeholder="e.g. 2000"
          required
          min={0}
          step={1}
        />
        <CalcInput
          label="Rainfall Intensity"
          value={rainfallIntensity}
          onChange={setRainfallIntensity}
          units={[{ value: 'in/hr', label: 'in/hr' }]}
          unit="in/hr"
          onUnitChange={() => {}}
          placeholder="1"
          min={0}
          step={0.1}
        />
        <CalcInput
          label="Roof Pitch"
          value={roofPitch}
          onChange={setRoofPitch}
          units={[{ value: 'in/ft', label: 'in/ft' }]}
          unit="in/ft"
          onUnitChange={() => {}}
          placeholder="e.g. 6 (optional)"
          min={0}
          step={0.1}
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
          onClick={() => { setRoofArea(''); setRainfallIntensity('1'); setRoofPitch(''); }}
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
