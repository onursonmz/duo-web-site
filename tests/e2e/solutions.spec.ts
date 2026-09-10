import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * S07 — ÇÖZÜM SİSTEMİ KABUL TESTLERİ.
 *
 * Kapsam: sekiz çözüm alanının iki dilde de çalışan rotaları, tek veri
 * sürücülü şablonun anlatı sırası, teknoloji sunum kuralları, CTA bağlamı,
 * iletişim kabuğu ve görsel kalite eşiği.
 *
 * Testler ÜRETİM rotalarını (public mod) ölçer; hiçbir kural "preview"
 * modundan gevşetilmez.
 */

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

/** Sekiz çözüm alanının iki dildeki slug karşılıkları. */
const SOLUTIONS = [
  { tr: "operasyonel-gorunurluk", en: "observability-and-apm" },
  { tr: "konfigurasyon-ve-varlik-yonetimi", en: "configuration-and-asset-management" },
  { tr: "bt-hizmet-yonetimi", en: "it-service-management" },
  { tr: "veri-akisi-ve-entegrasyon", en: "data-streaming-and-integration" },
  { tr: "kurumsal-mimari-ve-yonetisim", en: "enterprise-architecture" },
  { tr: "aiops-ve-olay-yasam-dongusu", en: "aiops-and-event-lifecycle" },
  { tr: "otomasyon", en: "automation" },
  { tr: "muhendislik-ve-urun-gelistirme", en: "engineering-and-product-development" },
] as const;

/** Tam içerik derinliğine sahip iki çözüm (S07 §11). */
const DEEP = [
  { path: "/cozumler/operasyonel-gorunurluk/", slug: "operasyonel-gorunurluk" },
  { path: "/cozumler/veri-akisi-ve-entegrasyon/", slug: "veri-akisi-ve-entegrasyon" },
] as const;

const trPath = (slug: string): string => `/cozumler/${slug}/`;
const enPath = (slug: string): string => `/en/solutions/${slug}/`;

/** Şablonun sözleşmedeki anlatı sırası. Teknoloji adı anlatının başı değildir. */
const NARRATIVE_ORDER = [
  "problem-heading",
  "approach-heading",
  "benefits-heading",
  "capabilities-heading",
  "ai-heading",
  "scenario-heading",
  "tech-heading",
];

async function sectionOrder(page: Page): Promise<string[]> {
  return page
    .locator('[data-testid="solution-detail"] section[aria-labelledby]')
    .evaluateAll((els) => els.map((el) => el.getAttribute("aria-labelledby") ?? ""));
}

// ---------------------------------------------------------------- 1. rotalar

test.describe("rotalar", () => {
  for (const solution of SOLUTIONS) {
    test(`TR ve EN rotaları çalışıyor: ${solution.tr}`, async ({ page }) => {
      for (const url of [trPath(solution.tr), enPath(solution.en)]) {
        const response = await page.goto(url);
        expect(response?.status(), url).toBe(200);
        await expect(page.locator("h1")).toHaveCount(1);
      }
    });
  }

  test("landing sekiz çözümü de listeliyor (iki dilde)", async ({ page }) => {
    for (const [url, paths] of [
      ["/cozumler/", SOLUTIONS.map((s) => trPath(s.tr))],
      ["/en/solutions/", SOLUTIONS.map((s) => enPath(s.en))],
    ] as const) {
      await page.goto(url);
      const rows = page.locator('[data-testid="solution-list"] > li');
      await expect(rows).toHaveCount(8);
      const hrefs = await page
        .locator('[data-testid="solution-list"] a')
        .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
      for (const path of paths) expect(hrefs, url).toContain(path);
    }
  });
});

// ---------------------------------------------------------------- 2. anlatı sırası

test.describe("anlatı sırası", () => {
  for (const deep of DEEP) {
    test(`tam derinlikli çözüm sırayı koruyor: ${deep.slug}`, async ({ page }) => {
      await page.goto(deep.path);
      const order = await sectionOrder(page);
      // İlgili not bölümü içeriğe bağlıdır; VARSA en sonda olur.
      expect(order.filter((id) => id !== "insights-heading")).toEqual(NARRATIVE_ORDER);
      if (order.includes("insights-heading")) {
        expect(order.at(-1)).toBe("insights-heading");
      }
    });
  }

  test("başlık bloğu problem bölümünden ÖNCE gelir", async ({ page }) => {
    await page.goto(DEEP[0].path);
    const h1Y = await page.locator("h1").evaluate((el) => el.getBoundingClientRect().top);
    const problemY = await page
      .locator("#problem-heading")
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(h1Y).toBeLessThan(problemY);
  });

  test("CTA sayfanın SONUNDA, geri bağlantısıyla birlikte", async ({ page }) => {
    await page.goto(DEEP[0].path);
    const ctaY = await page
      .locator('[data-analytics-event="solution-cta"]')
      .evaluate((el) => el.getBoundingClientRect().top);
    const techY = await page
      .locator("#tech-heading")
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(ctaY).toBeGreaterThan(techY);
    await expect(page.locator('[data-testid="back-to-solutions"]')).toHaveCount(1);
  });
});

// ---------------------------------------------------------------- 3. boş alan = bölüm yok

test.describe("boş alan bölüm üretmez", () => {
  test("içeriği olmayan çözümde AI ve senaryo bölümü HİÇ oluşmaz", async ({ page }) => {
    await page.goto(trPath("muhendislik-ve-urun-gelistirme"));
    expect(await sectionOrder(page)).toEqual([
      "problem-heading",
      "approach-heading",
      "benefits-heading",
      "capabilities-heading",
    ]);
    await expect(page.locator('[data-testid="solution-ai-role"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="solution-scenario"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="solution-technologies"]')).toHaveCount(0);
  });

  test("hiçbir çözüm sayfasında BOŞ liste veya boş bölüm yok", async ({ page }) => {
    for (const solution of SOLUTIONS) {
      await page.goto(trPath(solution.tr));
      const empties = await page
        .locator('[data-testid="solution-detail"] ul, [data-testid="solution-detail"] ol')
        .evaluateAll((els) => els.filter((el) => el.children.length === 0).length);
      expect(empties, solution.tr).toBe(0);
      // Her bölüm başlığının ÖTESİNDE gerçek içerik taşır.
      const headingOnly = await page
        .locator('[data-testid="solution-detail"] section')
        .evaluateAll((els) =>
          els
            .filter((el) => {
              const rest = [...el.children].filter((child) => child.tagName !== "H2");
              const text = rest
                .map((child) => child.textContent ?? "")
                .join("")
                .trim();
              return rest.length === 0 || text.length === 0;
            })
            .map((el) => el.getAttribute("aria-labelledby") ?? "?")
        );
      expect(headingOnly, solution.tr).toEqual([]);
    }
  });
});

// ---------------------------------------------------------------- 4. teknoloji sunumu

test.describe("teknoloji sunumu", () => {
  test("teknolojiler YALNIZCA metin: logo yok, görsel yok", async ({ page }) => {
    for (const solution of SOLUTIONS) {
      await page.goto(trPath(solution.tr));
      const list = page.locator('[data-testid="technology-list"]');
      if ((await list.count()) === 0) continue;
      await expect(list.locator("img, svg, picture")).toHaveCount(0);
    }
  });

  test("ilişki iddiası taşıyan kelimeler geçmiyor", async ({ page }) => {
    const forbidden = ["resmî iş ortağı", "resmi iş ortağı", "iş ortağıyız", "yetkili satıcı"];
    for (const solution of SOLUTIONS) {
      await page.goto(trPath(solution.tr));
      const text = ((await page.locator("main").innerText()) ?? "").toLocaleLowerCase("tr");
      for (const word of forbidden) expect(text, `${solution.tr}: ${word}`).not.toContain(word);
      expect(text).not.toMatch(/\bsertifikal[ıi]\b/);
      expect(text).not.toMatch(/\bpartner\b/);
    }
  });

  test("dış teknoloji bağlantıları güvenli rel taşır", async ({ page }) => {
    await page.goto(DEEP[0].path);
    const links = page.locator('[data-testid="technology-list"] a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      const rel = await links.nth(i).getAttribute("rel");
      expect(rel).toContain("noopener");
      expect(rel).toContain("nofollow");
    }
  });

  /**
   * ÇÖZÜMÜN KENDİ ANLATISI — "İlgili notlar" HARİÇ.
   *
   * Kural şu: bir çözümün KENDİ metni ve teknoloji listesi, o alana ait
   * olmayan ürünü adlandırmaz. AIOps anlatısının merkezinde CyclOps vardır ve
   * bir izleme ürününe atıf yapmaz; observability anlatısı da tersini yapmaz.
   *
   * "İlgili notlar" bölümü bu kuralın DIŞINDADIR ve bu bilinçli bir sınırdır:
   * orası çözümün kendi cümlesi değil, YAYINLANMIŞ YAZI BAŞLIKLARININ listesi.
   * "Zabbix alarmından CyclOps olayına" başlıklı bir yazı tam olarak iki ürün
   * arasındaki geçişi anlatıyor ve her iki çözüme de bağlanıyor; başlığındaki
   * ürün adı, çözümün kendi iddiası değil.
   *
   * Bu ayrım S11'de gerçek bir testle ortaya çıktı: yazı yayına girince
   * başlığı iki çözüm sayfasında da göründü ve tarama `main` metninin tamamına
   * baktığı için ihlal bildirdi. Kural gevşetilmedi — KAPSAMI netleştirildi.
   */
  async function narrativeText(page: Page): Promise<string> {
    const full = await page.locator("main").innerText();
    const relatedNotes = page.getByTestId("solution-insights");
    if ((await relatedNotes.count()) === 0) return full;
    return full.replace(await relatedNotes.innerText(), "");
  }

  test("CyclOps ve Zabbix FARKLI rollerde anlatılır", async ({ page }) => {
    await page.goto(trPath("aiops-ve-olay-yasam-dongusu"));
    const aiops = await narrativeText(page);
    expect(aiops).toContain("CyclOps");
    expect(aiops).toMatch(/kendi geliştirdiğimiz|kendi ürünümüz/);
    expect(aiops, "AIOps anlatısı bir izleme ürününü adlandırmamalı").not.toContain("Zabbix");

    await page.goto(DEEP[0].path);
    const observability = await narrativeText(page);
    expect(observability).toContain("Zabbix");
    expect(
      observability,
      "observability anlatısı CyclOps'u kendi ürünü gibi anlatmamalı"
    ).not.toContain("CyclOps");
  });

  /**
   * Kapsam daraltması bir BOŞLUK bırakmadı: teknoloji listesi hâlâ tam
   * olarak denetleniyor. Çözümün teknoloji bölümü yalnızca o çözüme bağlı
   * kayıtları taşıyabilir.
   */
  test("teknoloji listesi çözüm sınırının dışına taşmıyor", async ({ page }) => {
    await page.goto(trPath("aiops-ve-olay-yasam-dongusu"));
    const aiopsTech = await page.getByTestId("technology-list").innerText();
    expect(aiopsTech).toContain("CyclOps");
    expect(aiopsTech).not.toContain("Zabbix");

    await page.goto(DEEP[0].path);
    const observabilityTech = await page.getByTestId("technology-list").innerText();
    expect(observabilityTech).toContain("Zabbix");
    expect(observabilityTech).not.toContain("CyclOps");
  });
});

// ---------------------------------------------------------------- 5. AI anlatısı

test("AI anlatısı yalnızca GERÇEK içerikle render edilir", async ({ page }) => {
  await page.goto(DEEP[0].path);
  const stages = page.locator('[data-testid="solution-ai-role"] li');
  await expect(stages).toHaveCount(3);
  for (let i = 0; i < 3; i += 1) {
    const body = await stages.nth(i).locator("p").innerText();
    expect(body.trim().length).toBeGreaterThan(40);
  }
});

// ---------------------------------------------------------------- 6. CTA bağlamı

test.describe("CTA bağlamı", () => {
  test("CTA yalnızca ALLOWLIST'teki slug'ı taşır", async ({ page }) => {
    for (const solution of SOLUTIONS) {
      await page.goto(trPath(solution.tr));
      const href = await page.locator('[data-analytics-event="solution-cta"]').getAttribute("href");
      expect(href, solution.tr).toBe(`/iletisim/?topic=${solution.tr}`);
    }
    await page.goto(enPath(SOLUTIONS[0].en));
    expect(await page.locator('[data-analytics-event="solution-cta"]').getAttribute("href")).toBe(
      `/en/contact/?topic=${SOLUTIONS[0].en}`
    );
  });

  test("CTA hiçbir analytics İSTEĞİ başlatmaz", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (request) => {
      if (!request.url().includes("127.0.0.1") && !request.url().includes("localhost")) {
        external.push(request.url());
      }
    });
    await page.goto(DEEP[0].path);
    await page.locator('[data-analytics-event="solution-cta"]').click();
    await page.waitForURL(/\/iletisim\/\?topic=/);
    expect(external).toEqual([]);
  });

  test("iletişim sayfası topic parametresini KİŞİSEL VERİ olarak işlemez", async ({ page }) => {
    await page.goto(`/iletisim/?topic=${DEEP[0].slug}`);
    await expect(page.locator("form, input, textarea, select")).toHaveCount(0);
  });
});

// ---------------------------------------------------------------- 7. iletişim kabuğu

test.describe("iletişim kabuğu", () => {
  for (const url of ["/iletisim/", "/en/contact/"]) {
    test(`form ve kişisel veri toplama YOK: ${url}`, async ({ page }) => {
      const response = await page.goto(url);
      expect(response?.status()).toBe(200);
      await expect(page.locator("form, input, textarea, select, button[type=submit]")).toHaveCount(
        0
      );
      await expect(page.locator("h1")).toHaveCount(1);
      const robots = await page.locator('meta[name="robots"]').getAttribute("content");
      expect(robots).toContain("noindex");
    });
  }

  test("yalnızca doğrulanmış iletişim bilgisi görünür", async ({ page }) => {
    await page.goto("/iletisim/");
    const text = await page.locator("main").innerText();
    expect(text).toContain("info@duosis.com");
    // Doğrulanmamış kişi adı, unvan veya e-posta uzantısı yayınlanmaz.
    expect(text).not.toMatch(/[a-z0-9._%-]+@(?!duosis\.com)[a-z0-9.-]+\.[a-z]{2,}/i);
  });
});

// ---------------------------------------------------------------- 8. görsel kalite eşiği

test.describe("görsel kalite eşiği", () => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    test(`yatay taşma yok: ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const url of ["/cozumler/", DEEP[0].path, "/iletisim/"]) {
        await page.goto(url);
        const overflow = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        expect(overflow.scroll, `${url} @${width}`).toBeLessThanOrEqual(overflow.client);
      }
    });
  }

  test("mobilde metin sütunu SIKIŞMAZ", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(DEEP[0].path);
    const widths = await page
      .locator('[data-testid="solution-detail"] p, [data-testid="solution-detail"] li')
      .evaluateAll((els) =>
        els
          .filter((el) => (el.textContent ?? "").trim().length > 30)
          .map((el) => Math.round(el.getBoundingClientRect().width))
      );
    expect(widths.length).toBeGreaterThan(0);
    expect(Math.min(...widths)).toBeGreaterThan(200);
  });

  test("masaüstünde içerik boş bir sütuna sıkışmaz", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(DEEP[0].path);
    const box = await page
      .locator('[data-testid="solution-detail"]')
      .evaluate((el) => el.getBoundingClientRect().width);
    // Okuma sütunu genişletildi: 1440px'te makale en az 800px alan kaplar.
    expect(box).toBeGreaterThan(800);
  });

  test("çözüm landing sekiz düz satır görünümünde değil", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/cozumler/");
    const row = page.locator('[data-testid="solution-list"] > li').first();
    // Her satır numara, başlık+problem ve kabiliyet/CTA sütunlarını taşır.
    await expect(row.locator(".solutions__index")).toHaveCount(1);
    await expect(row.locator(".solutions__problem")).toHaveCount(1);
    await expect(row.locator(".solutions__cta")).toHaveCount(1);
    const height = await row.evaluate((el) => el.getBoundingClientRect().height);
    expect(height).toBeGreaterThan(60);
  });
});

// ---------------------------------------------------------------- 9. erişilebilirlik

test.describe("erişilebilirlik", () => {
  for (const url of [
    "/cozumler/",
    "/en/solutions/",
    "/cozumler/operasyonel-gorunurluk/",
    "/en/solutions/data-streaming-and-integration/",
    "/iletisim/",
    "/en/contact/",
  ]) {
    test(`WCAG 2.2 AA ihlali yok: ${url}`, async ({ page }) => {
      await page.goto(url);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
