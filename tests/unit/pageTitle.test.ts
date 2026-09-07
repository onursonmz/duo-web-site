import { describe, expect, it } from "vitest";
import { buildPageTitle, TITLE_MAX_LENGTH } from "@lib/seo/pageTitle";

describe("buildPageTitle", () => {
  it("sayfa ve site adını ayraçla birleştirir", () => {
    expect(buildPageTitle({ pageTitle: "Çözümler", siteName: "Duosis" })).toBe("Çözümler | Duosis");
  });

  it("sayfa başlığı yoksa yalnızca site adını döndürür", () => {
    expect(buildPageTitle({ pageTitle: undefined, siteName: "Duosis" })).toBe("Duosis");
    expect(buildPageTitle({ pageTitle: "   ", siteName: "Duosis" })).toBe("Duosis");
  });

  it("marka adını tekrarlamaz (S00 bulgusu: 'Duosis - Duosis')", () => {
    expect(buildPageTitle({ pageTitle: "Duosis", siteName: "Duosis" })).toBe("Duosis");
    expect(buildPageTitle({ pageTitle: "duosis", siteName: "Duosis" })).toBe("Duosis");
  });

  it("baştaki ve sondaki boşlukları kırpar", () => {
    expect(buildPageTitle({ pageTitle: "  İletişim  ", siteName: " Duosis " })).toBe(
      "İletişim | Duosis"
    );
  });

  it("üst sınırı aşan başlığı kısaltır ve site adını korur", () => {
    const uzun = "Altyapınızın tamamını tek görünümde yönetin ve operasyonu görün";
    const sonuc = buildPageTitle({ pageTitle: uzun, siteName: "Duosis" });

    expect(sonuc.length).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
    expect(sonuc.endsWith(" | Duosis")).toBe(true);
    expect(sonuc).toContain("…");
  });

  it("özel maxLength değerine uyar", () => {
    const sonuc = buildPageTitle({
      pageTitle: "Configuration Management",
      siteName: "Duosis",
      maxLength: 20,
    });

    expect(sonuc.length).toBeLessThanOrEqual(20);
    expect(sonuc.endsWith(" | Duosis")).toBe(true);
  });

  it("site adı tek başına sınırı doldurduğunda sayfa kısmını düşürür", () => {
    expect(buildPageTitle({ pageTitle: "Çözümler", siteName: "Duosis", maxLength: 6 })).toBe(
      "Duosis"
    );
  });
});
