import SimpleBarChart from '../../components/charts/SimpleBarChart';
import type { BroadbandData } from '../../types';

interface Props {
  data: BroadbandData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function BroadbandCoverage({ data, isDark, onRefresh }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <SimpleBarChart
          title="区域新增宽带 vs 目标"
          data={data.byRegion}
          isDark={isDark}
          onRefresh={onRefresh}
          className="col-span-1"
          yAxisFormatter="{value}万"
          showTarget
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-card p-5 border border-gray-100 dark:border-gray-700 shadow-card dark:shadow-card-dark">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          区域目标完成率
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">区域</th>
                <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">实际新增（万）</th>
                <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">目标（万）</th>
                <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">完成率</th>
              </tr>
            </thead>
            <tbody>
              {data.byRegion.map((region) => {
                const rate = (region.value / region.target) * 100;
                return (
                  <tr key={region.name} className="border-b border-gray-50 dark:border-gray-800">
                    <td className="py-2 px-3 text-gray-900 dark:text-white">{region.name}</td>
                    <td className="py-2 px-3 text-right text-gray-900 dark:text-white">{region.value}</td>
                    <td className="py-2 px-3 text-right text-gray-500 dark:text-gray-400">{region.target}</td>
                    <td className="py-2 px-3 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          rate >= 100
                            ? 'bg-success-50 text-success-600 dark:bg-green-900/20 dark:text-green-400'
                            : rate >= 90
                            ? 'bg-warning-50 text-warning-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-danger-50 text-danger-600 dark:bg-red-900/20 dark:text-red-400'
                        }`}
                      >
                        {rate.toFixed(1)}%
                      </span>
                    </td>
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
