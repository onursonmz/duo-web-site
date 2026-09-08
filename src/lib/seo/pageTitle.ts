/**
 * Sayfa <title> üretimi.
 *
 * S00 baseline ölçümü, mevcut sitenin ana sayfa title'ının `Duosis - Duosis`
 * olduğunu ve 24/54 sayfada meta description bulunmadığını gösterdi
 * (bkz. discovery/S00_FINDINGS.md ss.5). Bu yardımcı, marka adının
 * tekrarlanmasını ve aşırı uzun title üretilmesini yapısal olarak engeller.
 *
 * Not: buradaki metinler yer tutucudur; nihai pazarlama metni S05+ kapsamındadır.
 */

/** Arama sonuçlarında güvenli kabul edilen üst sınır. */
export const TITLE_MAX_LENGTH = 60;

const SEPARATOR = " | ";

export interface PageTitleOptions {
  /** Sayfaya özgü başlık. Boş/boşluk ise yalnızca site adı döner. */
  readonly pageTitle?: string | undefined;
  /** Marka/site adı. */
  readonly siteName: string;
  /** Üst sınır; varsayılan TITLE_MAX_LENGTH. */
  readonly maxLength?: number | undefined;
}

/**
 * Sayfa başlığını `"<sayfa> | <site>"` biçiminde kurar.
 *
 * Kurallar:
 * - Sayfa başlığı yoksa veya yalnızca boşluksa, tek başına site adı döner.
 * - Sayfa başlığı site adıyla aynıysa marka adı tekrarlanmaz.
 * - Sonuç `maxLength`'i aşarsa yalnızca sayfa kısmı kısaltılır ve tek
 *   karakterlik yatay üç nokta (…) eklenir; site adı korunur.
 */
export function buildPageTitle({ pageTitle, siteName, maxLength }: PageTitleOptions): string {
  const limit = maxLength ?? TITLE_MAX_LENGTH;
  const site = siteName.trim();
  const page = (pageTitle ?? "").trim();

  if (page === "" || page.toLowerCase() === site.toLowerCase()) {
    return site;
  }

  const full = `${page}${SEPARATOR}${site}`;
  if (full.length <= limit) {
    return full;
  }

  // Site adı ve ayraç korunur; kalan alan sayfa başlığına ayrılır.
  const roomForPage = limit - site.length - SEPARATOR.length - 1;
  if (roomForPage <= 0) {
    return site;
  }

  return `${page.slice(0, roomForPage).trimEnd()}…${SEPARATOR}${site}`;
}
