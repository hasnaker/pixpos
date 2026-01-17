import { modalOverlayStyle, modalContentStyle, inputStyle, labelStyle, primaryButtonStyle, secondaryButtonStyle } from '../styles';
import type { User } from '../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  user: Omit<User, 'id'> | User;
  setUser: (user: any) => void;
  isEditing: boolean;
}

export default function UserModal({ isOpen, onClose, onSubmit, user, setUser, isEditing }: UserModalProps) {
  if (!isOpen) return null;

  // For editing, PIN is optional (only required if changing)
  const isValid = user.name.trim() && (isEditing ? true : user.pin.length === 4);

  const roleOptions: { value: User['role']; label: string; color: string; bg: string }[] = [
    { value: 'admin', label: 'Yönetici', color: '#BF5AF2', bg: 'rgba(191,90,242,0.15)' },
    { value: 'manager', label: 'Müdür', color: '#FF9F0A', bg: 'rgba(255,159,10,0.15)' },
    { value: 'cashier', label: 'Kasiyer', color: '#0A84FF', bg: 'rgba(10,132,255,0.15)' },
    { value: 'waiter', label: 'Garson', color: '#30D158', bg: 'rgba(48,209,88,0.15)' },
  ];

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '24px' }}>
          {isEditing ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
        </h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Ad Soyad</label>
          <input 
            type="text" 
            value={user.name} 
            onChange={(e) => setUser({ ...user, name: e.target.value })} 
            placeholder="Ahmet Yılmaz" 
            style={inputStyle} 
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Rol</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {roleOptions.map((option) => (
              <button 
                key={option.value} 
                onClick={() => setUser({ ...user, role: option.value })} 
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px',
                  background: user.role === option.value ? option.bg : 'rgba(255,255,255,0.05)',
                  border: user.role === option.value ? `1px solid ${option.color}` : '1px solid rgba(255,255,255,0.08)',
                  color: user.role === option.value ? option.color : '#fff',
                  fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>PIN Kodu (4 haneli){isEditing ? ' - Değiştirmek için yeni PIN girin' : ''}</label>
          <input 
            type="text" 
            value={user.pin} 
            onChange={(e) => setUser({ ...user, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })} 
            placeholder={isEditing ? '••••' : '1234'} 
            maxLength={4} 
            style={inputStyle} 
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{ ...secondaryButtonStyle, flex: 1 }}>İptal</button>
          <button 
            onClick={onSubmit} 
            disabled={!isValid} 
            style={{ 
              ...primaryButtonStyle, 
              flex: 1, 
              background: isEditing ? '#0A84FF' : '#BF5AF2',
              opacity: !isValid ? 0.5 : 1 
            }}
          >
            {isEditing ? 'Kaydet' : 'Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
}
