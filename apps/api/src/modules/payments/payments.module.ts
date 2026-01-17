import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from '../../entities/payment.entity';
import { Order } from '../../entities/order.entity';
import { Table } from '../../entities/table.entity';
import { PrintersModule } from '../printers/printers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order, Table]),
    forwardRef(() => PrintersModule),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
