import type { Locale } from "@lib/content/schema";
import type { TranslationKey } from "@lib/i18n/dictionary";
import {
  aboutPath,
  contactPath,
  productsIndexPath,
  homePath,
  insightsIndexPath,
  servicesIndexPath,
  solutionsIndexPath,
  technologiesIndexPath,
} from "@lib/i18n/routes";

/**
 * NAVİGASYON YAPILANDIRMASI — TEK KAYNAK.
 *
 * Header, mobil menü ve footer aynı listeden beslenir; hiçbir bileşen kendi
 * menü dizisini yazmaz.
 *
 * FAIL-CLOSED KURAL: yalnızca `status: "active"` girdiler RENDER EDİLİR.
 * `status: "planned"` girdiler gelecekteki sprintleri belgeler ama çıktıya
 * girmez — böylece henüz var olmayan adreslere kırık veya
 * placeholder link üretilmez.
 * `tests/unit/navigation.test.ts` bunu denetler.
 *
 * Rota haritası: `03_CONTENT_AND_ROUTE_MAP.md` §1 — en fazla ALTI ana giriş.
 */

export type NavStatus = "active" | "planned";

export interface NavItem {
  /** Sözlük anahtarı; etiket metni bileşene gömülmez. */
  readonly labelKey: TranslationKey;
  /** Locale'e göre yol üretir. `planned` girdilerde `null` döner. */
  readonly href: (locale: Locale) => string | null;
  readonly status: NavStatus;
  /** Girdinin hangi sprintte açılacağı — yalnızca belgeleme amaçlı. */
  readonly plannedIn?: string;
  /** Bu girdi bir mega menü paneli açıyorsa panelin türü. */
  readonly panel?: "solutions";
}

/**
 * Ana menü. Sıra `03_CONTENT_AND_ROUTE_MAP.md` §1 ile aynıdır.
 *
 * S14 GÜNCELLEMESİ: ikinci girdi artık tek bir ürün (CyclOps) değil, ürün
 * AİLESİ. Sıra — Çözümler, Ürünler, Hizmetler, İçgörüler, Hakkımızda,
 * İletişim. Tek bir ürünü ana menüde tutmak, dört ürün olduğunda hangisinin
 * neden seçildiğini açıklanamaz hâle getiriyordu.
 * `MAX_PRIMARY_ITEMS` sınırı hâlâ tam dolu; girdi sayısı değişmedi.
 *
 * TEKNOLOJİ ATLASI BURAYA EKLENMEZ: yedinci ana giriş üretmek sözleşmeyi
 * bozardı. Atlas, çözüm ekosisteminin alt görünümü olarak `SECONDARY_NAV`
 * üzerinden mega menüde, mobil alt listede ve footer'da yer alır.
 */
export const PRIMARY_NAV: readonly NavItem[] = [
  {
    labelKey: "nav.solutions",
    href: (locale) => solutionsIndexPath(locale),
    status: "active",
    panel: "solutions",
  },
  {
    labelKey: "nav.products",
    href: (locale) => productsIndexPath(locale),
    status: "active",
  },
  {
    labelKey: "nav.services",
    href: (locale) => servicesIndexPath(locale),
    status: "active",
  },
  {
    labelKey: "nav.insights",
    href: (locale) => insightsIndexPath(locale),
    status: "active",
  },
  {
    labelKey: "nav.about",
    href: (locale) => aboutPath(locale),
    status: "active",
  },
  {
    labelKey: "nav.contact",
    href: (locale) => contactPath(locale),
    status: "active",
  },
] as const;

/**
 * İKİNCİL GEZİNME — ANA MENÜDE DEĞİL.
 *
 * Teknoloji atlası bilinçli olarak YEDİNCİ ANA GİRDİ YAPILMADI: ana menü
 * sözleşme gereği en fazla altı girdi taşır ve teknoloji, çözüm ekosisteminin
 * bir alt görünümüdür — kendi başına bir üst seviye hedef değil. Atlasa çözüm
 * mega menüsünden, hizmetler sayfasından ve footer'dan ulaşılır.
 */
export const SECONDARY_NAV: readonly NavItem[] = [
  {
    labelKey: "nav.technologies",
    href: (locale) => technologiesIndexPath(locale),
    status: "active",
  },
] as const;

/** İkincil gezinme girdileri; ana menü ile AYNI fail-closed kuralına tabidir. */
export function secondaryNavItems(locale: Locale): { item: NavItem; href: string }[] {
  const out: { item: NavItem; href: string }[] = [];
  for (const item of SECONDARY_NAV) {
    if (item.status !== "active") continue;
    const href = item.href(locale);
    if (href === null || href === "") continue;
    out.push({ item, href });
  }
  return out;
}

/** Sözleşme sınırı: en fazla altı ana giriş. */
export const MAX_PRIMARY_ITEMS = 6;

/** Render edilecek girdiler. Yol üretemeyen bir girdi de elenir (çift güvence). */
export function activeNavItems(locale: Locale): { item: NavItem; href: string }[] {
  const out: { item: NavItem; href: string }[] = [];
  for (const item of PRIMARY_NAV) {
    if (item.status !== "active") continue;
    const href = item.href(locale);
    if (href === null || href === "") continue;
    out.push({ item, href });
  }
  return out;
}

/**
 * Bir pathname'in verilen navigasyon girdisine karşılık gelip gelmediği.
 * `aria-current="page"` yalnızca TAM eşleşmede verilir; alt sayfalarda
 * `aria-current` kullanılmaz (ör. çözüm detayında "Çözümler" işaretlenmez),
 * bunun yerine breadcrumb bağlamı gösterir.
 */
export function isCurrentPage(pathname: string, href: string): boolean {
  const normalize = (p: string) => (p.endsWith("/") ? p : `${p}/`);
  return normalize(pathname) === normalize(href);
}

/** Bir navigasyon girdisinin bulunduğu bölümün içinde olup olmadığımız. */
export function isWithinSection(pathname: string, href: string): boolean {
  if (href === "/" || href === "/en/") return false;
  return normalizePath(pathname).startsWith(normalizePath(href));
}

function normalizePath(p: string): string {
  return p.endsWith("/") ? p : `${p}/`;
}

/** Footer'daki marka bağlantısı. */
export function brandHref(locale: Locale): string {
  return homePath(locale);
}
