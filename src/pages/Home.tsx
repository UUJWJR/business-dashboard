import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import ModuleLayout from '../components/layout/ModuleLayout';
import TimeRangeSelector from '../components/common/TimeRangeSelector';
import ModuleIconCard from '../components/common/ModuleIconCard';
import { useModuleData } from '../hooks/useModuleData';
import type { TimeRange, HomePreviewData } from '../types';
import { LayoutDashboard } from 'lucide-react';

export default function Home() {
  const { isDark } = useTheme();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const { data } = useModuleData<HomePreviewData>('home-preview', timeRange);

  return (
    <ModuleLayout title="EasyWork工作台" icon={<LayoutDashboard className="w-6 h-6" />}>
      <div className="flex items-center justify-between mb-6">
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        <div className="text-sm text-gray-500 dark:text-gray-400">
          欢迎回来，管理员
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.modules.map((module, index) => (
          <ModuleIconCard
            key={module.id}
            module={module}
            kpis={module.kpis}
            index={index}
          />
        ))}
      </div>
    </ModuleLayout>
  );
}
