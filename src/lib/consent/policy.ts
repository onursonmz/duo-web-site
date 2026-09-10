/**
 * ÇEREZ / İZİN POLİTİKASI — TEK KAYNAK (S12).
 *
 * KURALLAR
 * - `essential` varsayılan AÇIK ve KAPATILAMAZ.
 * - `analytics` varsayılan KAPALI.
 * - `marketing` kategorisi YOKTUR: kullanılmayan bir kategori oluşturulmaz.
 * - Analytics sağlayıcısı şu an `none`; GA4, Yandex/Webvisor veya başka bir
 *   üçüncü taraf script EKLENMEZ.
 * - İzin alınmadan hiçbir üçüncü taraf script, iframe, pixel, DNS veya ağ
 *   isteği oluşmaz. İzin verilse bile sağlayıcı `none` olduğu için istek
 *   yapılmaz — kanal hazırdır, açık değildir.
 */

export const CONSENT_CATEGORIES = ["essential", "analytics"] as const;
export type ConsentCategory = (typeof CONSENT_CATEGORIES)[number];

/** Kapatılamayan kategoriler. */
export const LOCKED_CATEGORIES: readonly ConsentCategory[] = ["essential"];

/**
 * Politika sürümü. Kategoriler veya anlamları değişirse ARTIRILIR; eski
 * sürümle kaydedilmiş tercih geçersiz sayılır ve kullanıcıya yeniden sorulur.
 */
export const CONSENT_VERSION = 1;

export const CONSENT_STORAGE_KEY = "duosis.consent";

export interface ConsentState {
  readonly version: number;
  /** ISO 8601; tercihin ne zaman verildiği. */
  readonly decidedAt: string;
  readonly essential: true;
  readonly analytics: boolean;
}

/** Karar verilmemiş başlangıç durumu: analytics KAPALI. */
export const DEFAULT_CONSENT: Omit<ConsentState, "decidedAt"> = {
  version: CONSENT_VERSION,
  essential: true,
  analytics: false,
};

/**
 * Depodan okunan ham değeri güvenli duruma çevirir.
 *
 * FAIL-CLOSED: bozuk JSON, eksik alan veya ESKİ SÜRÜM → `null` döner ve
 * banner yeniden gösterilir. Bilinmeyen bir değer "izin verildi" sayılmaz.
 */
export function parseConsent(raw: string | null): ConsentState | null {
  if (raw === null || raw === "") return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;
  const record = data as Record<string, unknown>;
  if (record["version"] !== CONSENT_VERSION) return null;
  if (typeof record["decidedAt"] !== "string") return null;
  if (typeof record["analytics"] !== "boolean") return null;
  return {
    version: CONSENT_VERSION,
    decidedAt: record["decidedAt"],
    essential: true,
    analytics: record["analytics"],
  };
}

export function serializeConsent(state: ConsentState): string {
  return JSON.stringify(state);
}

/** Bir kategori şu an etkin mi? */
export function isAllowed(state: ConsentState | null, category: ConsentCategory): boolean {
  if (category === "essential") return true;
  return state?.analytics === true;
}

/* ------------------------------------------------------------- analytics */

/** Analytics sağlayıcısı. `none`: hiçbir istek yapılmaz. */
export const ANALYTICS_PROVIDER = "none" as const;
export type AnalyticsProvider = typeof ANALYTICS_PROVIDER;

/**
 * KAPALI olay adı kümesi.
 *
 * Payload'a URL query, e-posta, ad, kurum veya mesaj GİREMEZ; olay yalnızca
 * adıyla ve sabit, kişisel olmayan alanlarla taşınır.
 */
export const ANALYTICS_EVENTS = [
  "solution-cta",
  "product-cta",
  "about-cta",
  "contact-submit",
  "consent-decision",
] as const;
export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export function isAnalyticsEvent(value: unknown): value is AnalyticsEvent {
  return typeof value === "string" && (ANALYTICS_EVENTS as readonly string[]).includes(value);
}

/** Olay payload'ında YASAK anahtarlar. */
export const FORBIDDEN_EVENT_KEYS = [
  "email",
  "name",
  "organization",
  "message",
  "query",
  "search",
  "url",
  "href",
  "topic_raw",
] as const;

/**
 * Payload'ı güvenli hâle getirir: yasak anahtarlar ve serbest metin düşer.
 * Yalnızca kısa, kapalı değerler geçer.
 */
export function sanitizeEventPayload(
  payload: Record<string, unknown>
): Record<string, string | number | boolean> {
  const safe: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(payload)) {
    if ((FORBIDDEN_EVENT_KEYS as readonly string[]).includes(key)) continue;
    if (typeof value === "boolean" || typeof value === "number") {
      safe[key] = value;
      continue;
    }
    if (typeof value === "string" && value.length <= 40 && !value.includes("@")) {
      safe[key] = value;
    }
  }
  return safe;
}
