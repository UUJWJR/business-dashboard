import SimpleLineChart from '../../components/charts/SimpleLineChart';
import SimplePieChart from '../../components/charts/SimplePieChart';
import type { SmartHomeData } from '../../types';

interface Props {
  data: SmartHomeData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function SmartHomeBinding({ data, isDark, onRefresh }: Props) {
  const bindingDistribution = [
    { name: '已绑定套餐', value: Math.round(data.bindingRate.datasets[0].values[data.bindingRate.datasets[0].values.length - 1]) },
    { name: '未绑定套餐', value: Math.round(100 - data.bindingRate.datasets[0].values[data.bindingRate.datasets[0].values.length - 1]) },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full">
      <SimpleLineChart
        title="套餐绑定率趋势"
        data={data.bindingRate}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
        yAxisFormatter="{value}%"
      />
      <SimplePieChart
        title="套餐绑定分布"
        data={bindingDistribution}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
      />
    </div>
  );
}
