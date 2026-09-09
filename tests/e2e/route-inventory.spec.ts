import { expect, test } from "@playwright/test";
import { INTERNAL_ROUTES, discoverRoutes, publicRoutes } from "../support/route-inventory";

/**
 * ROTA ENVANTERİ KORUMASI (S08 §18).
 *
 * Tarama testleri artık build çıktısından keşfedilen TEK envanteri kullanır.
 * Bu dosya envanterin kendisini denetler: keşif çalışıyor mu, dahili istisnalar
 * gerçekten var mı, public rotaların hepsi 200 dönüyor mu ve iç bağlantıların
 * tamamı envanterde mi.
 *
 * Yeni bir public rota eklenip dahili istisna olarak İŞARETLENMEZSE public ses
 * taramasına otomatik girer; kırık ya da envanter dışı bir bağlantı ise buradaki
 * "iç bağlantılar envanterde" testini kırar.
 */

const ALL_ROUTES = discoverRoutes();
const PUBLIC_ROUTES = publicRoutes();

test.describe("rota envanteri", () => {
  test("keşif build çıktısından anlamlı bir liste üretiyor", () => {
    expect(ALL_ROUTES.length).toBeGreaterThan(20);
    for (const anchor of ["/", "/en/", "/cozumler/", "/en/solutions/", "/iletisim/"]) {
      expect(ALL_ROUTES, `${anchor} envanterde yok`).toContain(anchor);
    }
    // Envanter public ve dahili olmak üzere tam ikiye ayrılır.
    expect(PUBLIC_ROUTES.length + INTERNAL_ROUTES.length).toBe(ALL_ROUTES.length);
  });

  test("dahili istisnaların hepsi GERÇEKTEN var", () => {
    for (const route of INTERNAL_ROUTES) {
      expect(ALL_ROUTES, `${route} dahili listede ama build'de yok`).toContain(route);
    }
  });

  for (const route of PUBLIC_ROUTES) {
    test(`${route} — 200 dönüyor ve tek H1 taşıyor`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
    });
  }

  test("iç bağlantıların tamamı envanterdeki bir rotaya gidiyor", async ({ page }) => {
    const targets = new Set<string>();
    for (const route of PUBLIC_ROUTES) {
      await page.goto(route);
      const hrefs = await page
        .locator("a[href^='/']")
        .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
      for (const href of hrefs) {
        if (href === "" || href.startsWith("//")) continue;
        // Sorgu ve fragment envanter eşleşmesinde dikkate alınmaz.
        const path = href.split("?")[0]?.split("#")[0] ?? "";
        if (path !== "") targets.add(path);
      }
    }

    expect(targets.size).toBeGreaterThan(5);
    for (const target of targets) {
      expect(ALL_ROUTES, `${target} envanterde yok (kırık ya da kayıtsız rota)`).toContain(target);
    }
  });
});
