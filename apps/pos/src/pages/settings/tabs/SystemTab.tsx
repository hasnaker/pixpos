import { AlertTriangle, Database, RefreshCw } from 'lucide-react';
import { cardStyle } from '../styles';

interface SystemTabProps {
  onCloseAll: () => void;
}

export default function SystemTab({ onCloseAll }: SystemTabProps) {
  const systemInfo = [
    { label: 'Versiyon', value: 'PIXPOS v1.0.0' },
    { label: 'API', value: 'localhost:3001' },
    { label: 'Veritabanı', value: 'PostgreSQL 15' },
    { label: 'Lisans', value: 'Aktif - 365 gün kaldı' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Close All Orders */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '12px', 
            background: 'rgba(255,69,58,0.15)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <AlertTriangle size={24} style={{ color: '#FF453A' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#fff' }}>Tüm Hesapları Kapat</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
              Açık tüm siparişleri iptal et ve masaları boşalt
            </p>
          </div>
          <button onClick={onCloseAll} style={{
            padding: '12px 24px', borderRadius: '12px', background: 'rgba(255,69,58,0.15)',
            border: '1px solid rgba(255,69,58,0.3)', color: '#FF453A',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}>
            Tümünü Kapat
          </button>
        </div>
      </div>

      {/* Backup */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '12px', 
            background: 'rgba(48,209,88,0.15)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <Database size={24} style={{ color: '#30D158' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#fff' }}>Yedekleme</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Son yedek: Bugün 14:30</p>
          </div>
          <button style={{
            padding: '12px 24px', borderRadius: '12px', background: 'rgba(48,209,88,0.15)',
            border: '1px solid rgba(48,209,88,0.3)', color: '#30D158',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer', 
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <RefreshCw size={16} />
            Yedekle
          </button>
        </div>
      </div>

      {/* System Info */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>Sistem Bilgisi</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {systemInfo.map((item) => (
            <div key={item.label} style={{ 
              display: 'flex', justifyContent: 'space-between', 
              padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' 
            }}>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>{item.label}</span>
              <span style={{ fontSize: '14px', color: '#fff' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
