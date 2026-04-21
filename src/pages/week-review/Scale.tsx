import KPICard from '../../components/kpi/KPICard';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import SimplePieChart from '../../components/charts/SimplePieChart';
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

export default function WeekReviewScale({ data, isDark, onRefresh }: Props) {
  const subscriberRateData = data.scaleSubscribers.map((r) => ({
    name: r.district as string,
    value: r.rate as number,
    target: 100,
  }));

  const dailyShareData = data.scaleSubscribers.map((r) => ({
    name: r.district as string,
    value: r.daily as number,
  }));

  const broadbandLabels = data.scaleBroadband.map((r) => r.district as string);
  const broadbandNewAdd = data.scaleBroadband.map((r) => r.newAdd as number);
  const broadbandChurn = data.scaleBroadband.map((r) => r.churn as number);
  const broadbandNetAdd = data.scaleBroadband.map((r) => r.netAdd as number);

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
            title="各区县放号完成率"
            data={subscriberRateData}
            isDark={isDark}
            onRefresh={onRefresh}
            showTarget
            yAxisFormatter="{value}%"
          />
        </div>
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3 h-64">
          <SimplePieChart
            title="各区县日均放号分布"
            data={dailyShareData}
            isDark={isDark}
            onRefresh={onRefresh}
            donut
          />
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3 h-72">
        <BarLineComboChart
          title="宽带新增、离网与净增"
          labels={broadbandLabels}
          datasets={[
            { name: '新增', values: broadbandNewAdd, type: 'bar', yAxisIndex: 0, color: '#0070C0' },
            { name: '离网', values: broadbandChurn, type: 'bar', yAxisIndex: 0, color: '#CF1322' },
            { name: '净增', values: broadbandNetAdd, type: 'line', yAxisIndex: 1, color: '#1AAB55' },
          ]}
          isDark={isDark}
          onRefresh={onRefresh}
          yAxisFormatters={['{value}户', '{value}户']}
        />
      </div>

      <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-neutral-secondary mb-2">新增放号及份额</h3>
        <DataTable
          headers={['区县', '日均放号(户)', '完成率(%)', '新增份额(%)', '份额环比(%)', '139+大套(户)', '大套完成率(%)', '纯新增占比(%)']}
          rows={data.scaleSubscribers}
        />
      </div>

      <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-neutral-secondary mb-2">宽带新增及净增</h3>
        <DataTable
          headers={['区县', '净增(户)', '净增目标(%)', '净增环比(%)', '新增(户)', '新增环比(%)', '离网(户)', '离网环比(%)']}
          rows={data.scaleBroadband}
        />
      </div>
    </div>
  );
}
