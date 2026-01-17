import { IsOptional, IsString } from 'class-validator';

export class MarkReadyDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
