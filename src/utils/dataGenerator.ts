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

  return { kpis, monthlyTrend, composition, byRegion, byProduct, byChannel };
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

  const churnRisk = [
    { level: '高风险', count: randomInt(800, 1500) },
    { level: '中风险', count: randomInt(2000, 4000) },
    { level: '低风险', count: randomInt(5000, 9000) },
  ];

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

  return { kpis, dailyTrend, monthlyTrend, typeDistribution, channelDistribution, churnRisk };
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

  return { kpis, monthlyTrend, speedDistribution, byRegion, competitorShare };
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

  return { kpis, monthlyTrend, productDistribution, bindingRate, topProducts };
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

  return { kpis, monthlyTrend, typeDistribution, topRights, revenueByType };
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

  return { kpis, monthlyTrend, solutionDistribution, byRegion, workorderStats };
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
