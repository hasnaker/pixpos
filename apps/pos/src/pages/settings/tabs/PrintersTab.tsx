import { useState } from 'react';
import { Plus, Trash2, Wifi, ChefHat, Receipt, Printer as PrinterIcon, Search, Loader2, Check, X, RefreshCw } from 'lucide-react';
import { cardStyle } from '../styles';

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && (window as any).electronAPI?.isElectron;

interface Printer {
  id: string;
  name: string;
  ipAddress?: string;
  port?: number;
  type: 'kitchen' | 'receipt';
  isActive: boolean;
}

interface DiscoveredPrinter {
  ip: string;
  port: number;
  responseTime: number;
}

interface PrintersTabProps {
  printers: Printer[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
  onAddPrinter?: (printer: Partial<Printer>) => void;
}

export default function PrintersTab({ printers, onAdd, onDelete, onTest, onAddPrinter }: PrintersTabProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredPrinters, setDiscoveredPrinters] = useState<DiscoveredPrinter[]>([]);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [testingPrinter, setTestingPrinter] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Ağda yazıcı tara
  const scanNetwork = async () => {
    setIsScanning(true);
    setDiscoveredPrinters([]);
    setShowDiscovery(true);
    setScanError(null);
    
    try {
      if (isElectron) {
        // Electron: Use local network scanning
        const result = await (window as any).electronAPI.scanPrinters();
        if (result.success) {
          setDiscoveredPrinters(result.printers || []);
        } else {
          setScanError(result.error || 'Tarama başarısız');
        }
      } else {
        // Web: Use API (will only work if API is on same network)
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${apiUrl}/printers/discover`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        setDiscoveredPrinters(data.printers || []);
        
        if (data.printers?.length === 0) {
          setScanError('Web tarayıcıdan yerel ağ taranamaz. EXE uygulamasını kullanın.');
        }
      }
    } catch (error) {
      console.error('Tarama hatası:', error);
      setScanError(isElectron 
        ? 'Tarama sırasında hata oluştu' 
        : 'Web tarayıcıdan yerel ağ taranamaz. EXE uygulamasını kullanın.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  // Bulunan yazıcıyı ekle
  const addDiscoveredPrinter = async (discovered: DiscoveredPrinter, type: 'kitchen' | 'receipt') => {
    const printerData = {
      name: type === 'kitchen' ? `Mutfak Yazıcı (${discovered.ip})` : `Fiş Yazıcı (${discovered.ip})`,
      ipAddress: discovered.ip,
      port: discovered.port,
      type,
      isActive: true,
    };
    
    // API'ye direkt ekle
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      await fetch(`${apiUrl}/printers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(printerData),
      });
      // Listeyi yenile - parent component'in refetch yapması için
      if (onAddPrinter) onAddPrinter(printerData);
      // Eklenen yazıcıyı listeden kaldır
      setDiscoveredPrinters(prev => prev.filter(p => p.ip !== discovered.ip));
      // Sayfayı yenile
      window.location.reload();
    } catch (error) {
      console.error('Yazıcı ekleme hatası:', error);
    }
  };

  // Test yazdırma
  const handleTest = async (id: string) => {
    setTestingPrinter(id);
    setTestResult(null);
    
    const printer = printers.find(p => p.id === id);
    
    try {
      let success = false;
      
      if (isElectron && printer?.ipAddress) {
        // Electron: Direct local test print
        const result = await (window as any).electronAPI.testPrinter(printer.ipAddress, printer.port);
        success = result.success;
      } else {
        // Web: Use API
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${apiUrl}/printers/${id}/test`, { method: 'POST' });
        const data = await response.json();
        success = data.success;
      }
      
      setTestResult({ id, success });
      onTest(id);
    } catch {
      setTestResult({ id, success: false });
    } finally {
      setTestingPrinter(null);
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {/* Scan Network Button */}
        <button onClick={scanNetwork} disabled={isScanning} style={{
          flex: 1, padding: '16px', borderRadius: '14px', 
          background: 'linear-gradient(135deg, rgba(10,132,255,0.2), rgba(94,92,230,0.2))',
          border: '1px solid rgba(10,132,255,0.3)', color: '#0A84FF',
          fontSize: '15px', fontWeight: 600, cursor: isScanning ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          opacity: isScanning ? 0.7 : 1,
        }}>
          {isScanning ? (
            <>
              <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              Ağ Taranıyor...
            </>
          ) : (
            <>
              <Search size={18} />
              Ağda Yazıcı Tara
            </>
          )}
        </button>

        {/* Manual Add Button */}
        <button onClick={onAdd} style={{
          padding: '16px 24px', borderRadius: '14px', background: 'rgba(255,159,10,0.1)',
          border: '1px solid rgba(255,159,10,0.2)', color: '#FF9F0A',
          fontSize: '15px', fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          <Plus size={18} />
          Manuel Ekle
        </button>
      </div>

      {/* Discovered Printers */}
      {showDiscovery && (
        <div style={{ ...cardStyle, padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>
              Bulunan Yazıcılar ({discoveredPrinters.length})
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={scanNetwork} disabled={isScanning} style={{
                padding: '6px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)',
                border: 'none', color: '#8e8e93', cursor: 'pointer',
              }}>
                <RefreshCw size={14} style={{ animation: isScanning ? 'spin 1s linear infinite' : 'none' }} />
              </button>
              <button onClick={() => setShowDiscovery(false)} style={{
                padding: '6px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)',
                border: 'none', color: '#8e8e93', cursor: 'pointer',
              }}>
                <X size={14} />
              </button>
            </div>
          </div>

          {isScanning ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.4)' }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px' }}>192.168.x.1-254 taranıyor...</p>
              <p style={{ fontSize: '11px', marginTop: '4px' }}>Bu işlem 30-60 saniye sürebilir</p>
            </div>
          ) : scanError ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,159,10,0.8)' }}>
              <X size={24} style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '13px' }}>{scanError}</p>
              {!isElectron && (
                <p style={{ fontSize: '11px', marginTop: '8px', color: 'rgba(255,255,255,0.4)' }}>
                  💡 Yerel ağ taraması için PIXPOS EXE uygulamasını kullanın
                </p>
              )}
            </div>
          ) : discoveredPrinters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.4)' }}>
              <p style={{ fontSize: '13px' }}>Ağda yazıcı bulunamadı</p>
              <p style={{ fontSize: '11px', marginTop: '4px' }}>Yazıcının açık ve aynı ağda olduğundan emin olun</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {discoveredPrinters.map((printer) => {
                const alreadyAdded = printers.some(p => p.ipAddress === printer.ip);
                return (
                  <div key={printer.ip} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                    background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: 'rgba(48,209,88,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <PrinterIcon size={20} style={{ color: '#30D158' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>{printer.ip}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                        Port {printer.port} • {printer.responseTime}ms
                      </p>
                    </div>
                    {alreadyAdded ? (
                      <span style={{ fontSize: '12px', color: '#30D158', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} /> Eklendi
                      </span>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => addDiscoveredPrinter(printer, 'receipt')} style={{
                          padding: '6px 12px', borderRadius: '6px', background: 'rgba(10,132,255,0.15)',
                          border: 'none', color: '#0A84FF', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                          <Receipt size={12} /> Fiş
                        </button>
                        <button onClick={() => addDiscoveredPrinter(printer, 'kitchen')} style={{
                          padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,159,10,0.15)',
                          border: 'none', color: '#FF9F0A', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                          <ChefHat size={12} /> Mutfak
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {printers.length === 0 && !showDiscovery ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '40px' }}>
          <PrinterIcon size={48} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '16px' }} />
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>Henüz yazıcı eklenmemiş</p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
            "Ağda Yazıcı Tara" ile otomatik bul veya manuel ekle
          </p>
        </div>
      ) : (
        /* Printer List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {printers.map((printer) => (
            <div key={printer.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
              {/* Icon */}
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: printer.type === 'kitchen' ? 'rgba(255,159,10,0.15)' : 'rgba(10,132,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {printer.type === 'kitchen' 
                  ? <ChefHat size={24} style={{ color: '#FF9F0A' }} /> 
                  : <Receipt size={24} style={{ color: '#0A84FF' }} />
                }
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>{printer.name}</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                  {printer.ipAddress}:{printer.port} • {printer.type === 'kitchen' ? 'Mutfak' : 'Fiş Yazıcı'}
                </p>
              </div>

              {/* Status */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
                borderRadius: '20px', 
                background: printer.isActive ? 'rgba(48,209,88,0.15)' : 'rgba(255,69,58,0.15)',
              }}>
                <Wifi size={12} style={{ color: printer.isActive ? '#30D158' : '#FF453A' }} />
                <span style={{ fontSize: '12px', fontWeight: 500, color: printer.isActive ? '#30D158' : '#FF453A' }}>
                  {printer.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>

              {/* Test Button */}
              <button 
                onClick={() => handleTest(printer.id)} 
                disabled={testingPrinter === printer.id}
                style={{
                  padding: '8px 16px', borderRadius: '8px', 
                  background: testResult?.id === printer.id 
                    ? (testResult.success ? 'rgba(48,209,88,0.15)' : 'rgba(255,69,58,0.15)')
                    : 'rgba(255,255,255,0.05)',
                  border: 'none', 
                  color: testResult?.id === printer.id 
                    ? (testResult.success ? '#30D158' : '#FF453A')
                    : '#fff', 
                  fontSize: '13px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                {testingPrinter === printer.id ? (
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                ) : testResult?.id === printer.id ? (
                  testResult.success ? <Check size={14} /> : <X size={14} />
                ) : null}
                {testingPrinter === printer.id ? 'Test...' : testResult?.id === printer.id ? (testResult.success ? 'Başarılı' : 'Hata') : 'Test'}
              </button>

              {/* Delete Button */}
              <button onClick={() => onDelete(printer.id)} style={{
                padding: '8px', borderRadius: '8px', background: 'rgba(255,69,58,0.1)',
                border: 'none', color: '#FF453A', cursor: 'pointer',
              }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div style={{
        padding: '16px', borderRadius: '12px', background: 'rgba(10,132,255,0.08)',
        border: '1px solid rgba(10,132,255,0.15)',
      }}>
        <p style={{ fontSize: '13px', color: '#0A84FF', fontWeight: 500, marginBottom: '8px' }}>
          💡 Yazıcı Kurulum Rehberi
        </p>
        <ul style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0, paddingLeft: '16px', lineHeight: 1.6 }}>
          <li>Yazıcıyı aynı WiFi ağına bağlayın</li>
          <li>Yazıcının IP adresini yazıcı menüsünden öğrenin (genelde 192.168.x.x)</li>
          <li>Port genellikle 9100'dür (ESC/POS yazıcılar)</li>
          <li>"Ağda Yazıcı Tara" ile otomatik bulabilirsiniz</li>
          <li>Test yazdırma ile bağlantıyı doğrulayın</li>
        </ul>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
