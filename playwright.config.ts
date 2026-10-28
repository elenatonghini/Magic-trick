import { defineConfig } from "@playwright/test";
const production = process.env.E2E_PRODUCTION === "1";
const port = production ? 5187 : 5186;
const basePath = production ? process.env.BASE_PATH || "/" : "/";
const url = `http://127.0.0.1:${port}${basePath}`;
export default defineConfig({
  testDir: "./tests",
  use: { channel: "chromium", baseURL: url, reducedMotion: "reduce" },
  webServer: {
    command: production
      ? `npm run preview -- --port ${port} --strictPort`
      : `npm run dev -- --port ${port} --strictPort`,
    url,
    reuseExistingServer: false,
  },
});
