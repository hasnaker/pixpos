import { IsString, IsEnum, IsOptional, IsBoolean, Length, Matches } from 'class-validator';
import { UserRole } from '../../../entities/user.entity';

export class UpdateUserDto {
  @IsString()
  @Length(2, 100)
  @IsOptional()
  name?: string;

  @IsString()
  @Length(4, 6)
  @Matches(/^\d+$/, { message: 'PIN sadece rakam içermelidir' })
  @IsOptional()
  pin?: string;

  @IsEnum(['admin', 'manager', 'cashier', 'waiter'])
  @IsOptional()
  role?: UserRole;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
