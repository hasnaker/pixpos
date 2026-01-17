import type { HTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

type AlertVariant = 'success' | 'warning' | 'error' | 'info';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  icon?: ReactNode;
  onClose?: () => void;
  closable?: boolean;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    variant = 'info', 
    title,
    icon,
    onClose,
    closable = false,
    className = '', 
    children, 
    ...props 
  }, ref) => {
    const variantStyles = {
      success: 'bg-[#D3F7ED] border-[#B5F2E1] text-[#178F6F]',
      warning: 'bg-[#FFEECE] border-[#FFE2AE] text-[#D48D09]',
      error: 'bg-[#FCDBD7] border-[#FAC3BC] text-[#A13323]',
      info: 'bg-[#D0EBFF] border-[#B0DEFF] text-[#0C67AA]',
    };

    const defaultIcons = {
      success: <CheckCircle size={20} />,
      warning: <AlertTriangle size={20} />,
      error: <AlertCircle size={20} />,
      info: <Info size={20} />,
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={`
          flex items-start gap-3
          px-5 py-4 rounded-xl border
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {/* Icon */}
        <span className="flex-shrink-0 mt-0.5">
          {icon || defaultIcons[variant]}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold mb-1">
              {title}
            </h4>
          )}
          {children && (
            <div className="text-sm opacity-90">
              {children}
            </div>
          )}
        </div>

        {/* Close Button */}
        {closable && (
          <button
            type="button"
            onClick={onClose}
            className="
              flex-shrink-0 p-1 rounded-md
              hover:bg-black/10 transition-colors
            "
            aria-label="Kapat"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;
