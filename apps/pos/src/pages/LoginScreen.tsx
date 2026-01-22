import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  authApi, 
  detectStoreFromUrl, 
  setAuthToken, 
  setStoreId, 
  isAuthenticated,
  type Store 
} from '../services/api';

export default function LoginScreen() {
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // If already authenticated, redirect to home
    if (isAuthenticated()) {
      navigate('/');
      return;
    }

    // Detect store from URL
    detectStoreFromUrl().then((detectedStore) => {
      if (detectedStore) {
        setStore(detectedStore);
        setStoreId(detectedStore.id);
      }
      setIsLoading(false);
    });
  }, [navigate]);

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleLogin = async () => {
    if (!store) {
      setError('Store bulunamadı');
      return;
    }

    if (pin.length !== 4) {
      setError('4 haneli PIN girin');
      return;
    }

    setIsLoggingIn(true);
    setError('');

    try {
      const response = await authApi.loginWithPin(pin, store.id);
      setAuthToken(response.accessToken);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş başarısız');
      setPin('');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (pin.length === 4 && store) {
      handleLogin();
    }
  }, [pin]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white/60">Yükleniyor...</div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#FF453A]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#FF453A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">Store Bulunamadı</h1>
          <p className="text-white/40 mb-6">
            Bu URL için kayıtlı bir işletme bulunamadı.
          </p>
          <p className="text-white/30 text-sm">
            Doğru URL: <span className="text-[#0A84FF]">isletme.pixpos.cloud</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Store Info */}
        <div className="text-center mb-8">
          {store.logoUrl ? (
            <img src={store.logoUrl} alt={store.name} className="w-20 h-20 rounded-2xl mx-auto mb-4 object-cover" />
          ) : (
            <div className="w-20 h-20 bg-[#0A84FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-white">{store.name.charAt(0)}</span>
            </div>
          )}
          <h1 className="text-2xl font-semibold text-white">{store.name}</h1>
          <p className="text-white/40 mt-1">PIN ile giriş yapın</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all ${
                pin.length > i
                  ? 'bg-[#0A84FF] border-[#0A84FF]'
                  : 'bg-white/6 border-white/10'
              }`}
            >
              {pin.length > i && (
                <div className="w-3 h-3 bg-white rounded-full" />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-[#FF453A]/10 border border-[#FF453A]/20 rounded-xl text-[#FF453A] text-sm text-center">
            {error}
          </div>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              onClick={() => handlePinInput(digit.toString())}
              disabled={isLoggingIn}
              className="h-16 bg-white/6 hover:bg-white/10 border border-white/8 rounded-xl text-2xl font-medium text-white transition-colors disabled:opacity-50"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            disabled={isLoggingIn}
            className="h-16 bg-white/6 hover:bg-white/10 border border-white/8 rounded-xl text-white/60 transition-colors disabled:opacity-50"
          >
            C
          </button>
          <button
            onClick={() => handlePinInput('0')}
            disabled={isLoggingIn}
            className="h-16 bg-white/6 hover:bg-white/10 border border-white/8 rounded-xl text-2xl font-medium text-white transition-colors disabled:opacity-50"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            disabled={isLoggingIn}
            className="h-16 bg-white/6 hover:bg-white/10 border border-white/8 rounded-xl text-white/60 transition-colors disabled:opacity-50"
          >
            ←
          </button>
        </div>

        {/* Loading indicator */}
        {isLoggingIn && (
          <div className="mt-6 text-center text-white/40">
            Giriş yapılıyor...
          </div>
        )}
      </div>
    </div>
  );
}
