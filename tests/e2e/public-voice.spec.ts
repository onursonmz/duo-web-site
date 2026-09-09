import { expect, test } from "@playwright/test";

/**
 * PUBLIC SES REGRESYONU (S04+S05 takip kararı).
 *
 * Ziyaretçiye İÇ YAYIN SÜRECİ anlatılmaz. Doğrulama durumu, olgunluk etiketi,
 * logo izni veya "iş sahibi onayı" gibi içerik yönetimi terimleri public
 * arayüzde GÖRÜNEMEZ.
 *
 * Bu bilgiler dahili veride, ADR'lerde ve `docs/` altında korunur — yalnızca
 * ziyaretçiye gösterilen metinden çıkarılır.
 *
 * `/design-system` dahili/noindex önizlemedir ve navigasyona eklenmez; bu
 * kuralın kapsamı dışındadır.
 */

/** Ziyaretçiye gösterilen tüm üretim rotaları. */
const PUBLIC_ROUTES = [
  "/",
  "/en/",
  "/cozumler/",
  "/en/solutions/",
  "/cozumler/operasyonel-gorunurluk/",
  "/cozumler/veri-akisi-ve-entegrasyon/",
  "/cozumler/aiops-ve-olay-yasam-dongusu/",
  "/cozumler/muhendislik-ve-urun-gelistirme/",
  "/en/solutions/observability-and-apm/",
  "/icgoruler/",
  "/en/insights/",
  "/404-kontrol/",
];

/**
 * Yasak ifadeler. Küçük harfe indirgenmiş metinde aranır.
 *
 * Not: yalnızca İÇ SÜREÇ anlamı taşıyan kalıplar listelenir. "doğru" gibi
 * normal kelimelerin geçmesi engellenmez.
 */
const FORBIDDEN_PHRASES = [
  "taslak",
  "draft",
  "olgunluk",
  "iş sahibi",
  "doğrulanmamış",
  "doğrulama bekl",
  "doğrulaması bekl",
  "onayı bekl",
  "yayınlanabilir",
  "yayınlanmaz",
  "kullanım izni",
  "logo izni",
  "logopermission",
  "verificationstatus",
  "pending",
  "verification",
  "maturity",
  "içerik modeli",
  "fail-closed",
];

test.describe("public arayüzde iç süreç dili yok", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const route of PUBLIC_ROUTES) {
    test(`${route} — iç süreç ifadesi içermiyor`, async ({ page }) => {
      await page.goto(route);

      // Ziyaretçinin GÖRDÜĞÜ metin (header + main + footer).
      const visible = (await page.locator("body").innerText()).toLocaleLowerCase("tr");

      for (const phrase of FORBIDDEN_PHRASES) {
        expect(
          visible.includes(phrase),
          `${route} sayfasında görünür metin "${phrase}" içeriyor`
        ).toBe(false);
      }
    });
  }

  test("META ve OG metinleri de iç süreç dili taşımıyor", async ({ page }) => {
    for (const route of PUBLIC_ROUTES) {
      await page.goto(route);
      const meta = await page.evaluate(() =>
        [...document.querySelectorAll('meta[name="description"], meta[property^="og:"]')]
          .map((el) => el.getAttribute("content") ?? "")
          .join(" ")
      );
      const lower = meta.toLocaleLowerCase("tr");
      for (const phrase of FORBIDDEN_PHRASES) {
        expect(lower.includes(phrase), `${route} metadata "${phrase}" içeriyor`).toBe(false);
      }
    }
  });

  test("BOŞ DURUM kutusu gösterilmiyor", async ({ page }) => {
    for (const route of PUBLIC_ROUTES) {
      await page.goto(route);
      const visible = (await page.locator("body").innerText()).toLocaleLowerCase("tr");
      for (const phrase of ["veri bekleniyor", "yakında", "coming soon", "kayıt bulunmuyor"]) {
        expect(visible.includes(phrase), `${route} "${phrase}" gösteriyor`).toBe(false);
      }
    }
  });

  test("/design-system dahili önizleme NAVİGASYONDA yok", async ({ page }) => {
    for (const route of ["/", "/en/", "/cozumler/"]) {
      await page.goto(route);
      await expect(page.locator('a[href*="design-system"]'), route).toHaveCount(0);
    }
  });
});
