import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * S11 — İÇGÖRÜ YAYIN SİSTEMİ KABUL TESTLERİ (§15).
 *
 * Kapsam: landing bölümleri, seri/etiket rotaları, uzun yazı şablonu,
 * RSS, BlogPosting yapılandırılmış verisi, erişilebilirlik ve taşma eşiği.
 */

const LANDING = { tr: "/icgoruler/", en: "/en/insights/" } as const;
const FEED = { tr: "/rss.xml", en: "/en/rss.xml" } as const;

/** Yayınlanmış TR yazıları — slug ve serisiyle. */
const TR_ARTICLES = [
  { slug: "zabbix-alarmindan-cyclops-olayina", series: "cyclops-log" },
  { slug: "toplu-isten-olay-tabanli-veri-akisina-gecis", series: "data-and-ai" },
  { slug: "envanterden-karar-sistemine-kurumsal-mimari", series: "architecture-notes" },
  { slug: "operasyon-verisinin-dort-hali", series: "architecture-notes" },
] as const;

const EN_ARTICLES = [{ slug: "from-batch-jobs-to-event-driven-data-flow" }] as const;

const REFLOW_VIEWPORTS = [
  { name: "320px", width: 320, height: 800 },
  { name: "390px", width: 390, height: 844 },
  { name: "768px", width: 768, height: 1024 },
  { name: "1024px", width: 1024, height: 768 },
  { name: "1440px", width: 1440, height: 900 },
] as const;

const trArticle = (slug: string): string => `/icgoruler/${slug}/`;
const enArticle = (slug: string): string => `/en/insights/${slug}/`;

async function horizontalOverflow(page: Page): Promise<{ scrollW: number; viewportW: number }> {
  return page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    viewportW: document.documentElement.clientWidth,
  }));
}

// ------------------------------------------------------------- 1. landing

test.describe("landing", () => {
  for (const [locale, url] of Object.entries(LANDING)) {
    test(`${locale}: 200 dönüyor ve tek h1 taşıyor`, async ({ page }) => {
      const response = await page.goto(url);
      expect(response?.status(), url).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
    });

    test(`${locale}: öne çıkan yazı ve RSS bağlantısı var`, async ({ page }) => {
      await page.goto(url);
      await expect(page.getByTestId("featured-block")).toBeVisible();
      await expect(page.getByTestId("insight-featured")).toHaveCount(1);
      await expect(page.getByTestId("rss-link")).toHaveAttribute(
        "href",
        FEED[locale as "tr" | "en"]
      );
    });

    test(`${locale}: seri ve etiket dizini görünüyor`, async ({ page }) => {
      await page.goto(url);
      await expect(page.getByTestId("series-index")).toBeVisible();
      await expect(page.getByTestId("tag-index")).toBeVisible();
    });
  }

  test("TR landing dört yazıyı da gösteriyor", async ({ page }) => {
    await page.goto(LANDING.tr);
    const slugs = await page
      .locator("[data-slug]")
      .evaluateAll((els) => els.map((el) => el.getAttribute("data-slug") ?? ""));
    for (const article of TR_ARTICLES) {
      expect(slugs, `${article.slug} listede yok`).toContain(article.slug);
    }
  });

  /** Öne çıkan = en yeni. Elle işaretlenmiş bir bayrak yok. */
  test("öne çıkan yazı listedeki EN YENİ yazı", async ({ page }) => {
    await page.goto(LANDING.tr);
    const featuredDate = await page
      .getByTestId("insight-featured")
      .locator("time")
      .getAttribute("datetime");
    const allDates = await page
      .locator("[data-slug] time")
      .evaluateAll((els) => els.map((el) => el.getAttribute("datetime") ?? ""));
    const newest = [...allDates].sort().reverse()[0];
    expect(featuredDate).toBe(newest);
  });
});

// -------------------------------------------------- 2. taslak / ileri tarih

test.describe("görünürlük kuralları", () => {
  /**
   * `tests/unit/insight-model.test.ts` tarih filtresinin mantığını ölçüyor.
   * Burada ÇIKTIYA bakıyoruz: yayınlanmış her yazının rotası var, yayında
   * olmayan hiçbir slug rota üretmemiş.
   */
  test("yayınlanmış her yazının rotası çalışıyor", async ({ request }) => {
    for (const article of TR_ARTICLES) {
      const response = await request.get(trArticle(article.slug));
      expect(response.status(), article.slug).toBe(200);
    }
    for (const article of EN_ARTICLES) {
      const response = await request.get(enArticle(article.slug));
      expect(response.status(), article.slug).toBe(200);
    }
  });

  test("var olmayan yazı 404 döner", async ({ request }) => {
    for (const path of [
      "/icgoruler/olmayan-yazi/",
      "/en/insights/does-not-exist/",
      "/icgoruler/taslak-yazi/",
    ]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(404);
    }
  });

  /** İç yayın süreci terimleri ziyaretçiye görünmez. */
  test("taslak/bekliyor terimleri hiçbir içgörü sayfasında görünmüyor", async ({ page }) => {
    const routes = [
      LANDING.tr,
      LANDING.en,
      ...TR_ARTICLES.map((a) => trArticle(a.slug)),
      ...EN_ARTICLES.map((a) => enArticle(a.slug)),
    ];
    for (const route of routes) {
      await page.goto(route);
      const text = (await page.locator("body").innerText()).toLocaleLowerCase("tr");
      for (const term of ["taslak", "draft", "yayına hazır", "onay bekl", "doğrulama bekl"]) {
        expect(text.includes(term), `${route} "${term}" içeriyor`).toBe(false);
      }
    }
  });
});

// ---------------------------------------------------------- 3. seri/etiket

test.describe("seri ve etiket rotaları", () => {
  const SERIES_ROUTES = [
    { path: "/icgoruler/seri/cyclops-gunlugu/", key: "cyclops-log" },
    { path: "/icgoruler/seri/data-ve-ai/", key: "data-and-ai" },
    { path: "/icgoruler/seri/mimari-notlari/", key: "architecture-notes" },
    { path: "/en/insights/series/data-and-ai/", key: "data-and-ai" },
  ] as const;

  for (const route of SERIES_ROUTES) {
    test(`${route.path} çalışıyor ve yalnızca o seriyi listeliyor`, async ({ page }) => {
      const response = await page.goto(route.path);
      expect(response?.status(), route.path).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);

      const rows = page.locator('[data-testid="insight-list"] [data-slug]');
      expect(await rows.count()).toBeGreaterThan(0);

      const seriesKeys = await page
        .locator('[data-testid="insight-list"] [data-series]')
        .evaluateAll((els) => els.map((el) => el.getAttribute("data-series") ?? ""));
      for (const key of seriesKeys) {
        expect(key, `${route.path} yabancı seri içeriyor`).toBe(route.key);
      }
    });
  }

  test("etiket rotası yalnızca o etiketli yazıları listeliyor", async ({ page }) => {
    await page.goto("/icgoruler/etiket/observability/");
    const rows = page.locator('[data-testid="insight-list"] [data-slug]');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // Listelenen her yazının detayında bu etiket bulunmalı.
    const slugs = await rows.evaluateAll((els) =>
      els.map((el) => el.getAttribute("data-slug") ?? "")
    );
    for (const slug of slugs) {
      await page.goto(trArticle(slug));
      await expect(page.locator('[data-tag="observability"]'), slug).toHaveCount(1);
    }
  });

  /**
   * BİLİNMEYEN FİLTRE 404.
   * Statik rota üretimi yalnızca gerçekten içeriği olan değerler için sayfa
   * ürettiği için uydurma bir değer boş liste değil, "bulunamadı" alır.
   */
  test("bilinmeyen seri ve etiket 404 döner", async ({ request }) => {
    for (const path of [
      "/icgoruler/seri/olmayan-seri/",
      "/icgoruler/seri/architecture-notes/", // EN slug'ı TR tarafında geçersiz
      "/icgoruler/etiket/olmayan-etiket/",
      "/en/insights/series/mimari-notlari/", // TR slug'ı EN tarafında geçersiz
      "/en/insights/tag/olmayan/",
    ]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(404);
    }
  });

  test("landing'deki her seri ve etiket bağlantısı çalışıyor", async ({ page, request }) => {
    await page.goto(LANDING.tr);
    const hrefs = await page
      .locator('[data-testid="series-index"] a, [data-testid="tag-index"] a')
      .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const response = await request.get(href);
      expect(response.status(), href).toBe(200);
    }
  });
});

// ------------------------------------------------------------- 4. uzun yazı

test.describe("uzun yazı şablonu", () => {
  const DEEP = trArticle("toplu-isten-olay-tabanli-veri-akisina-gecis");

  test("tek h1 ve doğru başlık hiyerarşisi", async ({ page }) => {
    await page.goto(DEEP);
    await expect(page.locator("h1")).toHaveCount(1);

    const levels = await page
      .locator("main h1, main h2, main h3")
      .evaluateAll((els) => els.map((el) => Number(el.tagName.slice(1))));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i += 1) {
      const previous = levels[i - 1] ?? 0;
      const current = levels[i] ?? 0;
      expect(current - previous, `h${previous} -> h${current}`).toBeLessThanOrEqual(1);
    }
  });

  test("meta rayı seri, tarih, okuma süresi ve yazar taşıyor", async ({ page }) => {
    await page.goto(DEEP);
    const meta = page.getByTestId("insight-meta");
    await expect(meta).toBeVisible();
    await expect(meta.locator("[data-series]")).toHaveCount(1);
    await expect(meta.locator("time")).toHaveCount(1);
    await expect(page.getByTestId("reading-time")).toBeVisible();
    await expect(meta).toContainText("Duosis Mühendislik Ekibi");
  });

  test("okuma süresi pozitif bir dakika değeri", async ({ page }) => {
    await page.goto(DEEP);
    const text = await page.getByTestId("reading-time").innerText();
    const minutes = Number(/\d+/.exec(text)?.[0] ?? "0");
    expect(minutes).toBeGreaterThan(0);
    expect(minutes).toBeLessThan(60);
  });

  test("kaynaklar, ilgili çözümler, etiketler ve CTA render ediliyor", async ({ page }) => {
    await page.goto(DEEP);
    await expect(page.getByTestId("insight-sources")).toBeVisible();
    await expect(page.getByTestId("insight-related-solutions")).toBeVisible();
    await expect(page.getByTestId("insight-tags")).toBeVisible();
    await expect(page.getByTestId("insight-cta")).toBeVisible();
  });

  /** Boş opsiyonel alan BÖLÜM ÜRETMEZ. */
  test("kaynağı olmayan yazıda kaynaklar bölümü HİÇ yok", async ({ page }) => {
    await page.goto(trArticle("envanterden-karar-sistemine-kurumsal-mimari"));
    await expect(page.getByTestId("insight-sources")).toHaveCount(0);
    await expect(page.locator("#sources-heading")).toHaveCount(0);
  });

  test("ilgili çözüm bağlantıları çalışıyor", async ({ page, request }) => {
    await page.goto(DEEP);
    const hrefs = await page
      .locator('[data-testid="insight-related-solutions"] a')
      .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href).toMatch(/^\/cozumler\//);
      const response = await request.get(href);
      expect(response.status(), href).toBe(200);
    }
  });

  test("kaynak bağlantıları güvenli rel taşıyor", async ({ page }) => {
    await page.goto(DEEP);
    const rels = await page
      .locator('[data-testid="insight-sources"] a')
      .evaluateAll((els) => els.map((el) => el.getAttribute("rel") ?? ""));
    expect(rels.length).toBeGreaterThan(0);
    for (const rel of rels) {
      expect(rel).toContain("noopener");
      expect(rel).toContain("noreferrer");
      expect(rel).toContain("nofollow");
    }
  });

  /**
   * TABLO VE KOD BLOĞU SAYFAYI TAŞIRMAZ.
   *
   * İkisi de KAYDIRMA yerine SARMA kullanıyor (bkz. InsightArticle): kaydırılabilir
   * bir bölge hiç oluşmadığı için klavye erişimi sorunu da oluşmuyor.
   * Burada ölçülen, en dar ekranda hiçbirinin kabını aşmadığıdır.
   */
  test("tablo ve kod bloğu en dar ekranda kabını aşmıyor", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(DEEP);

    const table = page.locator(".article__body table").first();
    await expect(table).toBeVisible();

    const contained = await table.evaluate((el) => {
      const parent = el.parentElement;
      return parent === null ? false : el.scrollWidth <= parent.clientWidth + 1;
    });
    expect(contained, "tablo kendi kabını aşmamalı").toBe(true);

    const overflowing = await horizontalOverflow(page);
    expect(overflowing.scrollW, "tablo sayfayı taşırmamalı").toBeLessThanOrEqual(
      overflowing.viewportW
    );
  });

  /**
   * KLAVYE TUZAĞI YOK: kaydırılabilir bölge oluşmadığı için `tabindex`
   * gerektiren bir alan da yok. axe bunu `scrollable-region-focusable` ile
   * denetler; en dar ekranda çalıştırılıyor çünkü taşma ancak orada oluşur.
   */
  test("@a11y 320px uzun yazıda kaydırılabilir bölge ihlali yok", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(DEEP);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });

  test("okuma sütunu makul genişlikte kalıyor", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(DEEP);
    const width = await page
      .locator(".article__body p")
      .first()
      .evaluate((el) => el.getBoundingClientRect().width);
    // 1440px ekranda paragraf tam genişliğe yayılmamalı.
    expect(width).toBeLessThan(800);
  });

  /** Scrolljacking ve sticky içindekiler yok. */
  test("scroll davranışı ele geçirilmiyor", async ({ page }) => {
    await page.goto(DEEP);
    const stickyCount = await page
      .locator("main *")
      .evaluateAll((els) => els.filter((el) => getComputedStyle(el).position === "sticky").length);
    expect(stickyCount, "makale içinde sticky öğe olmamalı").toBe(0);
  });
});

// ---------------------------------------------------------------- 5. tarih

test.describe("tarih biçimi", () => {
  test("TR sayfası Türkçe ay adı gösteriyor", async ({ page }) => {
    await page.goto(trArticle("toplu-isten-olay-tabanli-veri-akisina-gecis"));
    const text = await page.getByTestId("insight-meta").innerText();
    expect(text).toContain("Eylül");
    expect(text).not.toContain("September");
  });

  test("EN sayfası İngilizce ay adı gösteriyor", async ({ page }) => {
    await page.goto(enArticle("from-batch-jobs-to-event-driven-data-flow"));
    const text = await page.getByTestId("insight-meta").innerText();
    expect(text).toContain("September");
    expect(text).not.toContain("Eylül");
  });

  test("makine tarihi ISO biçiminde", async ({ page }) => {
    await page.goto(trArticle("toplu-isten-olay-tabanli-veri-akisina-gecis"));
    const datetime = await page
      .getByTestId("insight-meta")
      .locator("time")
      .getAttribute("datetime");
    expect(datetime).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ------------------------------------------------------------------ 6. RSS

test.describe("RSS beslemesi", () => {
  for (const [locale, path] of Object.entries(FEED)) {
    test(`${locale}: geçerli XML ve doğru içerik tipi`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      /*
       * Statik çıktıda besleme bir DOSYADIR: içerik tipini uygulama değil,
       * onu sunan sunucu belirler (önizleme sunucusu ve tipik statik
       * barındırıcılar `.xml` için `application/xml` verir). Rota
       * tanımındaki `application/rss+xml` başlığı SSR dağıtımında geçerli.
       * Burada ölçülebilir olan, içeriğin XML olarak sunulduğudur.
       */
      expect(response.headers()["content-type"]).toContain("xml");

      const xml = await response.text();
      expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
      expect(xml).toContain('<rss version="2.0"');
      expect(xml.trimEnd().endsWith("</rss>")).toBe(true);

      // Kaçırılmamış ham `&` kalmamalı: `&` yalnızca bir varlık başlatabilir.
      const rawAmp = /&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/.exec(xml);
      expect(rawAmp, `kaçırılmamış & bulundu: ${rawAmp?.[0]}`).toBeNull();
    });
  }

  test("TR beslemesi yalnızca yayınlanmış TR yazılarını içeriyor", async ({ request }) => {
    const xml = await (await request.get(FEED.tr)).text();
    const links = [...xml.matchAll(/<link>([^<]+)<\/link>/g)].map((m) => m[1] ?? "");
    // İlk <link> kanal adresidir; kalanlar öğelerdir.
    const items = links.slice(1);
    expect(items).toHaveLength(TR_ARTICLES.length);
    for (const article of TR_ARTICLES) {
      expect(
        items.some((l) => l.includes(article.slug)),
        article.slug
      ).toBe(true);
    }
    // EN yazısı TR beslemesinde OLMAMALI.
    for (const article of EN_ARTICLES) {
      expect(xml.includes(article.slug), `${article.slug} TR beslemesinde`).toBe(false);
    }
  });

  test("EN beslemesi yalnızca EN yazılarını içeriyor", async ({ request }) => {
    const xml = await (await request.get(FEED.en)).text();
    for (const article of EN_ARTICLES) {
      expect(xml.includes(article.slug), article.slug).toBe(true);
    }
    for (const article of TR_ARTICLES) {
      expect(xml.includes(article.slug), `${article.slug} EN beslemesinde`).toBe(false);
    }
  });

  test("her öğe başlık, bağlantı, tarih ve açıklama taşıyor", async ({ request }) => {
    const xml = await (await request.get(FEED.tr)).text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1] ?? "");
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item).toContain("<title>");
      expect(item).toContain("<link>");
      expect(item).toContain("<guid");
      expect(item).toContain("<description>");
      expect(item).toMatch(/<pubDate>[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4}/);
    }
  });

  test("besleme bağlantıları gerçek sayfalara gidiyor", async ({ request }) => {
    const xml = await (await request.get(FEED.tr)).text();
    const links = [...xml.matchAll(/<link>([^<]+)<\/link>/g)].map((m) => m[1] ?? "");
    for (const link of links) {
      const response = await request.get(new URL(link).pathname);
      expect(response.status(), link).toBe(200);
    }
  });
});

// -------------------------------------------------------------- 7. JSON-LD

test.describe("BlogPosting yapılandırılmış verisi", () => {
  const ARTICLES = [
    ...TR_ARTICLES.map((a) => trArticle(a.slug)),
    ...EN_ARTICLES.map((a) => enArticle(a.slug)),
  ];

  for (const route of ARTICLES) {
    test(`${route}: JSON-LD sayfayla tutarlı`, async ({ page }) => {
      await page.goto(route);

      const raw = await page.getByTestId("blogposting-jsonld").textContent();
      expect(raw, `${route} JSON-LD taşımalı`).not.toBeNull();
      const data = JSON.parse(raw ?? "{}") as Record<string, unknown>;

      expect(data["@type"]).toBe("BlogPosting");

      // headline = sayfadaki h1 (site adı eklenmiş sayfa başlığı DEĞİL)
      const h1 = (await page.locator("h1").innerText()).trim();
      expect(data.headline, `${route} headline h1 ile aynı olmalı`).toBe(h1);

      // url = canonical
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(data.url).toBe(canonical);

      // datePublished = meta rayındaki tarih
      const datetime = await page
        .getByTestId("insight-meta")
        .locator("time")
        .first()
        .getAttribute("datetime");
      expect(data.datePublished).toBe(datetime);

      // author = sayfada görünen yazar
      const author = data.author as { name?: string };
      const metaText = await page.getByTestId("insight-meta").innerText();
      expect(metaText).toContain(author.name ?? "@@yok@@");
    });

    test(`${route}: JSON-LD gösterilmeyen iddia taşımıyor`, async ({ page }) => {
      await page.goto(route);
      const raw = (await page.getByTestId("blogposting-jsonld").textContent()) ?? "{}";
      const data = JSON.parse(raw) as Record<string, unknown>;

      // Sayfada karşılığı olmayan iddia alanları BULUNMAMALI.
      for (const forbidden of [
        "aggregateRating",
        "review",
        "interactionStatistic",
        "sponsor",
        "funder",
        "award",
      ]) {
        expect(forbidden in data, `${route} JSON-LD "${forbidden}" taşıyor`).toBe(false);
      }
    });
  }
});

// ----------------------------------------------------- 8. düzen ve erişim

test.describe("responsive, erişilebilirlik ve ağ", () => {
  const ROUTES = [
    LANDING.tr,
    LANDING.en,
    trArticle("toplu-isten-olay-tabanli-veri-akisina-gecis"),
    "/icgoruler/seri/data-ve-ai/",
    "/icgoruler/etiket/observability/",
  ];

  for (const viewport of REFLOW_VIEWPORTS) {
    test(`${viewport.name}: içgörü rotalarında yatay taşma yok`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      for (const route of ROUTES) {
        await page.goto(route);
        const result = await horizontalOverflow(page);
        expect(
          result.scrollW,
          `${route} @ ${viewport.name}: ${result.scrollW} > ${result.viewportW}`
        ).toBeLessThanOrEqual(result.viewportW);
      }
    });
  }

  /** %200 zoom ≈ yarı genişlik. Uzun yazı bu ölçekte de sayfayı taşırmamalı. */
  test("200% zoom'da yatay taşma yok", async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 512 });
    for (const route of ROUTES) {
      await page.goto(route);
      const result = await horizontalOverflow(page);
      expect(result.scrollW, route).toBeLessThanOrEqual(result.viewportW);
    }
  });

  for (const route of ROUTES) {
    test(`@a11y ${route}: axe temiz`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(result.violations).toEqual([]);
    });
  }

  test("@a11y mobil uzun yazı axe temiz", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(trArticle("toplu-isten-olay-tabanli-veri-akisina-gecis"));
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });

  test("@a11y klavye ile seri, etiket ve CTA'ya ulaşılabiliyor", async ({ page }) => {
    await page.goto(trArticle("toplu-isten-olay-tabanli-veri-akisina-gecis"));
    for (const locator of [
      page.getByTestId("insight-meta").locator("[data-series]"),
      page.locator("[data-tag]").first(),
      page.getByTestId("insight-cta"),
    ]) {
      await locator.focus();
      await expect(locator).toBeFocused();
    }
  });

  for (const route of ROUTES) {
    test(`${route}: dış ağ isteği yok`, async ({ page }) => {
      const external: string[] = [];
      page.on("request", (request) => {
        const url = request.url();
        if (!url.startsWith("http")) return;
        if (new URL(url).hostname === "127.0.0.1") return;
        external.push(url);
      });
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      expect(external, `dış istek: ${external.join(", ")}`).toEqual([]);
    });
  }

  test("tüm içgörü iç bağlantıları geçerli", async ({ page, request }) => {
    const seen = new Set<string>();
    for (const route of [...ROUTES, LANDING.en]) {
      await page.goto(route);
      const hrefs = await page
        .locator("main a[href]")
        .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
      for (const href of hrefs) {
        if (!href.startsWith("/") || seen.has(href)) continue;
        seen.add(href);
        const response = await request.get(href);
        expect(response.status(), `${route} -> ${href}`).toBe(200);
      }
    }
    expect(seen.size).toBeGreaterThan(0);
  });
});
