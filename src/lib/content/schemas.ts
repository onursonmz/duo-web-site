import { reference, z } from "astro:content";
import {
  localeEnum,
  localizedBase,
  logoPermissionEnum,
  seoSchema,
  slugSchema,
  statusEnum,
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
 */

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
    proofRefs: z.array(reference("proofs")).default([]),
    cta: z
      .object({
        /** Etiket locale dictionary'den gelir; burada yalnızca anahtar tutulur. */
        labelKey: z.string().min(1),
        href: z.string().min(1),
      })
      .strict(),
  })
  .strict();

export const technologySchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
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
    ]),
    /** false -> public listelerden düşer; kod değişikliği gerekmez. */
    active: z.boolean(),
    officialUrl: z.url().optional(),
    logoPath: z.string().optional(),
    logoPermission: logoPermissionEnum,
    decisionNeeded: z.boolean().default(false),
    note: z.string().optional(),
  })
  .strict();

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
