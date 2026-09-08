import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  homePath,
  isLocale,
  localeFromPath,
  localePrefix,
  localizedPath,
  otherLocales,
  solutionPath,
  solutionsIndexPath,
} from "@lib/i18n/routes";
import { CTA_LABEL_KEYS, dictionaryKeys, getDictionary, t } from "@lib/i18n/dictionary";

describe("locale algılama — URL tabanlı ve deterministik", () => {
  it("varsayılan locale tr", () => {
    expect(DEFAULT_LOCALE).toBe("tr");
  });

  it("prefixsiz yollar tr sayılır", () => {
    expect(localeFromPath("/")).toBe("tr");
    expect(localeFromPath("/cozumler/")).toBe("tr");
    expect(localeFromPath("/cozumler/operasyonel-gorunurluk/")).toBe("tr");
  });

  it("/en/ altındaki yollar en sayılır", () => {
    expect(localeFromPath("/en/")).toBe("en");
    expect(localeFromPath("/en/solutions/")).toBe("en");
    expect(localeFromPath("/en/solutions/observability-and-apm/")).toBe("en");
  });

  it("bilinmeyen ilk segment tr'ye düşer (tahmin yok)", () => {
    expect(localeFromPath("/de/")).toBe("tr");
    expect(localeFromPath("/fr/solutions/")).toBe("tr");
  });

  it("aynı girdi her zaman aynı sonucu verir", () => {
    for (const p of ["/", "/en/", "/cozumler/", "/en/solutions/"]) {
      expect(localeFromPath(p)).toBe(localeFromPath(p));
    }
  });

  it("isLocale yalnızca tanımlı locale'leri kabul eder", () => {
    expect(isLocale("tr")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(false);
  });
});

describe("yerelleştirilmiş yol üretimi", () => {
  it("tr prefixsiz, en /en önekli", () => {
    expect(localePrefix("tr")).toBe("");
    expect(localePrefix("en")).toBe("/en");
  });

  it("ana sayfa yolları", () => {
    expect(homePath("tr")).toBe("/");
    expect(homePath("en")).toBe("/en/");
  });

  it("çözüm landing yolları locale segmentini kullanır", () => {
    expect(solutionsIndexPath("tr")).toBe("/cozumler/");
    expect(solutionsIndexPath("en")).toBe("/en/solutions/");
  });

  it("çözüm detay yolları", () => {
    expect(solutionPath("tr", "operasyonel-gorunurluk")).toBe("/cozumler/operasyonel-gorunurluk/");
    expect(solutionPath("en", "observability-and-apm")).toBe(
      "/en/solutions/observability-and-apm/"
    );
  });

  it("tüm yollar sondaki eğik çizgiyle biter (trailingSlash: always)", () => {
    for (const p of [
      homePath("tr"),
      homePath("en"),
      solutionsIndexPath("tr"),
      solutionsIndexPath("en"),
      solutionPath("tr", "x"),
      solutionPath("en", "x"),
    ]) {
      expect(p.endsWith("/")).toBe(true);
    }
  });

  it("çift eğik çizgi üretmez", () => {
    expect(localizedPath("en", "", "solutions", "")).toBe("/en/solutions/");
    expect(localizedPath("tr")).toBe("/");
  });

  it("otherLocales geçerli locale'i dışlar", () => {
    expect(otherLocales("tr")).toEqual(["en"]);
    expect(otherLocales("en")).toEqual(["tr"]);
  });
});

describe("locale dictionary", () => {
  it("TR ve EN aynı anahtar kümesine sahip", () => {
    const tr = Object.keys(getDictionary("tr")).sort();
    const en = Object.keys(getDictionary("en")).sort();
    expect(en).toEqual(tr);
  });

  it("hiçbir değer boş değil", () => {
    for (const locale of ["tr", "en"] as const) {
      const dict = getDictionary(locale);
      for (const key of dictionaryKeys) {
        expect(dict[key].trim().length, `${locale}.${key} boş`).toBeGreaterThan(0);
      }
    }
  });

  it("navigasyon, CTA ve sistem mesajları sözlükten gelir", () => {
    expect(t("tr", "nav.solutions")).toBe("Çözümler");
    expect(t("en", "nav.solutions")).toBe("Solutions");
    expect(t("tr", "cta.contactUs")).toBe("Bizimle iletişime geçin");
    expect(t("en", "cta.contactUs")).toBe("Get in touch");
  });

  it("TR ve EN metinleri farklı (kelime kelime çeviri değil)", () => {
    const tr = getDictionary("tr");
    const en = getDictionary("en");
    // Marka adı gibi birkaç anahtar aynı kalabilir; çoğunluk farklı olmalı.
    const different = dictionaryKeys.filter((k) => tr[k] !== en[k]);
    expect(different.length).toBeGreaterThan(dictionaryKeys.length * 0.8);
  });

  it("eksik çeviri SESSİZ FALLBACK üretmez, hata fırlatır", () => {
    // @ts-expect-error bilinmeyen anahtar bilinçli olarak veriliyor
    expect(() => t("tr", "yok.olan.anahtar")).toThrow(/Eksik çeviri/);
  });
});

describe("CTA anahtar kümesi kapalı", () => {
  it("her CTA anahtarı sözlükte tanımlı", () => {
    for (const key of CTA_LABEL_KEYS) {
      expect(dictionaryKeys).toContain(key);
      expect(t("tr", key).length).toBeGreaterThan(0);
      expect(t("en", key).length).toBeGreaterThan(0);
    }
  });

  it("küme boş değil ve yalnızca cta.* anahtarları içeriyor", () => {
    expect(CTA_LABEL_KEYS.length).toBeGreaterThan(0);
    for (const key of CTA_LABEL_KEYS) {
      expect(key.startsWith("cta.")).toBe(true);
    }
  });
});
