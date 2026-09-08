# DUOSIS Web — Sprint S01 Teslim Raporu

## Durum

- **Sprint:** S01 — Repository Scaffold ve Quality Gates
- **Sonuç:** **COMPLETE** — 8 kabul kriterinin 8'i PASS
- **Base HEAD:** `900d10f515c0de438426c58040a4c747e7de3c6d` (baseline commit)
- **Final HEAD:** `0342d7402342a5cd3c80d04cb67b8388eb316ca4`
- **Branch:** `duosis-web/s01-repository-quality-gates`
- **Yerel commit:** 2 adet (aşağıda)
- **Push / merge / rebase / PR / tag / deployment:** **YAPILMADI**

### Commit geçmişi

```
0342d74 chore(web): S01 establish repository and quality gates
900d10f chore(web): establish project baseline
```

### `git status --short`

```
(boş — çalışma ağacı temiz)
```

---

## 0. S00 takip düzeltmeleri

|   # | Düzeltme                                                                                                                                                                                                                 | Durum |
| --: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
|   1 | `S00_FINDINGS.md` B29: `decisionNeeded: YES-EXPLICIT` → `yes`                                                                                                                                                            | ✔     |
|   2 | `ADR-DRAFT.md` ADR-005: "taksonomi kesinleşmeli" ifadesi tarihsel R1 bulgusu olarak işaretlendi ve **"Bu gereksinim S00-R2'de ADR-009 ile karşılandı; S02 şema ve draft fixture üretimi için serbesttir."** notu eklendi | ✔     |

Discovery ölçümleri veya veri kayıtları yeniden üretilmedi.

---

## 1. Ölçülen başlangıç durumu

Hiçbir işlem yapılmadan önce kaydedildi:

- **Dosya ağacı:** 43 dosya (plan paketi 25 + discovery 16 + 2 teslim ZIP'i)
- **SHA-256:** 43 dosyanın tamamı hash'lendi
- **Git:** repo **yoktu** (`git rev-parse` → `.git` bulunamadı)
- **Ortam:** Node **v18.12.1**, npm 8.19.2, **pnpm kurulu değil**, git 2.51.2, sürüm yöneticisi (nvm/fnm/volta) yok
- **Kullanıcı değişikliği:** çakışma yok; plan paketi ve discovery dosyalarına dokunulmadı

---

## 2. Runtime ve paket yöneticisi

| Bileşen     | Sürüm                               | Nasıl                                                                                                                                                                                                    |
| ----------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Node.js** | **24.20.0** ("Krypton", 2026-08-26) | nodejs.org resmi win-x64 arşivi; **SHA-256 `SHASUMS256.txt` ile doğrulandı** (`6cac9ffb…545ba` eşleşti). Sistem Node 18'i değiştirilmedi; `C:\Users\ASUS\AppData\Local\nodejs24` altına yan yana kuruldu |
| **npm**     | 11.19.0                             | Node 24 ile gelen                                                                                                                                                                                        |
| **pnpm**    | **12.3.4**                          | Resmi yöntem: `corepack enable pnpm` + `corepack prepare pnpm@12.3.4 --activate`                                                                                                                         |

Sürüm pinleme üç yerde aynı major'ı gösteriyor:

- `.nvmrc` → `24.20.0`
- `package.json > engines.node` → `>=24.0.0 <25`
- `package.json > packageManager` → `pnpm@12.3.4`
- CI → `node-version-file: ".nvmrc"`

`pnpm-lock.yaml` (183.205 bayt) oluşturuldu ve commit edildi. Astro **proje bağımlılığıdır**, global kurulum yapılmadı.

---

## 3. Astro iskeleti

| Dosya                          | İçerik                                                                                               |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `src/layouts/BaseLayout.astro` | `lang="tr"`, viewport, title/description, canonical, skip link → `#main-content`, header/main/footer |
| `src/pages/index.astro`        | Yer tutucu ana sayfa, tek H1                                                                         |
| `src/pages/404.astro`          | 404 sayfası, kendi H1'i ve ana sayfa bağlantısı                                                      |
| `src/lib/seo/pageTitle.ts`     | Title üretimi — marka adı tekrarını ve 60 karakter aşımını yapısal olarak engeller                   |
| `src/styles/base.css`          | Asgari temel stil; skip link görünürlüğü ve `:focus-visible`                                         |

Gerçek Duosis tasarımı, nihai pazarlama metni, React/Vue/Svelte veya başka bir UI runtime **eklenmedi**.

**S00 bulgusunun koda yansıması:** `base.css` içinde marka cyanı `#16A6D9` link rengi olarak **kullanılmadı** — S00 ölçümü beyaz üzerinde 2.80:1 ile WCAG AA'yı geçmediğini gösterdi (C11). Geçici olarak koyulaştırılmış `#0b5f80` kullanıldı ve dosyaya gerekçe yazıldı; kanonik palet S03'te ADR-008 uyarınca türetilecek.

---

## 4. Kalite kapıları

Tek fail-closed giriş komutu:

```bash
pnpm quality
# = format:check && lint && typecheck && test && test:e2e && build
```

| Araç              | Sürüm          | Kapsam                                                          |
| ----------------- | -------------- | --------------------------------------------------------------- |
| Prettier          | 3.9.6          | `format:check`                                                  |
| ESLint            | 10.10.0        | TypeScript + Astro + jsx-a11y kuralları                         |
| astro check + tsc | 0.9.10 / 5.9.3 | `typecheck`, TypeScript **strict** + `noUncheckedIndexedAccess` |
| Vitest            | 5.0.0          | Unit                                                            |
| Playwright        | 1.63.0         | E2E, **gerçek Chromium**                                        |
| Astro             | 7.3.1          | `build`                                                         |

---

## 5. Test sonuçları (gerçek exit code'lar)

| Komut                            |  Exit | Sonuç                                                                           |
| -------------------------------- | ----: | ------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile` | **0** | Temiz `node_modules` ile başarılı                                               |
| `pnpm format:check`              | **0** | "All matched files use Prettier code style!"                                    |
| `pnpm lint`                      | **0** | 0 hata, 0 uyarı                                                                 |
| `pnpm typecheck`                 | **0** | `astro check`: 11 dosya, **0 error / 0 warning / 0 hint**; `tsc --noEmit` temiz |
| `pnpm test`                      | **0** | **7 passed** (1 dosya)                                                          |
| `pnpm test:e2e`                  | **0** | **15 passed** (25,1 s)                                                          |
| `pnpm build`                     | **0** | 2 sayfa derlendi                                                                |
| **`pnpm quality`**               | **0** | Zincirin tamamı                                                                 |
| `pnpm audit --prod`              | **0** | **No known vulnerabilities found**                                              |
| `pnpm audit` (tümü)              | **0** | **No known vulnerabilities found**                                              |

### Fail-closed kanıtı

`src/lib/__failclosed_probe.ts` içine bilinçli bir `eqeqeq` ihlali eklenip `pnpm quality` çalıştırıldı:

- **Exit code: 1**
- Zincir **lint adımında durdu**: `4:12 error Expected '===' and instead saw '==' eqeqeq`
- `typecheck`, `test`, `test:e2e`, `build` **hiç çalışmadı** (log'da 0 eşleşme)
- Geçici dosya silindi

Ham log: `evidence/logs/failclosed-proof.log`

### E2E testlerinin kapsamı (15 test)

**`chromium` projesi (10 test):** ana sayfa yükleniyor ve **tek H1** var · `lang="tr"` · title ve meta description dolu · viewport meta · **skip link**: ilk `Tab` odaklıyor, görünür oluyor, `Enter` `#main-content`'e gidiyor ve hedefi odaklıyor · **konsol/page error yok** · **axe WCAG 2.2 AA** ihlali yok (ana sayfa + 404) · bilinmeyen adres **404** dönüyor · 404 kendi başlığını ve ana sayfa bağlantısını gösteriyor.

**`chromium-nojs` projesi (5 test, `javaScriptEnabled: false`):** ana sayfa H1 ve gövde metni görünür · skip link ve `#main-content` DOM'da · iç bağlantılar çalışıyor · 404 içerik gösteriyor · **sayfa hiç `<script>` yüklemiyor**.

E2E testleri **üretim çıktısına** karşı koşar (Playwright `webServer` → `pnpm build && pnpm preview`), böylece dev sunucusunun HMR istemcisi konsolu ve DOM'u kirletmez.

---

## 6. CI

`.github/workflows/ci.yml` — temiz checkout → **pnpm önce** (`pnpm/action-setup@v4`, `packageManager` ile pinli) → Node (`actions/setup-node@v6`, `node-version-file: .nvmrc`) → sürüm doğrulama → `pnpm install --frozen-lockfile` → `pnpm exec playwright install --with-deps chromium` → **`pnpm quality`**.

**Lokal ve CI tamamen aynı script'i çalıştırır:** her ikisi de `pnpm quality`.

> **Uzak workflow ÇALIŞTIRILMADI.** Henüz GitHub'a push yapılmadığı için hiçbir CI koşusu gerçekleşmemiştir. Yapılan **yalnızca yerel doğrulamadır**: YAML yapısı ve zorunlu 10 alanın varlığı programatik olarak kontrol edildi (10/10 PASS, 67 satır). Workflow'un gerçek davranışı ilk push'ta doğrulanacaktır.

---

## 7. Güvenlik ve bağımlılık disiplini

- **Gerçek secret yok.** Yalnızca `.env.example`; `.env` dosyası mevcut değil ve `.gitignore` ile engelli.
- **Client bundle sızıntısı yok:** `dist/` içinde `secret|password|api_key|token|process.env|TURNSTILE|PUBLIC_SITE_URL` taraması → **eşleşme yok**.
- **Production audit:** `pnpm audit --prod` → **No known vulnerabilities found**. Gizlenen bulgu yok.
- **Kullanılmayan bağımlılık yok.** 15 paketin tamamının gerekçesi `docs/DEPENDENCY_POLICY.md` içinde tablolandı.
- **Eklenmeyenler:** UI framework, deployment adapter, analytics/consent, CMS, form/spam servisi, CSS framework, ikon/font paketi. `globals` paketi yerine ESLint yapılandırmasında yalnızca gerçekten kullanılan 3 global elle tanımlandı.

### Bağımlılıklar ve gerekçeleri

| Paket                    | Sürüm   | Gerekçe                                                |
| ------------------------ | ------- | ------------------------------------------------------ |
| `astro`                  | 7.3.1   | ADR-001'de seçilen framework (tek runtime bağımlılığı) |
| `typescript`             | 5.9.3   | Strict tip denetimi                                    |
| `@astrojs/check`         | 0.9.10  | `astro check` için zorunlu; `.astro` tip denetimi      |
| `eslint`                 | 10.10.0 | Lint kapısı                                            |
| `@eslint/js`             | 10.0.1  | ESLint önerilen kural seti                             |
| `typescript-eslint`      | 8.69.0  | TS lint kuralları                                      |
| `eslint-plugin-astro`    | 3.1.0   | `.astro` lint                                          |
| `astro-eslint-parser`    | 3.1.0   | Yukarıdakinin parser'ı                                 |
| `eslint-plugin-jsx-a11y` | 6.10.2  | `eslint-plugin-astro` peer'ı; a11y kuralları           |
| `eslint-config-prettier` | 10.1.8  | ESLint/Prettier çakışma önleme                         |
| `prettier`               | 3.9.6   | Biçim kapısı                                           |
| `prettier-plugin-astro`  | 0.14.1  | `.astro` biçimlendirme                                 |
| `vitest`                 | 5.0.0   | Unit koşucu                                            |
| `@playwright/test`       | 1.63.0  | Gerçek tarayıcı e2e                                    |
| `@axe-core/playwright`   | 4.13.0  | WCAG 2.2 AA smoke                                      |

---

## 8. Görsel ve davranış kanıtı

| Kanıt                  | Sonuç                                                                                                                                                                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Desktop screenshot** | `evidence/01-home-desktop-1440.png` (1440 px)                                                                                                                                                                                       |
| **Mobile screenshot**  | `evidence/03-home-mobile-390.png` (390 px)                                                                                                                                                                                          |
| **404 screenshot**     | `evidence/04-404-desktop-1440.png`                                                                                                                                                                                                  |
| **Klavye / skip link** | `evidence/02-skiplink-focused-1440.png` — ilk `Tab` `a.skip-link`'i odaklıyor (`href="#main-content"`, metin "Ana içeriğe geç"), görünür hale geliyor; `Enter` sonrası hash `#main-content`, odaklanan element id'si `main-content` |
| **Reduced motion**     | **N/A** — S01 iskeletinde hiçbir animasyon, geçiş veya `@keyframes` yok. `prefers-reduced-motion` kuralı gerektirecek hareket üretilmediği için bu sprintte uygulanabilir değil. Motion sözleşmesi S06'dan itibaren geçerli olacak  |
| **JavaScript kapalı**  | `evidence/05-home-nojs-1440.png` — sayfada **0 `<script>` etiketi**, `#main-content` içinde 411 karakter okunabilir metin, bağlantılar çalışıyor                                                                                    |
| **Console/network**    | **0 console error, 0 page error**                                                                                                                                                                                                   |

---

## 9. Performans / bundle etkisi

Ana sayfa, üretim çıktısı, gerçek tarayıcı ölçümü:

| Kalem                   |                                              Değer |
| ----------------------- | -------------------------------------------------: |
| Toplam istek            |                                              **1** |
| HTML                    |                                     **2.202 bayt** |
| CSS dosyası             |                             0 (stil HTML'e gömülü) |
| **JS dosyası**          |                                              **0** |
| **Başlangıç client JS** |                                         **0 bayt** |
| `dist/` toplam          | 4.007 bayt (`index.html` 2.202 + `404.html` 1.805) |

| Bütçe (`02_TECHNICAL_ARCHITECTURE.md` §3) |         Sınır |  Ölçülen | Durum    |
| ----------------------------------------- | ------------: | -------: | -------- |
| Homepage first-party başlangıç JS         | ≤ 180 KB gzip | **0 KB** | **PASS** |
| İçerik/detay sayfası başlangıç JS         |  ≤ 90 KB gzip | **0 KB** | **PASS** |

Karşılaştırma: mevcut WordPress sitesi ana sayfası **~7,17 MB / ~102 istek** (S00 baseline). Yeni iskelet **2,2 KB / 1 istek**. Bu bir iskelet ölçümüdür; gerçek içerik ve tasarım eklendikçe artacaktır.

---

## 10. Kabul kriterleri

| Kriter                                                               | Durum    | Kanıt                                                                  |
| -------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| Temiz ortamda `pnpm install --frozen-lockfile` başarılı              | **PASS** | `node_modules` silinip yeniden kuruldu, exit 0                         |
| `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` başarılı    | **PASS** | Dördü de exit 0 (§5)                                                   |
| `pnpm quality` hepsini fail-closed çalıştırıyor                      | **PASS** | Başarılı zincir exit 0; bilinçli hatada exit 1 ve zincir lint'te durdu |
| En az bir unit ve bir smoke e2e testi gerçekten çalışıyor            | **PASS** | 7 unit + 15 e2e, gerçek Chromium                                       |
| Client bundle'da secret veya gereksiz runtime yok                    | **PASS** | `dist/` secret taraması temiz; 0 script etiketi, 0 bayt JS             |
| Ana sayfa JavaScript kapalıyken temel placeholder içeriği gösteriyor | **PASS** | 5 ayrı nojs testi + ekran görüntüsü                                    |
| CI ile lokal komutlar aynı scriptleri kullanıyor                     | **PASS** | Her ikisi de `pnpm quality`; workflow yerel doğrulaması 10/10          |
| Yerel commit var; push/merge/deployment yok                          | **PASS** | 2 commit; `git status` temiz; hiçbir uzak işlem yapılmadı              |

---

## 11. Karşılaşılan sorunlar ve çözümleri

Bunlar gizlenmemesi gereken gerçek engellerdi:

1. **pnpm 12 tedarik zinciri politikası** (`minimumReleaseAge`) `typescript-eslint@8.70.0`'ı reddetti (yayınlanalı ~1 gün olmuştu). **Politika gevşetilmedi**; politikaya uyan `8.69.0`'a sabitlendi ve transitif `@typescript-eslint/*` paketleri `overrides` ile aynı hizaya çekildi. Gerekçe `pnpm-workspace.yaml` içinde.

2. **`cookie` paketi çözümleme hatası → build kırılıyordu.** Astro prerender bundle'ında `cookie`'yi harici bırakıyor. pnpm'in izole yerleşiminde `cookie` kök `node_modules`'ta bulunmadığı için Node çözümlemesi proje dizininin üstüne çıkıp **`C:\Users\ASUS\node_modules` içindeki 2024 tarihli CommonJS `cookie@0.x` kopyasını** yakalıyordu → `parseCookie is not exported`. Bu bir Astro hatası değil, makinedeki eski bir `node_modules` klasörünün yan etkisiydi (Astro 7.2.10 ve 7.3.1'de aynı şekilde tekrarlandı). **Kullanıcının klasörüne dokunulmadı**; çözüm proje içinde tutuldu: `publicHoistPattern: [cookie]` ile doğru sürüm kök `node_modules`'a yükseltildi. Gerekçe `pnpm-workspace.yaml` içinde yazılı.

3. **TypeScript 7.0.2 kullanılamadı** — `typescript-eslint` peer aralığı `>=4.8.4 <6.1.0`. Uyumlu en güncel sürüm olan 5.9.3 seçildi.

4. **`eslint-plugin-jsx-a11y@6.10.2` ESLint 10'u peer olarak desteklemiyor** (`^3 … ^9` istiyor). Uyarı `eslint-plugin-astro`'nun bu paketi peer listelemesinden geliyor. `pnpm lint` sorunsuz çalışıyor ve a11y kuralları uygulanıyor; yukarı akış desteği çıkınca yükseltilecek. `docs/DEPENDENCY_POLICY.md` içinde kayıtlı.

5. **pnpm 12 build script'lerini engelliyor** — `esbuild` postinstall'ı gerekli. Genel bir kaçış yerine yalnızca bu paket için `allowBuilds` izni verildi.

---

## 12. Teslim paketleri

| Paket                          |      Dosya sayısı |        Boyut | SHA-256                                                            |
| ------------------------------ | ----------------: | -----------: | ------------------------------------------------------------------ |
| `duosis-web-S01-review.bundle` | 3 ref, tam geçmiş | 181.311 bayt | `cbc2c063975d0d41e20d6e8825c3cb8e58658ea5b4937d2a8dab35e064e8558d` |
| `duosis-web-S01-evidence.zip`  |                11 | 129.370 bayt | `e5eb3f92487ffb4f53d1aea7337d1b8aeef8598f46e0def6f3f6847cadacb8e3` |

### Bundle doğrulaması

```
$ git bundle verify duosis-web-S01-review.bundle
The bundle contains these 3 refs:
0342d740... refs/heads/duosis-web/s01-repository-quality-gates
900d10f5... refs/heads/main
0342d740... HEAD
The bundle records a complete history.
duosis-web-S01-review.bundle is okay
```

Exit code **0**.

Her iki pakette de secret, `.env`, `node_modules` veya tarayıcı ikilisi **yok** (programatik olarak kontrol edildi).

---

## 13. `git diff --stat` (baseline → final)

```
24 files changed, 992 insertions(+)
```

Öne çıkanlar: `package.json` (45), `pnpm-lock.yaml` (183 KB binary), `README.md` (114), `docs/DEPENDENCY_POLICY.md` (73), `.github/workflows/ci.yml` (66), `tests/e2e/smoke.spec.ts` (110), `src/styles/base.css` (96), `src/lib/seo/pageTitle.ts` (56).

---

## 14. Bilinen açıklar ve riskler

1. **CI hiç çalışmadı** — workflow yalnızca yerel olarak doğrulandı. İlk push'ta Ubuntu + Node 24 + Playwright kombinasyonunda sürpriz çıkabilir.
2. **`cookie` hoist geçici bir çözümdür.** Kök neden makinedeki eski `C:\Users\ASUS\node_modules` klasörüdür. Temiz bir CI ortamında bu sorun oluşmaz; hoist zararsızdır ama gereksiz hale gelebilir.
3. **`eslint-plugin-jsx-a11y` peer uyumsuzluğu** yukarı akış çözümü bekliyor.
4. **Node 24 sisteme kalıcı kurulmadı** — `C:\Users\ASUS\AppData\Local\nodejs24` altında duruyor ve `PATH`'e elle ekleniyor. Yeni bir kabukta `pnpm` komutları sistem Node 18'i kullanır. Kalıcı çözüm için nvm-windows veya sisteme Node 24 kurulumu önerilir.
5. **S00'dan devam eden blokajlar değişmedi:** CyclOps ürün kanıtı (S08), müşteri logo izinleri (S10), deployment hedefi (ADR-003, S12/S14).

---

## 15. Sonraki sprint önerisi

**S02 — Content Model & i18n.** ADR-009 taksonomiyi `PROVISIONAL` olarak serbest bıraktığı için S02 bloklanmıyor: `Solution`, `Technology`, `Milestone`, `Proof`, `Insight` şemaları ve TR/EN rota altyapısı kurulabilir.

S02'ye girerken dikkat edilecekler:

- Çözüm başlıkları **içerik verisinden** gelmeli, koda gömülmemeli (ADR-009 kuralı).
- `verificationStatus` ve `logoPermission` alanları, `content-truth-matrix.csv`'deki `pending` / `source-present-owner-unverified` kayıtların kamuya açık build'e sızmasını **şema seviyesinde** engellemeli.
- CyclOps altıncı çözümde yalnızca `draft`/`pending` veri olarak bulunabilir.

> Bu yalnızca öneridir. Codex onayı gelmeden S02'ye geçilmeyecektir.
