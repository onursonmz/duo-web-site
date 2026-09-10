# S12 + S13 Teslim Raporu

**Sprintler:** S12 (iletişim, onay, ölçümleme) ve S13 (SEO, migrasyon, yapılandırılmış veri)
**Dal:** `duosis-web/s12-s13-contact-seo`
**Ana dal tabanı:** `212a1ba` (S08–S11 birleştirme commit'i)

Bu dal **ana dala birleştirilmedi** ve **S14 başlatılmadı**. Çalışma emri
gereği S13 sonunda durulmuştur.

**Gerçek dağıtım yapılmadı.** DNS değişikliği, dış servis hesabı ve üretim
kimlik bilgisi oluşturulmadı. Üretilen yönlendirme dosyaları yalnızca
incelenmek üzere üretildi; canlı bir sunucuya uygulanmadı.

---

## 1. Commit ayrımı

| Commit       | Kapsam                                                | Kapı                                      |
| ------------ | ----------------------------------------------------- | ----------------------------------------- |
| `325ef68`    | S12 — iletişim formu, onay yönetimi, ölçümleme kanalı | `pnpm quality` yeşil (400 birim, 838 E2E) |
| S13 commit'i | S13 — SEO, URL migrasyonu, yapılandırılmış veri, OG   | `pnpm quality` yeşil (489 birim)          |

Çalışma emri "önce S12 tamamlanacak ve **ayrı checkpoint commit'i** oluşturulacak"
diyordu.

**Bu noktada dürüst olmak gerekiyor:** S12 ve S13 tek bir çalışma
oturumunda, iç içe geliştirildi. Sonradan iki ayrı commit üretmek için
`BaseLayout.astro`, `schemas.ts`, `selectors.ts`, `routes.ts` ve
`content.config.ts` gibi **her iki sprintin de dokunduğu dosyalar elle
ayrıştırıldı** ve yalnızca S12 kapsamını taşıyan bir ağaç yeniden kuruldu.
S12 kapısı bu yeniden kurulan ağaçta **gerçekten** koşturuldu — commit ağacı
kendi başına derleniyor ve kendi kapısını geçiyor. Commit'lerin sırası
gerçek geliştirme sırasını değil, kapsam ayrımını yansıtır.

---

## 2. S12 — iletişim formu

### 2.1 Alanlar ve veri minimizasyonu

TR `/iletisim/`, EN `/en/contact/` üzerinde **tek** form:

| Alan             | Tür                    | Zorunlu |
| ---------------- | ---------------------- | ------- |
| Ad soyad         | metin                  | evet    |
| Kurumsal e-posta | e-posta                | evet    |
| Kurum            | metin                  | evet    |
| İlgi alanı       | kapalı küme (`select`) | evet    |
| Mesaj            | çok satırlı metin      | evet    |
| Onay             | onay kutusu            | evet    |

**Telefon alanı YOK.** Dosya yükleme YOK. Zorunlu olmayan hiçbir alan yok.
E2E `tests/e2e/solutions.spec.ts` bunu her iki dilde ayrıca denetler.

### 2.2 `topic` — TEK canonical yaklaşım

Mevcut `?topic=` yaklaşımı korundu; **ikinci bir `interest` alanı
oluşturulmadı**. Değer `src/lib/contact/topics.ts` içindeki kapalı
allowlist'ten geçer. Şu girdiler forma **ulaşmaz** ve sessizce `genel`
değerine düşer:

- allowlist dışı değer,
- 64 karakteri aşan değer,
- birden çok kez verilen `topic` parametresi,
- dizi olarak gelen değer.

Ham sorgu dizesi sayfada **yankılanmaz** ve hiçbir serbest metin alanına
yazılmaz.

### 2.3 Sunucu çekirdeği — sıralı ve fail-closed

`src/lib/contact/server.ts` sağlayıcıdan bağımsızdır; dağıtım hedefi
seçilmediği için sağlayıcıya özel kod çekirdeğe yayılmadı. Denetimler bu
sırayla çalışır ve ilk başarısız kapı isteği sonlandırır:

`method_not_allowed` → `unsupported_media_type` → `origin_mismatch` →
`payload_too_large` → `honeypot` → `too_fast` → `rate_limited` →
`validation_failed` → `duplicate` → `spam_unavailable` / `spam_rejected` →
`delivery_unavailable` → `delivery_timeout` / `delivery_failed`

Fail-closed olan noktalar:

- **Origin listesi boşsa** hiçbir origin kabul edilmez (önizlemede liste
  bilinçli olarak boştur).
- **`Origin` başlığı yoksa** istek reddedilir.
- **Spam doğrulayıcı yapılandırılmamışsa** istek reddedilir; "doğrulayıcı yok,
  o hâlde geç" davranışı yoktur.
- **Hukuk onayı yoksa** teslim kanalı kapalıdır.

### 2.4 Doğrulama tek kaynaktan

İstemci ve sunucu **aynı** kural kümesinden türer (`src/lib/contact/schema.ts`).
HTML öznitelikleri de (`required`, `maxlength`, `type`) aynı kurallardan
üretilir; iki ayrı doğrulama listesi tutulmaz.

### 2.5 Log ve kişisel veri

Loglara **tam e-posta, mesaj, telefon veya form gövdesi asla yazılmaz.**
Yalnızca konu, e-posta **alan adı** ve alan uzunlukları yazılır.
`tests/unit/contact-core.test.ts` bu davranışı doğrudan denetler.

### 2.6 Demo modu dürüstlüğü

Teslim adaptörü demo modda **gerçekten göndermez** ve **sahte başarı
üretmez**. Kullanıcıya açıkça "gönderilmedi" denir; form durumu
`data-state="not-delivered"` taşır.

**Hiçbir gerçek CRM, e-posta veya Turnstile anahtarı eklenmedi veya
uydurulmadı.** Derlenmiş istemci paketi sır taraması yapıldı: `CONTACT_FORM_TO`,
`LEGAL_APPROVED`, `TURNSTILE`, `RECAPTCHA`, `api_key`, `secret`, `password`
ve `bearer` kalıplarının hiçbiri `dist/` içinde bulunmadı.

---

## 3. S12 — KVKK aydınlatma metni

- Sayfalar: `/aydinlatma-metni/` ve `/en/privacy-notice/`, ikisi de `noindex`.
- Kayıtlar `status: "draft"`, `reviewStatus: "legal-review-required"`.
- **Uydurma saklama süresi veya mevzuat iddiası yazılmadı.** "Ne kadar süreyle
  saklanır?" başlığı, sürenin **henüz belirlenmediğini** açıkça söyler.
- TR/EN karşılıklı bağlantılar çalışır; kırık link yok.

**Derleme/yapılandırma düzeyinde garanti:** `canDeliverForms()` üç koşulu
**birlikte** arar — `DEPLOY_ENV=production`, `LEGAL_APPROVED=true` ve tanımlı
`CONTACT_FORM_TO`. Üçünden biri eksikse üretim formu veri gönderemez.
`tests/unit/site-config.test.ts` her eksik kombinasyonu ayrı ayrı denetler ve
depoda `LEGAL_APPROVED` bayrağının açık **olmadığını** da doğrular.

### Bir çakışma ve nasıl çözüldüğü

S06'da eklenen public ses taraması, ziyaretçiye görünen metinde
"taslak"/"draft" kelimelerini yasaklıyordu. S12 ise aydınlatma metninin
taslak olduğunu **açıkça söylemesini** gerektiriyor. Bu gerçek bir çelişkiydi.

Çözüm: kuralı gevşetmek yerine **dar ve gerekçeli bir istisna** eklendi —
yalnızca bu iki kelime, yalnızca bu iki rota. Diğer tüm iç süreç ifadeleri
bu sayfalarda da yasak kalır. İstisna, metin `reviewStatus: "approved"`
olduğunda **kaldırılacak** şekilde belgelendi.

---

## 4. S12 — çerez / onay yönetimi

- Kategoriler: `essential` (varsayılan **açık**, **kapatılamaz**) ve
  `analytics` (varsayılan **kapalı**).
- **`marketing` kategorisi oluşturulmadı** — kullanılmayan bir kategori
  yaratmak, olmayan bir veri işlemeyi ima ederdi.
- Kabul / Reddet / Özelleştir **eşit görünürlükte** (aynı sınıf, aynı stil) ve
  klavyeyle erişilebilir.
- Tercih **sürümlü** saklanır. Bozuk JSON, eksik alan, eski sürüm veya ileri
  sürüm → tercih **geçersiz** sayılır ve yeniden sorulur. `analytics` alanı
  boolean değilse (`"true"` metni dâhil) izin sayılmaz. `essential` kayıttan
  okunmaz, her zaman `true`'ya sabitlenir.
- Panel footer'daki gerçek bir `<button>` ile yeniden açılır (gezinme değil
  eylem olduğu için `<a href="#">` kullanılmadı).

### İzin öncesi ağ

Analytics sağlayıcısı **`none`**. GA4, Yandex/Webvisor veya başka bir üçüncü
taraf script **eklenmedi**. İzin **verilse bile** dış istek oluşmaz: kanal
hazırdır, açık değildir. E2E hem izin öncesi hem izin sonrası ağ isteklerini
sayar.

### Olay adı kümesi kapalı

`ANALYTICS_EVENTS` beş adla sınırlı. Payload'a URL sorgusu, e-posta, ad, kurum
veya mesaj **giremez**: `sanitizeEventPayload` yasak anahtarları düşürür,
40 karakterden uzun serbest metni düşürür, `@` içeren değeri düşürür ve iç içe
nesne/dizi geçirmez.

---

## 5. S12'de bulunan iki gerçek hata

Bunlar kapı tarafından yakalandı ve düzeltildi; kaydedilmeleri gerekiyor.

### 5.1 Onay paneli klavye odağını ÇALIYORDU

Panel açılışta ilk butonuna `focus()` uyguluyordu ve karar verilmemiş her
sayfa yüklemesinde açılıyordu. Sonuç: **her sayfada** ilk TAB durağı "ana
içeriğe geç" bağlantısı olmaktan çıkıyordu. Bu gerçek bir WCAG gerilemesiydi
ve dört bağımsız test tarafından yakalandı.

**Düzeltme:** açılış ile kullanıcı tarafından yeniden açma ayrıldı. Sayfa
açılışında odak **taşınmaz**; yalnızca kullanıcı paneli footer'dan kendisi
açtığında taşınır — orada eylemi kullanıcı başlatmıştır.

Panel bilinçli olarak DOM'un sonunda bırakıldı. Daha öne almak klavye
erişimini hızlandırırdı ama hero ve design-system testlerinin sabitlediği
belgelenmiş TAB sırasını bozardı; panel `aria-labelledby` taşıyan adlandırılmış
bir `complementary` landmark olduğu için landmark gezinmesiyle erişilebilir
durumda.

### 5.2 İletişim formu 320 px'de yatay taşma üretiyordu

Ölçülen değer: `scrollWidth` 364 px, `clientWidth` 320 px.

**Kök neden:** grid öğelerinin varsayılan `min-width: auto` değeri, form
denetimlerinin **içsel** genişliğinin (`select`'in en uzun seçeneği, `input`
varsayılan `size`) altına inmeyi engelliyordu.

**Düzeltme:** `grid-template-columns: minmax(0, 1fr)` ve denetimlerde
`width: 100%; min-width: 0`. Doğrulama tahminle değil, tarayıcıda taşan **her
elemanın** ölçülmesiyle yapıldı; düzeltmeden sonra `scrollWidth` 320 px.

---

## 6. S13 — ortam ayrımı ve üretim kapıları

Üretim kanonik origin'i **`https://duosis.com`**.

Aşağıdaki dört komut **gerçekten çalıştırıldı** ve derleme belirtilen hatayla
**kırıldı** (kanıt: `evidence/seo/production-build-guards.md`):

| Komut                                        | Sonuç                                                 |
| -------------------------------------------- | ----------------------------------------------------- |
| `DEPLOY_ENV=production pnpm build`           | `PRODUCTION build için PUBLIC_SITE_URL zorunludur`    |
| `... PUBLIC_SITE_URL=http://duosis.com`      | `PRODUCTION build HTTPS gerektirir; verilen: http://` |
| `... PUBLIC_SITE_URL=https://localhost:4321` | `PRODUCTION build'de localhost canonical YASAK`       |
| `... PUBLIC_SITE_URL=duosis.com`             | `PUBLIC_SITE_URL geçerli bir URL değil`               |

`DEPLOY_ENV` yalnızca tam olarak `production` değerini production sayar;
`true`, `1`, `yes`, `prod` ve `PRODUCTION` **terfi etmez**.

### robots ve sitemap

|               | Önizleme                                                | Üretim                                                            |
| ------------- | ------------------------------------------------------- | ----------------------------------------------------------------- |
| `robots.txt`  | `Disallow: /` (tüm site kapalı), sitemap **duyurulmaz** | rota bazlı `Disallow` + `Sitemap: https://duosis.com/sitemap.xml` |
| `sitemap.xml` | geçerli ama **boş**                                     | geçerli, **0 `<loc>`**                                            |

Üretim sitemap'inin boş olması **bilinçli ve doğru** sonuçtur: bugün tüm
sayfalar `noindex` taşıyor ve nihai indeksleme kararı **S15 içerik doğruluk
kapısına** bırakıldı. **`noindex` değerleri kör biçimde `false` yapılmadı.**

Bu arada gerçek bir hata da düzeltildi: sitemap XML ad alanı
`http://www.sitemap.org/...` yazılmıştı — doğrusu `www.sitemaps.org`.

### İçerik olgunluğu

`getHomepage()` artık `status` denetimini **atlamıyor**; ana sayfa da diğer
rota aileleriyle **aynı** fail-closed olgunluk politikasına tabi. Taslak
içerik üretim sitemap'ine ve yapılandırılmış veriye giremez.

---

## 7. S13 — URL migrasyonu

S00'da ölçülen **54 legacy URL'nin tamamı** tek makine-okunabilir kaynakta:
`src/config/redirects.ts`.

| Karar                         | Adet   |
| ----------------------------- | ------ |
| `preserve` (adres aynı kalır) | 3      |
| `301-exact`                   | 15     |
| `301-merged`                  | 25     |
| `410` (içerik kaldırıldı)     | 11     |
| **Toplam**                    | **54** |

Denetlenen kurallar (`tests/unit/redirects.test.ts`):

- **Kör ana sayfa yönlendirmesi YOK** — karşılığı olmayan sayfa `410` döner.
- **Zincir YOK** — hiçbir hedef, başka bir kuralın kaynağı değildir.
- **Döngü YOK** — hedef kendi kaynağına eşit olamaz.
- Tüm hedefler mutlak ve sondaki `/` ile biter.

Çıktılar sağlayıcıdan bağımsız üretilir (`scripts/build-redirects.mjs`):
`dist/redirect-manifest.json`, `dist/_redirects`, `dist/nginx-redirects.conf`.
**Canlı sunucuda uygulama yapılmadı.**

E2E ayrıca **her 301 hedefinin gerçekten var olan bir sayfa olduğunu**
doğrular. Bu test yazılırken gerçek bir hata bulundu: `410` kuralları var
olmayan bir `/410` gövdesini gösteriyordu. Gerçek bir `410` sayfası üretildi
(`src/pages/410.astro`) — kaldırılmış içerik ana sayfaya atılmıyor.

---

## 8. S13 — TR/EN SEO

### Etiket modeli düzeltildi

S11'de etiketler tek bir metin olarak tutuluyordu; bu yüzden İngilizce
rotalarda **Türkçe adresler** üretiliyordu:
`/en/insights/tag/veri-akisi/`, `/en/insights/tag/entegrasyon/`.

Artık üç alan **ayrı**: `key` (dilden bağımsız kimlik), `slug` (locale'e göre
URL parçası), `label` (locale'e göre görünen metin). Kayıt kapalıdır; şemadan
geçmeyen bir etiket için rota da üretilmez.

Sonuç ölçüldü — şu altı adres **artık üretilmiyor** ve 404 dönüyor:
`/en/insights/tag/veri-akisi/`, `/en/insights/tag/entegrasyon/`,
`/en/insights/tag/kurumsal-mimari/`, `/icgoruler/etiket/data-flow/`,
`/icgoruler/etiket/integration/`, `/icgoruler/etiket/enterprise-architecture/`.

### canonical ve hreflang

- Her sayfada **tek** canonical, mutlak, kendi yolunu gösterir, sorgu taşımaz.
- hreflang **karşılıklı**: E2E, hedef sayfayı gerçekten indirip geri işaret
  ettiğini doğrular.
- `x-default` her zaman **Türkçe** sürümü gösterir.
- **Sahte hreflang yok:** gerçek çevirisi olmayan sayfa hiç hreflang üretmez.

Ölçüm: 64 sayfanın **46'sı** `tr`/`en`/`x-default` üçlüsünü taşıyor, **18'i**
hiç hreflang taşımıyor. Taşımayanlar 404, 410, design-system ve gerçekten
çevirisi olmayan TR içgörü/etiket/seri sayfaları — bu **doğru** sonuçtur.

### Metadata raporu

`scripts/seo-report.mjs` fail-closed bir kapıdır ve `pnpm quality` içinde
çalışır. Kırıldığı durumlar: boş başlık/açıklama, aynı dil içinde tekrar eden
başlık/açıklama, eksik canonical, hreflang verip `x-default` vermeme.

Kapının **gerçekten çalıştığı**, `dist` kopyası kasıtlı bozularak kanıtlandı:
bir açıklama boşaltıldı, bir `x-default` silindi, bir başlık kopyalandı →
üç ihlal yakalandı, çıkış kodu 1.

Üretim derlemesindeki sonuç: **64 sayfa, 0 kapı ihlali, 0 tekrar eden başlık,
0 tekrar eden açıklama.** Uzunluk aykırıları rapor edilir ama kapı değildir
(S15 içerik kapısına girdi): 60 karakteri aşan başlık 0, 70 karakter altı
açıklama 5, 160 karakteri aşan açıklama 3.

İç bağlantıların tamamı `tests/e2e/route-inventory.spec.ts` ile taranır;
envanter dışı veya kırık hedef testi kırar.

---

## 9. S13 — yapılandırılmış veri

Üretim derlemesinde ölçülen dağılım:

| Tür                   | Blok                                 |
| --------------------- | ------------------------------------ |
| `Organization`        | 64 (her sayfada tam olarak bir tane) |
| `BreadcrumbList`      | 57                                   |
| `Service`             | 26                                   |
| `BlogPosting`         | 5                                    |
| `SoftwareApplication` | 2 (CyclOps TR/EN)                    |

**Sayfada görünenden fazlası iddia edilmedi.** Şu alanlar bilinçli olarak
yoktur ve hem birim hem E2E testleriyle yasaklanır: `sameAs`,
`aggregateRating`, `review`, `award`, `numberOfEmployees`, `offers`, `price`,
`priceRange`, `softwareVersion`, `memberOf`, `brand`.

- **`sameAs` yok** — doğrulanmış sosyal hesap yok; uydurma hesap yazılmaz.
- Partnerlik, müşteri sayısı ve başarı metriği yok.
- `SoftwareApplication` uygunluğu değerlendirildi: CyclOps sayfası gerçek ürün
  ekranları, tanımlı bir işlev ve üretici bilgisi taşıdığı için tür uygundur.
  Sürüm, fiyat ve değerlendirme alanları **yazılmadı**.
- Yazar tipi `Organization`: içgörüler **ortak imzayla** yayımlanıyor, uydurma
  bir gerçek kişi adı iddia edilmiyor.

Her blok parse ve semantik testinden geçer (`tests/unit/structured-data.test.ts`,
50 test). Yasak alan dedektörünün **kendisi de** kanıtlandı: iç içe gömülü
`sameAs` ve dizi içindeki `aggregateRating` fikstürleriyle yakaladığı
gösterildi.

E2E ise gerçek build çıktısını denetler: her bloğun `@context`/`@type`'ı,
tüm URL'lerin canonical ile **aynı kökende** olması ve **aynı türden bloğun
tekrar etmemesi**.

### Bulunan gerçek hata

Bir süre **her içgörü sayfasında iki `BlogPosting` bloğu** basılıyordu: biri
S11'den kalan bileşen, diğeri S13'te eklenen katman. İki ayrı üretici sessizce
birbirinden ayrışabilirdi. Tek üreticide birleştirildi ve "aynı tür tekrar
etmiyor" kontrolü eklendi. `url` ve `@id` artık canonical'dan **türetiliyor**;
"aynı olmasını ummak" yerine yapı gereği aynı.

---

## 10. S13 — Open Graph görselleri

`scripts/build-og-images.mjs`, `sharp` ile **gerçek 1200×630 PNG** üretir
(yer tutucu veya SVG değil):

| Dosya             | Boyut | Kapsam             |
| ----------------- | ----- | ------------------ |
| `og-default.png`  | 26 KB | ana marka yedeği   |
| `og-cyclops.png`  | 27 KB | CyclOps rotaları   |
| `og-insights.png` | 26 KB | içgörü rota ailesi |

Kaynak yalnızca **Duosis marka sistemi**: koyu yüzey `#14181c`, vurgu
`#16a6de`, kendi wordmark'ımız ve Command Atlas'ın sinyal yolu geometrisi.
**Üçüncü taraf logosu veya izinsiz müşteri markası kullanılmadı**; görsellerde
müşteri adı, partnerlik iddiası veya metrik yok.

Yeni bir çalışma zamanı bağımlılığı eklenmedi — `sharp` zaten `astro:assets`
için kuruluydu. Görseller depoya işlendi, derleme sırasında üretilmiyor.

`tests/unit/og-images.test.ts` (14 test) üreticiye **sormaz**, diskteki
baytları okur: PNG imzası, IHDR'den okunan gerçek 1200×630 boyut, makul dosya
boyutu, içeriğin SVG/metin **olmaması** ve üç kartın birbirinden **farklı**
olması. E2E ayrıca her rotanın `og:image` adresinin 200 ve `image/png`
döndüğünü doğrular.

---

## 11. Görsel cila backlog'u

`VISUAL_POLISH_BACKLOG.md` oluşturuldu: **8 madde**, her biri bugünkü durum,
hedef ve **ölçülebilir** kabul kriterleriyle. "Daha güzel olsun" gibi
ölçülemeyen bir kriter bilinçli olarak yazılmadı.

Kapsanan maddeler: hero sinyal yolları ve kontrollü reveal; dark/light bölüm
ritmi; Solution Atlas odak/hover anlatısı; CyclOps ürün ekranı premium çerçeve; 10. yıl zaman çizelgesi vurgu hareketi; içgörü sayfalarında editoryal ritim;
reduced-motion tam statik yedek; scroll hijacking ve ağır WebGL yasağı.

Genel sınırlar her maddede geçerli: `prefers-reduced-motion` altında hareket
≤ 1 ms, scroll hijacking yok, WebGL yok, ana sayfa istemci JS ≤ 12 KB gzip
(bugün 978 B), etkilenen rotalarda CLS 0.

**Bu backlog S12/S13'te uygulanmadı**; S15 sanat yönetimi sprintinin girdisidir.

S12/S13 görsel tutarlılığı korundu: form ve onay alanları Command Atlas
dilinde (keskin kenar, düşük radius, ince teknik çizgi) tasarlandı; jenerik
SaaS yuvarlaklığı ve gölge kullanılmadı.

---

## 12. Kapılar ve ölçümler

| Kapı                                     | Sonuç                        |
| ---------------------------------------- | ---------------------------- |
| `pnpm format:check`                      | temiz                        |
| `pnpm lint`                              | temiz                        |
| `pnpm typecheck` (`astro check` + `tsc`) | 181 dosya, 0 hata            |
| `pnpm test` (birim)                      | 24 dosya, 489 test           |
| `pnpm test:e2e`                          | S12 checkpoint'inde 838 test |
| `pnpm build`                             | 64 sayfa                     |
| `pnpm seo:report`                        | 64 sayfa, 0 ihlal            |
| `pnpm audit --prod`                      | bilinen açık yok             |

### Ortam kaynaklı bir kesinti ve neden rapor edilmediği

S12 kapısının ilk koşusu 328 başarısızlık verdi. **Bu sonuç ürünle ilgili
değildi ve rapor edilmedi.** Kök neden ölçüldü: makinedeki
`berqnet-connect-service` ve `berqnet-helper-service` süreçleri aralarında
**~30.520 loopback TCP bağlantısı** tutuyordu; Windows dinamik port aralığı
(49152–65535, 16.384 port) tamamen tükenmişti ve Chromium kaynak portu
alamıyordu. 328 hatanın 310'u `ERR_ADDRESS_IN_USE` idi.

Servisler yeniden başlatıldıktan sonra kapı temiz koşuldu. Kalan **5** gerçek
hata bölüm 5'te anlatıldı ve düzeltildi.

Bu kayıt bilerek tutuldu: yeşil olmayan bir kapıyı "ortam sorunu" diyerek
geçiştirmek yerine, kök neden ölçülüp ayrıştırıldı ve kapı **gerçekten**
yeşile alındı.

---

## 13. Üretimi bekleten dış girdiler

Aşağıdaki kararlar **bizim veremeyeceğimiz** kararlardır. Hiçbiri uydurulmadı;
her biri için sistem fail-closed durumda bekliyor.

| #   | Bekleyen girdi                                                    | Bugünkü davranış                                                                                                     |
| --- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | **Dağıtım / çalışma zamanı hedefi** (Netlify, Cloudflare, nginx…) | Yönlendirme çıktıları sağlayıcıdan bağımsız üretiliyor; hiçbiri uygulanmadı. Form sunucu çekirdeği adaptör bekliyor. |
| 2   | **CRM veya e-posta teslim hedefi** (`CONTACT_FORM_TO`)            | Teslim kanalı kapalı; form "gönderilmedi" diyor.                                                                     |
| 3   | **Hukuk onaylı KVKK metni**                                       | Sayfa taslak ve `noindex`; `reviewStatus: "legal-review-required"`.                                                  |
| 4   | **Veri saklama süresi**                                           | Metinde süre **yazılmadı**; "henüz belirlenmedi" deniyor.                                                            |
| 5   | **Spam sağlayıcısı ve secret'ı** (Turnstile vb.)                  | Doğrulayıcı yapılandırılmamış; fail-closed olarak **her** gönderimi reddediyor.                                      |
| 6   | **Analytics sağlayıcısı / property ID**                           | Sağlayıcı `none`; izin verilse bile hiçbir istek yapılmıyor.                                                         |
| 7   | **Nihai indeksleme onayı**                                        | Tüm sayfalar `noindex`; üretim sitemap'i boş. Karar S15 içerik doğruluk kapısında.                                   |

Bu yedi girdi gelmeden site **üretime alınamaz** — ve alınmaya çalışılırsa
derleme veya çalışma zamanı kapıları bunu **engeller**.

---

## 14. Durum

S13 sonunda **durulmuştur**.

- Dal ana dala **birleştirilmedi**.
- **S14 başlatılmadı**.
- Gerçek dağıtım, DNS değişikliği, dış servis hesabı ve üretim kimlik bilgisi
  **oluşturulmadı**.
