import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type AutoLockTimeout = 5 | 10 | 15 | 30 | 0; // 0 = disabled

interface UseAutoLockOptions {
  timeout: AutoLockTimeout; // minutes
  enabled?: boolean;
  onLock?: () => void;
  onLockWarning?: (secondsRemaining: number) => void;
}

interface UseAutoLockReturn {
  remainingTime: number; // seconds
  resetTimer: () => void;
  isEnabled: boolean;
  isLocking: boolean; // true during lock transition
}

const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'touchstart',
  'scroll',
  'wheel',
] as const;

export function useAutoLock({
  timeout,
  enabled = true,
  onLock,
  onLockWarning,
}: UseAutoLockOptions): UseAutoLockReturn {
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const [remainingTime, setRemainingTime] = useState<number>(timeout * 60);
  const [isLocking, setIsLocking] = useState(false);

  const isEnabled = enabled && timeout > 0;
  const timeoutMs = timeout * 60 * 1000;

  const handleLock = useCallback(() => {
    // Start lock transition animation
    setIsLocking(true);
    
    // Call onLock callback
    if (onLock) {
      onLock();
    }
    
    // Navigate after a short delay for smooth transition
    setTimeout(() => {
      navigate('/', { replace: true });
      setIsLocking(false);
    }, 300);
  }, [navigate, onLock]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setRemainingTime(timeout * 60);
  }, [timeout]);

  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Set up activity listeners
  useEffect(() => {
    if (!isEnabled) return;

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isEnabled, handleActivity]);

  // Check for timeout every second
  useEffect(() => {
    if (!isEnabled) {
      setRemainingTime(0);
      return;
    }

    const checkTimeout = () => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = Math.max(0, timeoutMs - elapsed);
      const remainingSeconds = Math.ceil(remaining / 1000);
      
      setRemainingTime(remainingSeconds);

      // Call warning callback when under 60 seconds
      if (remainingSeconds > 0 && remainingSeconds <= 60 && onLockWarning) {
        onLockWarning(remainingSeconds);
      }

      if (remaining <= 0) {
        handleLock();
      }
    };

    // Initial check
    checkTimeout();

    // Set up interval
    timerRef.current = setInterval(checkTimeout, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isEnabled, timeoutMs, handleLock, onLockWarning]);

  // Reset timer when timeout changes
  useEffect(() => {
    if (isEnabled) {
      resetTimer();
    }
  }, [timeout, isEnabled, resetTimer]);

  return {
    remainingTime,
    resetTimer,
    isEnabled,
    isLocking,
  };
}

// Helper to format remaining time
export function formatRemainingTime(seconds: number): string {
  if (seconds <= 0) return '';
  
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}dk ${secs}s`;
  }
  return `${secs}s`;
}
