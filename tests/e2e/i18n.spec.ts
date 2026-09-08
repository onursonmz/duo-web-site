import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * TR/EN yönlendirme, dil değiştirici ve eksik çeviri davranışı.
 *
 * Bu rotalar S02 fixture verisinden üretilir:
 * - TR: /cozumler/operasyonel-gorunurluk/   (translationKey: observability-apm)
 * - EN: /en/solutions/observability-and-apm/ (aynı translationKey)
 * - Çevirisi olmayan: /cozumler/otomasyon/
 */

const TR_SOLUTION = "/cozumler/operasyonel-gorunurluk/";
const EN_SOLUTION = "/en/solutions/observability-and-apm/";
const TR_UNTRANSLATED = "/cozumler/otomasyon/";

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

test.describe("locale kökleri", () => {
  test("/ Türkçe içerik ve lang=tr", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
    await expect(page.getByRole("link", { name: "Çözümler", exact: true })).toBeVisible();
    await expect(page.locator("body")).toContainText("Çözüm alanları");
  });

  test("/en/ İngilizce içerik ve lang=en", async ({ page }) => {
    await page.goto("/en/");

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("link", { name: "Solutions", exact: true })).toBeVisible();
    await expect(page.locator("body")).toContainText("Solution areas");
  });

  test("TR ve EN ana sayfaları farklı metin gösterir", async ({ page }) => {
    await page.goto("/");
    const tr = await page.locator("#main-content").innerText();
    await page.goto("/en/");
    const en = await page.locator("#main-content").innerText();

    expect(tr).not.toBe(en);
    expect(en).not.toContain("Çözüm alanları");
  });
});

test.describe("çözüm rotaları", () => {
  test("TR çözüm rotası fixture'dan üretiliyor", async ({ page }) => {
    await page.goto(TR_SOLUTION);

    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByTestId("solution-detail")).toBeVisible();
    await expect(page.locator("body")).toContainText("Operasyonel görünürlük");
  });

  test("EN çözüm rotası aynı kaydın karşılığı", async ({ page }) => {
    await page.goto(EN_SOLUTION);

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("body")).toContainText("Operational visibility");
  });

  test("çözüm landing sayfaları sekiz TR / iki EN kaydı listeler", async ({ page }) => {
    await page.goto("/cozumler/");
    await expect(page.getByTestId("solution-list").locator("li")).toHaveCount(8);

    await page.goto("/en/solutions/");
    await expect(page.getByTestId("solution-list").locator("li")).toHaveCount(2);
  });
});

test.describe("dil değiştirici", () => {
  test("TR -> EN aynı translationKey karşılığına gider", async ({ page }) => {
    await page.goto(TR_SOLUTION);

    const link = page.getByTestId("lang-link-en");
    await expect(link).toBeVisible();
    await link.click();

    await expect(page).toHaveURL(new RegExp(`${EN_SOLUTION}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("EN -> TR aynı translationKey karşılığına gider", async ({ page }) => {
    await page.goto(EN_SOLUTION);

    const link = page.getByTestId("lang-link-tr");
    await expect(link).toBeVisible();
    await link.click();

    await expect(page).toHaveURL(new RegExp(`${TR_SOLUTION}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  });

  test("gidiş-dönüş aynı kayda döner", async ({ page }) => {
    await page.goto(TR_SOLUTION);
    await page.getByTestId("lang-link-en").click();
    await page.getByTestId("lang-link-tr").click();
    await expect(page).toHaveURL(new RegExp(`${TR_SOLUTION}$`));
  });
});

test.describe("eksik çeviri — sessiz fallback YOK", () => {
  test("çevirisi olmayan sayfada EN linki üretilmez", async ({ page }) => {
    await page.goto(TR_UNTRANSLATED);

    await expect(page.getByTestId("lang-link-en")).toHaveCount(0);
    await expect(page.getByTestId("lang-unavailable-en")).toBeVisible();
  });

  test("erişilebilir 'çeviri mevcut değil' bilgisi gösterilir", async ({ page }) => {
    await page.goto(TR_UNTRANSLATED);

    const unavailable = page.getByTestId("lang-unavailable-en");
    await expect(unavailable).toContainText("English");
    await expect(unavailable).toContainText("bu dilde henüz yayınlanmadı");
    // Bağlantı DEĞİL: tıklanabilir bir öğe olmamalı.
    await expect(unavailable.locator("a")).toHaveCount(0);
  });

  test("hiçbir sayfa yanlış dilde içerik göstermiyor", async ({ page }) => {
    await page.goto(TR_UNTRANSLATED);
    const main = await page.locator("#main-content").innerText();
    // TR sayfada EN gövde metni bulunmamalı.
    expect(main).not.toContain("Expected outcomes");
    expect(main).toContain("Beklenen faydalar");
  });
});

test.describe("public içerik filtreleri", () => {
  test("pasif teknoloji (CyclOps) public çıktıda görünmez", async ({ page }) => {
    await page.goto("/cozumler/aiops-ve-olay-yasam-dongusu/");

    const html = await page.content();
    expect(html.toLowerCase()).not.toContain("cyclops");
    await expect(page.getByTestId("technology-empty")).toBeVisible();
  });

  test("aktif teknolojiler listeleniyor", async ({ page }) => {
    await page.goto(TR_SOLUTION);

    const list = page.getByTestId("technology-list");
    await expect(list).toBeVisible();
    await expect(list.locator("li")).toHaveCount(5);
    await expect(list).toContainText("Zabbix");
  });

  test("izinsiz logo hiçbir sayfada render edilmiyor", async ({ page }) => {
    for (const route of [TR_SOLUTION, EN_SOLUTION, "/cozumler/", "/"]) {
      await page.goto(route);
      // Fixture'ların tamamında logoPermission unknown; hiç <img> olmamalı.
      await expect(page.locator("#main-content img")).toHaveCount(0);
    }
  });
});

test.describe("sağlık kontrolleri", () => {
  const ROUTES = [
    "/",
    "/en/",
    "/cozumler/",
    "/en/solutions/",
    TR_SOLUTION,
    EN_SOLUTION,
    TR_UNTRANSLATED,
  ];

  for (const route of ROUTES) {
    test(`${route} console hatası üretmiyor`, async ({ page }) => {
      const errors = collectErrors(page);
      await page.goto(route, { waitUntil: "networkidle" });
      expect(errors).toEqual([]);
    });
  }

  test("iç bağlantıların hiçbiri kırık değil", async ({ page, request }) => {
    const seen = new Set<string>();

    for (const route of ROUTES) {
      await page.goto(route);
      const hrefs = await page
        .locator("a[href^='/']")
        .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
      for (const href of hrefs) {
        if (href !== "" && !href.startsWith("//")) seen.add(href);
      }
    }

    expect(seen.size).toBeGreaterThan(5);
    for (const href of seen) {
      const response = await request.get(href);
      expect(response.status(), `kırık iç bağlantı: ${href}`).toBe(200);
    }
  });

  test("@a11y TR çözüm sayfası axe kontrolünden geçer", async ({ page }) => {
    await page.goto(TR_SOLUTION);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });

  test("@a11y EN çözüm sayfası axe kontrolünden geçer", async ({ page }) => {
    await page.goto(EN_SOLUTION);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });
});
