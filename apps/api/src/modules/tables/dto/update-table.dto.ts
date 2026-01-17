import { IsString, IsOptional, IsNumber, IsBoolean, MaxLength, Min, IsIn } from 'class-validator';
import { TableStatus } from '../../../entities/table.entity';

export class UpdateTableDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  zone?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsIn(['empty', 'occupied', 'paying'])
  status?: TableStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
