import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { productSchema } from "@lib/content/schemas";
import { PRODUCT_TOPICS, contactPathForProductTopic } from "@lib/i18n/routes";

/**
 * CYCLOPS ÜRÜN İÇERİĞİ — YAYIN GÜVENLİĞİ (S08).
 *
 * Ürün sunumu pazarlama dili taşır; site KURUMSAL ve KANITA BAĞLI kalır.
 * Bu testler, sunumdan gelen iddiaların içerik verisine sızmasını ve logo
 * izninin CyclOps dışına taşmasını engeller.
 */

const read = (relative: string): string =>
  readFileSync(fileURLToPath(new URL(`../../${relative}`, import.meta.url)), "utf8");

const products = JSON.parse(read("src/content/products/products.json")) as unknown[];
const technologies = JSON.parse(read("src/content/technologies/technologies.json")) as {
  id: string;
  name: string;
  lifecycle: string;
  logoPermission: string;
  logoPath?: string;
}[];
const manifest = JSON.parse(read("src/assets/cyclops/MANIFEST.json")) as {
  asset: string;
  sourceObject: string;
  sourceScreen: string;
  redactions: string[];
  review: string;
  sha256: string;
  size: string;
}[];

/** §8 ile onaylanan entegrasyon kümesi; dışına çıkılamaz. */
const APPROVED_INTEGRATIONS = [
  "zabbix",
  "datadog",
  "ansible",
  "opentext-oo",
  "smax",
  "freshservice",
];

/**
 * Sunumda geçen ama KANIT OLMADAN kullanılamayacak ifadeler.
 * Küçük harfe indirgenmiş içerik verisinde aranır.
 */
const FORBIDDEN_CLAIMS = [
  "every event",
  "every tool",
  "any it/ot",
  "fully autonomous",
  "self-healing",
  "self healing",
  "future-proof",
  "future proof",
  "mttr",
  "starter pack",
  "sla",
  "roi",
  "%",
  "partner",
  "iş ortağı",
  "sertifikalı",
  "müşterimiz",
  "our customers",
];

describe("ürün içeriği şemadan geçiyor", () => {
  it("her kayıt geçerli ve iki locale de var", () => {
    expect(products.length).toBe(2);
    const locales = products.map((entry) => {
      const parsed = productSchema.parse(entry);
      return parsed.locale;
    });
    expect([...locales].sort()).toEqual(["en", "tr"]);
  });

  it("akış TAM BEŞ adım ve sıra kapalı", () => {
    for (const entry of products) {
      const parsed = productSchema.parse(entry);
      expect(parsed.flow.map((step) => step.key)).toEqual([
        "signal",
        "context",
        "correlate",
        "decide",
        "act",
      ]);
    }
  });

  it("galeri en az üç GERÇEK ekran taşıyor ve her birinin alt metni var", () => {
    for (const entry of products) {
      const parsed = productSchema.parse(entry);
      expect(parsed.gallery.length).toBeGreaterThanOrEqual(3);
      for (const screen of parsed.gallery) {
        expect(screen.alt.length).toBeGreaterThan(20);
        expect(screen.caption.length).toBeGreaterThan(20);
      }
    }
  });
});

describe("kanıtsız iddia yok", () => {
  it("içerik verisinde yasak pazarlama ifadesi geçmiyor", () => {
    const text = JSON.stringify(products).toLocaleLowerCase("tr");
    for (const claim of FORBIDDEN_CLAIMS) {
      expect(text.includes(claim), `ürün içeriğinde "${claim}" geçiyor`).toBe(false);
    }
  });

  it("sürüm numarası, node sayısı veya fiyat yok", () => {
    const text = JSON.stringify(products);
    expect(text).not.toMatch(/\bv\d+\.\d+/i);
    expect(text).not.toMatch(/\b\d+\s*(node|nodes|düğüm)\b/i);
    expect(text).not.toMatch(/\b\d+\s*(usd|eur|tl|₺|\$)/i);
    // "10+ monitoring tool" gibi pazar ortalaması iddiaları.
    expect(text).not.toMatch(/\d\+\s*(monitoring|izleme|araç|tool)/i);
  });
});

describe("entegrasyon listesi", () => {
  it("yalnızca ONAYLI ve active teknolojilere referans veriyor", () => {
    const activeIds = new Set(
      technologies.filter((tech) => tech.lifecycle === "active").map((tech) => tech.id)
    );
    for (const entry of products) {
      const parsed = productSchema.parse(entry);
      const ids = parsed.technologyRefs.map((ref) => ref.id);
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) {
        expect(APPROVED_INTEGRATIONS, `${id} §8 onay listesinde yok`).toContain(id);
        expect(activeIds.has(id), `${id} active değil`).toBe(true);
      }
    }
  });
});

describe("logo izni", () => {
  it("YALNIZCA CyclOps için açıldı", () => {
    const allowed = technologies.filter((tech) => tech.logoPermission === "allowed");
    expect(allowed.map((tech) => tech.id)).toEqual(["cyclops"]);
    expect(allowed[0]?.logoPath).toBe("/brand/cyclops-wordmark.png");
  });

  it("diğer 34 kayıt hâlâ unknown", () => {
    const unknown = technologies.filter((tech) => tech.logoPermission === "unknown");
    expect(unknown.length).toBe(technologies.length - 1);
    expect(technologies.some((tech) => tech.logoPermission === "denied")).toBe(false);
  });
});

describe("ürün ekranı kaynak manifesti", () => {
  it("galerideki her asset manifestte kayıtlı", () => {
    const assets = manifest.map((row) => row.asset);
    for (const name of [
      "src/assets/cyclops/event-browser-inspector.png",
      "src/assets/cyclops/matchers-rules.png",
      "src/assets/cyclops/operational-dashboard.png",
      "public/brand/cyclops-wordmark.png",
    ]) {
      expect(assets, `${name} manifestte yok`).toContain(name);
    }
  });

  it("her kayıt kaynak slaytı, inceleme notu ve sha256 taşıyor", () => {
    for (const row of manifest) {
      expect(row.sourceObject.length).toBeGreaterThan(0);
      expect(row.sourceScreen.length).toBeGreaterThan(0);
      expect(row.review.length).toBeGreaterThan(20);
      expect(row.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(row.size).toMatch(/^\d+x\d+$/);
    }
  });

  it("redaksiyon yapılan asset'lerde ne maskelendiği yazılı", () => {
    const redacted = manifest.filter((row) => row.redactions.length > 0);
    expect(redacted.length).toBeGreaterThanOrEqual(2);
    for (const row of redacted) {
      for (const note of row.redactions) expect(note.length).toBeGreaterThan(10);
    }
  });
});

describe("ürün CTA konusu KAPALI allowlist", () => {
  it("yalnızca cyclops kabul edilir", () => {
    expect([...PRODUCT_TOPICS]).toEqual(["cyclops"]);
    expect(contactPathForProductTopic("tr", "cyclops")).toBe("/iletisim/?topic=cyclops");
    expect(contactPathForProductTopic("en", "cyclops")).toBe("/en/contact/?topic=cyclops");
  });

  it("allowlist dışındaki değer parametre ÜRETMEZ", () => {
    for (const topic of ["", "serbest", "../gizli", "<script>", "cyclops-demo"]) {
      expect(contactPathForProductTopic("tr", topic)).toBe("/iletisim/");
      expect(contactPathForProductTopic("en", topic)).toBe("/en/contact/");
    }
  });
});
