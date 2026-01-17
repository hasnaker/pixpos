#!/usr/bin/env node
/**
 * Queen Waffle QR Menü Karekod Oluşturucu
 * 
 * Kullanım: node scripts/generate-qr-menu.js
 * Çıktı: docs/queen-waffle-qr-menu.png
 */

import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const QR_MENU_URL = 'https://queen.pixpos.site';
const OUTPUT_DIR = 'docs';
const OUTPUT_FILE = 'queen-waffle-qr-menu.png';

async function generateQRCode() {
  console.log('🔲 Queen Waffle QR Menü Karekodu Oluşturuluyor...\n');
  console.log(`📍 URL: ${QR_MENU_URL}`);
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const outputPath = path.join(OUTPUT_DIR, OUTPUT_FILE);
  
  // QR Code options - high quality for print
  const options = {
    type: 'png',
    width: 1000,           // 1000px - yüksek çözünürlük baskı için
    margin: 2,             // Minimal kenar boşluğu
    color: {
      dark: '#000000',     // Siyah QR
      light: '#FFFFFF'     // Beyaz arka plan
    },
    errorCorrectionLevel: 'H'  // Yüksek hata düzeltme (logo eklenebilir)
  };
  
  try {
    await QRCode.toFile(outputPath, QR_MENU_URL, options);
    console.log(`\n✅ QR Kod oluşturuldu: ${outputPath}`);
    console.log(`📐 Boyut: ${options.width}x${options.width}px`);
    console.log(`🖨️  Baskı için hazır (300 DPI'da ~8.5cm x 8.5cm)`);
    
    // Also generate SVG for vector printing
    const svgPath = path.join(OUTPUT_DIR, 'queen-waffle-qr-menu.svg');
    const svgString = await QRCode.toString(QR_MENU_URL, { type: 'svg', margin: 2 });
    fs.writeFileSync(svgPath, svgString);
    console.log(`\n✅ SVG versiyonu: ${svgPath}`);
    console.log(`📐 Vektör format - sınırsız ölçeklendirme`);
    
  } catch (err) {
    console.error('❌ Hata:', err.message);
    process.exit(1);
  }
}

generateQRCode();
