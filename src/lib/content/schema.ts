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
