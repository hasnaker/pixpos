import { Delete } from 'lucide-react';

interface NumpadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onConfirm?: () => void;
  showConfirm?: boolean;
  disabled?: boolean;
}

export default function Numpad({
  onDigit,
  onBackspace,
  onConfirm,
  showConfirm = false,
  disabled = false,
}: NumpadProps) {
  const handlePress = (value: string) => {
    if (disabled) return;
    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    onDigit(value);
  };

  const handleBackspace = () => {
    if (disabled) return;
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    onBackspace();
  };

  const handleConfirm = () => {
    if (disabled || !onConfirm) return;
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
    onConfirm();
  };

  const buttonBase = `
    w-[72px] h-[72px] rounded-2xl
    text-2xl font-semibold
    flex items-center justify-center
    transition-all duration-100
    active:scale-95
    touch-target no-select
  `;

  const digitButton = `
    ${buttonBase}
    bg-white/10 text-white
    hover:bg-white/15 active:bg-white/20
    border border-white/10
  `;

  const actionButton = `
    ${buttonBase}
    bg-white/8 text-white/70
    hover:bg-white/12 active:bg-white/16
  `;

  const confirmButton = `
    ${buttonBase}
    bg-[#0A84FF] text-white
    hover:bg-[#0A84FF]/90 active:bg-[#0A84FF]/80
    shadow-[0_0_20px_rgba(10,132,255,0.3)]
  `;

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Row 1 */}
      <button className={digitButton} onClick={() => handlePress('1')} disabled={disabled}>1</button>
      <button className={digitButton} onClick={() => handlePress('2')} disabled={disabled}>2</button>
      <button className={digitButton} onClick={() => handlePress('3')} disabled={disabled}>3</button>

      {/* Row 2 */}
      <button className={digitButton} onClick={() => handlePress('4')} disabled={disabled}>4</button>
      <button className={digitButton} onClick={() => handlePress('5')} disabled={disabled}>5</button>
      <button className={digitButton} onClick={() => handlePress('6')} disabled={disabled}>6</button>

      {/* Row 3 */}
      <button className={digitButton} onClick={() => handlePress('7')} disabled={disabled}>7</button>
      <button className={digitButton} onClick={() => handlePress('8')} disabled={disabled}>8</button>
      <button className={digitButton} onClick={() => handlePress('9')} disabled={disabled}>9</button>

      {/* Row 4 */}
      <button className={actionButton} onClick={handleBackspace} disabled={disabled}>
        <Delete size={24} />
      </button>
      <button className={digitButton} onClick={() => handlePress('0')} disabled={disabled}>0</button>
      {showConfirm ? (
        <button className={confirmButton} onClick={handleConfirm} disabled={disabled}>
          ✓
        </button>
      ) : (
        <div className="w-[72px] h-[72px]" /> // Empty space
      )}
    </div>
  );
}
