import type { Locale } from "@lib/content/schema";
import type { TranslationKey } from "@lib/i18n/dictionary";
import { homePath, solutionsIndexPath } from "@lib/i18n/routes";

/**
 * NAVİGASYON YAPILANDIRMASI — TEK KAYNAK.
 *
 * Header, mobil menü ve footer aynı listeden beslenir; hiçbir bileşen kendi
 * menü dizisini yazmaz.
 *
 * FAIL-CLOSED KURAL: yalnızca `status: "active"` girdiler RENDER EDİLİR.
 * `status: "planned"` girdiler gelecekteki sprintleri belgeler ama çıktıya
 * girmez — böylece henüz var olmayan `/iletisim/`, `/hakkimizda/`, `/cyclops/`
 * gibi adreslere kırık veya placeholder link üretilmez.
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
 * Ana menü. Sıra `03_CONTENT_AND_ROUTE_MAP.md` §1 ile aynıdır; henüz rotası
 * olmayanlar `planned` olarak durur.
 */
export const PRIMARY_NAV: readonly NavItem[] = [
  {
    labelKey: "nav.solutions",
    href: (locale) => solutionsIndexPath(locale),
    status: "active",
    panel: "solutions",
  },
  // --- Aşağıdakiler HENÜZ RENDER EDİLMEZ: rotaları yok. ---
  { labelKey: "nav.insights", href: () => null, status: "planned", plannedIn: "S05" },
  { labelKey: "nav.cyclops", href: () => null, status: "planned", plannedIn: "S08" },
  { labelKey: "nav.services", href: () => null, status: "planned", plannedIn: "S09" },
  { labelKey: "nav.about", href: () => null, status: "planned", plannedIn: "S10" },
  { labelKey: "nav.contact", href: () => null, status: "planned", plannedIn: "S12" },
] as const;

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
