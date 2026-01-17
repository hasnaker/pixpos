import { useState, useEffect } from 'react';
import { Plus, Minus, Sparkles, Edit3, Grid3X3, Users } from 'lucide-react';
import { modalOverlayStyle, modalContentStyle, inputStyle, labelStyle, primaryButtonStyle, secondaryButtonStyle } from '../styles';
import { ZONES } from '../types';

// Zone prefix mapping
const ZONE_PREFIXES: Record<string, string> = {
  'Salon': 'SL',
  'Bahçe': 'BH',
  'Dışarı': 'DS',
  'Teras': 'TR',
  'VIP': 'VIP',
};

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, zone: string, capacity: number) => void;
  onBulkSubmit?: (tables: Array<{ name: string; zone: string; capacity: number }>) => void;
  isPending: boolean;
  existingTables?: any[];
}

export default function TableModal({ isOpen, onClose, onSubmit, onBulkSubmit, isPending, existingTables = [] }: TableModalProps) {
  const [mode, setMode] = useState<'bulk' | 'single'>('bulk');
  const [zone, setZone] = useState('Salon');
  const [tableCount, setTableCount] = useState(5);
  const [capacity, setCapacity] = useState(4);
  const [customName, setCustomName] = useState('');
  const [useCustomName, setUseCustomName] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode('bulk');
      setZone('Salon');
      setTableCount(5);
      setCapacity(4);
      setCustomName('');
      setUseCustomName(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Get next available number for zone
  const getNextNumber = (zoneKey: string): number => {
    const prefix = ZONE_PREFIXES[zoneKey] || zoneKey.substring(0, 2).toUpperCase();
    const zoneTables = existingTables.filter(t => t.zone === zoneKey);
    const numbers = zoneTables
      .map(t => {
        const match = t.name.match(new RegExp(`${prefix}-(\\d+)`));
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0);
    return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  };

  // Generate table names preview
  const generateTableNames = (): string[] => {
    const prefix = ZONE_PREFIXES[zone] || zone.substring(0, 2).toUpperCase();
    const startNum = getNextNumber(zone);
    return Array.from({ length: tableCount }, (_, i) => 
      `${prefix}-${String(startNum + i).padStart(2, '0')}`
    );
  };

  const previewNames = generateTableNames();

  const handleBulkSubmit = () => {
    if (onBulkSubmit) {
      const tables = previewNames.map(name => ({ name, zone, capacity }));
      onBulkSubmit(tables);
    } else {
      // Fallback: submit one by one
      previewNames.forEach(name => onSubmit(name, zone, capacity));
    }
  };

  const handleSingleSubmit = () => {
    if (useCustomName && customName.trim()) {
      onSubmit(customName.trim(), zone, capacity);
    } else {
      const prefix = ZONE_PREFIXES[zone] || zone.substring(0, 2).toUpperCase();
      const nextNum = getNextNumber(zone);
      const autoName = `${prefix}-${String(nextNum).padStart(2, '0')}`;
      onSubmit(autoName, zone, capacity);
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={{ ...modalContentStyle, maxWidth: '480px', width: '90%' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
            Masa Ekle
          </h3>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
            Toplu veya tek tek masa ekleyin
          </p>
        </div>

        {/* Mode Toggle */}
        <div style={{ 
          display: 'flex', gap: '8px', marginBottom: '24px', padding: '4px',
          background: 'rgba(255,255,255,0.05)', borderRadius: '12px'
        }}>
          <button
            onClick={() => setMode('bulk')}
            style={{
              flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
              background: mode === 'bulk' ? 'rgba(48,209,88,0.2)' : 'transparent',
              color: mode === 'bulk' ? '#30D158' : 'rgba(255,255,255,0.5)',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <Grid3X3 size={18} />
            Toplu Ekle
          </button>
          <button
            onClick={() => setMode('single')}
            style={{
              flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
              background: mode === 'single' ? 'rgba(10,132,255,0.2)' : 'transparent',
              color: mode === 'single' ? '#0A84FF' : 'rgba(255,255,255,0.5)',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <Edit3 size={18} />
            Tek Masa
          </button>
        </div>

        {/* Zone Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ ...labelStyle, marginBottom: '10px', display: 'block' }}>Bölge Seçin</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {ZONES.map((z) => {
              const isSelected = zone === z;
              const prefix = ZONE_PREFIXES[z] || z.substring(0, 2).toUpperCase();
              const count = existingTables.filter(t => t.zone === z).length;
              return (
                <button
                  key={z}
                  onClick={() => setZone(z)}
                  style={{
                    padding: '12px 16px', borderRadius: '10px',
                    background: isSelected ? 'rgba(10,132,255,0.15)' : 'rgba(255,255,255,0.05)',
                    border: isSelected ? '1px solid rgba(10,132,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    color: isSelected ? '#0A84FF' : 'rgba(255,255,255,0.7)',
                    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    minWidth: '80px',
                  }}
                >
                  <span>{z}</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                    {prefix} • {count} masa
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {mode === 'bulk' ? (
          <>
            {/* Table Count */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ ...labelStyle, marginBottom: '10px', display: 'block' }}>Masa Sayısı</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  onClick={() => setTableCount(Math.max(1, tableCount - 1))}
                  style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.08)', border: 'none',
                    color: '#fff', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Minus size={20} />
                </button>
                <input
                  type="number"
                  value={tableCount}
                  onChange={(e) => setTableCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                  style={{
                    ...inputStyle, width: '80px', textAlign: 'center',
                    fontSize: '24px', fontWeight: 700, padding: '12px',
                  }}
                />
                <button
                  onClick={() => setTableCount(Math.min(50, tableCount + 1))}
                  style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.08)', border: 'none',
                    color: '#fff', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Plus size={20} />
                </button>
                {/* Quick buttons */}
                <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                  {[5, 10, 20].map(n => (
                    <button
                      key={n}
                      onClick={() => setTableCount(n)}
                      style={{
                        padding: '8px 12px', borderRadius: '8px',
                        background: tableCount === n ? 'rgba(48,209,88,0.2)' : 'rgba(255,255,255,0.05)',
                        border: 'none', color: tableCount === n ? '#30D158' : 'rgba(255,255,255,0.5)',
                        fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ ...labelStyle, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} style={{ color: '#FF9F0A' }} />
                Oluşturulacak Masalar
              </label>
              <div style={{
                padding: '16px', borderRadius: '12px',
                background: 'rgba(255,159,10,0.08)', border: '1px solid rgba(255,159,10,0.2)',
                maxHeight: '120px', overflowY: 'auto',
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {previewNames.map((name, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '6px 12px', borderRadius: '8px',
                        background: 'rgba(255,255,255,0.08)',
                        color: '#fff', fontSize: '13px', fontWeight: 500,
                      }}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Single Table Mode */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '10px'
              }}>
                <label style={labelStyle}>Masa Adı</label>
                <button
                  onClick={() => setUseCustomName(!useCustomName)}
                  style={{
                    padding: '6px 12px', borderRadius: '8px',
                    background: useCustomName ? 'rgba(191,90,242,0.15)' : 'rgba(255,255,255,0.05)',
                    border: 'none', color: useCustomName ? '#BF5AF2' : 'rgba(255,255,255,0.5)',
                    fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  <Edit3 size={12} />
                  {useCustomName ? 'Otomatik' : 'Özel Ad'}
                </button>
              </div>
              
              {useCustomName ? (
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Örn: Köşe Masa, Pencere Kenarı..."
                  style={inputStyle}
                />
              ) : (
                <div style={{
                  padding: '16px', borderRadius: '12px',
                  background: 'rgba(48,209,88,0.08)', border: '1px solid rgba(48,209,88,0.2)',
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  <Sparkles size={18} style={{ color: '#30D158' }} />
                  <div>
                    <p style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                      {ZONE_PREFIXES[zone] || zone.substring(0, 2).toUpperCase()}-{String(getNextNumber(zone)).padStart(2, '0')}
                    </p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                      Otomatik oluşturulacak
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Capacity */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ ...labelStyle, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} />
            Kapasite (Kişi)
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[2, 4, 6, 8, 10, 12].map(cap => (
              <button
                key={cap}
                onClick={() => setCapacity(cap)}
                style={{
                  flex: 1, padding: '12px 8px', borderRadius: '10px',
                  background: capacity === cap ? 'rgba(10,132,255,0.15)' : 'rgba(255,255,255,0.05)',
                  border: capacity === cap ? '1px solid rgba(10,132,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  color: capacity === cap ? '#0A84FF' : 'rgba(255,255,255,0.6)',
                  fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cap}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{ ...secondaryButtonStyle, flex: 1 }}>
            İptal
          </button>
          <button
            onClick={mode === 'bulk' ? handleBulkSubmit : handleSingleSubmit}
            disabled={isPending || (mode === 'single' && useCustomName && !customName.trim())}
            style={{
              ...primaryButtonStyle,
              flex: 1,
              background: '#30D158',
              opacity: isPending || (mode === 'single' && useCustomName && !customName.trim()) ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {isPending ? 'Ekleniyor...' : (
              <>
                <Plus size={18} />
                {mode === 'bulk' ? `${tableCount} Masa Ekle` : 'Masa Ekle'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
