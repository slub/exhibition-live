/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "/exhibition-live",
  publicRuntimeConfig: {
    NEXT_PUBLIC_GAPI_OAUTH_CLIENT_ID:
      process.env.NEXT_PUBLIC_GAPI_OAUTH_CLIENT_ID,
    NEXT_PUBLIC_BASE_PATH:
      process.env.NEXT_PUBLIC_BASE_PATH || "/exhibition-live",
  },
};

module.exports = nextConfig;
