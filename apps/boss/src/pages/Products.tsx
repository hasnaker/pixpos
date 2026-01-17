import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Image, 
  Search, 
  Filter, 
  LayoutGrid, 
  List,
  Upload,
  X,
  Check,
  ChevronDown
} from 'lucide-react';
import { Button, Card, Input, Select, Modal } from '@/components/ui';
import {
  categoriesApi,
  productsApi,
} from '@/services/api';
import type {
  Product,
  Category,
  CreateProductDto,
  UpdateProductDto,
} from '@/services/api';

type ViewMode = 'grid' | 'table';

export default function Products() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateProductDto & { 
    barcode?: string; 
    taxRate?: number;
    isActive?: boolean;
  }>({
    categoryId: '',
    name: '',
    price: 0,
    description: '',
    barcode: '',
    taxRate: 10,
    isActive: true,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  // Filtered and searched products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter;
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && product.isActive) ||
        (statusFilter === 'inactive' && !product.isActive);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: async (newProduct) => {
      // Upload image if selected
      if (imageFile) {
        await productsApi.uploadImage(newProduct.id, imageFile);
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      productsApi.update(id, data),
    onSuccess: async (updatedProduct) => {
      // Upload image if selected
      if (imageFile) {
        await productsApi.uploadImage(updatedProduct.id, imageFile);
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        categoryId: product.categoryId,
        name: product.name,
        price: product.price,
        description: product.description || '',
        isActive: product.isActive,
        taxRate: 10,
        barcode: '',
      });
      setImagePreview(product.imageUrl || null);
    } else {
      setEditingProduct(null);
      setFormData({
        categoryId: categories[0]?.id || '',
        name: '',
        price: 0,
        description: '',
        isActive: true,
        taxRate: 10,
        barcode: '',
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ 
      categoryId: '', 
      name: '', 
      price: 0, 
      description: '',
      isActive: true,
      taxRate: 10,
      barcode: '',
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: CreateProductDto = {
      categoryId: formData.categoryId,
      name: formData.name,
      price: formData.price,
      description: formData.description,
      isActive: formData.isActive,
    };
    
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate(id);
    }
  };

  const toggleProductStatus = async (product: Product) => {
    await productsApi.update(product.id, { isActive: !product.isActive });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || '-';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-large-title text-white">Ürünler</h1>
          <p className="text-body text-white/60 mt-1">
            {filteredProducts.length} ürün listeleniyor
          </p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus size={18} />
          Yeni Ürün
        </Button>
      </div>

      {/* Filters & Search */}
      <Card variant="elevated" padding="md">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF]/50 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="relative min-w-[160px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-white appearance-none focus:outline-none focus:border-[#0A84FF] cursor-pointer"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={16} />
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white appearance-none focus:outline-none focus:border-[#0A84FF] cursor-pointer"
            >
              <option value="all">Tüm Durum</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={16} />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-[#0A84FF] text-white' : 'text-white/60 hover:text-white'}`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-[#0A84FF] text-white' : 'text-white/60 hover:text-white'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </Card>

      {/* Products Display */}
      {isLoading ? (
        <div className="text-center py-12 text-white/60">Yükleniyor...</div>
      ) : filteredProducts.length === 0 ? (
        <Card variant="elevated" className="text-center py-12">
          <p className="text-body text-white/60">
            {products.length === 0 ? 'Henüz ürün eklenmemiş' : 'Arama kriterlerine uygun ürün bulunamadı'}
          </p>
          {products.length === 0 && (
            <Button className="mt-4" onClick={() => openModal()}>
              <Plus size={18} />
              İlk Ürünü Ekle
            </Button>
          )}
        </Card>
      ) : viewMode === 'table' ? (
        <ProductTable 
          products={filteredProducts}
          categories={categories}
          onEdit={openModal}
          onDelete={handleDelete}
          onToggleStatus={toggleProductStatus}
          formatCurrency={formatCurrency}
          getCategoryName={getCategoryName}
        />
      ) : (
        <ProductGrid 
          products={filteredProducts}
          onEdit={openModal}
          onDelete={handleDelete}
          formatCurrency={formatCurrency}
          getCategoryName={getCategoryName}
        />
      )}

      {/* Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün'}
        size="lg"
        footer={
          <>
            <Button variant="bordered" color="gray" onClick={closeModal}>
              İptal
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Kaydediliyor...' : editingProduct ? 'Güncelle' : 'Ekle'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image Upload */}
          <div>
            <label className="text-headline text-[#1D1D1F] block mb-2">Ürün Görseli</label>
            <div className="flex items-start gap-4">
              <div className="w-32 h-32 bg-[#F2F2F7] rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-[#D1D1D6]">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Image className="text-[#C7C7CC]" size={40} />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#007AFF]/10 text-[#007AFF] rounded-lg hover:bg-[#007AFF]/20 transition-colors text-sm font-medium">
                    <Upload size={16} />
                    Görsel Yükle
                  </span>
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF3B30]/10 text-[#FF3B30] rounded-lg hover:bg-[#FF3B30]/20 transition-colors text-sm font-medium"
                  >
                    <X size={16} />
                    Görseli Kaldır
                  </button>
                )}
                <p className="text-footnote text-[#86868B]">PNG, JPG, WEBP (max 5MB)</p>
              </div>
            </div>
          </div>

          {/* Name */}
          <Input
            label="Ürün Adı"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Örn: Latte"
            required
          />

          {/* Category */}
          <Select
            label="Kategori"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            required
          />

          {/* Price & Tax Rate */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fiyat (TL)"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              required
            />
            <Select
              label="KDV Oranı"
              value={String(formData.taxRate)}
              onChange={(e) => setFormData({ ...formData, taxRate: parseInt(e.target.value) })}
              options={[
                { value: '0', label: '%0' },
                { value: '1', label: '%1' },
                { value: '8', label: '%8' },
                { value: '10', label: '%10' },
                { value: '18', label: '%18' },
                { value: '20', label: '%20' },
              ]}
            />
          </div>

          {/* Barcode (Optional) */}
          <Input
            label="Barkod (Opsiyonel)"
            value={formData.barcode}
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            placeholder="Örn: 8690123456789"
            hint="Barkod okuyucu ile hızlı satış için"
          />

          {/* Description */}
          <div>
            <label className="text-headline text-[#1D1D1F] block mb-1.5">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ürün açıklaması..."
              rows={3}
              className="w-full px-3 py-2 text-body bg-white/80 backdrop-blur-sm border border-[#D1D1D6] rounded-lg placeholder:text-[#AEAEB2] focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 transition-all resize-none"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 bg-[#F2F2F7] rounded-xl">
            <div>
              <p className="text-headline text-[#1D1D1F]">Aktif Durum</p>
              <p className="text-footnote text-[#86868B]">Pasif ürünler satışta görünmez</p>
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

// Product Table Component
interface ProductTableProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (product: Product) => void;
  formatCurrency: (value: number) => string;
  getCategoryName: (categoryId: string) => string;
}

function ProductTable({ 
  products, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  formatCurrency, 
  getCategoryName 
}: ProductTableProps) {
  return (
    <Card variant="elevated" padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-caption text-white/60 font-medium">ÜRÜN</th>
              <th className="text-left px-4 py-3 text-caption text-white/60 font-medium">KATEGORİ</th>
              <th className="text-right px-4 py-3 text-caption text-white/60 font-medium">FİYAT</th>
              <th className="text-center px-4 py-3 text-caption text-white/60 font-medium">DURUM</th>
              <th className="text-right px-4 py-3 text-caption text-white/60 font-medium">İŞLEMLER</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr 
                key={product.id} 
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Image className="text-white/30" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="text-headline text-white">{product.name}</p>
                      {product.description && (
                        <p className="text-footnote text-white/50 line-clamp-1">{product.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-white/10 rounded-md text-callout text-white/80">
                    {getCategoryName(product.categoryId)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-title-2 text-[#30D158]">{formatCurrency(product.price)}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onToggleStatus(product)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption transition-colors ${
                      product.isActive 
                        ? 'bg-[#30D158]/20 text-[#30D158]' 
                        : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {product.isActive ? <Check size={12} /> : null}
                    {product.isActive ? 'Aktif' : 'Pasif'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="plain"
                      size="sm"
                      onClick={() => onEdit(product)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="plain"
                      size="sm"
                      color="red"
                      onClick={() => onDelete(product.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// Product Grid Component
interface ProductGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  formatCurrency: (value: number) => string;
  getCategoryName: (categoryId: string) => string;
}

function ProductGrid({ products, onEdit, onDelete, formatCurrency, getCategoryName }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <Card key={product.id} variant="elevated" padding="none" className="overflow-hidden group">
          {/* Image */}
          <div className="aspect-square bg-white/5 flex items-center justify-center relative">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Image className="text-white/20" size={48} />
            )}
            {/* Status Badge */}
            <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-caption ${
              product.isActive 
                ? 'bg-[#30D158]/20 text-[#30D158]' 
                : 'bg-white/10 text-white/50'
            }`}>
              {product.isActive ? 'Aktif' : 'Pasif'}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-caption text-white/50">
              {getCategoryName(product.categoryId)}
            </p>
            <h3 className="text-headline text-white mt-1">
              {product.name}
            </h3>
            <p className="text-title-2 text-[#30D158] mt-2">
              {formatCurrency(product.price)}
            </p>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Button
                variant="tinted"
                size="sm"
                className="flex-1"
                onClick={() => onEdit(product)}
              >
                <Pencil size={14} />
                Düzenle
              </Button>
              <Button
                variant="tinted"
                size="sm"
                color="red"
                onClick={() => onDelete(product.id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
