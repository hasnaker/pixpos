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

// Auth & Tenant State
let authToken: string | null = localStorage.getItem('posToken');
let currentStoreId: string | null = localStorage.getItem('storeId');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('posToken', token);
  } else {
    localStorage.removeItem('posToken');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

export function setStoreId(storeId: string | null) {
  currentStoreId = storeId;
  if (storeId) {
    localStorage.setItem('storeId', storeId);
  } else {
    localStorage.removeItem('storeId');
  }
}

export function getStoreId(): string | null {
  return currentStoreId;
}

export function isAuthenticated(): boolean {
  return !!authToken && !!currentStoreId;
}

export function logout() {
  setAuthToken(null);
  setStoreId(null);
  localStorage.removeItem('currentUser');
}

// API Connection Error - thrown when API is unreachable
export class ApiConnectionError extends Error {
  constructor(message = 'API sunucusuna bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.') {
    super(message);
    this.name = 'ApiConnectionError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add auth token if available
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Add store ID if available
  if (currentStoreId) {
    headers['X-Store-ID'] = currentStoreId;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      logout();
      window.location.href = '/login';
      throw new Error('Oturum süresi doldu');
    }

    // Handle 403 Forbidden (store suspended etc)
    if (response.status === 403) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Bu işlem için yetkiniz yok');
    }

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
  } catch (error) {
    // Network error - API unreachable
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiConnectionError();
    }
    throw error;
  }
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
  printerId?: string | null;
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
  prefix?: string;
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
  printerId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  menuId?: string | null;
  printerId?: string | null;
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
  prefix?: string;
  icon?: string;
  floor?: number;
  sortOrder?: number;
}

export interface UpdateZoneDto {
  name?: string;
  prefix?: string;
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

// Settings Types
export interface BusinessSettings {
  storeName: string;
  logoUrl: string;
  address?: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
  displayVideos?: string[]; // Customer display videos (URLs or base64)
}

export interface ReceiptSettings {
  showLogo: boolean;
  showAddress: boolean;
  showPhone: boolean;
  showTaxNumber: boolean;
  footerText: string;
  paperWidth: '58mm' | '80mm';
}

export interface DeviceSettings {
  kitchen: boolean;
  waiter: boolean;
  qrMenu: boolean;
}

export interface AllSettings {
  business: BusinessSettings;
  receipt: ReceiptSettings;
  devices: DeviceSettings;
}

// Settings API
export const settingsApi = {
  getAll: () => request<AllSettings>('/settings'),
  getBusiness: () => request<BusinessSettings>('/settings/business'),
  updateBusiness: (data: Partial<BusinessSettings>) =>
    request<BusinessSettings>('/settings/business', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getReceipt: () => request<ReceiptSettings>('/settings/receipt'),
  updateReceipt: (data: Partial<ReceiptSettings>) =>
    request<ReceiptSettings>('/settings/receipt', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getDevices: () => request<DeviceSettings>('/settings/devices'),
  updateDevices: (data: Partial<DeviceSettings>) =>
    request<DeviceSettings>('/settings/devices', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};


// Auth Types
export interface Store {
  id: string;
  name: string;
  slug: string;
  subdomain: string | null;
  logoUrl: string | null;
  status: 'active' | 'suspended' | 'trial' | 'cancelled';
  plan: string;
}

export interface AuthResponse {
  user: User;
  store: Store | null;
  accessToken: string;
}

// Auth API
export const authApi = {
  loginWithPin: (pin: string, storeId: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ pin, storeId }),
    }),
  getProfile: () => request<User>('/auth/profile'),
  verify: () => request<{ valid: boolean }>('/auth/verify'),
};

// Stores API (for store detection)
export const storesApi = {
  getBySubdomain: (subdomain: string) => request<Store>(`/stores/subdomain/${subdomain}`),
  getBySlug: (slug: string) => request<Store>(`/stores/slug/${slug}`),
};

// Helper: Detect store from URL
export async function detectStoreFromUrl(): Promise<Store | null> {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // For Electron (file:// protocol), use default store "queen"
  if (protocol === 'file:' || navigator.userAgent.includes('Electron')) {
    try {
      const store = await storesApi.getBySubdomain('queen');
      return store;
    } catch {
      // Fallback: try to get from localStorage
      const savedStoreId = localStorage.getItem('storeId');
      if (savedStoreId) {
        return { id: savedStoreId, name: 'Queen Waffle', slug: 'queen', subdomain: 'queen', logoUrl: null, status: 'active', plan: 'premium' } as Store;
      }
      return null;
    }
  }
  
  // Extract subdomain: queen.pixpos.cloud -> queen
  const parts = hostname.split('.');
  if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'api') {
    try {
      const store = await storesApi.getBySubdomain(parts[0]);
      return store;
    } catch {
      return null;
    }
  }
  
  // For localhost, check query param or localStorage
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const urlParams = new URLSearchParams(window.location.search);
    const storeSlug = urlParams.get('store');
    if (storeSlug) {
      try {
        const store = await storesApi.getBySlug(storeSlug);
        return store;
      } catch {
        return null;
      }
    }
  }
  
  return null;
}
