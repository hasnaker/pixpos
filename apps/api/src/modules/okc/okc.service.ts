import { Injectable, Logger } from '@nestjs/common';
import { IngenicoService, OkcConfig, SaleRequest, SaleResponse, RefundRequest, VoidRequest } from './ingenico.service';

export interface OkcTransaction {
  id: string;
  type: 'sale' | 'refund' | 'void';
  amount: number;
  orderId: string;
  transactionId?: string;
  authCode?: string;
  cardNumber?: string;
  cardType?: string;
  success: boolean;
  errorMessage?: string;
  createdAt: Date;
}

@Injectable()
export class OkcService {
  private readonly logger = new Logger(OkcService.name);
  private transactions: OkcTransaction[] = []; // In-memory for now, should be DB

  constructor(private readonly ingenicoService: IngenicoService) {}

  /**
   * ÖKC yapılandırmasını getir
   */
  getConfig(): OkcConfig {
    return this.ingenicoService.getConfig();
  }

  /**
   * ÖKC yapılandırmasını güncelle
   */
  setConfig(config: Partial<OkcConfig>): OkcConfig {
    this.ingenicoService.setConfig(config);
    return this.ingenicoService.getConfig();
  }

  /**
   * Bağlantı testi
   */
  async testConnection(): Promise<{ success: boolean; responseTime?: number; error?: string }> {
    return this.ingenicoService.testConnection();
  }

  /**
   * Satış işlemi
   */
  async sale(request: SaleRequest): Promise<SaleResponse> {
    this.logger.log(`Processing sale: ${request.amount / 100} TL for order ${request.orderId}`);
    
    const response = await this.ingenicoService.sale(request);
    
    // İşlemi kaydet
    this.transactions.push({
      id: `TX-${Date.now()}`,
      type: 'sale',
      amount: request.amount,
      orderId: request.orderId,
      transactionId: response.transactionId,
      authCode: response.authCode,
      cardNumber: response.cardNumber,
      cardType: response.cardType,
      success: response.success,
      errorMessage: response.errorMessage,
      createdAt: new Date(),
    });

    return response;
  }

  /**
   * İade işlemi
   */
  async refund(request: RefundRequest): Promise<SaleResponse> {
    this.logger.log(`Processing refund: ${request.amount / 100} TL for TX ${request.originalTransactionId}`);
    
    const response = await this.ingenicoService.refund(request);
    
    this.transactions.push({
      id: `TX-${Date.now()}`,
      type: 'refund',
      amount: request.amount,
      orderId: request.orderId,
      transactionId: response.transactionId,
      success: response.success,
      errorMessage: response.errorMessage,
      createdAt: new Date(),
    });

    return response;
  }

  /**
   * İptal işlemi
   */
  async void(request: VoidRequest): Promise<SaleResponse> {
    this.logger.log(`Processing void for TX ${request.transactionId}`);
    
    const response = await this.ingenicoService.void(request);
    
    this.transactions.push({
      id: `TX-${Date.now()}`,
      type: 'void',
      amount: 0,
      orderId: request.orderId,
      transactionId: request.transactionId,
      success: response.success,
      errorMessage: response.errorMessage,
      createdAt: new Date(),
    });

    return response;
  }

  /**
   * Gün sonu
   */
  async endOfDay(): Promise<{ success: boolean; report?: string; error?: string }> {
    return this.ingenicoService.endOfDay();
  }

  /**
   * Son işlemleri getir
   */
  getRecentTransactions(limit = 50): OkcTransaction[] {
    return this.transactions.slice(-limit).reverse();
  }

  /**
   * Sipariş için işlemleri getir
   */
  getTransactionsByOrder(orderId: string): OkcTransaction[] {
    return this.transactions.filter(t => t.orderId === orderId);
  }
}
