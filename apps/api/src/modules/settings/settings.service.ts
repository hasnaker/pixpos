import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Setting } from './settings.entity';

export interface BusinessSettings {
  storeName: string;
  logoUrl: string;
  address?: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
  // Customer display videos (URLs or local paths)
  displayVideos?: string[];
}

export interface ReceiptSettings {
  showLogo: boolean;
  showAddress: boolean;
  showPhone: boolean;
  showTaxNumber: boolean;
  footerText: string;
  paperWidth: '58mm' | '80mm';
}

export interface DeviceSettings {
  kitchen: boolean;
  waiter: boolean;
  qrMenu: boolean;
}

const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  storeName: 'PIXPOS',
  logoUrl: '',
  address: '',
  phone: '',
  email: '',
  taxNumber: '',
  displayVideos: [],
};

const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = {
  showLogo: true,
  showAddress: true,
  showPhone: true,
  showTaxNumber: true,
  footerText: 'Bizi tercih ettiğiniz için teşekkürler!',
  paperWidth: '80mm',
};

const DEFAULT_DEVICE_SETTINGS: DeviceSettings = {
  kitchen: true,
  waiter: true,
  qrMenu: false,
};

// Helper to build where clause with proper null handling
function buildWhereClause(key: string, storeId: string | null) {
  return {
    key,
    storeId: storeId ?? IsNull(),
  };
}

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
  ) {}

  // Business Settings
  async getBusinessSettings(storeId: string | null): Promise<BusinessSettings> {
    const setting = await this.settingsRepository.findOne({
      where: buildWhereClause('business', storeId),
    });
    
    if (!setting || !setting.value) {
      return DEFAULT_BUSINESS_SETTINGS;
    }
    
    return { ...DEFAULT_BUSINESS_SETTINGS, ...setting.value } as BusinessSettings;
  }

  async updateBusinessSettings(storeId: string | null, data: Partial<BusinessSettings>): Promise<BusinessSettings> {
    let setting = await this.settingsRepository.findOne({
      where: buildWhereClause('business', storeId),
    });

    const currentValue = setting?.value || {};
    const newValue = { ...DEFAULT_BUSINESS_SETTINGS, ...currentValue, ...data };

    if (!setting) {
      setting = this.settingsRepository.create({
        key: 'business',
        storeId,
        value: newValue,
      });
    } else {
      setting.value = newValue;
    }

    await this.settingsRepository.save(setting);
    return newValue as BusinessSettings;
  }

  // Receipt Settings
  async getReceiptSettings(storeId: string | null): Promise<ReceiptSettings> {
    const setting = await this.settingsRepository.findOne({
      where: buildWhereClause('receipt', storeId),
    });
    
    if (!setting || !setting.value) {
      return DEFAULT_RECEIPT_SETTINGS;
    }
    
    return { ...DEFAULT_RECEIPT_SETTINGS, ...setting.value } as ReceiptSettings;
  }

  async updateReceiptSettings(storeId: string | null, data: Partial<ReceiptSettings>): Promise<ReceiptSettings> {
    let setting = await this.settingsRepository.findOne({
      where: buildWhereClause('receipt', storeId),
    });

    const currentValue = setting?.value || {};
    const newValue = { ...DEFAULT_RECEIPT_SETTINGS, ...currentValue, ...data };

    if (!setting) {
      setting = this.settingsRepository.create({
        key: 'receipt',
        storeId,
        value: newValue,
      });
    } else {
      setting.value = newValue;
    }

    await this.settingsRepository.save(setting);
    return newValue as ReceiptSettings;
  }

  // Device Settings
  async getDeviceSettings(storeId: string | null): Promise<DeviceSettings> {
    const setting = await this.settingsRepository.findOne({
      where: buildWhereClause('devices', storeId),
    });
    
    if (!setting || !setting.value) {
      return DEFAULT_DEVICE_SETTINGS;
    }
    
    return { ...DEFAULT_DEVICE_SETTINGS, ...setting.value } as DeviceSettings;
  }

  async updateDeviceSettings(storeId: string | null, data: Partial<DeviceSettings>): Promise<DeviceSettings> {
    let setting = await this.settingsRepository.findOne({
      where: buildWhereClause('devices', storeId),
    });

    const currentValue = setting?.value || {};
    const newValue = { ...DEFAULT_DEVICE_SETTINGS, ...currentValue, ...data };

    if (!setting) {
      setting = this.settingsRepository.create({
        key: 'devices',
        storeId,
        value: newValue,
      });
    } else {
      setting.value = newValue;
    }

    await this.settingsRepository.save(setting);
    return newValue as DeviceSettings;
  }

  // All Settings (for initial load)
  async getAllSettings(storeId: string | null): Promise<{
    business: BusinessSettings;
    receipt: ReceiptSettings;
    devices: DeviceSettings;
  }> {
    const [business, receipt, devices] = await Promise.all([
      this.getBusinessSettings(storeId),
      this.getReceiptSettings(storeId),
      this.getDeviceSettings(storeId),
    ]);
    return { business, receipt, devices };
  }

  // Generic methods
  async getSetting<T>(storeId: string | null, key: string, defaultValue: T): Promise<T> {
    const setting = await this.settingsRepository.findOne({
      where: buildWhereClause(key, storeId),
    });
    
    if (!setting || !setting.value) return defaultValue;
    
    return setting.value as T;
  }

  async setSetting<T extends Record<string, any>>(storeId: string | null, key: string, value: T): Promise<T> {
    let setting = await this.settingsRepository.findOne({
      where: buildWhereClause(key, storeId),
    });

    if (!setting) {
      setting = this.settingsRepository.create({ key, storeId, value });
    } else {
      setting.value = value;
    }

    await this.settingsRepository.save(setting);
    return value;
  }
}
