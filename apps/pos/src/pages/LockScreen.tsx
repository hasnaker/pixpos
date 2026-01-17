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

// PIXPOS Logo
const PixposLogo = ({ size = 120 }: { size?: number }) => (
  <svg viewBox="0 0 1000 1000" width={size} height={size}>
    <path d="M224.25,549.47l-.87,53.44-28.57-.1.21-106.4c.04-20.87,13.87-39.16,32.48-47.16,20.16-8.66,43.34-5.87,59.82,8.47,26.16,22.78,24.72,63.87-1.61,85.85-17.39,13.51-40.01,16.25-61.47,5.9Z" fill="#fcfcfb"/>
    <path d="M506.23,549.49l-.82,53.4-28.35-.03-.37-99.87c-.07-19.26,7.11-37.01,22.94-48.29,19.63-13.99,46.41-14.13,66.02.08,15.5,11.23,22.69,29.29,21.96,48.11-1.09,28.27-22.34,50.56-50.54,52.71-10.42.79-19.59-.86-30.84-6.1Z" fill="#fdfcfc"/>
    <path d="M648.91,555.59c-31.78-1.95-54.39-28.55-52.3-59.54,1.93-28.67,24.2-50.09,52.72-51.68,33.79-1.88,60.57,24.77,58.61,58.61-1.79,30.94-27.17,54.56-59.02,52.61Z" fill="#fcfcfc"/>
    <path d="M466.08,553.57l-32.4-.36-23-30.93-21.78,31.28-34.53-.65,38.36-53.85-38.14-52.26,35.62-.42,20.77,29.32,21.01-29.13,35.48.05-38.61,52.72,38.4,51.65c.66.89.32,2.31-1.18,2.58Z" fill="#fcfbfb"/>
    <path d="M803.05,534.45c-12.11,30.59-71.23,25.45-90.15,2.48,5.74-6.53,11.47-12.49,18.6-18.22,10.92,9.8,24.91,14.8,38.79,11.61,4.5-1.03,8.46-5.17,7.1-9.6-1.13-3.69-5.06-5.48-8.51-6.36l-26.58-6.75c-20.26-5.14-29.41-20.18-24.56-38.91,2.11-8.15,8.99-16.61,18.72-20.38,22.36-8.67,48.7-4.06,66.93,12.57-1.78,2.86-16.58,19.46-18.91,17.44-16.65-14.41-40.41-11.97-40.64-2.24-.08,3.24,2.32,5.92,5.82,6.83l29.3,7.62c8.49,2.21,16.59,6.15,21.89,13.52,6.12,8.53,6.39,19.82,2.2,30.4Z" fill="#fcfcfc"/>
    <path d="M346.55,553.16c-4.33.82-26.11.85-27.15,0-.63-.51-.96-1.91-.96-3.4l-.08-103.2c9.62-.46,18.47-.7,28.02-.03l.17,106.64Z" fill="#fdfdfd"/>
    <path d="M336.19,430.21c-7.91,1.43-15.13-2.39-18.54-8.08-4.18-6.98-3.27-15,2-20.85,4.91-5.45,12.97-7.2,20.2-3.91,7.18,3.26,10.97,10.15,10.3,17.83-.61,7.02-5.8,13.54-13.95,15.02Z" fill="#fbfafa"/>
    <path d="M272.51,517.17c-7.66,9.82-19.89,13.74-31.22,9.88-10.41-3.55-18.32-13.1-18.97-25.09-.5-9.27,3.05-17.75,9.73-23.4s16.26-7.96,25.53-5.77,16.08,8.99,18.89,16.32c3.74,9.77,2.37,19.96-3.95,28.06Z" fill="#030203"/>
    <path d="M558,510.79c-3.85,9.53-12.42,15.54-20.97,17.12-10.6,1.96-20.77-1.97-27.18-10.35-10.9-14.25-5.9-35.43,10.19-43.02,10.85-5.12,23.01-3.09,31.46,4.63,8.39,7.67,11.19,20.03,6.5,31.62Z" fill="#030303"/>
    <path d="M668.74,522.77c-10.95,8.13-24.37,7.58-34.45-.89-12.87-10.81-14.09-30.05-2.43-41.8,11.5-11.59,30.72-11.36,41.63,1.11,10.77,12.31,9.16,31.25-4.75,41.58Z" fill="#030203"/>
  </svg>
);

export default function LockScreen() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showUserList, setShowUserList] = useState(false);

  // Fetch users from API
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
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
          <PixposLogo size={70} />
          
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
          <span>PIXPOS v1.0</span>
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
        <span className="status-text">PIXPOS Enterprise</span>
      </div>

      <div className={`lock-center ${showUserList ? 'hidden' : ''}`}>
        <PixposLogo size={140} />
        
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
          <PixposLogo size={50} />
          <div>
            <h1>PIXPOS</h1>
            <p>Demo Cafe & Restaurant</p>
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
        <span>© 2026 PIXPOS</span>
        <button className="power-btn"><Power size={18} /></button>
      </div>
    </div>
  );
}
