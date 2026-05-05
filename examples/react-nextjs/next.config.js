/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow accessing the dev server from other devices on the LAN.
  // Next.js 16 blocks cross-origin requests to /_next/* resources by default.
  allowedDevOrigins: ['192.168.1.2'],
}

module.exports = nextConfig
