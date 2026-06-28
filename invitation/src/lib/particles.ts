/**
 * particles.ts — a small, GPU-light canvas particle engine (MOTION_BOOK §Particle
 * Systems). One instance per active scene; counts are deliberately low and the
 * loop pauses when the tab is hidden or reduced motion is requested.
 *
 * Kinds: golddust (drift), petals / mogra (physics fall + rotation),
 * fireflies (organic glow), sparks (rising embers).
 */

import type { ParticleKind } from './particles-types';
import { prefersReducedMotion } from './reduced-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vrot: number;
  alpha: number;
  alphaPhase: number;
  hue: number; // index into the palette for the kind
}

const PALETTES: Record<ParticleKind, string[]> = {
  golddust: ['#e6cf9b', '#c8a86b', '#f3e3bd'],
  petals: ['#caa2a5', '#e3c9cb', '#b98a8d'],
  mogra: ['#fbf8f3', '#efe8dc', '#f6f1e7'],
  fireflies: ['#f3e3bd', '#e6cf9b', '#fff4cf'],
  sparks: ['#f0c068', '#e6cf9b', '#ffd98a'],
};

// Base counts at the 390px reference width; scaled by area, capped.
const BASE_COUNT: Record<ParticleKind, number> = {
  golddust: 14,
  petals: 12,
  mogra: 14,
  fireflies: 16,
  sparks: 18,
};

export interface ParticleField {
  start(): void;
  stop(): void;
  destroy(): void;
}

export function createParticleField(
  canvas: HTMLCanvasElement,
  kind: ParticleKind,
): ParticleField {
  const ctx = canvas.getContext('2d', { alpha: true });
  let raf = 0;
  let running = false;
  let w = 0;
  let h = 0;
  let dpr = 1;
  let particles: Particle[] = [];
  let last = 0;

  const palette = PALETTES[kind];

  function count(): number {
    const area = (w * h) / (390 * 844);
    return Math.max(6, Math.min(Math.round(BASE_COUNT[kind] * area), 40));
  }

  function resize(): void {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function rand(a: number, b: number): number {
    return a + Math.random() * (b - a);
  }

  function makeParticle(initial: boolean): Particle {
    const hue = Math.floor(rand(0, palette.length));
    switch (kind) {
      case 'petals':
      case 'mogra': {
        return {
          x: rand(0, w),
          y: initial ? rand(0, h) : rand(-40, -8),
          vx: rand(-8, 8),
          vy: rand(14, 30),
          size: rand(7, 13),
          rot: rand(0, Math.PI * 2),
          vrot: rand(-0.8, 0.8),
          alpha: rand(0.5, 0.9),
          alphaPhase: rand(0, Math.PI * 2),
          hue,
        };
      }
      case 'fireflies': {
        return {
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-6, 6),
          vy: rand(-6, 6),
          size: rand(1.6, 3.2),
          rot: 0,
          vrot: 0,
          alpha: rand(0.2, 0.8),
          alphaPhase: rand(0, Math.PI * 2),
          hue,
        };
      }
      case 'sparks': {
        return {
          x: rand(0, w),
          y: initial ? rand(0, h) : rand(h, h + 30),
          vx: rand(-5, 5),
          vy: rand(-26, -14),
          size: rand(1.2, 2.6),
          rot: 0,
          vrot: 0,
          alpha: rand(0.4, 0.9),
          alphaPhase: rand(0, Math.PI * 2),
          hue,
        };
      }
      case 'golddust':
      default: {
        return {
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-5, 5),
          vy: rand(-10, -3),
          size: rand(1.2, 3),
          rot: 0,
          vrot: 0,
          alpha: rand(0.15, 0.7),
          alphaPhase: rand(0, Math.PI * 2),
          hue,
        };
      }
    }
  }

  function seed(): void {
    const n = count();
    particles = Array.from({ length: n }, () => makeParticle(true));
  }

  function recycle(p: Particle): void {
    Object.assign(p, makeParticle(false));
  }

  function step(p: Particle, dt: number): void {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.vrot * dt;
    p.alphaPhase += dt * 1.6;

    if (kind === 'petals' || kind === 'mogra') {
      // gentle sinusoidal sway as they fall
      p.x += Math.sin(p.alphaPhase) * 6 * dt;
      if (p.y > h + 20) recycle(p);
    } else if (kind === 'fireflies') {
      // wander + soft bounds
      p.vx += rand(-4, 4) * dt;
      p.vy += rand(-4, 4) * dt;
      p.vx = Math.max(-10, Math.min(10, p.vx));
      p.vy = Math.max(-10, Math.min(10, p.vy));
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;
    } else if (kind === 'sparks') {
      p.vy += 2 * dt; // slight deceleration as embers rise
      if (p.y < -20) recycle(p);
    } else {
      // golddust drift, wraps around
      if (p.y < -10) p.y = h + 10;
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
    }
  }

  function drawPetal(p: Particle, color: string): void {
    if (!ctx) return;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    // a soft petal: two quadratic curves
    ctx.moveTo(0, -p.size);
    ctx.quadraticCurveTo(p.size * 0.7, -p.size * 0.2, 0, p.size);
    ctx.quadraticCurveTo(-p.size * 0.7, -p.size * 0.2, 0, -p.size);
    ctx.fill();
    ctx.restore();
  }

  function drawGlow(p: Particle, color: string): void {
    if (!ctx) return;
    const flicker = kind === 'fireflies' ? (Math.sin(p.alphaPhase) + 1) / 2 : 1;
    const a = p.alpha * (kind === 'fireflies' ? 0.35 + flicker * 0.65 : 1);
    ctx.save();
    ctx.globalAlpha = a;
    const r = p.size * (kind === 'fireflies' ? 3.5 : 2.2);
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function frame(now: number): void {
    if (!ctx) return;
    const dt = Math.min((now - last) / 1000, 0.05) || 0.016;
    last = now;
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      step(p, dt);
      const color = palette[p.hue] ?? palette[0] ?? '#e6cf9b';
      if (kind === 'petals' || kind === 'mogra') drawPetal(p, color);
      else drawGlow(p, color);
    }
    if (running) raf = requestAnimationFrame(frame);
  }

  const onVisibility = (): void => {
    if (document.hidden) pause();
    else if (running) resume();
  };

  function pause(): void {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }
  function resume(): void {
    last = performance.now();
    if (!raf) raf = requestAnimationFrame(frame);
  }

  const onResize = (): void => resize();

  return {
    start(): void {
      if (prefersReducedMotion()) return; // particles disabled under reduced motion
      if (running) return;
      running = true;
      resize();
      window.addEventListener('resize', onResize, { passive: true });
      document.addEventListener('visibilitychange', onVisibility);
      resume();
    },
    stop(): void {
      running = false;
      pause();
      if (ctx) ctx.clearRect(0, 0, w, h);
    },
    destroy(): void {
      running = false;
      pause();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      particles = [];
    },
  };
}
