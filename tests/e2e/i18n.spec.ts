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
// EN karşılığı OLMAYAN gerçek kayıt: içgörü. Sekiz çözümün ikisi de değil,
// TAMAMI iki dilde yayımlandığı için fixture içgörüye taşındı.
const TR_UNTRANSLATED = "/icgoruler/operasyon-verisinin-dort-hali/";

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
    // S04 ile bağlantı hem ana menüde hem footer'da var; kapsam daraltılır.
    await expect(
      page.getByTestId("primary-nav").getByRole("link", { name: "Çözümler", exact: true })
    ).toBeVisible();
    await expect(page.locator("body")).toContainText("Çözüm alanları");
  });

  test("/en/ İngilizce içerik ve lang=en", async ({ page }) => {
    await page.goto("/en/");

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.getByTestId("primary-nav").getByRole("link", { name: "Solutions", exact: true })
    ).toBeVisible();
    // S05 ile ana sayfa metni içerik katmanından geliyor; büyük/küçük harfe
    // bağlı olmayan, dile özgü bir ifade aranır.
    await expect(page.locator("body")).toContainText(/solution areas/i);
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

  test("çözüm landing sayfaları iki dilde de sekiz kaydı listeler", async ({ page }) => {
    // Kayıt sayısı = doğrudan satırlar. Kabiliyet etiketleri de <li> olduğu için
    // torun eşleşmesi kayıt saymaz.
    await page.goto("/cozumler/");
    await expect(page.locator('[data-testid="solution-list"] > li')).toHaveCount(8);

    await page.goto("/en/solutions/");
    await expect(page.locator('[data-testid="solution-list"] > li')).toHaveCount(8);
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
    expect(main).not.toContain("Related solutions");
    expect(main).toContain("Operasyon verisinin dört hâli");
  });
});

/** ADR-011 ile onaylanan kayıt kimlikleri. */
const APPROVED_TECHNOLOGY_IDS = [
  "airflow",
  "ansible",
  "ardoq",
  "awx",
  "confluent",
  "cyclops",
  "datadog",
  "device42",
  "elastic",
  "foglight",
  "freshservice",
  "instana",
  "n8n",
  "nifi",
  "opentelemetry",
  "opentext-cms",
  "opentext-oo",
  "opentext-sa",
  "quest",
  "smax",
  "zabbix",
];

/** ADR-011 ile metin olarak yayınlanması onaylanan teknoloji adları. */
const APPROVED_TECHNOLOGY_NAMES = [
  "Datadog",
  "Zabbix",
  "IBM Instana",
  "OpenTelemetry",
  "Quest Foglight",
  "Device42",
  "OpenText CMS",
  "OpenText SMAX",
  "Freshservice",
  "Confluent",
  "Apache NiFi",
  "Apache Airflow",
  "Elastic",
  "Ardoq",
  "Quest Change Auditor",
  "CyclOps",
  "OpenText Operations Orchestration (OO)",
  "OpenText Server Automation (SA)",
  "Red Hat Ansible",
  "AWX",
  "n8n",
];

test.describe("public içerik filtreleri — FAIL-CLOSED", () => {
  /**
   * ADR-011 sonrası: 21 kayıt `lifecycle: active` ve `decisionNeeded: false`.
   * Artık teknoloji ADI metin olarak görünebilir — LOGO hâlâ görünemez.
   */
  test("görünen teknolojilerin TAMAMI onaylı listede", async ({ page }) => {
    for (const route of [
      "/",
      "/en/",
      "/cozumler/",
      "/en/solutions/",
      TR_SOLUTION,
      EN_SOLUTION,
      "/cozumler/aiops-ve-olay-yasam-dongusu/",
    ]) {
      await page.goto(route);
      // Ad metin olarak ya da (izinli logo varsa) `alt` metninde durur;
      // ikisinden biri MUTLAKA vardır ve onaylı listede olmalıdır.
      const names = await page
        .getByTestId("technology-list")
        .locator("li")
        .evaluateAll((els) =>
          els.map((el) => {
            const text = (el.textContent ?? "").trim();
            return text === "" ? (el.querySelector("img")?.getAttribute("alt") ?? "").trim() : text;
          })
        );

      for (const name of names) {
        expect(APPROVED_TECHNOLOGY_NAMES, `${route}: onaysız teknoloji "${name}"`).toContain(name);
      }

      // Render edilmiş hiçbir kayıt onaysız olamaz (ada değil KİMLİĞE bakar).
      const renderedIds = await page
        .locator("[data-technology-id]")
        .evaluateAll((els) => els.map((e) => e.getAttribute("data-technology-id") ?? ""));
      for (const id of renderedIds) {
        expect(APPROVED_TECHNOLOGY_IDS, `${route}: onaysız kayıt "${id}"`).toContain(id);
      }
    }
  });

  test("teknoloji LOGOSU hiçbir sayfada render edilmiyor", async ({ page }) => {
    for (const route of [TR_SOLUTION, EN_SOLUTION, "/cozumler/otomasyon/"]) {
      await page.goto(route);
      await expect(page.getByTestId("technology-list").locator("img"), route).toHaveCount(0);
    }
  });

  test("teknoloji başlığı PARTNER ilişkisi ima etmiyor", async ({ page }) => {
    await page.goto(TR_SOLUTION);
    const body = (await page.locator("body").innerText()).toLocaleLowerCase("tr");
    for (const claim of ["partner", "iş ortağı", "sertifikalı", "yetkili satıcı", "resmî bayi"]) {
      expect(body.includes(claim), `çözüm sayfası "${claim}" ilişkisi ima ediyor`).toBe(false);
    }
  });

  /**
   * S05 İLE DARALTILAN KAPSAM — bilinçli ve gerekçeli.
   *
   * Bu testin koruduğu şey: KARAR BEKLEYEN TEKNOLOJİ ENVANTERİ KAYDININ public
   * çıktıya sızması. Üçüncü taraf ürün adları (Zabbix, Datadog, Jira…) hâlâ
   * hiçbir sayfada geçemez.
   *
   * `cyclops` bu listeden ÇIKARILDI çünkü iki ayrı şey aynı kelimeyle
   * temsil ediliyordu:
   *   1) teknoloji envanterindeki `cyclops` KAYDI — hâlâ pending, public
   *      teknoloji listesinde GÖRÜNEMEZ (aşağıdaki ayrı test ve
   *      `tests/unit/technology-inventory.test.ts` bunu doğrular),
   *   2) Duosis'in KENDİ ÜRÜNÜNÜN adı — taslak/noindex kapsamda anlatılmasına
   *      açıkça izin verildi (truth matrix C12:
   *      internal-source-available-public-pending).
   *
   * Sızıntı koruması zayıflatılmadı, DOĞRU HEDEFE yöneltildi: teaser'ın
   * doğrulanmamış iddia taşımadığı ayrıca test edilir.
   */
  test("karar bekleyen teknolojiler HTML'de hiç geçmiyor", async ({ page }) => {
    // ADR-011 sonrası PENDING kalan kayıtların benzersiz adları.
    // (Genel `opentext` kaydı burada YOK: "OpenText CMS"/"SMAX" gibi onaylı
    // adların alt dizesi olduğu için substring taraması yanlış pozitif verir;
    // o kayıt yukarıdaki "onaylı listede" testiyle kapsanır.)
    const forbidden = [
      "glpi",
      "grafana",
      "jira",
      "kace",
      "kron",
      "pandora",
      "postgresql",
      "runecast",
      "runzero",
      "solarwinds",
      "stor2rrd",
      "tableau",
      "vertica",
    ];

    for (const route of [
      "/",
      "/en/",
      "/cozumler/",
      "/en/solutions/",
      TR_SOLUTION,
      EN_SOLUTION,
      "/cozumler/aiops-ve-olay-yasam-dongusu/",
    ]) {
      await page.goto(route);

      /*
       * HAM HTML DEĞİL, GÖRÜNÜR METİN taranır ve KELİME SINIRI aranır.
       * Ham HTML taraması "vertica" ifadesini `vertical-align` CSS değeri
       * içinde yakalayıp yanlış pozitif üretiyordu.
       */
      const visible = (await page.locator("body").innerText()).toLocaleLowerCase("tr");
      for (const id of forbidden) {
        const pattern = new RegExp(`\b${id}\b`, "i");
        expect(pattern.test(visible), `${route} sayfasında "${id}" görünüyor`).toBe(false);
      }
    }
  });

  test("ANA SAYFADA teknoloji listesi YOK: ekosistem yetenek katmanlarıyla anlatılır", async ({
    page,
  }) => {
    for (const route of ["/", "/en/"]) {
      await page.goto(route);
      await expect(page.getByTestId("technology-list"), route).toHaveCount(0);
      await expect(page.getByTestId("technology-layers"), route).toHaveCount(1);
    }
  });

  test("CYCLOPS TEASER doğrulanmamış iddia TAŞIMIYOR", async ({ page }) => {
    await page.goto("/");
    const teaser = page.getByTestId("cyclops-teaser");
    await expect(teaser).toHaveCount(1);

    const text = await teaser.innerText();

    // Sürüm numarası yok (v1.2, 2.0 gibi).
    expect(text, "teaser sürüm numarası içeriyor").not.toMatch(/\bv?\d+\.\d+/);
    /*
     * Yüzde veya MTTR/SLA gibi ölçüm iddiası yok.
     * KELİME SINIRI ŞART: sınırsız `/sla/i` Türkçe "taslak" kelimesinde
     * yanlış eşleşme üretiyordu (ilk koşuda tam olarak bu oldu).
     */
    expect(text, "teaser yüzde iddiası içeriyor").not.toMatch(/%|\bMTTR\b|\bSLA\b/i);
    // Müşteri sayısı iddiası yok.
    expect(text, "teaser müşteri sayısı iddiası içeriyor").not.toMatch(
      /\d+\s*\+?\s*(müşteri|customer|kurum)/i
    );
    // ADR-011: iç süreç/olgunluk açıklaması ZİYARETÇİYE GÖSTERİLMEZ.
    await expect(teaser).not.toContainText(/taslak|olgunluk|doğrulama/i);
  });

  test("CYCLOPS teaser yalnızca NOINDEX sayfada görünüyor", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[name="robots"][content="noindex"]')).toHaveCount(1);
    await expect(page.getByTestId("cyclops-teaser")).toHaveCount(1);
  });

  test("izinsiz logo hiçbir sayfada render edilmiyor", async ({ page }) => {
    for (const route of [TR_SOLUTION, EN_SOLUTION, "/cozumler/", "/"]) {
      await page.goto(route);
      // Tüm kayıtlarda logoPermission unknown; hiç <img> olmamalı.
      await expect(page.locator("#main-content img")).toHaveCount(0);
    }
  });

  test("taslak içerik indekslenmiyor (noindex)", async ({ page }) => {
    for (const route of ["/", "/en/", "/cozumler/", "/en/solutions/", TR_SOLUTION, EN_SOLUTION]) {
      await page.goto(route);
      await expect(page.locator('meta[name="robots"][content="noindex"]'), route).toHaveCount(1);
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

test.describe("e2e sunucu kimliği", () => {
  test("istekler bu çalıştırmanın kendi preview sunucusuna gidiyor", async ({ page, baseURL }) => {
    const response = await page.goto("/");

    // Statik sunucumuz bu başlığı ekler; başka bir sunucuya bağlanılmadığının kanıtı.
    expect(response?.headers()["x-duosis-preview"]).toBe("e2e");

    // Dinamik port kullanılıyor; sabit 4321'e bağlanılmıyor.
    expect(baseURL).toBeDefined();
    expect(new URL(baseURL ?? "").port).not.toBe("4321");
  });
});
