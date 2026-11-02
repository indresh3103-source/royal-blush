import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { DateTime } from "luxon";
import { prisma } from "../db.js";
import { asyncHandler, hashIp, setNoStore } from "../security.js";
import { requireWedding, buildEndInstant, buildInstant, eventInstants, isRsvpOpen, publicSettings, ApiError } from "../helpers.js";
import { rsvpSubmitSchema } from "../validation.js";
import { buildIcs } from "../ics.js";
import { sendRsvpNotification } from "../mail.js";
import { env } from "../env.js";

const router = Router();

const rsvpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many responses from this connection. Please try again later.", code: "RATE_LIMITED" }
});

router.get(
  "/site",
  asyncHandler(async (_req, res) => {
    setNoStore(res);
    const wedding = await prisma.wedding.findFirst({
      orderBy: { createdAt: "asc" },
      include: {
        settings: true,
        theme: true,
        familyMembers: { where: { visible: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
        events: {
          where: { visible: true, archived: false },
          orderBy: [{ eventDate: "asc" }, { startTime: "asc" }]
        },
        rituals: { where: { visible: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
        storyMoments: { where: { visible: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
        galleryImages: {
          where: { visible: true },
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          include: { media: true }
        },
        sections: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
        hotels: { where: { visible: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
        musicTracks: {
          where: { visible: true },
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          include: { media: true }
        }
      }
    });

    if (!wedding) {
      res.status(404).json({ error: "The invitation has not been configured yet.", code: "SETUP_REQUIRED" });
      return;
    }

    const events = wedding.events.map((event) => {
      const instants = eventInstants(event, wedding.timezone);
      return {
        id: event.id,
        name: event.name,
        description: event.description,
        eventDate: event.eventDate,
        startTime: event.startTime,
        endTime: event.endTime,
        timezone: event.timezone || wedding.timezone,
        venueName: event.venueName,
        venueAddress: event.venueAddress,
        city: event.city,
        state: event.state,
        pinCode: event.pinCode,
        mapsUrl: event.mapsUrl,
        dressCode: event.dressCode,
        imageUrl: event.imageUrl,
        contactName: event.contactName,
        contactPhone: event.contactPhone,
        parkingInfo: event.parkingInfo,
        order: event.order,
        startsAt: instants?.start ?? null,
        endsAt: instants?.end ?? null
      };
    });

    const countdownEvent = wedding.settings?.countdownEventId
      ? events.find((event) => event.id === wedding.settings?.countdownEventId)
      : undefined;
    const countdownTarget = countdownEvent
      ? {
          label: countdownEvent.name,
          date: countdownEvent.eventDate,
          time: countdownEvent.startTime,
          timezone: countdownEvent.timezone,
          targetIso: countdownEvent.startsAt
        }
      : {
          label: wedding.title,
          date: wedding.weddingDate,
          time: wedding.weddingTime,
          timezone: wedding.timezone,
          targetIso: buildInstant(wedding.weddingDate, wedding.weddingTime, wedding.timezone)
        };

    const weddingInstants = buildEndInstant(wedding.weddingDate, wedding.weddingTime, wedding.weddingEndTime, wedding.timezone);
    const settings = publicSettings(wedding.settings);

    res.json({
      serverTime: DateTime.utc().toISO(),
      wedding: {
        id: wedding.id,
        slug: wedding.slug,
        title: wedding.title,
        tagline: wedding.tagline,
        invitationMessage: wedding.invitationMessage,
        brideName: wedding.brideName,
        groomName: wedding.groomName,
        brideShortName: wedding.brideShortName,
        groomShortName: wedding.groomShortName,
        coupleInitials: wedding.coupleInitials,
        brideIntro: wedding.brideIntro,
        groomIntro: wedding.groomIntro,
        familyIntro: wedding.familyIntro,
        weddingDate: wedding.weddingDate,
        weddingTime: wedding.weddingTime,
        weddingEndTime: wedding.weddingEndTime,
        timezone: wedding.timezone,
        city: wedding.city,
        state: wedding.state,
        pinCode: wedding.pinCode,
        venueName: wedding.venueName,
        venueAddress: wedding.venueAddress,
        venueLandmark: wedding.venueLandmark,
        venueParking: wedding.venueParking,
        venueMapsUrl: wedding.venueMapsUrl,
        venueDescription: wedding.venueDescription,
        venuePhotoUrl: wedding.venuePhotoUrl,
        venueContactName: wedding.venueContactName,
        venueContactPhone: wedding.venueContactPhone,
        familyContactName: wedding.familyContactName,
        familyContactPhone: wedding.familyContactPhone,
        familyContactEmail: wedding.familyContactEmail,
        heroImageUrl: wedding.heroImageUrl,
        bridePortraitUrl: wedding.bridePortraitUrl,
        groomPortraitUrl: wedding.groomPortraitUrl,
        familyPhotoUrl: wedding.familyPhotoUrl,
        brideFamilyPhotoUrl: wedding.brideFamilyPhotoUrl,
        groomFamilyPhotoUrl: wedding.groomFamilyPhotoUrl,
        startsAt: weddingInstants?.start ?? null,
        endsAt: weddingInstants?.end ?? null
      },
      theme: wedding.theme,
      settings,
      sections: wedding.sections.map((section) => ({
        id: section.id,
        key: section.key,
        label: section.label,
        visible: section.visible,
        order: section.order
      })),
      family: wedding.familyMembers.map((member) => ({
        id: member.id,
        side: member.side,
        relation: member.relation,
        role: member.role,
        fullName: member.fullName,
        bio: member.bio,
        photoUrl: member.photoUrl,
        order: member.order
      })),
      events,
      rituals: wedding.rituals.map((ritual) => ({
        id: ritual.id,
        name: ritual.name,
        description: ritual.description,
        ritualDate: ritual.ritualDate,
        ritualTime: ritual.ritualTime,
        icon: ritual.icon,
        order: ritual.order
      })),
      story: wedding.storyMoments.map((moment) => ({
        id: moment.id,
        title: moment.title,
        momentDate: moment.momentDate,
        description: moment.description,
        imageUrl: moment.imageUrl,
        order: moment.order
      })),
      gallery: wedding.galleryImages.map((image) => ({
        id: image.id,
        section: image.section,
        caption: image.caption ?? image.media.caption,
        altText: image.altText ?? image.media.altText,
        url: image.media.url,
        width: image.media.width,
        height: image.media.height,
        order: image.order
      })),
      hotels: wedding.hotels.map((hotel) => ({
        id: hotel.id,
        name: hotel.name,
        description: hotel.description,
        distance: hotel.distance,
        phone: hotel.phone,
        mapsUrl: hotel.mapsUrl,
        order: hotel.order
      })),
      music: wedding.musicTracks.map((track) => ({
        id: track.id,
        title: track.title,
        artist: track.artist,
        url: track.media.url,
        coverUrl: track.coverUrl,
        order: track.order
      })),
      countdown: countdownTarget,
      rsvpOpen: isRsvpOpen(wedding, wedding.settings),
      publicSiteUrl: env.PUBLIC_SITE_URL
    });
  })
);

router.get(
  "/calendar/wedding.ics",
  asyncHandler(async (_req, res) => {
    const wedding = await requireWedding();
    const instants = buildEndInstant(wedding.weddingDate, wedding.weddingTime, wedding.weddingEndTime, wedding.timezone);
    if (!instants) throw new ApiError(422, "The wedding schedule is incomplete.", "INVALID_SCHEDULE");
    const location = [wedding.venueName, wedding.venueAddress, wedding.city, wedding.state, wedding.pinCode]
      .filter(Boolean)
      .join(", ");
    const description = [
      wedding.invitationMessage,
      wedding.venueParking ? `Parking: ${wedding.venueParking}` : "",
      wedding.venueMapsUrl ? `Directions: ${wedding.venueMapsUrl}` : "",
      `Invitation: ${env.PUBLIC_SITE_URL}`
    ]
      .filter(Boolean)
      .join("\n\n");
    const ics = buildIcs({
      uid: `wedding-${wedding.id}@royal-blush`,
      title: wedding.title,
      description,
      location,
      startIso: instants.start!,
      endIso: instants.end!,
      timezone: wedding.timezone,
      url: env.PUBLIC_SITE_URL
    });
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="royal-blush-wedding.ics"');
    res.setHeader("Cache-Control", "no-store");
    res.send(ics);
  })
);

router.get(
  "/calendar/event/:id.ics",
  asyncHandler(async (req, res) => {
    const wedding = await requireWedding();
    const event = await prisma.weddingEvent.findFirst({
      where: { id: req.params.id, weddingId: wedding.id, visible: true, archived: false }
    });
    if (!event) throw new ApiError(404, "Event not found.", "EVENT_NOT_FOUND");
    const instants = eventInstants(event, wedding.timezone);
    if (!instants) throw new ApiError(422, "The event schedule is incomplete.", "INVALID_SCHEDULE");
    const location = [event.venueName, event.venueAddress, event.city, event.state, event.pinCode]
      .filter(Boolean)
      .join(", ");
    const description = [
      event.description,
      event.dressCode ? `Dress code: ${event.dressCode}` : "",
      event.parkingInfo ? `Parking: ${event.parkingInfo}` : "",
      event.contactName ? `Contact: ${event.contactName}${event.contactPhone ? ` (${event.contactPhone})` : ""}` : "",
      event.mapsUrl ? `Directions: ${event.mapsUrl}` : "",
      `Invitation: ${env.PUBLIC_SITE_URL}`
    ]
      .filter(Boolean)
      .join("\n\n");
    const ics = buildIcs({
      uid: `event-${event.id}@royal-blush`,
      title: `${event.name} — ${wedding.title}`,
      description,
      location,
      startIso: instants.start!,
      endIso: instants.end!,
      timezone: event.timezone || wedding.timezone,
      url: env.PUBLIC_SITE_URL
    });
    const filename = `${event.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "event"}.ics`;
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-store");
    res.send(ics);
  })
);

router.post(
  "/rsvp",
  rsvpLimiter,
  asyncHandler(async (req, res) => {
    setNoStore(res);
    const body = rsvpSubmitSchema.parse(req.body);
    if (body.website) {
      res.json({ ok: true, notificationSent: false, message: "Thank you for responding." });
      return;
    }

    const wedding = await prisma.wedding.findFirst({
      orderBy: { createdAt: "asc" },
      include: { settings: true }
    });
    if (!wedding) throw new ApiError(404, "The invitation has not been configured yet.", "SETUP_REQUIRED");
    if (!isRsvpOpen(wedding, wedding.settings)) {
      throw new ApiError(403, "RSVP is currently closed for this celebration.", "RSVP_CLOSED");
    }

    const settings = wedding.settings;
    if (settings?.rsvpRequirePhone && !body.phone) {
      throw new ApiError(422, "A mobile number is required.", "PHONE_REQUIRED");
    }

    const guestCount = settings?.rsvpAllowGuestCount
      ? Math.min(body.guestCount, settings.rsvpMaxGuests)
      : 1;
    if (settings?.rsvpAllowGuestCount && body.guestCount > settings.rsvpMaxGuests) {
      throw new ApiError(422, `Please select no more than ${settings.rsvpMaxGuests} guests.`, "GUEST_LIMIT_EXCEEDED");
    }

    const existing = await prisma.rSVP.findUnique({
      where: {
        weddingId_idempotencyKey: {
          weddingId: wedding.id,
          idempotencyKey: body.idempotencyKey
        }
      }
    });
    if (existing) {
      res.json({
        ok: true,
        duplicate: true,
        attendance: existing.attendance,
        notificationSent: existing.notified,
        message:
          existing.attendance === "ATTENDING"
            ? settings?.rsvpSuccessMessage
            : settings?.rsvpDeclineMessage
      });
      return;
    }

    const eventIds = body.attendance === "ATTENDING" ? Array.from(new Set(body.events)) : [];
    const validEvents = eventIds.length
      ? await prisma.weddingEvent.findMany({
          where: {
            id: { in: eventIds },
            weddingId: wedding.id,
            visible: true,
            archived: false
          },
          select: { id: true, name: true }
        })
      : [];
    if (validEvents.length !== eventIds.length) {
      throw new ApiError(422, "One or more selected events are no longer available.", "INVALID_EVENTS");
    }

    const created = await prisma.rSVP.create({
      data: {
        weddingId: wedding.id,
        guestName: body.guestName,
        phone: body.phone || null,
        attendance: body.attendance,
        guestCount,
        message: body.message || null,
        idempotencyKey: body.idempotencyKey,
        ipHash: hashIp(req.ip),
        userAgent: req.get("user-agent")?.slice(0, 300) ?? null,
        eventAttendance: {
          create: validEvents.map((event) => ({ eventId: event.id }))
        }
      }
    });

    const notificationSent = await sendRsvpNotification({
      wedding,
      settings,
      rsvp: created,
      eventNames: validEvents.map((event) => event.name)
    });
    if (notificationSent) {
      await prisma.rSVP.update({ where: { id: created.id }, data: { notified: true } });
    }

    res.status(201).json({
      ok: true,
      attendance: created.attendance,
      notificationSent,
      message:
        created.attendance === "ATTENDING"
          ? settings?.rsvpSuccessMessage
          : settings?.rsvpDeclineMessage
    });
  })
);

export default router;
