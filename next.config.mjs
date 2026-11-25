import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Admin screenshots and client photos are uploaded through Server Actions.
    // Leave headroom above the 8 MB per-file validation limit for multipart overhead.
    serverActions: { bodySizeLimit: "9mb" },
  },
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
