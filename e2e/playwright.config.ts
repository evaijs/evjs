import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "cases/*.ts",
  timeout: 30_000,
  retries: 0,
  use: {
    headless: true,
    baseURL: "http://localhost:3000",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
