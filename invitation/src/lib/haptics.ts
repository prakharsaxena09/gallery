/**
 * haptics.ts — light tactile feedback (MOTION_BOOK §Haptics). Silently no-ops
 * where the Vibration API is unavailable (most desktops, iOS Safari).
 */

export type HapticStrength = 'light' | 'medium' | 'strong';

const PATTERNS: Record<HapticStrength, number | number[]> = {
  light: 8,
  medium: 16,
  strong: [22, 40, 22],
};

export function haptic(strength: HapticStrength = 'light'): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(PATTERNS[strength]);
  } catch {
    /* vibration can throw if disabled by the user agent — ignore */
  }
}
