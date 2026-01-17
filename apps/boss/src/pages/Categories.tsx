import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  GripVertical, 
  Check, 
  X,
  Package,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Button, Card, Input, Modal } from '@/components/ui';
import { categoriesApi } from '@/services/api';
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/services/api';

export default function Categories() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [draggedItem, setDraggedItem] = useState<Category | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateCategoryDto & { isActive?: boolean }>({
    name: '',
    sortOrder: 0,
    isActive: true,
  });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  // Sort categories by sortOrder
  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        sortOrder: categories.length,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', sortOrder: 0, isActive: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu kategoriyi silmek istediğinize emin misiniz? Kategoriye ait ürünler etkilenebilir.')) {
      deleteMutation.mutate(id);
    }
  };

  const toggleCategoryStatus = async (category: Category) => {
    await categoriesApi.update(category.id, { isActive: !category.isActive });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  // Drag and Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, category: Category) => {
    setDraggedItem(category);
    e.dataTransfer.effectAllowed = 'move';
    // Add a slight delay to show the drag effect
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = '0.5';
    }, 0);
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
    setDraggedItem(null);
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    const draggedIndex = sortedCategories.findIndex(c => c.id === draggedItem.id);
    if (draggedIndex === targetIndex) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    // Create new order
    const newCategories = [...sortedCategories];
    newCategories.splice(draggedIndex, 1);
    newCategories.splice(targetIndex, 0, draggedItem);

    // Update sort orders
    const updates = newCategories.map((cat, index) => ({
      id: cat.id,
      sortOrder: index,
    }));

    // Update each category's sort order
    for (const update of updates) {
      if (update.sortOrder !== sortedCategories.find(c => c.id === update.id)?.sortOrder) {
        await categoriesApi.update(update.id, { sortOrder: update.sortOrder });
      }
    }

    queryClient.invalidateQueries({ queryKey: ['categories'] });
    setDraggedItem(null);
    setDragOverIndex(null);
  }, [draggedItem, sortedCategories, queryClient]);

  // Move category up/down with buttons
  const moveCategory = async (category: Category, direction: 'up' | 'down') => {
    const currentIndex = sortedCategories.findIndex(c => c.id === category.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= sortedCategories.length) return;

    const otherCategory = sortedCategories[newIndex];
    
    // Swap sort orders
    await categoriesApi.update(category.id, { sortOrder: otherCategory.sortOrder });
    await categoriesApi.update(otherCategory.id, { sortOrder: category.sortOrder });
    
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-large-title text-white">Kategoriler</h1>
          <p className="text-body text-white/60 mt-1">
            Ürün kategorileri yönetimi • Sürükle-bırak ile sıralayın
          </p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus size={18} />
          Yeni Kategori
        </Button>
      </div>

      {/* Categories List */}
      {isLoading ? (
        <div className="text-center py-12 text-white/60">Yükleniyor...</div>
      ) : categories.length === 0 ? (
        <Card variant="elevated" className="text-center py-12">
          <Package className="mx-auto text-white/20 mb-4" size={48} />
          <p className="text-body text-white/60">Henüz kategori eklenmemiş</p>
          <p className="text-footnote text-white/40 mt-1">Ürünleri organize etmek için kategoriler oluşturun</p>
          <Button className="mt-4" onClick={() => openModal()}>
            <Plus size={18} />
            İlk Kategoriyi Ekle
          </Button>
        </Card>
      ) : (
        <Card variant="elevated" padding="none">
          <div className="divide-y divide-white/5">
            {sortedCategories.map((category, index) => (
              <div
                key={category.id}
                draggable
                onDragStart={(e) => handleDragStart(e, category)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className={`
                  flex items-center gap-4 px-4 py-3 
                  hover:bg-white/5 transition-all cursor-grab active:cursor-grabbing
                  ${dragOverIndex === index ? 'bg-[#0A84FF]/10 border-t-2 border-[#0A84FF]' : ''}
                  ${draggedItem?.id === category.id ? 'opacity-50' : ''}
                `}
              >
                {/* Drag Handle */}
                <div className="flex flex-col items-center gap-0.5">
                  <GripVertical className="text-white/30 hover:text-white/60 transition-colors" size={18} />
                </div>

                {/* Order Buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveCategory(category, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronUp size={14} className="text-white/60" />
                  </button>
                  <button
                    onClick={() => moveCategory(category, 'down')}
                    disabled={index === sortedCategories.length - 1}
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronDown size={14} className="text-white/60" />
                  </button>
                </div>

                {/* Sort Order Badge */}
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-caption text-white/60">
                  {index + 1}
                </div>
                
                {/* Category Info */}
                <div className="flex-1">
                  <h3 className="text-headline text-white">
                    {category.name}
                  </h3>
                  <p className="text-footnote text-white/40">
                    Sıra: {category.sortOrder}
                  </p>
                </div>

                {/* Status Toggle */}
                <button
                  onClick={() => toggleCategoryStatus(category)}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-caption transition-all
                    ${category.isActive
                      ? 'bg-[#30D158]/20 text-[#30D158] hover:bg-[#30D158]/30'
                      : 'bg-white/10 text-white/50 hover:bg-white/20'
                    }
                  `}
                >
                  {category.isActive ? <Check size={12} /> : <X size={12} />}
                  {category.isActive ? 'Aktif' : 'Pasif'}
                </button>

                {/* Actions */}
                <div className="flex gap-1">
                  <Button
                    variant="plain"
                    size="sm"
                    onClick={() => openModal(category)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="plain"
                    size="sm"
                    color="red"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card variant="bordered" padding="md" className="bg-[#0A84FF]/5 border-[#0A84FF]/20">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#0A84FF]/20 rounded-lg">
            <GripVertical className="text-[#0A84FF]" size={18} />
          </div>
          <div>
            <p className="text-headline text-white">Sıralama İpucu</p>
            <p className="text-footnote text-white/60 mt-1">
              Kategorileri sürükle-bırak ile veya ok butonlarıyla sıralayabilirsiniz. 
              Sıralama, POS ve menü ekranlarında görüntülenme sırasını belirler.
            </p>
          </div>
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
        size="sm"
        footer={
          <>
            <Button variant="bordered" color="gray" onClick={closeModal}>
              İptal
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Kaydediliyor...' : editingCategory ? 'Güncelle' : 'Ekle'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Kategori Adı"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Örn: Kahveler"
            required
          />
          
          <Input
            label="Sıralama"
            type="number"
            min="0"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
            hint="Düşük değerler önce görüntülenir"
          />

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 bg-[#F2F2F7] rounded-xl">
            <div>
              <p className="text-headline text-[#1D1D1F]">Aktif Durum</p>
              <p className="text-footnote text-[#86868B]">Pasif kategoriler menüde görünmez</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`relative w-12 h-7 rounded-full transition-colors ${formData.isActive ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'}`}
            >
              <span 
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${formData.isActive ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
