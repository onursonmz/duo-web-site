import { getCollection } from "astro:content";
import { LOCALES, type Locale } from "@lib/content/schema";
import { PUBLIC, isPublishedStatus } from "@lib/content/selectors";
import {
  aboutPath,
  contactPath,
  productPath,
  productsIndexPath,
  homePath,
  insightPath,
  insightSeriesPath,
  insightTagPath,
  insightsIndexPath,
  legalPath,
  servicesIndexPath,
  solutionPath,
  solutionsIndexPath,
  technologiesIndexPath,
} from "@lib/i18n/routes";

/**
 * İNDEKSLENEBİLİR ROTA ENVANTERİ (S13).
 *
 * Sitemap YALNIZCA buradan beslenir. Bir rotanın sitemap'e girebilmesi için
 * ÜÇ koşul birden gerekir:
 *
 *   1. İçeriği `published` (fail-closed olgunluk politikası),
 *   2. Sayfası `noindex` DEĞİL,
 *   3. Dahili/önizleme rotası değil.
 *
 * Bu yüzden design system, 404, 410, taslak hukuki metin ve preview-only
 * rotalar sitemap'e HİÇ girmez.
 *
 * Not: bugün tüm üretim sayfaları `noindex` taşıyor (final indeksleme kararı
 * S15 içerik doğruluk kapısında verilecek). Sitemap bu yüzden BOŞ olabilir —
 * bu bilinçli ve doğru sonuçtur; `noindex` değerleri kör biçimde `false`
 * YAPILMAZ.
 */

export interface IndexableRoute {
  readonly path: string;
  readonly locale: Locale;
  /** Son güncelleme (varsa). */
  readonly lastmod?: string;
}

/** Sitemap'e ASLA girmeyen rotalar. */
export const NEVER_INDEXED: readonly string[] = ["/design-system/", "/404/", "/410/"] as const;

function isNeverIndexed(path: string): boolean {
  return NEVER_INDEXED.includes(path);
}

/**
 * Bir içerik kaydının indekslenebilir olup olmadığı.
 * `seo.noindex` true ise rota sitemap'e girmez.
 */
function indexable(entry: { data: { status: string; seo?: { noindex?: boolean } } }): boolean {
  if (!isPublishedStatus(entry.data.status, PUBLIC)) return false;
  return entry.data.seo?.noindex !== true;
}

/** Tüm indekslenebilir üretim rotaları. */
export async function indexableRoutes(): Promise<IndexableRoute[]> {
  const routes: IndexableRoute[] = [];

  const add = (path: string, locale: Locale, lastmod?: string): void => {
    if (isNeverIndexed(path)) return;
    routes.push(lastmod === undefined ? { path, locale } : { path, locale, lastmod });
  };

  const solutions = await getCollection("solutions");
  const services = await getCollection("services");
  const insights = await getCollection("insights");
  const products = await getCollection("products");
  const about = await getCollection("about");
  const homepage = await getCollection("homepage");
  const legal = await getCollection("legal");

  for (const locale of LOCALES) {
    // --- statik aileler: yalnızca o dilde yayınlanabilir içerik varsa ------
    const home = homepage.find((entry) => entry.data.locale === locale);
    if (home !== undefined && indexable(home)) add(homePath(locale), locale);

    const localeSolutions = solutions.filter((e) => e.data.locale === locale && indexable(e));
    if (localeSolutions.length > 0) add(solutionsIndexPath(locale), locale);
    for (const entry of localeSolutions) add(solutionPath(locale, entry.data.slug), locale);

    /*
     * Hizmetler TEK bir sayfada anlatılıyor; ayrı detay rotası ÜRETİLMİYOR.
     * Bu yüzden sitemap'e yalnızca indeks girer — var olmayan bir adres
     * sitemap'e yazılmaz.
     */
    const localeServices = services.filter((e) => e.data.locale === locale && indexable(e));
    if (localeServices.length > 0) add(servicesIndexPath(locale), locale);

    const localeInsights = insights.filter((e) => e.data.locale === locale && indexable(e));
    if (localeInsights.length > 0) {
      add(insightsIndexPath(locale), locale);
      add(technologiesIndexPath(locale), locale);
    }
    for (const entry of localeInsights) {
      const lastmod = (entry.data.updatedAt ?? entry.data.publishedAt)?.toISOString().slice(0, 10);
      add(insightPath(locale, entry.data.slug), locale, lastmod);
    }

    // Seri ve etiket sayfaları yalnızca gerçekten içerik varsa.
    const series = new Set(localeInsights.map((entry) => entry.data.series));
    for (const slug of series) add(insightSeriesPath(locale, slug), locale);
    const tags = new Set(localeInsights.flatMap((entry) => entry.data.tags));
    for (const key of tags) add(insightTagPath(locale, key), locale);

    const localeProducts = products.filter((e) => e.data.locale === locale && indexable(e));
    if (localeProducts.length > 0) add(productsIndexPath(locale), locale);
    for (const entry of localeProducts) add(productPath(locale, entry.data.slug), locale);

    const aboutEntry = about.find((e) => e.data.locale === locale);
    if (aboutEntry !== undefined && indexable(aboutEntry)) add(aboutPath(locale), locale);

    // İletişim sayfasının kendi içerik kaydı yok; noindex olduğu için
    // indekslenebilir sayılmaz.
    void contactPath;

    // Taslak hukuki metin sitemap'e GİRMEZ.
    const legalEntry = legal.find((e) => e.data.locale === locale);
    if (legalEntry !== undefined && indexable(legalEntry)) add(legalPath(locale), locale);
  }

  return routes.sort((a, b) => a.path.localeCompare(b.path, "en"));
}
