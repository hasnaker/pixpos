import { cardStyle, inputStyle, labelStyle, toggleStyle, toggleKnobStyle } from '../styles';
import type { BusinessSettings, ReceiptSettings } from '../types';

interface ReceiptTabProps {
  receipt: ReceiptSettings;
  setReceipt: React.Dispatch<React.SetStateAction<ReceiptSettings>>;
  business: BusinessSettings;
}

export default function ReceiptTab({ receipt, setReceipt, business }: ReceiptTabProps) {
  const toggleItems = [
    { key: 'showLogo' as const, label: 'Logo Göster' },
    { key: 'showAddress' as const, label: 'Adres Göster' },
    { key: 'showPhone' as const, label: 'Telefon Göster' },
    { key: 'showTaxNumber' as const, label: 'Vergi No Göster' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
      {/* Settings Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Content Toggles */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>Fiş İçeriği</h3>
          {toggleItems.map((item) => (
            <div key={item.key} style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' 
            }}>
              <span style={{ fontSize: '15px', color: '#fff' }}>{item.label}</span>
              <button 
                onClick={() => setReceipt(prev => ({ ...prev, [item.key]: !prev[item.key] }))} 
                style={toggleStyle(receipt[item.key])}
              >
                <div style={toggleKnobStyle(receipt[item.key])} />
              </button>
            </div>
          ))}
        </div>

        {/* Paper Size */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>Kağıt Boyutu</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            {(['58mm', '80mm'] as const).map((size) => (
              <button 
                key={size} 
                onClick={() => setReceipt(prev => ({ ...prev, paperWidth: size }))} 
                style={{
                  flex: 1, padding: '16px', borderRadius: '12px',
                  background: receipt.paperWidth === size ? 'rgba(10,132,255,0.15)' : 'rgba(255,255,255,0.05)',
                  border: receipt.paperWidth === size ? '1px solid #0A84FF' : '1px solid rgba(255,255,255,0.08)',
                  color: receipt.paperWidth === size ? '#0A84FF' : '#fff',
                  fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Text */}
        <div style={cardStyle}>
          <label style={labelStyle}>Alt Bilgi Metni</label>
          <textarea 
            value={receipt.footerText} 
            onChange={(e) => setReceipt(prev => ({ ...prev, footerText: e.target.value }))} 
            rows={2} 
            style={{ ...inputStyle, resize: 'none' }} 
          />
        </div>
      </div>

      {/* Preview Column */}
      <div style={{ 
        ...cardStyle, 
        background: '#fff', 
        color: '#000', 
        fontFamily: 'monospace', 
        fontSize: '12px', 
        padding: '20px' 
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          {receipt.showLogo && (
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{business.name}</div>
          )}
          {receipt.showAddress && (
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>{business.address}</div>
          )}
          {receipt.showPhone && (
            <div style={{ fontSize: '11px', color: '#666' }}>Tel: {business.phone}</div>
          )}
          {receipt.showTaxNumber && (
            <div style={{ fontSize: '11px', color: '#666' }}>VKN: {business.taxNumber}</div>
          )}
        </div>

        {/* Items */}
        <div style={{ borderTop: '1px dashed #ccc', borderBottom: '1px dashed #ccc', padding: '12px 0', margin: '12px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>2x Latte</span>
            <span>120 TL</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>1x Cheesecake</span>
            <span>85 TL</span>
          </div>
        </div>

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '14px' }}>
          <span>TOPLAM</span>
          <span>205 TL</span>
        </div>

        {/* Footer */}
        {receipt.footerText && (
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '10px', color: '#666' }}>
            {receipt.footerText}
          </div>
        )}
      </div>
    </div>
  );
}
