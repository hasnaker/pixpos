import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto';
import { Payment } from '../../entities/payment.entity';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Create a new payment
   * POST /api/payments
   * Requirements: 1.6
   */
  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this.paymentsService.create(createPaymentDto);
  }

  /**
   * Get payments for a specific order
   * GET /api/payments/:orderId
   */
  @Get(':orderId')
  async findByOrder(
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<Payment[]> {
    return this.paymentsService.findByOrder(orderId);
  }
}
