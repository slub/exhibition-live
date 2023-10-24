/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: 'dist',
  output: 'export',
  images: {
      unoptimized: true,
  },
  basePath: '/exhibition-live'
}

module.exports = nextConfig
