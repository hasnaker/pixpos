import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-headline text-[#1D1D1F] mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 text-body text-[#1D1D1F]
            bg-white/80 border border-[#E5E5EA] rounded-xl
            placeholder:text-[#AEAEB2]
            focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent
            transition-all duration-150
            ${error ? 'border-[#FF3B30] focus:ring-[#FF3B30]' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-footnote text-[#FF3B30]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-headline text-[#1D1D1F] mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-3 text-body text-[#1D1D1F]
            bg-white/80 border border-[#E5E5EA] rounded-xl
            placeholder:text-[#AEAEB2]
            focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent
            transition-all duration-150 resize-none
            ${error ? 'border-[#FF3B30] focus:ring-[#FF3B30]' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-footnote text-[#FF3B30]">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Input;
