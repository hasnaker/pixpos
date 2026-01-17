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
  Query,
} from '@nestjs/common';
import { PrintersService } from './printers.service';
import { PrintService } from './print.service';
import { PrintQueueService } from './print-queue.service';
import { AutoPrintService, AutoPrintConfig } from './auto-print.service';
import { PrinterDiscoveryService, DiscoveredPrinter } from './printer-discovery.service';
import { CreatePrinterDto, UpdatePrinterDto } from './dto';
import { Printer } from '../../entities/printer.entity';

@Controller('printers')
export class PrintersController {
  constructor(
    private readonly printersService: PrintersService,
    private readonly printService: PrintService,
    private readonly printQueueService: PrintQueueService,
    private readonly autoPrintService: AutoPrintService,
    private readonly printerDiscoveryService: PrinterDiscoveryService,
  ) {}

  @Get()
  async findAll(
    @Query('type') type?: 'kitchen' | 'bar' | 'receipt',
  ): Promise<Printer[]> {
    if (type) {
      return this.printersService.findByType(type);
    }
    return this.printersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Printer> {
    return this.printersService.findOne(id);
  }

  @Post()
  async create(@Body() createPrinterDto: CreatePrinterDto): Promise<Printer> {
    return this.printersService.create(createPrinterDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePrinterDto: UpdatePrinterDto,
  ): Promise<Printer> {
    return this.printersService.update(id, updatePrinterDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.printersService.remove(id);
  }

  /**
   * Test print endpoint
   * POST /api/printers/:id/test
   * Requirements: 8.5, 8.6
   */
  @Post(':id/test')
  async testPrint(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean; message: string }> {
    const printer = await this.printersService.findOne(id);
    
    if (!printer.isActive) {
      return {
        success: false,
        message: 'Yazıcı aktif değil',
      };
    }

    if (printer.connectionType === 'usb') {
      return {
        success: false,
        message: 'USB yazıcı desteği henüz mevcut değil',
      };
    }

    if (!printer.ipAddress) {
      return {
        success: false,
        message: 'Yazıcı IP adresi tanımlı değil',
      };
    }

    const success = await this.printService.testPrint(printer);
    
    return {
      success,
      message: success 
        ? 'Test yazdırma başarılı' 
        : 'Yazıcıya bağlanılamadı. IP adresini ve bağlantıyı kontrol edin.',
    };
  }

  /**
   * Get print queue statistics
   * GET /api/printers/queue/stats
   * Requirements: 6.1.1
   */
  @Get('queue/stats')
  getQueueStats(): {
    total: number;
    pending: number;
    printing: number;
    completed: number;
    failed: number;
  } {
    return this.printQueueService.getQueueStats();
  }

  /**
   * Get print jobs for a specific printer
   * GET /api/printers/:id/jobs
   * Requirements: 6.1.1
   */
  @Get(':id/jobs')
  getJobsForPrinter(@Param('id', ParseUUIDPipe) id: string) {
    return this.printQueueService.getJobsForPrinter(id);
  }

  /**
   * Retry a failed print job
   * POST /api/printers/queue/:jobId/retry
   * Requirements: 6.1.4
   */
  @Post('queue/:jobId/retry')
  async retryJob(
    @Param('jobId') jobId: string,
  ): Promise<{ success: boolean; message: string }> {
    const success = await this.printQueueService.retryJob(jobId);
    return {
      success,
      message: success ? 'İş yeniden kuyruğa alındı' : 'İş bulunamadı veya yeniden denenemez',
    };
  }

  /**
   * Cancel a pending print job
   * DELETE /api/printers/queue/:jobId
   * Requirements: 6.1.1
   */
  @Delete('queue/:jobId')
  @HttpCode(HttpStatus.OK)
  cancelJob(
    @Param('jobId') jobId: string,
  ): { success: boolean; message: string } {
    const success = this.printQueueService.cancelJob(jobId);
    return {
      success,
      message: success ? 'İş iptal edildi' : 'İş bulunamadı veya iptal edilemez',
    };
  }

  /**
   * Get auto-print configuration
   * GET /api/printers/auto-print/config
   * Requirements: 6.1.3
   */
  @Get('auto-print/config')
  getAutoPrintConfig(): AutoPrintConfig {
    return this.autoPrintService.getConfig();
  }

  /**
   * Update auto-print configuration
   * PUT /api/printers/auto-print/config
   * Requirements: 6.1.3
   */
  @Put('auto-print/config')
  updateAutoPrintConfig(
    @Body() config: Partial<AutoPrintConfig>,
  ): { success: boolean; config: AutoPrintConfig } {
    this.autoPrintService.updateConfig(config);
    return {
      success: true,
      config: this.autoPrintService.getConfig(),
    };
  }

  /**
   * Scan network for printers
   * POST /api/printers/discover
   * Scans the local network for devices on port 9100
   */
  @Post('discover')
  async discoverPrinters(
    @Body() body?: { subnet?: string },
  ): Promise<{ printers: DiscoveredPrinter[]; scannedAt: string }> {
    const printers = await this.printerDiscoveryService.scanNetwork(body?.subnet);
    return {
      printers,
      scannedAt: new Date().toISOString(),
    };
  }

  /**
   * Test connection to a specific IP
   * POST /api/printers/test-connection
   */
  @Post('test-connection')
  async testConnection(
    @Body() body: { ip: string; port?: number },
  ): Promise<{ success: boolean; responseTime?: number; error?: string }> {
    return this.printerDiscoveryService.testConnection(body.ip, body.port || 9100);
  }

  /**
   * Scan specific IP range
   * POST /api/printers/discover/range
   */
  @Post('discover/range')
  async discoverRange(
    @Body() body: { startIp: string; endIp: string; port?: number },
  ): Promise<{ printers: DiscoveredPrinter[]; scannedAt: string }> {
    const printers = await this.printerDiscoveryService.scanRange(
      body.startIp,
      body.endIp,
      body.port || 9100,
    );
    return {
      printers,
      scannedAt: new Date().toISOString(),
    };
  }
}
