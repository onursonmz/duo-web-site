# DUOSIS Web — Sprint S00 Teslim Raporu

## Durum

- **Sprint:** S00 — Discovery, Kaynak Envanteri ve Baseline
- **Sonuç:** **COMPLETE** (kabul kriterlerinin 9/9'u PASS)
- **Base HEAD:** — *(git deposu yok)*
- **Final HEAD:** — *(git deposu yok)*
- **Branch:** — *(git deposu yok)*
- **Yerel commit:** **OLUŞTURULMADI.** `04_DELIVERY_PROTOCOL.md` §2: *"Repo henüz yoksa S00 bunu raporlar; git init ve ilk commit yalnız S01 kapsamındadır."* Protokol gereği `git init` yapılmadı.
- **Push / merge / PR / deployment:** **YAPILMADI**

---

## Uygulanan kapsam

- Beş ana sözleşme dosyası ve S00 sprint dosyası tam okundu.
- Çalışma ortamı ölçüldü: git durumu, runtime, paket yöneticisi, talimat dosyaları.
- `https://duosis.com/` envanteri: sitemap + WP REST keşfi, **54 URL**'nin tamamı indirildi ve HTTP durumu tek tek ölçüldü.
- 54 sayfanın tam metni üzerinde iddia/teknoloji taraması yapıldı.
- Marka varlıkları indirildi; **logo SVG'sinden renkler ölçüldü** ve WCAG 2.2 kontrast oranları hesaplandı.
- Performans baseline'ı ölçüldü (HTML/CSS/JS/görsel transfer ağırlığı, istek sayısı).
- Güvenlik başlıkları, consent yapılandırması ve iletişim formu incelendi.
- Chrome headless ile desktop (1440px) ve mobil (390px) baseline ekran görüntüleri alındı.
- Dört envanter çıktısı + ADR taslağı üretildi.

**Yapılmayanlar (kapsam dışı):** kaynak kod, framework scaffold, bağımlılık kurulumu, tasarım implementasyonu, nihai metin yazımı, logo tasarımı, müşteri logosu indirme.

---

## Değişen dosyalar

Mevcut hiçbir dosya değiştirilmedi. Plan paketinin 16 dosyasının tamamı **salt-okunur** işlendi (mtime'ları hâlâ orijinal: 2026-09-07 23:33). Tüm çıktılar ayrı bir `discovery/` klasöründe oluşturuldu.

| Dosya | Değişiklik nedeni |
|---|---|
| `discovery/S00_FINDINGS.md` | Sprint ana çıktısı: 25 numaralı bulgu, ortam/site/marka/baseline envanteri |
| `discovery/legacy-url-inventory.csv` | 54 legacy URL + HTTP durumu + lastmod + önerilen 301 hedefi + eşleme güveni |
| `discovery/content-truth-matrix.csv` / `.json` | 18 iddianın kaynak, kanıt, doğrulama durumu ve yayınlanabilirlik kaydı |
| `discovery/technology-inventory.csv` / `.json` | 30 teknolojinin normalize adı, kaynağı, `active`/`decisionNeeded`/`logoPermission` alanları |
| `discovery/ADR-DRAFT.md` | 8 mimari karar taslağı (stack, runtime, deployment, form, içerik, güvenlik, consent, palet) |
| `discovery/baseline/MEASUREMENTS.md` | Ham ölçüm kayıtları (ağ ağırlığı, başlıklar, renk, kontrast, SEO) |
| `discovery/baseline/*.png` | 4 görsel kanıt (desktop 1440 + mobil 390 + hakkımızda + iletişim) |

---

## Kabul kriterleri

| Kriter | Durum | Kanıt |
|---|---|---|
| Git ve repo başlangıç durumu açıkça raporlandı | **PASS** | Repo yok; `git rev-parse` üst dizinlerde de `.git` bulamadı. Protokol §2 uyarınca S01'e bırakıldı |
| Kullanıcı değişikliklerine dokunulmadı | **PASS** | Plan paketi mtime'ları değişmedi; çıktılar ayrı `discovery/` klasöründe |
| Mevcut public URL envanteri oluşturuldu; başarısız erişimler işaretlendi | **PASS** | 54 satır; **54/54 HTTP 200**, başarısız erişim yok; duplicate 0, boş 0 |
| Tüm çözüm/teknoloji girdileri normalize edildi, belirsizler ayrıldı | **PASS** | 30 kayıt, benzersiz ID; 23'ü `decisionNeeded`; kaynak ayrımı: sitede+planda 8, yalnız sitede 7, yalnız planda 15 |
| Kamuya açık kullanılabilir iddialar ile pending ayrıldı | **PASS** | 10 YES / 1 CONDITIONAL / **7 NO**; 4 ana rakam ve CyclOps `NO` |
| Logo/referans izinleri `unknown` kaldı | **PASS** | Hiçbir kayıt `allowed` değil; müşteri logosu indirilmedi |
| Desktop ve mobile baseline kanıtı var | **PASS** | 1440px + 390px + 2 iç sayfa ekran görüntüsü |
| Stack ve deployment belirsizlikleri ADR taslağında listelendi | **PASS** | 8 ADR; ADR-003 (deployment) `OPEN` olarak işaretlendi |
| Kod, dependency, push, merge, deployment yapılmadı | **PASS** | Kaynak kod dosyası sayısı: **0**; `node_modules`: **0** |

---

## Test sonuçları

| Komut | Exit | Sonuç |
|---|---:|---|
| 54 URL HTTP durum taraması (`curl`) | 0 | **54/54 = 200**, kırık URL yok |
| Envanter doğrulama (duplicate/boş/enum/ID kontrolü) | **0** | **17/17 kontrol PASS**, 0 FAIL |
| Kaynak kod üretilmedi kontrolü | 0 | `.js/.ts/.astro/.css/package.json` sayısı: **0** |
| Bağımlılık kurulmadı kontrolü | 0 | `node_modules` sayısı: **0** |
| Plan paketi bütünlüğü (mtime) | 0 | 16/16 dosya orijinal zaman damgasında |

Doğrulama kontrolleri: URL duplicate/boş/protokol, `redirect_type` enum, `mapping_confidence` enum, teknoloji ID benzersizliği, `logoPermission` enum, `active` enum, hiçbir kaydın `allowed` olmaması, iddia ID benzersizliği, `publishableNow` enum, kritik 5 iddianın `NO` olması, pending kayıtlarda sahip alanı, 2 JSON dosyasının geçerliliği.

> Not: `pnpm format:check / lint / typecheck / test / build` **çalıştırılamadı** — proje henüz yok ve S00'da kod/bağımlılık üretimi kapsam dışı. Bunlar S01 kapsamındadır.

---

## Görsel ve davranış kanıtı

- **Desktop screenshot:** `discovery/baseline/home-desktop-1440.png` (1440×2400)
- **Mobile screenshot:** `discovery/baseline/home-mobile-390.png` (390×1800)
- **Ek:** `hakkimizda-desktop-1440.png`, `iletisim-desktop-1440.png`
- **Klavye kontrolü:** Bu sprintte **uygulanmadı** — henüz kendi arayüzümüz yok. S04'ten itibaren geçerli olacak.
- **Reduced motion:** Bu sprintte **uygulanmadı** — aynı gerekçe. Mevcut sitede üç karusel tespit edildi; S06 fallback tasarımı için girdi olarak kaydedildi.
- **Console/network notu:** Mevcut sitede **ağ seviyesinde** ölçülen: onay öncesi `googletagmanager.com` (171,2 KB) ve `mc.yandex.ru` istekleri; ana sayfada ~102 istek / ~7,17 MB. Tarayıcı console hata kaydı alınmadı (headless çekimde konsol yakalama yapılandırılmadı).

---

## Performans / bundle etkisi

- **Önce (mevcut WordPress sitesi, ölçülen):** HTML 178 KB + CSS/JS **377 KB / 73 istek** + görseller **6,61 MB / 28 istek** = **~7,17 MB, ~102 istek**
- **Sonra:** Değişiklik yok — S00'da kod üretilmedi.
- **Bütçe durumu:** Mevcut site sözleşme bütçelerinin **ikisini de aşıyor**:
  - Homepage başlangıç JS ≤ 180 KB gzip → mevcut CSS+JS 377 KB (tek başına gtag.js 171,2 KB)
  - Hero görsel ≤ 350 KB → 6 görsel tek başına bu sınırı aşıyor (en büyüğü 749 KB)
  - Görsellerin **tamamı** JPG/PNG; WebP/AVIF yok.

---

## Bilinen açıklar ve riskler

**Yüksek öncelik**

1. **CyclOps'un hiçbir kamuya açık kanıtı yok** — 54 sayfada 0 eşleşme. S08 (CyclOps Signal-to-Action) şu an fiilen **BLOCKED**.
2. **Yandex.Metrika `webvisor:true` (oturum kaydı) onaysız çalışıyor** ve çerez banner'ı hiç yok. Aktif KVKK riski; yeni siteye taşınmamalı.
3. **İletişim formunda KVKK açık rıza kutusu ve spam koruması yok**, buna rağmen ad/e-posta/cep telefonu topluyor.
4. **Marka cyanı `#16A6D9` beyaz üzerinde 2.80:1** — WCAG 2.2 AA'yı büyük metinde bile karşılamıyor. Sözleşme bu rengi tam da link/odak rolünde tanımlıyor; S03'te koyu varyant türetmek **zorunlu**.
5. **Hiçbir güvenlik başlığı yok** (CSP, HSTS, Referrer-Policy, X-Content-Type-Options, Permissions-Policy, frame koruması) + `xmlrpc.php` açık.

**Orta öncelik**

6. Node 18 (EOL) ve pnpm'in kurulu olmaması S01'in ilk bloklayıcısı.
7. Deployment hedefi bilinmiyor → adapter, güvenlik başlığı uygulaması ve form runtime kararı askıda (ADR-003 `OPEN`).
8. Mevcut 19 uzmanlık/çözüm sayfasının yeni **8 çözüm** modeline eşlemesi belirsiz; 4 legacy URL için hiç hedef yok (`is-ilanlari`, `basvuru-formu` dahil — yeni rota haritasında kariyer rotası tanımlı değil).
9. `[gslogo id=1]` shortcode'u canlı sitede render edilmiyor — mevcut sitede yayınlanan müşteri logosu yok, dolayısıyla izin kaydı da yok.
10. 24/54 sayfada meta description yok; ana sayfada hatalı `Article`/`Person` yapısal verisi üretiliyor.
11. 4 sayfada hâlâ "Micro Focus" adı geçiyor (marka artık OpenText).
12. Karışık dil: `Search for pages`, `Add to cart` gibi İngilizce/WooCommerce dizeleri Türkçe arayüzde yayında.

**Kaynak eksikliği**

13. **`Duosis_Yeni_Sunum_v2.pptx` ve `duosis-hackathon-brief(1).txt` bulunamadı.** Tüm Desktop tarandı. CyclOps, bölgesel kapsam ve ürün iddialarının kaynağı büyük olasılıkla bu belgelerde; içerikleri hakkında **hiçbir varsayım yapılmadı.**

---

## İş sahibi tarafından doğrulanması gerekenler

1. **Kuruluş tarihi ve 2016–2026 kilometre taşları** — S09 timeline'ın tamamı buna bağlı. Sitede hiçbir yerde yazmıyor.
2. **"50+ kurumsal müşteri" ve "15+ teknik danışman"** — sayım yöntemiyle birlikte. Sitede kanıt yok.
3. **CyclOps:** doğru yazım, gerçek ekran görüntüsü, doğrulanmış yetenek listesi, lansman durumu. *S08 bunsuz başlayamaz.*
4. **Türkiye / Central Asia / Middle East kapsamı** — her bölge için doğrulanabilir kanıt.
5. **Müşteri logoları ve referans metinleri** için yazılı kullanım izni.
6. **KACE kararı** ve Quest ürün kapsamı (Change Auditor mı, genel Quest mi).
7. **Mevcut 19 uzmanlık/çözüm sayfasının yeni 8 çözüme eşlenmesi.**
8. **`/is-ilanlari/` ve `/basvuru-formu/`** yeni sitede kalacak mı? (Rota haritasında kariyer rotası yok.)
9. **"IT for More" sloganı** korunacak mı?
10. **Logo:** 10. yıl güncellemesi yapılacak mı; logodaki çift cyan (`#16A6D9`/`#16A6DE`) ve çift ink (`#252A2E`/`#242A2F`) değerleri tekilleştirilecek mi?
11. **Form hedefi** (CRM veya e-posta) ve veri saklama süresi.
12. **Yandex.Metrika ve GA4 mülkü** (`G-C9DG54493V`) yeni sitede kalacak mı? Kalacaksa webvisor açık rıza olmadan açılamaz.
13. **Eksik iki kaynak dosyanın sağlanması.**
14. **Grafana, Pandora FMS, Stor2RRD, Kron, Runecast, Vertica** — sitede partner sayfaları var ama plan paketinin 8 çözüm listesinde yok. Kapsamda kalacaklar mı?

---

## Sonraki sprint önerisi

**S01 — Repository & Quality Gates.** Kod yazımından önce sırasıyla:

1. Güncel aktif Node LTS'e geçiş + `.nvmrc` / `packageManager` / CI pinlemesi (ADR-002).
2. pnpm kurulumu.
3. `git init` + ilk commit (protokol §2 gereği bu adım S01'e ait).
4. Astro + TypeScript strict iskeleti (ADR-001).
5. `pnpm quality` zincirinin fail-closed kurulması.

**Öneri:** S01 teknik olarak hiçbir iş sahibi kararına bağlı değil, bu yüzden içerik doğrulamaları beklenirken paralel yürütülebilir. Ancak **S03 başlamadan önce marka paleti kararı (ADR-008)**, **S08 başlamadan önce CyclOps girdisi** kesinleşmelidir.

> Bu yalnızca öneridir. Codex onayı gelmeden S01'e geçilmeyecektir.
