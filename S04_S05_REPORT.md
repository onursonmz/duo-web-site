# DUOSIS Web — S04 + S05 Birleşik Teslim Raporu

## Durum

- Sprintler: **S04** Global Shell ve Navigasyon · **S05** Ana Sayfa Vertical Slice
- Sonuç: **COMPLETE** (her iki sprint)
- Branch: `duosis-web/s04-s05-shell-homepage`
- Branch base: `5609467ff3e4e27f2a1580eff35ca34807e1a5e0` (merge edilmiş `main`)
- **Remote CI: YEŞİL** — [run 34286860276](https://github.com/onursonmz/duo-web-site/actions/runs/34286860276), 3m24s
- Push: **YAPILDI** · Merge: **YAPILMADI** (`main` hâlâ `5609467`)
- `git status --short` boş · `git diff --check` temiz

| Commit    | Sprint  | İçerik                                        |
| --------- | ------- | --------------------------------------------- |
| `956b967` | —       | S03 takip düzeltmesi + ikili sprint protokolü |
| `4520519` | **S04** | Global shell ve erişilebilir navigasyon       |
| `6d989b7` | **S05** | Ana sayfa vertical slice                      |
| `6472af4` | **S05** | Mobil sıkışma düzeltmesi + regresyon testi    |

| Ölçüm            | Değer                                         |
| ---------------- | --------------------------------------------- |
| S04 base → final | `956b967` → `4520519` · 15 dosya, 1773 ekleme |
| S05 base → final | `4520519` → `6472af4` · 28 dosya, 2412 ekleme |
| Toplam (branch)  | 43 dosya, **4704 ekleme**, 96 silme           |

---

## 1. S03'ün main'e merge edilmesi

Merge öncesi `git fetch` ile doğrulandı: `origin/main` **`900d10f`**'te, `900d10f..origin/main`
boş — beklenmeyen commit **yok**. `git merge-base --is-ancestor` ile S03'ün main'i
tamamen içerdiği kanıtlandı.

[PR #1](https://github.com/onursonmz/duo-web-site/pull/1) → **merge commit** `5609467`.
Squash/rebase kullanılmadı; S01–S03 commit geçmişinin **tamamı korundu**
(8 commit tek tek doğrulandı).

Merge sonrası `main` CI: [run 34277236376](https://github.com/onursonmz/duo-web-site/actions/runs/34277236376) **success**, 2m56s.
Yeşil olduğu için birleşik sprint branch'i güncel `main` üzerinden açıldı.

---

## 2. Teslim protokolü ikili sprint düzenine geçirildi

`04_DELIVERY_PROTOCOL.md` güncellendi (`956b967`):

- **§1.1 İkili sprint paketi** eklendi: tek branch, sprint başına ayrı atomik
  checkpoint commit, ilk sprint sonunda zorunlu `pnpm quality`, başarılıysa
  Codex onayı beklenmeden ikinciye geçiş, ikinci sprint sonunda tam kalite +
  remote CI, birleşik raporda ayrı kabul kriterleri, BLOCKED halinde ikinciye
  geçilmemesi, onay sonrası merge.
- **§2**: onaylanan sprint `main`'e **merge commit** ile alınır; squash/rebase
  yok, merge sonrası `main` CI beklenir.
- **§4**: ikili pakette ilk sprint için "rapor ver ve dur" yerine "checkpoint
  commit + `pnpm quality` başarılı" maddesi geçerlidir.
- **§5** kanıt tablosuna **CI**, **temiz kök** ve **paket** (ZIP yol biçimi
  dahil) satırları eklendi.

S03 final raporu (`S03_REPORT.md`) repo kayıtlarına alındı.

---

## 3. S03 takip düzeltmeleri

### Kontrast güvenlik payı

Ton (HSL H ve S) marka cyanıyla **aynı** tutuldu; yalnızca açıklık düşürüldü.

| Token      | Önce             | Sonra         |     canvas | raised | sunken |
| ---------- | ---------------- | ------------- | ---------: | -----: | -----: |
| `--signal` | `#107aa4` (4.51) | **`#0f7197`** | **5.11:1** | 5.48:1 | 4.80:1 |
| `--action` | `#b5560f` (4.55) | **`#a44f0e`** | **5.29:1** |      — | 4.96:1 |

Beyaz metin `signal` üzerinde **5.48:1**, `action` üzerinde **5.67:1**.
Hedef ≥4.75 ve tercih edilen ≥5.0 **karşılandı**.

**Focus yeniden ölçüldü, değişmedi** (`#0f86b4`): açık canvas 3.85, raised 4.13,
sunken 3.61; koyu canvas 4.32, raised 3.93 — hepsi ≥3:1.

Üç yeni token testi eklendi: (a) signal ve action açık yüzeyin **üç katmanında
da** ≥4.75, (b) signal ≥5.0, (c) signal tonunun marka cyanından en fazla
2° / 0.05 doygunluk sapması. Belge, tasarım sistemi tablosu ve ekran
görüntüleri güncellendi.

### Evidence ZIP yol biçimi

Yeni ZIP `zipfile.ZipInfo` ile **açıkça `/` ayıracı** kullanılarak üretiliyor.
Doğrulandı: `unzip -t` → **EXIT 0**, "No errors detected"; 30 girdinin hiçbirinde
`\`, mutlak yol, sürücü harfi veya `..` **yok**.

---

## 4. S04 — Global Shell ve Navigasyon

### Config tabanlı navigasyon

`src/config/navigation.ts` tek kaynak. **Fail-closed kural:** yalnızca
`status: "active"` girdiler render edilir; `planned` girdiler `href` olarak
`null` döner — yani kırık link **üretilemez**.

| Girdi      | Durum                      | Açılacağı sprint |
| ---------- | -------------------------- | ---------------- |
| Çözümler   | **active**                 | —                |
| İçgörüler  | **active** (S05'te açıldı) | —                |
| CyclOps    | planned                    | S08              |
| Hizmetler  | planned                    | S09              |
| Hakkımızda | planned                    | S10              |
| İletişim   | planned                    | S12              |

Altı ana giriş sınırı testle zorlanıyor. Bir e2e testi de dört üretim rotasında
`/iletisim/`, `/hakkimizda/`, `/blog/`, `/cyclops/`, `/hizmetler/` adreslerine
**hiç link verilmediğini** doğruluyor.

### Mega menü

8 çözüm alanı, iş sonucu başlığı + tek satır açıklama. **Hover gerektirmez**:
click ve klavye ile tam kullanılabilir. Escape, dışarı tıklama ve odak kaybı
kapatır; odak **tetikleyiciye döner**; `aria-expanded` her durumda gerçek
duruma eşittir.

> **Bulunan gerçek hata:** panel başlangıçta header'ın sonundaydı; Tab
> paneldeki ilk bağlantı yerine dil değiştiriciye gidiyordu. Panel DOM'da
> tetikleyicinin hemen ardına taşındı. E2E yakaladı.

### Mobil menü

Focus trap (25 Tab boyunca odak panelden çıkmıyor), scroll lock ve kapanışta
**tam temizlik**: `overflow` ve `paddingRight` açılış öncesi değerlerine geri
yazılıyor (test `before`/`after` eşitliğini denetliyor). Escape, kapat butonu,
karartma alanı ve bağlantıya gidiş kapatır. Masaüstü genişliğine geçilirse
otomatik kapanır.

### İlerlemeli geliştirme

`<html class="no-js">` + head'de satır içi kaldırıcı script. JS yokken
JS'e bağlı kontroller **hiç gösterilmez** (ölü kontrol yok); JS varken sınıf
ilk boyamadan önce kalktığı için **CLS oluşmaz**. JS kapalıyken ana menü
listesi dar ekranda da görünür kalıyor.

### Footer

Yalnızca **doğrulanmış** iletişim bilgileri: C05 İstanbul (Brandium R2,
Ataşehir), C06 Ankara (Çankaya), C07 iki telefon, C08 `info@duosis.com`.
Sosyal medya, tam sokak adresi ve bölge kapsamı **yok**. Yıl derleme
zamanından üretiliyor (ölçülen: 2026). İç bağlantıların tamamı 200 dönüyor.

### Client JS

Site ilk kez client JS taşıyor — sözleşmenin istediği "açık gerekçe" mega menü
ve mobil menüdür. Astro scripti satır içi gömüyor: **2.520 B ham / 933 B gzip**.
Harici script veya CDN **yok**. Bütçe testi 12 KB **ham** üzerinden ölçüyor
(gzip'ten daha katı).

> "Sayfa hiç script etiketi yüklemez" testi **kaldırılmadı**, ölçülebilir hale
> getirildi: yalnızca kendi kaynağımızdan script, UI runtime hydrate edilmez ve
> JS olmadan site tam çalışır.

---

## 5. S05 — Ana Sayfa Vertical Slice

### Bölüm akışı (e2e ile doğrulanır)

`hero → trust → solutions → cyclops → intelligence → method → decade →`
`[regional] → technology → insights → roadmap`

### Verisi olmayan bölüm boş kutu göstermiyor, HİÇ oluşmuyor

| Bölüm             | Durum                                     | Sonuç                                         |
| ----------------- | ----------------------------------------- | --------------------------------------------- |
| **regional**      | 6 bölge kaydının hiçbiri `verified` değil | Bölüm **hiç oluşmadı** (`#regional` sayısı 0) |
| **insights** (EN) | EN'de yayınlanmış içgörü yok              | EN ana sayfada bölüm **yok**                  |
| **decade**        | Yalnızca `verified` milestone listelenir  | Pending 2016 kuruluş kaydı **görünmüyor**     |

Bir e2e testi "veri bekleniyor", "yakında", "coming soon", "lorem ipsum", "tbd"
ifadelerinin **hiçbirinin** ana sayfada geçmediğini doğruluyor.

### İçerik güvenliği — ölçülen sonuçlar

| Kontrol                                   | Sonuç                 |
| ----------------------------------------- | --------------------- |
| Ana sayfada `<img>` (vendor logosu)       | **0**                 |
| Vendor/ürün adı sızıntısı (15 ad tarandı) | **0**                 |
| Doğrulanmamış müşteri/partner sayısı      | **yok** (regex testi) |
| Doğrulanmamış kıdem iddiası ("10+ yıl")   | **yok**               |
| Bölüm sayısı / H1 sayısı                  | 10 / **1**            |
| `#roadmap` çapası                         | **mevcut**            |
| Ana sayfa `noindex`                       | **evet**              |

Teknoloji ekosistemi **yedi yetenek katmanıyla** anlatılıyor; ürün adı ve logo
yok. Proof bölümü yerine **çalışma biçimi** (Analiz → Tasarım → Uygulama →
Operasyon) anlatılıyor ve _nedeni_ sayfada açıkça yazıyor: yayınlanabilir müşteri
referansı yok, logo izinleri alınmamış, sayısal iddialar doğrulama bekliyor.

10. yıl teması kullanılıyor fakat **hiçbir doğrulanmamış rakam veya kilometre
    taşı** gösterilmiyor. AI, tekrar eden bir rozet değil; şema **tam üç aşamalı**
    (Algıla → Anla → Harekete geç) zinciri zorunlu kılıyor.

### Yasaklı-ID testinin daraltılması — bilinçli ve gerekçeli

`cyclops` genel yasaklı listesinden **çıkarıldı**, çünkü aynı kelime iki ayrı
şeyi temsil ediyordu:

1. **teknoloji envanteri kaydı** — hâlâ `pending`; public teknoloji listesinde
   görünemez;
2. **Duosis'in kendi ürününün adı** — truth matrix C12
   (`internal-source-available-public-pending`) taslak yazıma açıkça izin veriyor.

**Sızıntı koruması zayıflatılmadı, doğru hedefe yöneltildi.** Üçüncü taraf ürün
adları hâlâ hiçbir sayfada geçemez. Ek olarak üç yeni test:

- CyclOps envanter kaydı hiçbir sayfada teknoloji listesinde görünmüyor
  (liste hiç render edilmiyor),
- teaser sürüm numarası, yüzde, MTTR/SLA veya müşteri sayısı **taşımıyor** ve
  olgunluk notu **görünür**,
- teaser yalnızca `noindex` sayfada bulunuyor.

> Bu testi yazarken gerçek bir tuzağa düştüm: kelime sınırsız `/sla/i` Türkçe
> **"ta*sla*k"** kelimesinde yanlış eşleşiyordu. `\b` sınırları eklendi.

### Minimal içgörüler rotası

`/icgoruler/`, `/icgoruler/[slug]/` ve `/en/insights/` — hepsi **noindex**,
gerçek koleksiyon verisiyle. S11'in tam blog kapsamı **değil**: kategori, arama,
sayfalama ve RSS yok. EN listesi boş olduğu için durum açıkça bildiriliyor
(ana sayfa bölümü ise hiç oluşmuyor).

### Görsel

Her bölüm **farklı kompozisyon**: numaralı sütunlar, editorial liste, bölünmüş
koyu blok, zincir, yatay ray, yığılmış katman. Peş peşe aynı kart gridi yok.
Açık/koyu yüzey dönüşümlü. Hero animasyonu **yok** (S06 kapsamı).

> **Bulunan gerçek hata:** teknoloji katmanı gövdesi 390px'te 2.5rem'lik indeks
> sütununa sıkışıyordu — ölçülen 40px genişlik / 403px yükseklik. Düzeltildi
> (286px / 67px) ve regresyona bağlandı: metin taşıyan hiçbir kutu 320/390px'te
> aşırı dar (<90px) ve aşırı uzun (>150px) olamaz.

---

## 6. Kabul kriterleri

### S04 kabul kriterleri

| Kriter                                                        | Durum    | Kanıt                        |
| ------------------------------------------------------------- | -------- | ---------------------------- |
| Desktop ve mobile menü mouse, touch ve klavye ile çalışıyor   | **PASS** | `navigation.spec.ts`         |
| Mega menü hover zorunlu değil; focus/click ile kullanılabilir | **PASS** | Klavye-only testi            |
| Mobile menü kapandığında focus tetikleyiciye dönüyor          | **PASS** | `toBeFocused()`              |
| Dil değiştirici ilgili çeviri rotasına gidiyor                | **PASS** | TR↔EN round-trip             |
| Header açılıp kapanırken CLS veya body scroll kalıntısı yok   | **PASS** | before/after eşitliği        |
| Footer'da eski yıl, placeholder veya izinsiz sosyal link yok  | **PASS** | Yıl 2026, sosyal link 0      |
| Aktif route semantik olarak işaretleniyor                     | **PASS** | `aria-current="page"`        |
| JS kapalı fallback temel navigasyonu koruyor                  | **PASS** | `no-javascript.nojs.spec.ts` |
| En fazla altı ana navigasyon öğesi                            | **PASS** | `navigation.test.ts`         |
| Rotasız sayfaya kırık link yok                                | **PASS** | 4 rotada tarama              |
| Escape / dışarı tıklama / focus return / `aria-expanded`      | **PASS** | Ayrı testler                 |
| Mobile focus trap, scroll lock, kapanış temizliği             | **PASS** | 25 Tab + stil eşitliği       |
| Menü animasyonları 160–240 ms ve reduced-motion uyumlu        | **PASS** | `--motion-fast` 160ms        |
| Client JS < 12 KB gzip                                        | **PASS** | **2.520 B ham / 933 B gzip** |
| Harici script veya CDN yok                                    | **PASS** | 0 harici host                |
| 404 aynı shell içinde                                         | **PASS** | 404 + header + footer        |
| Breadcrumb altyapısı                                          | **PASS** | İçgörü detayında canlı       |

### S05 kabul kriterleri

| Kriter                                                            | Durum    | Kanıt                      |
| ----------------------------------------------------------------- | -------- | -------------------------- |
| Vaat, güven, kapsam, fark ve CTA akışı tek sayfada anlaşılır      | **PASS** | 10 bölüm, doğru sıra       |
| Teknoloji markaları çözüm faydasının önüne geçmiyor               | **PASS** | Vendor adı 0               |
| CyclOps, Duosis'in kendi ürünü olarak açıkça ayrışıyor            | **PASS** | "Kendi ürünümüz" bölümü    |
| AI ayrı süs değil; anlatıya bağlanıyor                            | **PASS** | Üç aşamalı zincir          |
| Blog/İçgörüler ana sayfada güncellik kanıtı olarak yer alıyor     | **PASS** | TR'de bölüm + gerçek kayıt |
| Pending veri public görünümde boş/sahte sayı üretmiyor            | **PASS** | `#regional` 0, sahte KPI 0 |
| 390px ve 1440px görünümlerinde kırılma/taşma yok                  | **PASS** | Reflow + sıkışma testleri  |
| JS kapalıyken tüm ana içerik ve linkler kullanılabilir            | **PASS** | nojs projesi               |
| Metinler content/config katmanından geliyor                       | **PASS** | `homepage` koleksiyonu     |
| Bölgesel modül veri modeliyle hazır, görünürlük doğrulamaya bağlı | **PASS** | `regions` + `getRegions`   |
| SEO metadata ve social preview alanları                           | **PASS** | 5 OG alanı dolu            |
| CTA'lar mevcut ve gerçek hedeflere gidiyor                        | **PASS** | Tüm iç linkler 200         |
| Site geneli `noindex` korunuyor                                   | **PASS** | 19/19 sayfa                |
| Heading outline tutarlı                                           | **PASS** | Seviye atlaması yok        |
| axe WCAG 2.2 AA temiz                                             | **PASS** | 1440px + 390px + içgörüler |

---

## 7. Test sonuçları

### S04 ara kalite kapısı (`4520519`)

| Komut                   |  Exit | Sonuç                                       |
| ----------------------- | ----: | ------------------------------------------- |
| `format:check` / `lint` | 0 / 0 | Temiz                                       |
| `typecheck`             | **0** | **0 error / 0 warning / 0 hint** (61 dosya) |
| `test`                  | **0** | **154 passed** (9 dosya)                    |
| `test:e2e`              | **0** | **91 passed**                               |
| `build`                 | **0** | 16 sayfa                                    |
| **`quality`**           | **0** | Zincirin tamamı                             |

### S05 final kalite (`6472af4`)

| Komut                        |  Exit | Sonuç                                       |
| ---------------------------- | ----: | ------------------------------------------- |
| `install --frozen-lockfile`  | **0** | Temiz kökte de                              |
| `format:check` / `lint`      | 0 / 0 | Temiz                                       |
| `typecheck`                  | **0** | **0 error / 0 warning / 0 hint** (81 dosya) |
| `test`                       | **0** | **167 passed** (10 dosya)                   |
| `test:e2e`                   | **0** | **118 passed**                              |
| `build`                      | **0** | 19 sayfa                                    |
| **`quality`**                | **0** | Zincirin tamamı                             |
| `audit --prod`               | **0** | No known vulnerabilities                    |
| **Temiz kök** `quality`      | **0** | 118 e2e, 19 sayfa                           |
| **Temiz kök** `audit --prod` | **0** | Temiz                                       |
| **Remote CI**                | **0** | run 34286860276, 3m24s                      |
| `git bundle verify`          | **0** | okay, complete history                      |
| `unzip -t`                   | **0** | No errors detected                          |

Temiz kök `C:\Users\Public\duosis-final` — üst dizinlerinin hiçbirinde
`node_modules` yok (logda doğrulanıyor); `@types/node` proje içindeki
`.pnpm` deposundan çözülüyor.

### Zorunlu davranış senaryoları

| Senaryo                                                 | Sonuç                                                                                     |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Desktop mega menu: mouse, click, klavye                 | PASS                                                                                      |
| Mobile menu: aç/kapat, Escape, focus trap, focus return | PASS                                                                                      |
| Menü kapandıktan sonra body scroll normal               | PASS                                                                                      |
| TR/EN navigation ve translation mapping                 | PASS                                                                                      |
| Aktif route                                             | PASS                                                                                      |
| 404 shell                                               | PASS (status 404 + header + footer)                                                       |
| JS kapalı navigasyon                                    | PASS                                                                                      |
| Homepage tüm section akışı                              | PASS (10 bölüm, doğru sıra)                                                               |
| CTA, solution ve insight linkleri                       | PASS (tümü 200)                                                                           |
| Pending içerik filtresi                                 | PASS                                                                                      |
| Heading outline                                         | PASS                                                                                      |
| 1440px, 390px, 320px                                    | PASS                                                                                      |
| 200% zoom                                               | PASS                                                                                      |
| Reduced motion                                          | PASS                                                                                      |
| Console error                                           | **yok**                                                                                   |
| Kırık iç link                                           | **yok**                                                                                   |
| CLS gözlemi                                             | `no-js` sınıfı ilk boyamadan önce kalkıyor; logo `aspect-ratio` sabit; font metrik hizalı |
| LCP aday öğesi                                          | Hero `h1` — ilk ekranda, görünür                                                          |

---

## 8. Bundle ve performans etkisi

| Ölçüm                     | S03 (ana sayfa) |      S04+S05 (ana sayfa) |
| ------------------------- | --------------: | -----------------------: |
| İstek sayısı              |               4 |                    **9** |
| HTML                      |         3.831 B |             **40.841 B** |
| CSS                       |         7.730 B |             **25.754 B** |
| Font                      |       133.324 B |            **176.380 B** |
| **Harici script dosyası** |               0 |                    **0** |
| **Satır içi client JS**   |             0 B | **2.520 B** (933 B gzip) |
| Harici host               |             yok |                  **yok** |
| Toplam transfer           |         ~145 KB |            **252.348 B** |

HTML artışı gerçek içerikten (10 bölüm) geliyor. Font artışı ana sayfanın
sistem etiketlerinde **JetBrains Mono** kullanmasından: `latin` + `latin-ext`
alt kümeleri de yükleniyor. Client JS yalnızca mega menü ve mobil menü davranışı;
bütçenin (12 KB) **%21'i** kullanılıyor.

Çözüm ve içgörü sayfaları daha hafif: HTML 15.669 / 15.989 B, toplam ~219 KB.

---

## 9. Görsel ve davranış kanıtı

| Kanıt                               | Dosya                            |
| ----------------------------------- | -------------------------------- |
| Masaüstü header                     | `s04/01-header-desktop.png`      |
| Mega menü açık (8 alan)             | `s04/02-mega-open.png`           |
| Mobil header / menü                 | `s04/03`, `s04/04`               |
| Footer                              | `s04/05-footer.png`              |
| **JS kapalı, dar ekran**            | `s04/06-nojs-mobile.png`         |
| 404 ortak shell                     | `s04/07-404.png`                 |
| **Mega menü klavyeyle açık + odak** | `s04/08-mega-keyboard-focus.png` |
| **Mobil focus trap**                | `s04/09-mobile-focus-trap.png`   |
| TR ana sayfa 1440 / 390 / 320       | `s05/01`, `s05/02`, `s05/04`     |
| EN ana sayfa (içgörü bölümü yok)    | `s05/03-home-en-1440.png`        |
| İçgörüler listesi                   | `s05/05-insights-1440.png`       |
| Reduced motion                      | `s05/06-reduced-motion.png`      |

### Teslim paketleri

| Paket                                        |       Boyut | SHA-256                                                            |
| -------------------------------------------- | ----------: | ------------------------------------------------------------------ |
| `duosis-web-S04-S05-review.bundle`           |   580.627 B | `f6feb7ef2a0fc6f27e48c0c54505baf0da4e91f7393f2c7342426dedeca96f19` |
| `duosis-web-S04-S05-evidence.zip` (30 girdi) | 2.992.616 B | `f278dda31afda5e8b05ffd97eeedbdd66386c31f11ed3944d680c258840b0097` |

ZIP yalnızca **S04 ve S05'e ait yeni kanıtları** içeriyor; önceki sprintlerin
görselleri tekrar eklenmedi. Tüm yollar `/` ayıraçlı; `\`, mutlak yol, sürücü
harfi ve `..` **yok**. `node_modules`, `.env`, kaynak master ve font ikilisi
**yok**.

---

## 10. Bilinen açıklar ve riskler

- **`main`'e merge edilmedi** — talimat gereği; `main` `5609467`'de duruyor.
- **Yasaklı-ID testi daraltıldı.** `cyclops` genel listeden çıkarıldı; gerekçe
  ve yerine konan üç test §5'te. İncelemede özellikle bu maddenin
  değerlendirilmesini rica ederim.
- **Ana sayfa metni taslak olgunlukta** (`status: "draft"`, tüm sayfalar
  `noindex`). Metinler iş sahibi onayı almadı.
- **İçgörü fixture'ı yayına alındı** (`draft` → `published`, `noindex` korundu).
  Bu bir iş iddiası değil, kendi mühendislik notumuz; ana sayfanın güncellik
  bölümünün gerçek veriyle çalışması için gerekliydi.
- **EN içerik ince**: EN'de yayınlanmış içgörü yok, bu yüzden EN ana sayfada
  içgörü bölümü hiç oluşmuyor ve `/en/insights/` boş durum gösteriyor.
- **Font ağırlığı 176 KB'a çıktı** (mono ailesi de yükleniyor). Alt küme
  daraltma S06+ performans kapsamında değerlendirilmeli.
- **Bölgesel modül gizli**: veri modeli hazır, 6 kayıt `pending`. Doğrulama
  geldiğinde **kod değişikliği olmadan** görünür olur.
- **Public teknoloji listesi hâlâ boş** (35/35 `pending`).
- S01/S02 branch uçları hâlâ kırmızı (onaylanan ileri yönlü düzeltme kararı).

---

## 11. İş sahibi tarafından doğrulanması gerekenler

- Ana sayfa anlatısının tamamı (hero, güven, CyclOps, yöntem, 10. yıl metinleri)
- "IT for More" sloganının logo dışı kullanımı
- Bölge kapsamı (Türkiye / Orta Asya / Orta Doğu) — üçü de `pending`
- Manifesto iddialarının tamamı (C28–C45)
- Üçüncü taraf teknoloji logolarının izin durumu (35/35 `unknown`)
- CyclOps sürümü, lansman durumu ve müşteri kullanımı
- Footer iletişim bilgilerinin güncelliği (C05–C08)

---

## Sonraki sprint önerisi

S06 (Command Atlas hero motion) için zemin hazır: statik hero fallback yerinde,
`prefers-reduced-motion` token seviyesinde çözülmüş ve motion süreleri
sözleşme aralığında. Hareket eklenirken statik fallback'in **korunması** ve
LCP adayının hero başlığı olarak kalması önerilir.

**S06'ya geçmedim. S04+S05 birleşik Codex incelemesini bekliyorum.**
