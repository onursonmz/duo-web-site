import { expect, test } from "@playwright/test";

/**
 * KOYU FOOTER MARKA GÖRÜNÜRLÜĞÜ (S08 takip kararı).
 *
 * `duosis-wordmark-mono.svg` dolgusunu `currentColor` ile veriyordu; harici
 * `<img>` bu değeri DEVRALMAZ ve SVG kendi varsayılanı olan siyahla render
 * olur. Koyu footer üzerinde logo görünmez hâle geliyordu.
 *
 * Test dosyanın kendisini ölçer: koyu yüzeyde kullanılan varyantın dolgusu
 * footer arka planına karşı yeterli kontrast taşımalı ve geometri mono
 * sürümle AYNI kalmalı.
 */

/** WCAG göreli parlaklık. */
function luminance([r, g, b]: [number, number, number]): number {
  const channel = (value: number): number => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

function parseRgb(value: string): [number, number, number] {
  const parts = value.match(/\d+(\.\d+)?/g);
  if (parts === null || parts.length < 3) throw new Error(`renk okunamadı: ${value}`);
  return [Number(parts[0]), Number(parts[1]), Number(parts[2])];
}

test.describe("koyu footer logosu", () => {
  test("footer koyu yüzey varyantını kullanıyor", async ({ page }) => {
    await page.goto("/");
    const src = await page
      .locator('[data-testid="site-footer"] .site-footer__logo img')
      .getAttribute("src");
    expect(src).toBe("/brand/duosis-wordmark-inverse.svg");
  });

  test("logo GERÇEKTEN render oluyor (bozuk SVG kırık görsel verir)", async ({ page }) => {
    await page.goto("/");
    // XML hatası (ör. yorum içinde çift tire) dosyayı ayrıştırılamaz yapar;
    // metin taraması bunu görmez, `naturalWidth` görür.
    const rendered = await page
      .locator('[data-testid="site-footer"] .site-footer__logo img')
      .evaluate((el) => ({
        complete: (el as HTMLImageElement).complete,
        naturalWidth: (el as HTMLImageElement).naturalWidth,
        naturalHeight: (el as HTMLImageElement).naturalHeight,
      }));
    expect(rendered.complete).toBe(true);
    expect(rendered.naturalWidth).toBeGreaterThan(0);
    expect(rendered.naturalHeight).toBeGreaterThan(0);
  });

  test("logo dolgusu footer arka planına karşı GÖRÜNÜR", async ({ page, request }) => {
    await page.goto("/");
    const background = parseRgb(
      await page
        .locator('[data-testid="site-footer"]')
        .evaluate((el) => getComputedStyle(el).backgroundColor)
    );

    const svg = await (await request.get("/brand/duosis-wordmark-inverse.svg")).text();
    // Dosya kendi dolgusunu yazar; hiçbir `fill` `currentColor` OLMAMALIDIR.
    expect(svg).not.toContain('fill="currentColor"');
    const fills = [...svg.matchAll(/fill="(#[0-9a-fA-F]{6})"/g)].map((m) => m[1] ?? "");
    expect(fills.length).toBeGreaterThan(5);

    for (const fill of new Set(fills)) {
      const rgb: [number, number, number] = [
        Number.parseInt(fill.slice(1, 3), 16),
        Number.parseInt(fill.slice(3, 5), 16),
        Number.parseInt(fill.slice(5, 7), 16),
      ];
      // Logo metin değildir; 3:1 grafik nesnesi eşiği (WCAG 1.4.11) uygulanır.
      expect(contrast(rgb, background), `${fill} kontrastı yetersiz`).toBeGreaterThanOrEqual(3);
    }
  });

  test("ters varyant mono sürümle AYNI geometriyi taşıyor", async ({ request }) => {
    const geometry = async (name: string): Promise<string[]> => {
      const body = await (await request.get(`/brand/${name}`)).text();
      return [...body.matchAll(/ d="([^"]+)"/g)].map((m) => m[1] ?? "");
    };
    const mono = await geometry("duosis-wordmark-mono.svg");
    const inverse = await geometry("duosis-wordmark-inverse.svg");
    expect(inverse).toEqual(mono);
    expect(mono.length).toBeGreaterThan(5);
  });

  test("footer'da geliştirme durumu anlatan metin YOK", async ({ page }) => {
    for (const route of ["/", "/en/"]) {
      await page.goto(route);
      const text = (await page.locator('[data-testid="site-footer"]').innerText()).toLowerCase();
      for (const phrase of [
        "geliştirme aşaması",
        "geliştirme sürümü",
        "development build",
        "arama motorlarına kapalı",
        "closed to search engines",
        "under development",
      ]) {
        expect(text.includes(phrase), `${route} footer "${phrase}" içeriyor`).toBe(false);
      }
    }
  });

  test("noindex metadata KORUNUYOR", async ({ page }) => {
    await page.goto("/");
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("noindex");
  });
});
