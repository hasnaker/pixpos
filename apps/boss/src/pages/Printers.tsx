import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Printer as PrinterIcon, TestTube, Search, Wifi, Check, Loader2 } from 'lucide-react';
import { Button, Card, Input, Select, Modal } from '@/components/ui';
import { printersApi } from '@/services/api';
import type {
  Printer,
  CreatePrinterDto,
  UpdatePrinterDto,
  DiscoveredPrinter,
} from '@/services/api';

export default function Printers() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [discoveredPrinters, setDiscoveredPrinters] = useState<DiscoveredPrinter[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSubnet, setScanSubnet] = useState('');
  const [formData, setFormData] = useState<CreatePrinterDto>({
    name: '',
    type: 'kitchen',
    connectionType: 'tcp',
    ipAddress: '',
    port: 9100,
  });

  const { data: printers = [], isLoading } = useQuery({
    queryKey: ['printers'],
    queryFn: printersApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: printersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printers'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePrinterDto }) =>
      printersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printers'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: printersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printers'] });
    },
  });

  const testMutation = useMutation({
    mutationFn: printersApi.test,
    onSuccess: (data) => {
      alert(data.success ? 'Test başarılı!' : 'Test başarısız!');
      setTestingId(null);
    },
    onError: () => {
      alert('Test başarısız! Yazıcı bağlantısını kontrol edin.');
      setTestingId(null);
    },
  });

  const openModal = (printer?: Printer) => {
    if (printer) {
      setEditingPrinter(printer);
      setFormData({
        name: printer.name,
        type: printer.type,
        connectionType: printer.connectionType,
        ipAddress: printer.ipAddress || '',
        port: printer.port || 9100,
      });
    } else {
      setEditingPrinter(null);
      setFormData({
        name: '',
        type: 'kitchen',
        connectionType: 'tcp',
        ipAddress: '',
        port: 9100,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPrinter(null);
    setFormData({
      name: '',
      type: 'kitchen',
      connectionType: 'tcp',
      ipAddress: '',
      port: 9100,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPrinter) {
      updateMutation.mutate({ id: editingPrinter.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu yazıcıyı silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleTest = (id: string) => {
    setTestingId(id);
    testMutation.mutate(id);
  };

  const handleScan = async () => {
    setIsScanning(true);
    setDiscoveredPrinters([]);
    try {
      const result = await printersApi.discover(scanSubnet || undefined);
      setDiscoveredPrinters(result.printers);
      if (result.printers.length === 0) {
        alert('Ağda yazıcı bulunamadı. Yazıcıların açık ve aynı ağda olduğundan emin olun.');
      }
    } catch (error) {
      alert('Tarama sırasında hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddDiscovered = (discovered: DiscoveredPrinter) => {
    setFormData({
      name: `Yazıcı (${discovered.ip})`,
      type: 'kitchen',
      connectionType: 'tcp',
      ipAddress: discovered.ip,
      port: discovered.port,
    });
    setIsScanModalOpen(false);
    setIsModalOpen(true);
  };

  const getTypeLabel = (type: Printer['type']) => {
    return type === 'kitchen' ? 'Mutfak' : 'Fiş';
  };

  const getTypeColor = (type: Printer['type']) => {
    return type === 'kitchen'
      ? 'bg-[#FF9500]/10 text-[#FF9500]'
      : 'bg-[#5856D6]/10 text-[#5856D6]';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-large-title text-[#1D1D1F]">Yazıcılar</h1>
          <p className="text-body text-[#86868B] mt-1">
            Yazıcı ayarları ve test
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="tinted" onClick={() => setIsScanModalOpen(true)}>
            <Search size={18} />
            Yazıcı Tara
          </Button>
          <Button onClick={() => openModal()}>
            <Plus size={18} />
            Yeni Yazıcı
          </Button>
        </div>
      </div>

      {/* Printers List */}
      {isLoading ? (
        <div className="text-center py-12 text-[#86868B]">Yükleniyor...</div>
      ) : printers.length === 0 ? (
        <Card variant="elevated" className="text-center py-12">
          <p className="text-body text-[#86868B]">Henüz yazıcı eklenmemiş</p>
          <Button className="mt-4" onClick={() => openModal()}>
            <Plus size={18} />
            İlk Yazıcıyı Ekle
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {printers.map((printer) => (
            <Card key={printer.id} variant="elevated">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#F2F2F7] flex items-center justify-center">
                  <PrinterIcon className="text-[#8E8E93]" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-headline text-[#1D1D1F]">
                      {printer.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-caption ${getTypeColor(printer.type)}`}>
                      {getTypeLabel(printer.type)}
                    </span>
                  </div>
                  <p className="text-callout text-[#86868B] mt-1">
                    {printer.connectionType === 'tcp'
                      ? `${printer.ipAddress}:${printer.port}`
                      : 'USB Bağlantı'}
                  </p>
                  <div className={`
                    inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded text-caption
                    ${printer.isActive
                      ? 'bg-[#34C759]/10 text-[#34C759]'
                      : 'bg-[#8E8E93]/10 text-[#8E8E93]'
                    }
                  `}>
                    <span className={`w-1.5 h-1.5 rounded-full ${printer.isActive ? 'bg-[#34C759]' : 'bg-[#8E8E93]'}`} />
                    {printer.isActive ? 'Aktif' : 'Pasif'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-[#E5E5EA]">
                <Button
                  variant="tinted"
                  size="sm"
                  color="green"
                  className="flex-1"
                  onClick={() => handleTest(printer.id)}
                  disabled={testingId === printer.id}
                >
                  <TestTube size={14} />
                  {testingId === printer.id ? 'Test...' : 'Test'}
                </Button>
                <Button
                  variant="tinted"
                  size="sm"
                  onClick={() => openModal(printer)}
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="tinted"
                  size="sm"
                  color="red"
                  onClick={() => handleDelete(printer.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingPrinter ? 'Yazıcı Düzenle' : 'Yeni Yazıcı'}
        size="lg"
        footer={
          <>
            <Button variant="bordered" color="gray" onClick={closeModal}>
              İptal
            </Button>
            <Button onClick={handleSubmit}>
              {editingPrinter ? 'Güncelle' : 'Ekle'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Yazıcı Adı"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Select
            label="Yazıcı Tipi"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'kitchen' | 'receipt' })}
            options={[
              { value: 'kitchen', label: 'Mutfak Yazıcısı' },
              { value: 'receipt', label: 'Fiş Yazıcısı' },
            ]}
          />
          <Select
            label="Bağlantı Tipi"
            value={formData.connectionType}
            onChange={(e) => setFormData({ ...formData, connectionType: e.target.value as 'tcp' | 'usb' })}
            options={[
              { value: 'tcp', label: 'TCP/IP (Ağ)' },
              { value: 'usb', label: 'USB' },
            ]}
          />
          {formData.connectionType === 'tcp' && (
            <>
              <Input
                label="IP Adresi"
                value={formData.ipAddress}
                onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                placeholder="192.168.1.100"
                required
              />
              <Input
                label="Port"
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 9100 })}
              />
            </>
          )}
        </form>
      </Modal>

      {/* Scan Modal */}
      <Modal
        isOpen={isScanModalOpen}
        onClose={() => {
          setIsScanModalOpen(false);
          setDiscoveredPrinters([]);
          setScanSubnet('');
        }}
        title="Ağda Yazıcı Tara"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Subnet (opsiyonel, örn: 192.168.1)"
              value={scanSubnet}
              onChange={(e) => setScanSubnet(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleScan} disabled={isScanning}>
              {isScanning ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Taranıyor...
                </>
              ) : (
                <>
                  <Wifi size={18} />
                  Tara
                </>
              )}
            </Button>
          </div>

          {isScanning && (
            <div className="text-center py-8">
              <Loader2 size={32} className="animate-spin mx-auto text-[#007AFF]" />
              <p className="text-body text-[#86868B] mt-2">
                Ağ taranıyor... Bu işlem 30-60 saniye sürebilir.
              </p>
            </div>
          )}

          {!isScanning && discoveredPrinters.length > 0 && (
            <div className="space-y-2">
              <p className="text-callout text-[#86868B]">
                {discoveredPrinters.length} yazıcı bulundu:
              </p>
              {discoveredPrinters.map((printer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-[#F2F2F7] rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#34C759]/10 flex items-center justify-center">
                      <PrinterIcon className="text-[#34C759]" size={20} />
                    </div>
                    <div>
                      <p className="text-body text-[#1D1D1F] font-medium">
                        {printer.ip}:{printer.port}
                      </p>
                      <p className="text-caption text-[#86868B]">
                        Yanıt süresi: {printer.responseTime}ms
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddDiscovered(printer)}
                  >
                    <Check size={14} />
                    Ekle
                  </Button>
                </div>
              ))}
            </div>
          )}

          {!isScanning && discoveredPrinters.length === 0 && (
            <div className="text-center py-8 text-[#86868B]">
              <Wifi size={48} className="mx-auto mb-2 opacity-50" />
              <p>Tarama başlatmak için "Tara" butonuna tıklayın</p>
              <p className="text-caption mt-1">
                Yazıcıların açık ve aynı ağda olduğundan emin olun
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
