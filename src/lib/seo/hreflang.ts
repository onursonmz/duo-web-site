import { LOCALES, type Locale } from "@lib/content/schema";

/**
 * HREFLANG STRATEJİSİ (S13).
 *
 * ÜÇ KURAL:
 *
 *   1. KARŞILIKLILIK — bir sayfa hreflang veriyorsa kendi dilini de verir.
 *      Google karşılıklı olmayan hreflang'i yok sayar; tek yönlü etiket
 *      "yapmış olmak için" yazılmış olur.
 *
 *   2. SAHTE ÇEVİRİ YOK — gerçek bir çeviri YOKSA o dil için hreflang
 *      ÜRETİLMEZ. Bir sayfanın İngilizcesi yoksa `/en/...` adresine
 *      hreflang vermek, olmayan içeriği vaat etmektir.
 *
 *   3. x-default YALNIZCA gerçekten çok dilli sayfalarda — tek dilli bir
 *      sayfada x-default hiçbir bilgi taşımaz, yalnızca gürültüdür.
 *      Varsayılan dil TÜRKÇE'dir: birincil içerik ve birincil pazar Türkçe.
 *
 * Bu modül URL üretmez, YALNIZCA hangi etiketin yazılacağına karar verir;
 * mutlak adrese çevirme işi çağıran katmandadır (canonical ile aynı taban).
 */

/** x-default'un işaret ettiği dil. */
export const X_DEFAULT_LOCALE: Locale = "tr";

export interface HreflangLink {
  /** `hreflang` özniteliği: "tr", "en" veya "x-default". */
  readonly hreflang: string;
  /** Kök-göreli yol; mutlaklaştırma çağırana aittir. */
  readonly href: string;
}

/**
 * Bir sayfanın hreflang etiketlerini üretir.
 *
 * @param locale     Sayfanın kendi dili.
 * @param path       Sayfanın kendi kök-göreli yolu (canonical yolu).
 * @param alternates Gerçekten VAR OLAN çevirilerin yolları.
 */
export function hreflangLinks(
  locale: Locale,
  path: string,
  alternates: Partial<Record<Locale, string>>
): HreflangLink[] {
  /*
   * Sayfanın kendi dili her zaman kendi canonical yolunu gösterir. Çağıran
   * `alternates` içinde kendi dilini verse bile canonical kazanır: iki farklı
   * adres (ör. eski bir slug) hreflang ile canonical arasında çelişki yaratır.
   */
  const resolved = new Map<Locale, string>([[locale, path]]);

  for (const candidate of LOCALES) {
    if (candidate === locale) continue;
    const href = alternates[candidate];
    // Çeviri YOKSA etiket de yok (kural 2).
    if (href === undefined || href === "") continue;
    resolved.set(candidate, href);
  }

  // Tek dilli sayfa: hreflang kümesi hiçbir şey anlatmaz, boş döner (kural 1).
  if (resolved.size < 2) return [];

  const links: HreflangLink[] = LOCALES.filter((candidate) => resolved.has(candidate)).map(
    (candidate) => ({ hreflang: candidate, href: resolved.get(candidate) as string })
  );

  // x-default yalnızca varsayılan dilin karşılığı gerçekten varsa (kural 3).
  const fallback = resolved.get(X_DEFAULT_LOCALE);
  if (fallback !== undefined) links.push({ hreflang: "x-default", href: fallback });

  return links;
}
