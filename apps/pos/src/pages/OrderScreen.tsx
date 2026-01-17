import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Search, Plus, Minus, X } from 'lucide-react';
import { tablesApi, productsApi, categoriesApi, ordersApi } from '@/services/api';
import type { Product, Order } from '@/services/api';

export default function OrderScreen() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Queries
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

  const { data: tableOrders = [] } = useQuery({
    queryKey: ['orders', 'table', tableId],
    queryFn: () => ordersApi.getByTable(tableId!),
    enabled: !!tableId,
  });

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  // tableId değiştiğinde currentOrder'ı sıfırla
  useEffect(() => {
    setCurrentOrder(null);
  }, [tableId]);

  useEffect(() => {
    const openOrder = tableOrders.find((o) => o.status === 'open' || o.status === 'sent');
    setCurrentOrder(openOrder || null);
  }, [tableOrders]);

  // Mutations
  const createOrderMutation = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: (order) => {
      setCurrentOrder(order);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: { productId: string; quantity: number } }) =>
      ordersApi.addItem(orderId, data),
    onSuccess: (order) => {
      setCurrentOrder(order);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: string; itemId: string }) =>
      ordersApi.removeItem(orderId, itemId),
    onSuccess: (order) => {
      setCurrentOrder(order);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const sendToKitchenMutation = useMutation({
    mutationFn: ordersApi.sendToKitchen,
    onSuccess: (order) => {
      setCurrentOrder(order);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ordersApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      navigate('/tables');
    },
  });

  // Handlers
  const handleProductClick = async (product: Product) => {
    if (!currentOrder) {
      const newOrder = await createOrderMutation.mutateAsync({ tableId: tableId! });
      addItemMutation.mutate({ orderId: newOrder.id, data: { productId: product.id, quantity: 1 } });
    } else {
      addItemMutation.mutate({ orderId: currentOrder.id, data: { productId: product.id, quantity: 1 } });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (currentOrder) {
      removeItemMutation.mutate({ orderId: currentOrder.id, itemId });
    }
  };

  const handleIncreaseQuantity = (productId: string) => {
    if (currentOrder) {
      addItemMutation.mutate({ orderId: currentOrder.id, data: { productId, quantity: 1 } });
    }
  };

  const handleDecreaseQuantity = (itemId: string, productId: string, currentQty: number) => {
    if (!currentOrder) return;
    if (currentQty <= 1) {
      handleRemoveItem(itemId);
    } else {
      // Miktarı 1 azalt - API'ye -1 gönder
      addItemMutation.mutate({ orderId: currentOrder.id, data: { productId, quantity: -1 } });
    }
  };

  const handleSendToKitchen = () => {
    if (currentOrder) sendToKitchenMutation.mutate(currentOrder.id);
  };

  const handleCancel = useCallback(() => {
    if (currentOrder && confirm('Siparişi iptal etmek istediğinize emin misiniz?')) {
      cancelMutation.mutate(currentOrder.id);
    }
  }, [currentOrder, cancelMutation]);

  const formatPrice = (value: number | string) => {
    const num = typeof value === 'number' ? value : parseFloat(value) || 0;
    return `₺${num.toFixed(0)}`;
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && p.isActive;
  });

  const total = currentOrder?.totalAmount || 0;
  const itemCount = currentOrder?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div style={{ 
      display: 'flex', 
      height: '100%', 
      background: '#000',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
      overflow: 'hidden',
    }}>
      
      {/* ══════════════════════════════════════════════════════════════════
          SOL PANEL - ÜRÜN SEÇİMİ
          ══════════════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        
        {/* ─────────────────────────────────────────────────────────────────
            HEADER
            ───────────────────────────────────────────────────────────────── */}
        <header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '24px 32px',
        }}>
          {/* Sol: Geri + Masa */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button
              onClick={() => navigate('/tables')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                background: 'none',
                border: 'none',
                color: '#0A84FF',
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={20} />
              <span>Masalar</span>
            </button>

            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '12px',
                background: 'rgba(48,209,88,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#30D158',
                fontSize: '18px',
                fontWeight: 700,
              }}>
                {table?.name?.replace('Masa ', '') || '?'}
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: '17px', fontWeight: 600 }}>
                  {table?.name || 'Masa'}
                </div>
                {currentOrder && (
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '2px' }}>
                    #{currentOrder.orderNumber}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sağ: Arama */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            width: '280px',
          }}>
            <Search size={18} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '15px',
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
              </button>
            )}
          </div>
        </header>

        {/* ─────────────────────────────────────────────────────────────────
            KATEGORİLER - Apple Segment Control
            ───────────────────────────────────────────────────────────────── */}
        <div style={{ padding: '0 32px 24px' }}>
          <div style={{ 
            display: 'inline-flex', 
            gap: '4px',
            padding: '4px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
          }}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: selectedCategory === category.id ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: selectedCategory === category.id ? '#fff' : 'rgba(255,255,255,0.5)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            ÜRÜN GRİD
            ───────────────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 32px 32px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '16px',
          }}>
            {filteredProducts.map((product) => {
              const inCart = currentOrder?.items.find(i => i.productId === product.id);
              const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
              
              return (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    borderRadius: '16px',
                    border: inCart ? '1px solid rgba(48,209,88,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    background: inCart ? 'rgba(48,209,88,0.08)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    minHeight: '120px',
                    transition: 'all 0.15s',
                  }}
                >
                  {inCart && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#30D158',
                      color: '#000',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {inCart.quantity}
                    </div>
                  )}
                  
                  <span style={{ 
                    color: '#fff', 
                    fontSize: '15px', 
                    fontWeight: 500,
                    lineHeight: 1.3,
                    marginBottom: 'auto',
                  }}>
                    {product.name}
                  </span>
                  
                  <span style={{ 
                    color: '#30D158', 
                    fontSize: '18px', 
                    fontWeight: 700,
                    marginTop: '12px',
                  }}>
                    {formatPrice(price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SAĞ PANEL - SEPET
          ══════════════════════════════════════════════════════════════════ */}
      <aside style={{ 
        width: '360px', 
        height: '100%',
        display: 'flex', 
        flexDirection: 'column',
        background: 'rgba(255,255,255,0.02)',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        
        {/* Header */}
        <div style={{ 
          padding: '24px', 
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Sipariş
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
              {itemCount} ürün
            </span>
          </div>
        </div>

        {/* Ürün Listesi */}
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {!currentOrder || currentOrder.items.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: 'rgba(255,255,255,0.25)',
              fontSize: '14px',
            }}>
              Sepet boş
            </div>
          ) : (
            <div style={{ padding: '12px 20px' }}>
              {[...currentOrder.items].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((item, idx) => {
                const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(item.unitPrice) || 0;
                const totalPrice = typeof item.totalPrice === 'number' ? item.totalPrice : parseFloat(item.totalPrice) || 0;
                
                return (
                  <div key={item.id}>
                    {idx > 0 && (
                      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
                    )}
                    
                    <div style={{ padding: '6px 0' }}>
                      {/* Tek satır: İsim, Miktar, Fiyat, Sil */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* İsim */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: '#fff', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.productName}
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' }}>
                            {formatPrice(unitPrice)}
                          </div>
                        </div>

                        {/* Miktar Kontrol */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button 
                            onClick={() => handleDecreaseQuantity(item.id, item.productId, item.quantity)}
                            style={{ 
                              width: '26px', 
                              height: '26px', 
                              borderRadius: '50%',
                              border: 'none',
                              background: 'rgba(255,255,255,0.08)',
                              color: 'rgba(255,255,255,0.6)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => handleIncreaseQuantity(item.productId)}
                            style={{ 
                              width: '26px', 
                              height: '26px', 
                              borderRadius: '50%',
                              border: 'none',
                              background: 'rgba(255,255,255,0.08)',
                              color: 'rgba(255,255,255,0.6)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        
                        {/* Fiyat */}
                        <span style={{ color: '#30D158', fontSize: '14px', fontWeight: 600, minWidth: '60px', textAlign: 'right' }}>
                          {formatPrice(totalPrice)}
                        </span>

                        {/* Sil */}
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer',
                            padding: '4px',
                            color: 'rgba(255,255,255,0.3)',
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Alt Kısım - Sabit */}
        <div style={{ 
          borderTop: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
          background: 'rgba(0,0,0,0.5)',
        }}>
          {/* Toplam */}
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Toplam</span>
            <span style={{ color: '#30D158', fontSize: '28px', fontWeight: 700 }}>{formatPrice(total)}</span>
          </div>

          {/* Butonlar */}
          <div style={{ padding: '0 24px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={handleSendToKitchen}
              disabled={!currentOrder || currentOrder.items.length === 0 || currentOrder.status !== 'open'}
              style={{ 
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: (!currentOrder || currentOrder.items.length === 0 || currentOrder.status !== 'open') ? 0.3 : 1,
              }}
            >
              Mutfağa Gönder
            </button>

            <button
              onClick={() => {
                if (currentOrder) {
                  navigate(`/payment/${currentOrder.id}`, { state: { order: currentOrder } });
                }
              }}
              disabled={!currentOrder || currentOrder.items.length === 0}
              style={{ 
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: '#30D158',
                color: '#000',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: (!currentOrder || currentOrder.items.length === 0) ? 0.3 : 1,
              }}
            >
              Ödeme Al
            </button>

            {currentOrder && currentOrder.items.length > 0 && (
              <button
                onClick={handleCancel}
                style={{ 
                  width: '100%',
                  padding: '10px',
                  background: 'none',
                  border: 'none',
                  color: '#FF453A',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Siparişi İptal Et
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
