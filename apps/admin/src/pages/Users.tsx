import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Users as UsersIcon, Shield, User as UserIcon, Coffee } from 'lucide-react';
import { usersApi, storesApi, type User as UserType } from '../services/api';

export default function Users() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: storesApi.getAll,
  });

  const getStoreName = (storeId: string | null) => {
    if (!storeId) return 'Super Admin';
    const store = stores.find(s => s.id === storeId);
    return store?.name || 'Unknown';
  };

  const getRoleIcon = (role: UserType['role']) => {
    switch (role) {
      case 'super_admin': return Shield;
      case 'admin': return UserIcon;
      case 'cashier': return Coffee;
      case 'waiter': return Coffee;
      default: return UserIcon;
    }
  };

  const getRoleColor = (role: UserType['role']) => {
    switch (role) {
      case 'super_admin': return 'bg-[#BF5AF2]/20 text-[#BF5AF2]';
      case 'admin': return 'bg-[#0A84FF]/20 text-[#0A84FF]';
      case 'cashier': return 'bg-[#30D158]/20 text-[#30D158]';
      case 'waiter': return 'bg-[#FF9F0A]/20 text-[#FF9F0A]';
      default: return 'bg-white/10 text-white/60';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
      (user.email?.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleStats = {
    all: users.length,
    super_admin: users.filter(u => u.role === 'super_admin').length,
    admin: users.filter(u => u.role === 'admin').length,
    cashier: users.filter(u => u.role === 'cashier').length,
    waiter: users.filter(u => u.role === 'waiter').length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Kullanıcılar</h1>
        <p className="text-white/40 mt-1">Tüm platform kullanıcılarını görüntüleyin</p>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'Tümü' },
          { key: 'super_admin', label: 'Super Admin' },
          { key: 'admin', label: 'Admin' },
          { key: 'cashier', label: 'Kasiyer' },
          { key: 'waiter', label: 'Garson' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setRoleFilter(tab.key)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
              roleFilter === tab.key
                ? 'bg-[#0A84FF] text-white'
                : 'bg-white/6 text-white/60 hover:bg-white/10'
            }`}
          >
            {tab.label} ({roleStats[tab.key as keyof typeof roleStats]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          placeholder="Kullanıcı ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/6 border border-white/8 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#0A84FF]"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white/6 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/8">
              <th className="text-left p-4 text-white/40 font-medium">Kullanıcı</th>
              <th className="text-left p-4 text-white/40 font-medium">Store</th>
              <th className="text-left p-4 text-white/40 font-medium">Rol</th>
              <th className="text-left p-4 text-white/40 font-medium">Durum</th>
              <th className="text-left p-4 text-white/40 font-medium">Kayıt Tarihi</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const RoleIcon = getRoleIcon(user.role);
              return (
                <tr key={user.id} className="border-b border-white/6 last:border-0 hover:bg-white/4">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/8 rounded-full flex items-center justify-center">
                        <RoleIcon className="w-5 h-5 text-white/60" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{user.name}</div>
                        <div className="text-white/40 text-sm">{user.email || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-white/60">{getStoreName(user.storeId)}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.isActive ? 'bg-[#30D158]/20 text-[#30D158]' : 'bg-[#FF453A]/20 text-[#FF453A]'
                    }`}>
                      {user.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="p-4 text-white/40">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredUsers.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <UsersIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-white/60 text-lg">Kullanıcı bulunamadı</h3>
          </div>
        )}
      </div>
    </div>
  );
}
