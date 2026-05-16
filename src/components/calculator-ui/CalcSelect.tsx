interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}

export default function CalcSelect({ label, value, onChange, options, required }: Props) {
  return (
    <div className="flex flex-col gap-[5px]">
      <label className="text-[1.3rem] font-semibold text-[#949494] dark:text-[#D4D4D4] uppercase tracking-wide">
        {label}
        {required && <span className="text-[#4D7C0F] ml-[2px]">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="px-[15px] py-[10px] border border-[#D4D4D4] dark:border-[#525252] rounded-[16px] text-[1.8rem] text-[#444] dark:text-[#F5F5F5] bg-white dark:bg-[#333] focus:border-[#4D7C0F] dark:focus:border-[#BEF264] outline-none transition-colors min-h-[40px]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
