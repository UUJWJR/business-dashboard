import SimpleBarChart from '../../components/charts/SimpleBarChart';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import type { SalesRevenueData } from '../../types';

interface Props {
  data: SalesRevenueData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function SalesRevenueByChannel({ data, isDark, onRefresh }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full">
      <SimpleBarChart
        title="渠道收入分布"
        data={{
          labels: data.byChannel.map((c) => c.name),
          datasets: [{ name: '收入占比', values: data.byChannel.map((c) => c.value), color: '#0070C0' }],
        }}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
        yAxisFormatter="{value}%"
      />
      <SimpleLineChart
        title="渠道收入趋势"
        data={data.byChannelTrend}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
        yAxisFormatter="{value}%"
      />
    </div>
  );
}
