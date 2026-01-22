import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { LogOut, Clock, Layers, CircleDot, LayoutGrid, Trees, Umbrella, Building, Coffee, Sofa, ChevronRight, ArrowLeft } from 'lucide-react';
import { tablesApi, ordersApi, zonesApi } from '@/services/api';
import type { Table, Order } from '@/services/api';
import { useSocket } from '@/hooks';
import { useCallback, useState, useEffect, useMemo } from 'react';

interface LoggedInWaiter {
  id: string;
  name: string;
  initials: string;
  role?: string;
}

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  LayoutGrid,
  Trees,
  Umbrella,
  Building,
  Coffee,
  Sofa,
  Layers,
};

const getZoneIcon = (iconName: string | undefined) => {
  const Icon = iconName ? ICON_MAP[iconName] : LayoutGrid;
  return Icon || LayoutGrid;
};

export default function TableList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [waiter, setWaiter] = useState<LoggedInWaiter | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null); // null = bölge seçim ekranı
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const storedWaiter = localStorage.getItem('waiter');
    if (storedWaiter) {
      setWaiter(JSON.parse(storedWaiter));
    } else {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('waiter');
    navigate('/');
  };

  const { data: zones = [] } = useQuery({
    queryKey: ['zones'],
    queryFn: zonesApi.getAll,
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 30,
  });

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.getAll,
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 30,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', 'active'],
    queryFn: () => ordersApi.getAll(),
  });

  const handleTableUpdated = useCallback((table: Table) => {
    queryClient.setQueryData<Table[]>(['tables'], (old) => {
      if (!old) return [table];
      const index = old.findIndex((t) => t.id === table.id);
      if (index === -1) return [...old, table];
      const updated = [...old];
      updated[index] = table;
      return updated;
    });
  }, [queryClient]);

  const handleOrderUpdated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  }, [queryClient]);

  useSocket({
    room: 'waiter',
    onTableUpdated: handleTableUpdated,
    onOrderNew: handleOrderUpdated,
    onOrderUpdated: handleOrderUpdated,
  });

  const getTableOrder = (tableId: string): Order | undefined => {
    return orders.find(
      (o) => o.tableId === tableId && ['open', 'sent'].includes(o.status)
    );
  };

  const getDwellTime = (order: Order | undefined): string | null => {
    if (!order) return null;
    const start = new Date(order.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return '<1dk';
    if (diffMins < 60) return `${diffMins}dk`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}s ${mins}dk`;
  };

  const getTableStatus = (order: Order | undefined): 'empty' | 'occupied' | 'sent' => {
    if (!order) return 'empty';
    if (order.status === 'sent') return 'sent';
    return 'occupied';
  };

  const formatTime = (d: Date) => d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  // Bölge bazlı istatistikler
  const zoneStats = useMemo(() => {
    const stats: Record<string, { total: number; active: number }> = {};
    zones.forEach(zone => {
      const zoneTables = tables.filter(t => t.zone === zone.name && t.isActive);
      const activeCount = zoneTables.filter(t => {
        const order = getTableOrder(t.id);
        return order && ['open', 'sent'].includes(order.status);
      }).length;
      stats[zone.name] = { total: zoneTables.length, active: activeCount };
    });
    return stats;
  }, [zones, tables, orders]);

  const filteredTables = useMemo(() => {
    if (!selectedZone) return [];
    const activeTables = tables.filter(t => t.isActive);
    if (selectedZone === 'all') return activeTables;
    if (selectedZone === 'active') {
      return activeTables.filter(t => {
        const order = getTableOrder(t.id);
        return order && ['open', 'sent'].includes(order.status);
      });
    }
    return activeTables.filter(t => t.zone === selectedZone);
  }, [tables, selectedZone, orders]);

  const totalStats = useMemo(() => {
    const activeTables = tables.filter(t => t.isActive);
    const activeOrders = orders.filter(o => ['open', 'sent'].includes(o.status));
    return {
      total: activeTables.length,
      active: activeOrders.length,
    };
  }, [tables, orders]);

  // BÖLGE SEÇİM EKRANI
  if (selectedZone === null) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <header style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src={`${import.meta.env.BASE_URL}pixpos-logo.png`}
              alt="" 
              style={{ height: '32px' }}
            />
            <div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '2px 0 0' }}>
                {waiter?.name || 'Garson'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '15px',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {formatTime(currentTime)}
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255,69,58,0.15)',
                border: 'none',
                color: '#FF453A',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Zone Selection */}
        <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
          <h2 style={{ 
            color: '#fff', 
            fontSize: '28px', 
            fontWeight: 700, 
            margin: '0 0 8px',
            textAlign: 'center',
          }}>
            Bölge Seçin
          </h2>
          <p style={{ 
            color: 'rgba(255,255,255,0.4)', 
            fontSize: '15px', 
            margin: '0 0 32px',
            textAlign: 'center',
          }}>
            Sipariş almak için bir bölge seçin
          </p>

          {/* Quick Filters */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '12px',
            marginBottom: '24px',
          }}>
            <button
              onClick={() => setSelectedZone('all')}
              style={{
                padding: '20px',
                borderRadius: '16px',
                background: 'rgba(10,132,255,0.1)',
                border: '1px solid rgba(10,132,255,0.3)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Layers size={28} color="#0A84FF" style={{ marginBottom: '12px' }} />
              <div style={{ color: '#fff', fontSize: '17px', fontWeight: 600 }}>Tüm Masalar</div>
              <div style={{ color: '#0A84FF', fontSize: '14px', marginTop: '4px' }}>
                {totalStats.total} masa
              </div>
            </button>
            <button
              onClick={() => setSelectedZone('active')}
              style={{
                padding: '20px',
                borderRadius: '16px',
                background: 'rgba(48,209,88,0.1)',
                border: '1px solid rgba(48,209,88,0.3)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <CircleDot size={28} color="#30D158" style={{ marginBottom: '12px' }} />
              <div style={{ color: '#fff', fontSize: '17px', fontWeight: 600 }}>Aktif Masalar</div>
              <div style={{ color: '#30D158', fontSize: '14px', marginTop: '4px' }}>
                {totalStats.active} sipariş
              </div>
            </button>
          </div>

          {/* Zone List */}
          <div style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '12px',
          }}>
            Bölgeler
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {zones.length === 0 ? (
              <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                color: 'rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '16px',
              }}>
                <p style={{ fontSize: '15px', margin: 0 }}>Bölge tanımlı değil</p>
                <p style={{ fontSize: '13px', margin: '8px 0 0', color: 'rgba(255,255,255,0.3)' }}>
                  POS'tan bölge ekleyin
                </p>
              </div>
            ) : (
              zones.map((zone) => {
                const ZoneIcon = getZoneIcon(zone.icon);
                const stats = zoneStats[zone.name] || { total: 0, active: 0 };
                return (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZone(zone.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '20px',
                      borderRadius: '16px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      background: 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <ZoneIcon size={28} color="#fff" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>
                        {zone.name}
                      </div>
                      <div style={{ 
                        color: 'rgba(255,255,255,0.4)', 
                        fontSize: '14px', 
                        marginTop: '4px',
                        display: 'flex',
                        gap: '12px',
                      }}>
                        <span>{stats.total} masa</span>
                        {stats.active > 0 && (
                          <span style={{ color: '#30D158' }}>{stats.active} aktif</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={24} color="rgba(255,255,255,0.3)" />
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // MASA LİSTESİ EKRANI
  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        minHeight: '60px',
        background: 'rgba(20,20,20,0.95)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        gap: '12px',
      }}>
        <button
          onClick={() => setSelectedZone(null)}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ color: '#fff', fontSize: '18px', fontWeight: 600, margin: 0 }}>
            {selectedZone === 'all' ? 'Tüm Masalar' : selectedZone === 'active' ? 'Aktif Masalar' : selectedZone}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '2px 0 0' }}>
            {filteredTables.length} masa
          </p>
        </div>
        <div style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '14px',
          fontVariantNumeric: 'tabular-nums',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Clock size={14} />
          {formatTime(currentTime)}
        </div>
      </header>

      {/* Tables Grid */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px',
      }}>
        {isLoading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            color: 'rgba(255,255,255,0.5)',
          }}>
            Yükleniyor...
          </div>
        ) : filteredTables.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            color: 'rgba(255,255,255,0.5)',
          }}>
            <p style={{ fontSize: '16px', margin: '0 0 8px' }}>Bu bölümde masa yok</p>
            <button
              onClick={() => setSelectedZone(null)}
              style={{
                marginTop: '16px',
                padding: '12px 24px',
                borderRadius: '12px',
                background: 'rgba(10,132,255,0.15)',
                border: 'none',
                color: '#0A84FF',
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Bölge Değiştir
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px',
          }}>
            {filteredTables.map(table => {
              const order = getTableOrder(table.id);
              const status = getTableStatus(order);
              const dwellTime = getDwellTime(order);

              return (
                <button
                  key={table.id}
                  onClick={() => navigate(`/order/${table.id}`)}
                  style={{
                    background: status === 'empty' 
                      ? 'rgba(255,255,255,0.06)' 
                      : status === 'occupied'
                        ? 'rgba(48,209,88,0.1)'
                        : 'rgba(10,132,255,0.1)',
                    border: `1px solid ${
                      status === 'empty' 
                        ? 'rgba(255,255,255,0.08)' 
                        : status === 'occupied'
                          ? 'rgba(48,209,88,0.3)'
                          : 'rgba(10,132,255,0.3)'
                    }`,
                    borderRadius: '16px',
                    padding: '16px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    minHeight: '100px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Table Name - Full name from POS */}
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: '4px',
                  }}>
                    {table.name}
                  </div>

                  {/* Status Info */}
                  {status !== 'empty' && dwellTime && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.5)',
                      marginTop: '4px',
                    }}>
                      <Clock size={10} />
                      <span>{dwellTime}</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '8px',
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: status === 'empty' 
                        ? 'rgba(255,255,255,0.3)' 
                        : status === 'occupied'
                          ? '#30D158'
                          : '#0A84FF',
                    }} />
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: status === 'empty' 
                        ? 'rgba(255,255,255,0.4)' 
                        : status === 'occupied'
                          ? '#30D158'
                          : '#0A84FF',
                    }}>
                      {status === 'empty' && 'Boş'}
                      {status === 'occupied' && 'Açık'}
                      {status === 'sent' && 'Sipariş'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
