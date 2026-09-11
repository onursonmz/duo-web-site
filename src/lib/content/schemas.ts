import { reference } from "astro:content";
import { z } from "astro/zod";
import { TAG_KEYS_TUPLE } from "@config/tags";
import { CTA_LABEL_KEYS } from "@lib/i18n/dictionary";
import {
  SERVICE_TOPICS,
  insightSeriesEnum,
  licenseModelEnum,
  localeEnum,
  localizedBase,
  logoPermissionEnum,
  proofKindEnum,
  seoSchema,
  serviceTopicEnum,
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

/**
 * HİZMET ŞEMASI (S10 §2).
 *
 * HİZMET ≠ ÇÖZÜM. Çözüm kaydı müşterinin teknik/operasyonel PROBLEMİNİ anlatır;
 * hizmet kaydı Duosis'in o çözümü NASIL SUNDUĞUNU anlatır. Bu yüzden hizmet
 * şemasında `problem`, `benefits` veya `capabilities` alanı YOKTUR — bunlar
 * çözüm kaydının alanlarıdır. Hizmetin dört sorusu vardır ve dördü de
 * ZORUNLUDUR; biri boş bırakılıp bölüm kaybolamaz.
 *
 * `translationKey` kapalı hizmet kümesinden gelir: altıncı bir hizmet kaydı
 * açılamaz ve iletişim CTA'sının `?topic=` allowlist'i bu kümeyle aynıdır.
 */
export const serviceSchema = z
  .object({
    ...localizedBase,
    /** Kapalı küme; `localizedBase.translationKey` serbest string'ini DARALTIR. */
    translationKey: serviceTopicEnum,
    /** Anlatı sırası. `SERVICE_TOPICS` dizisindeki konumla aynı olmak zorunda. */
    order: z.number().int().min(1).max(SERVICE_TOPICS.length),
    summary: z.string().min(1),
    /** "Ne zaman gerekir?" — tetikleyici durumlar. */
    whenNeeded: z.array(z.string().min(1)).min(1),
    /** "Duosis ne sunar?" — kapsamdaki iş kalemleri. */
    offer: z.array(z.string().min(1)).min(1),
    /** "Çalışma biçimi nedir?" — sıralı adımlar; sıra anlamlıdır. */
    howWeWork: z.array(z.string().min(1)).min(1),
    /** "Somut çıktı nedir?" — teslim edilen şey; sonuç İDDİASI değil. */
    outcomes: z.array(z.string().min(1)).min(1),
    /** "Hangi çözüm alanlarıyla ilişkilidir?" */
    relatedSolutionRefs: z.array(reference("solutions")).default([]),
  })
  .strict()
  /**
   * SIRA TUTARLILIĞI.
   *
   * `order` ile `SERVICE_TOPICS` dizisi ayrışırsa TR ve EN sayfaları hizmetleri
   * FARKLI sırada gösterebilirdi. Sıra tek bir yerden gelir; sapma build'i kırar.
   */
  .superRefine((value, ctx) => {
    const expected = SERVICE_TOPICS.indexOf(value.translationKey) + 1;
    if (value.order !== expected) {
      ctx.addIssue({
        code: "custom",
        path: ["order"],
        message:
          `"${value.translationKey}" için order ${expected} olmalı (SERVICE_TOPICS sırası), ` +
          `${value.order} verildi.`,
      });
    }
  });

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
    /**
     * Kaydın hangi kaynaktan geldiği. ZORUNLUDUR: doğrulama izi olmayan bir
     * kilometre taşı yayına giremez (S09 §12).
     */
    source: z.string().min(1),
  })
  .strict();

export const proofSchema = z
  .object({
    translationKey: translationKeySchema,
    locale: localeEnum,
    status: statusEnum,
    /**
     * Müşteri kanıtı mı, kendi ölçümümüz mü. Zorunlu: tür belirtilmeden bir
     * kaydın "referanslarımız" bölümüne girip giremeyeceği belirlenemez.
     */
    kind: proofKindEnum,
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

/**
 * YAZAR KAYDI (S11 §10).
 *
 * UYDURULMUŞ ÇALIŞAN PROFİLİ YOKTUR: bu şemada fotoğraf, biyografi, sosyal
 * hesap veya unvan geçmişi alanı BULUNMAZ. Kurumsal bir ekip imzası
 * ("Duosis Mühendislik Ekibi") tek başına yeterlidir; şema gerçek kişilerin
 * profilini uydurmaya alan bırakmaz.
 *
 * Ad ve rol her iki dilde de yazılır — yazar imzası çevrilmeden bırakılırsa
 * İngilizce sayfada Türkçe bir rol etiketi kalırdı.
 */
const localizedText = z
  .object({
    tr: z.string().min(1),
    en: z.string().min(1),
  })
  .strict();

export const authorSchema = z
  .object({
    id: z.string().min(1),
    name: localizedText,
    role: localizedText,
  })
  .strict();

/**
 * Yazının dayandığı kaynak. Yalnızca GERÇEKTEN kontrol edilmiş resmî ürün
 * dokümantasyonu veya sağlanan kurumsal kaynak girilir; link uydurulmaz.
 */
const insightSourceSchema = z
  .object({
    label: z.string().min(1),
    url: z.url(),
  })
  .strict();

/**
 * İÇGÖRÜ ŞEMASI (S11 §10).
 *
 * OKUMA SÜRESİ BURADA YOKTUR — bilinçli.
 * Elle yazılan bir okuma süresi, gövde değiştiğinde sessizce yanlışa döner.
 * Süre `@lib/content/readingTime` tarafından gövdeden DETERMİNİSTİK olarak
 * hesaplanır; aynı metin her build'de aynı sonucu verir.
 *
 * SOSYAL ÖNİZLEME GÖRSELİ opsiyoneldir ve boş bırakılabilir. Var olmayan bir
 * hero görseli UYDURULMAZ; görsel yoksa metin tabanlı önizleme kullanılır.
 */
export const insightSchema = z
  .object({
    translationKey: translationKeySchema,
    locale: localeEnum,
    slug: slugSchema,
    status: statusEnum,
    title: z.string().min(1),
    excerpt: z.string().min(1),
    /** Kapalı küme; yazım hatası yeni bir seri rotası ÜRETEMEZ. */
    series: insightSeriesEnum,
    /** Etiketler URL'de yaşar: ASCII kebab-case zorunlu. */
    /**
     * Etiketler dilden bağımsız KEY değerleridir (`src/config/tags.ts`).
     * Kapalı küme: kayıtta olmayan bir etiket build'i kırar, dolayısıyla
     * bilinmeyen bir etiket için rota da üretilemez.
     */
    tags: z.array(z.enum(TAG_KEYS_TUPLE)).default([]),
    authorRef: reference("authors"),
    relatedSolutionRefs: z.array(reference("solutions")).default([]),
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    sources: z.array(insightSourceSchema).default([]),
    cta: z
      .object({
        labelKey: z.enum(CTA_LABEL_KEYS),
        href: z.string().min(1),
      })
      .strict()
      .optional(),
    social: z
      .object({
        imagePath: z.string().min(1),
        /** Görsel varsa alternatif metni ZORUNLU. */
        imageAlt: z.string().min(1),
      })
      .strict()
      .optional(),
    seo: seoSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    /*
     * YAYIN TARİHİ ZORUNLULUĞU.
     *
     * `status: "published"` bir kayıt tarihsiz olamaz: RSS sıralaması,
     * BlogPosting `datePublished` alanı ve "gelecek tarihli içerik gizlenir"
     * kuralının tamamı bu alana dayanır. Tarihsiz yayınlanmış bir kayıt
     * sessizce her yerde en sona düşerdi.
     */
    if (value.status === "published" && value.publishedAt === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["publishedAt"],
        message: `"${value.slug}": status "published" ise publishedAt zorunludur.`,
      });
    }

    /* Güncelleme tarihi yayından ÖNCE olamaz. */
    if (
      value.publishedAt !== undefined &&
      value.updatedAt !== undefined &&
      value.updatedAt.getTime() < value.publishedAt.getTime()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["updatedAt"],
        message: `"${value.slug}": updatedAt, publishedAt tarihinden önce olamaz.`,
      });
    }
  });

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
    /**
     * HERO SİNYAL ETİKETLERİ (S15-R1).
     *
     * Operasyon evreninde soldan giren telemetri türleri. Sahne DEKORATİFTİR;
     * bu etiketlerin taşıdığı bilgi `heroStages[1].body` içinde zaten METİN
     * olarak vardır ("Metrik, log, event ve trace…"). Bu yüzden sahnedeki
     * kopyaları `aria-hidden` kalır ve bilgi yalnızca görselle taşınmaz.
     *
     * Kısa tutulur: sahnede tek satır etikettir, cümle değildir.
     */
    heroSignals: z.array(z.string().min(1).max(16)).length(5),
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
    /**
     * Görüntüleme sırası. AÇIKÇA yazılır çünkü koleksiyon yükleyicisi kayıtları
     * kimliğe göre alfabetik veriyordu ve sıra "Orta Asya, Orta Doğu, Türkiye"
     * olarak çıkıyordu. Bölge sırası editoryal bir karardır; dosya adına veya
     * yükleyici davranışına bırakılamaz.
     */
    order: z.number().int().min(1),
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
    /*
     * KAPALI ANAHTAR KÜMESİ (S14'te dört ürüne genişletildi).
     *
     * Şablon yalnızca GERÇEKTEN incelenmiş ve gerekiyorsa redakte edilmiş
     * varlıkları render eder; serbest dosya yolu kabul edilmez. Bir anahtar
     * buraya ancak `docs/PRODUCT_SOURCE_MANIFEST.md` içinde kaynağı, hash'i
     * ve izin kararı kayıtlıysa eklenir.
     */
    key: z.enum([
      // CyclOps — S08'de incelendi ve maskelendi.
      "event-browser",
      "matchers",
      "dashboard",
      // LogiSlot — S14'te incelendi; wizard ekranlarında kiracı adı maskelendi.
      "logislot-landing-light",
      "logislot-landing-dark",
      "logislot-wizard-vehicle",
      "logislot-wizard-slots",
    ]),
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

/** Başlıklı, gövdeli genel blok — yetenek, sonuç, adım. */
const productBlockSchema = z
  .object({
    title: z.string().min(1),
    body: z.string().min(1),
  })
  .strict();

/**
 * ÜRÜN KAYNAĞI (S14).
 *
 * Her ürün iddiası bir commit'e dayanmak zorundadır. Buradaki değerler
 * `docs/PRODUCT_SOURCE_MANIFEST.md` ile BİREBİR aynı olmalıdır; kaynağı
 * gösterilemeyen bir ürün siteye giremez.
 */
const productSourceSchema = z
  .object({
    /** Kaynak deposu (kısa ad) veya bu deponun kendisi. */
    repository: z.string().min(1),
    /** Kaynak commit SHA'sı — "en son" gibi kayan referans KABUL EDİLMEZ. */
    commit: z.string().regex(/^[0-9a-f]{40}$/, "tam 40 karakterlik commit SHA gerekir"),
    /** Manifest veya sözleşme dosyasının yolu. */
    document: z.string().min(1),
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

    /* ---------------------------------------------------- S14 çekirdeği */

    /**
     * DOĞRULAMA DURUMU — sayfanın nasıl anlatacağını belirler.
     *
     * `verified-running`  : yetenekler bugün çalışıyor, şimdiki zamanda anlatılır
     * `verified-scope`    : ürün tanımı bağlayıcı bir kaynakla doğrulandı ANCAK
     *                       yetenekler henüz çalışmıyor; sayfa tasarlanan kapsam
     *                       ile bugünkü durumu AYRI gösterir
     * `source-pending`    : kaynak bulunamadı; kamuya açık detay yayımlanmaz
     */
    verificationStatus: z.enum(["verified-running", "verified-scope", "source-pending"]),
    source: productSourceSchema,
    /** Sayfanın ilk cümlesi; jargonla başlamaz. */
    headline: z.string().min(1),
    /** İki-üç cümlelik ürün özeti. */
    summary: z.string().min(1),
    /** Sisteme GİREN bilgi veya sinyaller. */
    inputs: z.array(z.string().min(1)).min(2),
    /** Ürünün bu girdilerle NE YAPTIĞI. */
    mechanism: z.array(z.string().min(1)).min(2),
    /** Kullanıcının gördüğü SONUÇ. */
    outcomes: z.array(productBlockSchema).min(2),
    capabilities: z.array(productBlockSchema).min(3),
    workflow: z.array(productBlockSchema).min(3),
    security: z.array(z.string().min(1)).min(1),
    audiences: z.array(z.string().min(1)).min(2),
    /**
     * BUGÜN GERÇEKTEN ÇALIŞAN kısım.
     *
     * `verified-scope` ürünlerde ZORUNLUDUR: tasarlanan kapsamı bugünkü
     * durumdan ayırmadan yetenek listesi yayımlamak, olmayan bir ürünü
     * varmış gibi göstermek olurdu.
     */
    todayTitle: z.string().min(1).optional(),
    todayBody: z.string().min(1).optional(),
    todayWorking: z.array(z.string().min(1)).optional(),
    todayNotWorking: z.array(z.string().min(1)).optional(),
    /**
     * Yapay zekânın üründeki rolü. Rol yoksa alan da yazılmaz — "AI destekli"
     * demiş olmak için doldurulmaz.
     */
    aiRole: z.string().min(1).optional(),
    /** Ürün ekosistemi sahnesinde kullanılan hareket dili anahtarı. */
    motionKey: z.enum(["converge", "organise", "allocate", "answer"]),

    /* ------------------------------------------- CyclOps'a özel bloklar */

    /** İzleme araçlarının yerine geçmediğini söyleyen konumlandırma cümlesi. */
    positioning: z.string().min(1),
    problem: z.object({ title: z.string().min(1), body: z.string().min(1) }).strict(),
    /** Signal → Context → Correlate → Decide → Act: TAM BEŞ, sıra kapalı. */
    flowTitle: z.string().min(1).optional(),
    flow: z.array(productFlowStepSchema).length(5).optional(),
    /*
     * ÖNCESİ / SONRASI — opsiyonel.
     *
     * Henüz ÇALIŞMAYAN bir ürün için "öncesi/sonrası" yazmak, ürünün bugün
     * bir fark yarattığını iddia etmek olurdu. Bu yüzden `verified-scope`
     * ürünlerde bu blok bilinçli olarak boş bırakılır.
     */
    scenario: z
      .object({
        title: z.string().min(1),
        beforeTitle: z.string().min(1),
        before: z.array(z.string().min(1)).min(2),
        afterTitle: z.string().min(1),
        after: z.array(z.string().min(1)).min(2),
      })
      .strict()
      .optional(),
    /*
     * GERÇEK ÜRÜN EKRANLARI — opsiyonel.
     *
     * Yayımlanabilir ekranı OLMAYAN ürün (Hermes, RAVSKALD) bu bloğu hiç
     * taşımaz. Boş bir galeri yerine hiç galeri: "ekran yok" durumu sessizce
     * boş bir kutuya dönüşmez, sayfa bunun yerine süreç görselleştirmesi
     * gösterir ve bunun bir süreç görselleştirmesi olduğunu AÇIKÇA yazar.
     */
    galleryTitle: z.string().min(1).optional(),
    /** Her görselin "gerçek ürün ekranı" olduğu ziyaretçiye açıkça söylenir. */
    galleryNote: z.string().min(1).optional(),
    gallery: z.array(productScreenSchema).min(1).optional(),
    /** Gerçek ekran yoksa gösterilecek süreç görselleştirmesinin açıklaması. */
    diagramTitle: z.string().min(1).optional(),
    diagramNote: z.string().min(1).optional(),
    approval: z
      .object({
        title: z.string().min(1),
        body: z.string().min(1),
        boundaries: z.array(z.string().min(1)).min(2),
      })
      .strict()
      .optional(),
    integrationsTitle: z.string().min(1).optional(),
    integrationsNote: z.string().min(1).optional(),
    /** Yalnızca envanterdeki kayıtlar; görünürlük seçiciden geçer. */
    technologyRefs: z.array(reference("technologies")).default([]),
    relatedSolutionRefs: z.array(reference("solutions")).default([]),
    cta: z
      .object({
        title: z.string().min(1),
        body: z.string().min(1),
        labelKey: z.string().min(1),
        /** CTA konusu KAPALI ürün allowlist'inden gelir. */
        topic: z.enum(["cyclops", "hermes", "logislot", "ravskald"]),
      })
      .strict(),
    seo: seoSchema,
  })
  .strict();

/* ------------------------------------------------------------------ S09 */

/**
 * HAKKIMIZDA SAYFASI.
 *
 * İÇERİK GÜVENLİĞİ: müşteri sayısı, sektör adı, iş ortaklığı, ekip üyesi adı,
 * fotoğraf veya kişisel veri için ALAN YOKTUR. Ekip anlatısı yalnızca ROL ve
 * YETKİNLİK düzeyindedir; `.strict()` başka bir alanı kabul etmez.
 *
 * Zaman çizelgesi buradan DEĞİL, `milestones` koleksiyonundan gelir: yalnızca
 * doğrulanmış kayıtlar render edilir.
 */
const aboutBlockSchema = z
  .object({
    title: z.string().min(1),
    body: z.string().min(1),
  })
  .strict();

export const aboutSchema = z
  .object({
    id: z.string().min(1),
    locale: localeEnum,
    slug: slugSchema,
    status: statusEnum,
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    lead: z.string().min(1),
    /** Duosis hangi problemi çözmek için var? */
    purpose: aboutBlockSchema,
    /** Nasıl çalışıyor + entegratörden farkı. */
    approach: aboutBlockSchema,
    difference: aboutBlockSchema,
    ownProduct: aboutBlockSchema,
    support: aboutBlockSchema,
    /** Çalışma modeli: analiz → tasarım → uygulama → eğitim ve destek. */
    workModelTitle: z.string().min(1),
    workModel: z
      .array(
        z
          .object({
            key: z.enum(["analysis", "design", "delivery", "support"]),
            title: z.string().min(1),
            body: z.string().min(1),
          })
          .strict()
      )
      .length(4),
    /** Roller — KİŞİ DEĞİL. Ad, unvan, fotoğraf veya profil alanı yoktur. */
    teamTitle: z.string().min(1),
    teamNote: z.string().min(1),
    team: z
      .array(
        z
          .object({
            key: z.enum(["architecture", "platform", "automation", "operations"]),
            title: z.string().min(1),
            body: z.string().min(1),
          })
          .strict()
      )
      .length(4),
    /** Zaman çizelgesi başlığı; kayıtlar `milestones` koleksiyonundan gelir. */
    journeyTitle: z.string().min(1),
    journeyLead: z.string().min(1),
    /** Bölgeler `regions` koleksiyonundan gelir; burada yalnızca üst metin. */
    regionsTitle: z.string().min(1),
    regionsLead: z.string().min(1),
    cta: z
      .object({
        title: z.string().min(1),
        body: z.string().min(1),
        labelKey: z.string().min(1),
      })
      .strict(),
    seo: seoSchema,
  })
  .strict();

/* ------------------------------------------------------------------ S12 */

/**
 * HUKUKİ METİN (aydınlatma metni).
 *
 * `reviewStatus` KAPALI bir kümedir ve `legal-review-required` olduğu sürece
 * metin TASLAKTIR: production formu veri gönderemez (bkz. `src/config/site.ts`
 * ve `tests/unit/contact-core.test.ts`).
 *
 * Bu şemada saklama süresi, mevzuat maddesi veya uyumluluk iddiası için ALAN
 * YOKTUR: hukuk onayı gelmeden böyle bir cümle veriye yazılamaz.
 */
export const legalSchema = z
  .object({
    id: z.string().min(1),
    locale: localeEnum,
    slug: slugSchema,
    status: statusEnum,
    reviewStatus: z.enum(["legal-review-required", "approved"]),
    title: z.string().min(1),
    lead: z.string().min(1),
    sections: z
      .array(z.object({ heading: z.string().min(1), body: z.string().min(1) }).strict())
      .min(3),
    seo: seoSchema,
  })
  .strict();
