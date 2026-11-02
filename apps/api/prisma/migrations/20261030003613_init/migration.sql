-- CreateEnum
CREATE TYPE "MemberSide" AS ENUM ('BRIDE', 'GROOM', 'BOTH');

-- CreateEnum
CREATE TYPE "FamilyRelation" AS ENUM ('GRANDPARENT', 'PARENT', 'BROTHER', 'SISTER', 'UNCLE', 'AUNT', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'AUDIO');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('ATTENDING', 'DECLINED');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OWNER',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wedding" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL DEFAULT 'royal-blush',
    "title" TEXT NOT NULL,
    "tagline" TEXT,
    "invitationMessage" TEXT,
    "brideName" TEXT NOT NULL,
    "groomName" TEXT NOT NULL,
    "brideShortName" TEXT,
    "groomShortName" TEXT,
    "coupleInitials" TEXT,
    "brideIntro" TEXT,
    "groomIntro" TEXT,
    "familyIntro" TEXT,
    "weddingDate" TEXT NOT NULL,
    "weddingTime" TEXT NOT NULL,
    "weddingEndTime" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "city" TEXT,
    "state" TEXT,
    "pinCode" TEXT,
    "venueName" TEXT,
    "venueAddress" TEXT,
    "venueLandmark" TEXT,
    "venueParking" TEXT,
    "venueMapsUrl" TEXT,
    "venueDescription" TEXT,
    "venuePhotoUrl" TEXT,
    "venueContactName" TEXT,
    "venueContactPhone" TEXT,
    "familyContactName" TEXT,
    "familyContactPhone" TEXT,
    "familyContactEmail" TEXT,
    "heroImageUrl" TEXT,
    "bridePortraitUrl" TEXT,
    "groomPortraitUrl" TEXT,
    "familyPhotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "side" "MemberSide" NOT NULL DEFAULT 'BOTH',
    "relation" "FamilyRelation" NOT NULL,
    "role" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "bio" TEXT,
    "photoUrl" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingEvent" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "eventDate" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "timezone" TEXT,
    "venueName" TEXT,
    "venueAddress" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pinCode" TEXT,
    "mapsUrl" TEXT,
    "dressCode" TEXT,
    "imageUrl" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "parkingInfo" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeddingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingRitual" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ritualDate" TEXT,
    "ritualTime" TEXT,
    "icon" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeddingRitual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "altText" TEXT,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "section" TEXT NOT NULL DEFAULT 'couple',
    "caption" TEXT,
    "altText" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusicTrack" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "coverUrl" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MusicTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitationSection" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvitationSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThemeSettings" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "preset" TEXT NOT NULL DEFAULT 'royal-blush',
    "primaryColor" TEXT NOT NULL DEFAULT '#B89555',
    "accentColor" TEXT NOT NULL DEFAULT '#E9BFC7',
    "backgroundColor" TEXT NOT NULL DEFAULT '#F5EBDD',
    "deepColor" TEXT NOT NULL DEFAULT '#762F43',
    "textColor" TEXT NOT NULL DEFAULT '#49372F',
    "headingFont" TEXT NOT NULL DEFAULT 'Cormorant Garamond',
    "bodyFont" TEXT NOT NULL DEFAULT 'Poppins',
    "curtainStyle" TEXT NOT NULL DEFAULT 'blush-velvet',
    "ornamentStyle" TEXT NOT NULL DEFAULT 'classic',
    "animationIntensity" TEXT NOT NULL DEFAULT 'balanced',
    "showMandala" BOOLEAN NOT NULL DEFAULT true,
    "showFlorals" BOOLEAN NOT NULL DEFAULT true,
    "galleryLayout" TEXT NOT NULL DEFAULT 'editorial',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemeSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitationSettings" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "introEnabled" BOOLEAN NOT NULL DEFAULT true,
    "rsvpEnabled" BOOLEAN NOT NULL DEFAULT true,
    "rsvpRequirePhone" BOOLEAN NOT NULL DEFAULT false,
    "rsvpAllowGuestCount" BOOLEAN NOT NULL DEFAULT true,
    "rsvpMaxGuests" INTEGER NOT NULL DEFAULT 10,
    "rsvpClosingDate" TEXT,
    "rsvpTitle" TEXT NOT NULL DEFAULT 'Will You Join Us?',
    "rsvpDescription" TEXT,
    "rsvpSuccessMessage" TEXT NOT NULL DEFAULT 'Thank you for responding. Your presence and blessings mean a lot to us!',
    "rsvpDeclineMessage" TEXT NOT NULL DEFAULT 'We will miss you dearly. Thank you for letting us know, and for your blessings.',
    "rsvpNotifyEmail" TEXT,
    "notifyOnRsvp" BOOLEAN NOT NULL DEFAULT false,
    "countdownEventId" TEXT,
    "activeMusicTrackId" TEXT,
    "musicEnabled" BOOLEAN NOT NULL DEFAULT true,
    "defaultVolume" INTEGER NOT NULL DEFAULT 42,
    "vivahTitle" TEXT NOT NULL DEFAULT 'Vivah Sanskar',
    "vivahMuhurat" TEXT,
    "vivahDate" TEXT,
    "vivahTime" TEXT,
    "vivahDescription" TEXT,
    "vivahImageUrl" TEXT,
    "shareMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvitationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NearbyHotel" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "distance" TEXT,
    "phone" TEXT,
    "mapsUrl" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NearbyHotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RSVP" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "phone" TEXT,
    "attendance" "AttendanceStatus" NOT NULL,
    "guestCount" INTEGER NOT NULL DEFAULT 1,
    "message" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RSVP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RSVPEventAttendance" (
    "id" TEXT NOT NULL,
    "rsvpId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RSVPEventAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_adminUserId_idx" ON "Session"("adminUserId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Wedding_slug_key" ON "Wedding"("slug");

-- CreateIndex
CREATE INDEX "FamilyMember_weddingId_side_relation_idx" ON "FamilyMember"("weddingId", "side", "relation");

-- CreateIndex
CREATE INDEX "FamilyMember_weddingId_order_idx" ON "FamilyMember"("weddingId", "order");

-- CreateIndex
CREATE INDEX "WeddingEvent_weddingId_archived_eventDate_startTime_idx" ON "WeddingEvent"("weddingId", "archived", "eventDate", "startTime");

-- CreateIndex
CREATE INDEX "WeddingEvent_weddingId_order_idx" ON "WeddingEvent"("weddingId", "order");

-- CreateIndex
CREATE INDEX "WeddingRitual_weddingId_order_idx" ON "WeddingRitual"("weddingId", "order");

-- CreateIndex
CREATE INDEX "MediaAsset_weddingId_type_idx" ON "MediaAsset"("weddingId", "type");

-- CreateIndex
CREATE INDEX "MediaAsset_weddingId_createdAt_idx" ON "MediaAsset"("weddingId", "createdAt");

-- CreateIndex
CREATE INDEX "GalleryImage_weddingId_section_order_idx" ON "GalleryImage"("weddingId", "section", "order");

-- CreateIndex
CREATE INDEX "MusicTrack_weddingId_order_idx" ON "MusicTrack"("weddingId", "order");

-- CreateIndex
CREATE INDEX "InvitationSection_weddingId_order_idx" ON "InvitationSection"("weddingId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationSection_weddingId_key_key" ON "InvitationSection"("weddingId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "ThemeSettings_weddingId_key" ON "ThemeSettings"("weddingId");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationSettings_weddingId_key" ON "InvitationSettings"("weddingId");

-- CreateIndex
CREATE INDEX "InvitationSettings_countdownEventId_idx" ON "InvitationSettings"("countdownEventId");

-- CreateIndex
CREATE INDEX "InvitationSettings_activeMusicTrackId_idx" ON "InvitationSettings"("activeMusicTrackId");

-- CreateIndex
CREATE INDEX "NearbyHotel_weddingId_order_idx" ON "NearbyHotel"("weddingId", "order");

-- CreateIndex
CREATE INDEX "RSVP_weddingId_createdAt_idx" ON "RSVP"("weddingId", "createdAt");

-- CreateIndex
CREATE INDEX "RSVP_weddingId_attendance_idx" ON "RSVP"("weddingId", "attendance");

-- CreateIndex
CREATE INDEX "RSVP_weddingId_guestName_idx" ON "RSVP"("weddingId", "guestName");

-- CreateIndex
CREATE UNIQUE INDEX "RSVP_weddingId_idempotencyKey_key" ON "RSVP"("weddingId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "RSVPEventAttendance_eventId_idx" ON "RSVPEventAttendance"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "RSVPEventAttendance_rsvpId_eventId_key" ON "RSVPEventAttendance"("rsvpId", "eventId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingEvent" ADD CONSTRAINT "WeddingEvent_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingRitual" ADD CONSTRAINT "WeddingRitual_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicTrack" ADD CONSTRAINT "MusicTrack_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicTrack" ADD CONSTRAINT "MusicTrack_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationSection" ADD CONSTRAINT "InvitationSection_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThemeSettings" ADD CONSTRAINT "ThemeSettings_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationSettings" ADD CONSTRAINT "InvitationSettings_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationSettings" ADD CONSTRAINT "InvitationSettings_countdownEventId_fkey" FOREIGN KEY ("countdownEventId") REFERENCES "WeddingEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationSettings" ADD CONSTRAINT "InvitationSettings_activeMusicTrackId_fkey" FOREIGN KEY ("activeMusicTrackId") REFERENCES "MusicTrack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearbyHotel" ADD CONSTRAINT "NearbyHotel_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RSVPEventAttendance" ADD CONSTRAINT "RSVPEventAttendance_rsvpId_fkey" FOREIGN KEY ("rsvpId") REFERENCES "RSVP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RSVPEventAttendance" ADD CONSTRAINT "RSVPEventAttendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "WeddingEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
