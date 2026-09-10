import { INSIGHT_SERIES, LOCALES, type InsightSeries, type Locale } from "@lib/content/schema";

/**
 * SERİ MODELİ — TEK KAYNAK (S11 §11).
 *
 * Bir seri üç şeyden oluşur: kapalı kümedeki anahtarı, her dildeki YOL SLUG'ı
 * ve her dildeki GÖRÜNEN ETİKETİ. Üçü de burada durur; sayfalar ve testler
 * aynı tabloyu okur.
 *
 * Slug ve etiket neden ayrı?
 * Etiket çevrilebilir ve marka adı taşıyabilir ("CyclOps Günlüğü"); slug ise
 * URL'de yaşar, ASCII kalmak ve DEĞİŞMEMEK zorundadır. İkisini tek alana
 * indirgemek, etiketi düzeltmenin yayınlanmış bir URL'yi kırması demekti.
 *
 * `Data & AI` her iki dilde de aynı yazılır: yerleşik bir terimdir, çevirisi
 * uydurulmaz.
 */

export interface SeriesDefinition {
  readonly key: InsightSeries;
  readonly slug: Record<Locale, string>;
  readonly label: Record<Locale, string>;
}

export const SERIES: readonly SeriesDefinition[] = [
  {
    key: "observability-radar",
    slug: { tr: "observability-radar", en: "observability-radar" },
    label: { tr: "Observability Radar", en: "Observability Radar" },
  },
  {
    key: "data-and-ai",
    slug: { tr: "data-ve-ai", en: "data-and-ai" },
    label: { tr: "Data & AI", en: "Data & AI" },
  },
  {
    key: "architecture-notes",
    slug: { tr: "mimari-notlari", en: "architecture-notes" },
    label: { tr: "Mimari Notları", en: "Architecture Notes" },
  },
  {
    key: "automation-guides",
    slug: { tr: "otomasyon-rehberleri", en: "automation-guides" },
    label: { tr: "Otomasyon Rehberleri", en: "Automation Guides" },
  },
  {
    key: "cyclops-log",
    slug: { tr: "cyclops-gunlugu", en: "cyclops-log" },
    label: { tr: "CyclOps Günlüğü", en: "CyclOps Log" },
  },
  {
    key: "regional-technology",
    slug: { tr: "bolgesel-teknoloji", en: "regional-technology" },
    label: { tr: "Bölgesel Teknoloji", en: "Regional Technology" },
  },
] as const;

/**
 * Tablo bütünlüğü. Kapalı kümedeki her anahtarın burada TAM OLARAK bir
 * karşılığı olmalı; eksik bir satır sayfa üretiminde değil, ilk import'ta
 * fark edilmeli.
 */
const byKey = new Map<InsightSeries, SeriesDefinition>(SERIES.map((s) => [s.key, s]));
for (const key of INSIGHT_SERIES) {
  if (!byKey.has(key)) {
    throw new Error(`[series] "${key}" için tanım eksik: SERIES tablosuna eklenmeli.`);
  }
}
if (SERIES.length !== INSIGHT_SERIES.length) {
  throw new Error("[series] SERIES tablosu kapalı küme ile aynı boyutta olmalı.");
}

export function seriesByKey(key: InsightSeries): SeriesDefinition {
  const found = byKey.get(key);
  // Kapalı küme yukarıda doğrulandığı için buraya normalde düşülmez.
  if (found === undefined) throw new Error(`[series] Tanımsız seri: "${key}"`);
  return found;
}

export function seriesLabel(key: InsightSeries, locale: Locale): string {
  return seriesByKey(key).label[locale];
}

export function seriesSlug(key: InsightSeries, locale: Locale): string {
  return seriesByKey(key).slug[locale];
}

/**
 * Bir slug'ı seri anahtarına çevirir. Bulunamazsa `undefined` — çağıran taraf
 * 404 üretir, en yakın seriye DÜŞMEZ.
 */
export function seriesFromSlug(slug: string, locale: Locale): InsightSeries | undefined {
  return SERIES.find((s) => s.slug[locale] === slug)?.key;
}

/** Aynı serinin diğer dillerdeki slug karşılıkları. Dil değiştirici kullanır. */
export function seriesAlternateSlugs(key: InsightSeries): Record<Locale, string> {
  const definition = seriesByKey(key);
  return Object.fromEntries(LOCALES.map((l) => [l, definition.slug[l]])) as Record<Locale, string>;
}
