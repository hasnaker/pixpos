import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zone } from '../../entities/zone.entity';
import { CreateZoneDto, UpdateZoneDto } from './dto';

@Injectable()
export class ZonesService {
  constructor(
    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,
  ) {}

  async findAll(): Promise<Zone[]> {
    return this.zoneRepository.find({
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

  async create(createZoneDto: CreateZoneDto): Promise<Zone> {
    const zone = this.zoneRepository.create(createZoneDto);
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

  async getFloors(): Promise<number[]> {
    const zones = await this.zoneRepository
      .createQueryBuilder('zone')
      .select('DISTINCT zone.floor', 'floor')
      .orderBy('zone.floor', 'ASC')
      .getRawMany();
    return zones.map(z => z.floor);
  }

  async seedDefaults(): Promise<void> {
    const count = await this.zoneRepository.count();
    if (count === 0) {
      const defaults = [
        { name: 'Salon', icon: 'LayoutGrid', floor: 1, sortOrder: 1 },
        { name: 'Bahçe', icon: 'Trees', floor: 1, sortOrder: 2 },
        { name: 'Teras', icon: 'Umbrella', floor: 1, sortOrder: 3 },
      ];
      for (const zone of defaults) {
        await this.zoneRepository.save(this.zoneRepository.create(zone));
      }
    }
  }
}
