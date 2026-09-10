import { expect, test } from "@playwright/test";
import { publicRoutes, routeLocale } from "../support/route-inventory";
import { FORBIDDEN_LD_KEYS } from "../../src/lib/seo/structuredData";
import { REDIRECTS } from "../../src/config/redirects";

/**
 * SEO ÇIKTI DENETİMİ (S13).
 *
 * `tests/unit/*` üreticileri izole doğrular; bu dosya GERÇEK build çıktısını
 * denetler: üretici doğru olsa bile bir sayfa onu yanlış çağırabilir ya da
 * hiç çağırmayabilir. (Nitekim bir süre iki ayrı üreticiden ÇİFT BlogPosting
 * basılmıştı; aşağıdaki "tür tekrar etmiyor" kontrolü bunu yakalar.)
 *
 * ROTA BAŞINA TEK TEST: sayfa denetimleri tek bir `goto` altında toplanır.
 * Tüm rotaları tek bir test içinde gezmek 30 sn'lik test bütçesini aşıyordu;
 * bütçeyi büyütmek yerine testler bölündü — böylece hata veren rota da
 * doğrudan test adından okunuyor.
 *
 * ÖNEMLİ: E2E derlemesi ÖNİZLEME derlemesidir (`DEPLOY_ENV` verilmez). Bu
 * yüzden robots taramaya kapalıdır ve sitemap boştur; bu bilinçli davranış
 * burada doğrulanır. Üretim davranışı `tests/unit/site-config.test.ts` ve
 * teslim kanıtındaki üretim derlemesiyle gösterilir.
 */

const ROUTES = publicRoutes();

/** Bir nesnedeki tüm anahtarlar (iç içe dahil). */
function collectKeys(value: unknown, into: Set<string> = new Set()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, into);
  } else if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      into.add(key);
      collectKeys(child, into);
    }
  }
  return into;
}

/** Bir nesnedeki tüm string değerler (iç içe dahil). */
function collectStrings(value: unknown, into: string[] = []): string[] {
  if (typeof value === "string") into.push(value);
  else if (Array.isArray(value)) for (const item of value) collectStrings(item, into);
  else if (value !== null && typeof value === "object")
    for (const child of Object.values(value)) collectStrings(child, into);
  return into;
}

/** Bir sayfada birden çok kez bulunabilen JSON-LD türleri. */
const REPEATABLE_LD_TYPES = new Set(["Service"]);

// --------------------------------------------------- 1. rota başına denetim

test.describe("sayfa SEO çıktısı", () => {
  for (const route of ROUTES) {
    test(`${route}: canonical, hreflang ve JSON-LD tutarlı`, async ({ page, request }) => {
      await page.goto(route);

      // ------------------------------------------------------- canonical ---
      const canonicalLinks = page.locator('link[rel="canonical"]');
      await expect(canonicalLinks, `${route} tam olarak bir canonical taşımalı`).toHaveCount(1);

      const canonicalHref = await canonicalLinks.getAttribute("href");
      expect(canonicalHref, route).not.toBeNull();
      const canonical = new URL(canonicalHref as string);
      expect(canonical.pathname, `${route} canonical yolu sayfayla aynı olmalı`).toBe(route);
      // Canonical MUTLAK olmalı; göreli canonical yönlendirme sonrası kayar.
      expect(canonical.protocol, route).toMatch(/^https?:$/);
      expect(canonical.search, `${route} canonical sorgu taşımamalı`).toBe("");

      // -------------------------------------------------------- hreflang ---
      const tags = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((els) =>
        els.map((el) => ({
          hreflang: el.getAttribute("hreflang") ?? "",
          href: el.getAttribute("href") ?? "",
        }))
      );

      if (tags.length > 0) {
        const names = tags.map((tag) => tag.hreflang);
        // Etiket kümesi tekrarsız ve x-default'lu olmalı.
        expect(new Set(names).size, `${route} hreflang etiketi tekrar ediyor`).toBe(names.length);
        expect(names, `${route} hreflang veriyor ama x-default vermiyor`).toContain("x-default");

        // x-default her zaman Türkçe sürümü gösterir.
        const tr = tags.find((tag) => tag.hreflang === "tr")?.href;
        const fallback = tags.find((tag) => tag.hreflang === "x-default")?.href;
        expect(fallback, `${route} x-default Türkçe sürümü göstermeli`).toBe(tr);

        // Sayfa kendi dilini de bildirmeli (karşılıklılık ön koşulu).
        const own = tags.find((tag) => tag.hreflang === routeLocale(route))?.href;
        expect(
          own === undefined ? "" : new URL(own).pathname,
          `${route} kendi dilini bildirmeli`
        ).toBe(route);

        // Diğer dildeki hedef GERÇEKTEN var olmalı ve GERİ işaret etmeli.
        const other = tags.find(
          (tag) => tag.hreflang !== "x-default" && tag.hreflang !== routeLocale(route)
        );
        if (other !== undefined) {
          const targetPath = new URL(other.href).pathname;
          const response = await request.get(targetPath);
          expect(response.status(), `${route} → ${targetPath} hreflang hedefi 200 dönmeli`).toBe(
            200
          );
          const html = await response.text();
          const back = new RegExp(
            `<link rel="alternate" hreflang="${routeLocale(route)}" href="[^"]*${route}"`
          );
          expect(back.test(html), `${targetPath} → ${route} karşılıklı hreflang eksik`).toBe(true);
        }
      }

      // -------------------------------------------------------- og:image ---
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
      expect(ogImage, `${route} og:image taşımalı`).not.toBeNull();
      const ogResponse = await request.get(new URL(ogImage as string).pathname);
      expect(ogResponse.status(), `${route} og:image adresi: ${ogImage}`).toBe(200);
      expect(ogResponse.headers()["content-type"], `${route} og:image MIME`).toBe("image/png");

      // --------------------------------------------------------- JSON-LD ---
      const rawBlocks = await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((els) => els.map((el) => el.textContent ?? ""));
      expect(rawBlocks.length, `${route} en az bir JSON-LD bloğu taşımalı`).toBeGreaterThan(0);

      const blocks = rawBlocks.map((text) => JSON.parse(text) as Record<string, unknown>);
      const counted = new Map<string, number>();

      for (const block of blocks) {
        expect(block["@context"], route).toBe("https://schema.org");
        const type = block["@type"];
        expect(typeof type, `${route} @type string olmalı`).toBe("string");
        counted.set(String(type), (counted.get(String(type)) ?? 0) + 1);

        // Sayfada karşılığı olmayan iddia alanları BULUNMAMALI.
        const keys = collectKeys(block);
        for (const forbidden of FORBIDDEN_LD_KEYS) {
          expect(keys.has(forbidden), `${route} JSON-LD "${forbidden}" taşıyor`).toBe(false);
        }

        // Blok URL'leri canonical ile AYNI kökende olmalı.
        for (const value of collectStrings(block)) {
          if (!/^https?:/i.test(value)) continue;
          if (value === "https://schema.org") continue;
          expect(value.startsWith(canonical.origin), `${route}: ${value} farklı kökende`).toBe(
            true
          );
        }
      }

      // Organization her sayfada TAM OLARAK bir kez.
      expect(counted.get("Organization"), `${route} tek Organization bloğu taşımalı`).toBe(1);

      // Aynı türden ikinci bir blok = iki farklı üreticiden çift basım.
      for (const [type, count] of counted) {
        if (REPEATABLE_LD_TYPES.has(type)) continue;
        expect(count, `${route} içinde ${count} adet ${type} bloğu var`).toBe(1);
      }
    });
  }
});

// ---------------------------------------------- 2. tür bazlı derin kontrol

test.describe("yapılandırılmış veri — tür ayrıntısı", () => {
  test("hizmet blokları @id ile ayrışıyor", async ({ page }) => {
    await page.goto("/hizmetler/");
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((el) => JSON.parse(el.textContent ?? "{}")));
    const services = blocks.filter((block) => block["@type"] === "Service");
    expect(services.length, "hizmet sayfası birden çok Service taşımalı").toBeGreaterThan(1);
    const ids = services.map((block) => String(block["@id"]));
    expect(new Set(ids).size, "hizmet blokları aynı @id'yi paylaşıyor").toBe(ids.length);
  });

  test("CyclOps sayfası SoftwareApplication taşıyor", async ({ page }) => {
    await page.goto("/cyclops/");
    const types = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((el) => JSON.parse(el.textContent ?? "{}")["@type"]));
    expect(types).toContain("SoftwareApplication");
  });

  test("BreadcrumbList adları sayfada GÖRÜNEN adlarla aynı", async ({ page }) => {
    await page.goto("/cyclops/");
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((el) => JSON.parse(el.textContent ?? "{}")));
    const crumb = blocks.find((block) => block["@type"] === "BreadcrumbList");
    expect(crumb, "/cyclops/ BreadcrumbList taşımalı").toBeDefined();

    const visible = await page.locator("nav[aria-label] li").allInnerTexts();
    const joined = visible.join(" | ");
    for (const item of crumb["itemListElement"] as Array<Record<string, unknown>>) {
      expect(joined, `"${String(item["name"])}" breadcrumb'da görünmüyor`).toContain(
        String(item["name"])
      );
    }
  });
});

// ------------------------------------------------- 3. sitemap ve robots

test.describe("sitemap ve robots — ÖNİZLEME derlemesi", () => {
  test("robots.txt tüm siteyi taramaya kapatıyor", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("User-agent: *");
    expect(body).toContain("Disallow: /");
    // Önizlemede sitemap DUYURULMAZ.
    expect(body).not.toContain("Sitemap:");
  });

  test("sitemap.xml geçerli ama BOŞ", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("xml");
    const body = await response.text();
    expect(body).toContain("<urlset");
    expect(body).not.toContain("<loc>");
  });

  test("design-system, 404 ve 410 sitemap'e HİÇ girmiyor", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();
    for (const path of ["/design-system/", "/404", "/410"]) {
      expect(body, `${path} sitemap'te`).not.toContain(path);
    }
  });
});

// ------------------------------------------------------ 4. yönlendirmeler

test.describe("yönlendirme matrisi build çıktısıyla tutarlı", () => {
  test("manifest üretilmiş ve tüm kuralları taşıyor", async ({ request }) => {
    const response = await request.get("/redirect-manifest.json");
    expect(response.status(), "redirect-manifest.json build çıktısında yok").toBe(200);
    const manifest = (await response.json()) as { rules: Array<Record<string, string>> };
    expect(manifest.rules.length).toBe(REDIRECTS.length);
  });

  test("her 301 hedefi GERÇEKTEN var olan bir sayfa", async ({ request }) => {
    const targets = new Set(
      REDIRECTS.filter((rule) => rule.kind !== "410" && rule.kind !== "preserve").map(
        (rule) => rule.to as string
      )
    );
    expect(targets.size).toBeGreaterThan(5);
    for (const target of targets) {
      const response = await request.get(target);
      expect(response.status(), `yönlendirme hedefi ${target} 200 dönmüyor`).toBe(200);
    }
  });

  test("410 gövdesi GERÇEKTEN üretilmiş", async ({ request }) => {
    // Kaldırılmış içerik ana sayfaya atılmaz; gerçek bir 410 gövdesi vardır.
    const response = await request.get("/410/");
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("410");
  });

  test("preserve kuralındaki adresler zaten çalışıyor", async ({ request }) => {
    for (const rule of REDIRECTS.filter((item) => item.kind === "preserve")) {
      const response = await request.get(rule.from);
      expect(response.status(), `korunan adres ${rule.from} 200 dönmüyor`).toBe(200);
    }
  });

  test("_redirects ve nginx örneği aynı sayıda kural üretiyor", async ({ request }) => {
    const netlify = await (await request.get("/_redirects")).text();
    const nginx = await (await request.get("/nginx-redirects.conf")).text();
    const netlifyRules = netlify
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.trim().startsWith("#"));
    const nginxRules = nginx.split("\n").filter((line) => line.trim().startsWith("location"));
    const expected = REDIRECTS.filter((rule) => rule.kind !== "preserve").length;
    expect(netlifyRules.length, "_redirects kural sayısı").toBe(expected);
    expect(nginxRules.length, "nginx kural sayısı").toBe(expected);
  });
});
