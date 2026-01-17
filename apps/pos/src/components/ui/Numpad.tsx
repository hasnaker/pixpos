import { forwardRef } from 'react';
import { Delete, Check } from 'lucide-react';

interface NumpadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onConfirm?: () => void;
  onClear?: () => void;
  disabled?: boolean;
  showConfirm?: boolean;
  showDecimal?: boolean;
}

const Numpad = forwardRef<HTMLDivElement, NumpadProps>(
  ({ 
    onDigit, 
    onBackspace, 
    onConfirm,
    onClear,
    disabled = false,
    showConfirm = true,
    showDecimal = false,
  }, ref) => {
    const handleKeyPress = (key: string) => {
      if (disabled) return;
      
      if (key === 'backspace') {
        onBackspace();
      } else if (key === 'confirm') {
        onConfirm?.();
      } else if (key === 'clear') {
        onClear?.();
      } else {
        onDigit(key);
      }
    };

    const KeyButton = ({ 
      value, 
      variant = 'default',
      children 
    }: { 
      value: string; 
      variant?: 'default' | 'confirm' | 'backspace';
      children: React.ReactNode;
    }) => {
      const variantStyles = {
        default: `
          bg-[#F6F6F6] text-[#121212]
          hover:bg-[#E3E3E3]
          active:bg-[#C6C6C6]
        `,
        confirm: `
          bg-[#A27B5C] text-white
          hover:bg-[#87674D]
          active:bg-[#513E2E]
        `,
        backspace: `
          bg-[#E3E3E3] text-[#121212]
          hover:bg-[#C6C6C6]
          active:bg-[#A5A5A5]
        `,
      };

      return (
        <button
          type="button"
          onClick={() => handleKeyPress(value)}
          disabled={disabled}
          className={`
            w-[72px] h-[72px]
            flex items-center justify-center
            text-2xl font-semibold
            rounded-2xl
            transition-all duration-200
            select-none
            active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
            ${variantStyles[variant]}
          `}
        >
          {children}
        </button>
      );
    };

    return (
      <div 
        ref={ref}
        className="grid grid-cols-3 gap-3"
      >
        {/* Row 1 */}
        <KeyButton value="1">1</KeyButton>
        <KeyButton value="2">2</KeyButton>
        <KeyButton value="3">3</KeyButton>

        {/* Row 2 */}
        <KeyButton value="4">4</KeyButton>
        <KeyButton value="5">5</KeyButton>
        <KeyButton value="6">6</KeyButton>

        {/* Row 3 */}
        <KeyButton value="7">7</KeyButton>
        <KeyButton value="8">8</KeyButton>
        <KeyButton value="9">9</KeyButton>

        {/* Row 4 */}
        <KeyButton value="backspace" variant="backspace">
          <Delete size={24} />
        </KeyButton>
        <KeyButton value="0">0</KeyButton>
        {showConfirm ? (
          <KeyButton value="confirm" variant="confirm">
            <Check size={24} />
          </KeyButton>
        ) : showDecimal ? (
          <KeyButton value=".">.</KeyButton>
        ) : (
          <KeyButton value="00">00</KeyButton>
        )}
      </div>
    );
  }
);

Numpad.displayName = 'Numpad';

export default Numpad;
