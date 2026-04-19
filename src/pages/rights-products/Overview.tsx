import KPICard from '../../components/kpi/KPICard';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import SimplePieChart from '../../components/charts/SimplePieChart';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import type { RightsProductsData } from '../../types';

interface Props {
  data: RightsProductsData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function RightsProductsOverview({ data, isDark, onRefresh }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.kpis.map((kpi, index) => (
          <KPICard key={kpi.id} data={kpi} index={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleLineChart
          title="权益订阅趋势"
          data={data.monthlyTrend}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
          yAxisFormatter="{value}万"
        />
        <SimplePieChart
          title="权益类型分布"
          data={data.typeDistribution}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <SimpleBarChart
          title="权益活跃度 TOP10"
          data={{
            labels: data.topRights.slice(0, 10).map((r) => r.name),
            datasets: [{ name: '活跃用户', values: data.topRights.slice(0, 10).map((r) => r.activeUsers), color: '#6366f1' }],
          }}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
          yAxisFormatter="{value}"
        />
      </div>
    </div>
  );
}
