export interface ChartTheme {
  name: string;
  colors: string[];
  backgroundColor?: string;
  textColor: string;
  axisColor: string;
  gridColor: string;
  fontFamily: string;
  barRadius?: number;
  lineWidth?: number;
  symbolSize?: number;
  areaOpacity?: number;
}

export const chartThemes: Record<string, ChartTheme> = {
  mckinsey: {
    name: '麦肯锡',
    colors: ['#003087', '#6CACE4', '#A5ACAF', '#D9D9D9', '#333333', '#666666'],
    textColor: '#333333',
    axisColor: '#CCCCCC',
    gridColor: '#EEEEEE',
    fontFamily: 'Arial, sans-serif',
    barRadius: 0,
    lineWidth: 2,
    symbolSize: 4,
    areaOpacity: 0.1,
  },
  china: {
    name: '国标大厂',
    colors: ['#C41230', '#D4AF37', '#333333', '#999999', '#666666', '#CC9966'],
    textColor: '#333333',
    axisColor: '#DDDDDD',
    gridColor: '#F5F5F5',
    fontFamily: '"Microsoft YaHei", "SimHei", sans-serif',
    barRadius: 4,
    lineWidth: 3,
    symbolSize: 6,
    areaOpacity: 0.15,
  },
  tech: {
    name: '科技风',
    colors: ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'],
    backgroundColor: '#0f172a',
    textColor: '#e2e8f0',
    axisColor: '#334155',
    gridColor: '#1e293b',
    fontFamily: '"Inter", -apple-system, sans-serif',
    barRadius: 6,
    lineWidth: 3,
    symbolSize: 8,
    areaOpacity: 0.25,
  },
};
