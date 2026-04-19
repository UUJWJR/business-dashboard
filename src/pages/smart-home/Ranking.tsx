import SimpleBarChart from '../../components/charts/SimpleBarChart';
import type { SmartHomeData } from '../../types';

interface Props {
  data: SmartHomeData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function SmartHomeRanking({ data, isDark, onRefresh }: Props) {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex-1 min-h-0">
        <SimpleBarChart
          title="产品销量排行"
          data={{
            labels: data.topProducts.map((p) => p.name),
            datasets: [{ name: '销量', values: data.topProducts.map((p) => p.sales), color: '#6366f1' }],
          }}
          isDark={isDark}
          onRefresh={onRefresh}
          className="h-full"
          yAxisFormatter="{value}"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-card p-3 border border-gray-100 dark:border-gray-700 shadow-card dark:shadow-card-dark flex-none max-h-52 overflow-auto">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          产品销量明细
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left py-1 px-2 text-gray-500 dark:text-gray-400 font-medium">排名</th>
                <th className="text-left py-1 px-2 text-gray-500 dark:text-gray-400 font-medium">产品名称</th>
                <th className="text-right py-1 px-2 text-gray-500 dark:text-gray-400 font-medium">销量</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((product, index) => (
                <tr key={product.name} className="border-b border-gray-50 dark:border-gray-800">
                  <td className="py-1 px-2 text-gray-900 dark:text-white font-medium">{index + 1}</td>
                  <td className="py-1 px-2 text-gray-900 dark:text-white">{product.name}</td>
                  <td className="py-1 px-2 text-right text-gray-900 dark:text-white">{product.sales.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
