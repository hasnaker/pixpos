import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { io } from 'socket.io-client';

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
            width: '320px',
            height: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}>
            <svg viewBox="0 0 1920 1080" width="320" height="180" fill="white">
              <path d="M781.82,494.56h-47.05v47.05c0,25.99,21.07,47.05,47.05,47.05h0c25.99,0,47.05-21.07,47.05-47.05h0c0-25.99-21.07-47.05-47.05-47.05Z"/>
              <g>
                <path d="M909.93,521.48c-2.66-2.66-5.82-4.79-9.4-6.33-3.59-1.55-7.48-2.34-11.55-2.34s-7.95.79-11.55,2.34c-3.58,1.55-6.75,3.68-9.42,6.33-2.68,2.66-4.83,5.83-6.38,9.43-1.55,3.61-2.34,7.52-2.34,11.62v43.36c0,1.52.54,2.83,1.59,3.88,1.06,1.06,2.34,1.59,3.83,1.59s2.85-.57,3.82-1.65c.94-1.05,1.42-2.34,1.42-3.83v-20.7c2.1,1.77,4.46,3.24,7.03,4.39,3.69,1.65,7.73,2.49,12,2.49s7.96-.79,11.55-2.34c3.58-1.54,6.74-3.68,9.4-6.33,2.66-2.66,4.78-5.81,6.31-9.37,1.53-3.57,2.31-7.44,2.31-11.5s-.78-8.01-2.31-11.61c-1.53-3.6-3.66-6.77-6.32-9.43ZM888.96,523.58c2.66,0,5.16.5,7.44,1.49,2.29.99,4.31,2.36,6.02,4.06,1.7,1.7,3.05,3.73,4.03,6.03.97,2.3,1.46,4.78,1.46,7.36s-.49,4.99-1.46,7.27c-.98,2.29-2.34,4.33-4.03,6.04-1.7,1.72-3.72,3.09-6.01,4.08-2.27.99-4.78,1.49-7.44,1.49s-5.12-.5-7.41-1.49c-2.3-.99-4.33-2.37-6.03-4.08-1.7-1.72-3.07-3.75-4.07-6.05-.99-2.27-1.49-4.72-1.49-7.26s.5-5.06,1.49-7.35c.99-2.31,2.36-4.34,4.06-6.04,1.7-1.7,3.73-3.06,6.04-4.06,2.3-.99,4.79-1.49,7.41-1.49Z"/>
                <path d="M931.68,495.76c-1.71,0-3.17.59-4.34,1.76s-1.76,2.63-1.76,4.34.59,3.12,1.75,4.3c1.17,1.2,2.64,1.8,4.35,1.8s3.18-.6,4.37-1.79c1.19-1.19,1.79-2.64,1.79-4.31s-.61-3.18-1.8-4.35c-1.19-1.16-2.66-1.75-4.36-1.75Z"/>
                <path d="M931.65,512.8c-1.47,0-2.75.52-3.8,1.55-1.06,1.04-1.59,2.34-1.59,3.86v48.09c0,1.49.54,2.77,1.59,3.81,1.05,1.03,2.33,1.55,3.79,1.55s2.69-.53,3.72-1.57c1.03-1.04,1.55-2.31,1.55-3.79v-48.09c0-1.5-.49-2.79-1.47-3.82-.98-1.04-2.3-1.59-3.81-1.59Z"/>
                <path d="M980.49,541.77l19.45-19.84c1.06-1.16,1.6-2.45,1.6-3.83s-.54-2.65-1.59-3.71c-1.06-1.06-2.3-1.59-3.71-1.59-1.52,0-2.85.55-3.95,1.66l-19.26,19.69-19.33-19.76c-1.09-1.09-2.4-1.65-3.88-1.65-.71,0-1.41.15-2.06.45-.62.29-1.19.68-1.67,1.17-.5.5-.89,1.08-1.18,1.72-.29.67-.44,1.37-.44,2.07,0,1.41.54,2.66,1.58,3.7l19.53,19.91-20.15,20.64c-.47.52-.86,1.08-1.15,1.66-.33.67-.5,1.4-.5,2.17,0,.72.16,1.42.46,2.05.29.61.69,1.15,1.19,1.62.5.47,1.07.84,1.69,1.1.64.27,1.32.4,2.02.4,1.57,0,2.91-.56,3.95-1.66l19.95-20.39,20.04,20.42c.97,1.02,2.26,1.56,3.74,1.56,1.34,0,2.56-.49,3.63-1.45,1.1-.99,1.67-2.3,1.67-3.79s-.54-2.83-1.58-3.87l-20.05-20.49Z"/>
                <path d="M1058.91,521.48c-2.66-2.66-5.82-4.79-9.4-6.33-3.59-1.55-7.48-2.34-11.55-2.34s-7.95.79-11.55,2.34c-3.58,1.55-6.75,3.68-9.42,6.33-2.68,2.66-4.83,5.83-6.37,9.43-1.55,3.61-2.34,7.52-2.34,11.62v43.36c0,1.52.54,2.83,1.59,3.88,1.06,1.06,2.34,1.59,3.82,1.59s2.85-.57,3.82-1.65c.94-1.05,1.42-2.33,1.42-3.83v-20.7c2.1,1.77,4.46,3.24,7.03,4.39,3.69,1.65,7.73,2.49,12,2.49s7.96-.79,11.55-2.34c3.58-1.54,6.74-3.68,9.4-6.33,2.66-2.66,4.78-5.81,6.32-9.37,1.53-3.57,2.31-7.44,2.31-11.5s-.78-8.01-2.31-11.61c-1.53-3.6-3.66-6.77-6.32-9.43ZM1037.93,523.58c2.66,0,5.16.5,7.44,1.49,2.29.99,4.32,2.36,6.02,4.06,1.7,1.7,3.05,3.73,4.03,6.03.97,2.3,1.47,4.78,1.47,7.36s-.49,4.99-1.46,7.27c-.98,2.29-2.33,4.32-4.03,6.04-1.7,1.72-3.72,3.09-6.01,4.08-2.27.99-4.78,1.49-7.44,1.49s-5.12-.5-7.41-1.49c-2.31-.99-4.34-2.37-6.03-4.08-1.7-1.72-3.07-3.75-4.07-6.05-.99-2.27-1.49-4.72-1.49-7.26s.5-5.06,1.49-7.35c.99-2.31,2.36-4.34,4.06-6.04,1.7-1.7,3.73-3.06,6.04-4.06,2.3-.99,4.79-1.49,7.41-1.49Z"/>
                <path d="M1122.49,521.51c-2.66-2.68-5.82-4.82-9.4-6.37-3.59-1.55-7.49-2.34-11.59-2.34s-7.94.79-11.51,2.34c-3.55,1.55-6.71,3.68-9.38,6.33-2.68,2.66-4.82,5.83-6.37,9.43-1.55,3.61-2.34,7.52-2.34,11.62s.79,7.94,2.34,11.51c1.55,3.56,3.69,6.71,6.37,9.36,2.67,2.66,5.83,4.78,9.38,6.33,3.57,1.55,7.44,2.34,11.51,2.34s8.01-.79,11.59-2.34c3.57-1.55,6.73-3.68,9.39-6.33,2.66-2.66,4.78-5.81,6.31-9.37,1.53-3.57,2.31-7.44,2.31-11.5s-.78-8-2.31-11.59c-1.53-3.58-3.65-6.75-6.3-9.42ZM1101.5,561.4c-2.62,0-5.1-.5-7.38-1.49-2.29-.99-4.31-2.37-6.01-4.08-1.7-1.72-3.07-3.76-4.07-6.05-.99-2.27-1.49-4.72-1.49-7.26s.5-5.06,1.49-7.35c.99-2.31,2.36-4.34,4.06-6.04,1.7-1.7,3.72-3.07,6.01-4.06,2.28-.99,4.76-1.49,7.38-1.49s5.17.5,7.47,1.49c2.31.99,4.33,2.36,6.01,4.05,1.68,1.7,3.03,3.73,4,6.04.97,2.3,1.46,4.77,1.46,7.36s-.49,5-1.46,7.27c-.98,2.29-2.33,4.33-4.01,6.05-1.68,1.71-3.7,3.09-6,4.08-2.29.99-4.81,1.49-7.47,1.49Z"/>
                <path d="M1182.41,546.96c-.88-2.1-2.11-3.98-3.68-5.59-1.57-1.61-3.43-2.89-5.54-3.81-2.12-.92-4.45-1.39-6.9-1.39h-12.04c-.87,0-1.66-.16-2.41-.5-.77-.35-1.45-.82-2.03-1.4-.58-.58-1.02-1.24-1.35-2.02-.33-.76-.48-1.56-.48-2.44,0-.81.16-1.57.48-2.33.33-.77.78-1.45,1.34-2.03.56-.58,1.24-1.06,2.01-1.42.75-.35,1.54-.52,2.44-.52h21.08c1.46,0,2.73-.49,3.76-1.46,1.06-1,1.6-2.33,1.6-3.98,0-2.03-.89-3.23-1.64-3.88-1.03-.89-2.28-1.34-3.72-1.34h-21.02c-2.34,0-4.58.45-6.64,1.33-2.04.87-3.86,2.08-5.39,3.59-1.53,1.5-2.75,3.29-3.63,5.3-.89,2.02-1.33,4.22-1.33,6.52s.44,4.57,1.29,6.64c.85,2.06,2.05,3.9,3.56,5.47,1.51,1.57,3.33,2.83,5.4,3.75,2.08.92,4.35,1.39,6.74,1.39h11.29c1,.03,1.98.21,2.91.53.89.3,1.69.75,2.37,1.31.67.56,1.2,1.24,1.61,2.05.39.79.59,1.72.59,2.79s-.21,2.1-.62,2.94c-.43.88-1.01,1.65-1.71,2.29-.7.64-1.5,1.13-2.38,1.47-.88.34-1.78.51-2.66.51h-24.36c-1.43,0-2.69.52-3.64,1.49-.95.98-1.43,2.24-1.43,3.75s.47,2.83,1.4,3.84c.95,1.03,2.22,1.58,3.67,1.58h25.05c2.46,0,4.79-.48,6.92-1.42,2.11-.94,3.96-2.23,5.49-3.84,1.52-1.6,2.74-3.49,3.61-5.61.88-2.13,1.32-4.41,1.32-6.78s-.45-4.65-1.32-6.76Z"/>
              </g>
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
