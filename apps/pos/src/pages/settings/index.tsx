import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useSettings } from '@/contexts';
import { tablesApi, printersApi } from '@/services/api';

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && 
  typeof (window as any).electronAPI !== 'undefined' && 
  (window as any).electronAPI?.isElectron === true;

// Get API URL
const API_URL = isElectron 
  ? 'https://api.pixpos.cloud/api'
  : (import.meta.env.VITE_API_URL || '/api');

// Local imports
import { TABS, type User } from './types';
import { useSettingsStorage } from './hooks';
import { BusinessTab, UsersTab, ZonesTab, TablesTab, MenuTab, PrintersTab, OkcTab, DevicesTab, ReceiptTab, SecurityTab, SystemTab } from './tabs';
import { CloseAllModal, TableModal, PrinterModal, UserModal } from './modals';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { settings, updateAutoLockTimeout } = useSettings();

  // Settings storage hook
  const {
    business, setBusiness,
    receipt, setReceipt,
    devices, setDevices,
    users, usersLoading, usersError,
    saveStatus,
    addUser, updateUser, deleteUser, toggleUserActive,
  } = useSettingsStorage();

  // UI State
  const [activeTab, setActiveTab] = useState('business');
  const [showCloseAllModal, setShowCloseAllModal] = useState(false);
  const [closeResult, setCloseResult] = useState<{ closedCount: number; message: string } | null>(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPrinter, setNewPrinter] = useState<{ name: string; ip: string; port: string; type: 'receipt' | 'kitchen' }>({ name: '', ip: '', port: '9100', type: 'receipt' });
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({ name: '', role: 'waiter', pin: '', active: true });

  // API Queries
  const { data: tables = [] } = useQuery({ queryKey: ['tables'], queryFn: tablesApi.getAll });
  const { data: printers = [] } = useQuery({ queryKey: ['printers'], queryFn: printersApi.getAll });

  // Mutations
  const closeAllMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_URL}/orders/close-all`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed');
      return response.json();
    },
    onSuccess: (result) => {
      setCloseResult(result);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  const createTableMutation = useMutation({
    mutationFn: (data: { name: string; zone: string; capacity: number }) => 
      tablesApi.create({ name: data.name, zone: data.zone, capacity: data.capacity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setShowTableModal(false);
    },
  });

  const bulkCreateTablesMutation = useMutation({
    mutationFn: async (tables: Array<{ name: string; zone: string; capacity: number }>) => {
      // Create tables sequentially to avoid race conditions
      for (const table of tables) {
        await tablesApi.create({ name: table.name, zone: table.zone, capacity: table.capacity });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setShowTableModal(false);
    },
  });

  const deleteTableMutation = useMutation({
    mutationFn: tablesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tables'] }),
    onError: () => queryClient.invalidateQueries({ queryKey: ['tables'] }),
    retry: false,
  });

  const bulkDeleteTablesMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        try {
          await tablesApi.delete(id);
        } catch (e) {
          // Ignore errors for individual deletes
          console.log('Delete failed for', id);
        }
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tables'] }),
    onError: () => queryClient.invalidateQueries({ queryKey: ['tables'] }),
    retry: false,
  });

  const updateTableMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { zone?: string; sortOrder?: number } }) => 
      tablesApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tables'] }),
  });

  const createPrinterMutation = useMutation({
    mutationFn: (data: typeof newPrinter) => printersApi.create({
      name: data.name, type: data.type, connectionType: 'tcp',
      ipAddress: data.ip, port: parseInt(data.port), isActive: true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printers'] });
      setShowPrinterModal(false);
      setNewPrinter({ name: '', ip: '', port: '9100', type: 'receipt' });
    },
  });

  const deletePrinterMutation = useMutation({
    mutationFn: printersApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['printers'] }),
  });

  const testPrinterMutation = useMutation({ mutationFn: printersApi.test });

  // User handlers
  const handleAddUser = () => {
    addUser(newUser);
    setNewUser({ name: '', role: 'waiter', pin: '', active: true });
    setShowUserModal(false);
  };

  const handleUpdateUser = () => {
    if (editingUser) {
      updateUser(editingUser);
      setEditingUser(null);
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'business':
        return <BusinessTab business={business} setBusiness={setBusiness} />;
      case 'users':
        return (
          <UsersTab
            users={users}
            isLoading={usersLoading}
            error={usersError}
            onAdd={() => setShowUserModal(true)}
            onEdit={setEditingUser}
            onDelete={deleteUser}
            onToggleActive={toggleUserActive}
          />
        );
      case 'zones':
        return <ZonesTab />;
      case 'tables':
        return (
          <TablesTab
            tables={tables}
            onAdd={() => setShowTableModal(true)}
            onDelete={(id) => deleteTableMutation.mutate(id)}
            onBulkDelete={(ids) => bulkDeleteTablesMutation.mutate(ids)}
            onUpdateZone={(tableId, newZone) => updateTableMutation.mutate({ id: tableId, data: { zone: newZone } })}
            onReorder={(tableId, sortOrder) => updateTableMutation.mutate({ id: tableId, data: { sortOrder } })}
          />
        );
      case 'menu':
        return <MenuTab />;
      case 'printers':
        return (
          <PrintersTab
            printers={printers}
            onAdd={() => setShowPrinterModal(true)}
            onDelete={(id) => deletePrinterMutation.mutate(id)}
            onTest={(id) => testPrinterMutation.mutate(id)}
          />
        );
      case 'okc':
        return <OkcTab />;
      case 'devices':
        return <DevicesTab devices={devices} setDevices={setDevices} />;
      case 'receipt':
        return <ReceiptTab receipt={receipt} setReceipt={setReceipt} business={business} />;
      case 'security':
        return <SecurityTab autoLockTimeout={settings.autoLockTimeout} onUpdateTimeout={updateAutoLockTimeout} />;
      case 'system':
        return <SystemTab onCloseAll={() => setShowCloseAllModal(true)} />;
      default:
        return null;
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'business': return 'İşletme bilgilerini ve logosunu düzenleyin';
      case 'users': return 'Kullanıcıları ve yetkilerini yönetin';
      case 'zones': return 'Bölgeleri ve katları yönetin';
      case 'tables': return 'Masa düzenini ayarlayın';
      case 'menu': return 'Ürünleri ve kategorileri yönetin, Excel ile içe/dışa aktarın';
      case 'printers': return 'Yazıcıları ekleyin ve test edin';
      case 'okc': return 'Ingenico ÖKC cihazını yapılandırın';
      case 'devices': return 'Bağlı cihazları açıp kapatın';
      case 'receipt': return 'Fiş görünümünü özelleştirin';
      case 'security': return 'Güvenlik ayarlarını yapılandırın';
      case 'system': return 'Sistem işlemleri ve bilgileri';
      default: return '';
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0A' }}>
      {/* Sidebar - Apple Style */}
      <aside style={{
        width: '260px', 
        background: 'linear-gradient(180deg, #1C1C1E 0%, #141414 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', 
        position: 'fixed', left: 0, top: 0, height: '100vh',
      }}>
        {/* Header with Back Button */}
        <div style={{ 
          padding: '20px 16px', 
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <button onClick={() => navigate('/tables')} style={{
            display: 'flex', alignItems: 'center', gap: '6px', 
            padding: '0', background: 'transparent', border: 'none',
            color: '#0A84FF', fontSize: '15px', cursor: 'pointer',
            fontWeight: 400,
          }}>
            <ArrowLeft size={18} strokeWidth={2} />
            <span>Geri</span>
          </button>
          <h2 style={{ 
            fontSize: '22px', fontWeight: 700, color: '#fff', 
            marginTop: '16px', letterSpacing: '-0.3px',
          }}>
            Ayarlar
          </h2>
        </div>

        {/* Tab List - Apple Settings Style */}
        <div style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                style={{
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '10px 12px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  cursor: 'pointer',
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  marginBottom: '2px',
                  transition: 'background 0.15s ease',
                }}
              >
                {/* Icon with gradient background */}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  background: tab.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 2px 8px ${tab.color}40`,
                }}>
                  <Icon size={16} strokeWidth={2} style={{ color: '#fff' }} />
                </div>
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: isActive ? 500 : 400, 
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.85)',
                  letterSpacing: '-0.1px',
                }}>
                  {tab.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Save Status - Minimal */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            {saveStatus === 'saved' && (
              <>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#30D158' }} />
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Kaydedildi</span>
              </>
            )}
            {saveStatus === 'saving' && (
              <>
                <RefreshCw size={12} style={{ color: '#FF9F0A', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Kaydediliyor...</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF453A' }} />
                <span style={{ fontSize: '12px', color: '#FF453A' }}>Hata</span>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ 
        flex: 1, marginLeft: '260px', padding: '32px 40px', 
        height: '100vh', overflowY: 'auto',
        background: '#0A0A0A',
      }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ 
            fontSize: '32px', fontWeight: 700, color: '#fff', 
            marginBottom: '6px', letterSpacing: '-0.5px',
          }}>
            {TABS.find(t => t.id === activeTab)?.name}
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>
            {getTabDescription()}
          </p>
        </div>
        {renderContent()}
      </main>

      {/* Modals */}
      <CloseAllModal
        isOpen={showCloseAllModal}
        onClose={() => { setShowCloseAllModal(false); setCloseResult(null); }}
        onConfirm={() => closeAllMutation.mutate()}
        isPending={closeAllMutation.isPending}
        result={closeResult}
      />

      <TableModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onSubmit={(name, zone, capacity) => createTableMutation.mutate({ name, zone, capacity })}
        onBulkSubmit={(tables) => bulkCreateTablesMutation.mutate(tables)}
        isPending={createTableMutation.isPending || bulkCreateTablesMutation.isPending}
        existingTables={tables}
      />

      <PrinterModal
        isOpen={showPrinterModal}
        onClose={() => setShowPrinterModal(false)}
        onSubmit={(data) => createPrinterMutation.mutate(data)}
        isPending={createPrinterMutation.isPending}
        data={newPrinter}
        setData={setNewPrinter}
      />

      <UserModal
        isOpen={showUserModal || !!editingUser}
        onClose={() => { setShowUserModal(false); setEditingUser(null); }}
        onSubmit={editingUser ? handleUpdateUser : handleAddUser}
        user={editingUser || newUser}
        setUser={editingUser ? setEditingUser : setNewUser}
        isEditing={!!editingUser}
      />
    </div>
  );
}
