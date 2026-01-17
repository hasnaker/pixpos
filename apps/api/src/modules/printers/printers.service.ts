import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Printer } from '../../entities/printer.entity';
import { CreatePrinterDto, UpdatePrinterDto } from './dto';

@Injectable()
export class PrintersService {
  constructor(
    @InjectRepository(Printer)
    private readonly printerRepository: Repository<Printer>,
  ) {}

  async findAll(): Promise<Printer[]> {
    return this.printerRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Printer> {
    const printer = await this.printerRepository.findOne({ where: { id } });
    if (!printer) {
      throw new NotFoundException(`Printer with ID ${id} not found`);
    }
    return printer;
  }

  async findByType(type: 'kitchen' | 'bar' | 'receipt'): Promise<Printer[]> {
    return this.printerRepository.find({
      where: { type, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async create(createPrinterDto: CreatePrinterDto): Promise<Printer> {
    const printer = this.printerRepository.create({
      ...createPrinterDto,
      port: createPrinterDto.port ?? 9100,
      isActive: createPrinterDto.isActive ?? true,
    });
    return this.printerRepository.save(printer);
  }

  async update(id: string, updatePrinterDto: UpdatePrinterDto): Promise<Printer> {
    const printer = await this.findOne(id);
    Object.assign(printer, updatePrinterDto);
    return this.printerRepository.save(printer);
  }

  async remove(id: string): Promise<void> {
    const printer = await this.findOne(id);
    await this.printerRepository.remove(printer);
  }
}
