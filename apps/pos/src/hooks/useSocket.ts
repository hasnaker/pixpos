import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Order, Table } from '@/services/api';

type WebSocketRoom = 'pos' | 'kitchen' | 'waiter';

interface ServerToClientEvents {
  'order:new': (data: { order: Order }) => void;
  'order:updated': (data: { order: Order }) => void;
  'order:ready': (data: { orderId: string; tableId: string }) => void;
  'table:updated': (data: { table: Table }) => void;
  'waiter:called': (data: { tableId: string; tableName: string }) => void;
  'room:joined': (data: { room: string; success: boolean }) => void;
}

interface ClientToServerEvents {
  'join:room': (data: { room: WebSocketRoom }) => void;
  'order:mark-ready': (data: { orderId: string }) => void;
  'display:show-order': (order: Order) => void;
}

interface UseSocketOptions {
  room: WebSocketRoom;
  onOrderNew?: (order: Order) => void;
  onOrderUpdated?: (order: Order) => void;
  onOrderReady?: (orderId: string, tableId: string) => void;
  onTableUpdated?: (table: Table) => void;
  onWaiterCalled?: (tableId: string, tableName: string) => void;
}

// Global socket instance for display updates
let globalSocket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

// LocalStorage key for cross-window communication
const DISPLAY_ORDER_KEY = 'pixpos_display_order';

// BroadcastChannel for same-origin communication
let displayChannel: BroadcastChannel | null = null;
try {
  displayChannel = new BroadcastChannel('pixpos_display');
} catch (e) {
  console.log('[useSocket] BroadcastChannel not supported');
}

export function sendToCustomerDisplay(order: Order | null) {
  console.log('[sendToCustomerDisplay] Sending order:', order?.orderNumber || 'null');
  
  // Method 1: WebSocket (if connected)
  if (globalSocket?.connected) {
    globalSocket.emit('display:show-order', order as Order);
    console.log('[sendToCustomerDisplay] Sent via WebSocket');
  }
  
  // Method 2: BroadcastChannel (works across windows in same origin)
  if (displayChannel) {
    try {
      displayChannel.postMessage({ type: 'order', order });
      console.log('[sendToCustomerDisplay] Sent via BroadcastChannel');
    } catch (e) {
      console.error('[sendToCustomerDisplay] BroadcastChannel error:', e);
    }
  }
  
  // Method 3: LocalStorage (fallback)
  try {
    if (order) {
      const data = JSON.stringify({ order, timestamp: Date.now() });
      localStorage.setItem(DISPLAY_ORDER_KEY, data);
      // Trigger storage event manually for same-window listeners
      window.dispatchEvent(new StorageEvent('storage', {
        key: DISPLAY_ORDER_KEY,
        newValue: data,
      }));
    } else {
      localStorage.removeItem(DISPLAY_ORDER_KEY);
      window.dispatchEvent(new StorageEvent('storage', {
        key: DISPLAY_ORDER_KEY,
        newValue: null,
      }));
    }
    console.log('[sendToCustomerDisplay] Sent via LocalStorage');
  } catch (e) {
    console.error('[sendToCustomerDisplay] LocalStorage error:', e);
  }
}

// Clear display order
export function clearCustomerDisplay() {
  localStorage.removeItem(DISPLAY_ORDER_KEY);
  if (displayChannel) {
    displayChannel.postMessage({ type: 'clear' });
  }
}

export function useSocket(options: UseSocketOptions) {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const { room, onOrderNew, onOrderUpdated, onOrderReady, onTableUpdated, onWaiterCalled } = options;

  useEffect(() => {
    // Connect to WebSocket server
    const wsUrl = import.meta.env.VITE_WS_URL || window.location.origin;
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(wsUrl, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;
    globalSocket = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      // Join the specified room
      socket.emit('join:room', { room });
    });

    socket.on('room:joined', (data) => {
      console.log(`Joined room: ${data.room}`);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    // Event handlers
    if (onOrderNew) {
      socket.on('order:new', (data) => onOrderNew(data.order));
    }

    if (onOrderUpdated) {
      socket.on('order:updated', (data) => onOrderUpdated(data.order));
    }

    if (onOrderReady) {
      socket.on('order:ready', (data) => onOrderReady(data.orderId, data.tableId));
    }

    if (onTableUpdated) {
      socket.on('table:updated', (data) => onTableUpdated(data.table));
    }

    if (onWaiterCalled) {
      socket.on('waiter:called', (data) => onWaiterCalled(data.tableId, data.tableName));
    }

    return () => {
      socket.disconnect();
      if (globalSocket === socket) {
        globalSocket = null;
      }
    };
  }, [room, onOrderNew, onOrderUpdated, onOrderReady, onTableUpdated, onWaiterCalled]);

  const markOrderReady = useCallback((orderId: string) => {
    socketRef.current?.emit('order:mark-ready', { orderId });
  }, []);

  const showOrderOnDisplay = useCallback((order: Order | null) => {
    if (order) {
      socketRef.current?.emit('display:show-order', order);
    }
  }, []);

  return { markOrderReady, showOrderOnDisplay };
}
