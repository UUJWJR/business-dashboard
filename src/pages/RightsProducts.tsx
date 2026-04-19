import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Gift, LayoutDashboard, Trophy, UserCircle, DollarSign } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import ModuleLayout from '../components/layout/ModuleLayout';
import SubIconNav from '../components/common/SubIconNav';
import TimeRangeSelector from '../components/common/TimeRangeSelector';
import { useModuleData } from '../hooks/useModuleData';
import type { TimeRange, RightsProductsData } from '../types';
import RightsProductsOverview from './rights-products/Overview';
import RightsProductsRanking from './rights-products/Ranking';
import RightsProductsProfile from './rights-products/Profile';
import RightsProductsRevenue from './rights-products/Revenue';

const subNavItems = [
  { icon: LayoutDashboard, label: '总览', path: '/rights-products/overview' },
  { icon: Trophy, label: '权益排行', path: '/rights-products/ranking' },
  { icon: UserCircle, label: '用户画像', path: '/rights-products/profile' },
  { icon: DollarSign, label: '收入分析', path: '/rights-products/revenue' },
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

export default function RightsProducts() {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const timeRange = useQueryRange();

  const { data, loading, refresh } = useModuleData<RightsProductsData>('rights-products', timeRange);

  useEffect(() => {
    if (location.pathname === '/rights-products') {
      navigate('/rights-products/overview', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleTimeRangeChange = (range: TimeRange) => {
    const params = new URLSearchParams(location.search);
    params.set('range', range);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const activePath = location.pathname;

  return (
    <ModuleLayout title="权益产品" icon={<Gift className="w-6 h-6" />}>
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
          <Route path="overview" element={<RightsProductsOverview data={data} isDark={isDark} onRefresh={refresh} />} />
          <Route path="ranking" element={<RightsProductsRanking data={data} isDark={isDark} onRefresh={refresh} />} />
          <Route path="profile" element={<RightsProductsProfile data={data} isDark={isDark} onRefresh={refresh} />} />
          <Route path="revenue" element={<RightsProductsRevenue data={data} isDark={isDark} onRefresh={refresh} />} />
        </Routes>
      )}
    </ModuleLayout>
  );
}
