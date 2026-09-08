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

/** Locale başına segment adları. Rota haritası `03_CONTENT_AND_ROUTE_MAP.md` §2. */
const SEGMENTS = {
  tr: { solutions: "cozumler", insights: "icgoruler" },
  en: { solutions: "solutions", insights: "insights" },
} as const satisfies Record<Locale, { solutions: string; insights: string }>;

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

/** Ana sayfa yolu: / veya /en/ */
export function homePath(locale: Locale): string {
  return localizedPath(locale);
}

/** Verilen locale dışındaki diller. */
export function otherLocales(locale: Locale): Locale[] {
  return LOCALES.filter((l) => l !== locale);
}
