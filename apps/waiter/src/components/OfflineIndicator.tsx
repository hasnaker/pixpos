import { useEffect, useState } from 'react';
import { WifiOff, CloudOff, RefreshCw } from 'lucide-react';
import { networkStatus, ordersApi } from '@/services/api';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(networkStatus.isOnline());
  const [pendingCount, setPendingCount] = useState(ordersApi.getPendingCount());
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Listen for network status changes
    const cleanup = networkStatus.onStatusChange((online) => {
      setIsOnline(online);
      
      // Auto-sync when back online
      if (online && pendingCount > 0) {
        handleSync();
      }
    });

    // Update pending count periodically
    const interval = setInterval(() => {
      setPendingCount(ordersApi.getPendingCount());
    }, 5000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, [pendingCount]);

  const handleSync = async () => {
    if (syncing || !isOnline) return;
    
    setSyncing(true);
    try {
      const result = await ordersApi.syncPendingOrders();
      setPendingCount(ordersApi.getPendingCount());
      
      if (result.synced > 0) {
        console.log(`Synced ${result.synced} orders`);
      }
      if (result.failed > 0) {
        console.error(`Failed to sync ${result.failed} orders`);
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Don't show anything if online and no pending orders
  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="flex items-center gap-2 bg-red-500/90 text-white px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm">
          <WifiOff className="w-5 h-5" />
          <span className="text-sm font-medium">Çevrimdışı</span>
        </div>
      )}

      {/* Pending orders indicator */}
      {pendingCount > 0 && (
        <div 
          className={`flex items-center gap-2 mt-2 px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm cursor-pointer ${
            isOnline ? 'bg-yellow-500/90 text-black' : 'bg-orange-500/90 text-white'
          }`}
          onClick={handleSync}
        >
          {syncing ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <CloudOff className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">
            {syncing ? 'Senkronize ediliyor...' : `${pendingCount} bekleyen sipariş`}
          </span>
        </div>
      )}
    </div>
  );
}
