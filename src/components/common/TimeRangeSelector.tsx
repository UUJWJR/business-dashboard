import type { TimeRange } from '../../types';
import { motion } from 'framer-motion';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const options: { value: TimeRange; label: string }[] = [
  { value: '7d', label: '近7天' },
  { value: '30d', label: '近30天' },
  { value: '90d', label: '近90天' },
  { value: 'year', label: '本年' },
];

export default function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto scrollbar-hide">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`relative px-3 md:px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            value === opt.value
              ? 'text-primary-700 dark:text-primary-300'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          {value === opt.value && (
            <motion.div
              layoutId="timeRangeBg"
              className="absolute inset-0 bg-white dark:bg-gray-700 rounded-md shadow-sm"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            />
          )}
          <span className="relative z-10">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
