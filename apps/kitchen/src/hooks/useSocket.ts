import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { KitchenOrder, Table } from '@/services/api';

interface ServerToClientEvents {
  'order:new': (data: { order: KitchenOrder }) => void;
  'order:updated': (data: { order: KitchenOrder }) => void;
  'order:ready': (data: { orderId: string; tableId: string }) => void;
  'table:updated': (data: { table: Table }) => void;
  'room:joined': (data: { room: string; success: boolean }) => void;
}

interface ClientToServerEvents {
  'join:room': (data: { room: 'pos' | 'kitchen' | 'waiter' }) => void;
  'order:mark-ready': (data: { orderId: string }) => void;
}

interface UseKitchenSocketOptions {
  onOrderNew?: (order: KitchenOrder) => void;
  onOrderUpdated?: (order: KitchenOrder) => void;
  onOrderReady?: (orderId: string, tableId: string) => void;
}

export function useKitchenSocket(options: UseKitchenSocketOptions) {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const { onOrderNew, onOrderUpdated, onOrderReady } = options;

  useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Kitchen WebSocket connected');
      socket.emit('join:room', { room: 'kitchen' });
    });

    socket.on('room:joined', (data) => {
      console.log(`Joined room: ${data.room}`);
    });

    socket.on('disconnect', () => {
      console.log('Kitchen WebSocket disconnected');
    });

    if (onOrderNew) {
      socket.on('order:new', (data) => onOrderNew(data.order));
    }

    if (onOrderUpdated) {
      socket.on('order:updated', (data) => onOrderUpdated(data.order));
    }

    if (onOrderReady) {
      socket.on('order:ready', (data) => onOrderReady(data.orderId, data.tableId));
    }

    return () => {
      socket.disconnect();
    };
  }, [onOrderNew, onOrderUpdated, onOrderReady]);

  const markOrderReady = useCallback((orderId: string) => {
    socketRef.current?.emit('order:mark-ready', { orderId });
  }, []);

  return { markOrderReady };
}
