import SimpleBarChart from '../../components/charts/SimpleBarChart';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import type { CustomerAcquisitionData } from '../../types';

interface Props {
  data: CustomerAcquisitionData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function CustomerAcquisitionChannel({ data, isDark, onRefresh }: Props) {
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
        data={data.channelTrend}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
        yAxisFormatter="{value}%"
      />
    </div>
  );
}
