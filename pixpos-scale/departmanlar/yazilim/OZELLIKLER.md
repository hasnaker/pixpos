# Yazılım Ekibi - Özellik Listesi

Square'den alınacak özellikler ve teknik gereksinimler.

---

## 🔴 Faz 1 - Kritik (Q1-Q2 2026)

### 1.1 Cihaz Yönetimi (Device Management)

**Kaynak:** Square Dashboard > Settings > Device Management

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Devices | Bağlı cihazların listesi, durum takibi | 🔴 |
| Device codes | QR/kod ile cihaz eşleştirme | 🔴 |
| Modes | POS modları (Restoran, Kafe, Perakende) | 🔴 |
| Printer profiles | Yazıcı profilleri, merkezi yönetim | 🔴 |
| Kitchen displays | KDS cihaz yönetimi | 🔴 |
| Kiosk | Self-servis kiosk modu | 🟡 |
| App integrations | Üçüncü parti entegrasyonlar | 🟡 |
| Release manager | Uygulama sürüm yönetimi | 🟢 |

**Teknik Gereksinimler:**
```typescript
// Device entity
interface Device {
  id: string;
  tenantId: string;
  name: string;
  type: 'pos' | 'tablet' | 'kds' | 'kiosk' | 'terminal';
  status: 'online' | 'offline' | 'pairing';
  battery?: number;
  locationId: string;
  modeId: string;
  lastSeen: Date;
  appVersion: string;
  osVersion: string;
  model: string; // "iPad Pro 12.9", "Android Tablet"
  serialNumber?: string;
  ipAddress?: string;
}

// Device Code (QR/6-digit pairing)
interface DeviceCode {
  id: string;
  tenantId: string;
  code: string; // 6 haneli: "A3B7K9"
  qrCode: string; // QR code data URL
  locationId: string;
  modeId: string;
  expiresAt: Date; // 15 dakika
  usedAt?: Date;
  usedByDeviceId?: string;
  status: 'active' | 'used' | 'expired';
}

// Mode entity
interface Mode {
  id: string;
  tenantId: string;
  name: string;
  type: 'standard' | 'restaurant' | 'retail' | 'beauty' | 'quick_service';
  settings: ModeSettings;
  activeDevices: number;
  isDefault: boolean;
}

interface ModeSettings {
  // Checkout
  checkoutFlow: 'simple' | 'table_service' | 'counter_service';
  requireCustomer: boolean;
  allowOpenItems: boolean;
  
  // Tipping
  tippingEnabled: boolean;
  tipPercentages: number[]; // [15, 18, 20, 25]
  customTipAllowed: boolean;
  tipScreen: 'before_payment' | 'after_payment' | 'on_receipt';
  
  // Table Management (restaurant mode)
  tableManagement: boolean;
  coursing: boolean; // Yemek sırası (başlangıç, ana yemek, tatlı)
  splitBill: boolean;
  
  // Kitchen
  kitchenPrinting: boolean;
  kitchenDisplayEnabled: boolean;
  
  // Receipt
  autoReceipt: 'print' | 'email' | 'sms' | 'ask' | 'none';
}

// Printer Profile
interface PrinterProfile {
  id: string;
  tenantId: string;
  name: string;
  
  // Job Types
  jobTypes: {
    receipts: {
      enabled: boolean;
      printMode: 'automatically' | 'ask' | 'never';
      printDeclinedPayments: boolean;
    };
    inPersonOrderTickets: {
      enabled: boolean;
      singleItemPerTicket: boolean;
      removeTopMargin: boolean;
      categoryIds: string[];
      printKitchenNames: boolean;
      combineIdenticalItems: boolean;
      autoPrintNewOrders: boolean;
      autoPrintInProgressOrders: boolean;
    };
    onlineOrderTickets: {
      enabled: boolean;
      singleItemPerTicket: boolean;
      removeTopMargin: boolean;
      categoryIds: string[];
      printKitchenNames: boolean;
      combineIdenticalItems: boolean;
    };
  };
  
  // Additional Features
  orderTicketStubs: boolean; // Müşteriye stub ver
  voidTickets: boolean; // İptal fişleri
  barcodeLabels: boolean; // Barkod etiketleri
  
  // Hardware
  connectionType: 'usb' | 'bluetooth' | 'network' | 'cloud';
  ipAddress?: string;
  port?: number;
  
  // Locations
  locationIds: string[];
}

// Kitchen Display Station
interface KitchenStation {
  id: string;
  tenantId: string;
  name: string; // "Izgara", "Soğuk Mutfak", "Bar"
  locationId: string;
  categoryIds: string[];
  displayOrder: 'fifo' | 'priority' | 'course';
  
  // Alert timings (seconds)
  warningTime: number; // 300 = 5 dk (sarı)
  urgentTime: number; // 600 = 10 dk (kırmızı)
  
  // Sound
  soundEnabled: boolean;
  soundType: 'chime' | 'bell' | 'beep';
  
  // Bump bar support
  bumpBarEnabled: boolean;
}

// Kiosk Configuration
interface KioskConfig {
  id: string;
  tenantId: string;
  locationId: string;
  deviceId: string;
  
  // Branding
  welcomeTitle: string;
  welcomeSubtitle: string;
  logoUrl: string;
  backgroundColor: string;
  accentColor: string;
  
  // Menu
  menuLayout: 'grid' | 'list' | 'carousel';
  showImages: boolean;
  showDescriptions: boolean;
  showCalories: boolean;
  
  // Upselling
  upsellEnabled: boolean;
  upsellCategoryIds: string[];
  
  // Order
  orderNumberDisplay: boolean;
  estimatedWaitTime: boolean;
  
  // Receipt
  receiptOption: 'print' | 'email' | 'sms' | 'none' | 'ask';
  
  // Accessibility
  largeTextMode: boolean;
  highContrastMode: boolean;
  screenReaderSupport: boolean;
}

// App Integration
interface AppIntegration {
  id: string;
  tenantId: string;
  appId: string;
  appName: string;
  category: 'accounting' | 'ecommerce' | 'delivery' | 'marketing' | 'loyalty' | 'scheduling';
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  connectedAt?: Date;
  lastSyncAt?: Date;
  config: Record<string, any>;
  permissions: string[];
}

// Release Manager
interface ReleaseConfig {
  id: string;
  tenantId: string;
  updatePolicy: 'automatic' | 'scheduled' | 'manual';
  
  // Scheduled update window
  updateWindowStart: string; // "02:00"
  updateWindowEnd: string; // "05:00"
  excludeDays: number[]; // [5, 6] = Cuma, Cumartesi
  
  // Notifications
  notifyBeforeUpdate: boolean;
  notifyHoursBefore: number;
  
  // Rollback
  allowRollback: boolean;
  keepPreviousVersions: number;
}

interface AppRelease {
  id: string;
  version: string;
  releaseDate: Date;
  releaseNotes: string;
  minOsVersion: string;
  isRequired: boolean;
  rolloutPercentage: number; // Kademeli yayın
}
```

---

### 1.2 Çoklu Lokasyon (Multi-Location)

**Kaynak:** Square Dashboard > Settings > Locations

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Location CRUD | Lokasyon oluştur/düzenle/sil | 🔴 |
| Location cloning | Mevcut lokasyondan kopyala | 🟡 |
| Location-based settings | Lokasyon bazlı ayarlar | 🔴 |
| Location-based branding | Lokasyon bazlı marka | 🟡 |
| Business hours | Çalışma saatleri | 🟡 |

**Teknik Gereksinimler:**
```typescript
interface Location {
  id: string;
  businessName: string;
  nickname: string;
  type: 'physical' | 'mobile';
  address: Address;
  contact: ContactInfo;
  socialMedia: SocialMedia;
  branding: BrandingSettings;
  businessHours: BusinessHours[];
  timezone: string;
  language: string;
}

// Lokasyon klonlama
async function cloneLocation(sourceId: string, newName: string): Promise<Location> {
  // Ürünler, modifiers, vergiler, ayarlar kopyalanır
}
```

---

### 1.3 Vergi Sistemi (Tax System)

**Kaynak:** Square Dashboard > Settings > Sales Taxes

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Multiple taxes | Birden fazla vergi tanımı | 🔴 |
| Tax rules | Koşullu vergi kuralları | 🟡 |
| Tax exemptions | Vergi muafiyetleri | 🟡 |
| Inclusive/Additive | KDV dahil/hariç | 🔴 |
| Location-based tax | Lokasyon bazlı vergi | 🟡 |

**Teknik Gereksinimler:**
```typescript
interface Tax {
  id: string;
  name: string;
  rate: number; // 0.18 = %18
  type: 'inclusive' | 'additive';
  locationIds: string[];
  applyTo: 'all' | 'selected';
  itemIds?: string[];
}

interface TaxRule {
  id: string;
  name: string;
  taxId: string;
  type: 'exemption' | 'reduction';
  conditions: TaxCondition[];
  reducedRate?: number;
}

interface TaxCondition {
  type: 'item_price' | 'total_price' | 'item_quantity';
  operator: 'less_than' | 'greater_than' | 'equals';
  value: number;
}
```

---

### 1.4 Ürün Yönetimi Geliştirmeleri

**Kaynak:** Square Dashboard > Items & Services

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Image library | Merkezi görsel kütüphanesi | 🔴 |
| CSV import/export | Toplu veri yönetimi | 🔴 |
| Options (variations) | Ürün varyasyonları (ayrı stok) | 🟡 |
| Units | Ölçü birimleri (kg, lt, adet) | 🟡 |
| Custom attributes | Özel alanlar | 🟢 |
| Service library | Hizmet satışı (süre bazlı) | 🟢 |

**Teknik Gereksinimler:**
```typescript
// Image Library
interface ImageLibrary {
  id: string;
  tenantId: string;
  images: Image[];
}

interface Image {
  id: string;
  url: string;
  thumbnailUrl: string;
  originalName: string;
  size: number;
  mimeType: string;
  usedIn: { type: 'product' | 'category'; id: string }[];
}

// Product Options (Variations)
interface ProductOption {
  id: string;
  name: string; // "Renk", "Boyut"
  values: OptionValue[];
}

interface OptionValue {
  id: string;
  name: string; // "Kırmızı", "Mavi"
}

interface ProductVariation {
  id: string;
  productId: string;
  optionValues: { optionId: string; valueId: string }[];
  sku: string;
  price: number;
  stock: number;
}
```

---

### 1.5 Fiş ve Branding

**Kaynak:** Square Dashboard > Settings > Receipts, Branding

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Receipt customization | Fiş özelleştirme | 🔴 |
| Brand colors | Marka rengi | 🟡 |
| Multiple logos | Full + Small logo | 🟡 |
| Social media on receipt | Sosyal medya linkleri | 🟢 |
| Return policy | İade politikası | 🟢 |
| Custom text | Özel metin | 🟢 |

---

### 1.6 Müşteri Yönetimi (Customer Management)

**Kaynak:** Square Dashboard > Customers > Settings

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Configure profiles | Müşteri profil alanlarını özelleştir | 🔴 |
| Instant profiles | Kart ile otomatik profil oluşturma | 🔴 |
| Feedback settings | Geri bildirim toplama ayarları | 🟡 |
| Card on file | Kayıtlı kart yönetimi | 🟡 |
| Custom fields | Özel müşteri alanları | 🟢 |

**Teknik Gereksinimler:**
```typescript
// Customer Profile Configuration
interface CustomerProfileConfig {
  id: string;
  tenantId: string;
  visibleFields: CustomerField[];
  customFields: CustomField[];
}

interface CustomerField {
  name: 'name' | 'phone' | 'email' | 'address' | 'groups' | 'company' | 'referenceId' | 'birthday';
  required: boolean;
  visible: boolean;
  order: number;
}

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox';
  options?: string[]; // dropdown için
  searchable: boolean;
  filterable: boolean;
}

// Instant Profiles
interface InstantProfileConfig {
  enabled: boolean;
  createOnTransaction: boolean;
  updateOnRepeatTransaction: boolean;
  privacyNoticeUrl?: string;
}

// Card on File
interface CardOnFile {
  id: string;
  customerId: string;
  cardBrand: string;
  last4: string;
  expirationMonth: number;
  expirationYear: number;
  authorizationFormUrl?: string;
  createdAt: Date;
}

// Feedback Settings
interface FeedbackSettings {
  collectFromDigitalReceipts: boolean;
  locationIds: string[];
  notificationsEnabled: boolean;
  feedbackRecipients: string[];
  directMessageRecipients: string[];
}
```

---

### 1.7 Güvenlik ve Kimlik Doğrulama (Security & Auth)

**Kaynak:** Square Dashboard > Settings > Account & Settings

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Two-step verification | İki faktörlü doğrulama | 🔴 |
| Passkeys | Şifresiz biyometrik giriş | 🟡 |
| POS Passcode | Kasada hızlı giriş PIN'i | 🔴 |
| Sign out everywhere | Tüm oturumları kapat | 🔴 |
| Business 2FA enforcement | Ekip için 2FA zorunluluğu | 🟡 |

**Teknik Gereksinimler:**
```typescript
// Two-Step Verification
interface TwoFactorAuth {
  userId: string;
  enabled: boolean;
  method: 'sms' | 'authenticator' | 'email';
  phoneNumber?: string;
  backupCodes: string[];
  lastVerified: Date;
}

// Passkeys (WebAuthn)
interface Passkey {
  id: string;
  userId: string;
  credentialId: string;
  publicKey: string;
  deviceName: string;
  createdAt: Date;
  lastUsed: Date;
}

// POS Passcode
interface POSPasscode {
  userId: string;
  locationId: string;
  passcodeHash: string;
  permissions: POSPermission[];
}

type POSPermission = 
  | 'clock_in'
  | 'process_sale'
  | 'apply_discount'
  | 'void_transaction'
  | 'open_cash_drawer'
  | 'view_reports';

// Business Security Settings
interface BusinessSecuritySettings {
  tenantId: string;
  enforce2FAForTeam: boolean;
  sessionTimeout: number; // dakika
  allowedIPRanges?: string[];
}
```

---

### 1.8 Personel Yönetimi (Staff Management)

**Kaynak:** Square Dashboard > Staff

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Schedule | Vardiya takvimi | 🔴 |
| Availability | Personel müsaitlik durumu | 🟡 |
| Time off | İzin yönetimi | 🟡 |
| Timecards | Puantaj kartları | 🔴 |
| Clock in/out | Giriş/çıkış takibi | 🔴 |
| Breaks | Mola ayarları | 🟡 |
| Overtime | Fazla mesai ayarları | 🟡 |
| Tips | Bahşiş yönetimi | 🔴 |

**Teknik Gereksinimler:**
```typescript
// Schedule
interface Schedule {
  id: string;
  tenantId: string;
  locationId: string;
  weekStartDate: Date;
  shifts: Shift[];
  published: boolean;
  publishedAt?: Date;
}

interface Shift {
  id: string;
  employeeId: string;
  date: Date;
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  role?: string;
  notes?: string;
}

// Availability
interface Availability {
  employeeId: string;
  dayOfWeek: number; // 0-6
  available: boolean;
  startTime?: string;
  endTime?: string;
  recurring: boolean;
}

// Time Off
interface TimeOffRequest {
  id: string;
  employeeId: string;
  type: 'vacation' | 'sick' | 'personal' | 'other';
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'denied';
  notes?: string;
  approvedBy?: string;
}

// Timecard
interface Timecard {
  id: string;
  employeeId: string;
  locationId: string;
  clockIn: Date;
  clockOut?: Date;
  breaks: Break[];
  totalHours: number;
  overtimeHours: number;
  status: 'active' | 'completed' | 'approved';
  approvedBy?: string;
}

interface Break {
  startTime: Date;
  endTime?: Date;
  paid: boolean;
}

// Tips
interface TipSettings {
  tenantId: string;
  tipPoolingEnabled: boolean;
  distributionMethod: 'equal' | 'hours_worked' | 'sales' | 'custom';
  tipOutRoles: TipOutRole[];
}

interface TipOutRole {
  role: string; // "kitchen", "bar", "busser"
  percentage: number;
}

// Overtime Settings
interface OvertimeSettings {
  tenantId: string;
  weeklyThreshold: number; // 40 saat
  dailyThreshold: number; // 8 saat
  overtimeRate: number; // 1.5
  doubleTimeRate?: number; // 2.0
  alertEnabled: boolean;
}
```

---

### 1.9 Check Settlement (Bahşiş Mutabakatı)

**Kaynak:** Square Dashboard > Settings > Payments > Check settlement

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Settlement timing | Otomatik settlement zamanı | 🔴 |
| End of day settlement | Gün sonu mutabakat | 🔴 |
| 36-hour settlement | 36 saat sonra mutabakat | 🟡 |
| Location-based schedule | Lokasyon bazlı zamanlama | 🟡 |

**Teknik Gereksinimler:**
```typescript
interface CheckSettlementConfig {
  tenantId: string;
  locationId: string;
  settlementMode: 'end_of_day' | '36_hours';
  
  // End of day settings
  settlementTime: string; // "01:30"
  hoursAfterClose: number; // 1.5
  
  // Schedule
  schedule: DaySchedule[];
}

interface DaySchedule {
  dayOfWeek: number; // 0-6
  businessHoursSet: boolean;
  settlementTime: string;
}
```

---

### 1.10 Ürün Oluşturma Geliştirmeleri

**Kaynak:** Square Dashboard > Items & Services > Create Item

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Item types | Physical/Digital/Service türleri | 🔴 |
| Location-based inventory | Lokasyon bazlı stok | 🔴 |
| Channel management | Kanal yönetimi (POS, Online) | 🟡 |
| Skip item details | Hızlı satış için detay atlama | 🟡 |
| Internal items | Satılamaz iç maliyet ürünleri | 🟢 |
| Shipping weight | Kargo ağırlığı | 🟢 |

**Teknik Gereksinimler:**
```typescript
// Extended Product
interface Product {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  
  // Type
  itemType: 'physical' | 'digital' | 'service';
  
  // Pricing
  price: number;
  unitCost?: number; // Plus feature
  vendorId?: string;
  
  // Inventory
  inventory: LocationInventory[];
  sku?: string;
  
  // Variations & Modifiers
  variations: ProductVariation[];
  modifierSetIds: string[];
  
  // Custom Attributes
  customAttributes: Record<string, any>;
  
  // Channels
  channels: ProductChannel[];
  
  // POS Settings
  posSettings: POSProductSettings;
  
  // Fulfillment
  shippingWeight?: number;
  shippingWeightUnit: 'kg' | 'lb';
  
  // Taxes
  taxIds: string[];
  
  // Images
  imageIds: string[];
  
  // Categories
  categoryIds: string[];
}

interface LocationInventory {
  locationId: string;
  availability: 'available' | 'sold_out' | 'hidden';
  stockQuantity?: number;
  lowStockAlert?: number;
}

interface ProductChannel {
  channel: 'pos' | 'online' | 'kiosk';
  enabled: boolean;
  visibility: 'visible' | 'hidden';
}

interface POSProductSettings {
  skipDetailsScreen: boolean;
  cannotBePurchasedAlone: boolean; // İç maliyet ürünleri için
  defaultVariationId?: string;
  preSelectedModifierIds?: string[];
}
```

---

### 1.11 Raporlama Sistemi (Reports)

**Kaynak:** Square Dashboard > Reports

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Sales summary | Satış özeti (günlük/haftalık/aylık) | 🔴 |
| Item sales | Ürün bazlı satışlar | 🔴 |
| Sales trends | Satış trendleri (grafik) | 🔴 |
| Category sales | Kategori bazlı satışlar | 🔴 |
| Modifier sales | Modifier bazlı satışlar | 🟡 |
| Sales taxes | Satış vergileri (KDV raporu) | 🔴 |
| Fees | İşlem ücretleri | 🟡 |
| Service charges | Servis ücretleri | 🟡 |
| Reconciliation | Mutabakat raporu | 🔴 |
| Payment methods | Ödeme yöntemleri dağılımı | 🔴 |
| Discounts | İndirim raporları | 🔴 |
| Comps | İkram raporları | 🔴 |
| Voids | İptal raporları | 🔴 |
| Cash drawers | Kasa hareketleri | 🔴 |
| Activity log | Aktivite günlüğü (kim ne yaptı) | 🔴 |
| Custom reports | Özel rapor oluşturma | 🟡 |
| Saved reports | Kaydedilmiş raporlar | 🟡 |
| Scheduled reports | Zamanlanmış raporlar (e-posta) | 🟢 |

**Teknik Gereksinimler:**
```typescript
// Report Types
type ReportCategory = 'sales' | 'accounting' | 'payments' | 'operations' | 'custom';

interface ReportConfig {
  id: string;
  tenantId: string;
  name: string;
  category: ReportCategory;
  type: string;
  
  // Filters
  filters: ReportFilter[];
  
  // Date range
  dateRange: {
    type: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom';
    startDate?: Date;
    endDate?: Date;
  };
  
  // Comparison
  comparison?: {
    enabled: boolean;
    type: 'prior_day' | 'prior_week' | 'prior_month' | 'prior_year';
  };
  
  // Grouping
  groupBy?: 'hour' | 'day' | 'week' | 'month' | 'location' | 'employee' | 'device';
  
  // Export
  exportFormats: ('csv' | 'pdf' | 'email')[];
}

interface ReportFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
  value: any;
}

// Sales Summary Report
interface SalesSummaryReport {
  period: string;
  netSales: number;
  grossSales: number;
  transactions: number;
  averageSale: number;
  discounts: number;
  comps: number;
  tips: number;
  laborPercentage: number;
  
  // Comparison
  priorPeriod?: {
    netSales: number;
    change: number; // percentage
  };
  
  // Breakdown by location
  byLocation: LocationSales[];
  
  // Hourly breakdown
  byHour: HourlySales[];
}

interface LocationSales {
  locationId: string;
  locationName: string;
  netSales: number;
  transactions: number;
  laborPercentage: number;
}

interface HourlySales {
  hour: number;
  sales: number;
  transactions: number;
}

// Item Sales Report
interface ItemSalesReport {
  items: ItemSale[];
  totalQuantity: number;
  totalRevenue: number;
}

interface ItemSale {
  itemId: string;
  itemName: string;
  categoryName: string;
  quantitySold: number;
  grossSales: number;
  netSales: number;
  discounts: number;
  refunds: number;
}

// Activity Log
interface ActivityLog {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  action: ActivityAction;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  ipAddress: string;
  deviceId?: string;
  timestamp: Date;
}

type ActivityAction = 
  | 'create' | 'update' | 'delete'
  | 'login' | 'logout'
  | 'void' | 'refund' | 'discount'
  | 'clock_in' | 'clock_out'
  | 'open_drawer' | 'close_drawer';

// Saved Report
interface SavedReport {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  config: ReportConfig;
  createdAt: Date;
  lastRunAt?: Date;
}

// Scheduled Report
interface ScheduledReport {
  id: string;
  tenantId: string;
  reportId: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    time: string; // "09:00"
  };
  recipients: string[]; // email addresses
  format: 'csv' | 'pdf';
  enabled: boolean;
  lastSentAt?: Date;
}
```

---

### 1.12 Kullanıcı Deneyimi Özellikleri (User Engagement)

**Kaynak:** Square Dashboard > Profile Menu

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Feature log | Yeni özellik duyuruları | 🟡 |
| Roadmap | Ürün yol haritası | 🟢 |
| Community | Kullanıcı forumu | 🟢 |
| Earn rewards | Referral programı | 🟡 |
| Cookie preferences | Çerez tercihleri | 🟢 |

**Teknik Gereksinimler:**
```typescript
// Feature Log (What's New)
interface FeatureLog {
  id: string;
  title: string;
  description: string;
  category: 'new_feature' | 'improvement' | 'fix';
  releaseDate: Date;
  imageUrl?: string;
  learnMoreUrl?: string;
  affectedApps: ('pos' | 'boss' | 'waiter' | 'kitchen' | 'qr-menu')[];
}

interface UserFeatureLogStatus {
  userId: string;
  lastSeenFeatureId: string;
  readFeatureIds: string[];
  lastCheckedAt: Date;
}

// Roadmap
interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'under_consideration' | 'planned' | 'in_development' | 'coming_soon' | 'released';
  category: string;
  votes: number;
  estimatedRelease?: string; // "Q2 2026"
  createdAt: Date;
  updatedAt: Date;
}

interface RoadmapVote {
  userId: string;
  itemId: string;
  votedAt: Date;
}

// Community Forum
interface ForumCategory {
  id: string;
  name: string;
  description: string;
  topicCount: number;
  postCount: number;
}

interface ForumTopic {
  id: string;
  categoryId: string;
  title: string;
  authorId: string;
  authorName: string;
  content: string;
  views: number;
  replies: number;
  isPinned: boolean;
  isSolved: boolean;
  createdAt: Date;
  lastReplyAt?: Date;
}

interface ForumPost {
  id: string;
  topicId: string;
  authorId: string;
  authorName: string;
  content: string;
  isAnswer: boolean; // Kabul edilen cevap
  likes: number;
  createdAt: Date;
}

// Referral Program (Earn Rewards)
interface ReferralProgram {
  tenantId: string;
  referralCode: string;
  referralLink: string;
  
  // Rewards
  referrerReward: {
    type: 'free_processing' | 'credit' | 'discount';
    amount: number;
    currency: string;
    expirationDays: number;
  };
  
  refereeReward: {
    type: 'free_processing' | 'credit' | 'discount';
    amount: number;
    currency: string;
    expirationDays: number;
  };
  
  // Stats
  totalReferrals: number;
  qualifiedReferrals: number;
  pendingRewards: number;
  earnedRewards: number;
  redeemedRewards: number;
}

interface ReferralInvite {
  id: string;
  referrerId: string;
  refereeEmail: string;
  status: 'sent' | 'signed_up' | 'qualified' | 'rewarded';
  sentAt: Date;
  signedUpAt?: Date;
  qualifiedAt?: Date;
  rewardedAt?: Date;
}

// Cookie Preferences (KVKK/GDPR)
interface CookiePreferences {
  userId: string;
  essential: boolean; // Her zaman true
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  updatedAt: Date;
}
```

---

## 🟡 Faz 2 - Önemli (Q2-Q3 2026)

### 2.1 AI Özellikleri

| Özellik | Açıklama | Teknoloji |
|---------|----------|-----------|
| AI description | Ürün açıklaması oluşturma | AWS Bedrock / Claude |
| Auto create | Barkoddan ürün bilgisi | Veritabanı + API |

**Teknik Gereksinimler:**
```typescript
// AI Description Generator
async function generateProductDescription(
  productName: string,
  keywords: string[]
): Promise<string> {
  const prompt = `${productName} için kısa, çekici bir ürün açıklaması yaz.
  Anahtar kelimeler: ${keywords.join(', ')}
  Dil: Türkçe
  Maksimum: 150 karakter`;
  
  return await bedrockClient.invoke({
    modelId: 'anthropic.claude-3-sonnet',
    prompt
  });
}

// Barcode Product Lookup
async function lookupByBarcode(barcode: string): Promise<ProductInfo | null> {
  // 1. Kendi veritabanımızda ara
  // 2. GS1 Türkiye API
  // 3. Open Food Facts API
  // 4. Bulunamazsa null
}
```

---

### 2.2 Referral Program

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Referral links | Benzersiz referans linkleri | 🔴 |
| Reward tracking | Ödül takibi | 🔴 |
| KYC verification | Kimlik doğrulama | 🔴 |
| Reward redemption | Ödül kullanımı | 🔴 |

**Teknik Gereksinimler:**
```typescript
interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  code: string;
  status: 'pending' | 'qualified' | 'rewarded';
  referrerReward: Reward;
  refereeReward: Reward;
  createdAt: Date;
  qualifiedAt?: Date;
}

interface Reward {
  type: 'free_processing';
  amount: number; // ₺500
  expiresAt: Date; // 90 gün
  usedAmount: number;
}
```

---

### 2.3 Subscription Plans

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Plan creation | Abonelik planı oluşturma | 🔴 |
| Recurring billing | Tekrarlayan faturalama | 🔴 |
| Subscription management | Abonelik yönetimi | 🔴 |
| Cancel/pause | İptal/dondurma | 🟡 |

---

### 2.4 Online Sipariş

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Online ordering | Web üzerinden sipariş | 🔴 |
| Pickup | Gel-al | 🔴 |
| Delivery | Teslimat | 🟡 |
| Payment links | Ödeme linkleri | 🔴 |

---

## 🟢 Faz 3 - Gelecek (Q4 2026+)

### 3.1 Kiosk Modu

| Özellik | Açıklama |
|---------|----------|
| Self-service ordering | Müşteri kendi sipariş verir |
| Payment integration | Kiosk'ta ödeme |
| Queue management | Sıra yönetimi |

---

### 3.2 Offline Payments

| Özellik | Açıklama |
|---------|----------|
| Offline queue | İnternet yokken işlem kaydet |
| Auto sync | İnternet gelince senkronize |
| Conflict resolution | Çakışma çözümü |

**Teknik Gereksinimler:**
```typescript
// Service Worker + IndexedDB
interface OfflineTransaction {
  id: string;
  data: TransactionData;
  createdAt: Date;
  syncStatus: 'pending' | 'synced' | 'failed';
  retryCount: number;
}

// Sync logic
async function syncOfflineTransactions() {
  const pending = await indexedDB.getAll('offline_transactions');
  for (const tx of pending) {
    try {
      await api.processTransaction(tx.data);
      await indexedDB.delete('offline_transactions', tx.id);
    } catch (error) {
      tx.retryCount++;
      if (tx.retryCount > 3) tx.syncStatus = 'failed';
      await indexedDB.put('offline_transactions', tx);
    }
  }
}
```

---

### 3.3 Gift Cards

| Özellik | Açıklama |
|---------|----------|
| Physical cards | Fiziksel hediye kartı |
| Digital cards | Dijital hediye kartı |
| Balance check | Bakiye sorgulama |
| Partial redemption | Kısmi kullanım |

---

### 3.4 Email Marketing

| Özellik | Açıklama |
|---------|----------|
| Mailing list | E-posta listesi |
| Campaigns | Kampanya gönderimi |
| Templates | E-posta şablonları |
| Analytics | Açılma/tıklama oranları |

---

## 📊 API Endpoints (Yeni)

### Device Management
```
# Devices
GET    /api/devices
POST   /api/devices
GET    /api/devices/:id
PUT    /api/devices/:id
DELETE /api/devices/:id
POST   /api/devices/:id/unpair

# Device Codes (Pairing)
GET    /api/device-codes
POST   /api/device-codes/generate
GET    /api/device-codes/:code
POST   /api/device-codes/:code/pair
DELETE /api/device-codes/:id

# Modes
GET    /api/modes
POST   /api/modes
GET    /api/modes/:id
PUT    /api/modes/:id
DELETE /api/modes/:id
POST   /api/modes/:id/duplicate

# Printer Profiles
GET    /api/printer-profiles
POST   /api/printer-profiles
GET    /api/printer-profiles/:id
PUT    /api/printer-profiles/:id
DELETE /api/printer-profiles/:id
POST   /api/printer-profiles/:id/test-print

# Kitchen Stations (KDS)
GET    /api/kitchen-stations
POST   /api/kitchen-stations
GET    /api/kitchen-stations/:id
PUT    /api/kitchen-stations/:id
DELETE /api/kitchen-stations/:id

# Kiosk
GET    /api/kiosk-configs
POST   /api/kiosk-configs
GET    /api/kiosk-configs/:id
PUT    /api/kiosk-configs/:id
DELETE /api/kiosk-configs/:id

# App Integrations
GET    /api/integrations
GET    /api/integrations/available
POST   /api/integrations/:appId/connect
DELETE /api/integrations/:id/disconnect
POST   /api/integrations/:id/sync

# Release Manager
GET    /api/releases/config
PUT    /api/releases/config
GET    /api/releases/available
POST   /api/releases/:version/install
POST   /api/releases/:version/rollback
```

### Locations
```
GET    /api/locations
POST   /api/locations
GET    /api/locations/:id
PUT    /api/locations/:id
DELETE /api/locations/:id
POST   /api/locations/:id/clone
```

### Taxes
```
GET    /api/taxes
POST   /api/taxes
PUT    /api/taxes/:id
DELETE /api/taxes/:id

GET    /api/tax-rules
POST   /api/tax-rules
PUT    /api/tax-rules/:id
DELETE /api/tax-rules/:id
```

### Image Library
```
GET    /api/images
POST   /api/images/upload
DELETE /api/images/:id
```

### Referrals
```
GET    /api/referrals
POST   /api/referrals/generate-code
GET    /api/referrals/rewards
POST   /api/referrals/redeem
```

### Customers
```
# Customer Profiles
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id

# Profile Configuration
GET    /api/customer-config
PUT    /api/customer-config
POST   /api/customer-config/custom-fields
DELETE /api/customer-config/custom-fields/:id

# Instant Profiles
GET    /api/instant-profiles/config
PUT    /api/instant-profiles/config

# Card on File
GET    /api/customers/:id/cards
POST   /api/customers/:id/cards
DELETE /api/customers/:id/cards/:cardId

# Feedback
GET    /api/feedback
GET    /api/feedback/:id
POST   /api/feedback/:id/reply
PUT    /api/feedback/settings
```

### Staff
```
# Schedule
GET    /api/schedules
POST   /api/schedules
GET    /api/schedules/:id
PUT    /api/schedules/:id
POST   /api/schedules/:id/publish

# Shifts
GET    /api/shifts
POST   /api/shifts
PUT    /api/shifts/:id
DELETE /api/shifts/:id

# Availability
GET    /api/employees/:id/availability
PUT    /api/employees/:id/availability

# Time Off
GET    /api/time-off
POST   /api/time-off
PUT    /api/time-off/:id
POST   /api/time-off/:id/approve
POST   /api/time-off/:id/deny

# Timecards
GET    /api/timecards
GET    /api/timecards/:id
POST   /api/timecards/clock-in
POST   /api/timecards/clock-out
POST   /api/timecards/:id/break/start
POST   /api/timecards/:id/break/end
PUT    /api/timecards/:id
POST   /api/timecards/:id/approve

# Tips
GET    /api/tips/settings
PUT    /api/tips/settings
GET    /api/tips/summary
POST   /api/tips/distribute
```

### Security
```
# Two-Factor Auth
GET    /api/auth/2fa/status
POST   /api/auth/2fa/enable
POST   /api/auth/2fa/disable
POST   /api/auth/2fa/verify
GET    /api/auth/2fa/backup-codes

# Passkeys
GET    /api/auth/passkeys
POST   /api/auth/passkeys/register
DELETE /api/auth/passkeys/:id

# POS Passcode
GET    /api/auth/pos-passcode
POST   /api/auth/pos-passcode
PUT    /api/auth/pos-passcode
POST   /api/auth/pos-passcode/verify

# Sessions
GET    /api/auth/sessions
DELETE /api/auth/sessions/all
```

### Check Settlement
```
GET    /api/settlement/config
PUT    /api/settlement/config
GET    /api/settlement/schedule
PUT    /api/settlement/schedule
```

### Reports
```
# Sales Reports
GET    /api/reports/sales/summary
GET    /api/reports/sales/items
GET    /api/reports/sales/trends
GET    /api/reports/sales/categories
GET    /api/reports/sales/modifiers

# Accounting Reports
GET    /api/reports/accounting/taxes
GET    /api/reports/accounting/fees
GET    /api/reports/accounting/service-charges
GET    /api/reports/accounting/reconciliation

# Payment Reports
GET    /api/reports/payments/methods
GET    /api/reports/payments/discounts
GET    /api/reports/payments/comps
GET    /api/reports/payments/voids
GET    /api/reports/payments/cash-drawers

# Operations Reports
GET    /api/reports/operations/activity-log

# Custom Reports
GET    /api/reports/custom
POST   /api/reports/custom
GET    /api/reports/custom/:id
PUT    /api/reports/custom/:id
DELETE /api/reports/custom/:id
POST   /api/reports/custom/:id/run

# Saved Reports
GET    /api/reports/saved
POST   /api/reports/saved
DELETE /api/reports/saved/:id

# Scheduled Reports
GET    /api/reports/scheduled
POST   /api/reports/scheduled
PUT    /api/reports/scheduled/:id
DELETE /api/reports/scheduled/:id
```

### User Engagement
```
# Feature Log
GET    /api/features/log
GET    /api/features/log/unread-count
POST   /api/features/log/:id/mark-read
POST   /api/features/log/mark-all-read

# Roadmap
GET    /api/roadmap
GET    /api/roadmap/:id
POST   /api/roadmap/:id/vote
DELETE /api/roadmap/:id/vote

# Community Forum
GET    /api/community/categories
GET    /api/community/topics
POST   /api/community/topics
GET    /api/community/topics/:id
GET    /api/community/topics/:id/posts
POST   /api/community/topics/:id/posts
POST   /api/community/posts/:id/like
POST   /api/community/posts/:id/mark-answer

# Referral Program
GET    /api/referrals/program
GET    /api/referrals/invites
POST   /api/referrals/invites
GET    /api/referrals/rewards
POST   /api/referrals/rewards/redeem

# Cookie Preferences
GET    /api/preferences/cookies
PUT    /api/preferences/cookies
```

---

## 🔧 Teknik Notlar

### Veritabanı Değişiklikleri

```sql
-- Yeni tablolar
CREATE TABLE devices (...);
CREATE TABLE modes (...);
CREATE TABLE printer_profiles (...);
CREATE TABLE taxes (...);
CREATE TABLE tax_rules (...);
CREATE TABLE images (...);
CREATE TABLE referrals (...);
CREATE TABLE rewards (...);
CREATE TABLE subscriptions (...);
CREATE TABLE subscription_plans (...);

-- Müşteri Yönetimi
CREATE TABLE customer_profile_config (...);
CREATE TABLE customer_custom_fields (...);
CREATE TABLE cards_on_file (...);
CREATE TABLE feedback (...);
CREATE TABLE feedback_settings (...);

-- Personel Yönetimi
CREATE TABLE schedules (...);
CREATE TABLE shifts (...);
CREATE TABLE availability (...);
CREATE TABLE time_off_requests (...);
CREATE TABLE timecards (...);
CREATE TABLE breaks (...);
CREATE TABLE tip_settings (...);
CREATE TABLE tip_distributions (...);

-- Güvenlik
CREATE TABLE two_factor_auth (...);
CREATE TABLE passkeys (...);
CREATE TABLE pos_passcodes (...);
CREATE TABLE user_sessions (...);

-- Settlement
CREATE TABLE check_settlement_config (...);

-- Reports
CREATE TABLE saved_reports (...);
CREATE TABLE scheduled_reports (...);
CREATE TABLE activity_logs (...);

-- User Engagement
CREATE TABLE feature_logs (...);
CREATE TABLE user_feature_status (...);
CREATE TABLE roadmap_items (...);
CREATE TABLE roadmap_votes (...);
CREATE TABLE forum_categories (...);
CREATE TABLE forum_topics (...);
CREATE TABLE forum_posts (...);
CREATE TABLE forum_likes (...);
CREATE TABLE referral_programs (...);
CREATE TABLE referral_invites (...);
CREATE TABLE cookie_preferences (...);

-- Mevcut tablolara eklemeler
ALTER TABLE locations ADD COLUMN branding JSONB;
ALTER TABLE locations ADD COLUMN business_hours JSONB;
ALTER TABLE products ADD COLUMN options JSONB;
ALTER TABLE products ADD COLUMN variations JSONB;
ALTER TABLE products ADD COLUMN item_type VARCHAR(20);
ALTER TABLE products ADD COLUMN pos_settings JSONB;
ALTER TABLE products ADD COLUMN channels JSONB;
ALTER TABLE products ADD COLUMN shipping_weight DECIMAL;
```

### WebSocket Events (Yeni)

```typescript
// Device status
'device:online'
'device:offline'
'device:battery_low'

// Sync events
'sync:tax_updated'
'sync:product_updated'
'sync:location_updated'

// Reports
'report:scheduled_sent'
'report:generation_complete'

// User Engagement
'feature:new_release'
'roadmap:status_changed'
'community:new_reply'
'referral:qualified'
```

---

**Son Güncelleme:** 17 Ocak 2026
