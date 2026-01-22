import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

// Types
interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

interface Order {
  id: string;
  tableId: string;
  tableName?: string;
  orderNumber: string;
  status: string;
  items: OrderItem[];
  totalAmount: number;
  subtotal?: number;
  discountType?: 'percent' | 'amount';
  discountValue?: number;
  discountAmount?: number;
  createdAt: string;
}

interface BusinessSettings {
  storeName: string;
  logoUrl: string;
  address?: string;
  phone?: string;
  displayVideos?: string[];
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const fetchSettings = async (): Promise<BusinessSettings> => {
  try {
    const res = await fetch(`${API_BASE}/settings/business`);
    if (!res.ok) throw new Error('Not found');
    return res.json();
  } catch {
    return { storeName: '', logoUrl: '' };
  }
};

export default function CustomerDisplay() {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animatingItems, setAnimatingItems] = useState<Set<string>>(new Set());
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const prevOrderRef = useRef<Order | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Poll API for current display order (set by POS monitor button)
  const { data: displayOrder } = useQuery({
    queryKey: ['displayCurrentOrder'],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_BASE}/orders/display/current`);
        if (!res.ok) return null;
        const order = await res.json();
        return order;
      } catch {
        return null;
      }
    },
    refetchInterval: 1000, // Poll every 1 second
    staleTime: 500,
  });

  // Update display when order changes
  useEffect(() => {
    if (displayOrder) {
      // Check if order actually changed
      const orderChanged = displayOrder.id !== currentOrder?.id || 
          displayOrder.items?.length !== currentOrder?.items?.length ||
          displayOrder.totalAmount !== currentOrder?.totalAmount;
      
      if (orderChanged) {
        console.log('[CustomerDisplay] Order updated:', displayOrder.orderNumber);
        
        // Animate new items
        if (prevOrderRef.current && displayOrder.items) {
          const newIds = displayOrder.items
            .filter((item: OrderItem) => !prevOrderRef.current?.items.find(i => i.id === item.id))
            .map((item: OrderItem) => item.id);
          if (newIds.length > 0) {
            setAnimatingItems(new Set(newIds));
            setTimeout(() => setAnimatingItems(new Set()), 600);
          }
        }
        
        prevOrderRef.current = displayOrder;
        setCurrentOrder(displayOrder);
      }
    } else if (currentOrder && !displayOrder) {
      console.log('[CustomerDisplay] Order cleared');
      setCurrentOrder(null);
      prevOrderRef.current = null;
    }
  }, [displayOrder, currentOrder]);

  const { data: settings } = useQuery({
    queryKey: ['businessSettings'],
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 5,
  });

  const videos = settings?.displayVideos || [];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVideoEnded = () => {
    if (videos.length > 1) {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const hasOrder = currentOrder && currentOrder.items && currentOrder.items.length > 0;
  const hasDiscount = currentOrder?.discountAmount && currentOrder.discountAmount > 0;
  const itemCount = currentOrder?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal = currentOrder?.subtotal || currentOrder?.items?.reduce((sum, item) => sum + Number(item.totalPrice), 0) || 0;

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: '#000',
      display: 'flex',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      overflow: 'hidden',
    }}>
      
      {/* SOL TARAF - VİDEO */}
      <div style={{
        width: '40%',
        height: '100%',
        background: '#0a0a0a',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {videos.length > 0 ? (
          <video
            ref={videoRef}
            key={videos[currentVideoIndex]}
            src={videos[currentVideoIndex]}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnded}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1a1a2e 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 15s ease infinite',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '20%',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(10,132,255,0.2) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(40px)',
              animation: 'float 8s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '30%',
              right: '15%',
              width: '250px',
              height: '250px',
              background: 'radial-gradient(circle, rgba(48,209,88,0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(50px)',
              animation: 'float 10s ease-in-out infinite reverse',
            }} />
            
            {settings?.logoUrl && (
              <img 
                src={settings.logoUrl} 
                alt=""
                style={{
                  maxWidth: '60%',
                  maxHeight: '30%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
                  animation: 'pulse 3s ease-in-out infinite',
                }}
              />
            )}
            
            <div style={{
              marginTop: '40px',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '4px',
              textTransform: 'uppercase',
            }}>
              Video eklemek için ayarlara gidin
            </div>
          </div>
        )}
        
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '150px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* SAĞ TARAF - SİPARİŞ veya LOGO */}
      <div style={{
        flex: 1,
        height: '100%',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #0d1117 50%, #0a0a0a 100%)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
      }}>
        
        {hasOrder && (
          <div style={{
            position: 'absolute',
            top: '-100px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '500px',
            height: '300px',
            background: hasDiscount 
              ? 'radial-gradient(ellipse, rgba(255,159,10,0.15) 0%, transparent 70%)'
              : 'radial-gradient(ellipse, rgba(48,209,88,0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }} />
        )}

        {!hasOrder ? (
          /* IDLE STATE */
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}>
            {settings?.logoUrl ? (
              <>
                <img 
                  src={settings.logoUrl} 
                  alt=""
                  style={{
                    maxWidth: '300px',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
                    animation: 'fadeInUp 1s ease-out',
                  }}
                />
                <div style={{
                  marginTop: '48px',
                  fontSize: '32px',
                  fontWeight: 300,
                  color: 'rgba(255,255,255,0.6)',
                  letterSpacing: '10px',
                  textTransform: 'uppercase',
                  animation: 'fadeInUp 1s ease-out 0.3s both',
                }}>
                  Hoş Geldiniz
                </div>
              </>
            ) : (
              <>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '28px',
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '40px' }}>☕</span>
                </div>
                <div style={{
                  marginTop: '32px',
                  fontSize: '28px',
                  fontWeight: 300,
                  color: 'rgba(255,255,255,0.6)',
                  letterSpacing: '8px',
                  textTransform: 'uppercase',
                }}>
                  Hoş Geldiniz
                </div>
              </>
            )}
            
            <div style={{
              marginTop: '60px',
              fontSize: '72px',
              fontWeight: 200,
              color: 'rgba(255,255,255,0.8)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-2px',
            }}>
              {formatTime(currentTime)}
            </div>
            
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.3)',
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#30D158',
              }} />
              Bağlı
            </div>
          </div>
        ) : (
          /* ORDER STATE */
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '32px',
            position: 'relative',
            zIndex: 1,
          }}>
            
            <header style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              animation: 'fadeInDown 0.5s ease-out',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {settings?.logoUrl && (
                  <img 
                    src={settings.logoUrl} 
                    alt=""
                    style={{ 
                      height: '40px', 
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                    }}
                  />
                )}
                <div>
                  <h1 style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#fff',
                    margin: 0,
                  }}>
                    Siparişiniz
                  </h1>
                  <p style={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.4)',
                    margin: '2px 0 0',
                  }}>
                    #{currentOrder.orderNumber} • {itemCount} ürün
                  </p>
                </div>
              </div>
              
              <div style={{
                fontSize: '28px',
                fontWeight: 200,
                color: 'rgba(255,255,255,0.6)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {formatTime(currentTime)}
              </div>
            </header>

            <div style={{
              flex: 1,
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(40px)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'fadeInUp 0.6s ease-out 0.1s both',
            }}>
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '8px 0',
              }}>
                {currentOrder.items.map((item, index) => {
                  const isAnimating = animatingItems.has(item.id);
                  const isLast = index === currentOrder.items.length - 1;
                  
                  return (
                    <div
                      key={item.id || index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px 24px',
                        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
                        animation: isAnimating ? 'itemSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                        background: isAnimating ? 'rgba(48,209,88,0.08)' : 'transparent',
                        transition: 'background 0.3s ease',
                      }}
                    >
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(10,132,255,0.2) 0%, rgba(10,132,255,0.1) 100%)',
                        border: '1px solid rgba(10,132,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '16px',
                        flexShrink: 0,
                      }}>
                        <span style={{
                          fontSize: '18px',
                          fontWeight: 700,
                          color: '#0A84FF',
                        }}>
                          {item.quantity}
                        </span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '17px',
                          fontWeight: 600,
                          color: '#fff',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {item.productName}
                        </div>
                        {item.notes && (
                          <div style={{
                            fontSize: '13px',
                            color: 'rgba(255,255,255,0.4)',
                            marginTop: '2px',
                            fontStyle: 'italic',
                          }}>
                            {item.notes}
                          </div>
                        )}
                      </div>

                      <div style={{
                        fontSize: '17px',
                        fontWeight: 600,
                        color: '#fff',
                        fontVariantNumeric: 'tabular-nums',
                        marginLeft: '12px',
                      }}>
                        ₺{formatCurrency(item.totalPrice)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{
              marginTop: '20px',
              padding: '24px',
              background: hasDiscount 
                ? 'linear-gradient(135deg, rgba(255,159,10,0.12) 0%, rgba(255,159,10,0.06) 100%)'
                : 'linear-gradient(135deg, rgba(48,209,88,0.12) 0%, rgba(48,209,88,0.06) 100%)',
              backdropFilter: 'blur(40px)',
              borderRadius: '20px',
              border: `1px solid ${hasDiscount ? 'rgba(255,159,10,0.25)' : 'rgba(48,209,88,0.25)'}`,
              animation: 'fadeInUp 0.6s ease-out 0.2s both',
            }}>
              {hasDiscount && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>🎉</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#FF9F0A' }}>
                        İndirim Uygulandı
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                        {currentOrder.discountType === 'percent' 
                          ? `%${currentOrder.discountValue} indirim`
                          : `₺${currentOrder.discountValue} indirim`
                        }
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#FF9F0A' }}>
                    -₺{formatCurrency(currentOrder.discountAmount || 0)}
                  </div>
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}>
                <div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}>
                    {hasDiscount ? 'Ödenecek Tutar' : 'Toplam'}
                  </div>
                  {hasDiscount && (
                    <div style={{
                      fontSize: '16px',
                      color: 'rgba(255,255,255,0.35)',
                      textDecoration: 'line-through',
                      marginTop: '4px',
                    }}>
                      ₺{formatCurrency(subtotal)}
                    </div>
                  )}
                </div>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '-2px',
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1,
                  textShadow: hasDiscount 
                    ? '0 0 40px rgba(255,159,10,0.5)'
                    : '0 0 40px rgba(48,209,88,0.3)',
                }}>
                  ₺{formatCurrency(currentOrder.totalAmount)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.98); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes itemSlideIn {
          from { opacity: 0; transform: translateX(-20px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
}
