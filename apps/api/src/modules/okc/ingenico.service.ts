import { Injectable, Logger } from '@nestjs/common';
import * as net from 'net';

/**
 * Ingenico ÖKC (Ödeme Kaydedici Cihaz) Entegrasyonu
 * 
 * Desteklenen Modeller:
 * - Ingenico Move 5000
 * - Ingenico Desk 5000
 * - Ingenico iWL serisi
 * 
 * Bağlantı: TCP/IP (Port 9001 veya 20001)
 * Protokol: ECR (Electronic Cash Register)
 */

export interface OkcConfig {
  ip: string;
  port: number;
  timeout: number;
  terminalId?: string;
}

export interface SaleRequest {
  amount: number;        // Kuruş cinsinden (örn: 10000 = 100.00 TL)
  orderId: string;       // Sipariş numarası
  description?: string;  // İşlem açıklaması
  paymentType?: 'cash' | 'card';  // Ödeme tipi (nakit veya kart)
}

export interface SaleResponse {
  success: boolean;
  transactionId?: string;
  authCode?: string;
  cardNumber?: string;   // Maskelenmiş kart numarası
  cardType?: string;     // VISA, MASTERCARD, TROY vs.
  installment?: number;  // Taksit sayısı
  amount: number;
  errorCode?: string;
  errorMessage?: string;
  rawResponse?: string;
}

export interface RefundRequest {
  amount: number;
  originalTransactionId: string;
  orderId: string;
}

export interface VoidRequest {
  transactionId: string;
  orderId: string;
}

@Injectable()
export class IngenicoService {
  private readonly logger = new Logger(IngenicoService.name);
  private config: OkcConfig = {
    ip: '192.168.1.100',
    port: 20001,
    timeout: 60000, // 60 saniye (kart okutma için yeterli süre)
  };

  /**
   * ÖKC yapılandırmasını güncelle
   */
  setConfig(config: Partial<OkcConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.log(`ÖKC config updated: ${this.config.ip}:${this.config.port}`);
  }

  /**
   * ÖKC yapılandırmasını getir
   */
  getConfig(): OkcConfig {
    return { ...this.config };
  }

  /**
   * ÖKC bağlantı testi
   */
  async testConnection(): Promise<{ success: boolean; responseTime?: number; error?: string }> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const socket = new net.Socket();

      socket.setTimeout(5000);

      socket.on('connect', () => {
        const responseTime = Date.now() - startTime;
        socket.destroy();
        resolve({ success: true, responseTime });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ success: false, error: 'Bağlantı zaman aşımı' });
      });

      socket.on('error', (err) => {
        socket.destroy();
        resolve({ success: false, error: err.message });
      });

      socket.connect(this.config.port, this.config.ip);
    });
  }

  /**
   * Satış işlemi
   * POS'tan ödeme alındığında bu metod çağrılır
   */
  async sale(request: SaleRequest): Promise<SaleResponse> {
    const paymentTypeLabel = request.paymentType === 'cash' ? 'NAKİT' : 'KART';
    this.logger.log(`Sale request [${paymentTypeLabel}]: ${request.amount / 100} TL, Order: ${request.orderId}`);

    try {
      // ECR protokolü ile satış mesajı oluştur
      const message = this.buildSaleMessage(request);
      
      // ÖKC'ye gönder ve yanıt al
      const response = await this.sendToOkc(message);
      
      // Yanıtı parse et
      return this.parseSaleResponse(response);
    } catch (error) {
      this.logger.error(`Sale error: ${error}`);
      return {
        success: false,
        amount: request.amount,
        errorCode: 'CONNECTION_ERROR',
        errorMessage: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  }

  /**
   * İade işlemi
   */
  async refund(request: RefundRequest): Promise<SaleResponse> {
    this.logger.log(`Refund request: ${request.amount} kuruş, Original TX: ${request.originalTransactionId}`);

    try {
      const message = this.buildRefundMessage(request);
      const response = await this.sendToOkc(message);
      return this.parseSaleResponse(response);
    } catch (error) {
      this.logger.error(`Refund error: ${error}`);
      return {
        success: false,
        amount: request.amount,
        errorCode: 'CONNECTION_ERROR',
        errorMessage: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  }

  /**
   * İptal işlemi
   */
  async void(request: VoidRequest): Promise<SaleResponse> {
    this.logger.log(`Void request: TX: ${request.transactionId}`);

    try {
      const message = this.buildVoidMessage(request);
      const response = await this.sendToOkc(message);
      return this.parseSaleResponse(response);
    } catch (error) {
      this.logger.error(`Void error: ${error}`);
      return {
        success: false,
        amount: 0,
        errorCode: 'CONNECTION_ERROR',
        errorMessage: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  }

  /**
   * Gün sonu raporu
   */
  async endOfDay(): Promise<{ success: boolean; report?: string; error?: string }> {
    this.logger.log('End of day request');

    try {
      const message = this.buildEndOfDayMessage();
      const response = await this.sendToOkc(message);
      return { success: true, report: response };
    } catch (error) {
      this.logger.error(`End of day error: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  }

  /**
   * ÖKC'ye mesaj gönder
   */
  private sendToOkc(message: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      let responseData = '';

      socket.setTimeout(this.config.timeout);

      socket.on('connect', () => {
        this.logger.debug(`Connected to ÖKC, sending: ${message}`);
        socket.write(message);
      });

      socket.on('data', (data) => {
        responseData += data.toString();
        // Yanıt tamamlandıysa bağlantıyı kapat
        if (this.isResponseComplete(responseData)) {
          socket.destroy();
          resolve(responseData);
        }
      });

      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('ÖKC yanıt vermedi (zaman aşımı)'));
      });

      socket.on('error', (err) => {
        socket.destroy();
        reject(new Error(`ÖKC bağlantı hatası: ${err.message}`));
      });

      socket.on('close', () => {
        if (responseData) {
          resolve(responseData);
        }
      });

      socket.connect(this.config.port, this.config.ip);
    });
  }

  /**
   * Satış mesajı oluştur (ECR protokolü)
   * NOT: Gerçek protokol Ingenico'nun ECR dokümantasyonuna göre ayarlanmalı
   */
  private buildSaleMessage(request: SaleRequest): string {
    // Nakit için 0200, Kart için 0200 (aynı message type, farklı field)
    // Bazı ÖKC'lerde nakit için 0210 kullanılır
    const messageType = request.paymentType === 'cash' ? '0210' : '0200';
    
    const fields = {
      messageType,
      amount: request.amount.toString().padStart(12, '0'),
      orderId: request.orderId.padEnd(20, ' '),
      terminalId: (this.config.terminalId || '00000001').padStart(8, '0'),
      paymentType: request.paymentType === 'cash' ? '01' : '02', // 01=Nakit, 02=Kart
    };

    // STX + Data + ETX + LRC formatı
    const data = `${fields.messageType}${fields.amount}${fields.orderId}${fields.terminalId}${fields.paymentType}`;
    return `\x02${data}\x03`;
  }

  /**
   * İade mesajı oluştur
   */
  private buildRefundMessage(request: RefundRequest): string {
    const fields = {
      messageType: '0220',           // Refund
      amount: request.amount.toString().padStart(12, '0'),
      orderId: request.orderId.padEnd(20, ' '),
      originalTxId: request.originalTransactionId.padEnd(20, ' '),
    };

    const data = `${fields.messageType}${fields.amount}${fields.orderId}${fields.originalTxId}`;
    return `\x02${data}\x03`;
  }

  /**
   * İptal mesajı oluştur
   */
  private buildVoidMessage(request: VoidRequest): string {
    const fields = {
      messageType: '0400',           // Void
      transactionId: request.transactionId.padEnd(20, ' '),
      orderId: request.orderId.padEnd(20, ' '),
    };

    const data = `${fields.messageType}${fields.transactionId}${fields.orderId}`;
    return `\x02${data}\x03`;
  }

  /**
   * Gün sonu mesajı oluştur
   */
  private buildEndOfDayMessage(): string {
    return `\x020500\x03`; // End of day message type
  }

  /**
   * Yanıt tamamlandı mı kontrol et
   */
  private isResponseComplete(response: string): boolean {
    // ETX karakteri ile biten yanıt tamamlanmış demektir
    return response.includes('\x03');
  }

  /**
   * Satış yanıtını parse et
   */
  private parseSaleResponse(rawResponse: string): SaleResponse {
    this.logger.debug(`Parsing response: ${rawResponse}`);

    try {
      // STX ve ETX karakterlerini temizle
      const data = rawResponse.replace(/[\x02\x03]/g, '');

      // Basit parse - gerçek implementasyonda Ingenico formatına göre
      const responseCode = data.substring(0, 2);
      const success = responseCode === '00';

      if (success) {
        return {
          success: true,
          transactionId: data.substring(2, 22).trim(),
          authCode: data.substring(22, 28).trim(),
          cardNumber: data.substring(28, 44).trim(),
          cardType: this.detectCardType(data.substring(28, 30)),
          amount: parseInt(data.substring(44, 56)) || 0,
          rawResponse,
        };
      } else {
        return {
          success: false,
          amount: 0,
          errorCode: responseCode,
          errorMessage: this.getErrorMessage(responseCode),
          rawResponse,
        };
      }
    } catch (error) {
      return {
        success: false,
        amount: 0,
        errorCode: 'PARSE_ERROR',
        errorMessage: 'Yanıt parse edilemedi',
        rawResponse,
      };
    }
  }

  /**
   * Kart tipini tespit et
   */
  private detectCardType(prefix: string): string {
    if (prefix.startsWith('4')) return 'VISA';
    if (prefix.startsWith('5')) return 'MASTERCARD';
    if (prefix.startsWith('9')) return 'TROY';
    if (prefix.startsWith('3')) return 'AMEX';
    return 'UNKNOWN';
  }

  /**
   * Hata mesajını getir
   */
  private getErrorMessage(code: string): string {
    const errors: Record<string, string> = {
      '01': 'Kart sahibine danışın',
      '03': 'Geçersiz işyeri',
      '04': 'Karta el koyun',
      '05': 'İşlem onaylanmadı',
      '12': 'Geçersiz işlem',
      '13': 'Geçersiz tutar',
      '14': 'Geçersiz kart numarası',
      '30': 'Format hatası',
      '41': 'Kayıp kart',
      '43': 'Çalıntı kart',
      '51': 'Yetersiz bakiye',
      '54': 'Kartın süresi dolmuş',
      '55': 'Hatalı PIN',
      '57': 'İşlem izni yok',
      '58': 'İşlem izni yok',
      '61': 'Limit aşıldı',
      '62': 'Kısıtlı kart',
      '65': 'Limit aşıldı',
      '75': 'PIN deneme sayısı aşıldı',
      '91': 'Banka yanıt vermiyor',
      '96': 'Sistem hatası',
    };
    return errors[code] || `Bilinmeyen hata (${code})`;
  }
}
