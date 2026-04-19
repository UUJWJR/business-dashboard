export function animateNumber(
  start: number,
  end: number,
  duration: number,
  callback: (val: number) => void,
  format?: (val: number) => string
): () => void {
  const startTime = performance.now();
  let rafId: number;

  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (end - start) * eased;

    callback(current);

    if (progress < 1) {
      rafId = requestAnimationFrame(step);
    }
  };

  rafId = requestAnimationFrame(step);

  return () => cancelAnimationFrame(rafId);
}
