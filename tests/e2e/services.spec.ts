import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * S10 — HİZMETLER KABUL TESTLERİ.
 *
 * Kapsam: iki dildeki rotalar, beş hizmetin sırası, hizmet/çözüm ayrımı,
 * CTA allowlist'i, bölgesel bölüm, erişilebilirlik ve taşma eşiği.
 *
 * Testler ÜRETİM çıktısına (public mod) karşı koşar; hiçbir kural preview
 * modundan gevşetilmez.
 */

const ROUTES = { tr: "/hizmetler/", en: "/en/services/" } as const;

/** Kapalı hizmet kümesi — sıra ANLAMLIDIR. */
const TOPICS = ["consulting", "support", "training", "managed-services", "outsourcing"] as const;

const REFLOW_VIEWPORTS = [
  { name: "320px", width: 320, height: 800 },
  { name: "390px", width: 390, height: 844 },
  { name: "768px", width: 768, height: 1024 },
  { name: "1024px", width: 1024, height: 768 },
  { name: "1440px", width: 1440, height: 900 },
] as const;

async function serviceKeys(page: Page): Promise<string[]> {
  return page
    .locator("[data-service]")
    .evaluateAll((els) => els.map((el) => el.getAttribute("data-service") ?? ""));
}

// ---------------------------------------------------------------- 1. rotalar

test.describe("rotalar", () => {
  for (const [locale, url] of Object.entries(ROUTES)) {
    test(`${locale}: ${url} 200 dönüyor ve tek h1 taşıyor`, async ({ page }) => {
      const response = await page.goto(url);
      expect(response?.status(), url).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
    });

    test(`${locale}: beş hizmet SÖZLEŞMEDEKİ sırada render ediliyor`, async ({ page }) => {
      await page.goto(url);
      expect(await serviceKeys(page)).toEqual([...TOPICS]);
    });

    test(`${locale}: her hizmet dört sorunun tamamını gösteriyor`, async ({ page }) => {
      await page.goto(url);
      for (const topic of TOPICS) {
        const entry = page.locator(`[data-service="${topic}"]`);
        // Kapsam listesi + üç sütun (ihtiyaç / çalışma / çıktı) = dört blok.
        await expect(entry.locator(".service__offer-list"), topic).toHaveCount(1);
        await expect(entry.locator(".service__column"), topic).toHaveCount(3);
      }
    });
  }

  test("dil değiştirici iki hizmet sayfasını birbirine bağlıyor", async ({ page }) => {
    await page.goto(ROUTES.tr);
    const alternates = await page
      .locator('link[rel="alternate"]')
      .evaluateAll((els) => els.map((el) => new URL(el.getAttribute("href") ?? "").pathname));
    expect(alternates).toContain("/hizmetler/");
    expect(alternates).toContain("/en/services/");
  });
});

// ------------------------------------------------- 2. hizmet ve çözüm ayrımı

test.describe("hizmet ve çözüm içerikleri ayrı", () => {
  test("hizmet sayfası ayrımı AÇIKÇA kuruyor", async ({ page }) => {
    await page.goto(ROUTES.tr);
    await expect(page.getByTestId("service-distinction")).toBeVisible();
  });

  /**
   * Hizmet sayfası çözüm ŞABLONUNU kullanmaz: problem/fayda/kabiliyet
   * bölümleri çözüm detayına aittir. Aynı içerik iki yerde tekrarlanırsa
   * ziyaretçi hangi sayfada olduğunu ayırt edemez.
   */
  test("hizmet sayfasında çözüm detay şablonu YOK", async ({ page }) => {
    await page.goto(ROUTES.tr);
    await expect(page.getByTestId("solution-detail")).toHaveCount(0);
    await expect(page.locator("#problem-heading")).toHaveCount(0);
    await expect(page.locator("#benefits-heading")).toHaveCount(0);
  });

  /**
   * Ters yön: çözüm detayı hizmet şablonunu taşımaz. İki sayfa birbirine
   * bağlanır ama içerikleri karışmaz.
   */
  test("çözüm detayında hizmet şablonu YOK", async ({ page }) => {
    await page.goto("/cozumler/operasyonel-gorunurluk/");
    await expect(page.locator("[data-service]")).toHaveCount(0);
  });

  test("hizmetler ilgili çözümlere bağlanıyor ve bağlantılar çalışıyor", async ({
    page,
    request,
  }) => {
    await page.goto(ROUTES.tr);
    const related = page.getByTestId("service-related-solutions");
    expect(await related.count()).toBeGreaterThan(0);

    const hrefs = await page
      .locator('[data-testid="service-related-solutions"] a')
      .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
    expect(hrefs.length).toBeGreaterThan(0);

    for (const href of new Set(hrefs)) {
      expect(href, "ilgili çözüm bağlantısı çözüm rotasına gitmeli").toMatch(/^\/cozumler\//);
      const response = await request.get(href);
      expect(response.status(), href).toBe(200);
    }
  });
});

// ---------------------------------------------------------------- 3. CTA

test.describe("iletişim CTA kapalı allowlist taşıyor", () => {
  for (const [locale, url] of Object.entries(ROUTES)) {
    test(`${locale}: her CTA yalnızca kümedeki bir topic taşıyor`, async ({ page }) => {
      await page.goto(url);
      const hrefs = await page
        .locator('[data-testid="service-cta"]')
        .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));

      expect(hrefs).toHaveLength(TOPICS.length);

      for (const href of hrefs) {
        const parsed = new URL(href, "http://localhost");
        const topic = parsed.searchParams.get("topic");
        expect(topic, `${href} topic taşımalı`).not.toBeNull();
        expect(TOPICS as readonly string[], `${topic} allowlist dışı`).toContain(topic);
        // Tek parametre: serbest ek parametre taşınmaz.
        expect([...parsed.searchParams.keys()], href).toEqual(["topic"]);
      }
    });

    test(`${locale}: CTA hedefi gerçek iletişim rotası`, async ({ page, request }) => {
      await page.goto(url);
      const hrefs = await page
        .locator('[data-testid="service-cta"]')
        .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
      for (const href of hrefs) {
        const response = await request.get(href);
        expect(response.status(), href).toBe(200);
      }
    });
  }
});

// ---------------------------------------------------------------- 4. bölgeler

test.describe("bölgesel bölüm", () => {
  const EXPECTED = {
    tr: ["Türkiye", "Orta Asya", "Orta Doğu"],
    en: ["Türkiye", "Central Asia", "Middle East"],
  } as const;

  for (const [locale, url] of Object.entries(ROUTES)) {
    test(`${locale}: yalnızca onaylı üç bölge listeleniyor`, async ({ page }) => {
      await page.goto(url);
      const section = page.getByTestId("regional-presence");
      await expect(section).toBeVisible();

      const names = await section
        .locator(".regions__name")
        .evaluateAll((els) => els.map((el) => el.textContent?.trim() ?? ""));
      expect(names).toEqual([...EXPECTED[locale as "tr" | "en"]]);
    });

    test(`${locale}: uydurma bölge veya ülke iddiası yok`, async ({ page }) => {
      await page.goto(url);
      const text = (await page.getByTestId("regional-presence").innerText()).toLocaleLowerCase(
        "tr"
      );
      for (const forbidden of [
        "ofis",
        "office",
        "müşteri",
        "customer",
        "büyüme bölgesi",
        "growth region",
        "ülkede",
        "countries",
      ]) {
        expect(text.includes(forbidden), `bölge metni "${forbidden}" içeriyor`).toBe(false);
      }
    });
  }

  /**
   * CSS OLMADAN OKUNABİLİRLİK.
   *
   * Bölüm bir haritaya değil, metne dayanır. Tüm stil dosyaları bloklandığında
   * bile bölge adları ve açıklamaları sıralı bir liste olarak okunabilir kalmalı.
   */
  test("CSS yüklenmese de bölge listesi anlaşılır", async ({ page }) => {
    await page.route("**/*.css", (route) => route.abort());
    await page.goto(ROUTES.tr);

    const section = page.getByTestId("regional-presence");
    const items = section.locator("li");
    await expect(items).toHaveCount(3);

    const text = await section.innerText();
    for (const name of EXPECTED.tr) {
      expect(text, `CSS'siz metinde "${name}" bulunmalı`).toContain(name);
    }
    // Liste semantiği korunur: sıralı liste olarak işaretli.
    await expect(section.locator("ol")).toHaveCount(1);
  });

  /**
   * Harita yok, dolayısıyla hover'a gizlenmiş bilgi de yok: bölüm içindeki
   * tüm metin ilk boyamada görünür durumda olmalı.
   */
  test("bilgi hover arkasına saklanmıyor", async ({ page }) => {
    await page.goto(ROUTES.tr);
    const section = page.getByTestId("regional-presence");
    const hiddenCount = await section.locator("*").evaluateAll(
      (els) =>
        els.filter((el) => {
          const style = getComputedStyle(el);
          return style.display === "none" || style.visibility === "hidden";
        }).length
    );
    expect(hiddenCount, "bölge bölümünde gizli düğüm olmamalı").toBe(0);
  });
});

// ---------------------------------------------------------------- 5. düzen

test.describe("responsive ve taşma", () => {
  for (const viewport of REFLOW_VIEWPORTS) {
    test(`${viewport.name}: yatay sayfa taşması yok`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(ROUTES.tr);
      const result = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        viewportW: document.documentElement.clientWidth,
      }));
      expect(
        result.scrollW,
        `${viewport.name} scrollWidth=${result.scrollW} > ${result.viewportW}`
      ).toBeLessThanOrEqual(result.viewportW);
    });
  }

  test("mobilde üç sütun tek sütuna iniyor", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ROUTES.tr);
    const columns = page.locator('[data-service="consulting"] .service__column');
    const lefts = await columns.evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().left))
    );
    // Tek sütun akışında hepsinin sol kenarı aynı hizada olur.
    expect(new Set(lefts).size, "mobilde sütunlar yan yana kalmamalı").toBe(1);
  });

  test("masaüstünde üç sütun yan yana karşılaştırılabiliyor", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(ROUTES.tr);
    const columns = page.locator('[data-service="consulting"] .service__column');
    const lefts = await columns.evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().left))
    );
    expect(new Set(lefts).size, "masaüstünde üç ayrı sütun olmalı").toBe(3);
  });

  test("200% zoom'da yatay taşma yok", async ({ page }) => {
    // 1280 CSS px, %200 yakınlaştırmada yaklaşık 640 px kullanılabilir genişlik.
    await page.setViewportSize({ width: 640, height: 512 });
    await page.goto(ROUTES.tr);
    const result = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      viewportW: document.documentElement.clientWidth,
    }));
    expect(result.scrollW).toBeLessThanOrEqual(result.viewportW);
  });
});

// ---------------------------------------------------------------- 6. a11y

test.describe("erişilebilirlik", () => {
  for (const [locale, url] of Object.entries(ROUTES)) {
    test(`@a11y ${locale}: masaüstü axe temiz`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(url);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(result.violations).toEqual([]);
    });

    test(`@a11y ${locale}: mobil axe temiz`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(url);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(result.violations).toEqual([]);
    });
  }

  test("@a11y klavye ile CTA düğmelerine ulaşılabiliyor", async ({ page }) => {
    await page.goto(ROUTES.tr);
    const ctas = page.getByTestId("service-cta");
    const count = await ctas.count();
    expect(count).toBe(TOPICS.length);

    for (let index = 0; index < count; index += 1) {
      const cta = ctas.nth(index);
      await cta.focus();
      await expect(cta).toBeFocused();
    }
  });

  test("başlık hiyerarşisi atlamıyor", async ({ page }) => {
    await page.goto(ROUTES.tr);
    const levels = await page
      .locator("main h1, main h2, main h3")
      .evaluateAll((els) => els.map((el) => Number(el.tagName.slice(1))));
    expect(levels[0], "ilk başlık h1 olmalı").toBe(1);
    for (let i = 1; i < levels.length; i += 1) {
      const previous = levels[i - 1] ?? 0;
      const current = levels[i] ?? 0;
      expect(current - previous, `h${previous} -> h${current} atlaması`).toBeLessThanOrEqual(1);
    }
  });
});

// ---------------------------------------------------------------- 7. ağ

test.describe("dış bağımlılık yok", () => {
  for (const [locale, url] of Object.entries(ROUTES)) {
    test(`${locale}: hiçbir dış ağ isteği yapılmıyor`, async ({ page }) => {
      const external: string[] = [];
      page.on("request", (request) => {
        const requestUrl = request.url();
        if (!requestUrl.startsWith("http")) return;
        if (new URL(requestUrl).hostname === "127.0.0.1") return;
        external.push(requestUrl);
      });
      await page.goto(url);
      await page.waitForLoadState("networkidle");
      expect(external, `dış istek: ${external.join(", ")}`).toEqual([]);
    });
  }
});
