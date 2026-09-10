# S10 + S11 Teslim Raporu

**Branch:** `duosis-web/s10-s11-services-insights`
**Paralel taban (`PARALLEL_BASE`):** `9fc01619c29d540e4e693690a72a5cefa3414631` (`origin/main`)
**S10 checkpoint:** `a2dee8448b9b15d8330a64c3de51f5510576d839`
**S11 final:** _(aşağıda §9)_

Bu branch, S08+S09 çalışmasından **bağımsız bir worktree**de yürütüldü
(`../duo-web-site-s10-s11`). S08+S09 worktree'sine, branch'ine veya geçmişine
dokunulmadı; rebase ve force-push kullanılmadı.

---

## 1. Kapsam

| Sprint | Kapsam                                                                    | Durum      |
| ------ | ------------------------------------------------------------------------- | ---------- |
| S10    | Hizmetler, teknoloji yetenek atlası, bölgesel anlatı, güven/kanıt sistemi | Tamamlandı |
| S11    | İçgörüler yayın sistemi, seri/etiket rotaları, RSS, BlogPosting           | Tamamlandı |

S12'ye geçilmedi.

---

## 2. Açılan rotalar

| Rota                              | Dil   | Sprint |
| --------------------------------- | ----- | ------ |
| `/hizmetler/`                     | TR    | S10    |
| `/en/services/`                   | EN    | S10    |
| `/teknolojiler/`                  | TR    | S10    |
| `/en/technologies/`               | EN    | S10    |
| `/icgoruler/` (yeniden yazıldı)   | TR    | S11    |
| `/en/insights/` (yeniden yazıldı) | EN    | S11    |
| `/icgoruler/<slug>/` × 4          | TR    | S11    |
| `/en/insights/<slug>/` × 1        | EN    | S11    |
| `/icgoruler/seri/<slug>/` × 3     | TR    | S11    |
| `/en/insights/series/<slug>/` × 1 | EN    | S11    |
| `/icgoruler/etiket/<slug>/` × 14  | TR    | S11    |
| `/en/insights/tag/<slug>/` × 4    | EN    | S11    |
| `/rss.xml`, `/en/rss.xml`         | TR/EN | S11    |

Toplam build çıktısı: **56 sayfa + 2 besleme**.

Rota envanteri `tests/support/public-routes.ts` içinde tek kaynaktır ve
`tests/e2e/route-inventory.spec.ts` onu gerçek `dist/` çıktısıyla iki yönlü
karşılaştırır: envantere girmemiş bir rota da, envanterde olup üretilmemiş bir
rota da testi kırar.

---

## 3. S10 — kararlar ve gerekçeleri

### 3.1 Hizmet ≠ çözüm ayrımı şema düzeyinde

`serviceSchema` içinde `problem`, `benefits` veya `capabilities` alanı
**yoktur** — bunlar çözüm kaydının alanları. Hizmet kaydı dört soruyu yanıtlar
ve dördü de zorunludur: ne zaman gerekir, Duosis ne sunar, çalışma biçimi
nedir, somut çıktı nedir.

Ayrım iki yönlü test ediliyor: hizmet sayfasında çözüm şablonu yok, çözüm
detayında hizmet şablonu yok.

### 3.2 Kapalı hizmet kümesi = CTA allowlist'i

`SERVICE_TOPICS` tek liste olarak üç iş görüyor: şema `translationKey`
doğrulaması, anlatı sırası (`order` superRefine ile bu diziye kilitli) ve
iletişim CTA'sının `?topic=` allowlist'i. Altıncı bir hizmet kaydı açılamaz ve
URL'e serbest metin giremez.

Negatif testler: serbest metin, büyük harf varyantı, çözüm slug'ı, script
enjeksiyonu ve ek parametre denemelerinin tamamı reddediliyor.

### 3.3 Teknoloji: logo duvarı değil, yetenek atlası

Sayfa şu sırayla okunuyor: **yetenek katmanı → çözülen problem → çözüm alanı →
o katmanda çalıştığımız teknolojiler.** Ürün adı satırın sonunda ve en sakin
tipografide.

Katmanın problem cümlesi atlas tablosunda **yazılmıyor**; bağlı çözüm
kaydından okunuyor. Aynı cümleyi ikinci kez yazmak, çözüm metni
güncellendiğinde sessizce eskiyen bir kopya bırakırdı.

| Ölçüm                              | Değer       |
| ---------------------------------- | ----------- |
| Public modda görünen teknoloji     | **21 / 21** |
| Karar bekleyen kayıt (görünmez)    | **14**      |
| Üçüncü taraf logosu                | **0**       |
| "Partner / yetkili satıcı" ifadesi | **0**       |

**Logo durumu:** envanterdeki **hiçbir** kaydın yazılı logo izni yok
(`logoPermission: unknown`) — CyclOps dahil. Bu yüzden atlas bileşeni `<img>`
üretmiyor ve public çıktıda tek bir teknoloji logosu bulunmuyor. "CyclOps
dışındaki logoları gösterme" kuralı, hiçbir logo göstermeyerek fazlasıyla
karşılanıyor. CyclOps logosunun yayınlanabilmesi için önce izin kaydının
`allowed` olması ve bir varlık dosyası eklenmesi gerekir (S08 kapsamı).

**Sızıntı taraması** `data-technology` ve `data-technology-id`
**özniteliklerine** bakıyor, metne değil. Bunun sebebi somut: "OpenText" karar
bekleyen bir kayıt, ama aynı metin onaylı "OpenText SMAX" ürün adının içinde de
geçiyor. Alt dize taraması bunu sızıntı sanardı; öznitelik kontrolü kaydın
kimliğini ölçüyor.

### 3.4 Bölgesel bölüm: harita yok, bilinçli

Dekoratif bir dünya haritası burada bilgi taşımaz, taşıdığını sandırır: bir
ülkeyi boyamak "orada ofisimiz var" diye okunur. Elimizde yalnızca doğrulanmış
**bölge adları** var — ofis, yerel ekip, ülke listesi veya müşteri sayısı yok.

Bölüm tipografik bir atlas olarak kuruldu: anlamın tamamı metinde, CSS
yüklenmese bile sıralı liste olarak okunuyor. Hover'a gizlenmiş bilgi yok,
mobilde yatay kaydırma yok, süregiden animasyon yok.

**Test sırasında bulunan iki hata düzeltildi:**

1. Koleksiyon yükleyicisi bölgeleri kimliğe göre alfabetik veriyordu; sayfada
   sıra "Orta Asya, Orta Doğu, Türkiye" olarak çıkıyordu. Kayıtlara açık bir
   `order` alanı eklendi.
2. Bölüm metni "ofis, yerel ekip veya müşteri bilgisi paylaşmıyoruz" diyordu —
   ziyaretçiye yayın politikası anlatmak, anlatılmak isteneni bastırıyordu.
   Cümle kaldırıldı.

### 3.5 Kanıt sistemi: müşteri kanıtı ile iç ölçüm ayrıldı

S00 performans ölçümü ("ana sayfa 7,17 MB") doğrulanmış bir kayıt ama **müşteri
başarısı değil**. Önceki modelde ikisi de `proofs` koleksiyonundaydı ve ikisi de
`verified` olabiliyordu; `verificationStatus` bu farkı göremiyordu.

`proofSchema` artık zorunlu bir `kind` taşıyor (`customer-reference` |
`internal-measurement`) ve `getCustomerProofs` **üç koşulu birden** arıyor:
published + verified + customer-reference.

Şu anda onaylı müşteri referansı **yok** → liste boş → `ProofList` hiçbir şey
render etmiyor. Başlık, boş kutu, placeholder logo duvarı ve "yakında" yazısı
oluşmuyor.

---

## 4. S11 — kararlar ve gerekçeleri

### 4.1 Filtreleme rota ile, query ile değil

Seri ve etiket görünümleri statik rotalar:
`/icgoruler/seri/<slug>/`, `/icgoruler/etiket/<slug>/` ve İngilizce
karşılıkları. Üç sonucu var:

1. adres paylaşılabilir,
2. JavaScript gerekmiyor,
3. **bilinmeyen değer 404 üretiyor** — `getStaticPaths` yalnızca gerçekten
   içeriği olan değerler için sayfa ürettiği için uydurma bir seri adı boş
   liste değil, "bulunamadı" alıyor.

Serbest query parametresiyle filtreleme (`?tag=...`) kullanılmadı: statik
çıktıda sunucu tarafı yok, dolayısıyla filtre ancak istemci JS'iyle
uygulanabilirdi ve bilinmeyen bir değer sessizce boş liste gösterirdi.

Seri slug'ı ile etiketi **ayrı** tutuldu: etiket çevrilebilir ve marka adı
taşıyabilir ("CyclOps Günlüğü"), slug ise URL'de yaşar ve değişmemelidir.

### 4.2 Okuma süresi şemada yok

Elle yazılan bir süre, gövde değiştiğinde sessizce yanlışa dönerdi. Süre
`readingTime.ts` tarafından gövdeden deterministik hesaplanıyor; kod blokları,
satır içi kod, bağlantı hedefleri ve markdown işaretleri sayıma girmiyor.

### 4.3 Tarih biçimi ICU'dan bağımsız

`Intl.DateTimeFormat` kullanılmadı: çıktısı çalıştırıldığı ortamın ICU
verisine bağlı ve küçük ICU ile derlenmiş bir Node sürümünde Türkçe ay adları
İngilizceye düşer — build sırasında, sessizce. Ay adları açıkça yazıldı.

Tarihler UTC alanlarından okunuyor: build makinesinin saat dilimi yayın
tarihini bir gün kaydıramaz.

### 4.4 Öne çıkan yazı = en yeni yazı

Elle işaretlenen bir `featured` bayrağı bilinçli olarak eklenmedi: unutulduğunda
aylarca eski bir yazıyı en üstte tutar.

### 4.5 BlogPosting: yalnızca sayfada görüneni bildirir

JSON-LD nesnesi elle kuruluyor; kaydın tamamını serialize etmek, ileride
eklenen herhangi bir alanın sessizce yapılandırılmış veriye sızması demekti.

| JSON-LD alanı              | Sayfadaki karşılığı                                         |
| -------------------------- | ----------------------------------------------------------- |
| `headline`                 | `<h1>` metni (sayfa başlığı + site adı birleşimi **değil**) |
| `author.name`              | Meta rayındaki yazar                                        |
| `datePublished`            | Meta rayındaki `<time datetime>`                            |
| `dateModified`             | Yalnızca sayfada güncelleme tarihi gösteriliyorsa           |
| `url` / `mainEntityOfPage` | `<link rel="canonical">`                                    |
| `articleSection`           | Görünen seri etiketi                                        |

Test ayrıca `aggregateRating`, `review`, `interactionStatistic`, `sponsor`,
`funder` ve `award` alanlarının **bulunmadığını** doğruluyor.

### 4.6 RSS: bağımsız filtre yok

Besleme `getInsights(..., PUBLIC)` üzerinden — sayfaların kullandığı seçicinin
aynısı. Kendi filtresini yazmadığı için taslak veya ileri tarihli bir kayıt
beslemeye giremez.

Üçüncü taraf RSS paketi kullanılmadı: besleme dört alandan ibaret ve bir paket
eklemek XML kaçışını da o pakete devretmek demekti. `&` kaçışı ilk sırada
yapılıyor; sonra kaçırılsaydı önce üretilen `&lt;` ikinci kez kaçırılıp
`&amp;lt;` olurdu.

### 4.7 Tablo ve kod bloğu: kaydırma yerine sarma

**Bu bir erişilebilirlik kararıdır.** Kaydırılabilir bir bölge, klavyeyle
kaydırılabilmek için `tabindex="0"` ister (WCAG 2.1.1; axe
`scrollable-region-focusable`). Markdown'dan üretilen `<pre>` ve `<table>`
elemanlarına şablondan öznitelik eklenemiyor.

Bir rehype eklentisi denendi ve **geri alındı**: Astro 7'de rehype eklentileri
artık varsayılan olarak kurulmayan `@astrojs/markdown-remark` paketini
gerektiriyor ve bu paket tüm içeriğin dönüşüm hattını değiştiriyor — entegrasyon
öncesinde orantısız bir risk.

Bunun yerine sorun kaynağında çözüldü: `white-space: pre-wrap` ve
`table-layout: fixed` ile kaydırılabilir bölge **hiç oluşmuyor**.

**Kabul edilen sınır:** çok sütunlu bir tablo dar ekranda okunaksız hâle gelir.
`docs/CONTENT_AUTHORING.md` bu yüzden üç sütundan geniş tablo yerine başlıklı
listelere bölmeyi öneriyor.

---

## 5. İçerik

| Yazı                                                  | Dil | Seri            | Kelime |
| ----------------------------------------------------- | --- | --------------- | ------ |
| Zabbix alarmından CyclOps olayına                     | TR  | CyclOps Günlüğü | ~1.140 |
| Toplu işten olay tabanlı veri akışına geçiş           | TR  | Data & AI       | ~1.060 |
| Kurumsal mimariyi envanterden karar sistemine taşımak | TR  | Mimari Notları  | ~880   |
| From nightly batch to event-driven data flow          | EN  | Data & AI       | ~940   |
| Operasyon verisinin dört hâli (S05'ten devralındı)    | TR  | Mimari Notları  | ~260   |

EN yazı ikinci TR yazısının **editoryal karşılığı**; kelimesi kelimesine çeviri
değil — örnekler ve cümle yapısı İngilizce için yeniden kuruldu.

### 5.1 Kaynak politikası — uygulandı

Yazılardaki her kaynak bağlantısı **yayından önce açılıp doğrulandı**:

| Kaynak                          | Doğrulama                                                             |
| ------------------------------- | --------------------------------------------------------------------- |
| Zabbix — Triggers               | Resmî dokümantasyon, "3 Triggers" sayfası; trigger tanımı alıntılandı |
| Apache Kafka — dokümantasyon    | Resmî ASF sitesi                                                      |
| Apache Airflow — DAG kavramları | Resmî dokümantasyon, "Dags" sayfası; bağımlılık tanımı alıntılandı    |

Üçüncü yazı (kurumsal mimari) genel mimari yaklaşımı anlatıyor ve ürün
özelliği iddiası taşımıyor; bu yüzden **kaynak listesi yok** ve kaynak bölümü
hiç render edilmiyor.

### 5.2 İçerik güvenliği

- Müşteri, referans veya partnerlik iddiası: **yok**
- Kaynaksız istatistik: **yok**
- CyclOps yazısında ölçülmemiş performans metriği: **yok** — ölçülebilir
  göstergeler **adlandırıldı** ama sayı verilmedi ("başka bir kurumun oranı
  sizin için hedef değildir")
- Ardoq ürün özelliği uydurması: **yok** — genel yaklaşım ile ürün adı ayrı
  paragraflarda
- Uydurulmuş çalışan profili: **yok** — yazar `Duosis Mühendislik Ekibi`;
  yazar şemasında fotoğraf, biyografi veya sosyal hesap alanı bulunmuyor

---

## 6. Test kapsamı

| Katman      | Sayı                    |
| ----------- | ----------------------- |
| Birim testi | **257** (13 → 15 dosya) |
| E2E testi   | _(§9)_                  |

### Yeni test dosyaları

**Birim:** `services-model`, `capability-atlas`, `proof-system`,
`insight-model`
**E2E:** `services`, `technologies`, `proof-system`, `insights`,
`route-inventory`, `performance`

### Testlerin yakaladığı gerçek hatalar

Bunların hiçbiri elle gözden geçirmeyle bulunmadı; hepsini bir test bildirdi.

| #   | Hata                                                                                                                                                                                                                                                                                                                                                                                                   | Nasıl bulundu                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| 1   | **12 kırık iç bağlantı.** Seri ve etiket sayfaları dil karşılığını sabit olarak iki dile birden veriyordu; karşı dilde o seride/etikette yazı olmadığı için adres hiç üretilmemişti.                                                                                                                                                                                                                   | `route-inventory.spec.ts` bağlantı taraması               |
| 2   | **Rota envanteri testi ana sayfayı atlıyordu.** `/404.html` girdisini elemek için yazılan `replace()` yolu `"/"` hâline getirip ana sayfayı karşılaştırmadan düşürüyordu — testi sessizce zayıflatan bir hata.                                                                                                                                                                                         | Kendi kodunun gözden geçirilmesi (test yeşil görünüyordu) |
| 3   | **Bölge sırası alfabetikti.** Koleksiyon yükleyicisi kimliğe göre sıralıyordu; Türkiye üçüncü sıraya düşmüştü.                                                                                                                                                                                                                                                                                         | `services.spec.ts` bölge sırası testi                     |
| 4   | **Bölüm metni ziyaretçiye yayın politikası anlatıyordu.**                                                                                                                                                                                                                                                                                                                                              | `services.spec.ts` yasak ifade taraması                   |
| 5   | **Meta rayı tarihi ve yazar adını büyük harfe çeviriyordu** ("10 EYLÜL 2026"); Türkçe noktalı/noktasız i ayrımı da riske giriyordu.                                                                                                                                                                                                                                                                    | `insights.spec.ts` tarih biçimi testi                     |
| 6   | **Tablo dar ekranda sütunları eziyordu.**                                                                                                                                                                                                                                                                                                                                                              | `insights.spec.ts` tablo testi                            |
| 7   | **`proof-system` alan okuyucusundaki regex kaçışı bozuktu** — desen `\s` yerine `s` üretiyordu ve kazara çalışıyordu.                                                                                                                                                                                                                                                                                  | `pnpm lint` (`no-useless-escape`)                         |
| 8   | **Mono fallback yazı tipi %9,1 dar olduğu için düzen kayması.** `/en/technologies/` CLS 0,1317 ölçüldü (bütçe 0,1). Kayma değişkendi — sıcak koşuda 0,004 — bu yüzden bütçeyi yükseltmek sorunu gizlerdi. Ölçüm, JetBrains Mono'nun Consolas'tan %9,1 geniş olduğunu ve `size-adjust: 100%`in yalnızca DİKEY metrikleri hizaladığını gösterdi. Düzeltmeden sonra dört kritik rotada da CLS **0,0000**. | `performance.spec.ts` CLS bütçesi                         |

**Süreç notu:** Playwright'ın list reporter'ı yeniden denenen başarısızlıkları
`x` ile işaretliyor, `not ok` ile değil. İlk taramada `not ok` aranınca iki
başarısızlık gözden kaçtı. Kapı sonucunun tek güvenilir göstergesi **çıkış
kodudur**; log deseni değil.

---

## 7. Paylaşılan dosyalar — entegrasyon dikkati

S08+S09 branch'i de bu dosyalara dokunmuş olabilir. **Hiçbiri tahmin edilerek
kopyalanmadı**; yalnızca S10+S11'in ihtiyacı kadar değiştirildi.

| Dosya                                                       | Bu branch'te ne değişti                                                                                                                                                                                                                           | Entegrasyon notu                                                                                                |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `src/config/navigation.ts`                                  | `nav.services` **aktifleştirildi**. `SECONDARY_NAV` eklendi (teknoloji atlası). Dizi sırası sözleşmedeki nihai sıraya çekildi. `nav.cyclops` ve `nav.about` `planned` olarak **dokunulmadan** bırakıldı.                                          | S08+S09 bu ikisini `active` yapacak. Birleşimde altı ana giriş korunmalı; teknoloji **yedinci giriş olmamalı**. |
| `src/lib/i18n/dictionary.ts`                                | `services.*`, `technologies.*`, `regions.*` blokları ve genişletilmiş `insights.*` eklendi. `nav.technologies`, üç yeni CTA anahtarı.                                                                                                             | Anahtar **birleşimi** korunmalı; TR/EN paritesi bozulmamalı. Hiçbir anahtar silinmemeli.                        |
| `src/lib/content/schemas.ts`                                | `serviceSchema` genişletildi, `insightSchema` genişletildi, `proofSchema`'ya `kind`, `regionSchema`'ya `order`, `authorSchema` iki dilli.                                                                                                         | Milestone `source`/`verification` alanları korunmalı. `.strict()` gevşetilmemeli, `.passthrough()` eklenmemeli. |
| `src/lib/content/schema.ts`                                 | `SERVICE_TOPICS`, `CAPABILITY_LAYERS`, `INSIGHT_SERIES`, `PROOF_KINDS` kapalı kümeleri.                                                                                                                                                           | Yalnızca ekleme; mevcut enum'lara dokunulmadı.                                                                  |
| `src/lib/content/selectors.ts`                              | `getServices`, `getInsightsBySeries/ByTag`, `getSeriesWithCounts`, `getTagsWithCounts`, `getCapabilityAtlas(View)`, `getCustomerProofs`, `getAuthor`, `getEntryAlternates`, `isPublishedByDate`. `getInsights` ve `getRegions` davranışı değişti. | Yalnızca ekleme + iki davranış sıkılaştırması (tarih filtresi, bölge sırası).                                   |
| `src/lib/i18n/routes.ts`                                    | `services`, `technologies`, `series`, `tag` segmentleri; beş yeni yol üreteci.                                                                                                                                                                    | Yalnızca ekleme.                                                                                                |
| `src/content.config.ts`                                     | **Değişmedi.**                                                                                                                                                                                                                                    | —                                                                                                               |
| `src/styles/base.css`                                       | **Değişmedi.** Tüm yeni stiller bileşen kapsamında.                                                                                                                                                                                               | CSS çakışması beklenmiyor.                                                                                      |
| `src/content/homepage/homepage.json`                        | **Değişmedi.**                                                                                                                                                                                                                                    | —                                                                                                               |
| `src/pages/index.astro`, `src/pages/en/index.astro`         | İçgörü bölümü `InsightRow` kullanıyor, en yeni üç yazıyla sınırlı. `InsightList` kaldırıldı.                                                                                                                                                      | S08+S09 ana sayfaya CyclOps/10. yıl bölümü eklediyse çakışma bu iki dosyada olur.                               |
| `src/components/SolutionDetail.astro`                       | `ProofList` bağlandı (boşken hiçbir şey render etmiyor).                                                                                                                                                                                          | Küçük, izole ekleme.                                                                                            |
| `src/components/shell/SiteHeader.astro`, `SiteFooter.astro` | Mega menüye ve footer'a ikincil gezinme.                                                                                                                                                                                                          | S08+S09 aynı bileşenlere CyclOps/Hakkımızda girdisi eklemiş olabilir.                                           |
| `astro.config.mjs`                                          | **Değişmedi** (rehype denemesi geri alındı).                                                                                                                                                                                                      | —                                                                                                               |
| `pnpm-lock.yaml`                                            | **Değişmedi** — bu branch hiçbir bağımlılık eklemedi.                                                                                                                                                                                             | Lockfile çakışması bu branch'ten gelmeyecek.                                                                    |
| public rota envanteri                                       | `tests/support/public-routes.ts` olarak **yeni** oluşturuldu; `public-voice.spec.ts` artık onu tüketiyor.                                                                                                                                         | S08+S09 kendi rotalarını bu dosyaya eklemeli.                                                                   |

**Silinen dosyalar:** `src/components/InsightList.astro`,
`src/content/authors/duosis-ekibi.md`,
`src/content/services/tr/dis-kaynak-yonetimi.md`.

---

## 8. Bilinen içerik riskleri

| #   | Risk                                                                                                                                      | Durum                                                                                                                                     |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Sosyal önizleme görseli yok.** Şemada `social.imagePath` alanı var ama hiçbir yazıda dolu değil; OG kartı `summary` tipinde, görselsiz. | Bilinçli: sahte hero görseli üretilmedi. Marka OG raster'ı (PNG) hazırlanınca alan doldurulabilir.                                        |
| 2   | **Tüm sayfalar `noindex`.** Geliştirme sürümü politikası (S02).                                                                           | Yayın öncesi `seo.noindex` toplu olarak gözden geçirilmeli.                                                                               |
| 3   | **Kanonik adres `localhost:4321`.** `PUBLIC_SITE_URL` ayarlanmadığı için JSON-LD ve RSS yerel adres taşıyor.                              | Dağıtım kararıyla (ADR-003) birlikte çözülür.                                                                                             |
| 4   | **CyclOps logosu yayınlanamıyor.** Kayıtta `logoPermission: unknown` ve varlık dosyası yok.                                               | S08 kapsamında izin + varlık gerekiyor.                                                                                                   |
| 5   | **Onaylı müşteri referansı yok.** Kanıt bölümü hiçbir sayfada render edilmiyor.                                                           | `proof-system.test.ts` bu durumu kilitliyor: gerçek bir referans eklendiğinde test kırılır ve bölümün gözden geçirilmesini zorunlu kılar. |
| 6   | **Geniş tablo sınırı.** Üç sütundan geniş tablo dar ekranda okunaksız.                                                                    | `CONTENT_AUTHORING.md` §Markdown'da belgelendi.                                                                                           |
| 7   | **`operasyon-verisinin-dort-hali` kısa (~260 kelime).** S05'ten devralınan bir not; §12'deki 900–1.400 aralığında değil.                  | Kasıtlı: "tam yazı" değil kısa not. Kuyruğa alınıp genişletilebilir.                                                                      |

---

## 9. Kalite kapıları

Tümü bu branch'in HEAD'inde, `../duo-web-site-s10-s11` worktree'sinde koşuldu.
Node `24.20.0` (`.nvmrc` ile pinli), pnpm `12.3.4` (`packageManager` ile pinli).

| Kapı                             | Sonuç                                    |
| -------------------------------- | ---------------------------------------- |
| `pnpm install --frozen-lockfile` | Başarılı — lockfile değişmedi            |
| `pnpm format:check`              | Temiz                                    |
| `pnpm lint`                      | 0 bulgu                                  |
| `pnpm typecheck`                 | 0 hata, 0 uyarı, 0 ipucu (113 dosya)     |
| `pnpm test`                      | **257 / 257** (14 dosya)                 |
| `pnpm test:e2e`                  | **640 / 640** (chromium + chromium-nojs) |
| `pnpm build`                     | 57 sayfa                                 |
| `pnpm audit --prod`              | Bilinen güvenlik açığı yok               |
| RSS + BlogPosting doğrulaması    | **113 / 113** kontrol                    |

`pnpm quality` çıkış kodu: **0**.

### Ölçülen bundle

| Ölçüm                     | Değer                                              |
| ------------------------- | -------------------------------------------------- |
| `dist/` toplam            | ~1,9 MB (57 sayfa + 2 besleme + font + marka SVG)  |
| En ağır HTML              | 48,1 KB (`/`)                                      |
| CSS toplam                | 53,3 KB (6 dosya; sayfa başına 1–2'si yüklenir)    |
| Bundle edilmiş JS dosyası | **0**                                              |
| Satır içi script          | 2 blok / ~2,5 KB (`no-js` sınıfı + menü davranışı) |
| Font                      | 176 KB (4 woff2; latin alt kümesi ön yüklenir)     |
| Sayfa ağırlığı bütçesi    | ≤ 600 KB — tüm kritik rotalarda geçildi            |
| İstek bütçesi             | ≤ 25 — tüm kritik rotalarda geçildi                |
| CLS                       | **0,0000** (13 kritik rota)                        |

Karşılaştırma için S00'da ölçülen mevcut site ana sayfası: 7,17 MB / ~102 istek.

---

## 10. Teslim

| Öğe            | Değer                                      |
| -------------- | ------------------------------------------ |
| Branch         | `duosis-web/s10-s11-services-insights`     |
| Paralel taban  | `9fc01619c29d540e4e693690a72a5cefa3414631` |
| S10 checkpoint | `a2dee8448b9b15d8330a64c3de51f5510576d839` |
| S11 final      | `__FINAL_SHA__`                            |
| Remote CI      | `__CI_URL__`                               |
| Review bundle  | `duosis-web-S10-S11-review.bundle`         |
| Evidence ZIP   | `duosis-web-S10-S11-evidence.zip`          |

`main` branch'ine **merge edilmedi**. S12'ye geçilmedi.

### `git status --short`

```
__GIT_STATUS__
```
