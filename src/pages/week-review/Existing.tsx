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

export default function WeekReviewExisting({ data, isDark, onRefresh }: Props) {
  const winbackRateData = data.existingWinback.map((r) => ({
    name: r.district as string,
    value: r.winbackRate as number,
    target: 100,
  }));

  const retainRatioData = data.existingRetain.map((r) => ({
    name: r.district as string,
    value: r.retainRatio as number,
    target: 1,
  }));

  return (
    <div className="flex flex-col gap-4 h-full overflow-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-none">
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3 h-64">
          <SimplePieChart
            title="存量运营重点工作分布"
            data={data.existingDistribution}
            isDark={isDark}
            onRefresh={onRefresh}
            donut
          />
        </div>
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3 h-64">
          <SimpleBarChart
            title="异网主卡赢回率"
            data={winbackRateData}
            isDark={isDark}
            onRefresh={onRefresh}
            yAxisFormatter="{value}%"
          />
        </div>
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3 h-64">
          <SimpleBarChart
            title="存量保拓比"
            data={retainRatioData}
            isDark={isDark}
            onRefresh={onRefresh}
            yAxisFormatter="{value}"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-neutral-secondary mb-2">异网主卡赢回</h3>
          <DataTable
            headers={['区县', '异网主卡规模(户)', '本周赢回(户)', '赢回率(%)', 'AB集团规模(户)', 'AB集团赢回(户)', 'AB集团赢回率(%)']}
            rows={data.existingWinback}
          />
        </div>
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-neutral-secondary mb-2">异网主卡赢回环比变化</h3>
          <DataTable
            headers={['区县', '赢回环比(户)', '赢回率环比(%)', 'AB赢回环比(户)', 'AB赢回率环比(%)']}
            rows={data.existingWinbackWow}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-neutral-secondary mb-2">融合加固亲情网</h3>
          <DataTable
            headers={['区县', '触点客户(户)', '组网数(户)', '组网率(%)', '新入网组网率(%)', '流失数(户)', '净增(户)']}
            rows={data.existingRetention}
          />
        </div>
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-neutral-secondary mb-2">融合加固亲情网环比变化</h3>
          <DataTable
            headers={['区县', '触点环比(%)', '组网环比(%)', '组网率环比(%)', '新入网组网率环比(%)', '流失环比(%)', '净增变化(户)']}
            rows={data.existingRetentionWow}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-neutral-secondary mb-2">中高端风险修复</h3>
          <DataTable
            headers={['区县', '触点规模(户)', '触点合约率(%)', '宽带合约率(%)', '资费合约率(%)', '自动充值率(%)']}
            rows={data.existingRisk}
          />
        </div>
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-neutral-secondary mb-2">中高端风险修复环比变化</h3>
          <DataTable
            headers={['区县', '触点规模环比(%)', '触点合约率环比(%)', '宽带合约率环比(%)', '资费合约率环比(%)', '自动充值率环比(%)']}
            rows={data.existingRiskWow}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-neutral-secondary mb-2">接盘运营</h3>
          <DataTable
            headers={['区县', '终端目标(户)', '终端接盘(户)', '终端接盘率(%)', '终端合约(户)', '终端其他(户)', '礼包目标(户)', '礼包接盘(户)', '礼包接盘率(%)', '礼包降套(户)', '礼包其他(户)']}
            rows={data.existingTakeover}
          />
        </div>
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-neutral-secondary mb-2">接盘运营环比变化</h3>
          <DataTable
            headers={['区县', '终端接盘环比(%)', '终端合约环比(%)', '终端其他环比(%)', '礼包接盘环比(%)', '礼包降套环比(%)', '礼包其他环比(%)']}
            rows={data.existingTakeoverWow}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-neutral-secondary mb-2">拆机挽留</h3>
          <DataTable
            headers={['区县', '派单率(%)', '上门率(%)', '挽留成功(户)']}
            rows={data.existingRescue}
          />
        </div>
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-neutral-secondary mb-2">拆机挽留环比变化</h3>
          <DataTable
            headers={['区县', '派单率环比(%)', '上门率环比(%)', '挽留成功环比(%)']}
            rows={data.existingRescueWow}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-neutral-secondary mb-2">降档情况</h3>
          <DataTable
            headers={['区县', '降档规模(户)', '价值流失(万元)', '78+降档(户)', '78+占比(%)', '降地板价(户)', '线下降档(户)']}
            rows={data.existingDowngrade}
          />
        </div>
        <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-neutral-secondary mb-2">降档环比变化</h3>
          <DataTable
            headers={['区县', '降档规模环比(%)', '价值流失环比(%)', '78+降档环比(%)', '78+占比环比(%)', '降地板价环比(%)', '线下降档环比(%)']}
            rows={data.existingDowngradeWow}
          />
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-surface-800/50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-neutral-secondary mb-2">存量保拓综合表</h3>
        <DataTable
          headers={['区县', '转入78+(户)', '转入78+占比(%)', '转入环比(%)', '转出78+(户)', '转出78+占比(%)', '转出环比(%)', '保拓比', '保拓比环比', '折扣率(%)', '直销零次占比(%)', '直销零次环比(%)', '渠道零次占比(%)', '渠道零次环比(%)']}
          rows={data.existingRetain}
        />
      </div>
    </div>
  );
}
