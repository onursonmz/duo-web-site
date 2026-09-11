import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * CYCLOPS ÜRÜN SAYFASI — KABUL TESTLERİ (S08).
 *
 * Ürün ekranları GERÇEK uygulamadan gelir; bu yüzden testlerin bir kısmı
 * hassas veri taramasıdır. Geri kalanı hikâyenin ilk ekranda kurulduğunu,
 * sıranın korunduğunu ve JS/hareket kapalıyken sayfanın anlamlı kaldığını
 * doğrular.
 */

/*
 * S14: CyclOps ürün ailesine taşındı.
 *
 * Kanonik adres artık `/urunler/cyclops/`. Eski `/cyclops/` adresi 301 ile
 * yönlendirilir (bkz. `src/config/redirects.ts`, `origin: "internal"`) ve
 * statik çıktıda sayfa olarak ÜRETİLMEZ — bu yüzden testler kanonik adresi
 * kullanır. Yönlendirmenin kendisi `tests/e2e/seo.spec.ts` içinde denetlenir.
 */
const ROUTES = ["/urunler/cyclops/", "/en/products/cyclops/"] as const;
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

test.describe("rota ve yapı", () => {
  for (const route of ROUTES) {
    test(`${route} 200 dönüyor ve tek H1 taşıyor`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      const robots = await page.locator('meta[name="robots"]').getAttribute("content");
      expect(robots).toContain("noindex");
    });

    test(`${route} signal→action sırası doğru`, async ({ page }) => {
      await page.goto(route);
      const order = await page
        .locator('[data-testid="product-flow"] [data-flow-step]')
        .evaluateAll((els) => els.map((el) => el.getAttribute("data-flow-step")));
      expect(order).toEqual(["signal", "context", "correlate", "decide", "act"]);

      const detail = await page
        .locator('[data-testid="product-flow-detail"] [data-flow-step]')
        .evaluateAll((els) => els.map((el) => el.getAttribute("data-flow-step")));
      expect(detail).toEqual(["signal", "context", "correlate", "decide", "act"]);
    });
  }

  test("dil karşılığı iki yönlü", async ({ page }) => {
    await page.goto("/urunler/cyclops/");
    await page.getByTestId("lang-link-en").click();
    await expect(page).toHaveURL(/\/en\/products\/cyclops\/$/);
    await page.getByTestId("lang-link-tr").click();
    await expect(page).toHaveURL(/\/urunler\/cyclops\/$/);
  });
});

test.describe("ilk ekran hikâyesi", () => {
  test.use({ viewport: DESKTOP });

  test("CyclOps'un Duosis ürünü olduğu ilk viewport'ta görünür", async ({ page }) => {
    await page.goto("/urunler/cyclops/");
    const eyebrow = page.locator(".hero__eyebrow");
    await expect(eyebrow).toBeInViewport();
    await expect(eyebrow).toContainText(/duosis/i);

    // Wordmark, değer önerisi, konumlandırma ve beş adım adı ilk ekranda.
    for (const selector of [".hero__wordmark", "h1", ".hero__positioning"]) {
      await expect(page.locator(selector)).toBeInViewport();
    }
    const steps = page.locator('[data-testid="product-flow"] .chain__title');
    await expect(steps).toHaveCount(5);
    for (const step of await steps.all()) await expect(step).toBeInViewport();
  });

  test("izleme araçlarının yerine geçmediği açıkça yazıyor", async ({ page }) => {
    await page.goto("/urunler/cyclops/");
    await expect(page.locator(".hero__positioning")).toContainText(/yerine geçmez/i);
    await page.goto("/en/products/cyclops/");
    await expect(page.locator(".hero__positioning")).toContainText(/does not replace/i);
  });
});

test.describe("ürün ekranları", () => {
  test("üç gerçek ekran, gerçek boyutlarıyla yükleniyor", async ({ page }) => {
    await page.goto("/urunler/cyclops/", { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 40));
      }
      window.scrollTo(0, 0);
    });
    const screens = page.locator('[data-testid="product-screen"]');
    await expect(screens).toHaveCount(3);
    const info = await screens.evaluateAll((els) =>
      els.map((el) => {
        const img = el as HTMLImageElement;
        return {
          natural: img.naturalWidth,
          alt: img.getAttribute("alt") ?? "",
          width: img.getAttribute("width"),
          height: img.getAttribute("height"),
          loading: img.getAttribute("loading"),
        };
      })
    );
    for (const [index, img] of info.entries()) {
      expect(img.natural, "görsel yüklenmedi").toBeGreaterThan(0);
      expect(img.alt.length, "alt metni yetersiz").toBeGreaterThan(20);
      expect(img.width, "width yok (CLS riski)").not.toBeNull();
      expect(img.height, "height yok (CLS riski)").not.toBeNull();
      expect(img.loading).toBe(index === 0 ? "eager" : "lazy");
    }
  });

  test("AVIF/WebP türevleri ve fallback üretilmiş", async ({ page }) => {
    await page.goto("/urunler/cyclops/");
    const types = await page
      .locator('[data-testid="product-screens"] picture source')
      .evaluateAll((els) => els.map((el) => el.getAttribute("type")));
    expect(types).toContain("image/avif");
    expect(types).toContain("image/webp");
    const fallback = await page
      .locator('[data-testid="product-screen"]')
      .first()
      .getAttribute("src");
    expect(fallback).toMatch(/\.(png|jpe?g)$/);
  });

  test("her ekranda GERÇEK ÜRÜN EKRANI ayrımı yapılıyor", async ({ page }) => {
    await page.goto("/urunler/cyclops/");
    const badges = page.locator('[data-testid="product-screens"] .screens__badge');
    await expect(badges).toHaveCount(3);
    await expect(badges.first()).toContainText(/gerçek ürün ekranı/i);
  });

  test("galeride klavye tuzağı YOK: sahte tıklanabilir öğe yok", async ({ page }) => {
    await page.goto("/urunler/cyclops/");
    const gallery = page.locator('[data-testid="product-screens"]');
    // Modal yok; büyütme yok. Rol taklidi yapan div/span bulunmamalı.
    await expect(gallery.locator('[role="button"], [onclick], div[tabindex]')).toHaveCount(0);
    await expect(gallery.locator("dialog")).toHaveCount(0);
  });

  test("dış istek YOK", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (!url.includes("127.0.0.1") && !url.includes("localhost")) external.push(url);
    });
    await page.goto("/urunler/cyclops/", { waitUntil: "networkidle" });
    expect(external).toEqual([]);
  });
});

test.describe("hassas veri taraması", () => {
  test("sayfa metninde IP, kimlik bilgisi veya token görünmüyor", async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route);
      const text = await page.locator("main").innerText();
      // IPv4
      expect(text, `${route} IP adresi içeriyor`).not.toMatch(/\b\d{1,3}(\.\d{1,3}){3}\b/);
      for (const term of [
        "community string",
        "password",
        "parola",
        "token",
        "api key",
        "bearer ",
        "@gmail",
        "@hotmail",
      ]) {
        expect(text.toLowerCase().includes(term), `${route} "${term}" içeriyor`).toBe(false);
      }
    }
  });

  test("pending teknoloji adı sızmıyor", async ({ page }) => {
    // ADR-011 ile yayına AÇILMAYAN kayıtlar.
    const pending = [
      "GLPi",
      "Grafana",
      "Jira",
      "KACE",
      "Kron",
      "Pandora FMS",
      "PostgreSQL",
      "Runecast",
      "runZero",
      "SolarWinds",
      "STOR2RRD",
      "Tableau",
      "Vertica",
    ];
    for (const route of ROUTES) {
      await page.goto(route);
      const text = await page.locator("main").innerText();
      for (const name of pending) {
        const pattern = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        expect(pattern.test(text), `${route} "${name}" içeriyor`).toBe(false);
      }
    }
  });

  test("kanıtsız pazarlama iddiası yok", async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route);
      const text = (await page.locator("main").innerText()).toLowerCase();
      for (const claim of [
        "every event",
        "fully autonomous",
        "self-healing",
        "future-proof",
        "starter pack",
        "mttr",
        "iş ortağı",
        "sertifikalı",
      ]) {
        expect(text.includes(claim), `${route} "${claim}" içeriyor`).toBe(false);
      }
    }
  });

  test("logo YALNIZCA CyclOps için render ediliyor", async ({ page }) => {
    await page.goto("/urunler/cyclops/");
    // Entegrasyon listesi metin; hiçbir üçüncü taraf logosu yok.
    await expect(page.locator('[data-testid="integration-list"] img')).toHaveCount(0);
    const wordmark = page.locator(".hero__wordmark img");
    await expect(wordmark).toHaveAttribute("src", "/brand/cyclops-wordmark.png");
  });
});

test.describe("CTA", () => {
  test("CTA kapalı ürün allowlist'ini kullanıyor", async ({ page }) => {
    await page.goto("/urunler/cyclops/");
    const hrefs = await page
      .locator('[data-analytics-event="product-cta"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href).toBe("/iletisim/?topic=cyclops");

    await page.goto("/en/products/cyclops/");
    const enHrefs = await page
      .locator('[data-analytics-event="product-cta"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    for (const href of enHrefs) expect(href).toBe("/en/contact/?topic=cyclops");
  });

  test("CTA hiçbir analytics isteği başlatmıyor", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (!url.includes("127.0.0.1") && !url.includes("localhost")) external.push(url);
    });
    await page.goto("/urunler/cyclops/");
    await page.locator('[data-analytics-event="product-cta"]').first().click();
    await page.waitForURL(/\/iletisim\/\?topic=cyclops$/);
    expect(external).toEqual([]);
  });
});

test.describe("düzen", () => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    test(`yatay taşma yok: ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ROUTES) {
        await page.goto(route, { waitUntil: "networkidle" });
        const box = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        expect(box.scroll, `${route} @${width}`).toBeLessThanOrEqual(box.client);
      }
    });
  }

  test("mobilde ürün görselleri kabına sığıyor", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/urunler/cyclops/", { waitUntil: "networkidle" });
    const widths = await page
      .locator('[data-testid="product-screen"]')
      .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().width)));
    for (const width of widths) expect(width).toBeLessThanOrEqual(MOBILE.width);
  });
});

test.describe("hareket azaltma", () => {
  test.use({ viewport: DESKTOP });

  test("prefers-reduced-motion altında hareket duruyor", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/urunler/cyclops/");

    // Token sözleşmesi: hareket süreleri 1ms'e iner (`tokens.css` içindeki
    // `prefers-reduced-motion` bloğu), yani algılanabilir hareket kalmaz.
    // 1ms'i AŞAN her süre ihlaldir; hangi öğe olduğu da raporlanır.
    const moving = await page.evaluate(() => {
      const durationMs = (value: string): number =>
        value
          .split(",")
          .map((part) => {
            const trimmed = part.trim();
            const number = Number.parseFloat(trimmed);
            if (Number.isNaN(number)) return 0;
            return trimmed.endsWith("ms") ? number : number * 1000;
          })
          .reduce((max, current) => Math.max(max, current), 0);

      return [...document.querySelectorAll("main *")]
        .filter((el) => {
          const style = getComputedStyle(el);
          const animated =
            style.animationName !== "none" && durationMs(style.animationDuration) > 1;
          return animated || durationMs(style.transitionDuration) > 1;
        })
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className)}`);
    });
    expect(moving).toEqual([]);
  });
});

test.describe("erişilebilirlik", () => {
  for (const route of ROUTES) {
    test(`WCAG 2.2 AA ihlali yok: ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
