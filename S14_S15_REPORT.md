# S14 + S15 Teslim Raporu

**Sprintler:** S14 (ürün ailesi, erişilebilirlik, performans, güvenlik) ve
S15 (signature experience, sanat yönetimi)
**Dal:** `duosis-web/s14-s15-signature-release`
**Ana dal tabanı:** `b106d64` (S12–S13 birleştirme commit'i)

Bu dal **ana dala birleştirilmedi**, **tag oluşturulmadı** ve **dağıtım
yapılmadı**. Çalışma emri gereği S15 sonunda durulmuştur.

---

## 1. Bölüm 0 — S12/S13 düzeltmesi ve birleştirme

### Beklenen durum doğrulandı

| Kontrol                            | Beklenen   | Ölçülen    | Sonuç   |
| ---------------------------------- | ---------- | ---------- | ------- |
| S12/S13 HEAD                       | `187456e…` | `187456e…` | eşleşti |
| `origin/main`                      | `212a1ba…` | `212a1ba…` | eşleşti |
| `main` üzerinde beklenmeyen commit | yok        | yok        | temiz   |

### Düzeltilen iki yorum

İki dosyada **ölçülmemiş bir tahmin ölçülmüş gibi** yazılıydı:

- `playwright.config.ts`: "tek worker'la CI'ın 20 dakikalık bütçesi aşılıyordu"
- `.github/workflows/ci.yml`: "20 dakika artık yetmiyordu"

CI'da tek worker **hiç ölçülmedi**. Ölçülen tek değer: iki worker ile koşu
**7 dk 31 sn**. Her iki yorum, neyin ölçüldüğünü ve neyin ölçülmediğini
ayırarak yeniden yazıldı; 40 dakikalık bütçenin bir zorunluluk değil güvenlik
payı olduğu belirtildi. `S12_S13_REPORT.md` sonuna R1 notu eklendi.

**R1 commit'i:** `bb9d3ea` · CI [34536018014](https://github.com/onursonmz/duo-web-site/actions/runs/34536018014) **yeşil** (9 dk 43 sn)

### Birleştirme

PR [#5](https://github.com/onursonmz/duo-web-site/pull/5) **merge commit** ile
birleştirildi → `b106d64` (iki parent). Squash, rebase veya force-push
kullanılmadı. Main CI
[34536931764](https://github.com/onursonmz/duo-web-site/actions/runs/34536931764)
**yeşil**. Ardından güncel main'den `duosis-web/s14-s15-signature-release` açıldı.

---

## 2. Commit ayrımı

| Commit    | Kapsam                                                                      |
| --------- | --------------------------------------------------------------------------- |
| `38bac48` | **S14 checkpoint** — ürün ailesi, kaynak manifesti, rota migrasyonu         |
| `e3110a0` | **S15** — signature experience, çapraz tarayıcı matrisi, teslim dokümanları |
| sonrası   | Lighthouse bulguları ve düzeltmeleri                                        |

---

## 3. Ürün kaynakları — ne doğrulandı, ne yayımlanmadı

Tam kayıt: `docs/PRODUCT_SOURCE_MANIFEST.md`.

| Ürün     | Kaynak commit              | Durum              | Ekran                            |
| -------- | -------------------------- | ------------------ | -------------------------------- |
| CyclOps  | `560e2f3a…` (bu depo, S08) | `verified-running` | 3 gerçek (S08'de maskelenmiş)    |
| Hermes   | `c217e24b…`                | `verified-running` | **yok** — süreç görselleştirmesi |
| LogiSlot | `588b6830…`                | `verified-running` | 2 tam + 2 maskelenmiş            |
| RAVSKALD | `4a10a5ad…`                | `verified-scope`   | **yok**                          |

Hermes ve LogiSlot anlatısı kaynak `.duosis/website.json` dosyalarından
**türetildi**; elle yeniden yazılmadı. Bir üretici betik kullanıldı, böylece
kaynak güncellendiğinde metin de güncellenebilir.

### 3.1 RAVSKALD — en önemli bulgu

Repo kamuya açık organizasyon listesinde görünmüyordu çünkü **private**.
Yetkili kimlik bilgisiyle bulundu. Ürün tanımı bağlayıcı proje sözleşmesiyle
doğrulandı:

> "RAVSKALD; operasyon ekiplerinin Türkçe doğal dil sorularını Zabbix ve
> SiteScope verisine dayanarak yanıtlayan, on-prem çalışan, salt-okunur ve
> kanıt gösterebilen bir sohbet uygulamasıdır."

**Ancak deponun kendi README'si şunu yazıyor:**

> "Tenant/RLS, login, RBAC, MCP, model ve chat işlevleri **bilinçli olarak
> yoktur** — bunlar S02 ve sonrasının kapsamındadır."

Proje S00–S20 planının **S02** sprintinde. Bugün çalışan: monorepo iskeleti,
aynı kökenli ağ geçidi, PostgreSQL kiracı kontrol düzlemi ve satır düzeyi
güvenlik. Bugün **çalışmayan**: ürünün ana vaadi — sohbet, model entegrasyonu,
Zabbix/SiteScope sorgulama. Ayrıca aktif bir `STOP-01` kuralı bu sistemlere
erişimi engelliyor.

**Yani ürünün NE OLDUĞU doğrulandı, BUGÜN ÇALIŞTIĞI doğrulanmadı.**

Sayfada nasıl ele alındı:

- `verificationStatus: "verified-scope"`,
- sayfanın **üst** kısmında "bugün çalışıyor / henüz çalışmıyor" bloğu,
- navigasyon sekmesinde "Geliştirme aşamasında" rozeti,
- **`SoftwareApplication` JSON-LD basılmıyor** — çalışmayan bir ürün için
  yapılandırılmış veri üretmek, arama motoruna sayfada olmayan bir şey
  söylemek olurdu.

### 3.2 Hermes — `IMG_*` dosyaları reddedildi

Manifestte `screenshots: []`. Depo kökündeki üç `IMG_*` dosyası indirildi ve
**tek tek gözle incelendi**: üçü de **Hermès lüks markasının** wordmark'ı ve
kanatlı sandalet logosu. Ürün ekranı değil, **başka bir şirketin tescilli
markası**.

Kişisel veri taşımamaları kullanılabilir oldukları anlamına gelmez.
Yayımlanmadı; yerine iş akışı SVG ile **süreç görselleştirmesi** olarak
çizildi ve bunun bir ürün ekranı olmadığı sayfada açıkça yazıldı. Sahte
dashboard tasarlanmadı.

### 3.3 LogiSlot — iki ekran maskelendi

Dört görsel indirildi ve incelendi. İki landing görseli temiz. **İki tedarikçi
portalı ekranının başlığında "Anadolu Un Portal" kiracı adı** görünüyordu.

Manifest bunları "demo (seed) verisi" olarak etiketliyor. Buna rağmen bir
şirket adını kendi tanıtım sitemizde yayımlamak, **izni doğrulanmamış bir
müşteri referansıdır**. Başlık bloğu S08'de CyclOps ekranlarında uygulanan
yöntemle maskelendi; düzen bozulmadı, maskeleme yapıldığı görünür kaldı.

---

## 4. İçerik modeli ve rotalar

### Şema dört ürüne genişletildi

Kapalı ve `.strict()`. Yeni alanlar: `verificationStatus`, `source` (repo +
40 karakterlik commit SHA + belge), `headline`, `summary`, `inputs`,
`mechanism`, `outcomes`, `capabilities`, `workflow`, `security`, `audiences`,
`aiRole`, `motionKey`, `today*`.

CyclOps'a özel bloklar (beş adımlı akış, galeri, onay) **opsiyonel** yapıldı;
mevcut doğrulanmış içerik korundu.

**Fail-closed kural:** gerçek ekranı olmayan ürün sessizce boş kalamaz —
süreç görselleştirmesi göstermek ve bunun ürün ekranı olmadığını yazmak
zorundadır. `tests/unit/product-content.test.ts` bunu denetler.

### Rotalar

- `/urunler/` ve `/en/products/` + dört detay rotası, iki dilde.
- **CyclOps kanonik adresi `/urunler/cyclops/` oldu.** Eski `/cyclops/` ve
  `/en/cyclops/` adresleri 301 ile yönlendiriliyor: aynı içerik iki
  indekslenebilir URL'de bulunmuyor, mevcut bağlantılar da kırılmıyor.
- Ana menüde CyclOps yerine **Ürünler**; girdi sayısı değişmedi (altı).

### Yönlendirme kurallarına `origin` alanı

Eklediğim iki CyclOps kuralı S00 envanterinde yoktu ve test bunu haklı olarak
reddetti. Kuralı gevşetmek yerine kurallara kaynak alanı eklendi:
**`s00-legacy` (54)** ve **`internal` (2)**. "54 legacy adresin tamamı
karşılandı" güvencesi bozulmadan kendi taşımalarımız da kaydedilebiliyor.

---

## 5. S15 — Signature experience

### ADR — numara çakışması

Çalışma emri `ADR-013-signature-experience.md` istiyordu. **`ADR-013` numarası
zaten kullanılıyor** (`ADR-013-onuncu-yil-yayin-karari.md`, S09). Karar
günlüğünde ikinci bir ADR-013 gerçek bir çakışma yaratacağı için kayıt
**`docs/decisions/ADR-014-signature-experience.md`** olarak açıldı; içerik
istenen kapsamın aynısıdır.

### Render kararı: WebGL KULLANILMADI

Önce SVG, CSS ve Web Animations ile spike yapıldı. Sonuç: ihtiyaç duyulan
görsel dil için WebGL veya Canvas **gerekmiyor**. İhtiyaç parçacık
simülasyonu veya shader değil, **topolojisi değişen bir operasyon şeması**.

**Ölçülen sonuç:** ana sayfa istemci JS'i **1 682 B gzip** (tavan 120 KB),
ürün detay **1 955 B**, ürünler **1 999 B**. Kaynak haritası **0**.

Değerlendirilen ve seçilmeyen alternatifler (three.js, Canvas 2D, Lottie,
GSAP+ScrollTrigger, videoya alınmış sahne) ADR-014'te gerekçeleriyle kayıtlı.

### Signature Moment 1 — yaşayan operasyon haritası

Hero SVG'si yeniden kuruldu: katman ızgarası, dört kaynaktan **birleşen**
sinyal yolları, cyan bağlam çekirdeği, **bakır karar eşkenar dörtgeni** ve
onay işaretli aksiyon çerçevesi. Yollar üzerinde akan cyan darbeler.

H1, açıklama ve CTA **ilk karede hareketsiz** okunuyor — kanıt paketinde
`11-hero-state-start.png`, `12-…-mid`, `13-…-final`.

Düğüm geometrisi belgelenen ızgara merkezlerine (120/360/600/840/1080)
oturtuldu; beş aşama adı kendi düğümünün altında duruyor.

### Signature Moment 2 — ürün ekosistemi

Dört metin kartı **değil**: sekmeye göre **topolojisi değişen** tek sahne.

| Ürün     | `motionKey` | Sahne davranışı                                                              |
| -------- | ----------- | ---------------------------------------------------------------------------- |
| CyclOps  | `converge`  | dört kaynak tek çekirdekte birleşir, çekirdek halkası vurgulanır             |
| Hermes   | `organise`  | üç kaynak bağlamda düzenlenir                                                |
| LogiSlot | `allocate`  | üç kaynak kurallardan geçer, **çıkış yolu bakır** (yerleştirme bir karardır) |
| RAVSKALD | `answer`    | iki kaynak, **kesikli çıkış** (cevap kanıtıyla döner)                        |

Gerçek `<button>` + WAI-ARIA tab deseni, ok tuşlarıyla gezinme, **otomatik
dönen carousel yok**. JS kapalıyken dört ürünün açıklaması da okunuyor —
gizleme yalnızca JS çalıştığında başlıyor.

Kanıt: `14-1-eco-cyclops.png` … `14-4-eco-ravskald.png`.

### Signature Moment 3 — ürün detay deneyimi

Girdi → mekanizma → sonuç modeli, yetenekler, iş akışı, güvenlik ve kitle
blokları; LogiSlot'ta gerçek ekran galerisi, Hermes ve RAVSKALD'da süreç
görselleştirmesi.

### 10. yıl

Yıllar düz metin blokları olmaktan çıkıp sürekli bir **zaman rayının**
üstündeki duraklara dönüştü. **Son durak bakır** — bugün durduğumuz yer.
Giriş `animation-timeline: view()` ile; desteklenmeyen tarayıcıda duraklar
zaten görünür. Scroll hijacking yok.

**Doğrulanmamış müşteri sayısı, başarı metriği veya referans eklenmedi.**

---

## 6. Ölçümler

### Lighthouse (simulate / mobile)

| Rota                 | Perf | A11y    | Best practices | SEO | LCP   | CLS   | TBT  |
| -------------------- | ---- | ------- | -------------- | --- | ----- | ----- | ---- |
| `/`                  | 93   | **100** | **100**        | 69  | 2,7 s | **0** | 0 ms |
| `/urunler/`          | 96   | **100** | **100**        | 69  | 2,4 s | **0** | 0 ms |
| `/urunler/logislot/` | 93   | **100** | **100**        | 69  | 2,7 s | **0** | 0 ms |

**SEO 69'un tek sebebi:** `is-crawlable` — sayfa indekslemeye kapalı. Bu bizim
bilinçli kararımız; **diğer tüm SEO denetimleri geçiyor**. İndeksleme
açıldığında skor kendiliğinden yükselir.

**LCP hakkında dürüst olmak gerekiyor.** Lighthouse'un simüle ettiği mobil
yavaş bağlantıda LCP **2,4–2,7 s**; ADR-014'teki `< 2,5 s` hedefi iki rotada
**aşılıyor**. Aynı sayfalar kısıtlamasız masaüstünde ölçüldüğünde LCP
**192–444 ms**. İki ölçüm çelişmiyor — farklı koşullar. Hedefin hangi koşul
için geçerli olduğu ADR'de belirtilmemişti; bu bir eksiktir ve S16'da
netleştirilmelidir.

### Kısıtlamasız masaüstü (Playwright, gerçek ölçüm)

| Rota                 | LCP    | CLS | DCL    | Kaynak |
| -------------------- | ------ | --- | ------ | ------ |
| `/`                  | 444 ms | 0   | 111 ms | 219 KB |
| `/urunler/`          | 192 ms | 0   | 43 ms  | 209 KB |
| `/urunler/logislot/` | 252 ms | 0   | 45 ms  | 246 KB |
| `/iletisim/`         | 204 ms | 0   | 53 ms  | 213 KB |

Tümü ADR-014'ün 1,25 MB ilk yük tavanının çok altında.

### Bundle karşılaştırması

|                             | S13 sonu | S15 sonu    |
| --------------------------- | -------- | ----------- |
| Ana sayfa istemci JS (gzip) | 978 B    | **1 682 B** |
| Eski sınır                  | ≤ 12 KB  | —           |
| Yeni tavan                  | —        | ≤ 120 KB    |

Artış 704 B: ürün sahnesi sekme yönetimi. Tavanın **%1,4**'ü.

---

## 7. Test matrisi

### Çapraz tarayıcı kararı

Süit ~1 130 teste ulaştı. Tümünü üç motorda koşmak ~3 400 test demek olurdu:
bu **çapraz tarayıcı kapsamı sağlamaz**, yalnızca aynı iddiaları üç kez
tekrar eder ve CI bütçesini tüketir.

Bunun yerine: **Chromium derinliği** (tüm süit), **Firefox ve WebKit
genişliği** (`cross-browser.spec.ts` — motorlar arasında gerçekten ayrışan
davranışlar: düzen ve taşma, form, klavye, sekme etkileşimi, izin öncesi ağ,
konsol hataları). Gerekçe hem `playwright.config.ts` hem spec başında yazılı.
CI üç motoru da kuruyor.

### WebKit bulgusu

**Ölçülen:** WebKit'te `Tab` bağlantıları tamamen atlayıp ilk **butona**
gidiyor. Bu bizim işaretlememizin hatası **değil**, Safari'nin belgelenmiş
varsayılanıdır ("Full Keyboard Access" kapalıyken `<a>` öğeleri tab sırasında
değildir). Aynı sayfada programatik `focus()` sorunsuz çalışıyor.

İddia motora göre ayrıldı — kural gevşetilmedi, **doğru şey ölçüldü**:
Chromium ve Firefox'ta ilk tab durağı; WebKit'te bağlantının odaklanabilir,
görünür ve doğru hedefe gidiyor olması.

---

## 8. Bulunan ve düzeltilen gerçek hatalar

Bunlar kapılar ve ölçümler tarafından yakalandı; kaydedilmeleri gerekiyor.

### 8.1 Ürün sayfalarında YANLIŞ LOGO

`ProductPage.astro` içindeki wordmark `variant="cyclops"` ile **sabit
kodlanmıştı**. Dört ürünlü aileye geçince LogiSlot, Hermes ve RAVSKALD
sayfaları **CyclOps'un wordmark'ını kendi adlarıyla etiketlenmiş hâlde**
gösteriyordu.

Bu iki ayrı sorundu: yanlış marka gösterimi ve S08'de **yalnızca CyclOps için
verilen logo izninin** dışına çıkmak. Kendi doğrulanmış wordmark'ı olmayan
ürün artık logo göstermiyor; adı metin olarak duruyor.

Lighthouse'un LCP öğesi incelemesi sırasında fark edildi.

### 8.2 Başlık sırası atlanıyordu

Ürünler sahnesinde `h1` → `h3` geçişi vardı; `h2` atlanıyordu. Lighthouse
`heading-order` bulgusu. Düzeltildikten sonra üç rotada da **a11y 100**.

### 8.3 Ürünler landing sayfasında hiç `h1` yoktu

Rota envanteri testi yakaladı. Sahne başlığı `h2`'den `h1`'e alındı.

### 8.4 Seçili sekmenin adı görünmüyordu

Koyu yüzeye zorlanmış bölümde **tema-bağımlı token** (`--signal-surface`)
kullanmıştım; açık temada beyaz zemin + açık metin çıkıyordu.
`--signal-surface-inverse` token'ı eklendi ve bölümdeki tüm ham
`rgb(255 255 255 / …)` değerleri token'a çevrildi.

### 8.5 Türkçe "asla" yasaklı "sla" sanılıyordu

Ürün içerik taraması alt dize araması yapıyordu ve LogiSlot'un dürüst güvenlik
cümlesini ("...asla birleşmez") yasak iddia sayıyordu. Bu depoda aynı hata
`public-voice` taramasında daha önce çözülmüştü; aynı çözüm uygulandı ve
kontrolün **gerçek ihlalleri hâlâ yakaladığı** ayrı bir testle kanıtlandı.

### 8.6 Ziyaretçiye dönük metinde jargon

Üç sızıntı temizlendi: `fail-closed`, `doğrulanmamış` (benim yazdığım
maskeleme gerekçesi) ve durum adı olarak kullanılan `Pending`. İlk ikisi
sade dile çevrildi; üçüncüsü kaynak manifestten geliyordu ve anlamı korunarak
"Awaiting approval" olarak açıldı.

### 8.7 Hero geometrisi hizalama testini kırdı

Yeniden yapılandırma sırasında karar düğümü `.atlas__hub--ai`'den
`.atlas__decision`'a taşındı ve dördüncü düğüm bulunamaz oldu. Geometri
belgelenen ızgara merkezlerine oturtuldu, test seçicisi güncellendi.

---

## 9. S14 kapıları — final kapsam

Kritik rota matrisi ürün sayfalarını da kapsıyor (`/urunler/`, dört ürün
detayı dâhil, 15 rota).

| Kapı                                   | Sonuç                      |
| -------------------------------------- | -------------------------- |
| Serious/critical axe ihlali            | yok (Lighthouse a11y 100)  |
| Tam klavye kullanımı                   | doğrulandı (üç motorda)    |
| Görünür focus ve focus return          | doğrulandı                 |
| 320 px reflow                          | **0 taşan ekran**          |
| %200 zoom                              | doğrulandı                 |
| Normal ve reduced-motion               | ikisi de kanıt paketinde   |
| JS kapalı temel içerik                 | doğrulandı                 |
| Kırık iç bağlantı                      | yok (rota başına tarama)   |
| Konsol hatası                          | yok (üç motorda)           |
| Form negatif testleri                  | geçiyor                    |
| İzin öncesi/sonrası yetkisiz dış istek | **0**                      |
| Secret taraması                        | temiz                      |
| Dependency audit                       | bilinen açık yok           |
| Kaynak haritası                        | `dist/` içinde **0**       |
| CSP ve güvenlik başlığı planı          | `OPERATIONS_RUNBOOK.md` §5 |

**Güvenlik başlıkları hakkında:** dağıtım hedefi seçilmediği için bu
başlıkların gerçekten uygulandığı **iddia edilmiyor**. Beklenen set ve her
başlığın gerekçesi runbook'ta; `style-src 'unsafe-inline'` ihtiyacının nedeni
de (Astro'nun satır içi bileşen stilleri) açıkça yazılı.

**Form:** gerçek teslim adaptörüne bağlı değil; dürüst `not-delivered`
davranışı korunuyor. Sahte başarı üretilmiyor.

---

## 10. Görsel kanıt

`evidence/s14-s15/` — 33 ekran, 2 video, 3 Lighthouse raporu (JSON + HTML).

| Kapsam                            | Dosyalar                         |
| --------------------------------- | -------------------------------- |
| Ana sayfa desktop/mobil           | `01`, `02`, `03`                 |
| Ürün landing desktop/mobil        | `04`, `05`                       |
| Dört ürün detayı                  | `06`–`09`                        |
| Hero başlangıç/orta/final         | `11`, `12`, `13`                 |
| Ekosistemde dört ürün state'i     | `14-1`–`14-4`                    |
| Normal ve reduced-motion          | `15`, `16`                       |
| Dark/light yüzey                  | `17`, `18`                       |
| 320 px, %200 zoom, JS kapalı      | `19`–`22`                        |
| Form ve consent                   | `23`, `24`                       |
| Firefox ve WebKit kritik ekranlar | `25`–`27`                        |
| Masaüstü etkileşim videosu        | `video/desktop-walkthrough.webm` |
| Mobil etkileşim videosu           | `video/mobile-walkthrough.webm`  |

Masaüstü videosunda hero, dört ürün seçimi, ürün sayfasına geçiş ve **gerçek
LogiSlot ürün ekranı** gösteriliyor.

**Ölçülen:** 33 ekranın hiçbirinde yatay taşma yok.

**S13 öncesi / S15 sonrası karşılaştırma:** önceki sprintin kanıt paketi
(`evidence/s12-s13/`) aynı rotaların S13 hâlini taşıyor; iki paket yan yana
konularak karşılaştırılabilir.

---

## 10b. Uzak CI ve teslim paketi

| Koşu                                                                              | HEAD      | Sonuç     |
| --------------------------------------------------------------------------------- | --------- | --------- |
| [34550949727](https://github.com/onursonmz/duo-web-site/actions/runs/34550949727) | `ecb841e` | **yeşil** |

CI yerelle **tam aynı** komutu koşar (`pnpm quality`) ve S15'ten itibaren
üç tarayıcı motorunu da kurar (Chromium, Firefox, WebKit).

### Yerel kapı sonuçları (final HEAD)

| Kapı                | Sonuç                   |
| ------------------- | ----------------------- |
| `pnpm format:check` | exit 0                  |
| `pnpm lint`         | exit 0                  |
| `pnpm typecheck`    | exit 0                  |
| `pnpm test` (birim) | exit 0                  |
| `pnpm build`        | exit 0                  |
| `pnpm seo:report`   | exit 0                  |
| `pnpm audit --prod` | exit 0                  |
| `pnpm test:e2e`     | **exit 0 — 1 131 test** |

Her komutun gerçek çıkış kodu kaydedildi; log içinde kelime araması yapılarak
"başarılı" sayılan bir adım yok.

### Paket

| Dosya                              | İçerik                                                     |
| ---------------------------------- | ---------------------------------------------------------- |
| `duosis-web-S14-S15-review.bundle` | kendi kendine yeten git bundle (`main` + sprint dalı)      |
| `duosis-web-S14-S15-evidence.zip`  | rapor, dokümanlar, 33 ekran, 2 video, Lighthouse raporları |
| `PACKAGES-S14-S15.sha256`          | SHA-256 manifesti                                          |

Paketleyici üç doğrulamayı da gerçekten çalıştırır: bundle `git bundle verify`
sonrası **gerçekten klonlanır** ve HEAD'i karşılaştırılır; ZIP `testzip()` ile
denetlenir; arşivdeki her yol mutlak yol / sürücü harfi / `..` / symlink
taramasından geçer.

---

## 11. Teslim dosyaları

| Dosya                                            | İçerik                                                |
| ------------------------------------------------ | ----------------------------------------------------- |
| `S14_S15_REPORT.md`                              | bu rapor                                              |
| `docs/PRODUCT_SOURCE_MANIFEST.md`                | ürün kaynakları, commit'ler, hash'ler, izin kararları |
| `docs/decisions/ADR-014-signature-experience.md` | render ve bütçe kararı                                |
| `docs/HACKATHON_DEMO_SCRIPT.md`                  | 3–5 dakikalık demo akışı, statik fallback ile         |
| `RELEASE_CHECKLIST.md`                           | yayın öncesi/sonrası ve geri alma                     |
| `CONTENT_GAPS.md`                                | bilinçli olarak boş bırakılan yerler                  |
| `OPERATIONS_RUNBOOK.md`                          | çalıştırma, ortam, güvenlik başlıkları                |

---

## 12. Siteyi yerelde görmek

```bash
pnpm install --frozen-lockfile && pnpm dev
```

**Tam URL:** <http://localhost:4321/>

Ürünler: <http://localhost:4321/urunler/> · İngilizce:
<http://localhost:4321/en/>

---

## 13. Ürün başına yayınlanan ve bekletilen iddialar

| Ürün     | Yayınlanan                                                        | **Bekletilen**                                                         |
| -------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- |
| CyclOps  | olay yaşam döngüsü, beş aşamalı akış, 3 gerçek ekran, onay sınırı | entegrasyon listesi dışındaki her iddia                                |
| Hermes   | 11 yetenek, 4 adımlı akış, güvenlik maddeleri (manifestten)       | **ürün ekranı**, teknoloji ilişkileri                                  |
| LogiSlot | 15 yetenek, 6 adımlı akış, 3 ekran                                | kiracı adı (maskelendi), teknoloji ilişkileri                          |
| RAVSKALD | ürün tanımı, tasarlanan kapsam, bugün çalışan kısım               | **yeteneklerin şimdiki zamanda anlatımı**, ekran, yapılandırılmış veri |

**Hiçbir üründe** müşteri sayısı, kullanım oranı, başarı metriği, SLA, pazar
liderliği, müşteri adı veya logosu yok. Üç kaynak manifestin ikisinde
`metrics: []` — kaynaklar da sayısal iddia taşımıyor.

---

## 14. Bilinen eksikler

Tam liste `CONTENT_GAPS.md` içinde. Özet:

1. RAVSKALD'ın ana vaadi henüz çalışmıyor.
2. Hermes'in yayımlanabilir ürün ekranı yok.
3. LogiSlot'un iki ekranı maskelenmiş hâlde.
4. Üç yeni ürünün teknoloji ve çözüm ilişkileri kurulmadı.
5. Ekosistem sahnesindeki düğüm kutuları etiketsiz.
6. Bölgesel anlatı görselleştirilmedi (sahte ofis noktası eklememek için).
7. Beş kısa, üç uzun meta açıklama.
8. İndeksleme kararı verilmedi — site tamamen `noindex`.

**Ayrıca:** ADR-014'teki LCP hedefinin hangi ölçüm koşulu için geçerli olduğu
belirtilmemiş; Lighthouse'un simüle mobil koşulunda iki rota hedefi aşıyor.
S16'da netleştirilmeli.

---

## 15. Durum

S15 sonunda **durulmuştur**.

- Dal ana dala **birleştirilmedi**.
- **Tag oluşturulmadı**.
- **Dağıtım yapılmadı**; DNS, dış servis hesabı ve üretim kimlik bilgisi
  oluşturulmadı.
- Bir sonraki işe geçilmedi.

Görsel sonucun incelenmesi ve gerekli sanat yönetimi düzeltmeleri ayrı bir
revizyon turunda yapılacaktır.
