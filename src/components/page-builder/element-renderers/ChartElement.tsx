import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { ChartPayload } from '../../../types/pageBuilder';
import type { TrendChartData, DistributionData, RegionData } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';
import { chartThemes } from '../../../utils/chartThemes';
import SimpleBarChart from '../../charts/SimpleBarChart';
import SimpleLineChart from '../../charts/SimpleLineChart';
import SimplePieChart from '../../charts/SimplePieChart';
import ScatterChart from '../../charts/ScatterChart';
import RadarChart from '../../charts/RadarChart';
import WaterfallChart from '../../charts/WaterfallChart';

interface ChartElementProps {
  content: ChartPayload;
}

export default function ChartElement({ content }: ChartElementProps) {
  const { isDark } = useTheme();
  const { chartType, chartTheme, title, data } = content;
  const theme = chartThemes[chartTheme] || chartThemes.mckinsey;

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
      case 'scatter':
        return (
          <ScatterChart
            title={title}
            data={data as import('../../../types/pageBuilder').ScatterData}
            theme={theme}
            onRefresh={mockRefresh}
            className="h-full border-0 shadow-none"
          />
        );
      case 'radar':
        return (
          <RadarChart
            title={title}
            data={data as import('../../../types/pageBuilder').RadarData}
            theme={theme}
            onRefresh={mockRefresh}
            className="h-full border-0 shadow-none"
          />
        );
      case 'waterfall':
        return (
          <WaterfallChart
            title={title}
            data={data as import('../../../types/pageBuilder').WaterfallDataItem[]}
            theme={theme}
            onRefresh={mockRefresh}
            className="h-full border-0 shadow-none"
          />
        );
      default:
        return null;
    }
  }, [chartType, title, data, isDark, theme]);

  return (
    <div className="w-full h-full overflow-hidden">
      {chartComponent}
    </div>
  );
}
