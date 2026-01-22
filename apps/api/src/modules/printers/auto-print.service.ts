import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { Category } from '../../entities/category.entity';
import { PrintersService } from './printers.service';
import { PrintQueueService } from './print-queue.service';
import { OrderTicketService, ReceiptData } from './order-ticket.service';

export interface AutoPrintConfig {
  // Kitchen printing
  printKitchenTicketOnOrderSend: boolean;
  kitchenPrinterId?: string;
  
  // Bar printing
  barPrinterId?: string;
  
  // Receipt printing
  printReceiptOnPayment: boolean;
  receiptPrinterId?: string;
  
  // Business info for receipts
  businessName: string;
  businessAddress1?: string;
  businessAddress2?: string;
  businessPhone?: string;
}

@Injectable()
export class AutoPrintService {
  private readonly logger = new Logger(AutoPrintService.name);
  
  // Default configuration (can be overridden via settings)
  private config: AutoPrintConfig = {
    printKitchenTicketOnOrderSend: true,
    printReceiptOnPayment: true,
    businessName: 'MEGA POS',
  };

  constructor(
    private readonly printersService: PrintersService,
    private readonly printQueueService: PrintQueueService,
    private readonly orderTicketService: OrderTicketService,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Update auto-print configuration
   * Requirements: 6.1.3 - Configurable auto-print
   */
  updateConfig(config: Partial<AutoPrintConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.log('Auto-print configuration updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): AutoPrintConfig {
    return { ...this.config };
  }

  /**
   * Trigger kitchen ticket print when order is sent to kitchen
   * Requirements: 6.1.3 - On order send (kitchen)
   * Now supports category-based printer routing
   */
  async onOrderSentToKitchen(order: Order, waiterName?: string, pendingOrderCount: number = 0): Promise<boolean> {
    if (!this.config.printKitchenTicketOnOrderSend) {
      this.logger.debug('Kitchen auto-print disabled, skipping');
      return false;
    }

    try {
      // Group items by printer (based on category)
      const printerGroups = await this.groupItemsByPrinter(order);
      
      if (printerGroups.size === 0) {
        // No category-based routing, use default kitchen printer
        return this.printToDefaultKitchenPrinter(order, waiterName, pendingOrderCount);
      }

      let success = true;
      
      // Print to each printer
      for (const [printerId, items] of printerGroups) {
        try {
          const printer = await this.printersService.findOne(printerId);
          if (!printer.isActive) {
            this.logger.warn(`Printer ${printer.name} is not active, skipping`);
            continue;
          }

          // Create a partial order with only these items
          const partialOrder = {
            ...order,
            items: items,
            totalAmount: items.reduce((sum, item) => sum + Number(item.totalPrice), 0),
          } as Order;

          const ticketData = this.orderTicketService.orderToTicketData(partialOrder, waiterName, pendingOrderCount);
          const ticketBuffer = this.orderTicketService.formatKitchenTicket(ticketData);

          await this.printQueueService.addJob(printer, ticketBuffer, 'kitchen', 'high');
          this.logger.log(`Kitchen ticket queued for ${printer.name}: ${items.length} items`);
        } catch (error) {
          this.logger.error(`Failed to print to printer ${printerId}: ${error}`);
          success = false;
        }
      }

      // Print items without category printer to default
      const itemsWithoutPrinter = order.items.filter(item => {
        for (const items of printerGroups.values()) {
          if (items.some(i => i.id === item.id)) return false;
        }
        return true;
      });

      if (itemsWithoutPrinter.length > 0) {
        const partialOrder = {
          ...order,
          items: itemsWithoutPrinter,
          totalAmount: itemsWithoutPrinter.reduce((sum, item) => sum + Number(item.totalPrice), 0),
        } as Order;
        await this.printToDefaultKitchenPrinter(partialOrder, waiterName, pendingOrderCount);
      }

      return success;
    } catch (error) {
      this.logger.error(`Failed to queue kitchen ticket: ${error}`);
      return false;
    }
  }

  /**
   * Group order items by their category's printer
   */
  private async groupItemsByPrinter(order: Order): Promise<Map<string, typeof order.items>> {
    const printerGroups = new Map<string, typeof order.items>();
    
    // Get all categories with printers
    const categories = await this.categoryRepository.find({
      where: { printerId: undefined }, // This won't work, need to check for NOT NULL
    });
    
    // Get categories that have printers assigned
    const categoriesWithPrinters = await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.printer_id IS NOT NULL')
      .getMany();

    const categoryPrinterMap = new Map<string, string>();
    for (const cat of categoriesWithPrinters) {
      if (cat.printerId) {
        categoryPrinterMap.set(cat.id, cat.printerId);
      }
    }

    // Group items by printer
    for (const item of order.items) {
      // Skip items without productId (deleted products)
      if (!item.productId) continue;
      
      // Get product's category
      const product = await this.getProductCategory(item.productId);
      if (product && categoryPrinterMap.has(product.categoryId)) {
        const printerId = categoryPrinterMap.get(product.categoryId)!;
        if (!printerGroups.has(printerId)) {
          printerGroups.set(printerId, []);
        }
        printerGroups.get(printerId)!.push(item);
      }
    }

    return printerGroups;
  }

  /**
   * Get product's category ID
   */
  private async getProductCategory(productId: string): Promise<{ categoryId: string } | null> {
    // We need to query the product to get its category
    // For now, we'll use a simple approach
    const { Product } = await import('../../entities/product.entity');
    const { getRepository } = await import('typeorm');
    
    try {
      const dataSource = this.categoryRepository.manager.connection;
      const productRepo = dataSource.getRepository(Product);
      const product = await productRepo.findOne({ where: { id: productId } });
      return product ? { categoryId: product.categoryId } : null;
    } catch {
      return null;
    }
  }

  /**
   * Print to default kitchen printer (fallback)
   */
  private async printToDefaultKitchenPrinter(order: Order, waiterName?: string, pendingOrderCount: number = 0): Promise<boolean> {
    const printer = await this.getKitchenPrinter();
    if (!printer) {
      this.logger.warn('No active kitchen printer found, skipping auto-print');
      return false;
    }

    const ticketData = this.orderTicketService.orderToTicketData(order, waiterName, pendingOrderCount);
    const ticketBuffer = this.orderTicketService.formatKitchenTicket(ticketData);

    await this.printQueueService.addJob(printer, ticketBuffer, 'kitchen', 'high');
    this.logger.log(`Kitchen ticket queued for order ${order.orderNumber}`);
    return true;
  }

  /**
   * Trigger receipt print when payment is completed
   * Requirements: 6.1.3 - On payment complete (customer)
   */
  async onPaymentComplete(
    order: Order,
    paymentMethod: 'cash' | 'card' | 'online',
    amountReceived?: number,
    waiterName?: string,
  ): Promise<boolean> {
    if (!this.config.printReceiptOnPayment) {
      this.logger.debug('Receipt auto-print disabled, skipping');
      return false;
    }

    try {
      // Get receipt printer
      const printer = await this.getReceiptPrinter();
      if (!printer) {
        this.logger.warn('No active receipt printer found, skipping auto-print');
        return false;
      }

      // Format receipt
      const receiptData = this.orderTicketService.orderToReceiptData(
        order,
        {
          name: this.config.businessName,
          address1: this.config.businessAddress1,
          address2: this.config.businessAddress2,
          phone: this.config.businessPhone,
        },
        paymentMethod,
        amountReceived,
        waiterName,
      );
      const receiptBuffer = this.orderTicketService.formatReceipt(receiptData);

      // Add to print queue with normal priority
      await this.printQueueService.addJob(printer, receiptBuffer, 'receipt', 'normal');
      
      this.logger.log(`Receipt queued for order ${order.orderNumber}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to queue receipt: ${error}`);
      return false;
    }
  }

  /**
   * Get the configured or default kitchen printer
   */
  private async getKitchenPrinter() {
    if (this.config.kitchenPrinterId) {
      try {
        const printer = await this.printersService.findOne(this.config.kitchenPrinterId);
        if (printer.isActive) {
          return printer;
        }
      } catch {
        this.logger.warn(`Configured kitchen printer ${this.config.kitchenPrinterId} not found`);
      }
    }

    // Fall back to first active kitchen printer
    const kitchenPrinters = await this.printersService.findByType('kitchen');
    return kitchenPrinters.length > 0 ? kitchenPrinters[0] : null;
  }

  /**
   * Get the configured or default bar printer
   */
  private async getBarPrinter() {
    if (this.config.barPrinterId) {
      try {
        const printer = await this.printersService.findOne(this.config.barPrinterId);
        if (printer.isActive) {
          return printer;
        }
      } catch {
        this.logger.warn(`Configured bar printer ${this.config.barPrinterId} not found`);
      }
    }

    // Fall back to first active bar printer
    const barPrinters = await this.printersService.findByType('bar');
    return barPrinters.length > 0 ? barPrinters[0] : null;
  }

  /**
   * Get the configured or default receipt printer
   */
  private async getReceiptPrinter() {
    if (this.config.receiptPrinterId) {
      try {
        const printer = await this.printersService.findOne(this.config.receiptPrinterId);
        if (printer.isActive) {
          return printer;
        }
      } catch {
        this.logger.warn(`Configured receipt printer ${this.config.receiptPrinterId} not found`);
      }
    }

    // Fall back to first active receipt printer
    const receiptPrinters = await this.printersService.findByType('receipt');
    return receiptPrinters.length > 0 ? receiptPrinters[0] : null;
  }

  /**
   * Manually print a kitchen ticket
   */
  async printKitchenTicket(order: Order, waiterName?: string): Promise<boolean> {
    try {
      const printer = await this.getKitchenPrinter();
      if (!printer) {
        this.logger.warn('No active kitchen printer found');
        return false;
      }

      const ticketData = this.orderTicketService.orderToTicketData(order, waiterName);
      const ticketBuffer = this.orderTicketService.formatKitchenTicket(ticketData);

      await this.printQueueService.addJob(printer, ticketBuffer, 'kitchen', 'high');
      return true;
    } catch (error) {
      this.logger.error(`Failed to print kitchen ticket: ${error}`);
      return false;
    }
  }

  /**
   * Manually print a receipt
   */
  async printReceipt(
    order: Order,
    paymentMethod: 'cash' | 'card' | 'online',
    amountReceived?: number,
    waiterName?: string,
  ): Promise<boolean> {
    try {
      const printer = await this.getReceiptPrinter();
      if (!printer) {
        this.logger.warn('No active receipt printer found');
        return false;
      }

      const receiptData = this.orderTicketService.orderToReceiptData(
        order,
        {
          name: this.config.businessName,
          address1: this.config.businessAddress1,
          address2: this.config.businessAddress2,
          phone: this.config.businessPhone,
        },
        paymentMethod,
        amountReceived,
        waiterName,
      );
      const receiptBuffer = this.orderTicketService.formatReceipt(receiptData);

      await this.printQueueService.addJob(printer, receiptBuffer, 'receipt', 'normal');
      return true;
    } catch (error) {
      this.logger.error(`Failed to print receipt: ${error}`);
      return false;
    }
  }
}
