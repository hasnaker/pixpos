import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Patch,
  Query,
} from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableDto } from './dto';
import { Table, TableStatus } from '../../entities/table.entity';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  async findAll(): Promise<Table[]> {
    return this.tablesService.findAll();
  }

  /**
   * GET /api/tables/zones
   * Get all unique zones
   */
  @Get('zones')
  async getZones(): Promise<string[]> {
    return this.tablesService.getZones();
  }

  /**
   * GET /api/tables/zone/:zone
   * Get tables by zone
   */
  @Get('zone/:zone')
  async findByZone(@Param('zone') zone: string): Promise<Table[]> {
    return this.tablesService.findByZone(zone);
  }

  /**
   * POST /api/tables/bulk
   * Bulk create tables for a zone
   */
  @Post('bulk')
  async bulkCreate(
    @Body() body: { zone: string; count: number; prefix?: string },
  ): Promise<Table[]> {
    return this.tablesService.bulkCreate(body.zone, body.count, body.prefix);
  }

  /**
   * DELETE /api/tables/zone/:zone
   * Delete all tables in a zone
   */
  @Delete('zone/:zone')
  async deleteByZone(@Param('zone') zone: string): Promise<{ deleted: number }> {
    return this.tablesService.deleteByZone(zone);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Table> {
    return this.tablesService.findOne(id);
  }

  @Post()
  async create(@Body() createTableDto: CreateTableDto): Promise<Table> {
    return this.tablesService.create(createTableDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTableDto: UpdateTableDto,
  ): Promise<Table> {
    return this.tablesService.update(id, updateTableDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.tablesService.remove(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: TableStatus,
  ): Promise<Table> {
    return this.tablesService.updateStatus(id, status);
  }

  @Post(':id/open')
  async openTable(@Param('id', ParseUUIDPipe) id: string): Promise<Table> {
    return this.tablesService.openTable(id);
  }

  @Post(':id/close')
  async closeTable(@Param('id', ParseUUIDPipe) id: string): Promise<Table> {
    return this.tablesService.closeTable(id);
  }

  @Post(':id/paying')
  async setPayingStatus(@Param('id', ParseUUIDPipe) id: string): Promise<Table> {
    return this.tablesService.setPayingStatus(id);
  }

  @Post(':id/sync')
  async syncStatus(@Param('id', ParseUUIDPipe) id: string): Promise<Table> {
    return this.tablesService.syncTableStatus(id);
  }

  @Get(':id/status-check')
  async checkStatusConsistency(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ isConsistent: boolean }> {
    const isConsistent = await this.tablesService.isStatusConsistent(id);
    return { isConsistent };
  }
}
