/**
 * motion.ts — the project's only direct dependency on GSAP. Every scene builds
 * its choreography from these helpers so the motion language (durations, easings,
 * reduced-motion behaviour) stays consistent with MOTION_BOOK.
 *
 * Reduced motion: rich timelines collapse to ≤300ms fades and particles/idle
 * loops are skipped (MOTION_BOOK §Accessibility).
 */

import { gsap } from 'gsap';
import { prefersReducedMotion } from './reduced-motion';

/** Motion tokens in seconds (MOTION_BOOK §Motion Tokens). */
export const DUR = {
  tap: 0.35, // MT001
  card: 0.7, // MT002
  paper: 1.2, // MT003
  camera: 1.8, // MT004
  lantern: 2.5, // MT005
} as const;

export const EASE = {
  out: 'power2.out',
  inOut: 'power2.inOut',
  paper: 'power3.inOut', // custom paper feel, no overshoot
  cinematic: 'power1.inOut',
  drift: 'sine.inOut',
} as const;

export { gsap };

/** A reduced-motion-aware duration: clamps everything to ≤0.28s when reduced. */
export function dur(seconds: number): number {
  return prefersReducedMotion() ? Math.min(seconds, 0.28) : seconds;
}

/** Reduced-motion-aware delay/stagger: collapses to 0 so content appears at
 *  once rather than making reduced-motion users sit through a sequence. */
export function rd(seconds: number): number {
  return prefersReducedMotion() ? 0 : seconds;
}

/** Simple, dependable reveal used widely and as the reduced-motion fallback. */
export function reveal(
  targets: gsap.TweenTarget,
  opts: { y?: number; delay?: number; duration?: number; stagger?: number } = {},
): gsap.core.Tween {
  const reduced = prefersReducedMotion();
  return gsap.fromTo(
    targets,
    { autoAlpha: 0, y: reduced ? 0 : (opts.y ?? 16) },
    {
      autoAlpha: 1,
      y: 0,
      duration: dur(opts.duration ?? DUR.card),
      delay: opts.delay ?? 0,
      stagger: reduced ? 0 : (opts.stagger ?? 0),
      ease: EASE.out,
    },
  );
}

/** Paper unfold around a top hinge (MT003). Falls back to a fade when reduced. */
export function paperFold(target: gsap.TweenTarget, opts: { delay?: number } = {}): gsap.core.Tween {
  if (prefersReducedMotion()) {
    return gsap.fromTo(
      target,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: dur(DUR.paper), delay: opts.delay ?? 0, ease: EASE.out },
    );
  }
  return gsap.fromTo(
    target,
    { rotateX: -88, transformOrigin: '50% 0%', autoAlpha: 0 },
    {
      rotateX: 0,
      autoAlpha: 1,
      duration: DUR.paper,
      delay: opts.delay ?? 0,
      ease: EASE.paper,
    },
  );
}

/** Slow cinematic camera move on a stage element (≤8% zoom — CAMERA RULES). */
export function cameraPan(
  target: gsap.TweenTarget,
  to: { x?: number; y?: number; scale?: number },
): gsap.core.Tween {
  if (prefersReducedMotion()) {
    return gsap.set(target, { x: 0, y: 0, scale: 1 });
  }
  const scale = Math.min(to.scale ?? 1, 1.08);
  return gsap.to(target, {
    x: to.x ?? 0,
    y: to.y ?? 0,
    scale,
    duration: DUR.camera,
    ease: EASE.cinematic,
  });
}

/**
 * Ink-writing reveal for an SVG <path> (Scene 3). Animates stroke-dashoffset
 * from the full path length to zero. Reduced motion simply shows the glyphs.
 */
export function inkWrite(
  paths: SVGPathElement[],
  opts: { duration?: number; stagger?: number; delay?: number; onComplete?: () => void } = {},
): gsap.core.Timeline {
  const tl = gsap.timeline({ delay: opts.delay ?? 0, onComplete: opts.onComplete });
  if (prefersReducedMotion()) {
    tl.set(paths, { strokeDashoffset: 0, autoAlpha: 1 });
    return tl;
  }
  paths.forEach((path, i) => {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, autoAlpha: 1 });
    tl.to(
      path,
      { strokeDashoffset: 0, duration: opts.duration ?? 1.1, ease: 'power1.inOut' },
      i * (opts.stagger ?? 0.12),
    );
  });
  return tl;
}

/** Flower / element bloom: scale + fade from a seed (MOTION_BOOK §Bloom). */
export function bloom(target: gsap.TweenTarget, opts: { delay?: number } = {}): gsap.core.Tween {
  if (prefersReducedMotion()) {
    return gsap.fromTo(target, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur(DUR.card) });
  }
  return gsap.fromTo(
    target,
    { scale: 0.6, autoAlpha: 0, transformOrigin: '50% 100%' },
    { scale: 1, autoAlpha: 1, duration: DUR.card, ease: EASE.out, delay: opts.delay ?? 0 },
  );
}

/** Kill all tweens on a set of targets (used by scene destroy()). */
export function clear(targets: gsap.TweenTarget): void {
  gsap.killTweensOf(targets);
}
