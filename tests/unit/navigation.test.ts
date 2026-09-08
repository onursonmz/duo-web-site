import { describe, expect, it } from "vitest";
import {
  activeNavItems,
  brandHref,
  isCurrentPage,
  isWithinSection,
  MAX_PRIMARY_ITEMS,
  PRIMARY_NAV,
} from "@config/navigation";
import { dictionaryKeys } from "@lib/i18n/dictionary";
import { LOCALES } from "@lib/content/schema";

/**
 * NAVİGASYON YAPILANDIRMASI TESTLERİ.
 *
 * En kritik kural: henüz rotası olmayan bir menü girdisi ÇIKTIYA GİREMEZ.
 * Aksi halde `/iletisim/`, `/hakkimizda/`, `/cyclops/` gibi adreslere kırık
 * link üretilir.
 */

describe("navigasyon yapılandırması", () => {
  it("sözleşme sınırını aşmıyor: en fazla altı ana giriş", () => {
    expect(PRIMARY_NAV.length).toBeLessThanOrEqual(MAX_PRIMARY_ITEMS);
  });

  it("her girdinin etiketi sözlükte TANIMLI", () => {
    for (const item of PRIMARY_NAV) {
      expect(dictionaryKeys, `${item.labelKey} sözlükte yok`).toContain(item.labelKey);
    }
  });

  it("PLANLANAN girdiler yol ÜRETMİYOR (kırık link imkânsız)", () => {
    for (const item of PRIMARY_NAV) {
      if (item.status !== "planned") continue;
      for (const locale of LOCALES) {
        expect(
          item.href(locale),
          `${item.labelKey} planlanan olmasına rağmen yol üretti`
        ).toBeNull();
      }
    }
  });

  it("planlanan girdilerin hangi sprintte açılacağı belgelenmiş", () => {
    for (const item of PRIMARY_NAV) {
      if (item.status !== "planned") continue;
      expect(item.plannedIn, `${item.labelKey} için plannedIn yok`).toMatch(/^S\d{2}$/);
    }
  });

  it("RENDER edilenler yalnızca aktif girdiler", () => {
    for (const locale of LOCALES) {
      const rendered = activeNavItems(locale);
      const activeKeys = PRIMARY_NAV.filter((i) => i.status === "active").map((i) => i.labelKey);
      expect(rendered.map((r) => r.item.labelKey)).toEqual(activeKeys);
    }
  });

  it("render edilen her girdi GERÇEK bir yol taşıyor", () => {
    for (const locale of LOCALES) {
      for (const { item, href } of activeNavItems(locale)) {
        expect(href, `${item.labelKey} boş yol`).not.toBe("");
        expect(href.startsWith("/"), `${item.labelKey} göreli yol: ${href}`).toBe(true);
        expect(href.endsWith("/"), `${item.labelKey} sondaki eğik çizgi yok: ${href}`).toBe(true);
      }
    }
  });

  it("EN girdileri /en/ öneki taşıyor, TR taşımıyor", () => {
    for (const { href } of activeNavItems("en")) {
      expect(href.startsWith("/en/")).toBe(true);
    }
    for (const { href } of activeNavItems("tr")) {
      expect(href.startsWith("/en/")).toBe(false);
    }
  });

  it("marka bağlantısı locale ana sayfasına gidiyor", () => {
    expect(brandHref("tr")).toBe("/");
    expect(brandHref("en")).toBe("/en/");
  });
});

describe("aktif rota işaretleme", () => {
  it("yalnızca TAM eşleşmede sayfa geçerli sayılır", () => {
    expect(isCurrentPage("/cozumler/", "/cozumler/")).toBe(true);
    expect(isCurrentPage("/cozumler", "/cozumler/")).toBe(true);
    expect(isCurrentPage("/cozumler/otomasyon/", "/cozumler/")).toBe(false);
    expect(isCurrentPage("/", "/cozumler/")).toBe(false);
  });

  it("bölüm içinde olma ayrı bir kavram", () => {
    expect(isWithinSection("/cozumler/otomasyon/", "/cozumler/")).toBe(true);
    expect(isWithinSection("/en/solutions/x/", "/en/solutions/")).toBe(true);
    expect(isWithinSection("/", "/cozumler/")).toBe(false);
    // Ana sayfa hiçbir zaman "bölüm" sayılmaz; aksi halde her sayfa eşleşirdi.
    expect(isWithinSection("/cozumler/", "/")).toBe(false);
    expect(isWithinSection("/en/solutions/", "/en/")).toBe(false);
  });
});
