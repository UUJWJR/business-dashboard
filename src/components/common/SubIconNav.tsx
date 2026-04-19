import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface SubIconNavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface SubIconNavProps {
  items: SubIconNavItem[];
  activePath?: string;
  activeIndex?: number;
  onItemClick?: (index: number) => void;
}

export default function SubIconNav({ items, activePath, activeIndex, onItemClick }: SubIconNavProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {items.map((item, index) => {
        const Icon = item.icon;
        const active = activeIndex !== undefined ? index === activeIndex : activePath === item.path;
        return (
          <button
            key={item.path}
            onClick={() => {
              if (onItemClick) {
                onItemClick(index);
              } else {
                navigate(item.path);
              }
            }}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-btn text-sm font-medium whitespace-nowrap transition-colors ${
              active
                ? 'text-primary-700 dark:text-primary-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-surface-100 dark:hover:bg-white/[0.04]'
            }`}
          >
            {active && (
              <motion.div
                layoutId="subIconNavBg"
                className="absolute inset-0 bg-primary-50/60 dark:bg-primary-900/10 rounded-btn ring-1 ring-primary-100/60 dark:ring-primary-800/40"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <Icon className={`relative z-10 w-4 h-4 ${active ? 'text-primary-600 dark:text-primary-400' : ''}`} />
            <span className="relative z-10">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
