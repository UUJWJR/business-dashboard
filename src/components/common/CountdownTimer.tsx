import { useState } from 'react';
import { Play, Square } from 'lucide-react';
import { useCountdownTimer } from '../../hooks/useCountdownTimer';

export default function CountdownTimer() {
  const { status, display, isOvertime, start, stop } = useCountdownTimer();
  const [inputValue, setInputValue] = useState('');

  const handleStart = () => {
    const minutes = parseInt(inputValue, 10);
    if (!isNaN(minutes) && minutes > 0) {
      start(minutes);
    }
  };

  const handleStop = () => {
    stop();
    setInputValue('');
  };

  return (
    <div className="flex items-center gap-2">
      {status === 'idle' && (
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={1}
            max={999}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="分钟"
            className="w-14 px-2 py-1 text-sm bg-white dark:bg-surface-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-center"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">分</span>
          <button
            onClick={handleStart}
            disabled={!inputValue || parseInt(inputValue, 10) <= 0}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 rounded-md transition-colors"
          >
            <Play className="w-3 h-3" />
            开始计时
          </button>
        </div>
      )}

      {(status === 'running' || status === 'overtime') && (
        <div className="flex items-center gap-3">
          <span
            className={`text-2xl font-bold tabular-nums tracking-tight ${
              isOvertime ? 'text-red-500 dark:text-red-400' : 'text-primary-600 dark:text-primary-400'
            }`}
          >
            {display}
          </span>
          <button
            onClick={handleStop}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white rounded-md transition-colors ${
              isOvertime
                ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500'
                : 'bg-gray-400 hover:bg-gray-500 dark:bg-gray-500 dark:hover:bg-gray-400'
            }`}
          >
            <Square className="w-3 h-3" />
            停止
          </button>
        </div>
      )}
    </div>
  );
}
