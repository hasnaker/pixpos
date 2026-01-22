import {
  IsString,
  IsIn,
  IsOptional,
  IsNumber,
  IsBoolean,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class UpdatePrinterDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn(['kitchen', 'bar', 'receipt'])
  type?: 'kitchen' | 'bar' | 'receipt';

  @IsOptional()
  @IsString()
  @IsIn(['tcp', 'usb'])
  connectionType?: 'tcp' | 'usb';

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
