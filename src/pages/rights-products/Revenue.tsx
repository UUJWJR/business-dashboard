import SimplePieChart from '../../components/charts/SimplePieChart';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import type { RightsProductsData } from '../../types';

interface Props {
  data: RightsProductsData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function RightsProductsRevenue({ data, isDark, onRefresh }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimplePieChart
          title="收入类型分布"
          data={data.revenueByType}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
        />
        <SimpleBarChart
          title="各类权益收入"
          data={{
            labels: data.revenueByType.map((r) => r.name),
            datasets: [{ name: '收入占比', values: data.revenueByType.map((r) => r.value), color: '#6366f1' }],
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
