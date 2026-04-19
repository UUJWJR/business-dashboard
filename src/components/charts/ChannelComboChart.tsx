import { useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { ComboData } from '../../types';
import ChartCard from './ChartCard';

interface Props {
  data: ComboData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function ChannelComboChart({ data, isDark, onRefresh }: Props) {
  const chartRef = useRef<ReactECharts>(null);

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
        axisPointer: { type: 'cross' },
      },
      legend: {
        data: ['新增用户', '转化率'],
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
        data: data.channels,
        axisLine: { lineStyle: { color: axisColor } },
        axisLabel: {
          color: textColor,
          interval: 0,
          rotate: 15,
          fontSize: 11,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: '新增用户(万)',
          nameTextStyle: { color: textColor, fontSize: 11 },
          axisLine: { show: false },
          splitLine: { lineStyle: { color: gridColor, type: 'dashed' } },
          axisLabel: { color: textColor },
        },
        {
          type: 'value',
          name: '转化率(%)',
          nameTextStyle: { color: textColor, fontSize: 11 },
          axisLine: { show: false },
          splitLine: { show: false },
          axisLabel: {
            color: textColor,
            formatter: '{value}%',
          },
        },
      ],
      series: [
        {
          name: '新增用户',
          type: 'bar',
          barWidth: '40%',
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#6366f1' },
                { offset: 1, color: '#818cf8' },
              ],
            },
          },
          emphasis: {
            itemStyle: { color: '#4f46e5' },
          },
          data: data.newUsers,
        },
        {
          name: '转化率',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { width: 3, color: '#f59e0b' },
          itemStyle: { color: '#f59e0b', borderWidth: 2, borderColor: '#fff' },
          data: data.conversionRate,
        },
      ],
    };
  }, [data, isDark]);

  return (
    <ChartCard title="用户增长结构（渠道分析）" onRefresh={onRefresh} chartRef={chartRef} className="col-span-2">
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height: 340 }}
        opts={{ renderer: 'canvas' }}
        notMerge
      />
    </ChartCard>
  );
}
