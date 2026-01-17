import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'tinted' | 'bordered' | 'plain';
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'red' | 'orange' | 'gray';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'filled', size = 'md', color = 'blue', className = '', children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2',
    };

    const colorMap = {
      blue: {
        filled: 'bg-[#007AFF] text-white hover:bg-[#0066D6] active:bg-[#0055B3] focus-visible:ring-[#007AFF]',
        tinted: 'bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF]/20 active:bg-[#007AFF]/30',
        bordered: 'border border-[#007AFF] text-[#007AFF] hover:bg-[#007AFF]/10 active:bg-[#007AFF]/20',
        plain: 'text-[#007AFF] hover:bg-[#007AFF]/10 active:bg-[#007AFF]/20',
      },
      green: {
        filled: 'bg-[#34C759] text-white hover:bg-[#2DB14E] active:bg-[#269A43]',
        tinted: 'bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759]/20 active:bg-[#34C759]/30',
        bordered: 'border border-[#34C759] text-[#34C759] hover:bg-[#34C759]/10',
        plain: 'text-[#34C759] hover:bg-[#34C759]/10',
      },
      red: {
        filled: 'bg-[#FF3B30] text-white hover:bg-[#E6352B] active:bg-[#CC2F26]',
        tinted: 'bg-[#FF3B30]/10 text-[#FF3B30] hover:bg-[#FF3B30]/20 active:bg-[#FF3B30]/30',
        bordered: 'border border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30]/10',
        plain: 'text-[#FF3B30] hover:bg-[#FF3B30]/10',
      },
      orange: {
        filled: 'bg-[#FF9500] text-white hover:bg-[#E68600] active:bg-[#CC7700]',
        tinted: 'bg-[#FF9500]/10 text-[#FF9500] hover:bg-[#FF9500]/20 active:bg-[#FF9500]/30',
        bordered: 'border border-[#FF9500] text-[#FF9500] hover:bg-[#FF9500]/10',
        plain: 'text-[#FF9500] hover:bg-[#FF9500]/10',
      },
      gray: {
        filled: 'bg-[#8E8E93] text-white hover:bg-[#7A7A7F] active:bg-[#66666B]',
        tinted: 'bg-[#8E8E93]/10 text-[#8E8E93] hover:bg-[#8E8E93]/20 active:bg-[#8E8E93]/30',
        bordered: 'border border-[#8E8E93] text-[#8E8E93] hover:bg-[#8E8E93]/10',
        plain: 'text-[#8E8E93] hover:bg-[#8E8E93]/10',
      },
    };

    const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${sizeStyles[size]} ${colorMap[color][variant]} ${disabled ? disabledStyles : ''} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
