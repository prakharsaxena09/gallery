/**
 * ics.ts — generates an RFC 5545 calendar file for the Roka and triggers a
 * download (ENGINEERING_SPEC §13). All data comes from content.ts.
 */

import { content } from '@config/content';

function toICSDate(iso: string): string {
  // Convert an ISO string (with offset) to UTC basic format: YYYYMMDDTHHMMSSZ
  const d = new Date(iso);
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function buildICS(): string {
  const { event, occasion, couple, venue } = content;
  const title = `${couple.groom.name} & ${couple.bride.name} — ${occasion}`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Prakhar & Pranjali//Roka//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:roka-${toICSDate(event.dateISO)}@prakhar-pranjali`,
    `DTSTAMP:${toICSDate(new Date().toISOString())}`,
    `DTSTART:${toICSDate(event.dateISO)}`,
    `DTEND:${toICSDate(event.endISO)}`,
    `SUMMARY:${escapeText(title)}`,
    `DESCRIPTION:${escapeText(content.greeting.line)}`,
    `LOCATION:${escapeText(`${venue.name}, ${content.event.mapsQuery}`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  // ICS requires CRLF line endings.
  return lines.join('\r\n');
}

export function downloadICS(): void {
  const blob = new Blob([buildICS()], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'prakhar-pranjali-roka.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke after the click has been handled.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
