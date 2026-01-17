import { useState, useMemo } from 'react';
import { Merge, Check, ArrowRight, ShoppingBag } from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import type { Order } from '@/services/api';

interface MergeOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOrder: Order;
  availableOrders: Order[];
  onMerge: (orderIds: string[]) => void;
  isLoading?: boolean;
}

export default function MergeOrdersModal({
  isOpen,
  onClose,
  currentOrder,
  availableOrders,
  onMerge,
  isLoading = false,
}: MergeOrdersModalProps) {
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  const handleToggleOrder = (orderId: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleMerge = () => {
    if (selectedOrderIds.length > 0) {
      // Include current order in the merge
      onMerge([currentOrder.id, ...selectedOrderIds]);
      setSelectedOrderIds([]);
    }
  };

  const handleClose = () => {
    setSelectedOrderIds([]);
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate merged total
  const { mergedTotal, mergedItemCount } = useMemo(() => {
    const selectedOrders = availableOrders.filter(o => selectedOrderIds.includes(o.id));
    const total = currentOrder.totalAmount + selectedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const itemCount = currentOrder.items.length + selectedOrders.reduce((sum, o) => sum + o.items.length, 0);
    return { mergedTotal: total, mergedItemCount: itemCount };
  }, [currentOrder, availableOrders, selectedOrderIds]);

  const canMerge = selectedOrderIds.length > 0;

  // Filter out current order from available orders
  const otherOrders = availableOrders.filter(o => o.id !== currentOrder.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Sipariş Birleştir"
      size="lg"
    >
      <div className="space-y-6">
        {/* Instructions */}
        <div className="flex items-start gap-3 p-4 bg-[#DED8FD] rounded-xl">
          <Merge size={20} className="text-[#5A3CF3] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#3C28A2]">
              Birleştirilecek siparişleri seçin
            </p>
            <p className="text-xs text-[#3C28A2]/70 mt-1">
              Seçilen siparişler mevcut siparişle birleştirilecek
            </p>
          </div>
        </div>

        {/* Current Order */}
        <div className="p-4 bg-[#ECE5DE] rounded-xl border-2 border-[#A27B5C]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-[#A27B5C] rounded-full flex items-center justify-center">
              <Check size={14} className="text-white" />
            </div>
            <span className="text-xs font-medium text-[#A27B5C]">MEVCUT SİPARİŞ</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#121212]">
                Sipariş #{currentOrder.orderNumber}
              </p>
              <p className="text-xs text-[#7F7F7F] mt-0.5">
                {currentOrder.items.length} ürün • {formatTime(currentOrder.createdAt)}
              </p>
            </div>
            <p className="text-lg font-bold text-[#A27B5C]">
              {formatCurrency(currentOrder.totalAmount)}
            </p>
          </div>
          {/* Items preview */}
          <div className="mt-3 pt-3 border-t border-[#E0D3C9]">
            <div className="flex flex-wrap gap-2">
              {currentOrder.items.slice(0, 3).map((item) => (
                <span 
                  key={item.id}
                  className="px-2 py-1 bg-white rounded text-xs text-[#7F7F7F]"
                >
                  {item.quantity}x {item.productName}
                </span>
              ))}
              {currentOrder.items.length > 3 && (
                <span className="px-2 py-1 bg-white rounded text-xs text-[#A27B5C]">
                  +{currentOrder.items.length - 3} daha
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Available Orders */}
        {otherOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[#7F7F7F]">
            <ShoppingBag size={48} strokeWidth={1.5} />
            <p className="mt-3 text-sm font-medium">Birleştirilebilecek sipariş yok</p>
            <p className="text-xs mt-1">Bu masada başka açık sipariş bulunmuyor</p>
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs font-medium text-[#7F7F7F] mb-3">
                BİRLEŞTİRİLEBİLECEK SİPARİŞLER
              </p>
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {otherOrders.map((order) => {
                  const isSelected = selectedOrderIds.includes(order.id);
                  return (
                    <label
                      key={order.id}
                      className={`
                        flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border-2
                        ${isSelected
                          ? 'bg-[#DED8FD] border-[#5A3CF3]'
                          : 'bg-[#F6F6F6] border-transparent hover:border-[#E3E3E3]'
                        }
                      `}
                    >
                      {/* Checkbox */}
                      <div className={`
                        w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                        ${isSelected 
                          ? 'bg-[#5A3CF3]' 
                          : 'bg-white border-2 border-[#E3E3E3]'
                        }
                      `}>
                        {isSelected && <Check size={14} className="text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleOrder(order.id)}
                        className="sr-only"
                      />

                      {/* Order Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#121212]">
                          Sipariş #{order.orderNumber}
                        </p>
                        <p className="text-xs text-[#7F7F7F] mt-0.5">
                          {order.items.length} ürün • {formatTime(order.createdAt)}
                        </p>
                        {/* Items preview */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {order.items.slice(0, 2).map((item) => (
                            <span 
                              key={item.id}
                              className="px-2 py-0.5 bg-white rounded text-xs text-[#7F7F7F]"
                            >
                              {item.quantity}x {item.productName}
                            </span>
                          ))}
                          {order.items.length > 2 && (
                            <span className="px-2 py-0.5 bg-white rounded text-xs text-[#A5A5A5]">
                              +{order.items.length - 2}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <p className={`
                        text-sm font-semibold flex-shrink-0
                        ${isSelected ? 'text-[#5A3CF3]' : 'text-[#121212]'}
                      `}>
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Merge Preview */}
            {selectedOrderIds.length > 0 && (
              <div className="p-4 bg-[#F6F6F6] rounded-xl">
                <p className="text-xs font-medium text-[#7F7F7F] mb-3">BİRLEŞTİRME ÖNİZLEME</p>
                <div className="flex items-center gap-4">
                  {/* Orders being merged */}
                  <div className="flex-1 p-3 bg-white rounded-lg">
                    <p className="text-xs text-[#7F7F7F]">Birleştirilecek</p>
                    <p className="text-sm font-semibold text-[#121212]">
                      {selectedOrderIds.length + 1} sipariş
                    </p>
                  </div>

                  {/* Arrow */}
                  <ArrowRight size={20} className="text-[#A5A5A5] flex-shrink-0" />

                  {/* Result */}
                  <div className="flex-1 p-3 bg-[#D3F7ED] rounded-lg border border-[#22D7A6]">
                    <p className="text-xs text-[#22D7A6]">Yeni Toplam</p>
                    <p className="text-lg font-bold text-[#178F6F]">
                      {formatCurrency(mergedTotal)}
                    </p>
                    <p className="text-xs text-[#22D7A6]/70">
                      {mergedItemCount} ürün
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
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
            onClick={handleMerge}
            disabled={!canMerge || isLoading}
            className="flex-1"
            leftIcon={<Merge size={18} />}
          >
            {isLoading ? 'Birleştiriliyor...' : 'Siparişleri Birleştir'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
