import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  UpdateOrderDto,
  AddOrderItemDto,
  SplitOrderDto,
  TransferOrderDto,
  MergeOrdersDto,
} from './dto';
import { Order, OrderStatus } from '../../entities/order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * GET /api/orders
   * Get all orders with optional status filter
   */
  @Get()
  async findAll(@Query('status') status?: OrderStatus): Promise<Order[]> {
    return this.ordersService.findAll(status);
  }

  /**
   * GET /api/orders/:id
   * Get order by ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  /**
   * POST /api/orders
   * Create new order
   * Requirements: 1.2, 1.3
   */
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(createOrderDto);
  }

  /**
   * PUT /api/orders/:id
   * Update order
   */
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    return this.ordersService.update(id, updateOrderDto);
  }


  /**
   * POST /api/orders/:id/items
   * Add item to order
   * Requirements: 2.1
   */
  @Post(':id/items')
  async addItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addItemDto: AddOrderItemDto,
  ): Promise<Order> {
    return this.ordersService.addItem(id, addItemDto);
  }

  /**
   * DELETE /api/orders/:id/items/:itemId
   * Remove item from order
   * Requirements: 2.1
   */
  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.OK)
  async removeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ): Promise<Order> {
    return this.ordersService.removeItem(id, itemId);
  }

  /**
   * PATCH /api/orders/:id/items/:itemId/quantity
   * Update item quantity
   * Requirements: 2.2
   */
  @Patch(':id/items/:itemId/quantity')
  async updateItemQuantity(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body('quantity') quantity: number,
  ): Promise<Order> {
    return this.ordersService.updateItemQuantity(id, itemId, quantity);
  }

  /**
   * POST /api/orders/:id/split
   * Split order
   * Requirements: 2.3, 2.4
   */
  @Post(':id/split')
  async splitOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() splitDto: SplitOrderDto,
  ): Promise<{ originalOrder: Order; newOrder: Order }> {
    return this.ordersService.splitOrder(id, splitDto);
  }

  /**
   * POST /api/orders/:id/transfer
   * Transfer order to another table
   * Requirements: 2.5, 2.6
   */
  @Post(':id/transfer')
  async transferOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() transferDto: TransferOrderDto,
  ): Promise<Order> {
    return this.ordersService.transferOrder(id, transferDto);
  }

  /**
   * POST /api/orders/merge
   * Merge multiple orders
   * Requirements: 2.7, 2.8
   */
  @Post('merge')
  async mergeOrders(@Body() mergeDto: MergeOrdersDto): Promise<Order> {
    return this.ordersService.mergeOrders(mergeDto);
  }

  /**
   * POST /api/orders/:id/cancel
   * Cancel order
   * Requirements: 2.9
   */
  @Post(':id/cancel')
  async cancelOrder(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return this.ordersService.cancelOrder(id);
  }

  /**
   * POST /api/orders/close-all
   * Close all open/sent orders (for end of day or cleanup)
   */
  @Post('close-all')
  async closeAllOrders(): Promise<{ closedCount: number; message: string }> {
    return this.ordersService.closeAllOrders();
  }

  /**
   * POST /api/orders/fix-paid
   * Fix orders that are fully paid but still marked as open
   */
  @Post('fix-paid')
  async fixPaidOrders(): Promise<{ fixedCount: number; message: string }> {
    return this.ordersService.fixPaidOrders();
  }

  /**
   * POST /api/orders/:id/send-to-kitchen
   * Send order to kitchen
   * Requirements: 1.5, 3.5, 6.1.3
   */
  @Post(':id/send-to-kitchen')
  async sendToKitchen(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('waiterName') waiterName?: string,
  ): Promise<Order> {
    return this.ordersService.sendToKitchen(id, waiterName);
  }

  /**
   * POST /api/orders/:id/print-receipt
   * Print receipt (adisyon) without completing payment
   * For manual receipt printing from order screen
   */
  @Post(':id/print-receipt')
  async printReceipt(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('waiterName') waiterName?: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.ordersService.printReceipt(id, waiterName);
  }

  /**
   * GET /api/orders/table/:tableId
   * Get orders by table
   */
  @Get('table/:tableId')
  async findByTable(
    @Param('tableId', ParseUUIDPipe) tableId: string,
    @Query('status') status?: OrderStatus,
  ): Promise<Order[]> {
    return this.ordersService.findByTable(tableId, status);
  }

  /**
   * GET /api/orders/display/current
   * Get current active order for customer display
   */
  @Get('display/current')
  async getCurrentDisplayOrder(): Promise<Order | null> {
    return this.ordersService.getCurrentDisplayOrder();
  }

  /**
   * POST /api/orders/display/set
   * Set order to show on customer display (called from POS monitor button)
   */
  @Post('display/set')
  async setDisplayOrder(
    @Body('orderId') orderId: string | null,
  ): Promise<{ success: boolean; order?: Order }> {
    return this.ordersService.setDisplayOrder(orderId);
  }

  /**
   * POST /api/orders/display/clear
   * Clear customer display
   */
  @Post('display/clear')
  @HttpCode(HttpStatus.OK)
  async clearDisplayOrder(): Promise<{ success: boolean }> {
    await this.ordersService.clearDisplayOrder();
    return { success: true };
  }

  /**
   * GET /api/orders/active
   * Get active order for a specific table (for customer display)
   */
  @Get('active')
  async getActiveOrder(@Query('tableId') tableId?: string): Promise<Order | null> {
    if (tableId) {
      const orders = await this.ordersService.findByTable(tableId);
      return orders.find(o => ['open', 'sent'].includes(o.status)) || null;
    }
    return this.ordersService.getCurrentDisplayOrder();
  }

  /**
   * POST /api/orders/:id/discount
   * Apply discount to order
   */
  @Post(':id/discount')
  async applyDiscount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() discountDto: { type: 'percent' | 'amount'; value: number },
  ): Promise<Order> {
    return this.ordersService.applyDiscount(id, discountDto.type, discountDto.value);
  }

  /**
   * DELETE /api/orders/:id/discount
   * Remove discount from order
   */
  @Delete(':id/discount')
  async removeDiscount(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return this.ordersService.removeDiscount(id);
  }
}
