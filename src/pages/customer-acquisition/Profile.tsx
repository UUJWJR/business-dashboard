import SimplePieChart from '../../components/charts/SimplePieChart';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import type { CustomerAcquisitionData } from '../../types';

interface Props {
  data: CustomerAcquisitionData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function CustomerAcquisitionProfile({ data, isDark, onRefresh }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full">
      <SimplePieChart
        title="客户类型占比"
        data={data.typeDistribution}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
      />
      <SimpleLineChart
        title="各类型客户趋势"
        data={data.typeTrend}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
        yAxisFormatter="{value}%"
      />
    </div>
  );
}
