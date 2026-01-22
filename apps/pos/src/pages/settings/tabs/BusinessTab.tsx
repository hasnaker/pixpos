import { useRef } from 'react';
import { Upload, Video, X, Plus } from 'lucide-react';
import { cardStyle, inputStyle, labelStyle } from '../styles';
import type { BusinessSettings } from '../types';

interface BusinessTabProps {
  business: BusinessSettings;
  setBusiness: React.Dispatch<React.SetStateAction<BusinessSettings>>;
}

export default function BusinessTab({ business, setBusiness }: BusinessTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Logo dosyası 2MB\'dan küçük olmalıdır');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setBusiness(prev => ({ ...prev, logoUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const currentVideos = business.displayVideos || [];
    
    Array.from(files).forEach(file => {
      if (file.size > 100 * 1024 * 1024) {
        alert(`${file.name} dosyası 100MB'dan küçük olmalıdır`);
        return;
      }
      
      // For local files, we'll store the file path
      // In Electron, we can access local files
      const reader = new FileReader();
      reader.onloadend = () => {
        setBusiness(prev => ({
          ...prev,
          displayVideos: [...(prev.displayVideos || []), reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const removeVideo = (index: number) => {
    setBusiness(prev => ({
      ...prev,
      displayVideos: (prev.displayVideos || []).filter((_, i) => i !== index)
    }));
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
            {business.logoUrl ? (
              <img src={business.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
              {business.logoUrl && (
                <button onClick={() => setBusiness(prev => ({ ...prev, logoUrl: '' }))} style={{
                  padding: '10px 20px', borderRadius: '10px', background: 'rgba(255,69,58,0.15)',
                  border: 'none', color: '#FF453A', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                }}>Kaldır</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Display Videos Section */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>Müşteri Ekranı Videoları</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
              Müşteri ekranında dönen tanıtım videoları (MP4, max 100MB)
            </p>
          </div>
          <button 
            onClick={() => videoInputRef.current?.click()} 
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 16px', borderRadius: '10px', background: 'rgba(48,209,88,0.15)',
              border: 'none', color: '#30D158', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
            }}
          >
            <Plus size={18} />
            Video Ekle
          </button>
        </div>
        
        <input 
          ref={videoInputRef} 
          type="file" 
          accept="video/mp4,video/webm,video/ogg" 
          multiple
          onChange={handleVideoUpload} 
          style={{ display: 'none' }} 
        />
        
        {/* Video List */}
        {(business.displayVideos && business.displayVideos.length > 0) ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {business.displayVideos.map((video, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '12px 16px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '10px',
                  background: 'rgba(10,132,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Video size={24} style={{ color: '#0A84FF' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '14px', fontWeight: 500, color: '#fff',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    Video {index + 1}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    {video.startsWith('data:') ? 'Yüklenen video' : video.substring(0, 50) + '...'}
                  </div>
                </div>
                <button 
                  onClick={() => removeVideo(index)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'rgba(255,69,58,0.15)', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={18} style={{ color: '#FF453A' }} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '40px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.02)',
            border: '2px dashed rgba(255,255,255,0.1)',
            textAlign: 'center',
          }}>
            <Video size={40} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '12px' }} />
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
              Henüz video eklenmedi
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginTop: '4px' }}>
              Müşteri ekranında logo gösterilecek
            </div>
          </div>
        )}
      </div>

      {/* Business Info Section */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>İşletme Bilgileri</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>İşletme Adı</label>
            <input 
              type="text" 
              value={business.storeName} 
              onChange={(e) => setBusiness(prev => ({ ...prev, storeName: e.target.value }))} 
              style={inputStyle} 
            />
          </div>
          <div>
            <label style={labelStyle}>Adres</label>
            <textarea 
              value={business.address || ''} 
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
                value={business.phone || ''} 
                onChange={(e) => setBusiness(prev => ({ ...prev, phone: e.target.value }))} 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Vergi No</label>
              <input 
                type="text" 
                value={business.taxNumber || ''} 
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
