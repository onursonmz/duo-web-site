// @ts-check
import { defineConfig } from "astro/config";

/**
 * S01 iskelet yapılandırması.
 *
 * Bilinçli olarak eklenmeyenler (kapsam dışı, bkz. sprints/S01):
 * - deployment adapter (ADR-003 hâlâ OPEN; provider-specific kod çekirdeğe yayılmaz)
 * - UI framework entegrasyonu (React/Vue/Svelte) - S01 için gerek yok
 * - content collections (S02), analytics/consent (S12), sitemap/SEO (S13)
 */
export default defineConfig({
  // Kanonik adres ortamdan gelir; prod değeri henüz kararlaştırılmadı.
  site: process.env.PUBLIC_SITE_URL ?? "http://localhost:4321",
  output: "static",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  devToolbar: {
    // Geliştirici araç çubuğu kapalı: e2e testlerinde DOM'a ek düğüm enjekte
    // etmesini ve konsol gürültüsü üretmesini istemiyoruz.
    enabled: false,
  },
});
