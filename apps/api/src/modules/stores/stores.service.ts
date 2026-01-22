import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../../entities/store.entity';
import { CreateStoreDto, UpdateStoreDto } from './dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  async findAll(): Promise<Store[]> {
    return this.storeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Store> {
    const store = await this.storeRepository.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }
    return store;
  }

  async findBySlug(slug: string): Promise<Store> {
    const store = await this.storeRepository.findOne({ where: { slug } });
    if (!store) {
      throw new NotFoundException(`Store with slug ${slug} not found`);
    }
    return store;
  }

  async findBySubdomain(subdomain: string): Promise<Store> {
    const store = await this.storeRepository.findOne({ where: { subdomain } });
    if (!store) {
      throw new NotFoundException(`Store with subdomain ${subdomain} not found`);
    }
    return store;
  }

  async create(dto: CreateStoreDto): Promise<Store> {
    // Check for duplicate slug
    const existingSlug = await this.storeRepository.findOne({ where: { slug: dto.slug } });
    if (existingSlug) {
      throw new ConflictException(`Store with slug ${dto.slug} already exists`);
    }

    // Check for duplicate subdomain if provided
    if (dto.subdomain) {
      const existingSubdomain = await this.storeRepository.findOne({ where: { subdomain: dto.subdomain } });
      if (existingSubdomain) {
        throw new ConflictException(`Store with subdomain ${dto.subdomain} already exists`);
      }
    }

    const store = this.storeRepository.create({
      ...dto,
      status: dto.status || 'trial',
      plan: dto.plan || 'free',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
    });

    return this.storeRepository.save(store);
  }

  async update(id: string, dto: UpdateStoreDto): Promise<Store> {
    const store = await this.findOne(id);

    // Check for duplicate slug if changing
    if (dto.slug && dto.slug !== store.slug) {
      const existingSlug = await this.storeRepository.findOne({ where: { slug: dto.slug } });
      if (existingSlug) {
        throw new ConflictException(`Store with slug ${dto.slug} already exists`);
      }
    }

    // Check for duplicate subdomain if changing
    if (dto.subdomain && dto.subdomain !== store.subdomain) {
      const existingSubdomain = await this.storeRepository.findOne({ where: { subdomain: dto.subdomain } });
      if (existingSubdomain) {
        throw new ConflictException(`Store with subdomain ${dto.subdomain} already exists`);
      }
    }

    Object.assign(store, dto);
    return this.storeRepository.save(store);
  }

  async remove(id: string): Promise<void> {
    const store = await this.findOne(id);
    await this.storeRepository.remove(store);
  }

  async getStats(id: string): Promise<{
    usersCount: number;
    tablesCount: number;
    productsCount: number;
    ordersCount: number;
  }> {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ['users', 'tables', 'products', 'orders'],
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return {
      usersCount: store.users?.length || 0,
      tablesCount: store.tables?.length || 0,
      productsCount: store.products?.length || 0,
      ordersCount: store.orders?.length || 0,
    };
  }
}
