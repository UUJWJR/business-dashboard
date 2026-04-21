import type {
  KPIData,
  KPIMetric,
  TimeRange,
  TrendChartData,
  DistributionData,
  RegionData,
  SalesRevenueData,
  HomePreviewData,
} from '../types';

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(random(min, max));
}

function formatWan(val: number): string {
  if (val >= 10000) {
    return `${(val / 10000).toFixed(2)}万`;
  }
  return `${Math.round(val)}`;
}

const MONTHS = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
];

const CHANNELS = ['自然搜索', '社交媒体', '付费广告', '邮件营销', '线下活动', '合作伙伴', '应用商店', '直接访问'];

// Seasonal factor: lower in early year, higher at year-end
function seasonalFactor(monthIndex: number): number {
  const factors = [0.85, 0.82, 0.9, 0.95, 1.0, 1.05, 1.0, 1.02, 1.08, 1.1, 1.15, 1.25];
  return factors[monthIndex];
}

// Weekday factor for daily data: higher on weekdays
function weekdayFactor(dayIndex: number): number {
  return dayIndex % 7 === 0 || dayIndex % 7 === 6 ? 0.75 : 1.0;
}

export function generateKPIs(): KPIData[] {
  return [
    {
      id: 'revenue',
      title: '总营收',
      value: random(800, 1500),
      unit: '万元',
      trend: random(-15, 25),
      icon: 'DollarSign',
      color: 'primary',
    },
    {
      id: 'users',
      title: '活跃用户',
      value: random(50, 150),
      unit: '万人',
      trend: random(-10, 30),
      icon: 'Users',
      color: 'info',
    },
    {
      id: 'orders',
      title: '订单量',
      value: random(20, 80),
      unit: '万单',
      trend: random(-8, 20),
      icon: 'ShoppingCart',
      color: 'success',
    },
    {
      id: 'conversion',
      title: '转化率',
      value: random(2, 8),
      unit: '%',
      trend: random(-5, 15),
      icon: 'TrendingUp',
      color: 'warning',
    },
    {
      id: 'satisfaction',
      title: '客户满意度',
      value: random(85, 98),
      unit: '分',
      trend: random(-2, 5),
      icon: 'Smile',
      color: 'danger',
    },
    {
      id: 'arpu',
      title: '客单价',
      value: random(200, 600),
      unit: '元',
      trend: random(-10, 20),
      icon: 'CreditCard',
      color: 'primary',
    },
  ];
}

// --- Module-specific generators ---

function makeTrend(labels: string[], datasets: { name: string; values: number[]; color?: string }[]): TrendChartData {
  return { labels, datasets };
}

function normalizeDistribution(items: DistributionData[]): DistributionData[] {
  const sum = items.reduce((a, b) => a + b.value, 0);
  return items.map((item) => ({ ...item, percent: parseFloat(((item.value / sum) * 100).toFixed(1)) }));
}

export function generateSalesRevenueData(_timeRange: TimeRange): SalesRevenueData {
  // Monthly revenue trend with seasonal pattern
  const revenueValues: number[] = [];
  const profitValues: number[] = [];
  let baseRevenue = random(50, 70); // billion
  for (let i = 0; i < 12; i++) {
    baseRevenue = baseRevenue * random(0.95, 1.12) * seasonalFactor(i);
    const rev = Math.round(baseRevenue * 10) / 10;
    revenueValues.push(rev);
    profitValues.push(Math.round(rev * random(0.18, 0.28) * 10) / 10);
  }

  const monthlyTrend = makeTrend(MONTHS, [
    { name: '收入', values: revenueValues, color: '#4f46e5' },
    { name: '净利润', values: profitValues, color: '#22c55e' },
  ]);

  const composition = normalizeDistribution([
    { name: '语音', value: random(18, 22) },
    { name: '流量', value: random(40, 45) },
    { name: '宽带', value: random(12, 16) },
    { name: '增值', value: random(16, 20) },
    { name: '其他', value: random(5, 8) },
  ]);

  const byRegion: RegionData[] = [
    { name: '华东', value: Math.round(random(35, 45)), target: 42 },
    { name: '华南', value: Math.round(random(28, 36)), target: 33 },
    { name: '华北', value: Math.round(random(18, 25)), target: 22 },
    { name: '西部', value: Math.round(random(10, 16)), target: 14 },
  ];

  const byProduct = normalizeDistribution([
    { name: '个人套餐', value: random(45, 55) },
    { name: '家庭套餐', value: random(20, 28) },
    { name: '政企专线', value: random(12, 18) },
    { name: '增值服务', value: random(10, 16) },
  ]);

  const byChannel = normalizeDistribution([
    { name: '营业厅', value: random(20, 28) },
    { name: '线上', value: random(35, 45) },
    { name: '代理', value: random(18, 25) },
    { name: '直销', value: random(8, 14) },
  ]);

  const currentMonthRevenue = revenueValues[revenueValues.length - 1];
  const cumulativeRevenue = revenueValues.reduce((a, b) => a + b, 0);
  const annualTarget = random(700, 900);

  const kpis: KPIMetric[] = [
    {
      id: 'month-revenue',
      title: '本月收入',
      value: Math.round(currentMonthRevenue * 10) / 10,
      unit: '亿元',
      trend: random(-3, 8),
      yoyTrend: random(2, 12),
      icon: 'DollarSign',
      color: 'primary',
    },
    {
      id: 'cumulative-revenue',
      title: '累计收入',
      value: Math.round(cumulativeRevenue * 10) / 10,
      unit: '亿元',
      trend: random(1, 6),
      yoyTrend: random(3, 10),
      icon: 'TrendingUp',
      color: 'success',
    },
    {
      id: 'arpu',
      title: '单客ARPU',
      value: Math.round(random(55, 85)),
      unit: '元',
      trend: random(-2, 5),
      yoyTrend: random(0, 4),
      icon: 'Users',
      color: 'info',
    },
    {
      id: 'growth-rate',
      title: '收入增长率',
      value: Math.round(random(3, 12) * 100) / 100,
      unit: '%',
      trend: random(-1, 3),
      yoyTrend: random(1, 5),
      icon: 'BarChart3',
      color: 'warning',
    },
  ];

  const byProductTrend = makeTrend(
    ['1月', '2月', '3月', '4月', '5月', '6月'],
    byProduct.map((p, i) => ({
      name: p.name,
      values: Array.from({ length: 6 }, (_, idx) =>
        Math.round(p.value * (0.8 + idx * 0.05 + random(0, 0.1)) * 10) / 10
      ),
      color: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'][i % 4],
    }))
  );

  const byChannelTrend = makeTrend(
    ['1月', '2月', '3月', '4月', '5月', '6月'],
    byChannel.map((c, i) => ({
      name: c.name,
      values: Array.from({ length: 6 }, (_, idx) =>
        Math.round(c.value * (0.85 + idx * 0.04 + random(0, 0.1)) * 10) / 10
      ),
      color: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'][i % 4],
    }))
  );

  return { kpis, monthlyTrend, composition, byRegion, byProduct, byChannel, byProductTrend, byChannelTrend };
}

export function generateHomePreviewData(): HomePreviewData {
  const modules = [
    {
      id: 'sales-revenue',
      name: '销售收入',
      icon: 'TrendingUp',
      color: 'primary',
      path: '/sales-revenue',
      kpis: [
        { title: '本月收入', value: Math.round(random(80, 130) * 10) / 10, unit: '亿元', trend: random(2, 10) },
        { title: '收入增长率', value: Math.round(random(3, 12) * 100) / 100, unit: '%', trend: random(1, 5) },
      ],
    },
    {
      id: 'page-builder',
      name: '页面制作',
      icon: 'Presentation',
      color: 'info',
      path: '/page-builder',
      kpis: [
        { title: '幻灯片数', value: Math.round(random(3, 12)), unit: '页', trend: random(0, 5) },
        { title: '完成率', value: Math.round(random(60, 95) * 100) / 100, unit: '%', trend: random(1, 5) },
      ],
    },
  ];

  return { modules };
}
