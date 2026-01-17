// Detect if running in Electron
const isElectron = typeof window !== 'undefined' && (
  window.location.protocol === 'file:' || 
  navigator.userAgent.includes('Electron')
);

// For Electron, always use the production API URL
// For web, use environment variable or relative path
const API_BASE = isElectron 
  ? 'https://api.pixpos.cloud/api'
  : (import.meta.env.VITE_API_URL || '/api');

// Demo data only used as fallback when API is unreachable
const DEMO_USERS: User[] = [
  { id: '1', name: 'Demo Admin', role: 'admin', isActive: true, lastLoginAt: null, avatarUrl: null, createdAt: new Date().toISOString() },
  { id: '2', name: 'Demo Kasiyer', role: 'cashier', isActive: true, lastLoginAt: null, avatarUrl: null, createdAt: new Date().toISOString() },
  { id: '3', name: 'Demo Garson', role: 'waiter', isActive: true, lastLoginAt: null, avatarUrl: null, createdAt: new Date().toISOString() },
];

const DEMO_TABLES: Table[] = [
  { id: '1', name: 'Masa 1', zone: 'Salon', capacity: 4, status: 'empty', sortOrder: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Masa 2', zone: 'Salon', capacity: 4, status: 'empty', sortOrder: 2, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', name: 'Masa 3', zone: 'Salon', capacity: 6, status: 'empty', sortOrder: 3, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', name: 'Masa 4', zone: 'Teras', capacity: 4, status: 'empty', sortOrder: 4, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '5', name: 'Masa 5', zone: 'Teras', capacity: 2, status: 'empty', sortOrder: 5, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

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

  // DELETE veya boş response için JSON parse etme
  const contentLength = response.headers.get('content-length');
  if (options.method === 'DELETE' || contentLength === '0' || response.status === 204) {
    return undefined as T;
  }

  // Response boş olabilir
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text);
}

// Categories API
export const categoriesApi = {
  getAll: () => request<Category[]>('/categories'),
  getOne: (id: string) => request<Category>(`/categories/${id}`),
  create: (data: CreateCategoryDto) =>
    request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateCategoryDto) =>
    request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/categories/${id}`, { method: 'DELETE' }),
  deleteAll: () =>
    request<void>('/categories', { method: 'DELETE' }),
};

// Products API
export const productsApi = {
  getAll: () => request<Product[]>('/products'),
  getOne: (id: string) => request<Product>(`/products/${id}`),
  create: (data: CreateProductDto) =>
    request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateProductDto) =>
    request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/products/${id}`, { method: 'DELETE' }),
  deleteAll: () =>
    request<void>('/products', { method: 'DELETE' }),
  uploadImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`${API_BASE}/products/${id}/image`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload image');
    return response.json();
  },
};

// Tables API
export const tablesApi = {
  getAll: () => request<Table[]>('/tables'),
  getOne: (id: string) => request<Table>(`/tables/${id}`),
  create: (data: CreateTableDto) =>
    request<Table>('/tables', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateTableDto) =>
    request<Table>(`/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE}/tables/${id}`, { method: 'DELETE' });
    if (!response.ok && response.status !== 404) {
      throw new Error(`Delete failed: ${response.status}`);
    }
    // 204 No Content - don't try to parse JSON
    return;
  },
};

// Printers API
export const printersApi = {
  getAll: () => request<Printer[]>('/printers'),
  getOne: (id: string) => request<Printer>(`/printers/${id}`),
  create: (data: CreatePrinterDto) =>
    request<Printer>('/printers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdatePrinterDto) =>
    request<Printer>(`/printers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/printers/${id}`, { method: 'DELETE' }),
  test: (id: string) =>
    request<{ success: boolean }>(`/printers/${id}/test`, { method: 'POST' }),
};

// Reports API
export const reportsApi = {
  getDaily: (date?: string) =>
    request<DailyReport>(`/reports/daily${date ? `?date=${date}` : ''}`),
  getProducts: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return request<ProductReport[]>(`/reports/products${query ? `?${query}` : ''}`);
  },
};

// Menus API
export const menusApi = {
  getAll: () => request<Menu[]>('/menus'),
  getOne: (id: string) => request<Menu>(`/menus/${id}`),
  getActive: () => request<Menu[]>('/menus/active'),
  getDefault: () => request<Menu | null>('/menus/default'),
  create: (data: CreateMenuDto) =>
    request<Menu>('/menus', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateMenuDto) =>
    request<Menu>(`/menus/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  setDefault: (id: string) =>
    request<Menu>(`/menus/${id}/set-default`, { method: 'POST' }),
  delete: (id: string) =>
    request<void>(`/menus/${id}`, { method: 'DELETE' }),
  deleteAll: () =>
    request<void>('/menus', { method: 'DELETE' }),
};

// Zones API
export const zonesApi = {
  getAll: () => request<Zone[]>('/zones'),
  getOne: (id: string) => request<Zone>(`/zones/${id}`),
  getFloors: () => request<number[]>('/zones/floors'),
  create: (data: CreateZoneDto) =>
    request<Zone>('/zones', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateZoneDto) =>
    request<Zone>(`/zones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/zones/${id}`, { method: 'DELETE' }),
  seed: () =>
    request<void>('/zones/seed', { method: 'POST' }),
};

// Types
export interface Category {
  id: string;
  name: string;
  menuId?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Menu {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  sortOrder: number;
  isDefault: boolean;
  timeStart?: string | null;
  timeEnd?: string | null;
  activeDays?: number[] | null;
  createdAt: string;
  updatedAt: string;
  categories?: Category[];
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: string;
  name: string;
  zone: string;
  capacity: number;
  status: 'empty' | 'occupied' | 'paying';
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Zone {
  id: string;
  name: string;
  icon?: string;
  floor: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Printer {
  id: string;
  name: string;
  type: 'kitchen' | 'bar' | 'receipt';
  connectionType: 'tcp' | 'usb';
  ipAddress?: string;
  port?: number;
  isActive: boolean;
  createdAt: string;
}

export interface DailyReport {
  date: string;
  totalSales: number;
  orderCount: number;
  averageOrderValue: number;
  paymentMethods: {
    cash: number;
    card: number;
  };
}

export interface ProductReport {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
}

// DTOs
export interface CreateCategoryDto {
  name: string;
  menuId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  menuId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateProductDto {
  categoryId: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateProductDto {
  categoryId?: string;
  name?: string;
  price?: number;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CreateTableDto {
  name: string;
  zone?: string;
  capacity?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateTableDto {
  name?: string;
  zone?: string;
  capacity?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateZoneDto {
  name: string;
  icon?: string;
  floor?: number;
  sortOrder?: number;
}

export interface UpdateZoneDto {
  name?: string;
  icon?: string;
  floor?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreatePrinterDto {
  name: string;
  type: 'kitchen' | 'bar' | 'receipt';
  connectionType: 'tcp' | 'usb';
  ipAddress?: string;
  port?: number;
  isActive?: boolean;
}

export interface UpdatePrinterDto {
  name?: string;
  type?: 'kitchen' | 'bar' | 'receipt';
  connectionType?: 'tcp' | 'usb';
  ipAddress?: string;
  port?: number;
  isActive?: boolean;
}

// Orders API
export const ordersApi = {
  getAll: (status?: OrderStatus) =>
    request<Order[]>(`/orders${status ? `?status=${status}` : ''}`),
  getOne: (id: string) => request<Order>(`/orders/${id}`),
  getByTable: (tableId: string) => request<Order[]>(`/orders/table/${tableId}`),
  create: (data: CreateOrderDto) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
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
  printReceipt: (orderId: string) =>
    request<{ success: boolean; message: string }>(`/orders/${orderId}/print-receipt`, {
      method: 'POST',
    }),
  split: (orderId: string, data: SplitOrderDto) =>
    request<{ originalOrder: Order; newOrder: Order }>(`/orders/${orderId}/split`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  transfer: (orderId: string, data: TransferOrderDto) =>
    request<Order>(`/orders/${orderId}/transfer`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  merge: (data: MergeOrdersDto) =>
    request<Order>('/orders/merge', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  cancel: (orderId: string) =>
    request<Order>(`/orders/${orderId}/cancel`, {
      method: 'POST',
    }),
};

// Payments API
export const paymentsApi = {
  create: (data: CreatePaymentDto) =>
    request<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Users API
export const usersApi = {
  getAll: (includeInactive = false) =>
    request<User[]>(`/users${includeInactive ? '?includeInactive=true' : ''}`),
  getOne: (id: string) => request<User>(`/users/${id}`),
  create: (data: CreateUserDto) =>
    request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateUserDto) =>
    request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/users/${id}`, { method: 'DELETE' }),
  login: (pin: string) =>
    request<User>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    }),
  seed: () =>
    request<User | null>('/users/seed', { method: 'POST' }),
};

// User Types
export type UserRole = 'admin' | 'manager' | 'cashier' | 'waiter';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface CreateUserDto {
  name: string;
  pin: string;
  role?: UserRole;
  avatarUrl?: string;
}

export interface UpdateUserDto {
  name?: string;
  pin?: string;
  role?: UserRole;
  isActive?: boolean;
  avatarUrl?: string;
}

// AI API - Menu parsing with Bedrock
export interface ExtractedProduct {
  name: string;
  price: number;
  category: string;
  description?: string;
  imageBase64?: string;
}

export interface MenuParseResult {
  success: boolean;
  products: ExtractedProduct[];
  pageCount: number;
  error?: string;
}

export const aiApi = {
  parseMenu: (imageBase64: string, mimeType?: string) =>
    request<MenuParseResult>('/ai/parse-menu', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, mimeType }),
    }),
  saveProducts: (products: ExtractedProduct[], menuId?: string) =>
    request<{ success: boolean; saved: number; categories: number }>('/ai/save-products', {
      method: 'POST',
      body: JSON.stringify({ products, menuId }),
    }),
  enrichDescription: (productName: string, category: string, currentDescription?: string) =>
    request<{ success: boolean; description: string }>('/ai/enrich-description', {
      method: 'POST',
      body: JSON.stringify({ productName, category, currentDescription }),
    }),
  renderPdf: (pdfBase64: string) =>
    request<{ success: boolean; pages: { pageNum: number; imageBase64: string }[]; pageCount: number }>('/ai/render-pdf', {
      method: 'POST',
      body: JSON.stringify({ pdfBase64 }),
    }),
};

// Order Types
export type OrderStatus = 'open' | 'sent' | 'paid' | 'cancelled' | 'kitchen' | 'ready';
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

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: 'cash' | 'card';
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

export interface CreatePaymentDto {
  orderId: string;
  amount: number;
  paymentMethod: 'cash' | 'card';
}

// Menu DTOs
export interface CreateMenuDto {
  name: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  isDefault?: boolean;
  timeStart?: string;
  timeEnd?: string;
  activeDays?: number[];
}

export interface UpdateMenuDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  isDefault?: boolean;
  timeStart?: string | null;
  timeEnd?: string | null;
  activeDays?: number[] | null;
}
