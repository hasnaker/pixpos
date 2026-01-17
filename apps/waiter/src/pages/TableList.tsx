import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { LogOut, Clock, Layers, CircleDot, LayoutGrid, Trees, Umbrella, Building, Coffee, Sofa, ChevronRight, Menu, X } from 'lucide-react';
import { tablesApi, ordersApi, zonesApi } from '@/services/api';
import type { Table, Order } from '@/services/api';
import { useSocket } from '@/hooks';
import { useCallback, useState, useEffect, useMemo } from 'react';

interface LoggedInWaiter {
  id: string;
  name: string;
  initials: string;
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
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

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

  // Handle orientation change
  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
      // Close sidebar on orientation change in portrait
      if (window.innerWidth <= window.innerHeight) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('waiter');
    navigate('/');
  };

  const { data: zones = [] } = useQuery({
    queryKey: ['zones'],
    queryFn: zonesApi.getAll,
  });

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.getAll,
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

  const formatPrice = (v: number) => `₺${v.toFixed(0)}`;
  const formatTime = (d: Date) => d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  const filteredTables = useMemo(() => {
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

  const stats = useMemo(() => {
    const activeTables = tables.filter(t => t.isActive);
    const activeOrders = orders.filter(o => ['open', 'sent'].includes(o.status));
    return {
      total: activeTables.length,
      empty: activeTables.filter(t => !getTableOrder(t.id)).length,
      occupied: activeOrders.filter(o => o.status === 'open').length,
      sent: activeOrders.filter(o => o.status === 'sent').length,
    };
  }, [tables, orders]);

  const handleZoneSelect = (zone: string) => {
    setSelectedZone(zone);
    if (!isLandscape) {
      setSidebarOpen(false);
    }
  };

  // Sidebar width based on orientation
  const sidebarWidth = isLandscape ? '220px' : '280px';
  const showSidebarAlways = isLandscape;

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#000',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)',
    }}>
      {/* Overlay for mobile sidebar */}
      {!showSidebarAlways && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: sidebarWidth,
        height: '100%',
        background: 'rgba(28,28,30,0.98)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: showSidebarAlways ? 'relative' : 'fixed',
        left: showSidebarAlways ? 0 : (sidebarOpen ? 0 : `-${sidebarWidth}`),
        top: 0,
        zIndex: 50,
        transition: 'left 0.3s ease',
        paddingTop: 'env(safe-area-inset-top)',
      }}>
        {/* Logo */}
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>P</span>
            </div>
            <div>
              <h2 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, margin: 0 }}>
                PIXPOS
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '2px 0 0' }}>
                Garson Paneli
              </p>
            </div>
          </div>
          {!showSidebarAlways && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {/* Filters */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '0 8px',
              marginBottom: '8px',
            }}>
              Filtreler
            </div>
            
            <button
              onClick={() => handleZoneSelect('all')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                background: selectedZone === 'all' ? 'rgba(10,132,255,0.15)' : 'transparent',
                color: selectedZone === 'all' ? '#0A84FF' : 'rgba(255,255,255,0.6)',
                marginBottom: '4px',
                transition: 'all 0.15s ease',
              }}
            >
              <Layers size={20} strokeWidth={1.5} />
              <span style={{ fontSize: '15px', fontWeight: 500 }}>Tüm Masalar</span>
              <span style={{ 
                marginLeft: 'auto', 
                fontSize: '13px', 
                color: 'rgba(255,255,255,0.4)',
                fontWeight: 500,
              }}>
                {stats.total}
              </span>
            </button>

            <button
              onClick={() => handleZoneSelect('active')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                background: selectedZone === 'active' ? 'rgba(48,209,88,0.15)' : 'transparent',
                color: selectedZone === 'active' ? '#30D158' : 'rgba(255,255,255,0.6)',
                marginBottom: '4px',
                transition: 'all 0.15s ease',
              }}
            >
              <CircleDot size={20} strokeWidth={1.5} />
              <span style={{ fontSize: '15px', fontWeight: 500 }}>Aktif Masalar</span>
              <span style={{ 
                marginLeft: 'auto', 
                fontSize: '13px', 
                color: selectedZone === 'active' ? '#30D158' : 'rgba(255,255,255,0.4)',
                fontWeight: 500,
              }}>
                {stats.occupied + stats.sent}
              </span>
            </button>
          </div>

          {/* Zones */}
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '0 8px',
              marginBottom: '8px',
            }}>
              Bölgeler
            </div>
            
            {zones.length === 0 ? (
              <div style={{ padding: '8px 12px', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
                Bölge tanımlı değil
              </div>
            ) : (
              zones.map((zone) => {
                const isActive = selectedZone === zone.name;
                const ZoneIcon = getZoneIcon(zone.icon);
                const zoneTableCount = tables.filter(t => t.zone === zone.name && t.isActive).length;
                return (
                  <button
                    key={zone.id}
                    onClick={() => handleZoneSelect(zone.name)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                      marginBottom: '4px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ZoneIcon size={20} strokeWidth={1.5} />
                    <span style={{ fontSize: '15px', fontWeight: 500 }}>{zone.name}</span>
                    <span style={{ 
                      marginLeft: 'auto', 
                      fontSize: '13px', 
                      color: 'rgba(255,255,255,0.4)',
                      fontWeight: 500,
                    }}>
                      {zoneTableCount}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* User & Logout */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
        }}>
          {waiter && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                background: 'linear-gradient(135deg, #5E5CE6, #BF5AF2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>
                  {waiter.initials}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#fff', fontSize: '14px', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {waiter.name}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '2px 0 0' }}>
                  Garson
                </p>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'rgba(255,69,58,0.15)',
                  border: 'none',
                  color: '#FF453A',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#0A0A0A',
        minWidth: 0,
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
          justifyContent: 'space-between',
          padding: '12px 16px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Menu button for portrait mode */}
            {!showSidebarAlways && (
              <button
                onClick={() => setSidebarOpen(true)}
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
                <Menu size={20} />
              </button>
            )}
            <h1 style={{ color: '#fff', fontSize: '18px', fontWeight: 600, margin: 0 }}>
              {selectedZone === 'all' ? 'Tüm Masalar' : selectedZone === 'active' ? 'Aktif Masalar' : selectedZone}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Compact Stats */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '8px',
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{stats.empty}</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                background: 'rgba(48,209,88,0.1)',
                borderRadius: '8px',
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#30D158' }} />
                <span style={{ color: '#30D158', fontSize: '13px', fontWeight: 600 }}>{stats.occupied}</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                background: 'rgba(10,132,255,0.1)',
                borderRadius: '8px',
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0A84FF' }} />
                <span style={{ color: '#0A84FF', fontSize: '13px', fontWeight: 600 }}>{stats.sent}</span>
              </div>
            </div>

            {/* Time */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '13px',
              padding: '6px 10px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '8px',
            }}>
              <Clock size={14} />
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatTime(currentTime)}</span>
            </div>
          </div>
        </header>

        {/* Tables Grid */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
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
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)' }}>
                Başka bir bölge seçin
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isLandscape 
                ? 'repeat(auto-fill, minmax(150px, 1fr))' 
                : 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '12px',
            }}>
              {filteredTables.map(table => {
                const order = getTableOrder(table.id);
                const status = getTableStatus(order);
                const dwellTime = getDwellTime(order);
                const amount = order?.totalAmount || 0;

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
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      minHeight: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Table Number */}
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: '4px',
                    }}>
                      {table.name.replace('Masa ', '').replace('SL-', '').replace('BH-', '').replace('DS-', '')}
                    </div>

                    {/* Zone Badge */}
                    {table.zone && (
                      <div style={{
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.4)',
                        marginBottom: '8px',
                      }}>
                        {table.zone}
                      </div>
                    )}

                    <div style={{ flex: 1 }} />

                    {/* Status Info */}
                    {status !== 'empty' && (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          color: 'rgba(255,255,255,0.5)',
                          marginBottom: '2px',
                        }}>
                          <Clock size={10} />
                          <span>{dwellTime}</span>
                        </div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 700,
                          color: status === 'occupied' ? '#30D158' : '#0A84FF',
                        }}>
                          {formatPrice(Number(amount))}
                        </div>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
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
                      <ChevronRight size={12} style={{ 
                        marginLeft: 'auto', 
                        color: 'rgba(255,255,255,0.3)',
                      }} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
