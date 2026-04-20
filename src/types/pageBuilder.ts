import type { TrendChartData, DistributionData, RegionData } from './index';

export type PageBuilderElementType = 'title' | 'text' | 'table' | 'chart';

export interface Position {
  x: number; // percentage of canvas width (0-100)
  y: number; // percentage of canvas height (0-100)
}

export interface Size {
  width: number;  // percentage of canvas width (0-100)
  height: number; // percentage of canvas height (0-100)
}

export interface TitlePayload {
  text: string;
  fontSize?: number;
  align?: 'left' | 'center' | 'right';
}

export interface TextPayload {
  text: string;
  fontSize?: number;
}

export interface TablePayload {
  headers: string[];
  rows: (string | number)[][];
}

export type ChartType = 'bar' | 'line' | 'pie';

export interface ChartPayload {
  chartType: ChartType;
  title: string;
  data: TrendChartData | DistributionData[] | RegionData[];
}

export type ElementPayload = TitlePayload | TextPayload | TablePayload | ChartPayload;

export interface PageBuilderElement {
  id: string;
  type: PageBuilderElementType;
  position: Position;
  size: Size;
  content: ElementPayload;
  zIndex: number;
}

export interface PageBuilderState {
  elements: PageBuilderElement[];
  selectedId: string | null;
}

export interface CanvasSize {
  width: number;
  height: number;
}
