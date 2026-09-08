# DUOSIS Web — Sprint S02-R1 Teslim Raporu

## Durum

- **Sprint:** S02-R1 — inceleme düzeltmeleri
- **Sonuç:** **COMPLETE** — istenen 6 maddenin tamamı uygulandı
- **Base HEAD:** `d7061a7756faa164a47d31f02e672bb2f5172d2a`
- **Final HEAD:** `8935ecf6d512f05bb8782bb38919feb316eae1e3`
- **Branch:** `duosis-web/s02-content-model-i18n` (aynı branch, **yeni corrective commit**)
- **Geçmiş commit değiştirilmedi / rebase yapılmadı**
- **Push / merge / rebase / PR / tag / deployment:** **YAPILMADI**

### Commit geçmişi

```
8935ecf fix(web): S02-R1 inceleme düzeltmeleri     <- yeni
d7061a7 feat(web): S02 content model, fixtures and TR/EN routing
af25f0c docs(web): S01 teslim raporunu kayda al
0342d74 chore(web): S01 establish repository and quality gates
900d10f chore(web): establish project baseline
```

`git diff --stat d7061a7..HEAD` → **37 dosya, 2087 ekleme, 310 silme**

### `git status --short`

```
(boş — çalışma ağacı temiz)
```

### `git diff --check`

```
(boş — whitespace hatası yok)
```

---

## 1. Playwright sunucusu ve kalite zinciri fail-closed

**Kök neden:** Port config dosyasında seçiliyordu. Playwright yapılandırmayı **her worker
sürecinde yeniden değerlendirdiği** için her worker farklı bir port seçiyordu; sunucu yalnızca
ana sürecin portunda vardı. Sabit port kullanıldığında ise makinede kalmış bir sunucu
`EADDRINUSE` üretiyor, yeni sunucu ölürken testler eski sunucuya bağlanabiliyordu.

### Uygulanan çözüm

| Gereksinim | Uygulama |
|---|---|
| Her çalıştırmada dinamik ve boş loopback port | `tests/support/run-e2e.mjs` `listen(0)` ile **tek yerde** seçer |
| Aynı env değişkeniyle baseURL + web server | `E2E_PORT` → `playwright.config.ts` hem `baseURL`'e hem `webServer.command`'a verir; worker'lar devralır |
| Sunucu başlatılamazsa testler başlamasın | `preview-server.mjs` `server.on("error")` → `process.exit(1)`; config `E2E_PORT` yoksa **throw** eder |
| `reuseExistingServer: false` | Korundu |
| Sabit porttaki süreçler öldürülmesin | Hiçbir süreç öldürülmüyor; yabancı sunucuya dokunulmuyor |
| Güvenli child process kapanışı | `SIGTERM`/`SIGINT` → `server.close()` + 2 sn sonra zorunlu çıkış; `run-e2e.mjs` çocuğun exit code'unu aynen döndürür, sinyalle ölürse 1 |

### Zorunlu regresyon kanıtı

1. `127.0.0.1:4321` üzerinde **bayat marker sunucusu** başlatıldı (gövde `STALE-MARKER-SERVER`, `x-duosis-preview` başlığı **yok**).
   ```
   $ curl http://127.0.0.1:4321/  →  STALE-MARKER-SERVER
   ```
2. `pnpm test:e2e` çalıştırıldı.
3. Koşucu **başka bir dinamik port** seçti ve yeni build'i orada sundu:
   ```
   run-e2e: E2E_PORT=65478
   preview-server: http://127.0.0.1:65478 -> C:\...\dist
   ```
   **44 test geçti**, exit 0.
4. Marker sunucusunun tam kaydı:
   ```
   MARKER-READY http://127.0.0.1:4321
   MARKER-HIT GET /
   MARKER-HIT GET /
   ```
   Bu **2 istek e2e suite'inden değil**, regresyon öncesi/sonrası elle atılan doğrulama
   `curl`'leridir. **E2E suite'inden 4321'e sıfır istek gitti.**
5. Ek olarak test suite'i kendi kendini doğruluyor (`tests/e2e/i18n.spec.ts` → "e2e sunucu kimliği"):
   - yanıtta `x-duosis-preview: e2e` başlığı olmalı (marker sunucusunda yok)
   - `baseURL` portu **4321 olmamalı**

**Son `pnpm quality` logunda `EADDRINUSE`, `Unhandled 'error'` ve server reuse: 0 eşleşme.**

Loglar: `evidence/logs/e2e-dynamic-port.log`, `evidence/logs/stale-server-marker.log`, `evidence/logs/quality.log`

---

## 2. Teknoloji envanteri eksiksiz taşındı

| | Önce | Sonra |
|---|---:|---:|
| Kayıt sayısı | 17 | **35** |
| Eksik ID | 18 | **0** |

Eksik olan 18 kaydın tamamı eklendi: `airflow, awx, elastic, foglight, kron, n8n, nifi, opentext, opentext-cms, opentext-oo, opentext-sa, pandora-fms, postgresql, quest, runecast, smax, stor2rrd, vertica`.

### Korunan alanlar

`id`, `source`, `decisionNeeded`, `logoPermission`, `licenseModel`, `officialUrl`,
`solutionArea` (ADR-009 eşlemesi), `note`, `currentSiteLabel`. Her biri için S00 ile
birebir eşitlik testi var.

### Kapalı lifecycle enumu

Boolean `active` kaldırıldı; yerine `active | inactive | pending`:

| S00 `active` | S02 `lifecycle` | Public'te |
|---|---|---|
| `unknown` (35/35) | **`pending`** | **Görünmez** |
| `true` | `active` | Görünür |
| `false` | `inactive` | Görünmez |

**S00'da hiçbir kayıt onaylı değildi; hiçbiri sessizce `active` yapılmadı.** Sonuç:
**public teknoloji listesi tamamen boştur** — fail-closed ve bilinçli.

Dönüşüm makinece okunabilir biçimde `src/content/technologies/MAPPING.json` içinde
belgelendi (alan eşlemesi, group eşlemesi, solutionArea eşlemesi, 35 kaydın tek tek
lifecycle dönüşümü ve gerekçe).

### Özel olarak istenenler

- **GLPI, Jira, Tableau** → `pending`, public'te **görünmüyor** (test ediliyor).
- **CyclOps** → `pending`, public'te **görünmüyor**.
- **Grafana `decisionNeeded`** S00 kaynağıyla yeniden karşılaştırıldı: S00'da `no` idi,
  S02'de yanlışlıkla `true` yazılmıştı → **`false`** olarak düzeltildi ve test eklendi.

### Zorunlu testler (`tests/unit/technology-inventory.test.ts`, 26 test)

| Test | Sonuç |
|---|---|
| S00 ↔ S02 ID/sayı paritesi **35/35** | PASS |
| Eksik/fazla ID varsa fail | PASS (0/0) |
| `decisionNeeded`, `logoPermission`, `licenseModel`, `source`, `officialUrl` birebir | PASS |
| `active:unknown` sessizce `active` yapılmamış | PASS |
| Pending/inactive public seçicide **fail-closed** | PASS |
| GLPI/Jira/Tableau/CyclOps public'te yok | PASS |
| 35 kaydın tamamı `technologySchema`'yı geçiyor | PASS |
| Geçersiz `lifecycle` reddediliyor | PASS |

---

## 3. Merkezi içerik grafiği doğrulayıcısı

`src/lib/content/graph.ts` — **tüm** referans alanlarını doğrular:

```
solutions.technologyRefs      -> technologies
solutions.proofRefs           -> proofs
milestones.solutionRefs       -> solutions
insights.authorRef            -> authors
insights.relatedSolutionRefs  -> solutions
```

`src/middleware.ts` her sayfa üretiminde `assertContentGraphOnce()` ve
`assertUniqueTranslationsOnce()` çağırır. **Doğrulama, bir sayfanın o koleksiyonu
sorgulayıp sorgulamadığından bağımsızdır** — tek bir sayfa üretilse bile grafiğin
tamamı denetlenir.

Bir birim testi, `REFERENCE_FIELDS` listesinin beş alanı da kapsadığını doğrular;
şemaya yeni referans eklenip listeye eklenmezse test kırılır.

### Gerçek `astro build` kullanan negatif testler

| Senaryo | Sonuç |
|---|---|
| Bozuk `solution → technology` | Build **non-zero** ile durdu |
| Bozuk `solution → proof/case study` | Build **non-zero** ile durdu |
| Bozuk `milestone → solution` | Build **non-zero** ile durdu |
| Bozuk `insight → author` | Build **non-zero** ile durdu |
| Bozuk `insight → relatedSolution` | Build **non-zero** ile durdu |

Ek olarak yinelenen `translationKey + locale` ve `slug + locale` de build'i kırıyor.
Log: `evidence/logs/graph-negative-tests.log`

---

## 4. Deprecation temizlendi

- `z` artık **`astro/zod`** üzerinden import ediliyor (`schema.ts`, `schemas.ts`).
- `reference` ve `defineCollection` **`astro:content`** üzerinden kaldı.
- Deprecated `z.string().url()` → `z.url()`.

```
$ pnpm typecheck
Result (36 files):
- 0 errors
- 0 warnings
- 0 hints
```

**0 error / 0 warning / 0 hint.**

---

## 5. Solution şeması sözleşmeyle tamamlandı

| Alan | Durum |
|---|---|
| `aiRole: { detect, understand, act }` | Eklendi — **strict + optional** |
| `scenario: { title, context, flow[], result }` | Eklendi — **strict + optional** |

**Fixture'lara doğrulanmamış AI yeteneği yazılmadı.** İki alan da boş; veri gelene kadar
öyle kalacak. Şema testleri hem dolu hem boş durumu doğruluyor.

### `proofRefs` ↔ `caseStudyRefs`

Sözleşmedeki `caseStudyRefs` ile aynı ilişkidir. Tek bir `proofs` koleksiyonu kullanılıyor:
anonim/isimli referans (testimonial) ve metrikli vaka (case study) aynı şemayla temsil
ediliyor; ikisi de aynı doğrulama ve logo izni kurallarına tabi. Ayrım kayıt içinde
`metrics` ve `quote` alanlarının doluluğuyla yapılır. Bu, sözleşmedeki adın **genişletilmiş
(superset)** karşılığıdır ve `schemas.ts` içinde belgelenmiştir.

### Ters referans kararı

`Technology` üzerinde `solutionRefs` **tutulmuyor**. Aynı ilişkinin iki yerde tutulması
senkronizasyon hatası üretir. Teknoloji kaydındaki `solutionArea`, S00 envanterinden gelen
**bilgilendirici bir etikettir**; ilişki kaynağı değildir ve sayfa üretiminde kullanılmaz.
Karar `schemas.ts` başında belgelendi.

### `cta.labelKey`

Artık serbest string veya cast değil: `CTA_LABEL_KEYS` kapalı kümesiyle **şema seviyesinde**
doğrulanıyor. Tanımsız bir anahtar build'i kırıyor (negatif test mevcut).

---

## 6. Taslak içeriklerin indekslenmesi

- **10/10 solution fixture'ı** `seo.noindex: true`.
- **4 liste/ana sayfa** da `noindex` (taslak içerik gösteriyorlar).
- **15/15 üretilen sayfada** `<meta name="robots" content="noindex">` mevcut.
- Politika `docs/CONTENT_MATURITY.md` içinde fail-closed olarak tanımlandı; bir kaydı
  yayına alma adımları da orada.

**TR/EN demo rotaları kaldırılmadı** — 15 sayfa üretilmeye devam ediyor, yalnızca
arama motoru indekslemesi kapalı.

---

## 7. Test sonuçları (gerçek exit code'lar)

| Komut | Exit | Sonuç |
|---|---:|---|
| `pnpm install --frozen-lockfile` (silinmiş `node_modules`) | **0** | Temiz kurulum |
| `pnpm format:check` | **0** | Temiz |
| `pnpm lint` | **0** | 0 hata, 0 uyarı |
| `pnpm typecheck` | **0** | **0 error / 0 warning / 0 hint** |
| `pnpm test` | **0** | **114 passed** (6 dosya) |
| `pnpm test:e2e` | **0** | **44 passed** |
| `pnpm build` | **0** | 15 sayfa |
| **`pnpm quality`** | **0** | Zincirin tamamı — `EADDRINUSE`/`Unhandled`/reuse **0** |
| `pnpm audit --prod` | **0** | **No known vulnerabilities found** |
| `git bundle verify` | **0** | "bundle is okay" |
| `git diff --check` | **0** | Whitespace hatası yok |

Unit dağılımı: `schema` 32 · `technology-inventory` 26 · `i18n` 20 · `selectors` 15 ·
`content-validation` 14 · `pageTitle` 7.

---

## 8. Görünür çıktı değişikliği ve güncel kanıt

Teknoloji filtresi değiştiği için ekran görüntüleri **yeniden üretildi** (10 adet).

| Ölçüm | Değer |
|---|---:|
| AIOps sayfasında `cyclops` | **yok** |
| Görünür teknoloji sayısı (TR çözüm sayfası) | **0** — tamamı `pending` |
| "Teknoloji kaydı bulunmuyor" gösterimi | **var** |
| `#main-content` içindeki `<img>` | **0** — izinsiz logo yok |
| Console hatası | **yok** |
| İç bağlantı / kırık | 14 / **0** |
| Dil değiştirici TR→EN→TR | Doğru karşılıklara gidiyor, `lang` doğru |

Teknoloji filtreleme kanıtı: `evidence/10-aiops-filtered-1440.png` ve
`evidence/03-solution-tr-1440.png`.

**Bundle:** çözüm detay sayfası **1 istek, 4.857 bayt HTML, 0 bayt client JS**.
İçerik modeli client JavaScript eklemedi.

**Reduced motion:** N/A — hiç animasyon yok.

---

## 9. Teslim paketleri

| Paket | İçerik | Boyut | SHA-256 |
|---|---|---:|---|
| `duosis-web-S02-R1-review.bundle` | 4 ref, tam geçmiş | 264.549 B | `14f05a9508626b8e6cc1d6eace1fbbe37870f5e825745c3c6f55986dbc0abc7e` |
| `duosis-web-S02-R1-evidence.zip` | 19 dosya | 546.278 B | `257b9bff0d02508f20539a3041237ddbfcbdcd0fb9c97be16dfe6783a5c62a41` |

```
$ git bundle verify duosis-web-S02-R1-review.bundle
The bundle contains these 4 refs:
0342d740... refs/heads/duosis-web/s01-repository-quality-gates
8935ecf6... refs/heads/duosis-web/s02-content-model-i18n
900d10f5... refs/heads/main
8935ecf6... HEAD
The bundle records a complete history.
duosis-web-S02-R1-review.bundle is okay
```

Her iki pakette de secret, `.env`, `node_modules` veya tarayıcı ikilisi **yok**
(programatik kontrol edildi). `dist/` secret taraması temiz.

---

## 10. Bilinen açıklar ve riskler

1. **Public teknoloji listesi boş.** Bu bir hata değil, fail-closed sonuçtur: S00'da
   hiçbir teknoloji iş sahibi tarafından onaylanmamıştı. Onay geldikçe `lifecycle`
   `active` yapılacak; **kod değişikliği gerekmeyecek**.
2. **Tüm sayfalar `noindex`.** Doğrulanmış içerik geldikçe kayıt bazında açılacak.
3. `aiRole` ve `scenario` alanları **boş** — doğrulanmış AI anlatısı gelmeden doldurulmayacak.
4. **EN kapsamı sınırlı** — 8 çözümün 2'sinde EN karşılığı var.
5. **CI hâlâ hiç çalışmadı** — push yapılmadığı için workflow yalnızca yerel doğrulandı.
   Dinamik port değişikliği CI'da da geçerli (env üzerinden çalışıyor) ama gerçek koşu
   ilk push'ta görülecek.
6. `/iletisim/` rotası yok (S12); CTA'lar çözüm sayfalarına yönlendiriyor.
7. S00'dan devam eden blokajlar: CyclOps ürün kanıtı (S08), müşteri logo izinleri (S10),
   deployment hedefi (ADR-003).

---

## 11. Sonraki sprint önerisi

**S03 — Command Atlas Design System.** Bağlayıcı kısıt değişmedi: marka cyanı `#16A6D9`
beyaz üzerinde **2.80:1**, WCAG AA'yı geçmiyor (ADR-008 / C11). Paper yüzeyler için
koyulaştırılmış varyant türetilmeli; `base.css` içindeki geçici `#0b5f80` o kararla
değiştirilmeli.

> Bu yalnızca öneridir. Codex onayı gelmeden S03'e geçilmeyecektir.
