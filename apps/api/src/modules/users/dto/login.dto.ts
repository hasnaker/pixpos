import { IsString, Length, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @Length(4, 6)
  @Matches(/^\d+$/, { message: 'PIN sadece rakam içermelidir' })
  pin: string;
}
