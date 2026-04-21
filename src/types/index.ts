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
  byProductTrend: TrendChartData;
  byChannelTrend: TrendChartData;
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
