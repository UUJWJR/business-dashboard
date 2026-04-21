import { useState, useRef, useEffect, useCallback } from 'react';

interface TimerState {
  status: 'idle' | 'running' | 'overtime';
  remainingSeconds: number;
  totalSeconds: number;
}

export function useCountdownTimer() {
  const [state, setState] = useState<TimerState>({
    status: 'idle',
    remainingSeconds: 0,
    totalSeconds: 0,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback((minutes: number) => {
    const total = Math.max(1, Math.floor(minutes)) * 60;
    setState({
      status: 'running',
      remainingSeconds: total,
      totalSeconds: total,
    });
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState({
      status: 'idle',
      remainingSeconds: 0,
      totalSeconds: 0,
    });
  }, []);

  useEffect(() => {
    if (state.status === 'idle') return;

    intervalRef.current = setInterval(() => {
      setState((prev) => {
        const nextRemaining = prev.remainingSeconds - 1;
        if (nextRemaining >= 0) {
          return { ...prev, remainingSeconds: nextRemaining };
        }
        return {
          ...prev,
          status: 'overtime',
          remainingSeconds: nextRemaining,
        };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.status, state.totalSeconds]);

  const displaySeconds = Math.abs(state.remainingSeconds);
  const minutes = Math.floor(displaySeconds / 60);
  const seconds = displaySeconds % 60;
  const display = `${state.status === 'overtime' ? '-' : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    status: state.status,
    display,
    isOvertime: state.status === 'overtime',
    start,
    stop,
  };
}
