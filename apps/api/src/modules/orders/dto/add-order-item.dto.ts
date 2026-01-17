import { IsUUID, IsNumber, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class AddOrderItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
