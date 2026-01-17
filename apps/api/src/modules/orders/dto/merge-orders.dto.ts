import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class MergeOrdersDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(2)
  orderIds: string[];

  @IsUUID()
  targetTableId: string;
}
