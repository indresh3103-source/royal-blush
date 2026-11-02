import { DateTime } from "luxon";

export interface CalendarEntry {
  title: string;
  description?: string | null;
  location?: string | null;
  startIso: string;
  endIso: string;
  timezone: string;
}

export function googleCalendarUrl(entry: CalendarEntry) {
  const format = (iso: string) =>
    DateTime.fromISO(iso, { zone: "utc" }).toFormat("yyyyLLdd'T'HHmmss'Z'");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: entry.title,
    dates: `${format(entry.startIso)}/${format(entry.endIso)}`,
    details: entry.description ?? "",
    location: entry.location ?? "",
    ctz: entry.timezone
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function outlookCalendarUrl(entry: CalendarEntry) {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: entry.title,
    body: entry.description ?? "",
    location: entry.location ?? "",
    startdt: DateTime.fromISO(entry.startIso).toISO({ includeOffset: false }) ?? entry.startIso,
    enddt: DateTime.fromISO(entry.endIso).toISO({ includeOffset: false }) ?? entry.endIso
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
