import { Controller, Get, Put, Body } from '@nestjs/common';
import { SettingsService, BusinessSettings } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('business')
  async getBusinessSettings(): Promise<BusinessSettings> {
    return this.settingsService.getBusinessSettings();
  }

  @Put('business')
  async updateBusinessSettings(
    @Body() data: Partial<BusinessSettings>,
  ): Promise<BusinessSettings> {
    return this.settingsService.updateBusinessSettings(data);
  }
}
