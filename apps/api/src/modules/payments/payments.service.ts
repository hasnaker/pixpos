import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Payment } from '../../entities/payment.entity';
import { Order } from '../../entities/order.entity';
import { Table } from '../../entities/table.entity';
import { CreatePaymentDto } from './dto';
import { AutoPrintService } from '../printers/auto-print.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    private readonly websocketGateway: WebsocketGateway,
    @Optional() @Inject(forwardRef(() => AutoPrintService))
    private readonly autoPrintService?: AutoPrintService,
  ) {}

  /**
   * Create a payment for an order
   * Requirements: 1.6, 6.1.3
   * Supports split payments - multiple partial payments for same order
   */
  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    // Find the order
    const order = await this.orderRepository.findOne({
      where: { id: createPaymentDto.orderId },
      relations: ['items', 'table'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${createPaymentDto.orderId} not found`);
    }

    // Validate order status - can only pay for open, sent, kitchen, or ready orders
    if (order.status === 'paid') {
      throw new BadRequestException('Order is already paid');
    }

    if (order.status === 'cancelled') {
      throw new BadRequestException('Cannot pay for a cancelled order');
    }

    // Get existing payments separately to ensure fresh data
    const existingPayments = await this.paymentRepository.find({
      where: { orderId: createPaymentDto.orderId },
    });

    // Calculate already paid amount
    const alreadyPaid = existingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const orderTotal = Number(order.totalAmount);
    const remainingAmount = orderTotal - alreadyPaid;
    const paymentAmount = Number(createPaymentDto.amount);

    console.log(`[Payment] Order ${order.id}: total=${orderTotal}, alreadyPaid=${alreadyPaid}, remaining=${remainingAmount}, newPayment=${paymentAmount}`);

    // Validate payment amount doesn't exceed remaining
    if (paymentAmount > remainingAmount + 0.01) { // Small tolerance for rounding
      throw new BadRequestException(
        `Payment amount (${paymentAmount.toFixed(2)}) exceeds remaining amount (${remainingAmount.toFixed(2)})`,
      );
    }

    // Create payment record
    const payment = this.paymentRepository.create({
      orderId: createPaymentDto.orderId,
      amount: createPaymentDto.amount,
      paymentMethod: createPaymentDto.paymentMethod,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Check if order is fully paid
    const totalPaid = alreadyPaid + paymentAmount;
    const isFullyPaid = totalPaid >= orderTotal - 0.01; // Small tolerance

    console.log(`[Payment] Order ${order.id}: totalPaid=${totalPaid}, isFullyPaid=${isFullyPaid}`);

    if (isFullyPaid) {
      // Update order status to paid using update() to avoid cascade issues
      await this.orderRepository.update(order.id, {
        status: 'paid',
        closedAt: new Date(),
      });

      // Close table if no other open orders
      if (order.tableId) {
        await this.closeTableIfNoOpenOrders(order.tableId);
      }

      // Clear customer display
      this.websocketGateway.emitDisplayClear();
    }

    // Trigger auto-print for receipt
    // Requirements: 6.1.3 - On payment complete (customer)
    if (this.autoPrintService) {
      this.autoPrintService.onPaymentComplete(
        order,
        createPaymentDto.paymentMethod as 'cash' | 'card' | 'online',
        createPaymentDto.amountReceived,
        createPaymentDto.waiterName,
      ).catch(err => {
        // Log but don't fail the payment
        console.error('Auto-print receipt failed:', err);
      });
    }

    return savedPayment;
  }

  /**
   * Close table if no other open orders exist
   * Requirements: 1.6 - Masa kapatma mantığı
   */
  private async closeTableIfNoOpenOrders(tableId: string): Promise<void> {
    const openOrders = await this.orderRepository.find({
      where: {
        tableId,
        status: In(['open', 'sent']),
      },
    });

    if (openOrders.length === 0) {
      const table = await this.tableRepository.findOne({
        where: { id: tableId },
      });

      if (table) {
        table.status = 'empty';
        await this.tableRepository.save(table);
      }
    }
  }

  /**
   * Get all payments for an order
   */
  async findByOrder(orderId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get payment by ID
   */
  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  /**
   * Get all payments with optional date filter
   */
  async findAll(startDate?: Date, endDate?: Date): Promise<Payment[]> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .orderBy('payment.createdAt', 'DESC');

    if (startDate) {
      queryBuilder.andWhere('payment.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('payment.createdAt <= :endDate', { endDate });
    }

    return queryBuilder.getMany();
  }
}
