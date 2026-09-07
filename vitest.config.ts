import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Yalnızca unit testler; e2e Playwright ile ayrı çalışır.
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    reporters: ["default"],
  },
  resolve: {
    alias: {
      // fileURLToPath kullanılıyor: URL.pathname Windows'ta "/C:/..." üretip
      // yol çözümlemesini bozuyor.
      "@lib": fileURLToPath(new URL("./src/lib", import.meta.url)),
    },
  },
});
