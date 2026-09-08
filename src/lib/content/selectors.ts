import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "@lib/content/schema";

/**
 * MERKEZİ SEÇİCİ KATMANI.
 *
 * Public ve preview filtreleri YALNIZCA buradan geçer. Sayfalar kendi filtre
 * mantığını yazmaz; `mode` parametresiyle bu katmanı çağırır.
 *
 * Public kurallar (`03_CONTENT_AND_ROUTE_MAP.md` §7):
 * - `status !== "published"` kayıt görünmez
 * - `verificationStatus !== "verified"` iddia/metrik görünmez
 * - `logoPermission !== "allowed"` logo görünmez
 * - `active !== true` teknoloji görünmez
 */

export type ViewMode = "public" | "preview";

/** Üretim sayfaları bunu AÇIKÇA kullanır. */
export const PUBLIC: ViewMode = "public";
export const PREVIEW: ViewMode = "preview";

type Solution = CollectionEntry<"solutions">;
type Technology = CollectionEntry<"technologies">;
type Proof = CollectionEntry<"proofs">;
type Milestone = CollectionEntry<"milestones">;

// ---------------------------------------------------------------- yüklem katmanı

export function isPublishedStatus(status: string, mode: ViewMode): boolean {
  return mode === "preview" ? status !== "archived" : status === "published";
}

export function isVerifiedClaim(verificationStatus: string, mode: ViewMode): boolean {
  return mode === "preview" ? verificationStatus !== "rejected" : verificationStatus === "verified";
}

/** Logo yalnızca yazılı izin varsa gösterilir. Preview modda da izinsiz logo gösterilmez. */
export function canShowLogo(logoPermission: string): boolean {
  return logoPermission === "allowed";
}

export function isActiveTechnology(active: boolean, mode: ViewMode): boolean {
  return mode === "preview" ? true : active === true;
}

// ---------------------------------------------------------------- doğrulama

/**
 * Aynı `translationKey + locale` çifti birden fazla kayıtta olamaz ve aynı
 * locale içinde slug tekrar edemez. Astro şeması bunu göremez (dosya bazlı
 * doğrular), bu yüzden koleksiyon düzeyinde burada denetlenir.
 *
 * Sayfalar bu katmanı kullandığı için ihlal build'i kırar.
 */
export function assertUniqueTranslations(
  entries: readonly { data: { translationKey: string; locale: string; slug?: string } }[],
  collectionName: string
): void {
  const seenKey = new Map<string, number>();
  const seenSlug = new Map<string, number>();

  for (const entry of entries) {
    const { translationKey, locale, slug } = entry.data;

    const keyId = `${translationKey}::${locale}`;
    const keyCount = (seenKey.get(keyId) ?? 0) + 1;
    seenKey.set(keyId, keyCount);
    if (keyCount > 1) {
      throw new Error(
        `[${collectionName}] Yinelenen translationKey + locale: "${translationKey}" (${locale}). ` +
          `Her kayıt bir dilde yalnızca bir kez tanımlanabilir.`
      );
    }

    if (slug !== undefined) {
      const slugId = `${slug}::${locale}`;
      const slugCount = (seenSlug.get(slugId) ?? 0) + 1;
      seenSlug.set(slugId, slugCount);
      if (slugCount > 1) {
        throw new Error(
          `[${collectionName}] Yinelenen slug + locale: "${slug}" (${locale}). ` +
            `Aynı dilde iki kayıt aynı slug'ı kullanamaz.`
        );
      }
    }
  }
}

// ---------------------------------------------------------------- koleksiyon seçiciler

/**
 * Referans bütünlüğü. Astro'nun `reference()` doğrulaması bozuk referansı
 * ERROR olarak LOGLAR ama içerik senkronizasyonunu durdurmaz; sessizce
 * kırık bir bağ ile devam edilmesini istemiyoruz.
 *
 * Bu denetim sayfa üretimi sırasında çalışır ve bozuk referansta BUILD'İ KIRAR.
 */
export async function assertSolutionReferencesResolve(
  solutions: readonly Solution[]
): Promise<void> {
  const technologyIds = new Set((await getCollection("technologies")).map((e) => e.id));
  const proofIds = new Set((await getCollection("proofs")).map((e) => e.id));

  for (const solution of solutions) {
    for (const ref of solution.data.technologyRefs) {
      if (!technologyIds.has(ref.id)) {
        throw new Error(
          `[solutions] Bozuk içerik referansı: "${solution.id}" -> technologies/"${ref.id}" bulunamadı.`
        );
      }
    }
    for (const ref of solution.data.proofRefs) {
      if (!proofIds.has(ref.id)) {
        throw new Error(
          `[solutions] Bozuk içerik referansı: "${solution.id}" -> proofs/"${ref.id}" bulunamadı.`
        );
      }
    }
  }
}

export async function getSolutions(locale: Locale, mode: ViewMode): Promise<Solution[]> {
  const all = await getCollection("solutions");
  assertUniqueTranslations(all, "solutions");
  await assertSolutionReferencesResolve(all);

  return all
    .filter((e) => e.data.locale === locale && isPublishedStatus(e.data.status, mode))
    .sort((a, b) => a.data.order - b.data.order);
}

/** Bir çözümü translationKey ile arar. Bulunamazsa `undefined` — sessiz fallback YOK. */
export async function findSolutionByTranslationKey(
  translationKey: string,
  locale: Locale,
  mode: ViewMode
): Promise<Solution | undefined> {
  const solutions = await getSolutions(locale, mode);
  return solutions.find((e) => e.data.translationKey === translationKey);
}

export async function getTechnologies(mode: ViewMode): Promise<Technology[]> {
  const all = await getCollection("technologies");
  return all
    .filter((e) => isActiveTechnology(e.data.active, mode))
    .sort((a, b) => a.data.name.localeCompare(b.data.name, "en"));
}

/** Bir çözümün teknolojileri; pasif olanlar public modda düşer. */
export async function getTechnologiesForSolution(
  solution: Solution,
  mode: ViewMode
): Promise<Technology[]> {
  const allowedIds = new Set(solution.data.technologyRefs.map((r) => r.id));
  const technologies = await getTechnologies(mode);
  return technologies.filter((t) => allowedIds.has(t.id));
}

/** Public modda yalnızca doğrulanmış referanslar döner. */
export async function getProofs(locale: Locale, mode: ViewMode): Promise<Proof[]> {
  const all = await getCollection("proofs");
  assertUniqueTranslations(all, "proofs");

  return all.filter(
    (e) =>
      e.data.locale === locale &&
      isPublishedStatus(e.data.status, mode) &&
      isVerifiedClaim(e.data.verificationStatus, mode)
  );
}

export async function getMilestones(locale: Locale, mode: ViewMode): Promise<Milestone[]> {
  const all = await getCollection("milestones");
  assertUniqueTranslations(all, "milestones");

  return all
    .filter(
      (e) =>
        e.data.locale === locale &&
        isPublishedStatus(e.data.status, mode) &&
        isVerifiedClaim(e.data.verificationStatus, mode)
    )
    .sort((a, b) => a.data.year - b.data.year);
}

/**
 * Bir kaydın gösterilebilir logo yolu. İzin yoksa `undefined` döner —
 * çağıran taraf logo alanını hiç render etmez.
 */
export function logoPathIfAllowed(data: {
  logoPath?: string | undefined;
  logoPermission: string;
}): string | undefined {
  return canShowLogo(data.logoPermission) ? data.logoPath : undefined;
}

// ---------------------------------------------------------------- dil karşılıkları

/**
 * Bir çözümün tüm dillerdeki yollarını döner. Karşılığı olmayan dil için anahtar
 * BULUNMAZ — çağıran taraf bunu "çeviri mevcut değil" olarak gösterir, başka
 * dildeki içeriğe sessizce yönlendirmez.
 */
export async function getSolutionAlternates(
  translationKey: string,
  mode: ViewMode,
  buildPath: (locale: Locale, slug: string) => string
): Promise<Partial<Record<Locale, string>>> {
  const all = await getCollection("solutions");
  assertUniqueTranslations(all, "solutions");

  const result: Partial<Record<Locale, string>> = {};
  for (const entry of all) {
    if (entry.data.translationKey !== translationKey) continue;
    if (!isPublishedStatus(entry.data.status, mode)) continue;
    result[entry.data.locale] = buildPath(entry.data.locale, entry.data.slug);
  }
  return result;
}
