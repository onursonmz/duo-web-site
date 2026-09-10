import { DEFAULT_LOCALE, LOCALES, type Locale } from "@lib/content/schema";

/**
 * URL tabanlı, deterministik locale çözümü ve yerelleştirilmiş yol üretimi.
 *
 * Sözleşme (`02_TECHNICAL_ARCHITECTURE.md` §4):
 * - Varsayılan locale `tr`; Türkçe URL'lerde prefix YOK.
 * - İngilizce `/en/...` altında.
 */

export { DEFAULT_LOCALE, LOCALES };
export type { Locale };

/**
 * Locale başına segment adları. Rota haritası `03_CONTENT_AND_ROUTE_MAP.md` §2.
 *
 * `series` ve `tag` içgörü filtrelerinin ALT segmentleridir: filtreleme serbest
 * query parametresiyle değil, paylaşılabilir ve statik olarak üretilmiş bir
 * yolla yapılır (S11 §11). Böylece filtre JS olmadan da çalışır ve bilinmeyen
 * bir değer 404 üretir.
 */
const SEGMENTS = {
  tr: {
    solutions: "cozumler",
    insights: "icgoruler",
    contact: "iletisim",
    cyclops: "cyclops",
    about: "hakkimizda",
    services: "hizmetler",
    technologies: "teknolojiler",
    series: "seri",
    tag: "etiket",
  },
  en: {
    solutions: "solutions",
    insights: "insights",
    contact: "contact",
    cyclops: "cyclops",
    about: "about",
    services: "services",
    technologies: "technologies",
    series: "series",
    tag: "tag",
  },
} as const satisfies Record<
  Locale,
  {
    solutions: string;
    insights: string;
    contact: string;
    cyclops: string;
    about: string;
    services: string;
    technologies: string;
    series: string;
    tag: string;
  }
>;

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Bir pathname'den locale'i belirler. Yalnızca ilk segmente bakar — tahmin,
 * Accept-Language veya çerez kullanılmaz.
 */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.replace(/^\/+/, "").split("/")[0];
  return first !== undefined && isLocale(first) && first !== DEFAULT_LOCALE
    ? first
    : DEFAULT_LOCALE;
}

/** Locale önekini verir: tr -> "", en -> "/en". */
export function localePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "" : `/${locale}`;
}

/** Baştaki/sondaki eğik çizgileri normalize edip her zaman sondaki `/` ile döner. */
function normalize(path: string): string {
  const trimmed = path.replace(/^\/+/, "").replace(/\/+$/, "");
  return trimmed === "" ? "/" : `/${trimmed}/`;
}

/** Locale önekli mutlak yol üretir. `segments` boşsa locale ana sayfası döner. */
export function localizedPath(locale: Locale, ...segments: string[]): string {
  const parts = segments.filter((s) => s !== "");
  return normalize(`${localePrefix(locale)}/${parts.join("/")}`);
}

/** Çözüm landing yolu: /cozumler/ veya /en/solutions/ */
export function solutionsIndexPath(locale: Locale): string {
  return localizedPath(locale, SEGMENTS[locale].solutions);
}

/** Çözüm detay yolu: /cozumler/<slug>/ veya /en/solutions/<slug>/ */
export function solutionPath(locale: Locale, slug: string): string {
  return localizedPath(locale, SEGMENTS[locale].solutions, slug);
}

/** İçgörüler landing yolu: /icgoruler/ veya /en/insights/ */
export function insightsIndexPath(locale: Locale): string {
  return localizedPath(locale, SEGMENTS[locale].insights);
}

/** İçgörü detay yolu: /icgoruler/<slug>/ veya /en/insights/<slug>/ */
export function insightPath(locale: Locale, slug: string): string {
  return localizedPath(locale, SEGMENTS[locale].insights, slug);
}

/** Hizmetler landing yolu: /hizmetler/ veya /en/services/ */
export function servicesIndexPath(locale: Locale): string {
  return localizedPath(locale, SEGMENTS[locale].services);
}

/** Teknolojiler landing yolu: /teknolojiler/ veya /en/technologies/ */
export function technologiesIndexPath(locale: Locale): string {
  return localizedPath(locale, SEGMENTS[locale].technologies);
}

/** İçgörü seri yolu: /icgoruler/seri/<slug>/ veya /en/insights/series/<slug>/ */
export function insightSeriesPath(locale: Locale, slug: string): string {
  return localizedPath(locale, SEGMENTS[locale].insights, SEGMENTS[locale].series, slug);
}

/** İçgörü etiket yolu: /icgoruler/etiket/<slug>/ veya /en/insights/tag/<slug>/ */
export function insightTagPath(locale: Locale, slug: string): string {
  return localizedPath(locale, SEGMENTS[locale].insights, SEGMENTS[locale].tag, slug);
}

/**
 * RSS besleme yolu: /rss.xml veya /en/rss.xml
 *
 * Dosya uzantısı taşıdığı için `localizedPath` sondaki eğik çizgi kuralına
 * SOKULMAZ; besleme bir dizin değil, tek bir kaynaktır.
 */
export function rssPath(locale: Locale): string {
  return `${localePrefix(locale)}/rss.xml`;
}

/** İletişim yolu: /iletisim/ veya /en/contact/ */
export function contactPath(locale: Locale): string {
  return localizedPath(locale, SEGMENTS[locale].contact);
}

/**
 * ÇÖZÜM CTA BAĞLAMI.
 *
 * CTA, hangi çözümden gelindiğini `?topic=<slug>` ile taşıyabilir. Değer
 * ALLOWLIST dışındaysa parametre HİÇ eklenmez — serbest metin taşınamaz,
 * hassas veri giremez. Bu yalnızca pasif bir işarettir; analytics isteği
 * başlatmaz.
 */
export function contactPathForTopic(
  locale: Locale,
  topic: string,
  allowed: readonly string[]
): string {
  const base = contactPath(locale);
  return allowed.includes(topic) ? `${base}?topic=${encodeURIComponent(topic)}` : base;
}

/** CyclOps ürün sayfası: /cyclops/ veya /en/cyclops/ */
export function cyclopsPath(locale: Locale): string {
  return localizedPath(locale, SEGMENTS[locale].cyclops);
}

/** Hakkımızda yolu: /hakkimizda/ veya /en/about/ */
export function aboutPath(locale: Locale): string {
  return localizedPath(locale, SEGMENTS[locale].about);
}

/** Zaman çizelgesi çapası; ana sayfadan derin bağlantı buraya gider. */
export const JOURNEY_ANCHOR = { tr: "yolculuk", en: "journey" } as const;

/** /hakkimizda/#yolculuk veya /en/about/#journey */
export function journeyPath(locale: Locale): string {
  return `${aboutPath(locale)}#${JOURNEY_ANCHOR[locale]}`;
}

/**
 * ÜRÜN CTA KONULARI — KAPALI KÜME.
 *
 * Çözüm slug'larından AYRI tutulur: ürün sayfası kendi konusunu taşır ve
 * buraya yazılmayan hiçbir değer parametre olamaz. Serbest query kabul
 * edilmez.
 */
export const PRODUCT_TOPICS = ["cyclops"] as const;
export type ProductTopic = (typeof PRODUCT_TOPICS)[number];

/** Ürün sayfasının iletişim CTA'sı; konu allowlist dışındaysa parametre eklenmez. */
export function contactPathForProductTopic(locale: Locale, topic: string): string {
  return contactPathForTopic(locale, topic, PRODUCT_TOPICS);
}

/** Ana sayfa yolu: / veya /en/ */
export function homePath(locale: Locale): string {
  return localizedPath(locale);
}

/** Verilen locale dışındaki diller. */
export function otherLocales(locale: Locale): Locale[] {
  return LOCALES.filter((l) => l !== locale);
}
