import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Search, Plus, Minus, X, Printer, Percent, Lock, Monitor } from 'lucide-react';
import { tablesApi, productsApi, categoriesApi, ordersApi, printersApi } from '@/services/api';
import type { Product, Order } from '@/services/api';
import { markOrderSentFromPOS } from '@/App';

// Get current user from localStorage
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) return JSON.parse(userStr);
  } catch {}
  return null;
};

// Check if user can take payments
const canTakePayment = () => {
  const user = getCurrentUser();
  if (!user) return false;
  // Waiter cannot take payments
  return user.role !== 'waiter';
};

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function OrderScreen() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Discount modal state
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [discountApplying, setDiscountApplying] = useState(false);
  const [displaySent, setDisplaySent] = useState(false);

  // Send to customer display handler - via API
  const handleSendToDisplay = useCallback(async () => {
    if (currentOrder) {
      try {
        // Send to API - this will notify CustomerDisplay via polling
        const response = await fetch(`${API_URL}/orders/display/set`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: currentOrder.id }),
        });
        
        if (response.ok) {
          setDisplaySent(true);
          setTimeout(() => setDisplaySent(false), 2000);
          console.log('[OrderScreen] Sent order to customer display via API:', currentOrder.orderNumber);
        } else {
          console.error('[OrderScreen] Failed to send to display');
        }
      } catch (error) {
        console.error('[OrderScreen] Error sending to display:', error);
      }
    }
  }, [currentOrder]);

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
    mutationFn: async (orderId: string) => {
      // Mark this order as sent from POS to avoid double printing
      markOrderSentFromPOS(orderId);
      
      // First send to API
      const order = await ordersApi.sendToKitchen(orderId);
      
      // Then print directly from Electron if available
      if (window.electronAPI?.isElectron && window.electronAPI.printKitchenTicket) {
        try {
          // Get printers and categories from API
          const [printers, allCategories] = await Promise.all([
            printersApi.getAll(),
            categoriesApi.getAll(),
          ]);
          
          const kitchenPrinters = printers.filter(p => (p.type === 'kitchen' || p.type === 'bar') && p.isActive && p.ipAddress);
          
          if (kitchenPrinters.length > 0) {
            // Build category -> printer map
            const categoryPrinterMap = new Map<string, string>();
            allCategories.forEach((cat: any) => {
              if (cat.printerId) {
                categoryPrinterMap.set(cat.id, cat.printerId);
              }
            });

            // Build product -> category map from products in order
            const productCategoryMap = new Map<string, string>();
            const allProducts = await productsApi.getAll();
            allProducts.forEach((prod: any) => {
              productCategoryMap.set(prod.id, prod.categoryId);
            });

            // Find default kitchen printer (fallback)
            const defaultKitchenPrinter = kitchenPrinters.find(p => p.type === 'kitchen');

            // Group items by printer
            const printerItemsMap = new Map<string, any[]>();
            
            for (const item of order.items) {
              const categoryId = productCategoryMap.get(item.productId);
              let printerId = categoryId ? categoryPrinterMap.get(categoryId) : null;
              
              // Fallback to default kitchen printer if no category printer
              if (!printerId && defaultKitchenPrinter) {
                printerId = defaultKitchenPrinter.id;
              }
              
              if (printerId) {
                if (!printerItemsMap.has(printerId)) {
                  printerItemsMap.set(printerId, []);
                }
                printerItemsMap.get(printerId)!.push({
                  productName: item.productName,
                  quantity: item.quantity,
                  notes: item.notes,
                });
              }
            }

            // Print to each printer with its items
            for (const [printerId, items] of printerItemsMap) {
              const printer = kitchenPrinters.find(p => p.id === printerId);
              if (!printer || !printer.ipAddress) continue;

              const orderData = {
                orderNumber: order.orderNumber,
                tableName: table?.name || 'Bilinmiyor',
                items,
              };

              try {
                await window.electronAPI.printKitchenTicket({
                  order: orderData,
                  printerIp: printer.ipAddress,
                  printerPort: printer.port || 9100,
                });
                console.log(`Kitchen ticket sent to ${printer.name} (${printer.ipAddress})`);
              } catch (err) {
                console.error(`Failed to print to ${printer.name}:`, err);
              }
            }
          }
        } catch (error) {
          console.error('Kitchen print error:', error);
          // Don't fail the mutation, just log the error
        }
      }
      
      return order;
    },
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

  const printReceiptMutation = useMutation({
    mutationFn: async (orderId: string) => {
      // Check if running in Electron - use direct printing
      if (window.electronAPI?.isElectron) {
        try {
          // Get receipt printer from API
          const printers = await printersApi.getAll();
          const receiptPrinter = printers.find(p => p.type === 'receipt' && p.isActive);
          
          if (!receiptPrinter || !receiptPrinter.ipAddress) {
            return { success: false, message: 'Adisyon yazıcısı bulunamadı. Ayarlardan yazıcı ekleyin.' };
          }
          
          if (!currentOrder) {
            return { success: false, message: 'Sipariş bulunamadı' };
          }
          
          // Prepare order data for printing
          const orderData = {
            orderNumber: currentOrder.orderNumber,
            tableName: table?.name || 'Bilinmiyor',
            items: currentOrder.items.map(item => ({
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: Number(item.unitPrice),
              totalPrice: Number(item.totalPrice),
              notes: item.notes,
            })),
            totalAmount: Number(currentOrder.totalAmount),
            discountAmount: (currentOrder as any).discountAmount,
          };
          
          // Print directly via Electron
          const result = await window.electronAPI.printReceipt({
            order: orderData,
            printerIp: receiptPrinter.ipAddress,
            printerPort: receiptPrinter.port || 9100,
            businessName: 'QUEEN WAFFLE',
          });
          
          return result;
        } catch (error: any) {
          console.error('Electron print error:', error);
          return { success: false, message: error.message || 'Yazdırma hatası' };
        }
      }
      
      // Fallback to API (won't work if API is on cloud and printer is local)
      return ordersApi.printReceipt(orderId);
    },
    onSuccess: (result) => {
      if (result.success) {
        console.log('Adisyon yazdırıldı');
      } else {
        alert(result.message || 'Adisyon yazdırılamadı');
      }
    },
    onError: (error: any) => {
      alert(error.message || 'Adisyon yazdırma hatası');
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

  // Apply discount
  const handleApplyDiscount = async () => {
    if (!currentOrder || !discountValue) return;
    
    setDiscountApplying(true);
    try {
      const value = parseFloat(discountValue);
      if (isNaN(value) || value <= 0) {
        alert('Geçerli bir değer girin');
        return;
      }
      
      const response = await fetch(`${API_URL}/orders/${currentOrder.id}/discount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: discountType,
          value: value,
        }),
      });
      
      if (response.ok) {
        const updatedOrder = await response.json();
        setCurrentOrder(updatedOrder);
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        setShowDiscountModal(false);
        setDiscountValue('');
      } else {
        const error = await response.json();
        alert(error.message || 'İndirim uygulanamadı');
      }
    } catch (error) {
      alert('İndirim uygulanırken hata oluştu');
    } finally {
      setDiscountApplying(false);
    }
  };

  // Remove discount
  const handleRemoveDiscount = async () => {
    if (!currentOrder) return;
    
    try {
      const response = await fetch(`${API_URL}/orders/${currentOrder.id}/discount`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        const updatedOrder = await response.json();
        setCurrentOrder(updatedOrder);
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }
    } catch (error) {
      console.error('İndirim kaldırılamadı:', error);
    }
  };

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
            KATEGORİLER - Grid Layout (Scroll Yok)
            ───────────────────────────────────────────────────────────────── */}
        <div style={{ padding: '0 32px 24px' }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: selectedCategory === category.id 
                    ? '2px solid #0A84FF' 
                    : '1px solid rgba(255,255,255,0.1)',
                  background: selectedCategory === category.id 
                    ? 'rgba(10,132,255,0.15)' 
                    : 'rgba(255,255,255,0.04)',
                  color: selectedCategory === category.id ? '#0A84FF' : 'rgba(255,255,255,0.7)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
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
          <div style={{ padding: '16px 24px' }}>
            {/* İndirim varsa göster */}
            {(currentOrder as any)?.discountAmount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#FF9F0A', fontSize: '13px' }}>
                    İndirim ({(currentOrder as any)?.discountType === 'percent' ? `%${(currentOrder as any)?.discountValue}` : `₺${(currentOrder as any)?.discountValue}`})
                  </span>
                  <button
                    onClick={handleRemoveDiscount}
                    style={{ background: 'none', border: 'none', color: '#FF453A', cursor: 'pointer', padding: '2px' }}
                  >
                    <X size={12} />
                  </button>
                </div>
                <span style={{ color: '#FF9F0A', fontSize: '14px', fontWeight: 600 }}>
                  -₺{(currentOrder as any)?.discountAmount?.toFixed(0)}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Toplam</span>
              <span style={{ color: '#30D158', fontSize: '28px', fontWeight: 700 }}>{formatPrice(total)}</span>
            </div>
          </div>

          {/* Butonlar */}
          <div style={{ padding: '0 24px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleSendToKitchen}
                disabled={!currentOrder || currentOrder.items.length === 0 || currentOrder.status !== 'open'}
                style={{ 
                  flex: 1,
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

              {/* İndirim Butonu */}
              <button
                onClick={() => setShowDiscountModal(true)}
                disabled={!currentOrder || currentOrder.items.length === 0}
                title="İndirim Uygula"
                style={{ 
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'rgba(191,90,242,0.15)',
                  color: '#BF5AF2',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: (!currentOrder || currentOrder.items.length === 0) ? 0.3 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Percent size={18} />
              </button>

              <button
                onClick={() => currentOrder && printReceiptMutation.mutate(currentOrder.id)}
                disabled={!currentOrder || currentOrder.items.length === 0 || printReceiptMutation.isPending}
                title="Adisyon Yazdır"
                style={{ 
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'rgba(255,159,10,0.15)',
                  color: '#FF9F0A',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: (!currentOrder || currentOrder.items.length === 0 || printReceiptMutation.isPending) ? 0.3 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Printer size={18} />
              </button>

              {/* Ekrana Gönder Butonu */}
              <button
                onClick={handleSendToDisplay}
                disabled={!currentOrder || currentOrder.items.length === 0}
                title="Müşteri Ekranına Gönder"
                style={{ 
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: displaySent ? 'rgba(48,209,88,0.3)' : 'rgba(10,132,255,0.15)',
                  color: displaySent ? '#30D158' : '#0A84FF',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: (!currentOrder || currentOrder.items.length === 0) ? 0.3 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <Monitor size={18} />
              </button>
            </div>

            <button
              onClick={() => {
                if (!canTakePayment()) {
                  alert('Ödeme alma yetkiniz yok. Lütfen yetkili bir kullanıcıya başvurun.');
                  return;
                }
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
                background: canTakePayment() ? '#30D158' : 'rgba(255,255,255,0.1)',
                color: canTakePayment() ? '#000' : 'rgba(255,255,255,0.4)',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: (!currentOrder || currentOrder.items.length === 0) ? 0.3 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {!canTakePayment() && <Lock size={16} />}
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

      {/* ══════════════════════════════════════════════════════════════════
          İNDİRİM MODALI
          ══════════════════════════════════════════════════════════════════ */}
      {showDiscountModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#1C1C1E',
            borderRadius: '24px',
            padding: '32px',
            width: '400px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 600, margin: 0 }}>İndirim Uygula</h2>
              <button
                onClick={() => { setShowDiscountModal(false); setDiscountValue(''); }}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Discount Type Toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <button
                onClick={() => { setDiscountType('percent'); setDiscountValue(''); }}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: discountType === 'percent' ? '2px solid #BF5AF2' : '1px solid rgba(255,255,255,0.1)',
                  background: discountType === 'percent' ? 'rgba(191,90,242,0.15)' : 'rgba(255,255,255,0.04)',
                  color: discountType === 'percent' ? '#BF5AF2' : 'rgba(255,255,255,0.6)',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                % Oran
              </button>
              <button
                onClick={() => { setDiscountType('amount'); setDiscountValue(''); }}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: discountType === 'amount' ? '2px solid #0A84FF' : '1px solid rgba(255,255,255,0.1)',
                  background: discountType === 'amount' ? 'rgba(10,132,255,0.15)' : 'rgba(255,255,255,0.04)',
                  color: discountType === 'amount' ? '#0A84FF' : 'rgba(255,255,255,0.6)',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ₺ Tutar
              </button>
            </div>

            {/* Value Display */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '16px',
            }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '8px' }}>
                {discountType === 'percent' ? 'İndirim Oranı' : 'İndirim Tutarı'}
              </div>
              <div style={{ 
                color: discountType === 'percent' ? '#BF5AF2' : '#0A84FF', 
                fontSize: '48px', 
                fontWeight: 700,
              }}>
                {discountType === 'percent' ? '%' : '₺'}{discountValue || '0'}
              </div>
              {discountValue && currentOrder && (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '8px' }}>
                  İndirim: ₺{discountType === 'percent' 
                    ? ((parseFloat(String(currentOrder.totalAmount)) * parseFloat(discountValue) / 100) || 0).toFixed(0)
                    : discountValue
                  }
                </div>
              )}
            </div>

            {/* Quick Amounts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {discountType === 'percent' 
                ? ['5', '10', '15', '20'].map(v => (
                    <button
                      key={v}
                      onClick={() => setDiscountValue(v)}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: discountValue === v ? 'rgba(191,90,242,0.2)' : 'rgba(255,255,255,0.06)',
                        color: discountValue === v ? '#BF5AF2' : '#fff',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      %{v}
                    </button>
                  ))
                : ['10', '20', '50', '100'].map(v => (
                    <button
                      key={v}
                      onClick={() => setDiscountValue(v)}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: discountValue === v ? 'rgba(10,132,255,0.2)' : 'rgba(255,255,255,0.06)',
                        color: discountValue === v ? '#0A84FF' : '#fff',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ₺{v}
                    </button>
                  ))
              }
            </div>

            {/* Numpad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' }}>
              {['1','2','3','4','5','6','7','8','9','C','0','⌫'].map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'C') setDiscountValue('');
                    else if (key === '⌫') setDiscountValue(prev => prev.slice(0, -1));
                    else setDiscountValue(prev => prev + key);
                  }}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: key === 'C' ? 'rgba(255,69,58,0.15)' : 'rgba(255,255,255,0.06)',
                    color: key === 'C' ? '#FF453A' : '#fff',
                    fontSize: '20px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Apply Button */}
            <button
              onClick={handleApplyDiscount}
              disabled={!discountValue || discountApplying}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '14px',
                border: 'none',
                background: discountValue ? (discountType === 'percent' ? '#BF5AF2' : '#0A84FF') : 'rgba(255,255,255,0.06)',
                color: discountValue ? '#fff' : 'rgba(255,255,255,0.3)',
                fontSize: '16px',
                fontWeight: 600,
                cursor: discountValue ? 'pointer' : 'not-allowed',
              }}
            >
              {discountApplying ? 'Uygulanıyor...' : 'İndirimi Uygula'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
