import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Settings,
  LogOut,
  Wifi,
  WifiOff,
  Lock,
  LayoutGrid,
  Trees,
  Umbrella,
  ChevronRight,
  User,
  Merge,
  ArrowRightLeft,
  Split,
  Layers,
  CircleDot,
  Building,
  Coffee,
  Sofa,
} from 'lucide-react';
import { useAutoLock, formatRemainingTime } from '@/hooks';
import { useSettings } from '@/contexts';
import { zonesApi } from '@/services/api';

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  LayoutGrid,
  Trees,
  Umbrella,
  Building,
  Coffee,
  Sofa,
  Layers,
};

const getZoneIcon = (iconName: string | undefined) => {
  const Icon = iconName ? ICON_MAP[iconName] : LayoutGrid;
  return Icon || LayoutGrid;
};

type ActionMode = 'merge' | 'transfer' | 'split' | null;

interface MainLayoutProps {
  selectedFloor: string;
  onFloorChange: (floorId: string) => void;
  actionMode: ActionMode;
  onActionModeChange: (mode: ActionMode) => void;
  selectedTables: string[];
  onCancelAction: () => void;
  onConfirmAction: () => void;
  isProcessing: boolean;
}

export default function MainLayout({ 
  selectedFloor, 
  onFloorChange,
  actionMode,
  onActionModeChange,
  selectedTables,
  onCancelAction,
  onConfirmAction,
  isProcessing,
}: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showLockWarning, setShowLockWarning] = useState(false);

  // Fetch zones from API
  const { data: zones = [] } = useQuery({
    queryKey: ['zones'],
    queryFn: zonesApi.getAll,
  });

  const { remainingTime, isEnabled: autoLockEnabled, isLocking } = useAutoLock({
    timeout: settings.autoLockTimeout,
    enabled: settings.autoLockEnabled,
  });

  useEffect(() => {
    if (autoLockEnabled && remainingTime > 0 && remainingTime <= 60) {
      setShowLockWarning(true);
    } else {
      setShowLockWarning(false);
    }
  }, [remainingTime, autoLockEnabled]);

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long' 
    });
  };

  const handleLogout = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#000000',
    }}>
      {/* ═══════════════════════════════════════════════════════════
          LEFT SIDEBAR - macOS Finder Style
          ═══════════════════════════════════════════════════════════ */}
      <aside style={{
        width: '220px',
        height: '100vh',
        background: 'rgba(30,30,30,0.85)',
        backdropFilter: 'blur(80px) saturate(180%)',
        WebkitBackdropFilter: 'blur(80px) saturate(180%)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
      }}>
        {/* Logo Area */}
        <div style={{
          padding: '24px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <img 
            src={`${import.meta.env.BASE_URL}pixpos.svg`}
            alt="PIXPOS" 
            style={{ 
              height: '192px',
              width: 'auto',
            }} 
          />
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {/* Zones Section */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '0 8px',
              marginBottom: '8px',
            }}>
              Bölgeler
            </div>
            
            {/* Tüm Bölgeler */}
            <button
              onClick={() => onFloorChange('all')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: selectedFloor === 'all' ? 'rgba(10,132,255,0.15)' : 'transparent',
                color: selectedFloor === 'all' ? '#0A84FF' : 'rgba(255,255,255,0.6)',
                marginBottom: '2px',
              }}
            >
              <Layers size={18} strokeWidth={1.5} style={{ opacity: selectedFloor === 'all' ? 1 : 0.7 }} />
              <span style={{ fontSize: '13px', fontWeight: 500 }}>Tüm Bölgeler</span>
              {selectedFloor === 'all' && (
                <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              )}
            </button>

            {/* Aktif Masalar */}
            <button
              onClick={() => onFloorChange('active')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: selectedFloor === 'active' ? 'rgba(48,209,88,0.15)' : 'transparent',
                color: selectedFloor === 'active' ? '#30D158' : 'rgba(255,255,255,0.6)',
                marginBottom: '6px',
              }}
            >
              <CircleDot size={18} strokeWidth={1.5} style={{ opacity: selectedFloor === 'active' ? 1 : 0.7 }} />
              <span style={{ fontSize: '13px', fontWeight: 500 }}>Aktif Masalar</span>
              {selectedFloor === 'active' && (
                <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              )}
            </button>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />

            {/* Dynamic Zones from API */}
            {zones.length === 0 ? (
              <div style={{ padding: '8px 10px', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                Bölge yok - Ayarlardan ekleyin
              </div>
            ) : (
              zones.map((zone) => {
                const isActive = selectedFloor === zone.name;
                const ZoneIcon = getZoneIcon(zone.icon);
                return (
                  <button
                    key={zone.id}
                    onClick={() => onFloorChange(zone.name)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                      marginBottom: '2px',
                    }}
                  >
                    <ZoneIcon size={18} strokeWidth={1.5} style={{ opacity: isActive ? 1 : 0.7 }} />
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{zone.name}</span>
                    {isActive && (
                      <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Masa İşlemleri */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '0 8px',
              marginBottom: '8px',
            }}>
              Masa İşlemleri
            </div>
            <button
              onClick={() => onActionModeChange(actionMode === 'merge' ? null : 'merge')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: actionMode === 'merge' ? 'rgba(10,132,255,0.15)' : 'transparent',
                color: actionMode === 'merge' ? '#0A84FF' : 'rgba(255,255,255,0.6)',
                marginBottom: '2px',
              }}
            >
              <Merge size={18} strokeWidth={1.5} />
              <span style={{ fontSize: '13px', fontWeight: 500 }}>Masa Birleştir</span>
              {actionMode === 'merge' && selectedTables.length > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: '#0A84FF',
                  color: '#fff',
                  padding: '2px 6px',
                  borderRadius: '10px',
                }}>
                  {selectedTables.length}
                </span>
              )}
            </button>
            <button
              onClick={() => onActionModeChange(actionMode === 'transfer' ? null : 'transfer')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: actionMode === 'transfer' ? 'rgba(255,159,10,0.15)' : 'transparent',
                color: actionMode === 'transfer' ? '#FF9F0A' : 'rgba(255,255,255,0.6)',
                marginBottom: '2px',
              }}
            >
              <ArrowRightLeft size={18} strokeWidth={1.5} />
              <span style={{ fontSize: '13px', fontWeight: 500 }}>Masa Taşı</span>
              {actionMode === 'transfer' && selectedTables.length > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: '#FF9F0A',
                  color: '#000',
                  padding: '2px 6px',
                  borderRadius: '10px',
                }}>
                  {selectedTables.length}
                </span>
              )}
            </button>
            <button
              onClick={() => onActionModeChange(actionMode === 'split' ? null : 'split')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: actionMode === 'split' ? 'rgba(191,90,242,0.15)' : 'transparent',
                color: actionMode === 'split' ? '#BF5AF2' : 'rgba(255,255,255,0.6)',
                marginBottom: '2px',
              }}
            >
              <Split size={18} strokeWidth={1.5} />
              <span style={{ fontSize: '13px', fontWeight: 500 }}>Hesap Böl</span>
            </button>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{
          padding: '12px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <button
            onClick={() => navigate('/settings')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: location.pathname === '/settings' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '4px',
            }}
          >
            <Settings size={18} strokeWidth={1.5} />
            <span style={{ fontSize: '13px', fontWeight: 500 }}>Ayarlar</span>
          </button>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: 'transparent',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            <LogOut size={18} strokeWidth={1.5} />
            <span style={{ fontSize: '13px', fontWeight: 500 }}>Çıkış</span>
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════
          MAIN CONTENT AREA
          ═══════════════════════════════════════════════════════════ */}
      <div style={{
        flex: 1,
        marginLeft: '220px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        {/* ─────────────────────────────────────────────────────────
            TOP HEADER - macOS Menu Bar Style
            ───────────────────────────────────────────────────────── */}
        <header style={{
          height: '52px',
          background: 'rgba(20,20,20,0.8)',
          backdropFilter: 'blur(80px) saturate(180%)',
          WebkitBackdropFilter: 'blur(80px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          {/* Left: Current Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ 
              fontSize: '15px', 
              fontWeight: 600, 
              color: '#fff',
            }}>
              {selectedFloor === 'all' ? 'Tüm Bölgeler' : selectedFloor === 'active' ? 'Aktif Masalar' : selectedFloor}
            </span>
            <div style={{
              width: '1px',
              height: '16px',
              background: 'rgba(255,255,255,0.1)',
            }} />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: isOnline ? 'rgba(48,209,88,0.1)' : 'rgba(255,69,58,0.1)',
            }}>
              {isOnline ? (
                <Wifi size={12} style={{ color: '#30D158' }} />
              ) : (
                <WifiOff size={12} style={{ color: '#FF453A' }} />
              )}
              <span style={{ 
                fontSize: '11px', 
                fontWeight: 500,
                color: isOnline ? '#30D158' : '#FF453A',
              }}>
                {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
              </span>
            </div>
          </div>

          {/* Center: Time & Date */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'baseline', 
            gap: '8px',
          }}>
            <span style={{ 
              fontSize: '15px', 
              fontWeight: 600, 
              color: '#fff',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {formatTime(currentTime)}
            </span>
            <span style={{ 
              fontSize: '13px', 
              color: 'rgba(255,255,255,0.4)',
            }}>
              {formatDate(currentTime)}
            </span>
          </div>

          {/* Right: User */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 12px 6px 8px',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.06)',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #5E5CE6 0%, #BF5AF2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <User size={14} style={{ color: '#fff' }} />
            </div>
            <span style={{ 
              fontSize: '13px', 
              fontWeight: 500, 
              color: '#fff',
            }}>
              Ahmet K.
            </span>
          </div>
        </header>

        {/* Offline Banner */}
        {!isOnline && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px',
            background: 'rgba(255,69,58,0.1)',
            borderBottom: '1px solid rgba(255,69,58,0.2)',
            color: '#FF453A',
            fontSize: '13px',
          }}>
            <WifiOff size={14} />
            <span>Çevrimdışı moddasınız. Değişiklikler bağlantı sağlandığında senkronize edilecek.</span>
          </div>
        )}

        {/* Auto-lock Warning */}
        {showLockWarning && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px',
            background: 'rgba(255,149,0,0.1)',
            borderBottom: '1px solid rgba(255,149,0,0.2)',
            color: '#FF9500',
            fontSize: '13px',
          }}>
            <Lock size={14} />
            <span>Ekran {formatRemainingTime(remainingTime)} içinde kilitlenecek.</span>
          </div>
        )}

        {/* Page Content */}
        <main style={{
          flex: 1,
          padding: '24px',
          paddingBottom: actionMode ? '120px' : '60px',
          overflowY: 'auto',
        }}>
          <Outlet />
        </main>

        {/* Action Mode Bar */}
        {actionMode && (
          <div style={{
            position: 'fixed',
            bottom: '32px',
            left: '220px',
            right: 0,
            padding: '16px 24px',
            background: 'rgba(20,20,20,0.95)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 60,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: actionMode === 'merge' 
                  ? 'rgba(10,132,255,0.2)' 
                  : actionMode === 'transfer'
                    ? 'rgba(255,159,10,0.2)'
                    : 'rgba(191,90,242,0.2)',
              }}>
                {actionMode === 'merge' && <Merge size={20} style={{ color: '#0A84FF' }} />}
                {actionMode === 'transfer' && <ArrowRightLeft size={20} style={{ color: '#FF9F0A' }} />}
                {actionMode === 'split' && <Split size={20} style={{ color: '#BF5AF2' }} />}
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>
                  {actionMode === 'merge' && 'Masa Birleştir'}
                  {actionMode === 'transfer' && 'Masa Taşı'}
                  {actionMode === 'split' && 'Hesap Böl'}
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                  {actionMode === 'merge' && (selectedTables.length === 0 
                    ? 'Birleştirilecek masaları seçin' 
                    : `${selectedTables.length} masa seçildi`)}
                  {actionMode === 'transfer' && (selectedTables.length === 0 
                    ? 'Taşınacak masayı seçin' 
                    : selectedTables.length === 1 
                      ? 'Hedef masayı seçin'
                      : '2 masa seçildi')}
                  {actionMode === 'split' && 'Bölünecek hesabı seçin'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={onCancelAction}
                disabled={isProcessing}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  opacity: isProcessing ? 0.5 : 1,
                }}
              >
                İptal
              </button>
              {((actionMode === 'merge' && selectedTables.length >= 2) || 
                (actionMode === 'transfer' && selectedTables.length === 2)) && (
                <button
                  onClick={onConfirmAction}
                  disabled={isProcessing}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: actionMode === 'merge' ? '#0A84FF' : '#FF9F0A',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    boxShadow: actionMode === 'merge' 
                      ? '0 0 20px rgba(10,132,255,0.4)' 
                      : '0 0 20px rgba(255,159,10,0.4)',
                    opacity: isProcessing ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {isProcessing && (
                    <div style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                  )}
                  {actionMode === 'merge' ? 'Birleştir' : 'Taşı'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer style={{
          height: '32px',
          background: 'rgba(20,20,20,0.6)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          position: 'fixed',
          bottom: 0,
          left: '220px',
          right: 0,
          zIndex: 50,
        }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
            PIXPOS v1.0.0
          </span>
          <div style={{
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isOnline ? '#30D158' : '#FF453A',
              boxShadow: isOnline ? '0 0 8px #30D158' : '0 0 8px #FF453A',
            }} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
              {isOnline ? 'Bağlı' : 'Bağlantı Yok'}
            </span>
          </div>
        </footer>
      </div>

      {/* Lock Transition Overlay */}
      {isLocking && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            color: '#fff',
          }}>
            <Lock size={48} style={{ color: '#0A84FF' }} />
            <span style={{ fontSize: '18px', fontWeight: 500 }}>Ekran kilitleniyor...</span>
          </div>
        </div>
      )}
    </div>
  );
}
