import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order, OrderStatus } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { Product } from '../../entities/product.entity';
import { Table } from '../../entities/table.entity';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { AutoPrintService } from '../printers/auto-print.service';
import {
  CreateOrderDto,
  UpdateOrderDto,
  AddOrderItemDto,
  SplitOrderDto,
  TransferOrderDto,
  MergeOrdersDto,
} from './dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    private readonly websocketGateway: WebsocketGateway,
    @Optional() @Inject(forwardRef(() => AutoPrintService))
    private readonly autoPrintService?: AutoPrintService,
  ) {}

  /**
   * Generate a unique order number
   */
  private generateOrderNumber(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.getTime().toString().slice(-6);
    return `ORD-${dateStr}-${timeStr}`;
  }


  /**
   * Calculate order total from items
   * Property 1: Sipariş Tutarı Tutarlılığı
   */
  calculateOrderTotal(items: OrderItem[]): number {
    return items.reduce((sum, item) => {
      const itemTotal = Number(item.quantity) * Number(item.unitPrice);
      return sum + itemTotal;
    }, 0);
  }

  /**
   * Recalculate and update order total
   * Requirements: 1.5
   */
  async recalculateOrderTotal(orderId: string): Promise<Order> {
    const order = await this.findOne(orderId);
    const total = this.calculateOrderTotal(order.items);
    order.totalAmount = total;
    return this.orderRepository.save(order);
  }

  /**
   * Find all orders with optional filters
   */
  async findAll(status?: OrderStatus): Promise<Order[]> {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    return this.orderRepository.find({
      where,
      relations: ['items', 'table'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find order by ID with relations
   */
  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'table'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }


  /**
   * Create a new order
   * Requirements: 1.2, 1.3
   */
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Verify table exists
    const table = await this.tableRepository.findOne({
      where: { id: createOrderDto.tableId },
    });
    if (!table) {
      throw new BadRequestException(`Table with ID ${createOrderDto.tableId} not found`);
    }

    // Create order
    const order = this.orderRepository.create({
      tableId: createOrderDto.tableId,
      orderNumber: this.generateOrderNumber(),
      status: 'open',
      totalAmount: 0,
      notes: createOrderDto.notes || null,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Update table status to occupied
    if (table.status === 'empty') {
      table.status = 'occupied';
      await this.tableRepository.save(table);
    }

    return this.findOne(savedOrder.id);
  }

  /**
   * Update order
   */
  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    if (updateOrderDto.status) {
      order.status = updateOrderDto.status;
      if (updateOrderDto.status === 'paid' || updateOrderDto.status === 'cancelled') {
        order.closedAt = new Date();
      }
    }

    if (updateOrderDto.notes !== undefined) {
      order.notes = updateOrderDto.notes;
    }

    await this.orderRepository.save(order);
    const updatedOrder = await this.findOne(id);

    // Emit order:updated event
    this.websocketGateway.emitOrderUpdated(updatedOrder);

    return updatedOrder;
  }


  /**
   * Add item to order
   * Requirements: 2.1
   */
  async addItem(orderId: string, addItemDto: AddOrderItemDto): Promise<Order> {
    const order = await this.findOne(orderId);

    if (order.status !== 'open' && order.status !== 'sent') {
      throw new BadRequestException('Cannot add items to a closed order');
    }

    // Get product details
    const product = await this.productRepository.findOne({
      where: { id: addItemDto.productId },
    });
    if (!product) {
      throw new BadRequestException(`Product with ID ${addItemDto.productId} not found`);
    }

    // Check if item already exists in order
    const existingItem = order.items.find(item => item.productId === addItemDto.productId);
    
    if (existingItem) {
      // Update existing item quantity
      existingItem.quantity += addItemDto.quantity;
      existingItem.totalPrice = Number(existingItem.unitPrice) * existingItem.quantity;
      await this.orderItemRepository.save(existingItem);
    } else {
      // Create new order item with current product price (snapshot)
      const orderItem = this.orderItemRepository.create({
        orderId,
        productId: product.id,
        productName: product.name,
        quantity: addItemDto.quantity,
        unitPrice: product.price,
        totalPrice: Number(product.price) * addItemDto.quantity,
        notes: addItemDto.notes || null,
        status: 'pending',
      });

      await this.orderItemRepository.save(orderItem);
    }

    // Recalculate order total
    return this.recalculateOrderTotal(orderId);
  }

  /**
   * Remove item from order
   * Requirements: 2.1
   */
  async removeItem(orderId: string, itemId: string): Promise<Order> {
    const order = await this.findOne(orderId);

    if (order.status !== 'open' && order.status !== 'sent') {
      throw new BadRequestException('Cannot remove items from a closed order');
    }

    const item = order.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException(`Order item with ID ${itemId} not found in this order`);
    }

    await this.orderItemRepository.remove(item);

    // Recalculate order total
    return this.recalculateOrderTotal(orderId);
  }


  /**
   * Update item quantity
   * Requirements: 2.2
   */
  async updateItemQuantity(
    orderId: string,
    itemId: string,
    quantity: number,
  ): Promise<Order> {
    const order = await this.findOne(orderId);

    if (order.status !== 'open' && order.status !== 'sent') {
      throw new BadRequestException('Cannot update items in a closed order');
    }

    const item = order.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException(`Order item with ID ${itemId} not found in this order`);
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await this.orderItemRepository.remove(item);
    } else {
      item.quantity = quantity;
      item.totalPrice = Number(item.unitPrice) * quantity;
      await this.orderItemRepository.save(item);
    }

    // Recalculate order total
    return this.recalculateOrderTotal(orderId);
  }

  /**
   * Split order - move selected items to a new order
   * Property 3: Sipariş Bölme Tutarlılığı
   * Requirements: 2.3, 2.4
   */
  async splitOrder(orderId: string, splitDto: SplitOrderDto): Promise<{ originalOrder: Order; newOrder: Order }> {
    const order = await this.findOne(orderId);

    if (order.status !== 'open') {
      throw new BadRequestException('Cannot split a non-open order');
    }

    // Validate items exist in order
    const itemsToMove = order.items.filter((item) =>
      splitDto.itemIds.includes(item.id),
    );

    if (itemsToMove.length !== splitDto.itemIds.length) {
      throw new BadRequestException('Some items not found in the order');
    }

    if (itemsToMove.length === order.items.length) {
      throw new BadRequestException('Cannot move all items to new order');
    }

    // Create new order on same table
    const newOrder = this.orderRepository.create({
      tableId: order.tableId,
      orderNumber: this.generateOrderNumber(),
      status: 'open',
      totalAmount: 0,
      notes: null,
    });

    const savedNewOrder = await this.orderRepository.save(newOrder);

    // Move items to new order
    for (const item of itemsToMove) {
      item.orderId = savedNewOrder.id;
      await this.orderItemRepository.save(item);
    }

    // Recalculate both orders
    const updatedOriginal = await this.recalculateOrderTotal(orderId);
    const updatedNew = await this.recalculateOrderTotal(savedNewOrder.id);

    return { originalOrder: updatedOriginal, newOrder: updatedNew };
  }


  /**
   * Transfer order to another table
   * Requirements: 2.5, 2.6
   */
  async transferOrder(orderId: string, transferDto: TransferOrderDto): Promise<Order> {
    const order = await this.findOne(orderId);

    if (order.status === 'paid' || order.status === 'cancelled') {
      throw new BadRequestException('Cannot transfer a closed order');
    }

    // Verify target table exists
    const targetTable = await this.tableRepository.findOne({
      where: { id: transferDto.targetTableId },
    });
    if (!targetTable) {
      throw new BadRequestException(`Target table with ID ${transferDto.targetTableId} not found`);
    }

    const sourceTable = order.tableId ? await this.tableRepository.findOne({
      where: { id: order.tableId },
    }) : null;

    // Update order's table
    const oldTableId = order.tableId;
    order.tableId = transferDto.targetTableId;
    await this.orderRepository.save(order);

    // Update target table status
    if (targetTable.status === 'empty') {
      targetTable.status = 'occupied';
      await this.tableRepository.save(targetTable);
    }

    // Check if source table has other open orders
    if (oldTableId) {
      const sourceTableOrders = await this.orderRepository.find({
        where: {
          tableId: oldTableId,
          status: In(['open', 'sent']),
        },
      });

      if (sourceTableOrders.length === 0 && sourceTable) {
        sourceTable.status = 'empty';
        await this.tableRepository.save(sourceTable);
      }
    }

    return this.findOne(orderId);
  }

  /**
   * Merge multiple orders into one
   * Property 4: Masa Birleştirme Tutarlılığı
   * Requirements: 2.7, 2.8
   */
  async mergeOrders(mergeDto: MergeOrdersDto): Promise<Order> {
    // Verify target table exists
    const targetTable = await this.tableRepository.findOne({
      where: { id: mergeDto.targetTableId },
    });
    if (!targetTable) {
      throw new BadRequestException(`Target table with ID ${mergeDto.targetTableId} not found`);
    }

    // Get all orders to merge
    const orders = await this.orderRepository.find({
      where: { id: In(mergeDto.orderIds) },
      relations: ['items', 'table'],
    });

    if (orders.length !== mergeDto.orderIds.length) {
      throw new BadRequestException('Some orders not found');
    }

    // Validate all orders are open
    for (const order of orders) {
      if (order.status !== 'open') {
        throw new BadRequestException(`Order ${order.orderNumber} is not open`);
      }
    }

    // Create merged order
    const mergedOrder = this.orderRepository.create({
      tableId: mergeDto.targetTableId,
      orderNumber: this.generateOrderNumber(),
      status: 'open',
      totalAmount: 0,
      notes: orders.map((o) => o.notes).filter(Boolean).join(' | ') || null,
    });

    const savedMergedOrder = await this.orderRepository.save(mergedOrder);

    // Collect all source table IDs (filter out nulls)
    const sourceTableIds = new Set(orders.map((o) => o.tableId).filter((id): id is string => id !== null));

    // Move all items to merged order
    for (const order of orders) {
      for (const item of order.items) {
        item.orderId = savedMergedOrder.id;
        await this.orderItemRepository.save(item);
      }
      // Cancel original order
      order.status = 'cancelled';
      order.closedAt = new Date();
      await this.orderRepository.save(order);
    }

    // Update table statuses
    for (const tableId of sourceTableIds) {
      if (tableId !== mergeDto.targetTableId) {
        const hasOtherOrders = await this.orderRepository.findOne({
          where: {
            tableId,
            status: In(['open', 'sent']),
          },
        });
        if (!hasOtherOrders) {
          const table = await this.tableRepository.findOne({ where: { id: tableId } });
          if (table) {
            table.status = 'empty';
            await this.tableRepository.save(table);
          }
        }
      }
    }

    // Update target table status
    if (targetTable.status === 'empty') {
      targetTable.status = 'occupied';
      await this.tableRepository.save(targetTable);
    }

    // Recalculate merged order total
    return this.recalculateOrderTotal(savedMergedOrder.id);
  }


  /**
   * Cancel order
   * Requirements: 2.9
   */
  async cancelOrder(orderId: string): Promise<Order> {
    const order = await this.findOne(orderId);

    if (order.status === 'paid') {
      throw new BadRequestException('Cannot cancel a paid order');
    }

    if (order.status === 'cancelled') {
      throw new BadRequestException('Order is already cancelled');
    }

    order.status = 'cancelled';
    order.closedAt = new Date();
    await this.orderRepository.save(order);

    // Check if table has other open orders
    if (order.tableId) {
      const tableOrders = await this.orderRepository.find({
        where: {
          tableId: order.tableId,
          status: In(['open', 'sent']),
        },
      });

      if (tableOrders.length === 0) {
        const table = await this.tableRepository.findOne({
          where: { id: order.tableId },
        });
        if (table) {
          table.status = 'empty';
          await this.tableRepository.save(table);
        }
      }
    }

    return this.findOne(orderId);
  }

  /**
   * Send order (print to kitchen/bar)
   * Sipariş yazıcıya gönderilir, durum 'sent' olur
   */
  async sendToKitchen(orderId: string, waiterName?: string): Promise<Order> {
    const order = await this.findOne(orderId);

    if (order.status !== 'open') {
      throw new BadRequestException(
        `Order must be in 'open' status to send. Current status: ${order.status}`,
      );
    }

    if (!order.items || order.items.length === 0) {
      throw new BadRequestException('Cannot send empty order');
    }

    // Bekleyen sipariş sayısını hesapla
    const pendingOrders = await this.orderRepository.count({
      where: {
        status: 'sent',
      },
    });

    // Update order status to sent
    order.status = 'sent' as OrderStatus;
    await this.orderRepository.save(order);

    // Update all order items to sent status
    await this.orderItemRepository.update(
      { orderId: order.id },
      { status: 'preparing' },
    );

    const updatedOrder = await this.findOne(orderId);

    // Emit order:new event
    this.websocketGateway.emitOrderNew(updatedOrder);

    // Trigger auto-print
    if (this.autoPrintService) {
      this.autoPrintService.onOrderSentToKitchen(updatedOrder, waiterName, pendingOrders).catch(err => {
        console.error('Auto-print failed:', err);
      });
    }

    return updatedOrder;
  }

  /**
   * Get orders by table
   */
  async findByTable(tableId: string, status?: OrderStatus): Promise<Order[]> {
    const where: any = { tableId };
    if (status) {
      where.status = status;
    }
    return this.orderRepository.find({
      where,
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get active orders for a table (open or sent)
   */
  async getOpenOrdersForTable(tableId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: {
        tableId,
        status: In(['open', 'sent']),
      },
      relations: ['items'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Fix orders that are fully paid but still marked as open
   * This can happen due to bugs or interrupted transactions
   */
  async fixPaidOrders(): Promise<{ fixedCount: number; message: string }> {
    // Find all open orders
    const openOrders = await this.orderRepository.find({
      where: {
        status: In(['open', 'sent']),
      },
      relations: ['payments', 'table'],
    });

    let fixedCount = 0;
    const tableIds = new Set<string>();

    for (const order of openOrders) {
      const totalPaid = order.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const orderTotal = Number(order.totalAmount);

      // If fully paid (with small tolerance for rounding)
      if (totalPaid >= orderTotal - 0.01 && orderTotal > 0) {
        await this.orderRepository.update(order.id, {
          status: 'paid',
          closedAt: new Date(),
        });
        if (order.tableId) {
          tableIds.add(order.tableId);
        }
        fixedCount++;
        console.log(`[FixPaidOrders] Fixed order ${order.id}: paid=${totalPaid}, total=${orderTotal}`);
      }
    }

    // Check and update table statuses
    for (const tableId of tableIds) {
      const remainingOpenOrders = await this.orderRepository.find({
        where: {
          tableId,
          status: In(['open', 'sent']),
        },
      });

      if (remainingOpenOrders.length === 0) {
        await this.tableRepository.update(tableId, { status: 'empty' });
        console.log(`[FixPaidOrders] Table ${tableId} set to empty`);
      }
    }

    return {
      fixedCount,
      message: fixedCount > 0 
        ? `${fixedCount} sipariş düzeltildi` 
        : 'Düzeltilecek sipariş bulunamadı',
    };
  }

  /**
   * Close all open/sent orders (for end of day or cleanup)
   * This cancels all orders and resets table statuses
   */
  async closeAllOrders(): Promise<{ closedCount: number; message: string }> {
    // Find all open or sent orders
    const openOrders = await this.orderRepository.find({
      where: {
        status: In(['open', 'sent']),
      },
      relations: ['table'],
    });

    if (openOrders.length === 0) {
      return { closedCount: 0, message: 'Kapatılacak sipariş bulunamadı' };
    }

    // Collect unique table IDs
    const tableIds = new Set<string>();

    // Cancel all orders
    for (const order of openOrders) {
      order.status = 'cancelled';
      order.closedAt = new Date();
      await this.orderRepository.save(order);
      if (order.tableId) {
        tableIds.add(order.tableId);
      }
    }

    // Reset all affected tables to empty
    for (const tableId of tableIds) {
      const table = await this.tableRepository.findOne({
        where: { id: tableId },
      });
      if (table) {
        table.status = 'empty';
        await this.tableRepository.save(table);
      }
    }

    return {
      closedCount: openOrders.length,
      message: `${openOrders.length} sipariş kapatıldı, ${tableIds.size} masa boşaltıldı`,
    };
  }

  /**
   * Get current active order for customer display
   * Returns the most recently updated open/sent order
   */
  async getCurrentDisplayOrder(): Promise<Order | null> {
    const order = await this.orderRepository.findOne({
      where: {
        status: In(['open', 'sent']),
      },
      relations: ['items', 'table'],
      order: { updatedAt: 'DESC' },
    });

    if (order && order.table) {
      (order as any).tableName = order.table.name;
    }

    return order;
  }
}
