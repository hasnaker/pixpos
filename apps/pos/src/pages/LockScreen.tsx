import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Users, 
  Package,
  Wifi,
  WifiOff,
  Lock,
  ChevronUp,
  Power,
  Utensils,
} from 'lucide-react';
import { tablesApi, usersApi, type User } from '@/services/api';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Yönetici',
  manager: 'Müdür',
  cashier: 'Kasiyer',
  waiter: 'Garson',
};

// Logo component using PNG
const Logo = ({ height = 80 }: { height?: number }) => (
  <img 
    src={`${import.meta.env.BASE_URL}pixpos-logo.png`}
    alt="" 
    style={{ height: `${height}px`, objectFit: 'contain' }}
  />
);

export default function LockScreen() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showUserList, setShowUserList] = useState(false);

  // Fetch users from API and sort by name
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const allUsers = await usersApi.getAll();
      // Sort users by name (Turkish locale)
      return allUsers.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    },
    refetchInterval: 30000,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (pin: string) => usersApi.login(pin),
    onSuccess: (user) => {
      // Store logged in user
      localStorage.setItem('currentUser', JSON.stringify(user));
      navigate('/tables');
    },
    onError: () => {
      setPinError(true);
      setPin('');
      setTimeout(() => setPinError(false), 600);
    },
  });

  // Fetch live stats
  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.getAll,
    refetchInterval: 10000,
  });

  // Calculate live stats
  const activeTables = tables.filter(t => t.status !== 'empty').length;

  // Helper to get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatTime = (date: Date) => date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date: Date) => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setPin('');
    setPinError(false);
    setShowUserList(false);
  };

  const handlePinInput = useCallback((digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setPinError(false);

    if (newPin.length === 4) {
      setTimeout(() => {
        loginMutation.mutate(newPin);
      }, 150);
    }
  }, [pin, loginMutation]);

  const handleBackspace = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
    setPinError(false);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedUser(null);
    setPin('');
    setPinError(false);
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handlePinInput(e.key);
      else if (e.key === 'Backspace') handleBackspace();
      else if (e.key === 'Escape') handleBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedUser, handlePinInput, handleBackspace, handleBack]);

  const quickActions = [
    { id: 'quick-sale', label: 'Hızlı Satış', icon: <ShoppingCart size={20} />, onClick: () => navigate('/quick-sale') },
    { id: 'reports', label: 'Raporlar', icon: <BarChart3 size={20} />, onClick: () => navigate('/reports') },
    { id: 'settings', label: 'Ayarlar', icon: <Settings size={20} />, onClick: () => navigate('/settings') },
    { id: 'customers', label: 'Cariler', icon: <Users size={20} />, disabled: true, badge: 'v2.0' },
    { id: 'delivery', label: 'Paket', icon: <Package size={20} />, disabled: true, badge: 'v2.1' },
  ];

  // PIN Screen
  if (selectedUser) {
    return (
      <div className="lock-screen-container">
        <div className="gradient-bg" />
        <div className="lock-overlay blur" />

        <div className="lock-status-bar">
          <div className="status-left">
            <div className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          </div>
          <span className="status-date">{formatDate(currentTime)}</span>
        </div>

        <div className="pin-screen">
          <Logo height={100} />
          
          <div className="pin-avatar">
            <span>{selectedUser ? getInitials(selectedUser.name) : ''}</span>
          </div>
          <h2 className="pin-username">{selectedUser?.name}</h2>
          <p className="pin-role">{selectedUser ? (ROLE_LABELS[selectedUser.role] || selectedUser.role) : ''}</p>

          <div className={`pin-dots ${pinError ? 'shake' : ''}`}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''} ${pinError ? 'error' : ''}`} />
            ))}
          </div>
          {pinError && <p className="pin-error">PIN kodu yanlış</p>}

          <div className="pin-pad">
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key, i) => (
              key === '' ? <div key={i} /> :
              <button
                key={i}
                className={`pin-key ${key === '⌫' ? 'back' : ''}`}
                onClick={() => key === '⌫' ? handleBackspace() : handlePinInput(key)}
                disabled={key === '⌫' && pin.length === 0}
              >
                {key}
              </button>
            ))}
          </div>

          <button className="back-btn" onClick={handleBack}>
            <ChevronUp size={18} /> Kullanıcı Değiştir
          </button>
        </div>

        <div className="lock-footer">
          <span>v1.0</span>
          <button className="power-btn"><Power size={18} /></button>
        </div>
      </div>
    );
  }

  // Main Lock Screen
  return (
    <div className="lock-screen-container">
      <div className="gradient-bg" />
      <div className={`lock-overlay ${showUserList ? 'blur' : ''}`} />

      <div className="lock-status-bar">
        <div className="status-left">
          <div className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
        </div>
        <span className="status-text">POS Terminal</span>
      </div>

      <div className={`lock-center ${showUserList ? 'hidden' : ''}`}>
        <Logo height={140} />
        
        {/* Live Stats - Centered */}
        <div className="live-stats">
          <div className="stat-item">
            <Utensils size={14} />
            <span className="stat-value">{activeTables}</span>
            <span className="stat-label">Aktif Masa</span>
          </div>
        </div>
        
        <div className="lock-time">{formatTime(currentTime)}</div>
        <div className="lock-date">{formatDate(currentTime)}</div>
      </div>

      <div className={`swipe-hint ${showUserList ? 'hidden' : ''}`} onClick={() => setShowUserList(true)}>
        <div className="swipe-icon"><Lock size={24} /></div>
        <span>Unlocking AI Innovation</span>
        <span className="swipe-subtext">Giriş yapmak için tıklayın</span>
      </div>

      <div className={`user-panel ${showUserList ? 'visible' : ''}`}>
        <div className="brand">
          <Logo height={60} />
          <div>
            <p>POS Terminal</p>
          </div>
        </div>

        <div className="user-grid">
          {usersLoading ? (
            <div style={{ color: 'rgba(255,255,255,0.5)', padding: '20px' }}>Yükleniyor...</div>
          ) : users.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.5)', padding: '20px' }}>Kullanıcı bulunamadı</div>
          ) : (
            users.map(user => (
              <button key={user.id} className="user-card" onClick={() => handleUserSelect(user)}>
                <div className="user-avatar"><span>{getInitials(user.name)}</span></div>
                <div className="user-info">
                  <span className="name">{user.name}</span>
                  <span className="role">{ROLE_LABELS[user.role] || user.role}</span>
                </div>
                <Lock size={14} className="lock-icon" />
              </button>
            ))
          )}
        </div>

        <div className="quick-actions">
          {quickActions.map(action => (
            <button
              key={action.id}
              className={`quick-action ${action.disabled ? 'disabled' : ''}`}
              onClick={action.disabled ? undefined : action.onClick}
            >
              {action.icon}
              <span>{action.label}</span>
              {action.badge && <span className="badge">{action.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="lock-footer">
        <span>© 2026</span>
        <button className="power-btn"><Power size={18} /></button>
      </div>
    </div>
  );
}
