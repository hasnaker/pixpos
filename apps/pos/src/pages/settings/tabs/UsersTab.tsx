import { Plus, Edit2, Trash2 } from 'lucide-react';
import { cardStyle } from '../styles';
import type { User } from '../types';

interface UsersTabProps {
  users: User[];
  onAdd: () => void;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export default function UsersTab({ users, onAdd, onEdit, onDelete, onToggleActive }: UsersTabProps) {
  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return '#BF5AF2';
      case 'manager': return '#FF9F0A';
      case 'cashier': return '#0A84FF';
      case 'waiter': return '#30D158';
      default: return '#8E8E93';
    }
  };

  const getRoleBg = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'rgba(191,90,242,0.15)';
      case 'manager': return 'rgba(255,159,10,0.15)';
      case 'cashier': return 'rgba(10,132,255,0.15)';
      case 'waiter': return 'rgba(48,209,88,0.15)';
      default: return 'rgba(142,142,147,0.15)';
    }
  };

  const getRoleLabel = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'Yönetici';
      case 'manager': return 'Müdür';
      case 'cashier': return 'Kasiyer';
      case 'waiter': return 'Garson';
      default: return role;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Add User Button */}
      <button onClick={onAdd} style={{
        padding: '16px', borderRadius: '14px', background: 'rgba(191,90,242,0.1)',
        border: '1px solid rgba(191,90,242,0.2)', color: '#BF5AF2',
        fontSize: '15px', fontWeight: 600, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      }}>
        <Plus size={18} />
        Yeni Kullanıcı
      </button>

      {/* User List */}
      {users.map((user) => (
        <div key={user.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          {/* Avatar */}
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: getRoleBg(user.role),
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '18px', fontWeight: 700,
            color: getRoleColor(user.role),
          }}>
            {user.name.charAt(0)}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>{user.name}</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
              {getRoleLabel(user.role)} • PIN: ****
            </p>
          </div>

          {/* Status Toggle */}
          <button onClick={() => onToggleActive(user.id)} style={{
            padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, 
            cursor: 'pointer', border: 'none',
            background: user.active ? 'rgba(48,209,88,0.15)' : 'rgba(255,69,58,0.15)',
            color: user.active ? '#30D158' : '#FF453A',
          }}>
            {user.active ? 'Aktif' : 'Pasif'}
          </button>

          {/* Edit Button */}
          <button onClick={() => onEdit(user)} style={{ 
            padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', 
            border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' 
          }}>
            <Edit2 size={16} />
          </button>

          {/* Delete Button */}
          <button onClick={() => {
            if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
              onDelete(user.id);
            }
          }} style={{ 
            padding: '8px', borderRadius: '8px', background: 'rgba(255,69,58,0.1)', 
            border: 'none', color: '#FF453A', cursor: 'pointer' 
          }}>
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
