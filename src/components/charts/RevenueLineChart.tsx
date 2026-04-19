import { useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { RevenueData } from '../../types';
import ChartCard from './ChartCard';

interface Props {
  data: RevenueData;
  isDark: boolean;
  onRefresh: () => void;
}

export default function RevenueLineChart({ data, isDark, onRefresh }: Props) {
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
        formatter: (params: any[]) => {
          let html = `<div style="font-weight:600;margin-bottom:4px;">${params[0].axisValue}</div>`;
          params.forEach((p) => {
            const prevIndex = p.dataIndex - 1;
            let growthStr = '';
            if (prevIndex >= 0) {
              const prev = p.seriesName === '总收入'
                ? data.totalRevenue[prevIndex]
                : data.netProfit[prevIndex];
              const growth = prev ? ((p.value - prev) / prev) * 100 : 0;
              const sign = growth >= 0 ? '+' : '';
              growthStr = ` <span style="font-size:11px;color:${growth >= 0 ? '#22c55e' : '#ef4444'}">(${sign}${growth.toFixed(2)}%)</span>`;
            }
            html += `<div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
              <span style="width:8px;height:8px;border-radius:50%;background:${p.color};"></span>
              <span>${p.seriesName}: <strong>${p.value}万</strong>${growthStr}</span>
            </div>`;
          });
          return html;
        },
      },
      legend: {
        data: ['总收入', '净利润'],
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
        boundaryGap: false,
        data: data.months,
        axisLine: { lineStyle: { color: axisColor } },
        axisLabel: { color: textColor },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: gridColor, type: 'dashed' } },
        axisLabel: {
          color: textColor,
          formatter: '{value}万',
        },
      },
      dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        {
          start: 0,
          end: 100,
          height: 20,
          bottom: 30,
          handleStyle: {
            color: isDark ? '#6366f1' : '#4f46e5',
          },
          textStyle: { color: textColor },
          borderColor: axisColor,
          fillerColor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(79,70,229,0.1)',
        },
      ],
      series: [
        {
          name: '总收入',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { width: 3, color: '#6366f1' },
          itemStyle: { color: '#6366f1' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(99,102,241,0.4)' },
                { offset: 1, color: 'rgba(99,102,241,0.02)' },
              ],
            },
          },
          data: data.totalRevenue,
        },
        {
          name: '净利润',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { width: 3, color: '#22c55e' },
          itemStyle: { color: '#22c55e' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(34,197,94,0.3)' },
                { offset: 1, color: 'rgba(34,197,94,0.02)' },
              ],
            },
          },
          data: data.netProfit,
        },
      ],
    };
  }, [data, isDark]);

  return (
    <ChartCard title="收入增长趋势" onRefresh={onRefresh} chartRef={chartRef} className="col-span-2">
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
