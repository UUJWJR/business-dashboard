import SimpleBarChart from '../../components/charts/SimpleBarChart';
import type { WeekReviewData } from '../../types';

interface Props {
  data: WeekReviewData;
  isDark: boolean;
  onRefresh: () => void;
}

function DataTable({ headers, rows }: { headers: string[]; rows: Record<string, string | number>[] }) {
  const keys = Object.keys(rows[0] || {});
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#00467F] text-white">
            {headers.map((h) => (
              <th key={h} className="px-2 py-1.5 text-center font-semibold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F6F8]'}>
              {keys.map((k) => (
                <td key={k} className="px-2 py-1.5 text-center whitespace-nowrap">
                  {k === 'district' ? (
                    <span className="font-semibold text-neutral-text">{row[k]}</span>
                  ) : (
                    row[k]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function WeekReviewSummary({ data, isDark, onRefresh }: Props) {
  const weakCountData = data.summaryWeekly.map((r) => ({
    name: r.district as string,
    value: r.weakCount as number,
    target: 0,
  }));

  const revenueRateData = data.summaryWeekly.map((r) => ({
    name: r.district as string,
    value: r.revenueRate as number,
    target: 100,
  }));

  return (
    <div className="flex flex-col gap-4 h-full overflow-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-none">
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3 h-64">
          <SimpleBarChart
            title="各区县收入完成率"
            data={revenueRateData}
            isDark={isDark}
            onRefresh={onRefresh}
            showTarget
            yAxisFormatter="{value}%"
          />
        </div>
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3 h-64">
          <SimpleBarChart
            title="各区县短板数"
            data={weakCountData}
            isDark={isDark}
            onRefresh={onRefresh}
            yAxisFormatter="{value}个"
          />
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-neutral-secondary mb-2">上期落后区县改善——凤凰</h3>
        <DataTable
          headers={['区县', '收入完成率(%)', '排名', '新增份额(%)', '大套完成率(%)', '宽带净增(户)', '清洗完成率(%)']}
          rows={data.summaryPhoenix}
        />
      </div>

      <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-neutral-secondary mb-2">上期落后区县改善——保靖</h3>
        <DataTable
          headers={['区县', '收入完成率(%)', '大套完成率(%)', '宽带新增(户)', '宽带净增(户)', '降档规模(户)', '保拓比']}
          rows={data.summaryBaojing}
        />
      </div>

      <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-neutral-secondary mb-2">周市场重点工作完成情况汇总</h3>
        <DataTable
          headers={['区县', '收入完成率', '2+8完成率', '新增份额', '大套完成率', '宽带新增环比', '宽带净增环比', '赢回率', '组网率', '降档环比', '保拓比', '清洗完成率', '拆弹完成率', '短板数']}
          rows={data.summaryWeekly}
        />
      </div>
    </div>
  );
}
