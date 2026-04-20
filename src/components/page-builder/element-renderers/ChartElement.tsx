import { useMemo } from 'react';
import type { ChartPayload } from '../../../types/pageBuilder';
import type { TrendChartData, DistributionData, RegionData } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';
import SimpleBarChart from '../../charts/SimpleBarChart';
import SimpleLineChart from '../../charts/SimpleLineChart';
import SimplePieChart from '../../charts/SimplePieChart';

interface ChartElementProps {
  content: ChartPayload;
}

export default function ChartElement({ content }: ChartElementProps) {
  const { isDark } = useTheme();
  const { chartType, title, data } = content;

  const mockRefresh = () => {};

  const chartComponent = useMemo(() => {
    switch (chartType) {
      case 'bar':
        return (
          <SimpleBarChart
            title={title}
            data={data as TrendChartData | RegionData[]}
            isDark={isDark}
            onRefresh={mockRefresh}
            className="h-full border-0 shadow-none"
          />
        );
      case 'line':
        return (
          <SimpleLineChart
            title={title}
            data={data as TrendChartData}
            isDark={isDark}
            onRefresh={mockRefresh}
            className="h-full border-0 shadow-none"
          />
        );
      case 'pie':
        return (
          <SimplePieChart
            title={title}
            data={data as DistributionData[]}
            isDark={isDark}
            onRefresh={mockRefresh}
            className="h-full border-0 shadow-none"
          />
        );
      default:
        return null;
    }
  }, [chartType, title, data, isDark]);

  return (
    <div className="w-full h-full overflow-hidden">
      {chartComponent}
    </div>
  );
}
