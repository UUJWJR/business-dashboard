import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Download } from 'lucide-react';
import type { EChartsInstance } from 'echarts-for-react';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  onRefresh?: () => void;
  chartRef?: React.RefObject<any>;
  className?: string;
}

export default function ChartCard({ title, children, onRefresh, chartRef, className = '' }: ChartCardProps) {
  const handleExport = useCallback(() => {
    if (chartRef?.current) {
      const instance = chartRef.current.getEchartsInstance() as EChartsInstance;
      const url = instance.getDataURL({ type: 'png', pixelRatio: 2 });
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.png`;
      a.click();
    }
  }, [chartRef, title]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-surface-900 rounded-card p-5 border border-gray-100/80 dark:border-white/[0.06] shadow-card dark:shadow-card-dark ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <div className="flex items-center gap-1">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="刷新"
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
          )}
          {chartRef && (
            <button
              onClick={handleExport}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="导出图片"
            >
              <Download className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
      {children}
    </motion.div>
  );
}
