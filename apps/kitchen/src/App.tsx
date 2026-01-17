import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kitchenApi, KitchenOrder } from '@/services/api';
import { useKitchenSocket } from '@/hooks/useSocket';
import { useSound } from '@/hooks/useSound';
import { Header, OrderTicket, OrderDetailModal, EmptyState } from '@/components';

function App() {
  const queryClient = useQueryClient();
  const { 
    playNewOrderSound, 
    playReadySound,
    soundEnabled, 
    toggleSound, 
    volume, 
    updateVolume 
  } = useSound();
  
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);
  const previousOrderIdsRef = useRef<Set<string>>(new Set());

  // Fetch kitchen orders
  const { 
    data: orders = [], 
    isLoading, 
    refetch,
    isFetching 
  } = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: kitchenApi.getOrders,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    const pending = orders.filter(o => o.status === 'kitchen' || o.status === 'open').length;
    const preparing = orders.filter(o => o.status === 'preparing').length;
    const ready = orders.filter(o => o.status === 'ready').length;
    
    // Calculate average waiting time
    const waitingTimes = orders.map(o => {
      const created = new Date(o.createdAt);
      const now = new Date();
      return Math.floor((now.getTime() - created.getTime()) / 1000 / 60);
    });
    const avgTime = waitingTimes.length > 0 
      ? Math.round(waitingTimes.reduce((a, b) => a + b, 0) / waitingTimes.length)
      : 0;

    return {
      pending,
      preparing,
      ready,
      averageTime: avgTime,
      total: orders.length,
    };
  }, [orders]);

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: 'preparing' | 'ready' }) =>
      kitchenApi.updateStatus(orderId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      setProcessingOrder(null);
      
      // Play ready sound when marking as ready
      if (variables.status === 'ready') {
        playReadySound();
      }
    },
    onError: (error) => {
      console.error('Failed to update order status:', error);
      setProcessingOrder(null);
    },
  });

  // Handle status change
  const handleStatusChange = useCallback((orderId: string, status: 'preparing' | 'ready') => {
    setProcessingOrder(orderId);
    updateStatusMutation.mutate({ orderId, status });
  }, [updateStatusMutation]);

  // Handle view details
  const handleViewDetails = useCallback((order: KitchenOrder) => {
    setSelectedOrder(order);
  }, []);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  // WebSocket handlers
  const handleOrderNew = useCallback((order: KitchenOrder) => {
    console.log('New order received:', order);
    playNewOrderSound();
    queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
  }, [queryClient, playNewOrderSound]);

  const handleOrderUpdated = useCallback((order: KitchenOrder) => {
    console.log('Order updated:', order);
    queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
    
    // Update selected order if it's the one being viewed
    if (selectedOrder && selectedOrder.id === order.id) {
      setSelectedOrder(order);
    }
  }, [queryClient, selectedOrder]);

  const handleOrderReady = useCallback((orderId: string) => {
    console.log('Order marked ready:', orderId);
    queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
  }, [queryClient]);

  // Connect to WebSocket
  useKitchenSocket({
    onOrderNew: handleOrderNew,
    onOrderUpdated: handleOrderUpdated,
    onOrderReady: handleOrderReady,
  });

  // Check for new orders and play sound
  useEffect(() => {
    const currentOrderIds = new Set(orders.map(o => o.id));
    const previousIds = previousOrderIdsRef.current;

    // Find new orders (in current but not in previous)
    const newOrders = orders.filter(o => !previousIds.has(o.id));
    
    // Play sound if there are new orders (but not on initial load)
    if (newOrders.length > 0 && previousIds.size > 0) {
      playNewOrderSound();
    }

    // Update previous order IDs
    previousOrderIdsRef.current = currentOrderIds;
  }, [orders, playNewOrderSound]);

  // Update time every minute for waiting time display
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Sort orders by waiting time (oldest first)
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      // Preparing orders first
      if (a.status === 'preparing' && b.status !== 'preparing') return -1;
      if (b.status === 'preparing' && a.status !== 'preparing') return 1;
      
      // Then by creation time (oldest first)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [orders]);

  if (isLoading) {
    return (
      <div className="kitchen-display">
        <Header 
          orderCount={0}
          pendingCount={0}
          preparingCount={0}
          readyCount={0}
          averageTime={0}
          onRefresh={handleRefresh} 
          isRefreshing={true}
          soundEnabled={soundEnabled}
          onSoundToggle={toggleSound}
          volume={volume}
          onVolumeChange={updateVolume}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-title-2 text-[var(--color-text-secondary)]">
            Yükleniyor...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kitchen-display">
      <Header 
        orderCount={metrics.total}
        pendingCount={metrics.pending}
        preparingCount={metrics.preparing}
        readyCount={metrics.ready}
        averageTime={metrics.averageTime}
        onRefresh={handleRefresh} 
        isRefreshing={isFetching}
        soundEnabled={soundEnabled}
        onSoundToggle={toggleSound}
        volume={volume}
        onVolumeChange={updateVolume}
      />
      
      <main className="flex-1 overflow-auto">
        {sortedOrders.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="order-grid">
            {sortedOrders.map((order) => (
              <OrderTicket
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
                onViewDetails={handleViewDetails}
                isLoading={processingOrder === order.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={handleCloseModal}
          onStatusChange={handleStatusChange}
          isLoading={processingOrder === selectedOrder.id}
        />
      )}
    </div>
  );
}

export default App;
