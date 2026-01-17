import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { 
  Users, Clock, ChevronRight, X, CreditCard, Banknote, 
  Smartphone, UserCheck, Building2, Check
} from 'lucide-react';
import { tablesApi, ordersApi, paymentsApi } from '@/services/api';
import type { Table, Order } from '@/services/api';
import { useSocket } from '@/hooks';

type ActionMode = 'merge' | 'transfer' | 'split' | null;

interface TableMapProps {
  selectedFloor: string;
  actionMode: ActionMode;
  selectedTables: string[];
  onSelectedTablesChange: (tables: string[]) => void;
  onCancelAction: () => void;
}

export default function TableMap({ 
  selectedFloor, 
  actionMode,
  selectedTables,
  onSelectedTablesChange,
  onCancelAction,
}: TableMapProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.getAll,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', 'active'],
    queryFn: () => ordersApi.getAll(),
  });

  // Filter tables by selected zone from sidebar
  const filteredTables = useMemo(() => {
    if (selectedFloor === 'all') {
      // Tüm bölgeler - tüm masaları göster
      return tables;
    }
    if (selectedFloor === 'active') {
      // Aktif masalar - sadece siparişi olan masaları göster
      const activeTableIds = orders
        .filter(o => ['open', 'sent'].includes(o.status))
        .map(o => o.tableId);
      return tables.filter(t => activeTableIds.includes(t.id));
    }
    // Belirli bölge
    return tables.filter(t => (t.zone || 'Salon') === selectedFloor);
  }, [tables, selectedFloor, orders]);

  const paymentMutation = useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setShowPaymentModal(false);
      setSelectedOrder(null);
    },
  });

  const handleTableUpdated = useCallback((table: Table) => {
    queryClient.setQueryData<Table[]>(['tables'], (old) => {
      if (!old) return [table];
      const index = old.findIndex((t) => t.id === table.id);
      if (index === -1) return [...old, table];
      const updated = [...old];
      updated[index] = table;
      return updated;
    });
  }, [queryClient]);

  const handleOrderUpdated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  }, [queryClient]);

  useSocket({
    room: 'pos',
    onTableUpdated: handleTableUpdated,
    onOrderNew: handleOrderUpdated,
    onOrderUpdated: handleOrderUpdated,
    onOrderReady: handleOrderUpdated,
  });

  const getTableOrder = useCallback((tableId: string): Order | undefined => {
    return orders.find((o) => o.tableId === tableId && ['open', 'sent'].includes(o.status));
  }, [orders]);

  const getDwellTime = useCallback((order: Order | undefined): string | null => {
    if (!order) return null;
    const diffMins = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
    if (diffMins < 1) return '1dk';
    if (diffMins < 60) return `${diffMins}dk`;
    return `${Math.floor(diffMins / 60)}s ${diffMins % 60}dk`;
  }, []);

  const stats = useMemo(() => {
    const active = orders.filter(o => ['open', 'sent'].includes(o.status));
    const totalRevenue = active.reduce((sum, o) => {
      const amount = typeof o.totalAmount === 'number' ? o.totalAmount : parseFloat(o.totalAmount) || 0;
      return sum + amount;
    }, 0);
    return { active: active.length, total: filteredTables.length, revenue: totalRevenue };
  }, [orders, filteredTables]);

  const activeOrders = useMemo(() => {
    return orders
      .filter(o => ['open', 'sent'].includes(o.status))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders]);

  const formatPrice = (n: number | string) => {
    const num = typeof n === 'number' ? n : parseFloat(n) || 0;
    return `₺${num.toFixed(2)}`;
  };

  const handlePayment = (method: 'cash' | 'card' | 'online' | 'staff') => {
    if (!selectedOrder) return;
    const amount = typeof selectedOrder.totalAmount === 'number' 
      ? selectedOrder.totalAmount 
      : parseFloat(selectedOrder.totalAmount) || 0;
    paymentMutation.mutate({
      orderId: selectedOrder.id,
      amount,
      paymentMethod: method === 'online' || method === 'staff' ? 'card' : method,
    });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Sol: Masa Grid */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Masa Grid */}
        {filteredTables.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Users size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-500">Masa bulunamadı</p>
          </div>
        ) : (
          <div 
            className="rounded-2xl overflow-auto mt-2"
            style={{ 
              background: 'transparent',
              border: 'none',
              maxHeight: 'calc(100vh - 180px)',
            }}
          >
            <div className="grid grid-cols-6 xl:grid-cols-7 2xl:grid-cols-9">
              {filteredTables.map((table) => {
                const order = getTableOrder(table.id);
                const time = getDwellTime(order);
                const hasOrder = !!order;
                const isSent = order?.status === 'sent';
                const amount = order ? (typeof order.totalAmount === 'number' ? order.totalAmount : parseFloat(order.totalAmount) || 0) : 0;
                const isSelected = selectedTables.includes(table.id);

                // Handle table click based on action mode
                const handleTableClick = () => {
                  if (actionMode === 'merge') {
                    // Only allow selecting tables with orders
                    if (!hasOrder) return;
                    if (isSelected) {
                      onSelectedTablesChange(selectedTables.filter(id => id !== table.id));
                    } else {
                      onSelectedTablesChange([...selectedTables, table.id]);
                    }
                  } else if (actionMode === 'transfer') {
                    // First select source (must have order), then target (must be empty)
                    if (selectedTables.length === 0) {
                      if (!hasOrder) return;
                      onSelectedTablesChange([table.id]);
                    } else if (selectedTables.length === 1) {
                      if (hasOrder) return; // Target must be empty
                      onSelectedTablesChange([...selectedTables, table.id]);
                    }
                  } else if (actionMode === 'split') {
                    // Navigate to payment screen for split
                    if (hasOrder && order) {
                      navigate(`/payment/${order.id}?action=split`);
                      onCancelAction();
                    }
                  } else {
                    // Normal mode - navigate to order
                    navigate(`/order/${table.id}`);
                  }
                };

                // Determine if table is selectable in current action mode
                const isSelectable = actionMode === null || 
                  (actionMode === 'merge' && hasOrder) ||
                  (actionMode === 'transfer' && (selectedTables.length === 0 ? hasOrder : !hasOrder)) ||
                  (actionMode === 'split' && hasOrder);

                return (
                  <button
                    key={table.id}
                    onClick={handleTableClick}
                    disabled={actionMode !== null && !isSelectable}
                    className="relative flex flex-col items-center justify-center gap-1.5 p-4 min-h-[110px] transition-all hover:bg-white/5 active:scale-95"
                    style={{
                      borderRight: '1px solid rgba(255,255,255,0.12)',
                      borderBottom: '1px solid rgba(255,255,255,0.12)',
                      boxShadow: isSelected 
                        ? actionMode === 'merge'
                          ? 'inset 0 0 0 3px #0A84FF'
                          : 'inset 0 0 0 3px #FF9F0A'
                        : 'inset -1px 0 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(255,255,255,0.05)',
                      background: isSelected
                        ? actionMode === 'merge'
                          ? 'rgba(10,132,255,0.15)'
                          : 'rgba(255,159,10,0.15)'
                        : hasOrder 
                          ? isSent 
                            ? 'rgba(10,132,255,0.08)' 
                            : 'rgba(48,209,88,0.08)'
                          : 'transparent',
                      opacity: actionMode !== null && !isSelectable ? 0.3 : 1,
                      cursor: actionMode !== null && !isSelectable ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {/* Selection checkmark */}
                    {isSelected && (
                      <div 
                        className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          background: actionMode === 'merge' ? '#0A84FF' : '#FF9F0A',
                          boxShadow: actionMode === 'merge' ? '0 0 12px #0A84FF' : '0 0 12px #FF9F0A'
                        }}
                      >
                        <Check size={12} style={{ color: '#fff' }} strokeWidth={3} />
                      </div>
                    )}

                    {/* Status dot */}
                    {hasOrder && !isSelected && (
                      <div 
                        className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full"
                        style={{
                          background: isSent ? '#0A84FF' : '#30D158',
                          boxShadow: isSent ? '0 0 10px #0A84FF' : '0 0 10px #30D158'
                        }}
                      />
                    )}
                    
                    {/* Masa numarası */}
                    <span className="text-2xl font-bold text-white">
                      {table.name.replace('Masa ', '')}
                    </span>
                    
                    {/* Süre veya Boş */}
                    {time ? (
                      <span 
                        className="text-[10px] text-gray-300 flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(0,0,0,0.3)' }}
                      >
                        <Clock size={8} />{time}
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-600">Boş</span>
                    )}
                    
                    {/* Tutar */}
                    {hasOrder && amount > 0 && (
                      <span 
                        className="text-sm font-bold"
                        style={{ color: isSelected 
                          ? (actionMode === 'merge' ? '#0A84FF' : '#FF9F0A')
                          : (isSent ? '#0A84FF' : '#30D158') 
                        }}
                      >
                        {formatPrice(amount)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sağ: Aktif Hesaplar - Apple Minimal */}
      <aside className="w-[340px] flex-shrink-0 flex flex-col">
        {/* Başlık */}
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-[20px] font-semibold text-white">Aktif Hesaplar</h2>
          <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {activeOrders.length} açık
          </span>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto">
          {activeOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-[15px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Henüz açık hesap yok
              </p>
            </div>
          ) : (
            <div>
              {activeOrders.map((order, idx) => {
                const table = tables.find(t => t.id === order.tableId);
                const time = getDwellTime(order);
                const amount = typeof order.totalAmount === 'number' ? order.totalAmount : parseFloat(order.totalAmount) || 0;

                return (
                  <div key={order.id}>
                    {idx > 0 && (
                      <div className="mx-0" style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginTop: '8px', marginBottom: '8px' }} />
                    )}
                    <div
                      onClick={() => navigate(`/order/${order.tableId}`)}
                      className="flex items-center gap-4 py-4 cursor-pointer transition-colors duration-150 rounded-xl px-3 -mx-3"
                      style={{ background: 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-[15px] font-semibold"
                        style={{ background: 'rgba(48,209,88,0.15)', color: '#30D158' }}>
                        {table?.name.replace('Masa ', '').replace(/^[A-Z]+-/, '') || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-medium" style={{ color: '#30D158' }}>{table?.name || 'Masa'}</p>
                        <p className="text-[13px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{time || 'Şimdi'}</p>
                      </div>
                      <p className="text-[17px] font-semibold text-white tabular-nums">{formatPrice(amount)}</p>
                      <ChevronRight size={18} style={{ color: 'rgba(255,255,255,0.25)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Alt Özet */}
        {activeOrders.length > 0 && (
          <div className="pt-6 mt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-baseline justify-between">
              <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Toplam</p>
              <p className="text-[28px] font-semibold text-white tabular-nums">{formatPrice(stats.revenue)}</p>
            </div>
          </div>
        )}
      </aside>

      {/* Ödeme Modal */}
      {showPaymentModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div 
            className="w-[480px] rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(28,28,30,0.98)',
              backdropFilter: 'blur(60px) saturate(200%)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.6)'
            }}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
                  style={{ background: 'rgba(48,209,88,0.2)', color: '#30D158' }}
                >
                  {tables.find(t => t.id === selectedOrder.tableId)?.name.replace('Masa ', '') || '?'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Ödeme Al</h3>
                  <p className="text-sm text-gray-500">#{selectedOrder.orderNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tutar */}
            <div className="px-6 py-8 text-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <p className="text-sm text-gray-500 mb-2">Ödenecek Tutar</p>
              <p className="text-5xl font-bold text-white" style={{ textShadow: '0 0 40px rgba(48,209,88,0.4)' }}>
                {formatPrice(selectedOrder.totalAmount)}
              </p>
            </div>

            {/* Ödeme Yöntemleri */}
            <div className="p-6 space-y-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Ödeme Yöntemi</p>
              
              {/* Nakit */}
              <button
                onClick={() => handlePayment('cash')}
                disabled={paymentMutation.isPending}
                className="w-full p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'rgba(48,209,88,0.1)',
                  border: '1px solid rgba(48,209,88,0.3)'
                }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(48,209,88,0.2)' }}>
                  <Banknote size={22} className="text-green-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-white">Nakit</p>
                  <p className="text-xs text-gray-500">Kasa çekmecesi açılır</p>
                </div>
                <ChevronRight size={18} className="text-gray-500" />
              </button>

              {/* Kredi Kartı */}
              <button
                onClick={() => handlePayment('card')}
                disabled={paymentMutation.isPending}
                className="w-full p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'rgba(10,132,255,0.1)',
                  border: '1px solid rgba(10,132,255,0.3)'
                }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(10,132,255,0.2)' }}>
                  <CreditCard size={22} className="text-blue-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-white">Kredi Kartı</p>
                  <p className="text-xs text-gray-500">ÖKC / POS cihazı</p>
                </div>
                <ChevronRight size={18} className="text-gray-500" />
              </button>

              {/* Online */}
              <button
                onClick={() => handlePayment('online')}
                disabled={paymentMutation.isPending}
                className="w-full p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'rgba(191,90,242,0.1)',
                  border: '1px solid rgba(191,90,242,0.3)'
                }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(191,90,242,0.2)' }}>
                  <Smartphone size={22} className="text-purple-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-white">Online Ödeme</p>
                  <p className="text-xs text-gray-500">QR kod ile ödeme</p>
                </div>
                <ChevronRight size={18} className="text-gray-500" />
              </button>

              {/* Personel */}
              <button
                onClick={() => handlePayment('staff')}
                disabled={paymentMutation.isPending}
                className="w-full p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'rgba(255,159,10,0.1)',
                  border: '1px solid rgba(255,159,10,0.3)'
                }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,159,10,0.2)' }}>
                  <UserCheck size={22} className="text-orange-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-white">Personel</p>
                  <p className="text-xs text-gray-500">İndirimli personel ödemesi</p>
                </div>
                <ChevronRight size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Kasa Seçimi */}
            <div className="px-6 pb-6">
              <div 
                className="p-4 rounded-2xl flex items-center gap-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Building2 size={20} className="text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Aktif Kasa</p>
                  <p className="font-medium text-white">Ana Kasa - Queen Waffle</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
