import { expect, test } from "@playwright/test";

/**
 * HAREKET SİSTEMİ KABUL TESTLERİ (S15-R1).
 *
 * NEDEN VAR: S15'te yazılan scroll tabanlı açılışlar ÜRETİM DERLEMESİNDE hiç
 * çalışmıyordu ve bu fark edilmemişti. Kök neden ölçüldü:
 *
 *   CSS küçültücü `animation: <ad> linear both;` + `animation-timeline: view();`
 *   çiftini `animation: linear both <ad> view()` kısayoluna BİRLEŞTİRİYOR.
 *   `animation` kısayolu `<single-animation-timeline>` KABUL ETMEDİĞİ için
 *   tarayıcı bildirimin tamamını düşürüyor; sonuç `animation-name: none`.
 *
 * Geliştirme sunucusunda CSS küçültülmediği için sorun görünmüyordu. Çözüm
 * `animation-timeline: var(--scroll-timeline)` (bkz. `src/styles/tokens.css`).
 *
 * Bu dosya iki yönden denetler:
 *   1. Üretilen CSS'te bozuk kısayol biçimi HİÇ bulunmaz.
 *   2. Tarayıcıda açılış animasyonları GERÇEKTEN bağlanır.
 */

const DESKTOP = { width: 1440, height: 900 };

/** Scroll tabanlı açılış kullanan öğeler. */
const REVEAL_TARGETS = [
  { route: "/", selector: ".journey__inner" },
  { route: "/", selector: '[data-bridge="flow-out"] .bridge__spine' },
  { route: "/", selector: '[data-bridge="converge"] .bridge__branch' },
  { route: "/", selector: ".decade__item" },
];

test.describe("scroll tabanlı açılış gerçekten bağlanıyor", () => {
  test.use({ viewport: DESKTOP });

  test("üretilen CSS bozuk `animation: … view()` kısayolunu İÇERMİYOR", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const hrefs = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map((el) => el.href)
    );
    const inline = await page.evaluate(() =>
      [...document.querySelectorAll("style")].map((el) => el.textContent ?? "")
    );

    const sources = [...inline];
    for (const href of hrefs) {
      const response = await page.request.get(href);
      expect(response.ok(), `stil indirilemedi: ${href}`).toBe(true);
      sources.push(await response.text());
    }
    expect(sources.length, "hiç stil kaynağı bulunamadı").toBeGreaterThan(0);

    /*
     * Bozuk biçim: `animation` kısayolunun İÇİNDE `view(` veya `scroll(`.
     * Doğru biçim ayrı bir `animation-timeline` bildirimidir ve bu desene
     * takılmaz.
     */
    const broken: string[] = [];
    for (const css of sources) {
      for (const match of css.matchAll(/animation\s*:[^;}]*\b(?:view|scroll)\s*\(/g)) {
        broken.push(match[0]);
      }
    }
    expect(
      broken,
      `\`animation\` kısayolunun içine zaman çizelgesi birleştirilmiş: ${broken.join(" | ")}`
    ).toEqual([]);
  });

  for (const target of REVEAL_TARGETS) {
    test(`${target.selector} açılışı tarayıcıda bağlanıyor`, async ({ page }) => {
      await page.goto(target.route, { waitUntil: "networkidle" });

      const supported = await page.evaluate(() => CSS.supports("animation-timeline: view()"));
      test.skip(!supported, "tarayıcı scroll tabanlı animasyonu desteklemiyor");

      const state = await page
        .locator(target.selector)
        .first()
        .evaluate((el) => {
          const style = getComputedStyle(el);
          return {
            name: style.animationName,
            timeline: style.getPropertyValue("animation-timeline"),
          };
        });

      expect(state.name, `${target.selector} animasyon adı`).not.toBe("none");
      expect(state.timeline, `${target.selector} zaman çizelgesi`).not.toBe("auto");
    });
  }

  test("açılış tamamlandığında çizgiler SON hâlinde", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const bridge = page.locator('[data-bridge="flow-out"]').first();
    const y = await bridge.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    await page.evaluate((top) => window.scrollTo(0, Math.max(0, top - 300)), y);
    await page.waitForTimeout(600);

    const offsets = await bridge
      .locator(".bridge__spine, .bridge__bus, .bridge__branch")
      .evaluateAll((els) =>
        els.map((el) => Number.parseFloat(getComputedStyle(el).strokeDashoffset))
      );
    expect(offsets.length).toBeGreaterThan(0);
    for (const offset of offsets) {
      expect(offset, "geçiş yarım kalmış").toBeLessThanOrEqual(1);
    }
  });
});

test.describe("bölüm geçişleri", () => {
  test.use({ viewport: DESKTOP });

  test("üç imza geçişi de sayfada ve DEKORATİF", async ({ page }) => {
    await page.goto("/");
    for (const variant of ["flow-out", "aperture", "converge"]) {
      const bridge = page.locator(`[data-bridge="${variant}"]`).first();
      await expect(bridge, `${variant} geçişi yok`).toHaveCount(1);
      await expect(bridge).toHaveAttribute("aria-hidden", "true");
    }
  });

  test("geçişler başlık hiyerarşisine ve odak sırasına KARIŞMIYOR", async ({ page }) => {
    await page.goto("/");
    const intrusive = await page.evaluate(() =>
      [...document.querySelectorAll("[data-bridge]")].reduce(
        (sum, el) => sum + el.querySelectorAll("h1,h2,h3,h4,a,button,input,[tabindex]").length,
        0
      )
    );
    expect(intrusive).toBe(0);
  });

  test("geçişler yatay taşma üretmiyor", async ({ page }) => {
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/", { waitUntil: "networkidle" });
      const metrics = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      expect(metrics.scroll, `${width}px genişlikte yatay taşma`).toBeLessThanOrEqual(
        metrics.client
      );
    }
  });

  test("REDUCED MOTION altında geçişler SON durumda duruyor", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const state = await page
      .locator('[data-bridge="flow-out"] .bridge__spine')
      .first()
      .evaluate((el) => {
        const style = getComputedStyle(el);
        return { name: style.animationName, offset: Number.parseFloat(style.strokeDashoffset) };
      });
    expect(state.name).toBe("none");
    expect(state.offset).toBe(0);

    await expect(page.locator('[data-bridge="flow-out"] .bridge__pulse').first()).toBeHidden();
  });
});

test.describe("ürün sahneleri: dört FARKLI hareket dili", () => {
  test.use({ viewport: DESKTOP });

  test("dört ürünün sahnesi AYNI SVG'nin varyasyonu DEĞİL", async ({ page }) => {
    await page.goto("/urunler/");

    const scenes = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>(".pscene")].map((el) => ({
        motion: el.dataset["motion"] ?? "",
        // Geometri parmak izi: hangi sınıflar var ve kaç tane.
        shape: [...el.querySelectorAll<SVGElement>("svg *")]
          .map((node) => node.getAttribute("class") ?? node.tagName)
          .sort()
          .join(","),
        labels: [...el.querySelectorAll(".pscene__label")].map((n) => n.textContent?.trim() ?? ""),
        steps: el.querySelectorAll(".pscene__step").length,
      }))
    );

    expect(scenes).toHaveLength(4);
    expect(scenes.map((s) => s.motion).sort()).toEqual([
      "allocate",
      "answer",
      "converge",
      "organise",
    ]);

    // Geometri parmak izleri BİRBİRİNDEN FARKLI olmalı.
    const fingerprints = new Set(scenes.map((s) => s.shape));
    expect(fingerprints.size, "sahneler aynı geometriyi paylaşıyor").toBe(4);

    // Adım sayısı ürüne göre gerçekten değişiyor (topoloji farkı).
    const steps = new Set(scenes.map((s) => s.steps));
    expect(steps.size, "tüm ürünlerde aynı sayıda adım var").toBeGreaterThan(1);

    // Düğüm etiketleri BOŞ olamaz.
    for (const scene of scenes) {
      expect(scene.labels.length, `${scene.motion} sahnesinde etiket yok`).toBeGreaterThanOrEqual(
        3
      );
      for (const label of scene.labels) {
        expect(label.length, `${scene.motion} sahnesinde boş etiket`).toBeGreaterThan(2);
      }
      expect(scene.steps, `${scene.motion} adım listesi boş`).toBeGreaterThanOrEqual(3);
    }
  });

  test("sekme seçimi sahneyi, açıklamayı ve CTA'yı BİRLİKTE değiştiriyor", async ({ page }) => {
    await page.goto("/urunler/");

    for (const slug of ["hermes", "logislot", "ravskald", "cyclops"]) {
      await page.locator(`[data-eco-tab="${slug}"]`).click();
      const panel = page.locator(`[data-eco-panel="${slug}"]`);
      await expect(panel).toBeVisible();
      await expect(panel.locator(`[data-testid="product-scene-${slug}"]`)).toBeVisible();
      await expect(panel.locator(".eco__panel-cta")).toHaveAttribute(
        "href",
        new RegExp(`/urunler/${slug}/$`)
      );

      // Diğer üç ürün gerçekten gizli.
      const visible = await page.evaluate(
        () =>
          [...document.querySelectorAll<HTMLElement>("[data-eco-panel]")].filter((el) => !el.hidden)
            .length
      );
      expect(visible, "aynı anda birden fazla ürün görünüyor").toBe(1);
    }
  });

  test("OTOMATİK DÖNEN carousel yok: sahne kendiliğinden değişmiyor", async ({ page }) => {
    await page.goto("/urunler/");
    const first = await page.evaluate(
      () =>
        document.querySelector<HTMLElement>("[data-eco-panel]:not([hidden])")?.dataset[
          "ecoPanel"
        ] ?? ""
    );
    await page.waitForTimeout(4500);
    const later = await page.evaluate(
      () =>
        document.querySelector<HTMLElement>("[data-eco-panel]:not([hidden])")?.dataset[
          "ecoPanel"
        ] ?? ""
    );
    expect(later).toBe(first);
  });

  test("REDUCED MOTION altında sahne ANLAMLI SON durumda", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/urunler/");
    await page.locator('[data-eco-tab="hermes"]').click();

    const records = await page.locator('[data-eco-panel="hermes"] .ps-record').evaluateAll((els) =>
      els.map((el) => {
        const style = getComputedStyle(el);
        return { name: style.animationName, opacity: Number.parseFloat(style.opacity) };
      })
    );
    expect(records.length).toBeGreaterThan(0);
    for (const record of records) {
      expect(record.name).toBe("none");
      expect(record.opacity).toBe(1);
    }

    await page.locator('[data-eco-tab="logislot"]').click();
    const pick = await page
      .locator('[data-eco-panel="logislot"] .ps-cell--pick')
      .first()
      .evaluate((el) => {
        const style = getComputedStyle(el);
        return { name: style.animationName, opacity: Number.parseFloat(style.opacity) };
      });
    expect(pick.name).toBe("none");
    expect(pick.opacity).toBe(1);
  });
});

test.describe("ürün sahneleri JavaScript olmadan", () => {
  test.use({ viewport: DESKTOP, javaScriptEnabled: false });

  test("dört ürün de sahnesiyle birlikte okunuyor", async ({ page }) => {
    await page.goto("/urunler/");
    await expect(page.locator("[data-eco-panel]")).toHaveCount(4);
    for (const slug of ["cyclops", "hermes", "logislot", "ravskald"]) {
      await expect(page.locator(`[data-eco-panel="${slug}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="product-scene-${slug}"]`)).toBeVisible();
    }
  });
});
