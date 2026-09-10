import { getCollection, type CollectionEntry } from "astro:content";
import type {
  CapabilityLayer,
  InsightSeries,
  Locale,
  TechnologyLifecycle,
} from "@lib/content/schema";
import { LOCALES } from "@lib/content/schema";
import { CAPABILITY_ATLAS, layerForGroup } from "@lib/content/capabilities";

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
type Service = CollectionEntry<"services">;
type Author = CollectionEntry<"authors">;
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
  return (
    all
      .filter((e) => e.data.locale === locale && isVerifiedClaim(e.data.verificationStatus, mode))
      // Sıra editoryal bir karardır; yükleyicinin alfabetik sırasına bırakılmaz.
      .sort((a, b) => a.data.order - b.data.order)
  );
}

/**
 * YAYIN ZAMANI KONTROLÜ — FAIL-CLOSED (S11 §10).
 *
 * Tarihi HENÜZ GELMEMİŞ bir kayıt public çıktıya girmez. `status: "published"`
 * tek başına yeterli değildir: ileri tarihli bir yazı, planlandığı gün değil
 * yazıldığı gün yayına çıkardı.
 *
 * `now` parametre olarak alınır ki test edilebilsin; üretimde build anıdır.
 * Preview modda tarih kontrolü UYGULANMAZ (iç inceleme ileri tarihli taslağı
 * görmek ister), fakat preview asla public çıktı değildir.
 */
export function isPublishedByDate(
  publishedAt: Date | undefined,
  mode: ViewMode,
  now: Date = new Date()
): boolean {
  if (mode === "preview") return true;
  // Public modda tarihsiz yayın kabul edilmez; şema da bunu zaten reddeder.
  if (publishedAt === undefined) return false;
  return publishedAt.getTime() <= now.getTime();
}

/**
 * Public modda yalnızca yayınlanmış VE tarihi gelmiş içgörüler; en yeniden
 * eskiye. Aynı güne düşen iki yazı slug'a göre kararlı biçimde sıralanır —
 * aksi halde sıralama build'den build'e değişebilirdi.
 */
export async function getInsights(
  locale: Locale,
  mode: ViewMode,
  now: Date = new Date()
): Promise<Insight[]> {
  const all = await getCollection("insights");
  assertUniqueTranslations(all, "insights");

  return all
    .filter(
      (e) =>
        e.data.locale === locale &&
        isPublishedStatus(e.data.status, mode) &&
        isPublishedByDate(e.data.publishedAt, mode, now)
    )
    .sort((a, b) => {
      const at = a.data.publishedAt?.getTime() ?? 0;
      const bt = b.data.publishedAt?.getTime() ?? 0;
      if (at !== bt) return bt - at;
      return a.data.slug.localeCompare(b.data.slug, "en");
    });
}

/** Bir serideki içgörüler. Seri kapalı kümeden gelir; serbest metin değildir. */
export async function getInsightsBySeries(
  series: InsightSeries,
  locale: Locale,
  mode: ViewMode,
  now: Date = new Date()
): Promise<Insight[]> {
  const insights = await getInsights(locale, mode, now);
  return insights.filter((e) => e.data.series === series);
}

/** Bir etiketi taşıyan içgörüler. */
export async function getInsightsByTag(
  tag: string,
  locale: Locale,
  mode: ViewMode,
  now: Date = new Date()
): Promise<Insight[]> {
  const insights = await getInsights(locale, mode, now);
  return insights.filter((e) => e.data.tags.includes(tag));
}

/**
 * O dilde GERÇEKTEN yayınlanmış içeriği olan seriler ve yazı sayıları.
 * Boş seri döndürülmez: kayıtsız bir seri için rota üretmek, tıklandığında
 * boş bir sayfa açan bir bağlantı demekti.
 */
export async function getSeriesWithCounts(
  locale: Locale,
  mode: ViewMode,
  now: Date = new Date()
): Promise<{ series: InsightSeries; count: number }[]> {
  const insights = await getInsights(locale, mode, now);
  const counts = new Map<InsightSeries, number>();
  for (const entry of insights) {
    counts.set(entry.data.series, (counts.get(entry.data.series) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([series, count]) => ({ series, count }))
    .sort((a, b) => b.count - a.count || a.series.localeCompare(b.series, "en"));
}

/** Aynı kural etiketler için: yalnızca gerçekten kullanılan etiketler. */
export async function getTagsWithCounts(
  locale: Locale,
  mode: ViewMode,
  now: Date = new Date()
): Promise<{ tag: string; count: number }[]> {
  const insights = await getInsights(locale, mode, now);
  const counts = new Map<string, number>();
  for (const entry of insights) {
    for (const tag of entry.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "en"));
}

/** Yazar kaydı. Bulunamazsa build kırılır — sessiz "Anonim" fallback YOK. */
export async function getAuthor(id: string): Promise<Author> {
  const all = await getCollection("authors");
  const found = all.find((e) => e.id === id);
  if (found === undefined) {
    throw new Error(`[authors] "${id}" yazar kaydı bulunamadı.`);
  }
  return found;
}

/**
 * HİZMETLER (S10 §2).
 *
 * Sıra `order` alanından gelir ve şema bu alanı `SERVICE_TOPICS` dizisine
 * kilitler; iki dil aynı sırayı gösterir.
 */
export async function getServices(locale: Locale, mode: ViewMode): Promise<Service[]> {
  const all = await getCollection("services");
  assertUniqueTranslations(all, "services");

  return all
    .filter((e) => e.data.locale === locale && isPublishedStatus(e.data.status, mode))
    .sort((a, b) => a.data.order - b.data.order);
}

/**
 * YETENEK ATLASI (S10 §4-§5).
 *
 * Görünür teknolojileri yetenek katmanlarına böler. Katman sırası
 * `CAPABILITY_ATLAS` tablosundan gelir, teknoloji sayısından DEĞİL: az
 * teknolojisi olan bir yetenek listenin sonuna düşmez.
 *
 * Teknolojisi kalmayan katman DÖNDÜRÜLMEZ — boş bir yetenek başlığı,
 * ziyaretçiye eksik bir şey olduğunu düşündürür.
 *
 * FAIL-CLOSED: envanterde katmana eşlenmemiş bir grup varsa hata fırlatılır.
 * Sessizce atlamak, yeni bir grup eklendiğinde o teknolojilerin sayfadan
 * görünmez biçimde düşmesi demekti.
 */
export async function getCapabilityAtlas(
  mode: ViewMode
): Promise<{ layer: CapabilityLayer; technologies: Technology[] }[]> {
  const technologies = await getTechnologies(mode);

  const byLayer = new Map<CapabilityLayer, Technology[]>();
  for (const technology of technologies) {
    const layer = layerForGroup(technology.data.group);
    if (layer === undefined) {
      throw new Error(
        `[capabilities] "${technology.data.group}" grubu hiçbir yetenek katmanına eşlenmemiş ` +
          `("${technology.id}"). \`CAPABILITY_ATLAS\` tablosuna eklenmeli.`
      );
    }
    const bucket = byLayer.get(layer);
    if (bucket === undefined) byLayer.set(layer, [technology]);
    else bucket.push(technology);
  }

  return CAPABILITY_ATLAS.map((definition) => ({
    layer: definition.key,
    technologies: byLayer.get(definition.key) ?? [],
  })).filter((group) => group.technologies.length > 0);
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

/**
 * GENEL DİL KARŞILIĞI ÇÖZÜCÜSÜ.
 *
 * `getSolutionAlternates` ile aynı sözleşme, her yerelleştirilmiş koleksiyon
 * için: karşılığı OLMAYAN dil sonuçta BULUNMAZ, böylece dil değiştirici
 * ziyaretçiyi başka bir yazıya sessizce göndermez.
 */
export async function getEntryAlternates(
  collectionName: "insights" | "services",
  translationKey: string,
  mode: ViewMode,
  buildPath: (locale: Locale, slug: string) => string,
  now: Date = new Date()
): Promise<Partial<Record<Locale, string>>> {
  const all = await getCollection(collectionName);

  const result: Partial<Record<Locale, string>> = {};
  for (const entry of all) {
    if (entry.data.translationKey !== translationKey) continue;
    if (!isPublishedStatus(entry.data.status, mode)) continue;
    // İçgörülerde tarih kuralı da geçerli: ileri tarihli karşılığa link verilmez.
    if (collectionName === "insights") {
      const publishedAt = (entry.data as { publishedAt?: Date }).publishedAt;
      if (!isPublishedByDate(publishedAt, mode, now)) continue;
    }
    result[entry.data.locale] = buildPath(entry.data.locale, entry.data.slug);
  }
  return result;
}

/** Yetenek atlası satırı: katman + çözüm anlatısı + o katmandaki teknolojiler. */
export interface CapabilityAtlasRow {
  layer: CapabilityLayer;
  /** Katmanın bağlı olduğu çözüm kaydından okunur; burada YENİDEN YAZILMAZ. */
  solutionTitle: string;
  solutionSlug: string;
  problem: string;
  technologies: Technology[];
}

/**
 * YETENEK ATLASI GÖRÜNÜMÜ (S10 §5).
 *
 * Katmanı çözüm kaydıyla birleştirir: başlık ve problem cümlesi çözümün
 * kendisinden gelir, atlas tablosunda kopyalanmaz.
 *
 * FAIL-CLOSED: bir katmanın çözümü o dilde yayında değilse satır DÜŞER.
 * Alternatif, problem cümlesi olmayan yarım bir satır göstermekti; yarım satır
 * ziyaretçiye eksik değil, YANLIŞ bilgi verir.
 */
export async function getCapabilityAtlasView(
  locale: Locale,
  mode: ViewMode
): Promise<CapabilityAtlasRow[]> {
  const groups = await getCapabilityAtlas(mode);
  const solutions = await getSolutions(locale, mode);
  const byKey = new Map(solutions.map((s) => [s.data.translationKey, s]));

  const rows: CapabilityAtlasRow[] = [];
  for (const group of groups) {
    const definition = CAPABILITY_ATLAS.find((l) => l.key === group.layer);
    if (definition === undefined) continue;
    const solution = byKey.get(definition.solutionKey);
    if (solution === undefined) continue;

    rows.push({
      layer: group.layer,
      solutionTitle: solution.data.title,
      solutionSlug: solution.data.slug,
      problem: solution.data.problem,
      technologies: group.technologies,
    });
  }
  return rows;
}

/**
 * MÜŞTERİ KANITLARI — ÜÇ KATLI FAIL-CLOSED (S10 §7).
 *
 * Bir kayıt public çıktıya girmek için ÜÇ koşulu birden geçmek zorunda:
 * 1. `status === "published"`
 * 2. `verificationStatus === "verified"`
 * 3. `kind === "customer-reference"`
 *
 * Üçüncü koşul bilinçli olarak eklendi: kendi ölçümümüz olan bir kayıt
 * (`internal-measurement`) teknik olarak doğrulanmıştır ama MÜŞTERİ BAŞARISI
 * DEĞİLDİR. S00'da ölçülen mevcut site ağırlığını "referanslarımız" bölümünde
 * göstermek, doğrulanmış bir sayıyı yanlış anlama sokardı.
 *
 * Şu anda onaylanmış müşteri referansı YOKTUR; bu fonksiyon boş dizi döner ve
 * çağıran taraf bölümü HİÇ render etmez — placeholder logo duvarı,
 * "referanslarımız yakında" yazısı veya boş kutu gösterilmez.
 */
export async function getCustomerProofs(locale: Locale, mode: ViewMode): Promise<Proof[]> {
  const proofs = await getProofs(locale, mode);
  return proofs.filter((e) => e.data.kind === "customer-reference");
}

/** Bir çözüme bağlı müşteri kanıtları. Aynı üç koşul burada da uygulanır. */
export async function getCustomerProofsForSolution(
  solution: Solution,
  locale: Locale,
  mode: ViewMode
): Promise<Proof[]> {
  const allowed = new Set(solution.data.proofRefs.map((r) => r.id));
  if (allowed.size === 0) return [];
  const proofs = await getCustomerProofs(locale, mode);
  return proofs.filter((e) => allowed.has(e.id));
}

/**
 * SERİ VE ETİKET İÇİN DİL KARŞILIĞI.
 *
 * Bir seri/etiket rotası YALNIZCA o dilde içeriği varsa üretilir. Dolayısıyla
 * dil karşılığı da koşulludur: İngilizce'de o seride yazı yoksa `/en/...`
 * adresi HİÇ yoktur ve ona link vermek 404 üretir.
 *
 * Bu, `getSolutionAlternates` ile aynı sözleşmedir: karşılığı olmayan dil
 * sonuçta BULUNMAZ. Dil değiştirici bunu "bu dilde yayınlanmadı" olarak
 * gösterir, ziyaretçiyi var olmayan bir adrese göndermez.
 */
export async function getSeriesAlternates(
  series: InsightSeries,
  mode: ViewMode,
  buildPath: (locale: Locale, series: InsightSeries) => string,
  now: Date = new Date()
): Promise<Partial<Record<Locale, string>>> {
  const result: Partial<Record<Locale, string>> = {};
  for (const locale of LOCALES) {
    const entries = await getInsightsBySeries(series, locale, mode, now);
    if (entries.length > 0) result[locale] = buildPath(locale, series);
  }
  return result;
}

export async function getTagAlternates(
  tag: string,
  mode: ViewMode,
  buildPath: (locale: Locale, tag: string) => string,
  now: Date = new Date()
): Promise<Partial<Record<Locale, string>>> {
  const result: Partial<Record<Locale, string>> = {};
  for (const locale of LOCALES) {
    const entries = await getInsightsByTag(tag, locale, mode, now);
    if (entries.length > 0) result[locale] = buildPath(locale, tag);
  }
  return result;
}
