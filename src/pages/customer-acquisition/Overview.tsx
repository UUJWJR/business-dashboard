import KPICard from '../../components/kpi/KPICard';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import SimplePieChart from '../../components/charts/SimplePieChart';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import type { CustomerAcquisitionData } from '../../types';

interface Props {
  data: CustomerAcquisitionData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function CustomerAcquisitionOverview({ data, isDark, onRefresh }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.kpis.map((kpi, index) => (
          <KPICard key={kpi.id} data={kpi} index={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleLineChart
          title="新增客户趋势"
          data={data.monthlyTrend}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
          yAxisFormatter="{value}万"
        />
        <SimplePieChart
          title="客户类型占比"
          data={data.typeDistribution}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <SimpleBarChart
          title="新增渠道分布"
          data={{
            labels: data.channelDistribution.map((c) => c.name),
            datasets: [{ name: '新增占比', values: data.channelDistribution.map((c) => c.value), color: '#6366f1' }],
          }}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
          yAxisFormatter="{value}%"
        />
      </div>
    </div>
  );
}
