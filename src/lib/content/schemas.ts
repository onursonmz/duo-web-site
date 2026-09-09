import { reference } from "astro:content";
import { z } from "astro/zod";
import { CTA_LABEL_KEYS } from "@lib/i18n/dictionary";
import {
  licenseModelEnum,
  localeEnum,
  localizedBase,
  logoPermissionEnum,
  seoSchema,
  slugSchema,
  statusEnum,
  technologyLifecycleEnum,
  translationKeySchema,
  verificationStatusEnum,
} from "@lib/content/schema";

/**
 * Koleksiyon şemaları TEK yerde tanımlanır ve hem `src/content.config.ts`
 * hem de testler tarafından kullanılır. Böylece testler gerçek şemayı
 * doğrular; kopya bir şema üzerinden test edilmez.
 *
 * Tümü `.strict()`: frontmatter'da tanımsız bir alan varsa doğrulama başarısız
 * olur ve build kırılır.
 *
 * MİMARİ KARAR — tek yönlü referans:
 * Çözüm → teknoloji ilişkisi YALNIZCA `Solution.technologyRefs` üzerinde tutulur.
 * `Technology` üzerinde ters bir `solutionRefs` alanı BULUNMAZ; aynı ilişkinin iki
 * yerde tutulması senkronizasyon hatası üretir. Teknoloji kaydındaki `solutionArea`
 * alanı S00 envanterinden gelen bilgilendirici bir etikettir, ilişki kaynağı değildir;
 * sayfa üretiminde kullanılmaz.
 */

/** Sözleşmedeki AI anlatısı: algıla → anla → harekete geç. */
const aiRoleSchema = z
  .object({
    detect: z.string().min(1),
    understand: z.string().min(1),
    act: z.string().min(1),
  })
  .strict();

/** Sözleşmedeki "örnek senaryo / çalışma akışı" bölümü. */
const scenarioSchema = z
  .object({
    title: z.string().min(1),
    context: z.string().min(1),
    flow: z.array(z.string().min(1)).min(1),
    result: z.string().min(1),
  })
  .strict();

export const solutionSchema = z
  .object({
    ...localizedBase,
    /** ADR-009 taksonomisindeki sıra (1-8). */
    order: z.number().int().min(1).max(8),
    category: z.enum(["core", "industry"]),
    featured: z.boolean().default(false),
    eyebrow: z.string().optional(),
    summary: z.string().min(1),
    problem: z.string().min(1),
    approach: z.string().min(1),
    benefits: z.array(z.string().min(1)).min(1),
    capabilities: z.array(z.string().min(1)).default([]),
    technologyRefs: z.array(reference("technologies")).default([]),
    /**
     * Sözleşmedeki `caseStudyRefs` ile aynı ilişkidir. Tek bir `proofs`
     * koleksiyonu kullanıyoruz: hem anonim/isimli referans (testimonial) hem de
     * metrikli vaka (case study) aynı şemayla temsil ediliyor; ikisi de aynı
     * doğrulama ve logo izni kurallarına tabi. Ayrım kayıt içinde `metrics` ve
     * `quote` alanlarının doluluğuyla yapılır. Bu, sözleşmedeki adın
     * genişletilmiş (superset) karşılığıdır.
     */
    proofRefs: z.array(reference("proofs")).default([]),
    /** Yalnızca DOĞRULANMIŞ AI yeteneği varsa doldurulur; uydurulmaz. */
    aiRole: aiRoleSchema.optional(),
    /** Yalnızca doğrulanmış bir akış varsa doldurulur. */
    scenario: scenarioSchema.optional(),
    cta: z
      .object({
        /** Kapalı küme: locale sözlüğünde CTA olarak tanımlı anahtarlar. */
        labelKey: z.enum(CTA_LABEL_KEYS),
        href: z.string().min(1),
      })
      .strict(),
  })
  .strict();

export const technologySchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    currentSiteLabel: z.string().optional(),
    group: z.enum([
      "observability",
      "apm",
      "cmdb",
      "itam",
      "itsm",
      "data",
      "enterprise-architecture",
      "automation",
      "aiops",
      "security",
    ]),
    /** Kapalı yayın döngüsü; public seçici YALNIZCA "active" gösterir. */
    lifecycle: technologyLifecycleEnum,
    decisionNeeded: z.boolean(),
    logoPermission: logoPermissionEnum,
    /** Bilgi amaçlı; logo iznini ima ETMEZ. */
    licenseModel: licenseModelEnum,
    /** S00 envanterindeki kaynak izi (hangi belgede bulundu). */
    source: z.string().min(1),
    /** Bilgilendirici ADR-009 alan etiketi; ilişki kaynağı DEĞİL (yukarıdaki nota bakın). */
    solutionArea: translationKeySchema.nullable(),
    officialUrl: z.url().optional(),
    logoPath: z.string().optional(),
    note: z.string().optional(),
  })
  .strict()
  /**
   * ÇELİŞKİ REDDİ (S03 takip invariantı).
   *
   * Bir kayıt aynı anda "yayına hazır" (`lifecycle: active`) ve "karar bekliyor"
   * (`decisionNeeded: true`) olamaz. Bu kombinasyon veri düzeyinde bir hatadır:
   * public seçici zaten bunu gizler, fakat sessizce gizlemek yerine build'i
   * kırmak daha güvenlidir — aksi halde onaylandığı sanılan bir kayıt
   * fark edilmeden görünmez kalır.
   */
  .superRefine((value, ctx) => {
    if (value.lifecycle === "active" && value.decisionNeeded) {
      ctx.addIssue({
        code: "custom",
        path: ["decisionNeeded"],
        message:
          `"${value.id}": lifecycle "active" iken decisionNeeded true olamaz. ` +
          "Kayıt ya iş sahibi kararı beklemektedir (lifecycle: pending) " +
          "ya da karar verilmiştir (decisionNeeded: false).",
      });
    }
  });

export const serviceSchema = z
  .object({
    ...localizedBase,
    order: z.number().int().min(1),
    summary: z.string().min(1),
  })
  .strict();

export const milestoneSchema = z
  .object({
    translationKey: translationKeySchema,
    locale: localeEnum,
    status: statusEnum,
    year: z.number().int().min(1990).max(2100),
    datePrecision: z.enum(["year", "month", "day"]),
    title: z.string().min(1),
    summary: z.string().min(1),
    solutionRefs: z.array(reference("solutions")).default([]),
    verificationStatus: verificationStatusEnum,
  })
  .strict();

export const proofSchema = z
  .object({
    translationKey: translationKeySchema,
    locale: localeEnum,
    status: statusEnum,
    /** Kurum adı yalnızca izin verildiyse doldurulur. */
    organization: z.string().optional(),
    anonymousSector: z.string().optional(),
    quote: z.string().optional(),
    personName: z.string().optional(),
    role: z.string().optional(),
    logoPath: z.string().optional(),
    logoPermission: logoPermissionEnum,
    metrics: z
      .array(
        z
          .object({
            label: z.string().min(1),
            before: z.string().optional(),
            after: z.string().optional(),
            value: z.string().optional(),
          })
          .strict()
      )
      .default([]),
    verificationStatus: verificationStatusEnum,
  })
  .strict();

export const authorSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    role: z.string().min(1),
  })
  .strict();

export const insightSchema = z
  .object({
    translationKey: translationKeySchema,
    locale: localeEnum,
    slug: slugSchema,
    status: statusEnum,
    title: z.string().min(1),
    excerpt: z.string().min(1),
    series: z.string().min(1),
    tags: z.array(z.string().min(1)).default([]),
    authorRef: reference("authors"),
    relatedSolutionRefs: z.array(reference("solutions")).default([]),
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    seo: seoSchema,
  })
  .strict();

/* ------------------------------------------------------------------ S05 */

/** Bir bölümün üst metni. Tüm ana sayfa metni buradan gelir; koda gömülmez. */
const sectionCopySchema = z
  .object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    lead: z.string().min(1),
  })
  .strict();

const homeCtaSchema = z
  .object({
    label: z.string().min(1),
    /** Yalnızca MEVCUT rota veya aynı sayfadaki bir çapa. */
    href: z.string().min(1),
  })
  .strict();

const namedPointSchema = z
  .object({
    title: z.string().min(1),
    body: z.string().min(1),
  })
  .strict();

/**
 * ANA SAYFA İÇERİĞİ.
 *
 * İÇERİK GÜVENLİĞİ: bu şemada müşteri sayısı, partner sayısı, bölge kapsamı
 * veya başarı metriği için ALAN YOKTUR. Doğrulanmamış bir sayı buraya
 * yazılamaz; yazılırsa `.strict()` build'i kırar.
 *
 * Bölümlerin gerçek verisi (çözümler, içgörüler, bölgeler) koleksiyonlardan
 * gelir; burada yalnızca anlatı metni tutulur.
 */
export const homepageSchema = z
  .object({
    id: z.string().min(1),
    locale: localeEnum,
    status: statusEnum,
    hero: z
      .object({
        eyebrow: z.string().min(1),
        title: z.string().min(1),
        lead: z.string().min(1),
        primaryCta: homeCtaSchema,
        secondaryCta: homeCtaSchema,
      })
      .strict(),
    /**
     * İMZA HERO AŞAMALARI (S06) — TAM BEŞ.
     * kaynak → sinyal → bağlam → karar → aksiyon. Sıra ve anahtar kümesi
     * kapalıdır; anlatı modeli veriden kayamaz.
     */
    heroStages: z
      .array(
        z
          .object({
            key: z.enum(["source", "signal", "context", "decide", "act"]),
            title: z.string().min(1),
            body: z.string().min(1),
          })
          .strict()
      )
      .length(5),
    /** Güven bölümü: yalnızca NİTEL anlatı; sayı alanı yoktur. */
    trust: sectionCopySchema.extend({ points: z.array(namedPointSchema).min(1) }).strict(),
    solutions: sectionCopySchema,
    /**
     * CyclOps teaser. Sürüm, müşteri kullanımı, SLA, başarı oranı veya
     * ölçülmüş sonuç iddiası için alan YOKTUR — şema bunları kabul etmez.
     * İç süreç/olgunluk açıklaması da taşımaz: ziyaretçiye yayın süreci
     * anlatılmaz (S04+S05 takip kararı).
     */
    cyclops: sectionCopySchema.extend({ points: z.array(z.string().min(1)).min(1) }).strict(),
    /** Algıla → Anla → Harekete geç. Tam üç adım. */
    intelligence: sectionCopySchema
      .extend({
        steps: z
          .array(
            z
              .object({
                stage: z.enum(["detect", "understand", "act"]),
                title: z.string().min(1),
                body: z.string().min(1),
              })
              .strict()
          )
          .length(3),
      })
      .strict(),
    /** Doğrulanmış müşteri referansı yokken gösterilen içerik-duyarlı alternatif. */
    method: sectionCopySchema.extend({ steps: z.array(namedPointSchema).min(1) }).strict(),
    decade: sectionCopySchema,
    regional: sectionCopySchema,
    /** Teknoloji ekosistemi: VENDOR ADI değil, yetenek katmanları. */
    technology: sectionCopySchema.extend({ layers: z.array(namedPointSchema).min(1) }).strict(),
    insights: sectionCopySchema,
    roadmap: sectionCopySchema
      .extend({ primaryCta: homeCtaSchema, secondaryCta: homeCtaSchema })
      .strict(),
    seo: seoSchema,
  })
  .strict();

/**
 * BÖLGESEL ÇALIŞMA ALANI.
 *
 * Veri modeli hazırdır fakat public görünürlük YALNIZCA doğrulama
 * statüsünden geçer: `verificationStatus !== "verified"` olan bölge public
 * çıktıya girmez (`selectors.getRegions`).
 */
export const regionSchema = z
  .object({
    id: z.string().min(1),
    locale: localeEnum,
    name: z.string().min(1),
    summary: z.string().min(1),
    verificationStatus: verificationStatusEnum,
    /** Hangi kaynakta geçtiği; doğrulama izini kaybetmemek için zorunlu. */
    source: z.string().min(1),
  })
  .strict();

/* ------------------------------------------------------------------ S08 */

/**
 * ÜRÜN SAYFASI — CyclOps.
 *
 * İÇERİK GÜVENLİĞİ: bu şemada müşteri sayısı, SLA, MTTR, sürüm numarası,
 * fiyat, node sayısı veya pazar istatistiği için ALAN YOKTUR. Sunumun
 * pazarlama cümleleri ("every event", "fully autonomous", "self-healing")
 * veriye yazılamaz; yazılırsa `.strict()` build'i kırar.
 *
 * Ürün ekranı listesi KAPALI bir anahtar kümesidir: şablon yalnızca gerçekten
 * incelenmiş ve redakte edilmiş asset'leri render eder, serbest dosya yolu
 * kabul etmez.
 */
const productScreenSchema = z
  .object({
    key: z.enum(["event-browser", "matchers", "dashboard"]),
    caption: z.string().min(1),
    /** Görselin erişilebilir karşılığı; boş bırakılamaz. */
    alt: z.string().min(1),
  })
  .strict();

const productFlowStepSchema = z
  .object({
    key: z.enum(["signal", "context", "correlate", "decide", "act"]),
    title: z.string().min(1),
    body: z.string().min(1),
  })
  .strict();

export const productSchema = z
  .object({
    id: z.string().min(1),
    locale: localeEnum,
    slug: slugSchema,
    status: statusEnum,
    /** Ürünün sahibi: yalnızca Duosis'in kendi ürünü bu sayfada anlatılır. */
    ownership: z.literal("duosis-own-product"),
    name: z.string().min(1),
    eyebrow: z.string().min(1),
    /** Tek cümlelik değer önerisi. */
    valueProposition: z.string().min(1),
    /** İzleme araçlarının yerine geçmediğini söyleyen konumlandırma cümlesi. */
    positioning: z.string().min(1),
    problem: z.object({ title: z.string().min(1), body: z.string().min(1) }).strict(),
    /** Signal → Context → Correlate → Decide → Act: TAM BEŞ, sıra kapalı. */
    flowTitle: z.string().min(1),
    flow: z.array(productFlowStepSchema).length(5),
    scenario: z
      .object({
        title: z.string().min(1),
        beforeTitle: z.string().min(1),
        before: z.array(z.string().min(1)).min(2),
        afterTitle: z.string().min(1),
        after: z.array(z.string().min(1)).min(2),
      })
      .strict(),
    galleryTitle: z.string().min(1),
    /** Her görselin "gerçek ürün ekranı" olduğu ziyaretçiye açıkça söylenir. */
    galleryNote: z.string().min(1),
    gallery: z.array(productScreenSchema).min(3),
    approval: z
      .object({
        title: z.string().min(1),
        body: z.string().min(1),
        boundaries: z.array(z.string().min(1)).min(2),
      })
      .strict(),
    integrationsTitle: z.string().min(1),
    integrationsNote: z.string().min(1),
    /** Yalnızca envanterdeki kayıtlar; görünürlük seçiciden geçer. */
    technologyRefs: z.array(reference("technologies")).default([]),
    relatedSolutionRefs: z.array(reference("solutions")).default([]),
    cta: z
      .object({
        title: z.string().min(1),
        body: z.string().min(1),
        labelKey: z.string().min(1),
        /** CTA konusu KAPALI ürün allowlist'inden gelir. */
        topic: z.enum(["cyclops"]),
      })
      .strict(),
    seo: seoSchema,
  })
  .strict();
