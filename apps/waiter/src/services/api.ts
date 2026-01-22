import {
  productsCache,
  categoriesCache,
  zonesCache,
  tablesCache,
  pendingOrdersQueue,
  syncStatus,
  networkStatus,
  type PendingOrder,
} from './offlineStorage';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

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

// Offline-aware request wrapper
async function requestWithCache<T>(
  endpoint: string,
  cacheGetter: () => T,
  cacheSetter: (data: T) => void,
  options: RequestInit = {}
): Promise<T> {
  // If offline, return cached data
  if (!networkStatus.isOnline()) {
    const cached = cacheGetter();
    if (cached && (Array.isArray(cached) ? cached.length > 0 : true)) {
      console.log(`[Offline] Using cached data for ${endpoint}`);
      return cached;
    }
    throw new Error('Çevrimdışı - Cache boş');
  }

  try {
    const data = await request<T>(endpoint, options);
    // Cache the response
    cacheSetter(data);
    syncStatus.setLastSync();
    return data;
  } catch (error) {
    // On network error, try cache
    const cached = cacheGetter();
    if (cached && (Array.isArray(cached) ? cached.length > 0 : true)) {
      console.log(`[Network Error] Using cached data for ${endpoint}`);
      return cached;
    }
    throw error;
  }
}

// Zones API (with cache)
export const zonesApi = {
  getAll: () => requestWithCache<Zone[]>(
    '/zones',
    zonesCache.get,
    zonesCache.set
  ),
  // Force refresh from server
  refresh: async () => {
    zonesCache.clear();
    return request<Zone[]>('/zones').then(data => {
      zonesCache.set(data);
      return data;
    });
  },
};

// Categories API (with cache)
export const categoriesApi = {
  getAll: () => requestWithCache<Category[]>(
    '/categories',
    categoriesCache.get,
    categoriesCache.set
  ),
};

// Products API (with cache)
export const productsApi = {
  getAll: () => requestWithCache<Product[]>(
    '/products',
    productsCache.get,
    productsCache.set
  ),
};

// Tables API (with cache)
export const tablesApi = {
  getAll: () => requestWithCache<Table[]>(
    '/tables',
    tablesCache.get,
    tablesCache.set
  ),
  getOne: (id: string) => request<Table>(`/tables/${id}`),
};

// Orders API (with offline queue support)
export const ordersApi = {
  getAll: (status?: OrderStatus) =>
    request<Order[]>(`/orders${status ? `?status=${status}` : ''}`),
  getOne: (id: string) => request<Order>(`/orders/${id}`),
  getByTable: (tableId: string) => request<Order[]>(`/orders/table/${tableId}`),
  
  // Create order with offline support
  create: async (data: CreateOrderDto): Promise<Order | PendingOrder> => {
    if (!networkStatus.isOnline()) {
      // Queue for later sync
      console.log('[Offline] Queuing order for sync');
      return pendingOrdersQueue.add({
        tableId: data.tableId,
        items: [],
        notes: data.notes,
      });
    }
    return request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  update: (id: string, data: UpdateOrderDto) =>
    request<Order>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  addItem: (orderId: string, data: AddOrderItemDto) =>
    request<Order>(`/orders/${orderId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  removeItem: (orderId: string, itemId: string) =>
    request<Order>(`/orders/${orderId}/items/${itemId}`, {
      method: 'DELETE',
    }),
  sendToKitchen: (orderId: string) =>
    request<Order>(`/orders/${orderId}/send-to-kitchen`, {
      method: 'POST',
    }),
  
  // Sync pending orders when back online
  syncPendingOrders: async (): Promise<{ synced: number; failed: number }> => {
    const pending = pendingOrdersQueue.getAll().filter(o => !o.synced);
    let synced = 0;
    let failed = 0;
    
    for (const order of pending) {
      try {
        // Create order on server
        const serverOrder = await request<Order>('/orders', {
          method: 'POST',
          body: JSON.stringify({
            tableId: order.tableId,
            notes: order.notes,
          }),
        });
        
        // Add items
        for (const item of order.items) {
          await request<Order>(`/orders/${serverOrder.id}/items`, {
            method: 'POST',
            body: JSON.stringify({
              productId: item.productId,
              quantity: item.quantity,
              notes: item.notes,
            }),
          });
        }
        
        // Mark as synced and remove
        pendingOrdersQueue.remove(order.id);
        synced++;
      } catch (error) {
        console.error(`Failed to sync order ${order.id}:`, error);
        failed++;
      }
    }
    
    return { synced, failed };
  },
  
  // Get pending orders count
  getPendingCount: () => pendingOrdersQueue.getUnsyncedCount(),
};

// Types
export interface Zone {
  id: string;
  name: string;
  prefix?: string;
  icon?: string;
  floor: number;
  sortOrder: number;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: string;
  name: string;
  zone?: string;
  capacity: number;
  status: 'empty' | 'occupied' | 'paying';
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export type OrderStatus = 'open' | 'sent' | 'paid' | 'cancelled';
export type OrderItemStatus = 'pending' | 'preparing' | 'ready' | 'served';

export interface Order {
  id: string;
  tableId: string;
  table?: Table;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
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
  status: OrderItemStatus;
  createdAt: string;
}

// Order DTOs
export interface CreateOrderDto {
  tableId: string;
  notes?: string;
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  notes?: string;
}

export interface AddOrderItemDto {
  productId: string;
  quantity: number;
  notes?: string;
}

// Re-export offline utilities for use in components
export { networkStatus, syncStatus, pendingOrdersQueue } from './offlineStorage';
export type { PendingOrder, PendingOrderItem } from './offlineStorage';
