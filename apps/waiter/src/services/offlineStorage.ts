/**
 * PIXPOS Offline Storage Service
 * 
 * Basit localStorage tabanlı offline cache sistemi.
 * İnternet kesildiğinde ürünler ve kategoriler cache'den gelir.
 * Siparişler queue'da tutulur ve internet gelince gönderilir.
 */

const STORAGE_KEYS = {
  PRODUCTS: 'pixpos_products',
  CATEGORIES: 'pixpos_categories',
  ZONES: 'pixpos_zones',
  TABLES: 'pixpos_tables',
  PENDING_ORDERS: 'pixpos_pending_orders',
  LAST_SYNC: 'pixpos_last_sync',
};

// Generic storage helpers
function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

// Products cache
export const productsCache = {
  get: () => getItem<Product[]>(STORAGE_KEYS.PRODUCTS) || [],
  set: (products: Product[]) => setItem(STORAGE_KEYS.PRODUCTS, products),
  clear: () => localStorage.removeItem(STORAGE_KEYS.PRODUCTS),
};

// Categories cache
export const categoriesCache = {
  get: () => getItem<Category[]>(STORAGE_KEYS.CATEGORIES) || [],
  set: (categories: Category[]) => setItem(STORAGE_KEYS.CATEGORIES, categories),
  clear: () => localStorage.removeItem(STORAGE_KEYS.CATEGORIES),
};

// Zones cache
export const zonesCache = {
  get: () => getItem<Zone[]>(STORAGE_KEYS.ZONES) || [],
  set: (zones: Zone[]) => setItem(STORAGE_KEYS.ZONES, zones),
  clear: () => localStorage.removeItem(STORAGE_KEYS.ZONES),
};

// Tables cache
export const tablesCache = {
  get: () => getItem<Table[]>(STORAGE_KEYS.TABLES) || [],
  set: (tables: Table[]) => setItem(STORAGE_KEYS.TABLES, tables),
  clear: () => localStorage.removeItem(STORAGE_KEYS.TABLES),
};

// Pending orders queue (offline siparişler)
export interface PendingOrder {
  id: string; // Temporary local ID
  tableId: string;
  items: PendingOrderItem[];
  notes?: string;
  createdAt: string;
  synced: boolean;
}

export interface PendingOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export const pendingOrdersQueue = {
  getAll: (): PendingOrder[] => getItem<PendingOrder[]>(STORAGE_KEYS.PENDING_ORDERS) || [],
  
  add: (order: Omit<PendingOrder, 'id' | 'createdAt' | 'synced'>): PendingOrder => {
    const orders = pendingOrdersQueue.getAll();
    const newOrder: PendingOrder = {
      ...order,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      synced: false,
    };
    orders.push(newOrder);
    setItem(STORAGE_KEYS.PENDING_ORDERS, orders);
    return newOrder;
  },
  
  markSynced: (localId: string, _serverId?: string) => {
    const orders = pendingOrdersQueue.getAll();
    const index = orders.findIndex(o => o.id === localId);
    if (index !== -1) {
      orders[index].synced = true;
      setItem(STORAGE_KEYS.PENDING_ORDERS, orders);
    }
  },
  
  remove: (localId: string) => {
    const orders = pendingOrdersQueue.getAll().filter(o => o.id !== localId);
    setItem(STORAGE_KEYS.PENDING_ORDERS, orders);
  },
  
  getUnsyncedCount: (): number => {
    return pendingOrdersQueue.getAll().filter(o => !o.synced).length;
  },
  
  clear: () => localStorage.removeItem(STORAGE_KEYS.PENDING_ORDERS),
};

// Last sync timestamp
export const syncStatus = {
  getLastSync: (): Date | null => {
    const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return timestamp ? new Date(timestamp) : null;
  },
  
  setLastSync: () => {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  },
  
  isStale: (maxAgeMinutes: number = 30): boolean => {
    const lastSync = syncStatus.getLastSync();
    if (!lastSync) return true;
    const age = Date.now() - lastSync.getTime();
    return age > maxAgeMinutes * 60 * 1000;
  },
};

// Network status helper
export const networkStatus = {
  isOnline: (): boolean => navigator.onLine,
  
  onStatusChange: (callback: (online: boolean) => void) => {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  },
};

// Types - must match api.ts types exactly
interface Product {
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

interface Category {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Zone {
  id: string;
  name: string;
  icon?: string;
  floor: number;
  sortOrder: number;
  isActive: boolean;
}

interface Table {
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
