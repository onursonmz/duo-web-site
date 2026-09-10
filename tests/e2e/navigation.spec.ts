import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * S04 — GLOBAL SHELL VE NAVİGASYON KABUL TESTLERİ.
 *
 * Mega menü ve mobil menü gerçek tarayıcıda mouse, click ve klavye ile
 * doğrulanır; focus trap, focus return, scroll lock temizliği ve
 * `aria-expanded` doğruluğu ölçülür.
 */

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

test.describe("global header — masaüstü", () => {
  test.use({ viewport: DESKTOP });

  test("header ve footer her sayfada var", async ({ page }) => {
    for (const route of ["/", "/en/", "/cozumler/", "/cozumler/otomasyon/"]) {
      await page.goto(route);
      await expect(page.getByTestId("site-header"), route).toHaveCount(1);
      await expect(page.getByTestId("site-footer"), route).toHaveCount(1);
    }
  });

  test("MEGA MENÜ click ile açılır ve aria-expanded doğrudur", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByTestId("solutions-disclosure");
    const panel = page.getByTestId("mega-solutions");

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(panel).toBeHidden();

    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toBeVisible();
    // Sekiz çözüm alanı + teknoloji atlası bağlantısı.
    // Atlas ana menüde DEĞİL (altı girdi sınırı); ekosistemin alt görünümü
    // olarak panelin altında, ayrı bir çizginin ardında durur.
    await expect(panel.locator(".mega__grid a")).toHaveCount(8);
    await expect(panel.locator(".mega__secondary-link")).toHaveCount(1);
    await expect(panel.locator("a")).toHaveCount(9);

    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(panel).toBeHidden();
  });

  test("MEGA MENÜ HOVER GEREKTİRMEZ: yalnızca klavyeyle açılıp gezilebilir", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByTestId("solutions-disclosure");
    const panel = page.getByTestId("mega-solutions");

    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(panel).toBeVisible();

    // Tab paneldeki ilk bağlantıya gitmeli.
    await page.keyboard.press("Tab");
    const focusedHref = await page.evaluate(() =>
      (document.activeElement as HTMLAnchorElement | null)?.getAttribute("href")
    );
    expect(focusedHref).toMatch(/^\/cozumler\//);
  });

  test("ESCAPE paneli kapatır ve odak TETİKLEYİCİYE döner", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByTestId("solutions-disclosure");
    const panel = page.getByTestId("mega-solutions");

    await trigger.click();
    await expect(panel).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("DIŞARI TIKLAMA paneli kapatır", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByTestId("solutions-disclosure");
    const panel = page.getByTestId("mega-solutions");

    await trigger.click();
    await expect(panel).toBeVisible();

    // Panel üst bölgeyi kaplıyor; gerçekten DIŞINDA bir noktaya tıklanır.
    await page.mouse.click(20, 860);
    await expect(panel).toBeHidden();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("mega menü bağlantıları GERÇEK çözüm rotalarına gidiyor", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("solutions-disclosure").click();
    const hrefs = await page
      .getByTestId("mega-solutions")
      .locator("a")
      .evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""));

    for (const href of hrefs) {
      const res = await page.request.get(href);
      expect(res.status(), `${href} -> ${res.status()}`).toBe(200);
    }
  });

  test("AKTİF ROTA aria-current=page ile işaretleniyor", async ({ page }) => {
    await page.goto("/cozumler/");
    const current = page.getByTestId("primary-nav").locator('[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAttribute("href", "/cozumler/");

    // Alt sayfada üst menü "sayfa" olarak işaretlenmez.
    await page.goto("/cozumler/otomasyon/");
    await expect(page.getByTestId("primary-nav").locator('[aria-current="page"]')).toHaveCount(0);
  });
});

test.describe("mobil menü", () => {
  test.use({ viewport: MOBILE });

  test("açılır, kapanır ve odak TETİKLEYİCİYE döner", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByTestId("mobile-menu-toggle");
    const menu = page.getByTestId("mobile-menu");

    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(menu).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    await page.getByTestId("mobile-menu-close").click();
    await expect(menu).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
  });

  test("ESCAPE kapatır ve odağı geri verir", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByTestId("mobile-menu-toggle");
    await toggle.click();
    await expect(page.getByTestId("mobile-menu")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("mobile-menu")).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test("SCROLL LOCK uygulanır ve kapanışta TAM temizlenir", async ({ page }) => {
    await page.goto("/");
    const before = await page.evaluate(() => ({
      overflow: document.body.style.overflow,
      padding: document.body.style.paddingRight,
    }));

    await page.getByTestId("mobile-menu-toggle").click();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

    await page.getByTestId("mobile-menu-close").click();
    const after = await page.evaluate(() => ({
      overflow: document.body.style.overflow,
      padding: document.body.style.paddingRight,
    }));
    expect(after).toEqual(before);
  });

  test("FOCUS TRAP odağı panelin içinde tutuyor", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mobile-menu-toggle").click();

    // Panel içinde 25 kez Tab: odak hiçbir zaman panelin dışına çıkmamalı.
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() => {
        const panel = document.querySelector(".mobile-menu__panel");
        return panel !== null && panel.contains(document.activeElement);
      });
      expect(inside, `Tab #${i + 1} sonrası odak panelin dışına çıktı`).toBe(true);
    }
  });

  test("KARARTMA alanına tıklamak kapatır", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mobile-menu-toggle").click();
    await expect(page.getByTestId("mobile-menu")).toBeVisible();

    // Panel sağda; sol kenara tıklamak karartma alanına denk gelir.
    await page.getByTestId("mobile-menu").click({ position: { x: 8, y: 400 } });
    await expect(page.getByTestId("mobile-menu")).toBeHidden();
  });

  test("bağlantıya gidildiğinde menü kapanır ve scroll lock kalmaz", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mobile-menu-toggle").click();
    await page.locator(".mobile-menu__sublink").first().click();
    await page.waitForURL(/\/cozumler\/.+/);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  });
});

test.describe("dil değiştirici ve TR/EN eşleme", () => {
  test.use({ viewport: DESKTOP });

  test("karşılığı olan sayfada dil bağlantısı üretiliyor", async ({ page }) => {
    await page.goto("/cozumler/operasyonel-gorunurluk/");
    const link = page.getByTestId("lang-link-en");
    await expect(link).toHaveCount(1);
    await link.click();
    await expect(page).toHaveURL(/\/en\/solutions\/observability-and-apm\//);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("karşılığı OLMAYAN sayfada bağlantı üretilmiyor", async ({ page }) => {
    // Sekiz çözümün tamamı iki dilde yayımlandı; çevirisiz kayıt içgörüdür.
    await page.goto("/icgoruler/operasyon-verisinin-dort-hali/");
    await expect(page.getByTestId("lang-link-en")).toHaveCount(0);
    await expect(page.getByTestId("lang-unavailable-en")).toHaveCount(1);
  });
});

test.describe("footer", () => {
  test.use({ viewport: DESKTOP });

  test("yalnızca DOĞRULANMIŞ iletişim bilgileri ve mevcut rotalar var", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByTestId("site-footer");

    const hrefs = await footer
      .locator("a")
      .evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""));

    // Doğrulanmamış sosyal medya hesabı YOK.
    for (const href of hrefs) {
      expect(
        /linkedin|twitter|x\.com|facebook|instagram|youtube/i.test(href),
        `footer doğrulanmamış sosyal bağlantı içeriyor: ${href}`
      ).toBe(false);
    }

    // İç bağlantıların tamamı gerçek rota.
    for (const href of hrefs.filter((h) => h.startsWith("/"))) {
      const res = await page.request.get(href);
      expect(res.status(), `${href} -> ${res.status()}`).toBe(200);
    }

    await expect(footer).toContainText("info@duosis.com");
    await expect(footer).toContainText("Ataşehir");
    await expect(footer).toContainText("Çankaya");
  });

  test("yıl DERLEME ZAMANINDAN üretiliyor", async ({ page }) => {
    await page.goto("/");
    const text = await page.getByTestId("site-footer").innerText();
    const year = Number(text.match(/©\s*(\d{4})/)?.[1]);
    // Derleme yılı gerçek olmalı; elle yazılmış eski bir yıl kabul edilmez.
    expect(year).toBeGreaterThanOrEqual(new Date().getFullYear() - 1);
    expect(year).toBeLessThanOrEqual(new Date().getFullYear() + 1);
  });
});

test.describe("client JS bütçesi", () => {
  test.use({ viewport: DESKTOP });

  test("S04 client JS 12 KB gzip BÜTÇESİNİN altında", async ({ page }) => {
    await page.goto("/");

    // Satır içi ve harici tüm script gövdeleri toplanır.
    const inlineBytes = await page.evaluate(() =>
      [...document.querySelectorAll("script:not([src])")].reduce(
        (sum, el) => sum + new TextEncoder().encode(el.textContent ?? "").length,
        0
      )
    );

    const externalSrcs = await page
      .locator("script[src]")
      .evaluateAll((els) => els.map((e) => (e as HTMLScriptElement).src));

    let externalBytes = 0;
    for (const src of externalSrcs) {
      const res = await page.request.get(src);
      externalBytes += (await res.body()).length;
    }

    const totalRaw = inlineBytes + externalBytes;
    // gzip ~%35 oranına iner; ham bütçe olarak 12 KB üzerinden ölçmek DAHA KATI.
    expect(totalRaw, `client JS ${totalRaw} B (ham)`).toBeLessThan(12 * 1024);
  });

  test("HİÇBİR harici script kaynağı yok", async ({ page }) => {
    await page.goto("/");
    const srcs = await page
      .locator("script[src]")
      .evaluateAll((els) => els.map((e) => (e as HTMLScriptElement).src));
    for (const src of srcs) {
      expect(new URL(src).origin, `harici script: ${src}`).toBe(new URL(page.url()).origin);
    }
  });
});

test.describe("404 ortak shell", () => {
  test.use({ viewport: DESKTOP });

  test("404 aynı header/footer ile geliyor", async ({ page }) => {
    const res = await page.goto("/bulunmayan-bir-adres/");
    expect(res?.status()).toBe(404);
    await expect(page.getByTestId("site-header")).toHaveCount(1);
    await expect(page.getByTestId("site-footer")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
  });
});

test.describe("shell erişilebilirliği", () => {
  test("@a11y masaüstü: mega menü AÇIKKEN de axe temiz", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");
    await page.getByTestId("solutions-disclosure").click();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });

  test("@a11y mobil: menü AÇIKKEN de axe temiz", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");
    await page.getByTestId("mobile-menu-toggle").click();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });

  test("skip link hâlâ ilk odak durağı", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.locator("a.skip-link")).toBeFocused();
  });

  test("HİÇBİR sayfa planlanan (rotasız) adrese link vermiyor", async ({ page }) => {
    /*
     * Rotası açılan adres listeden ÇIKARILIR, kural gevşetilmez:
     *   `/iletisim/`                S07
     *   `/cyclops/`, `/hakkimizda/` S08+S09
     *   `/hizmetler/`               S10
     *
     * Entegrasyon sonrası yalnızca `/blog/` rotasız kaldı: içgörüler
     * `/icgoruler/` altında yayımlanıyor ve `/blog/` hiç açılmadı.
     */
    const forbidden = ["/blog/"];
    for (const route of ["/", "/en/", "/cozumler/", "/cozumler/otomasyon/"]) {
      await page.goto(route);
      const hrefs = await page
        .locator("a[href]")
        .evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""));
      for (const href of hrefs) {
        expect(forbidden.includes(href), `${route} -> ${href} henüz yok`).toBe(false);
      }
    }
  });
});
