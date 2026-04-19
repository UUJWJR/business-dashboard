import SimplePieChart from '../../components/charts/SimplePieChart';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import type { HomeNetworkingData } from '../../types';

interface Props {
  data: HomeNetworkingData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function HomeNetworkingSolution({ data, isDark, onRefresh }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full">
      <SimplePieChart
        title="组网方案分布"
        data={data.solutionDistribution}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
      />
      <SimpleLineChart
        title="各方案占比趋势"
        data={data.solutionTrend}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
        yAxisFormatter="{value}%"
      />
    </div>
  );
}
