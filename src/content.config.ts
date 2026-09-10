import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import {
  aboutSchema,
  authorSchema,
  homepageSchema,
  insightSchema,
  legalSchema,
  milestoneSchema,
  productSchema,
  proofSchema,
  regionSchema,
  serviceSchema,
  solutionSchema,
  technologySchema,
} from "@lib/content/schemas";

/**
 * Koleksiyon tanımları. Şemalar `@lib/content/schemas` içinde tek yerde
 * tutulur; testler aynı şema nesnelerini doğrular.
 */

/**
 * Deterministik kayıt kimliği: dosya yolunun uzantısız hali.
 * Örn. `tr/operasyonel-gorunurluk.md` -> `tr/operasyonel-gorunurluk`.
 * Astro'nun varsayılan slugify davranışına bırakılmaz; referanslar bu kimliği kullanır.
 */
const pathId = ({ entry }: { entry: string }) => entry.replace(/\.md$/, "");

const md = (base: string) => glob({ base, pattern: "**/*.md", generateId: pathId });

export const collections = {
  solutions: defineCollection({
    loader: md("./src/content/solutions"),
    schema: solutionSchema,
  }),
  technologies: defineCollection({
    // TEK veri kaynağı: teknoloji envanteri sayfalara/bileşenlere gömülmez.
    loader: file("./src/content/technologies/technologies.json"),
    schema: technologySchema,
  }),
  services: defineCollection({
    loader: md("./src/content/services"),
    schema: serviceSchema,
  }),
  milestones: defineCollection({
    loader: md("./src/content/milestones"),
    schema: milestoneSchema,
  }),
  proofs: defineCollection({
    loader: md("./src/content/proofs"),
    schema: proofSchema,
  }),
  authors: defineCollection({
    loader: md("./src/content/authors"),
    schema: authorSchema,
  }),
  insights: defineCollection({
    loader: md("./src/content/insights"),
    schema: insightSchema,
  }),
  homepage: defineCollection({
    // Ana sayfa metni TEK veri kaynağıdır; bileşenlere gömülmez.
    loader: file("./src/content/homepage/homepage.json"),
    schema: homepageSchema,
  }),
  about: defineCollection({
    // Hakkımızda metni TEK veri kaynağıdır; şablona gömülmez.
    loader: file("./src/content/about/about.json"),
    schema: aboutSchema,
  }),
  legal: defineCollection({
    // Hukuki metinler: taslak durumu şemada kapalı bir kümedir.
    loader: file("./src/content/legal/legal.json"),
    schema: legalSchema,
  }),
  products: defineCollection({
    // Ürün sayfası metni TEK veri kaynağıdır; şablona gömülmez.
    loader: file("./src/content/products/products.json"),
    schema: productSchema,
  }),
  regions: defineCollection({
    // Veri modeli hazır; public görünürlük doğrulama statüsünden geçer.
    loader: file("./src/content/regions/regions.json"),
    schema: regionSchema,
  }),
};
