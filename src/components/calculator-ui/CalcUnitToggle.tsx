interface Props {
  imperial: boolean;
  onChange: (isImperial: boolean) => void;
}

export default function CalcUnitToggle({ imperial, onChange }: Props) {
  return (
    <div className="flex items-center gap-[10px] p-[10px] border border-[#949494] dark:border-[#525252] rounded-[16px]">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`px-[15px] py-[12px] text-[1.4rem] font-semibold rounded-[10px] border transition-all ${
          imperial
            ? 'border-[#4D7C0F] outline-[1px] outline-[#4D7C0F] text-[#4D7C0F] bg-[#F7FEE7] dark:bg-[#365314] dark:border-[#BEF264] dark:outline-[#BEF264] dark:text-[#BEF264]'
            : 'border-[#D4D4D4] dark:border-[#525252] text-[#444] dark:text-[#D4D4D4] hover:border-[#949494] dark:hover:border-[#B6B6B6]'
        }`}
      >
        Imperial
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`px-[15px] py-[12px] text-[1.4rem] font-semibold rounded-[10px] border transition-all ${
          !imperial
            ? 'border-[#4D7C0F] outline-[1px] outline-[#4D7C0F] text-[#4D7C0F] bg-[#F7FEE7] dark:bg-[#365314] dark:border-[#BEF264] dark:outline-[#BEF264] dark:text-[#BEF264]'
            : 'border-[#D4D4D4] dark:border-[#525252] text-[#444] dark:text-[#D4D4D4] hover:border-[#949494] dark:hover:border-[#B6B6B6]'
        }`}
      >
        Metric
      </button>
    </div>
  );
}
