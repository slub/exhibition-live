/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: 'dist',
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en'],
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
}

module.exports = nextConfig
