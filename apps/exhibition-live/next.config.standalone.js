/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    unoptimized: true,
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  publicRuntimeConfig: {
    NEXT_PUBLIC_GAPI_OAUTH_CLIENT_ID:
      process.env.NEXT_PUBLIC_GAPI_OAUTH_CLIENT_ID,
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
    SPARQL_ENDPOINT: process.env.SPARQL_ENDPOINT,
    SPARQL_ENDPOINT_LABEL: process.env.SPARQL_ENDPOINT_LABEL,
    SPARQL_ENDPOINT_PROVIDER: process.env.SPARQL_ENDPOINT_PROVIDER,
    SPARQL_ENDPOINT_USERNAME: process.env.SPARQL_ENDPOINT_USERNAME,
    SPARQL_ENDPOINT_PASSWORD: process.env.SPARQL_ENDPOINT_PASSWORD,
    SPARQL_ENDPOINT_TOKEN: process.env.SPARQL_ENDPOINT_TOKEN,
  },
};

module.exports = nextConfig;
