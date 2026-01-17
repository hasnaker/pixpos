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
    <div className="flex flex-col items-center gap-8">
      {/* Title & Subtitle */}
      {(title || subtitle) && (
        <div className="text-center">
          {title && (
            <h2 className="text-xl font-semibold text-[#121212] mb-1">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-[#7F7F7F]">
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
                  ? 'bg-[#F14C35]' 
                  : 'bg-[#A27B5C]'
                : 'bg-[#E3E3E3]'
              }
            `}
          />
        ))}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <p className="text-sm text-[#F14C35] -mt-4">
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
            text-sm font-medium text-[#7F7F7F]
            hover:text-[#121212]
            transition-colors
          "
        >
          İptal
        </button>
      )}
    </div>
  );
}
