import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { tablesApi, ordersApi } from '@/services/api';
import type { Table, Order } from '@/services/api';
import { useSocket } from '@/hooks';
import { useCallback, useState, useEffect } from 'react';

export default function TableList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.getAll,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', 'active'],
    queryFn: () => ordersApi.getAll(),
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

  const getTableOrder = (tableId: string): Order | undefined => {
    return orders.find(
      (o) => o.tableId === tableId && ['open', 'kitchen', 'ready'].includes(o.status)
    );
  };

  const getDwellTime = (order: Order | undefined): string | null => {
    if (!order) return null;
    const start = new Date(order.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return '<1dk';
    if (diffMins < 60) return `${diffMins}dk`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}s ${mins}dk`;
  };

  const formatPrice = (n: number) => `₺${n.toLocaleString('tr-TR')}`;
  const formatTime = (date: Date) => date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  const floors = [
    { id: 'all', name: 'Tümü' },
    { id: 'salon', name: 'Salon' },
    { id: 'teras', name: 'Teras' },
    { id: 'bahce', name: 'Bahçe' },
  ];

  const activeOrders = orders.filter(o => ['open', 'kitchen', 'ready'].includes(o.status));
  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const stats = {
    empty: tables.filter(t => t.status === 'empty').length,
    occupied: tables.filter(t => t.status !== 'empty').length,
    kitchen: orders.filter(o => o.status === 'kitchen').length,
    ready: orders.filter(o => o.status === 'ready').length,
  };

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA] select-none">
      {/* Header */}
      <header className="h-16 px-6 flex items-center justify-between bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <img 
            src={`${import.meta.env.BASE_URL}pixpos-dark.png`}
            alt="" 
            style={{ height: '32px' }}
          />
        </div>
        
        <div className="text-2xl font-semibold text-gray-900 tabular-nums">
          {formatTime(currentTime)}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500" title="Bağlı" />
          <div className="text-sm text-gray-600">Ahmet K.</div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sol Sidebar */}
        <aside className="w-48 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4">
            <div className="text-xs font-medium text-gray-400 uppercase mb-3">Bölümler</div>
            <div className="space-y-1">
              {floors.map((floor) => (
                <button
                  key={floor.id}
                  onClick={() => setSelectedFloor(floor.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFloor === floor.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {floor.name}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="text-xs font-medium text-gray-400 uppercase mb-3">Durum</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Boş</span>
                <span className="font-medium text-gray-700">{stats.empty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dolu</span>
                <span className="font-medium text-green-600">{stats.occupied}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mutfakta</span>
                <span className="font-medium text-orange-500">{stats.kitchen}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Hazır</span>
                <span className="font-medium text-blue-600">{stats.ready}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Ana İçerik - Masa Grid */}
        <main className="flex-1 p-6 overflow-y-auto">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              Yükleniyor...
            </div>
          ) : tables.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-2">Henüz masa yok</div>
                <div className="text-sm text-gray-300">Boss Panel'den masa ekleyin</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {tables.map((table) => {
                const order = getTableOrder(table.id);
                const dwellTime = getDwellTime(order);
                const isEmpty = table.status === 'empty';
                const isReady = order?.status === 'ready';
                const isKitchen = order?.status === 'kitchen';

                let cardStyle = 'bg-white border-gray-200 hover:border-gray-300';
                let numberColor = 'text-gray-300';
                
                if (isReady) {
                  cardStyle = 'bg-blue-50 border-blue-300 hover:border-blue-400';
                  numberColor = 'text-blue-600';
                } else if (isKitchen) {
                  cardStyle = 'bg-orange-50 border-orange-300 hover:border-orange-400';
                  numberColor = 'text-orange-500';
                } else if (!isEmpty) {
                  cardStyle = 'bg-green-50 border-green-300 hover:border-green-400';
                  numberColor = 'text-green-600';
                }

                return (
                  <button
                    key={table.id}
                    onClick={() => navigate(`/order/${table.id}`)}
                    className={`aspect-square rounded-xl border-2 p-4 flex flex-col items-center justify-center transition-all hover:shadow-md active:scale-[0.98] ${cardStyle}`}
                  >
                    <div className={`text-4xl font-bold ${numberColor}`}>
                      {table.name.replace('Masa ', '')}
                    </div>
                    
                    {!isEmpty && (
                      <div className="mt-2 space-y-1 text-center">
                        {dwellTime && (
                          <div className="text-xs text-gray-400">{dwellTime}</div>
                        )}
                        {order && order.totalAmount > 0 && (
                          <div className="text-sm font-semibold text-green-600">
                            {formatPrice(order.totalAmount)}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {isEmpty && (
                      <div className="mt-2 text-xs text-gray-300 uppercase">Boş</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </main>

        {/* Sağ Panel - Özet */}
        <aside className="w-64 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="text-xs font-medium text-gray-400 uppercase mb-2">Açık Adisyonlar</div>
            <div className="text-3xl font-bold text-gray-900">{activeOrders.length}</div>
          </div>

          <div className="p-4 border-b border-gray-200">
            <div className="text-xs font-medium text-gray-400 uppercase mb-2">Toplam Tutar</div>
            <div className="text-2xl font-bold text-green-600">{formatPrice(totalRevenue)}</div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-xs font-medium text-gray-400 uppercase mb-3">Son Siparişler</div>
            {activeOrders.length === 0 ? (
              <div className="text-sm text-gray-300 text-center py-8">Henüz sipariş yok</div>
            ) : (
              <div className="space-y-2">
                {activeOrders.slice(0, 10).map((order) => {
                  const table = tables.find(t => t.id === order.tableId);
                  let dotColor = 'bg-green-500';
                  if (order.status === 'ready') dotColor = 'bg-blue-500';
                  else if (order.status === 'kitchen') dotColor = 'bg-orange-500';

                  return (
                    <button
                      key={order.id}
                      onClick={() => navigate(`/order/${order.tableId}`)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {table?.name || 'Masa'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {order.items?.length || 0} ürün
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-600">
                        {formatPrice(order.totalAmount)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
