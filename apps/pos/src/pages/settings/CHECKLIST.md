# Settings Screen Refactoring Checklist

## Dosya Yapısı
```
apps/pos/src/pages/settings/
├── CHECKLIST.md          ← Bu dosya
├── index.tsx             ← Ana SettingsScreen (birleştirici)
├── types.ts              ← Ortak tipler ve sabitler
├── hooks.ts              ← Ortak hooks ve localStorage
├── styles.ts             ← Ortak stiller
├── tabs/
│   ├── BusinessTab.tsx   ← İşletme ayarları
│   ├── UsersTab.tsx      ← Kullanıcı yönetimi
│   ├── TablesTab.tsx     ← Masa yönetimi
│   ├── PrintersTab.tsx   ← Yazıcı yönetimi
│   ├── DevicesTab.tsx    ← Cihaz ayarları
│   ├── ReceiptTab.tsx    ← Fiş tasarımı
│   ├── SecurityTab.tsx   ← Güvenlik ayarları
│   └── SystemTab.tsx     ← Sistem ayarları
└── modals/
    ├── CloseAllModal.tsx
    ├── TableModal.tsx
    ├── PrinterModal.tsx
    └── UserModal.tsx
```

## Tamamlanan Dosyalar
- [x] types.ts
- [x] hooks.ts
- [x] styles.ts
- [x] tabs/BusinessTab.tsx
- [x] tabs/UsersTab.tsx
- [x] tabs/TablesTab.tsx
- [x] tabs/PrintersTab.tsx
- [x] tabs/DevicesTab.tsx
- [x] tabs/ReceiptTab.tsx
- [x] tabs/SecurityTab.tsx
- [x] tabs/SystemTab.tsx
- [x] tabs/index.ts
- [x] modals/CloseAllModal.tsx
- [x] modals/TableModal.tsx
- [x] modals/PrinterModal.tsx
- [x] modals/UserModal.tsx
- [x] modals/index.ts
- [x] index.tsx (ana birleştirici)

## Özellikler
- [x] localStorage persistence
- [x] Logo yükleme (max 2MB)
- [x] Kullanıcı CRUD
- [x] Masa CRUD (API)
- [x] Yazıcı CRUD (API)
- [x] Cihaz toggle'ları
- [x] Fiş önizleme
- [x] Otomatik kilit
- [x] Sistem bilgisi
