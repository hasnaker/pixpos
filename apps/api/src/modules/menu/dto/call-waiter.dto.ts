import { IsUUID } from 'class-validator';

export class CallWaiterDto {
  @IsUUID()
  tableId: string;
}
