import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, AlertTriangle, Search } from 'lucide-react';

interface OkcConfig {
  ip: string;
  port: number;
  timeout: number;
  terminalId?: string;
}

interface ConnectionStatus {
  connected: boolean;
  responseTime?: number;
  error?: string;
  lastChecked?: Date;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

// Production API URL for Electron
const getApiUrl = () => {
  if (isElectron) {
    return 'https://api.pixpos.cloud/api';
  }
  return API_URL;
};

export function OkcTab() {
  const [config, setConfig] = useState<OkcConfig>({
    ip: '192.168.1.116', // Queen Waffle Ingenico IP
    port: 20001,
    timeout: 60000,
    terminalId: '',
  });
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false });
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [openPorts, setOpenPorts] = useState<number[]>([]);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load config on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/okc/config`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (e) {
      console.error('Failed to fetch OKC config:', e);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${getApiUrl()}/okc/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setTestResult({ success: true, message: 'Ayarlar kaydedildi' });
        setTimeout(() => setTestResult(null), 3000);
      }
    } catch (e) {
      setTestResult({ success: false, message: 'Kaydetme hatası' });
    } finally {
      setSaving(false);
    }
  };

  // Scan ports on the device (Electron only)
  const scanPorts = async () => {
    if (!isElectron || !window.electronAPI) {
      setTestResult({ success: false, message: 'Port tarama sadece EXE uygulamasında çalışır' });
      return;
    }

    setScanning(true);
    setOpenPorts([]);
    setTestResult(null);

    try {
      const ports = await window.electronAPI.okcScanPorts(config.ip);
      setOpenPorts(ports);
      
      if (ports.length > 0) {
        setTestResult({ 
          success: true, 
          message: `Açık portlar: ${ports.join(', ')}` 
        });
        // Auto-select first open port
        if (!ports.includes(config.port) && ports.length > 0) {
          setConfig(prev => ({ ...prev, port: ports[0] }));
        }
      } else {
        setTestResult({ 
          success: false, 
          message: `${config.ip} adresinde açık port bulunamadı. Cihaz kapalı veya ağda olmayabilir.` 
        });
      }
    } catch (e) {
      setTestResult({ success: false, message: 'Port tarama hatası' });
    } finally {
      setScanning(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Use Electron IPC for local TCP connection (preferred)
      if (isElectron && window.electronAPI) {
        const result = await window.electronAPI.okcTestConnection(config.ip, config.port);
        setStatus({
          connected: result.success,
          responseTime: result.responseTime,
          error: result.error,
          lastChecked: new Date(),
        });
        setTestResult({
          success: result.success,
          message: result.success 
            ? `Bağlantı başarılı (${result.responseTime}ms)` 
            : `Bağlantı hatası: ${result.error}`,
        });
      } else {
        // Fallback to cloud API (won't work for local network)
        const res = await fetch(`${getApiUrl()}/okc/test`, { method: 'POST' });
        const data = await res.json();
        setStatus({
          connected: data.success,
          responseTime: data.responseTime,
          error: data.error,
          lastChecked: new Date(),
        });
        setTestResult({
          success: data.success,
          message: data.success 
            ? `Bağlantı başarılı (${data.responseTime}ms)` 
            : `Bağlantı hatası: ${data.error}`,
        });
      }
    } catch (e) {
      setStatus({ connected: false, error: 'Bağlantı hatası', lastChecked: new Date() });
      setTestResult({ success: false, message: 'Bağlantı testi başarısız' });
    } finally {
      setTesting(false);
    }
  };

  const cardStyle = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '8px',
    fontWeight: 500 as const,
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Electron Warning */}
      {!isElectron && (
        <div style={{
          ...cardStyle,
          background: 'rgba(255, 69, 58, 0.08)',
          border: '1px solid rgba(255, 69, 58, 0.2)',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <AlertTriangle size={20} style={{ color: '#FF453A', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#FF453A', margin: '0 0 8px' }}>
                Web Tarayıcı Modu
              </h4>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                ÖKC bağlantı testi sadece EXE uygulamasında çalışır. Web tarayıcısından yerel ağdaki cihazlara erişilemez.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Card */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {status.connected ? (
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'rgba(48, 209, 88, 0.15)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Wifi size={24} style={{ color: '#30D158' }} />
              </div>
            ) : (
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'rgba(255, 69, 58, 0.15)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <WifiOff size={24} style={{ color: '#FF453A' }} />
              </div>
            )}
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#fff', margin: 0 }}>
                ÖKC Durumu
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>
                {status.connected ? 'Bağlı' : 'Bağlı değil'}
                {status.responseTime && ` • ${status.responseTime}ms`}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isElectron && (
              <button
                onClick={scanPorts}
                disabled={scanning}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 16px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.08)', border: 'none',
                  color: '#fff', fontSize: '14px', fontWeight: 500,
                  cursor: scanning ? 'not-allowed' : 'pointer',
                  opacity: scanning ? 0.7 : 1,
                }}
              >
                <Search size={16} style={{ animation: scanning ? 'spin 1s linear infinite' : 'none' }} />
                {scanning ? 'Taranıyor...' : 'Port Tara'}
              </button>
            )}
            <button
              onClick={testConnection}
              disabled={testing}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '10px',
                background: '#0A84FF', border: 'none',
                color: '#fff', fontSize: '14px', fontWeight: 500,
                cursor: testing ? 'not-allowed' : 'pointer',
                opacity: testing ? 0.7 : 1,
              }}
            >
              <RefreshCw size={16} style={{ animation: testing ? 'spin 1s linear infinite' : 'none' }} />
              {testing ? 'Test ediliyor...' : 'Bağlantı Testi'}
            </button>
          </div>
        </div>

        {/* Open Ports */}
        {openPorts.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', borderRadius: '10px',
            background: 'rgba(10, 132, 255, 0.1)',
            border: '1px solid rgba(10, 132, 255, 0.3)',
            marginBottom: '12px',
          }}>
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
              Açık Portlar:
            </span>
            {openPorts.map(port => (
              <button
                key={port}
                onClick={() => setConfig(prev => ({ ...prev, port }))}
                style={{
                  padding: '4px 12px', borderRadius: '6px',
                  background: config.port === port ? '#0A84FF' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff', fontSize: '13px', fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {port}
              </button>
            ))}
          </div>
        )}

        {/* Test Result */}
        {testResult && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', borderRadius: '10px',
            background: testResult.success ? 'rgba(48, 209, 88, 0.1)' : 'rgba(255, 69, 58, 0.1)',
            border: `1px solid ${testResult.success ? 'rgba(48, 209, 88, 0.3)' : 'rgba(255, 69, 58, 0.3)'}`,
          }}>
            {testResult.success ? (
              <CheckCircle size={18} style={{ color: '#30D158' }} />
            ) : (
              <XCircle size={18} style={{ color: '#FF453A' }} />
            )}
            <span style={{ fontSize: '14px', color: testResult.success ? '#30D158' : '#FF453A' }}>
              {testResult.message}
            </span>
          </div>
        )}
      </div>

      {/* Configuration Card */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>
          Bağlantı Ayarları
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>IP Adresi</label>
            <input
              type="text"
              value={config.ip}
              onChange={(e) => setConfig({ ...config, ip: e.target.value })}
              placeholder="192.168.1.100"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Port</label>
            <input
              type="number"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 20001 })}
              placeholder="20001"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={labelStyle}>Terminal ID (Opsiyonel)</label>
            <input
              type="text"
              value={config.terminalId || ''}
              onChange={(e) => setConfig({ ...config, terminalId: e.target.value })}
              placeholder="00000001"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Zaman Aşımı (ms)</label>
            <input
              type="number"
              value={config.timeout}
              onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) || 60000 })}
              placeholder="60000"
              style={inputStyle}
            />
          </div>
        </div>

        <button
          onClick={saveConfig}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            width: '100%', padding: '14px', borderRadius: '12px',
            background: '#30D158', border: 'none',
            color: '#fff', fontSize: '15px', fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
        </button>
      </div>

      {/* Info Card */}
      <div style={{
        ...cardStyle,
        background: 'rgba(255, 159, 10, 0.08)',
        border: '1px solid rgba(255, 159, 10, 0.2)',
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <AlertTriangle size={20} style={{ color: '#FF9F0A', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#FF9F0A', margin: '0 0 8px' }}>
              Ingenico ÖKC Kurulum Rehberi
            </h4>
            <ul style={{ 
              fontSize: '13px', color: 'rgba(255,255,255,0.7)', 
              margin: 0, paddingLeft: '16px', lineHeight: '1.8',
            }}>
              <li>ÖKC cihazını aynı ağa bağlayın (Ethernet veya WiFi)</li>
              <li>Cihaz ayarlarından TCP/IP modunu aktif edin</li>
              <li>Port genellikle 20001 veya 9001'dir</li>
              <li>IP adresini cihaz menüsünden öğrenebilirsiniz</li>
              <li>Bağlantı testi yaparak doğrulayın</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Supported Devices */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
          Desteklenen Cihazlar
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {['Ingenico Move 5000', 'Ingenico Desk 5000', 'Ingenico iWL250', 'Ingenico iCT250'].map((device) => (
            <span key={device} style={{
              padding: '8px 14px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '13px', color: 'rgba(255,255,255,0.8)',
            }}>
              {device}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
