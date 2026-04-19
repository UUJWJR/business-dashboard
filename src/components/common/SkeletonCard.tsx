import { motion } from 'framer-motion';

export default function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-card p-6 border border-gray-100 dark:border-gray-700"
    >
      <div className="animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </motion.div>
  );
}
