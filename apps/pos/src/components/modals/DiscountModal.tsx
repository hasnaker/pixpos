import { useState, useCallback } from 'react';
import { Percent, DollarSign, Tag, Delete, Check } from 'lucide-react';
import { Modal, Button } from '@/components/ui';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTotal: number;
  onApplyDiscount: (discount: { type: 'percentage' | 'amount'; value: number }) => void;
  isLoading?: boolean;
}

type DiscountType = 'percentage' | 'amount';

const PRESET_PERCENTAGES = [10, 20, 50];

export default function DiscountModal({
  isOpen,
  onClose,
  currentTotal,
  onApplyDiscount,
  isLoading = false,
}: DiscountModalProps) {
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [inputValue, setInputValue] = useState('');

  const handleDigit = useCallback((digit: string) => {
    setInputValue(prev => {
      // Prevent leading zeros
      if (prev === '0' && digit !== '.') return digit;
      // Limit decimal places
      if (prev.includes('.') && prev.split('.')[1]?.length >= 2) return prev;
      // Limit length
      if (prev.length >= 8) return prev;
      return prev + digit;
    });
  }, []);

  const handleBackspace = useCallback(() => {
    setInputValue(prev => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setInputValue('');
  }, []);

  const handlePresetClick = (percentage: number) => {
    setDiscountType('percentage');
    setInputValue(percentage.toString());
  };

  const handleApply = () => {
    const value = parseFloat(inputValue) || 0;
    if (value > 0) {
      // Validate percentage doesn't exceed 100
      if (discountType === 'percentage' && value > 100) {
        return;
      }
      // Validate amount doesn't exceed total
      if (discountType === 'amount' && value > currentTotal) {
        return;
      }
      onApplyDiscount({ type: discountType, value });
      handleClose();
    }
  };

  const handleClose = () => {
    setInputValue('');
    setDiscountType('percentage');
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Calculate discount preview
  const numericValue = parseFloat(inputValue) || 0;
  const discountAmount = discountType === 'percentage' 
    ? (currentTotal * numericValue) / 100 
    : numericValue;
  const newTotal = Math.max(0, currentTotal - discountAmount);

  // Validation
  const isValidDiscount = numericValue > 0 && 
    (discountType === 'percentage' ? numericValue <= 100 : numericValue <= currentTotal);

  const NumpadButton = ({ 
    onClick, 
    variant = 'default',
    children 
  }: { 
    onClick: () => void;
    variant?: 'default' | 'action' | 'confirm';
    children: React.ReactNode;
  }) => {
    const variantStyles = {
      default: 'bg-[#F6F6F6] text-[#121212] hover:bg-[#E3E3E3] active:bg-[#C6C6C6]',
      action: 'bg-[#E3E3E3] text-[#121212] hover:bg-[#C6C6C6] active:bg-[#A5A5A5]',
      confirm: 'bg-[#A27B5C] text-white hover:bg-[#87674D] active:bg-[#513E2E]',
    };

    return (
      <button
        type="button"
        onClick={onClick}
        className={`
          w-[72px] h-[72px] flex items-center justify-center
          text-2xl font-semibold rounded-2xl
          transition-all duration-200 select-none active:scale-95
          ${variantStyles[variant]}
        `}
      >
        {children}
      </button>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="İndirim Uygula"
      size="md"
    >
      <div className="space-y-6">
        {/* Discount Type Toggle */}
        <div className="flex gap-2 p-1 bg-[#F6F6F6] rounded-xl">
          <button
            onClick={() => {
              setDiscountType('percentage');
              setInputValue('');
            }}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all
              ${discountType === 'percentage'
                ? 'bg-white text-[#121212] shadow-sm'
                : 'text-[#7F7F7F] hover:text-[#121212]'
              }
            `}
          >
            <Percent size={18} />
            Yüzde
          </button>
          <button
            onClick={() => {
              setDiscountType('amount');
              setInputValue('');
            }}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all
              ${discountType === 'amount'
                ? 'bg-white text-[#121212] shadow-sm'
                : 'text-[#7F7F7F] hover:text-[#121212]'
              }
            `}
          >
            <DollarSign size={18} />
            Tutar
          </button>
        </div>

        {/* Preset Buttons (only for percentage) */}
        {discountType === 'percentage' && (
          <div className="flex gap-3">
            {PRESET_PERCENTAGES.map((percentage) => (
              <button
                key={percentage}
                onClick={() => handlePresetClick(percentage)}
                className={`
                  flex-1 py-3 rounded-xl font-semibold text-sm transition-all
                  ${inputValue === percentage.toString()
                    ? 'bg-[#A27B5C] text-white'
                    : 'bg-[#F6F6F6] text-[#121212] hover:bg-[#EEEEEE]'
                  }
                `}
              >
                <Tag size={14} className="inline mr-1" />
                %{percentage}
              </button>
            ))}
          </div>
        )}

        {/* Input Display */}
        <div className="p-6 bg-[#F6F6F6] rounded-2xl text-center">
          <p className="text-xs text-[#7F7F7F] mb-2">
            {discountType === 'percentage' ? 'İndirim Yüzdesi' : 'İndirim Tutarı'}
          </p>
          <div className="flex items-center justify-center gap-2">
            {discountType === 'percentage' ? (
              <>
                <span className="text-4xl font-bold text-[#121212]">
                  {inputValue || '0'}
                </span>
                <span className="text-2xl text-[#7F7F7F]">%</span>
              </>
            ) : (
              <>
                <span className="text-2xl text-[#7F7F7F]">₺</span>
                <span className="text-4xl font-bold text-[#121212]">
                  {inputValue || '0'}
                </span>
              </>
            )}
          </div>
          
          {/* Validation Error */}
          {numericValue > 0 && !isValidDiscount && (
            <p className="text-xs text-[#F14C35] mt-2">
              {discountType === 'percentage' 
                ? 'Yüzde 100\'den fazla olamaz' 
                : 'İndirim tutarı toplam tutarı aşamaz'
              }
            </p>
          )}
        </div>

        {/* Preview */}
        {numericValue > 0 && isValidDiscount && (
          <div className="p-4 bg-[#D3F7ED] rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#178F6F]">Mevcut Toplam</span>
              <span className="text-sm text-[#178F6F]">{formatCurrency(currentTotal)}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#178F6F]">İndirim</span>
              <span className="text-sm font-semibold text-[#178F6F]">
                -{formatCurrency(discountAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#B5F2E1]">
              <span className="text-sm font-semibold text-[#0B4837]">Yeni Toplam</span>
              <span className="text-lg font-bold text-[#0B4837]">
                {formatCurrency(newTotal)}
              </span>
            </div>
          </div>
        )}

        {/* Numpad */}
        <div className="flex justify-center">
          <div className="grid grid-cols-3 gap-3">
            {/* Row 1 */}
            <NumpadButton onClick={() => handleDigit('1')}>1</NumpadButton>
            <NumpadButton onClick={() => handleDigit('2')}>2</NumpadButton>
            <NumpadButton onClick={() => handleDigit('3')}>3</NumpadButton>

            {/* Row 2 */}
            <NumpadButton onClick={() => handleDigit('4')}>4</NumpadButton>
            <NumpadButton onClick={() => handleDigit('5')}>5</NumpadButton>
            <NumpadButton onClick={() => handleDigit('6')}>6</NumpadButton>

            {/* Row 3 */}
            <NumpadButton onClick={() => handleDigit('7')}>7</NumpadButton>
            <NumpadButton onClick={() => handleDigit('8')}>8</NumpadButton>
            <NumpadButton onClick={() => handleDigit('9')}>9</NumpadButton>

            {/* Row 4 */}
            <NumpadButton onClick={handleBackspace} variant="action">
              <Delete size={24} />
            </NumpadButton>
            <NumpadButton onClick={() => handleDigit('0')}>0</NumpadButton>
            {discountType === 'amount' ? (
              <NumpadButton onClick={() => handleDigit('.')}>.</NumpadButton>
            ) : (
              <NumpadButton onClick={handleClear} variant="action">C</NumpadButton>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            İptal
          </Button>
          <Button
            onClick={handleApply}
            disabled={!isValidDiscount || isLoading}
            className="flex-1"
            leftIcon={<Check size={18} />}
          >
            {isLoading ? 'Uygulanıyor...' : 'İndirim Uygula'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
