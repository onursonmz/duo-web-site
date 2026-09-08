/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

/**
 * `getViteConfig` kullanılıyor: testlerin `astro:content` gibi sanal modülleri
 * ve tsconfig alias'larını gerçek proje yapılandırmasıyla aynı şekilde
 * çözebilmesi için. Böylece testler kopya değil, GERÇEK şemaları doğrular.
 */
export default getViteConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    reporters: ["default"],
    // İçerik senkronizasyonu ve şema doğrulama testleri build çalıştırabilir.
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
});
