import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class SplitOrderDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  itemIds: string[];
}
