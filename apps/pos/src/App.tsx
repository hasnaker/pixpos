import { useState, useCallback } from 'react';
import { HashRouter, BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient, useQuery } from '@tanstack/react-query';

// Detect if running in Electron (file:// protocol)
const isElectron = typeof window !== 'undefined' && (
  window.location.protocol === 'file:' || 
  navigator.userAgent.includes('Electron')
);
import { LockScreen, TableMap, OrderScreen, PaymentScreen, SettingsScreen, CustomerDisplay } from '@/pages';
import { MainLayout } from '@/components/layout';
import { SettingsProvider } from '@/contexts';
import { ordersApi } from '@/services/api';
import SplashScreen from '@/components/SplashScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
    },
  },
});

function AppRoutes() {
  const [showSplash, setShowSplash] = useState(true);
  const queryClientHook = useQueryClient();
  const [selectedFloor, setSelectedFloor] = useState('Salon');
  const [actionMode, setActionMode] = useState<'merge' | 'transfer' | 'split' | null>(null);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get active orders to find order IDs for selected tables
  const { data: orders = [] } = useQuery({
    queryKey: ['orders', 'active'],
    queryFn: () => ordersApi.getAll(),
    enabled: !showSplash, // Only fetch when splash is done
  });

  const handleCancelAction = useCallback(() => {
    setActionMode(null);
    setSelectedTables([]);
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // Debug log
      console.log('Action Mode:', actionMode);
      console.log('Selected Tables:', selectedTables);
      console.log('Available Orders:', orders.map(o => ({ id: o.id, tableId: o.tableId, status: o.status })));
      
      if (actionMode === 'merge' && selectedTables.length >= 2) {
        // Find order IDs for selected tables
        const orderIds = selectedTables
          .map(tableId => {
            const order = orders.find(o => o.tableId === tableId && ['open', 'sent'].includes(o.status));
            console.log(`Table ${tableId} -> Order:`, order?.id || 'NOT FOUND');
            return order?.id;
          })
          .filter((id): id is string => !!id);
        
        console.log('Order IDs to merge:', orderIds);
        
        if (orderIds.length < 2) {
          alert('Seçilen masalarda yeterli açık sipariş bulunamadı. Lütfen siparişi olan masaları seçin.');
          return;
        }

        // Use first selected table as target
        console.log('Merging orders:', orderIds, 'to table:', selectedTables[0]);
        await ordersApi.merge({
          orderIds,
          targetTableId: selectedTables[0],
        });

        // Invalidate queries to refresh data
        queryClientHook.invalidateQueries({ queryKey: ['orders'] });
        queryClientHook.invalidateQueries({ queryKey: ['tables'] });
        
        alert('Masalar başarıyla birleştirildi!');
        handleCancelAction();
      } else if (actionMode === 'transfer' && selectedTables.length === 2) {
        // Find order for source table
        const sourceOrder = orders.find(o => o.tableId === selectedTables[0] && ['open', 'sent'].includes(o.status));
        
        console.log('Source table:', selectedTables[0]);
        console.log('Target table:', selectedTables[1]);
        console.log('Source order:', sourceOrder?.id || 'NOT FOUND');
        
        if (!sourceOrder) {
          alert('Kaynak masada açık sipariş bulunamadı');
          return;
        }

        console.log('Transferring order:', sourceOrder.id, 'to table:', selectedTables[1]);
        await ordersApi.transfer(sourceOrder.id, {
          targetTableId: selectedTables[1],
        });

        // Invalidate queries to refresh data
        queryClientHook.invalidateQueries({ queryKey: ['orders'] });
        queryClientHook.invalidateQueries({ queryKey: ['tables'] });
        
        alert('Masa başarıyla taşındı!');
        handleCancelAction();
      }
    } catch (error) {
      console.error('Action failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      alert(`İşlem başarısız oldu: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  }, [actionMode, selectedTables, orders, queryClientHook, handleCancelAction, isProcessing]);

  // Show splash screen on first load
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} duration={2500} />;
  }

  return (
    <Routes>
      {/* Lock Screen - Entry Point */}
      <Route path="/" element={<LockScreen />} />
      
      {/* Main POS Layout */}
      <Route 
        path="/tables" 
        element={
          <MainLayout 
            selectedFloor={selectedFloor} 
            onFloorChange={setSelectedFloor}
            actionMode={actionMode}
            onActionModeChange={setActionMode}
            selectedTables={selectedTables}
            onCancelAction={handleCancelAction}
            onConfirmAction={handleConfirmAction}
            isProcessing={isProcessing}
          />
        }
      >
        <Route index element={
          <TableMap 
            selectedFloor={selectedFloor} 
            actionMode={actionMode}
            selectedTables={selectedTables}
            onSelectedTablesChange={setSelectedTables}
            onCancelAction={handleCancelAction}
          />
        } />
      </Route>
      
      {/* Order Screen */}
      <Route path="/order/:tableId" element={<OrderScreen />} />
      
      {/* Payment Screen */}
      <Route path="/payment/:orderId" element={<PaymentScreen />} />
      
      {/* Settings Screen */}
      <Route path="/settings" element={<SettingsScreen />} />
      
      {/* Customer Display - Second Monitor */}
      <Route path="/display" element={<CustomerDisplay />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const basename = import.meta.env.BASE_URL || '/';
  
  // Use HashRouter for Electron (file:// protocol), BrowserRouter for web
  const Router = isElectron ? HashRouter : BrowserRouter;
  
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <Router basename={isElectron ? undefined : basename}>
          <AppRoutes />
        </Router>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
