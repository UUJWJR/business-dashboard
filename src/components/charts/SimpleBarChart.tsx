import { useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { TrendChartData, RegionData } from '../../types';
import ChartCard from './ChartCard';

interface Props {
  title: string;
  data: TrendChartData | RegionData[];
  isDark: boolean;
  onRefresh: () => void;
  className?: string;
  yAxisFormatter?: string;
  showTarget?: boolean;
}

export default function SimpleBarChart({
  title,
  data,
  isDark,
  onRefresh,
  className = '',
  yAxisFormatter = '{value}',
  showTarget = false,
}: Props) {
  const chartRef = useRef<ReactECharts>(null);

  const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

  const option = useMemo(() => {
    const textColor = isDark ? '#9ca3af' : '#4b5563';
    const axisColor = isDark ? '#374151' : '#e5e7eb';
    const gridColor = isDark ? '#374151' : '#f3f4f6';

    let labels: string[] = [];
    let datasets: { name: string; values: number[]; color?: string }[] = [];
    let targetValues: number[] | undefined;

    if (Array.isArray(data) && 'target' in (data[0] || {})) {
      const regionData = data as RegionData[];
      labels = regionData.map((d) => d.name);
      datasets = [{ name: '实际值', values: regionData.map((d) => d.value), color: colors[0] }];
      if (showTarget) {
        targetValues = regionData.map((d) => d.target);
      }
    } else {
      const trendData = data as TrendChartData;
      labels = trendData.labels;
      datasets = trendData.datasets;
    }

    const series = datasets.map((ds, i) => ({
      name: ds.name,
      type: 'bar' as const,
      barWidth: showTarget ? '30%' : '40%',
      itemStyle: {
        borderRadius: [4, 4, 0, 0] as [number, number, number, number],
        color: ds.color || colors[i % colors.length],
      },
      emphasis: { itemStyle: { color: ds.color || colors[i % colors.length] } },
      data: ds.values,
    }));

    const targetSeries = showTarget && targetValues
      ? [{
          name: '目标值',
          type: 'line' as const,
          symbol: 'circle' as const,
          symbolSize: 6,
          lineStyle: { width: 2, type: 'dashed' as const, color: '#f59e0b' },
          itemStyle: { color: '#f59e0b' },
          data: targetValues,
        }]
      : [];

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        textStyle: { color: isDark ? '#e5e7eb' : '#1f2937' },
        axisPointer: { type: 'shadow' },
      },
      legend: {
        data: [...series, ...targetSeries].map((s) => s.name),
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
        data: labels,
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
      series: [...series, ...targetSeries],
    };
  }, [data, isDark, showTarget, yAxisFormatter]);

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
