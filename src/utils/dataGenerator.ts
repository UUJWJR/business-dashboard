import type {
  KPIData,
  KPIMetric,
  RevenueData,
  UserGrowthData,
  MarketShareData,
  RadarData,
  ComboData,
  TimeRange,
  TrendChartData,
  DistributionData,
  RegionData,
  SalesRevenueData,
  CustomerAcquisitionData,
  BroadbandData,
  SmartHomeData,
  RightsProductsData,
  HomeNetworkingData,
  HomePreviewData,
  WeekReviewData,
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

export function generateRevenue(): RevenueData {
  const totalRevenue: number[] = [];
  const netProfit: number[] = [];
  let base = random(500, 800);
  for (let i = 0; i < 12; i++) {
    base = base * random(0.9, 1.15);
    const revenue = Math.round(base);
    totalRevenue.push(revenue);
    netProfit.push(Math.round(revenue * random(0.2, 0.35)));
  }
  return { months: MONTHS, totalRevenue, netProfit };
}

export function generateUserGrowth(): UserGrowthData {
  const newUsers: number[] = [];
  const activeUsers: number[] = [];
  let activeBase = random(30, 60);
  for (let i = 0; i < 12; i++) {
    const nu = Math.round(random(2, 12));
    newUsers.push(nu);
    activeBase = activeBase * random(0.95, 1.12) + nu * random(0.3, 0.7);
    activeUsers.push(Math.round(activeBase));
  }
  return { months: MONTHS, newUsers, activeUsers };
}

export function generateMarketShare(): MarketShareData[] {
  const names = ['企业级SaaS', '云基础设施', '数据分析', 'AI服务', '安全合规', '咨询服务'];
  const values = names.map(() => randomInt(10, 40));
  const sum = values.reduce((a, b) => a + b, 0);
  return names.map((name, i) => ({
    name,
    value: Math.round((values[i] / sum) * 100),
  }));
}

export function generateRadar(): RadarData {
  const indicator = [
    { name: '收入增长', max: 100 },
    { name: '用户增长', max: 100 },
    { name: '市场份额', max: 100 },
    { name: '产品竞争力', max: 100 },
    { name: '运营效率', max: 100 },
    { name: '客户满意度', max: 100 },
  ];
  const current = indicator.map(() => randomInt(60, 95));
  const previous = indicator.map(() => randomInt(50, 85));
  return { indicator, current, previous };
}

export function generateCombo(): ComboData {
  const channels = CHANNELS;
  const newUsers = channels.map(() => randomInt(5, 40));
  const conversionRate = channels.map(() => random(1, 15));
  return { channels, newUsers, conversionRate };
}

export function generateAllData(): {
  kpis: KPIData[];
  revenue: RevenueData;
  userGrowth: UserGrowthData;
  marketShare: MarketShareData[];
  radar: RadarData;
  combo: ComboData;
} {
  return {
    kpis: generateKPIs(),
    revenue: generateRevenue(),
    userGrowth: generateUserGrowth(),
    marketShare: generateMarketShare(),
    radar: generateRadar(),
    combo: generateCombo(),
  };
}

export function updateKPIsRandomly(kpis: KPIData[]): KPIData[] {
  return kpis.map((kpi) => {
    const variation = random(-0.05, 0.05);
    const newValue = kpi.value * (1 + variation);
    const newTrend = kpi.trend + random(-2, 2);
    return { ...kpi, value: newValue, trend: newTrend };
  });
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
    { name: '收入', values: revenueValues, color: '#0070C0' },
    { name: '净利润', values: profitValues, color: '#FA8C16' },
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
      color: ['#0070C0', '#FA8C16', '#1AAB55', '#722ED1'][i % 4],
    }))
  );

  const byChannelTrend = makeTrend(
    ['1月', '2月', '3月', '4月', '5月', '6月'],
    byChannel.map((c, i) => ({
      name: c.name,
      values: Array.from({ length: 6 }, (_, idx) =>
        Math.round(c.value * (0.85 + idx * 0.04 + random(0, 0.1)) * 10) / 10
      ),
      color: ['#0070C0', '#FA8C16', '#1AAB55', '#722ED1'][i % 4],
    }))
  );

  return { kpis, monthlyTrend, composition, byRegion, byProduct, byChannel, byProductTrend, byChannelTrend };
}

export function generateCustomerAcquisitionData(_timeRange: TimeRange): CustomerAcquisitionData {
  // Daily trend (30 days)
  const dailyLabels: string[] = [];
  const dailyNew: number[] = [];
  const dailyChurn: number[] = [];
  for (let i = 0; i < 30; i++) {
    dailyLabels.push(`${i + 1}日`);
    dailyNew.push(Math.round(random(0.8, 2.5) * weekdayFactor(i) * 100) / 100);
    dailyChurn.push(Math.round(random(0.1, 0.4) * 100) / 100);
  }

  // Monthly trend
  const monthlyNew: number[] = [];
  const monthlyNet: number[] = [];
  for (let i = 0; i < 12; i++) {
    const mn = Math.round(random(20, 55) * seasonalFactor(i) * 10) / 10;
    monthlyNew.push(mn);
    monthlyNet.push(Math.round((mn - random(3, 8)) * 10) / 10);
  }

  const dailyTrend = makeTrend(dailyLabels, [
    { name: '日新增', values: dailyNew, color: '#4f46e5' },
    { name: '日流失', values: dailyChurn, color: '#ef4444' },
  ]);

  const monthlyTrend = makeTrend(MONTHS, [
    { name: '新增客户', values: monthlyNew, color: '#4f46e5' },
    { name: '净增客户', values: monthlyNet, color: '#22c55e' },
  ]);

  const typeDistribution = normalizeDistribution([
    { name: '个人', value: random(75, 82) },
    { name: '家庭', value: random(13, 18) },
    { name: '政企', value: random(4, 7) },
  ]);

  const channelDistribution = normalizeDistribution([
    { name: '营业厅', value: random(18, 25) },
    { name: '线上', value: random(38, 48) },
    { name: '代理', value: random(18, 26) },
    { name: '直销', value: random(8, 14) },
  ]);

  const typeTrend = makeTrend(
    ['1月', '2月', '3月', '4月', '5月', '6月'],
    typeDistribution.map((t, i) => ({
      name: t.name,
      values: Array.from({ length: 6 }, (_, idx) =>
        Math.round(t.value * (0.9 + idx * 0.02 + random(0, 0.06)) * 10) / 10
      ),
      color: ['#6366f1', '#22c55e', '#f59e0b'][i % 3],
    }))
  );

  const channelTrend = makeTrend(
    ['1月', '2月', '3月', '4月', '5月', '6月'],
    channelDistribution.map((c, i) => ({
      name: c.name,
      values: Array.from({ length: 6 }, (_, idx) =>
        Math.round(c.value * (0.85 + idx * 0.03 + random(0, 0.08)) * 10) / 10
      ),
      color: ['#0070C0', '#FA8C16', '#1AAB55', '#722ED1'][i % 4],
    }))
  );

  const churnRisk = [
    { level: '高风险', count: randomInt(800, 1500) },
    { level: '中风险', count: randomInt(2000, 4000) },
    { level: '低风险', count: randomInt(5000, 9000) },
  ];

  const churnRiskTrend = makeTrend(
    ['1月', '2月', '3月', '4月', '5月', '6月'],
    [
      {
        name: '高风险',
        values: Array.from({ length: 6 }, () => Math.round(random(600, 1400))),
        color: '#ef4444',
      },
      {
        name: '中风险',
        values: Array.from({ length: 6 }, () => Math.round(random(2000, 3500))),
        color: '#f59e0b',
      },
      {
        name: '低风险',
        values: Array.from({ length: 6 }, () => Math.round(random(5000, 8000))),
        color: '#22c55e',
      },
    ]
  );

  const totalCustomers = random(3.5, 5.2);
  const retentionRate = random(96, 99);

  const kpis: KPIMetric[] = [
    {
      id: 'month-new',
      title: '本月新增客户',
      value: Math.round(monthlyNew[monthlyNew.length - 1] * 10) / 10,
      unit: '万户',
      trend: random(-5, 12),
      yoyTrend: random(3, 15),
      icon: 'Users',
      color: 'primary',
    },
    {
      id: 'total-customers',
      title: '累计客户数',
      value: Math.round(totalCustomers * 100) / 100,
      unit: '亿户',
      trend: random(0.5, 3),
      yoyTrend: random(2, 6),
      icon: 'UserCheck',
      color: 'success',
    },
    {
      id: 'net-growth',
      title: '净增客户',
      value: Math.round(monthlyNet[monthlyNet.length - 1] * 10) / 10,
      unit: '万户',
      trend: random(-3, 10),
      yoyTrend: random(2, 12),
      icon: 'TrendingUp',
      color: 'info',
    },
    {
      id: 'retention',
      title: '客户留存率',
      value: Math.round(retentionRate * 100) / 100,
      unit: '%',
      trend: random(-0.5, 1.5),
      yoyTrend: random(0.2, 2),
      icon: 'Heart',
      color: 'warning',
    },
  ];

  return { kpis, dailyTrend, monthlyTrend, typeDistribution, channelDistribution, typeTrend, channelTrend, churnRisk, churnRiskTrend };
}

export function generateBroadbandData(_timeRange: TimeRange): BroadbandData {
  const monthlyNew: number[] = [];
  for (let i = 0; i < 12; i++) {
    monthlyNew.push(Math.round(random(40, 120) * seasonalFactor(i) * 10) / 10);
  }

  const monthlyTrend = makeTrend(MONTHS, [
    { name: '新增宽带', values: monthlyNew, color: '#4f46e5' },
  ]);

  const speedDistribution = normalizeDistribution([
    { name: '100M', value: random(8, 15) },
    { name: '300M', value: random(30, 40) },
    { name: '500M', value: random(25, 35) },
    { name: '1000M', value: random(15, 30) },
  ]);

  const byRegion: RegionData[] = [
    { name: '华东', value: Math.round(random(30, 40)), target: 36 },
    { name: '华南', value: Math.round(random(24, 32)), target: 28 },
    { name: '华北', value: Math.round(random(16, 22)), target: 19 },
    { name: '西部', value: Math.round(random(10, 16)), target: 13 },
  ];

  const competitorShare = normalizeDistribution([
    { name: '本公司', value: random(48, 58) },
    { name: '电信', value: random(28, 36) },
    { name: '联通', value: random(10, 18) },
    { name: '其他', value: random(2, 6) },
  ]);

  const totalBroadband = random(2.0, 3.2);
  const gigabitRatio = random(18, 32);
  const penetration = random(65, 82);

  const kpis: KPIMetric[] = [
    {
      id: 'month-broadband',
      title: '本月新增宽带',
      value: Math.round(monthlyNew[monthlyNew.length - 1] * 10) / 10,
      unit: '万户',
      trend: random(-3, 10),
      yoyTrend: random(5, 18),
      icon: 'Wifi',
      color: 'primary',
    },
    {
      id: 'total-broadband',
      title: '宽带总用户',
      value: Math.round(totalBroadband * 100) / 100,
      unit: '亿户',
      trend: random(1, 4),
      yoyTrend: random(3, 8),
      icon: 'Globe',
      color: 'success',
    },
    {
      id: 'gigabit-ratio',
      title: '千兆宽带占比',
      value: Math.round(gigabitRatio * 100) / 100,
      unit: '%',
      trend: random(2, 6),
      yoyTrend: random(5, 15),
      icon: 'Zap',
      color: 'info',
    },
    {
      id: 'penetration',
      title: '宽带渗透率',
      value: Math.round(penetration * 100) / 100,
      unit: '%',
      trend: random(0.5, 3),
      yoyTrend: random(1, 5),
      icon: 'Percent',
      color: 'warning',
    },
  ];

  const speedTrend = makeTrend(
    ['1月', '2月', '3月', '4月', '5月', '6月'],
    speedDistribution.map((s, i) => ({
      name: s.name,
      values: Array.from({ length: 6 }, (_, idx) =>
        Math.round(s.value * (0.85 + idx * 0.04 + random(0, 0.08)) * 10) / 10
      ),
      color: ['#0070C0', '#FA8C16', '#1AAB55', '#722ED1'][i % 4],
    }))
  );

  return { kpis, monthlyTrend, speedDistribution, speedTrend, byRegion, competitorShare };
}

export function generateSmartHomeData(_timeRange: TimeRange): SmartHomeData {
  const monthlySales: number[] = [];
  for (let i = 0; i < 12; i++) {
    // Promotions in June and November
    const promo = i === 5 || i === 10 ? 1.4 : 1.0;
    monthlySales.push(Math.round(random(8, 20) * seasonalFactor(i) * promo * 10) / 10);
  }

  const monthlyTrend = makeTrend(MONTHS, [
    { name: '销量', values: monthlySales, color: '#4f46e5' },
  ]);

  const productDistribution = normalizeDistribution([
    { name: '摄像头', value: random(35, 45) },
    { name: '门锁', value: random(22, 28) },
    { name: '音箱', value: random(12, 18) },
    { name: '传感器', value: random(8, 14) },
    { name: '其他', value: random(5, 10) },
  ]);

  const bindingRateLabels = ['1月', '3月', '5月', '7月', '9月', '11月'];
  let bindingBase = random(35, 45);
  const bindingValues = bindingRateLabels.map(() => {
    bindingBase = Math.min(75, bindingBase + random(2, 6));
    return Math.round(bindingBase * 10) / 10;
  });

  const bindingRate = makeTrend(bindingRateLabels, [
    { name: '套餐绑定率', values: bindingValues, color: '#22c55e' },
  ]);

  const topProducts = [
    { name: '智能摄像头Pro', sales: randomInt(12000, 25000) },
    { name: '指纹门锁X1', sales: randomInt(8000, 18000) },
    { name: 'AI音箱Mini', sales: randomInt(6000, 14000) },
    { name: '门窗传感器', sales: randomInt(4000, 10000) },
    { name: '智能插座', sales: randomInt(3000, 8000) },
  ];

  const satisfactionTrend = makeTrend(
    ['1月', '2月', '3月', '4月', '5月', '6月'],
    [
      {
        name: '满意度评分',
        values: Array.from({ length: 6 }, () => Math.round((4.2 + random(0, 0.6)) * 10) / 10),
        color: '#6366f1',
      },
    ]
  );

  const feedbackDistribution = [
    { name: '产品质量', value: Math.round(random(300, 500)) },
    { name: '安装服务', value: Math.round(random(200, 350)) },
    { name: 'APP体验', value: Math.round(random(150, 250)) },
    { name: '售后支持', value: Math.round(random(100, 180)) },
    { name: '价格', value: Math.round(random(80, 140)) },
  ];

  const penetration = random(25, 45);
  const avgProducts = random(2.0, 3.2);
  const revenue = random(500, 1500);

  const kpis: KPIMetric[] = [
    {
      id: 'smart-sales',
      title: '智家产品销量',
      value: Math.round(monthlySales[monthlySales.length - 1] * 10) / 10,
      unit: '万件',
      trend: random(-5, 15),
      yoyTrend: random(10, 30),
      icon: 'ShoppingCart',
      color: 'primary',
    },
    {
      id: 'smart-penetration',
      title: '智家用户渗透率',
      value: Math.round(penetration * 100) / 100,
      unit: '%',
      trend: random(1, 5),
      yoyTrend: random(3, 10),
      icon: 'Home',
      color: 'success',
    },
    {
      id: 'avg-products',
      title: '户均产品数',
      value: Math.round(avgProducts * 10) / 10,
      unit: '个',
      trend: random(0.5, 3),
      yoyTrend: random(1, 5),
      icon: 'Layers',
      color: 'info',
    },
    {
      id: 'smart-revenue',
      title: '智家收入',
      value: Math.round(revenue),
      unit: '万元',
      trend: random(3, 12),
      yoyTrend: random(8, 20),
      icon: 'DollarSign',
      color: 'warning',
    },
  ];

  return { kpis, monthlyTrend, productDistribution, bindingRate, topProducts, satisfactionTrend, feedbackDistribution };
}

export function generateRightsProductsData(_timeRange: TimeRange): RightsProductsData {
  const monthlySubs: number[] = [];
  for (let i = 0; i < 12; i++) {
    monthlySubs.push(Math.round(random(50, 120) * seasonalFactor(i) * 10) / 10);
  }

  const monthlyTrend = makeTrend(MONTHS, [
    { name: '订阅数', values: monthlySubs, color: '#4f46e5' },
  ]);

  const typeDistribution = normalizeDistribution([
    { name: '视频', value: random(32, 38) },
    { name: '音乐', value: random(18, 24) },
    { name: '餐饮', value: random(10, 16) },
    { name: '出行', value: random(12, 18) },
    { name: '生活', value: random(14, 20) },
  ]);

  const topRights = [
    { name: '腾讯视频VIP', activeUsers: randomInt(80000, 150000) },
    { name: '网易云音乐', activeUsers: randomInt(60000, 120000) },
    { name: '美团外卖券', activeUsers: randomInt(40000, 90000) },
    { name: '滴滴出行卡', activeUsers: randomInt(35000, 80000) },
    { name: '京东PLUS', activeUsers: randomInt(30000, 70000) },
    { name: '饿了么会员', activeUsers: randomInt(25000, 60000) },
    { name: '优酷会员', activeUsers: randomInt(20000, 50000) },
    { name: 'QQ音乐绿钻', activeUsers: randomInt(18000, 45000) },
    { name: '高德打车券', activeUsers: randomInt(15000, 40000) },
    { name: '喜马拉雅VIP', activeUsers: randomInt(12000, 35000) },
  ];

  const revenueByType = normalizeDistribution([
    { name: '视频', value: random(35, 42) },
    { name: '音乐', value: random(18, 24) },
    { name: '餐饮', value: random(10, 16) },
    { name: '出行', value: random(12, 18) },
    { name: '生活', value: random(14, 20) },
  ]);

  const ageDistribution = [
    { name: '年轻用户(18-25)', value: Math.round(random(25, 45)) },
    { name: '中青年(26-35)', value: Math.round(random(30, 45)) },
    { name: '中年(36-50)', value: Math.round(random(20, 30)) },
    { name: '老年(50+)', value: Math.round(random(10, 15)) },
  ];

  const usageRate = random(62, 80);
  const avgPrice = random(15, 30);

  const kpis: KPIMetric[] = [
    {
      id: 'rights-subs',
      title: '权益订阅数',
      value: Math.round(monthlySubs[monthlySubs.length - 1] * 10) / 10,
      unit: '万份',
      trend: random(3, 12),
      yoyTrend: random(8, 22),
      icon: 'Gift',
      color: 'primary',
    },
    {
      id: 'rights-revenue',
      title: '权益收入',
      value: Math.round(random(300, 800)),
      unit: '万元',
      trend: random(5, 15),
      yoyTrend: random(10, 25),
      icon: 'DollarSign',
      color: 'success',
    },
    {
      id: 'usage-rate',
      title: '权益使用率',
      value: Math.round(usageRate * 100) / 100,
      unit: '%',
      trend: random(-1, 4),
      yoyTrend: random(1, 6),
      icon: 'Percent',
      color: 'info',
    },
    {
      id: 'avg-price',
      title: '权益客单价',
      value: Math.round(avgPrice * 100) / 100,
      unit: '元',
      trend: random(-1, 3),
      yoyTrend: random(0, 4),
      icon: 'CreditCard',
      color: 'warning',
    },
  ];

  return { kpis, monthlyTrend, typeDistribution, topRights, revenueByType, ageDistribution };
}

export function generateHomeNetworkingData(_timeRange: TimeRange): HomeNetworkingData {
  const monthlyOrders: number[] = [];
  for (let i = 0; i < 12; i++) {
    monthlyOrders.push(Math.round(random(5, 18) * seasonalFactor(i) * 10) / 10);
  }

  const monthlyTrend = makeTrend(MONTHS, [
    { name: '组网订单', values: monthlyOrders, color: '#4f46e5' },
  ]);

  const solutionDistribution = normalizeDistribution([
    { name: '全屋WiFi', value: random(55, 65) },
    { name: 'Mesh组网', value: random(20, 28) },
    { name: 'PLC电力猫', value: random(5, 10) },
    { name: 'AP面板', value: random(5, 10) },
  ]);

  const solutionTrend = makeTrend(
    ['1月', '2月', '3月', '4月', '5月', '6月'],
    solutionDistribution.map((s, i) => ({
      name: s.name,
      values: Array.from({ length: 6 }, (_, idx) =>
        Math.round(s.value * (0.9 + idx * 0.02 + random(0, 0.06)) * 10) / 10
      ),
      color: ['#0070C0', '#FA8C16', '#1AAB55', '#722ED1'][i % 4],
    }))
  );

  const byRegion: RegionData[] = [
    { name: '华东', value: Math.round(random(28, 38)), target: 34 },
    { name: '华南', value: Math.round(random(22, 30)), target: 26 },
    { name: '华北', value: Math.round(random(15, 22)), target: 18 },
    { name: '西部', value: Math.round(random(10, 16)), target: 13 },
  ];

  const workorderStats = [
    { status: '待处理', count: randomInt(200, 500) },
    { status: '处理中', count: randomInt(400, 900) },
    { status: '已完成', count: randomInt(3000, 6000) },
    { status: '已超时', count: randomInt(30, 120) },
  ];

  const coverage = random(40, 55);
  const avgDevices = random(2.5, 4.0);
  const satisfaction = random(4.5, 4.85);

  const kpis: KPIMetric[] = [
    {
      id: 'network-orders',
      title: '组网订单数',
      value: Math.round(monthlyOrders[monthlyOrders.length - 1] * 10) / 10,
      unit: '万单',
      trend: random(3, 12),
      yoyTrend: random(8, 20),
      icon: 'Network',
      color: 'primary',
    },
    {
      id: 'coverage',
      title: '组网覆盖率',
      value: Math.round(coverage * 100) / 100,
      unit: '%',
      trend: random(1, 5),
      yoyTrend: random(3, 10),
      icon: 'MapPin',
      color: 'success',
    },
    {
      id: 'avg-devices',
      title: '户均组网设备',
      value: Math.round(avgDevices * 10) / 10,
      unit: '台',
      trend: random(0.5, 3),
      yoyTrend: random(1, 5),
      icon: 'Cpu',
      color: 'info',
    },
    {
      id: 'satisfaction',
      title: '组网满意度',
      value: Math.round(satisfaction * 100) / 100,
      unit: '分',
      trend: random(-0.1, 0.3),
      yoyTrend: random(0.05, 0.2),
      icon: 'Smile',
      color: 'warning',
    },
  ];

  return { kpis, monthlyTrend, solutionDistribution, solutionTrend, byRegion, workorderStats };
}

export function generateWeekReviewData(_timeRange: TimeRange): WeekReviewData {
  const districts = ['花垣', '保靖', '永顺', '龙山', '泸溪', '凤凰', '古丈', '吉首', '全州'];

  // Revenue summary
  const revenueSummary = districts.map((d) => {
    const target = Math.round(random(80, 150));
    const complete = Math.round(target * random(0.75, 1.15));
    const rate = Math.round((complete / target) * 1000) / 10;
    const wow = Math.round(random(-15, 20) * 10) / 10;
    const offline = Math.round(complete * random(0.3, 0.6));
    const offlineWow = Math.round(random(-20, 25) * 10) / 10;
    return { district: d, target, complete, rate, wow, offline, offlineWow };
  });

  // Revenue completion (细项指标完成率)
  const revenueCompletion = districts.map((d) => {
    const add = Math.round(random(60, 110) * 10) / 10;
    const upgrade = Math.round(random(50, 105) * 10) / 10;
    const pkg = Math.round(random(55, 115) * 10) / 10;
    const install = Math.round(random(45, 100) * 10) / 10;
    const test = Math.round(random(50, 110) * 10) / 10;
    const downgrade = Math.round(random(30, 80) * 10) / 10;
    return { district: d, add, upgrade, pkg, install, test, downgrade };
  });

  // Revenue WoW change
  const revenueWowChange = districts.map((d) => {
    const add = Math.round(random(-20, 15) * 10) / 10;
    const upgrade = Math.round(random(-25, 20) * 10) / 10;
    const pkg = Math.round(random(-15, 25) * 10) / 10;
    const install = Math.round(random(-30, 10) * 10) / 10;
    const test = Math.round(random(-10, 30) * 10) / 10;
    const downgrade = Math.round(random(-20, 20) * 10) / 10;
    return { district: d, add, upgrade, pkg, install, test, downgrade };
  });

  // 2+8 path completion
  const path2plus8Completion = districts.map((d) => {
    const downgradeControl = Math.round(random(50, 110) * 10) / 10;
    const newRevenue = Math.round(random(55, 115) * 10) / 10;
    const fttr = Math.round(random(0, 100) * 10) / 10;
    const cleaning = Math.round(random(40, 105) * 10) / 10;
    const cloudPc = Math.round(random(30, 95) * 10) / 10;
    const shoujibao = Math.round(random(45, 100) * 10) / 10;
    const screen = Math.round(random(35, 90) * 10) / 10;
    const card = Math.round(random(25, 85) * 10) / 10;
    const health = Math.round(random(40, 100) * 10) / 10;
    const member = Math.round(random(50, 110) * 10) / 10;
    return { district: d, downgradeControl, newRevenue, fttr, cleaning, cloudPc, shoujibao, screen, card, health, member };
  });

  // 2+8 path WoW
  const path2plus8WowChange = districts.map((d) => {
    const downgradeControl = Math.round(random(-20, 20) * 10) / 10;
    const newRevenue = Math.round(random(-15, 25) * 10) / 10;
    const fttr = Math.round(random(-50, 30) * 10) / 10;
    const cleaning = Math.round(random(-20, 25) * 10) / 10;
    const cloudPc = Math.round(random(-30, 20) * 10) / 10;
    const shoujibao = Math.round(random(-15, 20) * 10) / 10;
    const screen = Math.round(random(-25, 15) * 10) / 10;
    const card = Math.round(random(-20, 20) * 10) / 10;
    const health = Math.round(random(-15, 25) * 10) / 10;
    const member = Math.round(random(-20, 20) * 10) / 10;
    return { district: d, downgradeControl, newRevenue, fttr, cleaning, cloudPc, shoujibao, screen, card, health, member };
  });

  // Scale - subscribers
  const scaleSubscribers = districts.map((d) => {
    const daily = Math.round(random(20, 80));
    const rate = Math.round(random(60, 110) * 10) / 10;
    const share = Math.round(random(35, 65) * 10) / 10;
    const shareWow = Math.round(random(-10, 15) * 10) / 10;
    const bigPlan = Math.round(random(40, 90));
    const bigPlanRate = Math.round(random(50, 100) * 10) / 10;
    const pureNew = Math.round(random(50, 85) * 10) / 10;
    return { district: d, daily, rate, share, shareWow, bigPlan, bigPlanRate, pureNew };
  });

  // Scale - broadband
  const scaleBroadband = districts.map((d) => {
    const netAdd = Math.round(random(-20, 60));
    const netAddTarget = Math.round(random(70, 110) * 10) / 10;
    const netAddWow = Math.round(random(-30, 30) * 10) / 10;
    const newAdd = Math.round(random(30, 90));
    const newAddWow = Math.round(random(-25, 25) * 10) / 10;
    const churn = Math.round(random(10, 40));
    const churnWow = Math.round(random(-20, 20) * 10) / 10;
    return { district: d, netAdd, netAddTarget, netAddWow, newAdd, newAddWow, churn, churnWow };
  });

  // Existing - winback
  const existingWinback = districts.map((d) => {
    const scale = Math.round(random(1000, 5000));
    const winback = Math.round(random(50, 200));
    const winbackRate = Math.round(random(3, 8) * 10) / 10;
    const abScale = Math.round(random(200, 1000));
    const abWinback = Math.round(random(10, 60));
    const abWinbackRate = Math.round(random(3, 10) * 10) / 10;
    return { district: d, scale, winback, winbackRate, abScale, abWinback, abWinbackRate };
  });

  // Existing - retention
  const existingRetention = districts.map((d) => {
    const touch = Math.round(random(1000, 5000));
    const group = Math.round(random(300, 1500));
    const groupRate = Math.round(random(25, 45) * 10) / 10;
    const newGroupRate = Math.round(random(30, 55) * 10) / 10;
    const loss = Math.round(random(50, 200));
    const net = Math.round(random(-50, 150));
    return { district: d, touch, group, groupRate, newGroupRate, loss, net };
  });

  // Existing - downgrade
  const existingDowngrade = districts.map((d) => {
    const count = Math.round(random(30, 150));
    const value = Math.round(random(5, 25) * 10) / 10;
    const plus78 = Math.round(random(10, 60));
    const plus78Rate = Math.round(random(20, 50) * 10) / 10;
    const floor = Math.round(random(5, 40));
    const offline = Math.round(random(10, 50));
    return { district: d, count, value, plus78, plus78Rate, floor, offline };
  });

  // Other - home cleaning
  const otherHomeCleaning = districts.map((d) => {
    const income = Math.round(random(3, 15) * 10) / 10;
    const rate = Math.round(random(50, 110) * 10) / 10;
    const wow = Math.round(random(-20, 25) * 10) / 10;
    const orders = Math.round(random(50, 300));
    const orderWow = Math.round(random(-25, 30) * 10) / 10;
    const channels = Math.round(random(10, 40));
    const breakRate = Math.round(random(40, 90) * 10) / 10;
    return { district: d, income, rate, wow, orders, orderWow, channels, breakRate };
  });

  // Other - defusal
  const otherDefusal = districts.map((d) => {
    const target = Math.round(random(80, 150));
    const complete = Math.round(random(60, 140));
    const rate = Math.round((complete / target) * 1000) / 10;
    const keyTarget = Math.round(random(40, 80));
    const keyComplete = Math.round(random(30, 75));
    const keyRate = Math.round((keyComplete / keyTarget) * 1000) / 10;
    return { district: d, target, complete, rate, keyTarget, keyComplete, keyRate };
  });

  // Summary - phoenix
  const summaryPhoenix = districts.map((d) => {
    const revenueRate = Math.round(random(60, 100) * 10) / 10;
    const revenueRank = Math.round(random(1, 9));
    const newShare = Math.round(random(30, 60) * 10) / 10;
    const bigPlanRate = Math.round(random(40, 90) * 10) / 10;
    const broadbandNet = Math.round(random(-10, 40));
    const cleaningRate = Math.round(random(40, 85) * 10) / 10;
    return { district: d, revenueRate, revenueRank, newShare, bigPlanRate, broadbandNet, cleaningRate };
  });

  // Summary - baojing
  const summaryBaojing = districts.map((d) => {
    const revenueRate = Math.round(random(65, 105) * 10) / 10;
    const bigPlanRate = Math.round(random(45, 95) * 10) / 10;
    const broadbandNew = Math.round(random(20, 70));
    const broadbandNet = Math.round(random(-5, 45));
    const downgrade = Math.round(random(20, 100));
    const retainRatio = Math.round(random(0.8, 1.2) * 100) / 100;
    return { district: d, revenueRate, bigPlanRate, broadbandNew, broadbandNet, downgrade, retainRatio };
  });

  // Summary - weekly
  const summaryWeekly = districts.map((d) => {
    const revenueRate = Math.round(random(60, 110) * 10) / 10;
    const pathRate = Math.round(random(55, 105) * 10) / 10;
    const newShare = Math.round(random(30, 65) * 10) / 10;
    const bigPlanRate = Math.round(random(40, 90) * 10) / 10;
    const broadbandNewWow = Math.round(random(-25, 25) * 10) / 10;
    const broadbandNetWow = Math.round(random(-30, 30) * 10) / 10;
    const winbackRate = Math.round(random(3, 9) * 10) / 10;
    const groupRate = Math.round(random(25, 50) * 10) / 10;
    const downgradeWow = Math.round(random(-30, 10) * 10) / 10;
    const retainRatio = Math.round(random(0.7, 1.3) * 100) / 100;
    const cleaningRate = Math.round(random(40, 90) * 10) / 10;
    const defusalRate = Math.round(random(50, 100) * 10) / 10;
    const weakCount = Math.round(random(0, 6));
    return { district: d, revenueRate, pathRate, newShare, bigPlanRate, broadbandNewWow, broadbandNetWow, winbackRate, groupRate, downgradeWow, retainRatio, cleaningRate, defusalRate, weakCount };
  });

  // Existing - winback WoW
  const existingWinbackWow = districts.map((d) => {
    const winbackWow = Math.round(random(-30, 30) * 10) / 10;
    const winbackRateWow = Math.round(random(-2, 3) * 10) / 10;
    const abWinbackWow = Math.round(random(-40, 40) * 10) / 10;
    const abWinbackRateWow = Math.round(random(-3, 4) * 10) / 10;
    return { district: d, winbackWow, winbackRateWow, abWinbackWow, abWinbackRateWow };
  });

  // Existing - retention WoW
  const existingRetentionWow = districts.map((d) => {
    const touchWow = Math.round(random(-15, 20) * 10) / 10;
    const groupWow = Math.round(random(-20, 25) * 10) / 10;
    const groupRateWow = Math.round(random(-5, 5) * 10) / 10;
    const newGroupRateWow = Math.round(random(-6, 6) * 10) / 10;
    const lossWow = Math.round(random(-30, 30) * 10) / 10;
    const netChange = Math.round(random(-20, 20));
    return { district: d, touchWow, groupWow, groupRateWow, newGroupRateWow, lossWow, netChange };
  });

  // Existing - risk (中高端风险修复)
  const existingRisk = districts.map((d) => {
    const touchScale = Math.round(random(800, 3000));
    const touchContractRate = Math.round(random(30, 55) * 10) / 10;
    const broadbandContractRate = Math.round(random(25, 45) * 10) / 10;
    const tariffContractRate = Math.round(random(20, 40) * 10) / 10;
    const autoChargeRate = Math.round(random(15, 35) * 10) / 10;
    return { district: d, touchScale, touchContractRate, broadbandContractRate, tariffContractRate, autoChargeRate };
  });

  // Existing - risk WoW
  const existingRiskWow = districts.map((d) => {
    const touchScaleWow = Math.round(random(-20, 15) * 10) / 10;
    const touchContractRateWow = Math.round(random(-5, 5) * 10) / 10;
    const broadbandContractRateWow = Math.round(random(-5, 5) * 10) / 10;
    const tariffContractRateWow = Math.round(random(-5, 5) * 10) / 10;
    const autoChargeRateWow = Math.round(random(-5, 5) * 10) / 10;
    return { district: d, touchScaleWow, touchContractRateWow, broadbandContractRateWow, tariffContractRateWow, autoChargeRateWow };
  });

  // Existing - takeover (接盘运营)
  const existingTakeover = districts.map((d) => {
    const terminalTarget = Math.round(random(20, 60));
    const terminalTakeover = Math.round(random(15, 55));
    const terminalRate = Math.round((terminalTakeover / Math.max(terminalTarget, 1)) * 1000) / 10;
    const terminalContract = Math.round(random(5, 25));
    const terminalOther = Math.round(random(5, 20));
    const packageTarget = Math.round(random(30, 80));
    const packageTakeover = Math.round(random(25, 75));
    const packageRate = Math.round((packageTakeover / Math.max(packageTarget, 1)) * 1000) / 10;
    const packageDiscount = Math.round(random(10, 35));
    const packageOther = Math.round(random(8, 30));
    return { district: d, terminalTarget, terminalTakeover, terminalRate, terminalContract, terminalOther, packageTarget, packageTakeover, packageRate, packageDiscount, packageOther };
  });

  // Existing - takeover WoW
  const existingTakeoverWow = districts.map((d) => {
    const terminalTakeoverWow = Math.round(random(-25, 25) * 10) / 10;
    const terminalContractWow = Math.round(random(-30, 30) * 10) / 10;
    const terminalOtherWow = Math.round(random(-20, 20) * 10) / 10;
    const packageTakeoverWow = Math.round(random(-20, 25) * 10) / 10;
    const packageDiscountWow = Math.round(random(-25, 25) * 10) / 10;
    const packageOtherWow = Math.round(random(-20, 20) * 10) / 10;
    return { district: d, terminalTakeoverWow, terminalContractWow, terminalOtherWow, packageTakeoverWow, packageDiscountWow, packageOtherWow };
  });

  // Existing - rescue (拆机挽留)
  const existingRescue = districts.map((d) => {
    const orderRate = Math.round(random(40, 80) * 10) / 10;
    const visitRate = Math.round(random(50, 90) * 10) / 10;
    const success = Math.round(random(20, 80));
    return { district: d, orderRate, visitRate, success };
  });

  // Existing - rescue WoW
  const existingRescueWow = districts.map((d) => {
    const orderRateWow = Math.round(random(-10, 10) * 10) / 10;
    const visitRateWow = Math.round(random(-8, 12) * 10) / 10;
    const successWow = Math.round(random(-30, 30) * 10) / 10;
    return { district: d, orderRateWow, visitRateWow, successWow };
  });

  // Existing - downgrade WoW
  const existingDowngradeWow = districts.map((d) => {
    const countWow = Math.round(random(-30, 20) * 10) / 10;
    const valueWow = Math.round(random(-30, 20) * 10) / 10;
    const plus78Wow = Math.round(random(-35, 15) * 10) / 10;
    const plus78RateWow = Math.round(random(-10, 10) * 10) / 10;
    const floorWow = Math.round(random(-20, 80) * 10) / 10;
    const offlineWow = Math.round(random(-25, 25) * 10) / 10;
    return { district: d, countWow, valueWow, plus78Wow, plus78RateWow, floorWow, offlineWow };
  });

  // Existing - retain (存量保拓)
  const existingRetain = districts.map((d) => {
    const carryIn = Math.round(random(50, 200));
    const carryIn78Rate = Math.round(random(40, 70) * 10) / 10;
    const carryInWow = Math.round(random(-20, 25) * 10) / 10;
    const carryOut = Math.round(random(30, 150));
    const carryOut78Rate = Math.round(random(35, 65) * 10) / 10;
    const carryOutWow = Math.round(random(-15, 20) * 10) / 10;
    const retainRatio = Math.round(random(0.7, 1.3) * 100) / 100;
    const retainRatioWow = Math.round(random(-0.2, 0.2) * 100) / 100;
    const discountRate = Math.round(random(50, 85) * 10) / 10;
    const zeroDirectRate = Math.round(random(20, 45) * 10) / 10;
    const zeroDirectWow = Math.round(random(-10, 10) * 10) / 10;
    const zeroChannelRate = Math.round(random(25, 50) * 10) / 10;
    const zeroChannelWow = Math.round(random(-10, 10) * 10) / 10;
    return { district: d, carryIn, carryIn78Rate, carryInWow, carryOut, carryOut78Rate, carryOutWow, retainRatio, retainRatioWow, discountRate, zeroDirectRate, zeroDirectWow, zeroChannelRate, zeroChannelWow };
  });

  // Other - home cleaning channels (渠道破零细分)
  const otherHomeCleaningChannels = districts.map((d) => {
    const channelCount = Math.round(random(10, 40));
    const breakRate = Math.round(random(40, 90) * 10) / 10;
    const breakRank = Math.round(random(1, 9));
    const breakRateWow = Math.round(random(-15, 20) * 10) / 10;
    const channelWow = Math.round(random(-10, 15) * 10) / 10;
    const rankWow = Math.round(random(-3, 3));
    const entityBreak = Math.round(random(3, 15));
    const entityBreakWow = Math.round(random(-20, 25) * 10) / 10;
    const directBreak = Math.round(random(2, 12));
    const directBreakWow = Math.round(random(-25, 30) * 10) / 10;
    const followBreak = Math.round(random(2, 10));
    const followBreakWow = Math.round(random(-20, 25) * 10) / 10;
    const ownBreak = Math.round(random(1, 8));
    const ownBreakWow = Math.round(random(-20, 25) * 10) / 10;
    return { district: d, channelCount, breakRate, breakRank, breakRateWow, channelWow, rankWow, entityBreak, entityBreakWow, directBreak, directBreakWow, followBreak, followBreakWow, ownBreak, ownBreakWow };
  });

  // Other - defusal detail (拆弹行动重保/全量细分)
  const otherDefusalDetail = districts.map((d) => {
    const keyTarget = Math.round(random(80, 150));
    const keyToday = Math.round(random(5, 20));
    const keyCumulative = Math.round(random(60, 140));
    const keyProgress = Math.round((keyCumulative / Math.max(keyTarget, 1)) * 1000) / 10;
    const keyRank = Math.round(random(1, 9));
    const keyBase = Math.round(random(500, 1500));
    const keyDone = Math.round(random(300, 900));
    const keyDoneRate = Math.round((keyDone / Math.max(keyBase, 1)) * 1000) / 10;
    const allTarget = Math.round(random(150, 300));
    const allToday = Math.round(random(10, 40));
    const allCumulative = Math.round(random(120, 280));
    const allProgress = Math.round((allCumulative / Math.max(allTarget, 1)) * 1000) / 10;
    const allRank = Math.round(random(1, 9));
    const allBase = Math.round(random(1000, 3000));
    const allDone = Math.round(random(600, 1800));
    const allDoneRate = Math.round((allDone / Math.max(allBase, 1)) * 1000) / 10;
    return { district: d, keyTarget, keyToday, keyCumulative, keyProgress, keyRank, keyBase, keyDone, keyDoneRate, allTarget, allToday, allCumulative, allProgress, allRank, allBase, allDone, allDoneRate };
  });

  // Chart data
  const revenueTrend = makeTrend(
    ['W1', 'W2', 'W3', 'W4'],
    [
      { name: '销售收入', values: [random(80, 95), random(82, 98), random(85, 100), random(88, 105)], color: '#0070C0' },
      { name: '2+8路径', values: [random(55, 75), random(58, 78), random(60, 80), random(62, 82)], color: '#FA8C16' },
    ]
  );

  const scaleTrend = makeTrend(
    ['W1', 'W2', 'W3', 'W4'],
    [
      { name: '新增放号', values: [random(60, 90), random(62, 92), random(65, 95), random(68, 98)], color: '#0070C0' },
      { name: '宽带净增', values: [random(-10, 40), random(-8, 42), random(-5, 45), random(-3, 48)], color: '#1AAB55' },
    ]
  );

  const path2plus8Distribution = normalizeDistribution([
    { name: '存量降档控损', value: random(15, 25) },
    { name: '新增客户创收', value: random(20, 30) },
    { name: 'FTTR直降礼包', value: random(5, 12) },
    { name: '爱家清洗', value: random(8, 15) },
    { name: '云电脑', value: random(5, 10) },
    { name: '守机宝', value: random(6, 12) },
    { name: '大屏包', value: random(5, 11) },
    { name: '特色卡品', value: random(4, 9) },
    { name: '健康宝', value: random(5, 10) },
    { name: '甄选会员', value: random(8, 14) },
  ]);

  const existingDistribution = normalizeDistribution([
    { name: '异网赢回', value: random(15, 25) },
    { name: '亲情网加固', value: random(20, 30) },
    { name: '中高端修复', value: random(18, 28) },
    { name: '接盘运营', value: random(12, 22) },
    { name: '拆机挽留', value: random(10, 18) },
    { name: '降档压控', value: random(15, 25) },
    { name: '保拓运营', value: random(10, 20) },
  ]);

  const otherDistribution = normalizeDistribution([
    { name: '爱家清洗', value: random(40, 55) },
    { name: '拆弹行动', value: random(45, 60) },
  ]);

  const kpis: KPIMetric[] = [
    {
      id: 'week-revenue',
      title: '本周收入完成率',
      value: Math.round(random(80, 100) * 10) / 10,
      unit: '%',
      trend: random(-5, 10),
      icon: 'DollarSign',
      color: 'primary',
    },
    {
      id: 'new-subscribers',
      title: '新增放号完成率',
      value: Math.round(random(70, 105) * 10) / 10,
      unit: '%',
      trend: random(-8, 12),
      icon: 'Users',
      color: 'success',
    },
    {
      id: 'broadband-net',
      title: '宽带净增',
      value: Math.round(random(-10, 50)),
      unit: '户',
      trend: random(-15, 20),
      icon: 'Wifi',
      color: 'info',
    },
    {
      id: 'retention',
      title: '客户保拓比',
      value: Math.round(random(0.8, 1.3) * 100) / 100,
      unit: '',
      trend: random(-0.1, 0.2),
      icon: 'Heart',
      color: 'warning',
    },
    {
      id: 'home-cleaning',
      title: '爱家清洗完成率',
      value: Math.round(random(50, 100) * 10) / 10,
      unit: '%',
      trend: random(-10, 15),
      icon: 'Home',
      color: 'danger',
    },
    {
      id: 'defusal',
      title: '拆弹攻坚完成率',
      value: Math.round(random(60, 105) * 10) / 10,
      unit: '%',
      trend: random(-5, 10),
      icon: 'Target',
      color: 'primary',
    },
  ];

  return {
    kpis,
    revenueSummary,
    revenueCompletion,
    revenueWowChange,
    path2plus8Completion,
    path2plus8WowChange,
    scaleSubscribers,
    scaleBroadband,
    existingWinback,
    existingWinbackWow,
    existingRetention,
    existingRetentionWow,
    existingRisk,
    existingRiskWow,
    existingTakeover,
    existingTakeoverWow,
    existingRetain,
    existingRescue,
    existingRescueWow,
    existingDowngrade,
    existingDowngradeWow,
    otherHomeCleaning,
    otherHomeCleaningChannels,
    otherDefusal,
    otherDefusalDetail,
    summaryPhoenix,
    summaryBaojing,
    summaryWeekly,
    revenueTrend,
    scaleTrend,
    path2plus8Distribution,
    existingDistribution,
    otherDistribution,
  };
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
      id: 'customer-acquisition',
      name: '客户新增',
      icon: 'Users',
      color: 'success',
      path: '/customer-acquisition',
      kpis: [
        { title: '本月新增', value: Math.round(random(30, 55) * 10) / 10, unit: '万户', trend: random(3, 12) },
        { title: '留存率', value: Math.round(random(96, 99) * 100) / 100, unit: '%', trend: random(0.2, 1.5) },
      ],
    },
    {
      id: 'broadband',
      name: '宽带新增',
      icon: 'Wifi',
      color: 'info',
      path: '/broadband',
      kpis: [
        { title: '本月新增', value: Math.round(random(60, 110) * 10) / 10, unit: '万户', trend: random(5, 15) },
        { title: '千兆占比', value: Math.round(random(18, 32) * 100) / 100, unit: '%', trend: random(2, 6) },
      ],
    },
    {
      id: 'smart-home',
      name: '智家产品',
      icon: 'Home',
      color: 'warning',
      path: '/smart-home',
      kpis: [
        { title: '本月销量', value: Math.round(random(10, 25) * 10) / 10, unit: '万件', trend: random(5, 18) },
        { title: '渗透率', value: Math.round(random(25, 45) * 100) / 100, unit: '%', trend: random(1, 5) },
      ],
    },
    {
      id: 'rights-products',
      name: '权益产品',
      icon: 'Gift',
      color: 'danger',
      path: '/rights-products',
      kpis: [
        { title: '订阅数', value: Math.round(random(60, 110) * 10) / 10, unit: '万份', trend: random(5, 15) },
        { title: '使用率', value: Math.round(random(62, 80) * 100) / 100, unit: '%', trend: random(-1, 4) },
      ],
    },
    {
      id: 'home-networking',
      name: '家庭组网',
      icon: 'Network',
      color: 'primary',
      path: '/home-networking',
      kpis: [
        { title: '本月订单', value: Math.round(random(8, 16) * 10) / 10, unit: '万单', trend: random(3, 12) },
        { title: '覆盖率', value: Math.round(random(40, 55) * 100) / 100, unit: '%', trend: random(1, 5) },
      ],
    },
  ];

  return { modules };
}
