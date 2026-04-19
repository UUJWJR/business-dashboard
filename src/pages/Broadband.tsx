import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Wifi, LayoutDashboard, Zap, MapPin, BarChart3 } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import ModuleLayout from '../components/layout/ModuleLayout';
import SubIconNav from '../components/common/SubIconNav';
import TimeRangeSelector from '../components/common/TimeRangeSelector';
import { useModuleData } from '../hooks/useModuleData';
import type { TimeRange, BroadbandData } from '../types';
import BroadbandOverview from './broadband/Overview';
import BroadbandSpeed from './broadband/Speed';
import BroadbandCoverage from './broadband/Coverage';
import BroadbandCompetitor from './broadband/Competitor';

const subNavItems = [
  { icon: LayoutDashboard, label: '总览', path: '/broadband/overview' },
  { icon: Zap, label: '速率分析', path: '/broadband/speed' },
  { icon: MapPin, label: '区域覆盖', path: '/broadband/coverage' },
  { icon: BarChart3, label: '竞品对比', path: '/broadband/competitor' },
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

export default function Broadband() {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const timeRange = useQueryRange();

  const { data, loading, refresh } = useModuleData<BroadbandData>('broadband', timeRange);

  useEffect(() => {
    if (location.pathname === '/broadband') {
      navigate('/broadband/overview', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleTimeRangeChange = (range: TimeRange) => {
    const params = new URLSearchParams(location.search);
    params.set('range', range);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const activePath = location.pathname;

  return (
    <ModuleLayout title="宽带新增" icon={<Wifi className="w-6 h-6" />}>
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
          <Route path="overview" element={<BroadbandOverview data={data} isDark={isDark} onRefresh={refresh} />} />
          <Route path="speed" element={<BroadbandSpeed data={data} isDark={isDark} onRefresh={refresh} />} />
          <Route path="coverage" element={<BroadbandCoverage data={data} isDark={isDark} onRefresh={refresh} />} />
          <Route path="competitor" element={<BroadbandCompetitor data={data} isDark={isDark} onRefresh={refresh} />} />
        </Routes>
      )}
    </ModuleLayout>
  );
}
