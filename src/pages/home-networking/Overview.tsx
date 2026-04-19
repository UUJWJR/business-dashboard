import KPICard from '../../components/kpi/KPICard';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import SimplePieChart from '../../components/charts/SimplePieChart';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import type { HomeNetworkingData } from '../../types';

interface Props {
  data: HomeNetworkingData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function HomeNetworkingOverview({ data, isDark, onRefresh }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.kpis.map((kpi, index) => (
          <KPICard key={kpi.id} data={kpi} index={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleLineChart
          title="组网订单趋势"
          data={data.monthlyTrend}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
          yAxisFormatter="{value}万"
        />
        <SimplePieChart
          title="组网方案分布"
          data={data.solutionDistribution}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <SimpleBarChart
          title="区域组网覆盖"
          data={data.byRegion}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
          yAxisFormatter="{value}%"
          showTarget
        />
      </div>
    </div>
  );
}
