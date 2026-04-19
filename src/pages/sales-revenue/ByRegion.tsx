import SimpleBarChart from '../../components/charts/SimpleBarChart';
import type { SalesRevenueData } from '../../types';

interface Props {
  data: SalesRevenueData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function SalesRevenueByRegion({ data, isDark, onRefresh }: Props) {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex-1 min-h-0">
        <SimpleBarChart
          title="区域收入 vs 目标"
          data={data.byRegion}
          isDark={isDark}
          onRefresh={onRefresh}
          className="h-full"
          yAxisFormatter="{value}亿"
          showTarget
        />
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-card p-3 border border-gray-100/80 dark:border-white/[0.06] shadow-card dark:shadow-card-dark flex-none max-h-52 overflow-auto">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          区域目标完成率
        </h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="text-left py-1 px-2 text-gray-500 dark:text-gray-400 font-medium">区域</th>
              <th className="text-right py-1 px-2 text-gray-500 dark:text-gray-400 font-medium">实际（亿）</th>
              <th className="text-right py-1 px-2 text-gray-500 dark:text-gray-400 font-medium">目标（亿）</th>
              <th className="text-right py-1 px-2 text-gray-500 dark:text-gray-400 font-medium">完成率</th>
            </tr>
          </thead>
          <tbody>
            {data.byRegion.map((region) => {
              const rate = (region.value / region.target) * 100;
              return (
                <tr key={region.name} className="border-b border-gray-50 dark:border-gray-800">
                  <td className="py-1 px-2 text-gray-900 dark:text-white">{region.name}</td>
                  <td className="py-1 px-2 text-right text-gray-900 dark:text-white">{region.value}</td>
                  <td className="py-1 px-2 text-right text-gray-500 dark:text-gray-400">{region.target}</td>
                  <td className="py-1 px-2 text-right">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
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
  );
}
