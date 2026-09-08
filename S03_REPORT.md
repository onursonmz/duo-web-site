# DUOSIS Web — Sprint S03 Teslim Raporu

## Durum

- Sprint: S03 — Command Atlas Tasarım Sistemi (+ CI düzeltmesi, kaynak kabulü, S02 takip invariantı)
- Sonuç: **COMPLETE**
- Base HEAD: `8935ecf6d512f05bb8782bb38919feb316eae1e3` (onaylı S02-R1)
- Final HEAD: `d2e3ee4c9d9e98744e4c5b8b919f20a406bbe688`
- Branch: `duosis-web/s03-command-atlas-design-system`
- Yerel commit: 4
- Push: **YAPILDI** (yalnızca S03 branch'i)
- **Remote CI: YEŞİL** — [run 34273323746](https://github.com/onursonmz/duo-web-site/actions/runs/34273323746), 2m43s
- Merge / PR / tag / deployment: **YAPILMADI**
- Geçmiş S01/S02 commit'leri, branch'leri ve kırmızı CI kayıtları **değiştirilmedi**; force-push / rebase / history rewrite **yok**

`git diff --stat 8935ecf6..HEAD` → **45 dosya, 4337 ekleme, 148 silme**
`git status --short` boş · `git diff --check` temiz

| Commit    | İçerik                                                               |
| --------- | -------------------------------------------------------------------- |
| `550d44c` | S02-R1 raporu kayda alındı, kaynak masterları `.gitignore`'a eklendi |
| `86afbb8` | CI kırmızısı giderildi, tip çözümü repo içine kilitlendi             |
| `83145a9` | Teknoloji görünürlüğü iki koşullu fail-closed yapıldı                |
| `d2e3ee4` | Command Atlas tasarım sistemi + kaynak kabulü                        |

---

## 1. CI düzeltme commit'i

| Gereksinim                                   | Uygulama                                                                          |
| -------------------------------------------- | --------------------------------------------------------------------------------- |
| `@types/node@24.13.3` doğrudan devDependency | `pnpm add -D` ile eklendi, exact pin (proje kuralı)                               |
| Lockfile normal `pnpm` işlemiyle             | `pnpm-lock.yaml` `pnpm add` çıktısı; elle düzenlenmedi                            |
| Tedarik zinciri politikası gevşetilmedi      | `minimumReleaseAge`, `publicHoistPattern`, `strictPeerDependencies` **değişmedi** |
| `README.md` Prettier ile düzeltildi          | `S02_R1_REPORT.md` de düzeltildi (aynı hata sınıfı)                               |
| Değişiklikler sonrası `format:check`         | Tekrar çalıştırıldı, temiz                                                        |

### Proje-local tip çözümü

`tsconfig.json`:

```json
"types": ["node"],
"typeRoots": ["./node_modules/@types"]
```

**Astro tipleri bozulmadı.** `types` dizisinden `astro/client` çıkarılmasına
rağmen kaybolmuyor, çünkü `.astro/types.d.ts` onu üçlü-eğik referansla getiriyor:

```
/// <reference types="astro/client" />
```

Doğrulama: `astro check` **52 dosya, 0 error / 0 warning / 0 hint**; dosya sayısı
36 → 52'ye çıktı (yeni bileşenler + astro/client dahil). Eşdeğer yönteme
başvurmak gerekmedi.

### Toolchain guard

`tests/unit/toolchain.test.ts` — 5 test:

1. `@types/node` doğrudan devDependency ve sürüm sabitlenmiş
2. `node_modules/@types/node` repo içinde gerçekten mevcut
3. Gerçek yol repo içindeki `node_modules/.pnpm/@types+node@24.13.3/...` altına çözülüyor
4. Kullanıcı profili / üst dizin / global `NODE_PATH` kaynaklı çözüm **testi düşürür**
5. `tsconfig` proje-local çözümü açıkça zorluyor

**Kasıtlı bozma kanıtı** (`evidence/logs/toolchain-guard-negatives.log`):

| Bozma                                       | Sonuç                                                                                         |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `tsconfig`'ten `typeRoots` kaldırıldı       | 5. test **düştü**                                                                             |
| `package.json`'dan `@types/node` kaldırıldı | 4 test **düştü**                                                                              |
| Üst dizin taraması canlı mı                 | `C:\Users\ASUS\node_modules\@types\node` **bulundu** — guard gerçek bir hedefi kontrol ediyor |

---

## 2. Temiz kök doğrulaması

İki ortamda koşuldu.

| Ortam                          | Konum                                   | `quality` | `audit --prod` |
| ------------------------------ | --------------------------------------- | --------: | -------------: |
| Normal proje klasörü           | `C:\Users\ASUS\Desktop\Duosis web site` |     **0** |          **0** |
| Temiz kök (`git archive HEAD`) | `C:\Users\Public\duosis-ci-repro`       |     **0** |          **0** |

Temiz kökün üst dizinlerinde (`/c/Users/Public`, `/c/Users`, `/c`) hiçbir
`node_modules` yok — logda açıkça doğrulanıyor.

```
### @types/node cozum yolu
C:\Users\Public\duosis-ci-repro\node_modules\.pnpm\@types+node@24.13.3\node_modules\@types\node
```

Node `24.20.0`, pnpm `12.3.4`, `install --frozen-lockfile` exit 0.
Log: `evidence/logs/clean-root-s03.log`

**Beklenen sonuçların tamamı karşılandı:** 0 error / 0 warning / 0 hint,
**141** unit (≥114), **64** e2e (≥44), build başarılı, format temiz, audit temiz.

---

## 3. S03 branch push ve CI kapısı

| Push | Commit    | CI Run                                                                            | Sonuç       |  Süre |
| ---- | --------- | --------------------------------------------------------------------------------- | ----------- | ----: |
| 1    | `83145a9` | [34268731300](https://github.com/onursonmz/duo-web-site/actions/runs/34268731300) | **success** | 2m19s |
| 2    | `d2e3ee4` | [34273323746](https://github.com/onursonmz/duo-web-site/actions/runs/34273323746) | **success** | 2m43s |

Eski S01/S02 branch'lerine düzeltme commit'i eklenmedi; uçları onaylı SHA'larda
duruyor ve **kırmızı kalmaya devam ediyor** (bilinçli, bkz. S03 ön kontrol raporu).

---

## 4. Kaynak dosya düzeltmesi

### CyclOps

| Kayıt                        | Durum                                                                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SRC-03** `Cyclops_v1.pptx` | **ASLİ KAYNAK.** "Kullanıcı tarafından sağlandı fakat Claude çalışma alanında henüz mevcut değil" olarak kaydedildi. SHA-256 `964a6ee7…`, 22 slayt — **kullanıcı beyanı**, ölçülemedi |
| **SRC-04** `Cyclops_v1.pdf`  | **TÜREV KAYNAK.** Ayrı kayıt; aslinin yerine yazılmadı. SRC-03'ün export'u _olabilir_ (sayfa sayısı aynı), doğrulanmadı                                                               |

Format varsayılmadı veya değiştirilmedi. Eksiklik **S03'ü bloklamadı**; S08
öncesinde asli PPTX'in çalışma alanına alınması gerektiği kayda geçti.

### Logo

- `duosis-logo.ai` ve `duosis-logo[64].ai` **byte-identical** (`31c8a673…`) — kayda geçti, yalnızca biri kaynak sayıldı
- Raw AI/PDF, manifesto ve CyclOps masterları **repoya alınmadı**
- Commit edilenler: hash, provenance, sınıflandırma ve **gerçekten kullanılan** web türevleri

`git ls-tree` doğrulaması: `Cyclops_v1`, `duosis-logo.ai`, `duosis-logo.pdf`,
`duosis-logo[64]`, `duosis-10-yil-manifesto` — **hiçbiri takip edilmiyor**.
`dist/` içinde de yok.

### Discovery güncellemeleri

| Kayıt            | Önce                             | Sonra                                                             |
| ---------------- | -------------------------------- | ----------------------------------------------------------------- |
| C12 CyclOps      | `claim-only-no-product-evidence` | **`internal-source-available-public-pending`**                    |
| S08              | Kanıt yokluğu nedeniyle blocked  | **Taslak geliştirme için açık**, public yayın doğrulama kontrollü |
| Truth matrix     | 27 iddia                         | **45 iddia** (C28–C45 manifestodan)                               |
| Source inventory | 2 kaynak                         | **8 kaynak**                                                      |

Manifesto iddiaları tek tek işlendi: kuruluş yılı (2016), müşteri sayıları
(5+/15+/25+/35+/50+), partnerlik yılları (MicroFocus/OpenText 2016, IBM Instana
2022, Device42 2023, Confluent ve Datadog 2024), IGA (2018), banka/ATM,
havalimanı (2019), ESM (2019), Data Lake/ML/AI (2025), sektörler ve partner
başına müşteri sayıları. **Hepsi** `source-present-owner-unverified` /
`publishableNow: NO`.

C45'te bir tutarlılık riski açıkça not edildi: partner başına sayıların toplamı
ile toplam müşteri sayısı **çapraz doğrulanmadı**; aynı müşteri birden fazla
partnerde sayılmış olabilir.

### İzin durumu

Duosis logosu **kullanılabilir** işaretlendi. Üçüncü taraf teknoloji logoları
**etkilenmedi**: 35/35 kayıt `logoPermission: unknown` olarak duruyor.
"IT for More" logo masterında korundu; logo dışı bağımsız web mesajı olarak
yaygınlaştırılmadı.

---

## 5. S02 takip invariantı

Public teknoloji **yalnızca** `lifecycle === "active"` **ve**
`decisionNeeded === false` birlikte sağlanırsa görünür. İki bağımsız katman:

1. **Şema** — `technologySchema.superRefine` çelişkili kaydı **reddeder**
   (`active` + `decisionNeeded: true`). Sessizce gizlemek yerine build kırılır.
2. **Seçici** — `isVisibleTechnology` artık `lifecycle` ile birlikte
   `decisionNeeded` alır; şema atlansa bile karar bekleyen kayıt sızmaz.

| Zorunlu test                                                      | Sonuç                                  |
| ----------------------------------------------------------------- | -------------------------------------- |
| `active` + `decisionNeeded:false` → public görünür                | **PASS**                               |
| `active` + `decisionNeeded:true` → şema reject ve public görünmez | **PASS** (birim + gerçek `astro sync`) |
| `pending` → public görünmez                                       | **PASS** (her iki decision değerinde)  |
| `inactive` → public görünmez                                      | **PASS** (her iki decision değerinde)  |
| Preview modda logo izni gevşemez                                  | **PASS**                               |

Altı `lifecycle × decision` kombinasyonunun tamamı ayrıca matris testiyle
kapsandı. Önceki yer tutucu (`expect(true).toBe(true)`) kaldırıldı; geçersiz
lifecycle negatifi artık **gerçek envanter mutasyonu** ile koşuyor.

---

## 6. Tasarım sistemi

### Logo

`duosis-logo.pdf` içerik akışı (obje 8, FlateDecode, 2.663 B) çözülerek **20
vektör yolu** çıkarıldı. Noktalar yalnızca PDF'in kendi CTM'si ile çarpıldı;
y ekseni çevrimi tek bir SVG grup matrisiyle yapıldı. **Yeniden çizim,
ölçekleme, yuvarlama veya sadeleştirme yok.**

| Türev                      | viewBox           | Kullanım                    |
| -------------------------- | ----------------- | --------------------------- |
| `duosis-logo.svg`          | 507.789 × 218.851 | Açık zemin                  |
| `duosis-logo-dark.svg`     | 507.789 × 218.851 | Koyu zemin                  |
| `duosis-wordmark.svg`      | 507.789 × 149.541 | Dar alan                    |
| `duosis-wordmark-mono.svg` | 507.789 × 149.541 | Monochrome (`currentColor`) |
| `duosis-mark.svg`          | 194.137 × 149.446 | Mark                        |
| `favicon.svg`              | 194.137 × 194.137 | Favicon (kare)              |

Monokrom **wordmark ve mark** üzerinden üretildi: bu yollarda beyaz counter
bulunmadığı için tek renge indirgeme kayıpsız. Header'da okunamayan küçük
tagline kullanılmıyor — dar alanda wordmark tercih ediliyor.

### Kontrast ölçümleri

| Ön plan                    | Zemin       |       Oran | Sonuç                  |
| -------------------------- | ----------- | ---------: | ---------------------- |
| `brand-cyan` `#16a6de`     | beyaz       | **2.78:1** | **GEÇMEZ** — dekoratif |
| `brand-cyan-alt` `#16a6d9` | beyaz       | **2.80:1** | **GEÇMEZ** — dekoratif |
| `signal` `#107aa4` (açık)  | canvas      |     4.51:1 | AA                     |
| `signal` `#16a6de` (koyu)  | canvas      | **6.41:1** | AA                     |
| `text-primary` (açık)      | canvas      |    16.63:1 | AA / AAA               |
| `text-primary` (koyu)      | canvas      |    15.74:1 | AA / AAA               |
| `text-muted` (açık)        | canvas      |     5.29:1 | AA                     |
| `action` (açık)            | canvas      |     4.55:1 | AA                     |
| `action` üzerinde beyaz    | —           |     4.88:1 | AA                     |
| `border-strong` (açık)     | canvas      |     3.78:1 | AA (UI)                |
| `border-strong` (koyu)     | canvas      |     3.65:1 | AA (UI)                |
| `focus-ring` `#0f86b4`     | açık canvas |     3.85:1 | AA (UI)                |
| `focus-ring` `#0f86b4`     | koyu canvas |     4.32:1 | AA (UI)                |

Marka cyanı açık yüzeyde **hem** 4.5:1 **hem de** 3:1 eşiğini geçmiyor; bu
yüzden orada yalnızca logo geometrisinin parçası olarak kalıyor. `focus-ring`
**tek değer** olarak her iki yüzeyde de 3:1'i geçiyor.

Bu oranların tamamı `tests/unit/tokens.test.ts` içinde **yeniden hesaplanıyor**;
elle yazılmış bir sayı token değişince testi düşürür.

### Token lint

- Bileşenler ve `base.css` **ham hex renk yazmıyor** (test denetliyor)
- Kullanılan her `var(--token)` tanımlı (şablon değişkenli dinamik adlar önek
  kontrolüyle kapsanıyor)
- 15 zorunlu semantic token grubu mevcut

### Tipografi

| Aile                     | Rol            | Lisans      |             Boyut |
| ------------------------ | -------------- | ----------- | ----------------: |
| Inter (değişken 100–900) | Ana sans       | SIL OFL 1.1 | 48.256 + 85.068 B |
| JetBrains Mono (400–700) | Sistem etiketi | SIL OFL 1.1 | 31.432 + 11.624 B |

**Self-host** — e2e testi çalışma zamanında `fonts.googleapis.com` /
`fonts.gstatic.com`'a **hiçbir istek yapılmadığını** doğruluyor.
latin + latin-ext alt kümeleri Türkçe için zorunlu: `ş/ğ/İ` latin-ext'te,
`ı` latin'de.

**Font fallback:** metrik hizalanmış `Inter Fallback` ailesi (`size-adjust`,
`ascent-override`, `descent-override`). E2E testi tüm `.woff2` isteklerini
`abort` ederek H1 yüksekliğini ölçüyor; fark **%10'un altında** — düzen
bozulmuyor, CLS üretmiyor.

### Bileşenler ve `/design-system`

`Section` (tema bağlamı), `Button`, `SectionHeading`, `Metric`, `StatusLabel`,
`Quote`, `LogoMark`, `FormField`. Açık/koyu ayrımı bileşenin içinde değil
**tema bağlamında** çözülüyor.

`/design-system` **noindex** dev-preview; hiçbir üretim sayfası link vermiyor
(e2e doğruluyor). Tek dosya — silmek yeterli.

---

## 7. Kabul kriterleri

| Kriter                                             | Durum    | Kanıt                                                   |
| -------------------------------------------------- | -------- | ------------------------------------------------------- |
| Kaynak envanteri ve kullanım sınıflandırması       | **PASS** | `SOURCE_MATERIALS.md`, `source-inventory.csv` (8 kayıt) |
| Repo visibility kararına göre raw asset politikası | **PASS** | PRIVATE ölçüldü, **daha katı** politika uygulandı       |
| Site build'i internal kaynak dosyaları içermiyor   | **PASS** | `dist/` 29 dosya, master yok                            |
| Teknoloji decision/lifecycle çelişkisi fail-closed | **PASS** | Şema reject + seçici; 6 kombinasyon testi               |
| Tüm metin ve UI kontrastları AA                    | **PASS** | Token testi (yeniden hesaplama) + axe                   |
| 320px ve 200% zoom'da yatay taşma yok              | **PASS** | 5 rota × 2 viewport, e2e                                |
| Klavye tab sırası ve focus görünürlüğü             | **PASS** | e2e; odak `3px solid #0f86b4`, offset 2px               |
| `prefers-reduced-motion` test edilmiş              | **PASS** | Token süreleri 1ms, spinner `animation: none`           |
| Font fallback ve CLS kontrol edilmiş               | **PASS** | Font `abort` testi, fark < %10                          |
| Design-system desktop/mobile görselleri            | **PASS** | 8 ekran görüntüsü                                       |
| Token lint, axe, e2e, build, audit, `quality`      | **PASS** | Aşağıdaki tablo                                         |
| Bundle ve font ağırlığı raporlanmış                | **PASS** | §9                                                      |
| Git working tree temiz                             | **PASS** | `git status --short` boş                                |
| Review bundle ve evidence ZIP                      | **PASS** | §10                                                     |
| Dark/light section arasında kontrast bozulmuyor    | **PASS** | Her iki bölümde axe + token testi                       |
| Button/link hiyerarşisi net                        | **PASS** | primary / secondary / quiet                             |
| Radius ve gölge keskin stile uygun                 | **PASS** | Radius ≤ 6px, gölge yok                                 |

---

## 8. Test sonuçları

| Komut                       |  Exit | Sonuç                                       |
| --------------------------- | ----: | ------------------------------------------- |
| `install --frozen-lockfile` | **0** | Temiz kökte de                              |
| `format:check`              | **0** | All matched files use Prettier code style!  |
| `lint`                      | **0** | Temiz                                       |
| `typecheck`                 | **0** | **0 error / 0 warning / 0 hint** (52 dosya) |
| `test`                      | **0** | **141 passed** (8 dosya)                    |
| `test:e2e`                  | **0** | **64 passed**                               |
| `build`                     | **0** | 16 sayfa                                    |
| **`quality`**               | **0** | Zincirin tamamı                             |
| `audit --prod`              | **0** | No known vulnerabilities found              |
| **Remote CI**               | **0** | run 34273323746, 2m43s                      |
| `git bundle verify`         | **0** | okay, complete history                      |

Yeni testler: `tokens.test.ts` (14), `toolchain.test.ts` (5),
`design-system.spec.ts` (20), genişletilen `selectors` (20) ve
`content-validation` (16).

---

## 9. Performans / bundle etkisi

| Ölçüm                  | Önce (S02-R1) |   Sonra (S03) |
| ---------------------- | ------------: | ------------: |
| Ana sayfa istek sayısı |             1 |         **4** |
| Ana sayfa HTML         |       4.857 B |   **3.831 B** |
| CSS                    |  0 B (inline) |   **7.730 B** |
| **İstemci JavaScript** |       **0 B** |       **0 B** |
| Font (ana sayfa)       |           0 B | **133.324 B** |
| Harici host            |           yok |       **yok** |

Font ağırlığı tek yeni maliyettir: Inter latin (48.256 B) + latin-ext
(85.068 B). Türkçe sayfalarda her ikisi de yükleniyor. Değişken font olduğu için
100–900 aralığının tamamı bu dosyalarla karşılanıyor; ayrı ağırlık dosyası yok.

`/design-system` sayfası 29.542 B HTML + 13.323 B kendi CSS'i + 4 font
(176.380 B) yüklüyor — bu yalnızca önizleme sayfasıdır, üretim yoluna dahil değil.

**İstemci JavaScript hâlâ 0 B.** `dist/` toplam 364 KB / 29 dosya.

---

## 10. Görsel ve davranış kanıtı

| Kanıt                                 | Dosya                                                   |
| ------------------------------------- | ------------------------------------------------------- |
| Desktop 1440                          | `evidence/design-system/01-desktop-1440.png`            |
| Mobile 390                            | `02-mobile-390.png`                                     |
| 320px                                 | `03-narrow-320.png`                                     |
| %200 zoom (640)                       | `04-zoom200-640.png`                                    |
| Reduced motion                        | `05-reduced-motion.png`                                 |
| Token'ların üretim sayfalarına etkisi | `06-home-tokens-1440.png`, `07-solution-tokens-390.png` |
| Odak halkası                          | `08-focus-ring.png`                                     |
| Logo türevleri karşılaştırması        | `evidence/logo/variants.png`                            |

Ölçülen değerler (`evidence/design-system/evidence.json`):
odak `3px solid rgb(15,134,180)` offset `2px`; reflow hatası **yok**;
H1 sayısı 1; harici host **yok**.

### Teslim paketleri

| Paket                                    |       Boyut | SHA-256                                                            |
| ---------------------------------------- | ----------: | ------------------------------------------------------------------ |
| `duosis-web-S03-review.bundle`           |   511.992 B | `3a28b410ced38f6c89269ff5d37c550e445dd421eb16e4111731843320ba90ae` |
| `duosis-web-S03-evidence.zip` (51 girdi) | 2.965.501 B | `635224a0e1cf13ed8a101e7773dc8997da67b42e25b8642dff6093cb33a84788` |

İki pakette de secret / `.env` / `node_modules` / tarayıcı ikilisi / kaynak
master **yok** (programatik olarak denetlendi). Repoda yalnızca `.env.example`.

---

## 11. Bilinen açıklar ve riskler

- **S01/S02 branch uçları kalıcı kırmızı.** Onaylanan karar gereği düzeltme
  ileri taşındı; geçmiş değiştirilmedi.
- **Palet PROVISIONAL.** Türetilen erişilebilir karşılıklar marka sahibi onayı
  bekliyor (ADR-008). Ham logo renkleri değiştirilmedi.
- **Asli `Cyclops_v1.pptx` çalışma alanında yok.** S03'ü bloklamadı; S08
  öncesinde gerekli.
- **Manifesto iddialarının hiçbiri doğrulanmadı** — 18 yeni kayıt (C28–C45) ile
  `publishableNow: NO`. C45'te çapraz doğrulama riski ayrıca not edildi.
- **Public teknoloji listesi hâlâ boş** — 35/35 `pending`, `logoPermission:
unknown`. Bilinçli fail-closed sonuç.
- **ESLint `no-noninteractive-tabindex` dar kapsamda yapılandırıldı**: kural
  kapatılmadı, yalnızca `region` rolü izinli listeye eklendi. Gerekçe: axe'ın
  `scrollable-region-focusable` kuralı ve WCAG 2.1.1 kaydırılabilir bölgenin
  odaklanabilir olmasını **şart koşuyor**; iki gereksinim çakışıyordu. Rolsüz
  `tabindex` hâlâ hata veriyor (probe ile doğrulandı).
- **Font ağırlığı 133 KB** (Türkçe için iki alt küme zorunlu). Alt küme daraltma
  (subsetting) S05+ performans sprintinde değerlendirilebilir.
- **`/design-system` production build'e dahil** (noindex). İstenirse dosya
  silinerek tamamen kaldırılabilir.
- **Global navigation, hero animasyonu ve tam ana sayfa** bilinçli olarak
  kapsam dışı bırakıldı.

---

## 12. İş sahibi tarafından doğrulanması gerekenler

- Türetilen renk paleti (özellikle `--signal` `#107aa4` ve `--action` `#b5560f`)
- "IT for More" sloganının logo dışı bağımsız web mesajı olarak kullanımı
- 18 manifesto iddiasının tamamı (C28–C45)
- Asli `Cyclops_v1.pptx` dosyasının teslimi
- Üçüncü taraf teknoloji logolarının izin durumu (35/35 `unknown`)
- Inter + JetBrains Mono seçimi (her ikisi de SIL OFL 1.1)

---

## Sonraki sprint önerisi

S04 (ana sayfa) için tasarım sistemi hazır: token'lar, bileşenler ve tema
bağlamı yerinde. Ana sayfa anlatısı sözleşmedeki sekiz bölüm sırasını izlemeli
ve **yalnızca onaylı rakamlarla** kurulmalı — şu anda hiçbir metrik
`publishableNow: YES` değil, bu yüzden "Kanıt" bölümü doğrulama gelene kadar
sayı içermeyen bir anlatıyla kurulmalı.

**S04'e geçmedim. Codex onayını bekliyorum.**
