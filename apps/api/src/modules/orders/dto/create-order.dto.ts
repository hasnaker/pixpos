import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  tableId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
