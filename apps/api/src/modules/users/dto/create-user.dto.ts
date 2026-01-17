import { IsString, IsEnum, IsOptional, Length, Matches } from 'class-validator';
import { UserRole } from '../../../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsString()
  @Length(4, 6)
  @Matches(/^\d+$/, { message: 'PIN sadece rakam içermelidir' })
  pin: string;

  @IsEnum(['admin', 'manager', 'cashier', 'waiter'])
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
