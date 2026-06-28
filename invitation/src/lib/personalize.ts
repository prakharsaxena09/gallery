/**
 * personalize.ts — guest personalization via the ?to= URL parameter
 * (ENGINEERING_SPEC §5). Sanitises input so a name can be rendered safely as
 * text and reused in deep links.
 */

import { content } from '@config/content';

const MAX_LEN = 40;

/** Title-case a decoded name while preserving common particles. */
function tidy(raw: string): string {
  const cleaned = raw
    .replace(/[<>{}\\^~`|]/g, '') // strip characters that have no place in a name
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_LEN);
  if (!cleaned) return '';
  return cleaned
    .split(' ')
    .map((w) => (w.length <= 2 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

export interface Personalization {
  /** The resolved guest name (already tidied), or the default. */
  readonly guest: string;
  /** True when a real ?to= value was supplied. */
  readonly isNamed: boolean;
}

export function resolveGuest(search?: string): Personalization {
  const query = search ?? (typeof window !== 'undefined' ? window.location.search : '');
  const params = new URLSearchParams(query);
  const raw = params.get('to') ?? params.get('guest') ?? '';
  const guest = tidy(decodeURIComponent(raw));
  if (guest) return { guest, isNamed: true };
  return { guest: content.greeting.defaultGuest, isNamed: false };
}
