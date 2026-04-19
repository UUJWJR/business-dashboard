import SimpleBarChart from '../../components/charts/SimpleBarChart';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import type { SalesRevenueData, TrendChartData } from '../../types';

interface Props {
  data: SalesRevenueData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function SalesRevenueByChannel({ data, isDark, onRefresh }: Props) {
  // Build a mock trend for channels
  const channelTrend: TrendChartData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: data.byChannel.map((c, i) => ({
      name: c.name,
      values: Array.from({ length: 6 }, (_, idx) =>
        Math.round(c.value * (0.85 + idx * 0.04 + Math.random() * 0.1) * 10) / 10
      ),
      color: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'][i % 4],
    })),
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          title="渠道收入分布"
          data={{
            labels: data.byChannel.map((c) => c.name),
            datasets: [{ name: '收入占比', values: data.byChannel.map((c) => c.value), color: '#6366f1' }],
          }}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
          yAxisFormatter="{value}%"
        />
        <SimpleLineChart
          title="渠道收入趋势"
          data={channelTrend}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
          yAxisFormatter="{value}%"
        />
      </div>
    </div>
  );
}
