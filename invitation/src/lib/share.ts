/**
 * share.ts — Web Share API with a clipboard fallback (ENGINEERING_SPEC §13).
 */

import { content } from '@config/content';

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'unsupported';

export async function shareInvite(url = currentUrl()): Promise<ShareResult> {
  const data: ShareData = {
    title: content.meta.title,
    text: content.rsvp.shareText,
    url,
  };

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (err) {
      // AbortError means the user dismissed the sheet — not a failure.
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
      // Otherwise fall through to clipboard.
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(`${content.rsvp.shareText} ${url}`);
      return 'copied';
    } catch {
      return 'unsupported';
    }
  }
  return 'unsupported';
}

function currentUrl(): string {
  return typeof window !== 'undefined' ? window.location.href : content.meta.title;
}
