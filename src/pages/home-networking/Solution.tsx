import SimplePieChart from '../../components/charts/SimplePieChart';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import type { HomeNetworkingData, TrendChartData } from '../../types';

interface Props {
  data: HomeNetworkingData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function HomeNetworkingSolution({ data, isDark, onRefresh }: Props) {
  const solutionTrend: TrendChartData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: data.solutionDistribution.map((s, i) => ({
      name: s.name,
      values: Array.from({ length: 6 }, (_, idx) =>
        Math.round(s.value * (0.9 + idx * 0.02 + Math.random() * 0.06) * 10) / 10
      ),
      color: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'][i % 4],
    })),
  };

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
        data={solutionTrend}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
        yAxisFormatter="{value}%"
      />
    </div>
  );
}
