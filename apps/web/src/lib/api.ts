import type {
  AdminAuthStatus,
  AdminEvent,
  AdminInvitationSettings,
  AdminRitual,
  AdminStoryMoment,
  AdminUser,
  AdminWedding,
  DashboardData,
  FamilyMember,
  GalleryAdminImage,
  GalleryImage,
  Hotel,
  MediaAsset,
  MusicTrackAdmin,
  RsvpDetail,
  RsvpListResponse,
  RsvpStats,
  SiteData,
  ThemeSettings,
  WeddingEvent
} from "../types";

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, message: string, code = "REQUEST_FAILED", details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type Json = Record<string, unknown>;

async function parseError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string; code?: string; details?: unknown };
    return new ApiError(response.status, body.error ?? "The request could not be completed.", body.code, body.details);
  } catch {
    return new ApiError(response.status, response.statusText || "The request could not be completed.");
  }
}

async function request<T>(path: string, options: RequestInit = {}, admin = false): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (admin) {
    headers.set("X-Requested-With", "RoyalBlushAdmin");
  }
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: "include",
    headers
  });
  if (!response.ok) {
    throw await parseError(response);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

function queryString(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const result = search.toString();
  return result ? `?${result}` : "";
}

async function download(path: string) {
  const response = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "X-Requested-With": "RoyalBlushAdmin" }
  });
  if (!response.ok) {
    throw await parseError(response);
  }
  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const filename = match?.[1] ?? "royal-blush-export";
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export interface RsvpSubmitInput {
  guestName: string;
  phone?: string;
  attendance: "ATTENDING" | "DECLINED";
  guestCount: number;
  events: string[];
  message?: string;
  idempotencyKey: string;
  website?: string;
}

export interface RsvpResult {
  ok: boolean;
  duplicate?: boolean;
  attendance: "ATTENDING" | "DECLINED";
  notificationSent: boolean;
  message: string;
}

export interface RsvpQuery {
  search?: string;
  status?: "ATTENDING" | "DECLINED" | "";
  eventId?: string;
  page?: number;
  pageSize?: number;
  sort?: "newest" | "oldest" | "name";
}

export const api = {
  public: {
    site: () => request<SiteData>("/public/site"),
    submitRsvp: (body: RsvpSubmitInput) =>
      request<RsvpResult>("/public/rsvp", { method: "POST", body: JSON.stringify(body) })
  },
  auth: {
    status: () => request<AdminAuthStatus>("/admin/auth/status"),
    setup: (body: { setupToken: string; name: string; email: string; password: string }) =>
      request<{ admin: AdminUser }>("/admin/auth/setup", { method: "POST", body: JSON.stringify(body) }, true),
    login: (body: { email: string; password: string }) =>
      request<{ admin: AdminUser }>("/admin/auth/login", { method: "POST", body: JSON.stringify(body) }, true),
    logout: () => request<{ ok: boolean }>("/admin/auth/logout", { method: "POST" }, true),
    me: () => request<{ admin: AdminUser }>("/admin/auth/me", {}, true),
    changePassword: (body: { currentPassword: string; newPassword: string }) =>
      request<{ ok: boolean }>("/admin/auth/change-password", { method: "POST", body: JSON.stringify(body) }, true)
  },
  admin: {
    dashboard: () => request<DashboardData>("/admin/dashboard", {}, true),
    wedding: () => request<AdminWedding>("/admin/wedding", {}, true),
    updateWedding: (body: Json) =>
      request<AdminWedding>("/admin/wedding", { method: "PATCH", body: JSON.stringify(body) }, true),
    family: () => request<FamilyMember[]>("/admin/family", {}, true),
    createFamily: (body: Json) =>
      request<FamilyMember>("/admin/family", { method: "POST", body: JSON.stringify(body) }, true),
    updateFamily: (id: string, body: Json) =>
      request<FamilyMember>(`/admin/family/${id}`, { method: "PATCH", body: JSON.stringify(body) }, true),
    deleteFamily: (id: string) => request<{ ok: boolean }>(`/admin/family/${id}`, { method: "DELETE" }, true),
    events: () => request<AdminEvent[]>("/admin/events", {}, true),
    createEvent: (body: Json) =>
      request<AdminEvent>("/admin/events", { method: "POST", body: JSON.stringify(body) }, true),
    updateEvent: (id: string, body: Json) =>
      request<AdminEvent>(`/admin/events/${id}`, { method: "PATCH", body: JSON.stringify(body) }, true),
    deleteEvent: (id: string) => request<{ ok: boolean }>(`/admin/events/${id}`, { method: "DELETE" }, true),
    rituals: () => request<AdminRitual[]>("/admin/rituals", {}, true),
    createRitual: (body: Json) =>
      request<AdminRitual>("/admin/rituals", { method: "POST", body: JSON.stringify(body) }, true),
    updateRitual: (id: string, body: Json) =>
      request<AdminRitual>(`/admin/rituals/${id}`, { method: "PATCH", body: JSON.stringify(body) }, true),
    deleteRitual: (id: string) => request<{ ok: boolean }>(`/admin/rituals/${id}`, { method: "DELETE" }, true),
    hotels: () => request<Hotel[]>("/admin/hotels", {}, true),
    createHotel: (body: Json) =>
      request<Hotel>("/admin/hotels", { method: "POST", body: JSON.stringify(body) }, true),
    updateHotel: (id: string, body: Json) =>
      request<Hotel>(`/admin/hotels/${id}`, { method: "PATCH", body: JSON.stringify(body) }, true),
    deleteHotel: (id: string) => request<{ ok: boolean }>(`/admin/hotels/${id}`, { method: "DELETE" }, true),
    story: () => request<AdminStoryMoment[]>("/admin/story", {}, true),
    createStory: (body: Json) =>
      request<AdminStoryMoment>("/admin/story", { method: "POST", body: JSON.stringify(body) }, true),
    updateStory: (id: string, body: Json) =>
      request<AdminStoryMoment>(`/admin/story/${id}`, { method: "PATCH", body: JSON.stringify(body) }, true),
    deleteStory: (id: string) => request<{ ok: boolean }>(`/admin/story/${id}`, { method: "DELETE" }, true),
    sections: () => request<AdminWedding>("/admin/wedding", {}, true).then((wedding) => wedding.sections),
    updateSections: (sections: Array<{ id: string; visible: boolean; order: number }>) =>
      request<SiteData["sections"]>("/admin/sections", { method: "PATCH", body: JSON.stringify({ sections }) }, true),
    updateTheme: (body: Json) =>
      request<ThemeSettings>("/admin/theme", { method: "PATCH", body: JSON.stringify(body) }, true),
    updateSettings: (body: Json) =>
      request<AdminInvitationSettings>("/admin/settings", { method: "PATCH", body: JSON.stringify(body) }, true),
    media: (params: { type?: string; search?: string } = {}) =>
      request<{ media: MediaAsset[]; storageMode: string }>(`/admin/media${queryString(params)}`, {}, true),
    uploadImages: (files: File[]) => {
      const form = new FormData();
      files.forEach((file) => form.append("files", file));
      return request<MediaAsset[]>("/admin/media/images", { method: "POST", body: form }, true);
    },
    uploadAudio: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return request<MediaAsset>("/admin/media/audio", { method: "POST", body: form }, true);
    },
    updateMedia: (id: string, body: Json) =>
      request<MediaAsset>(`/admin/media/${id}`, { method: "PATCH", body: JSON.stringify(body) }, true),
    deleteMedia: (id: string) => request<{ ok: boolean }>(`/admin/media/${id}`, { method: "DELETE" }, true),
    gallery: () => request<GalleryAdminImage[]>("/admin/gallery", {}, true),
    createGallery: (body: Json) =>
      request<GalleryAdminImage>("/admin/gallery", { method: "POST", body: JSON.stringify(body) }, true),
    updateGallery: (id: string, body: Json) =>
      request<GalleryAdminImage>(`/admin/gallery/${id}`, { method: "PATCH", body: JSON.stringify(body) }, true),
    deleteGallery: (id: string) => request<{ ok: boolean }>(`/admin/gallery/${id}`, { method: "DELETE" }, true),
    music: () => request<MusicTrackAdmin[]>("/admin/music", {}, true),
    createMusic: (body: Json) =>
      request<MusicTrackAdmin>("/admin/music", { method: "POST", body: JSON.stringify(body) }, true),
    updateMusic: (id: string, body: Json) =>
      request<MusicTrackAdmin>(`/admin/music/${id}`, { method: "PATCH", body: JSON.stringify(body) }, true),
    deleteMusic: (id: string) => request<{ ok: boolean }>(`/admin/music/${id}`, { method: "DELETE" }, true),
    rsvps: (params: RsvpQuery = {}) =>
      request<RsvpListResponse>(`/admin/rsvps${queryString(params as Record<string, string | number | undefined | null>)}`, {}, true),
    rsvpStats: () => request<RsvpStats>("/admin/rsvps/stats", {}, true),
    rsvpDetail: (id: string) => request<RsvpDetail>(`/admin/rsvps/${id}`, {}, true),
    deleteRsvp: (id: string) => request<{ ok: boolean }>(`/admin/rsvps/${id}`, { method: "DELETE" }, true),
    exportRsvps: (format: "csv" | "xlsx", params: RsvpQuery = {}) =>
      download(`/admin/rsvps/export.${format}${queryString(params as Record<string, string | number | undefined | null>)}`)
  }
};

export function eventIcsUrl(eventId: string) {
  return `/api/public/calendar/event/${eventId}.ics`;
}

export function weddingIcsUrl() {
  return "/api/public/calendar/wedding.ics";
}

export function downloadIcs(url: string, filename?: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  if (filename) {
    anchor.download = filename;
  }
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
