import { Router } from "express";
import ExcelJS from "exceljs";
import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";
import { prisma } from "../../db.js";
import { asyncHandler } from "../../security.js";
import { ApiError } from "../../helpers.js";
import { rsvpQuerySchema } from "../../validation.js";

const router = Router();

async function getWedding() {
  const wedding = await prisma.wedding.findFirst({ select: { id: true, title: true, timezone: true } });
  if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
  return wedding;
}

function buildWhere(weddingId: string, query: ReturnType<typeof rsvpQuerySchema.parse>) {
  const where: Prisma.RSVPWhereInput = { weddingId };
  if (query.status) where.attendance = query.status;
  if (query.eventId) where.eventAttendance = { some: { eventId: query.eventId } };
  if (query.search) {
    where.OR = [
      { guestName: { contains: query.search, mode: "insensitive" } },
      { phone: { contains: query.search, mode: "insensitive" } },
      { message: { contains: query.search, mode: "insensitive" } }
    ];
  }
  return where;
}

function sortOrder(sort: "newest" | "oldest" | "name") {
  if (sort === "oldest") return { createdAt: "asc" as const };
  if (sort === "name") return { guestName: "asc" as const };
  return { createdAt: "desc" as const };
}

async function loadExportRows(weddingId: string, timezone: string, query: ReturnType<typeof rsvpQuerySchema.parse>) {
  const responses = await prisma.rSVP.findMany({
    where: buildWhere(weddingId, query),
    orderBy: sortOrder(query.sort),
    include: { eventAttendance: { include: { event: true } } }
  });
  return responses.map((response) => ({
    guestName: response.guestName,
    phone: response.phone ?? "",
    attendance: response.attendance === "ATTENDING" ? "Attending" : "Declined",
    guestCount: response.guestCount,
    events: response.eventAttendance.map((attendance) => attendance.event.name).join(", "),
    message: response.message ?? "",
    notified: response.notified ? "Yes" : "No",
    submitted: DateTime.fromJSDate(response.createdAt).setZone(timezone).toFormat("dd LLL yyyy, hh:mm a")
  }));
}

function csvEscape(value: string | number) {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

router.get(
  "/rsvps",
  asyncHandler(async (req, res) => {
    const wedding = await getWedding();
    const query = rsvpQuerySchema.parse(req.query);
    const where = buildWhere(wedding.id, query);
    const [total, responses] = await Promise.all([
      prisma.rSVP.count({ where }),
      prisma.rSVP.findMany({
        where,
        orderBy: sortOrder(query.sort),
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: { eventAttendance: { include: { event: true } } }
      })
    ]);
    res.json({
      total,
      page: query.page,
      pageSize: query.pageSize,
      pages: Math.max(1, Math.ceil(total / query.pageSize)),
      responses: responses.map((response) => ({
        id: response.id,
        guestName: response.guestName,
        phone: response.phone,
        attendance: response.attendance,
        guestCount: response.guestCount,
        message: response.message,
        notified: response.notified,
        createdAt: response.createdAt,
        events: response.eventAttendance.map((attendance) => ({
          id: attendance.event.id,
          name: attendance.event.name
        }))
      }))
    });
  })
);

router.get(
  "/rsvps/stats",
  asyncHandler(async (_req, res) => {
    const wedding = await getWedding();
    const [total, attending, declined, guestSum, events, createdDates] = await Promise.all([
      prisma.rSVP.count({ where: { weddingId: wedding.id } }),
      prisma.rSVP.count({ where: { weddingId: wedding.id, attendance: "ATTENDING" } }),
      prisma.rSVP.count({ where: { weddingId: wedding.id, attendance: "DECLINED" } }),
      prisma.rSVP.aggregate({
        where: { weddingId: wedding.id, attendance: "ATTENDING" },
        _sum: { guestCount: true }
      }),
      prisma.weddingEvent.findMany({
        where: { weddingId: wedding.id, archived: false },
        orderBy: [{ eventDate: "asc" }, { startTime: "asc" }],
        include: {
          attendance: {
            include: { rsvp: { select: { guestCount: true, attendance: true } } }
          }
        }
      }),
      prisma.rSVP.findMany({ where: { weddingId: wedding.id }, select: { createdAt: true } })
    ]);

    const dailyMap = new Map<string, number>();
    for (let index = 13; index >= 0; index -= 1) {
      const key = DateTime.now().setZone(wedding.timezone).minus({ days: index }).toISODate() ?? "";
      dailyMap.set(key, 0);
    }
    for (const entry of createdDates) {
      const key = DateTime.fromJSDate(entry.createdAt).setZone(wedding.timezone).toISODate() ?? "";
      if (dailyMap.has(key)) dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
    }

    res.json({
      total,
      attending,
      declined,
      expectedGuests: guestSum._sum.guestCount ?? 0,
      attendanceRate: total ? Math.round((attending / total) * 100) : 0,
      eventAttendance: events.map((event) => {
        const attendingRows = event.attendance.filter((row) => row.rsvp.attendance === "ATTENDING");
        return {
          eventId: event.id,
          name: event.name,
          eventDate: event.eventDate,
          responses: attendingRows.length,
          guests: attendingRows.reduce((sum, row) => sum + row.rsvp.guestCount, 0)
        };
      }),
      daily: Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }))
    });
  })
);

router.get(
  "/rsvps/export.csv",
  asyncHandler(async (req, res) => {
    const wedding = await getWedding();
    const query = rsvpQuerySchema.parse(req.query);
    const rows = await loadExportRows(wedding.id, wedding.timezone, query);
    const header = ["Guest name", "Mobile", "Response", "Guests", "Events", "Message", "Notified", "Submitted"];
    const lines = [
      header.map(csvEscape).join(","),
      ...rows.map((row) =>
        [
          row.guestName,
          row.phone,
          row.attendance,
          row.guestCount,
          row.events,
          row.message,
          row.notified,
          row.submitted
        ]
          .map(csvEscape)
          .join(",")
      )
    ];
    const filename = `royal-blush-rsvps-${DateTime.now().toFormat("yyyy-LL-dd")}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-store");
    res.send(`\uFEFF${lines.join("\r\n")}`);
  })
);

router.get(
  "/rsvps/export.xlsx",
  asyncHandler(async (req, res) => {
    const wedding = await getWedding();
    const query = rsvpQuerySchema.parse(req.query);
    const rows = await loadExportRows(wedding.id, wedding.timezone, query);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Royal Blush";
    workbook.created = new Date();
    const sheet = workbook.addWorksheet("RSVP Responses");
    sheet.columns = [
      { header: "Guest name", key: "guestName", width: 28 },
      { header: "Mobile", key: "phone", width: 18 },
      { header: "Response", key: "attendance", width: 14 },
      { header: "Guests", key: "guestCount", width: 10 },
      { header: "Events", key: "events", width: 38 },
      { header: "Message", key: "message", width: 50 },
      { header: "Notified", key: "notified", width: 12 },
      { header: "Submitted", key: "submitted", width: 24 }
    ];
    sheet.addRows(rows);
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" }, name: "Georgia", size: 11 };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF762F43" } };
    sheet.getRow(1).height = 26;
    sheet.getRow(1).alignment = { vertical: "middle" };
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: "top", wrapText: true };
        row.border = { bottom: { style: "hair", color: { argb: "FFE9DFCF" } } };
      }
    });
    sheet.autoFilter = { from: "A1", to: "H1" };
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `royal-blush-rsvps-${DateTime.now().toFormat("yyyy-LL-dd")}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-store");
    res.send(Buffer.from(buffer));
  })
);

router.get(
  "/rsvps/:id",
  asyncHandler(async (req, res) => {
    const wedding = await getWedding();
    const response = await prisma.rSVP.findFirst({
      where: { id: req.params.id, weddingId: wedding.id },
      include: { eventAttendance: { include: { event: true } } }
    });
    if (!response) throw new ApiError(404, "RSVP not found.", "NOT_FOUND");
    res.json({
      id: response.id,
      guestName: response.guestName,
      phone: response.phone,
      attendance: response.attendance,
      guestCount: response.guestCount,
      message: response.message,
      notified: response.notified,
      createdAt: response.createdAt,
      events: response.eventAttendance.map((attendance) => ({
        id: attendance.event.id,
        name: attendance.event.name,
        eventDate: attendance.event.eventDate
      }))
    });
  })
);

router.delete(
  "/rsvps/:id",
  asyncHandler(async (req, res) => {
    const wedding = await getWedding();
    const response = await prisma.rSVP.findFirst({ where: { id: req.params.id, weddingId: wedding.id } });
    if (!response) throw new ApiError(404, "RSVP not found.", "NOT_FOUND");
    await prisma.rSVP.delete({ where: { id: response.id } });
    res.json({ ok: true });
  })
);

export default router;
