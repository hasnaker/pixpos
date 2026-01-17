import { modalOverlayStyle, modalContentStyle, inputStyle, labelStyle, primaryButtonStyle, secondaryButtonStyle } from '../styles';

interface PrinterData {
  name: string;
  ip: string;
  port: string;
  type: 'receipt' | 'kitchen';
}

export type { PrinterData };

interface PrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PrinterData) => void;
  isPending: boolean;
  data: PrinterData;
  setData: React.Dispatch<React.SetStateAction<PrinterData>>;
}

export default function PrinterModal({ isOpen, onClose, onSubmit, isPending, data, setData }: PrinterModalProps) {
  if (!isOpen) return null;

  const handleSubmit = () => {
    if (data.name.trim() && data.ip.trim()) {
      onSubmit(data);
    }
  };

  const isValid = data.name.trim() && data.ip.trim();

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '24px' }}>Yeni Yazıcı Ekle</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Yazıcı Adı</label>
          <input 
            type="text" 
            value={data.name} 
            onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))} 
            placeholder="Mutfak Yazıcısı" 
            style={inputStyle} 
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Tür</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {(['receipt', 'kitchen'] as const).map((type) => (
              <button 
                key={type} 
                onClick={() => setData(prev => ({ ...prev, type }))} 
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px',
                  background: data.type === type 
                    ? (type === 'kitchen' ? 'rgba(255,159,10,0.15)' : 'rgba(10,132,255,0.15)') 
                    : 'rgba(255,255,255,0.05)',
                  border: data.type === type 
                    ? `1px solid ${type === 'kitchen' ? '#FF9F0A' : '#0A84FF'}` 
                    : '1px solid rgba(255,255,255,0.08)',
                  color: data.type === type 
                    ? (type === 'kitchen' ? '#FF9F0A' : '#0A84FF') 
                    : '#fff',
                  fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                }}
              >
                {type === 'kitchen' ? 'Mutfak' : 'Fiş'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div>
            <label style={labelStyle}>IP Adresi</label>
            <input 
              type="text" 
              value={data.ip} 
              onChange={(e) => setData(prev => ({ ...prev, ip: e.target.value }))} 
              placeholder="192.168.1.100" 
              style={inputStyle} 
            />
          </div>
          <div>
            <label style={labelStyle}>Port</label>
            <input 
              type="text" 
              value={data.port} 
              onChange={(e) => setData(prev => ({ ...prev, port: e.target.value }))} 
              style={inputStyle} 
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{ ...secondaryButtonStyle, flex: 1 }}>İptal</button>
          <button 
            onClick={handleSubmit} 
            disabled={!isValid || isPending} 
            style={{ 
              ...primaryButtonStyle, 
              flex: 1, 
              background: '#FF9F0A',
              opacity: !isValid || isPending ? 0.5 : 1 
            }}
          >
            {isPending ? 'Ekleniyor...' : 'Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
}
