import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginScreen, TableList, OrderScreen } from '@/pages';
import { OfflineIndicator } from '@/components/OfflineIndicator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
    },
  },
});

function App() {
  const basename = import.meta.env.BASE_URL || '/';
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route path="/tables" element={<TableList />} />
          <Route path="/order/:tableId" element={<OrderScreen />} />
        </Routes>
        <OfflineIndicator />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
