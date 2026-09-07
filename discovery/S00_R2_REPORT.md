# DUOSIS Web — Sprint S00-R2 Teslim Raporu

## Durum

- **Sprint:** S00-R2 — Tutarlılık düzeltmeleri ve Codex planlama kararlarının uygulanması
- **Önceki inceleme sonucu:** CHANGES REQUESTED
- **Sonuç:** **COMPLETE** — A bölümündeki 6 zorunlu düzeltme + B bölümündeki 3 planlama kararı uygulandı
- **Base HEAD / Final HEAD / Branch:** — *(git deposu hâlâ yok)*
- **Yerel commit:** **OLUŞTURULMADI** — `git init` protokol §2 gereği S01 kapsamında
- **Push / merge / PR / deployment / scaffold / dependency / kaynak kod / tasarım:** **YAPILMADI**
- **Web taraması / baseline ölçümleri:** **TEKRARLANMADI** (talimat gereği)
- **R0 ve R1 raporları:** geçmiş kayıt olarak **korundu**

---

## A. Zorunlu veri düzeltmeleri

| # | İstenen | Durum |
|---:|---|---|
| A.1 | C11 claim'i düzeltilsin | ✔ |
| A.2 | C17 claim'i düzeltilsin | ✔ |
| A.3 | `decisionNeeded` → `{yes,no}` normalize (25/10) | ✔ |
| A.4 | `logoPermission` → `{unknown,allowed,denied}` | ✔ |
| A.5 | B30 sayım hatası 9 → 10 | ✔ |
| A.6 | ADR-009/010 kaynak otoritesi ifadesi | ✔ |

### A.1 — C11 düzeltildi

| Alan | Önce (yanlış) | Sonra |
|---|---|---|
| `claim` | "Marka cyanı beyaz zeminde metin/link olarak kullanılabilir" | **"Marka cyanı #16A6D9 beyaz zeminde metin veya link rengi olarak doğrudan kullanılamaz"** |
| `evidence` | 2.80:1 / FAIL | **değişmedi** — `#16A6D9 / #FFFFFF = 2.80:1`, AA normal FAIL, AA büyük FAIL, ink zeminde 5.17:1 PASS |
| `verificationStatus` | `verified-measured` | **değişmedi** |
| `publishableNow` | `YES` | **değişmedi** — tasarım kısıtı ölçümle doğrulanmıştır |

Eski claim, ölçümün tam tersini söylüyordu. Kanıt satırı doğruydu ancak claim metni onunla çelişiyordu; S02'den itibaren bu kayıt tasarım kısıtı olarak okunacağı için düzeltilmesi kritikti.

### A.2 — C17 düzeltildi

| Alan | Önce (belirsiz) | Sonra |
|---|---|---|
| `claim` | "İngilizce site varlığı" | **"Mevcut İngilizce site bulunmuyor"** |
| `evidence` | — | `html lang='tr'`; hreflang **yok**; `/en/`, `/en`, `/english/` → **404** |
| `verificationStatus` | `verified-measured` | **değişmedi** |

Eski claim bir başlıktı, iddia değildi; "varlığı" ifadesi yanlışlıkla "var" olarak okunabilirdi.

### A.3 — `decisionNeeded` normalize edildi

| Değer | Önce | Sonra |
|---|---:|---:|
| `no` | 10 | **10** |
| `yes` | 10 | **25** |
| `YES-EXPLICIT` | 15 | **0** |

15 `YES-EXPLICIT` kaydı `yes` yapıldı. Kararın **neden özellikle gerekli olduğu** kaybolmasın diye her birinin `note` alanına `KARAR GEREKÇESİ: …` ön eki eklendi. Örnekler:

- `kace` → *"KARAR GEREKÇESİ: Plan paketi KACE için AÇIK ONAY istiyor; üç kaynağın hiçbirinde yok."*
- `solarwinds` / `runzero` / `kron` → *"KARAR GEREKÇESİ: Brief 'Eskiyenler' listesinde açıkça sayıyor - kapsamdan çıkarma kararı gerekli."*
- `quest` → *"KARAR GEREKÇESİ: Hangi Quest ürünü olduğu belirsiz (Change Auditor mı, genel Quest mi) - ürün kapsamı kararı gerekli."*
- `cyclops` → *"KARAR GEREKÇESİ: Ürün kanıt durumu netleşmeden kapsam ve iddia belirlenemez (bkz. C12)."*

**Beklenen sonuç 25 yes / 10 no — doğrulandı.**

### A.4 — `logoPermission` sözleşme enum'una çekildi

| Değer | Önce | Sonra |
|---|---:|---:|
| `unknown` | 30 | **35** |
| `n/a-open-source` | 4 | **0** |
| `n/a-own-product` | 1 | **0** |

`n/a-*` değerleri sözleşme enum'unda yoktu ve daha önemlisi **yanlış bir çıkarım taşıyordu**: bir teknolojinin açık kaynak olması, o projenin marka/logosunun serbestçe kullanılabileceği anlamına gelmez — çoğu açık kaynak projenin ayrı bir marka kullanım politikası vardır. S00'da hiçbir teknolojinin logo politikası incelenmemiştir.

Bilgi kaybı olmaması için **ayrı bir `licenseModel` alanı** eklendi (yalnızca bilgi amaçlı, logo izni yerine geçmez):

| `licenseModel` | Adet | Kayıtlar |
|---|---:|---|
| `open-source` | 4 | OpenTelemetry, Apache NiFi, Apache Airflow, AWX |
| `duosis-own-product` | 1 | CyclOps |
| `not-assessed` | 30 | S00'da lisans modeli değerlendirilmeyenler |

**Sonuç: 35/35 kayıt `logoPermission: unknown`.** Kanıtsız hiçbir `allowed` kaydı yok.

### A.5 — B30 sayım hatası düzeltildi

Metin "Plan paketindeki **9** teknoloji…" diyordu; liste 10 öğe içeriyordu (Foglight, OpenText CMS, OpenText OO, OpenText SA, NiFi, Airflow, Elastic, AWX, n8n, KACE). **10** olarak düzeltildi. Bulgu tablosundaki satır zaten 10 diyordu; iki yer artık tutarlı.

### A.6 — ADR-009 / ADR-010 kaynak otoritesi ifadesi düzeltildi

R1'de sunum "şirketin onayladığı ve müşteriye sunduğu güncel anlatı" olarak nitelenmişti. **Bu kanıtlanmış değildir** — dosyanın hangi tarihte, kim tarafından, hangi onay süreciyle hazırlandığı bilinmiyor. Yeni ifade:

> **"Kullanıcı tarafından sağlanan kurumsal sunum; elimizdeki en güçlü kurumsal anlatı kaynağıdır, fakat kamuya açık iş iddiaları yine iş sahibi doğrulaması gerektirir."**

ADR-010'a ayrıca, doğrulama olmadan **yayınlanamayacakların** açık listesi eklendi: 10+/50+/15+ (C01–C03), kuruluş tarihi ve yeri (C19), ekip yapısı (C20), müşteri referansları ve logoları (C23).

---

## B. Codex planlama kararları

### B.1 — Çözüm taksonomisi (ADR-009)

**Durum:** `OPEN` → **`PROVISIONAL — S02 ve S07 implementasyonu için onaylı; nihai kamuya açık isimler iş sahibi doğrulaması bekliyor.`**

Onaylanan sekiz kayıt:

| # | Çözüm alanı | Kapsam kuralı |
|---:|---|---|
| 1 | Observability & APM | APM bu alanın **altında** |
| 2 | Configuration & Asset Management | **CMDB ve ITAM** bu alanda |
| 3 | IT Service Management | — |
| 4 | Data Streaming & Integration | — |
| 5 | Governance & Enterprise Architecture | — |
| 6 | AIOps & Event Lifecycle Management | **CyclOps yalnızca `draft`/`pending` veri olarak** |
| 7 | Automation | — |
| 8 | Engineering & Product Development | — |

Bağlayıcı kurallar ADR-009'a yazıldı: CyclOps hakkında doğrulanmamış hiçbir yetenek/ürün iddiası public build'e çıkamaz; nihai başlıklar sonradan değiştirilebilir olduğu için başlıklar içerik verisinden gelecek, koda gömülmeyecek; yukarıdaki adlar iç taksonomi etiketleridir, yayınlanacak fayda odaklı başlıklar değildir.

**S02 artık taksonomi nedeniyle bloklanmıyor.** C22 `conflict` → `planning-decision`; B26 "ÇÖZÜLDÜ (PROVISIONAL)" olarak güncellendi.

### B.2 — Ana mesaj hiyerarşisi

İki mesaj birbirini dışlayan çelişki olarak değil, **iki katman** olarak kaydedildi:

| Katman | Mesaj |
|---|---|
| Marka vaadi / destek mesajı | "İşlerinizi kolaylaştırıyoruz." |
| Ana hero değer önermesi | "Operasyonu görün. Veriyi bağlayın. AI ile harekete geçin." |

C26 `conflict` → `planning-decision`, `publishableNow: CONDITIONAL`. Nihai kelime seçimi pazarlama onayı bekliyor. B18 buna göre yeniden yazıldı.

### B.3 — Vertical slice ve tam site kapsamı

B34 çözümlenmiş planlama farkı olarak güncellendi: hackathon teslim hedefi çalışan bir **vertical slice**; S00–S15 paketi bunun ardından üretim kalitesindeki tam siteye ilerleyen yol haritasıdır. Vertical slice birinci yayın/demo kilometre taşıdır ve tam roadmap ile çelişmez.

---

## Değişen dosyalar

| Dosya | Değişiklik nedeni |
|---|---|
| `discovery/content-truth-matrix.csv` / `.json` | C11 ve C17 claim/evidence düzeltildi; C22 ve C26 `planning-decision` olarak güncellendi (27 kayıt, alan sayısı değişmedi) |
| `discovery/technology-inventory.csv` / `.json` | `decisionNeeded` normalize (25/10); `logoPermission` 35/35 `unknown`; **yeni `licenseModel` alanı**; 15 kayda `KARAR GEREKÇESİ:` notu (35 kayıt, 11 → 12 alan) |
| `discovery/S00_FINDINGS.md` | R2 revizyon notu; B30 sayım düzeltmesi (9→10); B18, B26, B34 yeniden yazıldı; logo izni/lisans ayrımı notu eklendi; §8 karar listesi çözülenlere göre güncellendi |
| `discovery/ADR-DRAFT.md` | ADR-009 `PROVISIONAL` + 8 çözüm kaydı + bağlayıcı kurallar; ADR-010 kaynak otoritesi ifadesi düzeltildi + yayınlanamazlar listesi |
| `discovery/S00_R2_REPORT.md` | **YENİ** — bu rapor |

**Değişmeyenler:** `legacy-url-inventory.csv` (54 satır), `source-inventory.csv`, `baseline/MEASUREMENTS.md`, `baseline/*.png` (4 ekran görüntüsü), **`S00_REPORT.md`** ve **`S00_R1_REPORT.md`** (geçmiş kayıt olarak korundu).

---

## Test komutları ve sonuçları

| Kontrol | Exit | Sonuç |
|---|---:|---|
| CSV/JSON kayıt ve alan paritesi | 0 | 2 dosya çifti; kayıt sayısı, alan adları, ID sırası ve **tüm alan değerleri** eşit |
| C11 semantik doğrulaması | 0 | claim "kullanılamaz" diyor, "kullanılabilir" geçmiyor; kanıt 2.80:1/FAIL korunmuş; `verified-measured` + `YES` |
| C17 semantik doğrulaması | 0 | claim "bulunmuyor" diyor; kanıt `lang=tr` + hreflang yok + 404 korunmuş |
| `decisionNeeded ∈ {yes,no}` | 0 | **25 yes / 10 no**; `yes` olanların tamamında gerekçe notu var |
| `logoPermission ∈ {unknown,allowed,denied}` | 0 | **35/35 `unknown`**; `n/a-*` değeri kalmadı |
| Kanıtsız `allowed` kaydı yok | 0 | `allowed` sayısı: **0** |
| Teknoloji ID benzersizliği | 0 | 35/35 benzersiz, boş ID yok |
| Claim ID benzersizliği | 0 | 27/27 benzersiz, boş ID yok |
| URL envanteri değişmedi | 0 | **54 satır**, duplicate yok, tümü `https://duosis.com` |
| JSON parse doğrulaması | 0 | `technology-inventory.json` 35, `content-truth-matrix.json` 27 kayıt |
| Planlama kararlarının yansıması | 0 | C22/C26 `planning-decision`; kalan tek `conflict` = C21 (hizmet sayısı); B30=10; ADR-009 PROVISIONAL; ADR-010 düzeltilmiş |
| Kaynak kod oluşmadı | 0 | `.js/.ts/.astro/.jsx/.tsx/.css/package.json`: **0** |
| Dependency oluşmadı | 0 | `node_modules`: **0**, lockfile: **0** |
| Git deposu oluşmadı | 0 | `git rev-parse` → repo yok |
| R0/R1 raporları korundu | 0 | `S00_REPORT.md` 10.901 B, `S00_R1_REPORT.md` 14.076 B |
| Plan paketi dokunulmadı | 0 | 7/7 kök `.md` orijinal mtime'da; iki kaynak dosyası salt-okunur |

**Toplam: 38 otomatik kontrol, 38 PASS, 0 FAIL** (`SONUÇ: 0 kontrol başarısız`, exit code 0).

---

## Güncel risk ve blokaj listesi

### Aktif blokajlar

| # | Blokaj | Etkilenen | Çözüm için gereken |
|---:|---|---|---|
| 1 | **CyclOps ürün kanıtı yok** — brief'te 9, sunumda 0, sitede 0 | **S08 BLOCKED** | Gerçek ekran görüntüsü, doğrulanmış yetenek listesi, sürüm, lansman durumu |
| 2 | **~29 müşteri logosunda yayın izni yok** | S10 (referans sistemi) | Her logo için yazılı kullanım izni |
| 3 | **Deployment hedefi bilinmiyor** (ADR-003 `OPEN`) | S14 (güvenlik başlıkları), S12 (form runtime) | Barındırma kararı |

> **Not:** Çözüm taksonomisi artık blokaj **değildir** (ADR-009 PROVISIONAL). Node 18 / pnpm eksikliği de blokaj değil, **S01 kurulum ön koşuludur**.

### Yüksek öncelikli riskler

1. **Yandex `webvisor:true` onay arayüzü olmadan çalışıyor** — yüksek öncelikli KVKK/consent uyum riski; hukuk ve iş sahibi doğrulaması gerekli. S00 hukuki ihlal kararı vermez.
2. **Formda KVKK rıza kutusu ve spam koruması yok**, buna rağmen ad/e-posta/cep telefonu topluyor.
3. **Marka cyanı `#16A6D9` beyaz üzerinde 2.80:1** — AA'yı büyük metinde bile geçmiyor. S03'te koyulaştırılmış varyant türetmek **zorunlu** (C11).
4. **Hiçbir güvenlik başlığı yok** (CSP, HSTS, Referrer-Policy, X-Content-Type-Options, Permissions-Policy, frame koruması); `xmlrpc.php` açık.
5. **Sunumdaki kişisel iletişim bilgileri** (ad, e-posta, cep telefonu) rıza olmadan yayınlanamaz.
6. **Bölgesel kapsam iddiası üç kaynağın hiçbirinde yok** — Central Asia / Middle East yayınlanamaz.

### Doğrulama bekleyen iş iddiaları (yayınlanamaz)

`10+ yıl`, `50+ kurumsal müşteri`, `15+ teknik danışman` (C01–C03), kuruluş tarihi 2016 İstanbul (C19), ekip yapısı (C20), müşteri referansları (C23). Tümü **kaynakta mevcut, iş sahibi doğrulaması bekliyor** — `03_CONTENT_AND_ROUTE_MAP.md` §7 gereği `verified` olmadan kamuya açık build'de görünemez.

### Açık çelişki

- **Hizmet sayısı:** sunum **4**, canlı site ve brief **5** (C21, tek kalan `conflict`).

### Orta öncelikli açıklar

24/54 sayfada meta description yok; ana sayfada hatalı `Article`/`Person` şeması; 4 sayfada hâlâ "Micro Focus"; karışık dil dizeleri (`Search for pages`, `Add to cart`); `[gslogo id=1]` render hatası; mevcut 19 uzmanlık/çözüm sayfasının ADR-009'daki 8 alana eşlenmesi; 4 legacy URL'nin hedefi yok; teknoloji kapsamı kararları (3 yeni bulunan, 3 "eskiyen", 10 kaynaksız).

---

## Sonraki sprint önerisi

**S01 — Repository & Quality Gates:** aktif Node LTS → pnpm → `git init` + ilk commit → Astro/TS iskeleti → fail-closed `pnpm quality`.

S01 hiçbir iş sahibi kararına bağlı değildir. **S02 de artık taksonomi nedeniyle bloklanmıyor** (ADR-009 PROVISIONAL) — şema ve draft fixture üretimi serbesttir. Kalan sıralı ön koşullar:

- **S03 öncesi:** marka paleti kararı (ADR-008 — cyan kontrast kısıtı, C11).
- **S08 öncesi:** CyclOps ürün kanıtı.
- **S10 öncesi:** müşteri logo izinleri.
- **S12/S14 öncesi:** deployment hedefi (ADR-003).

> Bu yalnızca öneridir. Codex onayı gelmeden S01'e geçilmeyecektir.
