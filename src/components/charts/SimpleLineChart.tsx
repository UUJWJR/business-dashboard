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

  const chartColors = ['#0070C0', '#FA8C16', '#1AAB55', '#722ED1', '#13C2C2', '#EB2F96', '#A0522D', '#595959'];

  const option = useMemo(() => {
    const textColor = isDark ? '#9ca3af' : '#595959';
    const axisColor = isDark ? '#374151' : '#D9D9D9';
    const gridColor = isDark ? '#374151' : '#F5F6F8';

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderColor: isDark ? '#374151' : '#D9D9D9',
        textStyle: { color: isDark ? '#e5e7eb' : '#1A1A1A' },
      },
      legend: {
        data: data.datasets.map((d) => d.name),
        textStyle: { color: textColor, fontSize: 12 },
        top: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%',
        top: '12%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.labels,
        axisLine: { lineStyle: { color: axisColor } },
        axisLabel: { color: textColor, fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: gridColor, type: 'solid' } },
        axisLabel: {
          color: textColor,
          fontSize: 11,
          formatter: yAxisFormatter,
        },
      },
      series: data.datasets.map((ds, i) => ({
        name: ds.name,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { width: 2.5, color: ds.color || chartColors[i % chartColors.length] },
        itemStyle: { color: ds.color || chartColors[i % chartColors.length] },
        areaStyle: data.datasets.length <= 2 ? {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: `${ds.color || chartColors[i % chartColors.length]}33` },
              { offset: 1, color: `${ds.color || chartColors[i % chartColors.length]}05` },
            ],
          },
        } : undefined,
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
