import { useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { MarketShareData } from '../../types';
import ChartCard from './ChartCard';

interface Props {
  data: MarketShareData[];
  isDark: boolean;
  onRefresh: () => void;
}

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

export default function MarketSharePieChart({ data, isDark, onRefresh }: Props) {
  const chartRef = useRef<ReactECharts>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const option = useMemo(() => {
    const textColor = isDark ? '#9ca3af' : '#4b5563';

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        textStyle: { color: isDark ? '#e5e7eb' : '#1f2937' },
        formatter: (params: any) => {
          return `<div style="font-weight:600">${params.name}</div>
                  <div>占比: <strong>${params.percent}%</strong></div>
                  <div>规模: <strong>${params.value}</strong></div>`;
        },
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: textColor },
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 16,
      },
      series: [
        {
          name: '市场份额',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: isDark ? '#1f2937' : '#ffffff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}\n{d}%',
            color: textColor,
            fontSize: 11,
          },
          labelLine: {
            length: 10,
            length2: 10,
            smooth: true,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 13,
              fontWeight: 'bold',
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
            },
          },
          data: data.map((item, i) => ({
            ...item,
            itemStyle: { color: COLORS[i % COLORS.length] },
          })),
        },
      ],
      graphic: [
        {
          type: 'text',
          left: '26%',
          top: '46%',
          style: {
            text: '总计',
            textAlign: 'center',
            fill: textColor,
            fontSize: 12,
          },
        },
        {
          type: 'text',
          left: '24%',
          top: '52%',
          style: {
            text: `${total}%`,
            textAlign: 'center',
            fill: isDark ? '#e5e7eb' : '#1f2937',
            fontSize: 18,
            fontWeight: 'bold',
          },
        },
      ],
    };
  }, [data, isDark, total]);

  return (
    <ChartCard title="市场份额分布" onRefresh={onRefresh} chartRef={chartRef} className="col-span-2">
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
