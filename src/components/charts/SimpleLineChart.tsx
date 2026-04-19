import { useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { TrendChartData } from '../../types';
import ChartCard from './ChartCard';

interface Props {
  title: string;
  data: TrendChartData;
  isDark: boolean;
  onRefresh: () => void;
  className?: string;
  yAxisFormatter?: string;
}

export default function SimpleLineChart({
  title,
  data,
  isDark,
  onRefresh,
  className = '',
  yAxisFormatter = '{value}',
}: Props) {
  const chartRef = useRef<ReactECharts>(null);

  const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

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
      },
      legend: {
        data: data.datasets.map((d) => d.name),
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
        boundaryGap: false,
        data: data.labels,
        axisLine: { lineStyle: { color: axisColor } },
        axisLabel: { color: textColor },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: gridColor, type: 'dashed' } },
        axisLabel: {
          color: textColor,
          formatter: yAxisFormatter,
        },
      },
      series: data.datasets.map((ds, i) => ({
        name: ds.name,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 3, color: ds.color || colors[i % colors.length] },
        itemStyle: { color: ds.color || colors[i % colors.length] },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: `${ds.color || colors[i % colors.length]}66` },
              { offset: 1, color: `${ds.color || colors[i % colors.length]}05` },
            ],
          },
        },
        data: ds.values,
      })),
    };
  }, [data, isDark, yAxisFormatter]);

  return (
    <ChartCard title={title} onRefresh={onRefresh} chartRef={chartRef} className={className}>
      <div className="flex-1 min-h-0">
        <ReactECharts
          ref={chartRef}
          option={option}
          style={{ height: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge
        />
      </div>
    </ChartCard>
  );
}
