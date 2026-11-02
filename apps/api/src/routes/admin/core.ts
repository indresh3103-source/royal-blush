import { Router } from "express";
import { DateTime } from "luxon";
import { prisma } from "../../db.js";
import { asyncHandler, setNoStore } from "../../security.js";
import { ApiError } from "../../helpers.js";
import {
  eventCreateSchema,
  eventUpdateSchema,
  familyCreateSchema,
  familyUpdateSchema,
  hotelCreateSchema,
  hotelUpdateSchema,
  ritualCreateSchema,
  ritualUpdateSchema,
  sectionBulkSchema,
  settingsUpdateSchema,
  storyCreateSchema,
  storyUpdateSchema,
  themeUpdateSchema,
  weddingUpdateSchema
} from "../../validation.js";
import { storageMode } from "../../storage.js";

const router = Router();

router.get(
  "/dashboard",
  asyncHandler(async (_req, res) => {
    setNoStore(res);
    const wedding = await prisma.wedding.findFirst({ include: { settings: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const today = DateTime.now().setZone(wedding.timezone).toISODate() ?? "";
    const [
      totalResponses,
      attendingResponses,
      declinedResponses,
      expectedGuests,
      eventCount,
      nextEvent,
      latestResponses,
      mediaCount,
      galleryCount,
      musicCount
    ] = await Promise.all([
      prisma.rSVP.count({ where: { weddingId: wedding.id } }),
      prisma.rSVP.count({ where: { weddingId: wedding.id, attendance: "ATTENDING" } }),
      prisma.rSVP.count({ where: { weddingId: wedding.id, attendance: "DECLINED" } }),
      prisma.rSVP.aggregate({
        where: { weddingId: wedding.id, attendance: "ATTENDING" },
        _sum: { guestCount: true }
      }),
      prisma.weddingEvent.count({ where: { weddingId: wedding.id, archived: false } }),
      prisma.weddingEvent.findFirst({
        where: { weddingId: wedding.id, archived: false, eventDate: { gte: today } },
        orderBy: [{ eventDate: "asc" }, { startTime: "asc" }]
      }),
      prisma.rSVP.findMany({
        where: { weddingId: wedding.id },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { eventAttendance: { include: { event: true } } }
      }),
      prisma.mediaAsset.count({ where: { weddingId: wedding.id, type: "IMAGE" } }),
      prisma.galleryImage.count({ where: { weddingId: wedding.id } }),
      prisma.musicTrack.count({ where: { weddingId: wedding.id } })
    ]);

    res.json({
      wedding: {
        id: wedding.id,
        title: wedding.title,
        brideName: wedding.brideName,
        groomName: wedding.groomName,
        weddingDate: wedding.weddingDate,
        weddingTime: wedding.weddingTime,
        timezone: wedding.timezone,
        venueName: wedding.venueName,
        city: wedding.city
      },
      stats: {
        totalResponses,
        attendingResponses,
        declinedResponses,
        expectedGuests: expectedGuests._sum.guestCount ?? 0,
        eventCount,
        mediaCount,
        galleryCount,
        musicCount
      },
      nextEvent,
      latestResponses: latestResponses.map((response) => ({
        id: response.id,
        guestName: response.guestName,
        attendance: response.attendance,
        guestCount: response.guestCount,
        createdAt: response.createdAt,
        events: response.eventAttendance.map((attendance) => attendance.event.name)
      })),
      storageMode: storageMode(),
      rsvpOpen: wedding.settings?.rsvpEnabled ?? false
    });
  })
);

router.get(
  "/wedding",
  asyncHandler(async (_req, res) => {
    setNoStore(res);
    const wedding = await prisma.wedding.findFirst({
      orderBy: { createdAt: "asc" },
      include: {
        theme: true,
        settings: true,
        familyMembers: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
        sections: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
        hotels: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] }
      }
    });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    res.json(wedding);
  })
);

router.patch(
  "/wedding",
  asyncHandler(async (req, res) => {
    const body = weddingUpdateSchema.parse(req.body);
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const updated = await prisma.wedding.update({ where: { id: wedding.id }, data: body });
    res.json(updated);
  })
);

router.get(
  "/family",
  asyncHandler(async (_req, res) => {
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const family = await prisma.familyMember.findMany({
      where: { weddingId: wedding.id },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }]
    });
    res.json(family);
  })
);

router.post(
  "/family",
  asyncHandler(async (req, res) => {
    const body = familyCreateSchema.parse(req.body);
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const member = await prisma.familyMember.create({ data: { ...body, weddingId: wedding.id } });
    res.status(201).json(member);
  })
);

router.patch(
  "/family/:id",
  asyncHandler(async (req, res) => {
    const body = familyUpdateSchema.parse(req.body);
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const existing = await prisma.familyMember.findFirst({ where: { id: req.params.id, weddingId: wedding.id } });
    if (!existing) throw new ApiError(404, "Family member not found.", "NOT_FOUND");
    const member = await prisma.familyMember.update({ where: { id: existing.id }, data: body });
    res.json(member);
  })
);

router.delete(
  "/family/:id",
  asyncHandler(async (req, res) => {
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const existing = await prisma.familyMember.findFirst({ where: { id: req.params.id, weddingId: wedding.id } });
    if (!existing) throw new ApiError(404, "Family member not found.", "NOT_FOUND");
    await prisma.familyMember.delete({ where: { id: existing.id } });
    res.json({ ok: true });
  })
);

router.get(
  "/events",
  asyncHandler(async (_req, res) => {
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const events = await prisma.weddingEvent.findMany({
      where: { weddingId: wedding.id },
      orderBy: [{ eventDate: "asc" }, { startTime: "asc" }, { order: "asc" }]
    });
    res.json(events);
  })
);

router.post(
  "/events",
  asyncHandler(async (req, res) => {
    const body = eventCreateSchema.parse(req.body);
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const event = await prisma.weddingEvent.create({ data: { ...body, weddingId: wedding.id } });
    res.status(201).json(event);
  })
);

router.patch(
  "/events/:id",
  asyncHandler(async (req, res) => {
    const body = eventUpdateSchema.parse(req.body);
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const existing = await prisma.weddingEvent.findFirst({ where: { id: req.params.id, weddingId: wedding.id } });
    if (!existing) throw new ApiError(404, "Event not found.", "NOT_FOUND");
    const event = await prisma.weddingEvent.update({ where: { id: existing.id }, data: body });
    res.json(event);
  })
);

router.delete(
  "/events/:id",
  asyncHandler(async (req, res) => {
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const existing = await prisma.weddingEvent.findFirst({ where: { id: req.params.id, weddingId: wedding.id } });
    if (!existing) throw new ApiError(404, "Event not found.", "NOT_FOUND");
    await prisma.weddingEvent.delete({ where: { id: existing.id } });
    res.json({ ok: true });
  })
);

router.get(
  "/rituals",
  asyncHandler(async (_req, res) => {
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const rituals = await prisma.weddingRitual.findMany({
      where: { weddingId: wedding.id },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }]
    });
    res.json(rituals);
  })
);

router.post(
  "/rituals",
  asyncHandler(async (req, res) => {
    const body = ritualCreateSchema.parse(req.body);
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const ritual = await prisma.weddingRitual.create({ data: { ...body, weddingId: wedding.id } });
    res.status(201).json(ritual);
  })
);

router.patch(
  "/rituals/:id",
  asyncHandler(async (req, res) => {
    const body = ritualUpdateSchema.parse(req.body);
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const existing = await prisma.weddingRitual.findFirst({ where: { id: req.params.id, weddingId: wedding.id } });
    if (!existing) throw new ApiError(404, "Ritual not found.", "NOT_FOUND");
    const ritual = await prisma.weddingRitual.update({ where: { id: existing.id }, data: body });
    res.json(ritual);
  })
);

router.delete(
  "/rituals/:id",
  asyncHandler(async (req, res) => {
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const existing = await prisma.weddingRitual.findFirst({ where: { id: req.params.id, weddingId: wedding.id } });
    if (!existing) throw new ApiError(404, "Ritual not found.", "NOT_FOUND");
    await prisma.weddingRitual.delete({ where: { id: existing.id } });
    res.json({ ok: true });
  })
);

router.get(
  "/hotels",
  asyncHandler(async (_req, res) => {
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const hotels = await prisma.nearbyHotel.findMany({
      where: { weddingId: wedding.id },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }]
    });
    res.json(hotels);
  })
);

router.post(
  "/hotels",
  asyncHandler(async (req, res) => {
    const body = hotelCreateSchema.parse(req.body);
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const hotel = await prisma.nearbyHotel.create({ data: { ...body, weddingId: wedding.id } });
    res.status(201).json(hotel);
  })
);

router.patch(
  "/hotels/:id",
  asyncHandler(async (req, res) => {
    const body = hotelUpdateSchema.parse(req.body);
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const existing = await prisma.nearbyHotel.findFirst({ where: { id: req.params.id, weddingId: wedding.id } });
    if (!existing) throw new ApiError(404, "Hotel not found.", "NOT_FOUND");
    const hotel = await prisma.nearbyHotel.update({ where: { id: existing.id }, data: body });
    res.json(hotel);
  })
);

router.delete(
  "/hotels/:id",
  asyncHandler(async (req, res) => {
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const existing = await prisma.nearbyHotel.findFirst({ where: { id: req.params.id, weddingId: wedding.id } });
    if (!existing) throw new ApiError(404, "Hotel not found.", "NOT_FOUND");
    await prisma.nearbyHotel.delete({ where: { id: existing.id } });
    res.json({ ok: true });
  })
);

router.get(
  "/story",
  asyncHandler(async (_req, res) => {
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const moments = await prisma.storyMoment.findMany({
      where: { weddingId: wedding.id },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }]
    });
    res.json(moments);
  })
);

router.post(
  "/story",
  asyncHandler(async (req, res) => {
    const body = storyCreateSchema.parse(req.body);
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const moment = await prisma.storyMoment.create({ data: { ...body, weddingId: wedding.id } });
    res.status(201).json(moment);
  })
);

router.patch(
  "/story/:id",
  asyncHandler(async (req, res) => {
    const body = storyUpdateSchema.parse(req.body);
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const existing = await prisma.storyMoment.findFirst({ where: { id: req.params.id, weddingId: wedding.id } });
    if (!existing) throw new ApiError(404, "Story moment not found.", "NOT_FOUND");
    const moment = await prisma.storyMoment.update({ where: { id: existing.id }, data: body });
    res.json(moment);
  })
);

router.delete(
  "/story/:id",
  asyncHandler(async (req, res) => {
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const existing = await prisma.storyMoment.findFirst({ where: { id: req.params.id, weddingId: wedding.id } });
    if (!existing) throw new ApiError(404, "Story moment not found.", "NOT_FOUND");
    await prisma.storyMoment.delete({ where: { id: existing.id } });
    res.json({ ok: true });
  })
);

router.patch(
  "/sections",
  asyncHandler(async (req, res) => {
    const body = sectionBulkSchema.parse(req.body);
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const ids = body.sections.map((section) => section.id);
    const existing = await prisma.invitationSection.findMany({ where: { weddingId: wedding.id, id: { in: ids } } });
    if (existing.length !== ids.length) {
      throw new ApiError(422, "One or more sections could not be found.", "INVALID_SECTIONS");
    }
    await prisma.$transaction(
      body.sections.map((section) =>
        prisma.invitationSection.update({
          where: { id: section.id },
          data: { visible: section.visible, order: section.order }
        })
      )
    );
    const sections = await prisma.invitationSection.findMany({
      where: { weddingId: wedding.id },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }]
    });
    res.json(sections);
  })
);

router.patch(
  "/theme",
  asyncHandler(async (req, res) => {
    const body = themeUpdateSchema.parse(req.body);
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    const theme = await prisma.themeSettings.upsert({
      where: { weddingId: wedding.id },
      update: body,
      create: { weddingId: wedding.id, ...body }
    });
    res.json(theme);
  })
);

router.patch(
  "/settings",
  asyncHandler(async (req, res) => {
    const body = settingsUpdateSchema.parse(req.body);
    const wedding = await prisma.wedding.findFirst({ select: { id: true } });
    if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
    if (body.countdownEventId) {
      const event = await prisma.weddingEvent.findFirst({
        where: { id: body.countdownEventId, weddingId: wedding.id, archived: false }
      });
      if (!event) throw new ApiError(422, "The selected countdown event is not available.", "INVALID_COUNTDOWN_EVENT");
    }
    if (body.activeMusicTrackId) {
      const track = await prisma.musicTrack.findFirst({
        where: { id: body.activeMusicTrackId, weddingId: wedding.id }
      });
      if (!track) throw new ApiError(422, "The selected music track is not available.", "INVALID_MUSIC_TRACK");
    }
    const settings = await prisma.invitationSettings.upsert({
      where: { weddingId: wedding.id },
      update: body,
      create: { weddingId: wedding.id, ...body }
    });
    res.json(settings);
  })
);

export default router;
