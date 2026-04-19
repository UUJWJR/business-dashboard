import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Users, LayoutDashboard, UserCircle, Share2, AlertTriangle } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import ModuleLayout from '../components/layout/ModuleLayout';
import SubIconNav from '../components/common/SubIconNav';
import TimeRangeSelector from '../components/common/TimeRangeSelector';
import { ExportButton } from '../components/common/ExportButton';
import {
  kpiToSheet,
  trendToSheet,
  distributionToSheet,
  churnRiskToSheet,
  exportToExcel,
} from '../utils/excelExport';
import { useModuleData } from '../hooks/useModuleData';
import type { TimeRange, CustomerAcquisitionData } from '../types';
import CustomerAcquisitionOverview from './customer-acquisition/Overview';
import CustomerAcquisitionProfile from './customer-acquisition/Profile';
import CustomerAcquisitionChannel from './customer-acquisition/Channel';
import CustomerAcquisitionChurn from './customer-acquisition/Churn';

const subNavItems = [
  { icon: LayoutDashboard, label: '总览', path: '/customer-acquisition/overview' },
  { icon: UserCircle, label: '客户画像', path: '/customer-acquisition/profile' },
  { icon: Share2, label: '渠道分析', path: '/customer-acquisition/channel' },
  { icon: AlertTriangle, label: '流失预警', path: '/customer-acquisition/churn' },
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

export default function CustomerAcquisition() {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const timeRange = useQueryRange();

  const { data, loading, refresh } = useModuleData<CustomerAcquisitionData>('customer-acquisition', timeRange);

  useEffect(() => {
    if (location.pathname === '/customer-acquisition') {
      navigate('/customer-acquisition/overview', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleTimeRangeChange = (range: TimeRange) => {
    const params = new URLSearchParams(location.search);
    params.set('range', range);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const activePath = location.pathname;

  const handleExport = () => {
    if (!data) return;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    exportToExcel(`客户新增报表_${dateStr}`, [
      kpiToSheet(data.kpis),
      trendToSheet(data.dailyTrend, '每日趋势'),
      trendToSheet(data.monthlyTrend, '月度趋势'),
      distributionToSheet(data.typeDistribution, '客户类型'),
      distributionToSheet(data.channelDistribution, '渠道分布'),
      churnRiskToSheet(data.churnRisk, '流失预警'),
    ]);
  };

  return (
    <ModuleLayout title="客户新增" icon={<Users className="w-6 h-6" />} actions={<ExportButton onExport={handleExport} />}>
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
          <Route path="overview" element={<CustomerAcquisitionOverview data={data} isDark={isDark} onRefresh={refresh} />} />
          <Route path="profile" element={<CustomerAcquisitionProfile data={data} isDark={isDark} onRefresh={refresh} />} />
          <Route path="channel" element={<CustomerAcquisitionChannel data={data} isDark={isDark} onRefresh={refresh} />} />
          <Route path="churn" element={<CustomerAcquisitionChurn data={data} isDark={isDark} onRefresh={refresh} />} />
        </Routes>
      )}
    </ModuleLayout>
  );
}
