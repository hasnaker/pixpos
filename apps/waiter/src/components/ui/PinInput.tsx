import { useState, useEffect, useCallback } from 'react';
import Numpad from './Numpad';

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  onCancel?: () => void;
  error?: boolean;
  errorMessage?: string;
  title?: string;
  subtitle?: string;
}

export default function PinInput({
  length = 4,
  onComplete,
  onCancel,
  error = false,
  errorMessage,
  title,
  subtitle,
}: PinInputProps) {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);

  // Handle error animation
  useEffect(() => {
    if (error) {
      setShake(true);
      // Haptic feedback on error
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      const timer = setTimeout(() => {
        setShake(false);
        setPin('');
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-submit when PIN is complete
  useEffect(() => {
    if (pin.length === length) {
      onComplete(pin);
    }
  }, [pin, length, onComplete]);

  const handleDigit = useCallback((digit: string) => {
    if (pin.length < length) {
      setPin(prev => prev + digit);
    }
  }, [pin.length, length]);

  const handleBackspace = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Title & Subtitle */}
      {(title || subtitle) && (
        <div className="text-center">
          {title && (
            <h2 className="text-xl font-semibold text-white mb-1">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-white/50">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* PIN Dots */}
      <div 
        className={`
          flex gap-4
          ${shake ? 'animate-[shake_400ms_ease-out]' : ''}
        `}
      >
        {Array.from({ length }).map((_, index) => (
          <div
            key={index}
            className={`
              w-4 h-4 rounded-full
              transition-all duration-200
              ${index < pin.length 
                ? error 
                  ? 'bg-[#FF453A]' 
                  : 'bg-[#0A84FF]'
                : 'bg-white/20'
              }
            `}
          />
        ))}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <p className="text-sm text-[#FF453A] -mt-2">
          {errorMessage}
        </p>
      )}

      {/* Numpad */}
      <Numpad
        onDigit={handleDigit}
        onBackspace={handleBackspace}
        showConfirm={false}
      />

      {/* Cancel Button */}
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="
            text-sm font-medium text-white/50
            hover:text-white/70
            transition-colors
            touch-target
          "
        >
          İptal
        </button>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-10px); }
          40%, 80% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}
