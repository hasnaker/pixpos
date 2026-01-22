import { Controller, Get, Put, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { SettingsService, BusinessSettings, ReceiptSettings, DeviceSettings } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Get all settings at once (for initial app load)
  @Get()
  async getAllSettings(@Req() req: Request): Promise<{
    business: BusinessSettings;
    receipt: ReceiptSettings;
    devices: DeviceSettings;
  }> {
    const storeId = (req as any).storeId || null;
    return this.settingsService.getAllSettings(storeId);
  }

  // Business Settings
  @Get('business')
  async getBusinessSettings(@Req() req: Request): Promise<BusinessSettings> {
    const storeId = (req as any).storeId || null;
    return this.settingsService.getBusinessSettings(storeId);
  }

  @Put('business')
  async updateBusinessSettings(
    @Req() req: Request,
    @Body() data: Partial<BusinessSettings>,
  ): Promise<BusinessSettings> {
    const storeId = (req as any).storeId || null;
    return this.settingsService.updateBusinessSettings(storeId, data);
  }

  // Receipt Settings
  @Get('receipt')
  async getReceiptSettings(@Req() req: Request): Promise<ReceiptSettings> {
    const storeId = (req as any).storeId || null;
    return this.settingsService.getReceiptSettings(storeId);
  }

  @Put('receipt')
  async updateReceiptSettings(
    @Req() req: Request,
    @Body() data: Partial<ReceiptSettings>,
  ): Promise<ReceiptSettings> {
    const storeId = (req as any).storeId || null;
    return this.settingsService.updateReceiptSettings(storeId, data);
  }

  // Device Settings
  @Get('devices')
  async getDeviceSettings(@Req() req: Request): Promise<DeviceSettings> {
    const storeId = (req as any).storeId || null;
    return this.settingsService.getDeviceSettings(storeId);
  }

  @Put('devices')
  async updateDeviceSettings(
    @Req() req: Request,
    @Body() data: Partial<DeviceSettings>,
  ): Promise<DeviceSettings> {
    const storeId = (req as any).storeId || null;
    return this.settingsService.updateDeviceSettings(storeId, data);
  }
}
