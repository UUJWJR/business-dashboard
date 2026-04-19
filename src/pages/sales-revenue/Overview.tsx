import KPICard from '../../components/kpi/KPICard';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import SimplePieChart from '../../components/charts/SimplePieChart';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import type { SalesRevenueData } from '../../types';

interface Props {
  data: SalesRevenueData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function SalesRevenueOverview({ data, isDark, onRefresh }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.kpis.map((kpi, index) => (
          <KPICard key={kpi.id} data={kpi} index={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleLineChart
          title="月度收入趋势"
          data={data.monthlyTrend}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
          yAxisFormatter="{value}亿"
        />
        <SimplePieChart
          title="收入构成"
          data={data.composition}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <SimpleBarChart
          title="分地区收入"
          data={data.byRegion}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
          yAxisFormatter="{value}亿"
          showTarget
        />
      </div>
    </div>
  );
}
