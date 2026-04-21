import { useMemo } from 'react';
import type {
  ChartPayload,
  ChartType,
  ChartThemeName,
  TrendChartData,
  DistributionData,
  RegionData,
  ScatterData,
  RadarData,
  WaterfallDataItem,
} from '../../../types/pageBuilder';

interface ChartPropertiesProps {
  content: ChartPayload;
  onUpdate: (content: ChartPayload) => void;
}

const chartTypeOptions: { value: ChartType; label: string }[] = [
  { value: 'bar', label: '柱状图' },
  { value: 'line', label: '折线图' },
  { value: 'pie', label: '饼图' },
  { value: 'scatter', label: '散点图' },
  { value: 'radar', label: '雷达图' },
  { value: 'waterfall', label: '瀑布图' },
];

const chartThemeOptions: { value: ChartThemeName; label: string }[] = [
  { value: 'mckinsey', label: '麦肯锡' },
  { value: 'china', label: '国标大厂' },
  { value: 'tech', label: '科技风' },
];

function isTrendChartData(data: unknown): data is TrendChartData {
  return data !== null && typeof data === 'object' && 'labels' in (data as any) && 'datasets' in (data as any);
}

function isDistributionDataArray(data: unknown): data is DistributionData[] {
  return Array.isArray(data) && data.length > 0 && 'name' in data[0] && 'value' in data[0] && !('target' in data[0]);
}

function isRegionDataArray(data: unknown): data is RegionData[] {
  return Array.isArray(data) && data.length > 0 && 'name' in data[0] && 'target' in data[0];
}

function isScatterData(data: unknown): data is ScatterData {
  return data !== null && typeof data === 'object' && 'series' in (data as any) && Array.isArray((data as any).series);
}

function isRadarData(data: unknown): data is RadarData {
  return data !== null && typeof data === 'object' && 'indicator' in (data as any) && 'series' in (data as any);
}

function isWaterfallDataArray(data: unknown): data is WaterfallDataItem[] {
  return Array.isArray(data) && data.length > 0 && 'name' in data[0] && 'value' in data[0] && 'isTotal' in data[0];
}

function convertToTrendChartData(data: ChartPayload['data']): TrendChartData {
  if (isTrendChartData(data)) return data;
  if (isDistributionDataArray(data)) {
    return {
      labels: data.map((d) => d.name),
      datasets: [{ name: '数值', values: data.map((d) => d.value) }],
    };
  }
  if (isRegionDataArray(data)) {
    return {
      labels: data.map((d) => d.name),
      datasets: [{ name: '实际值', values: data.map((d) => d.value) }],
    };
  }
  if (isScatterData(data)) {
    const firstSeries = data.series[0];
    return {
      labels: firstSeries?.data.map((_, i) => `点${i + 1}`) ?? [],
      datasets: data.series.map((s) => ({ name: s.name, values: s.data.map((p) => p[1]) })),
    };
  }
  if (isRadarData(data)) {
    return {
      labels: data.indicator.map((ind) => ind.name),
      datasets: data.series.map((s) => ({ name: s.name, values: s.data })),
    };
  }
  if (isWaterfallDataArray(data)) {
    return {
      labels: data.map((d) => d.name),
      datasets: [{ name: '数值', values: data.map((d) => d.value) }],
    };
  }
  return { labels: [], datasets: [] };
}

function convertToDistributionData(data: ChartPayload['data']): DistributionData[] {
  if (isDistributionDataArray(data)) return data;
  if (isTrendChartData(data)) {
    return data.labels.map((name, i) => ({
      name,
      value: data.datasets[0]?.values[i] ?? 0,
    }));
  }
  if (isRegionDataArray(data)) {
    return data.map((d) => ({ name: d.name, value: d.value }));
  }
  if (isScatterData(data)) {
    return data.series.map((s) => ({ name: s.name, value: s.data.length }));
  }
  if (isRadarData(data)) {
    return data.indicator.map((ind, i) => ({
      name: ind.name,
      value: data.series[0]?.data[i] ?? 0,
    }));
  }
  if (isWaterfallDataArray(data)) {
    return data.map((d) => ({ name: d.name, value: d.value }));
  }
  return [];
}

function convertToRegionData(data: ChartPayload['data']): RegionData[] {
  if (isRegionDataArray(data)) return data;
  if (isTrendChartData(data)) {
    return data.labels.map((name, i) => ({
      name,
      value: data.datasets[0]?.values[i] ?? 0,
      target: Math.round((data.datasets[0]?.values[i] ?? 0) * 1.1),
    }));
  }
  if (isDistributionDataArray(data)) {
    return data.map((d) => ({ name: d.name, value: d.value, target: Math.round(d.value * 1.1) }));
  }
  if (isScatterData(data)) {
    return data.series.map((s) => ({ name: s.name, value: s.data.length, target: Math.round(s.data.length * 1.1) }));
  }
  if (isRadarData(data)) {
    return data.indicator.map((ind, i) => ({
      name: ind.name,
      value: data.series[0]?.data[i] ?? 0,
      target: ind.max,
    }));
  }
  if (isWaterfallDataArray(data)) {
    return data.map((d) => ({ name: d.name, value: d.value, target: Math.round(d.value * 1.1) }));
  }
  return [];
}

function convertToScatterData(data: ChartPayload['data']): ScatterData {
  if (isScatterData(data)) return data;
  if (isTrendChartData(data)) {
    return {
      series: data.datasets.map((ds) => ({
        name: ds.name,
        data: ds.values.map((v, i) => [i + 1, v] as [number, number]),
      })),
    };
  }
  if (isDistributionDataArray(data)) {
    return {
      series: [{ name: '数值', data: data.map((d, i) => [i + 1, d.value] as [number, number]) }],
    };
  }
  if (isRegionDataArray(data)) {
    return {
      series: [{ name: '实际值', data: data.map((d, i) => [i + 1, d.value] as [number, number]) }],
    };
  }
  if (isRadarData(data)) {
    return {
      series: data.series.map((s) => ({
        name: s.name,
        data: s.data.map((v, i) => [i + 1, v] as [number, number]),
      })),
    };
  }
  if (isWaterfallDataArray(data)) {
    return {
      series: [{ name: '数值', data: data.map((d, i) => [i + 1, d.value] as [number, number]) }],
    };
  }
  return { series: [] };
}

function convertToRadarData(data: ChartPayload['data']): RadarData {
  if (isRadarData(data)) return data;
  if (isTrendChartData(data)) {
    const max = Math.max(...data.datasets.flatMap((ds) => ds.values), 1);
    return {
      indicator: data.labels.map((name) => ({ name, max })),
      series: data.datasets.map((ds) => ({ name: ds.name, data: ds.values })),
    };
  }
  if (isDistributionDataArray(data)) {
    const max = Math.max(...data.map((d) => d.value), 1);
    return {
      indicator: data.map((d) => ({ name: d.name, max })),
      series: [{ name: '数值', data: data.map((d) => d.value) }],
    };
  }
  if (isRegionDataArray(data)) {
    const max = Math.max(...data.map((d) => Math.max(d.value, d.target)), 1);
    return {
      indicator: data.map((d) => ({ name: d.name, max })),
      series: [
        { name: '实际值', data: data.map((d) => d.value) },
        { name: '目标值', data: data.map((d) => d.target) },
      ],
    };
  }
  if (isScatterData(data)) {
    const max = Math.max(...data.series.flatMap((s) => s.data.map((p) => Math.max(p[0], p[1]))), 1);
    return {
      indicator: data.series.map((s, i) => ({ name: s.name || `维度${i + 1}`, max })),
      series: data.series.map((s) => ({ name: s.name, data: [s.data.length, s.data.reduce((sum, p) => sum + p[0] + p[1], 0) / Math.max(s.data.length, 1)] })),
    };
  }
  if (isWaterfallDataArray(data)) {
    const max = Math.max(...data.map((d) => Math.abs(d.value)), 1);
    return {
      indicator: data.map((d) => ({ name: d.name, max })),
      series: [{ name: '数值', data: data.map((d) => d.value) }],
    };
  }
  return { indicator: [], series: [] };
}

function convertToWaterfallData(data: ChartPayload['data']): WaterfallDataItem[] {
  if (isWaterfallDataArray(data)) return data;
  if (isTrendChartData(data)) {
    return data.labels.map((name, i) => ({ name, value: data.datasets[0]?.values[i] ?? 0 }));
  }
  if (isDistributionDataArray(data)) {
    return data.map((d) => ({ name: d.name, value: d.value }));
  }
  if (isRegionDataArray(data)) {
    return data.map((d) => ({ name: d.name, value: d.value }));
  }
  if (isScatterData(data)) {
    return data.series.map((s) => ({ name: s.name, value: s.data.length }));
  }
  if (isRadarData(data)) {
    return data.indicator.map((ind, i) => ({ name: ind.name, value: data.series[0]?.data[i] ?? 0 }));
  }
  return [];
}

function convertDataForChartType(data: ChartPayload['data'], chartType: ChartType): ChartPayload['data'] {
  switch (chartType) {
    case 'bar':
    case 'line':
      return convertToTrendChartData(data);
    case 'pie':
      return convertToDistributionData(data);
    case 'scatter':
      return convertToScatterData(data);
    case 'radar':
      return convertToRadarData(data);
    case 'waterfall':
      return convertToWaterfallData(data);
    default:
      return data;
  }
}

function getTableHeaders(chartType: ChartType): string[] {
  switch (chartType) {
    case 'bar':
    case 'line':
      return ['标签', '系列名', '数值'];
    case 'pie':
      return ['名称', '数值'];
    case 'scatter':
      return ['系列名', 'X', 'Y'];
    case 'radar':
      return ['维度', '最大值', '系列名', '数值'];
    case 'waterfall':
      return ['名称', '数值', '是否总计'];
    default:
      return [];
  }
}

export default function ChartProperties({ content, onUpdate }: ChartPropertiesProps) {
  const { chartType, chartTheme, title, data } = content;

  const handleChartTypeChange = (newType: ChartType) => {
    if (newType === chartType) return;
    const converted = convertDataForChartType(data, newType);
    onUpdate({ ...content, chartType: newType, data: converted });
  };

  const handleThemeChange = (newTheme: ChartThemeName) => {
    onUpdate({ ...content, chartTheme: newTheme });
  };

  const handleTitleChange = (newTitle: string) => {
    onUpdate({ ...content, title: newTitle });
  };

  const updateTrendData = (trendData: TrendChartData, rowIndex: number, colIndex: number, value: string) => {
    const labels = [...trendData.labels];
    const datasets = trendData.datasets.map((ds) => ({ ...ds, values: [...ds.values] }));
    if (colIndex === 0) {
      labels[rowIndex] = value;
    } else if (colIndex === 1) {
      const dsIndex = Math.floor(rowIndex / trendData.labels.length);
      if (datasets[dsIndex]) {
        datasets[dsIndex] = { ...datasets[dsIndex], name: value };
      }
    } else if (colIndex === 2) {
      const dsIndex = Math.floor(rowIndex / trendData.labels.length);
      const valIndex = rowIndex % trendData.labels.length;
      if (datasets[dsIndex]) {
        datasets[dsIndex].values[valIndex] = Number(value) || 0;
      }
    }
    onUpdate({ ...content, data: { labels, datasets } });
  };

  const updatePieData = (pieData: DistributionData[], index: number, colIndex: number, value: string) => {
    const newData = [...pieData];
    if (colIndex === 0) {
      newData[index] = { ...newData[index], name: value };
    } else {
      newData[index] = { ...newData[index], value: Number(value) || 0 };
    }
    onUpdate({ ...content, data: newData });
  };

  const updateScatterData = (scatterData: ScatterData, rowIndex: number, colIndex: number, value: string) => {
    const series = scatterData.series.map((s) => ({ ...s, data: s.data.map((p) => [...p] as [number, number]) }));
    let currentRow = 0;
    for (let si = 0; si < series.length; si++) {
      for (let pi = 0; pi < series[si].data.length; pi++) {
        if (currentRow === rowIndex) {
          if (colIndex === 0) {
            series[si] = { ...series[si], name: value };
          } else if (colIndex === 1) {
            series[si].data[pi][0] = Number(value) || 0;
          } else if (colIndex === 2) {
            series[si].data[pi][1] = Number(value) || 0;
          }
          onUpdate({ ...content, data: { series } });
          return;
        }
        currentRow++;
      }
    }
  };

  const updateRadarData = (radarData: RadarData, rowIndex: number, colIndex: number, value: string) => {
    const indicator = [...radarData.indicator];
    const series = radarData.series.map((s) => ({ ...s, data: [...s.data] }));
    let currentRow = 0;
    for (let ii = 0; ii < indicator.length; ii++) {
      for (let si = 0; si < series.length; si++) {
        if (currentRow === rowIndex) {
          if (colIndex === 0) {
            indicator[ii] = { ...indicator[ii], name: value };
          } else if (colIndex === 1) {
            indicator[ii] = { ...indicator[ii], max: Number(value) || 0 };
          } else if (colIndex === 2) {
            series[si] = { ...series[si], name: value };
          } else if (colIndex === 3) {
            series[si].data[ii] = Number(value) || 0;
          }
          onUpdate({ ...content, data: { indicator, series } });
          return;
        }
        currentRow++;
      }
    }
  };

  const updateWaterfallData = (wfData: WaterfallDataItem[], index: number, colIndex: number, value: string) => {
    const newData = [...wfData];
    if (colIndex === 0) {
      newData[index] = { ...newData[index], name: value };
    } else if (colIndex === 1) {
      newData[index] = { ...newData[index], value: Number(value) || 0 };
    } else if (colIndex === 2) {
      newData[index] = { ...newData[index], isTotal: value === 'true' };
    }
    onUpdate({ ...content, data: newData });
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    switch (chartType) {
      case 'bar':
      case 'line':
        updateTrendData(data as TrendChartData, rowIndex, colIndex, value);
        break;
      case 'pie':
        updatePieData(data as DistributionData[], rowIndex, colIndex, value);
        break;
      case 'scatter':
        updateScatterData(data as ScatterData, rowIndex, colIndex, value);
        break;
      case 'radar':
        updateRadarData(data as RadarData, rowIndex, colIndex, value);
        break;
      case 'waterfall':
        updateWaterfallData(data as WaterfallDataItem[], rowIndex, colIndex, value);
        break;
    }
  };

  const tableRows = useMemo(() => {
    switch (chartType) {
      case 'bar':
      case 'line': {
        const trendData = data as TrendChartData;
        const rows: string[][] = [];
        trendData.datasets.forEach((ds) => {
          trendData.labels.forEach((label, li) => {
            rows.push([label, ds.name, String(ds.values[li] ?? 0)]);
          });
        });
        return rows;
      }
      case 'pie': {
        const pieData = data as DistributionData[];
        return pieData.map((d) => [d.name, String(d.value)]);
      }
      case 'scatter': {
        const scatterData = data as ScatterData;
        const rows: string[][] = [];
        scatterData.series.forEach((s) => {
          s.data.forEach((p) => {
            rows.push([s.name, String(p[0]), String(p[1])]);
          });
        });
        return rows;
      }
      case 'radar': {
        const radarData = data as RadarData;
        const rows: string[][] = [];
        radarData.indicator.forEach((ind) => {
          radarData.series.forEach((s) => {
            const valIndex = radarData.indicator.indexOf(ind);
            rows.push([ind.name, String(ind.max), s.name, String(s.data[valIndex] ?? 0)]);
          });
        });
        return rows;
      }
      case 'waterfall': {
        const wfData = data as WaterfallDataItem[];
        return wfData.map((d) => [d.name, String(d.value), d.isTotal ? 'true' : 'false']);
      }
      default:
        return [];
    }
  }, [data, chartType]);

  const headers = getTableHeaders(chartType);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">图表类型</label>
        <select
          value={chartType}
          onChange={(e) => handleChartTypeChange(e.target.value as ChartType)}
          className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white"
        >
          {chartTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">主题</label>
        <select
          value={chartTheme}
          onChange={(e) => handleThemeChange(e.target.value as ChartThemeName)}
          className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white"
        >
          {chartThemeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">数据</label>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                {headers.map((h) => (
                  <th key={h} className="border border-gray-200 dark:border-white/[0.06] px-2 py-1 bg-gray-50 dark:bg-surface-800 text-gray-500 dark:text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-gray-200 dark:border-white/[0.06] px-1 py-0.5">
                      {ci === 2 && chartType === 'waterfall' ? (
                        <select
                          value={cell}
                          onChange={(e) => handleCellChange(ri, ci, e.target.value)}
                          className="w-full px-1 py-0.5 bg-transparent text-gray-900 dark:text-white"
                        >
                          <option value="false">否</option>
                          <option value="true">是</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(ri, ci, e.target.value)}
                          className="w-full px-1 py-0.5 bg-transparent text-gray-900 dark:text-white"
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
