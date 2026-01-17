import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient, useQuery } from '@tanstack/react-query';
import { LockScreen, TableMap, OrderScreen, PaymentScreen, SettingsScreen, CustomerDisplay } from '@/pages';
import { MainLayout } from '@/components/layout';
import { SettingsProvider } from '@/contexts';
import { ordersApi } from '@/services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
    },
  },
});

function AppRoutes() {
  const queryClientHook = useQueryClient();
  const [selectedFloor, setSelectedFloor] = useState('Salon');
  const [actionMode, setActionMode] = useState<'merge' | 'transfer' | 'split' | null>(null);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get active orders to find order IDs for selected tables
  const { data: orders = [] } = useQuery({
    queryKey: ['orders', 'active'],
    queryFn: () => ordersApi.getAll(),
  });

  const handleCancelAction = useCallback(() => {
    setActionMode(null);
    setSelectedTables([]);
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      if (actionMode === 'merge' && selectedTables.length >= 2) {
        // Find order IDs for selected tables
        const orderIds = selectedTables
          .map(tableId => orders.find(o => o.tableId === tableId && ['open', 'sent'].includes(o.status))?.id)
          .filter((id): id is string => !!id);
        
        if (orderIds.length < 2) {
          alert('Seçilen masalarda yeterli açık sipariş bulunamadı');
          return;
        }

        // Use first selected table as target
        await ordersApi.merge({
          orderIds,
          targetTableId: selectedTables[0],
        });

        // Invalidate queries to refresh data
        queryClientHook.invalidateQueries({ queryKey: ['orders'] });
        queryClientHook.invalidateQueries({ queryKey: ['tables'] });
        
        handleCancelAction();
      } else if (actionMode === 'transfer' && selectedTables.length === 2) {
        // Find order for source table
        const sourceOrder = orders.find(o => o.tableId === selectedTables[0] && ['open', 'sent'].includes(o.status));
        
        if (!sourceOrder) {
          alert('Kaynak masada açık sipariş bulunamadı');
          return;
        }

        await ordersApi.transfer(sourceOrder.id, {
          targetTableId: selectedTables[1],
        });

        // Invalidate queries to refresh data
        queryClientHook.invalidateQueries({ queryKey: ['orders'] });
        queryClientHook.invalidateQueries({ queryKey: ['tables'] });
        
        handleCancelAction();
      }
    } catch (error) {
      console.error('Action failed:', error);
      alert('İşlem başarısız oldu');
    } finally {
      setIsProcessing(false);
    }
  }, [actionMode, selectedTables, orders, queryClientHook, handleCancelAction, isProcessing]);

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
  
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <BrowserRouter basename={basename}>
          <AppRoutes />
        </BrowserRouter>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
