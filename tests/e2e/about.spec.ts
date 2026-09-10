import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * HAKKIMIZDA VE 10. YIL — KABUL TESTLERİ (S09).
 *
 * Zaman çizelgesi doğrulanmış kayıtlardan üretilir; derin bağlantılar
 * JavaScript'e bağlı değildir ve hareket kapalıyken yumuşak kaydırma
 * uygulanmaz.
 */

const ROUTES = [
  { path: "/hakkimizda/", locale: "tr", anchor: "yolculuk", prefix: "yil" },
  { path: "/en/about/", locale: "en", anchor: "journey", prefix: "year" },
] as const;

const YEARS = [2016, 2019, 2021, 2024, 2025, 2026];
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

test.describe("rota ve yapı", () => {
  for (const route of ROUTES) {
    test(`${route.path} 200, tek H1, noindex`, async ({ page }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("html")).toHaveAttribute("lang", route.locale);
      const robots = await page.locator('meta[name="robots"]').getAttribute("content");
      expect(robots).toContain("noindex");
    });

    test(`${route.path} canonical ve hreflang doğru`, async ({ page }) => {
      await page.goto(route.path);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(new URL(canonical ?? "").pathname).toBe(route.path);

      const alternates = await page.locator('link[rel="alternate"]').evaluateAll((els) =>
        els.map((el) => ({
          lang: el.getAttribute("hreflang"),
          path: new URL(el.getAttribute("href") ?? "", "http://x").pathname,
        }))
      );
      expect(alternates).toEqual(
        expect.arrayContaining([
          { lang: "tr", path: "/hakkimizda/" },
          { lang: "en", path: "/en/about/" },
        ])
      );
    });
  }

  test("navigasyonda Hakkımızda bağlantısı var", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("primary-nav").locator('a[href="/hakkimizda/"]')).toHaveCount(1);
  });
});

test.describe("zaman çizelgesi", () => {
  for (const route of ROUTES) {
    test(`${route.path} yalnızca doğrulanmış kayıtları ve DETERMİNİSTİK sırayı gösteriyor`, async ({
      page,
    }) => {
      await page.goto(route.path);
      const years = await page
        .locator('[data-testid="journey-year"]')
        .evaluateAll((els) => els.map((el) => Number.parseInt(el.textContent ?? "", 10)));
      expect(years).toEqual(YEARS);
    });

    test(`${route.path} her yılın kararlı çapası var`, async ({ page }) => {
      await page.goto(route.path);
      const ids = await page
        .locator('[data-testid="journey-year"]')
        .evaluateAll((els) => els.map((el) => el.id));
      expect(ids).toEqual(YEARS.map((year) => `${route.prefix}-${year}`));

      const jump = await page
        .locator(".journey__jump a")
        .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
      expect(jump).toEqual(ids.map((id) => `#${id}`));
    });

    test(`${route.path} her hash DOĞRU başlığa gidiyor`, async ({ page }) => {
      for (const year of YEARS) {
        const id = `${route.prefix}-${year}`;
        await page.goto(`${route.path}#${id}`);
        const target = page.locator(`#${id}`);
        await expect(target).toHaveText(String(year));
        await expect(target).toBeInViewport();
        // Sticky/yapışkan bir başlık hedefi KAPATMAMALI.
        const top = await target.evaluate((el) => el.getBoundingClientRect().top);
        expect(top, `${id} viewport üstünde kalıyor`).toBeGreaterThanOrEqual(0);
      }
    });

    test(`${route.path} zaman çizelgesi bölümünün kendi çapası var`, async ({ page }) => {
      await page.goto(`${route.path}#${route.anchor}`);
      await expect(page.locator(`#${route.anchor}`)).toHaveCount(1);
    });
  }

  test("son düğüm 2026 ve vurgulanıyor", async ({ page }) => {
    await page.goto("/hakkimizda/");
    const last = page.locator('[data-testid="journey-list"] > li').last();
    await expect(last).toHaveAttribute("data-year", "2026");
    await expect(last).toHaveAttribute("data-latest", "true");
  });

  test("ana sayfa önizlemesi tam zaman çizelgesine bağlanıyor", async ({ page }) => {
    await page.goto("/");
    const link = page.getByTestId("decade-journey-link");
    await expect(link).toHaveAttribute("href", "/hakkimizda/#yolculuk");
    await link.click();
    await expect(page).toHaveURL(/\/hakkimizda\/#yolculuk$/);
    await expect(page.locator("#yolculuk")).toBeVisible();

    await page.goto("/en/");
    await expect(page.getByTestId("decade-journey-link")).toHaveAttribute(
      "href",
      "/en/about/#journey"
    );
  });
});

test.describe("içerik güvenliği", () => {
  for (const route of ROUTES) {
    test(`${route.path} yasak müşteri/partner/sayısal iddia taşımıyor`, async ({ page }) => {
      await page.goto(route.path);
      const text = (await page.locator("main").innerText()).toLocaleLowerCase("tr");

      for (const claim of [
        "müşteri",
        "customer",
        "iş ortağı",
        "havalimanı",
        "airport",
        "microfocus",
        "device42",
        "confluent",
        "instana",
      ]) {
        expect(text.includes(claim), `${route.path} "${claim}" içeriyor`).toBe(false);
      }

      // Kısa terimler kelime sınırıyla: "katman" içindeki "atm" ihlal değildir.
      for (const pattern of [/\batm\b/, /\bbank/, /\bibm\b/, /\bpartner/]) {
        expect(pattern.test(text), `${route.path} ${pattern} içeriyor`).toBe(false);
      }

      // "5+", "50'den fazla" gibi büyüme iddiaları.
      expect(text).not.toMatch(/\d+\s*\+/);
      expect(text).not.toMatch(/\d+'?den fazla/);
    });

    test(`${route.path} kişisel veri ve çalışan fotoğrafı yok`, async ({ page }) => {
      await page.goto(route.path);
      // Ekip bölümünde hiçbir görsel yok.
      await expect(page.locator('[data-testid="about-team"] img')).toHaveCount(0);
      const text = await page.locator("main").innerText();
      expect(text).not.toMatch(/[a-z0-9._%-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
      expect(text).not.toMatch(/\blinkedin\b/i);
    });

    test(`${route.path} kurumsal klişe kullanmıyor`, async ({ page }) => {
      await page.goto(route.path);
      const text = (await page.locator("main").innerText()).toLocaleLowerCase("tr");
      for (const cliche of ["yenilikçi", "dinamik", "tutkulu", "vizyoner"]) {
        expect(text.includes(cliche), `"${cliche}" klişesi geçiyor`).toBe(false);
      }
    });
  }
});

test.describe("düzen ve hareket", () => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    test(`yatay taşma yok: ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ROUTES) {
        await page.goto(route.path);
        const box = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        expect(box.scroll, `${route.path} @${width}`).toBeLessThanOrEqual(box.client);
      }
    });
  }

  test("mobilde zaman çizelgesi YATAY SÜRÜKLEME gerektirmiyor", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/hakkimizda/");
    const overflow = await page.locator('[data-testid="journey-list"]').evaluate((el) => ({
      scroll: el.scrollWidth,
      client: el.clientWidth,
      overflowX: getComputedStyle(el).overflowX,
    }));
    expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);
    expect(["visible", "clip"]).toContain(overflow.overflowX);
  });

  test("hareket AÇIKKEN yumuşak kaydırma var", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/hakkimizda/");
    const behavior = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior
    );
    expect(behavior).toBe("smooth");
  });

  test("hareket KAPALIYKEN yumuşak kaydırma kapanıyor", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/hakkimizda/");
    const behavior = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior
    );
    expect(behavior).toBe("auto");
  });
});

test.describe("erişilebilirlik", () => {
  test.use({ viewport: DESKTOP });

  for (const route of ROUTES) {
    test(`WCAG 2.2 AA ihlali yok: ${route.path}`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test("yıl başlıkları programatik olarak odaklanabilir", async ({ page }) => {
    await page.goto("/hakkimizda/");
    const focused = await page.locator("#yil-2026").evaluate((el) => {
      (el as HTMLElement).focus();
      return document.activeElement === el;
    });
    expect(focused).toBe(true);
  });
});
