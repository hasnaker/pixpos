import { useState, useEffect } from 'react';
import { Wifi, WifiOff, CreditCard, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function OkcTab() {
  const [config, setConfig] = useState<OkcConfig>({
    ip: '192.168.1.100',
    port: 20001,
    timeout: 60000,
    terminalId: '',
  });
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false });
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load config on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/api/okc/config`);
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
      const res = await fetch(`${API_URL}/api/okc/config`, {
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

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API_URL}/api/okc/test`, { method: 'POST' });
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
    } catch (e) {
      setStatus({ connected: false, error: 'API hatası', lastChecked: new Date() });
      setTestResult({ success: false, message: 'API bağlantı hatası' });
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
