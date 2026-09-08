import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * S05 — ANA SAYFA VERTICAL SLICE KABUL TESTLERİ.
 *
 * Ağırlık içerik güvenliğinde: doğrulanmamış hiçbir sayı, bölge kapsamı veya
 * müşteri iddiası public çıktıya giremez; verisi olmayan bölüm boş kutu
 * göstermek yerine HİÇ oluşturulmaz.
 */

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

/** Sözleşmedeki bölüm sırası (`03_CONTENT_AND_ROUTE_MAP` + S05 talimatı). */
const EXPECTED_ORDER = [
  "hero",
  "trust",
  "solutions",
  "cyclops",
  "intelligence",
  "method",
  "decade",
  "technology",
  "insights",
  "roadmap",
];

test.describe("ana sayfa akışı", () => {
  test.use({ viewport: DESKTOP });

  test("bölümler DOĞRU SIRADA render ediliyor", async ({ page }) => {
    await page.goto("/");
    const ids = await page.locator("main section[id]").evaluateAll((els) => els.map((e) => e.id));
    expect(ids).toEqual(EXPECTED_ORDER);
  });

  test("tek H1 ve tutarlı başlık hiyerarşisi", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);

    // Başlık seviyeleri ATLAMAMALI (h1 -> h3 gibi bir sıçrama olmamalı).
    const levels = await page
      .locator("main h1, main h2, main h3, main h4")
      .evaluateAll((els) => els.map((e) => Number(e.tagName.slice(1))));

    let previous = levels[0] ?? 1;
    expect(previous).toBe(1);
    for (const level of levels.slice(1)) {
      expect(
        level - previous,
        `başlık seviyesi atladı: h${previous} -> h${level}`
      ).toBeLessThanOrEqual(1);
      previous = level;
    }
  });

  test("sekiz çözüm alanı listeleniyor ve GERÇEK rotalara gidiyor", async ({ page }) => {
    await page.goto("/");
    const atlas = page.getByTestId("solution-atlas");
    await expect(atlas.locator("li")).toHaveCount(8);

    const hrefs = await atlas
      .locator("a")
      .evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""));
    expect(hrefs).toHaveLength(8);
    for (const href of hrefs) {
      const res = await page.request.get(href);
      expect(res.status(), `${href} -> ${res.status()}`).toBe(200);
    }
  });

  test("Intelligence Layer TAM ÜÇ adım: algıla, anla, harekete geç", async ({ page }) => {
    await page.goto("/");
    const chain = page.getByTestId("intelligence-chain");
    await expect(chain.locator("li")).toHaveCount(3);
    const stages = await chain
      .locator("li")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-stage")));
    expect(stages).toEqual(["detect", "understand", "act"]);
  });

  test("CTA'lar MEVCUT hedeflere gidiyor; #roadmap çapası gerçekten var", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#roadmap")).toHaveCount(1);

    const hrefs = await page
      .locator("main a[href]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""));

    for (const href of hrefs) {
      if (href.startsWith("#")) {
        // Çapa hedefi sayfada bulunmalı.
        await expect(page.locator(href), `${href} çapası yok`).toHaveCount(1);
      } else if (href.startsWith("/")) {
        const res = await page.request.get(href);
        expect(res.status(), `${href} -> ${res.status()}`).toBe(200);
      }
    }
  });
});

test.describe("ana sayfa içerik güvenliği", () => {
  test.use({ viewport: DESKTOP });

  test("VERİSİ OLMAYAN bölüm boş kutu değil, HİÇ render edilmiyor", async ({ page }) => {
    await page.goto("/");
    // Hiçbir bölge `verified` değil -> bölüm hiç oluşmaz.
    await expect(page.locator("#regional")).toHaveCount(0);
    await expect(page.getByTestId("region-list")).toHaveCount(0);
  });

  test("SAHTE KPI veya 'veri bekleniyor' kutusu YOK", async ({ page }) => {
    await page.goto("/");
    const main = (await page.locator("#main-content").innerText()).toLowerCase();

    for (const phrase of ["veri bekleniyor", "yakında", "coming soon", "lorem ipsum", "tbd"]) {
      expect(main.includes(phrase), `ana sayfada "${phrase}" geçiyor`).toBe(false);
    }
  });

  test("DOĞRULANMAMIŞ müşteri/partner sayısı gösterilmiyor", async ({ page }) => {
    await page.goto("/");
    const main = await page.locator("#main-content").innerText();

    // "50+ müşteri", "35+ kurumsal müşteri", "10+ partner" gibi kalıplar.
    expect(main, "doğrulanmamış müşteri sayısı").not.toMatch(
      /\d+\s*\+?\s*(kurumsal\s+)?(müşteri|customer|partner|kurum)\b/i
    );
    // "10+ yıllık tecrübe" gibi doğrulanmamış kıdem iddiası.
    expect(main, "doğrulanmamış tecrübe iddiası").not.toMatch(/\d+\s*\+\s*(yıl|year)/i);
  });

  test("VENDOR LOGO DUVARI yok: ürün adı ve <img> geçmiyor", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#main-content img")).toHaveCount(0);

    const html = (await page.content()).toLowerCase();
    for (const vendor of [
      "zabbix",
      "grafana",
      "datadog",
      "instana",
      "opentelemetry",
      "confluent",
      "device42",
      "ardoq",
      "freshservice",
      "opentext",
      "microfocus",
    ]) {
      expect(html.includes(vendor), `ana sayfada vendor adı: ${vendor}`).toBe(false);
    }
  });

  test("teknoloji ekosistemi YETENEK KATMANLARIYLA anlatılıyor", async ({ page }) => {
    await page.goto("/");
    const layers = page.getByTestId("technology-layers");
    await expect(layers).toHaveCount(1);
    await expect(layers.locator("li")).not.toHaveCount(0);
  });

  test("10. YIL bölümü doğrulanmamış kilometre taşı göstermiyor", async ({ page }) => {
    await page.goto("/");
    const decade = page.getByTestId("decade-section");
    await expect(decade).toHaveCount(1);

    // Yalnızca `verified` milestone listelenir; pending olan 2016 kuruluş
    // kaydı görünmemeli.
    await expect(decade).not.toContainText("Şirketin kuruluşu");
  });

  test("ana sayfa NOINDEX kalıyor", async ({ page }) => {
    for (const route of ["/", "/en/", "/icgoruler/"]) {
      await page.goto(route);
      await expect(page.locator('meta[name="robots"][content="noindex"]'), route).toHaveCount(1);
    }
  });

  test("SOSYAL ÖNİZLEME alanları dolu", async ({ page }) => {
    await page.goto("/");
    for (const property of ["og:title", "og:description", "og:url", "og:type", "og:locale"]) {
      const content = await page.locator(`meta[property="${property}"]`).getAttribute("content");
      expect((content ?? "").length, `${property} boş`).toBeGreaterThan(0);
    }
  });
});

test.describe("içgörüler rotası", () => {
  test.use({ viewport: DESKTOP });

  test("TR listesi gerçek koleksiyon verisiyle çalışıyor", async ({ page }) => {
    await page.goto("/icgoruler/");
    await expect(page.getByTestId("insight-list").locator("li")).not.toHaveCount(0);
    await expect(page.getByTestId("insights-empty")).toHaveCount(0);
  });

  test("EN listesinde yayınlanmış kayıt yok: durum AÇIKÇA bildiriliyor", async ({ page }) => {
    await page.goto("/en/insights/");
    await expect(page.getByTestId("insights-empty")).toHaveCount(1);
    await expect(page.getByTestId("insight-list")).toHaveCount(0);
  });

  test("EN ana sayfada içgörü bölümü HİÇ oluşmuyor", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.locator("#insights")).toHaveCount(0);
  });

  test("içgörü detayı breadcrumb ile geliyor", async ({ page }) => {
    await page.goto("/icgoruler/icerik-modeli-notlari/");
    const crumb = page.getByTestId("breadcrumb");
    await expect(crumb).toHaveCount(1);
    await expect(crumb.locator('[aria-current="page"]')).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
  });
});

test.describe("ana sayfa erişilebilirliği ve reflow", () => {
  test("@a11y masaüstü axe temiz", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });

  test("@a11y mobil axe temiz", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });

  test("@a11y içgörüler sayfaları axe temiz", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    for (const route of ["/icgoruler/", "/icgoruler/icerik-modeli-notlari/", "/en/insights/"]) {
      await page.goto(route);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(result.violations, route).toEqual([]);
    }
  });

  test("320px ve 200% zoom'da yatay taşma yok", async ({ page }) => {
    for (const vp of [
      { name: "320px", width: 320, height: 800 },
      { name: "200% zoom", width: 640, height: 800 },
    ]) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const route of ["/", "/en/", "/icgoruler/", "/icgoruler/icerik-modeli-notlari/"]) {
        await page.goto(route);
        const r = await page.evaluate(() => ({
          vw: document.documentElement.clientWidth,
          scrollW: document.documentElement.scrollWidth,
        }));
        expect(r.scrollW, `${route} @ ${vp.name}`).toBeLessThanOrEqual(r.vw);
      }
    }
  });

  test("konsol hatası üretmiyor", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

    await page.goto("/", { waitUntil: "networkidle" });
    await page.goto("/en/", { waitUntil: "networkidle" });
    expect(errors).toEqual([]);
  });

  test("LCP adayı hero başlığı ve ilk boyamada mevcut", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");
    // Hero başlığı ilk ekranda ve görünür olmalı (LCP adayı).
    const box = await page.locator("h1").boundingBox();
    expect(box).not.toBeNull();
    expect(box?.y ?? Number.MAX_SAFE_INTEGER).toBeLessThan(DESKTOP.height);
  });
});
