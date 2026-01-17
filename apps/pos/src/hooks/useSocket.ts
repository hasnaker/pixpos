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
}

interface UseSocketOptions {
  room: WebSocketRoom;
  onOrderNew?: (order: Order) => void;
  onOrderUpdated?: (order: Order) => void;
  onOrderReady?: (orderId: string, tableId: string) => void;
  onTableUpdated?: (table: Table) => void;
  onWaiterCalled?: (tableId: string, tableName: string) => void;
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
    };
  }, [room, onOrderNew, onOrderUpdated, onOrderReady, onTableUpdated, onWaiterCalled]);

  const markOrderReady = useCallback((orderId: string) => {
    socketRef.current?.emit('order:mark-ready', { orderId });
  }, []);

  return { markOrderReady };
}
