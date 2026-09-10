import { expect, test, type Page } from "@playwright/test";
import { CRITICAL_ROUTES } from "../support/public-routes";

/**
 * BUNDLE VE DÜZEN KAYMASI ÖLÇÜMÜ (S10 §8).
 *
 * S00'da mevcut sitenin ana sayfası 7,17 MB ve ~102 istek olarak ölçülmüştü.
 * Bu testler yeni çıktının o büyüklüğe geri dönmediğini SÜREKLİ doğrular —
 * bir bütçe aşımı, fark edilmeden birikmek yerine build'i kırar.
 *
 * Bütçeler bilinçli olarak GENİŞ tutuldu: amaç mikro-optimizasyonu zorlamak
 * değil, büyüklük sınıfını korumak. Bir kart kütüphanesi veya gömülü görsel
 * eklendiğinde bu testler konuşur.
 */

/** Sayfa başına toplam ağırlık üst sınırı (font dahil). */
const PAGE_WEIGHT_BUDGET_KB = 600;

/** Sayfa başına istek sayısı üst sınırı. */
const REQUEST_BUDGET = 25;

/** Kümülatif düzen kayması üst sınırı — Core Web Vitals "iyi" eşiği. */
const CLS_BUDGET = 0.1;

interface PageCost {
  bytes: number;
  requests: number;
}

async function measure(page: Page, route: string): Promise<PageCost> {
  let bytes = 0;
  let requests = 0;

  page.on("response", (response) => {
    requests += 1;
    /*
     * `body()` bazı yanıtlarda (redirect, 304) okunamaz; sayım o durumda
     * yalnızca istek adedine katkı verir. Hata yutulmuyor, ölçüm dışı
     * bırakılıyor — testin kendisi bir ağ hatasında sessizce geçmemeli.
     */
    void response
      .body()
      .then((buffer) => {
        bytes += buffer.byteLength;
      })
      .catch(() => {
        /* gövdesi okunamayan yanıt: yalnızca istek sayısına dahil */
      });
  });

  await page.goto(route);
  await page.waitForLoadState("networkidle");

  return { bytes, requests };
}

test.describe("sayfa ağırlığı bütçesi", () => {
  for (const route of CRITICAL_ROUTES) {
    test(`${route}: ağırlık ve istek sayısı bütçe içinde`, async ({ page }) => {
      const cost = await measure(page, route);
      const kb = Math.round(cost.bytes / 1024);

      expect(
        kb,
        `${route} ağırlığı ${kb} KB (bütçe ${PAGE_WEIGHT_BUDGET_KB} KB)`
      ).toBeLessThanOrEqual(PAGE_WEIGHT_BUDGET_KB);
      expect(
        cost.requests,
        `${route} ${cost.requests} istek yapıyor (bütçe ${REQUEST_BUDGET})`
      ).toBeLessThanOrEqual(REQUEST_BUDGET);
    });
  }
});

test.describe("kümülatif düzen kayması", () => {
  for (const route of CRITICAL_ROUTES) {
    test(`${route}: CLS eşiğin altında`, async ({ page }) => {
      await page.goto(route);

      /*
       * `layout-shift` girdileri boyama sonrasında da gelebiliyor; observer
       * gezinmeden SONRA kurulup kısa bir pencere boyunca dinleniyor.
       * `hadRecentInput` olanlar sayılmaz: kullanıcı etkileşimini izleyen
       * kayma tanım gereği CLS'e girmez.
       */
      const cls = await page.evaluate(async () => {
        return new Promise<number>((resolve) => {
          let total = 0;
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const shift = entry as PerformanceEntry & {
                value: number;
                hadRecentInput: boolean;
              };
              if (!shift.hadRecentInput) total += shift.value;
            }
          });
          observer.observe({ type: "layout-shift", buffered: true });

          setTimeout(() => {
            observer.disconnect();
            resolve(total);
          }, 1200);
        });
      });

      expect(cls, `${route} CLS = ${cls}`).toBeLessThanOrEqual(CLS_BUDGET);
    });
  }
});

/*
 * ROTA BAŞINA AYRI TEST.
 *
 * Bu iki kontrol önce tüm kritik rotaları TEK test içinde geziyordu. Süit
 * S13'te ~975 teste çıkınca paralel yük altında 30 sn'lik bütçe aşıldı.
 * Süre limiti yükseltilmedi; kapsam bölündü — aynı kural, aynı rotalar,
 * rota başına kendi bütçesi ve hata mesajında doğrudan rota adı.
 */
test.describe("çıktı biçimi", () => {
  for (const route of CRITICAL_ROUTES) {
    test(`${route}: UI framework runtime'ı yüklenmiyor`, async ({ page }) => {
      await page.goto(route);
      const html = await page.content();
      expect(html, route).not.toMatch(/astro-island|client:load|client:visible|client:idle/);
    });

    test(`${route}: script kaynakları yalnızca kendi origin'imizden`, async ({ page }) => {
      await page.goto(route);
      const sources = await page
        .locator("script[src]")
        .evaluateAll((els) => els.map((el) => el.getAttribute("src") ?? ""));
      for (const src of sources) {
        expect(src.startsWith("/"), `${route} harici script: ${src}`).toBe(true);
      }
    });
  }
});
