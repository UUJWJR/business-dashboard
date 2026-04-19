import * as XLSX from 'xlsx';
import type {
  KPIMetric,
  TrendChartData,
  DistributionData,
  RegionData,
} from '@/types';

export interface ExcelSheet {
  name: string;
  data: unknown[][];
}

function kpiToSheet(kpis: KPIMetric[]): ExcelSheet {
  const data: unknown[][] = [
    ['指标名称', '当前值', '单位', '环比(%)', '同比(%)'],
  ];
  kpis.forEach((kpi) => {
    data.push([
      kpi.title,
      kpi.value,
      kpi.unit,
      kpi.trend,
      kpi.yoyTrend ?? '-',
    ]);
  });
  return { name: 'KPI指标', data };
}

function trendToSheet(trend: TrendChartData, sheetName: string): ExcelSheet {
  const headers = ['时间', ...trend.datasets.map((d) => d.name)];
  const data: unknown[][] = [headers];
  trend.labels.forEach((label, idx) => {
    const row: unknown[] = [label];
    trend.datasets.forEach((ds) => {
      row.push(ds.values[idx] ?? 0);
    });
    data.push(row);
  });
  return { name: sheetName, data };
}

function distributionToSheet(
  items: DistributionData[],
  sheetName: string,
): ExcelSheet {
  const data: unknown[][] = [['分类名称', '数值', '占比(%)']];
  items.forEach((item) => {
    data.push([item.name, item.value, item.percent ?? '-']);
  });
  return { name: sheetName, data };
}

function regionToSheet(regions: RegionData[], sheetName: string): ExcelSheet {
  const data: unknown[][] = [['区域名称', '实际值', '目标值', '完成率(%)']];
  regions.forEach((r) => {
    const rate = r.target > 0 ? ((r.value / r.target) * 100).toFixed(2) : '-';
    data.push([r.name, r.value, r.target, rate]);
  });
  return { name: sheetName, data };
}

function topProductsToSheet(
  items: { name: string; sales: number }[],
  sheetName: string,
): ExcelSheet {
  const data: unknown[][] = [['排名', '名称', '销量']];
  items.forEach((item, idx) => {
    data.push([idx + 1, item.name, item.sales]);
  });
  return { name: sheetName, data };
}

function topRightsToSheet(
  items: { name: string; activeUsers: number }[],
  sheetName: string,
): ExcelSheet {
  const data: unknown[][] = [['排名', '权益名称', '活跃用户数']];
  items.forEach((item, idx) => {
    data.push([idx + 1, item.name, item.activeUsers]);
  });
  return { name: sheetName, data };
}

function statusStatsToSheet(
  items: { status: string; count: number }[],
  sheetName: string,
): ExcelSheet {
  const data: unknown[][] = [['状态', '数量']];
  items.forEach((item) => {
    data.push([item.status, item.count]);
  });
  return { name: sheetName, data };
}

function churnRiskToSheet(
  items: { level: string; count: number }[],
  sheetName: string,
): ExcelSheet {
  const data: unknown[][] = [['风险等级', '数量']];
  items.forEach((item) => {
    data.push([item.level, item.count]);
  });
  return { name: sheetName, data };
}

export function exportToExcel(filename: string, sheets: ExcelSheet[]): void {
  const wb = XLSX.utils.book_new();
  sheets.forEach((sheet) => {
    const ws = XLSX.utils.aoa_to_sheet(sheet.data);

    // Auto column width
    const colWidths = sheet.data[0].map((_, colIdx) => {
      const maxLen = Math.max(
        ...sheet.data.map((row) => {
          const cell = row[colIdx];
          return cell ? String(cell).length : 0;
        }),
      );
      return { wch: Math.min(Math.max(maxLen + 2, 10), 40) };
    });
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });

  const safeName = encodeURIComponent(filename).replace(/%20/g, ' ');
  XLSX.writeFile(wb, `${safeName}.xlsx`);
}

export {
  kpiToSheet,
  trendToSheet,
  distributionToSheet,
  regionToSheet,
  topProductsToSheet,
  topRightsToSheet,
  statusStatsToSheet,
  churnRiskToSheet,
};
