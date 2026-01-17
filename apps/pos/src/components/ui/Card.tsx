import type { HTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  header?: ReactNode;
  footer?: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    variant = 'default', 
    padding = 'md', 
    header,
    footer,
    className = '', 
    children, 
    ...props 
  }, ref) => {
    const baseStyles = 'rounded-2xl transition-all duration-200 bg-white';

    const variantStyles = {
      default: 'border border-[#E3E3E3] shadow-[0_2px_8px_rgba(0,0,0,0.08)]',
      elevated: 'shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)]',
      bordered: 'border border-[#E3E3E3]',
      interactive: `
        border border-[#E3E3E3] shadow-[0_2px_8px_rgba(0,0,0,0.08)]
        cursor-pointer
        hover:-translate-y-0.5 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] hover:border-[#A27B5C]
        active:scale-[0.98] active:translate-y-0
      `,
    };

    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${!header && !footer ? paddingStyles[padding] : ''} ${className}`}
        {...props}
      >
        {header && (
          <div className="px-5 py-4 border-b border-[#E3E3E3]">
            {header}
          </div>
        )}
        {children && (
          <div className={header || footer ? paddingStyles[padding] : ''}>
            {children}
          </div>
        )}
        {footer && (
          <div className="px-5 py-4 border-t border-[#E3E3E3]">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
