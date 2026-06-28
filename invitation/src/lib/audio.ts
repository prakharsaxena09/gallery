/**
 * audio.ts — the Howler-backed sound director (ASSET_BOOK §13, MOTION_BOOK §Audio).
 *
 * Principles enforced here:
 *   • Off by default; only starts after a user gesture (the audio toggle).
 *   • Music supports emotion, never overpowers — beds sit low and crossfade.
 *   • Silence is acceptable: every file is optional. A missing asset degrades
 *     to silence with no console noise (ENGINEERING_SPEC §12).
 *
 * Files are expected under /audio. They are sourced separately; the manager
 * works perfectly (silently) until they exist.
 */

import { Howl, Howler } from 'howler';
import { store } from './store';

/** Looping ambient/music beds. One plays at a time, crossfaded on change. */
export type BedId = 'tanpura' | 'sitar' | 'strings' | 'night';

/** One-shot interaction sounds. */
export type SfxId =
  | 'paperfold'
  | 'waxcrack'
  | 'ribbon'
  | 'lantern'
  | 'bell'
  | 'wind'
  | 'chime';

// Base-aware so the site works at any deploy path (e.g. GitHub Pages /gallery/).
// BASE_URL always has a trailing slash.
const A = (file: string): string[] => [`${import.meta.env.BASE_URL}audio/${file}`];

// Self-synthesised, royalty-free WAVs (see tools/generate-audio.mjs). Drop in
// richer .mp3/.ogg later and update these names — the manager is format-agnostic.
const BED_SRC: Record<BedId, string[]> = {
  tanpura: A('tanpura.wav'),
  sitar: A('sitar.wav'),
  strings: A('strings.wav'),
  night: A('night-ambience.wav'),
};

const SFX_SRC: Record<SfxId, string[]> = {
  paperfold: A('paper-fold.wav'),
  waxcrack: A('wax-crack.wav'),
  ribbon: A('ribbon-pull.wav'),
  lantern: A('lantern.wav'),
  bell: A('temple-bell.wav'),
  wind: A('wind.wav'),
  chime: A('soft-chime.wav'),
};

const BED_VOLUME = 0.32;
const SFX_VOLUME = 0.5;
const CROSSFADE_MS = 1400;

class AudioDirector {
  private enabled = false;
  private unlocked = false;
  private beds = new Map<BedId, Howl>();
  private sfx = new Map<SfxId, Howl>();
  private currentBed: BedId | null = null;
  private pendingBed: BedId | null = null;

  init(): void {
    this.enabled = store.get().audioEnabled;
    Howler.volume(1);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /** Toggle audio. The first enable counts as the user gesture that unlocks playback. */
  setEnabled(on: boolean): void {
    this.enabled = on;
    store.set({ audioEnabled: on });
    if (on) {
      this.unlocked = true;
      if (this.pendingBed) this.playBed(this.pendingBed);
    } else {
      this.fadeOutCurrent();
    }
  }

  private getBed(id: BedId): Howl {
    let h = this.beds.get(id);
    if (!h) {
      h = new Howl({
        src: BED_SRC[id],
        loop: true,
        volume: 0,
        html5: true,
        onloaderror: () => {}, // optional asset — stay silent
        onplayerror: () => {},
      });
      this.beds.set(id, h);
    }
    return h;
  }

  private getSfx(id: SfxId): Howl {
    let h = this.sfx.get(id);
    if (!h) {
      h = new Howl({
        src: SFX_SRC[id],
        volume: SFX_VOLUME,
        onloaderror: () => {},
        onplayerror: () => {},
      });
      this.sfx.set(id, h);
    }
    return h;
  }

  /** Request a music bed for the current scene. Crossfades from the previous one. */
  playBed(id: BedId): void {
    this.pendingBed = id;
    if (!this.enabled || !this.unlocked) return;
    if (this.currentBed === id) return;

    this.fadeOutCurrent();

    const next = this.getBed(id);
    try {
      if (!next.playing()) next.play();
      next.fade(next.volume() as number, BED_VOLUME, CROSSFADE_MS);
    } catch {
      /* ignore */
    }
    this.currentBed = id;
  }

  private fadeOutCurrent(): void {
    if (!this.currentBed) return;
    const prev = this.beds.get(this.currentBed);
    if (prev) {
      try {
        prev.fade(prev.volume() as number, 0, CROSSFADE_MS);
        window.setTimeout(() => prev.stop(), CROSSFADE_MS + 60);
      } catch {
        /* ignore */
      }
    }
    this.currentBed = null;
  }

  /** Play a one-shot interaction sound. */
  play(id: SfxId): void {
    if (!this.enabled || !this.unlocked) return;
    try {
      this.getSfx(id).play();
    } catch {
      /* ignore */
    }
  }

  /** Gently fade everything to silence (Scene 10 finale). */
  fadeAll(ms = 2500): void {
    for (const h of this.beds.values()) {
      try {
        h.fade(h.volume() as number, 0, ms);
        window.setTimeout(() => h.stop(), ms + 60);
      } catch {
        /* ignore */
      }
    }
    this.currentBed = null;
  }
}

export const audio = new AudioDirector();
