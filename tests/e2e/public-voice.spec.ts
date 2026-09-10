import { expect, test } from "@playwright/test";
import { PUBLIC_PAGE_ROUTES } from "../support/public-routes";

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

/**
 * Ziyaretçiye gösterilen tüm üretim rotaları — PAYLAŞILAN ENVANTERDEN.
 *
 * Liste burada tekrar yazılmıyor: `tests/support/public-routes.ts` tek kaynak
 * ve `route-inventory.spec.ts` onu build çıktısıyla karşılaştırıyor. Böylece
 * yeni bir rota açıldığında ses taramasının kapsamı kendiliğinden genişler.
 *
 * `/404-kontrol/` gerçek bir rota değildir: 404 şablonunu tetiklemek için
 * bilinçli olarak var olmayan bir adres istenir.
 */
const PUBLIC_ROUTES = [...PUBLIC_PAGE_ROUTES, "/404-kontrol/"];

/**
 * Yasak ifadeler. Küçük harfe indirgenmiş metinde aranır.
 *
 * Not: yalnızca İÇ SÜREÇ anlamı taşıyan kalıplar listelenir. "doğru" gibi
 * normal kelimelerin geçmesi engellenmez.
 */
const FORBIDDEN_PHRASES = [
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
  "içerik modeli",
  "fail-closed",
];

/**
 * Tek kelimelik terimler KELİME SINIRIYLA aranır.
 *
 * Alt dize taraması yanlış pozitif üretiyordu: "depending" içinde "pending",
 * "vertical" içinde "vertica". Yanlış pozitif, gerçek ihlalleri gürültüye
 * boğduğu için kural gevşetilmez — daha DOĞRU aranır. Sınır yalnızca kelimenin
 * BAŞINA konur; Türkçe ekler ("taslağı", "olgunluğu") yakalanmaya devam eder.
 */
const FORBIDDEN_WORDS = [
  /\btaslak/,
  /\bolgunluk/,
  /\bdraft\b/,
  /\bpending\b/,
  /\bverification/,
  /\bmaturity\b/,
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

      for (const word of FORBIDDEN_WORDS) {
        expect(word.test(visible), `${route} görünür metni ${word} içeriyor`).toBe(false);
      }
    });
  }

  /*
   * Rota başına AYRI test: 25 rotayı tek testin içinde gezmek zaman aşımına
   * takılıyordu ve hangi rotanın patladığı da görünmüyordu. Süre limiti
   * yükseltilmedi; kapsam bölündü.
   */
  for (const route of PUBLIC_ROUTES) {
    test(`${route} — META ve OG metinleri iç süreç dili taşımıyor`, async ({ page }) => {
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
      for (const word of FORBIDDEN_WORDS) {
        expect(word.test(lower), `${route} metadata ${word} içeriyor`).toBe(false);
      }
    });

    test(`${route} — BOŞ DURUM kutusu gösterilmiyor`, async ({ page }) => {
      await page.goto(route);
      const visible = (await page.locator("body").innerText()).toLocaleLowerCase("tr");
      for (const phrase of ["veri bekleniyor", "yakında", "coming soon", "kayıt bulunmuyor"]) {
        expect(visible.includes(phrase), `${route} "${phrase}" gösteriyor`).toBe(false);
      }
    });
  }

  test("/design-system dahili önizleme NAVİGASYONDA yok", async ({ page }) => {
    for (const route of ["/", "/en/", "/cozumler/"]) {
      await page.goto(route);
      await expect(page.locator('a[href*="design-system"]'), route).toHaveCount(0);
    }
  });
});
