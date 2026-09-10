import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * S10 — TEKNOLOJİ ATLASI KABUL TESTLERİ.
 *
 * En kritik iki kural burada ölçülür:
 * 1. Karar bekleyen 14 kaydın ADI public çıktının HİÇBİR yerinde geçmez —
 *    görünür metin, metadata, JSON-LD veya client payload dahil.
 * 2. İzin verilmemiş hiçbir üçüncü taraf logosu render edilmez.
 *
 * Görünürlük kontrolü `data-technology` ÖZNİTELİĞİ üzerinden yapılır, metin
 * eşleştirmesiyle değil: "OpenText" karar bekleyen bir kayıttır ama aynı metin
 * onaylı "OpenText SMAX" ürün adının içinde de geçer. Alt dize taraması bunu
 * sızıntı sanardı; öznitelik kontrolü kaydın KİMLİĞİNİ ölçer.
 */

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

interface TechnologyRecord {
  id: string;
  name: string;
  lifecycle: "active" | "inactive" | "pending";
  decisionNeeded: boolean;
  logoPermission: string;
  logoPath?: string;
}

const inventory = JSON.parse(
  readFileSync(`${ROOT}src/content/technologies/technologies.json`, "utf8")
) as TechnologyRecord[];

const ACTIVE = inventory.filter((t) => t.lifecycle === "active" && !t.decisionNeeded);
const HIDDEN = inventory.filter((t) => !(t.lifecycle === "active" && !t.decisionNeeded));

const ROUTES = { tr: "/teknolojiler/", en: "/en/technologies/" } as const;

/** Ziyaretçiye gösterilen tüm üretim rotaları — sızıntı taraması bunların hepsine bakar. */
const ALL_PUBLIC_ROUTES = [
  "/",
  "/en/",
  "/cozumler/",
  "/en/solutions/",
  "/hizmetler/",
  "/en/services/",
  "/teknolojiler/",
  "/en/technologies/",
  "/icgoruler/",
  "/en/insights/",
  "/iletisim/",
  "/en/contact/",
  // Çözüm detayı teknoloji adlarını KENDİ şablonuyla basar; taramaya dahil.
  "/cozumler/operasyonel-gorunurluk/",
  "/cozumler/veri-akisi-ve-entegrasyon/",
  "/cozumler/otomasyon/",
  "/en/solutions/observability-and-apm/",
];

const REFLOW_VIEWPORTS = [320, 390, 768, 1024, 1440];

// ------------------------------------------------------------ 1. görünürlük

test.describe("yetenek atlası", () => {
  for (const [locale, url] of Object.entries(ROUTES)) {
    test(`${locale}: rota 200 dönüyor ve tek h1 taşıyor`, async ({ page }) => {
      const response = await page.goto(url);
      expect(response?.status(), url).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
    });

    test(`${locale}: 21 aktif teknolojinin tamamı görünüyor`, async ({ page }) => {
      await page.goto(url);
      const rendered = await page
        .locator("[data-technology]")
        .evaluateAll((els) => els.map((el) => el.getAttribute("data-technology") ?? ""));

      expect(rendered).toHaveLength(ACTIVE.length);
      expect([...rendered].sort()).toEqual(ACTIVE.map((t) => t.id).sort());
    });

    test(`${locale}: karar bekleyen 14 kayıt GÖRÜNMÜYOR`, async ({ page }) => {
      await page.goto(url);
      for (const technology of HIDDEN) {
        await expect(
          page.locator(`[data-technology="${technology.id}"]`),
          `${technology.id} public çıktıda olmamalı`
        ).toHaveCount(0);
      }
    });

    test(`${locale}: her katman problem ve çözüm bağlantısı taşıyor`, async ({ page }) => {
      await page.goto(url);
      const layers = page.locator("[data-layer]");
      const count = await layers.count();
      expect(count).toBeGreaterThan(0);

      for (let index = 0; index < count; index += 1) {
        const layer = layers.nth(index);
        await expect(layer.locator(".atlas__problem-text")).toHaveCount(1);
        await expect(layer.locator(".atlas__solution a")).toHaveCount(1);
        // Katman en az bir teknoloji taşımalı: boş katman render edilmez.
        expect(await layer.locator("[data-technology]").count()).toBeGreaterThan(0);
      }
    });

    test(`${locale}: yetenek katmanı teknoloji adından ÖNCE geliyor`, async ({ page }) => {
      await page.goto(url);
      const firstLayer = page.locator("[data-layer]").first();
      const headingTop = await firstLayer
        .locator(".atlas__name")
        .evaluate((el) => el.getBoundingClientRect().top);
      const techTop = await firstLayer
        .locator("[data-technology]")
        .first()
        .evaluate((el) => el.getBoundingClientRect().top);
      expect(headingTop, "yetenek başlığı teknoloji listesinin üstünde olmalı").toBeLessThan(
        techTop
      );
    });
  }

  test("atlas kapsam notu taşıyor", async ({ page }) => {
    await page.goto(ROUTES.tr);
    await expect(page.getByTestId("technology-scope-note")).toBeVisible();
  });
});

// ------------------------------------------------------- 2. sızıntı taraması

test.describe("karar bekleyen kayıt hiçbir yere sızmıyor", () => {
  for (const route of ALL_PUBLIC_ROUTES) {
    test(`${route}: gizli kayıt kimliği HTML'de yok`, async ({ page }) => {
      await page.goto(route);
      const html = await page.content();
      for (const technology of HIDDEN) {
        /*
         * İki ayrı öznitelik taranır: atlas `data-technology`, çözüm detayı
         * `data-technology-id` kullanıyor. Yalnızca birine bakmak, diğer
         * şablondaki bir sızıntıyı görünmez bırakırdı.
         */
        expect(
          html.includes(`data-technology="${technology.id}"`),
          `${route} sayfasında "${technology.id}" render edilmiş`
        ).toBe(false);
        expect(
          html.includes(`data-technology-id="${technology.id}"`),
          `${route} sayfasında "${technology.id}" render edilmiş`
        ).toBe(false);
      }
    });

    test(`${route}: gizli kayıt metadata ve JSON-LD'de yok`, async ({ page }) => {
      await page.goto(route);
      const payload = await page.evaluate(() => {
        const meta = [...document.querySelectorAll("meta")]
          .map((el) => el.getAttribute("content") ?? "")
          .join(" ");
        const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')]
          .map((el) => el.textContent ?? "")
          .join(" ");
        return `${meta} ${jsonLd}`;
      });

      for (const technology of HIDDEN) {
        // Tam kelime araması: "OpenText" onaylı ürün adlarının içinde geçebilir.
        const pattern = new RegExp(
          `(?<![\\w-])${technology.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w-])`,
          "i"
        );
        // Onaylı bir kaydın adı bu kaydın adını içeriyorsa istisna geçerlidir.
        const shadowed = ACTIVE.some((a) => a.name.includes(technology.name));
        if (shadowed) continue;
        expect(pattern.test(payload), `${route} metadata "${technology.name}" içeriyor`).toBe(
          false
        );
      }
    });
  }
});

// ---------------------------------------------------------------- 3. logolar

test.describe("izinsiz logo gösterilmiyor", () => {
  for (const route of ALL_PUBLIC_ROUTES) {
    test(`${route}: yalnızca Duosis marka görselleri render ediliyor`, async ({ page }) => {
      await page.goto(route);

      const sources = await page
        .locator("img")
        .evaluateAll((els) => els.map((el) => el.getAttribute("src") ?? ""));

      for (const source of sources) {
        expect(source, `${route} üçüncü taraf görseli taşıyor: ${source}`).toMatch(
          /^\/(brand|favicon)/
        );
      }
    });

    test(`${route}: hiçbir teknoloji logosu yok`, async ({ page }) => {
      await page.goto(route);
      const html = await page.content();

      /*
       * Envanterdeki HİÇBİR kaydın logo izni yok (`logoPermission: unknown`),
       * CyclOps dahil. Dolayısıyla public çıktıda tek bir teknoloji logosu
       * bile bulunamaz. Kural preview modunda da gevşemez.
       */
      for (const technology of inventory) {
        expect(
          html.includes(`/logos/${technology.id}`),
          `${route} sayfasında ${technology.id} logosu var`
        ).toBe(false);
      }
      expect(html.includes("/logos/"), `${route} logo dizinine referans veriyor`).toBe(false);
    });
  }
});

// ------------------------------------------------- 4. ortaklık dili yasağı

test.describe("ortaklık iddiası yok", () => {
  for (const [locale, url] of Object.entries(ROUTES)) {
    test(`${locale}: partner veya yetkili satıcı dili kullanılmıyor`, async ({ page }) => {
      await page.goto(url);
      const text = (await page.locator("body").innerText()).toLocaleLowerCase("tr");

      for (const phrase of [
        "partnerlerimiz",
        "iş ortağımız",
        "iş ortaklarımız",
        "resmî iş ortağı",
        "resmi iş ortağı",
        "yetkili satıcı",
        "yetkili çözüm ortağı",
        "distribütör",
        "our partners",
        "official partner",
        "authorized reseller",
        "authorised reseller",
        "certified partner",
      ]) {
        expect(text.includes(phrase), `${url} sayfasında "${phrase}" geçiyor`).toBe(false);
      }
    });
  }
});

// ---------------------------------------------------------------- 5. düzen

test.describe("responsive ve erişilebilirlik", () => {
  for (const width of REFLOW_VIEWPORTS) {
    test(`${width}px: yatay taşma yok`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(ROUTES.tr);
      const result = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        viewportW: document.documentElement.clientWidth,
      }));
      expect(result.scrollW, `${width}px taşma`).toBeLessThanOrEqual(result.viewportW);
    });
  }

  for (const [locale, url] of Object.entries(ROUTES)) {
    test(`@a11y ${locale}: axe temiz`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(url);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(result.violations).toEqual([]);
    });
  }

  test("@a11y 320px genişlikte de axe temiz", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(ROUTES.tr);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });

  test("dış ağ isteği yok", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (!url.startsWith("http")) return;
      if (new URL(url).hostname === "127.0.0.1") return;
      external.push(url);
    });
    await page.goto(ROUTES.tr);
    await page.waitForLoadState("networkidle");
    expect(external, `dış istek: ${external.join(", ")}`).toEqual([]);
  });
});
