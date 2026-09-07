# S00 — Discovery, Kaynak Envanteri ve Baseline Bulguları

> **Revizyon: S00-R1 (2026-09-08).** İki zorunlu kaynak (kurumsal sunum + hackathon brief) teslim edildi ve incelendi. Web taraması ve baseline ölçümleri **tekrarlanmadı**; yalnızca kaynaklardan etkilenen bölümler güncellendi. Değişen bölümler: §0 (yeni), §1, §3, §4, §6, §8. Değişmeyen bölümler: §2, §5 (ölçümler R0'dan aynen korundu).
>
> **Revizyon: S00-R2 (2026-09-08).** Codex tutarlılık düzeltmeleri ve planlama kararları uygulandı. Web taraması ve baseline ölçümleri yine **tekrarlanmadı**. Yapılanlar: C11 ve C17 claim metinleri düzeltildi; `decisionNeeded` `{yes,no}` olarak normalize edildi (25 yes / 10 no); `logoPermission` sözleşme enum'una çekildi (35/35 `unknown`) ve lisans bilgisi ayrı `licenseModel` alanına taşındı; B30 sayım hatası 9 → **10** düzeltildi; ADR-009 `PROVISIONAL` olarak karara bağlandı (8 çözüm kaydı, S02 bloklanmıyor); ADR-010 kaynak otoritesi ifadesi düzeltildi; B18/C26 mesaj hiyerarşisi ve B34 kapsam farkı çözümlendi.

- **Ölçüm tarihi:** 2026-09-07 / 2026-09-08 (web ölçümleri), 2026-09-08 (kaynak incelemesi)
- **Ölçüm yöntemi:** Canlı site HTTP çekimi (curl), 54 sayfanın tam HTML analizi, Chrome headless ekran görüntüsü, SVG/renk ölçümü, WCAG kontrast hesabı, PDF metin + gömülü görsel çıkarımı
- **Kapsam:** Kod yazılmadı, bağımlılık kurulmadı, mevcut dosya değiştirilmedi. Yalnızca ölçüm ve envanter.

---

## 0. Kaynak envanteri (S00-R1'de eklendi)

| # | Dosya | Boyut | SHA-256 | Değiştirilme | Biçim |
|---|---|---:|---|---|---|
| SRC-01 | `Duosis_Yeni_Sunum_v2.pdf` | 2.155.996 B | `c4b56f78e0f460d3d635a82e35c975e0e3e62e44625aff2c98b083fd1c0b788c` | 2026-09-08 00:45:33 | PDF, **17 slayt** |
| SRC-02 | `duosis-hackathon-brief.txt` | 9.041 B | `3aa7cfaba3a7b184487a596eb21d02045e1e2446487ccdfdb874b26e699ef3fb` | 2026-09-03 13:22:27 | UTF-8 düz metin |

Makine okunur kopya: [source-inventory.csv](source-inventory.csv)

**Dosya adı farkları (bilgi amaçlı, engelleyici değil):**

- Sprint dosyası `Duosis_Yeni_Sunum_v2.**pptx**` bekliyordu; teslim edilen dosya **PDF**. İçerik 17 slayt olarak doğrulandı ve tamamı incelendi.
- Sprint dosyası `duosis-hackathon-brief**(1)**.txt` bekliyordu; teslim edilen ad `duosis-hackathon-brief.txt` — `(1)` soneki yok.

**İnceleme yöntemi ve kapsamı:**

- Sunum: 17 slaydın tamamının metni çıkarıldı (`pdftotext -layout`). Ek olarak **289 gömülü görselin** slayt dağılımı çıkarıldı ve teknoloji/müşteri logolarını tanımlamak için ilgili slaytların (7, 8–16) logoları PNG'ye dönüştürülüp görsel olarak incelendi. Bu gerekliydi çünkü sunumda **hiçbir teknoloji adı metin olarak geçmiyor** — hepsi logo görselidir.
- Brief: 9.041 baytın tamamı okundu.

---

## 1. Çalışma ortamı ve repo durumu

| Öğe | Ölçülen durum |
|---|---|
| Çalışma dizini | `c:\Users\ASUS\Desktop\Duosis web site` |
| Git deposu | **YOK** — `git rev-parse` üst dizinlerde de `.git` bulamadı |
| Branch / HEAD | Yok (repo olmadığı için) |
| Mevcut dosyalar | Yalnızca `duosis_web_sitesi_planlamasi/` — **25 dosya**: 16 sprint `.md` (S00–S15) + 7 kök `.md` (5 ana sözleşme + `CLAUDE_REPORT_TEMPLATE.md` + `RESEARCH_SOURCES.md`) + 2 kaynak dosyası (SRC-01, SRC-02) |
| `AGENTS.md` / `CLAUDE.md` / `README` | **Yok** |
| CI yapılandırması | **Yok** |
| Node.js | **v18.12.1** |
| npm | 8.19.2 |
| pnpm | **Kurulu değil** |
| Git | 2.51.2.windows.1 |
| Chrome (headless) | Mevcut — baseline görsel kanıt için kullanıldı |
| Lighthouse CLI | Kurulu değil |

### Bulgular

- **B1 — Repo yok.** `04_DELIVERY_PROTOCOL.md` §2 açıkça diyor: *"Repo henüz yoksa S00 bunu raporlar; git init ve ilk commit yalnız S01 kapsamındadır."* Bu nedenle S00'da `git init` yapılmadı ve **yerel commit oluşturulamadı**. Bu bir eksiklik değil, protokolün gereğidir.
- **B2 — Node sürümü: S01 kurulum ön koşulu.** `02_TECHNICAL_ARCHITECTURE.md` §1 "güncel aktif Node LTS" istiyor; kurulu sürüm **Node 18** (kullanım ömrü sona ermiş). Bu bir S01 **blokajı değil**, S01'in ilk kurulum adımıdır: aktif LTS kurulur, `.nvmrc` / `packageManager` / CI ile pinlenir. Rutin bir ortam hazırlığıdır.
- **B3 — pnpm: S01 kurulum ön koşulu.** Sözleşme pnpm'i zorunlu tutuyor; kurulu değil. Yine blokaj değil, S01 kurulum adımıdır (`corepack enable` veya doğrudan kurulum).
- **B4 — Kullanıcı değişikliği yok.** Plan paketi dosyalarının hiçbirine dokunulmadı. S00-R1'de eklenen iki kaynak dosyası da **salt-okunur** işlendi (mtime'ları korundu).

### Kaynak girdileri — S00-R1'de çözüldü

S00 (R0) raporunda `Duosis_Yeni_Sunum_v2.pptx` ve `duosis-hackathon-brief(1).txt` bulunamamıştı ve içerikleri hakkında hiçbir varsayım yapılmamıştı. **S00-R1'de her ikisi de teslim edildi ve tamamı incelendi** (bkz. §0). Bu inceleme sonucunda:

- **10+ yıl, 50+ kurumsal müşteri, 15+ teknik danışman** rakamlarının **kaynağı bulundu** (sunum slayt 3) — artık "kaynaksız" değil, "kaynakta mevcut, iş sahibi doğrulaması bekliyor".
- **Kuruluş yılı ve yeri ortaya çıktı:** 2016, İstanbul (sunum slayt 3).
- **Bölgesel kapsam iddiası (Central Asia / Middle East) hâlâ kaynaksız** — iki yeni belgede de 0 eşleşme.
- **CyclOps yalnızca brief'te var**, sunumda ve sitede yok.

---

## 2. Mevcut site envanteri (https://duosis.com/)

### Teknoloji tabanı — ölçülen

| Öğe | Değer |
|---|---|
| CMS | **WordPress 6.7.7** |
| Tema | **Woodmart 7.3.0** (WooCommerce/e-ticaret teması) |
| Sayfa kurucu | **WPBakery Page Builder** (`js_composer` 8.0.1) |
| SEO eklentisi | Rank Math |
| Form | Contact Form 7 (6.0.1) |
| Analitik | Google Site Kit 1.186.0 → GA4 `G-C9DG54493V` + **Yandex.Metrika `98095349`** |
| Consent | WP Consent API 1.0.7 + Google Consent Mode (varsayılan tümü `denied`) |
| Sunucu | nginx/1.22.1 |
| Dil | `lang="tr"` — **tek dilli**, hreflang yok, `/en/` → 404 |
| Site yapımcısı | Footer: "duosis 2024 | atolyework" |

### URL envanteri

- **54 URL** (51 sayfa + 2 blog yazısı + blog landing)
- **Tümü HTTP 200** — sitemap'te kırık URL yok
- Duplicate URL: 0, boş URL: 0
- Tam liste: [legacy-url-inventory.csv](legacy-url-inventory.csv)

### Menü ağacı — ölçülen

```
Anasayfa
Hakkımızda
Hizmetlerimiz      → Danışmanlık, Destek, Eğitim, Dış Kaynak Yönetimi, Yönetilen Hizmetler   (5)
Uzmanlıklarımız    → ITOM, ITSM, APM, DEVOPS, Veritabanı Yönetimi, Raporlama ve
                     Görselleştirme, Konfigürasyon ve Varlık Yönetimi, Yazılım Geliştirme    (8)
Çözümlerimiz       → ATM ve Kiosk, IOT Monitoring, Bütünleşik İzleme ve Raporlama, AIOPS,
                     Üniversite Altyapı, Online Bankacılık, Hastane İzleme, Compliance and
                     Security Vulnerability, Hybrid Cloud Management, Predictive Analytics,
                     Postgre Migration                                                       (11)
Partnerlar         → Ardoq, Kron Teknoloji, Confluent, Device42, Grafana, Opentext, Instana,
                     DataDog, Pandora FMS, Quest, Stor2RRD, Postgre SQL, Vertica, Zabbix     (14)
Blog
İletişim
```

**Menüde olmayan ama yayında olan sayfalar:** `/runecast/`, `/is-ilanlari/`, `/basvuru-formu/` ve 7 KVKK/politika sayfası (footer'da).

### Bilgi mimarisi çakışması

Mevcut sitede **"Uzmanlıklarımız" (8) ve "Çözümlerimiz" (11) ayrı iki dal.** Yeni rota haritası (`03_CONTENT_AND_ROUTE_MAP.md`) tek bir `/cozumler/` altında **8 çözüm** tanımlıyor. Mevcut 19 sayfanın yeni 8 kayda nasıl katlanacağı **içerik sahibi kararı gerektirir** — envanterde bu satırlar `mapping_confidence: low` işaretlendi.

### İçerik tazeliği

| Yıl | URL sayısı |
|---:|---:|
| 2024 | 50 |
| 2025 | 2 |
| 2026 | 1 |

Ana sayfa son güncelleme: **2024-08-07** (~2 yıl). Sadece 3 partner sayfası (Ardoq 2026-02-20, Confluent 2025-02-17, Kron 2025-01-08) daha yeni. **Blog: toplam 2 yazı**, orijinal tarihleri 2019-09-10 ve 2020-08-04.

---

## 3. İçerik doğruluk matrisi — en kritik bulgu

Tam matris: [content-truth-matrix.csv](content-truth-matrix.csv)

**S00-R1 güncellemesi:** Dört ana iddiadan **üçünün kaynağı bulundu.** Sınıflandırma buna göre değişti.

| İddia | Kaynak durumu | Yeni sınıflandırma |
|---|---|---|
| **10+ yıllık tecrübe** | Sunum **slayt 3**'te yazılı. Sitede 0/54 sayfa | `source-present-owner-unverified` — **yayınlanamaz** |
| **50+ kurumsal müşteri** | Sunum **slayt 3**'te yazılı. Sitede 0/54 sayfa | `source-present-owner-unverified` — **yayınlanamaz** |
| **15+ teknik danışman** | Sunum **slayt 3**'te yazılı. Sitede 0/54 sayfa | `source-present-owner-unverified` — **yayınlanamaz** |
| Türkiye + Central Asia + Middle East | **Kaynak yok.** Sunumda 0, brief'te 0, sitede 0 | `pending` — **yayınlanamaz** |

"Kaynakta mevcut" ile "doğrulanmış" aynı şey değildir: bu üç rakam artık uydurma olmadıkları bilinen ama **iş sahibi tarafından teyit edilmemiş** ifadelerdir. Sözleşme (`03_CONTENT_AND_ROUTE_MAP.md` §7) `verificationStatus !== verified` olan metriklerin kamuya açık build'de gösterilmesini yasakladığı için üçü de **yayınlanamaz** kalır.

**Yeni ortaya çıkan şirket bilgisi (sunum slayt 3, birebir):**

> "DUOSIS, 2016 yılında İstanbul'da kurulmuş bir Bilgi Teknolojileri Danışmanlık şirketidir."

Bu, S09 timeline'ının başlangıç noktasıdır ve canlı sitenin hiçbir sayfasında yoktu. **Dikkat:** 2016 → 2026 aralığı tam **10 yıl**; sunumdaki "10+" ifadesi sınırdadır. Metnin "10 yıl" mı "10+ yıl" mı olacağı karara bağlanmalıdır.

**Bölgesel kapsam — iki yeni kaynak da desteklemiyor.** `Central Asia`, `Orta Asya`, `Middle East`, `Orta Doğu` terimleri sunumun 17 slaydında ve brief'in tamamında **0 kez** geçiyor. Sunum slayt 7'deki referansların tamamı Türkiye merkezli kurumlardır. Bu iddia `pending` kalır.

### CyclOps — iddia ile ürün kanıtının ayrımı

| | Kanıt |
|---|---|
| **Brief'teki iddia** | CyclOps **9 kez** geçiyor. "Duosis'in kendi ürünü", "entegratörden ürün sahibine taşıyan farklılık", kendi sayfasını hak ediyor; çözüm 3 (AIOps) ve çözüm 8'de (orkestrasyon) konumlandırılmış |
| **Kurumsal sunum (17 slayt)** | **0 kez.** Sunumda AI ve Otomasyon çözüm slaytları var ama CyclOps adı hiç geçmiyor |
| **Canlı site (54 sayfa)** | **0 kez** |
| **Teknik ürün kanıtı** | **Yok.** Ekran görüntüsü, sürüm, mimari doküman, müşteri kullanımı — hiçbiri yok |

**Brief bir planlama belgesidir; ürün yeteneğinin teknik kanıtı sayılamaz.** Bir ürünün hackathon brief'inde tarif edilmiş olması, o ürünün var olduğunu, çalıştığını veya tarif edilen yetenekleri taşıdığını göstermez. Kurumsal sunumda hiç geçmemesi ayrıca dikkat çekicidir — şirketin kendi tanıtım materyalinde yer almayan bir ürün, kamuya açık bir web sitesinde farklılaştırıcı olarak sunulamaz.

**Sonuç:** S08 (CyclOps Signal-to-Action) **BLOCKED** kalır. Gerçek ürün ekranı, doğrulanmış yetenek listesi, sürüm ve lansman durumu gelmeden başlayamaz.

### Müşteri referansları — S00-R1'in en yüksek riskli bulgusu

Canlı sitede yayınlanan müşteri logosu **yok** (`[gslogo id=1]` shortcode'u render edilmiyor). Ancak **sunum ~29 isimli kurumsal müşteri logosu içeriyor:**

- Slayt 7: sektör bazlı referans duvarı (34 gömülü görsel)
- Slayt 8–16: her çözümün "İlgili Referanslar" bölümünde tekrarlanan logolar

Görsel inceleme ile tanımlananlar arasında **Türkiye Cumhuriyet Merkez Bankası, Turkish Airlines, Turkcell, TOFAŞ, Sabancı Dx, TAV Havalimanları, iGA, DenizBank, Odeabank, Aktif Bank, TEB, Türkiye Finans, Ziraat Teknoloji, AgeSA, Anadolu Hayat Emeklilik, Kuveyt Türk, sigortam.net, hepsiJET, Moka United, Logo, turk.net, saat&saat, Eksim Yatırım Holding, Aygaz, Özyeğin Üniversitesi, ALJ, Bulutistan** bulunuyor.

> **İç sunumda logo bulunması yayın izni değildir.** `02_TECHNICAL_ARCHITECTURE.md` §5 varsayılanı `logoPermission: unknown`'dır ve §7 `logoPermission !== allowed` olan hiçbir logonun kamuya açık build'de görünmemesini şart koşar. Bu logoların hiçbiri, ilgili kurumdan **yazılı kullanım izni** alınmadan web sitesinde kullanılmayacaktır. Envanterdeki tüm kayıtlar `unknown` bırakıldı.

Ayrıca sunum, bir çalışanın adını, kurumsal e-postasını ve **cep telefonunu** içeriyor (slayt 17 ve tüm slayt altbilgileri). Bu kişisel veridir; ilgili kişinin açık rızası olmadan sitede yayınlanmayacaktır.

### Doğrulanabilen (sitede yayında olan) veriler

İstanbul ve Ankara ofis adresleri, iki telefon numarası, `info@duosis.com`, marka sloganı **"IT for More"** (sunumun 17 slaydının tamamında da kullanılıyor), blog yazı sayısı ve tarihler.

---

## 3A. Kaynak içerik haritası ve sekiz çözüm alanıyla eşleme (S00-R1)

### Sunumun yapısı (17 slayt)

| Slayt | İçerik |
|---:|---|
| 1 | Kapak — "BT Operasyonları, Gözlemlenebilirlik ve Otomasyon / Danışmanlık • Uygulama • Eğitim • Operasyon" |
| 2 | İçindekiler — 6 bölüm (Hakkımızda, Ekiplerimiz, Hizmetlerimiz, Çözümlerimiz, Referanslar, İletişim) |
| 3 | Hakkımızda — kuruluş 2016 İstanbul, güçlü alanlar, **10+ / 50+ / 15+**, Analiz→Tasarım→Uygulama→Destek |
| 4 | Ekiplerimiz — 4 ekip (BT Danışman, Satış, Yazılım Geliştirme, BT Operasyon) |
| 5 | Hizmetlerimiz — **4 hizmet** (Danışmanlık, Destek, Eğitim, Dış Kaynak ve Operasyon) |
| 6 | Çözüm mimarisi — 4 üst başlık × 4 alt madde |
| 7 | Referanslar — 4 sektör grubu, ~29 müşteri logosu |
| 8–16 | **9 çözüm detay slaydı** — hepsi aynı şablonda |
| 17 | İletişim — "Birlikte Yol Haritası Çıkaralım" + kişisel iletişim bilgileri |

**Çözüm detay şablonu (slayt 8–16'da birebir tekrarlanıyor):** DUOSIS Yaklaşımı → Neler Sunuyoruz? → Beklenen Fayda → Teknoloji Ekosistemi → İlgili Referanslar → CTA. Bu, `03_CONTENT_AND_ROUTE_MAP.md` §5'teki çözüm detay şablonuyla **büyük ölçüde örtüşüyor** — sözleşmedeki şablon kaynakla uyumlu, uydurma değil.

### Üç farklı çözüm taksonomisi — karara bağlanmalı

| Kaynak | Yapı |
|---|---|
| **Plan paketi** (`03`) | 8 çözüm: Observability, CMDB, ITSM, Data Streaming, EA, AIOps, Automation, Engineering & Product Dev. |
| **Brief** (SRC-02) | 8 fayda başlığı — izleme ve APM **ayrı**, Automation yok, 8. madde "AI etkinleştirme / CyclOps orkestrasyonu" |
| **Sunum** (SRC-01) | 4 üst başlık (Operasyonel Görünürlük / Servis & Varlık Yönetimi / Veri & Platform / Akıllı Operasyon) + **9 detay çözümü**: Yapay Zeka, EA, ITSM, **ITAM**, ITOM, Büyük Veri ve Analitik, Data Streaming, CMDB, Otomasyon |

- **B26 — Üç kaynak üç farklı taksonomi tanımlıyordu → S00-R2'de prototip için çözüldü.** Sunumdaki **ITAM** başlığı plan paketinin 8'inde yoktu; plan paketindeki **Engineering & Product Development** ise ne sunumda ne brief'te vardı. **Codex planlama kararı (ADR-009)** prototip implementasyonu için aşağıdaki 8 kaydı onayladı:

  1. Observability & APM — *APM bu alanın altındadır*
  2. Configuration & Asset Management — *CMDB ve ITAM bu alandadır*
  3. IT Service Management
  4. Data Streaming & Integration
  5. Governance & Enterprise Architecture
  6. AIOps & Event Lifecycle Management — *CyclOps yalnızca `draft`/`pending` veri olarak*
  7. Automation
  8. Engineering & Product Development

  **S02 artık taksonomi nedeniyle bloklanmıyor.** Karar `PROVISIONAL`: şema ve draft fixture üretimi serbest, ancak nihai kamuya açık başlıklar ve kapsamlar iş sahibi doğrulaması bekliyor. Kod yapısı başlık/kapsam değişikliğine izin verecek biçimde kurulmalıdır. `content-truth-matrix.csv` C22'de `planning-decision` olarak kayıtlı.
- **B27 — Hizmet sayısı çelişkisi.** Sunum **4** hizmet, canlı site ve brief **5** hizmet sayıyor (sunum "Dış Kaynak Yönetimi" ve "Yönetilen Hizmetler"i tek başlıkta birleştirmiş). C21'de `conflict`.

### Sunumda logo ile doğrulanan teknoloji → çözüm eşlemesi

Sunumda **hiçbir teknoloji adı metin olarak geçmiyor**; tamamı logo görselidir. Aşağıdaki eşleme, slaytların "Teknoloji Ekosistemi" bölümündeki logoların görsel incelemesiyle çıkarıldı:

| Sunum slaydı | Logo ile görülen teknolojiler | Planlanan 8 alan eşlemesi |
|---|---|---|
| S12 ITOM | Zabbix, Grafana, Datadog, OpenTelemetry, Instana | 1 Observability |
| S8 Yapay Zeka | Datadog, Ardoq, Device42, Freshservice | 6 AIOps — **belirsiz**, `decisionNeeded` |
| S11 ITAM | Device42, GLPI, Freshservice | 2 CMDB — **ITAM ayrı alan mı?** `decisionNeeded` |
| S15 CMDB | Device42, OpenText, GLPI, Freshservice | 2 Configuration Management / CMDB |
| S10 ITSM | Freshservice, **Jira Software**, **GLPI** | 3 ITSM |
| S13 Büyük Veri | Confluent, **Tableau**, Grafana | 4 Data Streaming & Integration |
| S14 Data Streaming | Confluent | 4 Data Streaming & Integration |
| S9 Kurumsal Mimari | Ardoq | 5 Governance / EA |
| S16 Otomasyon | **Red Hat Ansible**, Freshservice, Zabbix | 7 Automation |

- **B28 — Envanterde olmayan üç teknoloji bulundu:** **Jira Software**, **GLPI** ve **Tableau**. Üçü de ne canlı sitede, ne plan paketinde, ne brief'te geçiyor — yalnızca sunumda logo olarak var. `decisionNeeded: yes` işaretlendi.
- **B29 — Brief'in "eskiyenler" listesi iki yeni ad getirdi:** **SolarWinds** ve **runZero** (brief: *"Eskiyenler: Micro Focus/OpenText eski, SolarWinds, RunZero, Kron → karar pazarlamada"*). İkisi de sitede ve sunumda yok; `decisionNeeded: yes`.
- **B30 — Plan paketindeki 10 teknoloji üç kaynağın hiçbirinde yok:** Foglight, OpenText CMS, OpenText OO, OpenText SA, Apache NiFi, Apache Airflow, Elastic, AWX, n8n, KACE. Kapsamda kalıp kalmayacakları karara bağlanmalı.
- **B31 — Freshservice sürprizi:** Canlı sitede hiç geçmiyordu, ancak sunumun **5 ayrı slaydında** logo ile yer alıyor — en yaygın kullanılan ITSM aracı görünümünde. Sitedeki teknoloji listesi güncel değil.

Tam eşleme tablosu ve `mappedSolutionArea` alanı: [technology-inventory.csv](technology-inventory.csv) (35 kayıt; 14'ü sunum logosuyla doğrulandı, **25'i `decisionNeeded: yes`**, 10'u `no`).

> **Logo izni notu (S00-R2):** Envanterdeki **35 teknolojinin tamamı `logoPermission: unknown`** durumundadır. Bir teknolojinin açık kaynak olması, o projenin/markanın logosunun serbestçe kullanılabileceği anlamına **gelmez** — çoğu açık kaynak projenin ayrı bir marka/logo kullanım politikası vardır. Lisans modeli bilgisi ayrı bir `licenseModel` alanında (`open-source` / `duosis-own-product` / `not-assessed`) yalnızca **bilgi amaçlı** tutulur ve logo izni yerine geçmez. S00'da hiçbir teknolojinin logo kullanım politikası incelenmemiştir.

### Brief'in bağlayıcı katkıları

- **Kesin kısıtlar** plan paketiyle uyumlu: WordPress yok, TR/EN çift dil, CWV hedefleri, KVKK opt-in consent, mobil öncelikli, WCAG AA, stok görsel yığını yerine gerçek ürün ekranı/şematik illüstrasyon.
- **Astro "önerilir, zorunlu değil"** — brief ekibe stack seçme serbestliği bırakıyor (bkz. ADR-001).
- **Form için "gerçek CRM zorunlu değil; e-posta fallback yeterli"** (bkz. ADR-004).
- **İçerik kaynağı için** Content Collections ile başlayıp prod'da headless CMS'e (Payload/Strapi/Directus/Sanity) bağlanma notu (bkz. ADR-005).
- **Marka sesi "İşlerinizi kolaylaştırıyoruz."** olarak tanımlanmış. R1'de bu, plan paketindeki "Operasyonu görün. Veriyi bağlayın. AI ile harekete geçin." mesajıyla çelişki sayılmıştı; **S00-R2'de iki katmanlı mesaj hiyerarşisi olarak çözüldü** — ilki marka vaadi, ikincisi hero değer önermesi (C26, `planning-decision`; bkz. B18).
- Brief çıktıyı **"bitmiş site değil, çalışan bir dikey kesit (vertical slice) prototipi"** olarak tanımlıyor; plan paketi S00–S15 ise tam bir kurumsal site inşası tarif ediyor. **S00-R2'de bu bir çelişki değil, ardışık iki aşama olarak çözüldü** (bkz. B34).

---

## 4. Marka varlıkları ve ölçülen renkler

| Varlık | URL | Boyut | Not |
|---|---|---:|---|
| `logo.svg` | `/wp-content/uploads/2024/06/logo.svg` | 5.088 B | Vektör mevcut — yeniden kullanılabilir |
| `logo-white.svg` | `/wp-content/uploads/2024/06/logo-white.svg` | 5.010 B | Koyu zemin varyantı |
| `logo@2x.png` | `/wp-content/uploads/2024/06/logo@2x.png` | 9.047 B | 485w + 300w raster |
| Favicon seti | `cropped-favicon-{32,180,192,270}` | — | Mevcut |

### SVG'den ölçülen renkler

| Hex | RGB | HSL | Rol |
|---|---|---|---|
| `#16A6D9` | 22,166,217 | hsl(196, 82%, 47%) | Marka cyan (birincil) |
| `#16A6DE` | 22,166,222 | hsl(197, 82%, 48%) | **Neredeyse aynı ikinci cyan** |
| `#252A2E` | 37,42,46 | hsl(207, 11%, 16%) | Ink |
| `#242A2F` | 36,42,47 | hsl(207, 13%, 16%) | **Neredeyse aynı ikinci ink** |

- **B5 — Logoda tutarsızlık:** Tek bir logo dosyasında iki farklı cyan ve iki farklı ink değeri var. S03'te tek kanonik değer seçilmeli.
- **B6 — Terim düzeltmesi:** Plan paketi "Duosis turkuazı" diyor; ölçülen renk hsl(196°) ile **gök mavisi/azure** tonunda. Turkuaz değil. Tasarım dilinde terim düzeltilmeli.

### WCAG 2.2 kontrast ölçümü — S03 için bağlayıcı kısıt

| Kombinasyon | Oran | AA normal (4.5:1) | AA büyük (3:1) |
|---|---:|---|---|
| `#16A6D9` / beyaz | **2.80:1** | **FAIL** | **FAIL** |
| `#16A6D9` / `#252A2E` | 5.17:1 | PASS | PASS |
| `#252A2E` / beyaz | 14.49:1 | PASS | PASS |
| Beyaz metin / `#16A6D9` buton | **2.80:1** | **FAIL** | **FAIL** |

- **B7 — Kritik:** Marka cyanı **kırık beyaz/paper yüzeylerde metin, link veya beyaz yazılı buton olarak kullanılamaz.** Sözleşme Signal Cyan'ı tam da "link, odak ve sinyal" rolünde tanımlıyor. S03'te paper yüzeyler için **koyulaştırılmış marka varyantı türetmek zorunludur**; aksi halde WCAG 2.2 AA hedefi ilk günden kaybedilir.

---

## 5. Baseline ölçümleri

### Performans (ana sayfa, ölçülen)

| Kalem | Ölçülen | Sözleşme bütçesi | Durum |
|---|---:|---:|---|
| HTML | 178 KB | — | — |
| CSS + JS (sıkıştırılmış transfer) | **377 KB** / 73 istek | Homepage başlangıç JS ≤ 180 KB gzip | **AŞIYOR** |
| Görseller | **6,61 MB** / 28 istek | Hero görsel ≤ 350 KB | **AŞIYOR** (6 görsel tek başına aşıyor) |
| **Toplam** | **~7,17 MB / ~102 istek** | — | — |

En ağır kalemler:

| Boyut | Kaynak |
|---:|---|
| 171,2 KB | `googletagmanager.com/gtag/js` — **tüm CSS+JS'in %45'i, onay öncesi yükleniyor** |
| 749 KB | `apm.jpg` |
| 650 KB | `devops.jpg` |
| 646 KB | `Yazilim-Gelistirme3.jpg` |
| 575 KB | `Konfigurasyon-ve-Varlik-Yonetimi5.jpg` |
| 44,3 KB | `js_composer.min.css` (WPBakery) |
| 29,7 KB + 4,8 KB | jQuery 3.7.1 + jquery-migrate |

- **B8 — Görsel formatı:** 28 görselin tamamı JPG/PNG/SVG. **WebP/AVIF yok.** Tek başına en büyük performans kazancı burada.
- **B9 — Çift karusel kütüphanesi:** Aynı sayfada hem `flickity-all.min.js` (13,1 KB) hem `owl.carousel.min.js` (10,6 KB) yükleniyor.
- **B10 — Gereksiz WooCommerce yükü:** Woodmart e-ticaret teması nedeniyle `woocommerceNotices.min.js` gibi mağaza scriptleri kurumsal sitede yükleniyor.

### SEO baseline

| Kalem | Ölçülen |
|---|---|
| Meta description **eksik** | **24 / 54 sayfa** |
| H1 olmayan sayfa | 2 |
| Birden fazla H1 | 0 |
| Tekrar eden title | 0 |
| Tekrar eden description | 5 sayfa aynı DevOps metni, 2 sayfa aynı ATM metni |
| Ana sayfa title | `Duosis - Duosis` (marka adı iki kez, anahtar kelime yok) |
| Ana sayfa description | "Duosis gücüyle doğru ve kaliteli işler ve projeler." (jenerik) |
| JSON-LD | 1 blok: Organization, WebSite, WebPage, **Person**, **Article** |

- **B11 — Hatalı yapısal veri:** Ana sayfada `@type: Article` ve `@type: Person: duosis` üretiliyor. Ana sayfa makale değil, Duosis kişi değil. Rank Math varsayılanları düzeltilmemiş.

### Güvenlik başlıkları — ölçülen

`curl -D -` ile alınan yanıtta **hiçbir güvenlik başlığı yok:**

| Başlık | Durum |
|---|---|
| Content-Security-Policy | **YOK** |
| Strict-Transport-Security | **YOK** |
| X-Content-Type-Options | **YOK** |
| Referrer-Policy | **YOK** |
| Permissions-Policy | **YOK** |
| frame-ancestors / X-Frame-Options | **YOK** |
| Server | `nginx/1.22.1` — sürüm ifşa ediliyor |

- **B12** — `xmlrpc.php` erişilebilir durumda (`/xmlrpc.php?rsd` ana sayfadan linkli).

### Consent / KVKK — ölçülen

Bu bölümde iki ayrı durum var, karıştırılmamalı:

1. **Google Consent Mode doğru kurulmuş.** `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`, `functionality_storage`, `security_storage` — **tümü varsayılan `denied`.** Sayfada `granted` hiç geçmiyor.
2. **Ancak onay arayüzü yok.** Hiçbir çerez banner'ı/CMP eklentisi bulunamadı (`complianz`, `cookieyes`, `borlabs`, `cmplz` — hiçbiri yok). Kullanıcı onay veremediği için analytics kalıcı olarak `denied` durumda; yani **GA4 fiilen çalışmıyor** ama **171 KB'lık gtag.js yine de her ziyaretçiye indiriliyor.**
3. **Yandex.Metrika consent mode kapsamında DEĞİL.** Ham `<script>` olarak, koşulsuz yükleniyor ve yapılandırması:

```js
ym(98095349, "init", {
    clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true
});
```

- **B13 — Yüksek öncelikli KVKK/consent uyum riski; hukuk ve iş sahibi doğrulaması gerekli.** Teknik olarak ölçülen durum şudur: `webvisor:true` oturum kaydı özelliğidir (kullanıcının sayfa üzerindeki hareketleri, tıklamaları ve form etkileşimleri kaydedilir) ve bu script, sayfada herhangi bir çerez onay arayüzü bulunmadan yükleniyor. Site ayrıca bir "KVKK Çerez Politikası" sayfası yayınlıyor; teknik uygulamanın bu politikanın metniyle örtüşüp örtüşmediği **bu sprintte değerlendirilmedi**.

  Bu bir hukuki ihlal tespiti **değildir** — böyle bir değerlendirme Duosis hukuk birimi ve veri sorumlusunun yetkisindedir. S00'ın tespiti şudur: ölçülen teknik davranış ile `02_TECHNICAL_ARCHITECTURE.md` §7'nin ("essential dışı kategoriler default kapalı, onay öncesi ağ isteği yok") gereğinin arasında açık bir fark vardır ve bu davranış **yeni siteye taşınmamalıdır**. Mevcut sitedeki durumun hukuki değerlendirmesi ve gerekirse düzeltilmesi iş sahibinin kararıdır.

### İletişim formu — ölçülen

| Alan | Tip | Zorunlu |
|---|---|---|
| Name | text | evet |
| Email | email | evet |
| CepTel | tel | evet |
| your-message | textarea | hayır |

- **B14 — KVKK aydınlatma onay kutusu YOK.** Form ad, e-posta ve cep telefonu topluyor; açık rıza kutusu bulunmuyor.
- **B15 — Spam koruması YOK.** reCAPTCHA, Turnstile veya honeypot bulunamadı.
- **B16 — Sözleşme alanları eksik:** `02_TECHNICAL_ARCHITECTURE.md` §6 şirket ve konu/ilgi alanı istiyor; mevcut formda yok. Mesaj alanı zorunlu değil, cep telefonu zorunlu — yeni tasarımda bu tercih gözden geçirilmeli.

### Görsel ve içerik kalitesi (ekran görüntüsü kanıtı)

Kanıtlar: `baseline/home-desktop-1440.png`, `baseline/home-mobile-390.png`, `baseline/hakkimizda-desktop-1440.png`, `baseline/iletisim-desktop-1440.png`

- Hero bir **otomatik karusel** (önceki/sonraki okları ve 4 nokta göstergesi görünür). Ana sayfada ayrıca "Uzmanlıklarımız" (2 sayfa) ve "Çözümlerimiz" (3 sayfa) bölümlerinde iki karusel daha var — **tek sayfada üç karusel**. Sözleşmenin "kontrol edilemeyen kayan şerit" ve "art arda kart gridleri" yasaklarıyla çelişir.
- Hizmet ve uzmanlık kartlarının tamamında **belirgin biçimde yapay zekâ üretimi/jenerik stok görseller** kullanılmış (parlayan hologram, mavi devre efektleri, hexagon overlay). `01_PRODUCT_AND_DESIGN_CONTRACT.md` §5 bunu en düşük öncelikli görsel kaynağı sayıyor ve §9 bu estetiği açıkça yasaklıyor.
- **B23 — Görselde bozuk yapay zekâ metni:** "Yönetilen Hizmetler" kartındaki görselde `MEDIA IINTELLIGENCE IMPLOEMENT WITH...` şeklinde anlamsız/hatalı yazılmış metin bulunuyor. Canlı sitede görünür bir kalite hatasıdır.
- Kart görsellerinde **açık zemin üzerine beyaz başlık** (ör. "Danışmanlık", "Operasyon Yönetimi") — düşük kontrast riski.
- **B24 — Üst menüde 8 ana giriş var** (Anasayfa, Hakkımızda, Hizmetlerimiz, Uzmanlıklarımız, Çözümlerimiz, Partnerlar, Blog, İletişim). `03_CONTENT_AND_ROUTE_MAP.md` §1 **en fazla 6** istiyor.
- **B25 — Karışık dil:** Türkçe arayüzde İngilizce dizeler yayında — `Search for pages` (4 kez), `Menu`, `View` ve WooCommerce'ten kalan **`Add to cart`**. Kurumsal bir BT sitesinde sepet dizesi bulunması tema seçiminin (Woodmart e-ticaret teması) yan etkisidir.
- Buton ve form radius'ları 10px / 35px (pill). Sözleşme `0–6px` istiyor.
- Mevcut tema fontları: Urbanist, Lato, Work Sans (**üç aile**). Sözleşme en fazla iki aile istiyor.
- **B17 — Hakkımızda sayfası çok zayıf:** Misyon/vizyon dışında somut hiçbir şey yok — kuruluş yılı, ekip, proje sayısı, sektör deneyimi, sertifika yok. `01_PRODUCT_AND_DESIGN_CONTRACT.md` §4'ün "Kanıt" adımı için mevcut sitede kullanılabilir malzeme bulunmuyor.
- **B18 — Ana sayfa H1 "İşlerinizi Kolaylaştırıyoruz!" — S00-R2'de mesaj hiyerarşisi olarak çözüldü.** R0'da bu ifade "ayırt edici olmayan kalıp" olarak işaretlenmişti. Brief (SRC-02) incelendiğinde bunun **bilinçli bir marka sesi tercihi** olduğu görüldü. R1'de iki mesaj arasında çelişki olarak kaydedilmişti; **Codex planlama kararı** bunu birbirini dışlayan bir çelişki olarak değil, **iki katmanlı bir mesaj hiyerarşisi** olarak çözdü:

  | Katman | Mesaj | Kaynak |
  |---|---|---|
  | **Marka vaadi / destek mesajı** | "İşlerinizi kolaylaştırıyoruz." | Brief SRC-02 marka sesi |
  | **Ana hero değer önermesi** | "Operasyonu görün. Veriyi bağlayın. AI ile harekete geçin." | Plan paketi 00/01 |

  İki mesaj farklı katmanlarda birlikte kullanılacaktır. Nihai kelime seçimi pazarlama onayı bekler (C26, `planning-decision`).

---

## 6. Kalıcı bulgu listesi (özet)

| # | Bulgu | Etki | İlgili sprint |
|---|---|---|---|
| B1 | Git deposu yok | S00'da commit yapılamaz (protokol gereği) | S01 |
| B2 | Node 18 (EOL), sözleşme aktif LTS istiyor | **S01 kurulum ön koşulu** (blokaj değil) | S01 |
| B3 | pnpm kurulu değil | **S01 kurulum ön koşulu** (blokaj değil) | S01 |
| B4 | ~~İki kaynak dosyası bulunamadı~~ → **S00-R1'de teslim edildi ve incelendi** | Üç rakamın kaynağı bulundu; kuruluş 2016 İstanbul ortaya çıktı | ÇÖZÜLDÜ |
| B5 | Logoda iki cyan + iki ink değeri | Token belirsizliği | S03 |
| B6 | "Turkuaz" terimi ölçülen renkle uyuşmuyor | Terim düzeltmesi | S03 |
| B7 | **Marka cyanı beyaz üzerinde 2.80:1 — AA FAIL** | Palet zorunlu türetme | S03 |
| B8 | WebP/AVIF yok, 6,61 MB görsel | LCP riski | S05/S14 |
| B9 | Çift karusel kütüphanesi | — (eski sitede) | — |
| B10 | Kurumsal sitede WooCommerce scriptleri | — (eski sitede) | — |
| B11 | Ana sayfada hatalı `Article`/`Person` şeması | Şema tasarımı | S13 |
| B12 | Hiçbir güvenlik başlığı yok + xmlrpc açık | Header politikası | S14 |
| B13 | **Yandex webvisor onay arayüzü olmadan çalışıyor** | Yüksek öncelikli KVKK/consent uyum riski — hukuk + iş sahibi doğrulaması gerekli | S12 |
| B14 | Formda KVKK onay kutusu yok | KVKK/consent uyum riski | S12 |
| B15 | Formda spam koruması yok | Kötüye kullanım | S12 |
| B16 | Form alanları sözleşmeyle uyumsuz | Form tasarımı | S12 |
| B17 | Hakkımızda'da somut kanıt yok (sunumda var, sitede yok) | İçerik boşluğu | S09 |
| B18 | Ana mesaj hiyerarşisi: marka vaadi "İşlerinizi kolaylaştırıyoruz" + hero değer önermesi "Operasyonu görün…" | **ÇÖZÜLDÜ** — çelişki değil, iki katman birlikte kullanılacak; kelime seçimi pazarlama onayı bekliyor | S05 |
| B19 | 24/54 sayfada meta description yok | SEO | S13 |
| B20 | `[gslogo id=1]` shortcode render edilmiyor (canlı hata) | Referans sistemi | S10 |
| B21 | 4 sayfada hâlâ "Micro Focus" (artık OpenText) | Marka güncelliği | S02/S10 |
| B22 | Uzmanlıklar(8) + Çözümler(11) → yeni 8 çözüm eşlemesi belirsiz | IA kararı | S02/S07 |
| B23 | Kart görselinde bozuk AI metni (canlı yayında) | Görsel kalite | S05/S10 |
| B24 | Üst menüde 8 ana giriş (sözleşme: en fazla 6) | Navigasyon | S04 |
| B25 | Karışık dil: `Search for pages`, `Add to cart` vb. | İçerik/i18n | S02/S04 |
| **B26** | Üç kaynak üç farklı çözüm taksonomisi tanımlıyordu (8 / 8 / 9) | **ÇÖZÜLDÜ (PROVISIONAL)** — ADR-009'daki 8 kayıt onaylandı; S02 bloklanmıyor. Nihai başlıklar iş sahibi onayı bekliyor | S02/S07 |
| **B27** | Hizmet sayısı çelişkisi: sunum 4, site ve brief 5 | İçerik kararı | S10 |
| **B28** | Envanterde olmayan 3 teknoloji: Jira Software, GLPI, Tableau | Kapsam kararı | S02/S10 |
| **B29** | Brief "eskiyenler" listesi: SolarWinds, runZero (+ Kron) | Kapsam kararı | S10 |
| **B30** | Plan paketindeki 10 teknoloji hiçbir kaynakta yok | Kapsam kararı | S02/S10 |
| **B31** | Freshservice sunumda 5 slaytta var, sitede hiç yok | Site listesi güncel değil | S10 |
| **B32** | **Sunumda ~29 isimli müşteri logosu — hiçbirinde yayın izni kaydı yok** | Yayın engeli | S10 |
| **B33** | Sunumda bir çalışanın adı, e-postası ve cep telefonu var | Kişisel veri — rıza gerekli | S12 |
| **B34** | Brief "vertical slice prototip", plan paketi tam site tarif ediyor | **ÇÖZÜLDÜ** — çelişki değil, ardışık iki aşama: vertical slice birinci yayın/demo kilometre taşı, S00–S15 sonrasında tam üretim sitesine giden yol haritası | — |

---

## 7. Sprint kabul kriterleri karşılığı

| Kriter | Durum | Kanıt |
|---|---|---|
| Git ve repo başlangıç durumu raporlandı | PASS | §1, repo yok — protokol §2 uyarınca S01'e bırakıldı |
| Kullanıcı değişikliklerine dokunulmadı | PASS | Plan paketi salt-okunur işlendi; yeni dosyalar ayrı `discovery/` klasöründe |
| Mevcut public URL envanteri oluşturuldu | PASS | `legacy-url-inventory.csv`, 54 satır, 54/54 HTTP 200 |
| Çözüm/teknoloji girdileri normalize edildi | PASS | `technology-inventory.csv`, 30 kayıt, 23'ü `decisionNeeded` |
| Yayınlanabilir / pending iddialar ayrıldı | PASS | `content-truth-matrix.csv`: 10 YES, 1 CONDITIONAL, 7 NO |
| Logo/referans izinleri `unknown` kaldı | PASS | Tüm `logoPermission` alanları `unknown`; müşteri logosu indirilmedi |
| Desktop + mobile baseline kanıtı | PASS | 4 ekran görüntüsü, `baseline/` |
| Stack/deployment belirsizlikleri ADR'de | PASS | `ADR-DRAFT.md`, 8 karar kaydı |
| Kod/dependency/push/deploy yapılmadı | PASS | Yalnızca `discovery/` altında doküman üretildi |

---

## 8. İş sahibi kararı bekleyen konular

Aşağıdakiler çözülmeden ilgili sprintler yayınlanabilir içerik üretemez. S00-R1 sonrası öncelik sırasına göre:

**Doğrulama bekleyenler (kaynak var, teyit yok)**

1. **10+ yıl / 50+ müşteri / 15+ danışman** — sunum slayt 3'te yazılı, iş sahibi teyidi gerekli. "50+" için sayım yöntemi (aktif mi toplam mı) tanımlanmalı.
2. **Kuruluş tarihi 2016 İstanbul** — sicil kaydıyla teyit. 2026'da 10 yıl **tam** doluyor: metin "10 yıl" mı "10+ yıl" mı olacak?
3. **Ekip yapısı** — sunumdaki 4 ekip güncel mi; "15+ teknik danışman" hangi ekipleri kapsıyor?

**Çelişki çözümü gerektirenler**

4. **Çözüm taksonomisi** — ~~çelişki~~ → **S00-R2'de PROVISIONAL olarak çözüldü** (ADR-009, 8 kayıt). S02 artık bloklanmıyor. İş sahibinden beklenen: nihai kamuya açık başlıkların ve kapsamların onayı — özellikle ITAM'ın Configuration & Asset Management altında birleştirilmesi ve Engineering & Product Development'ın korunması.
5. **Hizmet sayısı** — 4 mü (sunum) 5 mi (site + brief)? **Açık çelişki, karar bekliyor.**
6. **Ana mesaj** — ~~çelişki~~ → **S00-R2'de mesaj hiyerarşisi olarak çözüldü**: marka vaadi *"İşlerinizi kolaylaştırıyoruz."* + hero değer önermesi *"Operasyonu görün. Veriyi bağlayın. AI ile harekete geçin."* birlikte kullanılacak. İş sahibinden beklenen: nihai kelime seçiminin pazarlama onayı.
7. **Kapsam beklentisi** — ~~çelişki~~ → **S00-R2'de çözüldü**: vertical slice birinci yayın/demo kilometre taşı, S00–S15 sonrasında tam üretim sitesine giden yol haritası.
8. **Mevcut 19 uzmanlık/çözüm sayfasının** ADR-009'daki 8 alana eşlenmesi (301 haritası için gerekli).

**Kaynak/kanıt bekleyenler**

9. **CyclOps** — gerçek ekran görüntüsü, doğrulanmış yetenek listesi, sürüm ve lansman durumu. Brief bu kanıtın yerini tutmaz. *S08 bu olmadan başlayamaz.*
10. **Bölgesel kapsam** — Central Asia / Middle East için doğrulanabilir kanıt. **Üç kaynağın hiçbirinde yok.**
11. **Müşteri logoları** — sunumdaki ~29 logonun her biri için **yazılı kullanım izni**. İzinsiz hiçbiri kullanılmayacak.
12. **Referans metinleri/metrikleri** — sunumda logo var ama alıntı veya metrik yok.

**Teknoloji kapsamı**

13. **Yeni bulunanlar:** Jira Software, GLPI, Tableau kapsamda kalacak mı?
14. **Brief'in "eskiyenler" listesi:** SolarWinds, runZero, Kron — çıkarılacak mı?
15. **Kaynaksızlar:** Foglight, OpenText CMS/OO/SA, NiFi, Airflow, Elastic, AWX, n8n, **KACE** — kalacak mı?
16. **Quest** ürün kapsamı (Change Auditor mı, genel Quest mi) ve **OpenText** hangi ürün(ler).

**Teknik ve hukuki**

17. **Yandex.Metrika ve webvisor** — yeni sitede kalacak mı? Mevcut durumun hukuki değerlendirmesi (hukuk birimi).
18. **Bir çalışanın kişisel iletişim bilgilerinin** sitede yayınlanıp yayınlanmayacağı — ilgili kişinin rızası.
19. **Form hedefi** (CRM veya e-posta; brief e-posta fallback'i yeterli sayıyor) ve veri saklama süresi.
20. **Deployment hedefi** — mevcut nginx mi, yönetilen platform mu (ADR-003).
21. **`/is-ilanlari/` ve `/basvuru-formu/`** — rota haritasında kariyer rotası yok; kalacak mı?
22. **"IT for More" sloganı** korunacak mı; **logo** 10. yıl için güncellenecek mi (ve çift cyan/ink değeri tekilleştirilecek mi)?
