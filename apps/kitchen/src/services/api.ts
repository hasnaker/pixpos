const API_BASE = '/api';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Kitchen API
export const kitchenApi = {
  getOrders: () => request<KitchenOrder[]>('/kitchen/orders'),
  
  markReady: (orderId: string) =>
    request<KitchenOrder>(`/kitchen/orders/${orderId}/ready`, {
      method: 'POST',
    }),
  
  startPreparing: (orderId: string) =>
    request<KitchenOrder>(`/kitchen/orders/${orderId}/preparing`, {
      method: 'POST',
    }),
  
  updateStatus: (orderId: string, status: 'preparing' | 'ready') =>
    request<KitchenOrder>(`/kitchen/orders/${orderId}/${status}`, {
      method: 'POST',
    }),
};

// Types
export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: 'empty' | 'occupied' | 'paying';
  sortOrder: number;
  isActive: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  createdAt: string;
}

export interface KitchenOrder {
  id: string;
  tableId: string;
  table?: Table;
  orderNumber: string;
  status: 'open' | 'kitchen' | 'preparing' | 'ready' | 'paid' | 'cancelled';
  totalAmount: number;
  notes?: string;
  waiterName?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
