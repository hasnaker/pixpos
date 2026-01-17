import { Lock } from 'lucide-react';
import { cardStyle } from '../styles';
import { TIMEOUT_OPTIONS } from '../types';
import type { AutoLockTimeout } from '@/hooks';

interface SecurityTabProps {
  autoLockTimeout: AutoLockTimeout;
  onUpdateTimeout: (timeout: AutoLockTimeout) => void;
}

export default function SecurityTab({ autoLockTimeout, onUpdateTimeout }: SecurityTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '12px', 
            background: 'rgba(94,92,230,0.15)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <Lock size={24} style={{ color: '#5E5CE6' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#fff' }}>Otomatik Kilit</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
              Belirli süre işlem yapılmazsa ekranı kilitle
            </p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {TIMEOUT_OPTIONS.map((option) => (
            <button 
              key={option.value} 
              onClick={() => onUpdateTimeout(option.value)} 
              style={{
                padding: '14px', borderRadius: '12px',
                background: autoLockTimeout === option.value ? 'rgba(94,92,230,0.15)' : 'rgba(255,255,255,0.05)',
                border: autoLockTimeout === option.value ? '1px solid #5E5CE6' : '1px solid rgba(255,255,255,0.08)',
                color: autoLockTimeout === option.value ? '#5E5CE6' : '#fff',
                fontSize: '14px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
