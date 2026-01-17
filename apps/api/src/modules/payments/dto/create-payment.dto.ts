import { IsUUID, IsNumber, IsEnum, Min, IsOptional, IsString } from 'class-validator';

export type PaymentMethod = 'cash' | 'card' | 'online';

export class CreatePaymentDto {
  @IsUUID()
  orderId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(['cash', 'card', 'online'])
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountReceived?: number;

  @IsOptional()
  @IsString()
  waiterName?: string;
}
