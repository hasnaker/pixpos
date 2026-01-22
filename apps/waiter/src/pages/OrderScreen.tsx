import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2, Plus, Check, ShoppingBag, Search, Package, Clock, ChevronDown, ChevronUp, Send, ShoppingCart, X } from 'lucide-react';
import { tablesApi, productsApi, categoriesApi, ordersApi } from '@/services/api';
import type { Product } from '@/services/api';

// Responsive breakpoint hook - improved for phone/tablet
function useDeviceType() {
  const [device, setDevice] = useState<'phone' | 'tablet-portrait' | 'tablet-landscape'>('phone');
  
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isLandscape = w > h;
      
      if (w < 600) {
        setDevice('phone');
      } else if (isLandscape) {
        setDevice('tablet-landscape');
      } else {
        setDevice('tablet-portrait');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);
  
  return device;
}

export default function OrderScreen() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const device = useDeviceType();
  const isPhone = device === 'phone';
  const isLandscape = device === 'tablet-landscape';

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSentSuccess, setShowSentSuccess] = useState(false);
  const [showCart, setShowCart] = useState(false); // Mobile cart drawer

  const { data: table } = useQuery({
    queryKey: ['table', tableId],
    queryFn: () => tablesApi.getOne(tableId!),
    enabled: !!tableId,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  });

  const { data: tableOrders = [], refetch: refetchOrders } = useQuery({
    queryKey: ['orders', 'table', tableId],
    queryFn: () => ordersApi.getByTable(tableId!),
    enabled: !!tableId,
  });

  // Aktif siparişler (open veya sent durumunda)
  const activeOrders = tableOrders
    .filter(o => o.status === 'open' || o.status === 'sent')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Mevcut açık sipariş (ürün eklenebilir)
  const currentOpenOrder = activeOrders.find(o => o.status === 'open');

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      const active = categories.filter(c => c.isActive);
      if (active.length > 0) setSelectedCategory(active[0].id);
    }
  }, [categories, selectedCategory]);

  // Expand all orders by default
  useEffect(() => {
    if (activeOrders.length > 0) {
      setExpandedOrders(new Set(activeOrders.map(o => o.id)));
    }
  }, [activeOrders.length]);

  const createOrder = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      refetchOrders();
    },
  });

  const addItem = useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: { productId: string; quantity: number } }) =>
      ordersApi.addItem(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      refetchOrders();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    },
  });

  const removeItem = useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: string; itemId: string }) =>
      ordersApi.removeItem(orderId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      refetchOrders();
    },
  });

  const sendToKitchen = useMutation({
    mutationFn: ordersApi.sendToKitchen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      refetchOrders();
      setShowSentSuccess(true);
      setTimeout(() => setShowSentSuccess(false), 2000);
    },
  });

  const handleSendToKitchen = useCallback(() => {
    if (currentOpenOrder && currentOpenOrder.items.length > 0) {
      sendToKitchen.mutate(currentOpenOrder.id);
    }
  }, [currentOpenOrder, sendToKitchen]);

  const handleAddProduct = useCallback(async (product: Product) => {
    if (navigator.vibrate) navigator.vibrate(10);
    try {
      if (!currentOpenOrder) {
        // Yeni sipariş oluştur
        const newOrder = await createOrder.mutateAsync({ tableId: tableId! });
        await addItem.mutateAsync({ orderId: newOrder.id, data: { productId: product.id, quantity: 1 } });
      } else {
        // Mevcut siparişe ekle
        await addItem.mutateAsync({ orderId: currentOpenOrder.id, data: { productId: product.id, quantity: 1 } });
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentOpenOrder, tableId, createOrder, addItem]);

  const handleRemoveItem = useCallback((orderId: string, itemId: string) => {
    removeItem.mutate({ orderId, itemId });
  }, [removeItem]);

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const formatPrice = (v: unknown) => {
    const num = typeof v === 'number' ? v : Number(v) || 0;
    return `₺${num.toFixed(0)}`;
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const getProductImage = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.imageUrl;
  };

  const activeCategories = categories.filter(c => c.isActive);
  
  let filteredProducts = products.filter(p => p.categoryId === selectedCategory && p.isActive);
  if (searchQuery) {
    filteredProducts = products.filter(p => 
      p.isActive && p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Toplam ürün sayısı (tutar garson için gizli)
  const totalItems = activeOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

  // Layout helpers
  const showSideBySide = isLandscape;
  const useDrawer = isPhone || device === 'tablet-portrait'; // Phone ve tablet portrait için drawer kullan

  return (
    <div style={{
      display: 'flex',
      flexDirection: showSideBySide ? 'row' : 'column',
      height: '100vh',
      background: '#000',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      overflow: 'hidden',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: isPhone ? '0' : 'env(safe-area-inset-bottom)',
    }}>
      {/* Success Toast - Item Added */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#30D158',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1000,
          boxShadow: '0 4px 20px rgba(48,209,88,0.4)',
        }}>
          <Check size={18} />
          <span style={{ fontWeight: 500 }}>Ürün eklendi</span>
        </div>
      )}

      {/* Success Toast - Sent to Kitchen */}
      {showSentSuccess && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0A84FF',
          color: '#fff',
          padding: '14px 28px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 1000,
          boxShadow: '0 4px 24px rgba(10,132,255,0.4)',
        }}>
          <Send size={20} />
          <span style={{ fontWeight: 600, fontSize: '15px' }}>Sipariş mutfağa gönderildi!</span>
        </div>
      )}

      {/* Left Panel - Products */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#0A0A0A',
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <header style={{
          minHeight: '56px',
          background: 'rgba(20,20,20,0.95)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0 16px',
          flexShrink: 0,
        }}>
          <button
            onClick={() => navigate('/tables')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ color: '#fff', fontSize: '17px', fontWeight: 600, margin: 0 }}>
              {table?.name || 'Masa'}
            </h1>
            {table?.zone && (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '2px 0 0' }}>
                {table.zone}
              </p>
            )}
          </div>
          {/* Toplam tutar kaldırıldı - garson görmemeli */}
        </header>

        {/* Search */}
        <div style={{ padding: '12px 16px 8px', flexShrink: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <Search size={16} color="rgba(255,255,255,0.4)" />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: '15px',
                color: '#fff',
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={12} color="rgba(255,255,255,0.6)" />
              </button>
            )}
          </div>
        </div>

        {/* Categories - Grid on Tablet, Horizontal Scroll on Phone */}
        <div style={{
          display: 'flex',
          flexWrap: isPhone ? 'nowrap' : 'wrap',
          gap: '8px',
          padding: '0 16px 12px',
          overflowX: isPhone ? 'auto' : 'visible',
          flexShrink: 0,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
          {activeCategories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setSearchQuery(''); }}
                style={{
                  padding: isPhone ? '10px 16px' : '12px 20px',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid #0A84FF' : '1px solid rgba(255,255,255,0.1)',
                  background: isSelected 
                    ? 'rgba(10,132,255,0.2)' 
                    : 'rgba(255,255,255,0.04)',
                  color: isSelected ? '#0A84FF' : 'rgba(255,255,255,0.8)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: isPhone ? 0 : 'initial',
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '0 16px',
          paddingBottom: isPhone ? '100px' : '16px', // Space for FAB on phone
        }}>
          {filteredProducts.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: 'rgba(255,255,255,0.4)',
            }}>
              <Package size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p style={{ fontSize: '14px', margin: 0 }}>Ürün bulunamadı</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isPhone 
                ? 'repeat(2, 1fr)' 
                : isLandscape 
                  ? 'repeat(auto-fill, minmax(130px, 1fr))'
                  : 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: isPhone ? '10px' : '12px',
            }}>
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleAddProduct(product)}
                  style={{
                    position: 'relative',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '14px',
                    padding: isPhone ? '12px 10px' : '14px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                  }}
                >
                  {/* Product Image or Placeholder */}
                  <div style={{
                    width: isPhone ? '48px' : '56px',
                    height: isPhone ? '48px' : '56px',
                    borderRadius: '10px',
                    margin: '0 auto 10px',
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: isPhone ? '22px' : '26px' }}>☕</span>
                    )}
                  </div>

                  {/* Product Name */}
                  <div style={{
                    fontSize: isPhone ? '12px' : '13px',
                    fontWeight: 500,
                    color: '#fff',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {product.name}
                  </div>

                  {/* Price */}
                  <div style={{
                    fontSize: isPhone ? '14px' : '15px',
                    fontWeight: 700,
                    color: '#0A84FF',
                  }}>
                    {formatPrice(product.price)}
                  </div>

                  {/* Add indicator */}
                  <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    right: '6px',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'rgba(48,209,88,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Plus size={12} color="#30D158" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Phone/Tablet Portrait: Floating Cart Button */}
      {useDrawer && totalItems > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          style={{
            position: 'fixed',
            bottom: 'calc(24px + env(safe-area-inset-bottom))',
            right: '16px',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #30D158, #28a745)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(48,209,88,0.4)',
            zIndex: 100,
          }}
        >
          <ShoppingCart size={24} />
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#FF453A',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 700,
            minWidth: '22px',
            height: '22px',
            borderRadius: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 6px',
          }}>
            {totalItems}
          </div>
        </button>
      )}

      {/* Phone/Tablet Portrait: Send to Kitchen FAB (when cart is closed and has open order) */}
      {useDrawer && currentOpenOrder && currentOpenOrder.items.length > 0 && !showCart && (
        <button
          onClick={handleSendToKitchen}
          disabled={sendToKitchen.isPending}
          style={{
            position: 'fixed',
            bottom: 'calc(24px + env(safe-area-inset-bottom))',
            left: '16px',
            right: '96px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 4px 20px rgba(10,132,255,0.4)',
            zIndex: 100,
            fontSize: '15px',
            fontWeight: 600,
          }}
        >
          <Send size={20} />
          {sendToKitchen.isPending ? 'Gönderiliyor...' : 'Mutfağa Gönder'}
        </button>
      )}

      {/* Phone/Tablet Portrait: Cart Drawer Overlay */}
      {useDrawer && showCart && (
        <div 
          onClick={() => setShowCart(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 200,
          }}
        />
      )}

      {/* Right Panel - Order History (Drawer on Phone/Tablet Portrait, Side panel on Landscape) */}
      <div style={{
        width: useDrawer ? '100%' : '340px',
        height: useDrawer ? '85vh' : '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#1C1C1E',
        borderLeft: showSideBySide ? '1px solid rgba(255,255,255,0.06)' : 'none',
        borderTop: 'none',
        position: useDrawer ? 'fixed' : 'relative',
        bottom: useDrawer ? 0 : 'auto',
        left: useDrawer ? 0 : 'auto',
        right: useDrawer ? 0 : 'auto',
        transform: useDrawer ? (showCart ? 'translateY(0)' : 'translateY(100%)') : 'none',
        transition: 'transform 0.3s ease',
        zIndex: useDrawer ? 300 : 1,
        borderTopLeftRadius: useDrawer ? '20px' : 0,
        borderTopRightRadius: useDrawer ? '20px' : 0,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {/* Drag Handle for Phone/Tablet Portrait */}
        {useDrawer && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '12px',
          }}>
            <div style={{
              width: '36px',
              height: '4px',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '2px',
            }} />
          </div>
        )}

        {/* Header */}
        <div style={{
          padding: isPhone ? '8px 20px 16px' : '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <ShoppingBag size={20} color="#fff" />
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: 600, flex: 1 }}>
            Siparişler
          </span>
          {activeOrders.length > 0 && (
            <span style={{
              background: activeOrders.some(o => o.status === 'sent') ? '#30D158' : '#0A84FF',
              color: '#fff',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
            }}>
              {activeOrders.some(o => o.status === 'sent') ? 'Sipariş Alındı' : 'Açık'}
            </span>
          )}
          {useDrawer && (
            <button
              onClick={() => setShowCart(false)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
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

        {/* Orders List */}
        {activeOrders.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}>
            <div style={{ fontSize: '56px', marginBottom: '16px', opacity: 0.4 }}>📋</div>
            <p style={{ color: '#fff', fontSize: '16px', fontWeight: 500, margin: '0 0 8px' }}>
              Henüz sipariş yok
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0, textAlign: 'center' }}>
              Ürün eklemek için sol taraftan seçin
            </p>
          </div>
        ) : (
          <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
            {activeOrders.map((order) => {
              const isExpanded = expandedOrders.has(order.id);
              const isOpen = order.status === 'open';
              
              return (
                <div 
                  key={order.id}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '14px',
                    marginBottom: '12px',
                    overflow: 'hidden',
                    border: isOpen ? '1px solid rgba(10,132,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {/* Order Header */}
                  <button
                    onClick={() => toggleOrderExpand(order.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: isOpen ? 'rgba(10,132,255,0.15)' : 'rgba(48,209,88,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Clock size={18} color={isOpen ? '#0A84FF' : '#30D158'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        color: '#fff', 
                        fontSize: '14px', 
                        fontWeight: 600,
                        marginBottom: '2px',
                      }}>
                        {formatTime(order.createdAt)}
                        <span style={{ 
                          marginLeft: '8px',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: isOpen ? '#0A84FF' : '#30D158',
                        }}>
                          {isOpen ? '(Düzenlenebilir)' : 'Sipariş Alındı'}
                        </span>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                        {order.items.reduce((s, i) => s + i.quantity, 0)} ürün
                      </div>
                    </div>
                    <div style={{ 
                      color: '#30D158', 
                      fontSize: '16px', 
                      fontWeight: 700,
                      marginRight: '8px',
                    }}>
                      {formatPrice(order.totalAmount)}
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={18} color="rgba(255,255,255,0.4)" />
                    ) : (
                      <ChevronDown size={18} color="rgba(255,255,255,0.4)" />
                    )}
                  </button>

                  {/* Order Items */}
                  {isExpanded && (
                    <div style={{ 
                      padding: '0 16px 16px',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      {order.items.map(item => (
                        <div 
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 0',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                          }}
                        >
                          {/* Product Image */}
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: 'rgba(255,255,255,0.08)',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            {getProductImage(item.productId) ? (
                              <img 
                                src={getProductImage(item.productId)} 
                                alt={item.productName}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <span style={{ fontSize: '18px' }}>☕</span>
                            )}
                          </div>

                          {/* Item Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              color: '#fff',
                              fontSize: '14px',
                              fontWeight: 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {item.productName}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                              {formatPrice(item.unitPrice)} × {item.quantity}
                            </div>
                          </div>

                          {/* Item Total */}
                          <div style={{
                            color: '#0A84FF',
                            fontSize: '14px',
                            fontWeight: 600,
                          }}>
                            {formatPrice(item.totalPrice)}
                          </div>

                          {/* Remove Button (only for open orders) */}
                          {isOpen && (
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleRemoveItem(order.id, item.id); 
                              }}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                background: 'rgba(255,69,58,0.15)',
                                border: 'none',
                                color: '#FF453A',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer - Garson için tutar gizli */}
        {activeOrders.length > 0 && (
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(0,0,0,0.3)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                {totalItems} ürün
              </span>
            </div>
            
            {/* Send to Kitchen Button - only if there's an open order with items */}
            {currentOpenOrder && currentOpenOrder.items.length > 0 && (
              <button
                onClick={() => {
                  handleSendToKitchen();
                  if (isPhone) setShowCart(false);
                }}
                disabled={sendToKitchen.isPending}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #30D158, #28a745)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 0 30px rgba(48,209,88,0.3)',
                  opacity: sendToKitchen.isPending ? 0.7 : 1,
                  marginBottom: '10px',
                }}
              >
                <Send size={18} />
                {sendToKitchen.isPending ? 'Gönderiliyor...' : 'Mutfağa Gönder'}
              </button>
            )}
            
            {/* Status Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              background: currentOpenOrder 
                ? 'rgba(10,132,255,0.15)' 
                : 'rgba(48,209,88,0.15)',
              borderRadius: '10px',
            }}>
              <Check size={16} color={currentOpenOrder ? '#0A84FF' : '#30D158'} />
              <span style={{ 
                color: currentOpenOrder ? '#0A84FF' : '#30D158',
                fontSize: '13px',
                fontWeight: 500,
              }}>
                {currentOpenOrder 
                  ? 'Sipariş açık - Ürün ekleyebilirsiniz'
                  : 'Sipariş alındı'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
