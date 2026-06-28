/**
 * scene-controller.ts — the single conductor of the experience
 * (ENGINEERING_SPEC §6, SCENE_IMPLEMENTATION_SPEC "one master timeline").
 *
 * Responsibilities:
 *   • Owns scene order and the active index; performs continuous transitions.
 *   • Drives each scene's lifecycle: enter() → idle(), and exit()/destroy().
 *   • Lazily initialises a scene the first time it is entered, and asks the
 *     next scene to preload while the current one is active.
 *   • Syncs the music bed and broadcasts `scene:change` for chrome (dots, audio).
 *   • Persists progress and restores it on load.
 *
 * Order-independence: scene <script> modules and this controller are bundled as
 * hoisted scripts whose execution order is not guaranteed. So the controller
 * binds scene *roots* straight from the DOM (never depending on registration),
 * and a scene that registers *after* mount — if it is the active one — is
 * entered immediately. This makes the boot resilient regardless of bundling.
 */

import { SCENES, type SceneId } from '@config/theme';
import { store } from './store';
import { audio, type BedId } from './audio';
import { gsap, DUR, EASE } from './motion';
import { prefersReducedMotion } from './reduced-motion';

export interface SceneHandlers {
  init?: () => void | Promise<void>;
  enter?: (direction: 1 | -1) => void;
  idle?: () => void;
  exit?: (direction: 1 | -1) => void | Promise<void>;
  destroy?: () => void;
  preload?: () => void;
}

export type SceneFactory = (root: HTMLElement) => SceneHandlers;

interface Registered {
  factory: SceneFactory;
  handlers?: SceneHandlers;
  initialised: boolean;
  preloaded: boolean;
}

/** Music bed per scene — beds crossfade as the story moves through the evening. */
const BED_BY_SCENE: Record<SceneId, BedId> = {
  arrival: 'tanpura',
  seal: 'tanpura',
  greeting: 'sitar',
  story: 'sitar',
  couple: 'sitar',
  families: 'strings',
  celebration: 'strings',
  details: 'strings',
  rsvp: 'strings',
  farewell: 'night',
};

class SceneController {
  private registry = new Map<SceneId, Registered>();
  private roots = new Map<SceneId, HTMLElement>();
  private order: SceneId[] = SCENES.map((s) => s.id);
  private index = 0;
  private transitioning = false;
  private mounted = false;
  /** Id of the scene currently shown whose enter() has run (and not yet exited). */
  private enteredId: SceneId | null = null;

  register(id: SceneId, factory: SceneFactory): void {
    this.registry.set(id, { factory, initialised: false, preloaded: false });
    if (!this.mounted) return;
    // Late registration: if this is the active scene and hasn't entered, do it now.
    if (id === this.current && this.enteredId !== id) {
      this.ensureEntered(id, 1);
    }
    // If it's the neighbour we wanted to preload, warm it now.
    const nextId = this.order[this.index + 1];
    if (id === nextId) this.preload(id);
  }

  /** Call after DOM is ready. Restores progress and activates the start scene. */
  mount(): void {
    if (this.mounted) return;
    this.mounted = true;

    // Bind roots straight from the DOM (independent of registration timing).
    for (const id of this.order) {
      const root = document.querySelector<HTMLElement>(`[data-scene="${id}"]`);
      if (root) this.roots.set(id, root);
    }

    audio.init();

    const restored = store.get().chapter;
    this.index = Math.max(0, Math.min(this.order.length - 1, restored));

    // Show only the active scene; others are inert.
    this.order.forEach((id, i) => {
      const root = this.roots.get(id);
      if (!root) return;
      const active = i === this.index;
      root.classList.toggle('is-active', active);
      root.setAttribute('aria-hidden', active ? 'false' : 'true');
      root.style.visibility = active ? 'visible' : 'hidden';
      gsap.set(root, { autoAlpha: active ? 1 : 0 });
    });

    this.activate(this.index, 1, true);
    this.broadcast();
    this.bindGlobalKeys();
  }

  get current(): SceneId {
    return this.order[this.index] as SceneId;
  }
  get currentIndex(): number {
    return this.index;
  }
  get count(): number {
    return this.order.length;
  }

  next(): void {
    if (this.index < this.order.length - 1) void this.goTo(this.index + 1);
  }
  prev(): void {
    if (this.index > 0) void this.goTo(this.index - 1);
  }

  async goTo(target: number): Promise<void> {
    if (this.transitioning || target === this.index) return;
    const clamped = Math.max(0, Math.min(this.order.length - 1, target));
    if (clamped === this.index) return;
    const direction: 1 | -1 = clamped > this.index ? 1 : -1;
    this.transitioning = true;

    const fromId = this.order[this.index] as SceneId;
    const fromRoot = this.roots.get(fromId);
    const fromHandlers = this.registry.get(fromId)?.handlers;

    // Animate out the current scene, then hide it.
    await Promise.resolve(fromHandlers?.exit?.(direction));
    this.enteredId = null;
    await this.fade(fromRoot, false);
    if (fromRoot) {
      fromRoot.classList.remove('is-active');
      fromRoot.setAttribute('aria-hidden', 'true');
      fromRoot.style.visibility = 'hidden';
    }

    this.index = clamped;
    store.set({ chapter: this.index });

    this.activate(this.index, direction, false);
    this.broadcast();
    this.transitioning = false;
  }

  /** Make a scene visible, enter it, and preload the neighbour. */
  private activate(i: number, direction: 1 | -1, initial: boolean): void {
    const id = this.order[i] as SceneId;
    const root = this.roots.get(id);
    if (!root) return;

    root.classList.add('is-active');
    root.setAttribute('aria-hidden', 'false');
    root.style.visibility = 'visible';

    audio.playBed(BED_BY_SCENE[id]);

    if (initial) {
      gsap.set(root, { autoAlpha: 1 });
      this.ensureEntered(id, direction);
    } else {
      void this.fade(root, true).then(() => this.ensureEntered(id, direction));
    }

    const nextId = this.order[i + direction];
    if (nextId) this.preload(nextId);
  }

  /** Lazily init + enter a scene's handlers (no-op until it has registered). */
  private ensureEntered(id: SceneId, direction: 1 | -1): void {
    if (this.enteredId === id) return;
    const entry = this.registry.get(id);
    const root = this.roots.get(id);
    if (!entry || !root) return; // not registered yet — register() will retry
    if (!entry.initialised) {
      entry.handlers = entry.factory(root);
      void entry.handlers.init?.();
      entry.initialised = true;
    }
    this.enteredId = id;
    entry.handlers?.enter?.(direction);
    entry.handlers?.idle?.();
  }

  private preload(id: SceneId): void {
    const entry = this.registry.get(id);
    const root = this.roots.get(id);
    if (!entry || !root || entry.preloaded) return;
    if (!entry.initialised) {
      entry.handlers = entry.factory(root);
      void entry.handlers.init?.();
      entry.initialised = true;
    }
    entry.handlers?.preload?.();
    entry.preloaded = true;
  }

  private fade(root: HTMLElement | undefined, show: boolean): Promise<void> {
    if (!root) return Promise.resolve();
    const d = prefersReducedMotion() ? 0.2 : DUR.card;
    return new Promise((resolve) => {
      gsap.to(root, {
        autoAlpha: show ? 1 : 0,
        duration: d,
        ease: EASE.inOut,
        onComplete: () => resolve(),
      });
    });
  }

  private broadcast(): void {
    window.dispatchEvent(
      new CustomEvent('scene:change', {
        detail: { index: this.index, id: this.current, count: this.count },
      }),
    );
  }

  private bindGlobalKeys(): void {
    window.addEventListener('keydown', (e) => {
      if (e.defaultPrevented) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') this.next();
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') this.prev();
    });
  }
}

export const controller = new SceneController();

export function registerScene(id: SceneId, factory: SceneFactory): void {
  controller.register(id, factory);
}
