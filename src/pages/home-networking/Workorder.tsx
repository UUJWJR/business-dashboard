import SimpleBarChart from '../../components/charts/SimpleBarChart';
import SimplePieChart from '../../components/charts/SimplePieChart';
import type { HomeNetworkingData } from '../../types';

interface Props {
  data: HomeNetworkingData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function HomeNetworkingWorkorder({ data, isDark, onRefresh }: Props) {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-2">
        <SimplePieChart
          title="工单状态分布"
          data={data.workorderStats.map((w) => ({ name: w.status, value: w.count }))}
          isDark={isDark}
          onRefresh={onRefresh}
          className="h-full"
        />
        <SimpleBarChart
          title="工单数量统计"
          data={{
            labels: data.workorderStats.map((w) => w.status),
            datasets: [{ name: '工单数', values: data.workorderStats.map((w) => w.count), color: '#6366f1' }],
          }}
          isDark={isDark}
          onRefresh={onRefresh}
          className="h-full"
          yAxisFormatter="{value}"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-card p-3 border border-gray-100 dark:border-gray-700 shadow-card dark:shadow-card-dark flex-none max-h-52 overflow-auto">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          工单处理明细
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left py-1 px-2 text-gray-500 dark:text-gray-400 font-medium">状态</th>
                <th className="text-right py-1 px-2 text-gray-500 dark:text-gray-400 font-medium">数量</th>
                <th className="text-right py-1 px-2 text-gray-500 dark:text-gray-400 font-medium">占比</th>
              </tr>
            </thead>
            <tbody>
              {data.workorderStats.map((w) => {
                const total = data.workorderStats.reduce((sum, item) => sum + item.count, 0);
                const percent = total > 0 ? ((w.count / total) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={w.status} className="border-b border-gray-50 dark:border-gray-800">
                    <td className="py-1 px-2 text-gray-900 dark:text-white">{w.status}</td>
                    <td className="py-1 px-2 text-right text-gray-900 dark:text-white">{w.count.toLocaleString()}</td>
                    <td className="py-1 px-2 text-right text-gray-500 dark:text-gray-400">{percent}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
