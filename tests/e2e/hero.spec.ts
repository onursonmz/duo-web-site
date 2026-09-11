import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * İMZA HERO KABUL TESTLERİ — S06'da yazıldı, S15-R2'de WebGL'e taşındı.
 *
 * Hero artık tek, sürekli bir WebGL sahnesidir (`SignatureHero.astro` +
 * `@lib/scene/universe`). Anlatı değişmedi: kaynak → sinyal → bağlam → karar
 * → aksiyon. Bilgi hâlâ animasyona, hover'a, WebGL'e veya JavaScript'e BAĞLI
 * DEĞİLDİR; sahne yalnızca ANLATIR.
 *
 * S15-R2'DE DEĞİŞEN ÜÇ GÜVENCE — üçü de bilinçli ve gerekçeli:
 *
 * 1. "SATIR İÇİ MODÜL < 8 KB" kaldırıldı. Sahne artık dinamik olarak yüklenen
 *    ayrı bir yığın; doğru güvence SAYFANIN TOPLAM istemci JS'ini GZIP ile
 *    ölçmektir (tavan 220 KB, S15-R2 talimatı §9).
 *
 * 2. "BEŞ AŞAMA BAŞLIĞI İLK EKRANDA" kaldırıldı. Aşamalar artık ilk ekranın
 *    süsü değil, kamera yolculuğunun ANLATISIDIR ve kasıtlı olarak katlamanın
 *    altındadır. İlk ekranda olması gereken ve ölçülen küme: H1, açıklama ve
 *    iki CTA. Aşamaların tamamı JS olmadan da normal scroll ile okunur.
 *
 * 3. "SİNYAL ETİKETLERİ PORTLARLA HİZALI" kaldırıldı. Sahnede artık serpiştirilmiş
 *    etiket yoktur (tasarım sınırı); sinyal türleri metnin altında tek satırlık
 *    dekoratif bir künyedir.
 */

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

/** Sözleşmedeki beş aşama; sıra ve anahtar kümesi kapalıdır. */
const STAGES = ["source", "signal", "context", "decide", "act"];

/** S15-R2 §9: ana sayfa istemci JS tavanı. */
const HOME_JS_BUDGET_KB = 220;
/** S15-R2 §9: ilk yük toplamı tavanı. */
const FIRST_LOAD_BUDGET_KB = 1536;

type UniverseState = "poster" | "live" | "static";

/** Sahnenin çizim kipini döndürür; WebGL yoksa `poster` kalır. */
async function universeState(page: import("@playwright/test").Page): Promise<UniverseState> {
  return (await page
    .locator("[data-universe]")
    .getAttribute("data-universe-state")) as UniverseState;
}

/**
 * WebGL YOLUNU zorlayarak açar.
 *
 * Başsız tarayıcıda gerçek GPU yoktur; sahne üretimde olduğu gibi postere
 * düşer (bkz. `failIfMajorPerformanceCaveat`). WebGL yolunu doğrulayan
 * testler bu kapıyı `?universe=force` ile açar. Yazılım rasterleştirici yavaş
 * olduğu için bu testlerin süresi ayrıca uzatılır.
 */
async function openScene(
  page: import("@playwright/test").Page,
  route = "/"
): Promise<UniverseState> {
  await page.goto(`${route}?universe=force`);
  await page
    .waitForFunction(
      () =>
        document.querySelector("[data-universe]")?.getAttribute("data-universe-state") !== "poster",
      null,
      { timeout: 60_000 }
    )
    .catch(() => undefined);
  return universeState(page);
}

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

    // Her aşamanın BAŞLIĞI ve GÖVDESİ gerçek metin taşır.
    const texts = await list.locator("li").evaluateAll((els) =>
      els.map((e) => ({
        title: e.querySelector(".journey__title")?.textContent?.trim() ?? "",
        body: e.querySelector(".journey__body")?.textContent?.trim() ?? "",
      }))
    );
    for (const item of texts) {
      expect(item.title.length).toBeGreaterThan(2);
      expect(item.body.length).toBeGreaterThan(20);
    }
  });

  test("H1 ve CTA'lar İLK HTML'de; tuvale gömülü değil", async ({ page }) => {
    const response = await page.goto("/");
    const html = (await response?.text()) ?? "";

    expect(html).toContain("<h1");
    const h1 = await page.locator("h1").innerText();
    expect(html).toContain(h1.split(",")[0]?.trim() ?? h1);

    const ctas = page.locator(".hero__actions a");
    await expect(ctas).toHaveCount(2);
    for (const cta of await ctas.all()) {
      await expect(cta).toBeVisible();
      expect((await cta.getAttribute("href")) ?? "").not.toBe("");
    }
  });

  test("hero'dan ÇÖZÜM ATLASINA görsel süreklilik var", async ({ page }) => {
    await page.goto("/");

    /*
     * Süreklilik bir ayraç grafiği DEĞİL, aynı tuvaldir: hero bölümü ile
     * çözüm atlası TEK bir yapışkan sahnenin içinde yaşar.
     */
    const universe = page.locator("[data-universe]");
    await expect(universe.locator("#hero")).toHaveCount(1);
    await expect(universe.locator("#solutions")).toHaveCount(1);
    await expect(universe.locator("canvas[data-universe-canvas]")).toHaveCount(1);

    // Hero ile atlas arasında bölüm ayracı YOKTUR.
    const between = await page.evaluate(() => {
      const hero = document.querySelector("#hero");
      const atlas = document.querySelector("#solutions");
      if (hero === null || atlas === null) return -1;
      let count = 0;
      let node: Element | null = hero;
      while (node !== null && !node.contains(atlas)) {
        node = node.nextElementSibling;
        if (node !== null && node.querySelector("[data-bridge]") !== null) count += 1;
      }
      return count;
    });
    expect(between).toBe(0);
  });

  test("hero EKRANI DOLDURUYOR ve tuval TAM KAPLIYOR", async ({ page }) => {
    await page.goto("/");
    const measured = await page.evaluate(() => {
      const hero = document.querySelector("#hero");
      const canvas = document.querySelector("[data-universe-canvas]");
      if (hero === null || canvas === null) return null;
      const h = hero.getBoundingClientRect();
      const c = canvas.getBoundingClientRect();
      return {
        heroRatio: h.height / window.innerHeight,
        canvasW: c.width / window.innerWidth,
        canvasH: c.height / window.innerHeight,
      };
    });
    expect(measured).not.toBeNull();
    expect(measured!.heroRatio).toBeGreaterThanOrEqual(0.95);
    expect(measured!.heroRatio).toBeLessThanOrEqual(1.05);
    // Sahne küçük bir sağ kutuya sıkışamaz: tuval viewport'un TAMAMIDIR.
    expect(measured!.canvasW).toBeGreaterThanOrEqual(0.99);
    expect(measured!.canvasH).toBeGreaterThanOrEqual(0.99);
  });

  test("BAŞLIK hero'nun üstüne biniyor: beyaz şerit yok", async ({ page }) => {
    await page.goto("/");
    const overlay = await page.evaluate(() => {
      const header = document.querySelector('[data-testid="site-header"]');
      const hero = document.querySelector("#hero");
      if (header === null || hero === null) return null;
      const h = header.getBoundingClientRect();
      return {
        position: getComputedStyle(header).position,
        heroTop: Math.round(hero.getBoundingClientRect().top),
        headerTop: Math.round(h.top),
      };
    });
    expect(overlay).not.toBeNull();
    expect(overlay!.position).toBe("absolute");
    expect(overlay!.heroTop).toBeLessThanOrEqual(1);
    expect(overlay!.headerTop).toBeLessThanOrEqual(1);
  });
});

test.describe("hero WebGL sahnesi", () => {
  test.use({ viewport: DESKTOP });

  test("sahne GERÇEKTEN açılıyor ve kamera HAREKET EDİYOR", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "WebGL kipi tek tarayıcıda doğrulanır");
    test.setTimeout(180_000);
    expect(await openScene(page)).toBe("live");

    /*
     * Kameranın gerçekten hareket ettiğinin kanıtı: tuvalin PİKSELLERİ
     * zaman içinde değişir. "Kodda translateZ var" kabul kanıtı değildir.
     *
     * Okuma `page.screenshot` ile yapılır, tuvalden `drawImage` ile DEĞİL:
     * renderer `preserveDrawingBuffer` kullanmaz (üretimde maliyetli), bu
     * yüzden tuvalin doğrudan okunması boş kare döndürebilir ve iki örnek
     * YANLIŞLIKLA eşit çıkar.
     */
    const sample = async (): Promise<Buffer> =>
      page.screenshot({ clip: { x: 700, y: 240, width: 560, height: 420 } });

    const first = await sample();
    await page.waitForTimeout(3000);
    const second = await sample();
    expect(first.byteLength).toBeGreaterThan(1000);
    expect(Buffer.compare(first, second), "tuval iki örnek arasında DEĞİŞMEDİ").not.toBe(0);
  });

  test("HARİCİ kaynak yok: sahne yerel yığından geliyor", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.hostname !== "127.0.0.1" && url.protocol !== "data:") external.push(url.href);
    });
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(1500);
    expect(external, `harici istek: ${external.join(", ")}`).toEqual([]);
  });

  test("KAPI GPU ADINA BAKMIYOR: yazılım sürücü adı sahneyi engellemiyor", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "WebGL kipi tek tarayıcıda doğrulanır");
    test.setTimeout(180_000);

    /*
     * REGRESYON KORUMASI.
     *
     * Önceki sürüm `WEBGL_debug_renderer_info` ile sürücü adını okuyup
     * "swiftshader/llvmpipe/basic render" görünce sahneyi hiç açmıyordu. Bu,
     * WebGL'i sorunsuz çalıştıran normal Chrome'ları da eliyordu. Burada
     * sürücü adı KASTEN yazılım rasterleştirici gibi gösterilir; sahne yine de
     * açılmalıdır.
     */
    await page.addInitScript(() => {
      /*
       * Her prototip KENDİ orijinalini saklar. Tek bir sarmalayıcıyı iki
       * prototipe birden atamak "Illegal invocation" üretiyor: WebGL1 ve
       * WebGL2 bağlamlarının `getParameter` uygulamaları ayrıdır.
       */
      const protos = [
        WebGLRenderingContext.prototype,
        typeof WebGL2RenderingContext === "undefined" ? null : WebGL2RenderingContext.prototype,
      ];
      for (const proto of protos) {
        if (proto === null) continue;
        const original = proto.getParameter;
        proto.getParameter = function patchedGetParameter(
          this: WebGLRenderingContext,
          name: number
        ) {
          // UNMASKED_RENDERER_WEBGL
          if (name === 0x9246) return "SwiftShader Device (Subzero) llvmpipe";
          return (original as unknown as (n: number) => unknown).call(this, name);
        } as typeof original;
      }
    });

    expect(await openScene(page)).toBe("live");
  });

  test("GPU YOKSA sahne hiç indirilmiyor: statik poster", async ({ page }) => {
    /*
     * Bu testin kurduğu durum ÜRETİMDEKİ varsayılandır: gerçek donanım
     * hızlandırma yoksa sahne açılmaz. Kurulum yine de açıkça yapılır ki
     * makinede GPU olsa da sonuç aynı olsun.
     */
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function patched(
        this: HTMLCanvasElement,
        id: string,
        ...rest: unknown[]
      ) {
        if (id === "webgl" || id === "webgl2" || id === "experimental-webgl") return null;
        return (original as unknown as (...args: unknown[]) => unknown).call(this, id, ...rest);
      } as typeof HTMLCanvasElement.prototype.getContext;
    });

    const scripts: string[] = [];
    page.on("response", (response) => {
      if (/universe.*\.js$/.test(new URL(response.url()).pathname)) scripts.push(response.url());
    });

    test.setTimeout(90_000);
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(1500);

    expect(await universeState(page)).toBe("poster");
    expect(scripts, "WebGL yokken sahne yığını İNDİRİLMEMELİ").toEqual([]);

    // Poster ANLAMLI son durumu taşır ve metin hâlâ tam.
    await expect(page.locator(".universe__poster svg")).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByTestId("hero-stages").locator("li")).toHaveCount(5);
  });
});

test.describe("hero erişilebilirliği", () => {
  test.use({ viewport: DESKTOP });

  test("SAHNE DEKORATİF olarak işaretli", async ({ page }) => {
    await page.goto("/");
    const stage = page.getByTestId("hero-atlas");
    await expect(stage).toHaveAttribute("aria-hidden", "true");

    // Tuval ve poster erişilebilirlik ağacında görünmez.
    const focusable = await stage.locator("a, button, input, [tabindex]").count();
    expect(focusable).toBe(0);
  });

  test("aşama bilgisi HOVER'a bağlı DEĞİL: etkileşimsiz görünür", async ({ page }) => {
    await page.goto("/");
    const before = await page.getByTestId("hero-stages").innerText();
    await page.mouse.move(720, 450);
    const after = await page.getByTestId("hero-stages").innerText();
    expect(after).toBe(before);
  });

  test("klavye TAB sırası hero CTA'larından geçiyor", async ({ page }) => {
    await page.goto("/");
    const primary = page.locator(".hero__actions a").first();
    await primary.focus();
    await expect(primary).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator(".hero__actions a").nth(1)).toBeFocused();
  });

  test("@a11y hero bölümü axe kontrolünden geçiyor", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .include("[data-universe]")
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("hero hareket davranışı", () => {
  test.use({ viewport: DESKTOP });

  test("REDUCED MOTION altında sahne DONAR, içerik tam kalır", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "WebGL kipi tek tarayıcıda doğrulanır");
    test.setTimeout(180_000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await openScene(page)).toBe("static");

    // Tek kare çizilir ve orada kalır: pikseller DEĞİŞMEZ.
    const sample = async (): Promise<Buffer> =>
      page.screenshot({ clip: { x: 700, y: 240, width: 560, height: 420 } });
    const first = await sample();
    await page.waitForTimeout(2000);
    expect(Buffer.compare(first, await sample()), "kamera DURMADI").toBe(0);

    // Anlamlı SON durum: metin ve aşamaların tamamı yerinde.
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".hero__actions a")).toHaveCount(2);
    await expect(page.getByTestId("hero-stages").locator("li")).toHaveCount(5);
    for (const step of await page.locator(".journey__inner").all()) {
      await expect(step).toBeVisible();
    }
  });

  test("REDUCED MOTION altında yolculuk bandı KISALIR", async ({ page }) => {
    await page.goto("/");
    const normal = await page
      .locator("[data-universe]")
      .evaluate((el) => el.getBoundingClientRect().height);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    const reduced = await page
      .locator("[data-universe]")
      .evaluate((el) => el.getBoundingClientRect().height);

    // Kamera durduğu için uzun scroll bandının anlamı kalmaz.
    expect(reduced).toBeLessThan(normal);
  });

  test("SCROLL HIJACKING YOK: wheel/touchmove dinleyicisi kaydedilmiyor", async ({ page }) => {
    /*
     * Sahne scroll konumunu yalnızca OKUR. Bunu iddia etmek yetmez: dinleyici
     * kaydının KENDİSİ ölçülür. `addEventListener` sarmalanır ve sayfanın
     * kaydettiği her scroll türü dinleyici toplanır.
     */
    await page.addInitScript(() => {
      const store: string[] = [];
      (window as unknown as { __listeners: string[] }).__listeners = store;
      const original = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function patched(
        this: EventTarget,
        type: string,
        ...rest: unknown[]
      ) {
        if (type === "wheel" || type === "mousewheel" || type === "touchmove") store.push(type);
        return (original as unknown as (...args: unknown[]) => unknown).apply(this, [
          type,
          ...rest,
        ] as never);
      } as typeof EventTarget.prototype.addEventListener;
    });

    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(2000);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(400);

    const listeners = await page.evaluate(
      () => (window as unknown as { __listeners: string[] }).__listeners
    );
    expect(listeners, `kaydedilen scroll dinleyicileri: ${listeners.join(", ")}`).toEqual([]);

    // Scroll GERÇEKTEN çalışıyor.
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  });
});

test.describe("hero performans bütçesi", () => {
  test.use({ viewport: DESKTOP });

  /*
   * BÜTÇE ÖLÇÜMÜ NEDEN AĞ TRAFİĞİNDEN OKUNMUYOR?
   *
   * Sahne yığını yalnızca GERÇEK GPU varsa indirilir; başsız tarayıcıda hiç
   * istenmez. Bütçeyi sayfanın o koşuda indirdiği baytlardan ölçmek, en ağır
   * dosyayı ölçümün dışında bırakır ve testi anlamsızlaştırır.
   *
   * Bu yüzden ölçüm DERLEME ÇIKTISINDAN yapılır: sayfanın satır içi modülleri
   * + `<script src>` dosyaları + yükleyicinin dinamik olarak çağırdığı sahne
   * yığını. Üçü de en kötü durumda (GPU'lu ziyaretçide) indirilir.
   */
  function sceneChunks(): string[] {
    const dir = join(process.cwd(), "dist", "_astro");
    return readdirSync(dir)
      .filter((name) => /^universe\..*\.js$/.test(name))
      .map((name) => join(dir, name));
  }

  test("ana sayfa istemci JS'i GZIP bütçesinin altında", async ({ page }) => {
    const served = new Set<string>();
    page.on("response", (response) => {
      const path = new URL(response.url()).pathname;
      if (path.endsWith(".js")) served.add(join(process.cwd(), "dist", path.replace(/^\//, "")));
    });

    await page.goto("/", { waitUntil: "load" });

    const inline = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="module"]:not([src])')]
        .map((el) => el.textContent ?? "")
        .join(";")
    );

    const chunks = sceneChunks();
    expect(chunks.length, "sahne yığını derleme çıktısında bulunamadı").toBeGreaterThan(0);

    let bytes = gzipSync(Buffer.from(inline, "utf8")).length;
    for (const file of new Set([...served, ...chunks])) {
      bytes += gzipSync(readFileSync(file)).length;
    }

    const kb = Math.round((bytes / 1024) * 10) / 10;
    expect(
      kb,
      `ana sayfa istemci JS ${kb} KB gzip (bütçe ${HOME_JS_BUDGET_KB} KB)`
    ).toBeLessThanOrEqual(HOME_JS_BUDGET_KB);
  });

  test("İLK YÜK toplamı bütçenin altında", async ({ page }) => {
    let bytes = 0;
    const fetched = new Set<string>();
    page.on("response", (response) => {
      const path = new URL(response.url()).pathname;
      if (path.endsWith(".js")) fetched.add(join(process.cwd(), "dist", path.replace(/^\//, "")));
      const length = response.headers()["content-length"];
      if (length !== undefined) bytes += Number(length);
    });
    await page.goto("/", { waitUntil: "load" });

    /*
     * Sahne yığını da ilk yüke DÂHİL sayılır (GPU'lu ziyaretçinin durumu).
     * Bu koşuda GERÇEKTEN indirildiyse ağ toplamına zaten girmiştir; iki kez
     * sayılmasın diye yalnızca indirilmeyenler eklenir.
     */
    for (const file of sceneChunks()) {
      if (!fetched.has(file)) bytes += statSync(file).size;
    }

    const kb = Math.round(bytes / 1024);
    expect(kb, `ilk yük ${kb} KB (bütçe ${FIRST_LOAD_BUDGET_KB} KB)`).toBeLessThanOrEqual(
      FIRST_LOAD_BUDGET_KB
    );
  });

  test("DPR tavanı 1.5: tuval çözünürlüğü sınırlı", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "WebGL kipi tek tarayıcıda doğrulanır");
    test.setTimeout(180_000);
    await openScene(page);
    const ratio = await page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>("[data-universe-canvas]");
      if (canvas === null) return 0;
      return canvas.width / canvas.getBoundingClientRect().width;
    });
    expect(ratio).toBeGreaterThan(0);
    expect(ratio).toBeLessThanOrEqual(1.5 + 0.01);
  });

  test("yeni RASTER görsel eklenmedi", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const raster = await page.evaluate(() =>
      [...document.querySelectorAll("img")]
        .map((el) => el.getAttribute("src") ?? "")
        .filter((src) => /\.(png|jpe?g|webp|avif|gif)$/i.test(src))
    );
    expect(raster, `raster görsel: ${raster.join(", ")}`).toEqual([]);
  });

  test("hero kaynaklı DÜZEN KAYMASI yok (ölçülen CLS)", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "layout-shift yalnızca Chromium'da ölçülebilir");
    test.setTimeout(180_000);
    await page.goto("/?universe=force", { waitUntil: "commit" });
    await page.evaluate(() => {
      const store = { value: 0 };
      (window as unknown as { __cls: { value: number } }).__cls = store;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
          if (!shift.hadRecentInput) store.value += shift.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    // Sahnenin açılması TRACK yüksekliğini değiştirmemeli: tek düzen, üç kip.
    await page
      .waitForFunction(
        () =>
          document.querySelector("[data-universe]")?.getAttribute("data-universe-state") !==
          "poster",
        null,
        { timeout: 60_000 }
      )
      .catch(() => undefined);
    await page.waitForTimeout(2500);
    const cls = await page.evaluate(
      () => (window as unknown as { __cls: { value: number } }).__cls.value
    );
    expect(cls, `ölçülen CLS = ${cls}`).toBeLessThan(0.05);
  });

  test("KONSOL temiz: sahne hata üretmiyor", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "WebGL kipi tek tarayıcıda doğrulanır");
    test.setTimeout(180_000);
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

    await openScene(page);
    await page.mouse.wheel(0, 3600);
    await page.waitForTimeout(2500);

    /*
     * Yazılım rasterleştiricinin "GPU stall" başarım uyarıları sahnenin hatası
     * değildir ve yalnızca bu koşuda çıkar; gerçek hatalardan ayrılır.
     */
    const real = errors.filter((text) => !/GL Driver Message|GPU stall/.test(text));
    expect(real, `konsol hataları: ${real.join(" | ")}`).toEqual([]);
  });
});

test.describe("hero JavaScript olmadan", () => {
  test.use({ viewport: DESKTOP, javaScriptEnabled: false });

  test("poster ve aşamalar SON kompozisyonda görünüyor", async ({ page }) => {
    await page.goto("/");
    expect(await universeState(page)).toBe("poster");
    await expect(page.locator(".universe__poster svg")).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".hero__actions a")).toHaveCount(2);

    const list = page.getByTestId("hero-stages");
    await expect(list.locator("li")).toHaveCount(5);
    for (const item of await list.locator(".journey__inner").all()) {
      await expect(item).toBeVisible();
    }

    // Atlas zemini opaktır: metin tuvale bağımlı değildir.
    const background = await page
      .locator("#solutions")
      .evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(background).toBe("none");
  });
});

test.describe("hero mobil", () => {
  test.use({ viewport: MOBILE, hasTouch: true, isMobile: true });

  test("EVREN KORUNUYOR: tuval kaldırılmadı, taşma yok", async ({ page }) => {
    await page.goto("/");

    const canvas = page.locator("[data-universe-canvas]");
    await expect(canvas).toHaveCount(1);
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(MOBILE.width - 1);
    expect(box!.height).toBeGreaterThanOrEqual(MOBILE.height * 0.9);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow, `yatay taşma ${overflow}px`).toBeLessThanOrEqual(0);
  });

  test("DOKUNMATİK senaryo: bilgi için dokunma gerekmiyor", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".hero__actions a")).toHaveCount(2);
    await expect(page.getByTestId("hero-stages").locator("li")).toHaveCount(5);
  });
});

test.describe("ilk ekran kompozisyonu", () => {
  for (const viewport of [DESKTOP, { width: 1366, height: 768 }]) {
    for (const route of ["/", "/en/"]) {
      test(`${viewport.width}x${viewport.height} ${route} — H1, açıklama ve CTA'lar ilk viewport içinde`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await page.goto(route);

        for (const selector of [".hero__title", ".hero__lead", ".hero__actions"]) {
          const box = await page.locator(selector).boundingBox();
          expect(box, `${selector} bulunamadı`).not.toBeNull();
          expect(
            box!.y + box!.height,
            `${selector} ilk ekranın dışında (${Math.round(box!.y + box!.height)} > ${viewport.height})`
          ).toBeLessThanOrEqual(viewport.height);
        }
      });
    }
  }

  test("SAHNEYE metin GÖMÜLMEMİŞ", async ({ page }) => {
    await page.goto("/");
    // Poster SVG'sinde ve tuvalde okunması gereken metin YOKTUR.
    const svgText = await page.locator(".universe__poster svg text").count();
    expect(svgText).toBe(0);
    const canvasText = await page.locator("[data-universe-canvas]").innerText();
    expect(canvasText.trim()).toBe("");
  });
});
