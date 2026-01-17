import { Injectable, Logger } from '@nestjs/common';
import * as net from 'net';
import { Printer } from '../../entities/printer.entity';

export interface PrintJob {
  printerId: string;
  type: 'kitchen' | 'receipt';
  content: Buffer;
}

/**
 * ESC/POS Commands
 */
export const ESC_POS = {
  // Initialize printer
  INIT: Buffer.from([0x1b, 0x40]),
  // Line feed
  LF: Buffer.from([0x0a]),
  // Cut paper (partial cut)
  CUT: Buffer.from([0x1d, 0x56, 0x01]),
  // Full cut
  FULL_CUT: Buffer.from([0x1d, 0x56, 0x00]),
  // Text alignment
  ALIGN_LEFT: Buffer.from([0x1b, 0x61, 0x00]),
  ALIGN_CENTER: Buffer.from([0x1b, 0x61, 0x01]),
  ALIGN_RIGHT: Buffer.from([0x1b, 0x61, 0x02]),
  // Text size
  TEXT_NORMAL: Buffer.from([0x1b, 0x21, 0x00]),
  TEXT_DOUBLE_HEIGHT: Buffer.from([0x1b, 0x21, 0x10]),
  TEXT_DOUBLE_WIDTH: Buffer.from([0x1b, 0x21, 0x20]),
  TEXT_DOUBLE: Buffer.from([0x1b, 0x21, 0x30]),
  // Bold
  BOLD_ON: Buffer.from([0x1b, 0x45, 0x01]),
  BOLD_OFF: Buffer.from([0x1b, 0x45, 0x00]),
  // Underline
  UNDERLINE_ON: Buffer.from([0x1b, 0x2d, 0x01]),
  UNDERLINE_OFF: Buffer.from([0x1b, 0x2d, 0x00]),
  // Feed lines
  FEED_3_LINES: Buffer.from([0x1b, 0x64, 0x03]),
  FEED_5_LINES: Buffer.from([0x1b, 0x64, 0x05]),
  // Turkish Code Page (CP857 - DOS Turkish)
  CODE_PAGE_TURKISH: Buffer.from([0x1b, 0x74, 0x24]), // Code page 857
  // Alternative: Windows-1254 Turkish
  CODE_PAGE_WIN1254: Buffer.from([0x1b, 0x74, 0x23]), // Code page 1254
};

/**
 * Türkçe karakter dönüşüm tablosu (CP857 için)
 */
const TURKISH_CHAR_MAP: { [key: string]: number } = {
  'ç': 0x87, 'Ç': 0x80,
  'ğ': 0xA7, 'Ğ': 0xA6,
  'ı': 0x8D, 'İ': 0x98,
  'ö': 0x94, 'Ö': 0x99,
  'ş': 0x9F, 'Ş': 0x9E,
  'ü': 0x81, 'Ü': 0x9A,
};

@Injectable()
export class PrintService {
  private readonly logger = new Logger(PrintService.name);

  /**
   * Türkçe karakterleri CP857 kodlamasına çevir
   */
  convertToTurkish(text: string): Buffer {
    const bytes: number[] = [];
    
    for (const char of text) {
      if (TURKISH_CHAR_MAP[char] !== undefined) {
        bytes.push(TURKISH_CHAR_MAP[char]);
      } else {
        // ASCII karakterler direkt
        const code = char.charCodeAt(0);
        if (code < 128) {
          bytes.push(code);
        } else {
          // Bilinmeyen karakteri ? ile değiştir
          bytes.push(0x3F);
        }
      }
    }
    
    return Buffer.from(bytes);
  }

  /**
   * Send print job to printer via TCP/IP
   */
  async sendToPrinter(printer: Printer, data: Buffer): Promise<boolean> {
    if (printer.connectionType !== 'tcp') {
      this.logger.warn(`USB printing not implemented for printer ${printer.name}`);
      return false;
    }

    if (!printer.ipAddress) {
      this.logger.error(`No IP address configured for printer ${printer.name}`);
      return false;
    }

    return new Promise((resolve) => {
      const client = new net.Socket();
      const timeout = 5000; // 5 second timeout

      const timer = setTimeout(() => {
        client.destroy();
        this.logger.error(`Connection timeout for printer ${printer.name}`);
        resolve(false);
      }, timeout);

      client.connect(printer.port, printer.ipAddress!, () => {
        clearTimeout(timer);
        client.write(data, (err) => {
          if (err) {
            this.logger.error(`Write error for printer ${printer.name}: ${err.message}`);
            client.destroy();
            resolve(false);
          } else {
            client.end();
            this.logger.log(`Print job sent to ${printer.name}`);
            resolve(true);
          }
        });
      });

      client.on('error', (err) => {
        clearTimeout(timer);
        this.logger.error(`Connection error for printer ${printer.name}: ${err.message}`);
        resolve(false);
      });

      client.on('close', () => {
        clearTimeout(timer);
      });
    });
  }

  /**
   * Build ESC/POS buffer from text with commands (Türkçe destekli)
   */
  buildBuffer(parts: (Buffer | string)[]): Buffer {
    const buffers: Buffer[] = [];
    
    // Türkçe code page'i başta ayarla
    buffers.push(ESC_POS.CODE_PAGE_TURKISH);
    
    for (const part of parts) {
      if (Buffer.isBuffer(part)) {
        buffers.push(part);
      } else {
        // Türkçe karakterleri CP857'ye çevir
        buffers.push(this.convertToTurkish(part));
      }
    }
    
    return Buffer.concat(buffers);
  }

  /**
   * Create a separator line
   */
  createSeparator(char: string = '-', length: number = 48): string {
    return char.repeat(length) + '\n';
  }

  /**
   * Create a double separator line
   */
  createDoubleSeparator(length: number = 48): string {
    return '='.repeat(length) + '\n';
  }

  /**
   * Format text to fixed width (for receipt alignment)
   */
  formatLine(left: string, right: string, width: number = 48): string {
    const spaces = width - left.length - right.length;
    if (spaces < 1) {
      return left.substring(0, width - right.length - 1) + ' ' + right + '\n';
    }
    return left + ' '.repeat(spaces) + right + '\n';
  }

  /**
   * Center text
   */
  centerText(text: string, width: number = 48): string {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text + '\n';
  }

  /**
   * Test print to verify printer connection
   */
  async testPrint(printer: Printer): Promise<boolean> {
    const content = this.buildBuffer([
      ESC_POS.INIT,
      ESC_POS.ALIGN_CENTER,
      ESC_POS.TEXT_DOUBLE,
      'QUEEN WAFFLE\n',
      ESC_POS.TEXT_NORMAL,
      ESC_POS.LF,
      this.createDoubleSeparator(),
      'Test Yazdırma Başarılı!\n',
      'Türkçe: ç ğ ı ö ş ü Ç Ğ İ Ö Ş Ü\n',
      this.createDoubleSeparator(),
      ESC_POS.LF,
      `Yazıcı: ${printer.name}\n`,
      `IP: ${printer.ipAddress}:${printer.port}\n`,
      `Tip: ${printer.type}\n`,
      ESC_POS.LF,
      `Tarih: ${new Date().toLocaleString('tr-TR')}\n`,
      ESC_POS.FEED_5_LINES,
      ESC_POS.CUT,
    ]);

    return this.sendToPrinter(printer, content);
  }
}
