import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table } from '../../entities/table.entity';
import { Category } from '../../entities/category.entity';
import { Product } from '../../entities/product.entity';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  /**
   * Get general menu (without table info)
   * For QR codes that don't specify a table
   */
  async getGeneralMenu() {
    // Get all active categories with their products
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    const products = await this.productRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    // Group products by category
    const categoriesWithProducts = categories.map((category) => ({
      ...category,
      products: products.filter((p) => p.categoryId === category.id),
    }));

    return {
      categories: categoriesWithProducts,
      storeName: 'PIXPOS Demo',
    };
  }

  /**
   * Get menu for a table (public endpoint for QR menu)
   * Requirements: 5.1, 5.2, 5.3, 5.4
   */
  async getMenu(tableId: string) {
    // Verify table exists
    const table = await this.tableRepository.findOne({
      where: { id: tableId },
    });

    if (!table) {
      throw new NotFoundException(`Table with ID ${tableId} not found`);
    }

    // Get all active categories with their products
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    const products = await this.productRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    // Group products by category
    const categoriesWithProducts = categories.map((category) => ({
      ...category,
      products: products.filter((p) => p.categoryId === category.id),
    }));

    return {
      table: {
        id: table.id,
        name: table.name,
      },
      categories: categoriesWithProducts,
      storeName: 'PIXPOS Demo',
    };
  }

  /**
   * Call waiter for a table
   * Requirements: 5.5, 5.6
   */
  async callWaiter(tableId: string): Promise<{ success: boolean; message: string }> {
    // Verify table exists
    const table = await this.tableRepository.findOne({
      where: { id: tableId },
    });

    if (!table) {
      throw new NotFoundException(`Table with ID ${tableId} not found`);
    }

    // Emit waiter:called event to pos room
    this.websocketGateway.emitWaiterCalled(tableId, table.name);

    return {
      success: true,
      message: `Waiter has been called for table ${table.name}`,
    };
  }
}
