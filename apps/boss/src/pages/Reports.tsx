import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  CreditCard,
  Banknote,
  Globe,
  Package,
  BarChart3,
  ChevronDown,
  X,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';
import {
  reportsApi,
  categoriesApi,
  productsApi,
  type ReportFilters,
  type HourlyReport,
  type ProductReport,
  type DailyBreakdownItem,
} from '@/services/api';

// Date preset options
const datePresets = [
  { value: 'today', label: 'Bugün' },
  { value: 'yesterday', label: 'Dün' },
  { value: 'last7days', label: 'Son 7 Gün' },
  { value: 'last30days', label: 'Son 30 Gün' },
  { value: 'thisMonth', label: 'Bu Ay' },
  { value: 'lastMonth', label: 'Geçen Ay' },
  { value: 'custom', label: 'Özel Tarih' },
];

const paymentMethods = [
  { value: 'all', label: 'Tüm Ödemeler' },
  { value: 'cash', label: 'Nakit' },
  { value: 'card', label: 'Kredi Kartı' },
  { value: 'online', label: 'Online' },
];

// Helper function to get date range from preset
function getDateRangeFromPreset(preset: string): { start: string; end: string } {
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  
  switch (preset) {
    case 'today':
      return { start: formatDate(today), end: formatDate(today) };
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: formatDate(yesterday), end: formatDate(yesterday) };
    }
    case 'last7days': {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 6);
      return { start: formatDate(weekAgo), end: formatDate(today) };
    }
    case 'last30days': {
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 29);
      return { start: formatDate(monthAgo), end: formatDate(today) };
    }
    case 'thisMonth': {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: formatDate(firstDay), end: formatDate(today) };
    }
    case 'lastMonth': {
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
      return { start: formatDate(firstDay), end: formatDate(lastDay) };
    }
    default:
      return { start: formatDate(today), end: formatDate(today) };
  }
}

// Hourly chart component
function HourlyChart({ data }: { data: HourlyReport[] }) {
  const maxSales = Math.max(...data.map(d => d.sales), 1);
  
  return (
    <div className="h-52 flex items-end gap-1 pt-4">
      {data.map((item) => {
        const height = (item.sales / maxSales) * 100;
        return (
          <div key={item.hour} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full">
              <div 
                className="w-full bg-gradient-to-t from-[#0A84FF] to-[#0A84FF]/60 rounded-t transition-all duration-300 group-hover:from-[#0A84FF] group-hover:to-[#0A84FF]/80 min-h-[4px]"
                style={{ height: `${Math.max(height, 2)}%`, minHeight: '4px' }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white/10 backdrop-blur-xl rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                <div className="font-medium">₺{item.sales.toLocaleString('tr-TR')}</div>
                <div className="text-white/60">{item.orderCount} sipariş</div>
              </div>
            </div>
            <span className="text-[10px] text-white/40">
              {item.hour.toString().padStart(2, '0')}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Daily breakdown chart component
function DailyChart({ data }: { data: DailyBreakdownItem[] }) {
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };
  
  return (
    <div className="h-52 flex items-end gap-2 pt-4">
      {data.map((item) => {
        const height = (item.revenue / maxRevenue) * 100;
        return (
          <div key={item.date} className="flex-1 flex flex-col items-center gap-1 group min-w-[40px]">
            <div className="relative w-full">
              <div 
                className="w-full bg-gradient-to-t from-[#30D158] to-[#30D158]/60 rounded-t transition-all duration-300 group-hover:from-[#30D158] group-hover:to-[#30D158]/80 min-h-[4px]"
                style={{ height: `${Math.max(height, 2)}%`, minHeight: '4px' }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white/10 backdrop-blur-xl rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                <div className="font-medium">₺{item.revenue.toLocaleString('tr-TR')}</div>
                <div className="text-white/60">{item.orderCount} sipariş</div>
              </div>
            </div>
            <span className="text-[10px] text-white/40 truncate max-w-full">
              {formatDate(item.date)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Top products table component
function TopProductsTable({ data }: { data: ProductReport[] }) {
  const maxQuantity = Math.max(...data.map(d => d.quantity), 1);
  
  return (
    <div className="space-y-2">
      {data.map((product, index) => {
        const percentage = (product.quantity / maxQuantity) * 100;
        const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
        
        return (
          <div 
            key={product.productId} 
            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
          >
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                index < 3 ? 'text-black' : 'bg-white/10 text-white/60'
              }`}
              style={index < 3 ? { backgroundColor: medalColors[index] } : {}}
            >
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white truncate">{product.productName}</span>
                <span className="text-sm font-medium text-white ml-2">{product.quantity} adet</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#0A84FF] to-[#0A84FF]/60 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-[#30D158]">
                ₺{product.revenue.toLocaleString('tr-TR')}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Export functions
function exportToExcel(data: {
  summary: { totalRevenue: number; orderCount: number; averageTicket: number };
  topProducts: ProductReport[];
  dailyBreakdown: DailyBreakdownItem[];
}, dateRange: { start: string; end: string }) {
  // Create CSV content (Excel compatible)
  let csv = '\uFEFF'; // BOM for UTF-8
  
  // Summary section
  csv += 'RAPOR ÖZETİ\n';
  csv += `Tarih Aralığı;${dateRange.start} - ${dateRange.end}\n`;
  csv += `Toplam Ciro;₺${data.summary.totalRevenue.toLocaleString('tr-TR')}\n`;
  csv += `Sipariş Sayısı;${data.summary.orderCount}\n`;
  csv += `Ortalama Hesap;₺${data.summary.averageTicket.toLocaleString('tr-TR')}\n\n`;
  
  // Top products section
  csv += 'EN ÇOK SATAN ÜRÜNLER\n';
  csv += 'Sıra;Ürün;Adet;Gelir\n';
  data.topProducts.forEach((p, i) => {
    csv += `${i + 1};${p.productName};${p.quantity};₺${p.revenue.toLocaleString('tr-TR')}\n`;
  });
  csv += '\n';
  
  // Daily breakdown section
  csv += 'GÜNLÜK DAĞILIM\n';
  csv += 'Tarih;Ciro;Sipariş;Ortalama\n';
  data.dailyBreakdown.forEach(d => {
    csv += `${d.date};₺${d.revenue.toLocaleString('tr-TR')};${d.orderCount};₺${d.averageTicket.toLocaleString('tr-TR')}\n`;
  });
  
  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `rapor_${dateRange.start}_${dateRange.end}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function exportToPDF(data: {
  summary: { totalRevenue: number; orderCount: number; averageTicket: number };
  topProducts: ProductReport[];
  dailyBreakdown: DailyBreakdownItem[];
}, dateRange: { start: string; end: string }) {
  // Create a printable HTML document
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Satış Raporu - ${dateRange.start} / ${dateRange.end}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1a1a1a; }
        h1 { font-size: 24px; margin-bottom: 8px; }
        h2 { font-size: 18px; margin-top: 32px; margin-bottom: 16px; color: #333; }
        .subtitle { color: #666; margin-bottom: 32px; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
        .summary-card { background: #f5f5f7; padding: 20px; border-radius: 12px; }
        .summary-label { font-size: 12px; color: #666; margin-bottom: 4px; }
        .summary-value { font-size: 24px; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e5e5; }
        th { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; }
        .text-right { text-align: right; }
        .rank { width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px; }
        .rank-1 { background: #FFD700; }
        .rank-2 { background: #C0C0C0; }
        .rank-3 { background: #CD7F32; }
        .rank-other { background: #f0f0f0; color: #666; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>Satış Raporu</h1>
      <p class="subtitle">${dateRange.start} - ${dateRange.end}</p>
      
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">Toplam Ciro</div>
          <div class="summary-value">₺${data.summary.totalRevenue.toLocaleString('tr-TR')}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Sipariş Sayısı</div>
          <div class="summary-value">${data.summary.orderCount}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Ortalama Hesap</div>
          <div class="summary-value">₺${data.summary.averageTicket.toLocaleString('tr-TR')}</div>
        </div>
      </div>
      
      <h2>En Çok Satan Ürünler</h2>
      <table>
        <thead>
          <tr>
            <th>Sıra</th>
            <th>Ürün</th>
            <th class="text-right">Adet</th>
            <th class="text-right">Gelir</th>
          </tr>
        </thead>
        <tbody>
          ${data.topProducts.map((p, i) => `
            <tr>
              <td><span class="rank ${i < 3 ? `rank-${i + 1}` : 'rank-other'}">${i + 1}</span></td>
              <td>${p.productName}</td>
              <td class="text-right">${p.quantity}</td>
              <td class="text-right">₺${p.revenue.toLocaleString('tr-TR')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <h2>Günlük Dağılım</h2>
      <table>
        <thead>
          <tr>
            <th>Tarih</th>
            <th class="text-right">Ciro</th>
            <th class="text-right">Sipariş</th>
            <th class="text-right">Ortalama</th>
          </tr>
        </thead>
        <tbody>
          ${data.dailyBreakdown.map(d => `
            <tr>
              <td>${new Date(d.date).toLocaleDateString('tr-TR')}</td>
              <td class="text-right">₺${d.revenue.toLocaleString('tr-TR')}</td>
              <td class="text-right">${d.orderCount}</td>
              <td class="text-right">₺${d.averageTicket.toLocaleString('tr-TR')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <script>window.print();</script>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
}

// Main Reports component
export default function Reports() {
  // Filter state
  const [datePreset, setDatePreset] = useState('last7days');
  const [customDateRange, setCustomDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [timeRange, setTimeRange] = useState({ start: '', end: '' });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedWaiter, setSelectedWaiter] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'all' | 'cash' | 'card' | 'online'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Calculate actual date range
  const dateRange = useMemo(() => {
    if (datePreset === 'custom') {
      return customDateRange;
    }
    return getDateRangeFromPreset(datePreset);
  }, [datePreset, customDateRange]);

  // Build filters object
  const filters: ReportFilters = useMemo(() => ({
    startDate: dateRange.start,
    endDate: dateRange.end,
    startTime: timeRange.start || undefined,
    endTime: timeRange.end || undefined,
    categoryId: selectedCategory || undefined,
    productId: selectedProduct || undefined,
    waiterId: selectedWaiter || undefined,
    paymentMethod: selectedPaymentMethod,
  }), [dateRange, timeRange, selectedCategory, selectedProduct, selectedWaiter, selectedPaymentMethod]);

  // Fetch categories for filter
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  // Fetch products for filter
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  });

  // Fetch detailed report
  const { data: report, isLoading } = useQuery({
    queryKey: ['detailed-report', filters],
    queryFn: () => reportsApi.getDetailedReport(filters),
  });

  // Mock data for demonstration (will be replaced by actual API data)
  const mockReport = useMemo(() => ({
    summary: {
      totalRevenue: report?.summary?.totalRevenue ?? 12450,
      orderCount: report?.summary?.orderCount ?? 67,
      averageTicket: report?.summary?.averageTicket ?? 186,
      cashTotal: report?.summary?.cashTotal ?? 5200,
      cardTotal: report?.summary?.cardTotal ?? 6100,
      onlineTotal: (report?.summary as any)?.onlineTotal ?? 1150,
    },
    topProducts: report?.topProducts ?? [
      { productId: '1', productName: 'Latte', quantity: 89, revenue: 5340 },
      { productId: '2', productName: 'Americano', quantity: 72, revenue: 3960 },
      { productId: '3', productName: 'Cheesecake', quantity: 45, revenue: 3825 },
      { productId: '4', productName: 'Cappuccino', quantity: 38, revenue: 2280 },
      { productId: '5', productName: 'Brownie', quantity: 31, revenue: 2015 },
      { productId: '6', productName: 'Espresso', quantity: 28, revenue: 1260 },
      { productId: '7', productName: 'Flat White', quantity: 24, revenue: 1560 },
      { productId: '8', productName: 'Croissant', quantity: 22, revenue: 990 },
    ],
    hourlyBreakdown: report?.hourlyBreakdown ?? Array.from({ length: 14 }, (_, i) => ({
      hour: i + 9,
      sales: Math.floor(Math.random() * 1500) + 300,
      orderCount: Math.floor(Math.random() * 8) + 2,
    })),
    dailyBreakdown: report?.dailyBreakdown ?? Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 3000) + 1500,
        orderCount: Math.floor(Math.random() * 15) + 5,
        averageTicket: Math.floor(Math.random() * 50) + 150,
      };
    }),
  }), [report]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const clearFilters = () => {
    setTimeRange({ start: '', end: '' });
    setSelectedCategory('');
    setSelectedProduct('');
    setSelectedWaiter('');
    setSelectedPaymentMethod('all');
  };

  const hasActiveFilters = timeRange.start || timeRange.end || selectedCategory || selectedProduct || selectedWaiter || selectedPaymentMethod !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Raporlar</h1>
          <p className="text-sm text-white/50 mt-1">
            Detaylı satış raporları ve analizler
          </p>
        </div>
        
        {/* Export Button */}
        <div className="relative">
          <Button
            variant="tinted"
            color="blue"
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="gap-2"
          >
            <Download size={16} />
            Dışa Aktar
            <ChevronDown size={14} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
          </Button>
          
          {showExportMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 glass-elevated rounded-xl overflow-hidden z-50">
                <button
                  onClick={() => {
                    exportToExcel(mockReport, dateRange);
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
                >
                  <FileSpreadsheet size={18} className="text-[#30D158]" />
                  Excel (CSV)
                </button>
                <button
                  onClick={() => {
                    exportToPDF(mockReport, dateRange);
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
                >
                  <FileText size={18} className="text-[#FF453A]" />
                  PDF Yazdır
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Date Preset Tabs */}
      <Card variant="elevated" padding="sm">
        <div className="flex items-center gap-2 flex-wrap">
          {datePresets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setDatePreset(preset.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                datePreset === preset.value
                  ? 'bg-[#0A84FF] text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {preset.label}
            </button>
          ))}
          
          {/* Custom date inputs */}
          {datePreset === 'custom' && (
            <div className="flex items-center gap-2 ml-4">
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#0A84FF]"
              />
              <span className="text-white/40">-</span>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#0A84FF]"
              />
            </div>
          )}
          
          {/* Filter toggle */}
          <div className="ml-auto flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-[#FF453A] hover:bg-[#FF453A]/10 rounded-lg transition-colors"
              >
                <X size={14} />
                Filtreleri Temizle
              </button>
            )}
            <Button
              variant={showFilters ? 'filled' : 'tinted'}
              color={hasActiveFilters ? 'orange' : 'gray'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter size={14} />
              Filtreler
              {hasActiveFilters && (
                <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center">
                  {[timeRange.start, selectedCategory, selectedProduct, selectedWaiter, selectedPaymentMethod !== 'all'].filter(Boolean).length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card variant="elevated">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Time Range */}
            <div className="space-y-2">
              <label className="text-xs text-white/50 flex items-center gap-1">
                <Clock size={12} />
                Saat Aralığı
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={timeRange.start}
                  onChange={(e) => setTimeRange(prev => ({ ...prev, start: e.target.value }))}
                  className="flex-1 px-2 py-1.5 bg-white/10 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#0A84FF]"
                />
                <span className="text-white/40">-</span>
                <input
                  type="time"
                  value={timeRange.end}
                  onChange={(e) => setTimeRange(prev => ({ ...prev, end: e.target.value }))}
                  className="flex-1 px-2 py-1.5 bg-white/10 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#0A84FF]"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs text-white/50">Kategori</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#0A84FF] appearance-none"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            {/* Product Filter */}
            <div className="space-y-2">
              <label className="text-xs text-white/50">Ürün</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#0A84FF] appearance-none"
              >
                <option value="">Tüm Ürünler</option>
                {products.map((prod) => (
                  <option key={prod.id} value={prod.id}>{prod.name}</option>
                ))}
              </select>
            </div>
            
            {/* Waiter Filter */}
            <div className="space-y-2">
              <label className="text-xs text-white/50">Garson</label>
              <select
                value={selectedWaiter}
                onChange={(e) => setSelectedWaiter(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#0A84FF] appearance-none"
              >
                <option value="">Tüm Garsonlar</option>
                <option value="1">Ahmet K.</option>
                <option value="2">Mehmet Y.</option>
                <option value="3">Elif S.</option>
              </select>
            </div>
            
            {/* Payment Method Filter */}
            <div className="space-y-2">
              <label className="text-xs text-white/50">Ödeme Yöntemi</label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value as 'all' | 'cash' | 'card' | 'online')}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#0A84FF] appearance-none"
              >
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Revenue */}
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#30D158]/10 rounded-full blur-2xl -mr-6 -mt-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#30D158]/20 flex items-center justify-center">
                <DollarSign className="text-[#30D158]" size={16} />
              </div>
            </div>
            <p className="text-xs text-white/50 mb-1">Toplam Ciro</p>
            <p className="text-xl font-bold text-white">
              {isLoading ? '...' : formatCurrency(mockReport.summary.totalRevenue)}
            </p>
          </div>
        </Card>

        {/* Order Count */}
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#0A84FF]/10 rounded-full blur-2xl -mr-6 -mt-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#0A84FF]/20 flex items-center justify-center">
                <ShoppingCart className="text-[#0A84FF]" size={16} />
              </div>
            </div>
            <p className="text-xs text-white/50 mb-1">Sipariş Sayısı</p>
            <p className="text-xl font-bold text-white">
              {isLoading ? '...' : mockReport.summary.orderCount}
            </p>
          </div>
        </Card>

        {/* Average Ticket */}
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#FF9F0A]/10 rounded-full blur-2xl -mr-6 -mt-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#FF9F0A]/20 flex items-center justify-center">
                <TrendingUp className="text-[#FF9F0A]" size={16} />
              </div>
            </div>
            <p className="text-xs text-white/50 mb-1">Ortalama Hesap</p>
            <p className="text-xl font-bold text-white">
              {isLoading ? '...' : formatCurrency(mockReport.summary.averageTicket)}
            </p>
          </div>
        </Card>

        {/* Cash Total */}
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#34C759]/10 rounded-full blur-2xl -mr-6 -mt-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#34C759]/20 flex items-center justify-center">
                <Banknote className="text-[#34C759]" size={16} />
              </div>
            </div>
            <p className="text-xs text-white/50 mb-1">Nakit</p>
            <p className="text-xl font-bold text-white">
              {isLoading ? '...' : formatCurrency(mockReport.summary.cashTotal)}
            </p>
          </div>
        </Card>

        {/* Card Total */}
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#AF52DE]/10 rounded-full blur-2xl -mr-6 -mt-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#AF52DE]/20 flex items-center justify-center">
                <CreditCard className="text-[#AF52DE]" size={16} />
              </div>
            </div>
            <p className="text-xs text-white/50 mb-1">Kredi Kartı</p>
            <p className="text-xl font-bold text-white">
              {isLoading ? '...' : formatCurrency(mockReport.summary.cardTotal)}
            </p>
          </div>
        </Card>

        {/* Online Total */}
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#64D2FF]/10 rounded-full blur-2xl -mr-6 -mt-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#64D2FF]/20 flex items-center justify-center">
                <Globe className="text-[#64D2FF]" size={16} />
              </div>
            </div>
            <p className="text-xs text-white/50 mb-1">Online</p>
            <p className="text-xl font-bold text-white">
              {isLoading ? '...' : formatCurrency(mockReport.summary.onlineTotal)}
            </p>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Breakdown */}
        <Card variant="elevated">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0A84FF]/20 flex items-center justify-center">
                <Clock className="text-[#0A84FF]" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Saatlik Dağılım</h2>
                <p className="text-xs text-white/50">Saat bazlı satış grafiği</p>
              </div>
            </div>
          </div>
          <HourlyChart data={mockReport.hourlyBreakdown} />
        </Card>

        {/* Daily Breakdown */}
        <Card variant="elevated">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#30D158]/20 flex items-center justify-center">
                <Calendar className="text-[#30D158]" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Günlük Dağılım</h2>
                <p className="text-xs text-white/50">Gün bazlı satış grafiği</p>
              </div>
            </div>
          </div>
          <DailyChart data={mockReport.dailyBreakdown} />
        </Card>
      </div>

      {/* Top Products */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF9F0A]/20 flex items-center justify-center">
              <Package className="text-[#FF9F0A]" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">En Çok Satan Ürünler</h2>
              <p className="text-xs text-white/50">Seçili dönemde en popüler ürünler</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <BarChart3 size={14} />
            <span>{mockReport.topProducts.length} ürün</span>
          </div>
        </div>
        <TopProductsTable data={mockReport.topProducts} />
      </Card>

      {/* Daily Breakdown Table */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5E5CE6]/20 flex items-center justify-center">
              <Calendar className="text-[#5E5CE6]" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Günlük Detay</h2>
              <p className="text-xs text-white/50">Gün bazlı detaylı satış verileri</p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs text-white/50 font-medium">Tarih</th>
                <th className="text-right py-3 px-4 text-xs text-white/50 font-medium">Ciro</th>
                <th className="text-right py-3 px-4 text-xs text-white/50 font-medium">Sipariş</th>
                <th className="text-right py-3 px-4 text-xs text-white/50 font-medium">Ortalama</th>
              </tr>
            </thead>
            <tbody>
              {mockReport.dailyBreakdown.map((day) => (
                <tr 
                  key={day.date} 
                  className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-white">
                    {new Date(day.date).toLocaleDateString('tr-TR', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </td>
                  <td className="py-3 px-4 text-sm text-white text-right font-medium">
                    {formatCurrency(day.revenue)}
                  </td>
                  <td className="py-3 px-4 text-sm text-white/70 text-right">
                    {day.orderCount}
                  </td>
                  <td className="py-3 px-4 text-sm text-[#0A84FF] text-right">
                    {formatCurrency(day.averageTicket)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10 bg-white/[0.02]">
                <td className="py-3 px-4 text-sm font-semibold text-white">Toplam</td>
                <td className="py-3 px-4 text-sm font-semibold text-[#30D158] text-right">
                  {formatCurrency(mockReport.dailyBreakdown.reduce((sum, d) => sum + d.revenue, 0))}
                </td>
                <td className="py-3 px-4 text-sm font-semibold text-white text-right">
                  {mockReport.dailyBreakdown.reduce((sum, d) => sum + d.orderCount, 0)}
                </td>
                <td className="py-3 px-4 text-sm font-semibold text-[#0A84FF] text-right">
                  {formatCurrency(
                    mockReport.dailyBreakdown.reduce((sum, d) => sum + d.revenue, 0) / 
                    mockReport.dailyBreakdown.reduce((sum, d) => sum + d.orderCount, 0) || 0
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
