# Architecture Decision Record — Taslak (S00 / S00-R1)

Bu kayıtlar **taslaktır.** Hiçbiri S00'da uygulanmadı. `PROPOSED` olanlar S01'de, `OPEN` olanlar iş sahibi kararından sonra kesinleşir.

> **S00-R1 (2026-09-08):** İki zorunlu kaynak (SRC-01 kurumsal sunum, SRC-02 hackathon brief) incelendi. Güncellenen kayıtlar: ADR-001, ADR-002, ADR-004, ADR-005, ADR-007. Yeni kayıtlar: **ADR-009** (çözüm taksonomisi), **ADR-010** (kaynak güvenilirlik sırası). Değişmeyenler: ADR-003, ADR-006, ADR-008.
>
> **S00-R2 (2026-09-08):** Codex planlama kararları uygulandı. **ADR-009** `OPEN` → **`PROVISIONAL`** (8 çözüm kaydı onaylandı, S02 bloklanmıyor). **ADR-010** kaynak otoritesi ifadesi düzeltildi — sunumun "şirketin onayladığı anlatı" olduğu kanıtlanmamıştır.

---

## ADR-001 — Framework: Astro + TypeScript strict

- **Durum:** PROPOSED (sözleşme varsayılanı doğrulandı; kaynakla teyit edildi)
- **Bağlam:** `02_TECHNICAL_ARCHITECTURE.md` §1 Astro'yu varsayılan seçiyor ve "Astro dışı mevcut bir repo bulunursa S00'da ölçülür" diyor.
- **S00 ölçümü:** Mevcut bir repo **yok**. Devralınacak kod tabanı olmadığı için stack değişikliği gerekçesi de yok. Site içeriğinin ezici çoğunluğu statik pazarlama sayfası (54 URL'nin 53'ü), yalnızca iletişim formu dinamik uç gerektiriyor. Bu profil Astro'nun statik-öncelikli modeliyle örtüşüyor.
- **S00-R1 eki — brief ne diyor:** SRC-02 Astro'yu **"önerilir, zorunlu değil"** olarak konumlandırıyor: *"İçerik ağırlıklı kurumsal site için en iyi Core Web Vitals'i verir; interaktif parçaları (timeline, CyclOps animasyonu) island olarak koyarsın. Ekip Next.js / Nuxt / SvelteKit gibi başka bir modern frontend'i daha iyi biliyorsa onu seçebilir."* Yani brief Astro'yu **dayatmıyor**, ekibe seçim serbestliği bırakıyor.
- **Karar:** Astro + TypeScript strict ile devam. Plan paketi (bağlayıcı sözleşme) Astro'yu varsayılan yapıyor, brief de aynı yönde öneriyor; iki kaynak çelişmiyor. Sapma gerekçesi yok.
- **Sonuç:** WordPress'ten tam geçiş. Hiçbir WordPress verisi/eklentisi taşınmayacak; içerik yeniden yazılacak.

---

## ADR-002 — Node runtime ve paket yöneticisi

- **Durum:** PROPOSED — **S01 kurulum ön koşulu**
- **S00 ölçümü:** Node **v18.12.1** (kullanım ömrü sona ermiş), npm 8.19.2, **pnpm kurulu değil**.
- **Karar:** S01 başında güncel aktif Node LTS doğrulanıp kurulacak; `.nvmrc` + `package.json > packageManager` + CI matrisi ile pinlenecek. pnpm kurulacak (`corepack enable` veya doğrudan kurulum), lockfile commit edilecek.
- **Sınıflandırma (S00-R1):** Bu bir **S01 blokajı değildir.** Ortam hazırlığı S01'in normal ilk adımıdır ve S01 kapsamı içinde çözülür; harici bir karar, onay veya kaynak gerektirmez. R0 raporundaki "S01'in ilk bloklayıcısı" ifadesi bu şekilde düzeltilmiştir.
- **Not:** Node 18 ile devam edilmesi hâlinde güncel Astro sürümleri ve güvenlik güncellemeleri desteklenmeyebilir; bu yüzden yükseltme S01'de yapılacak ilk iştir.

---

## ADR-003 — Deployment hedefi

- **Durum:** **OPEN — iş sahibi kararı gerekli**
- **S00 ölçümü:** Mevcut site **nginx/1.22.1** üzerinde kendi barındırmasında çalışıyor (WordPress). Yeni site için hedef ortam bilinmiyor. Hosting sağlayıcısı, CDN, sertifika ve DNS yönetimi hakkında bilgi yok.
- **Geçici karar:** `02_TECHNICAL_ARCHITECTURE.md` §1 uyarınca **provider-specific kod çekirdeğe yayılmayacak.** S01–S15 boyunca adapter kararı ertelenebilir; statik çıktı + tek bir form endpoint'i her sağlayıcıda çalışacak biçimde soyutlanacak.
- **Karar gerektiren:** Mevcut nginx sunucusunda mı kalınacak, yoksa yönetilen bir platforma mı geçilecek? Bu karar güvenlik başlıkları (ADR-006) ve form runtime'ının (ADR-004) nasıl uygulanacağını belirler.

---

## ADR-004 — Form için sunucu runtime

- **Durum:** PROPOSED
- **S00 ölçümü:** Mevcut form Contact Form 7; alanlar Name / Email / CepTel / mesaj. **KVKK onay kutusu yok, spam koruması yok.** Form gönderiminin nereye gittiği (e-posta mı, CRM mi) dışarıdan tespit edilemiyor.
- **Karar:** İçerik sayfaları statik kalır; **yalnızca form gönderimi için** on-demand/server endpoint kullanılır. CRM hedefi bilinmediği için `02_TECHNICAL_ARCHITECTURE.md` §6 uyarınca provider interface + dry-run adapter yazılacak; prod'da sahte başarı döndürülmeyecek.
- **S00-R1 eki:** SRC-02 bu yaklaşımı doğruluyor ve belirsizliği azaltıyor: *"Çalışan iletişim formu (gerçek CRM zorunlu değil; e-posta fallback yeterli)"* ve spam koruması için *"Cloudflare Turnstile / hCaptcha"* öneriliyor. Yani **e-posta fallback kabul edilebilir bir varsayılandır**; CRM entegrasyonu prod gereksinimi olarak ertelenebilir. Ayrıca brief CRM hedefi + form alan eşlemesini iş tarafından gelecek girdiler arasında sayıyor — yani bu bilgi henüz mevcut değil, S00'da eksik olması beklenen bir durumdur.
- **Karar gerektiren:** CRM/e-posta hedefi, veri saklama süresi, Turnstile/hCaptcha için hesap ve secret sağlanması.

---

## ADR-005 — İçerik kaynağı: Astro Content Collections

- **Durum:** PROPOSED
- **S00 ölçümü:** Devralınacak yapılandırılmış içerik yok. Mevcut içerik WPBakery shortcode'larına gömülü ve makine tarafından güvenilir biçimde ayrıştırılamaz; ayrıca içeriğin çoğu zaten yeniden yazılacak. Otomatik içerik göçü **önerilmiyor**.
- **Karar:** `03_CONTENT_AND_ROUTE_MAP.md` §4 şemalarıyla Astro Content Collections. `verificationStatus` ve `logoPermission` alanları, S00 doğruluk matrisindeki `pending` / `source-present-owner-unverified` kayıtların kamuya açık build'e sızmasını şema seviyesinde engelleyecek.
- **S00-R1 eki — brief'in CMS notu:** SRC-02 aynı yaklaşımı öneriyor (*"hackathon'da collections ile kur, 'prod'da headless CMS'e bağlanır' notunu düş"*) ve prod alternatifi olarak **Payload / Strapi / Directus** (self-host, KVKK açısından temiz) ya da **Sanity** (hosted) sayıyor. Bu, Content Collections kararını geçici bir tercih değil, **kasıtlı bir geçiş stratejisi** hâline getiriyor: içerik modeli aynı kaldığı için sonradan CMS'e taşıma maliyeti düşük olacak.
- **S00-R1 eki — şema etkisi:** Sunumun çözüm detay şablonu (DUOSIS Yaklaşımı → Neler Sunuyoruz? → Beklenen Fayda → Teknoloji Ekosistemi → İlgili Referanslar) `03` §5'teki 10 adımlı şablonla büyük ölçüde örtüşüyor. Ancak sunum **9**, plan paketi **8**, brief **8 farklı** çözüm tanımlıyor (bkz. ADR-009) — *(tarihsel R1 bulgusu)* şema yazılmadan önce taksonomi kesinleşmeli. **Bu gereksinim S00-R2'de ADR-009 ile karşılandı; S02 şema ve draft fixture üretimi için serbesttir.**
- **Sonuç:** İçerik göçü manuel ve editoryal bir iştir; sprint tahminlerine dahil edilmeli. Sunum metinleri (slayt 8–16) TR içerik için doğrudan kullanılabilir taslak malzeme sağlıyor — ancak "Teknoloji Ekosistemi" ve "İlgili Referanslar" bölümleri logo görselleri olduğu için izin durumu netleşmeden aktarılamaz.

---

## ADR-006 — Güvenlik başlıkları

- **Durum:** PROPOSED — ADR-003'e bağımlı
- **S00 ölçümü:** Mevcut sitede **hiçbir güvenlik başlığı yok** (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors — hiçbiri). `nginx/1.22.1` sürüm ifşası var, `xmlrpc.php` erişilebilir.
- **Karar:** S14'te OWASP referanslarıyla tam başlık seti uygulanacak. Uygulama yöntemi (nginx conf mu, platform config mi) ADR-003 kararına bağlı.

---

## ADR-007 — Consent ve analitik

- **Durum:** PROPOSED — **davranış değişikliği içerir**
- **S00 ölçümü:** Google Consent Mode varsayılanları doğru (`denied`) ancak **onay arayüzü hiç yok**; GA4 fiilen ölçüm yapamıyor ama 171 KB gtag.js her ziyaretçiye iniyor. Yandex.Metrika consent mode kapsamı dışında, `webvisor:true` (oturum kaydı) ile **onay arayüzü olmadan** yükleniyor.
- **Karar:** Yeni sitede hiçbir analitik script'i onay öncesi DOM'a veya ağa eklenmeyecek (`02_TECHNICAL_ARCHITECTURE.md` §7). Reddetme, kabul etmek kadar kolay olacak. Olay isimleri PII içermeyecek. Bu, mevcut sitenin davranışının yeni siteye **taşınmayacağı** anlamına gelir.
- **S00-R1 eki:** SRC-02 bunu kesin kısıt sayıyor: *"KVKK — çerez consent opt-in; analitik yalnızca onaydan sonra yüklenir."* Plan paketi ve brief bu konuda tam mutabık.
- **Sınıflandırma (S00-R1):** Mevcut sitedeki durum **yüksek öncelikli KVKK/consent uyum riski** olarak kaydedilmiştir. S00 hukuki bir ihlal tespiti yapmaz; mevcut uygulamanın değerlendirilmesi ve gerekiyorsa düzeltilmesi **Duosis hukuk birimi ve veri sorumlusunun** kararıdır.
- **Karar gerektiren:** Yandex.Metrika devam edecek mi? Devam edecekse webvisor'ın hangi koşulda çalışacağı hukuk onayına bağlanmalı. GA4 mülkü (`G-C9DG54493V`) korunacak mı, yeni mülk mü açılacak?

---

## ADR-008 — Marka paleti türetmesi

- **Durum:** PROPOSED — **S03 için bağlayıcı kısıt**
- **S00 ölçümü:** Marka cyanı `#16A6D9` beyaz üzerinde **2.80:1** kontrast veriyor; WCAG 2.2 AA'yı normal metinde de büyük metinde de karşılamıyor. Ink zeminde 5.17:1 ile geçiyor. Ayrıca logoda iki farklı cyan (`#16A6D9`, `#16A6DE`) ve iki farklı ink (`#252A2E`, `#242A2F`) bulunuyor.
- **Karar:** `#16A6D9` **marka/işaret rengi** olarak korunur ancak paper yüzeylerde metin/link/odak rengi olarak **doğrudan kullanılamaz.** S03'te aynı hue üzerinde AA'yı geçen koyulaştırılmış bir varyant türetilecek; cyan tam doygunluğuyla yalnızca ink zeminlerde ve dekoratif/işaret rolünde kullanılacak.
- **Ek:** Plan paketindeki "turkuaz" terimi ölçümle uyuşmuyor (hsl 196° = gök mavisi). Terim düzeltilmeli.
- **Karar gerektiren:** Logodaki çift değerlerin tekilleştirilmesi ve 10. yıl logo güncellemesi yapılıp yapılmayacağı.

---

## ADR-009 — Çözüm taksonomisi (S00-R1'de eklendi, S00-R2'de karara bağlandı)

- **Durum:** **PROVISIONAL — S02 ve S07 implementasyonu için onaylı; nihai kamuya açık isimler iş sahibi doğrulaması bekliyor.**
- **Bağlam:** S00-R1'de iki zorunlu kaynak incelendikten sonra elimizde **üç farklı çözüm taksonomisi** vardı:

  | Kaynak | Yapı | Kapsam |
  |---|---|---|
  | Plan paketi `03` (bağlayıcı sözleşme) | 8 çözüm | Observability, CMDB, ITSM, Data Streaming, EA, AIOps, Automation, Engineering & Product Development |
  | Brief SRC-02 | 8 fayda başlığı | İzleme ve APM **ayrı**; Automation ayrı alan değil; 8. madde "AI etkinleştirme / CyclOps orkestrasyonu" |
  | Sunum SRC-01 | 4 üst başlık + **9 detay** | Yapay Zeka, EA, ITSM, **ITAM**, ITOM, Büyük Veri ve Analitik, Data Streaming, CMDB, Otomasyon |

- **Çatışma noktaları:**
  - **ITAM** yalnızca sunumda ayrı bir çözüm; plan paketinde yok (CMDB'ye katlanmış olabilir).
  - **Engineering & Product Development** yalnızca plan paketinde var; sunumda ve brief'te yok.
  - **APM** sunumda ITOM'un alt maddesi, brief'te ayrı bir çözüm.
  - **Automation** plan paketi ve sunumda ayrı alan, brief'te ayrı alan değil.
  - **CyclOps** yalnızca brief'in taksonomisinde adı geçen bir bileşen.

- **Karar (Codex planlama kararı, S00-R2):** Prototip implementasyonu için aşağıdaki **sekiz kayıt** onaylanmıştır:

  | # | Çözüm alanı | Kapsam kuralı |
  |---:|---|---|
  | 1 | **Observability & APM** | APM bu alanın **altında** yer alır, ayrı çözüm değildir |
  | 2 | **Configuration & Asset Management** | **CMDB ve ITAM bu alandadır** — sunumdaki iki ayrı slayt burada birleşir |
  | 3 | **IT Service Management** | — |
  | 4 | **Data Streaming & Integration** | Sunumdaki "Data Streaming" ve "Büyük Veri ve Analitik" bu alana bağlanır |
  | 5 | **Governance & Enterprise Architecture** | — |
  | 6 | **AIOps & Event Lifecycle Management** | **CyclOps yalnızca `draft`/`pending` veri olarak** bulunabilir |
  | 7 | **Automation** | — |
  | 8 | **Engineering & Product Development** | Plan paketinden korundu |

- **Bağlayıcı kurallar:**
  - **CyclOps hakkında doğrulanmamış hiçbir yetenek veya ürün iddiası public build'e çıkamaz.** Altıncı çözümdeki CyclOps verisi `status: draft` ve `verificationStatus: pending` olarak tutulur; `03_CONTENT_AND_ROUTE_MAP.md` §7 gereği kamuya açık build'de görünmez.
  - Nihai başlıklar ve kapsamlar iş sahibi tarafından **daha sonra değiştirilebilir**; `Solution` şeması ve rota üretimi başlık/slug/kapsam değişikliğini kod değişikliği gerektirmeden karşılayacak biçimde kurulmalıdır (başlıklar içerik verisinden gelir, koda gömülmez).
  - Bu kayıtların **kamuya açık başlıkları** fayda odaklı yazılacaktır (`01_PRODUCT_AND_DESIGN_CONTRACT.md` §4); yukarıdaki adlar **iç taksonomi etiketleridir**, birebir yayınlanacak başlıklar değildir.

- **Sonuç:** **S02 artık taksonomi nedeniyle bloklanmıyor.** Şema ve draft fixture üretimi serbesttir. İş sahibi doğrulaması nihai kamuya açık isimler ve kapsam sınırları için beklenmeye devam eder.

---

## ADR-010 — Kaynak güvenilirlik sırası (S00-R1'de eklendi)

- **Durum:** PROPOSED
- **Bağlam:** Aynı bilgi için birden fazla kaynak çeliştiğinde hangisinin üstün olduğu belirsizdi.
- **Karar:** Aşağıdaki öncelik sırası uygulanacak ve her içerik kaydında kaynak izlenecek:

  1. **İş sahibinin yazılı teyidi** — her şeyin üstünde. Kamuya açık iş iddiaları için **tek yeterli kaynak budur**.
  2. **Kurumsal sunum (SRC-01)** — **kullanıcı tarafından sağlanan kurumsal sunum; elimizdeki en güçlü kurumsal anlatı kaynağıdır, fakat kamuya açık iş iddiaları yine iş sahibi doğrulaması gerektirir.**
  3. **Canlı site (duosis.com)** — yayında olan ama büyük ölçüde 2024'te donmuş içerik; iletişim bilgileri için güvenilir, teknoloji listesi için güncel değil.
  4. **Hackathon brief (SRC-02)** — planlama ve kapsam belgesi; **ürün yeteneği veya iş gerçeği kanıtı değildir**.
  5. **Plan paketi sözleşmeleri** — teknik ve tasarım kararları için bağlayıcı; iş gerçekleri için kaynak değil.

- **Sunumun statüsü hakkında açıklık (S00-R2 düzeltmesi):** R1'de sunum "şirketin onayladığı güncel anlatı" olarak tanımlanmıştı. **Bu kanıtlanmış değildir.** Elimizdeki tek bilgi, dosyanın kullanıcı tarafından sağlandığı ve kurumsal bir sunum biçiminde olduğudur; hangi tarihte, kim tarafından, hangi onay süreciyle hazırlandığı bilinmemektedir. Sunum bu yüzden **en güçlü kurumsal anlatı kaynağı** sayılır, ancak **onay kanıtı** sayılmaz.

- **Bunun pratik sonucu:** Aşağıdakiler sunumda yer alsa dahi iş sahibi doğrulaması olmadan **yayınlanmaz**:
  - `10+ yıllık tecrübe`, `50+ kurumsal müşteri`, `15+ teknik danışman` (C01–C03)
  - Kuruluş tarihi ve yeri — 2016, İstanbul (C19)
  - Ekip yapısı ve sayıları (C20)
  - Müşteri referansları ve logoları (C23) — ayrıca yazılı logo kullanım izni gerekir

- **Önemli sınır:** Brief'in bir şeyi tarif etmesi, o şeyin var olduğunu göstermez. **CyclOps** bu kuralın somut örneğidir: brief'te 9 kez geçer, kurumsal sunumda ve canlı sitede 0 kez. Bu yüzden `content-truth-matrix.csv` C12'de `claim-only-no-product-evidence` olarak sınıflandırılmıştır.
