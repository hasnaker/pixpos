import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../entities/order.entity';

@Injectable()
export class KitchenService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  /**
   * Get all sent orders (for reference, kitchen display disabled)
   */
  async getKitchenOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      where: {
        status: 'sent',
      },
      relations: ['items', 'table'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Start preparing an order (disabled - kept for compatibility)
   */
  async startPreparing(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'table'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Just return the order as-is, no status change needed
    return order;
  }

  /**
   * Mark order as ready (disabled - kept for compatibility)
   */
  async markOrderReady(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'table'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Just return the order as-is
    return order;
  }
}
