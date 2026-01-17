import { Building2, Users, LayoutGrid, Printer as PrinterIcon, Monitor, Receipt, Lock, Settings, UtensilsCrossed, MapPin, CreditCard } from 'lucide-react';
import type { AutoLockTimeout } from '@/hooks';

// User type
export interface User {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'cashier' | 'waiter';
  pin: string;
  active: boolean;
}

// Business settings type
export interface BusinessSettings {
  name: string;
  logo: string | null;
  address: string;
  phone: string;
  taxNumber: string;
}

// Receipt settings type
export interface ReceiptSettings {
  showLogo: boolean;
  showAddress: boolean;
  showPhone: boolean;
  showTaxNumber: boolean;
  footerText: string;
  paperWidth: '58mm' | '80mm';
}

// Device settings type
export interface DeviceSettings {
  kitchen: boolean;
  waiter: boolean;
  qrMenu: boolean;
}

// Tab configuration
export const TABS = [
  { id: 'business', name: 'İşletme', icon: Building2, color: '#0A84FF' },
  { id: 'users', name: 'Kullanıcılar', icon: Users, color: '#BF5AF2' },
  { id: 'zones', name: 'Bölgeler', icon: MapPin, color: '#FF9F0A' },
  { id: 'tables', name: 'Masalar', icon: LayoutGrid, color: '#30D158' },
  { id: 'menu', name: 'Menü', icon: UtensilsCrossed, color: '#64D2FF' },
  { id: 'printers', name: 'Yazıcılar', icon: PrinterIcon, color: '#5E5CE6' },
  { id: 'okc', name: 'ÖKC / POS', icon: CreditCard, color: '#FF6B6B' },
  { id: 'devices', name: 'Cihazlar', icon: Monitor, color: '#FF453A' },
  { id: 'receipt', name: 'Fiş Tasarımı', icon: Receipt, color: '#8E8E93' },
  { id: 'security', name: 'Güvenlik', icon: Lock, color: '#636366' },
  { id: 'system', name: 'Sistem', icon: Settings, color: '#48484A' },
] as const;

export type TabId = typeof TABS[number]['id'];

// Timeout options
export const TIMEOUT_OPTIONS: { value: AutoLockTimeout; label: string }[] = [
  { value: 5, label: '5 dakika' },
  { value: 10, label: '10 dakika' },
  { value: 15, label: '15 dakika' },
  { value: 30, label: '30 dakika' },
  { value: 0, label: 'Kapalı' },
];

// Zones
export const ZONES = ['Salon', 'Bahçe', 'Dışarı', 'Teras', 'VIP'];

// Default users
export const DEFAULT_USERS: User[] = [
  { id: '1', name: 'Ahmet Kaya', role: 'admin', pin: '1234', active: true },
  { id: '2', name: 'Mehmet Yılmaz', role: 'cashier', pin: '5678', active: true },
  { id: '3', name: 'Ayşe Demir', role: 'waiter', pin: '9012', active: true },
];

// Default business settings
export const DEFAULT_BUSINESS: BusinessSettings = {
  name: 'PIXPOS Cafe',
  logo: null,
  address: 'Örnek Mah. Test Cad. No:1 İstanbul',
  phone: '0212 123 45 67',
  taxNumber: '1234567890',
};

// Default receipt settings
export const DEFAULT_RECEIPT: ReceiptSettings = {
  showLogo: true,
  showAddress: true,
  showPhone: true,
  showTaxNumber: true,
  footerText: 'Bizi tercih ettiğiniz için teşekkürler!',
  paperWidth: '80mm',
};

// Default device settings
export const DEFAULT_DEVICES: DeviceSettings = {
  kitchen: true,
  waiter: true,
  qrMenu: false,
};

// LocalStorage keys
export const STORAGE_KEYS = {
  BUSINESS: 'pixpos_business',
  RECEIPT: 'pixpos_receipt',
  DEVICES: 'pixpos_devices',
  USERS: 'pixpos_users',
} as const;
