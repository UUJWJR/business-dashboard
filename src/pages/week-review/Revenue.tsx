import KPICard from '../../components/kpi/KPICard';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import BarLineComboChart from '../../components/charts/BarLineComboChart';
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

export default function WeekReviewRevenue({ data, isDark, onRefresh }: Props) {
  const completionChartData = data.revenueSummary.map((r) => ({
    name: r.district as string,
    value: r.rate as number,
    target: 100,
  }));

  const pathLabels = ['降档控损', '新增创收', 'FTTR', '爱家清洗', '云电脑', '守机宝', '大屏包', '特色卡品', '健康宝', '甄选会员'];
  const pathKeys = ['downgradeControl', 'newRevenue', 'fttr', 'cleaning', 'cloudPc', 'shoujibao', 'screen', 'card', 'health', 'member'];

  const pathAvgCompletion = pathKeys.map((k) => {
    const values = data.path2plus8Completion.map((r) => (r[k] as number) || 0);
    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  });

  const pathAvgWow = pathKeys.map((k) => {
    const values = data.path2plus8WowChange.map((r) => (r[k] as number) || 0);
    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  });

  return (
    <div className="flex flex-col gap-4 h-full overflow-auto">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 flex-none">
        {data.kpis.slice(0, 3).map((kpi, index) => (
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
          <SimpleLineChart
            title="销售收入周趋势"
            data={data.revenueTrend}
            isDark={isDark}
            onRefresh={onRefresh}
            yAxisFormatter="{value}%"
          />
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-neutral-secondary mb-2">销售收入各区县总表</h3>
        <DataTable
          headers={['区县', '周目标(万元)', '累计完成', '完成率(%)', '排名', '环比上周(%)', '线下收入', '线下环比(%)']}
          rows={data.revenueSummary}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-neutral-secondary mb-2">细项指标完成率</h3>
          <DataTable
            headers={['区县', '新增', '升档', '办包', '初装费', '调测费', '降档']}
            rows={data.revenueCompletion}
          />
        </div>
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-neutral-secondary mb-2">细项指标环比变化</h3>
          <DataTable
            headers={['区县', '新增', '升档', '办包', '初装费', '调测费', '降档']}
            rows={data.revenueWowChange}
          />
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-neutral-secondary mb-2">2+8路径完成进度</h3>
        <DataTable
          headers={['区县', '降档控损', '新增创收', 'FTTR', '爱家清洗', '云电脑', '守机宝', '大屏包', '特色卡品', '健康宝', '甄选会员']}
          rows={data.path2plus8Completion}
        />
      </div>

      <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3 h-72">
        <BarLineComboChart
          title="2+8路径平均完成率与环比变化"
          labels={pathLabels}
          datasets={[
            { name: '平均完成率(%)', values: pathAvgCompletion, type: 'bar', yAxisIndex: 0, color: '#0070C0' },
            { name: '平均环比(%)', values: pathAvgWow, type: 'line', yAxisIndex: 1, color: '#FA8C16' },
          ]}
          isDark={isDark}
          onRefresh={onRefresh}
          yAxisFormatters={['{value}%', '{value}%']}
        />
      </div>

      <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-neutral-secondary mb-2">2+8路径环比变化</h3>
        <DataTable
          headers={['区县', '降档控损', '新增创收', 'FTTR', '爱家清洗', '云电脑', '守机宝', '大屏包', '特色卡品', '健康宝', '甄选会员']}
          rows={data.path2plus8WowChange}
        />
      </div>
    </div>
  );
}
