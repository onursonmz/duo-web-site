import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { homepageSchema, regionSchema } from "@lib/content/schemas";
import { isVerifiedClaim, PREVIEW, PUBLIC } from "@lib/content/selectors";
import { LOCALES } from "@lib/content/schema";

/**
 * ANA SAYFA VE BÖLGE VERİSİ — İÇERİK GÜVENLİĞİ.
 *
 * Şema seviyesinde doğrulanmamış sayısal iddia için ALAN YOKTUR; bu testler
 * verinin de o kuralı ihlal etmediğini denetler.
 */

const ROOT = process.cwd();
const readJson = <T>(relative: string): T =>
  JSON.parse(readFileSync(join(ROOT, relative), "utf8")) as T;

const homepage = readJson<unknown[]>("src/content/homepage/homepage.json");
const regions = readJson<unknown[]>("src/content/regions/regions.json");

/** Serbest metinde geçmemesi gereken doğrulanmamış iddia kalıpları. */
const FORBIDDEN_CLAIM_PATTERNS: [RegExp, string][] = [
  [/\d+\s*\+?\s*(kurumsal\s+)?(müşteri|customer|kurum)\b/i, "müşteri sayısı"],
  [/\d+\s*\+?\s*(partner|iş ortağı)\b/i, "partner sayısı"],
  [/\d+\s*\+\s*(yıl|year)/i, "kıdem iddiası"],
  [/%\s*\d+|\d+\s*%/, "yüzde iddiası"],
  [/\bMTTR\b|\bSLA\b/i, "operasyon metriği iddiası"],
];

/** Vendor/ürün adları ana sayfa metninde geçmemeli. */
const VENDOR_NAMES = [
  "zabbix",
  "grafana",
  "datadog",
  "instana",
  "opentelemetry",
  "confluent",
  "device42",
  "ardoq",
  "freshservice",
  "opentext",
  "microfocus",
  "solarwinds",
  "runzero",
  "kace",
  "jira",
  "glpi",
  "tableau",
];

/** Bir kaydın tüm metin değerlerini düz bir listeye indirir. */
function textValues(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => textValues(v, out));
  else if (value !== null && typeof value === "object") {
    Object.values(value as Record<string, unknown>).forEach((v) => textValues(v, out));
  }
  return out;
}

describe("ana sayfa içeriği — şema", () => {
  it("her locale için tam olarak bir kayıt var", () => {
    const parsed = homepage.map((r) => homepageSchema.parse(r));
    for (const locale of LOCALES) {
      expect(parsed.filter((p) => p.locale === locale)).toHaveLength(1);
    }
  });

  it("tüm kayıtlar şemayı geçiyor", () => {
    for (const record of homepage) {
      expect(() => homepageSchema.parse(record)).not.toThrow();
    }
  });

  it("ŞEMA DIŞI alan reddediliyor (strict)", () => {
    const first = homepage[0] as Record<string, unknown>;
    const withExtra = { ...first, customerCount: 50 };
    expect(homepageSchema.safeParse(withExtra).success).toBe(false);
  });

  it("Intelligence Layer TAM üç aşama zorunlu", () => {
    const first = homepage[0] as Record<string, unknown>;
    const intelligence = first["intelligence"] as Record<string, unknown>;
    const steps = intelligence["steps"] as unknown[];
    const broken = {
      ...first,
      intelligence: { ...intelligence, steps: steps.slice(0, 2) },
    };
    expect(homepageSchema.safeParse(broken).success).toBe(false);
  });
});

describe("ana sayfa içeriği — doğrulanmamış iddia yok", () => {
  it("hiçbir metin doğrulanmamış sayısal iddia içermiyor", () => {
    for (const record of homepage) {
      const parsed = homepageSchema.parse(record);
      for (const text of textValues(parsed)) {
        for (const [pattern, label] of FORBIDDEN_CLAIM_PATTERNS) {
          expect(pattern.test(text), `${parsed.locale}: ${label} -> "${text.slice(0, 80)}"`).toBe(
            false
          );
        }
      }
    }
  });

  it("hiçbir metin VENDOR/ÜRÜN adı içermiyor", () => {
    for (const record of homepage) {
      const parsed = homepageSchema.parse(record);
      const blob = textValues(parsed).join(" ").toLowerCase();
      for (const vendor of VENDOR_NAMES) {
        expect(blob.includes(vendor), `${parsed.locale}: vendor adı "${vendor}"`).toBe(false);
      }
    }
  });

  it("CyclOps teaser sürüm veya ölçüm iddiası taşımıyor", () => {
    for (const record of homepage) {
      const parsed = homepageSchema.parse(record);
      const blob = textValues(parsed.cyclops).join(" ");
      expect(blob, "sürüm numarası").not.toMatch(/\bv?\d+\.\d+/);
      expect(blob, "yüzde/metrik").not.toMatch(/%|\bMTTR\b|\bSLA\b/i);
      // Olgunluk notu ZORUNLU ve dolu.
      expect(parsed.cyclops.maturityNote.length).toBeGreaterThan(20);
    }
  });

  it("CTA hedefleri yalnızca kök-göreli yol veya çapa", () => {
    for (const record of homepage) {
      const parsed = homepageSchema.parse(record);
      const targets = [
        parsed.hero.primaryCta.href,
        parsed.hero.secondaryCta.href,
        parsed.roadmap.primaryCta.href,
        parsed.roadmap.secondaryCta.href,
      ];
      for (const href of targets) {
        expect(
          href.startsWith("/") || href.startsWith("#"),
          `harici veya göreli CTA hedefi: ${href}`
        ).toBe(true);
      }
    }
  });

  it("ana sayfa NOINDEX olarak işaretli", () => {
    for (const record of homepage) {
      expect(homepageSchema.parse(record).seo.noindex).toBe(true);
    }
  });
});

describe("bölgeler — public görünürlük doğrulamaya bağlı", () => {
  it("tüm kayıtlar şemayı geçiyor", () => {
    for (const record of regions) {
      expect(() => regionSchema.parse(record)).not.toThrow();
    }
  });

  it("her bölgenin doğrulama kaynağı kayıtlı", () => {
    for (const record of regions) {
      expect(regionSchema.parse(record).source.length).toBeGreaterThan(10);
    }
  });

  it("ŞU AN hiçbir bölge doğrulanmadı: public'te HİÇBİRİ görünmez", () => {
    const parsed = regions.map((r) => regionSchema.parse(r));
    const visible = parsed.filter((r) => isVerifiedClaim(r.verificationStatus, PUBLIC));
    expect(visible).toEqual([]);
  });

  it("doğrulandığında KOD DEĞİŞİKLİĞİ olmadan görünür olur", () => {
    // Aynı seçici mantığı, tek fark kaydın statüsü.
    expect(isVerifiedClaim("verified", PUBLIC)).toBe(true);
    expect(isVerifiedClaim("pending", PUBLIC)).toBe(false);
    // Preview modda pending görülebilir; public'te asla.
    expect(isVerifiedClaim("pending", PREVIEW)).toBe(true);
  });
});
