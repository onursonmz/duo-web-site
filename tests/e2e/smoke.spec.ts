import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Sayfa yüklenirken oluşan konsol hatalarını ve sayfa hatalarını toplar. */
function collectPageErrors(page: import("@playwright/test").Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`console.error: ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => {
    errors.push(`pageerror: ${err.message}`);
  });
  return errors;
}

test.describe("ana sayfa", () => {
  test("yüklenir ve tek bir anlamlı H1 gösterir", async ({ page }) => {
    await page.goto("/");

    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    await expect(h1).toBeVisible();

    /*
     * S05 ile H1 marka adı DEĞİL, değer önerisidir. Sözleşme (01_PRODUCT...
     * §5) "logo ve marka isimleri çözüm faydasının önüne geçmemeli" diyor;
     * bu yüzden "Duosis" beklentisi kaldırıldı. Anlamlılık ölçütü korunuyor:
     * H1 gerçek bir cümle olacak kadar dolu olmalı.
     */
    const text = (await h1.innerText()).trim();
    expect(text.length, `H1 çok kısa: "${text}"`).toBeGreaterThan(20);
    expect(text.split(/\s+/).length, "H1 tek kelime").toBeGreaterThan(3);

    // Marka kimliği sayfada yine de bulunmalı — header'daki logo görselinin
    // erişilebilir adı üzerinden (metin düğümü değil, alt metni).
    await expect(page.getByTestId("site-header").getByAltText("Duosis")).toHaveCount(1);
  });

  test("kök html lang değeri tr", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  });

  test("title ve meta description dolu", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/\S/);
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description?.trim().length ?? 0).toBeGreaterThan(0);
  });

  test("viewport meta etiketi var", async ({ page }) => {
    await page.goto("/");
    const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
    expect(viewport).toContain("width=device-width");
  });

  test("skip link klavyeyle odaklanır ve #main-content hedefine gider", async ({ page }) => {
    await page.goto("/");

    // İlk Tab skip link'e gelmeli.
    await page.keyboard.press("Tab");

    const skipLink = page.locator("a.skip-link");
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveAttribute("href", "#main-content");

    // Hedef gerçekten var mı?
    const main = page.locator("#main-content");
    await expect(main).toHaveCount(1);

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main-content$/);
    await expect(main).toBeFocused();
  });

  test("yeni console error veya page error üretmez", async ({ page }) => {
    const errors = collectPageErrors(page);

    await page.goto("/", { waitUntil: "load" });
    await page.waitForLoadState("networkidle");

    expect(errors).toEqual([]);
  });

  test("@a11y axe erişilebilirlik smoke kontrolü", async ({ page }) => {
    await page.goto("/");

    const sonuc = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(sonuc.violations).toEqual([]);
  });
});

test.describe("404 sayfası", () => {
  test("bilinmeyen adres 404 durum kodu döndürür", async ({ page }) => {
    const response = await page.goto("/bulunmayan-bir-sayfa/");
    expect(response?.status()).toBe(404);
  });

  test("404 sayfası kendi başlığını ve ana sayfa bağlantısını gösterir", async ({ page }) => {
    await page.goto("/bulunmayan-bir-sayfa/");

    await expect(page.locator("h1")).toHaveText(/bulunamadı/i);
    await expect(page.locator('main a[href="/"]')).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  });

  test("@a11y 404 sayfası axe kontrolünden geçer", async ({ page }) => {
    await page.goto("/bulunmayan-bir-sayfa/");

    const sonuc = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(sonuc.violations).toEqual([]);
  });
});
