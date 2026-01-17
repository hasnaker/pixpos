import { 
  Plus, 
  Minus, 
  Trash2, 
  Percent, 
  Scissors, 
  Merge, 
  StickyNote,
  ChevronRight
} from 'lucide-react';
import { Modal } from '@/components/ui';

interface OperationsMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: () => void;
  onChangeQuantity: () => void;
  onDeleteItem: () => void;
  onApplyDiscount: () => void;
  onSplitOrder: () => void;
  onMergeOrders: () => void;
  onAddNote: () => void;
  hasItems: boolean;
  hasMultipleOrders?: boolean;
}

interface OperationItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

export default function OperationsMenuModal({
  isOpen,
  onClose,
  onAddProduct,
  onChangeQuantity,
  onDeleteItem,
  onApplyDiscount,
  onSplitOrder,
  onMergeOrders,
  onAddNote,
  hasItems,
  hasMultipleOrders = false,
}: OperationsMenuModalProps) {
  const operations: OperationItem[] = [
    {
      id: 'add-product',
      icon: <Plus size={20} />,
      label: 'Yeni Ürün Ekle',
      description: 'Siparişe yeni ürün ekleyin',
      onClick: () => {
        onClose();
        onAddProduct();
      },
    },
    {
      id: 'change-quantity',
      icon: <Minus size={20} />,
      label: 'Adet Değiştir',
      description: 'Ürün miktarını değiştirin',
      onClick: () => {
        onClose();
        onChangeQuantity();
      },
      disabled: !hasItems,
    },
    {
      id: 'delete-item',
      icon: <Trash2 size={20} />,
      label: 'Ürün Sil',
      description: 'Siparişten ürün çıkarın',
      onClick: () => {
        onClose();
        onDeleteItem();
      },
      disabled: !hasItems,
      variant: 'danger',
    },
    {
      id: 'apply-discount',
      icon: <Percent size={20} />,
      label: 'İndirim Uygula',
      description: 'Yüzde veya tutar indirimi',
      onClick: () => {
        onClose();
        onApplyDiscount();
      },
      disabled: !hasItems,
    },
    {
      id: 'split-order',
      icon: <Scissors size={20} />,
      label: 'Sipariş Böl',
      description: 'Hesabı ayrı ödemeler için bölün',
      onClick: () => {
        onClose();
        onSplitOrder();
      },
      disabled: !hasItems,
    },
    {
      id: 'merge-orders',
      icon: <Merge size={20} />,
      label: 'Sipariş Birleştir',
      description: 'Birden fazla siparişi birleştirin',
      onClick: () => {
        onClose();
        onMergeOrders();
      },
      disabled: !hasMultipleOrders,
    },
    {
      id: 'add-note',
      icon: <StickyNote size={20} />,
      label: 'Not Ekle',
      description: 'Siparişe not ekleyin',
      onClick: () => {
        onClose();
        onAddNote();
      },
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sipariş İşlemleri"
      size="sm"
    >
      <div className="space-y-2">
        {operations.map((operation) => (
          <button
            key={operation.id}
            onClick={operation.onClick}
            disabled={operation.disabled}
            className={`
              w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left
              ${operation.disabled 
                ? 'opacity-50 cursor-not-allowed bg-[#F6F6F6]' 
                : operation.variant === 'danger'
                  ? 'bg-[#FCDBD7] hover:bg-[#FAC3BC] text-[#F14C35]'
                  : 'bg-[#F6F6F6] hover:bg-[#EEEEEE]'
              }
            `}
          >
            {/* Icon */}
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
              ${operation.disabled 
                ? 'bg-[#E3E3E3] text-[#A5A5A5]'
                : operation.variant === 'danger'
                  ? 'bg-[#F14C35] text-white'
                  : 'bg-[#A27B5C] text-white'
              }
            `}>
              {operation.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`
                text-sm font-semibold
                ${operation.disabled 
                  ? 'text-[#A5A5A5]' 
                  : operation.variant === 'danger'
                    ? 'text-[#F14C35]'
                    : 'text-[#121212]'
                }
              `}>
                {operation.label}
              </p>
              <p className={`
                text-xs mt-0.5
                ${operation.disabled ? 'text-[#C6C6C6]' : 'text-[#7F7F7F]'}
              `}>
                {operation.description}
              </p>
            </div>

            {/* Arrow */}
            {!operation.disabled && (
              <ChevronRight 
                size={18} 
                className={operation.variant === 'danger' ? 'text-[#F14C35]' : 'text-[#A5A5A5]'} 
              />
            )}
          </button>
        ))}
      </div>
    </Modal>
  );
}
