import { useState, useMemo } from 'react';
import CalcInput, { useDebouncedValue } from '../calculator-ui/CalcInput';
import CalcSelect from '../calculator-ui/CalcSelect';
import CalcResult from '../calculator-ui/CalcResult';
import type { CalcResultItem } from '../../utils/types';

const STORIES_OPTIONS = [
  { value: '1', label: '1 Story' },
  { value: '2', label: '2 Stories' },
];

const QUALITY_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'custom', label: 'Custom' },
];

const ROOM_OPTIONS = [
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'family_room', label: 'Family Room' },
  { value: 'garage', label: 'Garage' },
  { value: 'sunroom', label: 'Sunroom' },
  { value: 'master_suite', label: 'Master Suite' },
  { value: 'in_law_suite', label: 'In-Law Suite' },
  { value: 'general', label: 'General / Other' },
];

const REGION_OPTIONS = [
  { value: 'national', label: 'National Average' },
  { value: 'northeast', label: 'Northeast' },
  { value: 'southeast', label: 'Southeast' },
  { value: 'midwest', label: 'Midwest' },
  { value: 'west', label: 'West Coast' },
  { value: 'southwest', label: 'Southwest' },
];

const FOUNDATION_OPTIONS = [
  { value: 'slab', label: 'Concrete Slab' },
  { value: 'crawlspace', label: 'Crawl Space' },
  { value: 'basement', label: 'Basement' },
];

const ROOF_OPTIONS = [
  { value: 'gable', label: 'Gable Roof' },
  { value: 'hip', label: 'Hip Roof' },
  { value: 'flat', label: 'Flat Roof' },
  { value: 'shed', label: 'Shed Roof' },
];

const HVAC_OPTIONS = [
  { value: 'extend', label: 'Extend Existing HVAC' },
  { value: 'new_unit', label: 'New Separate Unit' },
  { value: 'none', label: 'No HVAC (Garage/Shed)' },
];

const QUALITY_COSTS: Record<string, { low: number; high: number }> = {
  standard: { low: 100, high: 200 },
  custom: { low: 200, high: 350 },
};

const SECOND_STORY_LOW = 1.20;
const SECOND_STORY_HIGH = 1.30;

const ROOM_MULTIPLIER: Record<string, number> = {
  bathroom: 1.15,
  kitchen: 1.20,
  garage: 0.75,
  sunroom: 1.10,
  master_suite: 1.10,
  in_law_suite: 1.05,
  bedroom: 1.0,
  family_room: 1.0,
  general: 1.0,
};

const REGION_MULTIPLIER: Record<string, number> = {
  national: 1.0,
  northeast: 1.25,
  southeast: 0.90,
  midwest: 0.90,
  west: 1.30,
  southwest: 0.95,
};

const FOUNDATION_MULTIPLIER: Record<string, number> = {
  slab: 1.0,
  crawlspace: 1.3,
  basement: 2.0,
};

const ROOF_MULTIPLIER: Record<string, number> = {
  gable: 1.0,
  hip: 1.15,
  flat: 0.85,
  shed: 0.90,
};

const HVAC_MULTIPLIER: Record<string, number> = {
  extend: 1.0,
  new_unit: 1.5,
  none: 0,
};

const COST_BREAKDOWN = [
  { label: 'Foundation', pct: 0.125 },
  { label: 'Framing', pct: 0.175 },
  { label: 'Roofing', pct: 0.125 },
  { label: 'Electrical', pct: 0.10 },
  { label: 'Plumbing', pct: 0.10 },
  { label: 'HVAC', pct: 0.09 },
  { label: 'Permits & Fees', pct: 0.065 },
  { label: 'Design & Engineering', pct: 0.06 },
  { label: 'Finishes & Misc', pct: 0.16 },
];

const WEEKS_PER_100SQFT: Record<string, { low: number; high: number }> = {
  standard: { low: 0.8, high: 1.2 },
  custom: { low: 1.2, high: 1.8 },
};

const fmt = (n: number) =>
  '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 });

export default function AdditionCostCalculator() {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [stories, setStories] = useState('1');
  const [quality, setQuality] = useState('standard');
  const [roomType, setRoomType] = useState('general');
  const [region, setRegion] = useState('national');
  const [foundationType, setFoundationType] = useState('slab');
  const [roofType, setRoofType] = useState('gable');
  const [hvacOption, setHvacOption] = useState('extend');
  const [includePermit, setIncludePermit] = useState(true);

  const debouncedLength = useDebouncedValue(length);
  const debouncedWidth = useDebouncedValue(width);
  const debouncedStories = useDebouncedValue(stories);
  const debouncedQuality = useDebouncedValue(quality);
  const debouncedRoomType = useDebouncedValue(roomType);
  const debouncedRegion = useDebouncedValue(region);
  const debouncedFoundationType = useDebouncedValue(foundationType);
  const debouncedRoofType = useDebouncedValue(roofType);
  const debouncedHvacOption = useDebouncedValue(hvacOption);
  const debouncedIncludePermit = useDebouncedValue(includePermit);

  /** Compute base cost before category-specific multipliers */
  const computeBaseCost = (totalSqft: number) => {
    const costs = QUALITY_COSTS[debouncedQuality] || QUALITY_COSTS.standard;
    let lowCost = totalSqft * costs.low;
    let highCost = totalSqft * costs.high;

    if (debouncedStories === '2') {
      const firstFloorLow = totalSqft * costs.low;
      const firstFloorHigh = totalSqft * costs.high;
      const secondFloorLow = totalSqft * costs.low * SECOND_STORY_LOW;
      const secondFloorHigh = totalSqft * costs.high * SECOND_STORY_HIGH;
      lowCost = firstFloorLow + secondFloorLow;
      highCost = firstFloorHigh + secondFloorHigh;
    }

    return { lowCost, highCost };
  };

  /** Apply room-type and region multipliers to the total */
  const applyGlobalMultipliers = (lowCost: number, highCost: number) => {
    const roomMult = ROOM_MULTIPLIER[debouncedRoomType] ?? 1.0;
    const regionMult = REGION_MULTIPLIER[debouncedRegion] ?? 1.0;
    const combined = roomMult * regionMult;
    return {
      lowCost: lowCost * combined,
      highCost: highCost * combined,
    };
  };

  /** Foundation adjustment: multiplier applies only to the foundation portion */
  const foundationAdjustment = (avgCost: number) => {
    const baseFoundPct = COST_BREAKDOWN.find(b => b.label === 'Foundation')!.pct;
    const foundMult = FOUNDATION_MULTIPLIER[debouncedFoundationType] ?? 1.0;
    return avgCost * baseFoundPct * (foundMult - 1.0);
  };

  /** Roof adjustment: multiplier applies only to the roofing portion */
  const roofAdjustment = (avgCost: number) => {
    const baseRoofPct = COST_BREAKDOWN.find(b => b.label === 'Roofing')!.pct;
    const roofMult = ROOF_MULTIPLIER[debouncedRoofType] ?? 1.0;
    return avgCost * baseRoofPct * (roofMult - 1.0);
  };

  /** HVAC adjustment: multiplier applies only to the HVAC portion */
  const hvacAdjustment = (avgCost: number) => {
    const baseHvacPct = COST_BREAKDOWN.find(b => b.label === 'HVAC')!.pct;
    const hvacMult = HVAC_MULTIPLIER[debouncedHvacOption] ?? 1.0;
    return avgCost * baseHvacPct * (hvacMult - 1.0);
  };

  /** Permit cost based on area */
  const permitCost = (totalSqft: number) => {
    if (!debouncedIncludePermit) return 0;
    if (totalSqft <= 200) return 1500;
    if (totalSqft <= 500) return 3000;
    return 5000;
  };

  const results: CalcResultItem[] = useMemo(() => {
    const l = parseFloat(debouncedLength);
    const w = parseFloat(debouncedWidth);
    if (!l || l <= 0 || !w || w <= 0) return [];

    const totalSqft = l * w;
    const { lowCost: baseLow, highCost: baseHigh } = computeBaseCost(totalSqft);
    const { lowCost, highCost } = applyGlobalMultipliers(baseLow, baseHigh);

    const avgCost = (lowCost + highCost) / 2;
    const foundAdj = foundationAdjustment(avgCost);
    const roofAdj = roofAdjustment(avgCost);
    const hvacAdj = hvacAdjustment(avgCost);
    const permit = permitCost(totalSqft);

    const adjustedLow = lowCost + foundAdj + roofAdj + hvacAdj + permit;
    const adjustedHigh = highCost + foundAdj + roofAdj + hvacAdj + permit;
    const adjustedAvg = (adjustedLow + adjustedHigh) / 2;

    const contingencyLow = adjustedLow * 0.10;
    const contingencyHigh = adjustedHigh * 0.20;

    const effectiveSqft = debouncedStories === '2' ? totalSqft * 2 : totalSqft;
    const timelineWeeks = WEEKS_PER_100SQFT[debouncedQuality] || WEEKS_PER_100SQFT.standard;
    const weeksLow = Math.ceil((effectiveSqft / 100) * timelineWeeks.low);
    const weeksHigh = Math.ceil((effectiveSqft / 100) * timelineWeeks.high);

    const regionLabel = REGION_OPTIONS.find(r => r.value === debouncedRegion)?.label ?? 'National Average';

    return [
      {
        label: 'Total Area',
        value: effectiveSqft.toLocaleString(),
        unit: 'sq ft',
      },
      {
        label: 'Region',
        value: regionLabel,
        unit: '',
      },
      {
        label: 'Low Estimate',
        value: fmt(adjustedLow),
        unit: '',
      },
      {
        label: 'Average Estimate',
        value: fmt(adjustedAvg),
        unit: '',
      },
      {
        label: 'High Estimate',
        value: fmt(adjustedHigh),
        unit: '',
      },
      {
        label: 'Contingency (10–20%)',
        value: `${fmt(contingencyLow)} – ${fmt(contingencyHigh)}`,
        unit: '',
      },
      {
        label: 'Estimated Timeline',
        value: `${weeksLow}–${weeksHigh}`,
        unit: 'weeks',
      },
    ];
  }, [debouncedLength, debouncedWidth, debouncedStories, debouncedQuality, debouncedRoomType, debouncedRegion, debouncedFoundationType, debouncedRoofType, debouncedHvacOption, debouncedIncludePermit]);

  const breakdownRows = useMemo(() => {
    const l = parseFloat(debouncedLength);
    const w = parseFloat(debouncedWidth);
    if (!l || l <= 0 || !w || w <= 0) return null;

    const totalSqft = l * w;
    const { lowCost: baseLow, highCost: baseHigh } = computeBaseCost(totalSqft);
    const { lowCost, highCost } = applyGlobalMultipliers(baseLow, baseHigh);
    const avgCost = (lowCost + highCost) / 2;

    const foundAdj = foundationAdjustment(avgCost);
    const roofAdj = roofAdjustment(avgCost);
    const hvacAdj = hvacAdjustment(avgCost);
    const permit = permitCost(totalSqft);

    const totalAdj = foundAdj + roofAdj + hvacAdj + permit;
    const totalAvg = avgCost + totalAdj;

    const rows = COST_BREAKDOWN.map(b => {
      let lineAdj = 0;
      if (b.label === 'Foundation') lineAdj = foundAdj;
      else if (b.label === 'Roofing') lineAdj = roofAdj;
      else if (b.label === 'HVAC') lineAdj = hvacAdj;
      else if (b.label === 'Permits & Fees') lineAdj = permit;
      return {
        label: b.label,
        avg: avgCost * b.pct + lineAdj,
      };
    });

    return rows;
  }, [debouncedLength, debouncedWidth, debouncedStories, debouncedQuality, debouncedRoomType, debouncedRegion, debouncedFoundationType, debouncedRoofType, debouncedHvacOption, debouncedIncludePermit]);

  const hasValidInput = parseFloat(length) > 0 && parseFloat(width) > 0;

  return (
    <div className="border-2 border-primary-200 dark:border-[#525252] rounded-xl p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
      <div className="space-y-4">
        <CalcInput
          label="Addition Length"
          value={length}
          onChange={setLength}
          unit="ft"
          placeholder="e.g. 24"
          required
          min={0}
          step={1}
        />
        <CalcInput
          label="Addition Width"
          value={width}
          onChange={setWidth}
          unit="ft"
          placeholder="e.g. 12"
          required
          min={0}
          step={1}
        />
        <CalcSelect
          label="Number of Stories"
          value={stories}
          onChange={setStories}
          options={STORIES_OPTIONS}
          required
        />
        <CalcSelect
          label="Quality Level"
          value={quality}
          onChange={setQuality}
          options={QUALITY_OPTIONS}
          required
        />
        <CalcSelect
          label="Room Type"
          value={roomType}
          onChange={setRoomType}
          options={ROOM_OPTIONS}
          required
        />
        <CalcSelect
          label="Region"
          value={region}
          onChange={setRegion}
          options={REGION_OPTIONS}
          required
        />
        <CalcSelect
          label="Foundation Type"
          value={foundationType}
          onChange={setFoundationType}
          options={FOUNDATION_OPTIONS}
          required
        />
        <CalcSelect
          label="Roof Type"
          value={roofType}
          onChange={setRoofType}
          options={ROOF_OPTIONS}
          required
        />
        <CalcSelect
          label="HVAC Option"
          value={hvacOption}
          onChange={setHvacOption}
          options={HVAC_OPTIONS}
          required
        />
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="include_permit"
            checked={includePermit}
            onChange={(e) => setIncludePermit(e.target.checked)}
            className="w-[18px] h-[18px] accent-[#4D7C0F] rounded"
          />
          <label
            htmlFor="include_permit"
            className="text-[1.3rem] font-semibold text-[#949494] dark:text-[#D4D4D4] uppercase tracking-wide cursor-pointer select-none"
          >
            Include Permits &amp; Fees ($1,500–$5,000)
          </label>
        </div>
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
          onClick={() => { setLength(''); setWidth(''); setStories('1'); setQuality('standard'); setRoomType('general'); setRegion('national'); setFoundationType('slab'); setRoofType('gable'); setHvacOption('extend'); setIncludePermit(true); }}
          className="px-4 py-2.5 text-[1.4rem] text-[#949494] dark:text-[#D4D4D4] hover:text-[#444] dark:hover:text-[#F5F5F5] hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded-[16px] transition-colors"
        >
          Reset
        </button>
      </div>

      <CalcResult results={results} visible={hasValidInput} />

      {breakdownRows && (
        <div className="mt-4 pt-4 border-t border-grey-300 dark:border-grey-600">
          <h4 className="text-[1.5rem] font-semibold text-[#444] dark:text-grey-100 mb-3">Cost Breakdown (Average)</h4>
          <div className="space-y-2">
            {breakdownRows.map(row => (
              <div key={row.label} className="flex justify-between items-center text-[1.4rem]">
                <span className="text-grey-600 dark:text-grey-300">{row.label}</span>
                <span className="font-medium text-grey-800 dark:text-grey-100">{fmt(row.avg)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
