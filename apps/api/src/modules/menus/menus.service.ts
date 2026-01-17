import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Menu } from '../../entities/menu.entity';
import { CreateMenuDto, UpdateMenuDto } from './dto';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<Menu[]> {
    return this.menuRepository.find({
      relations: ['categories'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['categories', 'categories.products'],
    });
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }
    return menu;
  }

  async findDefault(): Promise<Menu | null> {
    return this.menuRepository.findOne({
      where: { isDefault: true },
      relations: ['categories'],
    });
  }

  async findActive(): Promise<Menu[]> {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const menus = await this.menuRepository.find({
      where: { isActive: true },
      relations: ['categories'],
      order: { sortOrder: 'ASC' },
    });

    // Filter by time and day restrictions
    return menus.filter(menu => {
      // Check time restriction
      if (menu.timeStart && menu.timeEnd) {
        if (currentTime < menu.timeStart || currentTime > menu.timeEnd) {
          return false;
        }
      }

      // Check day restriction
      if (menu.activeDays && menu.activeDays.length > 0) {
        if (!menu.activeDays.includes(currentDay)) {
          return false;
        }
      }

      return true;
    });
  }

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    // If this is set as default, unset other defaults
    if (createMenuDto.isDefault) {
      await this.menuRepository
        .createQueryBuilder()
        .update()
        .set({ isDefault: false })
        .execute();
    }

    const menu = this.menuRepository.create(createMenuDto);
    return this.menuRepository.save(menu);
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findOne(id);

    // If this is set as default, unset other defaults
    if (updateMenuDto.isDefault) {
      await this.menuRepository
        .createQueryBuilder()
        .update()
        .set({ isDefault: false })
        .execute();
    }

    Object.assign(menu, updateMenuDto);
    return this.menuRepository.save(menu);
  }

  async remove(id: string): Promise<void> {
    const menu = await this.findOne(id);
    
    // Set categories' menuId to null before deleting
    await this.dataSource.query('UPDATE categories SET menu_id = NULL WHERE menu_id = $1', [id]);
    
    await this.menuRepository.remove(menu);
  }

  async removeAll(): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // Set all categories' menuId to null
      await manager.query('UPDATE categories SET menu_id = NULL');
      // Delete all menus
      await manager.query('DELETE FROM menus');
    });
  }

  async setDefault(id: string): Promise<Menu> {
    // Unset all defaults
    await this.menuRepository
      .createQueryBuilder()
      .update()
      .set({ isDefault: false })
      .execute();
    
    // Set this menu as default
    const menu = await this.findOne(id);
    menu.isDefault = true;
    return this.menuRepository.save(menu);
  }
}
