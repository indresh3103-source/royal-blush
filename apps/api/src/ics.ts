import { DateTime } from "luxon";

function escapeIcs(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatUtc(iso: string) {
  return DateTime.fromISO(iso, { setZone: true }).toUTC().toFormat("yyyyLLdd'T'HHmmss'Z'");
}

function foldLine(line: string) {
  const chunks: string[] = [];
  let remaining = line;
  while (remaining.length > 73) {
    chunks.push(remaining.slice(0, 73));
    remaining = remaining.slice(73);
  }
  chunks.push(remaining);
  return chunks.join("\r\n ");
}

export function buildIcs(input: {
  uid: string;
  title: string;
  description: string;
  location: string;
  startIso: string;
  endIso: string;
  timezone: string;
  url?: string | null;
}) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Royal Blush//Wedding Invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-TIMEZONE:${input.timezone}`,
    "BEGIN:VEVENT",
    `UID:${input.uid}`,
    `DTSTAMP:${DateTime.utc().toFormat("yyyyLLdd'T'HHmmss'Z'")}`,
    `DTSTART:${formatUtc(input.startIso)}`,
    `DTEND:${formatUtc(input.endIso)}`,
    foldLine(`SUMMARY:${escapeIcs(input.title)}`),
    foldLine(`DESCRIPTION:${escapeIcs(input.description)}`),
    foldLine(`LOCATION:${escapeIcs(input.location)}`),
    input.url ? foldLine(`URL:${escapeIcs(input.url)}`) : "",
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR"
  ].filter(Boolean);

  return `${lines.join("\r\n")}\r\n`;
}
