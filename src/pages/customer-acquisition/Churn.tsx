import SimpleBarChart from '../../components/charts/SimpleBarChart';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import type { CustomerAcquisitionData, TrendChartData } from '../../types';

interface Props {
  data: CustomerAcquisitionData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function CustomerAcquisitionChurn({ data, isDark, onRefresh }: Props) {
  const churnTrend: TrendChartData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: [
      {
        name: '高风险',
        values: Array.from({ length: 6 }, () => Math.round(Math.random() * 800 + 600)),
        color: '#ef4444',
      },
      {
        name: '中风险',
        values: Array.from({ length: 6 }, () => Math.round(Math.random() * 1500 + 2000)),
        color: '#f59e0b',
      },
      {
        name: '低风险',
        values: Array.from({ length: 6 }, () => Math.round(Math.random() * 3000 + 5000)),
        color: '#22c55e',
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          title="流失风险分布"
          data={{
            labels: data.churnRisk.map((c) => c.level),
            datasets: [{ name: '客户数', values: data.churnRisk.map((c) => c.count), color: '#6366f1' }],
          }}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
          yAxisFormatter="{value}"
        />
        <SimpleLineChart
          title="流失风险趋势"
          data={churnTrend}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
          yAxisFormatter="{value}"
        />
      </div>
    </div>
  );
}
