import { useMemo, useState } from 'react';
import { Clock, ChefHat, Check, Play, FileText, User } from 'lucide-react';
import type { KitchenOrder } from '@/services/api';

interface OrderTicketProps {
  order: KitchenOrder;
  onStatusChange: (orderId: string, status: 'preparing' | 'ready') => void;
  onViewDetails: (order: KitchenOrder) => void;
  isLoading?: boolean;
}

// Time thresholds in minutes
const WARNING_THRESHOLD = 5;
const URGENT_THRESHOLD = 10;
const CRITICAL_THRESHOLD = 15;

function getWaitingTime(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / 1000 / 60);
}

function formatWaitingTime(minutes: number): string {
  if (minutes < 1) return 'Şimdi';
  if (minutes < 60) return `${minutes} dk`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}s ${mins}dk`;
}

type TimeStatus = 'new' | 'warning' | 'urgent' | 'critical';

function getTimeStatus(minutes: number): TimeStatus {
  if (minutes >= CRITICAL_THRESHOLD) return 'critical';
  if (minutes >= URGENT_THRESHOLD) return 'urgent';
  if (minutes >= WARNING_THRESHOLD) return 'warning';
  return 'new';
}

function getStatusClass(minutes: number, orderStatus: string): string {
  if (orderStatus === 'preparing') return 'status-preparing';
  const timeStatus = getTimeStatus(minutes);
  return `status-${timeStatus}`;
}

export function OrderTicket({ order, onStatusChange, onViewDetails, isLoading }: OrderTicketProps) {
  const [isNew] = useState(() => {
    const created = new Date(order.createdAt);
    const now = new Date();
    return (now.getTime() - created.getTime()) < 5000; // 5 seconds
  });

  const waitingMinutes = useMemo(() => getWaitingTime(order.createdAt), [order.createdAt]);
  const timeStatus = getTimeStatus(waitingMinutes);
  const statusClass = getStatusClass(waitingMinutes, order.status);
  
  const orderTime = useMemo(() => {
    return new Date(order.createdAt).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
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

  return (
    <div
      className={`order-ticket ${statusClass} ${isNew ? 'new-order' : ''}`}
      onClick={() => onViewDetails(order)}
    >
      {/* Header */}
      <div className="order-ticket-header">
        <div className="order-ticket-table">
          {tableName}
        </div>
        <div className={`order-ticket-time time-${timeStatus}`}>
          <Clock className="w-5 h-5" />
          <span>{formatWaitingTime(waitingMinutes)}</span>
        </div>
      </div>

      {/* Meta Info */}
      <div className="order-ticket-meta">
        <span>#{order.orderNumber}</span>
        <span>•</span>
        <span>{orderTime}</span>
        {isPreparing && (
          <>
            <span>•</span>
            <span className="flex items-center gap-1 text-[var(--color-blue)]">
              <ChefHat className="w-4 h-4" />
              Hazırlanıyor
            </span>
          </>
        )}
      </div>

      {/* Items */}
      <div className="order-ticket-body">
        {order.items.map((item) => (
          <div key={item.id} className="order-ticket-item">
            <div className="order-ticket-quantity">
              {item.quantity}
            </div>
            <div className="order-ticket-item-content">
              <div className="order-ticket-item-name">{item.productName}</div>
              {item.notes && (
                <div className="order-ticket-item-note">
                  <FileText className="w-4 h-4" />
                  {item.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Order Notes */}
      {order.notes && (
        <div className="order-ticket-notes">
          <div className="order-ticket-notes-text">
            <FileText className="w-4 h-4" />
            {order.notes}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="order-ticket-footer" onClick={(e) => e.stopPropagation()}>
        {order.waiterName && (
          <div className="order-ticket-waiter flex items-center gap-1">
            <User className="w-4 h-4" />
            Garson: {order.waiterName}
          </div>
        )}
        
        {isPreparing ? (
          <button
            onClick={handleStatusClick}
            disabled={isLoading}
            className="status-btn status-btn-ready"
          >
            <Check className="w-5 h-5" />
            <span>Hazır</span>
          </button>
        ) : (
          <button
            onClick={handleStatusClick}
            disabled={isLoading}
            className="status-btn status-btn-start"
          >
            <Play className="w-5 h-5" />
            <span>Başla</span>
          </button>
        )}
      </div>
    </div>
  );
}
