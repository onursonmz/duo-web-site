import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale, TechnologyLifecycle } from "@lib/content/schema";

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
 * - `lifecycle !== "active"` teknoloji görünmez (pending ve inactive dahil)
 * - `decisionNeeded === true` teknoloji görünmez (lifecycle "active" olsa bile)
 */

export type ViewMode = "public" | "preview";

/** Üretim sayfaları bunu AÇIKÇA kullanır. */
export const PUBLIC: ViewMode = "public";
export const PREVIEW: ViewMode = "preview";

type Solution = CollectionEntry<"solutions">;
type Technology = CollectionEntry<"technologies">;
type Proof = CollectionEntry<"proofs">;
type Milestone = CollectionEntry<"milestones">;
type Insight = CollectionEntry<"insights">;
type Region = CollectionEntry<"regions">;
type Homepage = CollectionEntry<"homepage">;

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

/** Görünürlük kararı için gereken asgari teknoloji alanları. */
export interface TechnologyVisibility {
  lifecycle: TechnologyLifecycle;
  decisionNeeded: boolean;
}

/**
 * Teknoloji görünürlüğü — FAIL-CLOSED, İKİ KOŞUL BİRLİKTE.
 *
 * Public modda bir teknoloji YALNIZCA şu ikisi birden sağlanırsa görünür:
 * - `lifecycle === "active"`
 * - `decisionNeeded === false`
 *
 * `pending` (karar bekliyor) ve `inactive` (kapsam dışı) public çıktıya girmez.
 * `decisionNeeded` koşulu ikinci savunma katmanıdır: şema zaten
 * `active + decisionNeeded:true` çelişkisini reddeder (bkz. `technologySchema`),
 * fakat seçici de bağımsız olarak kontrol eder ki şema atlansa bile
 * karar bekleyen bir kayıt public çıktıya sızmasın.
 *
 * Preview modda `pending` görünür (iç inceleme için), `inactive` görünmez.
 * Logo izni bu fonksiyondan ETKİLENMEZ ve preview'da da gevşemez — bkz.
 * `canShowLogo`.
 */
export function isVisibleTechnology(technology: TechnologyVisibility, mode: ViewMode): boolean {
  if (technology.lifecycle === "inactive") return false;
  if (mode === "preview") return true;
  return technology.lifecycle === "active" && technology.decisionNeeded === false;
}

// ---------------------------------------------------------------- doğrulama

/**
 * Aynı `translationKey + locale` çifti birden fazla kayıtta olamaz ve aynı
 * locale içinde slug tekrar edemez. Astro şeması bunu göremez (dosya bazlı
 * doğrular), bu yüzden koleksiyon düzeyinde burada denetlenir.
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

/** `translationKey`/slug taşıyan tüm koleksiyonlar. */
const LOCALIZED_COLLECTIONS = [
  "solutions",
  "services",
  "milestones",
  "proofs",
  "insights",
] as const;

let uniqueCache: Promise<void> | undefined;

/**
 * Yerelleştirilmiş TÜM koleksiyonlarda benzersizliği denetler.
 * `src/middleware.ts` tarafından her build'de çağrılır; bir sayfanın ilgili
 * koleksiyonu sorgulamasına bağlı değildir.
 */
export function assertUniqueTranslationsOnce(): Promise<void> {
  uniqueCache ??= (async () => {
    for (const name of LOCALIZED_COLLECTIONS) {
      assertUniqueTranslations(await getCollection(name), name);
    }
  })();
  return uniqueCache;
}

// ---------------------------------------------------------------- koleksiyon seçiciler

export async function getSolutions(locale: Locale, mode: ViewMode): Promise<Solution[]> {
  const all = await getCollection("solutions");
  assertUniqueTranslations(all, "solutions");

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
    .filter((e) => isVisibleTechnology(e.data, mode))
    .sort((a, b) => a.data.name.localeCompare(b.data.name, "en"));
}

/** Bir çözümün teknolojileri; görünür olmayanlar public modda düşer. */
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

/** Ana sayfa metni. Locale başına tek kayıt; bulunamazsa build kırılır. */
export async function getHomepage(locale: Locale): Promise<Homepage> {
  const all = await getCollection("homepage");
  const entry = all.find((e) => e.data.locale === locale);
  if (entry === undefined) {
    throw new Error(`[homepage] "${locale}" için ana sayfa içeriği bulunamadı.`);
  }
  return entry;
}

/**
 * Public modda YALNIZCA doğrulanmış bölgeler döner.
 * Hiçbiri doğrulanmamışsa boş dizi döner ve çağıran taraf bölümü HİÇ
 * render etmez — boş kutu veya "veri bekleniyor" yazısı gösterilmez.
 */
export async function getRegions(locale: Locale, mode: ViewMode): Promise<Region[]> {
  const all = await getCollection("regions");
  return all.filter(
    (e) => e.data.locale === locale && isVerifiedClaim(e.data.verificationStatus, mode)
  );
}

/** Public modda yalnızca yayınlanmış içgörüler; en yeniden eskiye. */
export async function getInsights(locale: Locale, mode: ViewMode): Promise<Insight[]> {
  const all = await getCollection("insights");
  assertUniqueTranslations(all, "insights");

  return all
    .filter((e) => e.data.locale === locale && isPublishedStatus(e.data.status, mode))
    .sort((a, b) => a.data.slug.localeCompare(b.data.slug, "en"));
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
