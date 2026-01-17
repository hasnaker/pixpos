import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-headline text-[#1D1D1F]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2 text-body
            bg-white/80 backdrop-blur-sm
            border border-[#D1D1D6] rounded-lg
            placeholder:text-[#AEAEB2]
            focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20
            transition-all duration-150
            ${error ? 'border-[#FF3B30] focus:border-[#FF3B30] focus:ring-[#FF3B30]/20' : ''}
            ${className}
          `}
          {...props}
        />
        {hint && !error && (
          <span className="text-footnote text-[#86868B]">{hint}</span>
        )}
        {error && (
          <span className="text-footnote text-[#FF3B30]">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
