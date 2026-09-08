import { getCollection } from "astro:content";

/**
 * MERKEZİ İÇERİK GRAFİĞİ DOĞRULAYICISI.
 *
 * Astro'nun `reference()` doğrulaması bozuk bir referansı yalnızca ERROR olarak
 * LOGLAR; `astro sync` sıfır exit code ile döner ve build sessizce kırık bağla
 * devam eder. Bu doğrulayıcı hatayı FIRLATIR, böylece build durur.
 *
 * Kapsam: şemadaki TÜM referans alanları. Doğrulama, bir sayfanın o koleksiyonu
 * sorgulayıp sorgulamadığından BAĞIMSIZDIR — `src/middleware.ts` her sayfa
 * üretiminde bu fonksiyonu çağırır, dolayısıyla tek bir sayfa bile üretilse
 * grafiğin tamamı denetlenir.
 *
 * Yeni bir `reference()` alanı eklendiğinde buraya da eklenmelidir;
 * `tests/unit/graph.test.ts` şema ile bu liste arasındaki farkı yakalar.
 */

/** Şemada tanımlı her referans alanı: kaynak koleksiyon -> alan -> hedef koleksiyon. */
export const REFERENCE_FIELDS = [
  { from: "solutions", field: "technologyRefs", to: "technologies", kind: "many" },
  { from: "solutions", field: "proofRefs", to: "proofs", kind: "many" },
  { from: "milestones", field: "solutionRefs", to: "solutions", kind: "many" },
  { from: "insights", field: "authorRef", to: "authors", kind: "one" },
  { from: "insights", field: "relatedSolutionRefs", to: "solutions", kind: "many" },
] as const satisfies readonly {
  from: string;
  field: string;
  to: string;
  kind: "one" | "many";
}[];

type CollectionName = (typeof REFERENCE_FIELDS)[number]["from" | "to"];

type Ref = { id: string };

function refIds(value: unknown, kind: "one" | "many"): string[] {
  if (value === undefined || value === null) return [];
  if (kind === "one") {
    const ref = value as Ref;
    return typeof ref.id === "string" ? [ref.id] : [];
  }
  if (!Array.isArray(value)) return [];
  return value.filter((r): r is Ref => typeof (r as Ref)?.id === "string").map((r) => r.id);
}

/**
 * Tüm referans alanlarını doğrular. Bozuk bir referans bulursa `Error` fırlatır.
 * Aynı build içinde birden fazla kez çağrılabilir; sonuç bellekte tutulur.
 */
export async function assertContentGraph(): Promise<void> {
  // Doğrulanacak koleksiyonların benzersiz listesi.
  const names = new Set<string>();
  for (const r of REFERENCE_FIELDS) {
    names.add(r.from);
    names.add(r.to);
  }

  const entriesByCollection = new Map<string, { id: string; data: Record<string, unknown> }[]>();
  for (const name of names) {
    const entries = await getCollection(name as CollectionName);
    entriesByCollection.set(
      name,
      entries.map((e) => ({ id: e.id, data: e.data as Record<string, unknown> }))
    );
  }

  const idsByCollection = new Map<string, Set<string>>();
  for (const [name, entries] of entriesByCollection) {
    idsByCollection.set(name, new Set(entries.map((e) => e.id)));
  }

  const problems: string[] = [];

  for (const rule of REFERENCE_FIELDS) {
    const sources = entriesByCollection.get(rule.from) ?? [];
    const targetIds = idsByCollection.get(rule.to) ?? new Set<string>();

    for (const entry of sources) {
      for (const id of refIds(entry.data[rule.field], rule.kind)) {
        if (!targetIds.has(id)) {
          problems.push(
            `${rule.from}/"${entry.id}" -> ${rule.field}: ${rule.to}/"${id}" bulunamadı`
          );
        }
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `Bozuk içerik referansı (${problems.length} adet):\n  - ${problems.join("\n  - ")}`
    );
  }
}

let cached: Promise<void> | undefined;

/** Build başına bir kez çalışır; sonraki çağrılar aynı sonucu paylaşır. */
export function assertContentGraphOnce(): Promise<void> {
  cached ??= assertContentGraph();
  return cached;
}
