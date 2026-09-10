/**
 * URL MİGRASYONU — TEK MAKİNE-OKUNABİLİR KAYNAK (S13).
 *
 * S00'da ölçülen 54 legacy URL'nin TAMAMI burada, her biri tek bir kararla:
 *
 *   preserve   — adres aynı kalır (yeni sitede de bu yol var)
 *   301-exact  — birebir karşılığı olan yeni adrese kalıcı yönlendirme
 *   301-merged — birden çok eski sayfa tek yeni sayfada birleşti
 *   410        — içerik kaldırıldı ve karşılığı yok (Gone)
 *
 * KURALLAR
 * - Kör homepage yönlendirmesi YOK: hiçbir kayıt "bilmiyorum, ana sayfaya at"
 *   demez. Karşılığı olmayan sayfa 410 döner.
 * - Zincir YOK: her hedef NİHAİ adrestir (başka bir redirect kaynağı olamaz).
 * - Döngü YOK: hedef kendi kaynağına eşit olamaz.
 * Üçü de `tests/unit/redirects.test.ts` tarafından denetlenir.
 *
 * Bu dosyadan sağlayıcıdan bağımsız çıktılar üretilir (`scripts/build-redirects.mjs`):
 * test edilebilir manifest, `_redirects` ve nginx örnek mapping. CANLI SUNUCUDA
 * UYGULAMA YAPILMAZ.
 */

export type RedirectKind = "preserve" | "301-exact" | "301-merged" | "410";

export interface RedirectRule {
  /** Legacy yol (origin'siz, sondaki `/` ile). */
  readonly from: string;
  readonly kind: RedirectKind;
  /** `410` için hedef YOKTUR. */
  readonly to?: string;
  /** Kararın gerekçesi — inceleyen taraf için. */
  readonly reason: string;
}

/**
 * Politika sayfaları için hedef.
 *
 * Yeni sitede tek bir taslak aydınlatma metni vardır; eski KVKK/politika
 * sayfalarının tamamı ona birleşir. Hukuki metin onaylanana kadar bu sayfa
 * taslaktır ve `noindex` kalır — yönlendirme yine de kırık link üretmez.
 */
const LEGAL_TARGET = "/aydinlatma-metni/";

export const REDIRECTS: readonly RedirectRule[] = [
  // --- core -------------------------------------------------------------
  { from: "/", kind: "preserve", reason: "Ana sayfa yeni sitede de kök adreste." },
  {
    from: "/hakkimizda/",
    kind: "preserve",
    reason: "Kurumsal sayfa aynı adreste yeniden yazıldı.",
  },
  { from: "/iletisim/", kind: "preserve", reason: "İletişim sayfası aynı adreste." },
  {
    from: "/blog/",
    kind: "301-exact",
    to: "/icgoruler/",
    reason: "Blog, İçgörüler olarak yeniden adlandırıldı.",
  },

  // --- hizmetler --------------------------------------------------------
  {
    from: "/danismanlik/",
    kind: "301-merged",
    to: "/hizmetler/",
    reason: "Danışmanlık başlığı hizmetler sayfasında birleşti; ayrı detay rotası ÜRETİLMİYOR.",
  },
  {
    from: "/egitim/",
    kind: "301-merged",
    to: "/hizmetler/",
    reason: "Eğitim başlığı hizmetler sayfasında birleşti; ayrı detay rotası ÜRETİLMİYOR.",
  },
  {
    from: "/destek/",
    kind: "301-merged",
    to: "/hizmetler/",
    reason: "Destek başlığı hizmetler sayfasında birleşti; ayrı detay rotası ÜRETİLMİYOR.",
  },
  {
    from: "/yonetilen-hizmetler/",
    kind: "301-merged",
    to: "/hizmetler/",
    reason:
      "Yönetilen hizmetler başlığı hizmetler sayfasında birleşti; ayrı detay rotası ÜRETİLMİYOR.",
  },
  {
    from: "/dis-kaynak-yonetimi/",
    kind: "301-merged",
    to: "/hizmetler/",
    reason:
      "Dış kaynak yönetimi başlığı hizmetler sayfasında birleşti; ayrı detay rotası ÜRETİLMİYOR.",
  },

  // --- çözüm alanları: birebir eşleşenler --------------------------------
  {
    from: "/aiops/",
    kind: "301-exact",
    to: "/cozumler/aiops-ve-olay-yasam-dongusu/",
    reason: "AIOps çözüm alanı birebir karşılık.",
  },
  {
    from: "/itsm/",
    kind: "301-exact",
    to: "/cozumler/bt-hizmet-yonetimi/",
    reason: "ITSM çözüm alanı birebir karşılık.",
  },
  {
    from: "/konfigurasyon-ve-varlik-yonetimi/",
    kind: "301-exact",
    to: "/cozumler/konfigurasyon-ve-varlik-yonetimi/",
    reason: "Aynı konu, yeni çözüm rotasında.",
  },
  {
    from: "/apm/",
    kind: "301-exact",
    to: "/cozumler/operasyonel-gorunurluk/",
    reason: "APM, gözlemlenebilirlik çözüm alanının parçası.",
  },
  {
    from: "/butunlesik-izleme-ve-raporlama/",
    kind: "301-exact",
    to: "/cozumler/operasyonel-gorunurluk/",
    reason: "Bütünleşik izleme, operasyonel görünürlük alanına karşılık geliyor.",
  },
  {
    from: "/yazilim-gelistirme/",
    kind: "301-exact",
    to: "/cozumler/muhendislik-ve-urun-gelistirme/",
    reason: "Yazılım geliştirme, mühendislik çözüm alanı.",
  },

  // --- çözüm alanları: birleşenler ---------------------------------------
  {
    from: "/itom/",
    kind: "301-merged",
    to: "/cozumler/",
    reason: "ITOM tek bir alana karşılık gelmiyor; çözüm atlasında birleşti.",
  },
  {
    from: "/devops/",
    kind: "301-merged",
    to: "/cozumler/otomasyon/",
    reason: "DevOps sayfasının içeriği otomasyon alanında birleşti.",
  },
  {
    from: "/raporlama-ve-gorsellestirme/",
    kind: "301-merged",
    to: "/cozumler/operasyonel-gorunurluk/",
    reason: "Raporlama/görselleştirme görünürlük alanında birleşti.",
  },
  {
    from: "/veritabani-yonetimi/",
    kind: "301-merged",
    to: "/cozumler/veri-akisi-ve-entegrasyon/",
    reason: "Veritabanı yönetimi, veri akışı alanında birleşti.",
  },
  {
    from: "/postgre-migration/",
    kind: "301-merged",
    to: "/cozumler/veri-akisi-ve-entegrasyon/",
    reason: "Migrasyon içeriği veri akışı alanında birleşti.",
  },
  {
    from: "/predictive-analytics/",
    kind: "301-merged",
    to: "/cozumler/aiops-ve-olay-yasam-dongusu/",
    reason: "Öngörüsel analitik, AIOps alanında birleşti.",
  },
  {
    from: "/hybrid-cloud-management/",
    kind: "301-merged",
    to: "/cozumler/operasyonel-gorunurluk/",
    reason: "Hibrit bulut yönetimi görünürlük alanında birleşti.",
  },
  {
    from: "/compliance-and-security-vulnerability/",
    kind: "301-merged",
    to: "/cozumler/konfigurasyon-ve-varlik-yonetimi/",
    reason: "Uyumluluk/açık yönetimi, konfigürasyon alanında birleşti.",
  },

  // --- sektörel çözüm sayfaları ------------------------------------------
  {
    from: "/atm-ve-kiosk-uygulamalari/",
    kind: "410",
    reason:
      "Sektörel vaka sayfası; yeni sitede müşteri/sektör iddiası yayınlanmıyor ve karşılığı yok.",
  },
  {
    from: "/online-bankacilik-ve-cozumleri/",
    kind: "410",
    reason: "Sektörel vaka sayfası; karşılığı yok.",
  },
  {
    from: "/hastane-izleme-ve-yonetim-cozumleri/",
    kind: "410",
    reason: "Sektörel vaka sayfası; karşılığı yok.",
  },
  {
    from: "/universite-altyapi-izleme-ve-yonetim-cozumleri/",
    kind: "410",
    reason: "Sektörel vaka sayfası; karşılığı yok.",
  },
  {
    from: "/iot-monitoring/",
    kind: "410",
    reason: "IoT izleme sayfasının yeni çözüm atlasında karşılığı yok.",
  },

  // --- blog yazıları -----------------------------------------------------
  {
    from: "/atm-ve-kiosk-otomasyonu/",
    kind: "410",
    reason: "Eski blog yazısı taşınmadı; müşteri vakası iddiası taşıyor.",
  },
  {
    from: "/atm-yonetiminin-operasyonel-zorluklarini-kolaylastiran-duosis-atm-otomasyonu-cozumu/",
    kind: "410",
    reason: "Eski blog yazısı taşınmadı; müşteri vakası iddiası taşıyor.",
  },

  // --- teknoloji sayfaları ------------------------------------------------
  {
    from: "/zabbix/",
    kind: "301-exact",
    to: "/teknolojiler/",
    reason: "Teknoloji sayfaları tek envanter sayfasında birleşti.",
  },
  {
    from: "/datadog/",
    kind: "301-exact",
    to: "/teknolojiler/",
    reason: "Teknoloji envanterinde listeleniyor.",
  },
  {
    from: "/instana/",
    kind: "301-exact",
    to: "/teknolojiler/",
    reason: "Teknoloji envanterinde listeleniyor.",
  },
  {
    from: "/device42/",
    kind: "301-exact",
    to: "/teknolojiler/",
    reason: "Teknoloji envanterinde listeleniyor.",
  },
  {
    from: "/confluent/",
    kind: "301-exact",
    to: "/teknolojiler/",
    reason: "Teknoloji envanterinde listeleniyor.",
  },
  {
    from: "/ardoq/",
    kind: "301-exact",
    to: "/teknolojiler/",
    reason: "Teknoloji envanterinde listeleniyor.",
  },
  {
    from: "/quest/",
    kind: "301-exact",
    to: "/teknolojiler/",
    reason: "Teknoloji envanterinde listeleniyor.",
  },
  {
    from: "/opentext/",
    kind: "301-exact",
    to: "/teknolojiler/",
    reason: "Teknoloji envanterinde listeleniyor.",
  },
  {
    from: "/grafana/",
    kind: "301-merged",
    to: "/teknolojiler/",
    reason: "Kayıt henüz yayına açılmadı; envanter sayfasında birleşti.",
  },
  {
    from: "/pandora-fms/",
    kind: "301-merged",
    to: "/teknolojiler/",
    reason: "Kayıt henüz yayına açılmadı; envanter sayfasında birleşti.",
  },
  {
    from: "/runecast/",
    kind: "301-merged",
    to: "/teknolojiler/",
    reason: "Kayıt henüz yayına açılmadı; envanter sayfasında birleşti.",
  },
  {
    from: "/stor2rrd/",
    kind: "301-merged",
    to: "/teknolojiler/",
    reason: "Kayıt henüz yayına açılmadı; envanter sayfasında birleşti.",
  },
  {
    from: "/vertica/",
    kind: "301-merged",
    to: "/teknolojiler/",
    reason: "Kayıt henüz yayına açılmadı; envanter sayfasında birleşti.",
  },
  {
    from: "/postgre/",
    kind: "301-merged",
    to: "/teknolojiler/",
    reason: "Kayıt henüz yayına açılmadı; envanter sayfasında birleşti.",
  },
  {
    from: "/kron-teknoloji/",
    kind: "301-merged",
    to: "/teknolojiler/",
    reason: "Kayıt henüz yayına açılmadı; envanter sayfasında birleşti.",
  },

  // --- politika / KVKK ----------------------------------------------------
  {
    from: "/kisisel-verilerin-korunmasi-politikasi/",
    kind: "301-merged",
    to: LEGAL_TARGET,
    reason: "Politika sayfaları tek aydınlatma metninde birleşti.",
  },
  {
    from: "/kvkk-aydinlatma-metni/",
    kind: "301-merged",
    to: LEGAL_TARGET,
    reason: "Politika sayfaları tek aydınlatma metninde birleşti.",
  },
  {
    from: "/kvkk-aydinlatma-beyani/",
    kind: "301-merged",
    to: LEGAL_TARGET,
    reason: "Politika sayfaları tek aydınlatma metninde birleşti.",
  },
  {
    from: "/kvkk-cerez-politikasi/",
    kind: "301-merged",
    to: LEGAL_TARGET,
    reason: "Çerez politikası içeriği aydınlatma metninde birleşti.",
  },
  {
    from: "/kisisel-verilerin-korunmasi-gizliligi-ve-imha-edilmesi-politikasi/",
    kind: "301-merged",
    to: LEGAL_TARGET,
    reason: "Politika sayfaları tek aydınlatma metninde birleşti.",
  },
  {
    from: "/bilgi-guvenligi-yonetim-sistemi-politikamiz/",
    kind: "410",
    reason: "Bilgi güvenliği politikası metni yeni sitede yayınlanmıyor; uydurma metin üretilmez.",
  },
  {
    from: "/kvkk-basvuru/",
    kind: "410",
    reason:
      "Başvuru formu kişisel veri toplar; hukuk onayı ve süreç sahibi belirlenene kadar yayınlanmaz.",
  },

  // --- kariyer -------------------------------------------------------------
  {
    from: "/is-ilanlari/",
    kind: "410",
    reason: "Kariyer rotası yeni rota haritasında yok; ilan verisi doğrulanmadı.",
  },
  {
    from: "/basvuru-formu/",
    kind: "410",
    reason: "Başvuru formu kişisel veri toplar; kariyer süreci tanımlanmadan yayınlanmaz.",
  },
] as const;

/** Yönlendirme çıktısı üretilen kayıtlar (preserve hariç). */
export function activeRedirects(): readonly RedirectRule[] {
  return REDIRECTS.filter((rule) => rule.kind !== "preserve");
}

/** HTTP durum kodu. */
export function statusFor(kind: RedirectKind): number {
  return kind === "410" ? 410 : 301;
}
