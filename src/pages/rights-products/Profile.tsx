import SimplePieChart from '../../components/charts/SimplePieChart';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import type { RightsProductsData } from '../../types';

interface Props {
  data: RightsProductsData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function RightsProductsProfile({ data, isDark, onRefresh }: Props) {
  const userSegments = [
    { name: '年轻用户(18-25)', value: Math.round(Math.random() * 20 + 25) },
    { name: '中青年(26-35)', value: Math.round(Math.random() * 15 + 30) },
    { name: '中年(36-50)', value: Math.round(Math.random() * 10 + 20) },
    { name: '老年(50+)', value: Math.round(Math.random() * 5 + 10) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimplePieChart
          title="权益类型偏好"
          data={data.typeDistribution}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
        />
        <SimpleBarChart
          title="用户年龄分布"
          data={{
            labels: userSegments.map((s) => s.name),
            datasets: [{ name: '占比', values: userSegments.map((s) => s.value), color: '#6366f1' }],
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
