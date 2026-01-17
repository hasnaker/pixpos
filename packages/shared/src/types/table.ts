export type TableStatus = 'empty' | 'occupied' | 'paying';

export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTableDto {
  name: string;
  capacity?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateTableDto {
  name?: string;
  capacity?: number;
  status?: TableStatus;
  sortOrder?: number;
  isActive?: boolean;
}
