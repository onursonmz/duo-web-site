import { expect, test } from "@playwright/test";

/**
 * S10 — GÜVEN VE KANIT SİSTEMİ NEGATİF TESTLERİ (§7, §8).
 *
 * Şu anda onaylanmış müşteri referansı veya logosu YOKTUR. Bu testler
 * doğrulanmamış bir kanıtın ana sayfaya veya çözüm detayına SIZMADIĞINI
 * ölçer ve boş durumda hiçbir bölümün render edilmediğini doğrular.
 *
 * Fixture kayıtları veri katmanında DURUR (preview/iç inceleme için), fakat
 * public seçiciden geçemez. Bu testler tam olarak o sınırı kontrol eder.
 */

const HOME = ["/", "/en/"];

const SOLUTION_DETAILS = [
  "/cozumler/operasyonel-gorunurluk/",
  "/cozumler/veri-akisi-ve-entegrasyon/",
  "/cozumler/otomasyon/",
  "/en/solutions/observability-and-apm/",
  "/en/solutions/data-streaming-and-integration/",
];

const ALL = [...HOME, ...SOLUTION_DETAILS, "/cozumler/", "/en/solutions/", "/hizmetler/"];

/**
 * Veri katmanındaki kanıt kayıtlarının ayırt edici içerikleri.
 * Bunlardan HİÇBİRİ public çıktıda görünemez.
 */
const PROOF_FINGERPRINTS = [
  // anonim-kamu-bankasi: verificationStatus pending
  "Bir kamu bankası",
  "anonymous-public-bank",
  // olculmus-baseline: verified ama kind internal-measurement
  "7,17 MB",
  "measured-baseline-proof",
  "Ölçüm kaydı",
  "102 istek",
];

test.describe("doğrulanmamış kanıt public çıktıya sızmıyor", () => {
  for (const route of ALL) {
    test(`${route}: kanıt kaydı içeriği görünmüyor`, async ({ page }) => {
      await page.goto(route);
      const html = await page.content();

      for (const fingerprint of PROOF_FINGERPRINTS) {
        expect(html.includes(fingerprint), `${route} sayfasında "${fingerprint}" bulundu`).toBe(
          false
        );
      }
    });

    test(`${route}: kanıt bölümü HİÇ render edilmiyor`, async ({ page }) => {
      await page.goto(route);
      // Boş kanıt listesi bölüm üretmez: başlık bile oluşmaz.
      await expect(page.getByTestId("proof-list")).toHaveCount(0);
      await expect(page.locator("#proofs-heading")).toHaveCount(0);
      await expect(page.locator("[data-proof]")).toHaveCount(0);
    });
  }
});

test.describe("placeholder güven arayüzü yok", () => {
  for (const route of ALL) {
    test(`${route}: "referanslarımız yakında" tipi metin yok`, async ({ page }) => {
      await page.goto(route);
      const text = (await page.locator("body").innerText()).toLocaleLowerCase("tr");

      for (const phrase of [
        "referanslarımız yakında",
        "referanslarımız",
        "müşterilerimiz",
        "our customers",
        "our references",
        "references coming soon",
        "logolarımız",
        "trusted by",
      ]) {
        expect(text.includes(phrase), `${route} sayfasında "${phrase}" geçiyor`).toBe(false);
      }
    });

    test(`${route}: placeholder logo duvarı yok`, async ({ page }) => {
      await page.goto(route);
      const sources = await page
        .locator("img")
        .evaluateAll((els) => els.map((el) => el.getAttribute("src") ?? ""));

      for (const source of sources) {
        expect(source, `${route} müşteri/placeholder görseli taşıyor: ${source}`).toMatch(
          /^\/(brand|favicon)/
        );
        expect(source.includes("placeholder"), source).toBe(false);
      }
    });
  }
});

test.describe("iç doğrulama süreci ziyaretçiye anlatılmıyor", () => {
  for (const route of ALL) {
    test(`${route}: doğrulama süreci dili yok`, async ({ page }) => {
      await page.goto(route);
      const text = (await page.locator("body").innerText()).toLocaleLowerCase("tr");

      for (const phrase of [
        "doğrulama süreci",
        "onay süreci",
        "izin süreci",
        "verification process",
        "approval process",
        "internal review",
      ]) {
        expect(text.includes(phrase), `${route} sayfasında "${phrase}" geçiyor`).toBe(false);
      }
    });
  }
});

/**
 * S00 PERFORMANS ÖLÇÜMÜ MÜŞTERİ BAŞARISI OLARAK KULLANILMIYOR.
 *
 * `olculmus-baseline` kaydı doğrulanmış (verified) durumda; yalnızca
 * `kind: internal-measurement` olduğu için kanıt bölümüne girmiyor. Bu test
 * o kapının açılmadığını ayrıca doğrular — filtre gevşetilirse burada kırılır.
 */
test.describe("iç ölçüm müşteri kanıtı gibi sunulmuyor", () => {
  for (const route of ALL) {
    test(`${route}: ölçüm sayıları başarı iddiası olarak görünmüyor`, async ({ page }) => {
      await page.goto(route);
      const text = await page.locator("body").innerText();
      for (const measurement of ["7,17 MB", "7.17 MB", "102 istek", "102 requests"]) {
        expect(text.includes(measurement), `${route} "${measurement}" gösteriyor`).toBe(false);
      }
    });
  }
});
