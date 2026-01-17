import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2, Plus, Check, ShoppingBag, Search, Package, Clock, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { tablesApi, productsApi, categoriesApi, ordersApi } from '@/services/api';
import type { Product } from '@/services/api';

// Responsive breakpoint hook
function useIsPortrait() {
  const [isPortrait, setIsPortrait] = useState(window.innerWidth < 900);
  
  useEffect(() => {
    const handleResize = () => setIsPortrait(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isPortrait;
}

export default function OrderScreen() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isPortrait = useIsPortrait();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSentSuccess, setShowSentSuccess] = useState(false);

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

  // Toplam tutar
  const totalAmount = activeOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const totalItems = activeOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

  return (
    <div style={{
      display: 'flex',
      flexDirection: isPortrait ? 'column' : 'row',
      height: '100vh',
      background: '#000',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      overflow: isPortrait ? 'auto' : 'hidden',
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
        minHeight: isPortrait ? 'auto' : '100vh',
      }}>
        {/* Header */}
        <header style={{
          height: '64px',
          background: 'rgba(20,20,20,0.95)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '0 20px',
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
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ color: '#fff', fontSize: '18px', fontWeight: 600, margin: 0 }}>
              {table?.name || 'Masa'}
            </h1>
            {table?.zone && (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '2px 0 0' }}>
                {table.zone}
              </p>
            )}
          </div>
          {totalItems > 0 && (
            <div style={{
              background: 'rgba(48,209,88,0.15)',
              color: '#30D158',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
            }}>
              {formatPrice(totalAmount)}
            </div>
          )}
        </header>

        {/* Search */}
        <div style={{ padding: '16px 20px 12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <Search size={18} color="rgba(255,255,255,0.4)" />
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
          </div>
        </div>

        {/* Categories - Large Touch Targets */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '8px',
          padding: '0 16px 16px',
        }}>
          {activeCategories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setSearchQuery(''); }}
                style={{
                  padding: '14px 8px',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid #0A84FF' : '1px solid rgba(255,255,255,0.1)',
                  background: isSelected 
                    ? 'rgba(10,132,255,0.2)' 
                    : 'rgba(255,255,255,0.04)',
                  color: isSelected ? '#0A84FF' : 'rgba(255,255,255,0.8)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                  textAlign: 'center',
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
          padding: '0 20px 20px',
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
              <Package size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p style={{ fontSize: '15px', margin: 0 }}>Ürün bulunamadı</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '12px',
            }}>
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleAddProduct(product)}
                  style={{
                    position: 'relative',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '16px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                  }}
                >
                  {/* Product Image or Placeholder */}
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    margin: '0 auto 12px',
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
                      <span style={{ fontSize: '28px' }}>☕</span>
                    )}
                  </div>

                  {/* Product Name */}
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#fff',
                    marginBottom: '6px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {product.name}
                  </div>

                  {/* Price */}
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#0A84FF',
                  }}>
                    {formatPrice(product.price)}
                  </div>

                  {/* Add indicator */}
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(48,209,88,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Plus size={14} color="#30D158" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Order History (Bottom on Portrait) */}
      <div style={{
        width: isPortrait ? '100%' : '380px',
        display: 'flex',
        flexDirection: 'column',
        background: '#1C1C1E',
        borderLeft: isPortrait ? 'none' : '1px solid rgba(255,255,255,0.06)',
        borderTop: isPortrait ? '1px solid rgba(255,255,255,0.06)' : 'none',
        maxHeight: isPortrait ? '50vh' : '100vh',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
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

        {/* Footer - Total */}
        {activeOrders.length > 0 && (
          <div style={{
            padding: '20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(0,0,0,0.3)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                Toplam ({totalItems} ürün)
              </span>
              <span style={{ color: '#fff', fontSize: '24px', fontWeight: 700 }}>
                {formatPrice(totalAmount)}
              </span>
            </div>
            
            {/* Send to Kitchen Button - only if there's an open order with items */}
            {currentOpenOrder && currentOpenOrder.items.length > 0 && (
              <button
                onClick={handleSendToKitchen}
                disabled={sendToKitchen.isPending}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #30D158, #28a745)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 0 30px rgba(48,209,88,0.3)',
                  opacity: sendToKitchen.isPending ? 0.7 : 1,
                  marginBottom: '12px',
                }}
              >
                <Send size={20} />
                {sendToKitchen.isPending ? 'Gönderiliyor...' : 'Mutfağa Gönder'}
              </button>
            )}
            
            {/* Status Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              background: currentOpenOrder 
                ? 'rgba(10,132,255,0.15)' 
                : 'rgba(48,209,88,0.15)',
              borderRadius: '12px',
            }}>
              <Check size={18} color={currentOpenOrder ? '#0A84FF' : '#30D158'} />
              <span style={{ 
                color: currentOpenOrder ? '#0A84FF' : '#30D158',
                fontSize: '14px',
                fontWeight: 500,
              }}>
                {currentOpenOrder 
                  ? 'Sipariş açık - Ürün ekleyebilirsiniz'
                  : 'Sipariş alındı - Yeni ürün ekleyebilirsiniz'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
