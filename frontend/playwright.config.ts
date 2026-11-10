import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 390, height: 844 },
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chrome",
      testMatch: /demo.spec.ts/,
      use: {
        browserName: "chromium",
        channel: "chrome",
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "edge",
      testMatch: /demo.spec.ts/,
      use: {
        browserName: "chromium",
        channel: "msedge",
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "firefox",
      testMatch: /demo.spec.ts/,
      use: { browserName: "firefox" },
    },
    {
      name: "webkit",
      testMatch: /demo.spec.ts/,
      use: { browserName: "webkit", isMobile: true, hasTouch: true },
    },
    {
      name: "api",
      testMatch: /api.spec.ts/,
      use: {
        browserName: "chromium",
        channel: "chrome",
        baseURL: "http://127.0.0.1:4174",
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: [
    {
      command: "npm run dev -- --host 127.0.0.1 --port 4173 --strictPort",
      url: "http://127.0.0.1:4173",
      env: { VITE_API_BASE_URL: "" },
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 4174 --strictPort",
      url: "http://127.0.0.1:4174",
      env: { VITE_API_BASE_URL: "/api" },
      reuseExistingServer: false,
    },
  ],
});
