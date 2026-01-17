import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }

  async removeAll(): Promise<void> {
    // Transaction ile önce bağımlılıkları temizle, sonra kategorileri sil
    await this.dataSource.transaction(async (manager) => {
      // order_items tablosundaki product referanslarını temizle
      await manager.query('UPDATE order_items SET product_id = NULL');
      // Tüm ürünleri sil
      await manager.query('DELETE FROM products');
      // Tüm kategorileri sil
      await manager.query('DELETE FROM categories');
    });
  }

  /**
   * Assign a printer to a category
   * When orders with products from this category are sent,
   * they will be printed to this printer
   */
  async assignPrinter(id: string, printerId: string | null): Promise<Category> {
    const category = await this.findOne(id);
    category.printerId = printerId;
    return this.categoryRepository.save(category);
  }
}
