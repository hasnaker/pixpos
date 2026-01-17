const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const config: RequestInit = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : (undefined as T);
}

// ============ TYPES ============

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface Table {
  id: string;
  name: string;
  zone: string;
  capacity: number;
  status: 'empty' | 'occupied' | 'paying';
  isActive: boolean;
  areaId?: string;
  sortOrder?: number;
}

export interface Order {
  id: string;
  tableId: string;
  orderNumber: string;
  status: 'open' | 'sent' | 'paid' | 'cancelled';
  totalAmount: number;
  userId?: string;
  createdAt: string;
  closedAt?: string;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'cashier' | 'waiter';
  isActive: boolean;
}

export interface Area {
  id: string;
  name: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Printer {
  id: string;
  name: string;
  type: 'kitchen' | 'receipt';
  connectionType: 'tcp' | 'usb';
  ipAddress?: string;
  port?: number;
  isActive: boolean;
  autoPrint?: boolean;
}

export interface BusinessSettings {
  storeName: string;
  address: string;
  phone: string;
  email: string;
  taxNumber: string;
  logoUrl: string;
}

export interface LockScreenSettings {
  timeoutMinutes: number;
  pinLength: number;
  autoLockEnabled: boolean;
}

// ============ DTOs ============

export interface CreateTableDto {
  name: string;
  zone?: string;
  capacity?: number;
  sortOrder?: number;
  areaId?: string;
}

export interface UpdateTableDto {
  name?: string;
  zone?: string;
  capacity?: number;
  sortOrder?: number;
  areaId?: string;
}

export interface CreateUserDto {
  name: string;
  pin: string;
  role: 'admin' | 'manager' | 'cashier' | 'waiter';
}

export interface UpdateUserDto {
  name?: string;
  pin?: string;
  role?: 'admin' | 'manager' | 'cashier' | 'waiter';
  isActive?: boolean;
}

export interface CreateAreaDto {
  name: string;
  icon?: string;
  sortOrder?: number;
}

export interface UpdateAreaDto {
  name?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreatePrinterDto {
  name: string;
  type: 'kitchen' | 'receipt';
  connectionType: 'tcp' | 'usb';
  ipAddress?: string;
  port?: number;
  autoPrint?: boolean;
}

export interface UpdatePrinterDto {
  name?: string;
  type?: 'kitchen' | 'receipt';
  connectionType?: 'tcp' | 'usb';
  ipAddress?: string;
  port?: number;
  isActive?: boolean;
  autoPrint?: boolean;
}

// ============ CATEGORY DTOs ============

export interface CreateCategoryDto {
  name: string;
  sortOrder?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// ============ PRODUCT DTOs ============

export interface CreateProductDto {
  name: string;
  categoryId: string;
  price: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  categoryId?: string;
  price?: number;
  description?: string;
  isActive?: boolean;
}

// ============ REPORT TYPES ============

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  productId?: string;
  userId?: string;
  paymentMethod?: string;
}

export interface HourlyBreakdown {
  hour: number;
  sales: number;
  orderCount: number;
}

export interface DailyBreakdown {
  date: string;
  revenue: number;
  orderCount: number;
  averageTicket: number;
}

export interface ProductSalesReport {
  productId: string;
  productName: string;
  categoryName?: string;
  quantity?: number;
  quantitySold?: number;
  revenue?: number;
  totalRevenue?: number;
}

export interface CategorySales {
  categoryId: string;
  categoryName: string;
  productCount: number;
  totalQuantity: number;
  totalRevenue: number;
  percentage: number;
}

export interface WaiterPerformance {
  userId: string;
  userName: string;
  orderCount: number;
  totalRevenue: number;
  averageTicket: number;
  itemCount: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  total: number;
  percentage: number;
}

export interface DetailedReport {
  summary: {
    totalRevenue: number;
    orderCount: number;
    averageTicket: number;
    cashTotal: number;
    cardTotal: number;
    itemsSold: number;
    cancelledOrders: number;
    cancelledAmount: number;
  };
  topProducts: ProductSalesReport[];
  bottomProducts: ProductSalesReport[];
  hourlyBreakdown: HourlyBreakdown[];
  dailyBreakdown: DailyBreakdown[];
  categorySales: CategorySales[];
  waiterPerformance: WaiterPerformance[];
  paymentMethods: PaymentMethodBreakdown[];
  peakHour: { hour: number; sales: number; orderCount: number };
  comparison?: {
    previousPeriod: { revenue: number; orderCount: number };
    revenueChange: number;
    orderCountChange: number;
  };
}

// Type aliases for backward compatibility
export type HourlyReport = HourlyBreakdown;
export type ProductReport = ProductSalesReport;
export type DailyBreakdownItem = DailyBreakdown;

// ============ APIs ============

export const categoriesApi = {
  getAll: () => request<Category[]>('/categories'),
  create: (data: CreateCategoryDto) => request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateCategoryDto) => request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/categories/${id}`, { method: 'DELETE' }),
};

export const productsApi = {
  getAll: () => request<Product[]>('/products'),
  create: (data: CreateProductDto) => request<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateProductDto) => request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/products/${id}`, { method: 'DELETE' }),
  uploadImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`${API_BASE}/products/${id}/image`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Image upload failed');
    return response.json();
  },
};

export const tablesApi = {
  getAll: () => request<Table[]>('/tables'),
  create: (data: CreateTableDto) => request<Table>('/tables', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateTableDto) => request<Table>(`/tables/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/tables/${id}`, { method: 'DELETE' }),
};

export const ordersApi = {
  getAll: (status?: string) => request<Order[]>(`/orders${status ? `?status=${status}` : ''}`),
  getRecent: (limit = 10) => request<Order[]>(`/orders?limit=${limit}`),
};

export const usersApi = {
  getAll: () => request<User[]>('/users'),
  create: (data: CreateUserDto) => request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateUserDto) => request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/users/${id}`, { method: 'DELETE' }),
};

export const areasApi = {
  getAll: () => request<Area[]>('/zones'),
  create: (data: CreateAreaDto) => request<Area>('/zones', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateAreaDto) => request<Area>(`/zones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/zones/${id}`, { method: 'DELETE' }),
};

export interface DiscoveredPrinter {
  ip: string;
  port: number;
  hostname?: string;
  responseTime: number;
}

export const printersApi = {
  getAll: () => request<Printer[]>('/printers'),
  create: (data: CreatePrinterDto) => request<Printer>('/printers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdatePrinterDto) => request<Printer>(`/printers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/printers/${id}`, { method: 'DELETE' }),
  test: (id: string) => request<{ success: boolean; message?: string }>(`/printers/${id}/test`, { method: 'POST' }),
  discover: (subnet?: string) => request<{ printers: DiscoveredPrinter[]; scannedAt: string }>('/printers/discover', { 
    method: 'POST', 
    body: JSON.stringify({ subnet }) 
  }),
  testConnection: (ip: string, port?: number) => request<{ success: boolean; responseTime?: number; error?: string }>('/printers/test-connection', {
    method: 'POST',
    body: JSON.stringify({ ip, port: port || 9100 })
  }),
};

export const settingsApi = {
  getBusiness: () => request<BusinessSettings>('/settings/business').catch(() => ({
    storeName: 'PIXPOS Demo', address: '', phone: '', email: '', taxNumber: '', logoUrl: '',
  })),
  updateBusiness: (data: BusinessSettings) => request<BusinessSettings>('/settings/business', { method: 'PUT', body: JSON.stringify(data) }),
  getLockScreen: () => request<LockScreenSettings>('/settings/lock-screen').catch(() => ({
    timeoutMinutes: 5, pinLength: 4, autoLockEnabled: true,
  })),
  updateLockScreen: (data: LockScreenSettings) => request<LockScreenSettings>('/settings/lock-screen', { method: 'PUT', body: JSON.stringify(data) }),
};

export const reportsApi = {
  getDaily: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return request<{ totalSales: number; orderCount: number; averageOrderValue: number }>(`/reports/daily${params.toString() ? `?${params}` : ''}`);
  },
  getHourly: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return request<HourlyBreakdown[]>(`/reports/hourly${params.toString() ? `?${params}` : ''}`);
  },
  getDailyBreakdown: (startDate: string, endDate: string) =>
    request<DailyBreakdown[]>(`/reports/daily-breakdown?startDate=${startDate}&endDate=${endDate}`),
  getProducts: (startDate?: string, endDate?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (limit) params.append('limit', limit.toString());
    return request<ProductSalesReport[]>(`/reports/products${params.toString() ? `?${params}` : ''}`);
  },
  getCategories: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return request<CategorySales[]>(`/reports/categories${params.toString() ? `?${params}` : ''}`);
  },
  getWaiters: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return request<WaiterPerformance[]>(`/reports/waiters${params.toString() ? `?${params}` : ''}`);
  },
  getPayments: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return request<PaymentMethodBreakdown[]>(`/reports/payments${params.toString() ? `?${params}` : ''}`);
  },
  getDetailed: (filters: ReportFilters) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.productId) params.append('productId', filters.productId);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    return request<DetailedReport>(`/reports/detailed${params.toString() ? `?${params}` : ''}`);
  },
  getDetailedReport: (filters: ReportFilters) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.productId) params.append('productId', filters.productId);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    return request<DetailedReport>(`/reports/detailed${params.toString() ? `?${params}` : ''}`);
  },
};
