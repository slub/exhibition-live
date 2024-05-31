const removeImports = require("next-remove-imports")({
  test: /node_modules([\s\S]*?)\.(tsx|ts|js|mjs|jsx)$/,
  matchImports: "\\.(less|css|scss|sass|styl)$",
});

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = removeImports({
  reactStrictMode: true,
  output: "export",
  modularizeImports: {
    "@mui/icons-material": { transform: "@mui/icons-material/{{member}}" },
    lodash: { transform: "lodash/{{member}}" },
    "lodash-es": { transform: "lodash-es/{{member}}" },
  },
  experimental: {
    externalDir: true,
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "@mui/lab",
    ],
  },
  images: {
    unoptimized: true,
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  publicRuntimeConfig: {
    NEXT_PUBLIC_GAPI_OAUTH_CLIENT_ID:
      process.env.NEXT_PUBLIC_GAPI_OAUTH_CLIENT_ID,
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH || "",
    SPARQL_ENDPOINT: process.env.SPARQL_ENDPOINT,
    SPARQL_ENDPOINT_LABEL: process.env.SPARQL_ENDPOINT_LABEL,
    SPARQL_ENDPOINT_PROVIDER: process.env.SPARQL_ENDPOINT_PROVIDER,
    SPARQL_ENDPOINT_USERNAME: process.env.SPARQL_ENDPOINT_USERNAME,
    SPARQL_ENDPOINT_PASSWORD: process.env.SPARQL_ENDPOINT_PASSWORD,
    SPARQL_ENDPOINT_TOKEN: process.env.SPARQL_ENDPOINT_TOKEN,
  },
});

module.exports = withBundleAnalyzer(nextConfig);
