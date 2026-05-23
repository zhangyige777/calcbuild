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

const QUALITY_COSTS: Record<string, { low: number; high: number }> = {
  standard: { low: 100, high: 200 },
  custom: { low: 200, high: 350 },
};

const SECOND_STORY_LOW = 1.20;
const SECOND_STORY_HIGH = 1.30;

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

  const debouncedLength = useDebouncedValue(length);
  const debouncedWidth = useDebouncedValue(width);
  const debouncedStories = useDebouncedValue(stories);
  const debouncedQuality = useDebouncedValue(quality);

  const results: CalcResultItem[] = useMemo(() => {
    const l = parseFloat(debouncedLength);
    const w = parseFloat(debouncedWidth);
    if (!l || l <= 0 || !w || w <= 0) return [];

    const totalSqft = l * w;
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

    const avgCost = (lowCost + highCost) / 2;
    const contingencyLow = lowCost * 0.10;
    const contingencyHigh = highCost * 0.20;

    const effectiveSqft = debouncedStories === '2' ? totalSqft * 2 : totalSqft;
    const timelineWeeks = WEEKS_PER_100SQFT[debouncedQuality] || WEEKS_PER_100SQFT.standard;
    const weeksLow = Math.ceil((effectiveSqft / 100) * timelineWeeks.low);
    const weeksHigh = Math.ceil((effectiveSqft / 100) * timelineWeeks.high);

    return [
      {
        label: 'Total Area',
        value: effectiveSqft.toLocaleString(),
        unit: 'sq ft',
      },
      {
        label: 'Low Estimate',
        value: fmt(lowCost),
        unit: '',
      },
      {
        label: 'Average Estimate',
        value: fmt(avgCost),
        unit: '',
      },
      {
        label: 'High Estimate',
        value: fmt(highCost),
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
  }, [debouncedLength, debouncedWidth, debouncedStories, debouncedQuality]);

  const breakdownRows = useMemo(() => {
    const l = parseFloat(debouncedLength);
    const w = parseFloat(debouncedWidth);
    if (!l || l <= 0 || !w || w <= 0) return null;

    const totalSqft = l * w;
    const costs = QUALITY_COSTS[debouncedQuality] || QUALITY_COSTS.standard;
    let lowCost = totalSqft * costs.low;
    let highCost = totalSqft * costs.high;
    if (debouncedStories === '2') {
      lowCost = totalSqft * costs.low + totalSqft * costs.low * SECOND_STORY_LOW;
      highCost = totalSqft * costs.high + totalSqft * costs.high * SECOND_STORY_HIGH;
    }
    const avgCost = (lowCost + highCost) / 2;

    return COST_BREAKDOWN.map(b => ({
      label: b.label,
      avg: avgCost * b.pct,
    }));
  }, [debouncedLength, debouncedWidth, debouncedStories, debouncedQuality]);

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
          onClick={() => { setLength(''); setWidth(''); setStories('1'); setQuality('standard'); }}
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
