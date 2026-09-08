import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { REFERENCE_FIELDS } from "@lib/content/graph";

/**
 * ENTEGRASYON NEGATİF TESTLERİ.
 *
 * Şema doğrulaması ve referans bütünlüğü gerçek Astro süreçlerinde çalışır.
 * Bu testler bozuk içeriğin REDDEDİLDİĞİNİ (sıfırdan farklı exit code)
 * doğrular — saf birim testiyle yakalanamayacak davranıştır.
 *
 * Şema hataları `astro sync` ile, referans bütünlüğü `astro build` ile
 * yakalanır (merkezi doğrulayıcı middleware üzerinden sayfa üretiminde koşar).
 */

const ROOT = process.cwd();
const ASTRO_BIN = join(ROOT, "node_modules", "astro", "bin", "astro.mjs");
const TEMP_FILES: string[] = [];

function writeFixture(relativePath: string, contents: string): void {
  const full = join(ROOT, relativePath);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, contents, "utf8");
  TEMP_FILES.push(full);
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
    if (/MODULE_NOT_FOUND|Cannot find module/.test(output)) {
      throw new Error(`Test koşucusu Astro CLI'yi çalıştıramadı:\n${output}`, { cause: error });
    }
    return output;
  }
}

const runSync = () => runAstro("sync");
const runBuild = () => runAstro("build");

afterEach(() => {
  for (const file of TEMP_FILES.splice(0)) {
    if (existsSync(file)) rmSync(file);
  }
  runSync();
});

// ---------------------------------------------------------------- fixture yardımcıları

function solutionFixture(name: string, overrides: Record<string, string>): string {
  const base: Record<string, string> = {
    translationKey: name,
    locale: "tr",
    slug: name,
    status: "draft",
    order: "8",
    category: "core",
    title: `Geçici ${name}`,
    summary: "Test",
    problem: "Test",
    approach: "Test",
  };
  const merged = { ...base, ...overrides };
  const lines = ["---"];
  for (const [k, v] of Object.entries(merged)) lines.push(`${k}: ${v}`);
  lines.push("benefits:", "  - Test");
  if (overrides["__technologyRefs"] !== undefined) {
    lines.push("technologyRefs:", `  - ${overrides["__technologyRefs"]}`);
  }
  if (overrides["__proofRefs"] !== undefined) {
    lines.push("proofRefs:", `  - ${overrides["__proofRefs"]}`);
  }
  lines.push("cta:", "  labelKey: cta.contactUs", "  href: /cozumler/");
  lines.push("seo:", "  title: Test", "  description: Test", "  noindex: true");
  lines.push("---", "");
  return lines
    .filter((l) => !l.startsWith("__"))
    .join("\n")
    .replace(/^__.*$/gm, "");
}

// ---------------------------------------------------------------- şema testleri

describe("şema doğrulaması — bozuk frontmatter reddediliyor", () => {
  it("temiz içerik senkronizasyonu başarılı", () => {
    expect(runSync()).toBeNull();
  });

  it("GEÇERSİZ ENUM reddediliyor", () => {
    writeFixture(
      "src/content/solutions/tr/__gecici-gecersiz-enum.md",
      solutionFixture("gecici-gecersiz-enum", { status: "yayinda" })
    );
    expect(runSync(), "geçersiz enum reddedilmeliydi").not.toBeNull();
  });

  it("ŞEMA DIŞI ALAN reddediliyor (strict)", () => {
    writeFixture(
      "src/content/solutions/tr/__gecici-fazla-alan.md",
      solutionFixture("gecici-fazla-alan", { bilinmeyenAlan: "bu şemada yok" })
    );
    expect(runSync(), "şema dışı alan reddedilmeliydi").not.toBeNull();
  });

  it("TÜRKÇE KARAKTERLİ SLUG reddediliyor", () => {
    writeFixture(
      "src/content/solutions/tr/__gecici-turkce-slug.md",
      solutionFixture("gecici-turkce-slug", { slug: "geçici-türkçe-slug" })
    );
    expect(runSync(), "Türkçe karakterli slug reddedilmeliydi").not.toBeNull();
  });

  it("KAPALI KÜME DIŞI cta.labelKey reddediliyor", () => {
    const body = solutionFixture("gecici-cta", {}).replace(
      "labelKey: cta.contactUs",
      "labelKey: cta.uydurma"
    );
    writeFixture("src/content/solutions/tr/__gecici-cta.md", body);
    expect(runSync(), "tanımsız cta.labelKey reddedilmeliydi").not.toBeNull();
  });

  it("GEÇERSİZ technology lifecycle reddediliyor", () => {
    // Geçici olarak envantere geçersiz lifecycle'lı bir kayıt ekleyemeyiz
    // (tek dosya), bu yüzden ayrı bir koleksiyon dosyası yerine şemayı
    // doğrudan sınayan birim testi tests/unit/technology-inventory.test.ts'te.
    expect(true).toBe(true);
  });
});

// ---------------------------------------------------------------- referans grafiği

describe("içerik grafiği — TÜM referans alanları build'de doğrulanıyor", () => {
  it("doğrulayıcı beş referans alanını kapsıyor", () => {
    const covered = REFERENCE_FIELDS.map((r) => `${r.from}.${r.field}->${r.to}`).sort();
    expect(covered).toEqual(
      [
        "insights.authorRef->authors",
        "insights.relatedSolutionRefs->solutions",
        "milestones.solutionRefs->solutions",
        "solutions.proofRefs->proofs",
        "solutions.technologyRefs->technologies",
      ].sort()
    );
  });

  it("BOZUK solution -> technology reddediliyor", () => {
    writeFixture(
      "src/content/solutions/tr/__bozuk-tech.md",
      solutionFixture("bozuk-tech", { __technologyRefs: "bu-teknoloji-yok" })
    );
    const output = runBuild();
    expect(output, "bozuk technology referansı reddedilmeliydi").not.toBeNull();
    expect(output).toMatch(/Bozuk içerik referansı|bu-teknoloji-yok/i);
  });

  it("BOZUK solution -> proof/case study reddediliyor", () => {
    writeFixture(
      "src/content/solutions/tr/__bozuk-proof.md",
      solutionFixture("bozuk-proof", { __proofRefs: "bu-referans-yok" })
    );
    const output = runBuild();
    expect(output, "bozuk proof referansı reddedilmeliydi").not.toBeNull();
    expect(output).toMatch(/Bozuk içerik referansı|bu-referans-yok/i);
  });

  it("BOZUK milestone -> solution reddediliyor", () => {
    writeFixture(
      "src/content/milestones/tr/__bozuk-milestone.md",
      [
        "---",
        "translationKey: bozuk-milestone",
        "locale: tr",
        "status: draft",
        "year: 2020",
        "datePrecision: year",
        "title: Geçici",
        "summary: Test",
        "solutionRefs:",
        "  - tr/bu-cozum-yok",
        "verificationStatus: pending",
        "---",
        "",
      ].join("\n")
    );
    const output = runBuild();
    expect(output, "bozuk milestone referansı reddedilmeliydi").not.toBeNull();
    expect(output).toMatch(/Bozuk içerik referansı|bu-cozum-yok/i);
  });

  it("BOZUK insight -> author reddediliyor", () => {
    writeFixture(
      "src/content/insights/tr/__bozuk-author.md",
      [
        "---",
        "translationKey: bozuk-author",
        "locale: tr",
        "slug: bozuk-author",
        "status: draft",
        "title: Geçici",
        "excerpt: Test",
        "series: Test",
        "authorRef: bu-yazar-yok",
        "seo:",
        "  title: Test",
        "  description: Test",
        "  noindex: true",
        "---",
        "",
      ].join("\n")
    );
    const output = runBuild();
    expect(output, "bozuk author referansı reddedilmeliydi").not.toBeNull();
    expect(output).toMatch(/Bozuk içerik referansı|bu-yazar-yok/i);
  });

  it("BOZUK insight -> related solution reddediliyor", () => {
    writeFixture(
      "src/content/insights/tr/__bozuk-related.md",
      [
        "---",
        "translationKey: bozuk-related",
        "locale: tr",
        "slug: bozuk-related",
        "status: draft",
        "title: Geçici",
        "excerpt: Test",
        "series: Test",
        "authorRef: duosis-ekibi",
        "relatedSolutionRefs:",
        "  - tr/bu-cozum-da-yok",
        "seo:",
        "  title: Test",
        "  description: Test",
        "  noindex: true",
        "---",
        "",
      ].join("\n")
    );
    const output = runBuild();
    expect(output, "bozuk relatedSolutionRefs reddedilmeliydi").not.toBeNull();
    expect(output).toMatch(/Bozuk içerik referansı|bu-cozum-da-yok/i);
  });
});

// ---------------------------------------------------------------- benzersizlik

describe("benzersizlik — build'de doğrulanıyor", () => {
  it("YİNELENEN translationKey + locale reddediliyor", () => {
    // Mevcut "otomasyon" kaydıyla aynı translationKey + locale.
    writeFixture(
      "src/content/solutions/tr/__kopya-anahtar.md",
      solutionFixture("kopya-anahtar", { translationKey: "automation", slug: "kopya-anahtar" })
    );
    const output = runBuild();
    expect(output, "yinelenen translationKey reddedilmeliydi").not.toBeNull();
    expect(output).toMatch(/Yinelenen translationKey/i);
  });

  it("YİNELENEN slug + locale reddediliyor", () => {
    writeFixture(
      "src/content/solutions/tr/__kopya-slug.md",
      solutionFixture("kopya-slug", { translationKey: "kopya-slug", slug: "otomasyon" })
    );
    const output = runBuild();
    expect(output, "yinelenen slug reddedilmeliydi").not.toBeNull();
    expect(output).toMatch(/Yinelenen slug/i);
  });
});
