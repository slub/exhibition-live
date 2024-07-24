import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  external: [
    "react",
    "react-dom",
    "cross-fetch",
    "@mui/material",
    "@tanstack/react-query",
  ], // Specify which modules are external
  splitting: false, // Set to true if you want code splitting in your ESM bundle
  sourcemap: true, // Generates source maps
  clean: true, // Cleans the outDir before building
  // Consider enabling dts if you want to generate declaration files
  dts: true,
});
