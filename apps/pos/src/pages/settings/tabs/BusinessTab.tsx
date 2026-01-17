import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { cardStyle, inputStyle, labelStyle } from '../styles';
import type { BusinessSettings } from '../types';

interface BusinessTabProps {
  business: BusinessSettings;
  setBusiness: React.Dispatch<React.SetStateAction<BusinessSettings>>;
}

export default function BusinessTab({ business, setBusiness }: BusinessTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Logo dosyası 2MB\'dan küçük olmalıdır');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setBusiness(prev => ({ ...prev, logo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Logo Section */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div onClick={() => fileInputRef.current?.click()} style={{
            width: '120px', height: '120px', borderRadius: '20px',
            background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden',
          }}>
            {business.logo ? (
              <img src={business.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <Upload size={28} style={{ color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }} />
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', display: 'block' }}>Logo Yükle</span>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>İşletme Logosu</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>PNG veya SVG, max 2MB</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => fileInputRef.current?.click()} style={{
                padding: '10px 20px', borderRadius: '10px', background: 'rgba(10,132,255,0.15)',
                border: 'none', color: '#0A84FF', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
              }}>Değiştir</button>
              {business.logo && (
                <button onClick={() => setBusiness(prev => ({ ...prev, logo: null }))} style={{
                  padding: '10px 20px', borderRadius: '10px', background: 'rgba(255,69,58,0.15)',
                  border: 'none', color: '#FF453A', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                }}>Kaldır</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Business Info Section */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>İşletme Bilgileri</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>İşletme Adı</label>
            <input 
              type="text" 
              value={business.name} 
              onChange={(e) => setBusiness(prev => ({ ...prev, name: e.target.value }))} 
              style={inputStyle} 
            />
          </div>
          <div>
            <label style={labelStyle}>Adres</label>
            <textarea 
              value={business.address} 
              onChange={(e) => setBusiness(prev => ({ ...prev, address: e.target.value }))} 
              rows={2} 
              style={{ ...inputStyle, resize: 'none' }} 
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Telefon</label>
              <input 
                type="text" 
                value={business.phone} 
                onChange={(e) => setBusiness(prev => ({ ...prev, phone: e.target.value }))} 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Vergi No</label>
              <input 
                type="text" 
                value={business.taxNumber} 
                onChange={(e) => setBusiness(prev => ({ ...prev, taxNumber: e.target.value }))} 
                style={inputStyle} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
