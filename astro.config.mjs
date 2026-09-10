// @ts-check
import { defineConfig } from "astro/config";
import { deployEnv, resolveSiteUrl } from "./src/config/site.ts";

/**
 * ORTAM AYRIMI (S13).
 *
 * Kanonik adres `src/config/site.ts` üzerinden çözülür ve PRODUCTION için
 * FAIL-CLOSED doğrulanır:
 *   - `PUBLIC_SITE_URL` zorunlu,
 *   - `https://` zorunlu,
 *   - localhost / 127.0.0.1 canonical YASAK.
 * Koşul sağlanmazsa build burada kırılır; yanlış canonical üretilmez.
 *
 * Bilinçli olarak eklenmeyenler:
 * - deployment adapter (ADR-003 hâlâ OPEN; provider-specific kod çekirdeğe
 *   yayılmaz — canlı deploy ve DNS değişikliği bu paketin kapsamı dışındadır)
 * - UI framework entegrasyonu (React/Vue/Svelte)
 */
const site = resolveSiteUrl(process.env);

export default defineConfig({
  site,
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
  vite: {
    define: {
      // Ortam, istemci tarafında da okunabilir olmalı (robots/sitemap davranışı).
      "import.meta.env.PUBLIC_DEPLOY_ENV": JSON.stringify(deployEnv(process.env)),
    },
  },
});
