import type { TrendChartData, DistributionData, RegionData } from './index';

export type { TrendChartData, DistributionData, RegionData } from './index';

export type PageBuilderElementType = 'title' | 'text' | 'table' | 'chart' | 'shape' | 'image';
export type GridType = 'none' | 'dot' | 'grid';
export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'radar' | 'waterfall';
export type ChartThemeName = 'mckinsey' | 'china' | 'tech';
export type ShapeType = 'rect' | 'roundedRect' | 'circle' | 'triangle' | 'arrow' | 'line';

export interface Position {
  x: number; // percentage 0-100
  y: number;
}

export interface Size {
  width: number;  // percentage 0-100
  height: number;
}

export interface TextStyle {
  fontSize?: number;
  color?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  textDecoration?: 'none' | 'underline' | 'line-through';
}

export interface TitlePayload extends TextStyle {
  text: string;
  align?: 'left' | 'center' | 'right'; // deprecated, use textAlign for compatibility
}

export interface TextPayload extends TextStyle {
  text: string;
}

export interface TableCellStyle {
  backgroundColor?: string;
  color?: string;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
}

export interface TableCell {
  value: string;
  rowSpan?: number;
  colSpan?: number;
  style?: TableCellStyle;
  hidden?: boolean;
}

export interface TablePayload {
  cells: TableCell[][];
  colWidths: number[];  // percentage per column
  rowHeights: number[]; // percentage per row
  headerRowCount: number;
}

export interface ScatterData {
  series: { name: string; data: [number, number][] }[];
}

export interface RadarData {
  indicator: { name: string; max: number }[];
  series: { name: string; data: number[] }[];
}

export interface WaterfallDataItem {
  name: string;
  value: number;
  isTotal?: boolean;
}

export interface ChartPayload {
  chartType: ChartType;
  chartTheme: ChartThemeName;
  title: string;
  data: TrendChartData | DistributionData[] | RegionData[] | ScatterData | RadarData | WaterfallDataItem[];
}

export interface ShapePayload {
  shapeType: ShapeType;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  opacity?: number;
}

export interface ImagePayload {
  src: string;
  borderRadius?: number;
  opacity?: number;
}

export type ElementPayload = TitlePayload | TextPayload | TablePayload | ChartPayload | ShapePayload | ImagePayload;

export interface PageBuilderElement {
  id: string;
  type: PageBuilderElementType;
  position: Position;
  size: Size;
  content: ElementPayload;
  zIndex: number;
}

export interface Slide {
  id: string;
  name: string;
  elements: PageBuilderElement[];
  background: string;
}

export interface PageBuilderState {
  slides: Slide[];
  activeSlideId: string;
  selectedId: string | null;
  gridType: GridType;
  gridSize: number;
  isSubmitted: boolean;
  submittedAt: string | null;
}

export interface CanvasSize {
  width: number;
  height: number;
}
