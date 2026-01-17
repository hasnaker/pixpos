import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Table, TableStatus } from '../../entities/table.entity';
import { CreateTableDto, UpdateTableDto } from './dto';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
  ) {}

  async findAll(): Promise<Table[]> {
    return this.tableRepository.find({
      where: { isActive: true },
      order: { zone: 'ASC', sortOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Get all unique zones
   */
  async getZones(): Promise<string[]> {
    const result = await this.tableRepository
      .createQueryBuilder('table')
      .select('DISTINCT table.zone', 'zone')
      .orderBy('table.zone', 'ASC')
      .getRawMany();
    return result.map(r => r.zone);
  }

  /**
   * Get tables by zone
   */
  async findByZone(zone: string): Promise<Table[]> {
    return this.tableRepository.find({
      where: { zone },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Table> {
    const table = await this.tableRepository.findOne({ where: { id } });
    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }
    return table;
  }

  async findOneWithOrders(id: string): Promise<Table> {
    const table = await this.tableRepository.findOne({
      where: { id },
      relations: ['orders'],
    });
    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }
    return table;
  }

  async create(createTableDto: CreateTableDto): Promise<Table> {
    const table = this.tableRepository.create(createTableDto);
    return this.tableRepository.save(table);
  }

  /**
   * Bulk create tables for a zone
   */
  async bulkCreate(zone: string, count: number, prefix: string = 'Masa'): Promise<Table[]> {
    const tables: Table[] = [];
    
    // Get max sort order for this zone
    const maxSortOrder = await this.tableRepository
      .createQueryBuilder('table')
      .where('table.zone = :zone', { zone })
      .select('MAX(table.sortOrder)', 'max')
      .getRawOne();
    
    let startOrder = (maxSortOrder?.max || 0) + 1;
    
    for (let i = 1; i <= count; i++) {
      const table = this.tableRepository.create({
        name: `${prefix} ${i}`,
        zone,
        sortOrder: startOrder + i - 1,
        capacity: 4,
        status: 'empty',
        isActive: true,
      });
      tables.push(table);
    }
    
    return this.tableRepository.save(tables);
  }

  /**
   * Delete all tables in a zone
   */
  async deleteByZone(zone: string): Promise<{ deleted: number }> {
    const result = await this.tableRepository.delete({ zone });
    return { deleted: result.affected || 0 };
  }

  async update(id: string, updateTableDto: UpdateTableDto): Promise<Table> {
    const table = await this.findOne(id);
    Object.assign(table, updateTableDto);
    return this.tableRepository.save(table);
  }

  async remove(id: string): Promise<void> {
    const table = await this.findOne(id);
    
    try {
      // Try hard delete first
      await this.tableRepository.remove(table);
    } catch (error) {
      // If foreign key constraint error, do soft delete
      console.log(`Hard delete failed for table ${id}, doing soft delete:`, error.message);
      const tableToUpdate = await this.findOne(id);
      tableToUpdate.isActive = false;
      await this.tableRepository.save(tableToUpdate);
    }
  }

  /**
   * Force remove a table by setting isActive to false
   */
  async forceRemove(id: string): Promise<void> {
    const table = await this.findOne(id);
    table.isActive = false;
    await this.tableRepository.save(table);
  }

  /**
   * Updates table status with validation
   * Status transitions: empty → occupied → paying → empty
   * Requirements: 1.6, 2.6, 2.8
   */
  async updateStatus(id: string, status: TableStatus): Promise<Table> {
    const table = await this.findOne(id);
    
    // Validate status transition
    this.validateStatusTransition(table.status, status);
    
    table.status = status;
    return this.tableRepository.save(table);
  }

  /**
   * Validates if a status transition is allowed
   */
  private validateStatusTransition(currentStatus: TableStatus, newStatus: TableStatus): void {
    // Allow same status (no-op)
    if (currentStatus === newStatus) {
      return;
    }

    const validTransitions: Record<TableStatus, TableStatus[]> = {
      'empty': ['occupied'],
      'occupied': ['paying', 'empty'], // empty for transfer/cancel scenarios
      'paying': ['empty', 'occupied'], // occupied if payment cancelled
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'`
      );
    }
  }

  /**
   * Opens a table (sets status to occupied)
   * Used when creating a new order on an empty table
   */
  async openTable(id: string): Promise<Table> {
    const table = await this.findOne(id);
    
    if (table.status !== 'empty') {
      throw new ConflictException(`Table ${table.name} is already ${table.status}`);
    }
    
    table.status = 'occupied';
    return this.tableRepository.save(table);
  }

  /**
   * Closes a table (sets status to empty)
   * Used after payment is completed
   * Requirements: 1.6
   */
  async closeTable(id: string): Promise<Table> {
    const table = await this.findOne(id);
    table.status = 'empty';
    return this.tableRepository.save(table);
  }

  /**
   * Sets table to paying status
   * Used when payment process starts
   */
  async setPayingStatus(id: string): Promise<Table> {
    const table = await this.findOne(id);
    
    if (table.status !== 'occupied') {
      throw new BadRequestException(
        `Cannot set paying status on table with status '${table.status}'`
      );
    }
    
    table.status = 'paying';
    return this.tableRepository.save(table);
  }

  /**
   * Checks if table has any open orders (not paid or cancelled)
   */
  async hasOpenOrders(id: string): Promise<boolean> {
    const table = await this.findOneWithOrders(id);
    return table.orders?.some(order => 
      order.status === 'open' || order.status === 'sent'
    ) ?? false;
  }

  /**
   * Synchronizes table status based on its orders
   * Property 2: Masa Durumu Tutarlılığı
   * If table has open orders → occupied
   * If table has no open orders → empty
   */
  async syncTableStatus(id: string): Promise<Table> {
    const hasOrders = await this.hasOpenOrders(id);
    const table = await this.findOne(id);
    
    // Don't change status if in paying state (payment in progress)
    if (table.status === 'paying') {
      return table;
    }
    
    const expectedStatus: TableStatus = hasOrders ? 'occupied' : 'empty';
    
    if (table.status !== expectedStatus) {
      table.status = expectedStatus;
      return this.tableRepository.save(table);
    }
    
    return table;
  }

  /**
   * Validates table status consistency
   * Returns true if status matches order state
   * Property 2: Masa Durumu Tutarlılığı
   */
  async isStatusConsistent(id: string): Promise<boolean> {
    const table = await this.findOneWithOrders(id);
    const hasOpenOrders = table.orders?.some(order => 
      order.status === 'open' || order.status === 'sent'
    ) ?? false;

    // Paying status is a special case - it's valid during payment process
    if (table.status === 'paying') {
      return hasOpenOrders; // Should have orders if paying
    }

    if (hasOpenOrders) {
      return table.status === 'occupied';
    } else {
      return table.status === 'empty';
    }
  }
}
