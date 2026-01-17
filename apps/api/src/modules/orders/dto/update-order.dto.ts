import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';
import { OrderStatus } from '../../../entities/order.entity';

export class UpdateOrderDto {
  @IsOptional()
  @IsIn(['open', 'sent', 'paid', 'cancelled'])
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
