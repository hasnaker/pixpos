import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#121212]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A5A5A5]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full py-[14px] px-4 text-sm font-normal
              text-[#121212] bg-white
              border-[1.5px] border-[#E3E3E3] rounded-xl
              placeholder:text-[#A5A5A5]
              focus:outline-none focus:border-[#A27B5C] focus:ring-[3px] focus:ring-[rgba(162,123,92,0.2)]
              disabled:bg-[#F6F6F6] disabled:text-[#A5A5A5] disabled:cursor-not-allowed
              transition-all duration-200
              ${leftIcon ? 'pl-12' : ''}
              ${rightIcon ? 'pr-12' : ''}
              ${error ? 'border-[#F14C35] focus:border-[#F14C35] focus:ring-[rgba(241,76,53,0.2)]' : ''}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A5A5A5]">
              {rightIcon}
            </div>
          )}
        </div>
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

Input.displayName = 'Input';

export default Input;
