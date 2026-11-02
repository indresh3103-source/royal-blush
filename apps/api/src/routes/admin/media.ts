import { Router } from "express";
import multer from "multer";
import { prisma } from "../../db.js";
import { asyncHandler } from "../../security.js";
import { ApiError } from "../../helpers.js";
import {
  galleryCreateSchema,
  galleryUpdateSchema,
  mediaUpdateSchema,
  musicCreateSchema,
  musicUpdateSchema
} from "../../validation.js";
import {
  deleteStoredFile,
  makeStorageKey,
  optimizeImage,
  storeFile,
  storageMode,
  validateAudio
} from "../../storage.js";
import { logger } from "../../logger.js";

const router = Router();

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024, files: 12 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new ApiError(415, "Only image files can be uploaded here.", "UNSUPPORTED_IMAGE"));
      return;
    }
    callback(null, true);
  }
});

const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("audio/")) {
      callback(new ApiError(415, "Only audio files can be uploaded here.", "UNSUPPORTED_AUDIO"));
      return;
    }
    callback(null, true);
  }
});

async function getWeddingId() {
  const wedding = await prisma.wedding.findFirst({ select: { id: true } });
  if (!wedding) throw new ApiError(404, "No wedding has been configured yet.", "SETUP_REQUIRED");
  return wedding.id;
}

function cleanName(value: string) {
  return value.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 255);
}

router.get(
  "/media",
  asyncHandler(async (req, res) => {
    const weddingId = await getWeddingId();
    const type = req.query.type === "AUDIO" ? "AUDIO" : req.query.type === "IMAGE" ? "IMAGE" : undefined;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const media = await prisma.mediaAsset.findMany({
      where: {
        weddingId,
        ...(type ? { type } : {}),
        ...(search
          ? {
              OR: [
                { originalName: { contains: search, mode: "insensitive" } },
                { altText: { contains: search, mode: "insensitive" } },
                { caption: { contains: search, mode: "insensitive" } }
              ]
            }
          : {})
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({ media, storageMode: storageMode() });
  })
);

router.post(
  "/media/images",
  imageUpload.array("files", 12),
  asyncHandler(async (req, res) => {
    const weddingId = await getWeddingId();
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (!files.length) throw new ApiError(422, "Choose at least one image to upload.", "NO_FILES");
    const created = [];
    for (const file of files) {
      const optimized = await optimizeImage(file.buffer);
      const key = makeStorageKey("images", optimized.extension);
      const stored = await storeFile(optimized.buffer, key, optimized.mimeType);
      try {
        const media = await prisma.mediaAsset.create({
          data: {
            weddingId,
            storageKey: stored.key,
            url: stored.url,
            originalName: cleanName(file.originalname) || "Photograph",
            mimeType: optimized.mimeType,
            type: "IMAGE",
            size: optimized.buffer.length,
            width: optimized.width,
            height: optimized.height,
            altText: null,
            caption: null
          }
        });
        created.push(media);
      } catch (error) {
        await deleteStoredFile(stored.key).catch(() => undefined);
        throw error;
      }
    }
    res.status(201).json(created);
  })
);

router.post(
  "/media/audio",
  audioUpload.single("file"),
  asyncHandler(async (req, res) => {
    const weddingId = await getWeddingId();
    const file = req.file;
    if (!file) throw new ApiError(422, "Choose an audio file to upload.", "NO_FILES");
    const validated = await validateAudio(file.buffer, file.mimetype);
    const key = makeStorageKey("audio", validated.extension);
    const stored = await storeFile(file.buffer, key, validated.mimeType);
    try {
      const media = await prisma.mediaAsset.create({
        data: {
          weddingId,
          storageKey: stored.key,
          url: stored.url,
          originalName: cleanName(file.originalname) || "Music track",
          mimeType: validated.mimeType,
          type: "AUDIO",
          size: file.buffer.length,
          altText: null,
          caption: null
        }
      });
      res.status(201).json(media);
    } catch (error) {
      await deleteStoredFile(stored.key).catch(() => undefined);
      throw error;
    }
  })
);

router.patch(
  "/media/:id",
  asyncHandler(async (req, res) => {
    const weddingId = await getWeddingId();
    const body = mediaUpdateSchema.parse(req.body);
    const media = await prisma.mediaAsset.findFirst({ where: { id: req.params.id, weddingId } });
    if (!media) throw new ApiError(404, "Media asset not found.", "NOT_FOUND");
    const updated = await prisma.mediaAsset.update({
      where: { id: media.id },
      data: {
        ...(body.originalName !== undefined ? { originalName: cleanName(body.originalName) } : {}),
        ...(body.altText !== undefined ? { altText: body.altText } : {}),
        ...(body.caption !== undefined ? { caption: body.caption } : {})
      }
    });
    res.json(updated);
  })
);

router.delete(
  "/media/:id",
  asyncHandler(async (req, res) => {
    const weddingId = await getWeddingId();
    const media = await prisma.mediaAsset.findFirst({ where: { id: req.params.id, weddingId } });
    if (!media) throw new ApiError(404, "Media asset not found.", "NOT_FOUND");
    const wedding = await prisma.wedding.findUnique({ where: { id: weddingId } });
    if (wedding) {
      const data: Record<string, null> = {};
      if (wedding.heroImageUrl === media.url) data.heroImageUrl = null;
      if (wedding.bridePortraitUrl === media.url) data.bridePortraitUrl = null;
      if (wedding.groomPortraitUrl === media.url) data.groomPortraitUrl = null;
      if (wedding.familyPhotoUrl === media.url) data.familyPhotoUrl = null;
      if (wedding.venuePhotoUrl === media.url) data.venuePhotoUrl = null;
      if (Object.keys(data).length) {
        await prisma.wedding.update({ where: { id: weddingId }, data });
      }
    }
    await prisma.mediaAsset.delete({ where: { id: media.id } });
    await deleteStoredFile(media.storageKey).catch((error) => logger.error({ error, key: media.storageKey }, "Storage deletion failed"));
    res.json({ ok: true });
  })
);

router.get(
  "/gallery",
  asyncHandler(async (_req, res) => {
    const weddingId = await getWeddingId();
    const gallery = await prisma.galleryImage.findMany({
      where: { weddingId },
      include: { media: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }]
    });
    res.json(gallery);
  })
);

router.post(
  "/gallery",
  asyncHandler(async (req, res) => {
    const weddingId = await getWeddingId();
    const body = galleryCreateSchema.parse(req.body);
    const media = await prisma.mediaAsset.findFirst({ where: { id: body.mediaId, weddingId, type: "IMAGE" } });
    if (!media) throw new ApiError(422, "Choose an image from the media library.", "INVALID_MEDIA");
    const image = await prisma.galleryImage.create({
      data: {
        weddingId,
        mediaId: media.id,
        section: body.section,
        caption: body.caption ?? null,
        altText: body.altText ?? null,
        visible: body.visible,
        order: body.order
      },
      include: { media: true }
    });
    res.status(201).json(image);
  })
);

router.patch(
  "/gallery/:id",
  asyncHandler(async (req, res) => {
    const weddingId = await getWeddingId();
    const body = galleryUpdateSchema.parse(req.body);
    const existing = await prisma.galleryImage.findFirst({ where: { id: req.params.id, weddingId } });
    if (!existing) throw new ApiError(404, "Gallery image not found.", "NOT_FOUND");
    if (body.mediaId) {
      const media = await prisma.mediaAsset.findFirst({ where: { id: body.mediaId, weddingId, type: "IMAGE" } });
      if (!media) throw new ApiError(422, "Choose an image from the media library.", "INVALID_MEDIA");
    }
    const image = await prisma.galleryImage.update({
      where: { id: existing.id },
      data: body,
      include: { media: true }
    });
    res.json(image);
  })
);

router.delete(
  "/gallery/:id",
  asyncHandler(async (req, res) => {
    const weddingId = await getWeddingId();
    const existing = await prisma.galleryImage.findFirst({ where: { id: req.params.id, weddingId } });
    if (!existing) throw new ApiError(404, "Gallery image not found.", "NOT_FOUND");
    await prisma.galleryImage.delete({ where: { id: existing.id } });
    res.json({ ok: true });
  })
);

router.get(
  "/music",
  asyncHandler(async (_req, res) => {
    const weddingId = await getWeddingId();
    const tracks = await prisma.musicTrack.findMany({
      where: { weddingId },
      include: { media: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }]
    });
    res.json(tracks);
  })
);

router.post(
  "/music",
  asyncHandler(async (req, res) => {
    const weddingId = await getWeddingId();
    const body = musicCreateSchema.parse(req.body);
    const media = await prisma.mediaAsset.findFirst({ where: { id: body.mediaId, weddingId, type: "AUDIO" } });
    if (!media) throw new ApiError(422, "Choose an audio file from the media library.", "INVALID_MEDIA");
    const track = await prisma.musicTrack.create({
      data: {
        weddingId,
        mediaId: media.id,
        title: body.title,
        artist: body.artist ?? null,
        coverUrl: body.coverUrl ?? null,
        visible: body.visible,
        order: body.order
      },
      include: { media: true }
    });
    res.status(201).json(track);
  })
);

router.patch(
  "/music/:id",
  asyncHandler(async (req, res) => {
    const weddingId = await getWeddingId();
    const body = musicUpdateSchema.parse(req.body);
    const existing = await prisma.musicTrack.findFirst({ where: { id: req.params.id, weddingId } });
    if (!existing) throw new ApiError(404, "Music track not found.", "NOT_FOUND");
    if (body.mediaId) {
      const media = await prisma.mediaAsset.findFirst({ where: { id: body.mediaId, weddingId, type: "AUDIO" } });
      if (!media) throw new ApiError(422, "Choose an audio file from the media library.", "INVALID_MEDIA");
    }
    const track = await prisma.musicTrack.update({
      where: { id: existing.id },
      data: body,
      include: { media: true }
    });
    res.json(track);
  })
);

router.delete(
  "/music/:id",
  asyncHandler(async (req, res) => {
    const weddingId = await getWeddingId();
    const existing = await prisma.musicTrack.findFirst({ where: { id: req.params.id, weddingId } });
    if (!existing) throw new ApiError(404, "Music track not found.", "NOT_FOUND");
    await prisma.musicTrack.delete({ where: { id: existing.id } });
    res.json({ ok: true });
  })
);

export default router;
