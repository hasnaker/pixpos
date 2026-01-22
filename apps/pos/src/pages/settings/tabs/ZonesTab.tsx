import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Layers, LayoutGrid, Trees, Umbrella, Building, Coffee, Sofa } from 'lucide-react';
import { zonesApi } from '@/services/api';
import type { Zone } from '@/services/api';

const ICON_OPTIONS = [
  { value: 'LayoutGrid', label: 'Salon', icon: LayoutGrid },
  { value: 'Trees', label: 'Bahçe', icon: Trees },
  { value: 'Umbrella', label: 'Teras', icon: Umbrella },
  { value: 'Building', label: 'Bina', icon: Building },
  { value: 'Coffee', label: 'Kafe', icon: Coffee },
  { value: 'Sofa', label: 'Lounge', icon: Sofa },
  { value: 'Layers', label: 'Kat', icon: Layers },
];

const getIconComponent = (iconName: string | undefined) => {
  const found = ICON_OPTIONS.find(i => i.value === iconName);
  return found ? found.icon : LayoutGrid;
};

// Auto-generate prefix from name
const generatePrefix = (name: string): string => {
  return name.substring(0, 2).toUpperCase();
};

export default function ZonesTab() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [form, setForm] = useState({ name: '', prefix: '', icon: 'LayoutGrid', floor: 1 });

  const { data: zones = [], isLoading } = useQuery({
    queryKey: ['zones'],
    queryFn: zonesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: zonesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => zonesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: zonesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zones'] }),
  });

  const seedMutation = useMutation({
    mutationFn: zonesApi.seed,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zones'] }),
  });

  const closeModal = () => {
    setShowModal(false);
    setEditingZone(null);
    setForm({ name: '', prefix: '', icon: 'LayoutGrid', floor: 1 });
  };

  const openEdit = (zone: Zone) => {
    setEditingZone(zone);
    setForm({ name: zone.name, prefix: zone.prefix || generatePrefix(zone.name), icon: zone.icon || 'LayoutGrid', floor: zone.floor });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const data = {
      ...form,
      prefix: form.prefix.trim() || generatePrefix(form.name),
    };
    if (editingZone) {
      updateMutation.mutate({ id: editingZone.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Auto-update prefix when name changes (only if prefix is empty or matches old auto-generated)
  const handleNameChange = (newName: string) => {
    const oldAutoPrefix = generatePrefix(form.name);
    const shouldAutoUpdate = !form.prefix || form.prefix === oldAutoPrefix;
    setForm({
      ...form,
      name: newName,
      prefix: shouldAutoUpdate ? generatePrefix(newName) : form.prefix,
    });
  };

  // Katları grupla
  const floors = [...new Set(zones.map(z => z.floor))].sort((a, b) => a - b);
  const zonesByFloor = floors.map(floor => ({
    floor,
    zones: zones.filter(z => z.floor === floor),
  }));

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#0A84FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
            {zones.length} bölge, {floors.length} kat
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {zones.length === 0 && (
            <button
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              style={{
                padding: '10px 16px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              Varsayılanları Ekle
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '10px 16px', borderRadius: '10px',
              background: '#FF9F0A', border: 'none',
              color: '#000', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <Plus size={16} /> Bölge Ekle
          </button>
        </div>
      </div>

      {/* Zones by Floor */}
      {zones.length === 0 ? (
        <div style={{
          padding: '60px', textAlign: 'center',
          background: 'rgba(255,255,255,0.02)', borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <Layers size={48} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '16px' }} />
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
            Henüz bölge eklenmemiş
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
            Bölgeler masaları gruplamak için kullanılır (Salon, Bahçe, Teras vb.)
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {zonesByFloor.map(({ floor, zones: floorZones }) => (
            <div key={floor}>
              {/* Floor Header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginBottom: '12px', paddingBottom: '8px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <Building size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {floor}. Kat
                </span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                  ({floorZones.length} bölge)
                </span>
              </div>

              {/* Zones Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {floorZones.map(zone => {
                  const IconComponent = getIconComponent(zone.icon);
                  return (
                    <div
                      key={zone.id}
                      style={{
                        padding: '16px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', gap: '12px',
                      }}
                    >
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'rgba(255,159,10,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <IconComponent size={20} style={{ color: '#FF9F0A' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{zone.name}</p>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                          {zone.prefix || generatePrefix(zone.name)} • {floor}. Kat
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => openEdit(zone)}
                          style={{
                            padding: '6px', borderRadius: '6px',
                            background: 'rgba(10,132,255,0.1)', border: 'none',
                            color: '#0A84FF', cursor: 'pointer',
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`"${zone.name}" bölgesini silmek istediğinize emin misiniz?`)) {
                              deleteMutation.mutate(zone.id);
                            }
                          }}
                          style={{
                            padding: '6px', borderRadius: '6px',
                            background: 'rgba(255,69,58,0.1)', border: 'none',
                            color: '#FF453A', cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={closeModal}>
          <div style={{
            width: '400px', background: 'rgba(28,28,30,0.98)', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)', padding: '24px',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>
                {editingZone ? 'Bölge Düzenle' : 'Yeni Bölge'}
              </h3>
              <button onClick={closeModal} style={{ padding: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Name */}
              <div>
                <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Bölge Adı</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Örn: Salon, Bahçe, Teras"
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '15px', outline: 'none',
                  }}
                />
              </div>

              {/* Prefix */}
              <div>
                <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>
                  Kısa Kod (Masa Adlarında Kullanılır)
                </label>
                <input
                  type="text"
                  value={form.prefix}
                  onChange={e => setForm({ ...form, prefix: e.target.value.toUpperCase().slice(0, 5) })}
                  placeholder="Örn: SL, BH, TR"
                  maxLength={5}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '15px', outline: 'none', textTransform: 'uppercase',
                  }}
                />
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>
                  Masalar "{form.prefix || 'XX'}-01, {form.prefix || 'XX'}-02..." şeklinde adlandırılır
                </p>
              </div>

              {/* Floor */}
              <div>
                <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Kat</label>
                <select
                  value={form.floor}
                  onChange={e => setForm({ ...form, floor: parseInt(e.target.value) })}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '15px', cursor: 'pointer',
                  }}
                >
                  {[1, 2, 3, 4, 5].map(f => (
                    <option key={f} value={f}>{f}. Kat</option>
                  ))}
                </select>
              </div>

              {/* Icon */}
              <div>
                <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>İkon</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {ICON_OPTIONS.map(opt => {
                    const Icon = opt.icon;
                    const isSelected = form.icon === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setForm({ ...form, icon: opt.value })}
                        style={{
                          padding: '12px', borderRadius: '10px',
                          background: isSelected ? 'rgba(255,159,10,0.2)' : 'rgba(255,255,255,0.05)',
                          border: isSelected ? '2px solid #FF9F0A' : '1px solid rgba(255,255,255,0.1)',
                          color: isSelected ? '#FF9F0A' : 'rgba(255,255,255,0.6)',
                          cursor: 'pointer', display: 'flex', flexDirection: 'column',
                          alignItems: 'center', gap: '4px',
                        }}
                      >
                        <Icon size={20} />
                        <span style={{ fontSize: '10px' }}>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!form.name.trim() || createMutation.isPending || updateMutation.isPending}
                style={{
                  padding: '16px', borderRadius: '12px', background: '#FF9F0A',
                  border: 'none', color: '#000', fontSize: '15px', fontWeight: 600,
                  cursor: 'pointer', opacity: !form.name.trim() ? 0.5 : 1,
                  marginTop: '8px',
                }}
              >
                {editingZone ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
