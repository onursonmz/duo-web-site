import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * TASARIM SİSTEMİ KABUL TESTLERİ.
 *
 * S03 kabul kriterlerini gerçek tarayıcıda doğrular: erişilebilirlik, odak
 * görünürlüğü, klavye sırası, 320px/200% zoom reflow, hareket azaltma,
 * font fallback ve dev-preview indeksleme davranışı.
 */

const DS = "/design-system/";

/** WCAG reflow tabanı ve 1280 pencerede %200 zoom karşılığı. */
const REFLOW_VIEWPORTS = [
  { name: "320px", width: 320, height: 800 },
  { name: "200% zoom (640px)", width: 640, height: 800 },
];

const PUBLIC_ROUTES = ["/", "/en/", "/cozumler/", "/cozumler/operasyonel-gorunurluk/"];

test.describe("design-system — dev preview davranışı", () => {
  test("sayfa yüklenir ve tek H1 taşır", async ({ page }) => {
    await page.goto(DS);
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText(/Tasarım sistemi/);
  });

  test("NOINDEX: arama motoru dizinine girmez", async ({ page }) => {
    await page.goto(DS);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("hiçbir ÜRETİM sayfası design-system'e link vermez", async ({ page }) => {
    for (const route of PUBLIC_ROUTES) {
      await page.goto(route);
      const links = await page.locator('a[href*="design-system"]').count();
      expect(links, `${route} design-system'e link veriyor`).toBe(0);
    }
  });
});

test.describe("design-system — erişilebilirlik", () => {
  test("@a11y axe kontrolünden geçer (açık ve koyu bölümler dahil)", async ({ page }) => {
    await page.goto(DS);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });

  test("@a11y 320px genişlikte de axe kontrolünden geçer", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(DS);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });

  test("odak göstergesi GÖRÜNÜR bir outline üretir", async ({ page }) => {
    await page.goto(DS);

    // İlk etkileşimli öğeye kadar ilerle (skip link ilk sıradadır).
    await page.keyboard.press("Tab");
    const focusStyle = await page.evaluate(() => {
      const el = document.activeElement;
      if (el === null) return null;
      const s = getComputedStyle(el);
      return { width: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor };
    });

    expect(focusStyle).not.toBeNull();
    expect(focusStyle?.style).not.toBe("none");
    expect(Number.parseFloat(focusStyle?.width ?? "0")).toBeGreaterThanOrEqual(2);
  });

  test("klavye tab sırası belge sırasını izler", async ({ page }) => {
    await page.goto(DS);

    const seen: string[] = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      const id = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (el === null) return "";
        return el.id || el.getAttribute("href") || el.tagName.toLowerCase();
      });
      seen.push(id);
    }

    // İlk durak skip link olmalı; hiçbir durak boş kalmamalı.
    expect(seen[0]).toBe("#main-content");
    expect(seen.filter((s) => s === "")).toEqual([]);
  });

  test("DEVRE DIŞI bağlantı odak sırasına girmez", async ({ page }) => {
    await page.goto(DS);
    const disabled = page.locator('a[aria-disabled="true"]');
    const count = await disabled.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(disabled.nth(i)).toHaveAttribute("tabindex", "-1");
      // Devre dışı bağlantı gezinilebilir olmamalı.
      expect(await disabled.nth(i).getAttribute("href")).toBeNull();
    }
  });

  test("geniş tablo SAYFAYI değil kendini kaydırır ve klavyeyle erişilebilir", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(DS);

    const region = page.locator(".scroll-x");
    await expect(region).toHaveAttribute("tabindex", "0");
    await expect(region).toHaveAttribute("role", "region");

    const overflows = await region.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(overflows, "tablo kabı dar ekranda kaydırılabilir olmalı").toBe(true);
  });
});

test.describe("reflow — yatay taşma yok", () => {
  for (const vp of REFLOW_VIEWPORTS) {
    test(`${vp.name}: design-system yatay taşma üretmiyor`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(DS);
      const r = await page.evaluate(() => ({
        vw: document.documentElement.clientWidth,
        scrollW: document.documentElement.scrollWidth,
      }));
      expect(r.scrollW, `${vp.name} scrollWidth=${r.scrollW} > ${r.vw}`).toBeLessThanOrEqual(r.vw);
    });

    test(`${vp.name}: üretim sayfaları yatay taşma üretmiyor`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const route of PUBLIC_ROUTES) {
        await page.goto(route);
        const r = await page.evaluate(() => ({
          vw: document.documentElement.clientWidth,
          scrollW: document.documentElement.scrollWidth,
        }));
        expect(r.scrollW, `${route} @ ${vp.name}`).toBeLessThanOrEqual(r.vw);
      }
    });
  }
});

test.describe("hareket azaltma", () => {
  test("prefers-reduced-motion altında geçiş süreleri sıfırlanır", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(DS);

    const durations = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      return {
        fast: root.getPropertyValue("--motion-fast").trim(),
        base: root.getPropertyValue("--motion-base").trim(),
        slow: root.getPropertyValue("--motion-slow").trim(),
      };
    });

    expect(durations.fast).toBe("1ms");
    expect(durations.base).toBe("1ms");
    expect(durations.slow).toBe("1ms");
  });

  test("prefers-reduced-motion altında spinner animasyonu durur", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(DS);

    const animation = await page
      .locator(".btn__spinner")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe("none");
  });

  test("hareket açıkken token süreleri sözleşme aralığındadır (160-360ms)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(DS);

    // Tarayıcı süreleri normalize edebilir ("160ms" -> "0.16s"), bu yüzden
    // birim açıkça çözülür.
    const durations = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const toMs = (raw: string): number => {
        const value = Number.parseFloat(raw);
        return raw.trim().endsWith("ms") ? value : value * 1000;
      };
      return ["--motion-fast", "--motion-base", "--motion-slow"].map((n) =>
        toMs(root.getPropertyValue(n))
      );
    });

    for (const d of durations) {
      expect(d).toBeGreaterThanOrEqual(160);
      expect(d).toBeLessThanOrEqual(360);
    }
  });
});

test.describe("tipografi ve font yükleme", () => {
  test("self-host fontlar yüklenir ve HARİCİ font isteği yapılmaz", async ({ page }) => {
    const external: string[] = [];
    const fontRequests: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (/fonts\.(googleapis|gstatic)\.com/.test(url)) external.push(url);
      if (url.endsWith(".woff2")) fontRequests.push(new URL(url).pathname);
    });

    await page.goto(DS, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);

    expect(external, "harici CDN font isteği yapılmamalı").toEqual([]);
    expect(fontRequests.length, "self-host woff2 yüklenmeli").toBeGreaterThan(0);
    for (const path of fontRequests) {
      expect(path.startsWith("/fonts/"), `beklenmeyen font yolu: ${path}`).toBe(true);
    }
  });

  test("FONT YÜKLENMEZSE düzen bozulmaz (fallback ile yükseklik farkı sınırlı)", async ({
    browser,
  }) => {
    /** Başlığın kapladığı yüksekliği ölçer. */
    const measure = async (blockFonts: boolean): Promise<number> => {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      if (blockFonts) {
        await page.route("**/*.woff2", (route) => route.abort());
      }
      await page.goto(DS, { waitUntil: "networkidle" });
      const height = await page.locator("h1").evaluate((el) => el.getBoundingClientRect().height);
      await ctx.close();
      return height;
    };

    const withFont = await measure(false);
    const withoutFont = await measure(true);

    // Metrik hizalanmış fallback: yükseklik farkı %10'u aşmamalı (CLS kontrolü).
    const delta = Math.abs(withFont - withoutFont) / withFont;
    expect(delta, `font olmadan H1 yüksekliği ${withoutFont}px, fontla ${withFont}px`).toBeLessThan(
      0.1
    );
  });
});

test.describe("tema bağlamı", () => {
  test("koyu bölüm açık bölümden FARKLI yüzey rengi kullanır", async ({ page }) => {
    await page.goto(DS);

    const light = await page
      .locator("#ds-color")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const dark = await page
      .locator("#ds-dark")
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    expect(light).not.toBe(dark);
  });

  test("koyu bölümde marka cyanı signal olarak devreye girer", async ({ page }) => {
    await page.goto(DS);
    const signal = await page
      .locator("#ds-dark")
      .evaluate((el) => getComputedStyle(el).getPropertyValue("--signal").trim());
    expect(signal.toLowerCase()).toBe("#16a6de");
  });
});
