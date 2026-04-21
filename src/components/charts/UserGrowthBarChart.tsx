import { useMemo, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { UserGrowthData } from '../../types';
import ChartCard from './ChartCard';

interface Props {
  data: UserGrowthData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function UserGrowthBarChart({ data, isDark, onRefresh }: Props) {
  const chartRef = useRef<ReactECharts>(null);
  const [stacked, setStacked] = useState(false);

  const option = useMemo(() => {
    const textColor = isDark ? '#9ca3af' : '#4b5563';
    const axisColor = isDark ? '#374151' : '#e5e7eb';
    const gridColor = isDark ? '#374151' : '#f3f4f6';

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        textStyle: { color: isDark ? '#e5e7eb' : '#1f2937' },
        axisPointer: { type: 'shadow' },
      },
      legend: {
        data: ['新增用户', '活跃用户'],
        textStyle: { color: textColor },
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.months,
        axisLine: { lineStyle: { color: axisColor } },
        axisLabel: { color: textColor },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: gridColor, type: 'dashed' } },
        axisLabel: {
          color: textColor,
          formatter: '{value}万',
        },
      },
      series: [
        {
          name: '新增用户',
          type: 'bar',
          stack: stacked ? 'total' : undefined,
          barWidth: stacked ? '40%' : '30%',
          itemStyle: {
            borderRadius: stacked ? [0, 0, 0, 0] : [4, 4, 0, 0],
            color: '#6366f1',
          },
          emphasis: { itemStyle: { color: '#4f46e5' } },
          data: data.newUsers,
        },
        {
          name: '活跃用户',
          type: 'bar',
          stack: stacked ? 'total' : undefined,
          barWidth: stacked ? '40%' : '30%',
          itemStyle: {
            borderRadius: stacked ? [4, 4, 0, 0] : [4, 4, 0, 0],
            color: '#22c55e',
          },
          emphasis: { itemStyle: { color: '#16a34a' } },
          data: data.activeUsers,
        },
      ],
    };
  }, [data, isDark, stacked]);

  return (
    <ChartCard title="用户规模增长" onRefresh={onRefresh} chartRef={chartRef} className="col-span-2">
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setStacked(!stacked)}
          className="text-xs px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {stacked ? '切换分组' : '切换堆叠'}
        </button>
      </div>
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height: 300 }}
        opts={{ renderer: 'canvas' }}
        notMerge
      />
    </ChartCard>
  );
}
