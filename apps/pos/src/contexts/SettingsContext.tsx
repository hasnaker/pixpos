import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AutoLockTimeout } from '@/hooks';

interface Settings {
  autoLockTimeout: AutoLockTimeout;
  autoLockEnabled: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateAutoLockTimeout: (timeout: AutoLockTimeout) => void;
  toggleAutoLock: (enabled: boolean) => void;
}

const STORAGE_KEY = 'pixpos_settings';

const defaultSettings: Settings = {
  autoLockTimeout: 10, // Default 10 minutes
  autoLockEnabled: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    // Load from localStorage on init
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return defaultSettings;
  });

  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  const updateAutoLockTimeout = useCallback((timeout: AutoLockTimeout) => {
    setSettings(prev => ({
      ...prev,
      autoLockTimeout: timeout,
      autoLockEnabled: timeout > 0,
    }));
  }, []);

  const toggleAutoLock = useCallback((enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      autoLockEnabled: enabled,
      // If disabling, set timeout to 0
      autoLockTimeout: enabled ? (prev.autoLockTimeout || 10) : 0,
    }));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateAutoLockTimeout, toggleAutoLock }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
