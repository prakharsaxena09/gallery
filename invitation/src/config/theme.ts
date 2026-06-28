/**
 * theme.ts — per-scene lighting and atmosphere.
 *
 * "Lighting is narrative" (CREATIVE_DIRECTOR_NOTES): the story moves through
 * time, from near-darkness to moonlight. Each scene declares a background, an
 * ambient particle system and an optional vignette so the SceneShell can dress
 * the stage consistently. Colours stay strictly inside the approved palette.
 */

import type { ParticleKind } from '@lib/particles-types';

export type SceneId =
  | 'arrival'
  | 'seal'
  | 'greeting'
  | 'story'
  | 'couple'
  | 'families'
  | 'celebration'
  | 'details'
  | 'rsvp'
  | 'farewell';

export interface SceneTheme {
  readonly id: SceneId;
  readonly index: number;
  /** Human chapter title (used for progress + a11y announcements). */
  readonly chapter: string;
  /** CSS background applied to the scene stage (no generic gradients —
   *  these are time-of-day lighting washes from the palette). */
  readonly background: string;
  /** Foreground text colour for this lighting. */
  readonly onColor: string;
  /** Ambient particle system for the scene, or null. */
  readonly particles: ParticleKind | null;
  /** Soft radial vignette strength 0–1 (warm, never harsh). */
  readonly vignette: number;
}

export const SCENES: readonly SceneTheme[] = [
  {
    id: 'arrival',
    index: 0,
    chapter: 'Arrival',
    // Near darkness — midnight rooftop before the light arrives.
    background:
      'radial-gradient(120% 90% at 50% 38%, #1d2c47 0%, #162239 42%, #0e1626 100%)',
    onColor: '#efe8dc',
    particles: 'golddust',
    vignette: 0.85,
  },
  {
    id: 'seal',
    index: 1,
    chapter: 'The Letter',
    // Warm spotlight pooling on the paper.
    background:
      'radial-gradient(95% 70% at 50% 42%, #2a2a3f 0%, #1a2236 55%, #11192a 100%)',
    onColor: '#efe8dc',
    particles: 'golddust',
    vignette: 0.7,
  },
  {
    id: 'greeting',
    index: 2,
    chapter: 'For You',
    // Golden hour warming the ivory.
    background:
      'radial-gradient(110% 90% at 50% 30%, #f3e6cf 0%, #ecd9bb 45%, #e3c8a3 100%)',
    onColor: '#4c372e',
    particles: 'golddust',
    vignette: 0.35,
  },
  {
    id: 'story',
    index: 3,
    chapter: 'Our Story',
    // Sunset.
    background:
      'linear-gradient(180deg, #f0d9bd 0%, #e7c3a4 46%, #d8a98f 100%)',
    onColor: '#4c372e',
    particles: 'petals',
    vignette: 0.3,
  },
  {
    id: 'couple',
    index: 4,
    chapter: 'The Two of Us',
    // Late sunset / dusk.
    background:
      'linear-gradient(180deg, #e7c6a8 0%, #caa2a5 60%, #8c6f78 100%)',
    onColor: '#3a2a26',
    particles: 'mogra',
    vignette: 0.32,
  },
  {
    id: 'families',
    index: 5,
    chapter: 'Our Families',
    // Blue hour with lantern warmth.
    background:
      'linear-gradient(180deg, #45506b 0%, #2f3a57 55%, #1e2740 100%)',
    onColor: '#f1e7d6',
    particles: 'fireflies',
    vignette: 0.55,
  },
  {
    id: 'celebration',
    index: 6,
    chapter: 'The Celebration',
    // Lantern glow over the rooftop.
    background:
      'linear-gradient(180deg, #243049 0%, #1c2740 50%, #141d33 100%)',
    onColor: '#f1e7d6',
    particles: 'fireflies',
    vignette: 0.5,
  },
  {
    id: 'details',
    index: 7,
    chapter: 'When & Where',
    // Warm evening, paper forward.
    background:
      'radial-gradient(100% 80% at 50% 32%, #25324c 0%, #1a2438 60%, #121a2c 100%)',
    onColor: '#f1e7d6',
    particles: 'golddust',
    vignette: 0.6,
  },
  {
    id: 'rsvp',
    index: 8,
    chapter: 'Join Us',
    // Blue hour, intimate.
    background:
      'radial-gradient(100% 85% at 50% 40%, #2a3756 0%, #1b2540 58%, #121a2e 100%)',
    onColor: '#f1e7d6',
    particles: 'golddust',
    vignette: 0.6,
  },
  {
    id: 'farewell',
    index: 9,
    chapter: 'Thank You',
    // Moonlight.
    background:
      'radial-gradient(120% 100% at 50% 18%, #243456 0%, #16223b 45%, #0c1322 100%)',
    onColor: '#ede4d4',
    particles: 'fireflies',
    vignette: 0.7,
  },
] as const;

export const SCENE_COUNT = SCENES.length;

export function sceneAt(index: number): SceneTheme {
  const clamped = Math.max(0, Math.min(SCENES.length - 1, index));
  // SCENES is a fixed, fully-populated tuple; index is clamped in-range.
  return SCENES[clamped] as SceneTheme;
}
