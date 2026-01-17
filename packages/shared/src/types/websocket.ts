import { Order } from './order';
import { Table } from './table';

// Server to Client events
export interface ServerToClientEvents {
  'order:new': (data: { order: Order }) => void;
  'order:updated': (data: { order: Order }) => void;
  'order:ready': (data: { orderId: string; tableId: string }) => void;
  'table:updated': (data: { table: Table }) => void;
  'waiter:called': (data: { tableId: string; tableName: string }) => void;
}

// Client to Server events
export interface ClientToServerEvents {
  'join:room': (data: { room: 'pos' | 'kitchen' | 'waiter' }) => void;
  'order:mark-ready': (data: { orderId: string }) => void;
}

export type WebSocketRoom = 'pos' | 'kitchen' | 'waiter';
