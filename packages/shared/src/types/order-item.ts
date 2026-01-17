export type OrderItemStatus = 'pending' | 'preparing' | 'ready' | 'served';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string | null;
  status: OrderItemStatus;
  createdAt: Date;
}

export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
  notes?: string;
}

export interface UpdateOrderItemDto {
  quantity?: number;
  notes?: string;
  status?: OrderItemStatus;
}
