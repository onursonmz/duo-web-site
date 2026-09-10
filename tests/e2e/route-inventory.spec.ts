import { expect, test } from "@playwright/test";
import { INTERNAL_ROUTES, discoverRoutes, publicRoutes } from "../support/route-inventory";
import { FEED_ROUTES } from "../support/public-routes";

/**
 * ROTA ENVANTERİ KORUMASI (S08 §18 + S10/S11 eklemeleri).
 *
 * ENTEGRASYON NOTU (S08-S11): iki paralel branch bu dosyayı bağımsız olarak
 * oluşturmuştu. S08'in KEŞİF tabanlı yaklaşımı korundu — elle tutulan bir
 * liste her yeni rotada eskiyordu ve S10+S11 tarafında tam olarak bu oldu.
 * S10+S11'in getirdiği iki tamamlayıcı kontrol (besleme adresleri ve rota
 * ailesi kapsamı) üzerine eklendi.
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

  /**
   * S08-S11 ROTA AİLELERİ — kapsam denetimi.
   *
   * Keşif "ne varsa onu" bulur; bu test "ne OLMASI gerektiğini" sabitler.
   * Bir şablon ailesi bütünüyle üretilmemeye başlarsa (ör. seri rotaları
   * kaybolursa) keşif bunu fark etmez, bu test eder.
   */
  test("S08-S11 rota ailelerinin tamamı üretilmiş", () => {
    const families: Record<string, RegExp> = {
      "çözüm landing": /^\/(cozumler|en\/solutions)\/$/,
      "çözüm detay": /^\/cozumler\/[a-z-]+\/$/,
      cyclops: /^\/(cyclops|en\/cyclops)\/$/,
      hakkimizda: /^\/(hakkimizda|en\/about)\/$/,
      hizmetler: /^\/(hizmetler|en\/services)\/$/,
      teknolojiler: /^\/(teknolojiler|en\/technologies)\/$/,
      "içgörü landing": /^\/(icgoruler|en\/insights)\/$/,
      "içgörü detay": /^\/icgoruler\/[a-z-]+\/$/,
      "içgörü seri": /^\/icgoruler\/seri\/[a-z-]+\/$/,
      "içgörü etiket": /^\/icgoruler\/etiket\/[a-z-]+\/$/,
      iletisim: /^\/(iletisim|en\/contact)\/$/,
    };

    for (const [name, pattern] of Object.entries(families)) {
      expect(
        PUBLIC_ROUTES.some((route) => pattern.test(route)),
        `"${name}" ailesi build çıktısında yok`
      ).toBe(true);
    }
  });

  /**
   * BESLEMELER SAYFA DEĞİL, KAYNAKTIR — keşif onları bulmaz (`index.html`
   * tarıyor). Bu yüzden ayrıca kontrol edilirler.
   */
  test("besleme adresleri çalışıyor ve XML dönüyor", async ({ request }) => {
    for (const feed of FEED_ROUTES) {
      const response = await request.get(feed);
      expect(response.status(), feed).toBe(200);
      expect(response.headers()["content-type"], feed).toContain("xml");
    }
  });

  for (const route of PUBLIC_ROUTES) {
    test(`${route} — 200 dönüyor ve tek H1 taşıyor`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
    });
  }

  /*
   * ROTA BAŞINA AYRI TEST.
   *
   * Bu tarama önce TEK bir test içinde 64 rotayı geziyordu ve S13'te rota
   * sayısı büyüyünce 30 sn'lik test bütçesini aştı. Süre limitini YÜKSELTMEK
   * sorunu ertelemek olurdu: tarama rota sayısıyla doğrusal büyüyor. Bunun
   * yerine kapsam bölündü — aynı kural, aynı kapsam, rota başına kendi
   * bütçesi. Ek fayda: kırık bağlantıyı taşıyan sayfa artık doğrudan test
   * adından okunuyor.
   */
  for (const route of PUBLIC_ROUTES) {
    test(`${route} — iç bağlantıları envanterdeki rotalara gidiyor`, async ({ page }) => {
      await page.goto(route);
      const hrefs = await page
        .locator("a[href^='/']")
        .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));

      const targets = new Set<string>();
      for (const href of hrefs) {
        if (href === "" || href.startsWith("//")) continue;
        // Sorgu ve fragment envanter eşleşmesinde dikkate alınmaz.
        const path = href.split("?")[0]?.split("#")[0] ?? "";
        if (path !== "") targets.add(path);
      }

      // Her public sayfa en azından gezinme bağlantılarını taşımalı.
      expect(targets.size, `${route} hiç iç bağlantı taşımıyor`).toBeGreaterThan(5);

      for (const target of targets) {
        // Besleme adresleri sayfa envanterinde DEĞİLDİR ama geçerli hedeflerdir.
        if ((FEED_ROUTES as readonly string[]).includes(target)) continue;
        expect(
          ALL_ROUTES,
          `${route} sayfasındaki "${target}" envanterde yok (kırık ya da kayıtsız rota)`
        ).toContain(target);
      }
    });
  }
});
