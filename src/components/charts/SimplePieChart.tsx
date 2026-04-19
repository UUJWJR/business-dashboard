import { useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { DistributionData } from '../../types';
import ChartCard from './ChartCard';

interface Props {
  title: string;
  data: DistributionData[];
  isDark: boolean;
  onRefresh: () => void;
  className?: string;
  donut?: boolean;
}

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function SimplePieChart({
  title,
  data,
  isDark,
  onRefresh,
  className = '',
  donut = true,
}: Props) {
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
        formatter: '{b}<br/>占比: {d}%<br/>数值: {c}',
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
          name: title,
          type: 'pie',
          radius: donut ? ['45%', '70%'] : ['0%', '70%'],
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
      graphic: donut
        ? [
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
                text: `${total.toFixed(1)}`,
                textAlign: 'center',
                fill: isDark ? '#e5e7eb' : '#1f2937',
                fontSize: 18,
                fontWeight: 'bold',
              },
            },
          ]
        : undefined,
    };
  }, [data, isDark, donut, title, total]);

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
