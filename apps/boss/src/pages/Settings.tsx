import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Users,
  MapPin,
  UtensilsCrossed,
  Printer,
  Lock,
  Plus,
  Pencil,
  Trash2,
  Upload,
  TestTube,
  Save,
} from 'lucide-react';
import { Button, Card, Input, Select, Modal } from '@/components/ui';
import {
  tablesApi,
  printersApi,
  settingsApi,
  usersApi,
  areasApi,
} from '@/services/api';
import type {
  Table,
  Printer as PrinterType,
  CreateTableDto,
  UpdateTableDto,
  CreatePrinterDto,
  UpdatePrinterDto,
  BusinessSettings,
  User,
  CreateUserDto,
  UpdateUserDto,
  Area,
  CreateAreaDto,
  UpdateAreaDto,
  LockScreenSettings,
} from '@/services/api';

type SettingsTab = 'business' | 'users' | 'areas' | 'tables' | 'printers' | 'lock';

const tabs: { id: SettingsTab; label: string; icon: typeof Building2 }[] = [
  { id: 'business', label: 'İşletme', icon: Building2 },
  { id: 'users', label: 'Kullanıcılar', icon: Users },
  { id: 'areas', label: 'Alanlar', icon: MapPin },
  { id: 'tables', label: 'Masalar', icon: UtensilsCrossed },
  { id: 'printers', label: 'Yazıcılar', icon: Printer },
  { id: 'lock', label: 'Kilit Ekranı', icon: Lock },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('business');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-large-title text-white">Ayarlar</h1>
        <p className="text-body text-white/60 mt-1">
          Sistem ayarları ve yapılandırma
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-150
              ${activeTab === tab.id
                ? 'bg-[#0A84FF] text-white'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === 'business' && <BusinessSettingsSection />}
        {activeTab === 'users' && <UsersSection />}
        {activeTab === 'areas' && <AreasSection />}
        {activeTab === 'tables' && <TablesSection />}
        {activeTab === 'printers' && <PrintersSection />}
        {activeTab === 'lock' && <LockScreenSection />}
      </div>
    </div>
  );
}

// Business Settings Section
function BusinessSettingsSection() {
  const queryClient = useQueryClient();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings', 'business'],
    queryFn: settingsApi.getBusiness,
  });

  const [formData, setFormData] = useState<BusinessSettings>({
    storeName: '',
    address: '',
    phone: '',
    email: '',
    taxNumber: '',
    logoUrl: '',
  });

  // Update form when data loads
  useState(() => {
    if (settings) {
      setFormData(settings);
      if (settings.logoUrl) {
        setLogoPreview(settings.logoUrl);
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: settingsApi.updateBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'business'] });
      alert('Ayarlar kaydedildi!');
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        // In real app, upload to server and get URL
        setFormData({ ...formData, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="text-center py-12 text-white/60">Yükleniyor...</div>;
  }

  return (
    <Card variant="elevated" className="max-w-2xl">
      <h2 className="text-title-2 text-white mb-6">İşletme Bilgileri</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Upload */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="text-white/40" size={32} />
            )}
          </div>
          <div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <Button type="button" variant="tinted" size="sm" className="pointer-events-none">
                <Upload size={16} />
                Logo Yükle
              </Button>
            </label>
            <p className="text-footnote text-white/40 mt-2">PNG, JPG - Max 2MB</p>
          </div>
        </div>

        <Input
          label="İşletme Adı"
          value={formData.storeName}
          onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
          placeholder="Demo Cafe"
          required
        />

        <Input
          label="Adres"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Örnek Mah. Örnek Sok. No:1"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Telefon"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="0212 123 45 67"
          />
          <Input
            label="E-posta"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="info@democafe.com"
          />
        </div>

        <Input
          label="Vergi Numarası"
          value={formData.taxNumber}
          onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
          placeholder="1234567890"
        />

        <div className="pt-4 border-t border-white/10">
          <Button type="submit" disabled={updateMutation.isPending}>
            <Save size={18} />
            {updateMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// Users Section
function UsersSection() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserDto>({
    name: '',
    pin: '',
    role: 'waiter',
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        pin: '',
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({ name: '', pin: '', role: 'waiter' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ name: '', pin: '', role: 'waiter' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      const updateData: UpdateUserDto = { name: formData.name, role: formData.role };
      if (formData.pin) updateData.pin = formData.pin;
      updateMutation.mutate({ id: editingUser.id, data: updateData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate(id);
    }
  };

  const getRoleLabel = (role: User['role']) => {
    const labels: Record<string, string> = {
      admin: 'Yönetici',
      manager: 'Müdür',
      cashier: 'Kasiyer',
      waiter: 'Garson',
      chef: 'Şef',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: User['role']) => {
    const colors: Record<string, string> = {
      admin: 'bg-[#BF5AF2]/20 text-[#BF5AF2]',
      manager: 'bg-[#FF453A]/20 text-[#FF453A]',
      cashier: 'bg-[#0A84FF]/20 text-[#0A84FF]',
      waiter: 'bg-[#30D158]/20 text-[#30D158]',
      chef: 'bg-[#FF9F0A]/20 text-[#FF9F0A]',
    };
    return colors[role] || 'bg-white/10 text-white/60';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-title-2 text-white">Kullanıcı Yönetimi</h2>
        <Button onClick={() => openModal()}>
          <Plus size={18} />
          Yeni Kullanıcı
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-white/60">Yükleniyor...</div>
      ) : users.length === 0 ? (
        <Card variant="elevated" className="text-center py-12">
          <p className="text-body text-white/60">Henüz kullanıcı eklenmemiş</p>
          <Button className="mt-4" onClick={() => openModal()}>
            <Plus size={18} />
            İlk Kullanıcıyı Ekle
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card key={user.id} variant="elevated">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0A84FF] to-[#5E5CE6] flex items-center justify-center text-white font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1">
                  <h3 className="text-headline text-white">{user.name}</h3>
                  <span className={`inline-block px-2 py-0.5 rounded text-caption mt-1 ${getRoleColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                <Button
                  variant="tinted"
                  size="sm"
                  className="flex-1"
                  onClick={() => openModal(user)}
                >
                  <Pencil size={14} />
                  Düzenle
                </Button>
                <Button
                  variant="tinted"
                  size="sm"
                  color="red"
                  onClick={() => handleDelete(user.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
        size="sm"
        footer={
          <>
            <Button variant="bordered" color="gray" onClick={closeModal}>
              İptal
            </Button>
            <Button onClick={handleSubmit}>
              {editingUser ? 'Güncelle' : 'Ekle'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Ad Soyad"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label={editingUser ? 'Yeni PIN (boş bırakılırsa değişmez)' : 'PIN'}
            type="password"
            value={formData.pin}
            onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
            placeholder="4-6 haneli"
            required={!editingUser}
          />
          <Select
            label="Rol"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
            options={[
              { value: 'admin', label: 'Yönetici' },
              { value: 'cashier', label: 'Kasiyer' },
              { value: 'waiter', label: 'Garson' },
              { value: 'chef', label: 'Şef' },
            ]}
          />
        </form>
      </Modal>
    </div>
  );
}


// Areas Section
function AreasSection() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [formData, setFormData] = useState<CreateAreaDto>({
    name: '',
    icon: '🪑',
    sortOrder: 0,
  });

  const { data: areas = [], isLoading } = useQuery({
    queryKey: ['areas'],
    queryFn: areasApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: areasApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAreaDto }) =>
      areasApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: areasApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
    },
  });

  const openModal = (area?: Area) => {
    if (area) {
      setEditingArea(area);
      setFormData({
        name: area.name,
        icon: area.icon || '🪑',
        sortOrder: area.sortOrder,
      });
    } else {
      setEditingArea(null);
      setFormData({ name: '', icon: '🪑', sortOrder: areas.length });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingArea(null);
    setFormData({ name: '', icon: '🪑', sortOrder: 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingArea) {
      updateMutation.mutate({ id: editingArea.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu alanı silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate(id);
    }
  };

  const iconOptions = ['🪑', '☀️', '🌳', '🍺', '🏠', '🌙', '🎉', '🍽️'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-title-2 text-white">Alan/Kat Yönetimi</h2>
        <Button onClick={() => openModal()}>
          <Plus size={18} />
          Yeni Alan
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-white/60">Yükleniyor...</div>
      ) : areas.length === 0 ? (
        <Card variant="elevated" className="text-center py-12">
          <p className="text-body text-white/60">Henüz alan eklenmemiş</p>
          <Button className="mt-4" onClick={() => openModal()}>
            <Plus size={18} />
            İlk Alanı Ekle
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {areas.map((area) => (
            <Card
              key={area.id}
              variant="elevated"
              className="relative group"
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{area.icon || '🪑'}</div>
                <h3 className="text-headline text-white">{area.name}</h3>
                <p className="text-caption text-white/40 mt-1">
                  Sıra: {area.sortOrder}
                </p>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                <Button
                  variant="tinted"
                  size="sm"
                  className="flex-1"
                  onClick={() => openModal(area)}
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="tinted"
                  size="sm"
                  color="red"
                  onClick={() => handleDelete(area.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingArea ? 'Alan Düzenle' : 'Yeni Alan'}
        size="sm"
        footer={
          <>
            <Button variant="bordered" color="gray" onClick={closeModal}>
              İptal
            </Button>
            <Button onClick={handleSubmit}>
              {editingArea ? 'Güncelle' : 'Ekle'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Alan Adı"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Salon, Teras, Bahçe..."
            required
          />
          <div>
            <label className="text-headline text-[#1D1D1F] block mb-2">İkon</label>
            <div className="flex gap-2 flex-wrap">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`
                    w-10 h-10 rounded-lg text-xl flex items-center justify-center
                    transition-all duration-150
                    ${formData.icon === icon
                      ? 'bg-[#0A84FF] ring-2 ring-[#0A84FF]'
                      : 'bg-white/10 hover:bg-white/20'
                    }
                  `}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Sıralama"
            type="number"
            min="0"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
          />
        </form>
      </Modal>
    </div>
  );
}

// Tables Section
function TablesSection() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState<CreateTableDto>({
    name: '',
    capacity: 4,
    sortOrder: 0,
    areaId: '',
  });

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.getAll,
  });

  const { data: areas = [] } = useQuery({
    queryKey: ['areas'],
    queryFn: areasApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: tablesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTableDto }) =>
      tablesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tablesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  const openModal = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        name: table.name,
        capacity: table.capacity,
        sortOrder: table.sortOrder,
        areaId: table.areaId || '',
      });
    } else {
      setEditingTable(null);
      setFormData({
        name: `Masa ${tables.length + 1}`,
        capacity: 4,
        sortOrder: tables.length,
        areaId: areas[0]?.id || '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTable(null);
    setFormData({ name: '', capacity: 4, sortOrder: 0, areaId: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTable) {
      updateMutation.mutate({ id: editingTable.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu masayı silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate(id);
    }
  };

  const getAreaName = (areaId?: string) => {
    if (!areaId) return 'Atanmamış';
    const area = areas.find(a => a.id === areaId);
    return area ? area.name : 'Atanmamış';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-title-2 text-white">Masa Yönetimi</h2>
        <Button onClick={() => openModal()}>
          <Plus size={18} />
          Yeni Masa
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-white/60">Yükleniyor...</div>
      ) : tables.length === 0 ? (
        <Card variant="elevated" className="text-center py-12">
          <p className="text-body text-white/60">Henüz masa eklenmemiş</p>
          <Button className="mt-4" onClick={() => openModal()}>
            <Plus size={18} />
            İlk Masayı Ekle
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tables.map((table) => (
            <Card
              key={table.id}
              variant="elevated"
              className="relative group text-center"
            >
              <h3 className="text-title-2 text-white">{table.name}</h3>
              <p className="text-callout text-white/60 mt-1">
                {table.capacity} kişi
              </p>
              <p className="text-caption text-white/40 mt-1">
                {getAreaName(table.areaId)}
              </p>
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                <Button
                  variant="tinted"
                  size="sm"
                  className="flex-1"
                  onClick={() => openModal(table)}
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="tinted"
                  size="sm"
                  color="red"
                  onClick={() => handleDelete(table.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTable ? 'Masa Düzenle' : 'Yeni Masa'}
        size="sm"
        footer={
          <>
            <Button variant="bordered" color="gray" onClick={closeModal}>
              İptal
            </Button>
            <Button onClick={handleSubmit}>
              {editingTable ? 'Güncelle' : 'Ekle'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Masa Adı"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Kapasite (Kişi)"
            type="number"
            min="1"
            max="20"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 4 })}
          />
          <Select
            label="Alan"
            value={formData.areaId}
            onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
            options={[
              { value: '', label: 'Alan Seçin' },
              ...areas.map(area => ({ value: area.id, label: area.name })),
            ]}
          />
          <Input
            label="Sıralama"
            type="number"
            min="0"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
          />
        </form>
      </Modal>
    </div>
  );
}


// Printers Section
function PrintersSection() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterType | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreatePrinterDto>({
    name: '',
    type: 'kitchen',
    connectionType: 'tcp',
    ipAddress: '',
    port: 9100,
    autoPrint: true,
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

  const openModal = (printer?: PrinterType) => {
    if (printer) {
      setEditingPrinter(printer);
      setFormData({
        name: printer.name,
        type: printer.type,
        connectionType: printer.connectionType,
        ipAddress: printer.ipAddress || '',
        port: printer.port || 9100,
        autoPrint: printer.autoPrint ?? true,
      });
    } else {
      setEditingPrinter(null);
      setFormData({
        name: '',
        type: 'kitchen',
        connectionType: 'tcp',
        ipAddress: '',
        port: 9100,
        autoPrint: true,
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
      autoPrint: true,
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

  const getTypeLabel = (type: PrinterType['type']) => {
    return type === 'kitchen' ? 'Mutfak' : 'Fiş';
  };

  const getTypeColor = (type: PrinterType['type']) => {
    return type === 'kitchen'
      ? 'bg-[#FF9F0A]/20 text-[#FF9F0A]'
      : 'bg-[#5E5CE6]/20 text-[#5E5CE6]';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-title-2 text-white">Yazıcı Ayarları</h2>
        <Button onClick={() => openModal()}>
          <Plus size={18} />
          Yeni Yazıcı
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-white/60">Yükleniyor...</div>
      ) : printers.length === 0 ? (
        <Card variant="elevated" className="text-center py-12">
          <p className="text-body text-white/60">Henüz yazıcı eklenmemiş</p>
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
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Printer className="text-white/60" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-headline text-white">{printer.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-caption ${getTypeColor(printer.type)}`}>
                      {getTypeLabel(printer.type)}
                    </span>
                  </div>
                  <p className="text-callout text-white/60 mt-1">
                    {printer.connectionType === 'tcp'
                      ? `${printer.ipAddress}:${printer.port}`
                      : 'USB Bağlantı'}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className={`
                      inline-flex items-center gap-1 px-2 py-0.5 rounded text-caption
                      ${printer.isActive
                        ? 'bg-[#30D158]/20 text-[#30D158]'
                        : 'bg-white/10 text-white/40'
                      }
                    `}>
                      <span className={`w-1.5 h-1.5 rounded-full ${printer.isActive ? 'bg-[#30D158]' : 'bg-white/40'}`} />
                      {printer.isActive ? 'Aktif' : 'Pasif'}
                    </div>
                    {printer.autoPrint && (
                      <span className="text-caption text-white/40">Otomatik yazdırma açık</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
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

      {/* Template Preview */}
      <Card variant="elevated" className="mt-6">
        <h3 className="text-headline text-white mb-4">Fiş Şablonu Önizleme</h3>
        <div className="bg-white text-black p-4 rounded-lg font-mono text-xs max-w-xs mx-auto">
          <div className="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
            <div className="font-bold">DEMO CAFE</div>
            <div className="text-[10px]">Örnek Mah. Örnek Sok. No:1</div>
            <div className="text-[10px]">Tel: 0212 123 45 67</div>
          </div>
          <div className="text-[10px] mb-2">
            <div>Tarih: 14.01.2026 15:32</div>
            <div>Masa: 3 | Fiş: #1234</div>
          </div>
          <div className="border-t border-dashed border-gray-400 pt-2 mb-2">
            <div className="flex justify-between">
              <span>2x Latte</span>
              <span>₺120</span>
            </div>
            <div className="flex justify-between">
              <span>1x Cheesecake</span>
              <span>₺85</span>
            </div>
          </div>
          <div className="border-t border-dashed border-gray-400 pt-2 font-bold">
            <div className="flex justify-between">
              <span>TOPLAM</span>
              <span>₺205</span>
            </div>
          </div>
          <div className="text-center text-[10px] mt-2 pt-2 border-t border-dashed border-gray-400">
            Teşekkür ederiz!
          </div>
        </div>
      </Card>

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
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoPrint"
              checked={formData.autoPrint}
              onChange={(e) => setFormData({ ...formData, autoPrint: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-[#0A84FF] focus:ring-[#0A84FF]"
            />
            <label htmlFor="autoPrint" className="text-body text-[#1D1D1F]">
              Otomatik yazdırma
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Lock Screen Settings Section
function LockScreenSection() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings', 'lockScreen'],
    queryFn: settingsApi.getLockScreen,
  });

  const [formData, setFormData] = useState<LockScreenSettings>({
    timeoutMinutes: 10,
    pinLength: 4,
    autoLockEnabled: true,
  });

  // Update form when data loads
  useState(() => {
    if (settings) {
      setFormData(settings);
    }
  });

  const updateMutation = useMutation({
    mutationFn: settingsApi.updateLockScreen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'lockScreen'] });
      alert('Ayarlar kaydedildi!');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="text-center py-12 text-white/60">Yükleniyor...</div>;
  }

  return (
    <Card variant="elevated" className="max-w-xl">
      <h2 className="text-title-2 text-white mb-6">Kilit Ekranı Ayarları</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h3 className="text-headline text-white">Otomatik Kilit</h3>
            <p className="text-callout text-white/60 mt-1">
              Belirli süre hareketsizlik sonrası ekranı kilitle
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.autoLockEnabled}
              onChange={(e) => setFormData({ ...formData, autoLockEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#30D158]"></div>
          </label>
        </div>

        <Select
          label="Kilit Süresi"
          value={formData.timeoutMinutes.toString()}
          onChange={(e) => setFormData({ ...formData, timeoutMinutes: parseInt(e.target.value) })}
          options={[
            { value: '5', label: '5 dakika' },
            { value: '10', label: '10 dakika' },
            { value: '15', label: '15 dakika' },
            { value: '30', label: '30 dakika' },
            { value: '60', label: '1 saat' },
          ]}
        />

        <Select
          label="PIN Uzunluğu"
          value={formData.pinLength.toString()}
          onChange={(e) => setFormData({ ...formData, pinLength: parseInt(e.target.value) })}
          options={[
            { value: '4', label: '4 haneli' },
            { value: '5', label: '5 haneli' },
            { value: '6', label: '6 haneli' },
          ]}
        />

        <div className="p-4 bg-[#FF9F0A]/10 rounded-lg border border-[#FF9F0A]/20">
          <div className="flex items-start gap-3">
            <Lock className="text-[#FF9F0A] mt-0.5" size={18} />
            <div>
              <h4 className="text-headline text-[#FF9F0A]">Güvenlik Notu</h4>
              <p className="text-callout text-white/60 mt-1">
                PIN değişikliği için kullanıcı yönetimi bölümünden ilgili kullanıcının PIN'ini güncelleyebilirsiniz.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10">
          <Button type="submit" disabled={updateMutation.isPending}>
            <Save size={18} />
            {updateMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
