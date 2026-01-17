import { IsString, IsNumber, IsOptional, Min, IsIP, IsPort } from 'class-validator';

export class OkcConfigDto {
  @IsIP()
  ip: string;

  @IsNumber()
  @Min(1)
  port: number;

  @IsOptional()
  @IsNumber()
  timeout?: number;

  @IsOptional()
  @IsString()
  terminalId?: string;
}

export class SaleRequestDto {
  @IsNumber()
  @Min(1)
  amount: number; // Kuruş cinsinden

  @IsString()
  orderId: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class RefundRequestDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  originalTransactionId: string;

  @IsString()
  orderId: string;
}

export class VoidRequestDto {
  @IsString()
  transactionId: string;

  @IsString()
  orderId: string;
}
