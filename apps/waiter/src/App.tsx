import { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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

// Auto-lock timeout in seconds
const AUTO_LOCK_TIMEOUT = 45;

// Auto-lock wrapper component
function AutoLockWrapper({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLockWarning, setShowLockWarning] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const lastActivityRef = useRef(Date.now());
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Don't auto-lock on login screen
  const isLoginScreen = location.pathname === '/';
  
  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowLockWarning(false);
    setCountdown(10);
    
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    
    if (!isLoginScreen) {
      // Show warning after AUTO_LOCK_TIMEOUT - 10 seconds
      warningTimerRef.current = setTimeout(() => {
        setShowLockWarning(true);
        setCountdown(10);
        
        // Start countdown
        let count = 10;
        lockTimerRef.current = setInterval(() => {
          count--;
          setCountdown(count);
          if (count <= 0) {
            // Lock the screen
            localStorage.removeItem('waiter');
            navigate('/');
            setShowLockWarning(false);
          }
        }, 1000);
      }, (AUTO_LOCK_TIMEOUT - 10) * 1000);
    }
  }, [isLoginScreen, navigate]);
  
  // Reset on any user activity
  useEffect(() => {
    const handleActivity = () => {
      if (!showLockWarning) {
        resetTimers();
      }
    };
    
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    
    // Initial timer setup
    resetTimers();
    
    return () => {
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    };
  }, [resetTimers, showLockWarning]);
  
  // Reset timers on route change
  useEffect(() => {
    resetTimers();
  }, [location.pathname, resetTimers]);
  
  const handleStayLoggedIn = () => {
    if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    resetTimers();
  };
  
  const handleLockNow = () => {
    if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    localStorage.removeItem('waiter');
    navigate('/');
    setShowLockWarning(false);
  };
  
  return (
    <>
      {children}
      
      {/* Lock Warning Modal */}
      {showLockWarning && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            background: '#1C1C1E',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '340px',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {/* Warning Icon */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(255,159,10,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <span style={{ fontSize: '32px' }}>🔒</span>
            </div>
            
            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 600, margin: '0 0 8px' }}>
              Ekran Kilitlenecek
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '0 0 24px' }}>
              Güvenlik için ekran {countdown} saniye içinde kilitlenecek
            </p>
            
            {/* Countdown */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(255,159,10,0.1)',
              border: '3px solid #FF9F0A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <span style={{ color: '#FF9F0A', fontSize: '32px', fontWeight: 700 }}>
                {countdown}
              </span>
            </div>
            
            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleLockNow}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Şimdi Kilitle
              </button>
              <button
                onClick={handleStayLoggedIn}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  background: '#30D158',
                  border: 'none',
                  color: '#000',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Devam Et
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AppRoutes() {
  return (
    <AutoLockWrapper>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/tables" element={<TableList />} />
        <Route path="/order/:tableId" element={<OrderScreen />} />
      </Routes>
      <OfflineIndicator />
    </AutoLockWrapper>
  );
}

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
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
