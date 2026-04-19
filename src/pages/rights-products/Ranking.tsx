import SimpleBarChart from '../../components/charts/SimpleBarChart';
import type { RightsProductsData } from '../../types';

interface Props {
  data: RightsProductsData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function RightsProductsRanking({ data, isDark, onRefresh }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <SimpleBarChart
          title="权益活跃度 TOP10"
          data={{
            labels: data.topRights.map((r) => r.name),
            datasets: [{ name: '活跃用户', values: data.topRights.map((r) => r.activeUsers), color: '#6366f1' }],
          }}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
          yAxisFormatter="{value}"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-card p-5 border border-gray-100 dark:border-gray-700 shadow-card dark:shadow-card-dark">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          权益活跃度明细
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">排名</th>
                <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">权益名称</th>
                <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">活跃用户</th>
              </tr>
            </thead>
            <tbody>
              {data.topRights.map((right, index) => (
                <tr key={right.name} className="border-b border-gray-50 dark:border-gray-800">
                  <td className="py-2 px-3 text-gray-900 dark:text-white font-medium">{index + 1}</td>
                  <td className="py-2 px-3 text-gray-900 dark:text-white">{right.name}</td>
                  <td className="py-2 px-3 text-right text-gray-900 dark:text-white">{right.activeUsers.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
