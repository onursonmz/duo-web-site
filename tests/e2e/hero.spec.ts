import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * İMZA HERO KABUL TESTLERİ — S06'da yazıldı, S15-R1'de yeniden kuruldu.
 *
 * Hero artık ekranı dolduran, katmanlı bir operasyon evrenidir
 * (`SignatureHero.astro`). Anlatı değişmedi: kaynak → sinyal → bağlam → karar
 * → aksiyon. Bilgi animasyona, hover'a veya JavaScript'e BAĞLI DEĞİLDİR.
 *
 * S15-R1'DE DEĞİŞEN İKİ GÜVENCE — ikisi de bilinçli ve gerekçeli:
 *
 * 1. "HERO SIFIR EK CLIENT JS GETİRİR" kaldırıldı. Talimat kontrollü bir
 *    kamera/parallax hareketi istiyor; bu ~1 KB JS ile çözüldü. Yerine ÖLÇÜLEN
 *    bir bütçe ve "JS olmadan da tam çalışır" güvencesi kondu.
 *
 * 2. "BEŞ AŞAMA METNİ 1366x768'İN İLK EKRANINDA" güvencesi daraltıldı.
 *    85-100vh'lik bir hero ile beş aşamanın GÖVDE metinleri 768 piksel
 *    yüksekliğe sığmıyor. Sığması gereken ve ölçülen küme: H1, açıklama, iki
 *    CTA ve beş aşama BAŞLIĞI. Gövdeler ilk kaydırmada okunur.
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
    const heroBox = await page.getByTestId("hero-atlas").boundingBox();
    const atlasBox = await page.getByTestId("solution-atlas").boundingBox();
    expect(heroBox).not.toBeNull();
    expect(atlasBox).not.toBeNull();
    expect(atlasBox!.y).toBeGreaterThan(heroBox!.y);

    // Aradaki geçiş bandı GERÇEKTEN var ve hero'nun hemen ardından geliyor.
    const bridge = page.locator('[data-bridge="flow-out"]').first();
    const bridgeBox = await bridge.boundingBox();
    expect(bridgeBox).not.toBeNull();
    expect(bridgeBox!.y).toBeGreaterThanOrEqual(heroBox!.y + heroBox!.height - 2);
    expect(bridgeBox!.y).toBeLessThan(atlasBox!.y);
  });

  test("hero EKRANI DOLDURUYOR (85-100vh aralığı)", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const ratio = await page.evaluate(() => {
      const hero = document.querySelector(".hero");
      if (hero === null) return 0;
      return hero.getBoundingClientRect().height / window.innerHeight;
    });
    expect(
      ratio,
      `hero yüksekliği viewport'un %${Math.round(ratio * 100)}'i`
    ).toBeGreaterThanOrEqual(0.85);
    expect(ratio).toBeLessThanOrEqual(1);
  });
});

test.describe("hero erişilebilirliği", () => {
  test("SAHNE DEKORATİF olarak işaretli", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");
    const stage = page.getByTestId("hero-atlas");
    await expect(stage).toHaveAttribute("aria-hidden", "true");

    // Sahnedeki her SVG odaklanılamaz olmalı.
    const focusable = await stage
      .locator("svg")
      .evaluateAll((els) => els.filter((e) => e.getAttribute("focusable") !== "false").length);
    expect(focusable).toBe(0);
  });

  test("aşama bilgisi HOVER'a bağlı DEĞİL: etkileşimsiz görünür", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");
    for (const key of STAGES) {
      await expect(page.locator(`.stage[data-stage="${key}"] .stage__body`)).toBeVisible();
    }
  });

  test("hero'da TOOLTIP katmanı yok (viewport taşması imkânsız)", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");
    const heroTooltips = await page
      .locator(".hero")
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
      .locator(".u-path")
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
    // Giriş animasyonu sürekli loop DEĞİL.
    expect(link.count).toBe("1");
    expect(link.fill).toBe("forwards");
  });

  test("REDUCED MOTION altında intro HİÇ çalışmıyor", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const link = await page
      .locator(".u-path")
      .first()
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return { name: s.animationName, offset: s.strokeDashoffset };
      });
    expect(link.name).toBe("none");
    // Çizgi doğrudan SON hâlinde: anlam kaybı yok.
    expect(Number.parseFloat(link.offset)).toBe(0);

    const node = await page
      .locator(".u-core > *")
      .first()
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return { name: s.animationName, opacity: s.opacity };
      });
    expect(node.name).toBe("none");
    expect(Number.parseFloat(node.opacity)).toBeGreaterThan(0);

    // Sürekli akan sinyal TAMAMEN kaldırılır.
    await expect(page.locator(".u-pulses").first()).toBeHidden();
  });

  test("REDUCED MOTION altında KAMERA da durur", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.mouse.move(300, 400);
    await page.mouse.move(1200, 700);
    await page.waitForTimeout(200);

    const transform = await page.locator(".univ").evaluate((el) => getComputedStyle(el).transform);
    expect(transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)").toBe(true);
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
        const walk = (list: CSSRuleList): void => {
          for (const rule of [...list]) {
            if (rule instanceof CSSKeyframesRule) {
              for (const frame of [...rule.cssRules] as CSSStyleRule[]) {
                for (const prop of ["width", "height", "top", "left", "margin", "padding"]) {
                  if (frame.style.getPropertyValue(prop) !== "") found.push(`${rule.name}:${prop}`);
                }
              }
            } else if ("cssRules" in rule) {
              walk((rule as CSSGroupingRule).cssRules);
            }
          }
        };
        walk(rules);
      }
      return found;
    });
    expect(unsafe, `düzen özelliği animasyonu: ${unsafe.join(", ")}`).toEqual([]);
  });

  test("SCROLL HIJACKING YOK: wheel/touchmove dinleyicisi kaydedilmiyor", async ({ page }) => {
    /*
     * DOM'a bakmak yetmez; kanıt, dinleyicinin HİÇ kaydedilmediğidir. Bu
     * yüzden `addEventListener` sayfa script'lerinden ÖNCE sarmalanır ve
     * kaydedilen her wheel/touchmove/scroll dinleyicisi toplanır.
     */
    await page.addInitScript(() => {
      const registry: string[] = [];
      (window as unknown as { __scrollListeners: string[] }).__scrollListeners = registry;
      const original = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function patched(
        type: string,
        listener: EventListenerOrEventListenerObject | null,
        options?: boolean | AddEventListenerOptions
      ): void {
        if (type === "wheel" || type === "touchmove" || type === "mousewheel") {
          registry.push(type);
        }
        original.call(this, type, listener, options);
      };
    });

    await page.goto("/", { waitUntil: "networkidle" });
    const listeners = await page.evaluate(
      () => (window as unknown as { __scrollListeners: string[] }).__scrollListeners
    );
    expect(listeners, `scroll'a müdahale eden dinleyici: ${listeners.join(", ")}`).toEqual([]);
  });
});

test.describe("hero performans bütçesi", () => {
  test.use({ viewport: DESKTOP });

  test("HİÇBİR harici ağ isteği yok", async ({ page }) => {
    /*
     * E2E sunucusu her koşuda DİNAMİK bir loopback portunda çalışır; bu yüzden
     * karşılaştırma origin değil HOST üzerinden yapılır.
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

  test("KAMERA JS'i satır içi ve bütçe altında", async ({ page }) => {
    await page.goto("/");

    // Harici script dosyası yok: her şey satır içi modülde.
    await expect(page.locator("script[src]")).toHaveCount(0);

    // Toplam satır içi modül bütçesi: ana sayfa için 8 KB ham.
    const bytes = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="module"]')].reduce(
        (sum, el) => sum + new Blob([el.textContent ?? ""]).size,
        0
      )
    );
    expect(bytes, `satır içi modül boyutu ${bytes} B`).toBeLessThan(8192);
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

  test("hero kaynaklı DÜZEN KAYMASI yok (ölçülen CLS)", async ({ page }) => {
    /*
     * Eski sürüm `aspect-ratio` üzerinden dolaylı ölçüyordu. Sahne artık
     * akıştan çıkarılmış bir katman; doğru güvence GERÇEK kaymayı ölçmektir.
     */
    await page.goto("/", { waitUntil: "commit" });
    await page.evaluate(() => {
      const state = { value: 0 };
      (window as unknown as { __cls: { value: number } }).__cls = state;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & {
          value: number;
          hadRecentInput: boolean;
        })[]) {
          if (!entry.hadRecentInput) state.value += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(3000);

    const cls = await page.evaluate(
      () => (window as unknown as { __cls: { value: number } }).__cls.value
    );
    expect(cls, `ölçülen CLS ${cls}`).toBeLessThan(0.05);
  });
});

test.describe("hero JavaScript olmadan", () => {
  test.use({ viewport: DESKTOP, javaScriptEnabled: false });

  test("sahne ve aşamalar SON kompozisyonda görünüyor", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByTestId("hero-stages").locator("li")).toHaveCount(5);
    await expect(page.locator(".univ__layer--core svg")).toBeVisible();
    await expect(page.locator('#hero a[href="/cozumler/"]')).toBeVisible();

    // Kamera yazmasa da sahne nötr duruşta durur.
    const transform = await page.locator(".univ").evaluate((el) => getComputedStyle(el).transform);
    expect(transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)").toBe(true);
  });
});

test.describe("hero mobil", () => {
  test.use({ viewport: MOBILE, isMobile: true, hasTouch: true });

  test("geniş sahne gizli; harita RAYIN İÇİNE taşınmış", async ({ page }) => {
    await page.goto("/");
    // 3B katmanlı geniş sahne mobilde hiç render edilmez.
    await expect(page.locator(".univ__camera")).toBeHidden();

    // Beş aşama ve metinleri okunur kalır.
    await expect(page.getByTestId("hero-stages").locator("li")).toHaveCount(5);
    for (const key of STAGES) {
      await expect(page.locator(`.stage[data-stage="${key}"] .stage__body`)).toBeVisible();
    }

    /*
     * Operasyon haritası mobilde rayın kendisidir: kesintisiz bir sinyal
     * omurgası ve aşamaya göre farklılaşan düğümler. Bunlar `::before`
     * olduğu için GERÇEKTEN çizildiklerini computed style ile ölçeriz.
     */
    const rail = await page.locator('[data-testid="hero-stages"]').evaluate((el) => {
      const spine = getComputedStyle(el, "::before");
      return { content: spine.content, width: spine.inlineSize, image: spine.backgroundImage };
    });
    expect(rail.content).not.toBe("none");
    expect(rail.image, "sinyal omurgası boyanmamış").toContain("gradient");

    const markers = await page.evaluate(() =>
      ["source", "decide", "act"].map((key) => {
        const el = document.querySelector(`.stage[data-stage="${key}"]`);
        if (el === null) return null;
        const style = getComputedStyle(el, "::before");
        return {
          key,
          radius: style.borderTopLeftRadius,
          border: style.borderTopWidth,
          background: style.backgroundColor,
        };
      })
    );
    // Aksiyon düğümü DAİRE DEĞİL, kapalı bir karedir: akış bir sonuca bağlanır.
    const act = markers.find((m) => m?.key === "act");
    expect(act).not.toBeNull();
    expect(Number.parseFloat(act?.border ?? "0"), "aksiyon düğümü çerçevesiz").toBeGreaterThan(0);
    expect(act?.radius).not.toBe("50%");

    // Karar düğümü bakır dolgu taşır; kaynak düğümünden farklıdır.
    const decide = markers.find((m) => m?.key === "decide");
    const source = markers.find((m) => m?.key === "source");
    expect(decide?.background).not.toBe(source?.background);
  });

  test("DOKUNMATİK senaryo: bilgi için dokunma gerekmiyor", async ({ page }) => {
    await page.goto("/");
    const before = await page.getByTestId("hero-stages").innerText();
    await page.locator('.stage[data-stage="decide"]').tap();
    const after = await page.getByTestId("hero-stages").innerText();
    expect(after).toBe(before);
  });
});

/**
 * İLK EKRAN KOMPOZİSYONU.
 *
 * S08'de kondu, S15-R1'de ÖLÇÜLEREK daraltıldı: 85-100vh'lik bir hero ile beş
 * aşamanın gövde metinleri 768 piksel yüksekliğe sığmıyor. Sığması gereken ve
 * burada ölçülen küme H1, açıklama, iki CTA ve beş aşama BAŞLIĞIDIR.
 */
const FIRST_SCREEN = [
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
] as const;

test.describe("ilk ekran kompozisyonu", () => {
  for (const viewport of FIRST_SCREEN) {
    for (const route of ["/", "/en/"]) {
      test(`${viewport.width}x${viewport.height} ${route} — beş aşama BAŞLIĞI ilk viewport içinde`, async ({
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

        await expect(page.locator(".hero__actions a")).toHaveCount(2);
        for (const cta of await page.locator(".hero__actions a").all()) {
          await expect(cta).toBeInViewport();
        }
      });
    }
  }

  test("sinyal etiketleri sahnedeki PORTLARLA aynı hizada", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    const measured = await page.evaluate(() => {
      const mid = (el: Element): number => {
        const rect = el.getBoundingClientRect();
        return rect.top + rect.height / 2;
      };
      return {
        labels: [...document.querySelectorAll(".univ__label")].map(mid),
        ports: [...document.querySelectorAll(".univ__layer--flow .u-port")].map(mid),
        labelRight: Math.max(
          ...[...document.querySelectorAll(".univ__label")].map(
            (el) => el.getBoundingClientRect().right
          )
        ),
        portLeft: Math.min(
          ...[...document.querySelectorAll(".univ__layer--flow .u-port")].map(
            (el) => el.getBoundingClientRect().left
          )
        ),
      };
    });

    expect(measured.labels).toHaveLength(5);
    expect(measured.ports).toHaveLength(5);
    for (let i = 0; i < 5; i += 1) {
      const label = measured.labels[i] ?? Number.NaN;
      const port = measured.ports[i] ?? Number.NaN;
      expect(Math.abs(label - port), `etiket ${i + 1} portuyla hizalı değil`).toBeLessThanOrEqual(
        12
      );
    }

    // Etiket portun SOLUNDA durur; üstüne binmez.
    expect(measured.labelRight).toBeLessThan(measured.portLeft);
  });

  test("METİN BLOĞU sahnenin sinyal portlarına DEĞMİYOR", async ({ page }) => {
    /*
     * Kompozisyon kuralı: metin sütunu ile sahne arasında gerçek bir boşluk
     * kalmalı. Değerse hem üst üste biner hem metnin altındaki kontrast
     * garantisi bozulur.
     */
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    const gap = await page.evaluate(() => {
      const textRight = Math.max(
        ...["h1", ".hero__lead"].map((selector) => {
          const el = document.querySelector(selector);
          return el === null ? 0 : el.getBoundingClientRect().right;
        })
      );
      const labelLeft = Math.min(
        ...[...document.querySelectorAll(".univ__label")].map(
          (el) => el.getBoundingClientRect().left
        )
      );
      return labelLeft - textRight;
    });
    expect(gap, `metin ile sahne arası ${Math.round(gap)} px`).toBeGreaterThan(24);
  });

  test("SVG'ye metin GÖMÜLMEMİŞ", async ({ page }) => {
    await page.goto("/");
    const svgText = await page
      .getByTestId("hero-atlas")
      .evaluate((el) => el.querySelectorAll("text, foreignObject").length);
    expect(svgText).toBe(0);
  });
});
