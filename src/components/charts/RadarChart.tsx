import { useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { RadarData } from '../../types/pageBuilder';
import type { ChartTheme } from '../../utils/chartThemes';
import ChartCard from './ChartCard';

interface Props {
  title: string;
  data: RadarData;
  theme: ChartTheme;
  onRefresh: () => void;
  className?: string;
}

export default function RadarChart({
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
      },
      legend: {
        data: data.series.map((s) => s.name),
        textStyle: { color: theme.textColor, fontFamily: theme.fontFamily },
        bottom: 0,
      },
      radar: {
        indicator: data.indicator.map((ind) => ({
          name: ind.name,
          max: ind.max,
        })),
        axisName: {
          color: theme.textColor,
          fontFamily: theme.fontFamily,
        },
        splitArea: {
          areaStyle: {
            color: theme.colors.slice(0, 3).map((c) => `${c}1A`),
          },
        },
        axisLine: {
          lineStyle: { color: theme.axisColor },
        },
        splitLine: {
          lineStyle: { color: theme.axisColor },
        },
      },
      series: [
        {
          type: 'radar',
          data: data.series.map((s, i) => ({
            name: s.name,
            value: s.data,
            itemStyle: {
              color: theme.colors[i % theme.colors.length],
            },
            lineStyle: {
              width: theme.lineWidth || 2,
              color: theme.colors[i % theme.colors.length],
            },
            areaStyle: {
              color: `${theme.colors[i % theme.colors.length]}${Math.round((theme.areaOpacity || 0.1) * 255).toString(16).padStart(2, '0')}`,
            },
            symbol: 'circle',
            symbolSize: theme.symbolSize || 4,
          })),
        },
      ],
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
