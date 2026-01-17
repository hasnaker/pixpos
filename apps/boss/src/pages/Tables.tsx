import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { Button, Card, Input, Modal } from '@/components/ui';
import { tablesApi } from '@/services/api';
import type { Table, CreateTableDto, UpdateTableDto } from '@/services/api';

export default function Tables() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState<CreateTableDto>({
    name: '',
    capacity: 4,
    sortOrder: 0,
  });

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.getAll,
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
      });
    } else {
      setEditingTable(null);
      setFormData({
        name: `Masa ${tables.length + 1}`,
        capacity: 4,
        sortOrder: tables.length,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTable(null);
    setFormData({ name: '', capacity: 4, sortOrder: 0 });
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

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'empty':
        return 'bg-[#34C759]';
      case 'occupied':
        return 'bg-[#FF9500]';
      case 'paying':
        return 'bg-[#007AFF]';
      default:
        return 'bg-[#8E8E93]';
    }
  };

  const getStatusText = (status: Table['status']) => {
    switch (status) {
      case 'empty':
        return 'Boş';
      case 'occupied':
        return 'Dolu';
      case 'paying':
        return 'Ödeme';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-large-title text-[#1D1D1F]">Masalar</h1>
          <p className="text-body text-[#86868B] mt-1">
            Masa düzeni ve yönetimi
          </p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus size={18} />
          Yeni Masa
        </Button>
      </div>

      {/* Tables Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-[#86868B]">Yükleniyor...</div>
      ) : tables.length === 0 ? (
        <Card variant="elevated" className="text-center py-12">
          <p className="text-body text-[#86868B]">Henüz masa eklenmemiş</p>
          <Button className="mt-4" onClick={() => openModal()}>
            <Plus size={18} />
            İlk Masayı Ekle
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {tables.map((table) => (
            <Card
              key={table.id}
              variant="elevated"
              className="relative group cursor-pointer hover:scale-[1.02] transition-transform"
            >
              {/* Status indicator */}
              <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${getStatusColor(table.status)}`} />

              <div className="text-center">
                <h3 className="text-title-2 text-[#1D1D1F]">{table.name}</h3>
                <div className="flex items-center justify-center gap-1 mt-2 text-[#86868B]">
                  <Users size={14} />
                  <span className="text-callout">{table.capacity} kişi</span>
                </div>
                <p className="text-caption text-[#86868B] mt-2">
                  {getStatusText(table.status)}
                </p>
              </div>

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  variant="filled"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(table);
                  }}
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="filled"
                  size="sm"
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(table.id);
                  }}
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
