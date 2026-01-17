import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Printer } from '../../entities/printer.entity';
import { Category } from '../../entities/category.entity';
import { PrintersController } from './printers.controller';
import { PrintersService } from './printers.service';
import { PrintService } from './print.service';
import { OrderTicketService } from './order-ticket.service';
import { PrintQueueService } from './print-queue.service';
import { AutoPrintService } from './auto-print.service';
import { PrinterDiscoveryService } from './printer-discovery.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Printer, Category]),
  ],
  controllers: [PrintersController],
  providers: [
    PrintersService,
    PrintService,
    OrderTicketService,
    PrintQueueService,
    AutoPrintService,
    PrinterDiscoveryService,
  ],
  exports: [
    PrintersService,
    PrintService,
    OrderTicketService,
    PrintQueueService,
    AutoPrintService,
    PrinterDiscoveryService,
  ],
})
export class PrintersModule {}
