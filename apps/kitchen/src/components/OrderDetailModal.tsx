import { useMemo } from 'react';
import { X, Clock, User, FileText, ChefHat, Check, Play, Hash } from 'lucide-react';
import type { KitchenOrder } from '@/services/api';

interface OrderDetailModalProps {
  order: KitchenOrder;
  onClose: () => void;
  onStatusChange: (orderId: string, status: 'preparing' | 'ready') => void;
  isLoading?: boolean;
}

function getWaitingTime(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / 1000 / 60);
}

function formatWaitingTime(minutes: number): string {
  if (minutes < 1) return 'Şimdi';
  if (minutes < 60) return `${minutes} dakika`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours} saat ${mins} dakika`;
}

export function OrderDetailModal({ order, onClose, onStatusChange, isLoading }: OrderDetailModalProps) {
  const waitingMinutes = useMemo(() => getWaitingTime(order.createdAt), [order.createdAt]);
  
  const orderTime = useMemo(() => {
    return new Date(order.createdAt).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [order.createdAt]);

  const orderDate = useMemo(() => {
    return new Date(order.createdAt).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [order.createdAt]);

  const tableName = order.table?.name || `Masa ${order.tableId.slice(0, 4)}`;
  const isPreparing = order.status === 'preparing' || order.status === 'kitchen';

  const handleStatusClick = () => {
    if (isPreparing) {
      onStatusChange(order.id, 'ready');
    } else {
      onStatusChange(order.id, 'preparing');
    }
  };

  // Calculate time status color
  const getTimeColor = () => {
    if (waitingMinutes >= 15) return 'text-[var(--color-red)]';
    if (waitingMinutes >= 10) return 'text-[var(--color-orange)]';
    if (waitingMinutes >= 5) return 'text-[var(--color-yellow)]';
    return 'text-[var(--color-green)]';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal" 
        style={{ width: '500px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[var(--color-blue)] rounded-xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="modal-title">{tableName}</h2>
              <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] text-sm">
                <Hash className="w-4 h-4" />
                <span>{order.orderNumber}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[var(--color-surface-2)] rounded-xl p-4">
              <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Bekleme Süresi</span>
              </div>
              <div className={`text-xl font-bold ${getTimeColor()}`}>
                {formatWaitingTime(waitingMinutes)}
              </div>
            </div>
            <div className="bg-[var(--color-surface-2)] rounded-xl p-4">
              <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Sipariş Saati</span>
              </div>
              <div className="text-xl font-bold text-[var(--color-text-primary)]">
                {orderTime}
              </div>
              <div className="text-sm text-[var(--color-text-tertiary)]">
                {orderDate}
              </div>
            </div>
          </div>

          {/* Waiter Info */}
          {order.waiterName && (
            <div className="flex items-center gap-3 mb-6 p-3 bg-[var(--color-surface-2)] rounded-xl">
              <div className="w-10 h-10 bg-[var(--color-surface-3)] rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-[var(--color-text-secondary)]" />
              </div>
              <div>
                <div className="text-sm text-[var(--color-text-tertiary)]">Garson</div>
                <div className="font-semibold text-[var(--color-text-primary)]">{order.waiterName}</div>
              </div>
            </div>
          )}

          {/* Order Notes - Highlighted */}
          {order.notes && (
            <div className="mb-6 p-4 bg-[rgba(255,214,10,0.1)] border border-[rgba(255,214,10,0.3)] rounded-xl">
              <div className="flex items-center gap-2 text-[var(--color-yellow)] mb-2">
                <FileText className="w-5 h-5" />
                <span className="font-semibold">Sipariş Notu</span>
              </div>
              <p className="text-[var(--color-yellow)] text-lg">{order.notes}</p>
            </div>
          )}

          {/* Items */}
          <div>
            <h3 className="text-headline text-[var(--color-text-secondary)] mb-3">
              Sipariş Kalemleri ({order.items.length})
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-start gap-4 p-4 bg-[var(--color-surface-2)] rounded-xl"
                >
                  <div className="w-12 h-12 bg-[var(--color-blue)] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {item.quantity}
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-[var(--color-text-primary)]">
                      {item.productName}
                    </div>
                    {item.notes && (
                      <div className="flex items-center gap-2 mt-2 p-2 bg-[rgba(255,159,10,0.1)] rounded-lg">
                        <FileText className="w-4 h-4 text-[var(--color-orange)]" />
                        <span className="text-[var(--color-orange)]">{item.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="mt-6 p-4 bg-[var(--color-surface-2)] rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-tertiary)]">Durum</span>
              <span className={`badge ${isPreparing ? 'badge-blue' : 'badge-orange'}`}>
                {isPreparing ? 'Hazırlanıyor' : 'Bekliyor'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="icon-btn" style={{ width: 'auto', padding: '12px 24px' }}>
            Kapat
          </button>
          {isPreparing ? (
            <button
              onClick={handleStatusClick}
              disabled={isLoading}
              className="status-btn status-btn-ready"
              style={{ width: 'auto', padding: '12px 32px' }}
            >
              <Check className="w-5 h-5" />
              <span>Hazır</span>
            </button>
          ) : (
            <button
              onClick={handleStatusClick}
              disabled={isLoading}
              className="status-btn status-btn-start"
              style={{ width: 'auto', padding: '12px 32px' }}
            >
              <Play className="w-5 h-5" />
              <span>Hazırlamaya Başla</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
