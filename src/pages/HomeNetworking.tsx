import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Network, LayoutDashboard, Settings, MapPin, ClipboardList } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import ModuleLayout from '../components/layout/ModuleLayout';
import SubIconNav from '../components/common/SubIconNav';
import TimeRangeSelector from '../components/common/TimeRangeSelector';
import { useModuleData } from '../hooks/useModuleData';
import type { TimeRange, HomeNetworkingData } from '../types';
import HomeNetworkingOverview from './home-networking/Overview';
import HomeNetworkingSolution from './home-networking/Solution';
import HomeNetworkingCoverage from './home-networking/Coverage';
import HomeNetworkingWorkorder from './home-networking/Workorder';

const subNavItems = [
  { icon: LayoutDashboard, label: '总览', path: '/home-networking/overview' },
  { icon: Settings, label: '方案分析', path: '/home-networking/solution' },
  { icon: MapPin, label: '覆盖地图', path: '/home-networking/coverage' },
  { icon: ClipboardList, label: '工单管理', path: '/home-networking/workorder' },
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

export default function HomeNetworking() {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const timeRange = useQueryRange();

  const { data, loading, refresh } = useModuleData<HomeNetworkingData>('home-networking', timeRange);

  useEffect(() => {
    if (location.pathname === '/home-networking') {
      navigate('/home-networking/overview', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleTimeRangeChange = (range: TimeRange) => {
    const params = new URLSearchParams(location.search);
    params.set('range', range);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const activePath = location.pathname;

  return (
    <ModuleLayout title="家庭组网" icon={<Network className="w-6 h-6" />}>
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
          <Route path="overview" element={<HomeNetworkingOverview data={data} isDark={isDark} onRefresh={refresh} />} />
          <Route path="solution" element={<HomeNetworkingSolution data={data} isDark={isDark} onRefresh={refresh} />} />
          <Route path="coverage" element={<HomeNetworkingCoverage data={data} isDark={isDark} onRefresh={refresh} />} />
          <Route path="workorder" element={<HomeNetworkingWorkorder data={data} isDark={isDark} onRefresh={refresh} />} />
        </Routes>
      )}
    </ModuleLayout>
  );
}
