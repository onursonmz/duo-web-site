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
    await expect(page.getByTestId("technology-list")).toBeVisible();

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

  test("sayfa hiç script etiketi yüklemez", async ({ page }) => {
    await page.goto("/");

    // S01 iskeleti tamamen statik olmalı: hiçbir UI runtime hydrate edilmez.
    await expect(page.locator("script")).toHaveCount(0);
  });
});
