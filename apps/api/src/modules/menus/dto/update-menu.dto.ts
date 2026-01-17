import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, Matches } from 'class-validator';

export class UpdateMenuDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

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
  timeStart?: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'timeEnd must be in HH:MM format' })
  timeEnd?: string | null;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  activeDays?: number[] | null;
}
