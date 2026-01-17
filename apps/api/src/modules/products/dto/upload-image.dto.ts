import { IsString, IsNotEmpty } from 'class-validator';

export class UploadImageResponseDto {
  @IsString()
  @IsNotEmpty()
  imageUrl: string;
}
