import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import {
  authorSchema,
  insightSchema,
  milestoneSchema,
  proofSchema,
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
};
