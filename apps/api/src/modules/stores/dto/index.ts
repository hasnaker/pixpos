import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsObject, IsArray, MaxLength, Min } from 'class-validator';
import { StoreStatus, StorePlan } from '../../../entities/store.entity';

export class CreateStoreDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(50)
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subdomain?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  customDomain?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxNumber?: string;

  @IsOptional()
  @IsEnum(['active', 'suspended', 'trial', 'cancelled'])
  status?: StoreStatus;

  @IsOptional()
  @IsEnum(['free', 'starter', 'professional', 'enterprise'])
  plan?: StorePlan;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @IsOptional()
  @IsArray()
  features?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsers?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxTables?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxProducts?: number;
}

export class UpdateStoreDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subdomain?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  customDomain?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxNumber?: string;

  @IsOptional()
  @IsEnum(['active', 'suspended', 'trial', 'cancelled'])
  status?: StoreStatus;

  @IsOptional()
  @IsEnum(['free', 'starter', 'professional', 'enterprise'])
  plan?: StorePlan;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @IsOptional()
  @IsArray()
  features?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsers?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxTables?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxProducts?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
