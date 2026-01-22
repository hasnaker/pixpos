const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Auth token management
let authToken: string | null = localStorage.getItem('adminToken');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('adminToken', token);
  } else {
    localStorage.removeItem('adminToken');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

export function isAuthenticated(): boolean {
  return !!authToken;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers as Record<string, string>,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    setAuthToken(null);
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Store Types
export interface Store {
  id: string;
  name: string;
  slug: string;
  subdomain: string | null;
  customDomain: string | null;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  taxNumber: string | null;
  status: 'active' | 'suspended' | 'trial' | 'cancelled';
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  settings: Record<string, unknown> | null;
  features: string[] | null;
  maxUsers: number;
  maxTables: number;
  maxProducts: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreStats {
  usersCount: number;
  tablesCount: number;
  productsCount: number;
  ordersCount: number;
}

export interface CreateStoreDto {
  name: string;
  slug: string;
  subdomain?: string;
  customDomain?: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
  status?: Store['status'];
  plan?: Store['plan'];
  maxUsers?: number;
  maxTables?: number;
  maxProducts?: number;
}

export interface UpdateStoreDto extends Partial<CreateStoreDto> {
  isActive?: boolean;
}

// User Types
export interface User {
  id: string;
  storeId: string | null;
  name: string;
  email: string | null;
  pin: string;
  role: 'admin' | 'cashier' | 'waiter' | 'super_admin';
  isActive: boolean;
  createdAt: string;
}

// Stores API
export const storesApi = {
  getAll: () => request<Store[]>('/stores'),
  getOne: (id: string) => request<Store>(`/stores/${id}`),
  getBySlug: (slug: string) => request<Store>(`/stores/slug/${slug}`),
  getBySubdomain: (subdomain: string) => request<Store>(`/stores/subdomain/${subdomain}`),
  getStats: (id: string) => request<StoreStats>(`/stores/${id}/stats`),
  create: (data: CreateStoreDto) => request<Store>('/stores', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: UpdateStoreDto) => request<Store>(`/stores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => request<void>(`/stores/${id}`, { method: 'DELETE' }),
};

// Users API
export const usersApi = {
  getAll: () => request<User[]>('/users'),
  getOne: (id: string) => request<User>(`/users/${id}`),
  create: (data: Partial<User>) => request<User>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Partial<User>) => request<User>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => request<void>(`/users/${id}`, { method: 'DELETE' }),
};

// Auth Types
export interface AuthResponse {
  user: Partial<User>;
  store: Partial<Store> | null;
  accessToken: string;
}

// Auth API
export const authApi = {
  loginSuperAdmin: (email: string, password: string) => 
    request<AuthResponse>('/auth/super-admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getProfile: () => request<Partial<User>>('/auth/profile'),
  verify: () => request<{ valid: boolean; user: unknown }>('/auth/verify'),
  seedSuperAdmin: () => request<{ message: string }>('/auth/seed-super-admin', { method: 'POST' }),
};
