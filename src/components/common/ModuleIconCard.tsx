import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Wifi,
  Home,
  Gift,
  Network,
  ArrowUpRight,
  ArrowDownRight,
  type LucideIcon,
} from 'lucide-react';
import type { ModuleConfig } from '../../types';

const iconMap: Record<string, LucideIcon> = {
  TrendingUp,
  Users,
  Wifi,
  Home,
  Gift,
  Network,
};

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  primary: {
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    text: 'text-primary-600 dark:text-primary-400',
    border: 'border-primary-100 dark:border-primary-800',
  },
  success: {
    bg: 'bg-success-50 dark:bg-green-900/20',
    text: 'text-success-600 dark:text-green-400',
    border: 'border-green-100 dark:border-green-800',
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-yellow-900/20',
    text: 'text-warning-600 dark:text-yellow-400',
    border: 'border-yellow-100 dark:border-yellow-800',
  },
  danger: {
    bg: 'bg-danger-50 dark:bg-red-900/20',
    text: 'text-danger-600 dark:text-red-400',
    border: 'border-red-100 dark:border-red-800',
  },
  info: {
    bg: 'bg-info-50 dark:bg-blue-900/20',
    text: 'text-info-600 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-800',
  },
};

interface PreviewKPI {
  title: string;
  value: number;
  unit: string;
  trend: number;
}

interface ModuleIconCardProps {
  module: ModuleConfig;
  kpis: PreviewKPI[];
  index?: number;
}

export default function ModuleIconCard({ module, kpis, index = 0 }: ModuleIconCardProps) {
  const navigate = useNavigate();
  const colors = colorMap[module.color] || colorMap.primary;
  const Icon = iconMap[module.icon] || TrendingUp;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onClick={() => navigate(module.path)}
      className="bg-white dark:bg-gray-800 rounded-card p-5 border border-gray-100 dark:border-gray-700 shadow-card hover:shadow-card-hover dark:shadow-card-dark dark:hover:shadow-card-dark-hover transition-shadow cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-lg ${colors.bg} ${colors.border} border`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{module.name}</h3>
      </div>

      <div className="space-y-3">
        {kpis.map((kpi) => {
          const isPositive = kpi.trend >= 0;
          const formattedValue =
            kpi.unit === '%'
              ? kpi.value.toFixed(2)
              : kpi.unit === '亿元' || kpi.unit === '万单' || kpi.unit === '万件' || kpi.unit === '万份' || kpi.unit === '万户'
              ? kpi.value.toFixed(1)
              : Math.round(kpi.value).toLocaleString();

          return (
            <div key={kpi.title} className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{kpi.title}</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {formattedValue}
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                    {kpi.unit}
                  </span>
                </p>
              </div>
              <div
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  isPositive
                    ? 'text-success-600 dark:text-success-400'
                    : 'text-danger-600 dark:text-danger-400'
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                <span>{Math.abs(kpi.trend).toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
