import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Home, LayoutDashboard, Trophy, Link2, MessageSquare } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import ModuleLayout from '../components/layout/ModuleLayout';
import SubIconNav from '../components/common/SubIconNav';
import TimeRangeSelector from '../components/common/TimeRangeSelector';
import { useModuleData } from '../hooks/useModuleData';
import type { TimeRange, SmartHomeData } from '../types';
import SmartHomeOverview from './smart-home/Overview';
import SmartHomeRanking from './smart-home/Ranking';
import SmartHomeBinding from './smart-home/Binding';
import SmartHomeFeedback from './smart-home/Feedback';

const subNavItems = [
  { icon: LayoutDashboard, label: '总览', path: '/smart-home/overview' },
  { icon: Trophy, label: '产品排行', path: '/smart-home/ranking' },
  { icon: Link2, label: '绑定分析', path: '/smart-home/binding' },
  { icon: MessageSquare, label: '用户反馈', path: '/smart-home/feedback' },
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

export default function SmartHome() {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const timeRange = useQueryRange();

  const { data, loading, refresh } = useModuleData<SmartHomeData>('smart-home', timeRange);

  useEffect(() => {
    if (location.pathname === '/smart-home') {
      navigate('/smart-home/overview', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleTimeRangeChange = (range: TimeRange) => {
    const params = new URLSearchParams(location.search);
    params.set('range', range);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const activePath = location.pathname;

  return (
    <ModuleLayout title="智家产品" icon={<Home className="w-6 h-6" />}>
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
          <Route path="overview" element={<SmartHomeOverview data={data} isDark={isDark} onRefresh={refresh} />} />
          <Route path="ranking" element={<SmartHomeRanking data={data} isDark={isDark} onRefresh={refresh} />} />
          <Route path="binding" element={<SmartHomeBinding data={data} isDark={isDark} onRefresh={refresh} />} />
          <Route path="feedback" element={<SmartHomeFeedback data={data} isDark={isDark} onRefresh={refresh} />} />
        </Routes>
      )}
    </ModuleLayout>
  );
}
