import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Store as StoreIcon, 
  Users, 
  Table2, 
  ShoppingBag,
  Receipt,
  ExternalLink,
  Settings,
  Pause,
  Play,
  Trash2
} from 'lucide-react';
import { storesApi } from '../services/api';

export default function StoreDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: store, isLoading } = useQuery({
    queryKey: ['store', id],
    queryFn: () => storesApi.getOne(id!),
    enabled: !!id,
  });

  const { data: stats } = useQuery({
    queryKey: ['store-stats', id],
    queryFn: () => storesApi.getStats(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { status: 'active' | 'suspended' | 'trial' | 'cancelled' }) => storesApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store', id] });
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => storesApi.delete(id!),
    onSuccess: () => {
      navigate('/stores');
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-white/40">Yükleniyor...</div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-white/40">Store bulunamadı</div>
      </div>
    );
  }

  const handleSuspend = () => {
    if (confirm('Bu store\'u askıya almak istediğinize emin misiniz?')) {
      updateMutation.mutate({ status: 'suspended' });
    }
  };

  const handleActivate = () => {
    updateMutation.mutate({ status: 'active' });
  };

  const handleDelete = () => {
    if (confirm('Bu store\'u kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
      deleteMutation.mutate();
    }
  };

  const statCards = [
    { label: 'Kullanıcılar', value: stats?.usersCount || 0, max: store.maxUsers, icon: Users, color: 'bg-[#0A84FF]' },
    { label: 'Masalar', value: stats?.tablesCount || 0, max: store.maxTables, icon: Table2, color: 'bg-[#30D158]' },
    { label: 'Ürünler', value: stats?.productsCount || 0, max: store.maxProducts, icon: ShoppingBag, color: 'bg-[#FF9F0A]' },
    { label: 'Siparişler', value: stats?.ordersCount || 0, max: null, icon: Receipt, color: 'bg-[#BF5AF2]' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/stores')}
          className="p-2 hover:bg-white/8 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-white">{store.name}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              store.status === 'active' ? 'bg-[#30D158]/20 text-[#30D158]' :
              store.status === 'trial' ? 'bg-[#FF9F0A]/20 text-[#FF9F0A]' :
              store.status === 'suspended' ? 'bg-[#FF453A]/20 text-[#FF453A]' :
              'bg-white/10 text-white/60'
            }`}>
              {store.status}
            </span>
          </div>
          <p className="text-white/40 mt-1">{store.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          {store.status === 'suspended' ? (
            <button
              onClick={handleActivate}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#30D158] text-white rounded-xl font-medium hover:bg-[#30D158]/90 transition-colors"
            >
              <Play className="w-4 h-4" />
              Aktifleştir
            </button>
          ) : (
            <button
              onClick={handleSuspend}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#FF9F0A] text-white rounded-xl font-medium hover:bg-[#FF9F0A]/90 transition-colors"
            >
              <Pause className="w-4 h-4" />
              Askıya Al
            </button>
          )}
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FF453A] text-white rounded-xl font-medium hover:bg-[#FF453A]/90 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Sil
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/6 backdrop-blur-xl border border-white/8 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/60">{stat.label}</span>
            </div>
            <div className="text-2xl font-semibold text-white">
              {stat.value}
              {stat.max && <span className="text-white/40 text-lg"> / {stat.max}</span>}
            </div>
            {stat.max && (
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${stat.color} rounded-full`}
                  style={{ width: `${Math.min((stat.value / stat.max) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Info */}
        <div className="bg-white/6 backdrop-blur-xl border border-white/8 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <StoreIcon className="w-5 h-5 text-white/60" />
            <h2 className="text-lg font-semibold text-white">Store Bilgileri</h2>
          </div>
          <div className="space-y-4">
            <InfoRow label="ID" value={store.id} />
            <InfoRow label="Slug" value={store.slug} />
            <InfoRow label="Subdomain" value={store.subdomain ? `${store.subdomain}.pixpos.cloud` : '-'} />
            <InfoRow label="Custom Domain" value={store.customDomain || '-'} />
            <InfoRow label="E-posta" value={store.email || '-'} />
            <InfoRow label="Telefon" value={store.phone || '-'} />
            <InfoRow label="Adres" value={store.address || '-'} />
            <InfoRow label="Vergi No" value={store.taxNumber || '-'} />
          </div>
        </div>

        {/* Plan & Limits */}
        <div className="bg-white/6 backdrop-blur-xl border border-white/8 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-5 h-5 text-white/60" />
            <h2 className="text-lg font-semibold text-white">Plan & Limitler</h2>
          </div>
          <div className="space-y-4">
            <InfoRow label="Plan" value={store.plan.toUpperCase()} />
            <InfoRow label="Max Kullanıcı" value={store.maxUsers.toString()} />
            <InfoRow label="Max Masa" value={store.maxTables.toString()} />
            <InfoRow label="Max Ürün" value={store.maxProducts.toString()} />
            <InfoRow 
              label="Trial Bitiş" 
              value={store.trialEndsAt ? new Date(store.trialEndsAt).toLocaleDateString('tr-TR') : '-'} 
            />
            <InfoRow 
              label="Abonelik Bitiş" 
              value={store.subscriptionEndsAt ? new Date(store.subscriptionEndsAt).toLocaleDateString('tr-TR') : '-'} 
            />
            <InfoRow 
              label="Oluşturulma" 
              value={new Date(store.createdAt).toLocaleDateString('tr-TR')} 
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white/6 backdrop-blur-xl border border-white/8 rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <ExternalLink className="w-5 h-5 text-white/60" />
            <h2 className="text-lg font-semibold text-white">Hızlı Erişim</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {store.subdomain && (
              <>
                <QuickLink 
                  label="POS" 
                  url={`https://${store.subdomain}.pixpos.cloud/pos`} 
                />
                <QuickLink 
                  label="Waiter" 
                  url={`https://${store.subdomain}.pixpos.cloud/waiter`} 
                />
                <QuickLink 
                  label="Kitchen" 
                  url={`https://${store.subdomain}.pixpos.cloud/kitchen`} 
                />
                <QuickLink 
                  label="QR Menu" 
                  url={`https://${store.subdomain}.pixpos.cloud/qr-menu`} 
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/6 last:border-0">
      <span className="text-white/40">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}

function QuickLink({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 p-4 bg-white/4 hover:bg-white/8 border border-white/8 rounded-xl transition-colors"
    >
      <span className="text-white font-medium">{label}</span>
      <ExternalLink className="w-4 h-4 text-white/40" />
    </a>
  );
}
