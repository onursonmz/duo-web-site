import { z } from "astro:content";

/**
 * Ortak enumlar ve SEO alanları.
 *
 * Tüm enumlar KAPALIDIR: listede olmayan bir değer şema doğrulamasında hata
 * verir ve build'i kırar (`03_CONTENT_AND_ROUTE_MAP.md` §7).
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

export const localeEnum = z.enum(LOCALES);
export const statusEnum = z.enum(STATUSES);
export const verificationStatusEnum = z.enum(VERIFICATION_STATUSES);
export const logoPermissionEnum = z.enum(LOGO_PERMISSIONS);

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
