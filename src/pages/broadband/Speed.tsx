import SimplePieChart from '../../components/charts/SimplePieChart';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import type { BroadbandData } from '../../types';

interface Props {
  data: BroadbandData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function BroadbandSpeed({ data, isDark, onRefresh }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full">
      <SimplePieChart
        title="带宽速率分布"
        data={data.speedDistribution}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
      />
      <SimpleLineChart
        title="各速率占比趋势"
        data={data.speedTrend}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
        yAxisFormatter="{value}%"
      />
    </div>
  );
}
