import { useQuery } from '@tanstack/react-query';
import { Store, Users, ShoppingBag, TrendingUp, AlertCircle } from 'lucide-react';
import { storesApi, usersApi } from '../services/api';

export default function Dashboard() {
  const { data: stores = [], isLoading: storesLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: storesApi.getAll,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  const activeStores = stores.filter(s => s.status === 'active').length;
  const trialStores = stores.filter(s => s.status === 'trial').length;
  const suspendedStores = stores.filter(s => s.status === 'suspended').length;

  const stats = [
    { 
      label: 'Toplam Store', 
      value: stores.length, 
      icon: Store, 
      color: 'bg-[#0A84FF]',
      change: '+12%'
    },
    { 
      label: 'Aktif Store', 
      value: activeStores, 
      icon: TrendingUp, 
      color: 'bg-[#30D158]',
      change: '+8%'
    },
    { 
      label: 'Trial Store', 
      value: trialStores, 
      icon: ShoppingBag, 
      color: 'bg-[#FF9F0A]',
      change: '+5%'
    },
    { 
      label: 'Toplam Kullanıcı', 
      value: users.length, 
      icon: Users, 
      color: 'bg-[#BF5AF2]',
      change: '+15%'
    },
  ];

  const isLoading = storesLoading || usersLoading;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-white/40 mt-1">PIXPOS platform genel bakış</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/6 backdrop-blur-xl border border-white/8 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-[#30D158] text-sm font-medium">{stat.change}</span>
            </div>
            <div className="text-3xl font-semibold text-white mb-1">
              {isLoading ? '...' : stat.value}
            </div>
            <div className="text-white/40 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Stores & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Stores */}
        <div className="bg-white/6 backdrop-blur-xl border border-white/8 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Son Eklenen Store'lar</h2>
          <div className="space-y-3">
            {stores.slice(0, 5).map((store) => (
              <div
                key={store.id}
                className="flex items-center justify-between p-3 bg-white/4 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/8 rounded-lg flex items-center justify-center">
                    <Store className="w-5 h-5 text-white/60" />
                  </div>
                  <div>
                    <div className="text-white font-medium">{store.name}</div>
                    <div className="text-white/40 text-sm">{store.slug}</div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  store.status === 'active' ? 'bg-[#30D158]/20 text-[#30D158]' :
                  store.status === 'trial' ? 'bg-[#FF9F0A]/20 text-[#FF9F0A]' :
                  'bg-[#FF453A]/20 text-[#FF453A]'
                }`}>
                  {store.status}
                </span>
              </div>
            ))}
            {stores.length === 0 && !isLoading && (
              <div className="text-center py-8 text-white/40">
                Henüz store yok
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white/6 backdrop-blur-xl border border-white/8 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Uyarılar</h2>
          <div className="space-y-3">
            {suspendedStores > 0 && (
              <div className="flex items-center gap-3 p-3 bg-[#FF453A]/10 border border-[#FF453A]/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-[#FF453A]" />
                <div>
                  <div className="text-white font-medium">{suspendedStores} Askıya Alınmış Store</div>
                  <div className="text-white/40 text-sm">Ödeme sorunu olabilir</div>
                </div>
              </div>
            )}
            {trialStores > 0 && (
              <div className="flex items-center gap-3 p-3 bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-[#FF9F0A]" />
                <div>
                  <div className="text-white font-medium">{trialStores} Trial Store</div>
                  <div className="text-white/40 text-sm">Deneme süresi devam ediyor</div>
                </div>
              </div>
            )}
            {suspendedStores === 0 && trialStores === 0 && (
              <div className="text-center py-8 text-white/40">
                Uyarı yok, her şey yolunda! 🎉
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
