export type AttendanceStatus = "ATTENDING" | "DECLINED";
export type FamilySide = "BRIDE" | "GROOM" | "BOTH";
export type FamilyRelation = "GRANDPARENT" | "PARENT" | "BROTHER" | "SISTER" | "UNCLE" | "AUNT" | "OTHER";
export type MediaType = "IMAGE" | "AUDIO";

export interface ThemeSettings {
  id: string;
  preset: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  deepColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  curtainStyle: string;
  ornamentStyle: string;
  animationIntensity: string;
  showMandala: boolean;
  showFlorals: boolean;
  galleryLayout: string;
}

export interface InvitationSettingsPublic {
  introEnabled: boolean;
  rsvpEnabled: boolean;
  rsvpRequirePhone: boolean;
  rsvpAllowGuestCount: boolean;
  rsvpMaxGuests: number;
  rsvpClosingDate: string | null;
  rsvpTitle: string;
  rsvpDescription: string | null;
  rsvpSuccessMessage: string;
  rsvpDeclineMessage: string;
  countdownEventId: string | null;
  activeMusicTrackId: string | null;
  musicEnabled: boolean;
  defaultVolume: number;
  vivahTitle: string;
  vivahMuhurat: string | null;
  vivahDate: string | null;
  vivahTime: string | null;
  vivahDescription: string | null;
  vivahImageUrl: string | null;
  shareMessage: string | null;
}

export interface AdminInvitationSettings extends InvitationSettingsPublic {
  id: string;
  rsvpNotifyEmail: string | null;
  notifyOnRsvp: boolean;
}

export interface Wedding {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  invitationMessage: string | null;
  brideName: string;
  groomName: string;
  brideShortName: string | null;
  groomShortName: string | null;
  coupleInitials: string | null;
  brideIntro: string | null;
  groomIntro: string | null;
  familyIntro: string | null;
  weddingDate: string;
  weddingTime: string;
  weddingEndTime: string | null;
  timezone: string;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  venueName: string | null;
  venueAddress: string | null;
  venueLandmark: string | null;
  venueParking: string | null;
  venueMapsUrl: string | null;
  venueDescription: string | null;
  venuePhotoUrl: string | null;
  venueContactName: string | null;
  venueContactPhone: string | null;
  familyContactName: string | null;
  familyContactPhone: string | null;
  familyContactEmail: string | null;
  heroImageUrl: string | null;
  bridePortraitUrl: string | null;
  groomPortraitUrl: string | null;
  familyPhotoUrl: string | null;
  brideFamilyPhotoUrl: string | null;
  groomFamilyPhotoUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
}

export interface FamilyMember {
  id: string;
  side: FamilySide;
  relation: FamilyRelation;
  role: string;
  fullName: string;
  bio: string | null;
  photoUrl: string | null;
  order: number;
  visible?: boolean;
}

export interface WeddingEvent {
  id: string;
  name: string;
  description: string | null;
  eventDate: string;
  startTime: string;
  endTime: string | null;
  timezone: string;
  venueName: string | null;
  venueAddress: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  mapsUrl: string | null;
  dressCode: string | null;
  imageUrl: string | null;
  contactName: string | null;
  contactPhone: string | null;
  parkingInfo: string | null;
  order: number;
  startsAt: string | null;
  endsAt: string | null;
}

export interface Ritual {
  id: string;
  name: string;
  description: string | null;
  ritualDate: string | null;
  ritualTime: string | null;
  icon: string | null;
  order: number;
  visible?: boolean;
}

export interface StoryMoment {
  id: string;
  title: string;
  momentDate: string | null;
  description: string | null;
  imageUrl: string | null;
  order: number;
  visible?: boolean;
}

export interface GalleryImage {
  id: string;
  section: string;
  caption: string | null;
  altText: string | null;
  url: string;
  width: number | null;
  height: number | null;
  order: number;
  visible?: boolean;
}

export interface Hotel {
  id: string;
  name: string;
  description: string | null;
  distance: string | null;
  phone: string | null;
  mapsUrl: string | null;
  order: number;
  visible?: boolean;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string | null;
  url: string;
  coverUrl: string | null;
  order: number;
  visible?: boolean;
}

export interface InvitationSection {
  id: string;
  key: string;
  label: string;
  visible: boolean;
  order: number;
}

export interface SiteData {
  serverTime: string;
  wedding: Wedding;
  theme: ThemeSettings;
  settings: InvitationSettingsPublic;
  sections: InvitationSection[];
  family: FamilyMember[];
  events: WeddingEvent[];
  rituals: Ritual[];
  story: StoryMoment[];
  gallery: GalleryImage[];
  hotels: Hotel[];
  music: MusicTrack[];
  countdown: {
    label: string;
    date: string;
    time: string;
    timezone: string;
    targetIso: string | null;
  };
  rsvpOpen: boolean;
  publicSiteUrl: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface MediaAsset {
  id: string;
  storageKey: string;
  url: string;
  originalName: string;
  mimeType: string;
  type: MediaType;
  size: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  caption: string | null;
  createdAt: string;
}

export interface GalleryAdminImage {
  id: string;
  mediaId: string;
  section: string;
  caption: string | null;
  altText: string | null;
  visible: boolean;
  order: number;
  media: MediaAsset;
}

export interface MusicTrackAdmin extends MusicTrack {
  mediaId: string;
  media: MediaAsset;
  visible: boolean;
}

export interface AdminWedding extends Wedding {
  theme: ThemeSettings;
  settings: AdminInvitationSettings;
  familyMembers: FamilyMember[];
  sections: InvitationSection[];
  hotels: Hotel[];
}

export interface DashboardData {
  wedding: {
    id: string;
    title: string;
    brideName: string;
    groomName: string;
    weddingDate: string;
    weddingTime: string;
    timezone: string;
    venueName: string | null;
    city: string | null;
  };
  stats: {
    totalResponses: number;
    attendingResponses: number;
    declinedResponses: number;
    expectedGuests: number;
    eventCount: number;
    mediaCount: number;
    galleryCount: number;
    musicCount: number;
  };
  nextEvent: {
    id: string;
    name: string;
    eventDate: string;
    startTime: string;
    venueName: string | null;
  } | null;
  latestResponses: Array<{
    id: string;
    guestName: string;
    attendance: AttendanceStatus;
    guestCount: number;
    createdAt: string;
    events: string[];
  }>;
  storageMode: string;
  rsvpOpen: boolean;
}

export interface RsvpListItem {
  id: string;
  guestName: string;
  phone: string | null;
  attendance: AttendanceStatus;
  guestCount: number;
  message: string | null;
  notified: boolean;
  createdAt: string;
  events: Array<{ id: string; name: string }>;
}

export interface RsvpListResponse {
  total: number;
  page: number;
  pageSize: number;
  pages: number;
  responses: RsvpListItem[];
}

export interface RsvpStats {
  total: number;
  attending: number;
  declined: number;
  expectedGuests: number;
  attendanceRate: number;
  eventAttendance: Array<{
    eventId: string;
    name: string;
    eventDate: string;
    responses: number;
    guests: number;
  }>;
  daily: Array<{ date: string; count: number }>;
}

export interface AdminEvent extends WeddingEvent {
  archived: boolean;
  visible: boolean;
}

export interface AdminStoryMoment extends StoryMoment {
  visible: boolean;
}

export interface AdminRitual extends Ritual {
  visible: boolean;
}

export interface AdminAuthStatus {
  setupRequired: boolean;
  authenticated: boolean;
  admin: AdminUser | null;
}

export interface RsvpDetail {
  id: string;
  guestName: string;
  phone: string | null;
  attendance: AttendanceStatus;
  guestCount: number;
  message: string | null;
  notified: boolean;
  createdAt: string;
  events: Array<{ id: string; name: string; eventDate: string }>;
}
