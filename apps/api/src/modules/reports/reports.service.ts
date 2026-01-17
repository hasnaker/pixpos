import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { Payment } from '../../entities/payment.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { User } from '../../entities/user.entity';
import { Product } from '../../entities/product.entity';
import { Category } from '../../entities/category.entity';

export interface DailyReport {
  date: string;
  totalSales: number;
  orderCount: number;
  averageOrderValue: number;
  paymentBreakdown: { cash: number; card: number };
}

export interface ProductSalesReport {
  productId: string;
  productName: string;
  categoryName: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface HourlyBreakdown {
  hour: number;
  sales: number;
  orderCount: number;
}

export interface DailyBreakdown {
  date: string;
  revenue: number;
  orderCount: number;
  averageTicket: number;
}

export interface CategorySales {
  categoryId: string;
  categoryName: string;
  productCount: number;
  totalQuantity: number;
  totalRevenue: number;
  percentage: number;
}

export interface WaiterPerformance {
  userId: string;
  userName: string;
  orderCount: number;
  totalRevenue: number;
  averageTicket: number;
  itemCount: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  total: number;
  percentage: number;
}

export interface DetailedReport {
  summary: {
    totalRevenue: number;
    orderCount: number;
    averageTicket: number;
    cashTotal: number;
    cardTotal: number;
    itemsSold: number;
    cancelledOrders: number;
    cancelledAmount: number;
  };
  topProducts: ProductSalesReport[];
  bottomProducts: ProductSalesReport[];
  hourlyBreakdown: HourlyBreakdown[];
  dailyBreakdown: DailyBreakdown[];
  categorySales: CategorySales[];
  waiterPerformance: WaiterPerformance[];
  paymentMethods: PaymentMethodBreakdown[];
  peakHour: { hour: number; sales: number; orderCount: number };
  comparison?: {
    previousPeriod: { revenue: number; orderCount: number };
    revenueChange: number;
    orderCountChange: number;
  };
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Get daily report with total sales, order count, and payment breakdown
   */
  async getDailyReport(startDate?: string, endDate?: string): Promise<DailyReport> {
    const dateFilter = this.buildDateFilter(startDate, endDate);
    
    const ordersQuery = this.orderRepository
      .createQueryBuilder('order')
      .where('order.status = :status', { status: 'paid' });

    if (dateFilter.start) {
      ordersQuery.andWhere('order.closedAt >= :start', { start: dateFilter.start });
    }
    if (dateFilter.end) {
      ordersQuery.andWhere('order.closedAt <= :end', { end: dateFilter.end });
    }

    const orders = await ordersQuery.getMany();
    
    const totalSales = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const orderCount = orders.length;
    const averageOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

    const paymentsQuery = this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoin('payment.order', 'order')
      .where('order.status = :status', { status: 'paid' });

    if (dateFilter.start) {
      paymentsQuery.andWhere('payment.createdAt >= :start', { start: dateFilter.start });
    }
    if (dateFilter.end) {
      paymentsQuery.andWhere('payment.createdAt <= :end', { end: dateFilter.end });
    }

    const payments = await paymentsQuery.getMany();

    const paymentBreakdown = {
      cash: payments.filter(p => p.paymentMethod === 'cash').reduce((sum, p) => sum + Number(p.amount), 0),
      card: payments.filter(p => p.paymentMethod === 'card').reduce((sum, p) => sum + Number(p.amount), 0),
    };

    return {
      date: startDate || new Date().toISOString().split('T')[0],
      totalSales,
      orderCount,
      averageOrderValue,
      paymentBreakdown,
    };
  }

  /**
   * Get product sales report
   */
  async getProductSalesReport(startDate?: string, endDate?: string, limit?: number): Promise<ProductSalesReport[]> {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const queryBuilder = this.orderItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.order', 'order')
      .leftJoin('item.product', 'product')
      .leftJoin('product.category', 'category')
      .select('item.productId', 'productId')
      .addSelect('item.productName', 'productName')
      .addSelect('COALESCE(category.name, \'Kategorisiz\')', 'categoryName')
      .addSelect('SUM(item.quantity)', 'quantitySold')
      .addSelect('SUM(item.totalPrice)', 'totalRevenue')
      .where('order.status = :status', { status: 'paid' })
      .groupBy('item.productId')
      .addGroupBy('item.productName')
      .addGroupBy('category.name')
      .orderBy('SUM(item.quantity)', 'DESC');

    if (dateFilter.start) {
      queryBuilder.andWhere('order.closedAt >= :start', { start: dateFilter.start });
    }
    if (dateFilter.end) {
      queryBuilder.andWhere('order.closedAt <= :end', { end: dateFilter.end });
    }
    if (limit) {
      queryBuilder.limit(limit);
    }

    const results = await queryBuilder.getRawMany();

    return results.map(row => ({
      productId: row.productId,
      productName: row.productName,
      categoryName: row.categoryName,
      quantitySold: parseInt(row.quantitySold, 10) || 0,
      totalRevenue: parseFloat(row.totalRevenue) || 0,
    }));
  }

  /**
   * Get hourly breakdown
   */
  async getHourlyBreakdown(startDate?: string, endDate?: string): Promise<HourlyBreakdown[]> {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .select('EXTRACT(HOUR FROM order.createdAt)', 'hour')
      .addSelect('SUM(order.totalAmount)', 'sales')
      .addSelect('COUNT(*)', 'orderCount')
      .where('order.status = :status', { status: 'paid' })
      .groupBy('EXTRACT(HOUR FROM order.createdAt)')
      .orderBy('hour', 'ASC');

    if (dateFilter.start) {
      queryBuilder.andWhere('order.closedAt >= :start', { start: dateFilter.start });
    }
    if (dateFilter.end) {
      queryBuilder.andWhere('order.closedAt <= :end', { end: dateFilter.end });
    }

    const results = await queryBuilder.getRawMany();

    // Fill in missing hours with zeros
    const hourlyData: HourlyBreakdown[] = [];
    for (let h = 0; h < 24; h++) {
      const found = results.find(r => parseInt(r.hour) === h);
      hourlyData.push({
        hour: h,
        sales: found ? parseFloat(found.sales) || 0 : 0,
        orderCount: found ? parseInt(found.orderCount) || 0 : 0,
      });
    }

    return hourlyData;
  }

  /**
   * Get daily breakdown for a date range
   */
  async getDailyBreakdown(startDate: string, endDate: string): Promise<DailyBreakdown[]> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .select('DATE(order.closedAt)', 'date')
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .addSelect('COUNT(*)', 'orderCount')
      .where('order.status = :status', { status: 'paid' })
      .andWhere('order.closedAt >= :start', { start: new Date(startDate) })
      .andWhere('order.closedAt <= :end', { end: new Date(endDate + 'T23:59:59') })
      .groupBy('DATE(order.closedAt)')
      .orderBy('date', 'ASC');

    const results = await queryBuilder.getRawMany();

    return results.map(row => ({
      date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date,
      revenue: parseFloat(row.revenue) || 0,
      orderCount: parseInt(row.orderCount) || 0,
      averageTicket: parseInt(row.orderCount) > 0 ? parseFloat(row.revenue) / parseInt(row.orderCount) : 0,
    }));
  }

  /**
   * Get category sales breakdown
   */
  async getCategorySales(startDate?: string, endDate?: string): Promise<CategorySales[]> {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const queryBuilder = this.orderItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.order', 'order')
      .leftJoin('item.product', 'product')
      .leftJoin('product.category', 'category')
      .select('category.id', 'categoryId')
      .addSelect('COALESCE(category.name, \'Kategorisiz\')', 'categoryName')
      .addSelect('COUNT(DISTINCT item.productId)', 'productCount')
      .addSelect('SUM(item.quantity)', 'totalQuantity')
      .addSelect('SUM(item.totalPrice)', 'totalRevenue')
      .where('order.status = :status', { status: 'paid' })
      .groupBy('category.id')
      .addGroupBy('category.name')
      .orderBy('SUM(item.totalPrice)', 'DESC');

    if (dateFilter.start) {
      queryBuilder.andWhere('order.closedAt >= :start', { start: dateFilter.start });
    }
    if (dateFilter.end) {
      queryBuilder.andWhere('order.closedAt <= :end', { end: dateFilter.end });
    }

    const results = await queryBuilder.getRawMany();
    const totalRevenue = results.reduce((sum, r) => sum + (parseFloat(r.totalRevenue) || 0), 0);

    return results.map(row => ({
      categoryId: row.categoryId || 'uncategorized',
      categoryName: row.categoryName,
      productCount: parseInt(row.productCount) || 0,
      totalQuantity: parseInt(row.totalQuantity) || 0,
      totalRevenue: parseFloat(row.totalRevenue) || 0,
      percentage: totalRevenue > 0 ? ((parseFloat(row.totalRevenue) || 0) / totalRevenue) * 100 : 0,
    }));
  }

  /**
   * Get waiter/user performance
   */
  async getWaiterPerformance(startDate?: string, endDate?: string): Promise<WaiterPerformance[]> {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.user', 'user')
      .leftJoin('order.items', 'item')
      .select('order.userId', 'userId')
      .addSelect('COALESCE(user.name, \'Bilinmeyen\')', 'userName')
      .addSelect('COUNT(DISTINCT order.id)', 'orderCount')
      .addSelect('SUM(order.totalAmount)', 'totalRevenue')
      .addSelect('SUM(item.quantity)', 'itemCount')
      .where('order.status = :status', { status: 'paid' })
      .groupBy('order.userId')
      .addGroupBy('user.name')
      .orderBy('SUM(order.totalAmount)', 'DESC');

    if (dateFilter.start) {
      queryBuilder.andWhere('order.closedAt >= :start', { start: dateFilter.start });
    }
    if (dateFilter.end) {
      queryBuilder.andWhere('order.closedAt <= :end', { end: dateFilter.end });
    }

    const results = await queryBuilder.getRawMany();

    return results.map(row => ({
      userId: row.userId || 'unknown',
      userName: row.userName,
      orderCount: parseInt(row.orderCount) || 0,
      totalRevenue: parseFloat(row.totalRevenue) || 0,
      averageTicket: parseInt(row.orderCount) > 0 ? parseFloat(row.totalRevenue) / parseInt(row.orderCount) : 0,
      itemCount: parseInt(row.itemCount) || 0,
    }));
  }

  /**
   * Get payment method breakdown
   */
  async getPaymentMethodBreakdown(startDate?: string, endDate?: string): Promise<PaymentMethodBreakdown[]> {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoin('payment.order', 'order')
      .select('payment.paymentMethod', 'method')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(payment.amount)', 'total')
      .where('order.status = :status', { status: 'paid' })
      .groupBy('payment.paymentMethod');

    if (dateFilter.start) {
      queryBuilder.andWhere('payment.createdAt >= :start', { start: dateFilter.start });
    }
    if (dateFilter.end) {
      queryBuilder.andWhere('payment.createdAt <= :end', { end: dateFilter.end });
    }

    const results = await queryBuilder.getRawMany();
    const totalAmount = results.reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0);

    return results.map(row => ({
      method: row.method,
      count: parseInt(row.count) || 0,
      total: parseFloat(row.total) || 0,
      percentage: totalAmount > 0 ? ((parseFloat(row.total) || 0) / totalAmount) * 100 : 0,
    }));
  }

  /**
   * Get comprehensive detailed report
   */
  async getDetailedReport(
    startDate: string,
    endDate: string,
    filters?: {
      categoryId?: string;
      productId?: string;
      userId?: string;
      paymentMethod?: string;
    }
  ): Promise<DetailedReport> {
    // Get all data in parallel
    const [
      dailyReport,
      topProducts,
      hourlyBreakdown,
      dailyBreakdown,
      categorySales,
      waiterPerformance,
      paymentMethods,
    ] = await Promise.all([
      this.getDailyReport(startDate, endDate),
      this.getProductSalesReport(startDate, endDate, 20),
      this.getHourlyBreakdown(startDate, endDate),
      this.getDailyBreakdown(startDate, endDate),
      this.getCategorySales(startDate, endDate),
      this.getWaiterPerformance(startDate, endDate),
      this.getPaymentMethodBreakdown(startDate, endDate),
    ]);

    // Get bottom products (least sold)
    const allProducts = await this.getProductSalesReport(startDate, endDate);
    const bottomProducts = [...allProducts].sort((a, b) => a.quantitySold - b.quantitySold).slice(0, 10);

    // Calculate items sold
    const itemsSold = topProducts.reduce((sum, p) => sum + p.quantitySold, 0);

    // Get cancelled orders
    const cancelledQuery = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(order.totalAmount), 0)', 'amount')
      .where('order.status = :status', { status: 'cancelled' })
      .andWhere('order.createdAt >= :start', { start: new Date(startDate) })
      .andWhere('order.createdAt <= :end', { end: new Date(endDate + 'T23:59:59') })
      .getRawOne();

    // Find peak hour
    const peakHour = hourlyBreakdown.reduce((max, h) => h.sales > max.sales ? h : max, hourlyBreakdown[0] || { hour: 0, sales: 0, orderCount: 0 });

    // Calculate previous period for comparison
    const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevStartDate.getDate() - daysDiff + 1);

    const prevReport = await this.getDailyReport(
      prevStartDate.toISOString().split('T')[0],
      prevEndDate.toISOString().split('T')[0]
    );

    const revenueChange = prevReport.totalSales > 0 
      ? ((dailyReport.totalSales - prevReport.totalSales) / prevReport.totalSales) * 100 
      : 0;
    const orderCountChange = prevReport.orderCount > 0 
      ? ((dailyReport.orderCount - prevReport.orderCount) / prevReport.orderCount) * 100 
      : 0;

    return {
      summary: {
        totalRevenue: dailyReport.totalSales,
        orderCount: dailyReport.orderCount,
        averageTicket: dailyReport.averageOrderValue,
        cashTotal: dailyReport.paymentBreakdown.cash,
        cardTotal: dailyReport.paymentBreakdown.card,
        itemsSold,
        cancelledOrders: parseInt(cancelledQuery?.count) || 0,
        cancelledAmount: parseFloat(cancelledQuery?.amount) || 0,
      },
      topProducts,
      bottomProducts,
      hourlyBreakdown,
      dailyBreakdown,
      categorySales,
      waiterPerformance,
      paymentMethods,
      peakHour,
      comparison: {
        previousPeriod: {
          revenue: prevReport.totalSales,
          orderCount: prevReport.orderCount,
        },
        revenueChange,
        orderCountChange,
      },
    };
  }

  private buildDateFilter(startDate?: string, endDate?: string): { start?: Date; end?: Date } {
    const filter: { start?: Date; end?: Date } = {};

    if (startDate) {
      filter.start = new Date(startDate);
      filter.start.setHours(0, 0, 0, 0);
    }

    if (endDate) {
      filter.end = new Date(endDate);
      filter.end.setHours(23, 59, 59, 999);
    }

    return filter;
  }
}
