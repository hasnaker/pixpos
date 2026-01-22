import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export default function SplashScreen({ onComplete, duration = 2500 }: SplashScreenProps) {
  const [phase, setPhase] = useState<'logo' | 'slogan' | 'fade' | 'done'>('logo');

  useEffect(() => {
    // Phase 1: Logo appears (0-800ms)
    const sloganTimer = setTimeout(() => setPhase('slogan'), 800);
    // Phase 2: Slogan appears (800-2000ms)
    const fadeTimer = setTimeout(() => setPhase('fade'), 2000);
    // Phase 3: Fade out complete, call onComplete
    const completeTimer = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, duration);

    return () => {
      clearTimeout(sloganTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, duration]);

  // Don't render anything after done
  if (phase === 'done') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      opacity: phase === 'fade' ? 0 : 1,
      transition: 'opacity 0.5s ease-out',
      pointerEvents: phase === 'fade' ? 'none' : 'auto',
      overflow: 'hidden',
    }}>
      {/* Animated Gradient Background */}
      <div style={{
        position: 'absolute',
        inset: '-50%',
        background: 'linear-gradient(45deg, #0A0A0A, #1a1a2e, #16213e, #0f3460, #1a1a2e, #0A0A0A)',
        backgroundSize: '400% 400%',
        animation: 'gradientMove 8s ease infinite',
      }} />
      
      {/* Overlay for depth */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
      }} />

      {/* Logo Container */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
      }}>
        {/* Animated Logo - Beyaz logo (siyah arkaplan için) */}
        <div style={{
          opacity: phase === 'logo' || phase === 'slogan' || phase === 'fade' ? 1 : 0,
          transform: phase === 'logo' || phase === 'slogan' || phase === 'fade' ? 'scale(1)' : 'scale(0.8)',
          transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          <img 
            src="/pixpos-logo.png"
            alt="" 
            style={{ 
              height: '120px',
              objectFit: 'contain',
            }} 
          />
        </div>

        {/* Slogan - "Bir işletme sistemi" PNG */}
        <div style={{
          opacity: phase === 'slogan' || phase === 'fade' ? 1 : 0,
          transform: phase === 'slogan' || phase === 'fade' ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s ease-out',
        }}>
          <img 
            src="/pixpos-slogan.png"
            alt="" 
            style={{ 
              height: '32px',
              objectFit: 'contain',
              opacity: 0.8,
            }} 
          />
        </div>
      </div>

      {/* Loading indicator */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        opacity: phase === 'slogan' ? 1 : 0,
        transition: 'opacity 0.3s ease',
        zIndex: 1,
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '2px solid rgba(255,255,255,0.1)',
          borderTopColor: 'rgba(255,255,255,0.6)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>

      {/* Version */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        color: 'rgba(255,255,255,0.3)',
        fontSize: '12px',
        zIndex: 1,
      }}>
        v1.0
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
