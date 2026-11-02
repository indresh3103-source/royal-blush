import { z } from "zod";
import { IANAZone } from "luxon";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const hexPattern = /^#[0-9a-fA-F]{6}$/;

export const dateString = z.string().regex(datePattern, "Use YYYY-MM-DD");
export const timeString = z.string().regex(timePattern, "Use HH:MM in 24-hour time");
export const timezoneString = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .refine((value) => IANAZone.isValidZone(value), "Choose a valid IANA timezone");

export const nullableText = (max = 5000) =>
  z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.string().trim().max(max).nullable().optional()
  );

export const requiredText = (max = 500) => z.string().trim().min(1).max(max);

export const urlOrNull = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.string().trim().url("Enter a valid URL").max(2000).nullable().optional()
);

export const emailOrNull = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.string().trim().email("Enter a valid email").max(320).nullable().optional()
);

export const phoneOrNull = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.string().trim().min(5).max(30).nullable().optional()
);

export const hexColor = z.string().regex(hexPattern, "Use a six-digit hex color");

export const weddingUpdateSchema = z.object({
  title: requiredText(160).optional(),
  tagline: nullableText(240).optional(),
  invitationMessage: nullableText(2000).optional(),
  brideName: requiredText(120).optional(),
  groomName: requiredText(120).optional(),
  brideShortName: nullableText(80).optional(),
  groomShortName: nullableText(80).optional(),
  coupleInitials: nullableText(12).optional(),
  brideIntro: nullableText(3000).optional(),
  groomIntro: nullableText(3000).optional(),
  familyIntro: nullableText(3000).optional(),
  weddingDate: dateString.optional(),
  weddingTime: timeString.optional(),
  weddingEndTime: timeString.nullable().optional(),
  timezone: timezoneString.optional(),
  city: nullableText(120).optional(),
  state: nullableText(120).optional(),
  pinCode: nullableText(20).optional(),
  venueName: nullableText(180).optional(),
  venueAddress: nullableText(500).optional(),
  venueLandmark: nullableText(300).optional(),
  venueParking: nullableText(1000).optional(),
  venueMapsUrl: urlOrNull.optional(),
  venueDescription: nullableText(2000).optional(),
  venuePhotoUrl: nullableText(2000).optional(),
  venueContactName: nullableText(120).optional(),
  venueContactPhone: phoneOrNull.optional(),
  familyContactName: nullableText(120).optional(),
  familyContactPhone: phoneOrNull.optional(),
  familyContactEmail: emailOrNull.optional(),
  heroImageUrl: nullableText(2000).optional(),
  bridePortraitUrl: nullableText(2000).optional(),
  groomPortraitUrl: nullableText(2000).optional(),
  familyPhotoUrl: nullableText(2000).optional(),
  brideFamilyPhotoUrl: nullableText(2000).optional(),
  groomFamilyPhotoUrl: nullableText(2000).optional()
});

export const familySide = z.enum(["BRIDE", "GROOM", "BOTH"]);
export const familyRelation = z.enum(["GRANDPARENT", "PARENT", "BROTHER", "SISTER", "UNCLE", "AUNT", "OTHER"]);

export const familyCreateSchema = z.object({
  side: familySide.default("BOTH"),
  relation: familyRelation,
  role: requiredText(80),
  fullName: requiredText(160),
  bio: nullableText(1000).optional(),
  photoUrl: nullableText(2000).optional(),
  visible: z.boolean().default(true),
  order: z.number().int().min(0).max(9999).default(0)
});

export const familyUpdateSchema = familyCreateSchema.partial();

export const eventCreateSchema = z.object({
  name: requiredText(160),
  description: nullableText(3000).optional(),
  eventDate: dateString,
  startTime: timeString,
  endTime: timeString.nullable().optional(),
  timezone: timezoneString.nullable().optional(),
  venueName: nullableText(180).optional(),
  venueAddress: nullableText(500).optional(),
  city: nullableText(120).optional(),
  state: nullableText(120).optional(),
  pinCode: nullableText(20).optional(),
  mapsUrl: urlOrNull.optional(),
  dressCode: nullableText(300).optional(),
  imageUrl: nullableText(2000).optional(),
  contactName: nullableText(120).optional(),
  contactPhone: phoneOrNull.optional(),
  parkingInfo: nullableText(1000).optional(),
  visible: z.boolean().default(true),
  archived: z.boolean().default(false),
  order: z.number().int().min(0).max(9999).default(0)
});

export const eventUpdateSchema = eventCreateSchema.partial();

export const ritualCreateSchema = z.object({
  name: requiredText(160),
  description: nullableText(1500).optional(),
  ritualDate: dateString.nullable().optional(),
  ritualTime: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    timeString.nullable().optional()
  ),
  icon: nullableText(40).optional(),
  visible: z.boolean().default(true),
  order: z.number().int().min(0).max(9999).default(0)
});

export const ritualUpdateSchema = ritualCreateSchema.partial();

export const hotelCreateSchema = z.object({
  name: requiredText(160),
  description: nullableText(1000).optional(),
  distance: nullableText(120).optional(),
  phone: phoneOrNull.optional(),
  mapsUrl: urlOrNull.optional(),
  visible: z.boolean().default(true),
  order: z.number().int().min(0).max(9999).default(0)
});

export const hotelUpdateSchema = hotelCreateSchema.partial();

export const storyCreateSchema = z.object({
  title: requiredText(160),
  momentDate: dateString.nullable().optional(),
  description: nullableText(2000).optional(),
  imageUrl: nullableText(2000).optional(),
  visible: z.boolean().default(true),
  order: z.number().int().min(0).max(9999).default(0)
});

export const storyUpdateSchema = storyCreateSchema.partial();

export const themeUpdateSchema = z.object({
  preset: z.string().trim().max(60).optional(),
  primaryColor: hexColor.optional(),
  accentColor: hexColor.optional(),
  backgroundColor: hexColor.optional(),
  deepColor: hexColor.optional(),
  textColor: hexColor.optional(),
  headingFont: z.enum(["Cormorant Garamond", "Cinzel", "Marcellus", "Poppins"]).optional(),
  bodyFont: z.enum(["Poppins", "Cormorant Garamond", "Marcellus"]).optional(),
  curtainStyle: z.enum(["blush-velvet", "ivory-silk", "burgundy-velvet"]).optional(),
  ornamentStyle: z.enum(["classic", "floral", "minimal"]).optional(),
  animationIntensity: z.enum(["subtle", "balanced", "cinematic"]).optional(),
  showMandala: z.boolean().optional(),
  showFlorals: z.boolean().optional(),
  galleryLayout: z.enum(["editorial", "masonry", "grid"]).optional()
});

export const settingsUpdateSchema = z.object({
  introEnabled: z.boolean().optional(),
  rsvpEnabled: z.boolean().optional(),
  rsvpRequirePhone: z.boolean().optional(),
  rsvpAllowGuestCount: z.boolean().optional(),
  rsvpMaxGuests: z.number().int().min(1).max(50).optional(),
  rsvpClosingDate: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    dateString.nullable().optional()
  ),
  rsvpTitle: requiredText(160).optional(),
  rsvpDescription: nullableText(2000).optional(),
  rsvpSuccessMessage: requiredText(500).optional(),
  rsvpDeclineMessage: requiredText(500).optional(),
  rsvpNotifyEmail: emailOrNull.optional(),
  notifyOnRsvp: z.boolean().optional(),
  countdownEventId: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.string().cuid().nullable().optional()
  ),
  activeMusicTrackId: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.string().cuid().nullable().optional()
  ),
  musicEnabled: z.boolean().optional(),
  defaultVolume: z.number().int().min(0).max(100).optional(),
  vivahTitle: requiredText(160).optional(),
  vivahMuhurat: nullableText(240).optional(),
  vivahDate: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    dateString.nullable().optional()
  ),
  vivahTime: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    timeString.nullable().optional()
  ),
  vivahDescription: nullableText(2000).optional(),
  vivahImageUrl: nullableText(2000).optional(),
  shareMessage: nullableText(500).optional()
});

export const sectionBulkSchema = z.object({
  sections: z
    .array(
      z.object({
        id: z.string().min(1),
        visible: z.boolean(),
        order: z.number().int().min(0).max(9999)
      })
    )
    .min(1)
});

export const mediaUpdateSchema = z.object({
  originalName: z.string().trim().min(1).max(255).optional(),
  altText: nullableText(500).optional(),
  caption: nullableText(500).optional()
});

export const gallerySection = z.enum(["couple", "bride", "groom", "family", "engagement", "prewedding", "wedding", "other"]);

export const galleryCreateSchema = z.object({
  mediaId: z.string().min(1),
  section: gallerySection.default("couple"),
  caption: nullableText(500).optional(),
  altText: nullableText(500).optional(),
  visible: z.boolean().default(true),
  order: z.number().int().min(0).max(9999).default(0)
});

export const galleryUpdateSchema = galleryCreateSchema.partial();

export const musicCreateSchema = z.object({
  mediaId: z.string().min(1),
  title: requiredText(160),
  artist: nullableText(160).optional(),
  coverUrl: nullableText(2000).optional(),
  visible: z.boolean().default(true),
  order: z.number().int().min(0).max(9999).default(0)
});

export const musicUpdateSchema = musicCreateSchema.partial();

export const loginSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(200)
});

export const setupSchema = z.object({
  setupToken: z.string().min(1).max(200),
  name: requiredText(120),
  email: z.string().trim().email().max(320),
  password: z
    .string()
    .min(12, "Use at least 12 characters")
    .max(200)
    .regex(/[a-zA-Z]/, "Include at least one letter")
    .regex(/[0-9]/, "Include at least one number")
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z
    .string()
    .min(12, "Use at least 12 characters")
    .max(200)
    .regex(/[a-zA-Z]/, "Include at least one letter")
    .regex(/[0-9]/, "Include at least one number")
});

export const rsvpSubmitSchema = z.object({
  guestName: z.string().trim().min(2).max(120),
  phone: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.string().trim().min(5).max(30).nullable().optional()
  ),
  attendance: z.enum(["ATTENDING", "DECLINED"]),
  guestCount: z.number().int().min(1).max(50).default(1),
  events: z.array(z.string().min(1)).max(30).default([]),
  message: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.string().trim().max(1000).nullable().optional()
  ),
  idempotencyKey: z.string().trim().min(8).max(120),
  website: z.string().max(200).optional()
});

export const rsvpQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  status: z.enum(["ATTENDING", "DECLINED"]).optional(),
  eventId: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  sort: z.enum(["newest", "oldest", "name"]).default("newest")
});
