import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Local JSON persistence for admin-managed content.
 *
 * Writes are atomic (write to a temp file, then rename) and serialised per file
 * so two saves in quick succession cannot clobber each other. This assumes a
 * self-hosted Node server with a persistent filesystem.
 */

const DATA_DIR = path.join(process.cwd(), "data");
// Uploads live outside `public/` so newly added files are served immediately by
// the media route handler, without relying on the build-time static manifest.
const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

const PORTFOLIO_FILE = path.join(DATA_DIR, "portfolio.json");
const TESTIMONIALS_FILE = path.join(DATA_DIR, "testimonials.json");

const ALLOWED_IMAGE_TYPES = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const locks = new Map();

function serialiseFor(file, task) {
  const previous = locks.get(file) ?? Promise.resolve();
  const current = previous.then(task, task);
  locks.set(
    file,
    current.then(
      () => undefined,
      () => undefined
    )
  );
  return current;
}

async function readJson(file, fallback) {
  try {
    const raw = await readFile(file, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporary, file);
}

export function readPortfolioData() {
  return readJson(PORTFOLIO_FILE, []);
}

export function writePortfolioData(items) {
  return serialiseFor(PORTFOLIO_FILE, () => writeJson(PORTFOLIO_FILE, items));
}

export function readTestimonialsData() {
  return readJson(TESTIMONIALS_FILE, []);
}

export function writeTestimonialsData(items) {
  return serialiseFor(TESTIMONIALS_FILE, () =>
    writeJson(TESTIMONIALS_FILE, items)
  );
}

function safePrefix(value, fallback) {
  return (
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/[\s-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || fallback
  );
}

async function saveImage(file, prefix, label) {
  if (!file || typeof file.arrayBuffer !== "function") return null;
  if (file.size === 0) return null;
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`${label} must be 8 MB or smaller.`);
  }

  const extension = ALLOWED_IMAGE_TYPES.get(file.type);
  if (!extension) {
    throw new Error(`Use a PNG, JPEG, WebP or AVIF ${label.toLowerCase()}.`);
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${safePrefix(prefix, label.toLowerCase())}-${randomUUID().slice(0, 8)}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);
  return `/api/media/${filename}`;
}

/** Store an uploaded project screenshot and return its public URL. */
export function saveProjectImage(file, slug) {
  return saveImage(file, String(slug ?? ""), "Screenshot");
}

/** Store an uploaded client portrait and return its public URL. */
export function saveTestimonialImage(file, name) {
  return saveImage(file, String(name ?? ""), "Profile picture");
}
