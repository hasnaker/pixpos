import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { OkcService } from './okc.service';
import { OkcConfigDto, SaleRequestDto, RefundRequestDto, VoidRequestDto } from './dto/okc.dto';

@Controller('okc')
export class OkcController {
  constructor(private readonly okcService: OkcService) {}

  /**
   * ÖKC yapılandırmasını getir
   * GET /api/okc/config
   */
  @Get('config')
  getConfig() {
    return this.okcService.getConfig();
  }

  /**
   * ÖKC yapılandırmasını güncelle
   * PUT /api/okc/config
   */
  @Put('config')
  setConfig(@Body() config: OkcConfigDto) {
    return this.okcService.setConfig(config);
  }

  /**
   * Bağlantı testi
   * POST /api/okc/test
   */
  @Post('test')
  async testConnection() {
    return this.okcService.testConnection();
  }

  /**
   * Satış işlemi
   * POST /api/okc/sale
   */
  @Post('sale')
  async sale(@Body() request: SaleRequestDto) {
    return this.okcService.sale(request);
  }

  /**
   * İade işlemi
   * POST /api/okc/refund
   */
  @Post('refund')
  async refund(@Body() request: RefundRequestDto) {
    return this.okcService.refund(request);
  }

  /**
   * İptal işlemi
   * POST /api/okc/void
   */
  @Post('void')
  async voidTransaction(@Body() request: VoidRequestDto) {
    return this.okcService.void(request);
  }

  /**
   * Gün sonu
   * POST /api/okc/end-of-day
   */
  @Post('end-of-day')
  async endOfDay() {
    return this.okcService.endOfDay();
  }

  /**
   * Son işlemleri getir
   * GET /api/okc/transactions
   */
  @Get('transactions')
  getTransactions(@Query('limit') limit?: string) {
    return this.okcService.getRecentTransactions(limit ? parseInt(limit) : 50);
  }

  /**
   * Sipariş için işlemleri getir
   * GET /api/okc/transactions/order/:orderId
   */
  @Get('transactions/order/:orderId')
  getTransactionsByOrder(@Param('orderId') orderId: string) {
    return this.okcService.getTransactionsByOrder(orderId);
  }
}
