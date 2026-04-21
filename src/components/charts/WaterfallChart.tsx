import { useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { WaterfallDataItem } from '../../types/pageBuilder';
import type { ChartTheme } from '../../utils/chartThemes';
import ChartCard from './ChartCard';

interface Props {
  title: string;
  data: WaterfallDataItem[];
  theme: ChartTheme;
  onRefresh: () => void;
  className?: string;
}

const POSITIVE_COLOR = '#22c55e';
const NEGATIVE_COLOR = '#ef4444';
const TOTAL_COLOR = '#3b82f6';

export default function WaterfallChart({
  title,
  data,
  theme,
  onRefresh,
  className = '',
}: Props) {
  const chartRef = useRef<ReactECharts>(null);

  const { categories, positive, negative, helper } = useMemo(() => {
    const cats: string[] = [];
    const pos: (number | string)[] = [];
    const neg: (number | string)[] = [];
    const help: (number | string)[] = [];

    let cumulative = 0;

    data.forEach((item, index) => {
      cats.push(item.name);
      if (item.isTotal) {
        help.push(0);
        pos.push(cumulative);
        neg.push('-');
        cumulative = item.value;
      } else {
        if (item.value >= 0) {
          help.push(cumulative);
          pos.push(item.value);
          neg.push('-');
          cumulative += item.value;
        } else {
          help.push(cumulative + item.value);
          neg.push(Math.abs(item.value));
          pos.push('-');
          cumulative += item.value;
        }
      }
    });

    return { categories: cats, positive: pos, negative: neg, helper: help };
  }, [data]);

  const option = useMemo(() => {
    const barRadius = theme.barRadius ?? 4;
    return {
      backgroundColor: theme.backgroundColor || 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: theme.backgroundColor === '#0f172a' ? '#1e293b' : '#ffffff',
        borderColor: theme.axisColor,
        textStyle: { color: theme.textColor },
        formatter: (params: any[]) => {
          const name = params[0]?.axisValue || '';
          const val = data.find((d) => d.name === name);
          if (!val) return name;
          const color = val.isTotal ? TOTAL_COLOR : val.value >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR;
          return `${name}<br/><span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>${val.value}`;
        },
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
        data: categories,
        axisLine: { lineStyle: { color: theme.axisColor } },
        axisLabel: { color: theme.textColor, fontFamily: theme.fontFamily },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: theme.gridColor, type: 'dashed' } },
        axisLabel: { color: theme.textColor, fontFamily: theme.fontFamily },
      },
      series: [
        {
          name: '辅助',
          type: 'bar',
          stack: 'total',
          itemStyle: {
            color: 'transparent',
          },
          emphasis: {
            itemStyle: { color: 'transparent' },
          },
          data: helper,
        },
        {
          name: '增加',
          type: 'bar',
          stack: 'total',
          itemStyle: {
            color: POSITIVE_COLOR,
            borderRadius: [barRadius, barRadius, 0, 0] as [number, number, number, number],
          },
          data: positive,
        },
        {
          name: '减少',
          type: 'bar',
          stack: 'total',
          itemStyle: {
            color: NEGATIVE_COLOR,
            borderRadius: [barRadius, barRadius, 0, 0] as [number, number, number, number],
          },
          data: negative,
        },
        {
          name: '总计',
          type: 'bar',
          stack: 'total',
          itemStyle: {
            color: TOTAL_COLOR,
            borderRadius: [barRadius, barRadius, 0, 0] as [number, number, number, number],
          },
          data: data.map((item) => (item.isTotal ? item.value : '-')),
        },
      ],
    };
  }, [categories, positive, negative, helper, data, theme]);

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
