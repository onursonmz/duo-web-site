# S15-R1 — Görsel onay checkpoint'i

**Durum:** görsel yön onayı bekleniyor. Talimat bölüm 9 gereği tüm sayfalara
yayılmadan ÖNCE durduk.

**Branch:** `duosis-web/s14-s15-signature-release` (aynı branch, ileri yönlü
corrective commit; geçmiş değiştirilmedi)

---

## 1. Checkpoint kanıtı

Talimatın istediği üç kanıt `evidence/s15-r1/` altında üretildi. Süreler
dosyadan ölçüldü, tahmin değil.

| İstenen                                              | Dosya                               | Ölçüm       |
| ---------------------------------------------------- | ----------------------------------- | ----------- |
| Yeni hero — 1440×900 ekran görüntüsü                 | `01-hero-desktop-1440x900.png`      | 1440×900    |
| Yeni hero — 15–20 sn video                           | `video/01-hero.webm`                | **18,9 sn** |
| Ürün ekosistemi — dört ürün dönüşümü, 20–30 sn video | `video/02-product-ecosystem.webm`   | **28,0 sn** |
| Üç section transition — kısa scroll videosu          | `video/03-section-transitions.webm` | **25,4 sn** |

Kararı destekleyen ek sabit kareler:

- `02-hero-1366x768.png` — ikinci masaüstü ölçüsü
- `03-hero-mobile-390.png` — mobil kompozisyon
- `04-hero-reduced-motion.png` — hareket azaltmada ANLAMLI SON durum
- `05-hero-nojs.png` — JavaScript kapalı
- `06/07/08-hero-state-*.png` — başlangıç / orta / final kareleri
- `09-1..3-transition-*.png` — üç geçiş bandı
- `10-1..4-product-*.png` — dört ürün sahnesi

`evidence/s15-r1/evidence.json`: **yatay taşma 0**, **konsol hatası 0**.

---

## 2. Yapılanlar

### 2.1 Hero — Duosis Operational Universe

İnce alt-çizgi şeması kaldırıldı. Hero artık **ekranı dolduran, beş katmanlı
bir 3B sahne**:

- `perspective: 1400px` altında beş katman (mimari ızgara, uzak alan, akış,
  çekirdek, yakın plan). Derinlik `translateZ` ile gerçek; blur ve opaklık
  derinlikten türüyor.
- Sinyaller sisten çıkar (metrik, log, event, trace, alarm — etiketli
  portlar), çekirdeğin açıklığında birleşir, **bakır karar noktasından** geçer,
  aksiyon çerçevesine bağlanır ve geri besleme hattıyla çekirdeğe döner.
- **Kamera:** işaretçiye bağlı kontrollü parallax, ~1 KB JS. Hareket azaltma,
  dokunmatik, `save-data` ve viewport dışında hiç çalışmaz.
- Scroll'da kamera geri çekilir (`animation-timeline: view()`, JS yok).
- **Hero yüksekliği ölçüldü: viewport'un %88'i** (85–100vh aralığında).
- H1/açıklama/CTA hiçbir animasyon taşımaz; ilk karede son hâlindedir.

**Mobil:** yatay akış portre ekranda kırpıldığı için önce ayrı bir dikey SVG
denendi — **ölçüldü ve reddedildi**: metnin arkasına düşüp okunurluğu
bozuyordu. Yerine harita **aşama rayının kendisine** taşındı: kesintisiz sinyal
omurgası, bakır karar düğümü, kare aksiyon düğümü. Arka planda yalnızca çok
silik CSS ızgarası ve tek bir ışık kaldı.

### 2.2 Bölüm geçişleri

Sert beyaz/siyah dikdörtgen sınırlar kaldırıldı. Ortak görsel dil **dağıtım
barası**: dik inen kısa hatlar, yatay bir toplama/dağıtım barası ve tek omurga.

| Geçiş                      | Varyant    | Ne yapar                                                                             |
| -------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| Hero → Çözüm atlası        | `flow-out` | Omurga hero çekirdeğinin ekseninden iner, sayfa eksenine devreder, sekiz dala açılır |
| Çözüm atlası → Ürün evreni | `aperture` | Sekiz hat tek demette toplanır, koyu katmana açılan aralıktan girer                  |
| 10. yıl → İletişim finali  | `converge` | On yılın çentikleri BUGÜN'ü işaretleyen bakır noktada toplanır, CTA'ya iner          |
| Aynı yüzeydeki komşular    | `seam`     | Yüzey değişmez, omurga kesintisiz devam eder (noktalama işareti)                     |

Yüzey maskeyle açılır (`clip-path`), yalnız opacity ile değil. Scroll'a bağlı
açılış `animation-timeline` iledir; **scroll hijacking yok** ve bu artık
ölçülüyor (aşağıya bakınız).

**Bunun için iki yapısal değişiklik yapıldı:**

1. **10. yıl bölümü sayfanın SONUNA alındı.** "10. yıl → iletişim finali"
   geçişinin kurulabilmesi için iki bölümün komşu olması gerekiyordu. Anlatı
   sırası da bunu destekliyor: ne yaptığımız → nasıl → on yıldır kim olduğumuz
   → konuşalım. `tests/e2e/homepage.spec.ts` içindeki sözleşme sırası
   gerekçesiyle güncellendi.
2. **Teknoloji katmanları KOYU yüzeye alındı.** Art arda altı açık bölüm
   sayfayı düzleştiriyordu; teknoloji atlası anlatının "altyapı" katmanı
   olduğu için koyu grafit zemine oturuyor.

### 2.3 Ürün ekosistemi — dört gerçekten farklı sahne

Aynı SVG'nin dört varyasyonu kaldırıldı. Her ürünün **kendi sahnesi** var
(`ProductScene.astro`); topoloji, düğümler ve hareketin anlamı farklı:

| Ürün     | Hareket dili | Sahne                                                                                               |
| -------- | ------------ | --------------------------------------------------------------------------------------------------- |
| CyclOps  | `converge`   | Beş dağınık kaynak korelasyon düğümünde birleşir, TEK yaşam döngüsü rayına iner, döngü geri kapanır |
| Hermes   | `organise`   | Dağınık kayıtlar müşteri-proje ızgarasına oturur, rapor çubukları dolar                             |
| LogiSlot | `allocate`   | Talep üç kural kapısından geçer, uygun olmayan saatler elenir, tek hücreye **bakır** yerleşir       |
| RAVSKALD | `answer`     | Soru üç bağlam bandından iner, her bantta kanıt toplar, kanıtıyla geri döner                        |

- Düğümler boş kutu değil: her bölgenin sözlükten gelen etiketi var, her ürünün
  **doğrulanmış `workflow` adımları** numaralı liste olarak okunuyor (3/4/5/6
  adım — topoloji gerçekten farklı).
- Kontroller gerçek `<button>`, WAI-ARIA tab deseni, ok tuşlarıyla gezinme.
- **Otomatik dönen carousel yok** — test ölçüyor.
- JS kapalıyken dört ürün de sahnesiyle birlikte okunuyor.
- Hareket azaltmada sahneler anlamlı son durumda duruyor.

---

## 3. Bu turda bulunan İKİ ÜRETİM HATASI

İkisi de "çalışıyor sanılan ama çalışmayan" sınıfından; ikisi de S15'ten
geliyordu.

### 3.1 Scroll tabanlı açılışlar üretim derlemesinde HİÇ çalışmıyordu

CSS küçültücü `animation: <ad> linear both` ile `animation-timeline: view()`
bildirimini birleştiriyor. Ortaya çıkan `animation: linear both <ad> view()`
kısayolu tarayıcıda **geçersiz** olduğu için kuralın tamamı düşüyor ve
`animation-name` `none` oluyordu. Geliştirme sunucusunda CSS küçültülmediği
için sorun görünmüyordu — yani S15'te teslim edilen decade açılışı da hiç
oynamamıştı.

**Çözüm:** zaman çizelgesi `var(--scroll-timeline)` üzerinden okunuyor
(`src/styles/tokens.css`). **Regresyon koruması:**
`tests/e2e/motion-system.spec.ts` hem üretilen CSS'te bozuk kısayolu arıyor hem
tarayıcıda `animationName`/`animation-timeline` değerlerini ölçüyor.

### 3.2 Açılış animasyonu metnin kontrastını düşürüyordu

On yıllık yolculuk durakları `opacity: 0.35` ile başlıyordu. Animasyon
gerçekten bağlandıktan sonra henüz görünmemiş duraklar axe tarafından
**gerçek** kontrast ihlali olarak raporlandı (#606468 / #14181c = **2,99:1**,
eşik 4,5:1).

**Çözüm:** açılış maske (`clip-path`) tabanlına çevrildi; opaklık 1'de kaldı.
Bu ayrıca talimattaki "bölümler yalnız opacity ile görünmemeli" kuralını
karşılıyor. **Kural olarak kayda geçti:** metin taşıyan bir öğenin açılışı
opaklık düşürerek yapılmaz.

### 3.3 Ek bulgu — kanıt videoları yanlış adlandırılabiliyordu

Kanıt üreticisi Playwright'ın rastgele hash'li video dosyalarını **dizin
sırasına göre** yeniden adlandırıyordu. Sıralama kayıt sırasıyla ilgisiz
olduğu için videolar birbirinin adını alabiliyordu — bu turda gerçekten oldu
(hero sanılan dosya 50 sn'lik başka bir kayıttı). Artık her videonun yolu
KENDİ video nesnesinden alınıyor. Aynı hata `evidence/s14-s15-shots.mjs`
içinde de vardı; orada da düzeltildi.

---

## 4. Bilinçli olarak değiştirilen iki güvence

Hiçbiri sessizce esnetilmedi; ikisi de testte gerekçesiyle yazılı.

1. **"Hero SIFIR ek client JS getirir" kaldırıldı.** Talimat kontrollü bir
   kamera/parallax istiyor. Yerine ölçülen bir bütçe (satır içi modül toplamı
   < 8 KB ham) ve "JS olmadan da tam çalışır" güvencesi kondu. Ayrıca
   `wheel`/`touchmove`/`mousewheel` dinleyicisinin HİÇ kaydedilmediği,
   `addEventListener` sarmalanarak ölçülüyor.

2. **"Beş aşama METNİ 1366×768'in ilk ekranında" güvencesi daraltıldı.**
   85–100vh'lik bir hero ile beş aşamanın gövde metinleri 768 piksele
   sığmıyor. Ölçülen ve korunan küme: **H1, açıklama, iki CTA ve beş aşama
   BAŞLIĞI** — ikisi de hem 1440×900 hem 1366×768'de ilk viewport içinde.
   Gövdeler ilk kaydırmada okunuyor.

---

## 5. ADR-014 — render kararı yeniden açıldı ve yeniden karara bağlandı

Talimat bölüm 6 gereği "WebGL/Canvas gerekmez" sonucu OPEN yapıldı, yeni bir
spike koşuldu ve sonuç kayda geçti
(`docs/decisions/ADR-014-signature-experience.md`, S15-R1 revizyonu).

**Sonuç: CSS 3B katmanlı SVG; WebGL/Canvas yine kullanılmıyor** — ama bu
S15'teki cevabın tekrarı değil, uygulaması da değişti. Gerekçe:

- İstenen etkilerin tamamı (ölçek, perspektif, blur, katman, kamera) CSS 3B ile
  elde edildi; kanıt hero videosudur.
- WebGL'in ekleyeceği tek fark shader/parçacık sınıfı efektlerdir ve bunlar
  talimatın tasarım sınırlarında **açıkça yasak**. Yani WebGL ulaşılamayan bir
  kalite açmıyor, yalnızca runtime + GPU döngüsü + context kaybı + ayrı
  fallback maliyeti getiriyor.

Aynı revizyonda S15 raporundaki açık madde de kapatıldı: **`LCP < 2,5 s`
hedefi Lighthouse `simulate`+`mobile` kısıtlaması altında geçerlidir**;
kısıtlamasız masaüstü ölçümü ayrı raporlanır.

---

## 6. Bu checkpoint'te koşulan testler

Talimat bölüm 9: "Bu checkpoint'te full 1100+ E2E koşma. Yalnız ilgili
unit/smoke/a11y/performance testlerini çalıştır." Koşulanlar ve **gerçek çıkış
kodları**:

| Komut                                                                            | Sonuç                      |
| -------------------------------------------------------------------------------- | -------------------------- |
| `pnpm format:check` / `pnpm lint`                                                | exit 0                     |
| `pnpm typecheck`                                                                 | exit 0 — 194 dosya, 0 hata |
| `pnpm test` (birim)                                                              | exit 0 — **500 test**      |
| `run-e2e hero.spec.ts motion-system.spec.ts`                                     | exit 0 — **48 test**       |
| `run-e2e --grep @a11y`                                                           | exit 0 — **28 test**       |
| `run-e2e performance + smoke + homepage + route-inventory + nojs + public-voice` | exit 0 — **525 test**      |
| `pnpm build`                                                                     | exit 0 — 72 sayfa          |

Not: `route-inventory` ilk koşuda bir kez `page.goto` zaman aşımıyla düştü
(makine yükü); tek başına yeniden koşuldu ve **144 test exit 0** ile geçti.
Tam süit, görsel yön onayından sonra final HEAD'de koşulacak.

---

## 7. Onaydan SONRA yapılacaklar (bu turda YAPILMADI)

Talimatın 4., 5. ve 10. bölümleri checkpoint'ten sonraya bırakıldı:

- **Ürün detay sayfaları** (bölüm 4): dört ürüne özgü hero sahnesi, uzun metin
  duvarlarının editorial sahnelere bölünmesi, gerçek ürün ekranlarının katmanlı
  premium çerçeveye alınması.
- **Sayfa geçişleri** (bölüm 5): ana sayfa → ürünler → ürün detayı arasında
  View Transitions sürekliliği.
- **Final kanıt düzeltmesi** (bölüm 10): final HEAD sonrası tüm kanıtların
  yeniden üretilmesi, üç Lighthouse raporu, tam quality/CI ve uzak CI URL'si,
  CyclOps logosunun diğer ürün sayfalarında bulunmadığının ekran + test ile
  kanıtlanması.
- Yeni bundle/evidence paketi ve `PACKAGES-S15-R1.sha256`.

Merge, tag veya deployment **yapılmadı** ve yapılmayacak.
