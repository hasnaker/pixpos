import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    leftIcon,
    rightIcon,
    isLoading,
    className = '', 
    children, 
    disabled, 
    ...props 
  }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-semibold rounded-xl
      transition-all duration-200 ease-out
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      active:scale-[0.98]
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    `;
    
    const sizeStyles = {
      sm: 'px-4 py-2 text-xs min-h-[36px] rounded-lg',
      md: 'px-6 py-3 text-sm min-h-[44px]',
      lg: 'px-8 py-4 text-base min-h-[56px]',
    };

    const variantStyles = {
      primary: `
        bg-[#A27B5C] text-white
        hover:bg-[#87674D] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(162,123,92,0.3)]
        active:bg-[#513E2E] active:translate-y-0
        focus-visible:ring-[#A27B5C]
      `,
      secondary: `
        bg-[#3F4E4F] text-white
        hover:bg-[#354142] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(63,78,79,0.3)]
        active:bg-[#202728] active:translate-y-0
        focus-visible:ring-[#3F4E4F]
      `,
      outline: `
        bg-transparent text-[#A27B5C] border-[1.5px] border-[#A27B5C]
        hover:bg-[#ECE5DE]
        active:bg-[#E0D3C9]
        focus-visible:ring-[#A27B5C]
      `,
      ghost: `
        bg-transparent text-[#6C6C6C]
        hover:bg-[#F6F6F6] hover:text-[#121212]
        active:bg-[#EEEEEE]
        focus-visible:ring-[#A27B5C]
      `,
      danger: `
        bg-[#F14C35] text-white
        hover:bg-[#A13323] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(241,76,53,0.3)]
        active:bg-[#501912] active:translate-y-0
        focus-visible:ring-[#F14C35]
      `,
      success: `
        bg-[#22D7A6] text-white
        hover:bg-[#178F6F] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(34,215,166,0.3)]
        active:bg-[#0B4837] active:translate-y-0
        focus-visible:ring-[#22D7A6]
      `,
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg 
            className="animate-spin h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
