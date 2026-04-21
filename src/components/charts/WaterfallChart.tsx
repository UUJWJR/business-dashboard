import { useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import ChartCard from './ChartCard';

interface WaterfallItem {
  name: string;
  value: number;
  type: 'positive' | 'negative' | 'total';
}

interface Props {
  title: string;
  data: WaterfallItem[];
  isDark: boolean;
  onRefresh: () => void;
  className?: string;
}

const COLORS = {
  positive: '#1AAB55',
  negative: '#CF1322',
  total: '#00467F',
};

export default function WaterfallChart({
  title,
  data,
  isDark,
  onRefresh,
  className = '',
}: Props) {
  const chartRef = useRef<ReactECharts>(null);

  const option = useMemo(() => {
    const textColor = isDark ? '#9ca3af' : '#595959';
    const axisColor = isDark ? '#374151' : '#D9D9D9';
    const gridColor = isDark ? '#374151' : '#F5F6F8';

    let cumulative = 0;
    const placeholders: number[] = [];
    const values: number[] = [];
    const colors: string[] = [];
    const labels: string[] = [];

    data.forEach((item) => {
      labels.push(item.name);
      if (item.type === 'total') {
        placeholders.push(0);
        values.push(item.value);
        cumulative = item.value;
      } else if (item.type === 'positive') {
        placeholders.push(cumulative);
        values.push(item.value);
        cumulative += item.value;
      } else {
        cumulative += item.value;
        placeholders.push(cumulative);
        values.push(Math.abs(item.value));
      }
      colors.push(COLORS[item.type]);
    });

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderColor: isDark ? '#374151' : '#D9D9D9',
        textStyle: { color: isDark ? '#e5e7eb' : '#1A1A1A' },
        axisPointer: { type: 'shadow' },
        formatter: (params: any[]) => {
          const idx = params[0]?.dataIndex ?? 0;
          const item = data[idx];
          const val = item.value;
          const sign = item.type === 'negative' ? '' : val >= 0 ? '+' : '';
          return `${item.name}<br/>数值: ${sign}${val}`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '12%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: { lineStyle: { color: axisColor } },
        axisLabel: { color: textColor, fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: gridColor, type: 'solid' } },
        axisLabel: { color: textColor, fontSize: 11 },
      },
      series: [
        {
          name: 'placeholder',
          type: 'bar',
          stack: 'total',
          itemStyle: { borderColor: 'transparent', color: 'transparent' },
          emphasis: { itemStyle: { borderColor: 'transparent', color: 'transparent' } },
          data: placeholders,
        },
        {
          name: '数值',
          type: 'bar',
          stack: 'total',
          barWidth: '50%',
          label: {
            show: true,
            position: 'top',
            color: textColor,
            fontSize: 11,
            formatter: (p: any) => {
              const item = data[p.dataIndex];
              const val = item.value;
              if (item.type === 'total') return `${val}`;
              return val >= 0 ? `+${val}` : `${val}`;
            },
          },
          itemStyle: {
            color: (p: any) => colors[p.dataIndex],
            borderRadius: [4, 4, 0, 0],
          },
          data: values,
        },
      ],
    };
  }, [data, isDark]);

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
