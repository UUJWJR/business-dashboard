import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  Smile,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  UserCheck,
  Heart,
  Globe,
  Zap,
  Percent,
  Layers,
  Wifi,
  MapPin,
  Cpu,
  Network,
  Gift,
  Home,
} from 'lucide-react';
import type { KPIData } from '../../types';
import { animateNumber } from '../../utils/numberAnimation';

const iconMap: Record<string, React.ElementType> = {
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  Smile,
  CreditCard,
  BarChart3,
  UserCheck,
  Heart,
  Globe,
  Zap,
  Percent,
  Layers,
  Wifi,
  MapPin,
  Cpu,
  Network,
  Gift,
  Home,
};

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  primary: { bg: 'bg-white dark:bg-surface-900', text: 'text-theme-dark dark:text-theme-light', border: 'border-neutral-border dark:border-white/[0.08]' },
  success: { bg: 'bg-white dark:bg-surface-900', text: 'text-semantic-green-light dark:text-semantic-green-bg', border: 'border-neutral-border dark:border-white/[0.08]' },
  warning: { bg: 'bg-white dark:bg-surface-900', text: 'text-semantic-orange dark:text-semantic-orange/80', border: 'border-neutral-border dark:border-white/[0.08]' },
  danger: { bg: 'bg-white dark:bg-surface-900', text: 'text-semantic-red-light dark:text-semantic-red-bg', border: 'border-neutral-border dark:border-white/[0.08]' },
  info: { bg: 'bg-white dark:bg-surface-900', text: 'text-theme dark:text-theme-light', border: 'border-neutral-border dark:border-white/[0.08]' },
};

interface KPICardProps {
  data: KPIData;
  index: number;
}

export default function KPICard({ data, index }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(data.value);
  const colors = colorMap[data.color] || colorMap.primary;
  const Icon = iconMap[data.icon] || DollarSign;
  const isPositive = data.trend >= 0;

  useEffect(() => {
    const cleanup = animateNumber(
      prevValueRef.current,
      data.value,
      800,
      (val) => setDisplayValue(val)
    );
    prevValueRef.current = data.value;
    return cleanup;
  }, [data.value]);

  const formattedValue =
    data.unit === '%'
      ? displayValue.toFixed(2)
      : data.unit === '元'
      ? Math.round(displayValue).toLocaleString()
      : displayValue.toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`${colors.bg} rounded-[5px] p-3 border ${colors.border} shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="p-1.5 rounded-md bg-theme-light/40 dark:bg-theme-light/10">
          <Icon className="w-4 h-4 text-theme dark:text-theme-light" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              isPositive
                ? 'text-semantic-green-light dark:text-semantic-green-bg'
                : 'text-semantic-red-light dark:text-semantic-red-bg'
            }`}
          >
            <span>{isPositive ? '▲' : '▼'}</span>
            <span>环比 {Math.abs(data.trend).toFixed(2)}%</span>
          </div>
          {'yoyTrend' in data && typeof data.yoyTrend === 'number' && (
            <div
              className={`flex items-center gap-1 text-[10px] font-medium ${
                data.yoyTrend >= 0
                  ? 'text-semantic-green-light dark:text-semantic-green-bg'
                  : 'text-semantic-red-light dark:text-semantic-red-bg'
              }`}
            >
              <span>{data.yoyTrend >= 0 ? '▲' : '▼'}</span>
              <span>同比 {Math.abs(data.yoyTrend).toFixed(2)}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-0.5">
        <p className="text-xs text-neutral-secondary dark:text-neutral-muted">{data.title}</p>
        <p className="text-lg md:text-2xl font-bold text-theme-dark dark:text-white">
          {formattedValue}
          <span className="text-xs font-normal text-neutral-muted dark:text-neutral-muted ml-1">
            {data.unit}
          </span>
        </p>
      </div>
    </motion.div>
  );
}
