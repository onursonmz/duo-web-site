import { z } from "astro/zod";

/**
 * Ortak enumlar ve SEO alanları.
 *
 * Tüm enumlar KAPALIDIR: listede olmayan bir değer şema doğrulamasında hata
 * verir ve build'i kırar (`03_CONTENT_AND_ROUTE_MAP.md` §7).
 *
 * `z` doğrudan `astro/zod` üzerinden alınır; `astro:content` üzerinden yeniden
 * dışa aktarılan `z` deprecate edilmiştir. Koleksiyon API'leri (`reference`,
 * `defineCollection`) `astro:content` üzerinden kullanılmaya devam eder.
 */

export const LOCALES = ["tr", "en"] as const;
export const DEFAULT_LOCALE = "tr";
export type Locale = (typeof LOCALES)[number];

export const STATUSES = ["draft", "review", "published", "archived"] as const;
export type Status = (typeof STATUSES)[number];

export const VERIFICATION_STATUSES = ["pending", "verified", "rejected"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const LOGO_PERMISSIONS = ["unknown", "allowed", "denied"] as const;
export type LogoPermission = (typeof LOGO_PERMISSIONS)[number];

/**
 * Teknoloji yayın döngüsü. Boolean yerine kapalı bir enum kullanılır çünkü
 * S00 envanterinde üç ayrı durum vardır ve "karar verilmemiş" ile "kapsam dışı"
 * aynı şey değildir:
 *
 * - `active`   : iş sahibi onayladı, public çıktıda görünebilir
 * - `inactive` : kapsam dışı bırakıldı, public çıktıda görünmez
 * - `pending`  : karar bekliyor (S00'daki `active: unknown`), public çıktıda GÖRÜNMEZ
 *
 * Public seçici YALNIZCA `active` kayıtları gösterir (fail-closed).
 */
export const TECHNOLOGY_LIFECYCLES = ["active", "inactive", "pending"] as const;
export type TechnologyLifecycle = (typeof TECHNOLOGY_LIFECYCLES)[number];

/** Bilgi amaçlı; logo iznini ASLA ima etmez (bkz. S00-R2 A.4). */
export const LICENSE_MODELS = ["open-source", "duosis-own-product", "not-assessed"] as const;
export type LicenseModel = (typeof LICENSE_MODELS)[number];

/**
 * HİZMET ALANLARI — KAPALI KÜME (S10 §2).
 *
 * Aynı liste üç yerde iş görür ve TEK kaynaktır:
 * 1. `serviceSchema.translationKey` — beşten fazla/başka bir hizmet kaydı açılamaz,
 * 2. iletişim CTA'sının `?topic=` ALLOWLIST'i — serbest metin taşınamaz,
 * 3. TR/EN eşlemesi — her iki dildeki kayıt aynı anahtarla bağlanır.
 *
 * Sıra ANLATI SIRASIDIR: danışmanlık ile başlar, dış kaynak ile biter.
 * `serviceSchema.order` bu diziyle tutarlı olmak zorundadır (bkz. superRefine).
 */
export const SERVICE_TOPICS = [
  "consulting",
  "support",
  "training",
  "managed-services",
  "outsourcing",
] as const;
export type ServiceTopic = (typeof SERVICE_TOPICS)[number];
export const serviceTopicEnum = z.enum(SERVICE_TOPICS);

/**
 * TEKNOLOJİ YETENEK KATMANLARI (S10 §4).
 *
 * Teknoloji envanterindeki ham `group` değerleri ziyaretçiye gösterilmez;
 * yetenek katmanına eşlenir. Katman ÖNCE gelir, teknoloji adı sonra:
 * sayfa bir ürün kataloğu değil, bir yetenek atlasıdır.
 */
export const CAPABILITY_LAYERS = [
  "observability-apm",
  "configuration-asset-management",
  "itsm",
  "data-streaming-integration",
  "governance-enterprise-architecture",
  "aiops-event-lifecycle",
  "automation",
] as const;
export type CapabilityLayer = (typeof CAPABILITY_LAYERS)[number];

/**
 * İÇGÖRÜ SERİLERİ — KAPALI KÜME (S11 §11).
 *
 * Seri serbest metin DEĞİLDİR: her serinin iki dilde bir yolu ve bir etiketi
 * vardır (`@lib/content/series`). Kapalı küme olmasaydı bir yazım hatası
 * sessizce yeni bir seri rotası üretirdi.
 */
export const INSIGHT_SERIES = [
  "observability-radar",
  "data-and-ai",
  "architecture-notes",
  "automation-guides",
  "cyclops-log",
  "regional-technology",
] as const;
export type InsightSeries = (typeof INSIGHT_SERIES)[number];
export const insightSeriesEnum = z.enum(INSIGHT_SERIES);

/**
 * PROOF TÜRÜ (S10 §7).
 *
 * `proofs` koleksiyonu iki farklı şeyi taşıyor ve ikisi AYNI bölümde
 * gösterilemez:
 *
 * - `customer-reference` : müşteri referansı/vakası. Public görünürlüğü için
 *   doğrulama VE (logo gösterilecekse) yazılı izin gerekir.
 * - `internal-measurement`: kendi ölçümümüz (ör. S00'da ölçülen mevcut site
 *   ağırlığı). Teknik olarak doğrulanmıştır ama MÜŞTERİ BAŞARISI DEĞİLDİR;
 *   "referanslarımız" bölümünde gösterilmesi ziyaretçiyi yanıltır.
 *
 * Ayrım şema düzeyinde tutuluyor çünkü `verificationStatus` bu farkı
 * göremiyordu: iki kayıt da "verified" olabilir, ama yalnızca biri müşteri
 * kanıtıdır.
 */
export const PROOF_KINDS = ["customer-reference", "internal-measurement"] as const;
export type ProofKind = (typeof PROOF_KINDS)[number];
export const proofKindEnum = z.enum(PROOF_KINDS);

export const localeEnum = z.enum(LOCALES);
export const statusEnum = z.enum(STATUSES);
export const verificationStatusEnum = z.enum(VERIFICATION_STATUSES);
export const logoPermissionEnum = z.enum(LOGO_PERMISSIONS);
export const technologyLifecycleEnum = z.enum(TECHNOLOGY_LIFECYCLES);
export const licenseModelEnum = z.enum(LICENSE_MODELS);

/** ASCII slug: küçük harf, rakam ve tire. Türkçe karakter kabul edilmez. */
export const slugSchema = z
  .string()
  .min(1)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "slug yalnızca küçük ASCII harf, rakam ve tire içerebilir (Türkçe karakter yok)"
  );

/**
 * translationKey: bir kaydın diller arası kimliği. Dil değiştirici bu anahtarla
 * karşılığı bulur; locale'e göre DEĞİŞMEZ.
 */
export const translationKeySchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "translationKey ASCII kebab-case olmalıdır");

export const seoSchema = z
  .object({
    title: z.string().min(1).max(70),
    description: z.string().min(1).max(200),
    /**
     * Doğrulanmamış (taslak olgunluktaki) içerik arama motorlarında üretim
     * içeriği gibi değerlendirilmemelidir; bkz. `docs/CONTENT_MATURITY.md`.
     */
    noindex: z.boolean().default(false),
  })
  .strict();

// `z` bir değer olarak import edildiği için `z.infer<>` namespace'i çözülmüyor;
// tip doğrudan şemanın çıktısından türetiliyor.
export type Seo = ReturnType<typeof seoSchema.parse>;

/** Her yerelleştirilebilir kayıtta bulunan taban alanlar. */
export const localizedBase = {
  translationKey: translationKeySchema,
  locale: localeEnum,
  slug: slugSchema,
  status: statusEnum,
  title: z.string().min(1),
  seo: seoSchema,
};
