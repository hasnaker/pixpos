import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsOptional,
  IsNumber,
  IsBoolean,
  MaxLength,
  Min,
  Max,
  IsUUID,
} from 'class-validator';

export class CreatePrinterDto {
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsIn(['kitchen', 'bar', 'receipt'])
  type: 'kitchen' | 'bar' | 'receipt';

  @IsString()
  @IsIn(['tcp', 'usb'])
  connectionType: 'tcp' | 'usb';

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ipAddress?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(65535)
  port?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
