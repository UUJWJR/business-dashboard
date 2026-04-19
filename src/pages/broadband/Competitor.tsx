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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimplePieChart
          title="市场份额分布"
          data={data.competitorShare}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
        />
        <SimpleBarChart
          title="市场份额对比"
          data={{
            labels: data.competitorShare.map((c) => c.name),
            datasets: [{ name: '占比', values: data.competitorShare.map((c) => c.value), color: '#6366f1' }],
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
