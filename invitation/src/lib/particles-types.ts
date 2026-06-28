/** Particle systems available to scenes (ASSET_BOOK §12, MOTION_BOOK §Particles). */
export type ParticleKind =
  | 'golddust' // P001 — slow drifting champagne motes
  | 'petals' // P002 — rose petals, physics fall
  | 'mogra' // mogra petals, lighter + whiter
  | 'fireflies' // P003 — organic glow, night scenes only
  | 'sparks'; // lantern sparks, rising embers
