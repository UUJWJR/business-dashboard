import SimplePieChart from '../../components/charts/SimplePieChart';
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

export default function WeekReviewOtherWork({ data, isDark, onRefresh }: Props) {
  const cleaningRateData = data.otherHomeCleaning.map((r) => ({
    name: r.district as string,
    value: r.rate as number,
    target: 100,
  }));

  const defusalRateData = data.otherDefusal.map((r) => ({
    name: r.district as string,
    value: r.rate as number,
    target: 100,
  }));

  return (
    <div className="flex flex-col gap-4 h-full overflow-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-none">
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3 h-64">
          <SimplePieChart
            title="其他重点工作分布"
            data={data.otherDistribution}
            isDark={isDark}
            onRefresh={onRefresh}
            donut
          />
        </div>
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3 h-64">
          <SimpleBarChart
            title="爱家清洗收入完成率"
            data={cleaningRateData}
            isDark={isDark}
            onRefresh={onRefresh}
            showTarget
            yAxisFormatter="{value}%"
          />
        </div>
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3 h-64">
          <SimpleBarChart
            title="拆弹攻坚完成率"
            data={defusalRateData}
            isDark={isDark}
            onRefresh={onRefresh}
            showTarget
            yAxisFormatter="{value}%"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-neutral-secondary mb-2">爱家清洗服务</h3>
          <DataTable
            headers={['区县', '当周收入(万元)', '收入完成率(%)', '收入环比(%)', '当周录单(笔)', '录单环比(%)', '渠道数(个)', '渠道破零率(%)']}
            rows={data.otherHomeCleaning}
          />
        </div>
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-neutral-secondary mb-2">爱家清洗渠道破零细分</h3>
          <DataTable
            headers={['区县', '渠道数(个)', '破零率(%)', '破零排名', '破零率环比(%)', '渠道环比(%)', '排名变化', '实体破零(个)', '实体环比(%)', '直销破零(个)', '直销环比(%)', '随销破零(个)', '随销环比(%)', '自营破零(个)', '自营环比(%)']}
            rows={data.otherHomeCleaningChannels}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-neutral-secondary mb-2">拆弹行动完成情况</h3>
          <DataTable
            headers={['区县', '攻坚目标(户)', '累计新增(户)', '完成率(%)', '重保目标(户)', '重保完成(户)', '重保完成率(%)']}
            rows={data.otherDefusal}
          />
        </div>
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-neutral-secondary mb-2">拆弹行动重保/全量细分</h3>
          <DataTable
            headers={['区县', '重保目标(户)', '重保当日(户)', '重保累计(户)', '重保进度(%)', '重保排名', '重保基数(户)', '重保已办(户)', '重保办理率(%)', '全量目标(户)', '全量当日(户)', '全量累计(户)', '全量进度(%)', '全量排名', '全量基数(户)', '全量已办(户)', '全量办理率(%)']}
            rows={data.otherDefusalDetail}
          />
        </div>
      </div>
    </div>
  );
}
