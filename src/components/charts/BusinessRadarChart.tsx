import { useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { RadarData } from '../../types';
import ChartCard from './ChartCard';

interface Props {
  data: RadarData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function BusinessRadarChart({ data, isDark, onRefresh }: Props) {
  const chartRef = useRef<ReactECharts>(null);

  const option = useMemo(() => {
    const textColor = isDark ? '#9ca3af' : '#4b5563';
    const splitColor = isDark ? '#374151' : '#e5e7eb';

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        textStyle: { color: isDark ? '#e5e7eb' : '#1f2937' },
      },
      legend: {
        data: ['本期', '上期'],
        textStyle: { color: textColor },
        bottom: 0,
      },
      radar: {
        indicator: data.indicator,
        radius: '65%',
        center: ['50%', '48%'],
        axisName: {
          color: textColor,
          fontSize: 12,
        },
        splitArea: {
          areaStyle: {
            color: isDark
              ? ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.04)']
              : ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.04)'],
          },
        },
        splitLine: {
          lineStyle: { color: splitColor },
        },
        axisLine: {
          lineStyle: { color: splitColor },
        },
      },
      series: [
        {
          name: '综合经营能力',
          type: 'radar',
          data: [
            {
              value: data.current,
              name: '本期',
              symbol: 'circle',
              symbolSize: 6,
              lineStyle: { width: 2, color: '#6366f1' },
              itemStyle: { color: '#6366f1' },
              areaStyle: {
                color: 'rgba(99,102,241,0.25)',
              },
            },
            {
              value: data.previous,
              name: '上期',
              symbol: 'circle',
              symbolSize: 4,
              lineStyle: { width: 2, type: 'dashed', color: '#22c55e' },
              itemStyle: { color: '#22c55e' },
              areaStyle: {
                color: 'rgba(34,197,94,0.15)',
              },
            },
          ],
        },
      ],
    };
  }, [data, isDark]);

  return (
    <ChartCard title="综合经营能力评估" onRefresh={onRefresh} chartRef={chartRef} className="col-span-2">
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height: 320 }}
        opts={{ renderer: 'canvas' }}
        notMerge
      />
    </ChartCard>
  );
}
