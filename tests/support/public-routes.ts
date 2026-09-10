/**
 * TARAMA SABİTLERİ — rota listesi DEĞİL.
 *
 * ENTEGRASYON KARARI (S08-S11): bu dosya başlangıçta elle tutulan bir public
 * rota listesi taşıyordu. S08+S09 aynı ihtiyacı `tests/support/route-inventory.ts`
 * içinde KEŞİF ile çözmüştü: envanter `dist/` çıktısından türetiliyor, yani
 * yeni bir rota eklendiğinde taramaya kendiliğinden giriyor.
 *
 * Keşif yaklaşımı üstün olduğu için elle tutulan liste KALDIRILDI. Rota
 * envanteri artık tek bir yerden gelir: `route-inventory.ts`.
 *
 * Burada yalnızca keşiften TÜRETİLEMEYEN sabitler kalıyor:
 *   - besleme adresleri (sayfa değil kaynak; `index.html` taramasına girmez)
 *   - erişilebilirlik/performans matrisi (hangi rotaların TEMSİLCİ olduğu bir
 *     editoryal karardır; tüm rotalarda axe koşmak süreyi gereksiz uzatır)
 *   - sözleşmedeki taşma test genişlikleri
 */

/** RSS beslemeleri. Sayfa değil kaynak oldukları için keşif bunları bulmaz. */
export const FEED_ROUTES = ["/rss.xml", "/en/rss.xml"] as const;

/**
 * Erişilebilirlik, CLS ve ağırlık ölçümü için KRİTİK rota matrisi.
 * Her şablon ailesinden en az bir temsilci taşır.
 */
export const CRITICAL_ROUTES = [
  "/",
  "/en/",
  "/cozumler/",
  "/cozumler/operasyonel-gorunurluk/",
  "/cyclops/",
  "/hakkimizda/",
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
