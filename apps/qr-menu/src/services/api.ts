import type { Product, Category } from '@mega-pos/shared';

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api';

export interface MenuTable {
  id: string;
  name: string;
}

export interface CategoryWithProducts extends Category {
  products: Product[];
}

export interface MenuResponse {
  table?: MenuTable;
  categories: CategoryWithProducts[];
  storeName?: string;
  storeLogo?: string;
}

export interface CallWaiterResponse {
  success: boolean;
  message: string;
}

export interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
}

/**
 * Get menu - optionally for a specific table
 * If no tableId provided, returns general menu
 */
export async function getMenu(tableId?: string): Promise<MenuResponse> {
  const url = tableId ? `${API_BASE}/menu/${tableId}` : `${API_BASE}/menu`;
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(tableId ? 'Masa bulunamadı' : 'Menü bulunamadı');
    }
    throw new Error('Menü yüklenirken bir hata oluştu');
  }
  
  return response.json();
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  const response = await fetch(`${API_BASE}/products/featured`);
  
  if (!response.ok) {
    return []; // Return empty array on error
  }
  
  return response.json();
}

/**
 * Call waiter for a table
 * Only works if tableId is provided
 */
export async function callWaiter(tableId: string): Promise<CallWaiterResponse> {
  if (!tableId) {
    throw new Error('Garson çağırmak için masa seçilmeli');
  }
  
  const response = await fetch(`${API_BASE}/menu/${tableId}/call-waiter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Masa bulunamadı');
    }
    throw new Error('Garson çağırılırken bir hata oluştu');
  }
  
  return response.json();
}
