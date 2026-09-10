import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * S12 — İLETİŞİM FORMU VE İZİN KABUL TESTLERİ.
 *
 * Kural doğrulaması birim testlerdedir (`tests/unit/contact-core.test.ts`);
 * burada DAVRANIŞ ölçülür: erişilebilirlik, dürüst sonuç, dış istek yokluğu.
 */

const ROUTES = [
  { path: "/iletisim/", locale: "tr", legal: "/aydinlatma-metni/" },
  { path: "/en/contact/", locale: "en", legal: "/en/privacy-notice/" },
] as const;

const VALID = {
  name: "Ayşe Yılmaz",
  email: "ayse@ornekkurum.com",
  organization: "Örnek Kurum",
  message: "Operasyon görünürlüğü konusunda mevcut kurulumumuzu birlikte konuşmak istiyoruz.",
};

async function fillValid(page: import("@playwright/test").Page): Promise<void> {
  await page.fill("#field-name", VALID.name);
  await page.fill("#field-email", VALID.email);
  await page.fill("#field-organization", VALID.organization);
  await page.fill("#field-message", VALID.message);
  await page.check("#field-consent");
}

/* ------------------------------------------------------------- konu */

test.describe("konu parametresi — TEK canonical anahtar", () => {
  test("geçerli topic forma taşınır", async ({ page }) => {
    await page.goto("/iletisim/?topic=cyclops");
    await expect(page.locator("#field-topic")).toHaveValue("cyclops");
  });

  test("bilinmeyen, tekrarlı ve aşırı uzun değer forma TAŞINMAZ", async ({ page }) => {
    for (const query of [
      "?topic=serbest-deger",
      "?topic=cyclops&topic=otomasyon",
      `?topic=${"a".repeat(300)}`,
      "?topic=%3Cscript%3E",
      "?topic=",
    ]) {
      await page.goto(`/iletisim/${query}`);
      await expect(page.locator("#field-topic"), query).toHaveValue("genel");
    }
  });

  test("`interest` adında ikinci bir alan yok", async ({ page }) => {
    await page.goto("/iletisim/");
    await expect(page.locator('[name="interest"]')).toHaveCount(0);
  });
});

/* -------------------------------------------------------- veri minimizasyonu */

test.describe("veri minimizasyonu", () => {
  for (const route of ROUTES) {
    test(`${route.path} yalnızca gerekli alanları soruyor`, async ({ page }) => {
      await page.goto(route.path);
      const names = await page
        .locator(
          '[data-testid="contact-form"] input:not([type=hidden]), [data-testid="contact-form"] select, [data-testid="contact-form"] textarea'
        )
        .evaluateAll((els) => els.map((el) => el.getAttribute("name") ?? ""));

      // Honeypot dışındaki görünür alanlar.
      expect(names.filter((n) => n !== "website").sort()).toEqual([
        "consent",
        "email",
        "message",
        "name",
        "organization",
        "topic",
      ]);
      // Telefon alanı YOK.
      await expect(page.locator('[name="phone"], [type="tel"]')).toHaveCount(0);
    });
  }
});

/* ------------------------------------------------------------ doğrulama UX */

test.describe("doğrulama ve erişilebilirlik", () => {
  test("boş gönderimde alan hataları ve canlı bölge özeti", async ({ page }) => {
    await page.goto("/iletisim/");
    await page.locator('[data-testid="contact-form"] button[type=submit]').click();

    const status = page.locator('[data-testid="contact-status"]');
    await expect(status).toHaveAttribute("data-state", "error");
    await expect(status).toHaveAttribute("aria-live", "polite");
    await expect(status).not.toBeEmpty();

    // Her hatalı alan aria-invalid taşır ve hatası kendi kutusunda.
    await expect(page.locator('[aria-invalid="true"]')).not.toHaveCount(0);
    await expect(page.locator(".field__error:not(:empty)")).not.toHaveCount(0);

    // Odak İLK hatalı alana taşınır.
    expect(await page.evaluate(() => document.activeElement?.getAttribute("name"))).toBe("name");
  });

  test("alan-hata ilişkisi aria-describedby ile kurulu", async ({ page }) => {
    await page.goto("/iletisim/");
    for (const field of ["name", "email", "organization", "topic", "message", "consent"]) {
      const described = await page.locator(`[name="${field}"]`).getAttribute("aria-describedby");
      expect(described, field).toBe(`error-${field}`);
      await expect(page.locator(`#error-${field}`)).toHaveCount(1);
    }
  });

  test("hata sonrası girilen değerler KORUNUR", async ({ page }) => {
    await page.goto("/iletisim/");
    await page.fill("#field-name", VALID.name);
    await page.fill("#field-email", "bozuk-eposta");
    await page.locator('[data-testid="contact-form"] button[type=submit]').click();

    await expect(page.locator("#field-name")).toHaveValue(VALID.name);
    await expect(page.locator("#field-email")).toHaveValue("bozuk-eposta");
  });

  test("klavye ile form doldurulabiliyor", async ({ page }) => {
    await page.goto("/iletisim/");
    await page.locator("#field-name").focus();
    await page.keyboard.type(VALID.name);
    await page.keyboard.press("Tab");
    await page.keyboard.type(VALID.email);
    await expect(page.locator("#field-email")).toHaveValue(VALID.email);

    // Honeypot klavye sırasında DEĞİL.
    const trapIndex = await page.locator('[name="website"]').getAttribute("tabindex");
    expect(trapIndex).toBe("-1");
  });
});

/* --------------------------------------------------------------- dürüstlük */

test.describe("gönderim dürüstlüğü", () => {
  test("geçerli gönderim SAHTE BAŞARI göstermez", async ({ page }) => {
    await page.goto("/iletisim/");
    await fillValid(page);
    // Çok hızlı gönderim eşiğini geç.
    await page.waitForTimeout(2100);
    await page.locator('[data-testid="contact-form"] button[type=submit]').click();

    const status = page.locator('[data-testid="contact-status"]');
    await expect(status).toHaveAttribute("data-state", "not-delivered");
    const text = (await status.textContent()) ?? "";
    expect(text.toLocaleLowerCase("tr")).toContain("iletilmedi");
    // "Teşekkürler / gönderildi" gibi bir başarı ifadesi OLMAMALI.
    expect(text.toLocaleLowerCase("tr")).not.toContain("teşekkür");
  });

  test("gönderim hiçbir ağ isteği başlatmıyor", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (request) => {
      if (!request.url().includes("127.0.0.1") && !request.url().includes("localhost")) {
        external.push(request.url());
      }
    });
    await page.goto("/iletisim/");
    await fillValid(page);
    await page.waitForTimeout(2100);
    await page.locator('[data-testid="contact-form"] button[type=submit]').click();
    await page.waitForTimeout(300);
    expect(external).toEqual([]);
  });

  test("çift gönderim ikinci kez işlenmiyor", async ({ page }) => {
    await page.goto("/iletisim/");
    await fillValid(page);
    await page.waitForTimeout(2100);
    const submit = page.locator('[data-testid="contact-form"] button[type=submit]');
    await submit.click();
    // İlk gönderimden sonra buton devre dışı kalır.
    await expect(submit).toBeDisabled();
  });

  test("idempotency ve zaman damgası alanları dolduruluyor", async ({ page }) => {
    await page.goto("/iletisim/");
    const renderedAt = await page.locator('[data-testid="rendered-at"]').inputValue();
    const submissionId = await page.locator('[data-testid="submission-id"]').inputValue();
    expect(Number(renderedAt)).toBeGreaterThan(0);
    expect(submissionId.length).toBeGreaterThan(10);
  });

  test("secret veya PII sayfa kaynağında yok", async ({ page }) => {
    await page.goto("/iletisim/");
    const html = await page.content();
    for (const secret of ["TURNSTILE_SECRET", "CONTACT_FORM_TO", "api_key", "apiKey", "Bearer "]) {
      expect(html.includes(secret), secret).toBe(false);
    }
  });
});

/* ------------------------------------------------------------- hukuki metin */

test.describe("aydınlatma metni", () => {
  for (const route of ROUTES) {
    test(`${route.path} → ${route.legal} bağlantısı çalışıyor`, async ({ page }) => {
      await page.goto(route.path);
      const link = page.locator(`[data-testid="contact-form"] a[href="${route.legal}"]`);
      await expect(link).toHaveCount(1);

      const response = await page.request.get(route.legal);
      expect(response.status()).toBe(200);
    });

    test(`${route.legal} taslak olduğunu AÇIKÇA söylüyor`, async ({ page }) => {
      await page.goto(route.legal);
      await expect(page.locator('[data-testid="legal-notice"]')).toHaveAttribute(
        "data-review-status",
        "legal-review-required"
      );
      await expect(page.locator('[data-testid="legal-draft-flag"]')).toBeVisible();
      const robots = await page.locator('meta[name="robots"]').getAttribute("content");
      expect(robots).toContain("noindex");
    });
  }

  test("uydurma saklama süresi veya mevzuat iddiası yok", async ({ page }) => {
    await page.goto("/aydinlatma-metni/");
    const text = (await page.locator("main").innerText()).toLocaleLowerCase("tr");
    expect(text).not.toMatch(/\d+\s*(yıl|ay|gün)\s*(boyunca|süreyle|saklan)/);
    expect(text).not.toContain("kvkk madde");
    expect(text).not.toContain("6698 sayılı");
  });
});

/* ------------------------------------------------------------------ consent */

test.describe("çerez izni", () => {
  test("karar verilmemişken banner görünür", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("consent-banner")).toBeVisible();
  });

  test("izin öncesi HİÇBİR dış istek yok", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (request) => {
      if (!request.url().includes("127.0.0.1") && !request.url().includes("localhost")) {
        external.push(request.url());
      }
    });
    await page.goto("/", { waitUntil: "networkidle" });
    expect(external).toEqual([]);
    // Üçüncü taraf gömülü içerik de yok.
    await expect(page.locator("iframe, embed, object")).toHaveCount(0);
  });

  test("kabul, reddet ve özelleştir EŞİT görünürlükte", async ({ page }) => {
    await page.goto("/");
    const buttons = page.locator("[data-consent-action]:not([hidden])");
    await expect(buttons).toHaveCount(3);

    const boxes = await buttons.evaluateAll((els) =>
      els.map((el) => {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return {
          height: Math.round(rect.height),
          fontSize: style.fontSize,
          color: style.color,
          opacity: style.opacity,
        };
      })
    );
    const first = boxes[0];
    expect(first).toBeDefined();
    for (const box of boxes) {
      expect(box.height).toBe(first?.height);
      expect(box.fontSize).toBe(first?.fontSize);
      expect(box.color).toBe(first?.color);
      expect(box.opacity).toBe("1");
    }
  });

  test("reddet: analytics kapalı olarak sürümlü kaydediliyor", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-consent-action="reject"]').click();
    await expect(page.getByTestId("consent-banner")).toBeHidden();

    const stored = await page.evaluate(() => localStorage.getItem("duosis.consent"));
    const parsed = JSON.parse(stored ?? "{}") as Record<string, unknown>;
    expect(parsed["analytics"]).toBe(false);
    expect(parsed["essential"]).toBe(true);
    expect(parsed["version"]).toBe(1);
    expect(typeof parsed["decidedAt"]).toBe("string");
  });

  test("kabul: analytics açık kaydediliyor ama yine de dış istek yok", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (request) => {
      if (!request.url().includes("127.0.0.1") && !request.url().includes("localhost")) {
        external.push(request.url());
      }
    });
    await page.goto("/");
    await page.locator('[data-consent-action="accept"]').click();
    await page.waitForTimeout(300);

    const stored = await page.evaluate(() => localStorage.getItem("duosis.consent"));
    expect(JSON.parse(stored ?? "{}")["analytics"]).toBe(true);
    // Sağlayıcı `none`: izin verilse bile istek YOK.
    expect(external).toEqual([]);
  });

  test("özelleştir: zorunlu kategori kilitli, ölçümleme kapalı başlıyor", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-consent-action="customize"]').click();

    const essential = page.getByTestId("consent-essential");
    await expect(essential).toBeChecked();
    await expect(essential).toBeDisabled();

    await expect(page.getByTestId("consent-analytics")).not.toBeChecked();
    // `marketing` kategorisi YOK.
    await expect(page.locator('[data-testid="consent-marketing"]')).toHaveCount(0);
  });

  test("tercih klavyeyle verilebiliyor", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-consent-action="accept"]').focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("consent-banner")).toBeHidden();
  });

  test("footer bağlantısı paneli yeniden açıyor", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-consent-action="reject"]').click();
    await expect(page.getByTestId("consent-banner")).toBeHidden();

    await page.getByTestId("consent-reopen").click();
    await expect(page.getByTestId("consent-banner")).toBeVisible();
  });

  test("eski sürümlü tercih geçersiz sayılıyor", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() =>
      localStorage.setItem(
        "duosis.consent",
        JSON.stringify({ version: 0, decidedAt: "2020-01-01", essential: true, analytics: true })
      )
    );
    await page.reload();
    await expect(page.getByTestId("consent-banner")).toBeVisible();
  });
});

/* ------------------------------------------------------------ erişilebilirlik */

test.describe("erişilebilirlik", () => {
  for (const route of [...ROUTES.map((r) => r.path), ...ROUTES.map((r) => r.legal)]) {
    test(`WCAG 2.2 AA ihlali yok: ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
