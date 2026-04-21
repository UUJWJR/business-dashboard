import SimplePieChart from '../../components/charts/SimplePieChart';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import type { RightsProductsData } from '../../types';

interface Props {
  data: RightsProductsData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function RightsProductsProfile({ data, isDark, onRefresh }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full">
      <SimplePieChart
        title="权益类型偏好"
        data={data.typeDistribution}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
      />
      <SimpleBarChart
        title="用户年龄分布"
        data={{
          labels: data.ageDistribution.map((s) => s.name),
          datasets: [{ name: '占比', values: data.ageDistribution.map((s) => s.value), color: '#6366f1' }],
        }}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
        yAxisFormatter="{value}%"
      />
    </div>
  );
}
