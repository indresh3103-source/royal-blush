import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";
import { env } from "./env.js";
import { ApiError } from "./helpers.js";

const here = dirname(fileURLToPath(import.meta.url));
const uploadsDir = resolve(here, "../uploads");

const imageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const audioMimeTypes = new Set([
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
  "audio/aac"
]);

const audioExtensions: Record<string, string> = {
  "audio/mpeg": ".mp3",
  "audio/mp4": ".m4a",
  "audio/x-m4a": ".m4a",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
  "audio/ogg": ".ogg",
  "audio/webm": ".webm",
  "audio/aac": ".aac"
};

let s3Client: S3Client | null = null;

function getS3Client() {
  if (!env.S3_BUCKET || !env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.AWS_ENDPOINT_URL_S3) {
    return null;
  }
  if (!s3Client) {
    s3Client = new S3Client({
      region: env.AWS_REGION,
      endpoint: env.AWS_ENDPOINT_URL_S3,
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY
      },
      requestChecksumCalculation: "WHEN_REQUIRED"
    });
  }
  return s3Client;
}

export function storageMode() {
  if (getS3Client()) return "s3";
  if (env.ALLOW_LOCAL_STORAGE) return "local";
  return "unconfigured";
}

function publicUrlForKey(key: string) {
  const base = (env.S3_PUBLIC_URL || "").replace(/\/+$/, "");
  const encoded = key.split("/").map(encodeURIComponent).join("/");
  return `${base}/${encoded}`;
}

export async function storeFile(buffer: Buffer, key: string, contentType: string) {
  const client = getS3Client();
  if (client && env.S3_BUCKET) {
    await client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable"
      })
    );
    return { key, url: publicUrlForKey(key) };
  }
  if (env.ALLOW_LOCAL_STORAGE) {
    const target = resolve(uploadsDir, key);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, buffer);
    return { key, url: `/uploads/${key}` };
  }
  throw new ApiError(503, "Media storage is not configured on the server.", "STORAGE_NOT_CONFIGURED");
}

export async function deleteStoredFile(key: string) {
  if (!key || key.startsWith("demo/")) return;
  const client = getS3Client();
  if (client && env.S3_BUCKET) {
    await client.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
    return;
  }
  if (env.ALLOW_LOCAL_STORAGE) {
    await unlink(resolve(uploadsDir, key)).catch(() => undefined);
  }
}

export async function optimizeImage(buffer: Buffer) {
  const detected = await fileTypeFromBuffer(buffer);
  const mime = detected?.mime ?? "";
  if (!imageMimeTypes.has(mime)) {
    throw new ApiError(415, "Only JPEG, PNG, WebP, or AVIF images can be uploaded.", "UNSUPPORTED_IMAGE");
  }
  try {
    const result = await sharp(buffer)
      .rotate()
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84, effort: 4 })
      .toBuffer({ resolveWithObject: true });
    return {
      buffer: result.data,
      mimeType: "image/webp",
      extension: ".webp",
      width: result.info.width,
      height: result.info.height
    };
  } catch {
    throw new ApiError(422, "The image could not be processed.", "INVALID_IMAGE");
  }
}

export async function validateAudio(buffer: Buffer, declaredMime: string) {
  const detected = await fileTypeFromBuffer(buffer);
  const mime = detected?.mime && audioMimeTypes.has(detected.mime) ? detected.mime : declaredMime;
  if (!audioMimeTypes.has(mime)) {
    throw new ApiError(415, "Only MP3, M4A, WAV, OGG, WebM, or AAC audio can be uploaded.", "UNSUPPORTED_AUDIO");
  }
  return { mimeType: mime, extension: audioExtensions[mime] ?? ".mp3" };
}

export function makeStorageKey(folder: string, extension: string) {
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "media";
  return `${safeFolder}/${new Date().getUTCFullYear()}/${randomUUID()}${extension}`;
}
