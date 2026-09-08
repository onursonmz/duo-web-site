import { expect, test } from "@playwright/test";

/**
 * Bu dosya yalnızca `chromium-nojs` projesinde çalışır
 * (playwright.config.ts -> javaScriptEnabled: false).
 *
 * Sözleşme dayanağı: 02_TECHNICAL_ARCHITECTURE.md ss.3 — "Varsayılan çıktı
 * HTML/CSS'tir; client JavaScript açık gerekçe gerektirir." ve
 * 03_CONTENT_AND_ROUTE_MAP.md ss.6 — "JavaScript kapalıyken temel içerik ve
 * linkler kullanılabilir kalır."
 */

test.describe("JavaScript kapalı", () => {
  test("ana sayfa başlığı ve gövde metni görünür kalır", async ({ page }) => {
    await page.goto("/");

    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText(/Duosis/i);

    const main = page.locator("#main-content");
    await expect(main).toBeVisible();

    const metin = (await main.innerText()).trim();
    expect(metin.length).toBeGreaterThan(80);
  });

  test("skip link ve ana içerik hedefi DOM'da mevcut", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator('a.skip-link[href="#main-content"]')).toHaveCount(1);
    await expect(page.locator("#main-content")).toHaveCount(1);
  });

  test("iç bağlantılar çalışır durumda", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('main a[href="/cozumler/"]')).toBeVisible();
  });

  test("TR çözüm sayfası JavaScript olmadan tam okunabilir", async ({ page }) => {
    await page.goto("/cozumler/operasyonel-gorunurluk/");

    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByTestId("technology-empty")).toBeVisible();

    const main = (await page.locator("#main-content").innerText()).trim();
    expect(main.length).toBeGreaterThan(300);
  });

  test("EN çözüm sayfası ve dil değiştirici JavaScript olmadan çalışır", async ({ page }) => {
    await page.goto("/en/solutions/observability-and-apm/");

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    // Dil değiştirici düz bir <a>; JavaScript gerektirmez.
    await expect(page.getByTestId("lang-link-tr")).toBeVisible();
  });

  test("404 sayfası JavaScript olmadan da içerik gösterir", async ({ page }) => {
    await page.goto("/bulunmayan-bir-sayfa/");

    await expect(page.locator("h1")).toHaveText(/bulunamadı/i);
    await expect(page.locator('main a[href="/"]')).toBeVisible();
  });

  /**
   * S04 İLE DEĞİŞEN DAVRANIŞ.
   *
   * S01-S03'te sayfa HİÇ script etiketi taşımıyordu. S04, mega menü ve mobil
   * menü için ilk client JS'i getiriyor — sözleşmenin gerektirdiği "açık
   * gerekçe" budur (02_TECHNICAL_ARCHITECTURE ss.3).
   *
   * Kısıt kaldırılmadı, ÖLÇÜLEBİLİR hale getirildi: script yalnızca kendi
   * kaynağımızdan gelir, UI runtime hydrate edilmez ve JS olmadan site tam
   * çalışır (bu dosyadaki diğer testler bunu kanıtlar).
   */
  test("yalnızca KENDİ kaynağımızdan script yükleniyor; harici CDN yok", async ({ page }) => {
    await page.goto("/");

    const sources = await page
      .locator("script[src]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("src") ?? ""));

    for (const src of sources) {
      expect(src.startsWith("/"), `harici script kaynağı: ${src}`).toBe(true);
    }

    // Hiçbir UI framework runtime'ı hydrate edilmez.
    const html = await page.content();
    expect(html).not.toMatch(/astro-island|client:load|client:visible/);
  });

  test("JS KAPALIYKEN ana navigasyon linkleri erişilebilir kalıyor", async ({ page }) => {
    await page.goto("/");

    // Ana menü listesi görünür.
    const nav = page.getByTestId("primary-nav");
    await expect(nav).toBeVisible();
    await expect(nav.locator("a")).not.toHaveCount(0);

    // JS'e bağlı kontroller HİÇ gösterilmez (ölü kontrol yok).
    await expect(page.getByTestId("mobile-menu-toggle")).toBeHidden();
    await expect(page.getByTestId("solutions-disclosure")).toBeHidden();

    // Mega panel kapalı kalır.
    await expect(page.getByTestId("mega-solutions")).toBeHidden();
  });

  test("JS KAPALIYKEN dar ekranda da menü linkleri görünür", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.getByTestId("primary-nav")).toBeVisible();
    await expect(page.getByTestId("mobile-menu-toggle")).toBeHidden();
  });

  test("JS KAPALIYKEN footer iletişim bağlantıları çalışıyor", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByTestId("site-footer");
    await expect(footer).toBeVisible();
    await expect(footer.locator('a[href^="mailto:"]')).toHaveCount(1);
    await expect(footer.locator('a[href^="tel:"]')).not.toHaveCount(0);
  });
});
