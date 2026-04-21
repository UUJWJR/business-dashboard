import { useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import ChartCard from './ChartCard';

interface ComboDataset {
  name: string;
  values: number[];
  type: 'bar' | 'line';
  yAxisIndex?: number;
  color?: string;
}

interface Props {
  title: string;
  labels: string[];
  datasets: ComboDataset[];
  isDark: boolean;
  onRefresh: () => void;
  className?: string;
  yAxisFormatters?: [string, string];
}

const CHART_COLORS = ['#0070C0', '#FA8C16', '#1AAB55', '#722ED1', '#13C2C2', '#EB2F96', '#A0522D', '#595959'];

export default function BarLineComboChart({
  title,
  labels,
  datasets,
  isDark,
  onRefresh,
  className = '',
  yAxisFormatters = ['{value}', '{value}'],
}: Props) {
  const chartRef = useRef<ReactECharts>(null);

  const option = useMemo(() => {
    const textColor = isDark ? '#9ca3af' : '#595959';
    const axisColor = isDark ? '#374151' : '#D9D9D9';
    const gridColor = isDark ? '#374151' : '#F5F6F8';

    const series = datasets.map((ds, i) => {
      const baseColor = ds.color || CHART_COLORS[i % CHART_COLORS.length];
      if (ds.type === 'bar') {
        return {
          name: ds.name,
          type: 'bar' as const,
          yAxisIndex: ds.yAxisIndex ?? 0,
          barWidth: '40%',
          itemStyle: {
            borderRadius: [4, 4, 0, 0] as [number, number, number, number],
            color: baseColor,
          },
          data: ds.values,
        };
      }
      return {
        name: ds.name,
        type: 'line' as const,
        yAxisIndex: ds.yAxisIndex ?? 1,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { width: 2.5, color: baseColor },
        itemStyle: { color: baseColor, borderWidth: 1, borderColor: '#fff' },
        data: ds.values,
      };
    });

    const hasSecondAxis = datasets.some((d) => (d.yAxisIndex ?? 0) === 1);

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderColor: isDark ? '#374151' : '#D9D9D9',
        textStyle: { color: isDark ? '#e5e7eb' : '#1A1A1A' },
        axisPointer: { type: 'cross' },
      },
      legend: {
        data: datasets.map((d) => d.name),
        textStyle: { color: textColor, fontSize: 12 },
        top: 0,
      },
      grid: {
        left: '3%',
        right: hasSecondAxis ? '4%' : '4%',
        bottom: '8%',
        top: '12%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: { lineStyle: { color: axisColor } },
        axisLabel: { color: textColor, fontSize: 11 },
      },
      yAxis: [
        {
          type: 'value',
          axisLine: { show: false },
          splitLine: { lineStyle: { color: gridColor, type: 'solid' } },
          axisLabel: {
            color: textColor,
            fontSize: 11,
            formatter: yAxisFormatters[0],
          },
        },
        hasSecondAxis
          ? {
              type: 'value',
              axisLine: { show: false },
              splitLine: { show: false },
              axisLabel: {
                color: textColor,
                fontSize: 11,
                formatter: yAxisFormatters[1],
              },
            }
          : null,
      ].filter(Boolean),
      series,
    };
  }, [datasets, isDark, labels, yAxisFormatters]);

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
