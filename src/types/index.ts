export type TimeRange = '7d' | '30d' | '90d' | 'year';

export interface KPIData {
  id: string;
  title: string;
  value: number;
  unit: string;
  trend: number;
  icon: string;
  color: string;
}

export interface KPIMetric extends KPIData {
  yoyTrend?: number;
}

export interface TrendChartData {
  labels: string[];
  datasets: {
    name: string;
    values: number[];
    color?: string;
  }[];
}

export interface DistributionData {
  name: string;
  value: number;
  percent?: number;
}

export interface RegionData {
  name: string;
  value: number;
  target: number;
}

export interface ModuleConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  path: string;
}

export interface SalesRevenueData {
  kpis: KPIMetric[];
  monthlyTrend: TrendChartData;
  composition: DistributionData[];
  byRegion: RegionData[];
  byProduct: DistributionData[];
  byChannel: DistributionData[];
}

export interface CustomerAcquisitionData {
  kpis: KPIMetric[];
  dailyTrend: TrendChartData;
  monthlyTrend: TrendChartData;
  typeDistribution: DistributionData[];
  channelDistribution: DistributionData[];
  churnRisk: { level: string; count: number }[];
}

export interface BroadbandData {
  kpis: KPIMetric[];
  monthlyTrend: TrendChartData;
  speedDistribution: DistributionData[];
  byRegion: RegionData[];
  competitorShare: DistributionData[];
}

export interface SmartHomeData {
  kpis: KPIMetric[];
  monthlyTrend: TrendChartData;
  productDistribution: DistributionData[];
  bindingRate: TrendChartData;
  topProducts: { name: string; sales: number }[];
}

export interface RightsProductsData {
  kpis: KPIMetric[];
  monthlyTrend: TrendChartData;
  typeDistribution: DistributionData[];
  topRights: { name: string; activeUsers: number }[];
  revenueByType: DistributionData[];
}

export interface HomeNetworkingData {
  kpis: KPIMetric[];
  monthlyTrend: TrendChartData;
  solutionDistribution: DistributionData[];
  byRegion: RegionData[];
  workorderStats: { status: string; count: number }[];
}

export interface HomePreviewData {
  modules: {
    id: string;
    name: string;
    icon: string;
    color: string;
    path: string;
    kpis: { title: string; value: number; unit: string; trend: number }[];
  }[];
}

export interface RevenueData {
  months: string[];
  totalRevenue: number[];
  netProfit: number[];
}

export interface UserGrowthData {
  months: string[];
  newUsers: number[];
  activeUsers: number[];
}

export interface MarketShareData {
  name: string;
  value: number;
}

export interface RadarData {
  indicator: { name: string; max: number }[];
  current: number[];
  previous: number[];
}

export interface ComboData {
  channels: string[];
  newUsers: number[];
  conversionRate: number[];
}

export interface DashboardData {
  kpis: KPIData[];
  revenue: RevenueData;
  userGrowth: UserGrowthData;
  marketShare: MarketShareData[];
  radar: RadarData;
  combo: ComboData;
}
