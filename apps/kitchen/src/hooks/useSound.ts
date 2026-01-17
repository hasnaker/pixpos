import { useCallback, useRef, useState, useEffect } from 'react';

const STORAGE_KEY_ENABLED = 'kitchen-sound-enabled';
const STORAGE_KEY_VOLUME = 'kitchen-sound-volume';

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Load initial state from localStorage
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY_ENABLED);
    return stored !== null ? stored === 'true' : true;
  });
  
  const [volume, setVolume] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY_VOLUME);
    return stored !== null ? Number(stored) : 70;
  });

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ENABLED, String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VOLUME, String(volume));
  }, [volume]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    
    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    return ctx;
  }, []);

  const playNewOrderSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      const ctx = getAudioContext();
      const volumeMultiplier = volume / 100;

      // Create oscillator for first beep
      const oscillator1 = ctx.createOscillator();
      const gainNode1 = ctx.createGain();

      oscillator1.connect(gainNode1);
      gainNode1.connect(ctx.destination);

      // Configure sound - pleasant notification tone (A5 note)
      oscillator1.frequency.value = 880;
      oscillator1.type = 'sine';

      // Envelope for smooth sound
      const now = ctx.currentTime;
      gainNode1.gain.setValueAtTime(0, now);
      gainNode1.gain.linearRampToValueAtTime(0.3 * volumeMultiplier, now + 0.05);
      gainNode1.gain.linearRampToValueAtTime(0, now + 0.3);

      // Play first beep
      oscillator1.start(now);
      oscillator1.stop(now + 0.3);

      // Play second beep after short delay (C6 note - higher)
      setTimeout(() => {
        const oscillator2 = ctx.createOscillator();
        const gainNode2 = ctx.createGain();
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(ctx.destination);
        
        oscillator2.frequency.value = 1046.5;
        oscillator2.type = 'sine';
        
        const now2 = ctx.currentTime;
        gainNode2.gain.setValueAtTime(0, now2);
        gainNode2.gain.linearRampToValueAtTime(0.3 * volumeMultiplier, now2 + 0.05);
        gainNode2.gain.linearRampToValueAtTime(0, now2 + 0.4);
        
        oscillator2.start(now2);
        oscillator2.stop(now2 + 0.4);
      }, 200);

      // Play third beep for emphasis (E6 note - even higher)
      setTimeout(() => {
        const oscillator3 = ctx.createOscillator();
        const gainNode3 = ctx.createGain();
        
        oscillator3.connect(gainNode3);
        gainNode3.connect(ctx.destination);
        
        oscillator3.frequency.value = 1318.5;
        oscillator3.type = 'sine';
        
        const now3 = ctx.currentTime;
        gainNode3.gain.setValueAtTime(0, now3);
        gainNode3.gain.linearRampToValueAtTime(0.25 * volumeMultiplier, now3 + 0.05);
        gainNode3.gain.linearRampToValueAtTime(0, now3 + 0.5);
        
        oscillator3.start(now3);
        oscillator3.stop(now3 + 0.5);
      }, 400);

    } catch (error) {
      console.warn('Could not play sound:', error);
    }
  }, [soundEnabled, volume, getAudioContext]);

  const playReadySound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      const ctx = getAudioContext();
      const volumeMultiplier = volume / 100;

      // Success sound - two quick ascending notes
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 523.25; // C5
      oscillator.type = 'sine';

      const now = ctx.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.2 * volumeMultiplier, now + 0.03);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.15);

      oscillator.start(now);
      oscillator.stop(now + 0.15);

      // Second note
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc2.frequency.value = 659.25; // E5
        osc2.type = 'sine';
        
        const now2 = ctx.currentTime;
        gain2.gain.setValueAtTime(0, now2);
        gain2.gain.linearRampToValueAtTime(0.2 * volumeMultiplier, now2 + 0.03);
        gain2.gain.linearRampToValueAtTime(0, now2 + 0.2);
        
        osc2.start(now2);
        osc2.stop(now2 + 0.2);
      }, 100);

    } catch (error) {
      console.warn('Could not play sound:', error);
    }
  }, [soundEnabled, volume, getAudioContext]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  const updateVolume = useCallback((newVolume: number) => {
    setVolume(Math.max(0, Math.min(100, newVolume)));
  }, []);

  // Test sound function
  const testSound = useCallback(() => {
    playNewOrderSound();
  }, [playNewOrderSound]);

  return { 
    playNewOrderSound, 
    playReadySound,
    soundEnabled,
    toggleSound,
    volume,
    updateVolume,
    testSound,
  };
}
