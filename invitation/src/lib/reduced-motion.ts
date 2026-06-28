/**
 * reduced-motion.ts — one place that answers "should we animate richly?".
 * Honours the OS preference and an explicit user override stored in the app.
 */

const QUERY = '(prefers-reduced-motion: reduce)';

let override: boolean | null = null;

export function setReducedMotionOverride(value: boolean | null): void {
  override = value;
}

export function prefersReducedMotion(): boolean {
  if (override !== null) return override;
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

/** Subscribe to OS-level changes; returns an unsubscribe fn. */
export function onReducedMotionChange(cb: (reduced: boolean) => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mq = window.matchMedia(QUERY);
  const handler = (e: MediaQueryListEvent) => cb(e.matches);
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}
