import KPICard from '../../components/kpi/KPICard';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import SimplePieChart from '../../components/charts/SimplePieChart';
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

export default function WeekReviewOverview({ data, isDark, onRefresh }: Props) {
  const completionChartData = data.revenueSummary.map((r) => ({
    name: r.district as string,
    value: r.rate as number,
    target: 100,
  }));

  const weakData = data.summaryWeekly
    .filter((r) => (r.weakCount as number) > 0)
    .map((r) => ({
      name: r.district as string,
      value: r.weakCount as number,
    }));

  return (
    <div className="flex flex-col gap-4 h-full overflow-auto">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 flex-none">
        {data.kpis.map((kpi, index) => (
          <KPICard key={kpi.id} data={kpi} index={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-none">
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3 h-64">
          <SimpleBarChart
            title="各区县收入完成率"
            data={completionChartData}
            isDark={isDark}
            onRefresh={onRefresh}
            showTarget
            yAxisFormatter="{value}%"
          />
        </div>
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3 h-64">
          <SimplePieChart
            title="重点工作短板分布"
            data={weakData}
            isDark={isDark}
            onRefresh={onRefresh}
            donut
          />
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-neutral-secondary mb-2">各区县核心指标速览</h3>
        <DataTable
          headers={['区县', '收入完成率(%)', '2+8完成率(%)', '新增份额(%)', '大套完成率(%)', '宽带净增环比(%)', '赢回率(%)', '组网率(%)', '保拓比', '清洗完成率(%)', '拆弹完成率(%)', '短板数']}
          rows={data.summaryWeekly}
        />
      </div>
    </div>
  );
}
