import { DateTime } from "luxon";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function zone(value?: string | null) {
  return value && value.trim() ? value : "Asia/Kolkata";
}

export function parseDate(value: string | null | undefined, timezone?: string | null) {
  if (!value) return null;
  const parsed = DateTime.fromISO(value, { zone: zone(timezone) });
  return parsed.isValid ? parsed : null;
}

export function formatDateLong(value: string | null | undefined, timezone?: string | null) {
  const parsed = parseDate(value, timezone);
  return parsed ? parsed.toFormat("cccc, dd LLLL yyyy") : "";
}

export function formatDateMedium(value: string | null | undefined, timezone?: string | null) {
  const parsed = parseDate(value, timezone);
  return parsed ? parsed.toFormat("dd LLL yyyy") : "";
}

export function formatDateShort(value: string | null | undefined, timezone?: string | null) {
  const parsed = parseDate(value, timezone);
  return parsed ? parsed.toFormat("dd MMM") : "";
}

export function formatMonth(value: string | null | undefined, timezone?: string | null) {
  const parsed = parseDate(value, timezone);
  return parsed ? parsed.toFormat("LLL").toUpperCase() : "";
}

export function formatDay(value: string | null | undefined, timezone?: string | null) {
  const parsed = parseDate(value, timezone);
  return parsed ? parsed.toFormat("dd") : "";
}

export function formatWeekday(value: string | null | undefined, timezone?: string | null) {
  const parsed = parseDate(value, timezone);
  return parsed ? parsed.toFormat("ccc").toUpperCase() : "";
}

export function formatTime(value: string | null | undefined) {
  if (!value) return "";
  const parsed = DateTime.fromFormat(value, "HH:mm");
  return parsed.isValid ? parsed.toFormat("h:mm a") : value;
}

export function formatTimeRange(start: string | null | undefined, end: string | null | undefined) {
  const left = formatTime(start);
  const right = formatTime(end);
  if (left && right) return `${left} – ${right}`;
  return left || right;
}

export function formatDateTime(value: string | null | undefined, timezone?: string | null) {
  if (!value) return "";
  const parsed = DateTime.fromISO(value).setZone(zone(timezone));
  return parsed.isValid ? parsed.toFormat("dd LLL yyyy, h:mm a") : "";
}

export function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function displayName(value: string | null | undefined, fallback = "") {
  return value && value.trim() ? value : fallback;
}

export function pluralize(count: number, singular: string, plural?: string) {
  return count === 1 ? singular : plural ?? `${singular}s`;
}

export function sectionVisible(sections: Array<{ key: string; visible: boolean }>, key: string) {
  const section = sections.find((item) => item.key === key);
  return section ? section.visible : false;
}

export function toDateTimeLocal(value: string | null | undefined) {
  if (!value) return "";
  return DateTime.fromISO(value).toFormat("yyyy-LL-dd'T'HH:mm");
}

export function formatInputDate(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

export function absoluteUrl(url: string | null | undefined, base?: string) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const origin = base || (typeof window !== "undefined" ? window.location.origin : "");
  return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function sanitizePhone(value: string) {
  return value.replace(/[^\d+\s()-]/g, "").slice(0, 30);
}

export function idempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `rsvp-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}
