/**
 * İLETİŞİM KONUSU — MERKEZİ KAPALI ALLOWLIST (S12).
 *
 * TEK CANONICAL YAKLAŞIM: CTA'lar zaten `?topic=<slug>` taşıyor. Forma
 * `interest` adında ikinci bir paralel sistem KURULMAZ; formun "ilgi alanı"
 * alanı da bu listeden beslenir ve aynı `topic` anahtarını kullanır.
 *
 * Liste KAPALIDIR: buraya yazılmayan hiçbir değer kabul edilmez. Bilinmeyen,
 * tekrarlı, aşırı uzun veya çok değerli query parametreleri forma TAŞINMAZ —
 * serbest metin bu kanaldan içeri giremez.
 *
 * Liste elle tutulur ve `tests/unit/contact-core.test.ts` onu YAYINLANMIŞ
 * çözüm slug'larıyla karşılaştırır: içerik değişip liste güncellenmezse test
 * kırılır (fail-closed drift koruması).
 */

/** Çözüm alanları — TR slug'ları. */
export const TR_SOLUTION_TOPICS = [
  "aiops-ve-olay-yasam-dongusu",
  "bt-hizmet-yonetimi",
  "konfigurasyon-ve-varlik-yonetimi",
  "kurumsal-mimari-ve-yonetisim",
  "muhendislik-ve-urun-gelistirme",
  "operasyonel-gorunurluk",
  "otomasyon",
  "veri-akisi-ve-entegrasyon",
] as const;

/** Çözüm alanları — EN slug'ları. */
export const EN_SOLUTION_TOPICS = [
  "aiops-and-event-lifecycle",
  "automation",
  "configuration-and-asset-management",
  "data-streaming-and-integration",
  "engineering-and-product-development",
  "enterprise-architecture",
  "it-service-management",
  "observability-and-apm",
] as const;

/** Ürün konuları (ADR-012). */
export const PRODUCT_CONTACT_TOPICS = ["cyclops"] as const;

/** Konu belirtilmediğinde kullanılan nötr değer. */
export const GENERAL_TOPIC = "genel" as const;

/** Kabul edilen TÜM konu değerleri. Başka hiçbir değer geçerli değildir. */
export const CONTACT_TOPICS = [
  GENERAL_TOPIC,
  ...PRODUCT_CONTACT_TOPICS,
  ...TR_SOLUTION_TOPICS,
  ...EN_SOLUTION_TOPICS,
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

/** Değer allowlist'te mi? Tip daraltır. */
export function isContactTopic(value: unknown): value is ContactTopic {
  return typeof value === "string" && (CONTACT_TOPICS as readonly string[]).includes(value);
}

/**
 * Query'den gelen ham değeri güvenli konuya çevirir.
 *
 * FAIL-CLOSED: bilinmeyen değer, dizi (çok değerli parametre), aşırı uzun
 * girdi veya boş değer sessizce `genel`e düşer. Ham metin ASLA taşınmaz.
 */
export function normalizeTopic(raw: string | string[] | null | undefined): ContactTopic {
  // Çok değerli parametre (`?topic=a&topic=b`) kabul edilmez.
  if (Array.isArray(raw)) return GENERAL_TOPIC;
  if (typeof raw !== "string") return GENERAL_TOPIC;
  // Aşırı uzun girdi normalize edilmeden reddedilir.
  if (raw.length > 64) return GENERAL_TOPIC;
  return isContactTopic(raw) ? raw : GENERAL_TOPIC;
}

/**
 * `URLSearchParams` üzerinden güvenli konu okuma.
 *
 * Aynı anahtar birden çok kez verilmişse (tekrarlı parametre) değer
 * KULLANILMAZ; bu bir manipülasyon işaretidir.
 */
export function topicFromSearchParams(params: URLSearchParams): ContactTopic {
  const all = params.getAll("topic");
  if (all.length !== 1) return GENERAL_TOPIC;
  return normalizeTopic(all[0]);
}
