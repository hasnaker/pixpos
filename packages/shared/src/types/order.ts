import { OrderItem, CreateOrderItemDto } from './order-item';

export type OrderStatus = 'open' | 'kitchen' | 'ready' | 'paid' | 'cancelled';

export interface Order {
  id: string;
  tableId: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  notes: string | null;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
}

export interface CreateOrderDto {
  tableId: string;
  notes?: string;
  items?: CreateOrderItemDto[];
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  notes?: string;
}

export interface SplitOrderDto {
  itemIds: string[];
}

export interface TransferOrderDto {
  targetTableId: string;
}

export interface MergeOrdersDto {
  orderIds: string[];
  targetTableId: string;
}
