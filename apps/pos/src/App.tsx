import { useState, useCallback, useEffect, useRef } from 'react';
import { HashRouter, BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient, useQuery } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';

// Detect if running in Electron (file:// protocol)
const isElectron = typeof window !== 'undefined' && (
  window.location.protocol === 'file:' || 
  navigator.userAgent.includes('Electron')
);
import { LockScreen, TableMap, OrderScreen, PaymentScreen, SettingsScreen, CustomerDisplay } from '@/pages';
import { MainLayout } from '@/components/layout';
import { SettingsProvider } from '@/contexts';
import { ordersApi, printersApi, tablesApi, categoriesApi, productsApi } from '@/services/api';
import SplashScreen from '@/components/SplashScreen';

// Track orders that POS itself sent to kitchen (to avoid double printing)
const sentFromPOS = new Set<string>();
export function markOrderSentFromPOS(orderId: string) {
  sentFromPOS.add(orderId);
  // Clean up after 5 minutes
  setTimeout(() => sentFromPOS.delete(orderId), 5 * 60 * 1000);
}

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
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [actionMode, setActionMode] = useState<'merge' | 'transfer' | 'split' | null>(null);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Get active orders to find order IDs for selected tables
  const { data: orders = [] } = useQuery({
    queryKey: ['orders', 'active'],
    queryFn: () => ordersApi.getAll(),
    enabled: !showSplash, // Only fetch when splash is done
  });

  // Global WebSocket listener for kitchen printing (tablet orders)
  useEffect(() => {
    if (showSplash) return;
    
    // Only run in Electron (EXE) - web can't print to local printers
    if (!isElectron || !window.electronAPI?.printKitchenTicket) {
      console.log('Kitchen print listener: Not in Electron, skipping');
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'https://api.pixpos.cloud';
    const socket = io(wsUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Kitchen print listener: WebSocket connected');
      socket.emit('join:room', { room: 'pos' });
    });

    // Handler for printing kitchen tickets
    const handleKitchenPrint = async (order: any) => {
      // Only print if status is 'sent' and not sent from this POS
      if (order.status !== 'sent') return;
      if (sentFromPOS.has(order.id)) {
        console.log(`Kitchen print: Order ${order.id} was sent from this POS, skipping`);
        return;
      }

      console.log(`Kitchen print: Order ${order.id} sent from tablet, printing...`);

      try {
        // Get printers and categories from API
        const [printers, categories, products] = await Promise.all([
          printersApi.getAll(),
          categoriesApi.getAll(),
          productsApi.getAll(),
        ]);
        
        const kitchenPrinters = printers.filter(
          (p: any) => (p.type === 'kitchen' || p.type === 'bar') && p.isActive && p.ipAddress
        );

        if (kitchenPrinters.length === 0) {
          console.log('Kitchen print: No kitchen/bar printers configured');
          return;
        }

        // Build category -> printer map
        const categoryPrinterMap = new Map<string, string>();
        categories.forEach((cat: any) => {
          if (cat.printerId) {
            categoryPrinterMap.set(cat.id, cat.printerId);
          }
        });

        // Build product -> category map
        const productCategoryMap = new Map<string, string>();
        products.forEach((prod: any) => {
          productCategoryMap.set(prod.id, prod.categoryId);
        });

        // Find default kitchen printer (fallback)
        const defaultKitchenPrinter = kitchenPrinters.find((p: any) => p.type === 'kitchen');

        // Get table name
        let tableName = 'Bilinmiyor';
        try {
          if (order.tableId) {
            const table = await tablesApi.getOne(order.tableId);
            tableName = table.name;
          }
        } catch (e) {
          console.error('Failed to get table name:', e);
        }

        // Group items by printer
        const printerItemsMap = new Map<string, any[]>();
        
        for (const item of order.items || []) {
          const categoryId = productCategoryMap.get(item.productId);
          let printerId = categoryId ? categoryPrinterMap.get(categoryId) : null;
          
          // Fallback to default kitchen printer if no category printer
          if (!printerId && defaultKitchenPrinter) {
            printerId = defaultKitchenPrinter.id;
          }
          
          if (printerId) {
            if (!printerItemsMap.has(printerId)) {
              printerItemsMap.set(printerId, []);
            }
            printerItemsMap.get(printerId)!.push({
              productName: item.productName,
              quantity: item.quantity,
              notes: item.notes,
            });
          }
        }

        // Print to each printer with its items
        for (const [printerId, items] of printerItemsMap) {
          const printer = kitchenPrinters.find((p: any) => p.id === printerId);
          if (!printer || !printer.ipAddress) continue;

          const orderData = {
            orderNumber: order.orderNumber,
            tableName,
            items,
          };

          try {
            await window.electronAPI!.printKitchenTicket({
              order: orderData,
              printerIp: printer.ipAddress,
              printerPort: printer.port || 9100,
            });
            console.log(`Kitchen print: Sent ${items.length} items to ${printer.name} (${printer.ipAddress})`);
          } catch (err) {
            console.error(`Kitchen print: Failed to print to ${printer.name}:`, err);
          }
        }

        // Invalidate orders to refresh UI
        queryClientHook.invalidateQueries({ queryKey: ['orders'] });
      } catch (error) {
        console.error('Kitchen print error:', error);
      }
    };

    // Listen for order:new event (sent from API when order is sent to kitchen)
    socket.on('order:new', (data: { order: any }) => {
      handleKitchenPrint(data.order);
    });

    // Listen for order:updated event (fallback)
    socket.on('order:updated', (data: { order: any }) => {
      handleKitchenPrint(data.order);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [showSplash, queryClientHook]);

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

        // İlk seçilen masa hedef masa olarak kullanılır
        // Kullanıcıya bilgi ver
        const targetTableId = selectedTables[0];
        const confirmMessage = `Tüm siparişler "${targetTableId}" masasına birleştirilecek. Devam etmek istiyor musunuz?`;
        
        if (!confirm(confirmMessage)) {
          return;
        }

        console.log('Merging orders:', orderIds, 'to table:', targetTableId);
        await ordersApi.merge({
          orderIds,
          targetTableId,
        });

        // Invalidate queries to refresh data
        queryClientHook.invalidateQueries({ queryKey: ['orders'] });
        queryClientHook.invalidateQueries({ queryKey: ['tables'] });
        
        alert('Masalar başarıyla birleştirildi!');
        handleCancelAction();
      } else if (actionMode === 'transfer' && selectedTables.length === 2) {
        // Find order for source table
        const sourceTableId = selectedTables[0];
        const targetTableId = selectedTables[1];
        const sourceOrder = orders.find(o => o.tableId === sourceTableId && ['open', 'sent'].includes(o.status));
        
        console.log('Source table:', sourceTableId);
        console.log('Target table:', targetTableId);
        console.log('Source order:', sourceOrder?.id || 'NOT FOUND');
        
        if (!sourceOrder) {
          alert('Kaynak masada açık sipariş bulunamadı');
          return;
        }

        console.log('Transferring order:', sourceOrder.id, 'to table:', targetTableId);
        
        try {
          await ordersApi.transfer(sourceOrder.id, {
            targetTableId,
          });

          // Invalidate queries to refresh data
          queryClientHook.invalidateQueries({ queryKey: ['orders'] });
          queryClientHook.invalidateQueries({ queryKey: ['tables'] });
          
          alert('Masa başarıyla taşındı!');
          handleCancelAction();
        } catch (transferError) {
          console.error('Transfer failed:', transferError);
          const errorMsg = transferError instanceof Error ? transferError.message : 'Bilinmeyen hata';
          alert(`Masa taşıma başarısız: ${errorMsg}`);
        }
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
