import SimpleBarChart from '../../components/charts/SimpleBarChart';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import type { SmartHomeData, TrendChartData } from '../../types';

interface Props {
  data: SmartHomeData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function SmartHomeFeedback({ data, isDark, onRefresh }: Props) {
  const satisfactionTrend: TrendChartData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: [
      {
        name: '满意度评分',
        values: Array.from({ length: 6 }, () => Math.round((4.2 + Math.random() * 0.6) * 10) / 10),
        color: '#6366f1',
      },
    ],
  };

  const feedbackCategories = [
    { name: '产品质量', value: Math.round(Math.random() * 200 + 300) },
    { name: '安装服务', value: Math.round(Math.random() * 150 + 200) },
    { name: 'APP体验', value: Math.round(Math.random() * 100 + 150) },
    { name: '售后支持', value: Math.round(Math.random() * 80 + 100) },
    { name: '价格', value: Math.round(Math.random() * 60 + 80) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleLineChart
          title="用户满意度趋势"
          data={satisfactionTrend}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
          yAxisFormatter="{value}"
        />
        <SimpleBarChart
          title="反馈类型分布"
          data={{
            labels: feedbackCategories.map((c) => c.name),
            datasets: [{ name: '反馈数', values: feedbackCategories.map((c) => c.value), color: '#6366f1' }],
          }}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
          yAxisFormatter="{value}"
        />
      </div>
    </div>
  );
}
