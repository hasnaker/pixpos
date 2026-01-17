import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';

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
  createdAt: string;
}

interface BusinessSettings {
  storeName: string;
  logoUrl: string;
  address?: string;
  phone?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Fetch current active order for display
const fetchActiveOrder = async (tableId?: string): Promise<Order | null> => {
  try {
    const url = tableId 
      ? `${API_BASE}/orders/active?tableId=${tableId}`
      : `${API_BASE}/orders/display/current`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
};

// Fetch business settings
const fetchSettings = async (): Promise<BusinessSettings> => {
  try {
    const res = await fetch(`${API_BASE}/settings/business`);
    if (!res.ok) throw new Error('Not found');
    return res.json();
  } catch {
    // Fallback to localStorage or defaults
    const stored = localStorage.getItem('businessSettings');
    if (stored) return JSON.parse(stored);
    return {
      storeName: 'PIXPOS',
      logoUrl: '',
    };
  }
};

export default function CustomerDisplay() {
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('table') || undefined;
  
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Fetch business settings
  const { data: settings } = useQuery({
    queryKey: ['businessSettings'],
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Initial order fetch
  const { data: initialOrder } = useQuery({
    queryKey: ['displayOrder', tableId],
    queryFn: () => fetchActiveOrder(tableId),
    refetchInterval: 5000, // Fallback polling
  });

  useEffect(() => {
    if (initialOrder) {
      setCurrentOrder(initialOrder);
    }
  }, [initialOrder]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const wsUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
    const newSocket = io(wsUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Customer display connected');
      // Join display room
      newSocket.emit('join:display', { tableId });
    });

    newSocket.on('order:updated', (order: Order) => {
      if (!tableId || order.tableId === tableId) {
        setCurrentOrder(order);
      }
    });

    newSocket.on('order:cleared', () => {
      setCurrentOrder(null);
    });

    newSocket.on('display:update', (order: Order | null) => {
      setCurrentOrder(order);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [tableId]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Idle screen - show logo
  if (!currentOrder || currentOrder.items.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0A0A0A 0%, #1C1C1E 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      }}>
        {/* Logo */}
        {settings?.logoUrl ? (
          <img 
            src={settings.logoUrl} 
            alt={settings.storeName}
            style={{
              maxWidth: '400px',
              maxHeight: '300px',
              objectFit: 'contain',
              marginBottom: '40px',
            }}
          />
        ) : (
          <div style={{
            width: '200px',
            height: '200px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}>
            <svg viewBox="0 0 1000 1000" width="120" height="120">
              <path d="M224.25,549.47l-.87,53.44-28.57-.1.21-106.4c.04-20.87,13.87-39.16,32.48-47.16,20.16-8.66,43.34-5.87,59.82,8.47,26.16,22.78,24.72,63.87-1.61,85.85-17.39,13.51-40.01,16.25-61.47,5.9Z" fill="#fcfcfb"/>
              <path d="M253.5,502.5c0,16.57-13.43,30-30,30s-30-13.43-30-30,13.43-30,30-30,30,13.43,30,30Z" fill="#0A84FF"/>
              <rect x="350" y="450" width="30" height="150" rx="4" fill="#fcfcfb"/>
              <polygon points="500,450 560,450 530,520 560,520 480,620 510,540 480,540" fill="#fcfcfb"/>
              <path d="M650,450h60c25,0,45,20,45,45v60c0,25-20,45-45,45h-60v-150Z" fill="none" stroke="#fcfcfb" strokeWidth="25"/>
              <path d="M820,450c40,0,70,35,70,75s-30,75-70,75-70-35-70-75,30-75,70-75Z" fill="none" stroke="#fcfcfb" strokeWidth="25"/>
            </svg>
          </div>
        )}

        {/* Store Name */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: 700,
          color: '#FFFFFF',
          textAlign: 'center',
          marginBottom: '16px',
          letterSpacing: '-0.5px',
        }}>
          {settings?.storeName || 'PIXPOS'}
        </h1>

        {/* Welcome Message */}
        <p style={{
          fontSize: '24px',
          color: 'rgba(255,255,255,0.5)',
          textAlign: 'center',
        }}>
          Hoş Geldiniz
        </p>

        {/* Subtle animation indicator */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          display: 'flex',
          gap: '8px',
        }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.3)',
                animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
      </div>
    );
  }

  // Active order screen
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0A0A0A 0%, #1C1C1E 100%)',
      display: 'flex',
      flexDirection: 'column',
      padding: '40px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#FFFFFF',
            marginBottom: '4px',
          }}>
            {settings?.storeName || 'PIXPOS'}
          </h1>
          {currentOrder.tableName && (
            <p style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.5)',
            }}>
              {currentOrder.tableName}
            </p>
          )}
        </div>
        <div style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.4)',
        }}>
          #{currentOrder.orderNumber}
        </div>
      </div>

      {/* Order Items */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '32px',
      }}>
        {currentOrder.items.map((item, index) => (
          <div
            key={item.id || index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 0',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}>
                <span style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#0A84FF',
                  minWidth: '40px',
                }}>
                  {item.quantity}×
                </span>
                <span style={{
                  fontSize: '22px',
                  fontWeight: 500,
                  color: '#FFFFFF',
                }}>
                  {item.productName}
                </span>
              </div>
              {item.notes && (
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.4)',
                  marginTop: '4px',
                  marginLeft: '56px',
                  fontStyle: 'italic',
                }}>
                  {item.notes}
                </p>
              )}
            </div>
            <div style={{
              fontSize: '22px',
              fontWeight: 600,
              color: '#FFFFFF',
              textAlign: 'right',
            }}>
              {formatCurrency(item.totalPrice)}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div style={{
        background: 'rgba(10, 132, 255, 0.1)',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid rgba(10, 132, 255, 0.2)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontSize: '28px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.7)',
          }}>
            Toplam
          </span>
          <span style={{
            fontSize: '48px',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-1px',
          }}>
            {formatCurrency(currentOrder.totalAmount)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '24px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.3)',
        fontSize: '14px',
      }}>
        Teşekkür ederiz
      </div>
    </div>
  );
}
