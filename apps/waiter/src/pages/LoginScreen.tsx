import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface Waiter {
  id: string;
  name: string;
  initials: string;
  pin: string;
}

const MOCK_WAITERS: Waiter[] = [
  { id: '1', name: 'Mehmet Kaya', initials: 'MK', pin: '1234' },
  { id: '2', name: 'Elif Yılmaz', initials: 'EY', pin: '5678' },
  { id: '3', name: 'Ali Şahin', initials: 'AS', pin: '0000' },
];

export default function LoginScreen() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedWaiter, setSelectedWaiter] = useState<Waiter | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date: Date) => date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });

  const handlePinInput = useCallback((digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setPinError(false);

    if (newPin.length === 4 && selectedWaiter) {
      setTimeout(() => {
        if (newPin === selectedWaiter.pin) {
          localStorage.setItem('waiter', JSON.stringify({
            id: selectedWaiter.id,
            name: selectedWaiter.name,
            initials: selectedWaiter.initials,
          }));
          navigate('/tables');
        } else {
          setPinError(true);
          setPin('');
          setTimeout(() => setPinError(false), 600);
        }
      }, 150);
    }
  }, [pin, selectedWaiter, navigate]);

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setPinError(false);
  };

  const handleBack = () => {
    setSelectedWaiter(null);
    setPin('');
    setPinError(false);
  };

  // PIN Screen - Apple Style
  if (selectedWaiter) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '340px',
        }}>
          {/* Avatar */}
          <div style={{
            width: '96px',
            height: '96px',
            background: 'linear-gradient(135deg, #5E5CE6, #BF5AF2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 0 40px rgba(94, 92, 230, 0.3)',
          }}>
            <span style={{ color: '#fff', fontSize: '32px', fontWeight: 600 }}>
              {selectedWaiter.initials}
            </span>
          </div>

          <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 600, margin: '0 0 4px' }}>
            {selectedWaiter.name}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', margin: '0 0 40px' }}>
            PIN kodunuzu girin
          </p>

          {/* PIN Dots */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '12px',
            animation: pinError ? 'shake 0.4s ease-out' : 'none',
          }}>
            {[0, 1, 2, 3].map(i => (
              <div 
                key={i} 
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: i < pin.length 
                    ? (pinError ? '#FF453A' : '#fff') 
                    : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.15s ease',
                  boxShadow: i < pin.length && !pinError ? '0 0 10px rgba(255,255,255,0.3)' : 'none',
                }} 
              />
            ))}
          </div>
          
          {pinError && (
            <p style={{ color: '#FF453A', fontSize: '14px', margin: '8px 0 16px' }}>
              PIN kodu yanlış
            </p>
          )}

          {/* Numpad - Apple Style */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginTop: '32px',
            marginBottom: '32px',
          }}>
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key, i) => (
              key === '' ? <div key={i} /> :
              <button
                key={i}
                onClick={() => key === '⌫' ? handleBackspace() : handlePinInput(key)}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: key === '⌫' ? 'transparent' : 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: '#fff',
                  fontSize: key === '⌫' ? '24px' : '32px',
                  fontWeight: 300,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {key}
              </button>
            ))}
          </div>

          <button 
            onClick={handleBack}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#0A84FF',
              fontSize: '15px',
              cursor: 'pointer',
              padding: '12px 24px',
            }}
          >
            Kullanıcı Değiştir
          </button>
        </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
        `}</style>
      </div>
    );
  }

  // Main Login Screen - Apple Style
  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '400px',
      }}>
        {/* Time Display - Apple Lock Screen Style */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ 
            color: 'rgba(255,255,255,0.6)', 
            fontSize: '20px', 
            fontWeight: 400,
            margin: '0 0 8px',
            textTransform: 'capitalize',
          }}>
            {formatDate(currentTime)}
          </p>
          <p style={{ 
            color: '#fff', 
            fontSize: '80px', 
            fontWeight: 200,
            margin: 0,
            letterSpacing: '-4px',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {formatTime(currentTime)}
          </p>
        </div>

        {/* Logo */}
        <div style={{
          width: '72px',
          height: '72px',
          background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)',
          borderRadius: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          boxShadow: '0 0 40px rgba(10, 132, 255, 0.3)',
        }}>
          <span style={{ color: '#fff', fontSize: '28px', fontWeight: 700 }}>P</span>
        </div>
        
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 600, margin: '0 0 4px' }}>
          PIXPOS
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', margin: '0 0 48px' }}>
          Garson Paneli
        </p>

        {/* User Selection */}
        <p style={{ 
          color: 'rgba(255,255,255,0.35)', 
          fontSize: '11px', 
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          margin: '0 0 20px',
          fontWeight: 500,
        }}>
          Giriş yapmak için seçin
        </p>
        
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          {MOCK_WAITERS.map((waiter) => (
            <button
              key={waiter.id}
              onClick={() => setSelectedWaiter(waiter)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                padding: '20px 24px',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: '100px',
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #5E5CE6, #BF5AF2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>
                  {waiter.initials}
                </span>
              </div>
              <div>
                <p style={{ color: '#fff', fontSize: '14px', fontWeight: 500, margin: 0 }}>
                  {waiter.name.split(' ')[0]}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '4px 0 0' }}>
                  Garson
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
