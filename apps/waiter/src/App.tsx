import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginScreen, TableList, OrderScreen } from '@/pages';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import SplashScreen from '@/components/SplashScreen';

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
  const [showSplash, setShowSplash] = useState(true);
  
  // Check if this is a fresh app launch (not a page refresh within the app)
  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('splashShown');
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }
  
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
