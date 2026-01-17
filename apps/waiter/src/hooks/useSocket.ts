import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Order, Table } from '@/services/api';

type WebSocketRoom = 'pos' | 'kitchen' | 'waiter';

// Get WebSocket URL from environment or fallback to window.location
const WS_URL = import.meta.env.VITE_WS_URL || window.location.origin;

interface ServerToClientEvents {
  'order:new': (data: { order: Order }) => void;
  'order:updated': (data: { order: Order }) => void;
  'order:ready': (data: { orderId: string; tableId: string }) => void;
  'table:updated': (data: { table: Table }) => void;
  'room:joined': (data: { room: string; success: boolean }) => void;
}

interface ClientToServerEvents {
  'join:room': (data: { room: WebSocketRoom }) => void;
}

interface UseSocketOptions {
  room: WebSocketRoom;
  onOrderNew?: (order: Order) => void;
  onOrderUpdated?: (order: Order) => void;
  onOrderReady?: (orderId: string, tableId: string) => void;
  onTableUpdated?: (table: Table) => void;
}

export function useSocket(options: UseSocketOptions) {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const { room, onOrderNew, onOrderUpdated, onOrderReady, onTableUpdated } = options;

  useEffect(() => {
    // Connect to WebSocket server
    console.log('Connecting to WebSocket:', WS_URL);
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(WS_URL, {
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

    return () => {
      socket.disconnect();
    };
  }, [room, onOrderNew, onOrderUpdated, onOrderReady, onTableUpdated]);

  return {};
}
