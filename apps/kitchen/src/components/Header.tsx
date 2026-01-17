import { useState, useEffect } from 'react';
import { ChefHat, RefreshCw, Volume2, VolumeX } from 'lucide-react';

interface HeaderProps {
  orderCount: number;
  pendingCount: number;
  preparingCount: number;
  readyCount: number;
  averageTime: number;
  onRefresh: () => void;
  isRefreshing: boolean;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export function Header({ 
  orderCount, 
  pendingCount,
  preparingCount,
  readyCount,
  averageTime,
  onRefresh, 
  isRefreshing,
  soundEnabled,
  onSoundToggle,
  volume,
  onVolumeChange,
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedDate = currentTime.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
  });

  return (
    <>
      {/* Main Header */}
      <header className="kitchen-header">
        <div className="kitchen-header-left">
          <div className="kitchen-header-logo">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <h1 className="kitchen-header-title">Mutfak Ekranı</h1>
        </div>

        <div className="kitchen-header-center">
          <div className="connection-status">
            <div className="connection-dot connected" />
            <span>Bağlı</span>
          </div>
        </div>

        <div className="kitchen-header-right">
          {/* Sound Toggle */}
          <div className="sound-toggle">
            <button
              onClick={onSoundToggle}
              className={`icon-btn ${soundEnabled ? 'active' : ''}`}
              title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>
            {soundEnabled && (
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="volume-slider"
                title={`Ses: ${volume}%`}
              />
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="icon-btn"
            title="Yenile"
          >
            <RefreshCw 
              className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} 
            />
          </button>

          {/* Time Display */}
          <div className="text-right">
            <div className="kitchen-header-time">{formattedTime}</div>
            <div className="text-caption text-[var(--color-text-tertiary)]">{formattedDate}</div>
          </div>
        </div>
      </header>

      {/* Metrics Bar */}
      <div className="metrics-bar">
        <div className="metrics-group">
          <div className="metric-item">
            <span className="metric-label">Bekleyen:</span>
            <span className="metric-value pending">{pendingCount}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Hazırlanan:</span>
            <span className="metric-value preparing">{preparingCount}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Hazır:</span>
            <span className="metric-value ready">{readyCount}</span>
          </div>
        </div>

        <div className="metrics-group">
          <div className="metric-item">
            <span className="metric-label">Ort. Süre:</span>
            <span className="metric-value time">{averageTime} dk</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Toplam:</span>
            <span className="badge badge-blue">{orderCount}</span>
          </div>
        </div>
      </div>
    </>
  );
}
