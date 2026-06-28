/**
 * store.ts — a tiny reactive store (no framework). Persists the bits the
 * ENGINEERING_SPEC §8 asks for: current chapter, audio enabled, reduced-motion
 * override and guest name. Safe in SSR (guards window/localStorage).
 */

export interface AppState {
  chapter: number;
  audioEnabled: boolean;
  reducedMotion: boolean | null; // null = follow OS
  guest: string;
  started: boolean;
}

const STORAGE_KEY = 'roka:v1';

const defaultState: AppState = {
  chapter: 0,
  audioEnabled: false, // audio is off by default, user-initiated
  reducedMotion: null,
  guest: '',
  started: false,
};

type Listener = (state: Readonly<AppState>) => void;

function load(): AppState {
  if (typeof localStorage === 'undefined') return { ...defaultState };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...defaultState, ...parsed };
  } catch {
    return { ...defaultState };
  }
}

class Store {
  private state: AppState = load();
  private listeners = new Set<Listener>();

  get(): Readonly<AppState> {
    return this.state;
  }

  set(patch: Partial<AppState>): void {
    this.state = { ...this.state, ...patch };
    this.persist();
    this.emit();
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    for (const fn of this.listeners) fn(this.state);
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      // Persist only the durable fields.
      const { chapter, audioEnabled, reducedMotion, guest } = this.state;
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ chapter, audioEnabled, reducedMotion, guest }),
      );
    } catch {
      /* private mode / quota — non-fatal */
    }
  }
}

export const store = new Store();
