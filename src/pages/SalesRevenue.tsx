import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, LayoutDashboard, MapPin, Package, Share2 } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import ModuleLayout from '../components/layout/ModuleLayout';
import SubIconNav from '../components/common/SubIconNav';
import TimeRangeSelector from '../components/common/TimeRangeSelector';
import { useModuleData } from '../hooks/useModuleData';
import type { TimeRange, SalesRevenueData } from '../types';
import SalesRevenueOverview from './sales-revenue/Overview';
import SalesRevenueByRegion from './sales-revenue/ByRegion';
import SalesRevenueByProduct from './sales-revenue/ByProduct';
import SalesRevenueByChannel from './sales-revenue/ByChannel';

const subNavItems = [
  { icon: LayoutDashboard, label: '总览', path: '/sales-revenue/overview' },
  { icon: MapPin, label: '分地区', path: '/sales-revenue/by-region' },
  { icon: Package, label: '分产品', path: '/sales-revenue/by-product' },
  { icon: Share2, label: '分渠道', path: '/sales-revenue/by-channel' },
];

function useQueryRange(): TimeRange {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const range = params.get('range');
  if (range === '7d' || range === '30d' || range === '90d' || range === 'year') {
    return range;
  }
  return '30d';
}

export default function SalesRevenue() {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const timeRange = useQueryRange();

  const { data, loading, refresh } = useModuleData<SalesRevenueData>('sales-revenue', timeRange);

  // Redirect /sales-revenue to /sales-revenue/overview
  useEffect(() => {
    if (location.pathname === '/sales-revenue') {
      navigate('/sales-revenue/overview', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleTimeRangeChange = (range: TimeRange) => {
    const params = new URLSearchParams(location.search);
    params.set('range', range);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const activePath = location.pathname;

  return (
    <ModuleLayout title="销售收入" icon={<TrendingUp className="w-6 h-6" />}>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <SubIconNav items={subNavItems} activePath={activePath} />
          <TimeRangeSelector value={timeRange} onChange={handleTimeRangeChange} />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      )}

      {!loading && data && (
        <Routes>
          <Route path="overview" element={<SalesRevenueOverview data={data} isDark={isDark} onRefresh={refresh} />} />
          <Route path="by-region" element={<SalesRevenueByRegion data={data} isDark={isDark} onRefresh={refresh} />} />
          <Route path="by-product" element={<SalesRevenueByProduct data={data} isDark={isDark} onRefresh={refresh} />} />
          <Route path="by-channel" element={<SalesRevenueByChannel data={data} isDark={isDark} onRefresh={refresh} />} />
        </Routes>
      )}
    </ModuleLayout>
  );
}
