import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './settings.entity';

export interface BusinessSettings {
  storeName: string;
  logoUrl: string;
  address?: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
}

const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  storeName: 'PIXPOS',
  logoUrl: '',
  address: '',
  phone: '',
  email: '',
  taxNumber: '',
};

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
  ) {}

  async getBusinessSettings(): Promise<BusinessSettings> {
    const setting = await this.settingsRepository.findOne({
      where: { key: 'business' },
    });
    
    if (!setting) {
      return DEFAULT_BUSINESS_SETTINGS;
    }
    
    return { ...DEFAULT_BUSINESS_SETTINGS, ...setting.value } as BusinessSettings;
  }

  async updateBusinessSettings(data: Partial<BusinessSettings>): Promise<BusinessSettings> {
    let setting = await this.settingsRepository.findOne({
      where: { key: 'business' },
    });

    if (!setting) {
      setting = this.settingsRepository.create({
        key: 'business',
        value: { ...DEFAULT_BUSINESS_SETTINGS, ...data },
      });
    } else {
      setting.value = { ...setting.value, ...data };
    }

    await this.settingsRepository.save(setting);
    return setting.value as BusinessSettings;
  }

  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    const setting = await this.settingsRepository.findOne({
      where: { key },
    });
    
    return setting ? (setting.value as T) : defaultValue;
  }

  async setSetting<T extends Record<string, any>>(key: string, value: T): Promise<T> {
    let setting = await this.settingsRepository.findOne({
      where: { key },
    });

    if (!setting) {
      setting = this.settingsRepository.create({ key, value });
    } else {
      setting.value = value;
    }

    await this.settingsRepository.save(setting);
    return setting.value as T;
  }
}
