import { describe, expect, it } from "vitest";
import {
  FORBIDDEN_LD_KEYS,
  blogPostingLd,
  breadcrumbLd,
  ldOrigin,
  organizationLd,
  serviceLd,
  softwareApplicationLd,
} from "../../src/lib/seo/structuredData";

/**
 * STRUCTURED DATA TESTLERİ (S13).
 *
 * İki ayrı kapı:
 *   1. PARSE — her blok geçerli JSON'a serileşir ve geri okunur.
 *   2. SEMANTİK — `@context`/`@type` doğru, URL'ler mutlak ve canonical ile
 *      aynı, dil alanı sayfayla uyumlu, YASAK alanlar (uydurma sosyal hesap,
 *      müşteri sayısı, partnerlik, fiyat, değerlendirme) HİÇ YOK.
 */

const ORIGIN = "https://duosis.com";

const ORGANIZATION = organizationLd({
  siteUrl: ORIGIN,
  name: "Duosis",
  description: "Kurumsal BT operasyonlarında görünürlük ve otomasyon.",
  logoUrl: `${ORIGIN}/brand/duosis-logo.svg`,
  email: "info@duosis.com",
  telephones: ["0(216) 999 98 57"],
});

const SERVICE = serviceLd({
  siteUrl: ORIGIN,
  path: "/hizmetler/",
  slug: "training",
  name: "Eğitim",
  description: "Kurulu sistemin ekipçe çalıştırılabilmesi için bilgi aktarımı.",
  locale: "tr",
});

const BREADCRUMB = breadcrumbLd(ORIGIN, [
  { name: "Ana sayfa", path: "/" },
  { name: "Çözümler", path: "/cozumler/" },
  { name: "Operasyonel görünürlük" },
]);

const ARTICLE = blogPostingLd({
  siteUrl: ORIGIN,
  path: "/icgoruler/veri-akisi-tasarimi/",
  headline: "Veri akışı tasarımı",
  description: "Olay akışını uçtan uca tasarlarken karşılaşılan seçimler.",
  locale: "tr",
  datePublished: "2026-03-04",
  dateModified: "2026-05-19",
  authorName: "Duosis Mühendislik Ekibi",
  articleSection: "Veri ve yapay zekâ",
  keywords: ["data-flow", "integration"],
});

const SOFTWARE = softwareApplicationLd({
  siteUrl: ORIGIN,
  path: "/cyclops/",
  name: "CyclOps",
  description: "Olay yaşam döngüsünü tek yerden yöneten operasyon uygulaması.",
  locale: "tr",
});

const ALL_BLOCKS: ReadonlyArray<readonly [string, Record<string, unknown>]> = [
  ["Organization", ORGANIZATION],
  ["Service", SERVICE],
  ["BreadcrumbList", BREADCRUMB],
  ["BlogPosting", ARTICLE],
  ["SoftwareApplication", SOFTWARE],
];

/** Bir nesnedeki tüm anahtarları (iç içe dahil) toplar. */
function allKeys(value: unknown, into: Set<string> = new Set()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) allKeys(item, into);
    return into;
  }
  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      into.add(key);
      allKeys(child, into);
    }
  }
  return into;
}

/** Bir nesnedeki tüm string değerleri (iç içe dahil) toplar. */
function allStrings(value: unknown, into: string[] = []): string[] {
  if (typeof value === "string") into.push(value);
  else if (Array.isArray(value)) for (const item of value) allStrings(item, into);
  else if (value !== null && typeof value === "object")
    for (const child of Object.values(value)) allStrings(child, into);
  return into;
}

describe("structured data — parse", () => {
  for (const [label, block] of ALL_BLOCKS) {
    it(`${label} bloğu geçerli JSON'a serileşir ve geri okunur`, () => {
      const serialized = JSON.stringify(block);
      expect(() => JSON.parse(serialized)).not.toThrow();
      expect(JSON.parse(serialized)).toEqual(block);
    });

    it(`${label} bloğu HTML script içine güvenle gömülebilir`, () => {
      // `</script>` veya `<!--` içeren bir değer script bloğunu kırar.
      const serialized = JSON.stringify(block);
      expect(serialized).not.toContain("</");
      expect(serialized).not.toContain("<!--");
    });

    it(`${label} bloğu null veya tanımsız değer taşımaz`, () => {
      const serialized = JSON.stringify(block);
      expect(serialized).not.toContain("null");
      expect(serialized).not.toContain("undefined");
    });
  }
});

describe("structured data — semantik", () => {
  for (const [label, block] of ALL_BLOCKS) {
    it(`${label} bloğu @context ve @type taşır`, () => {
      expect(block["@context"]).toBe("https://schema.org");
      expect(typeof block["@type"]).toBe("string");
    });

    it(`${label} bloğunda YASAK alan yok`, () => {
      const keys = allKeys(block);
      for (const forbidden of FORBIDDEN_LD_KEYS) {
        expect(keys.has(forbidden)).toBe(false);
      }
    });

    it(`${label} bloğundaki tüm URL'ler mutlak ve üretim kökeninde`, () => {
      const urls = allStrings(block).filter((value) => /^https?:/i.test(value));
      expect(urls.length).toBeGreaterThan(0);
      for (const url of urls) {
        // schema.org bağlamı hariç her URL site kökeninde olmalı.
        if (url === "https://schema.org") continue;
        expect(url.startsWith(`${ORIGIN}/`)).toBe(true);
        expect(url).not.toContain("localhost");
        expect(url).not.toContain("127.0.0.1");
      }
    });
  }

  it("Organization yalnızca sayfada görünen iletişim bilgisini taşır", () => {
    expect(ORGANIZATION["@type"]).toBe("Organization");
    expect(ORGANIZATION["@id"]).toBe(`${ORIGIN}/#organization`);
    expect(ORGANIZATION["url"]).toBe(`${ORIGIN}/`);
    expect(ORGANIZATION["email"]).toBe("info@duosis.com");
    expect(ORGANIZATION["telephone"]).toEqual(["0(216) 999 98 57"]);
  });

  it("Organization uydurma sosyal hesap iddia etmez", () => {
    // `sameAs` doğrulanmış hesap olmadan ASLA yazılmaz.
    expect(Object.keys(ORGANIZATION)).not.toContain("sameAs");
  });

  it("Service sağlayıcı olarak Organization'a referans verir", () => {
    expect(SERVICE["@type"]).toBe("Service");
    expect(SERVICE["provider"]).toEqual({ "@id": `${ORIGIN}/#organization` });
    expect(SERVICE["url"]).toBe(`${ORIGIN}/hizmetler/`);
    expect(SERVICE["inLanguage"]).toBe("tr");
  });

  it("aynı sayfadaki farklı hizmetler ayrı @id alır", () => {
    const other = serviceLd({
      siteUrl: ORIGIN,
      path: "/hizmetler/",
      slug: "danismanlik",
      name: "Danışmanlık",
      description: "Mevcut kurulumun gözden geçirilmesi.",
      locale: "tr",
    });
    expect(other["@id"]).not.toBe(SERVICE["@id"]);
    expect(SERVICE["@id"]).toBe(`${ORIGIN}/hizmetler/#service-training`);
  });

  it("BreadcrumbList konumları 1'den başlar ve artar", () => {
    const items = BREADCRUMB["itemListElement"] as Array<Record<string, unknown>>;
    expect(items).toHaveLength(3);
    items.forEach((item, index) => {
      expect(item["@type"]).toBe("ListItem");
      expect(item["position"]).toBe(index + 1);
      expect(typeof item["name"]).toBe("string");
    });
  });

  it("BreadcrumbList son öğesi (mevcut sayfa) bağlantı taşımaz", () => {
    const items = BREADCRUMB["itemListElement"] as Array<Record<string, unknown>>;
    const last = items[items.length - 1];
    expect(last).toBeDefined();
    expect(Object.keys(last as object)).not.toContain("item");
    expect(items[0]?.["item"]).toBe(`${ORIGIN}/`);
  });

  it("BlogPosting tarihleri ISO biçiminde ve sıralı", () => {
    expect(ARTICLE["@type"]).toBe("BlogPosting");
    const published = ARTICLE["datePublished"] as string;
    const modified = ARTICLE["dateModified"] as string;
    expect(published).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(modified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Date.parse(modified)).toBeGreaterThanOrEqual(Date.parse(published));
  });

  it("BlogPosting mainEntityOfPage canonical ile aynı", () => {
    const url = `${ORIGIN}/icgoruler/veri-akisi-tasarimi/`;
    expect(ARTICLE["url"]).toBe(url);
    expect(ARTICLE["mainEntityOfPage"]).toEqual({ "@type": "WebPage", "@id": url });
    expect(ARTICLE["@id"]).toBe(`${url}#article`);
  });

  it("BlogPosting güncelleme tarihi yoksa dateModified HİÇ yazılmaz", () => {
    const withoutUpdate = blogPostingLd({
      siteUrl: ORIGIN,
      path: "/icgoruler/x/",
      headline: "X",
      description: "X",
      locale: "tr",
      datePublished: "2026-01-01",
      authorName: "Duosis Mühendislik Ekibi",
    });
    expect(Object.keys(withoutUpdate)).not.toContain("dateModified");
    // Seri ve etiket sayfada yoksa alanlar HİÇ yazılmaz.
    expect(Object.keys(withoutUpdate)).not.toContain("articleSection");
    expect(Object.keys(withoutUpdate)).not.toContain("keywords");
  });

  it("BlogPosting yazarı ortak imza olduğunda Organization tipindedir", () => {
    // Yazar kaydı bir EKİP; uydurma bir gerçek kişi adı iddia edilmez.
    expect(ARTICLE["author"]).toEqual({
      "@type": "Organization",
      name: "Duosis Mühendislik Ekibi",
    });
  });

  it("BlogPosting seri ve etiketleri sayfada görünen değerlerdir", () => {
    expect(ARTICLE["articleSection"]).toBe("Veri ve yapay zekâ");
    expect(ARTICLE["keywords"]).toBe("data-flow, integration");
  });

  it("SoftwareApplication sürüm, fiyat ve değerlendirme iddia etmez", () => {
    expect(SOFTWARE["@type"]).toBe("SoftwareApplication");
    expect(SOFTWARE["applicationCategory"]).toBe("BusinessApplication");
    const keys = Object.keys(SOFTWARE);
    expect(keys).not.toContain("softwareVersion");
    expect(keys).not.toContain("offers");
    expect(keys).not.toContain("aggregateRating");
    expect(keys).not.toContain("operatingSystem");
  });

  it("dil alanı yalnızca desteklenen iki dilden biri", () => {
    for (const block of [SERVICE, ARTICLE, SOFTWARE]) {
      expect(["tr", "en"]).toContain(block["inLanguage"]);
    }
  });

  it("İngilizce bloklar Türkçe dil etiketi taşımaz", () => {
    const en = serviceLd({
      siteUrl: ORIGIN,
      path: "/en/services/",
      slug: "training",
      name: "Training",
      description: "Hands-on knowledge transfer.",
      locale: "en",
    });
    expect(en["inLanguage"]).toBe("en");
    expect(en["url"]).toBe(`${ORIGIN}/en/services/`);
  });
});

describe("YASAK alan dedektörü kendini kanıtlar", () => {
  /*
   * Bir kapının işe yaradığını iddia etmek yetmez: dedektör KASITLI olarak
   * bozulmuş bir blokta gerçekten yakalamalı. Aksi hâlde yukarıdaki
   * "YASAK alan yok" testleri boş güvence olurdu.
   */
  it("iç içe gömülü sameAs alanını yakalar", () => {
    const violating = {
      "@context": "https://schema.org",
      "@type": "Organization",
      publisher: { name: "Duosis", sameAs: ["https://example.com/duosis"] },
    };
    expect(allKeys(violating).has("sameAs")).toBe(true);
  });

  it("dizi içindeki aggregateRating alanını yakalar", () => {
    const violating = {
      "@type": "Service",
      itemListElement: [{ "@type": "ListItem", aggregateRating: { ratingValue: 5 } }],
    };
    expect(allKeys(violating).has("aggregateRating")).toBe(true);
  });

  it("temiz bloklarda yanlış alarm vermez", () => {
    for (const [, block] of ALL_BLOCKS) {
      expect(allKeys(block).has("sameAs")).toBe(false);
    }
  });
});

describe("ldOrigin", () => {
  it("Astro.site tanımlıysa onu kullanır", () => {
    const origin = ldOrigin(new URL("https://duosis.com/"), new URL("http://localhost:4321/x/"));
    expect(origin).toBe("https://duosis.com");
  });

  it("Astro.site yoksa isteğin kökenine düşer", () => {
    const origin = ldOrigin(undefined, new URL("http://localhost:4321/x/"));
    expect(origin).toBe("http://localhost:4321");
  });

  it("alt yol taşıyan site değerinden yalnızca köken alınır", () => {
    const origin = ldOrigin(new URL("https://duosis.com/alt/"), new URL("https://duosis.com/x/"));
    expect(origin).toBe("https://duosis.com");
  });
});
