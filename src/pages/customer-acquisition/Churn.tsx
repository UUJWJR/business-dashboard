import SimpleBarChart from '../../components/charts/SimpleBarChart';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import type { CustomerAcquisitionData } from '../../types';

interface Props {
  data: CustomerAcquisitionData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function CustomerAcquisitionChurn({ data, isDark, onRefresh }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full">
      <SimpleBarChart
        title="流失风险分布"
        data={{
          labels: data.churnRisk.map((c) => c.level),
          datasets: [{ name: '客户数', values: data.churnRisk.map((c) => c.count), color: '#6366f1' }],
        }}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
        yAxisFormatter="{value}"
      />
      <SimpleLineChart
        title="流失风险趋势"
        data={data.churnRiskTrend}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
        yAxisFormatter="{value}"
      />
    </div>
  );
}
