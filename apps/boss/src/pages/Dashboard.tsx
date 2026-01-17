import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Clock,
  CreditCard, Banknote, Package, BarChart3, PieChart, ArrowUpRight,
  ArrowDownRight, Zap, Target, Award, AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui';
import { reportsApi, tablesApi, ordersApi, type DetailedReport } from '@/services/api';

// Date helpers
const getToday = () => new Date().toISOString().split('T')[0];
const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};
const getLast7Days = () => {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return d.toISOString().split('T')[0];
};

// Format helpers
const formatCurrency = (v: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(v);
const formatPercent = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;

// Mini sparkline chart
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 80}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" className="w-20 h-8" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

// Metric card component
function MetricCard({ 
  icon: Icon, label, value, subValue, change, color, sparkData 
}: { 
  icon: React.ElementType; label: string; value: string; subValue?: string; change?: number; color: string; sparkData?: number[];
}) {
  const isPositive = change !== undefined && change >= 0;
  return (
    <Card className="relative overflow-hidden group hover:scale-[1.02] transition-transform">
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-12 -mt-12 opacity-20`} style={{ background: color }} />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ background: `${color}20` }}>
            <Icon size={20} style={{ color }} />
          </div>
          {sparkData && <Sparkline data={sparkData} color={color} />}
        </div>
        <p className="text-xs text-white/50 mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        <div className="flex items-center gap-2 mt-2">
          {subValue && <span className="text-xs text-white/40">{subValue}</span>}
          {change !== undefined && (
            <span className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-[#30D158]' : 'text-[#FF453A]'}`}>
              {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {formatPercent(change)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

// Hourly chart
function HourlyChart({ data }: { data: { hour: number; sales: number; orderCount: number }[] }) {
  const max = Math.max(...data.map(d => d.sales), 1);
  const currentHour = new Date().getHours();
  
  return (
    <div className="h-48 flex items-end gap-1">
      {data.filter(d => d.hour >= 8 && d.hour <= 23).map((item) => {
        const height = (item.sales / max) * 100;
        const isCurrent = item.hour === currentHour;
        return (
          <div key={item.hour} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full">
              <div 
                className={`w-full rounded-t transition-all duration-300 min-h-[4px] ${isCurrent ? 'bg-[#0A84FF]' : 'bg-[#0A84FF]/60 group-hover:bg-[#0A84FF]'}`}
                style={{ height: `${Math.max(height, 2)}%` }}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white/10 backdrop-blur-xl rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                <div className="font-medium">{formatCurrency(item.sales)}</div>
                <div className="text-white/60">{item.orderCount} sipariş</div>
              </div>
            </div>
            <span className={`text-[10px] ${isCurrent ? 'text-[#0A84FF] font-medium' : 'text-white/40'}`}>
              {item.hour.toString().padStart(2, '0')}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Category pie chart
function CategoryChart({ data }: { data: { categoryName: string; percentage: number; totalRevenue: number }[] }) {
  const colors = ['#0A84FF', '#30D158', '#FF9F0A', '#BF5AF2', '#FF453A', '#64D2FF', '#FFD60A', '#5E5CE6'];
  let cumulative = 0;
  
  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {data.slice(0, 6).map((cat, i) => {
            const start = cumulative;
            cumulative += cat.percentage;
            const largeArc = cat.percentage > 50 ? 1 : 0;
            const startX = 50 + 40 * Math.cos((start / 100) * 2 * Math.PI);
            const startY = 50 + 40 * Math.sin((start / 100) * 2 * Math.PI);
            const endX = 50 + 40 * Math.cos((cumulative / 100) * 2 * Math.PI);
            const endY = 50 + 40 * Math.sin((cumulative / 100) * 2 * Math.PI);
            return (
              <path
                key={cat.categoryName}
                d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`}
                fill={colors[i % colors.length]}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            );
          })}
          <circle cx="50" cy="50" r="25" fill="#0A0A0A" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{data.length}</span>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {data.slice(0, 5).map((cat, i) => (
          <div key={cat.categoryName} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: colors[i % colors.length] }} />
            <span className="text-xs text-white/70 flex-1 truncate">{cat.categoryName}</span>
            <span className="text-xs font-medium text-white">{cat.percentage.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Top products list
function TopProductsList({ data }: { data: { productName: string; quantitySold?: number; totalRevenue?: number }[] }) {
  const max = Math.max(...data.map(d => d.quantitySold || 0), 1);
  const medals = ['🥇', '🥈', '🥉'];
  
  return (
    <div className="space-y-3">
      {data.slice(0, 5).map((product, i) => (
        <div key={product.productName} className="flex items-center gap-3">
          <span className="text-lg w-6">{medals[i] || `${i + 1}.`}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-white truncate">{product.productName}</span>
              <span className="text-sm font-medium text-white ml-2">{product.quantitySold || 0}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#30D158] to-[#30D158]/60 rounded-full"
                style={{ width: `${((product.quantitySold || 0) / max) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-[#30D158] font-medium w-16 text-right">{formatCurrency(product.totalRevenue || 0)}</span>
        </div>
      ))}
    </div>
  );
}

// Waiter performance
function WaiterPerformance({ data }: { data: { userName: string; orderCount: number; totalRevenue: number; averageTicket: number }[] }) {
  return (
    <div className="space-y-3">
      {data.slice(0, 5).map((waiter, i) => (
        <div key={waiter.userName} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#BF5AF2] to-[#5E5CE6] flex items-center justify-center text-white font-bold">
            {waiter.userName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{waiter.userName}</p>
            <p className="text-xs text-white/40">{waiter.orderCount} sipariş</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-white">{formatCurrency(waiter.totalRevenue)}</p>
            <p className="text-xs text-white/40">Ort: {formatCurrency(waiter.averageTicket)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const today = getToday();
  const yesterday = getYesterday();
  const last7Days = getLast7Days();

  // Fetch detailed report for today
  const { data: report, isLoading } = useQuery({
    queryKey: ['detailed-report', today],
    queryFn: () => reportsApi.getDetailed({ startDate: today, endDate: today }),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch last 7 days for sparklines
  const { data: weeklyData } = useQuery({
    queryKey: ['weekly-breakdown', last7Days, today],
    queryFn: () => reportsApi.getDailyBreakdown(last7Days, today),
  });

  // Fetch tables for live status
  const { data: tables } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.getAll,
    refetchInterval: 10000,
  });

  const openTables = tables?.filter(t => t.status === 'occupied').length || 0;
  const totalTables = tables?.length || 0;

  // Sparkline data
  const revenueSparkData = weeklyData?.map(d => d.revenue) || [];
  const orderSparkData = weeklyData?.map(d => d.orderCount) || [];

  const summary = report?.summary || {
    totalRevenue: 0, orderCount: 0, averageTicket: 0,
    cashTotal: 0, cardTotal: 0, itemsSold: 0,
    cancelledOrders: 0, cancelledAmount: 0,
  };

  const comparison = report?.comparison;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-white/50 mt-1">Anlık satış özeti ve performans metrikleri</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5">
            <div className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
            <span className="text-sm text-white/70">Canlı</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/40">
            <Clock size={16} />
            <span>{new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard
          icon={DollarSign}
          label="Bugünkü Ciro"
          value={formatCurrency(summary.totalRevenue)}
          change={comparison?.revenueChange}
          color="#30D158"
          sparkData={revenueSparkData}
        />
        <MetricCard
          icon={ShoppingCart}
          label="Sipariş Sayısı"
          value={summary.orderCount.toString()}
          change={comparison?.orderCountChange}
          color="#0A84FF"
          sparkData={orderSparkData}
        />
        <MetricCard
          icon={Target}
          label="Ortalama Hesap"
          value={formatCurrency(summary.averageTicket)}
          color="#FF9F0A"
        />
        <MetricCard
          icon={Package}
          label="Satılan Ürün"
          value={summary.itemsSold.toString()}
          subValue="adet"
          color="#BF5AF2"
        />
        <MetricCard
          icon={Banknote}
          label="Nakit"
          value={formatCurrency(summary.cashTotal)}
          color="#34C759"
        />
        <MetricCard
          icon={CreditCard}
          label="Kredi Kartı"
          value={formatCurrency(summary.cardTotal)}
          color="#5E5CE6"
        />
      </div>

      {/* Live Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4 p-4">
          <div className="w-12 h-12 rounded-xl bg-[#30D158]/20 flex items-center justify-center">
            <Users className="text-[#30D158]" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{openTables}<span className="text-lg text-white/40">/{totalTables}</span></p>
            <p className="text-xs text-white/50">Açık Masa</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-4">
          <div className="w-12 h-12 rounded-xl bg-[#FF9F0A]/20 flex items-center justify-center">
            <Zap className="text-[#FF9F0A]" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{report?.peakHour?.hour || '--'}:00</p>
            <p className="text-xs text-white/50">En Yoğun Saat</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-4">
          <div className="w-12 h-12 rounded-xl bg-[#FF453A]/20 flex items-center justify-center">
            <AlertTriangle className="text-[#FF453A]" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{summary.cancelledOrders}</p>
            <p className="text-xs text-white/50">İptal Sipariş</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-4">
          <div className="w-12 h-12 rounded-xl bg-[#64D2FF]/20 flex items-center justify-center">
            <Award className="text-[#64D2FF]" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{report?.topProducts?.[0]?.productName || '--'}</p>
            <p className="text-xs text-white/50">En Çok Satan</p>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Sales */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Saatlik Satışlar</h2>
              <p className="text-xs text-white/40">Bugünkü satış dağılımı</p>
            </div>
            <BarChart3 size={20} className="text-white/30" />
          </div>
          <HourlyChart data={report?.hourlyBreakdown || []} />
        </Card>

        {/* Category Distribution */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Kategori Dağılımı</h2>
              <p className="text-xs text-white/40">Satış oranları</p>
            </div>
            <PieChart size={20} className="text-white/30" />
          </div>
          <CategoryChart data={report?.categorySales || []} />
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">En Çok Satanlar</h2>
              <p className="text-xs text-white/40">Bugünkü en popüler ürünler</p>
            </div>
            <a href="/reports" className="text-sm text-[#0A84FF] hover:underline">Tümü →</a>
          </div>
          <TopProductsList data={report?.topProducts || []} />
        </Card>

        {/* Waiter Performance */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Personel Performansı</h2>
              <p className="text-xs text-white/40">Bugünkü satış performansı</p>
            </div>
            <Users size={20} className="text-white/30" />
          </div>
          <WaiterPerformance data={report?.waiterPerformance || []} />
        </Card>
      </div>
    </div>
  );
}
