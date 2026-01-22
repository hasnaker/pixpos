import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Zone } from '../../entities/zone.entity';
import { CreateZoneDto, UpdateZoneDto } from './dto';

@Injectable()
export class ZonesService {
  constructor(
    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,
  ) {}

  async findAll(storeId: string | null): Promise<Zone[]> {
    return this.zoneRepository.find({
      where: { storeId: storeId ?? IsNull() },
      order: { floor: 'ASC', sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Zone> {
    const zone = await this.zoneRepository.findOne({ where: { id } });
    if (!zone) {
      throw new NotFoundException(`Zone with ID ${id} not found`);
    }
    return zone;
  }

  async create(storeId: string | null, createZoneDto: CreateZoneDto): Promise<Zone> {
    const zone = this.zoneRepository.create({
      ...createZoneDto,
      storeId,
    });
    return this.zoneRepository.save(zone);
  }

  async update(id: string, updateZoneDto: UpdateZoneDto): Promise<Zone> {
    const zone = await this.findOne(id);
    Object.assign(zone, updateZoneDto);
    return this.zoneRepository.save(zone);
  }

  async remove(id: string): Promise<void> {
    const zone = await this.findOne(id);
    await this.zoneRepository.remove(zone);
  }

  async getFloors(storeId: string | null): Promise<number[]> {
    const zones = await this.zoneRepository
      .createQueryBuilder('zone')
      .select('DISTINCT zone.floor', 'floor')
      .where('zone.store_id = :storeId OR (zone.store_id IS NULL AND :storeId IS NULL)', { storeId })
      .orderBy('zone.floor', 'ASC')
      .getRawMany();
    return zones.map(z => z.floor);
  }

  async seedDefaults(storeId: string | null): Promise<void> {
    const count = await this.zoneRepository.count({
      where: { storeId: storeId ?? IsNull() },
    });
    if (count === 0) {
      const defaults = [
        { name: 'Salon', icon: 'LayoutGrid', floor: 1, sortOrder: 1 },
        { name: 'Bahçe', icon: 'Trees', floor: 1, sortOrder: 2 },
        { name: 'Teras', icon: 'Umbrella', floor: 1, sortOrder: 3 },
      ];
      for (const zone of defaults) {
        await this.zoneRepository.save(this.zoneRepository.create({ ...zone, storeId }));
      }
    }
  }
}
