import SimpleBarChart from '../../components/charts/SimpleBarChart';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import type { CustomerAcquisitionData, TrendChartData } from '../../types';

interface Props {
  data: CustomerAcquisitionData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function CustomerAcquisitionChannel({ data, isDark, onRefresh }: Props) {
  const channelTrend: TrendChartData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: data.channelDistribution.map((c, i) => ({
      name: c.name,
      values: Array.from({ length: 6 }, (_, idx) =>
        Math.round(c.value * (0.85 + idx * 0.03 + Math.random() * 0.08) * 10) / 10
      ),
      color: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'][i % 4],
    })),
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full">
      <SimpleBarChart
        title="渠道新增分布"
        data={{
          labels: data.channelDistribution.map((c) => c.name),
          datasets: [{ name: '新增占比', values: data.channelDistribution.map((c) => c.value), color: '#6366f1' }],
        }}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
        yAxisFormatter="{value}%"
      />
      <SimpleLineChart
        title="渠道新增趋势"
        data={channelTrend}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
        yAxisFormatter="{value}%"
      />
    </div>
  );
}
