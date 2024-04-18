import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000/exhibition-live",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: "/",
  },
});
