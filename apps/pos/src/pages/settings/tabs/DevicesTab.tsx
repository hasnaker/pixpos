import { ChefHat, Tablet, QrCode } from 'lucide-react';
import { cardStyle, toggleStyle, toggleKnobStyle } from '../styles';
import type { DeviceSettings } from '../types';

interface DevicesTabProps {
  devices: DeviceSettings;
  setDevices: React.Dispatch<React.SetStateAction<DeviceSettings>>;
}

export default function DevicesTab({ devices, setDevices }: DevicesTabProps) {
  const deviceList = [
    {
      key: 'kitchen' as const,
      icon: ChefHat,
      color: '#FF9F0A',
      bg: 'rgba(255,159,10,0.15)',
      title: 'Mutfak Ekranı (KDS)',
      description: 'Siparişleri mutfakta görüntüle',
    },
    {
      key: 'waiter' as const,
      icon: Tablet,
      color: '#BF5AF2',
      bg: 'rgba(191,90,242,0.15)',
      title: 'Garson Tableti',
      description: 'Masada sipariş alma',
    },
    {
      key: 'qrMenu' as const,
      icon: QrCode,
      color: '#30D158',
      bg: 'rgba(48,209,88,0.15)',
      title: 'QR Menü',
      description: 'Müşteriler menüyü telefondan görsün',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {deviceList.map((device) => {
        const Icon = device.icon;
        const isActive = devices[device.key];

        return (
          <div key={device.key} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '12px', 
                background: device.bg, 
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <Icon size={24} style={{ color: device.color }} />
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>{device.title}</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{device.description}</p>
              </div>
            </div>
            <button 
              onClick={() => setDevices(prev => ({ ...prev, [device.key]: !prev[device.key] }))} 
              style={toggleStyle(isActive)}
            >
              <div style={toggleKnobStyle(isActive)} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
