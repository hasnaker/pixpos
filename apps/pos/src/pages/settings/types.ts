import { Building2, Users, LayoutGrid, Printer as PrinterIcon, Monitor, Receipt, Lock, Settings, UtensilsCrossed, MapPin, CreditCard } from 'lucide-react';
import type { AutoLockTimeout } from '@/hooks';

// Re-export types from API (these are the source of truth now)
export type { BusinessSettings, ReceiptSettings, DeviceSettings, User } from './hooks';

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
