import type { Locale } from "@lib/content/schema";

/**
 * ETİKET MODELİ — KEY, ETİKET VE SLUG AYRI ALANLAR (S13).
 *
 * S11'de etiketler tek bir metin olarak tutuluyordu: kayıttaki slug hem URL
 * hem görünen etiket olarak kullanılıyordu. Sonuç, İngilizce rotalarda Türkçe
 * adresler oldu: `/en/insights/tag/veri-akisi/`, `/en/insights/tag/entegrasyon/`.
 *
 * Artık üç alan AYRIDIR:
 *   key   — dilden bağımsız, içerik kaydında saklanan kimlik
 *   slug  — locale'e göre URL parçası
 *   label — locale'e göre görünen metin
 *
 * Kayıt KAPALIDIR: burada olmayan bir etiket şemadan geçemez, dolayısıyla
 * bilinmeyen slug için rota da üretilmez ve 404 döner.
 */

export interface TagLocaleInfo {
  readonly slug: string;
  readonly label: string;
}

export interface TagDefinition {
  readonly key: string;
  readonly tr: TagLocaleInfo;
  readonly en: TagLocaleInfo;
}

export const TAGS = [
  {
    key: "observability",
    tr: { slug: "gozlemlenebilirlik", label: "Gözlemlenebilirlik" },
    en: { slug: "observability", label: "Observability" },
  },
  {
    key: "apm",
    tr: { slug: "apm", label: "APM" },
    en: { slug: "apm", label: "APM" },
  },
  {
    key: "aiops",
    tr: { slug: "aiops", label: "AIOps" },
    en: { slug: "aiops", label: "AIOps" },
  },
  {
    key: "operations",
    tr: { slug: "operasyon", label: "Operasyon" },
    en: { slug: "operations", label: "Operations" },
  },
  {
    key: "data-flow",
    tr: { slug: "veri-akisi", label: "Veri akışı" },
    en: { slug: "data-flow", label: "Data flow" },
  },
  {
    key: "integration",
    tr: { slug: "entegrasyon", label: "Entegrasyon" },
    en: { slug: "integration", label: "Integration" },
  },
  {
    key: "streaming",
    tr: { slug: "streaming", label: "Streaming" },
    en: { slug: "streaming", label: "Streaming" },
  },
  {
    key: "architecture",
    tr: { slug: "mimari", label: "Mimari" },
    en: { slug: "architecture", label: "Architecture" },
  },
  {
    key: "enterprise-architecture",
    tr: { slug: "kurumsal-mimari", label: "Kurumsal mimari" },
    en: { slug: "enterprise-architecture", label: "Enterprise architecture" },
  },
  {
    key: "governance",
    tr: { slug: "yonetisim", label: "Yönetişim" },
    en: { slug: "governance", label: "Governance" },
  },
  {
    key: "inventory",
    tr: { slug: "envanter", label: "Envanter" },
    en: { slug: "inventory", label: "Inventory" },
  },
  {
    key: "decision-management",
    tr: { slug: "karar-yonetimi", label: "Karar yönetimi" },
    en: { slug: "decision-management", label: "Decision management" },
  },
  {
    key: "alert-management",
    tr: { slug: "alarm-yonetimi", label: "Alarm yönetimi" },
    en: { slug: "alert-management", label: "Alert management" },
  },
  {
    key: "event-management",
    tr: { slug: "olay-yonetimi", label: "Olay yönetimi" },
    en: { slug: "event-management", label: "Event management" },
  },
] as const satisfies readonly TagDefinition[];

export type TagKey = (typeof TAGS)[number]["key"];

export const TAG_KEYS = TAGS.map((tag) => tag.key) as readonly TagKey[];

/** Zod `enum` en az bir eleman içeren tuple ister. */
export const TAG_KEYS_TUPLE = TAGS.map((tag) => tag.key) as unknown as [TagKey, ...TagKey[]];

const BY_KEY = new Map<string, TagDefinition>(TAGS.map((tag) => [tag.key, tag]));

export function isTagKey(value: unknown): value is TagKey {
  return typeof value === "string" && BY_KEY.has(value);
}

/** Locale'e göre URL parçası. */
export function tagSlug(locale: Locale, key: TagKey): string {
  return BY_KEY.get(key)?.[locale].slug ?? key;
}

/** Locale'e göre görünen etiket. */
export function tagLabel(locale: Locale, key: TagKey): string {
  return BY_KEY.get(key)?.[locale].label ?? key;
}

/**
 * Slug'dan key'e çevirir. BİLİNMEYEN slug `undefined` döner — çağıran taraf
 * 404 üretir, tahmin edilmiş bir eşleşme uydurulmaz.
 */
export function tagKeyFromSlug(locale: Locale, slug: string): TagKey | undefined {
  return TAGS.find((tag) => tag[locale].slug === slug)?.key;
}
