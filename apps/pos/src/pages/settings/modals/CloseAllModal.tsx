import { AlertTriangle, Check } from 'lucide-react';
import { modalOverlayStyle, modalContentStyle, primaryButtonStyle, secondaryButtonStyle } from '../styles';

interface CloseAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  result: { closedCount: number; message: string } | null;
}

export default function CloseAllModal({ isOpen, onClose, onConfirm, isPending, result }: CloseAllModalProps) {
  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={{ ...modalContentStyle, textAlign: 'center' }}>
        {result ? (
          <>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '50%', 
              background: 'rgba(48,209,88,0.15)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 20px' 
            }}>
              <Check size={32} style={{ color: '#30D158' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Tamamlandı</h3>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
              {result.closedCount} sipariş kapatıldı
            </p>
            <button onClick={onClose} style={{ ...primaryButtonStyle, width: '100%', background: '#0A84FF' }}>
              Tamam
            </button>
          </>
        ) : (
          <>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '50%', 
              background: 'rgba(255,69,58,0.15)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 20px' 
            }}>
              <AlertTriangle size={32} style={{ color: '#FF453A' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Emin misiniz?</h3>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
              Tüm açık siparişler iptal edilecek ve masalar boşaltılacak.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={onClose} style={{ ...secondaryButtonStyle, flex: 1 }}>İptal</button>
              <button 
                onClick={onConfirm} 
                disabled={isPending} 
                style={{ 
                  ...primaryButtonStyle, 
                  flex: 1, 
                  background: '#FF453A',
                  opacity: isPending ? 0.7 : 1 
                }}
              >
                {isPending ? 'Kapatılıyor...' : 'Evet, Kapat'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
