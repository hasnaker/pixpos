import type { SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-[#121212]"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full py-[14px] px-4 pr-12 text-sm font-normal
            text-[#121212] bg-white
            border-[1.5px] border-[#E3E3E3] rounded-xl
            focus:outline-none focus:border-[#A27B5C] focus:ring-[3px] focus:ring-[rgba(162,123,92,0.2)]
            disabled:bg-[#F6F6F6] disabled:text-[#A5A5A5] disabled:cursor-not-allowed
            transition-all duration-200
            appearance-none cursor-pointer
            bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236C6C6C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")]
            bg-no-repeat bg-[right_16px_center]
            ${error ? 'border-[#F14C35] focus:border-[#F14C35] focus:ring-[rgba(241,76,53,0.2)]' : ''}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {hint && !error && (
          <span className="text-xs text-[#7F7F7F]">{hint}</span>
        )}
        {error && (
          <span className="text-xs text-[#F14C35]">{error}</span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
