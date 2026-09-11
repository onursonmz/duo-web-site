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
    expect(products.length).toBe(8);
    const locales = products.map((entry) => {
      const parsed = productSchema.parse(entry);
      return parsed.locale;
    });
    // Her ürün İKİ dilde de var: dört ürün × iki locale.
    expect([...new Set(locales)].sort()).toEqual(["en", "tr"]);
    const slugs = products.map((entry) => productSchema.parse(entry).slug);
    expect([...new Set(slugs)].sort()).toEqual(["cyclops", "hermes", "logislot", "ravskald"]);
    for (const slug of new Set(slugs)) {
      expect(
        slugs.filter((value) => value === slug),
        `${slug} iki dilde olmalı`
      ).toHaveLength(2);
    }
  });

  /*
   * S14: akış bloğu CyclOps'a ÖZELDİR.
   *
   * Beş aşamalı sinyal→aksiyon zinciri CyclOps'un çalışma modelidir; Hermes,
   * LogiSlot ve RAVSKALD'ın işleyişi farklıdır. Bu yüzden kural "her üründe
   * beş adım" değil, "akış bloğu VARSA tam beş adım ve sıra kapalı" olarak
   * daraltıldı.
   */
  it("akış bloğu varsa TAM BEŞ adım ve sıra kapalı", () => {
    let checked = 0;
    for (const entry of products) {
      const parsed = productSchema.parse(entry);
      if (parsed.flow === undefined) continue;
      expect(parsed.flow.map((step) => step.key)).toEqual([
        "signal",
        "context",
        "correlate",
        "decide",
        "act",
      ]);
      checked += 1;
    }
    expect(checked, "hiçbir üründe akış bloğu bulunamadı").toBeGreaterThan(0);
  });

  it("galeri VARSA her ekranın alt metni ve açıklaması dolu", () => {
    let checked = 0;
    for (const entry of products) {
      const parsed = productSchema.parse(entry);
      if (parsed.gallery === undefined) continue;
      expect(parsed.gallery.length).toBeGreaterThanOrEqual(1);
      for (const screen of parsed.gallery) {
        expect(screen.alt.length).toBeGreaterThan(20);
        expect(screen.caption.length).toBeGreaterThan(20);
      }
      checked += 1;
    }
    expect(checked, "hiçbir üründe galeri bulunamadı").toBeGreaterThan(0);
  });

  /*
   * GALERİSİ OLMAYAN ÜRÜN SESSİZCE BOŞ KALMAZ.
   *
   * Yayımlanabilir ekranı olmayan ürün, bunun yerine bir süreç
   * görselleştirmesi göstermek ZORUNDADIR ve bunun bir ürün ekranı olmadığını
   * ziyaretçiye açıkça söylemelidir.
   */
  it("galerisi olmayan ürün süreç görselleştirmesi açıklaması taşıyor", () => {
    for (const entry of products) {
      const parsed = productSchema.parse(entry);
      if (parsed.gallery !== undefined) continue;
      expect(parsed.diagramTitle, `${parsed.id} diagramTitle taşımalı`).toBeDefined();
      expect(parsed.diagramNote, `${parsed.id} diagramNote taşımalı`).toBeDefined();
      expect(parsed.diagramNote ?? "").toMatch(/SÜREÇ GÖRSELLEŞTİRMESİ|PROCESS VISUALISATION/);
    }
  });
});

/**
 * TEK KELİMELİK TERİMLER KELİME SINIRIYLA ARANIR.
 *
 * Alt dize taraması yanlış pozitif üretiyordu: Türkçe "asla" kelimesi "sla"
 * içeriyor ve LogiSlot'un dürüst güvenlik cümlesini ("...asla birleşmez")
 * yasak iddia sayıyordu. Kural GEVŞETİLMEDİ — daha DOĞRU aranıyor. Aynı
 * düzeltme `tests/e2e/public-voice.spec.ts` içinde de yapılmıştı.
 *
 * Çok kelimeli ifadeler ("every event", "iş ortağı") alt dize olarak aranmaya
 * devam eder; onlarda yanlış pozitif riski yok.
 */
const WORD_BOUNDED_CLAIMS = new Set(["sla", "roi", "mttr", "partner", "sertifikalı"]);

function claimAppears(text: string, claim: string): boolean {
  if (!WORD_BOUNDED_CLAIMS.has(claim)) return text.includes(claim);
  // Türkçe ekler yakalanmaya devam etsin diye sınır YALNIZCA kelimenin başına.
  return new RegExp(String.raw`(?<![\p{L}\p{N}])` + claim, "u").test(text);
}

describe("kanıtsız iddia yok", () => {
  it("içerik verisinde yasak pazarlama ifadesi geçmiyor", () => {
    const text = JSON.stringify(products).toLocaleLowerCase("tr");
    for (const claim of FORBIDDEN_CLAIMS) {
      expect(claimAppears(text, claim), `ürün içeriğinde "${claim}" geçiyor`).toBe(false);
    }
  });

  it("kelime sınırı kontrolü KENDİNİ KANITLAR", () => {
    // Gerçek ihlal hâlâ yakalanmalı; yoksa yukarıdaki test boş güvence olurdu.
    expect(claimAppears("hedefimiz %99 sla taahhüdü", "sla")).toBe(true);
    expect(claimAppears("sla taahhüdü veriyoruz", "sla")).toBe(true);
    // Türkçe "asla" yanlış pozitif ÜRETMEMELİ.
    expect(claimAppears("bu iki uzay asla birleşmez", "sla")).toBe(false);
    expect(claimAppears("kesinlikle asla", "sla")).toBe(false);
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
      /*
       * S14: entegrasyon listesi CyclOps'a özeldir; diğer üç ürün için
       * doğrulanmış bir teknoloji envanteri henüz yok. Kural "her üründe
       * referans olsun" değil, "REFERANS VARSA onaylı ve active olsun".
       */
      const ids = parsed.technologyRefs.map((ref) => ref.id);
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
  it("yalnızca dört ürün kabul edilir", () => {
    // Küme KAPALI: ürün eklendiğinde burası da bilinçli olarak güncellenir.
    expect([...PRODUCT_TOPICS]).toEqual(["cyclops", "hermes", "logislot", "ravskald"]);
    for (const topic of PRODUCT_TOPICS) {
      expect(contactPathForProductTopic("tr", topic)).toBe(`/iletisim/?topic=${topic}`);
      expect(contactPathForProductTopic("en", topic)).toBe(`/en/contact/?topic=${topic}`);
    }
  });

  it("her ürünün CTA konusu KENDİ slug'ı", () => {
    // Yanlış eşleşme, ziyaretçiyi başka bir ürünün konusuyla forma taşırdı.
    for (const entry of products) {
      const parsed = productSchema.parse(entry);
      expect(parsed.cta.topic, `${parsed.id} CTA konusu`).toBe(parsed.slug);
    }
  });

  it("allowlist dışındaki değer parametre ÜRETMEZ", () => {
    for (const topic of ["", "serbest", "../gizli", "<script>", "cyclops-demo"]) {
      expect(contactPathForProductTopic("tr", topic)).toBe("/iletisim/");
      expect(contactPathForProductTopic("en", topic)).toBe("/en/contact/");
    }
  });
});
