/**
 * routes.ts — outbound link builders. All deep links derive from content.ts so
 * the couple never edits a component to change a destination (ENGINEERING_SPEC §13).
 */

import { content } from './content';

/** Google Maps directions link for the venue. */
export function mapsUrl(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    content.event.mapsQuery,
  )}`;
}

/** WhatsApp deep link prefilled with the RSVP message + guest name. */
export function whatsappUrl(guestName: string): string {
  const message = `${content.rsvp.messageTemplate}${guestName}`.trim();
  return `https://wa.me/${content.rsvp.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** Returns true when a real WhatsApp number has been configured. */
export function hasWhatsapp(): boolean {
  const n = content.rsvp.whatsappNumber.replace(/\D/g, '');
  return n.length >= 10 && !/^9?1?0{8,}$/.test(n);
}
