import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * S06 — COMMAND ATLAS İMZA HERO KABUL TESTLERİ.
 *
 * Hero, Duosis'in çalışma modelini anlatır: kaynak → sinyal → bağlam → karar
 * → aksiyon. Bilgi animasyona veya hover'a BAĞLI DEĞİLDİR.
 */

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

/** Sözleşmedeki beş aşama; sıra ve anahtar kümesi kapalıdır. */
const STAGES = ["source", "signal", "context", "decide", "act"];

test.describe("hero anlatısı", () => {
  test.use({ viewport: DESKTOP });

  test("BEŞ AŞAMA doğru sırada ve okunabilir metinle", async ({ page }) => {
    await page.goto("/");
    const list = page.getByTestId("hero-stages");
    await expect(list.locator("li")).toHaveCount(5);

    const keys = await list
      .locator("li")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-stage")));
    expect(keys).toEqual(STAGES);

    // Her aşama gerçek bir açıklama taşımalı — süs değil.
    const bodies = await list
      .locator(".stage__body")
      .evaluateAll((els) => els.map((e) => (e.textContent ?? "").trim().length));
    for (const length of bodies) {
      expect(length).toBeGreaterThan(40);
    }
  });

  test("H1 ve CTA'lar İLK HTML'de; görsel içine gömülü değil", async ({ page }) => {
    // Ham HTML üzerinde kontrol: JS veya görsel olmadan da orada olmalı.
    const res = await page.request.get("/");
    const html = await res.text();

    expect(html).toMatch(/<h1[^>]*>/);
    expect(html).toContain("Operasyonu görün");
    expect(html).toContain("Çözüm alanlarını inceleyin");
    expect(html).toContain("Birlikte yol haritası çıkaralım");
  });

  test("hero'dan ÇÖZÜM ATLASINA görsel süreklilik var", async ({ page }) => {
    await page.goto("/");
    // Hero topolojisi ile çözüm atlası aynı sayfada ve sırayla gelir.
    const heroBox = await page.getByTestId("hero-atlas").boundingBox();
    const atlasBox = await page.getByTestId("solution-atlas").boundingBox();
    expect(heroBox).not.toBeNull();
    expect(atlasBox).not.toBeNull();
    expect(atlasBox!.y).toBeGreaterThan(heroBox!.y);
  });
});

test.describe("hero erişilebilirliği", () => {
  test("SVG topolojisi DEKORATİF olarak işaretli", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");
    const svg = page.locator(".atlas__svg");
    await expect(svg).toHaveAttribute("aria-hidden", "true");
    await expect(svg).toHaveAttribute("focusable", "false");
  });

  test("aşama bilgisi HOVER'a bağlı DEĞİL: etkileşimsiz görünür", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");
    // Fareyi hiç kullanmadan tüm açıklamalar görünür olmalı.
    for (const key of STAGES) {
      await expect(page.locator(`.stage[data-stage="${key}"] .stage__body`)).toBeVisible();
    }
  });

  test("hero'da TOOLTIP katmanı yok (viewport taşması imkânsız)", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");
    const heroTooltips = await page
      .getByTestId("hero-atlas")
      .locator('[role="tooltip"], [data-tooltip], title')
      .count();
    expect(heroTooltips).toBe(0);
  });

  test("klavye TAB sırası hero CTA'larından geçiyor", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");

    const seen: string[] = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      seen.push(
        await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          return el?.getAttribute("href") ?? el?.tagName.toLowerCase() ?? "";
        })
      );
    }
    expect(seen).toContain("/cozumler/");
    expect(seen).toContain("#roadmap");
    expect(seen.filter((s) => s === "")).toEqual([]);
  });

  test("@a11y hero bölümü axe kontrolünden geçiyor", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");
    const result = await new AxeBuilder({ page })
      .include("#hero")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });
});

test.describe("hero hareket davranışı", () => {
  test.use({ viewport: DESKTOP });

  test("NORMAL modda intro animasyonu tanımlı ve BİR KEZ çalışıyor", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");

    const link = await page
      .locator(".atlas__link")
      .first()
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          name: s.animationName,
          count: s.animationIterationCount,
          fill: s.animationFillMode,
        };
      });
    expect(link.name).not.toBe("none");
    // Sürekli loop YOK.
    expect(link.count).toBe("1");
    expect(link.fill).toBe("forwards");
  });

  test("REDUCED MOTION altında intro HİÇ çalışmıyor", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const link = await page
      .locator(".atlas__link")
      .first()
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return { name: s.animationName, offset: s.strokeDashoffset };
      });
    expect(link.name).toBe("none");
    // Çizgi doğrudan SON hâlinde: anlam kaybı yok.
    expect(Number.parseFloat(link.offset)).toBe(0);

    const node = await page
      .locator(".atlas__nodes > *")
      .first()
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return { name: s.animationName, opacity: s.opacity };
      });
    expect(node.name).toBe("none");
    expect(Number.parseFloat(node.opacity)).toBe(1);
  });

  test("REDUCED MOTION altında içerik ve CTA kaybı YOK", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByTestId("hero-stages").locator("li")).toHaveCount(5);
    await expect(page.locator('#hero a[href="/cozumler/"]')).toBeVisible();
    await expect(page.locator('#hero a[href="#roadmap"]')).toBeVisible();
  });

  test("animasyon yalnızca GÜVENLİ özellikleri değiştiriyor", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    // Düzen özelliklerini animasyona sokan bir kural olmamalı.
    const unsafe = await page.evaluate(() => {
      const found: string[] = [];
      for (const sheet of [...document.styleSheets]) {
        let rules: CSSRuleList;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }
        for (const rule of [...rules]) {
          if (!(rule instanceof CSSKeyframesRule)) continue;
          for (const frame of [...rule.cssRules] as CSSStyleRule[]) {
            for (const prop of ["width", "height", "top", "left", "margin", "padding"]) {
              if (frame.style.getPropertyValue(prop) !== "") found.push(`${rule.name}:${prop}`);
            }
          }
        }
      }
      return found;
    });
    expect(unsafe, `düzen özelliği animasyonu: ${unsafe.join(", ")}`).toEqual([]);
  });
});

test.describe("hero performans bütçesi", () => {
  test.use({ viewport: DESKTOP });

  test("HİÇBİR harici ağ isteği yok", async ({ page }) => {
    /*
     * E2E sunucusu her koşuda DİNAMİK bir loopback portunda çalışır; bu yüzden
     * karşılaştırma origin değil HOST üzerinden yapılır. (İlk denemede
     * `page.url()` henüz `about:blank` olduğu için kendi sunucumuz "harici"
     * sayılıyordu.)
     */
    const external: string[] = [];
    page.on("request", (req) => {
      const url = new URL(req.url());
      if (url.protocol === "data:" || url.protocol === "blob:") return;
      if (url.hostname === "127.0.0.1" || url.hostname === "localhost") return;
      external.push(req.url());
    });

    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    expect(external, `harici istek: ${external.join(", ")}`).toEqual([]);
  });

  test("HERO SIFIR ek client JS getiriyor", async ({ page }) => {
    await page.goto("/");
    // Hero yalnızca CSS ve inline SVG kullanır; kendi script'i yoktur.
    const heroScripts = await page.getByTestId("hero-atlas").locator("script").count();
    expect(heroScripts).toBe(0);

    // Sayfa genelinde harici script dosyası da yok.
    await expect(page.locator("script[src]")).toHaveCount(0);
  });

  test("yeni RASTER görsel eklenmedi", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const raster = await page.evaluate(() =>
      [...document.querySelectorAll("img")]
        .map((el) => el.getAttribute("src") ?? "")
        .filter((src) => /\.(png|jpe?g|webp|avif|gif)$/i.test(src))
    );
    expect(raster, `raster görsel: ${raster.join(", ")}`).toEqual([]);
  });

  test("hero kaynaklı CLS yok: SVG sabit en-boy oranı taşıyor", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    // Oran, SVG'nin KENDİ viewBox'ıyla karşılaştırılır: geometri değişirse
    // aspect-ratio da değişmek zorundadır, aksi halde yer ayırma bozulur ve
    // test kırılır. Sabit bir değere bağlanmaz.
    const measured = await page.locator(".atlas__svg").evaluate((el) => ({
      ratio: getComputedStyle(el).aspectRatio.replace(/\s/g, ""),
      viewBox: el.getAttribute("viewBox") ?? "",
    }));
    const parts = measured.viewBox.split(/\s+/);
    expect(parts).toHaveLength(4);
    expect(measured.ratio).toBe(`${parts[2]}/${parts[3]}`);
  });
});

test.describe("hero JavaScript olmadan", () => {
  test.use({ viewport: DESKTOP, javaScriptEnabled: false });

  test("topoloji ve aşamalar SON kompozisyonda görünüyor", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByTestId("hero-stages").locator("li")).toHaveCount(5);
    await expect(page.locator(".atlas__svg")).toBeVisible();
    await expect(page.locator('#hero a[href="/cozumler/"]')).toBeVisible();
  });
});

test.describe("hero mobil", () => {
  test.use({ viewport: MOBILE, isMobile: true, hasTouch: true });

  test("geniş topoloji GİZLİ, aşamalar okunabilir kalıyor", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".atlas__svg")).toBeHidden();
    await expect(page.getByTestId("hero-stages").locator("li")).toHaveCount(5);
    for (const key of STAGES) {
      await expect(page.locator(`.stage[data-stage="${key}"] .stage__body`)).toBeVisible();
    }
  });

  test("DOKUNMATİK senaryo: bilgi için dokunma gerekmiyor", async ({ page }) => {
    await page.goto("/");
    const before = await page.getByTestId("hero-stages").innerText();
    await page.locator('.stage[data-stage="decide"]').tap();
    const after = await page.getByTestId("hero-stages").innerText();
    // Dokunma bilgiyi DEĞİŞTİRMEZ; zaten tamamı görünürdür.
    expect(after).toBe(before);
  });
});

/**
 * İLK EKRAN KOMPOZİSYONU (S08 takip kararı).
 *
 * Beş aşamanın metinleri masaüstünde ilk viewport'un ALTINDA kalıyordu; soyut
 * SVG tek başına kaynak → sinyal → bağlam → karar → aksiyon hikâyesini
 * anlatmıyordu.
 *
 * Test DOM'da bulunmayı değil GERÇEK VIEWPORT GÖRÜNÜRLÜĞÜNÜ ölçer: her aşama
 * başlığının bounding box'ı viewport sınırları içinde olmalıdır.
 */
const FIRST_SCREEN = [
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
] as const;

test.describe("ilk ekran kompozisyonu", () => {
  for (const viewport of FIRST_SCREEN) {
    for (const route of ["/", "/en/"]) {
      test(`${viewport.width}x${viewport.height} ${route} — beş aşama adı ilk viewport içinde`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(route);
        await page.evaluate(() => document.fonts.ready);

        const titles = page.locator('[data-testid="hero-stages"] .stage__title');
        await expect(titles).toHaveCount(5);

        const boxes = await titles.evaluateAll((els) =>
          els.map((el) => {
            const rect = el.getBoundingClientRect();
            return {
              text: (el.textContent ?? "").trim(),
              top: rect.top,
              bottom: rect.bottom,
              left: rect.left,
              right: rect.right,
              width: rect.width,
              height: rect.height,
            };
          })
        );

        for (const box of boxes) {
          expect(box.width, `${box.text} genişliği sıfır`).toBeGreaterThan(0);
          expect(box.height, `${box.text} yüksekliği sıfır`).toBeGreaterThan(0);
          expect(box.top, `${box.text} viewport üstünde`).toBeGreaterThanOrEqual(0);
          expect(
            box.bottom,
            `${box.text} ilk viewport dışında (bottom=${Math.round(box.bottom)} > ${viewport.height})`
          ).toBeLessThanOrEqual(viewport.height);
          expect(box.left).toBeGreaterThanOrEqual(0);
          expect(box.right).toBeLessThanOrEqual(viewport.width);
        }
      });

      test(`${viewport.width}x${viewport.height} ${route} — H1, açıklama ve CTA'lar ilk viewport içinde`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(route);
        await page.evaluate(() => document.fonts.ready);

        for (const selector of ["h1", ".hero__lead", ".hero__actions"]) {
          const bottom = await page
            .locator(selector)
            .first()
            .evaluate((el) => el.getBoundingClientRect().bottom);
          expect(bottom, `${selector} ilk viewport dışında`).toBeLessThanOrEqual(viewport.height);
        }

        // İki CTA da görünür kalmalı.
        await expect(page.locator(".hero__actions a")).toHaveCount(2);
        for (const cta of await page.locator(".hero__actions a").all()) {
          await expect(cta).toBeInViewport();
        }
      });
    }
  }

  test("aşama başlıkları SVG düğümleriyle aynı hizada", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    const centers = await page.evaluate(() => {
      const centerOf = (el: Element): number => {
        const rect = el.getBoundingClientRect();
        return rect.left + rect.width / 2;
      };
      const stages = [...document.querySelectorAll('[data-testid="hero-stages"] .stage')].map(
        centerOf
      );
      const nodes = [
        document.querySelector(".atlas__source"),
        document.querySelector(".atlas__signal"),
        document.querySelector(".atlas__hub"),
        // S15: dördüncü düğüm artık bakır KARAR noktası (`.atlas__hub--ai`
        // yerine `.atlas__decision`). Aynı ızgara sütununda durur.
        document.querySelector(".atlas__decision"),
        document.querySelector(".atlas__action"),
      ].map((el) => (el === null ? Number.NaN : centerOf(el)));
      return { stages, nodes };
    });

    expect(centers.stages).toHaveLength(5);
    for (let i = 0; i < 5; i += 1) {
      const stage = centers.stages[i] ?? Number.NaN;
      const node = centers.nodes[i] ?? Number.NaN;
      // Düğüm ve etiket aynı sütunda: 20px'ten fazla kayma görsel eşleşmeyi bozar.
      expect(Math.abs(stage - node), `aşama ${i + 1} düğümüyle hizalı değil`).toBeLessThanOrEqual(
        20
      );
    }
  });

  test("SVG'ye metin GÖMÜLMEMİŞ", async ({ page }) => {
    await page.goto("/");
    const svgText = await page
      .locator(".atlas__svg")
      .evaluate((el) => el.querySelectorAll("text, foreignObject").length);
    expect(svgText).toBe(0);
  });
});
