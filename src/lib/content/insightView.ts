import type { CollectionEntry } from "astro:content";
import type { Locale } from "@lib/content/schema";
import { readingMinutes } from "@lib/content/readingTime";
import { seriesLabel, seriesSlug } from "@lib/content/series";
import { insightPath, insightSeriesPath } from "@lib/i18n/routes";
import { formatDate, isoDate } from "@lib/i18n/dates";

/**
 * İÇGÖRÜ GÖRÜNÜM MODELİ (S11).
 *
 * Liste kartı, detay başlığı, RSS ve JSON-LD aynı alanlara ihtiyaç duyuyor.
 * Bunları her şablonda yeniden hesaplamak, dört yerde birbirinden ayrışabilen
 * dört kopya demekti — özellikle okuma süresi ve tarih biçimi.
 *
 * Okuma süresi GÖVDEDEN hesaplanır, kayıttan okunmaz: kayıtta böyle bir alan
 * yok (bkz. `insightSchema`).
 */

export interface InsightView {
  slug: string;
  title: string;
  excerpt: string;
  href: string;
  /** Serinin bu dildeki etiketi ve yolu. */
  seriesKey: string;
  seriesLabel: string;
  seriesHref: string;
  /** Görünen tarih ("10 Eylül 2026") ve makine tarihi ("2026-09-10"). */
  publishedLabel: string;
  publishedIso: string;
  updatedLabel?: string;
  updatedIso?: string;
  readingMinutes: number;
  tags: readonly string[];
}

/**
 * Bir içgörü kaydını görünüm modeline çevirir.
 *
 * `body` ayrı parametre: Astro'nun koleksiyon girdisinde ham gövde
 * `entry.body` alanındadır ve tipi `string | undefined`. Okuma süresi için
 * gövde ZORUNLUDUR; gövdesiz bir kayıt için süre uydurmak yerine 1 dakika
 * tabanına düşülür (bkz. `readingMinutes`).
 */
export function toInsightView(entry: CollectionEntry<"insights">, locale: Locale): InsightView {
  const data = entry.data;
  const published = data.publishedAt;

  // Public seçici tarihsiz yayınlanmış kayıt döndürmez; şema da reddeder.
  // Yine de tip düzeyinde opsiyonel olduğu için burada açıkça karşılanır.
  if (published === undefined) {
    throw new Error(`[insights] "${data.slug}" için publishedAt bulunamadı.`);
  }

  const view: InsightView = {
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    href: insightPath(locale, data.slug),
    seriesKey: data.series,
    seriesLabel: seriesLabel(data.series, locale),
    seriesHref: insightSeriesPath(locale, seriesSlug(data.series, locale)),
    publishedLabel: formatDate(published, locale),
    publishedIso: isoDate(published),
    readingMinutes: readingMinutes(entry.body ?? ""),
    tags: data.tags,
  };

  if (data.updatedAt !== undefined) {
    view.updatedLabel = formatDate(data.updatedAt, locale);
    view.updatedIso = isoDate(data.updatedAt);
  }

  return view;
}

/** Bir listeyi toplu çevirir. */
export function toInsightViews(
  entries: CollectionEntry<"insights">[],
  locale: Locale
): InsightView[] {
  return entries.map((entry) => toInsightView(entry, locale));
}
