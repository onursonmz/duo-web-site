import { describe, expect, it } from "vitest";
import { X_DEFAULT_LOCALE, hreflangLinks } from "../../src/lib/seo/hreflang";

/**
 * HREFLANG TESTLERİ (S13).
 *
 * En kritik testler NEGATİF olanlardır: gerçek çevirisi olmayan bir sayfa
 * için hreflang ÜRETİLMEMELİ. Sahte hreflang, olmayan bir sayfayı vaat eder.
 */

describe("hreflang — çok dilli sayfa", () => {
  const links = hreflangLinks("tr", "/cozumler/operasyonel-gorunurluk/", {
    en: "/en/solutions/operational-visibility/",
  });

  it("kendi dilini de bildirir (karşılıklılık)", () => {
    expect(links.find((l) => l.hreflang === "tr")?.href).toBe("/cozumler/operasyonel-gorunurluk/");
  });

  it("var olan çeviriyi bildirir", () => {
    expect(links.find((l) => l.hreflang === "en")?.href).toBe(
      "/en/solutions/operational-visibility/"
    );
  });

  it("x-default Türkçe sürümü gösterir", () => {
    expect(X_DEFAULT_LOCALE).toBe("tr");
    expect(links.find((l) => l.hreflang === "x-default")?.href).toBe(
      "/cozumler/operasyonel-gorunurluk/"
    );
  });

  it("tam olarak üç etiket üretir", () => {
    expect(links.map((l) => l.hreflang)).toEqual(["tr", "en", "x-default"]);
  });

  it("İngilizce sayfadan bakıldığında küme AYNIDIR (karşılıklı)", () => {
    const fromEn = hreflangLinks("en", "/en/solutions/operational-visibility/", {
      tr: "/cozumler/operasyonel-gorunurluk/",
    });
    const asPairs = (input: ReturnType<typeof hreflangLinks>): Record<string, string> =>
      Object.fromEntries(input.map((l) => [l.hreflang, l.href]));
    expect(asPairs(fromEn)).toEqual(asPairs(links));
  });
});

describe("hreflang — sahte çeviri üretilmez", () => {
  it("çevirisi olmayan Türkçe sayfa HİÇ hreflang üretmez", () => {
    expect(hreflangLinks("tr", "/aydinlatma-metni/", {})).toEqual([]);
  });

  it("çevirisi olmayan İngilizce sayfa HİÇ hreflang üretmez", () => {
    expect(hreflangLinks("en", "/en/privacy-notice/", {})).toEqual([]);
  });

  it("boş dizeli alternatif çeviri sayılmaz", () => {
    expect(hreflangLinks("tr", "/cozumler/x/", { en: "" })).toEqual([]);
  });

  it("tek dilli sayfada x-default de yazılmaz", () => {
    const links = hreflangLinks("tr", "/cozumler/x/", {});
    expect(links.some((l) => l.hreflang === "x-default")).toBe(false);
  });
});

describe("hreflang — canonical ile çelişmez", () => {
  it("kendi dili için canonical yolu kazanır, alternates'teki değer değil", () => {
    const links = hreflangLinks("tr", "/cozumler/yeni-slug/", {
      tr: "/cozumler/eski-slug/",
      en: "/en/solutions/new-slug/",
    });
    expect(links.find((l) => l.hreflang === "tr")?.href).toBe("/cozumler/yeni-slug/");
    expect(links.find((l) => l.hreflang === "x-default")?.href).toBe("/cozumler/yeni-slug/");
  });

  it("x-default her zaman tr etiketiyle aynı adresi gösterir", () => {
    const links = hreflangLinks("en", "/en/insights/x/", { tr: "/icgoruler/x/" });
    const tr = links.find((l) => l.hreflang === "tr")?.href;
    const def = links.find((l) => l.hreflang === "x-default")?.href;
    expect(tr).toBe("/icgoruler/x/");
    expect(def).toBe(tr);
  });

  it("etiketler tekrar etmez", () => {
    const links = hreflangLinks("tr", "/a/", { tr: "/a/", en: "/en/a/" });
    const seen = links.map((l) => l.hreflang);
    expect(new Set(seen).size).toBe(seen.length);
  });
});
