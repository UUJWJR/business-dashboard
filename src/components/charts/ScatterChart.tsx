import { useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { ScatterData } from '../../types/pageBuilder';
import type { ChartTheme } from '../../utils/chartThemes';
import ChartCard from './ChartCard';

interface Props {
  title: string;
  data: ScatterData;
  theme: ChartTheme;
  onRefresh: () => void;
  className?: string;
}

export default function ScatterChart({
  title,
  data,
  theme,
  onRefresh,
  className = '',
}: Props) {
  const chartRef = useRef<ReactECharts>(null);

  const option = useMemo(() => {
    return {
      backgroundColor: theme.backgroundColor || 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: theme.backgroundColor === '#0f172a' ? '#1e293b' : '#ffffff',
        borderColor: theme.axisColor,
        textStyle: { color: theme.textColor },
        formatter: (params: any) => {
          return `${params.seriesName}<br/>X: ${params.value[0]}<br/>Y: ${params.value[1]}`;
        },
      },
      legend: {
        data: data.series.map((s) => s.name),
        textStyle: { color: theme.textColor, fontFamily: theme.fontFamily },
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
        type: 'value',
        axisLine: { lineStyle: { color: theme.axisColor } },
        axisLabel: { color: theme.textColor, fontFamily: theme.fontFamily },
        splitLine: { lineStyle: { color: theme.gridColor, type: 'dashed' } },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: theme.axisColor } },
        axisLabel: { color: theme.textColor, fontFamily: theme.fontFamily },
        splitLine: { lineStyle: { color: theme.gridColor, type: 'dashed' } },
      },
      series: data.series.map((s, i) => ({
        name: s.name,
        type: 'scatter',
        symbolSize: theme.symbolSize || 8,
        itemStyle: {
          color: theme.colors[i % theme.colors.length],
        },
        emphasis: {
          itemStyle: {
            borderColor: theme.textColor,
            borderWidth: 1,
          },
        },
        data: s.data,
      })),
    };
  }, [data, theme]);

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
