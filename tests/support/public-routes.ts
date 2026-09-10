/**
 * PUBLIC ROTA ENVANTERİ — E2E TARAMALARININ TEK KAYNAĞI.
 *
 * Ses taraması, erişilebilirlik matrisi, taşma testleri ve bağlantı taraması
 * aynı listeyi kullanır. Önceden her spec kendi listesini tutuyordu ve yeni bir
 * rota açıldığında bazı taramalara ekleniyor, bazılarına unutuluyordu.
 *
 * KENDİNİ DOĞRULAYAN LİSTE: `tests/e2e/route-inventory.spec.ts` bu listeyi
 * gerçek `dist/` çıktısıyla karşılaştırır. Envantere girmemiş bir rota ya da
 * listede olup üretilmemiş bir rota testi kırar — liste sessizce eskiyemez.
 *
 * S13 NOTU — SITEMAP SEAM.
 * Sitemap üretimi bu listeyi DEĞİL, `src/lib/content/selectors` içindeki
 * public seçicileri tüketmelidir: `getSolutions`, `getServices`,
 * `getInsights`, `getSeriesWithCounts`, `getTagsWithCounts`. Görünürlük
 * kuralı (taslak + ileri tarih filtresi) orada yaşıyor; ikinci bir listeden
 * üretmek, sitemap'in gizli içeriği duyurmasına açık kapı bırakırdı.
 *
 * Bu dosya TEST KAPSAMININ envanteridir, yayın envanteri değil.
 */

/** Locale'den bağımsız üst seviye sayfalar. */
export const TOP_LEVEL_ROUTES = [
  "/",
  "/en/",
  "/cozumler/",
  "/en/solutions/",
  "/hizmetler/",
  "/en/services/",
  "/teknolojiler/",
  "/en/technologies/",
  "/icgoruler/",
  "/en/insights/",
  "/iletisim/",
  "/en/contact/",
] as const;

/** Sekiz çözüm alanı, iki dilde. */
export const SOLUTION_ROUTES = [
  "/cozumler/operasyonel-gorunurluk/",
  "/cozumler/konfigurasyon-ve-varlik-yonetimi/",
  "/cozumler/bt-hizmet-yonetimi/",
  "/cozumler/veri-akisi-ve-entegrasyon/",
  "/cozumler/kurumsal-mimari-ve-yonetisim/",
  "/cozumler/aiops-ve-olay-yasam-dongusu/",
  "/cozumler/otomasyon/",
  "/cozumler/muhendislik-ve-urun-gelistirme/",
  "/en/solutions/observability-and-apm/",
  "/en/solutions/configuration-and-asset-management/",
  "/en/solutions/it-service-management/",
  "/en/solutions/data-streaming-and-integration/",
  "/en/solutions/enterprise-architecture/",
  "/en/solutions/aiops-and-event-lifecycle/",
  "/en/solutions/automation/",
  "/en/solutions/engineering-and-product-development/",
] as const;

/** Yayınlanmış içgörü detayları. */
export const INSIGHT_ROUTES = [
  "/icgoruler/zabbix-alarmindan-cyclops-olayina/",
  "/icgoruler/toplu-isten-olay-tabanli-veri-akisina-gecis/",
  "/icgoruler/envanterden-karar-sistemine-kurumsal-mimari/",
  "/icgoruler/operasyon-verisinin-dort-hali/",
  "/en/insights/from-batch-jobs-to-event-driven-data-flow/",
] as const;

/** Seri ve etiket filtre rotaları — yalnızca içeriği olanlar üretilir. */
export const INSIGHT_FILTER_ROUTES = [
  "/icgoruler/seri/cyclops-gunlugu/",
  "/icgoruler/seri/data-ve-ai/",
  "/icgoruler/seri/mimari-notlari/",
  "/en/insights/series/data-and-ai/",
  "/icgoruler/etiket/observability/",
  "/icgoruler/etiket/aiops/",
  "/icgoruler/etiket/alarm-yonetimi/",
  "/icgoruler/etiket/apm/",
  "/icgoruler/etiket/entegrasyon/",
  "/icgoruler/etiket/envanter/",
  "/icgoruler/etiket/karar-yonetimi/",
  "/icgoruler/etiket/kurumsal-mimari/",
  "/icgoruler/etiket/mimari/",
  "/icgoruler/etiket/olay-yonetimi/",
  "/icgoruler/etiket/operasyon/",
  "/icgoruler/etiket/streaming/",
  "/icgoruler/etiket/veri-akisi/",
  "/icgoruler/etiket/yonetisim/",
  "/en/insights/tag/veri-akisi/",
  "/en/insights/tag/entegrasyon/",
  "/en/insights/tag/streaming/",
  "/en/insights/tag/mimari/",
] as const;

/** RSS beslemeleri. Sayfa değil kaynak oldukları için ayrı tutulur. */
export const FEED_ROUTES = ["/rss.xml", "/en/rss.xml"] as const;

/**
 * DAHİLİ ÖNİZLEMELER — ziyaretçiye açık envanterin DIŞINDA.
 *
 * `/design-system` iç referans sayfasıdır ve navigasyona eklenmez;
 * `/404` bir hata sayfasıdır, gezilebilir bir hedef değil.
 */
export const INTERNAL_ROUTES = ["/design-system/", "/404.html"] as const;

/** Ziyaretçiye açık TÜM sayfalar (besleme ve dahili önizleme hariç). */
export const PUBLIC_PAGE_ROUTES: readonly string[] = [
  ...TOP_LEVEL_ROUTES,
  ...SOLUTION_ROUTES,
  ...INSIGHT_ROUTES,
  ...INSIGHT_FILTER_ROUTES,
];

/**
 * Erişilebilirlik ve görsel kontrol için KRİTİK rota matrisi.
 * Tüm rotalarda axe koşmak süreyi gereksiz uzatıyor; bu liste her şablon
 * ailesinden en az bir temsilci taşır.
 */
export const CRITICAL_ROUTES = [
  "/",
  "/en/",
  "/cozumler/",
  "/cozumler/operasyonel-gorunurluk/",
  "/hizmetler/",
  "/en/services/",
  "/teknolojiler/",
  "/en/technologies/",
  "/icgoruler/",
  "/icgoruler/toplu-isten-olay-tabanli-veri-akisina-gecis/",
  "/icgoruler/seri/data-ve-ai/",
  "/icgoruler/etiket/observability/",
  "/iletisim/",
] as const;

/** Sözleşmedeki taşma test genişlikleri. */
export const REFLOW_WIDTHS = [320, 390, 768, 1024, 1440] as const;
