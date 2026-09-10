import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { FEED_ROUTES, INTERNAL_ROUTES, PUBLIC_PAGE_ROUTES } from "../support/public-routes";

/**
 * ROTA ENVANTERİ DENETİMİ.
 *
 * Envanter (`tests/support/public-routes.ts`) e2e taramalarının kapsamını
 * belirliyor. Eskirse taramalar sessizce daralır: yeni bir rota açılır, ses
 * taramasından ve erişilebilirlik matrisinden düşer, kimse fark etmez.
 *
 * Bu dosya envanteri GERÇEK build çıktısıyla karşılaştırır — iki yönlü:
 *   - üretilmiş ama envanterde olmayan rota  -> tarama boşluğu
 *   - envanterde olan ama üretilmemiş rota   -> ölü kayıt
 *
 * Ayrıca sitenin TAMAMINDA bağlantı taraması yapar: hiçbir iç bağlantı
 * kırık olamaz.
 */

const DIST = fileURLToPath(new URL("../../dist/", import.meta.url));

/** `dist/` içindeki üretilmiş sayfaları rota yollarına çevirir. */
function builtRoutes(): string[] {
  const routes: string[] = [];

  const walk = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (name !== "index.html") continue;

      const rel = relative(DIST, full).split(sep).slice(0, -1).join("/");
      routes.push(rel === "" ? "/" : `/${rel}/`);
    }
  };

  walk(DIST);
  return routes.sort();
}

test.describe("rota envanteri", () => {
  test("envanter build çıktısıyla BİREBİR örtüşüyor", () => {
    const built = builtRoutes();

    /*
     * Dahili önizlemeler envanterin dışındadır.
     *
     * `/404.html` burada FİLTRELENMEZ: `builtRoutes()` yalnızca `index.html`
     * dosyalarını topluyor, dolayısıyla hata sayfası zaten listeye girmiyor.
     * Onu ayrıca elemeye çalışmak, yolu "/" hâline getirip ANA SAYFAYI
     * envanter karşılaştırmasından düşürüyordu — testi sessizce zayıflatan
     * bir hataydı.
     */
    const internal = new Set(INTERNAL_ROUTES.filter((r) => r.endsWith("/")));
    const publicBuilt = built.filter((route) => !internal.has(route));

    const expected = [...PUBLIC_PAGE_ROUTES].sort();

    const missingFromInventory = publicBuilt.filter((r) => !expected.includes(r));
    const missingFromBuild = expected.filter((r) => !publicBuilt.includes(r));

    expect(
      missingFromInventory,
      `üretilmiş ama envantere girmemiş rota(lar) — tarama boşluğu: ${missingFromInventory.join(", ")}`
    ).toEqual([]);

    expect(
      missingFromBuild,
      `envanterde olup üretilmemiş rota(lar) — ölü kayıt: ${missingFromBuild.join(", ")}`
    ).toEqual([]);
  });

  test("envanterdeki her rota 200 dönüyor", async ({ request }) => {
    for (const route of PUBLIC_PAGE_ROUTES) {
      const response = await request.get(route);
      expect(response.status(), route).toBe(200);
    }
  });

  test("besleme adresleri çalışıyor", async ({ request }) => {
    for (const feed of FEED_ROUTES) {
      const response = await request.get(feed);
      expect(response.status(), feed).toBe(200);
    }
  });

  test("S08-S11 rota aileleri envanterde temsil ediliyor", () => {
    const families: Record<string, RegExp> = {
      "çözüm landing": /^\/(cozumler|en\/solutions)\/$/,
      "çözüm detay": /^\/cozumler\/[a-z-]+\/$/,
      hizmetler: /^\/(hizmetler|en\/services)\/$/,
      teknolojiler: /^\/(teknolojiler|en\/technologies)\/$/,
      "içgörü landing": /^\/(icgoruler|en\/insights)\/$/,
      "içgörü detay": /^\/icgoruler\/[a-z-]+\/$/,
      "içgörü seri": /^\/icgoruler\/seri\/[a-z-]+\/$/,
      "içgörü etiket": /^\/icgoruler\/etiket\/[a-z-]+\/$/,
      iletişim: /^\/(iletisim|en\/contact)\/$/,
    };

    for (const [name, pattern] of Object.entries(families)) {
      expect(
        PUBLIC_PAGE_ROUTES.some((route) => pattern.test(route)),
        `"${name}" ailesi envanterde yok`
      ).toBe(true);
    }
  });
});

test.describe("bağlantı bütünlüğü", () => {
  /**
   * TÜM public rotalarda iç bağlantı taraması. Her benzersiz hedef bir kez
   * kontrol edilir; aynı bağlantıyı otuz sayfada tekrar istemek testi
   * gereksiz uzatırdı.
   */
  test("hiçbir iç bağlantı kırık değil", async ({ page, request }) => {
    const checked = new Map<string, number>();
    const failures: string[] = [];

    for (const route of PUBLIC_PAGE_ROUTES) {
      await page.goto(route);

      const hrefs = await page
        .locator("a[href]")
        .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));

      for (const href of hrefs) {
        // Yalnızca kök-göreli iç bağlantılar; mailto/tel/dış adres kapsam dışı.
        if (!href.startsWith("/")) continue;

        // Query ve çapa ayrıştırılır: hedef sayfa aynıdır.
        const target = href.split("#")[0]?.split("?")[0] ?? "";
        if (target === "") continue;

        let status = checked.get(target);
        if (status === undefined) {
          status = (await request.get(target)).status();
          checked.set(target, status);
        }
        if (status !== 200) failures.push(`${route} -> ${href} (${status})`);
      }
    }

    expect(checked.size, "taranacak iç bağlantı bulunamadı").toBeGreaterThan(20);
    expect(failures, `kırık bağlantı(lar): ${failures.join(", ")}`).toEqual([]);
  });
});
