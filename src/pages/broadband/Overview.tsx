import KPICard from '../../components/kpi/KPICard';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import SimplePieChart from '../../components/charts/SimplePieChart';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import type { BroadbandData } from '../../types';

interface Props {
  data: BroadbandData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function BroadbandOverview({ data, isDark, onRefresh }: Props) {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 flex-none">
        {data.kpis.map((kpi, index) => (
          <KPICard key={kpi.id} data={kpi} index={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 flex-[2] min-h-0">
        <SimpleLineChart
          title="宽带新增趋势"
          data={data.monthlyTrend}
          isDark={isDark}
          onRefresh={onRefresh}
          className="h-full"
          yAxisFormatter="{value}万"
        />
        <SimplePieChart
          title="带宽速率分布"
          data={data.speedDistribution}
          isDark={isDark}
          onRefresh={onRefresh}
          className="h-full"
        />
      </div>

      <div className="flex-1 min-h-0">
        <SimpleBarChart
          title="区域新增宽带"
          data={data.byRegion}
          isDark={isDark}
          onRefresh={onRefresh}
          className="h-full"
          yAxisFormatter="{value}万"
          showTarget
        />
      </div>
    </div>
  );
}
