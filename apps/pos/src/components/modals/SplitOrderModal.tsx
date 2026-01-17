import { useState, useMemo } from 'react';
import { Scissors, Check, ArrowRight } from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import type { OrderItem } from '@/services/api';

interface SplitOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onSplit: (itemIds: string[]) => void;
  isLoading?: boolean;
}

export default function SplitOrderModal({
  isOpen,
  onClose,
  items,
  onSplit,
  isLoading = false,
}: SplitOrderModalProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleToggleItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };

  const handleSplit = () => {
    if (selectedItems.length > 0 && selectedItems.length < items.length) {
      onSplit(selectedItems);
      setSelectedItems([]);
    }
  };

  const handleClose = () => {
    setSelectedItems([]);
    onClose();
  };

  // Calculate totals
  const { newOrderTotal, remainingTotal } = useMemo(() => {
    const original = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const newOrder = items
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.totalPrice, 0);
    return {
      newOrderTotal: newOrder,
      remainingTotal: original - newOrder,
    };
  }, [items, selectedItems]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const canSplit = selectedItems.length > 0 && selectedItems.length < items.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Sipariş Böl"
      size="lg"
    >
      <div className="space-y-6">
        {/* Instructions */}
        <div className="flex items-start gap-3 p-4 bg-[#D0EBFF] rounded-xl">
          <Scissors size={20} className="text-[#129BFF] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#0C67AA]">
              Yeni hesaba taşınacak ürünleri seçin
            </p>
            <p className="text-xs text-[#0C67AA]/70 mt-1">
              Seçilen ürünler yeni bir sipariş olarak ayrılacak
            </p>
          </div>
        </div>

        {/* Select All */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#7F7F7F]">
            {selectedItems.length} / {items.length} ürün seçildi
          </span>
          <button
            onClick={handleSelectAll}
            className="text-sm font-medium text-[#A27B5C] hover:text-[#87674D] transition-colors"
          >
            {selectedItems.length === items.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
          </button>
        </div>

        {/* Items List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {items.map((item) => {
            const isSelected = selectedItems.includes(item.id);
            return (
              <label
                key={item.id}
                className={`
                  flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border-2
                  ${isSelected
                    ? 'bg-[#ECE5DE] border-[#A27B5C]'
                    : 'bg-[#F6F6F6] border-transparent hover:border-[#E3E3E3]'
                  }
                `}
              >
                {/* Checkbox */}
                <div className={`
                  w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                  ${isSelected 
                    ? 'bg-[#A27B5C]' 
                    : 'bg-white border-2 border-[#E3E3E3]'
                  }
                `}>
                  {isSelected && <Check size={14} className="text-white" />}
                </div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleItem(item.id)}
                  className="sr-only"
                />

                {/* Item Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#121212]">
                    {item.productName}
                  </p>
                  <p className="text-xs text-[#7F7F7F] mt-0.5">
                    {item.quantity} x {formatCurrency(item.unitPrice)}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-[#A27B5C] mt-1">
                      Not: {item.notes}
                    </p>
                  )}
                </div>

                {/* Price */}
                <p className={`
                  text-sm font-semibold flex-shrink-0
                  ${isSelected ? 'text-[#A27B5C]' : 'text-[#121212]'}
                `}>
                  {formatCurrency(item.totalPrice)}
                </p>
              </label>
            );
          })}
        </div>

        {/* Split Preview */}
        {selectedItems.length > 0 && (
          <div className="p-4 bg-[#F6F6F6] rounded-xl">
            <p className="text-xs font-medium text-[#7F7F7F] mb-3">BÖLME ÖNİZLEME</p>
            <div className="flex items-center gap-4">
              {/* Original Order */}
              <div className="flex-1 p-3 bg-white rounded-lg">
                <p className="text-xs text-[#7F7F7F]">Mevcut Sipariş</p>
                <p className="text-lg font-bold text-[#121212]">
                  {formatCurrency(remainingTotal)}
                </p>
                <p className="text-xs text-[#A5A5A5]">
                  {items.length - selectedItems.length} ürün
                </p>
              </div>

              {/* Arrow */}
              <ArrowRight size={20} className="text-[#A5A5A5] flex-shrink-0" />

              {/* New Order */}
              <div className="flex-1 p-3 bg-[#ECE5DE] rounded-lg border border-[#A27B5C]">
                <p className="text-xs text-[#A27B5C]">Yeni Sipariş</p>
                <p className="text-lg font-bold text-[#A27B5C]">
                  {formatCurrency(newOrderTotal)}
                </p>
                <p className="text-xs text-[#A27B5C]/70">
                  {selectedItems.length} ürün
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning if all items selected */}
        {selectedItems.length === items.length && (
          <div className="p-3 bg-[#FFEECE] rounded-lg">
            <p className="text-xs text-[#D48D09]">
              ⚠️ Tüm ürünleri seçemezsiniz. En az bir ürün mevcut siparişte kalmalıdır.
            </p>
          </div>
        )}

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
            onClick={handleSplit}
            disabled={!canSplit || isLoading}
            className="flex-1"
            leftIcon={<Scissors size={18} />}
          >
            {isLoading ? 'Bölünüyor...' : 'Siparişi Böl'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
