import SimplePieChart from '../../components/charts/SimplePieChart';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import type { SalesRevenueData, TrendChartData } from '../../types';

interface Props {
  data: SalesRevenueData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function SalesRevenueByProduct({ data, isDark, onRefresh }: Props) {
  // Build a simple trend from composition for demo (mock trend per product)
  const productTrend: TrendChartData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: data.byProduct.map((p, i) => ({
      name: p.name,
      values: Array.from({ length: 6 }, (_, idx) =>
        Math.round(p.value * (0.8 + idx * 0.05 + Math.random() * 0.1) * 10) / 10
      ),
      color: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'][i % 4],
    })),
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimplePieChart
          title="产品收入占比"
          data={data.byProduct}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
        />
        <SimpleLineChart
          title="各产品收入趋势"
          data={productTrend}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
          yAxisFormatter="{value}%"
        />
      </div>
    </div>
  );
}
