import SimplePieChart from '../../components/charts/SimplePieChart';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import type { BroadbandData } from '../../types';

interface Props {
  data: BroadbandData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function BroadbandCompetitor({ data, isDark, onRefresh }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full">
      <SimplePieChart
        title="市场份额分布"
        data={data.competitorShare}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
      />
      <SimpleBarChart
        title="市场份额对比"
        data={{
          labels: data.competitorShare.map((c) => c.name),
          datasets: [{ name: '占比', values: data.competitorShare.map((c) => c.value), color: '#6366f1' }],
        }}
        isDark={isDark}
        onRefresh={onRefresh}
        className="h-full"
        yAxisFormatter="{value}%"
      />
    </div>
  );
}
