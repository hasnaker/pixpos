import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { ZonesService } from './zones.service';
import { CreateZoneDto, UpdateZoneDto } from './dto';

@Controller('zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Get()
  findAll(@Req() req: Request) {
    const storeId = (req as any).storeId || null;
    return this.zonesService.findAll(storeId);
  }

  @Get('floors')
  getFloors(@Req() req: Request) {
    const storeId = (req as any).storeId || null;
    return this.zonesService.getFloors(storeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zonesService.findOne(id);
  }

  @Post()
  create(@Req() req: Request, @Body() createZoneDto: CreateZoneDto) {
    const storeId = (req as any).storeId || null;
    return this.zonesService.create(storeId, createZoneDto);
  }

  @Post('seed')
  seed(@Req() req: Request) {
    const storeId = (req as any).storeId || null;
    return this.zonesService.seedDefaults(storeId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateZoneDto: UpdateZoneDto) {
    return this.zonesService.update(id, updateZoneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.zonesService.remove(id);
  }
}
