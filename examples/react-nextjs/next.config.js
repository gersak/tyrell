/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow accessing the dev server from other devices on the LAN.
  // Next.js 16 blocks cross-origin requests to /_next/* resources by default.
  allowedDevOrigins: ['192.168.1.2'],
  // Pin Turbopack's workspace root to this example dir. Without this it walks
  // up to the monorepo root (because of the root package-lock.json) and tries
  // to index the entire tyrell repo (CLJS sources, shadow-cljs cache, docs/
  // build output, etc.) — which OOMs the dev server in minutes.
  turbopack: {
    root: __dirname,
  },
}

module.exports = nextConfig
