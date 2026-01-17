import type { HTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { X } from 'lucide-react';

type ChipVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  size?: 'sm' | 'md';
  leftIcon?: ReactNode;
  onRemove?: () => void;
  removable?: boolean;
}

const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ 
    variant = 'neutral', 
    size = 'md',
    leftIcon,
    onRemove,
    removable = false,
    className = '', 
    children, 
    ...props 
  }, ref) => {
    const variantStyles = {
      primary: 'bg-[#ECE5DE] text-[#A27B5C]',
      success: 'bg-[#D3F7ED] text-[#178F6F]',
      warning: 'bg-[#FFEECE] text-[#D48D09]',
      error: 'bg-[#FCDBD7] text-[#A13323]',
      info: 'bg-[#D0EBFF] text-[#0C67AA]',
      neutral: 'bg-[#F6F6F6] text-[#6C6C6C]',
    };

    const sizeStyles = {
      sm: 'px-2 py-1 text-[10px] gap-1',
      md: 'px-3 py-1.5 text-xs gap-1.5',
    };

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center rounded-full font-medium
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}
        {children}
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className="
              flex-shrink-0 ml-1 p-0.5 rounded-full
              hover:bg-black/10 transition-colors
            "
            aria-label="Kaldır"
          >
            <X size={size === 'sm' ? 10 : 12} />
          </button>
        )}
      </span>
    );
  }
);

Chip.displayName = 'Chip';

export default Chip;
