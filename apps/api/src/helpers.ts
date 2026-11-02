import { DateTime } from "luxon";
import type { InvitationSettings, Wedding } from "@prisma/client";
import { prisma } from "./db.js";

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, message: string, code = "REQUEST_FAILED", details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function requireWedding() {
  const wedding = await prisma.wedding.findFirst({
    orderBy: { createdAt: "asc" },
    include: { settings: true, theme: true }
  });
  if (!wedding) {
    throw new ApiError(404, "The invitation has not been configured yet.", "SETUP_REQUIRED");
  }
  return wedding;
}

export function buildInstant(date: string, time: string, timezone: string) {
  const parsed = DateTime.fromISO(`${date}T${time}`, { zone: timezone });
  if (!parsed.isValid) return null;
  return parsed.toUTC().toISO();
}

export function buildEndInstant(date: string, startTime: string, endTime: string | null | undefined, timezone: string) {
  const start = DateTime.fromISO(`${date}T${startTime}`, { zone: timezone });
  if (!start.isValid) return null;
  let end = endTime ? DateTime.fromISO(`${date}T${endTime}`, { zone: timezone }) : start.plus({ hours: 3 });
  if (!end.isValid) end = start.plus({ hours: 3 });
  if (end.toMillis() <= start.toMillis()) end = end.plus({ days: 1 });
  return { start: start.toUTC().toISO(), end: end.toUTC().toISO() };
}

export function eventInstants(event: {
  eventDate: string;
  startTime: string;
  endTime: string | null;
  timezone: string | null;
}, fallbackTimezone: string) {
  return buildEndInstant(event.eventDate, event.startTime, event.endTime, event.timezone || fallbackTimezone);
}

export function isRsvpOpen(wedding: Wedding, settings: InvitationSettings | null, now = DateTime.now()) {
  if (!settings?.rsvpEnabled) return false;
  if (!settings.rsvpClosingDate) return true;
  const closing = DateTime.fromISO(settings.rsvpClosingDate, { zone: wedding.timezone }).endOf("day");
  if (!closing.isValid) return true;
  return now.toUTC().toMillis() <= closing.toUTC().toMillis();
}

export function normalizePhone(value: string | null | undefined) {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 5 ? digits : null;
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function toDateLabel(date: string) {
  const parsed = DateTime.fromISO(date);
  return parsed.isValid ? parsed.toFormat("dd LLLL yyyy") : date;
}

export function publicSettings(settings: InvitationSettings | null) {
  if (!settings) return null;
  return {
    introEnabled: settings.introEnabled,
    rsvpEnabled: settings.rsvpEnabled,
    rsvpRequirePhone: settings.rsvpRequirePhone,
    rsvpAllowGuestCount: settings.rsvpAllowGuestCount,
    rsvpMaxGuests: settings.rsvpMaxGuests,
    rsvpClosingDate: settings.rsvpClosingDate,
    rsvpTitle: settings.rsvpTitle,
    rsvpDescription: settings.rsvpDescription,
    rsvpSuccessMessage: settings.rsvpSuccessMessage,
    rsvpDeclineMessage: settings.rsvpDeclineMessage,
    countdownEventId: settings.countdownEventId,
    activeMusicTrackId: settings.activeMusicTrackId,
    musicEnabled: settings.musicEnabled,
    defaultVolume: settings.defaultVolume,
    vivahTitle: settings.vivahTitle,
    vivahMuhurat: settings.vivahMuhurat,
    vivahDate: settings.vivahDate,
    vivahTime: settings.vivahTime,
    vivahDescription: settings.vivahDescription,
    vivahImageUrl: settings.vivahImageUrl,
    shareMessage: settings.shareMessage
  };
}

export function parsePage(query: unknown) {
  const value = Number(query);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}
