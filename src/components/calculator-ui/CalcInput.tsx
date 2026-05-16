import { useState, useEffect } from 'react';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  units?: { value: string; label: string }[];
  onUnitChange?: (unit: string) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  step?: number;
}

export default function CalcInput({
  label,
  value,
  onChange,
  unit,
  units,
  onUnitChange,
  placeholder = '0',
  required = false,
  min,
  step,
}: Props) {
  const hasUnitSelector = units && onUnitChange;
  const displayUnit = hasUnitSelector ? unit : unit;

  return (
    <div className="flex flex-col gap-[5px]">
      <label className="text-[1.3rem] font-semibold text-[#949494] dark:text-[#D4D4D4] uppercase tracking-wide">
        {label}
        {required && <span className="text-[#4D7C0F] ml-[2px]">*</span>}
      </label>
      <div className="flex rounded-[16px] border border-[#D4D4D4] dark:border-[#525252] bg-white dark:bg-[#333] focus-within:border-[#4D7C0F] dark:focus-within:border-[#BEF264] transition-all overflow-hidden min-h-[40px]">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          step={step}
          required={required}
          className="flex-1 min-w-0 px-[15px] py-[10px] text-[1.8rem] text-[#444] dark:text-[#F5F5F5] bg-transparent outline-none font-mono placeholder:text-[#737373] dark:placeholder:text-[#949494]"
        />
        {hasUnitSelector ? (
          <select
            value={unit}
            onChange={(e) => onUnitChange(e.target.value)}
            className="px-[12px] py-[10px] text-[1.3rem] font-medium text-[#737373] dark:text-[#D4D4D4] bg-[#F5F5F5] dark:bg-[#323232] border-l border-[#D4D4D4] dark:border-[#525252] outline-none cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#404040] transition-colors"
          >
            {units!.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        ) : displayUnit ? (
          <span className="px-[12px] py-[10px] text-[1.3rem] font-medium text-[#737373] dark:text-[#D4D4D4] bg-[#F5F5F5] dark:bg-[#323232] border-l border-[#D4D4D4] dark:border-[#525252]">
            {displayUnit}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
