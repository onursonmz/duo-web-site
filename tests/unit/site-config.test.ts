import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PRODUCTION_ORIGIN,
  allowedFormOrigins,
  canDeliverForms,
  deployEnv,
  isLegalApproved,
  isProduction,
  resolveSiteUrl,
} from "../../src/config/site";

/**
 * ORTAM VE YAYIN YAPILANDIRMASI TESTLERİ (S12 + S13).
 *
 * Buradaki her test bir KAPININ gerçekten kapalı olduğunu gösterir. "Kapalı
 * olması gerekir" demek yetmez; kapıyı zorlayan girdi verilir ve fırlatılan
 * hata beklenir.
 *
 * `process.env` DEĞİŞTİRİLMEZ: her fonksiyon env'i parametre olarak alır, bu
 * yüzden testler paralel koşarken birbirini etkilemez.
 */

const PROD = { DEPLOY_ENV: "production" } as NodeJS.ProcessEnv;

describe("ortam ayrımı", () => {
  it("yalnızca DEPLOY_ENV=production production sayılır", () => {
    expect(deployEnv({} as NodeJS.ProcessEnv)).toBe("preview");
    expect(deployEnv({ DEPLOY_ENV: "prod" } as NodeJS.ProcessEnv)).toBe("preview");
    expect(deployEnv({ DEPLOY_ENV: "PRODUCTION" } as NodeJS.ProcessEnv)).toBe("preview");
    expect(deployEnv(PROD)).toBe("production");
  });

  it("belirsiz değer production'a TERFİ ETMEZ", () => {
    // "true", "1", "yes" gibi değerler kazara production açmamalı.
    for (const value of ["true", "1", "yes", "live", ""]) {
      expect(isProduction({ DEPLOY_ENV: value } as NodeJS.ProcessEnv), value).toBe(false);
    }
  });
});

describe("resolveSiteUrl — production kapıları", () => {
  it("PUBLIC_SITE_URL yoksa build KIRILIR", () => {
    expect(() => resolveSiteUrl(PROD)).toThrow(/PUBLIC_SITE_URL zorunludur/);
  });

  it("boşluktan ibaret değer YOK sayılır", () => {
    expect(() => resolveSiteUrl({ ...PROD, PUBLIC_SITE_URL: "   " } as NodeJS.ProcessEnv)).toThrow(
      /PUBLIC_SITE_URL zorunludur/
    );
  });

  it("http (HTTPS değil) REDDEDİLİR", () => {
    expect(() =>
      resolveSiteUrl({ ...PROD, PUBLIC_SITE_URL: "http://duosis.com" } as NodeJS.ProcessEnv)
    ).toThrow(/HTTPS gerektirir/);
  });

  it("geçersiz URL REDDEDİLİR", () => {
    expect(() =>
      resolveSiteUrl({ ...PROD, PUBLIC_SITE_URL: "duosis.com" } as NodeJS.ProcessEnv)
    ).toThrow(/geçerli bir URL değil/);
  });

  it("localhost canonical KESİNLİKLE yasak", () => {
    for (const host of [
      "https://localhost:4321",
      "https://127.0.0.1",
      "https://0.0.0.0",
      "https://duosis.local",
    ]) {
      expect(
        () => resolveSiteUrl({ ...PROD, PUBLIC_SITE_URL: host } as NodeJS.ProcessEnv),
        host
      ).toThrow(/localhost canonical YASAK/);
    }
  });

  it("geçerli production URL'sinden yalnızca origin alınır", () => {
    const url = resolveSiteUrl({
      ...PROD,
      PUBLIC_SITE_URL: `${PRODUCTION_ORIGIN}/alt/yol/`,
    } as NodeJS.ProcessEnv);
    expect(url).toBe(PRODUCTION_ORIGIN);
  });

  it("preview localhost'a düşer ama kendi değerini de kabul eder", () => {
    expect(resolveSiteUrl({} as NodeJS.ProcessEnv)).toBe("http://localhost:4321");
    expect(resolveSiteUrl({ PUBLIC_SITE_URL: "http://localhost:5555" } as NodeJS.ProcessEnv)).toBe(
      "http://localhost:5555"
    );
  });
});

describe("form teslim kapısı", () => {
  it("hukuk onayı olmadan teslim KAPALI", () => {
    expect(
      canDeliverForms({
        ...PROD,
        PUBLIC_SITE_URL: PRODUCTION_ORIGIN,
        CONTACT_FORM_TO: "kime@ornek.test",
      } as NodeJS.ProcessEnv)
    ).toBe(false);
  });

  it("teslim hedefi olmadan teslim KAPALI", () => {
    expect(
      canDeliverForms({
        ...PROD,
        PUBLIC_SITE_URL: PRODUCTION_ORIGIN,
        LEGAL_APPROVED: "true",
      } as NodeJS.ProcessEnv)
    ).toBe(false);
  });

  it("preview ortamında hepsi verilse bile teslim KAPALI", () => {
    expect(
      canDeliverForms({
        LEGAL_APPROVED: "true",
        CONTACT_FORM_TO: "kime@ornek.test",
      } as NodeJS.ProcessEnv)
    ).toBe(false);
  });

  it("üç koşul birlikte sağlanırsa AÇILIR", () => {
    expect(
      canDeliverForms({
        ...PROD,
        LEGAL_APPROVED: "true",
        CONTACT_FORM_TO: "kime@ornek.test",
      } as NodeJS.ProcessEnv)
    ).toBe(true);
  });

  it('LEGAL_APPROVED yalnızca tam olarak "true" ile açılır', () => {
    for (const value of ["TRUE", "1", "yes", "onaylandi", ""]) {
      expect(isLegalApproved({ LEGAL_APPROVED: value } as NodeJS.ProcessEnv), value).toBe(false);
    }
    expect(isLegalApproved({ LEGAL_APPROVED: "true" } as NodeJS.ProcessEnv)).toBe(true);
  });
});

describe("hukuk kapısı içerik kaydıyla TUTARLI", () => {
  /*
   * Bayrağın açılması tek başına yetmez: yayımlanan aydınlatma metni hâlâ
   * `legal-review-required` ise production teslimi açmak, onaylanmamış bir
   * metinle veri toplamak demektir. Bu test o çelişkiyi yakalar.
   */
  const legal = JSON.parse(
    readFileSync(join(process.cwd(), "src/content/legal/legal.json"), "utf8")
  ) as Array<{ locale: string; status: string; reviewStatus: string }>;

  it("aydınlatma metni kayıtları hâlâ hukuk incelemesi bekliyor", () => {
    expect(legal.length).toBeGreaterThan(0);
    for (const entry of legal) {
      expect(entry.reviewStatus, `${entry.locale} kaydı`).toBe("legal-review-required");
      expect(entry.status, `${entry.locale} kaydı`).toBe("draft");
    }
  });

  it("metin onaylanmamışken LEGAL_APPROVED deposunda AÇIK DEĞİL", () => {
    // Depoda saklanan hiçbir ortam dosyası bu bayrağı açmamalı.
    expect(isLegalApproved(process.env)).toBe(false);
  });
});

describe("origin denetimi fail-closed", () => {
  it("preview'da izinli origin listesi BOŞ", () => {
    // Boş liste, sunucu çekirdeğinde "hiçbir origin kabul edilmez" demektir.
    expect(allowedFormOrigins({} as NodeJS.ProcessEnv)).toEqual([]);
  });

  it("production'da yalnızca kanonik origin izinli", () => {
    expect(
      allowedFormOrigins({ ...PROD, PUBLIC_SITE_URL: PRODUCTION_ORIGIN } as NodeJS.ProcessEnv)
    ).toEqual([PRODUCTION_ORIGIN]);
  });

  it("production'da geçersiz site URL'si origin listesini de KIRAR", () => {
    // Sessizce boş listeye düşmek yerine hata: yanlış yapılandırma gizlenmez.
    expect(() => allowedFormOrigins(PROD)).toThrow(/PUBLIC_SITE_URL zorunludur/);
  });
});
