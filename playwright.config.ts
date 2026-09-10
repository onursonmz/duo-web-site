import { defineConfig, devices } from "@playwright/test";

/**
 * E2E her çalıştırmada DİNAMİK ve BOŞ bir loopback portu kullanır.
 *
 * Sabit port (4321) kullanıldığında makinede kalmış eski bir sunucu testlerin
 * BAYAT bir build'e bağlanmasına yol açabiliyordu; `EADDRINUSE` alan yeni sunucu
 * ölürken testler eski sunucuya bağlanıp yanlış pozitif üretiyordu (S02 bulgusu).
 *
 * Çözüm:
 * - Port `tests/support/run-e2e.mjs` içinde TEK bir yerde `listen(0)` ile seçilir.
 *   (Yapılandırma her worker sürecinde yeniden değerlendirildiği için portun
 *   burada seçilmesi worker'ların farklı portlara bakmasına yol açıyordu.)
 * - Aynı port TEK bir environment değişkeniyle (`E2E_PORT`) hem `baseURL`'e hem
 *   web server komutuna verilir; worker'lar bu değeri devralır.
 * - Sunucu bind edemezse süreç sıfırdan farklı exit code ile ölür ve Playwright
 *   testleri hiç başlatmaz (`reuseExistingServer: false`).
 * - Sabit porttaki bilinmeyen süreçler ÖLDÜRÜLMEZ; onlara dokunulmaz.
 */
const rawPort = process.env.E2E_PORT;
if (rawPort === undefined || Number(rawPort) <= 0) {
  throw new Error(
    "E2E_PORT tanımlı değil. E2E testlerini `pnpm test:e2e` ile çalıştırın " +
      "(tests/support/run-e2e.mjs boş bir port seçip bu değişkeni ayarlar)."
  );
}
const PORT = Number(rawPort);
const HOST = "127.0.0.1";
const BASE_URL = `http://${HOST}:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  /*
   * CI'da İKİ worker.
   *
   * Süit S13'te ~1005 teste çıktı ve worker sayısı 1'den 2'ye alındı.
   *
   * ÖLÇÜLEN: iki worker ile CI koşusu 7 dakika 31 saniye sürdü (kurulum ve
   * tarayıcı indirme dâhil). GitHub `ubuntu-latest` çalıştırıcısı 4 vCPU
   * taşıdığı için iki worker aşırı abonelik değildir; `retries: 1` yerinde
   * duruyor.
   *
   * ÖLÇÜLMEYEN: CI'da TEK worker'ın ne kadar süreceği hiç ölçülmedi. Bu
   * dosyanın önceki hâli "tek worker'la 20 dakikalık bütçe aşılıyordu"
   * diyordu; bu bir TAHMİNDİ ve kanıtı yoktu. İş adımı bütçesinin 40 dakika
   * olması bir ZORUNLULUK DEĞİL, güvenlik payıdır.
   *
   * Yerelde `undefined`: Playwright çekirdek sayısının yarısını kullanır.
   */
  workers: process.env.CI ? 2 : undefined,
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
  webServer: {
    command: `pnpm build && node tests/support/preview-server.mjs dist ${PORT} ${HOST}`,
    url: BASE_URL,
    // Var olan sunucu ASLA yeniden kullanılmaz.
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
    env: { E2E_PORT: String(PORT) },
  },
});
