import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService, DetailedReport, HourlyBreakdown, DailyBreakdown, CategorySales, WaiterPerformance, PaymentMethodBreakdown } from './reports.service';
import { ReportFilterDto } from './dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Get daily summary report
   * GET /api/reports/daily
   */
  @Get('daily')
  async getDailyReport(@Query() filter: ReportFilterDto) {
    return this.reportsService.getDailyReport(filter.startDate, filter.endDate);
  }

  /**
   * Get product sales report
   * GET /api/reports/products
   */
  @Get('products')
  async getProductSalesReport(@Query() filter: ReportFilterDto) {
    const limit = filter.limit ? parseInt(filter.limit) : undefined;
    return this.reportsService.getProductSalesReport(filter.startDate, filter.endDate, limit);
  }

  /**
   * Get hourly breakdown
   * GET /api/reports/hourly
   */
  @Get('hourly')
  async getHourlyBreakdown(@Query() filter: ReportFilterDto): Promise<HourlyBreakdown[]> {
    return this.reportsService.getHourlyBreakdown(filter.startDate, filter.endDate);
  }

  /**
   * Get daily breakdown for date range
   * GET /api/reports/daily-breakdown
   */
  @Get('daily-breakdown')
  async getDailyBreakdown(@Query() filter: ReportFilterDto): Promise<DailyBreakdown[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.reportsService.getDailyBreakdown(
      filter.startDate || today,
      filter.endDate || today
    );
  }

  /**
   * Get category sales breakdown
   * GET /api/reports/categories
   */
  @Get('categories')
  async getCategorySales(@Query() filter: ReportFilterDto): Promise<CategorySales[]> {
    return this.reportsService.getCategorySales(filter.startDate, filter.endDate);
  }

  /**
   * Get waiter/user performance
   * GET /api/reports/waiters
   */
  @Get('waiters')
  async getWaiterPerformance(@Query() filter: ReportFilterDto): Promise<WaiterPerformance[]> {
    return this.reportsService.getWaiterPerformance(filter.startDate, filter.endDate);
  }

  /**
   * Get payment method breakdown
   * GET /api/reports/payments
   */
  @Get('payments')
  async getPaymentMethodBreakdown(@Query() filter: ReportFilterDto): Promise<PaymentMethodBreakdown[]> {
    return this.reportsService.getPaymentMethodBreakdown(filter.startDate, filter.endDate);
  }

  /**
   * Get comprehensive detailed report
   * GET /api/reports/detailed
   */
  @Get('detailed')
  async getDetailedReport(@Query() filter: ReportFilterDto): Promise<DetailedReport> {
    const today = new Date().toISOString().split('T')[0];
    return this.reportsService.getDetailedReport(
      filter.startDate || today,
      filter.endDate || today,
      {
        categoryId: filter.categoryId,
        productId: filter.productId,
        userId: filter.userId,
        paymentMethod: filter.paymentMethod,
      }
    );
  }
}
