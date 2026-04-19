import SimplePieChart from '../../components/charts/SimplePieChart';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import type { CustomerAcquisitionData, TrendChartData } from '../../types';

interface Props {
  data: CustomerAcquisitionData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function CustomerAcquisitionProfile({ data, isDark, onRefresh }: Props) {
  const typeTrend: TrendChartData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: data.typeDistribution.map((t, i) => ({
      name: t.name,
      values: Array.from({ length: 6 }, (_, idx) =>
        Math.round(t.value * (0.9 + idx * 0.02 + Math.random() * 0.06) * 10) / 10
      ),
      color: ['#6366f1', '#22c55e', '#f59e0b'][i % 3],
    })),
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimplePieChart
          title="客户类型占比"
          data={data.typeDistribution}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
        />
        <SimpleLineChart
          title="各类型客户趋势"
          data={typeTrend}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
          yAxisFormatter="{value}%"
        />
      </div>
    </div>
  );
}
