import type { Locale } from "@lib/content/schema";

/**
 * STRUCTURED DATA (S13).
 *
 * KURAL: JSON-LD sayfada GÖRÜNENDEN FAZLASINI iddia edemez.
 *
 * Bu yüzden aşağıdaki alanlar BİLİNÇLİ OLARAK YOKTUR:
 *   - `sameAs`      — doğrulanmış sosyal hesap yok; uydurma hesap yazılmaz
 *   - `aggregateRating`, `review` — müşteri değerlendirmesi yok
 *   - `numberOfEmployees`, müşteri sayısı, başarı metriği
 *   - `award`, partnerlik iddiası
 *   - `offers`, fiyat — fiyatlama yayınlanmıyor
 *   - `telephone`/`address` yalnızca sayfada GÖRÜNEN doğrulanmış değerlerdir
 *
 * Her blok `tests/unit/structured-data.test.ts` ile parse ve semantik
 * testinden geçer.
 */

/**
 * JSON-LD mutlak URL'leri için site kökeni.
 *
 * `Astro.site` üretim/önizleme yapılandırmasından gelir ve `astro.config.mjs`
 * içinde `resolveSiteUrl` ile doğrulanır (localhost canonical üretimde
 * derlemeyi kırar). Dev sunucusunda `Astro.site` tanımlıysa yine o kullanılır;
 * yoksa isteğin kökenine düşülür.
 */
export function ldOrigin(site: URL | undefined, url: URL): string {
  return (site ?? new URL(url.origin)).origin;
}

export interface OrganizationInput {
  readonly siteUrl: string;
  readonly name: string;
  readonly description: string;
  readonly logoUrl: string;
  /** Sayfada görünen doğrulanmış e-posta. */
  readonly email: string;
  /** Sayfada görünen doğrulanmış telefonlar. */
  readonly telephones: readonly string[];
}

export function organizationLd(input: OrganizationInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${input.siteUrl}/#organization`,
    name: input.name,
    url: `${input.siteUrl}/`,
    description: input.description,
    logo: input.logoUrl,
    // Yalnızca sayfada GÖRÜNEN iletişim bilgileri.
    email: input.email,
    telephone: [...input.telephones],
  };
}

export interface ServiceInput {
  readonly siteUrl: string;
  readonly path: string;
  readonly name: string;
  readonly description: string;
  readonly locale: Locale;
  /**
   * Aynı sayfada birden çok hizmet anlatılıyorsa `@id` ayrımı için slug.
   * Hizmetler TEK sayfada anlatılıyor; ayrı detay rotası yok.
   */
  readonly slug?: string;
}

export function serviceLd(input: ServiceInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${input.siteUrl}${input.path}#service${input.slug === undefined ? "" : `-${input.slug}`}`,
    name: input.name,
    description: input.description,
    url: `${input.siteUrl}${input.path}`,
    inLanguage: input.locale,
    provider: { "@id": `${input.siteUrl}/#organization` },
  };
}

export interface BreadcrumbItem {
  readonly name: string;
  /** Son öğe için `undefined` (mevcut sayfa). */
  readonly path?: string;
}

export function breadcrumbLd(
  siteUrl: string,
  items: readonly BreadcrumbItem[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path === undefined ? {} : { item: `${siteUrl}${item.path}` }),
    })),
  };
}

export interface BlogPostingInput {
  readonly siteUrl: string;
  readonly path: string;
  readonly headline: string;
  readonly description: string;
  readonly locale: Locale;
  readonly datePublished?: string;
  readonly dateModified?: string;
  readonly authorName: string;
  /**
   * Yazar bir EKİP/KURUM ise `Organization`, gerçek bir kişi ise `Person`.
   * Duosis içgörüleri ortak imzayla yayımlanıyor; varsayılan `Organization`.
   */
  readonly authorType?: "Organization" | "Person";
  /** Sayfada GÖRÜNEN seri etiketi. */
  readonly articleSection?: string;
  /** Sayfada GÖRÜNEN etiketler. */
  readonly keywords?: readonly string[];
}

export function blogPostingLd(input: BlogPostingInput): Record<string, unknown> {
  const url = `${input.siteUrl}${input.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: input.headline,
    description: input.description,
    url,
    inLanguage: input.locale,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": input.authorType ?? "Organization", name: input.authorName },
    publisher: { "@id": `${input.siteUrl}/#organization` },
    ...(input.datePublished === undefined ? {} : { datePublished: input.datePublished }),
    ...(input.dateModified === undefined ? {} : { dateModified: input.dateModified }),
    ...(input.articleSection === undefined ? {} : { articleSection: input.articleSection }),
    ...(input.keywords === undefined || input.keywords.length === 0
      ? {}
      : { keywords: input.keywords.join(", ") }),
  };
}

/**
 * CyclOps için `SoftwareApplication`.
 *
 * UYGUNLUK DEĞERLENDİRMESİ: sayfa gerçek ürün ekranları, tanımlı bir işlev
 * (olay yaşam döngüsü yönetimi) ve üretici bilgisi taşıyor. Bunlar
 * `SoftwareApplication` için yeterlidir.
 *
 * `offers`, sürüm numarası, işletim sistemi ve `aggregateRating` alanları
 * YAZILMAZ: fiyatlama yayınlanmıyor, sürüm bilgisi kapalı ve müşteri
 * değerlendirmesi yok.
 */
export interface SoftwareApplicationInput {
  readonly siteUrl: string;
  readonly path: string;
  readonly name: string;
  readonly description: string;
  readonly locale: Locale;
}

export function softwareApplicationLd(input: SoftwareApplicationInput): Record<string, unknown> {
  const url = `${input.siteUrl}${input.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${url}#software`,
    name: input.name,
    description: input.description,
    url,
    inLanguage: input.locale,
    applicationCategory: "BusinessApplication",
    publisher: { "@id": `${input.siteUrl}/#organization` },
  };
}

/** JSON-LD bloklarında ASLA bulunmaması gereken alanlar. */
export const FORBIDDEN_LD_KEYS = [
  "sameAs",
  "aggregateRating",
  "review",
  "award",
  "numberOfEmployees",
  "offers",
  "price",
  "priceRange",
  "softwareVersion",
  "memberOf",
  "brand",
] as const;
