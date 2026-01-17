export interface DailyReport {
  date: string;
  totalSales: number;
  orderCount: number;
  paymentBreakdown: {
    cash: number;
    card: number;
  };
}

export interface ProductSalesReport {
  productId: string;
  productName: string;
  categoryName: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
}
