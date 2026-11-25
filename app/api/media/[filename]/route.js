import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Serves admin-uploaded screenshots from data/uploads. A route handler is used
 * instead of `public/` so a new upload is available without a rebuild or server
 * restart, and so filenames can be validated before anything is read.
 */

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const CONTENT_TYPES = new Map([
  ["png", "image/png"],
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["webp", "image/webp"],
  ["avif", "image/avif"],
]);
const VALID_NAME = /^[a-z0-9-]+\.(png|jpe?g|webp|avif)$/;

export async function GET(_request, { params }) {
  const { filename } = await params;

  if (typeof filename !== "string" || !VALID_NAME.test(filename)) {
    return new Response("Not found", { status: 404 });
  }

  const extension = filename.split(".").pop();
  const filePath = path.join(UPLOAD_DIR, filename);

  try {
    const bytes = await readFile(filePath);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": CONTENT_TYPES.get(extension) ?? "application/octet-stream",
        "Content-Length": String(bytes.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error?.code === "ENOENT") {
      return new Response("Not found", { status: 404 });
    }
    return new Response("Could not read image", { status: 500 });
  }
}
