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

      <div className="bg-white dark:bg-surface-900 rounded-[5px] p-3 border border-neutral-border dark:border-white/[0.08] shadow-sm flex-none max-h-52 overflow-auto">
        <h3 className="text-sm font-semibold text-neutral-text dark:text-white mb-2">
          区域目标完成率
        </h3>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-theme-dark">
              <th className="text-left py-1.5 px-2 text-white bg-theme-dark font-bold text-xs rounded-tl-[3px]">区域</th>
              <th className="text-right py-1.5 px-2 text-white bg-theme-dark font-bold text-xs">实际（亿）</th>
              <th className="text-right py-1.5 px-2 text-white bg-theme-dark font-bold text-xs">目标（亿）</th>
              <th className="text-right py-1.5 px-2 text-white bg-theme-dark font-bold text-xs rounded-tr-[3px]">完成率</th>
            </tr>
          </thead>
          <tbody>
            {data.byRegion.map((region, idx) => {
              const rate = (region.value / region.target) * 100;
              const rowBg = idx % 2 === 0 ? 'bg-white dark:bg-surface-900' : 'bg-neutral-bg/50 dark:bg-surface-800/50';
              let rateClass = 'text-neutral-text dark:text-white';
              let rateBg = '';
              if (rate > 110) {
                rateClass = 'text-semantic-green font-semibold';
                rateBg = 'bg-semantic-green-bg/40';
              } else if (rate >= 100) {
                rateClass = 'text-neutral-text dark:text-white';
              } else if (rate >= 90) {
                rateClass = 'text-semantic-orange font-semibold';
              } else if (rate >= 80) {
                rateClass = 'text-semantic-orange font-semibold';
              } else {
                rateClass = 'text-semantic-red font-semibold';
                rateBg = 'bg-semantic-red-bg/40';
              }
              return (
                <tr key={region.name} className={`border-b border-neutral-border/60 dark:border-white/[0.06] ${rowBg}`}>
                  <td className="py-1.5 px-2 text-neutral-text dark:text-white font-semibold text-xs">{region.name}</td>
                  <td className="py-1.5 px-2 text-right text-neutral-text dark:text-white text-xs">{region.value}</td>
                  <td className="py-1.5 px-2 text-right text-neutral-secondary dark:text-neutral-muted text-xs">{region.target}</td>
                  <td className="py-1.5 px-2 text-right">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[10px] font-medium ${rateBg} ${rateClass}`}
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
