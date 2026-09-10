# DUOSIS Web — S08 + S09 Birleşik Teslim Raporu

## Durum

- Sprintler: **S08** CyclOps Signal-to-Action Ürün Hikâyesi · **S09** Duosis 10. Yıl ve Hakkımızda
- Sonuç: **COMPLETE** (her iki sprint)
- Branch: `duosis-web/s08-s09-cyclops-about`
- Branch base: `9fc0161` (merge edilmiş `main`)
- **Remote CI: YEŞİL** — final HEAD `9ed43e6` için [run 34412832098](https://github.com/onursonmz/duo-web-site/actions/runs/34412832098), 4m48s
- Push: **YAPILDI** · Merge: **YAPILMADI** (`main` hâlâ `9fc0161`)

---

## 1. S06+S07 merge sonucu ve main CI

| Adım                | Sonuç                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| Ön kontrol          | `origin/main` = `6ec04a1` (beklenen), branch HEAD = `0e1861a` (beklenen), ağaç temiz                     |
| Beklenmeyen commit  | **yok** (`6ec04a1..origin/main` boş)                                                                     |
| PR                  | [#3](https://github.com/onursonmz/duo-web-site/pull/3), **merge commit** yöntemiyle                      |
| Merge sonucu        | `main` = **`9fc0161`** (merge commit)                                                                    |
| Main CI             | **YEŞİL** — [run 34389626094](https://github.com/onursonmz/duo-web-site/actions/runs/34389626094), 4m24s |
| Squash/rebase/force | **yapılmadı**                                                                                            |

Güncel `main`'den `duosis-web/s08-s09-cyclops-about` oluşturuldu.

---

## 2. Üç zorunlu takip düzeltmesi (S08 ilk commit'i: `ad14ed3`)

### 2.1 Footer iç süreç metni

"Bu sürüm geliştirme aşamasındadır ve arama motorlarına kapalıdır" ve İngilizce
karşılığı public footer'dan **kaldırıldı**. Kullanılmayan `site.tagline`
metinleri de ("Kurumsal web sitesi — geliştirme sürümü") sözlükten çıktı.
`noindex` metadata **korunuyor** (teste bağlı).

Public ses taramasına eklenen ifadeler: `geliştirme aşaması`, `geliştirme
sürümü`, `development build`, `arama motorlarına kapalı`, `closed to search
engines`, `under development`.

### 2.2 Koyu footer logosu

Teşhis doğrulandı: `duosis-wordmark-mono.svg` dolgusunu `currentColor` ile
veriyor; harici `<img>` bu değeri devralmadığı için SVG kendi varsayılanı olan
siyahla render oluyor ve koyu footer'da kayboluyordu.

- `duosis-wordmark-inverse.svg` **aynı path geometrisinden** türetildi; tek fark
  dolgu rengi (`#eef1f4`). Geometri eşitliği teste bağlandı.
- `LogoMark`'a `wordmark-inverse` varyantı eklendi; footer bunu kullanıyor.
- Kontrast otomatik ölçülüyor: dolgu ↔ footer arka planı **≥ 3:1** (WCAG 1.4.11).
- **Bir hata daha yakalandı:** ilk sürümde SVG yorumunda `--text-primary`
  geçiyordu; XML yorumunda çift tire yasak olduğu için dosya ayrıştırılamıyor ve
  logo **kırık görsel** olarak render oluyordu. Metin taraması bunu görmüyordu;
  bu yüzden `naturalWidth > 0` kontrolü teste eklendi.
- Ekran görüntüleri: `s08/03-footer-desktop.png`, `s08/04-footer-mobile.png`.

### 2.3 Command Atlas hero'nun ilk ekran kompozisyonu

Beş aşamanın adları masaüstünde ilk viewport'un altında kalıyordu. Yapılanlar:

- Masaüstünde H1 üst sınırı 3.75rem → **3rem**; lead ölçüsü genişletildi
  (daha az satır); atlas boşlukları daraltıldı; SVG viewBox 230 → **140**.
- Düğüm x konumları beş sütunlu ızgaranın merkezlerine (**120/360/600/840/1080**)
  oturtuldu: her aşama başlığı kendi düğümünün altında duruyor (ölçülen sapma
  ≤ 12px, teste bağlı sınır 20px).
- SVG'ye **metin gömülmedi**; açıklamalar HTML olarak kaldı.
- Sürekli animasyon eklenmedi, **hero JS hâlâ 0 bayt**, reduced-motion ve JS-off
  davranışı korundu.

**Ölçülen (gerçek viewport görünürlüğü, bounding box):**

| Viewport   | Başlıkların en altı | Pay        | Sonuç          |
| ---------- | ------------------- | ---------- | -------------- |
| 1440 × 900 | 720 px              | **180 px** | ilk ekranda ✅ |
| 1366 × 768 | 720 px              | **48 px**  | ilk ekranda ✅ |

Test yalnız DOM'da bulunmayı değil, viewport sınırlarını ölçer
(`tests/e2e/hero.spec.ts` → "ilk ekran kompozisyonu", TR ve EN).

---

## 3. S08 — CyclOps teslimi

`/cyclops/` ve `/en/cyclops/` (`560e2f3`). Sayfa yapısı talimattaki dokuz
bölümü izler: wordmark + tek cümlelik değer önerisi → operasyon problemi →
Signal-to-Action akışı → önce/sonra → ürün ekranı galerisi → insan onayı ve
otomasyon sınırı → entegrasyonlar → ilgili çözüm/notlar → CTA.

**İlk beş saniye (ölçüldü, hepsi ilk viewport'ta):** "Duosis ürünü" etiketi,
CyclOps wordmark'ı, "izleme araçlarınızın **yerine geçmez**" cümlesi, beş adımın
adı ve CTA.

| Ölçüm                          | Değer                                                     |
| ------------------------------ | --------------------------------------------------------- |
| Akış sırası                    | signal → context → correlate → decide → act               |
| CTA                            | `/iletisim/?topic=cyclops` · `/en/contact/?topic=cyclops` |
| Viewport'taki ilk ürün görseli | **20 KB** (AVIF) — sınır 250 KB                           |
| Galeri toplamı (servis edilen) | **41 KB** — sınır 1 MB                                    |
| Dış istek                      | **0**                                                     |
| CLS                            | **0**                                                     |

Entegrasyonlar yalnızca §8'in izin verdiği altı ad, **metin olarak**, logo yok:
Zabbix, Datadog, Red Hat Ansible, OpenText Operations Orchestration,
OpenText SMAX, Freshservice. Entegrasyon türü sunumda açık olmadığı için
ayrıntı **uydurulmadı**.

---

## 4. Kullanılan gerçek ürün ekranları ve kaynak manifesti

**Kaynak uyuşmazlığı (raporlanır, sessizce geçilmedi).** Talimat
`Cyclops_v1.pdf` için `964a6ee7…435a` hash'ini veriyordu; bu değer S03'te
**PPTX** (SRC-03) için kaydedilmişti. Çalışma alanındaki PDF'in ölçülen hash'i
**`6a98ff91…b5d7`**. PDF asli kaynak sayılmadı; ekranlar bu dosyadan çıkarıldı
ve manifestte **gerçek** hash ile kaydedildi. SRC-03 (PPTX) hâlâ eksiktir.
Ayrıntı: ADR-012 §1.

**Slaytlar rasterize edilmedi.** PDF içindeki gömülü orijinal raster XObject'ler
çıkarıldı. `src/assets/cyclops/MANIFEST.json` her asset için kaynak nesnesini,
ekran adını, inceleme notunu, redaksiyonları, boyutu ve SHA-256'yı taşır.

| Asset                     | Kaynak      | Bulgu                                 | Karar                      |
| ------------------------- | ----------- | ------------------------------------- | -------------------------- |
| `event-browser-inspector` | XObject 119 | yalnızca sentetik demo verisi         | redaksiyon gerekmedi       |
| `matchers-rules`          | XObject 182 | kural değerinde üçüncü taraf ürün adı | **maskelendi**             |
| `operational-dashboard`   | XObject 188 | "AVG RESOLUTION" değeri               | **maskelendi**             |
| `cyclops-wordmark`        | XObject 181 | —                                     | kırpma (yeniden çizilmedi) |

**Galeriye alınmayan ekran:** Hub/datasource görünümü (XObject 181) özel IP
adresi (`192.168.x.x`), dağıtım kimlikleri ve envanterde bulunmayan üçüncü taraf
ürün adları taşıyordu; yalnızca wordmark bu görselden kırpıldı.

---

## 5. S09 — 10. yıl ve Hakkımızda teslimi

`/hakkimizda/` ve `/en/about/` (`9ca0cd6`). Sayfa altı soruyu yanıtlar: hangi
problemi çözmek için varız, nasıl çalışıyoruz, entegratörden farkımız, kendi
ürün geliştirme yaklaşımımız, devreye alma sonrası destek, nerede çalışıyoruz.
Çalışma modeli dört adımdır (analiz → tasarım → uygulama → eğitim ve operasyon
desteği).

**Ekip anlatısı kişi taşımaz:** dört rol/yetkinlik alanı; şema ad, unvan,
fotoğraf veya profil alanını **kabul etmez**. Ekip bölümünde görsel sayısı: 0.

**Zaman çizelgesi:** semantik `<ol>`, her yıl için kararlı çapa
(`#yil-2016` / `#year-2016`), gerçek anchor'larla yıl navigasyonu, odaklanabilir
hedef başlık, `scroll-margin-top`, reduced-motion altında kapanan yumuşak
kaydırma, mobilde yatay sürükleme yok, son düğüm 2026 ve **bakır vurgu yalnızca
orada**. Ana sayfadaki 10. yıl bölümü `/hakkimizda/#yolculuk` ve
`/en/about/#journey` adreslerine bağlandı.

**Kurumsal klişe kullanılmadı** ("yenilikçi/dinamik/lider/tutkulu" taranıyor).

---

## 6. Milestone yayın kararları (ADR-013)

Yayına alınan güvenli omurga (yıl başına tek kayıt, TR + EN):

| Yıl  | Anlatı                                                               |
| ---- | -------------------------------------------------------------------- |
| 2016 | Kuruluş ve kurumsal BT operasyon yönetimi odağı                      |
| 2019 | Ürün kurulumundan kuruma özgü operasyon çözümlerine genişleyen model |
| 2021 | Açık kaynak gözlemlenebilirlik çözümlerinin eklenmesi                |
| 2024 | Veri akışı ve modern gözlemlenebilirlik ekosisteminin genişlemesi    |
| 2025 | Veri platformları, makine öğrenmesi ve yapay zekâ uygulamaları       |
| 2026 | Onuncu yıl ve kendi ürünlerimizle sinyalden aksiyona yaklaşımı       |

`2016-kurulus` kaydı, kullanıcının sağladığı manifesto temelinde **doğrulandı**
(`pending` → `verified`); discovery geçmişi değiştirilmedi.

**Yayınlanmayan:** 5+/15+/25+/35+/50+ müşteri sayıları, ürün başına müşteri
sayıları, müşteri adları/logoları, ATM–banka ve havalimanı vakaları, sektör
iddiaları, MicroFocus/OpenText–IBM–Device42–Confluent–Datadog partnerlikleri,
fiyat/node/satış rakamları, kuruluşun gün/ayı.

**Yapısal güvenceler:** `milestoneSchema` artık `source` alanını **zorunlu**
kılar (izsiz kayıt build'i kırar); aynı locale'de aynı yıl için iki görünür
kayıt olursa `assertUniqueMilestoneYears` **build'i kırar**; sıra
deterministiktir (yıl, eşitlikte kayıt kimliği).

---

## 7. Değişen dosyalar ve commit listesi

| Commit    | Kapsam   | İçerik                                                      |
| --------- | -------- | ----------------------------------------------------------- |
| `ad14ed3` | takip    | Üç zorunlu düzeltme + merkezi rota envanteri                |
| `560e2f3` | **S08**  | CyclOps ürün sayfası, ekran manifesti, ADR-012              |
| `9ca0cd6` | **S09**  | 10. yıl zaman çizelgesi, Hakkımızda, ADR-013                |
| `2a865b1` | S09      | `/hakkimizda/` planlanan rota listesinden çıkarıldı         |
| `43b4ea6` | düzeltme | Lockfile'daki `sharp` kaydı opsiyonel peer ile eşleştirildi |
| `c7c4b29` | düzeltme | Logo içsel boyutu varyanttan üretilir; CLS sıfırlandı       |
| `f57ace4` | test     | Ana sayfa rota kontrolü paralelleştirildi                   |

| Ölçüm                                | Değer                                                      |
| ------------------------------------ | ---------------------------------------------------------- |
| Takip (base → `ad14ed3`)             | 14 dosya, 535 ekleme, 68 silme                             |
| S08 (`ad14ed3` → `560e2f3`)          | 32 dosya, 1855 ekleme, 26 silme                            |
| S09 + düzeltmeler (`560e2f3` → HEAD) | 37 dosya, 1697 ekleme, 35 silme                            |
| Toplam (branch)                      | **69 dosya, 4077 ekleme, 119 silme** (36 yeni, 33 değişen) |

---

## 8. S08 checkpoint testleri

`evidence/s08/logs/quality-s08-checkpoint.log` — **EXIT 0**

| Kapı                 | Sonuç                                      |
| -------------------- | ------------------------------------------ |
| `prettier --check`   | temiz                                      |
| `eslint`             | 0 hata                                     |
| `astro check && tsc` | 103 dosya · **0 hata / 0 uyarı / 0 ipucu** |
| `vitest`             | 11 dosya · **193 test**                    |
| Playwright e2e       | **338 test**                               |
| `astro build`        | **29 sayfa**                               |

CyclOps kabul testleri (27 e2e + 13 birim + 2 JS-kapalı): rota/tek H1/noindex,
akış sırası, ilk ekran hikâyesi, ürün ekranlarının gerçekten yüklenmesi,
AVIF/WebP türevleri, "gerçek ürün ekranı" ayrımı, klavye tuzağı olmaması, dış
istek yokluğu, **hassas veri taraması** (IPv4, token, community string),
**pending teknoloji sızıntısı**, kanıtsız iddia taraması, logo izninin yalnızca
CyclOps'ta açık olması, CTA allowlist'i, 320–1440 taşma, reduced-motion ve axe
WCAG 2.2 AA.

---

## 9. S09 final testleri

`evidence/s09/logs/quality.log` — **EXIT 0**

| Kapı                 | Sonuç                                      |
| -------------------- | ------------------------------------------ |
| `prettier --check`   | temiz                                      |
| `eslint`             | 0 hata                                     |
| `astro check && tsc` | 112 dosya · **0 hata / 0 uyarı / 0 ipucu** |
| `vitest`             | 12 dosya · **204 test**                    |
| Playwright e2e       | **380 test**                               |
| `astro build`        | **31 sayfa**                               |

Hakkımızda kabul testleri (25 e2e + 11 birim + 2 JS-kapalı): rota/tek H1/noindex,
canonical–hreflang karşılıklılığı, yalnızca doğrulanmış kayıtların gösterilmesi,
deterministik sıra, her hash'in doğru başlığa gitmesi, sticky başlığın hedefi
kapatmaması, JS-off derin bağlantı, reduced-motion, mobilde yatay sürükleme
olmaması, yasak iddia/kişisel veri/klişe taraması ve axe WCAG 2.2 AA.

---

## 10. Temiz kök ve audit

`git archive HEAD` → boş dizin, `evidence/s09/logs/` altında:

```
pnpm install --frozen-lockfile   → EXIT 0 (pnpm 12.3.4, Node 24.20.0)
pnpm quality                     → EXIT 0
                                   89 dosya · 0 hata / 0 uyarı / 0 ipucu
                                   204 birim testi · 380 e2e · 31 sayfa
pnpm audit --prod                → No known vulnerabilities found
```

> **Temiz kök doğrulaması gerçek bir hata yakaladı.** `sharp` paketinin
> `@types/node` üzerinde **opsiyonel** peer bağımlılığı var. Lockfile'da kök
> importer kaydı peer'siz yazılıyken pnpm yalnızca peer'li varyantı
> materyalize ediyordu; sonuçta `node_modules/sharp` **kırık bir symlink**
> oluyordu. Ana çalışma alanında bu fark eski store içeriğiyle maskeleniyordu,
> fakat temiz kökte (ve CI'da) `astro build` "Could not find Sharp" ile
> kırılıyordu. Kayıt peer'li sürüme bağlandı; tedarik zinciri politikası
> gevşetilmedi, sürüm değişmedi.

---

## 11. Remote CI

| Branch / commit                                | Sonuç                                                                                                    |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `main` @ `9fc0161` (S06+S07 merge)             | **YEŞİL** — [run 34389626094](https://github.com/onursonmz/duo-web-site/actions/runs/34389626094)        |
| `duosis-web/s08-s09-cyclops-about` @ `f57ace4` | **YEŞİL** — [run 34412149804](https://github.com/onursonmz/duo-web-site/actions/runs/34412149804), 4m26s |

---

## 12. Bundle ve performans

Ölçüm: kendi statik sunucusu, boş port, 6 tur (ilk soğuk tur atılır), boştaki
makine. `evidence/s09/bundle-s09.json`, `evidence/s09/perf-s09.json`.

| Sayfa          | İstemci JS (gzip) | İstek | Dış host | LCP medyan | CLS   |
| -------------- | ----------------- | ----- | -------- | ---------- | ----- |
| Ana sayfa (TR) | 978 B             | 9     | yok      | 268 ms     | **0** |
| Çözüm detayı   | 978 B             | 8     | yok      | 204 ms     | **0** |
| **CyclOps**    | 978 B             | 13    | yok      | 212 ms     | **0** |
| **Hakkımızda** | 978 B             | 9     | yok      | 228 ms     | **0** |

Karşılaştırma: S07 kapanışında ana sayfa 188 ms / CLS 0, çözüm detayı 172 ms /
CLS 0 ölçülmüştü. Aradaki fark ölçüm anındaki makine yüküne bağlıdır; **bütçe
kıyaslaması sayfa sayısı 27'den 31'e çıkarken istemci JS'in sabit kaldığıdır**
(978 B gzip, sayfa sayısından bağımsız).

> **CLS burada iki kez düzeltildi.** İlk ölçümde CyclOps sayfası 0.0184
> gösterdi: `LogoMark` her varyant için sabit `508x219` içsel boyut yazıyordu,
> CyclOps wordmark'ı (108x36) yanlış kutu ayırıyordu. İlk düzeltme öznitelikleri
> yuvarlanmış orandan üretti ve bu sefer ana sayfada 0.0094 kayma çıktı
> (öznitelik ile CSS oranı arasındaki %0.25 fark). Şimdi her iki değer de tek
> bir tam sayı çiftinden geliyor ve dört sayfada da CLS 0.

---

## 13. Erişilebilirlik

axe-core WCAG 2.2 AA (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`),
ihlal sayısı **0**:

`/`, `/en/`, `/cozumler/`, `/en/solutions/`, çözüm detayları, `/iletisim/`,
`/en/contact/`, **`/cyclops/`**, **`/en/cyclops/`**, **`/hakkimizda/`**,
**`/en/about/`**, içgörüler.

Ek kontroller: koyu footer logosunun kontrastı ≥ 3:1, yıl başlıklarının
programatik odaklanabilirliği, galeride sahte tıklanabilir öğe bulunmaması,
tek H1 kuralının **tüm** üretim rotalarında sınanması.

---

## 14. Masaüstü / mobil / reduced-motion / JS-off kanıtı

| Dosya                                      | İçerik                                           |
| ------------------------------------------ | ------------------------------------------------ |
| `s08/01-hero-firstscreen-1440x900.png`     | hero ilk ekran                                   |
| `s08/02-hero-firstscreen-1366x768.png`     | hero ilk ekran (dar yükseklik)                   |
| `s08/03-footer-desktop.png`                | koyu footer, görünür wordmark                    |
| `s08/04-footer-mobile.png`                 | mobil footer                                     |
| `s08/05..08-cyclops-*.png`                 | CyclOps tam sayfa, ilk ekran, galeri, önce/sonra |
| `s08/09-cyclops-integrations.png`          | entegrasyonlar (logo yok, metin)                 |
| `s08/10-cyclops-390-full.png`              | CyclOps mobil                                    |
| `s09/01-about-1440-full.png`               | Hakkımızda tam sayfa                             |
| `s09/02-about-journey.png`                 | zaman çizelgesi (2026 bakır vurgu)               |
| `s09/03-about-390.png`, `04-about-320.png` | mobil ve 320px                                   |
| `s09/05-about-en-1440.png`                 | EN Hakkımızda                                    |
| `s09/06-deeplink-2021.png`                 | derin bağlantı (hedef üst = 72px)                |
| `s09/07-about-reduced-motion.png`          | reduced-motion (`scroll-behavior: auto`)         |
| `s09/08-about-nojs-deeplink.png`           | **JS kapalı** derin bağlantı (hedef üst = 72px)  |

Taşma kontrolü (320/390/768/1024/1440, dört rota): `scrollWidth = clientWidth`,
hiçbir viewport'ta yatay taşma yok.

---

## 15. Base, checkpoint ve final HEAD

| Nokta                | Commit    |
| -------------------- | --------- |
| Branch base (`main`) | `9fc0161` |
| Zorunlu takipler     | `ad14ed3` |
| **S08 checkpoint**   | `560e2f3` |
| S09                  | `9ca0cd6` |
| **Final HEAD**       | `f57ace4` |

---

## 16. Paketler

Her ikisi de **final rapor commit'inden sonra** üretildi.

| Paket                              | Boyut  | Doğrulama                                          |
| ---------------------------------- | ------ | -------------------------------------------------- |
| `duosis-web-S08-S09-evidence.zip`  | 3.9 MB | 28 dosya · `testzip` temiz · yol taraması temiz    |
| `duosis-web-S08-S09-review.bundle` | 1.4 MB | `git bundle verify` → "records a complete history" |

**Evidence ZIP SHA-256:**
`4ab3ce7496b8728386e49f528c314412d119cd8657f0d5951cd9e817024e44dd`

**Bundle SELF-CONTAINED:** `git bundle create … HEAD <branch>` ile üretildi;
prerequisite commit gerektirmez. Boş bir dizinde tek başına doğrulandı:

```
git clone duosis-web-S08-S09-review.bundle <bos-dizin>
→ 85ab1c2 docs(web): S08+S09 teslim raporunu kayda al   (temiz çalışma ağacı)
```

Bundle içinde ham master yok (`.pptx`, `.pdf`, `.ai`, manifesto HTML'i: 0 kayıt).

> **Bundle SHA-256 neden burada değil:** bundle, bu raporu içeren commit'i de
> taşır; hash'i rapora yazmak commit'i değiştirir ve hash'i geçersiz kılar.
> Değer, paketlerin yanındaki `PACKAGES.sha256` dosyasında verilir ve ZIP
> hash'iyle birlikte teslim mesajında tekrarlanır.

---

## 17. `git status --short`

Final HEAD'de çalışma ağacı temizdir; yalnızca teslim paketleri ve `evidence/`
(gitignore kapsamında) repo dışında durur:

```
$ git status --short
(boş)
```

---

## 18. Açık riskler

- **CyclOps wordmark'ı raster.** Sunumda vektör wordmark yok (başlık slaydı
  metin olarak dizilmiş); 108×36 kırpma kullanılıyor ve açık zeminli olduğu için
  koyu hero'da beyaz taşıyıcı içinde duruyor. **Vektör asset iş sahibinden
  istenmelidir.**
- **SRC-03 (PPTX) hâlâ eksik.** Ürün ekranları PDF'ten çıkarıldı; talimattaki
  hash ile çalışma alanındaki dosyanın hash'i farklı (ADR-012 §1).
- **Ürün ekranlarındaki demo verisi.** Görseller demo ortamına ait; ziyaretçiye
  bu açıkça söyleniyor. Gerçek müşteri ortamından ekran **kullanılmadı**.
- **EN içerik dil onayı.** S07'de eklenen altı EN çözüm sayfası ve S08–S09'un EN
  metinleri iş sahibi onayından geçmedi; nihai dil kapısı S15 öncesi.
- **`2016 → 2026` artık yayında.** Kaynak, kullanıcının sağladığı manifestodur;
  kuruluş yılının resmî kaydıyla teyidi faydalı olur.
- **Footer "Ofisler" başlığı** iki doğrulanmış adres gösteriyor (S04'te onaylı
  iletişim verisi). Bölgesel anlatıdaki "ofis yayımlanmaz" sınırıyla
  karıştırılmamalı.
- **Astro görüntü servisi `sharp`'a bağlı.** Lockfile düzeltildi ve temiz kökte
  doğrulandı; yine de bu bağımlılık platform ikilisi gerektirir ve CI imajı
  değişirse yeniden doğrulanmalıdır.

**Bu branch `main`'e merge EDİLMEDİ ve S10'a geçilmedi.**
