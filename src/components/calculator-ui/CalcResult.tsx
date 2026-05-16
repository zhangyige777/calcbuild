import type { CalcResultItem } from '../../utils/types';

interface Props {
  results: CalcResultItem[];
  visible: boolean;
}

export default function CalcResult({ results, visible }: Props) {
  if (!visible || results.length === 0) return null;

  return (
    <div className="mt-[20px] border-t border-[#D4D4D4] dark:border-[#525252] pt-[20px]">
      <h3 className="text-[1.8rem] font-bold text-[#444] dark:text-[#F5F5F5] uppercase tracking-wide mb-[15px]">Results</h3>
      <div className="border border-[#949494] dark:border-[#525252] rounded-[16px] p-[5px] text-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
          {results.map((item) => (
            <div key={item.label} className="p-[5px_10px] border border-[#D4D4D4] dark:border-[#525252] rounded-[10px] min-w-[65px] min-h-[36px]">
              <div className="text-[2.0rem] font-mono font-bold text-[#444] dark:text-[#F5F5F5] min-w-[85px] border-b-[3px] border-[#D4D4D4] dark:border-[#525252]">
                {typeof item.value === 'number' ? item.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : item.value}
              </div>
              <div className="text-[1.4rem] text-[#949494] dark:text-[#D4D4D4] mt-[5px]">
                {item.label}{item.unit ? ` (${item.unit})` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
