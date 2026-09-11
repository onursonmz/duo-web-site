import { expect, test } from "@playwright/test";

/**
 * ÇAPRAZ TARAYICI MATRİSİ (S15).
 *
 * NEDEN AYRI BİR DOSYA?
 *
 * Süit ~1050 teste ulaştı. Bunu üç tarayıcıda koşmak ~3150 test demek olurdu:
 * yerelde saatler, CI'da bütçenin çok üstü. Bu, çapraz tarayıcı kapsamı
 * SAĞLAMAZ — yalnızca aynı iddiaları üç kez tekrar eder.
 *
 * Bunun yerine: Chromium TÜM süiti koşar (derinlik), Firefox ve WebKit ise bu
 * dosyayı koşar (genişlik). Buradaki testler tarayıcılar arasında GERÇEKTEN
 * ayrışan şeyleri hedefler — düzen, CSS özellik desteği, form davranışı,
 * klavye ve JavaScript API'leri.
 *
 * Bir davranış burada yoksa, o davranışın çapraz tarayıcı güvencesi de yoktur.
 * Liste bilinçli olarak kısa ve KRİTİK tutulur.
 */

/** Kritik rota matrisi — çalışma emri §4. */
const CRITICAL_ROUTES = [
  "/",
  "/en/",
  "/cozumler/",
  "/cozumler/operasyonel-gorunurluk/",
  "/urunler/",
  "/urunler/cyclops/",
  "/urunler/hermes/",
  "/urunler/logislot/",
  "/urunler/ravskald/",
  "/hizmetler/",
  "/teknolojiler/",
  "/hakkimizda/",
  "/icgoruler/",
  "/iletisim/",
  "/aydinlatma-metni/",
] as const;

test.describe("kritik rotalar her tarayıcıda", () => {
  for (const route of CRITICAL_ROUTES) {
    test(`${route}: 200, tek H1, konsol hatası yok`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));

      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      expect(errors, `${route} konsol hatası: ${errors.join(" | ")}`).toEqual([]);
    });
  }
});

test.describe("düzen her tarayıcıda taşmıyor", () => {
  /*
   * Yatay taşma, tarayıcılar arasında EN ÇOK ayrışan şeylerden biri: grid
   * `min-width: auto`, `ch` birimi ve font ölçümleri motora göre değişir.
   */
  for (const width of [320, 390, 768, 1440]) {
    test(`${width}px: kritik rotalarda yatay taşma yok`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ["/", "/urunler/", "/urunler/logislot/", "/iletisim/"]) {
        await page.goto(route);
        const overflow = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        expect(overflow.scroll, `${route} @${width}`).toBeLessThanOrEqual(overflow.client);
      }
    });
  }
});

test.describe("ürün sahnesi her tarayıcıda çalışıyor", () => {
  test("sekme seçimi paneli ve sahneyi değiştiriyor", async ({ page }) => {
    await page.goto("/urunler/");

    /*
     * SEÇİCİ DÜZELTMESİ: tek bir `[data-eco-scene]` düğümü ARTIK YOK.
     * S15-R1 ürün ekosistemini yeniden yazdı; her ürün kendi panelinde kendi
     * sahnesini (`.pscene[data-motion]`) taşıyor. Test bu yeni sözleşmeye
     * bağlandı; iddiası değişmedi — sekme seçimi hem paneli hem SAHNEYİ
     * değiştirmeli. Panel adıyla kapsanır, böylece tek öğeye çözülür.
     */
    await expect(page.locator('[data-eco-panel="cyclops"] .pscene')).toHaveAttribute(
      "data-motion",
      "converge"
    );

    await page.locator('[data-eco-tab="logislot"]').click();
    await expect(page.locator('[data-eco-panel="logislot"] .pscene')).toHaveAttribute(
      "data-motion",
      "allocate"
    );
    await expect(page.locator('[data-eco-panel="logislot"]')).toBeVisible();
    await expect(page.locator('[data-eco-panel="cyclops"]')).toBeHidden();
  });

  test("klavye ok tuşlarıyla gezinilebiliyor", async ({ page }) => {
    await page.goto("/urunler/");
    await page.locator('[data-eco-tab="cyclops"]').focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator('[data-eco-tab="hermes"]')).toBeFocused();
    await expect(page.locator('[data-eco-panel="hermes"]')).toBeVisible();
  });
});

test.describe("form ve izin her tarayıcıda", () => {
  test("boş gönderim alan hatası üretiyor ve ağ isteği yapmıyor", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));

    await page.goto("/iletisim/");
    const before = requests.length;
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("[id^='error-']:not(:empty)").first()).toBeVisible();
    expect(requests.length, "gönderim ağ isteği başlattı").toBe(before);
  });

  test("geçerli gönderim SAHTE BAŞARI göstermiyor", async ({ page }) => {
    await page.goto("/iletisim/");
    await page.fill("#field-name", "Deneme Kullanıcı");
    await page.fill("#field-email", "deneme@ornek.test");
    await page.fill("#field-organization", "Ornek Kurum");
    await page.fill("#field-message", "Capraz tarayici kontrolu icin yazilmis deneme mesajidir.");
    await page.check("#field-consent");
    await page.locator('button[type="submit"]').click();

    const status = page.getByTestId("contact-status");
    await expect(status).toHaveAttribute("data-state", "not-delivered");
  });

  test("izin öncesi hiçbir dış istek yok", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (!url.startsWith("http://127.0.0.1") && !url.startsWith("data:")) external.push(url);
    });
    await page.goto("/", { waitUntil: "networkidle" });
    expect(external, `dış istek: ${external.join(" | ")}`).toEqual([]);
  });
});

test.describe("gezinme her tarayıcıda", () => {
  /*
   * SKIP LINK — WEBKIT'TE PLATFORM DAVRANIŞI FARKLI.
   *
   * ÖLÇÜLEN: WebKit'te `Tab` bağlantıları tamamen atlayıp ilk BUTONA gidiyor.
   * Bu bizim işaretlememizin hatası DEĞİL, Safari'nin belgelenmiş
   * varsayılanıdır: "Full Keyboard Access" kapalıyken `<a>` öğeleri tab
   * sırasına girmez. Aynı sayfada programatik `focus()` sorunsuz çalışıyor,
   * yani bağlantı gerçekten odaklanabilir durumda.
   *
   * Bu yüzden iddia motora göre ayrılır — kural gevşetilmez, DOĞRU şey
   * ölçülür: Chromium ve Firefox'ta ilk tab durağı olmalı; WebKit'te
   * bağlantının odaklanabilir, görünür ve doğru hedefe gidiyor olması.
   */
  test("skip link ilk odak durağı", async ({ page, browserName }) => {
    await page.goto("/");
    const skip = page.locator("a.skip-link");

    if (browserName === "webkit") {
      await skip.focus();
      await expect(skip).toBeFocused();
      await expect(skip).toBeVisible();
      await expect(skip).toHaveAttribute("href", "#main-content");
      return;
    }

    await page.keyboard.press("Tab");
    await expect(skip).toBeFocused();
  });

  test("dil değiştirici karşılığa gidiyor", async ({ page }) => {
    await page.goto("/urunler/logislot/");
    await page.getByTestId("lang-link-en").click();
    await expect(page).toHaveURL(/\/en\/products\/logislot\/$/);
  });
});
