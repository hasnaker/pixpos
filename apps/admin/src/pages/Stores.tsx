import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Store as StoreIcon, 
  MoreVertical,
  ExternalLink,
  Trash2,
  Edit
} from 'lucide-react';
import { storesApi, type Store, type CreateStoreDto } from '../services/api';

export default function Stores() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: storesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: storesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: storesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(search.toLowerCase()) ||
    store.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (data: CreateStoreDto) => {
    createMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu store\'u silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Stores</h1>
          <p className="text-white/40 mt-1">Tüm müşteri store'larını yönetin</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0A84FF] text-white rounded-xl font-medium hover:bg-[#0A84FF]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Yeni Store
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          placeholder="Store ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/6 border border-white/8 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#0A84FF]"
        />
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStores.map((store) => (
          <div
            key={store.id}
            className="bg-white/6 backdrop-blur-xl border border-white/8 rounded-2xl p-5 hover:border-white/16 transition-colors cursor-pointer"
            onClick={() => navigate(`/stores/${store.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/8 rounded-xl flex items-center justify-center">
                  {store.logoUrl ? (
                    <img src={store.logoUrl} alt={store.name} className="w-8 h-8 rounded" />
                  ) : (
                    <StoreIcon className="w-6 h-6 text-white/60" />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{store.name}</h3>
                  <p className="text-white/40 text-sm">{store.slug}</p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="p-2 hover:bg-white/8 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-white/40" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                store.status === 'active' ? 'bg-[#30D158]/20 text-[#30D158]' :
                store.status === 'trial' ? 'bg-[#FF9F0A]/20 text-[#FF9F0A]' :
                store.status === 'suspended' ? 'bg-[#FF453A]/20 text-[#FF453A]' :
                'bg-white/10 text-white/60'
              }`}>
                {store.status}
              </span>
              <span className="px-2.5 py-1 bg-white/8 rounded-full text-xs font-medium text-white/60">
                {store.plan}
              </span>
            </div>

            <div className="text-white/40 text-sm space-y-1">
              {store.subdomain && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{store.subdomain}.pixpos.cloud</span>
                </div>
              )}
              <div>Max: {store.maxUsers} kullanıcı, {store.maxTables} masa</div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/8">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingStore(store);
                  setShowModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/8 rounded-lg text-white/60 hover:bg-white/12 hover:text-white transition-colors text-sm"
              >
                <Edit className="w-4 h-4" />
                Düzenle
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(store.id);
                }}
                className="flex items-center justify-center p-2 bg-[#FF453A]/10 rounded-lg text-[#FF453A] hover:bg-[#FF453A]/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStores.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <StoreIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-white/60 text-lg">Store bulunamadı</h3>
          <p className="text-white/40 mt-1">Yeni bir store ekleyin</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <StoreModal
          store={editingStore}
          onClose={() => {
            setShowModal(false);
            setEditingStore(null);
          }}
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
        />
      )}
    </div>
  );
}

function StoreModal({ 
  store, 
  onClose, 
  onSubmit, 
  isLoading 
}: { 
  store: Store | null;
  onClose: () => void;
  onSubmit: (data: CreateStoreDto) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<CreateStoreDto>({
    name: store?.name || '',
    slug: store?.slug || '',
    subdomain: store?.subdomain || '',
    email: store?.email || '',
    phone: store?.phone || '',
    address: store?.address || '',
    plan: store?.plan || 'free',
    maxUsers: store?.maxUsers || 5,
    maxTables: store?.maxTables || 20,
    maxProducts: store?.maxProducts || 100,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/8">
          <h2 className="text-xl font-semibold text-white">
            {store ? 'Store Düzenle' : 'Yeni Store'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Store Adı *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/6 border border-white/8 rounded-xl text-white focus:outline-none focus:border-[#0A84FF]"
              placeholder="Queen Waffle"
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Slug *</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              className="w-full px-4 py-3 bg-white/6 border border-white/8 rounded-xl text-white focus:outline-none focus:border-[#0A84FF]"
              placeholder="queen-waffle"
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Subdomain</label>
            <div className="flex items-center">
              <input
                type="text"
                value={formData.subdomain}
                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                className="flex-1 px-4 py-3 bg-white/6 border border-white/8 rounded-l-xl text-white focus:outline-none focus:border-[#0A84FF]"
                placeholder="queen"
              />
              <span className="px-4 py-3 bg-white/4 border border-l-0 border-white/8 rounded-r-xl text-white/40">
                .pixpos.cloud
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">E-posta</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/6 border border-white/8 rounded-xl text-white focus:outline-none focus:border-[#0A84FF]"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-white/6 border border-white/8 rounded-xl text-white focus:outline-none focus:border-[#0A84FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Plan</label>
            <select
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value as CreateStoreDto['plan'] })}
              className="w-full px-4 py-3 bg-white/6 border border-white/8 rounded-xl text-white focus:outline-none focus:border-[#0A84FF]"
            >
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Max Kullanıcı</label>
              <input
                type="number"
                min="1"
                value={formData.maxUsers}
                onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-white/6 border border-white/8 rounded-xl text-white focus:outline-none focus:border-[#0A84FF]"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Max Masa</label>
              <input
                type="number"
                min="1"
                value={formData.maxTables}
                onChange={(e) => setFormData({ ...formData, maxTables: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-white/6 border border-white/8 rounded-xl text-white focus:outline-none focus:border-[#0A84FF]"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Max Ürün</label>
              <input
                type="number"
                min="1"
                value={formData.maxProducts}
                onChange={(e) => setFormData({ ...formData, maxProducts: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-white/6 border border-white/8 rounded-xl text-white focus:outline-none focus:border-[#0A84FF]"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white/8 text-white rounded-xl font-medium hover:bg-white/12 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-[#0A84FF] text-white rounded-xl font-medium hover:bg-[#0A84FF]/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Kaydediliyor...' : store ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
