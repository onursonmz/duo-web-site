import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

/**
 * ENTEGRASYON NEGATİF TESTLERİ.
 *
 * Şema doğrulaması ve referans bütünlüğü Astro'nun içerik senkronizasyonunda
 * çalışır. Bu testler gerçek `astro sync` sürecini çalıştırıp bozuk içeriğin
 * REDDEDİLDİĞİNİ (sıfırdan farklı exit code) doğrular — saf birim testiyle
 * yakalanamayacak davranıştır.
 */

const ROOT = process.cwd();
const TEMP_FILES: string[] = [];

function writeFixture(relativePath: string, contents: string): void {
  const full = join(ROOT, relativePath);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, contents, "utf8");
  TEMP_FILES.push(full);
}

// Astro CLI'nin gerçek giriş dosyası (pnpm izole yerleşiminde .bin shim'i
// Windows'ta doğrudan çalıştırılamaz).
const ASTRO_BIN = join(ROOT, "node_modules", "astro", "bin", "astro.mjs");

/**
 * `astro build` çalıştırır. Referans bütünlüğü denetimi sayfa üretimi sırasında
 * çalıştığı için bozuk referans yalnızca build ile yakalanır.
 */
function runBuild(): string | null {
  return runAstro("build");
}

/** `astro sync` çalıştırır; başarılıysa null, hata verirse çıktıyı döner. */
function runSync(): string | null {
  return runAstro("sync");
}

function runAstro(command: "sync" | "build"): string | null {
  try {
    execFileSync(process.execPath, [ASTRO_BIN, command], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: "pipe",
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
    });
    return null;
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; message?: string };
    const output = `${err.stdout ?? ""}\n${err.stderr ?? ""}\n${err.message ?? ""}`;
    // Koşucunun kendi hatasını içerik doğrulama hatası sanmayalım.
    if (/MODULE_NOT_FOUND|Cannot find module/.test(output)) {
      throw new Error(`Test koşucusu Astro CLI'yi çalıştıramadı:\n${output}`, { cause: error });
    }
    return output;
  }
}

afterEach(() => {
  for (const file of TEMP_FILES.splice(0)) {
    if (existsSync(file)) rmSync(file);
  }
  // Geçici dosya kaldırıldıktan sonra içeriği temiz duruma döndür.
  runSync();
});

describe("içerik doğrulama — bozuk içerik build'i kırar", () => {
  it("temiz içerik senkronizasyonu başarılı", () => {
    expect(runSync()).toBeNull();
  });

  it("BOZUK İÇERİK REFERANSI reddediliyor", () => {
    writeFixture(
      "src/content/solutions/tr/__gecici-bozuk-referans.md",
      [
        "---",
        "translationKey: gecici-bozuk-referans",
        "locale: tr",
        "slug: gecici-bozuk-referans",
        "status: draft",
        "order: 8",
        "category: core",
        "title: Geçici bozuk referans",
        "summary: Test",
        "problem: Test",
        "approach: Test",
        "benefits:",
        "  - Test",
        "technologyRefs:",
        "  - bu-teknoloji-yok",
        "cta:",
        "  labelKey: cta.contactUs",
        "  href: /iletisim/",
        "seo:",
        "  title: Test",
        "  description: Test",
        "---",
        "",
      ].join("\n")
    );

    // Referans bütünlüğü sayfa üretiminde denetlenir; bu yüzden tam build.
    const output = runBuild();
    expect(output, "bozuk referans reddedilmeliydi").not.toBeNull();
    expect(output).toMatch(/Bozuk içerik referansı|bu-teknoloji-yok/i);
  });

  it("GEÇERSİZ ENUM reddediliyor", () => {
    writeFixture(
      "src/content/solutions/tr/__gecici-gecersiz-enum.md",
      [
        "---",
        "translationKey: gecici-gecersiz-enum",
        "locale: tr",
        "slug: gecici-gecersiz-enum",
        "status: yayinda", // geçersiz: published|draft|review|archived
        "order: 8",
        "category: core",
        "title: Geçici geçersiz enum",
        "summary: Test",
        "problem: Test",
        "approach: Test",
        "benefits:",
        "  - Test",
        "cta:",
        "  labelKey: cta.contactUs",
        "  href: /iletisim/",
        "seo:",
        "  title: Test",
        "  description: Test",
        "---",
        "",
      ].join("\n")
    );

    const output = runSync();
    expect(output, "geçersiz enum reddedilmeliydi").not.toBeNull();
    expect(output).toMatch(/status|invalid|geçersiz/i);
  });

  it("ŞEMA DIŞI ALAN reddediliyor (strict)", () => {
    writeFixture(
      "src/content/solutions/tr/__gecici-fazla-alan.md",
      [
        "---",
        "translationKey: gecici-fazla-alan",
        "locale: tr",
        "slug: gecici-fazla-alan",
        "status: draft",
        "order: 8",
        "category: core",
        "title: Geçici fazla alan",
        "summary: Test",
        "problem: Test",
        "approach: Test",
        "benefits:",
        "  - Test",
        "bilinmeyenAlan: bu şemada yok",
        "cta:",
        "  labelKey: cta.contactUs",
        "  href: /iletisim/",
        "seo:",
        "  title: Test",
        "  description: Test",
        "---",
        "",
      ].join("\n")
    );

    const output = runSync();
    expect(output, "şema dışı alan reddedilmeliydi").not.toBeNull();
  });

  it("TÜRKÇE KARAKTERLİ SLUG reddediliyor", () => {
    writeFixture(
      "src/content/solutions/tr/__gecici-turkce-slug.md",
      [
        "---",
        "translationKey: gecici-turkce-slug",
        "locale: tr",
        "slug: geçici-türkçe-slug", // ASCII değil
        "status: draft",
        "order: 8",
        "category: core",
        "title: Geçici Türkçe slug",
        "summary: Test",
        "problem: Test",
        "approach: Test",
        "benefits:",
        "  - Test",
        "cta:",
        "  labelKey: cta.contactUs",
        "  href: /iletisim/",
        "seo:",
        "  title: Test",
        "  description: Test",
        "---",
        "",
      ].join("\n")
    );

    const output = runSync();
    expect(output, "Türkçe karakterli slug reddedilmeliydi").not.toBeNull();
  });
});
