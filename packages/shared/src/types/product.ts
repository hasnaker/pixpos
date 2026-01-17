export interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDto {
  categoryId: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateProductDto {
  categoryId?: string;
  name?: string;
  price?: number;
  imageUrl?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}
