import SimpleBarChart from '../../components/charts/SimpleBarChart';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import type { SmartHomeData } from '../../types';

interface Props {
  data: SmartHomeData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function SmartHomeFeedback({ data, isDark, onRefresh }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full">
      <SimpleLineChart
        title="用户满意度趋势"
        data={data.satisfactionTrend}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
        yAxisFormatter="{value}"
      />
      <SimpleBarChart
        title="反馈类型分布"
        data={{
          labels: data.feedbackDistribution.map((c) => c.name),
          datasets: [{ name: '反馈数', values: data.feedbackDistribution.map((c) => c.value), color: '#6366f1' }],
        }}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
        yAxisFormatter="{value}"
      />
    </div>
  );
}
