import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, Matches } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'timeStart must be in HH:MM format' })
  timeStart?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'timeEnd must be in HH:MM format' })
  timeEnd?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  activeDays?: number[];
}
