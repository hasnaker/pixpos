import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { Clock } from 'lucide-react';

type TableStatus = 'empty' | 'occupied' | 'sent';

interface TableCardProps extends HTMLAttributes<HTMLDivElement> {
  number: number | string;
  status?: TableStatus;
  amount?: number;
  time?: string;
  waiterName?: string;
}

const TableCard = forwardRef<HTMLDivElement, TableCardProps>(
  ({ 
    number, 
    status = 'empty', 
    amount, 
    time,
    waiterName,
    className = '', 
    ...props 
  }, ref) => {
    const formatAmount = (value: number) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
      }).format(value);
    };

    return (
      <div
        ref={ref}
        className={`table-card ${status} ${className}`}
        {...props}
      >
        {/* Table Number */}
        <span className="table-card-number">
          {number}
        </span>

        {/* Dwell Time */}
        {time && (
          <span className="table-card-time">
            <Clock size={12} />
            {time}
          </span>
        )}

        {/* Amount */}
        {amount !== undefined && amount > 0 && (
          <span className="table-card-amount">
            {formatAmount(amount)}
          </span>
        )}

        {/* Waiter Name */}
        {waiterName && (
          <span className="text-xs text-[var(--text-tertiary)] truncate max-w-full">
            {waiterName}
          </span>
        )}

        {/* Empty State Label */}
        {status === 'empty' && !amount && (
          <span className="table-card-label">
            Boş
          </span>
        )}
      </div>
    );
  }
);

TableCard.displayName = 'TableCard';

export default TableCard;
