import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /\.nojs\.spec\.ts$/,
    },
    {
      // JavaScript kapalıyken temel içeriğin erişilebilir kaldığını doğrular
      // (02_TECHNICAL_ARCHITECTURE ss.3: varsayılan çıktı HTML/CSS'tir).
      name: "chromium-nojs",
      use: { ...devices["Desktop Chrome"], javaScriptEnabled: false },
      testMatch: /\.nojs\.spec\.ts$/,
    },
  ],

  // Testler ÜRETİM ÇIKTISINA karşı koşar: dev sunucusunun HMR istemcisi konsol
  // ve DOM sonuçlarını kirletmesin diye önce build alınır.
  //
  // `astro preview` yerine küçük bir statik sunucu kullanılıyor: Astro 7'nin
  // preview komutu TTY yokken kendini arka plana alıp kilit dosyası tutuyor;
  // Playwright ön planda kalan bir süreç beklediği için bu davranış testleri
  // kırıyor ve makinede kalan eski bir daemon testlerin bayat build'e karşı
  // koşmasına yol açabiliyor. Bkz. tests/support/preview-server.mjs
  webServer: {
    command: `pnpm build && node tests/support/preview-server.mjs dist ${PORT} 127.0.0.1`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
