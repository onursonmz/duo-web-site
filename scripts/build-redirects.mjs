/**
 * REDIRECT ÇIKTI ÜRETİCİSİ (S13).
 *
 * 410 kuralları `/410/` gövdesini gösterir — bu sayfa GERÇEKTEN üretilir
 * (`src/pages/410.astro`). Kaldırılmış içerik ana sayfaya YÖNLENDİRİLMEZ.
 *
 * TEK kaynak (`src/config/redirects.ts`) üzerinden SAĞLAYICIDAN BAĞIMSIZ
 * çıktılar üretir:
 *
 *   dist/redirect-manifest.json  — test edilebilir manifest
 *   dist/_redirects              — Netlify/Cloudflare biçimi
 *   dist/nginx-redirects.conf    — nginx örnek mapping
 *
 * CANLI SUNUCUDA UYGULAMA YAPILMAZ; bu dosyalar yalnızca üretilir ve incelenir.
 * Deployment sağlayıcısı seçilmediği için hiçbiri otomatik yüklenmez.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { REDIRECTS, statusFor } from "../src/config/redirects.ts";

const outDir = join(process.cwd(), "dist");
await mkdir(outDir, { recursive: true });

const active = REDIRECTS.filter((rule) => rule.kind !== "preserve");

/* ------------------------------------------------------------- manifest */

const manifest = {
  generatedFrom: "src/config/redirects.ts",
  note: "Sağlayıcıdan bağımsız. Canlı sunucuda uygulama YAPILMAZ.",
  total: REDIRECTS.length,
  counts: REDIRECTS.reduce((acc, rule) => {
    acc[rule.kind] = (acc[rule.kind] ?? 0) + 1;
    return acc;
  }, /** @type {Record<string, number>} */ ({})),
  rules: REDIRECTS.map((rule) => ({
    from: rule.from,
    kind: rule.kind,
    to: rule.to ?? null,
    status: rule.kind === "preserve" ? 200 : statusFor(rule.kind),
    reason: rule.reason,
  })),
};

await writeFile(
  join(outDir, "redirect-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8"
);

/* ----------------------------------------------------------- _redirects */

const redirectLines = [
  "# Duosis — URL migrasyonu (S13). Kaynak: src/config/redirects.ts",
  "# Bu dosya ÜRETİLİR; elle düzenlenmez.",
  "",
  ...active.map((rule) =>
    rule.kind === "410" ? `${rule.from} /410/ 410` : `${rule.from} ${rule.to} 301`
  ),
  "",
];
await writeFile(join(outDir, "_redirects"), redirectLines.join("\n"), "utf8");

/* -------------------------------------------------------------- nginx */

const nginxLines = [
  "# Duosis — URL migrasyonu (S13). Kaynak: src/config/redirects.ts",
  "# ÖRNEK mapping; canlı sunucuya uygulanmadı.",
  "",
  ...active.map((rule) =>
    rule.kind === "410"
      ? `location = ${rule.from} { return 410; }`
      : `location = ${rule.from} { return 301 ${rule.to}; }`
  ),
  "",
];
await writeFile(join(outDir, "nginx-redirects.conf"), nginxLines.join("\n"), "utf8");

console.warn(
  `[redirects] ${REDIRECTS.length} kural işlendi ` +
    `(${active.length} yönlendirme, ${REDIRECTS.length - active.length} korunan).`
);
