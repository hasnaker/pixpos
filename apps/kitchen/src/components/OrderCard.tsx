import { useMemo } from 'react';
import { Clock, Check, UtensilsCrossed } from 'lucide-react';
import type { KitchenOrder } from '@/services/api';

interface OrderCardProps {
  order: KitchenOrder;
  onMarkReady: (orderId: string) => void;
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

function getStatusClass(minutes: number): string {
  if (minutes >= CRITICAL_THRESHOLD) return 'order-card-critical';
  if (minutes >= URGENT_THRESHOLD) return 'order-card-urgent';
  if (minutes >= WARNING_THRESHOLD) return 'order-card-warning';
  return 'order-card-new';
}

function getStatusColor(minutes: number): string {
  if (minutes >= CRITICAL_THRESHOLD) return 'text-[var(--color-status-critical)]';
  if (minutes >= URGENT_THRESHOLD) return 'text-[var(--color-status-urgent)]';
  if (minutes >= WARNING_THRESHOLD) return 'text-[var(--color-status-warning)]';
  return 'text-[var(--color-status-new)]';
}

export function OrderCard({ order, onMarkReady, isLoading }: OrderCardProps) {
  const waitingMinutes = useMemo(() => getWaitingTime(order.createdAt), [order.createdAt]);
  const statusClass = getStatusClass(waitingMinutes);
  const statusColor = getStatusColor(waitingMinutes);
  
  const orderTime = useMemo(() => {
    return new Date(order.createdAt).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [order.createdAt]);

  const tableName = order.table?.name || `Masa ${order.tableId.slice(0, 4)}`;

  return (
    <div
      className={`glass-elevated rounded-[var(--radius-lg)] p-4 flex flex-col gap-3 ${statusClass}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-[var(--color-text-secondary)]" />
          <span className="text-title-2 font-bold">{tableName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${statusColor}`} />
          <span className={`text-headline ${statusColor}`}>
            {formatWaitingTime(waitingMinutes)}
          </span>
        </div>
      </div>

      {/* Order Info */}
      <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
        <span className="text-callout">#{order.orderNumber}</span>
        <span className="text-callout">•</span>
        <span className="text-callout">{orderTime}</span>
      </div>

      {/* Items */}
      <div className="flex-1 space-y-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start gap-2">
            <span className="text-body font-semibold text-[var(--color-blue)] min-w-[24px]">
              {item.quantity}x
            </span>
            <div className="flex-1">
              <span className="text-body">{item.productName}</span>
              {item.notes && (
                <p className="text-callout text-[var(--color-orange)] mt-0.5">
                  📝 {item.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Order Notes */}
      {order.notes && (
        <div className="bg-[var(--color-gray-5)] rounded-[var(--radius-md)] p-2">
          <p className="text-callout text-[var(--color-yellow)]">
            📋 {order.notes}
          </p>
        </div>
      )}

      {/* Ready Button */}
      <button
        onClick={() => onMarkReady(order.id)}
        disabled={isLoading}
        className="ready-button w-full flex items-center justify-center gap-2 py-3 px-4 
                   bg-[var(--color-green)] hover:bg-[#28b84d] 
                   text-white font-semibold rounded-[var(--radius-md)]
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Check className="w-5 h-5" />
        <span className="text-headline">Hazır</span>
      </button>
    </div>
  );
}
