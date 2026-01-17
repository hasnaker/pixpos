import {
  Controller,
  Get,
  Post,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { KitchenService } from './kitchen.service';
import { Order } from '../../entities/order.entity';

@Controller('kitchen')
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  /**
   * GET /api/kitchen/orders
   * Get all kitchen orders sorted by creation time (FIFO)
   * Requirements: 4.1
   */
  @Get('orders')
  async getKitchenOrders(): Promise<Order[]> {
    return this.kitchenService.getKitchenOrders();
  }

  /**
   * POST /api/kitchen/orders/:id/ready
   * Mark order as ready
   * Requirements: 4.7
   */
  @Post('orders/:id/ready')
  async markOrderReady(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Order> {
    return this.kitchenService.markOrderReady(id);
  }

  /**
   * POST /api/kitchen/orders/:id/preparing
   * Start preparing an order
   * Requirements: 4.5
   */
  @Post('orders/:id/preparing')
  async startPreparing(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Order> {
    return this.kitchenService.startPreparing(id);
  }
}
