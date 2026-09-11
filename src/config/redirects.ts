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
  /**
   * KURALIN KAYNAĞI.
   *
   * `s00-legacy` : S00'da ölçülen 54 eski site adresinden biri. Bu küme
   *                KAPALIDIR ve `tests/unit/redirects.test.ts` tam kapsamını
   *                denetler — bir tanesi eksilirse veya envanterde olmayan
   *                bir adres eklenirse test kırılır.
   * `internal`   : yeni sitenin KENDİ içinde taşıdığı rota (ör. CyclOps'un
   *                ürün ailesine geçmesi). Legacy envanterine ait değildir;
   *                onu envantere karıştırmak S00 kapsam denetimini
   *                anlamsızlaştırırdı.
   */
  readonly origin: "s00-legacy" | "internal";
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
  /*
   * S14 — CYCLOPS ÜRÜN AİLESİNE TAŞINDI.
   *
   * CyclOps artık tek başına bir ana navigasyon öğesi değil, dört ürünün
   * oluşturduğu ailenin bir üyesi. Kanonik adres `/urunler/cyclops/`.
   *
   * Eski adres SİLİNMEDİ, YÖNLENDİRİLDİ: aynı içeriğin iki indekslenebilir
   * URL'de bulunmaması gerekiyor, ama var olan bağlantılar da kırılmamalı.
   */
  {
    origin: "internal",
    from: "/cyclops/",
    kind: "301-exact",
    to: "/urunler/cyclops/",
    reason: "CyclOps ürün ailesine taşındı; kanonik adres /urunler/cyclops/.",
  },
  {
    origin: "internal",
    from: "/en/cyclops/",
    kind: "301-exact",
    to: "/en/products/cyclops/",
    reason: "CyclOps ürün ailesine taşındı; kanonik adres /en/products/cyclops/.",
  },
  // --- core -------------------------------------------------------------
  {
    origin: "s00-legacy",
    from: "/",
    kind: "preserve",
    reason: "Ana sayfa yeni sitede de kök adreste.",
  },
  {
    origin: "s00-legacy",
    from: "/hakkimizda/",
    kind: "preserve",
    reason: "Kurumsal sayfa aynı adreste yeniden yazıldı.",
  },
  {
    origin: "s00-legacy",
    from: "/iletisim/",
    kind: "preserve",
    reason: "İletişim sayfası aynı adreste.",
  },
  {
    origin: "s00-legacy",
    from: "/blog/",
    kind: "301-exact",
    to: "/icgoruler/",
    reason: "Blog, İçgörüler olarak yeniden adlandırıldı.",
  },

  // --- hizmetler --------------------------------------------------------
  {
    origin: "s00-legacy",
    from: "/danismanlik/",
    kind: "301-merged",
    to: "/hizmetler/",
    reason: "Danışmanlık başlığı hizmetler sayfasında birleşti; ayrı detay rotası ÜRETİLMİYOR.",
  },
  {
    origin: "s00-legacy",
    from: "/egitim/",
    kind: "301-merged",
    to: "/hizmetler/",
    reason: "Eğitim başlığı hizmetler sayfasında birleşti; ayrı detay rotası ÜRETİLMİYOR.",
  },
  {
    origin: "s00-legacy",
    from: "/destek/",
    kind: "301-merged",
    to: "/hizmetler/",
    reason: "Destek başlığı hizmetler sayfasında birleşti; ayrı detay rotası ÜRETİLMİYOR.",
  },
  {
    origin: "s00-legacy",
    from: "/yonetilen-hizmetler/",
    kind: "301-merged",
    to: "/hizmetler/",
    reason:
      "Yönetilen hizmetler başlığı hizmetler sayfasında birleşti; ayrı detay rotası ÜRETİLMİYOR.",
  },
  {
    origin: "s00-legacy",
    from: "/dis-kaynak-yonetimi/",
    kind: "301-merged",
    to: "/hizmetler/",
    reason:
      "Dış kaynak yönetimi başlığı hizmetler sayfasında birleşti; ayrı detay rotası ÜRETİLMİYOR.",
  },

  // --- çözüm alanları: birebir eşleşenler --------------------------------
  {
    origin: "s00-legacy",
    from: "/aiops/",
    kind: "301-exact",
    to: "/cozumler/aiops-ve-olay-yasam-dongusu/",
    reason: "AIOps çözüm alanı birebir karşılık.",
  },
  {
    origin: "s00-legacy",
    from: "/itsm/",
    kind: "301-exact",
    to: "/cozumler/bt-hizmet-yonetimi/",
    reason: "ITSM çözüm alanı birebir karşılık.",
  },
  {
    origin: "s00-legacy",
    from: "/konfigurasyon-ve-varlik-yonetimi/",
    kind: "301-exact",
    to: "/cozumler/konfigurasyon-ve-varlik-yonetimi/",
    reason: "Aynı konu, yeni çözüm rotasında.",
  },
  {
    origin: "s00-legacy",
    from: "/apm/",
    kind: "301-exact",
    to: "/cozumler/operasyonel-gorunurluk/",
    reason: "APM, gözlemlenebilirlik çözüm alanının parçası.",
  },
  {
    origin: "s00-legacy",
    from: "/butunlesik-izleme-ve-raporlama/",
    kind: "301-exact",
    to: "/cozumler/operasyonel-gorunurluk/",
    reason: "Bütünleşik izleme, operasyonel görünürlük alanına karşılık geliyor.",
  },
  {
    origin: "s00-legacy",
    from: "/yazilim-gelistirme/",
    kind: "301-exact",
    to: "/cozumler/muhendislik-ve-urun-gelistirme/",
    reason: "Yazılım geliştirme, mühendislik çözüm alanı.",
  },

  // --- çözüm alanları: birleşenler ---------------------------------------
  {
    origin: "s00-legacy",
    from: "/itom/",
    kind: "301-merged",
    to: "/cozumler/",
    reason: "ITOM tek bir alana karşılık gelmiyor; çözüm atlasında birleşti.",
  },
  {
    origin: "s00-legacy",
    from: "/devops/",
    kind: "301-merged",
    to: "/cozumler/otomasyon/",
    reason: "DevOps sayfasının içeriği otomasyon alanında birleşti.",
  },
  {
    origin: "s00-legacy",
    from: "/raporlama-ve-gorsellestirme/",
    kind: "301-merged",
    to: "/cozumler/operasyonel-gorunurluk/",
    reason: "Raporlama/görselleştirme görünürlük alanında birleşti.",
  },
  {
    origin: "s00-legacy",
    from: "/veritabani-yonetimi/",
    kind: "301-merged",
    to: "/cozumler/veri-akisi-ve-entegrasyon/",
    reason: "Veritabanı yönetimi, veri akışı alanında birleşti.",
  },
  {
    origin: "s00-legacy",
    from: "/postgre-migration/",
    kind: "301-merged",
    to: "/cozumler/veri-akisi-ve-entegrasyon/",
    reason: "Migrasyon içeriği veri akışı alanında birleşti.",
  },
  {
    origin: "s00-legacy",
    from: "/predictive-analytics/",
    kind: "301-merged",
    to: "/cozumler/aiops-ve-olay-yasam-dongusu/",
    reason: "Öngörüsel analitik, AIOps alanında birleşti.",
  },
  {
    origin: "s00-legacy",
    from: "/hybrid-cloud-management/",
    kind: "301-merged",
    to: "/cozumler/operasyonel-gorunurluk/",
    reason: "Hibrit bulut yönetimi görünürlük alanında birleşti.",
  },
  {
    origin: "s00-legacy",
    from: "/compliance-and-security-vulnerability/",
    kind: "301-merged",
    to: "/cozumler/konfigurasyon-ve-varlik-yonetimi/",
    reason: "Uyumluluk/açık yönetimi, konfigürasyon alanında birleşti.",
  },

  // --- sektörel çözüm sayfaları ------------------------------------------
  {
    origin: "s00-legacy",
    from: "/atm-ve-kiosk-uygulamalari/",
    kind: "410",
    reason:
      "Sektörel vaka sayfası; yeni sitede müşteri/sektör iddiası yayınlanmıyor ve karşılığı yok.",
  },
  {
    origin: "s00-legacy",
    from: "/online-bankacilik-ve-cozumleri/",
    kind: "410",
    reason: "Sektörel vaka sayfası; karşılığı yok.",
  },
  {
    origin: "s00-legacy",
    from: "/hastane-izleme-ve-yonetim-cozumleri/",
    kind: "410",
    reason: "Sektörel vaka sayfası; karşılığı yok.",
  },
  {
    origin: "s00-legacy",
    from: "/universite-altyapi-izleme-ve-yonetim-cozumleri/",
    kind: "410",
    reason: "Sektörel vaka sayfası; karşılığı yok.",
  },
  {
    origin: "s00-legacy",
    from: "/iot-monitoring/",
    kind: "410",
    reason: "IoT izleme sayfasının yeni çözüm atlasında karşılığı yok.",
  },

  // --- blog yazıları -----------------------------------------------------
  {
    origin: "s00-legacy",
    from: "/atm-ve-kiosk-otomasyonu/",
    kind: "410",
    reason: "Eski blog yazısı taşınmadı; müşteri vakası iddiası taşıyor.",
  },
  {
    origin: "s00-legacy",
    from: "/atm-yonetiminin-operasyonel-zorluklarini-kolaylastiran-duosis-atm-otomasyonu-cozumu/",
    kind: "410",
    reason: "Eski blog yazısı taşınmadı; müşteri vakası iddiası taşıyor.",
  },

  // --- teknoloji sayfaları ------------------------------------------------
  {
    origin: "s00-legacy",
    from: "/zabbix/",
    kind: "301-exact",
    to: "/teknolojiler/",
    reason: "Teknoloji sayfaları tek envanter sayfasında birleşti.",
  },
  {
    origin: "s00-legacy",
    from: "/datadog/",
    kind: "301-exact",
    to: "/teknolojiler/",
    reason: "Teknoloji envanterinde listeleniyor.",
  },
  {
    origin: "s00-legacy",
    from: "/instana/",
    kind: "301-exact",
    to: "/teknolojiler/",
    reason: "Teknoloji envanterinde listeleniyor.",
  },
  {
    origin: "s00-legacy",
    from: "/device42/",
    kind: "301-exact",
    to: "/teknolojiler/",
    reason: "Teknoloji envanterinde listeleniyor.",
  },
  {
    origin: "s00-legacy",
    from: "/confluent/",
    kind: "301-exact",
    to: "/teknolojiler/",
    reason: "Teknoloji envanterinde listeleniyor.",
  },
  {
    origin: "s00-legacy",
    from: "/ardoq/",
    kind: "301-exact",
    to: "/teknolojiler/",
    reason: "Teknoloji envanterinde listeleniyor.",
  },
  {
    origin: "s00-legacy",
    from: "/quest/",
    kind: "301-exact",
    to: "/teknolojiler/",
    reason: "Teknoloji envanterinde listeleniyor.",
  },
  {
    origin: "s00-legacy",
    from: "/opentext/",
    kind: "301-exact",
    to: "/teknolojiler/",
    reason: "Teknoloji envanterinde listeleniyor.",
  },
  {
    origin: "s00-legacy",
    from: "/grafana/",
    kind: "301-merged",
    to: "/teknolojiler/",
    reason: "Kayıt henüz yayına açılmadı; envanter sayfasında birleşti.",
  },
  {
    origin: "s00-legacy",
    from: "/pandora-fms/",
    kind: "301-merged",
    to: "/teknolojiler/",
    reason: "Kayıt henüz yayına açılmadı; envanter sayfasında birleşti.",
  },
  {
    origin: "s00-legacy",
    from: "/runecast/",
    kind: "301-merged",
    to: "/teknolojiler/",
    reason: "Kayıt henüz yayına açılmadı; envanter sayfasında birleşti.",
  },
  {
    origin: "s00-legacy",
    from: "/stor2rrd/",
    kind: "301-merged",
    to: "/teknolojiler/",
    reason: "Kayıt henüz yayına açılmadı; envanter sayfasında birleşti.",
  },
  {
    origin: "s00-legacy",
    from: "/vertica/",
    kind: "301-merged",
    to: "/teknolojiler/",
    reason: "Kayıt henüz yayına açılmadı; envanter sayfasında birleşti.",
  },
  {
    origin: "s00-legacy",
    from: "/postgre/",
    kind: "301-merged",
    to: "/teknolojiler/",
    reason: "Kayıt henüz yayına açılmadı; envanter sayfasında birleşti.",
  },
  {
    origin: "s00-legacy",
    from: "/kron-teknoloji/",
    kind: "301-merged",
    to: "/teknolojiler/",
    reason: "Kayıt henüz yayına açılmadı; envanter sayfasında birleşti.",
  },

  // --- politika / KVKK ----------------------------------------------------
  {
    origin: "s00-legacy",
    from: "/kisisel-verilerin-korunmasi-politikasi/",
    kind: "301-merged",
    to: LEGAL_TARGET,
    reason: "Politika sayfaları tek aydınlatma metninde birleşti.",
  },
  {
    origin: "s00-legacy",
    from: "/kvkk-aydinlatma-metni/",
    kind: "301-merged",
    to: LEGAL_TARGET,
    reason: "Politika sayfaları tek aydınlatma metninde birleşti.",
  },
  {
    origin: "s00-legacy",
    from: "/kvkk-aydinlatma-beyani/",
    kind: "301-merged",
    to: LEGAL_TARGET,
    reason: "Politika sayfaları tek aydınlatma metninde birleşti.",
  },
  {
    origin: "s00-legacy",
    from: "/kvkk-cerez-politikasi/",
    kind: "301-merged",
    to: LEGAL_TARGET,
    reason: "Çerez politikası içeriği aydınlatma metninde birleşti.",
  },
  {
    origin: "s00-legacy",
    from: "/kisisel-verilerin-korunmasi-gizliligi-ve-imha-edilmesi-politikasi/",
    kind: "301-merged",
    to: LEGAL_TARGET,
    reason: "Politika sayfaları tek aydınlatma metninde birleşti.",
  },
  {
    origin: "s00-legacy",
    from: "/bilgi-guvenligi-yonetim-sistemi-politikamiz/",
    kind: "410",
    reason: "Bilgi güvenliği politikası metni yeni sitede yayınlanmıyor; uydurma metin üretilmez.",
  },
  {
    origin: "s00-legacy",
    from: "/kvkk-basvuru/",
    kind: "410",
    reason:
      "Başvuru formu kişisel veri toplar; hukuk onayı ve süreç sahibi belirlenene kadar yayınlanmaz.",
  },

  // --- kariyer -------------------------------------------------------------
  {
    origin: "s00-legacy",
    from: "/is-ilanlari/",
    kind: "410",
    reason: "Kariyer rotası yeni rota haritasında yok; ilan verisi doğrulanmadı.",
  },
  {
    origin: "s00-legacy",
    from: "/basvuru-formu/",
    kind: "410",
    reason: "Başvuru formu kişisel veri toplar; kariyer süreci tanımlanmadan yayınlanmaz.",
  },
] as const;

/** S00'da ölçülen legacy adres kuralları — kapsam denetimi bunları kullanır. */
export function legacyRedirects(): readonly RedirectRule[] {
  return REDIRECTS.filter((rule) => rule.origin === "s00-legacy");
}

/** Yönlendirme çıktısı üretilen kayıtlar (preserve hariç). */
export function activeRedirects(): readonly RedirectRule[] {
  return REDIRECTS.filter((rule) => rule.kind !== "preserve");
}

/** HTTP durum kodu. */
export function statusFor(kind: RedirectKind): number {
  return kind === "410" ? 410 : 301;
}
