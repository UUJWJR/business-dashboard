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

const colorMap: Record<string, { bg: string; text: string }> = {
  primary: { bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400' },
  success: { bg: 'bg-success-50 dark:bg-green-900/20', text: 'text-success-600 dark:text-green-400' },
  warning: { bg: 'bg-warning-50 dark:bg-yellow-900/20', text: 'text-warning-600 dark:text-yellow-400' },
  danger: { bg: 'bg-danger-50 dark:bg-red-900/20', text: 'text-danger-600 dark:text-red-400' },
  info: { bg: 'bg-info-50 dark:bg-blue-900/20', text: 'text-info-600 dark:text-blue-400' },
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
      className="bg-white dark:bg-surface-900 rounded-card p-3 border border-gray-100/80 dark:border-white/[0.06] shadow-card hover:shadow-card-hover dark:shadow-card-dark dark:hover:shadow-card-dark-hover transition-all cursor-pointer hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`p-1.5 rounded-lg ${colors.bg}`}>
          <Icon className={`w-4 h-4 ${colors.text}`} />
        </div>
        <div className="flex flex-col items-end gap-1">
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              isPositive
                ? 'text-success-600 dark:text-success-400'
                : 'text-danger-600 dark:text-danger-400'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>环比 {Math.abs(data.trend).toFixed(2)}%</span>
          </div>
          {'yoyTrend' in data && typeof data.yoyTrend === 'number' && (
            <div
              className={`flex items-center gap-1 text-xs font-medium ${
                data.yoyTrend >= 0
                  ? 'text-success-600 dark:text-success-400'
                  : 'text-danger-600 dark:text-danger-400'
              }`}
            >
              {data.yoyTrend >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span>同比 {Math.abs(data.yoyTrend).toFixed(2)}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-0.5">
        <p className="text-xs text-gray-500 dark:text-gray-400">{data.title}</p>
        <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
          {formattedValue}
          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
            {data.unit}
          </span>
        </p>
      </div>
    </motion.div>
  );
}
