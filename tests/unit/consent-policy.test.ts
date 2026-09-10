import { describe, expect, it } from "vitest";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_PROVIDER,
  CONSENT_CATEGORIES,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  DEFAULT_CONSENT,
  FORBIDDEN_EVENT_KEYS,
  LOCKED_CATEGORIES,
  isAllowed,
  isAnalyticsEvent,
  parseConsent,
  sanitizeEventPayload,
  serializeConsent,
} from "../../src/lib/consent/policy";

/**
 * İZİN POLİTİKASI TESTLERİ (S12).
 *
 * Politikanın tamamı fail-closed olmalı: BİLİNMEYEN bir girdi asla "izin
 * verildi" anlamına gelmez. Testlerin çoğu bu yüzden bozuk/eksik/eski girdiyle
 * çalışır.
 */

describe("kategori kümesi", () => {
  it("yalnızca essential ve analytics var — kullanılmayan kategori YOK", () => {
    expect([...CONSENT_CATEGORIES]).toEqual(["essential", "analytics"]);
    expect(CONSENT_CATEGORIES as readonly string[]).not.toContain("marketing");
  });

  it("essential kilitli, analytics kilitli DEĞİL", () => {
    expect([...LOCKED_CATEGORIES]).toEqual(["essential"]);
  });

  it("varsayılan durum: essential açık, analytics KAPALI", () => {
    expect(DEFAULT_CONSENT.essential).toBe(true);
    expect(DEFAULT_CONSENT.analytics).toBe(false);
    expect(DEFAULT_CONSENT.version).toBe(CONSENT_VERSION);
  });

  it("depo anahtarı ad alanlı", () => {
    expect(CONSENT_STORAGE_KEY).toBe("duosis.consent");
  });
});

describe("parseConsent fail-closed", () => {
  const valid = serializeConsent({
    version: CONSENT_VERSION,
    decidedAt: "2026-09-10T00:00:00.000Z",
    essential: true,
    analytics: true,
  });

  it("geçerli kaydı okur", () => {
    const state = parseConsent(valid);
    expect(state?.analytics).toBe(true);
    expect(state?.essential).toBe(true);
  });

  it("kayıt yoksa null", () => {
    expect(parseConsent(null)).toBeNull();
    expect(parseConsent("")).toBeNull();
  });

  it("bozuk JSON null", () => {
    expect(parseConsent("{bozuk")).toBeNull();
    expect(parseConsent("[1,2,3")).toBeNull();
  });

  it("JSON olsa da nesne değilse null", () => {
    expect(parseConsent('"evet"')).toBeNull();
    expect(parseConsent("42")).toBeNull();
    expect(parseConsent("null")).toBeNull();
  });

  it("ESKİ sürüm geçersiz — kullanıcıya yeniden sorulur", () => {
    const old = JSON.stringify({
      version: CONSENT_VERSION - 1,
      decidedAt: "2026-01-01T00:00:00.000Z",
      analytics: true,
    });
    expect(parseConsent(old)).toBeNull();
  });

  it("İLERİ sürüm de geçersiz", () => {
    const future = JSON.stringify({
      version: CONSENT_VERSION + 1,
      decidedAt: "2026-01-01T00:00:00.000Z",
      analytics: true,
    });
    expect(parseConsent(future)).toBeNull();
  });

  it("eksik alanlar geçersiz", () => {
    expect(parseConsent(JSON.stringify({ version: CONSENT_VERSION, analytics: true }))).toBeNull();
    expect(
      parseConsent(JSON.stringify({ version: CONSENT_VERSION, decidedAt: "2026-01-01" }))
    ).toBeNull();
  });

  it('analytics boolean değilse geçersiz — "true" metni izin sayılmaz', () => {
    const sneaky = JSON.stringify({
      version: CONSENT_VERSION,
      decidedAt: "2026-01-01T00:00:00.000Z",
      analytics: "true",
    });
    expect(parseConsent(sneaky)).toBeNull();
  });

  it("essential kayıttan okunmaz, HER ZAMAN true'ya sabitlenir", () => {
    const tampered = JSON.stringify({
      version: CONSENT_VERSION,
      decidedAt: "2026-01-01T00:00:00.000Z",
      essential: false,
      analytics: false,
    });
    expect(parseConsent(tampered)?.essential).toBe(true);
  });
});

describe("isAllowed", () => {
  it("essential her durumda açık — karar verilmemişken bile", () => {
    expect(isAllowed(null, "essential")).toBe(true);
  });

  it("karar verilmemişken analytics KAPALI", () => {
    expect(isAllowed(null, "analytics")).toBe(false);
  });

  it("analytics yalnızca açık kayıtta izinli", () => {
    const state = parseConsent(
      serializeConsent({
        version: CONSENT_VERSION,
        decidedAt: "2026-09-10T00:00:00.000Z",
        essential: true,
        analytics: false,
      })
    );
    expect(isAllowed(state, "analytics")).toBe(false);
  });
});

describe("analytics kanalı", () => {
  it("sağlayıcı none — GA4 veya Yandex YOK", () => {
    expect(ANALYTICS_PROVIDER).toBe("none");
  });

  it("olay adı kümesi KAPALI", () => {
    expect(isAnalyticsEvent("solution-cta")).toBe(true);
    expect(isAnalyticsEvent("page_view")).toBe(false);
    expect(isAnalyticsEvent("")).toBe(false);
    expect(isAnalyticsEvent(42)).toBe(false);
    expect(isAnalyticsEvent(undefined)).toBe(false);
  });

  it("olay adları serbest metin taşımıyor", () => {
    for (const event of ANALYTICS_EVENTS) {
      expect(event, event).toMatch(/^[a-z-]+$/);
    }
  });
});

describe("sanitizeEventPayload", () => {
  it("yasak anahtarların HEPSİ düşer", () => {
    const payload: Record<string, unknown> = {};
    for (const key of FORBIDDEN_EVENT_KEYS) payload[key] = "deger";
    expect(sanitizeEventPayload(payload)).toEqual({});
  });

  it("e-posta benzeri değer anahtarı masum olsa bile düşer", () => {
    expect(sanitizeEventPayload({ kim: "biri@ornek.test" })).toEqual({});
  });

  it("uzun serbest metin düşer", () => {
    const long = "x".repeat(41);
    expect(sanitizeEventPayload({ note: long })).toEqual({});
    expect(sanitizeEventPayload({ note: "x".repeat(40) })).toEqual({ note: "x".repeat(40) });
  });

  it("kısa kapalı değerler, sayı ve boolean geçer", () => {
    expect(sanitizeEventPayload({ topic: "cyclops", count: 2, ok: true })).toEqual({
      topic: "cyclops",
      count: 2,
      ok: true,
    });
  });

  it("iç içe nesne ve dizi geçmez", () => {
    expect(sanitizeEventPayload({ nested: { a: 1 }, list: [1, 2] })).toEqual({});
  });

  it("URL ve sorgu dizesi payload'a giremez", () => {
    expect(
      sanitizeEventPayload({
        url: "https://duosis.com/iletisim/?topic=cyclops",
        query: "?topic=cyclops",
        search: "cyclops",
      })
    ).toEqual({});
  });
});
