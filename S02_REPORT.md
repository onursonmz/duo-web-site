# DUOSIS Web — Sprint S02 Teslim Raporu

## Durum

- **Sprint:** S02 — Content Model & i18n
- **Sonuç:** **COMPLETE** — 8 kabul kriterinin 8'i PASS
- **Base HEAD:** `0342d7402342a5cd3c80d04cb67b8388eb316ca4`
- **Final HEAD:** `d7061a7756faa164a47d31f02e672bb2f5172d2a`
- **Branch:** `duosis-web/s02-content-model-i18n`
- **Push / merge / rebase / PR / tag / deployment:** **YAPILMADI**
- **`git status --short`:** boş (çalışma ağacı temiz)

### Commit geçmişi

```
d7061a7 feat(web): S02 content model, fixtures and TR/EN routing
af25f0c docs(web): S01 teslim raporunu kayda al
0342d74 chore(web): S01 establish repository and quality gates
900d10f chore(web): establish project baseline
```

`git diff --stat 0342d74..HEAD` → **56 dosya değişti, 3291 ekleme, 57 silme**

---

## 0. Takip maddeleri

### 1. Lockfile inceleme görünürlüğü — ✔

`.gitattributes` satırı `pnpm-lock.yaml -diff linguist-generated=true` → **`pnpm-lock.yaml linguist-generated=true`**

```
$ git check-attr -a -- pnpm-lock.yaml
pnpm-lock.yaml: text: auto
pnpm-lock.yaml: eol: lf
pnpm-lock.yaml: linguist-generated: true
```

`diff: unset` **yok** — lockfile metin olarak diff edilebilir. **Lockfile içeriği yeniden üretilmedi** (`git diff 0342d74..HEAD -- pnpm-lock.yaml` boş).

### 2. Peer dependency istisnası fail-closed — ✔

`pnpm-workspace.yaml`:

```yaml
strictPeerDependencies: true

peerDependencyRules:
  allowedVersions:
    "eslint-plugin-jsx-a11y@6.10.2>eslint": "10.10.0"
```

- Genel `eslint` allowlist'i veya `allowAny` **kullanılmadı**.
- `publicHoistPattern` yalnızca `cookie` — genişletilmedi.
- `pnpm peers check` → **"No peer dependency issues found"** (exit 0).
- Geçicilik `docs/DEPENDENCY_POLICY.md` içinde yazılı: upstream ESLint 10 desteği çıkınca istisna kaldırılıp paket yükseltilecek.

### 3. Temiz kurulum kanıtı — ✔

`node_modules` tamamen silindikten sonra `pnpm install --frozen-lockfile` → **exit 0**.
Tam çıktı: `evidence/logs/install-frozen.log`. `node_modules` teslim paketine **girmedi**.

---

## 1. İçerik modeli

Şemalar **tek yerde** (`src/lib/content/schemas.ts`); `src/content.config.ts` yalnızca loader'ları bağlar. Testler kopya değil **aynı şema nesnelerini** doğrular.

| Koleksiyon     | Kayıt | Not                       |
| -------------- | ----: | ------------------------- |
| `solutions`    |    10 | 8 TR + 2 EN               |
| `technologies` |    17 | **Tek JSON veri kaynağı** |
| `services`     |     5 | TR                        |
| `milestones`   |     2 | TR                        |
| `proofs`       |     2 | TR                        |
| `authors`      |     1 | —                         |
| `insights`     |     1 | TR, `draft`               |

**Ortak SEO şeması** (`seoSchema`) tüm yerelleştirilebilir kayıtlarda; `.strict()` ve title ≤ 70 / description ≤ 200 sınırı.

### Kapalı enumlar

| Enum                 | Değerler                                      |
| -------------------- | --------------------------------------------- |
| `status`             | `draft` · `review` · `published` · `archived` |
| `verificationStatus` | `pending` · `verified` · `rejected`           |
| `logoPermission`     | `unknown` · `allowed` · `denied`              |
| `locale`             | `tr` · `en`                                   |

Ek kısıtlar: `slug` ve `translationKey` **ASCII kebab-case** zorunlu (Türkçe başlık serbest), `order` 1–8 (ADR-009).

### Build/test aşamasında reddedilenler

| Kural                               | Nerede                            | Sonuç         |
| ----------------------------------- | --------------------------------- | ------------- |
| Şema dışı alan                      | Tüm şemalar `.strict()`           | Build kırılır |
| Geçersiz enum                       | Zod enum                          | Build kırılır |
| Türkçe karakterli slug              | `slugSchema` regex                | Build kırılır |
| Yinelenen `translationKey + locale` | `assertUniqueTranslations`        | Build kırılır |
| Yinelenen `slug + locale`           | `assertUniqueTranslations`        | Build kırılır |
| Bozuk içerik referansı              | `assertSolutionReferencesResolve` | Build kırılır |

> **Bulgu:** Astro'nun kendi `reference()` doğrulaması bozuk referansı yalnızca **ERROR olarak loglar**, içerik senkronizasyonunu durdurmaz — `astro sync` exit 0 döner. Sessizce kırık bağla devam edilmesini istemediğimiz için kendi referans bütünlüğü denetimimizi ekledik; artık bozuk referans **build'i kırıyor** (entegrasyon testiyle kanıtlandı).

---

## 2. Fixture'lar

**ADR-009'daki sekiz çözüm** için TR kaydı, ikisi için EN karşılığı:

|   # | translationKey                       | TR slug                            | EN slug                   |
| --: | ------------------------------------ | ---------------------------------- | ------------------------- |
|   1 | `observability-apm`                  | `operasyonel-gorunurluk`           | `observability-and-apm`   |
|   2 | `configuration-asset-management`     | `konfigurasyon-ve-varlik-yonetimi` | —                         |
|   3 | `it-service-management`              | `bt-hizmet-yonetimi`               | —                         |
|   4 | `data-streaming-integration`         | `veri-akisi-ve-entegrasyon`        | —                         |
|   5 | `governance-enterprise-architecture` | `kurumsal-mimari-ve-yonetisim`     | `enterprise-architecture` |
|   6 | `aiops-event-lifecycle`              | `aiops-ve-olay-yasam-dongusu`      | —                         |
|   7 | `automation`                         | `otomasyon`                        | —                         |
|   8 | `engineering-product-development`    | `muhendislik-ve-urun-gelistirme`   | —                         |

İlk çift dilli rota **Observability & APM**. TR ve EN metinleri **ayrı ayrı yazıldı**, kelime kelime çeviri değil.

**Metin disiplini:** Her sayfada görünür `TASLAK / DRAFT` rozeti ve "doğrulanmış iddia içermez" notu. Fixture'larda müşteri adı, metrik, bölgesel kapsam veya ürün yeteneği iddiası **yok**.

### Doğrulama bekleyen kayıtların davranışı

| Kayıt                     | Durum                                 | Public build                                                          |
| ------------------------- | ------------------------------------- | --------------------------------------------------------------------- |
| **CyclOps** (teknoloji)   | `active: false`                       | **Görünmüyor** — AIOps çözümü "teknoloji kaydı bulunmuyor" gösteriyor |
| Kuruluş 2016 (milestone)  | `verificationStatus: pending`         | Görünmüyor                                                            |
| Anonim referans (proof)   | `pending` + `logoPermission: unknown` | Görünmüyor                                                            |
| İçgörü yazısı             | `status: draft`                       | Görünmüyor                                                            |
| SolarWinds, runZero, KACE | `active: false`                       | Görünmüyor                                                            |

**Teknoloji filtreleme kod değişikliği gerektirmez:** `technologies.json` içindeki `active` alanı `false` yapıldığında kayıt public listeden düşer.

---

## 3. i18n

| Konu             | Uygulama                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------- |
| TR               | **Prefixsiz** — `/`, `/cozumler/`, `/cozumler/<slug>/`                                        |
| EN               | **`/en/` altında** — `/en/`, `/en/solutions/`, `/en/solutions/<slug>/`                        |
| Locale algılama  | `localeFromPath()` — **yalnızca URL'in ilk segmenti**; çerez, Accept-Language veya tahmin yok |
| Determinizm      | Aynı girdi her zaman aynı sonuç (unit testle doğrulandı)                                      |
| Dil değiştirici  | Aynı `translationKey` karşılığına gider                                                       |
| Eksik çeviri     | **Link üretilmez**; erişilebilir "bu dilde henüz yayınlanmadı" bilgisi gösterilir             |
| Arayüz metinleri | Nav, CTA ve sistem mesajları **locale dictionary'den**; eksik anahtar hata fırlatır           |

**Sessiz fallback yok:** `t()` bilinmeyen anahtarda başka dile düşmez, `Error` fırlatır. `LanguageSwitcher` karşılığı olmayan dil için `<a>` üretmez.

---

## 4. Merkezi seçici katmanı

`src/lib/content/selectors.ts` — public ve preview filtreleri **tek katmandan**. Üretim sayfalarının tamamı `PUBLIC` sabitini **açıkça** geçirir:

```
src/pages/index.astro                 getSolutions(locale, PUBLIC)
src/pages/cozumler/index.astro        getSolutions("tr", PUBLIC)
src/pages/cozumler/[slug].astro       getSolutions("tr", PUBLIC) + getSolutionAlternates(..., PUBLIC)
src/pages/en/index.astro              getSolutions("en", PUBLIC)
src/pages/en/solutions/index.astro    getSolutions("en", PUBLIC)
src/pages/en/solutions/[slug].astro   getSolutions("en", PUBLIC) + getSolutionAlternates(..., PUBLIC)
```

| Yüklem               | Public                  | Preview                                         |
| -------------------- | ----------------------- | ----------------------------------------------- |
| `isPublishedStatus`  | yalnızca `published`    | `archived` hariç                                |
| `isVerifiedClaim`    | yalnızca `verified`     | `rejected` hariç                                |
| `canShowLogo`        | yalnızca `allowed`      | **yalnızca `allowed`** (preview'da da gevşemez) |
| `isActiveTechnology` | yalnızca `active: true` | hepsi                                           |

---

## 5. Zorunlu negatif testler

|   # | Test                                             | Nerede                                                  | Sonuç    |
| --: | ------------------------------------------------ | ------------------------------------------------------- | -------- |
|   1 | Geçersiz frontmatter/enum reddediliyor           | `schema.test.ts` + `content-validation.test.ts`         | **PASS** |
|   2 | Duplicate `translationKey + locale` reddediliyor | `selectors.test.ts`                                     | **PASS** |
|   3 | Duplicate locale slug reddediliyor               | `selectors.test.ts`                                     | **PASS** |
|   4 | Bozuk içerik referansı reddediliyor              | `content-validation.test.ts` (**gerçek `astro build`**) | **PASS** |
|   5 | Pending claim public seçicide görünmüyor         | `selectors.test.ts` + e2e                               | **PASS** |
|   6 | `logoPermission !== allowed` logo göstermiyor    | `selectors.test.ts` + e2e                               | **PASS** |
|   7 | `active: false` teknoloji public listede yok     | `selectors.test.ts` + e2e                               | **PASS** |
|   8 | Eksik çeviri sessiz fallback üretmiyor           | `i18n.test.ts` + e2e                                    | **PASS** |

Ek: şema dışı alan (`.strict()`) ve **Türkçe başlık / ASCII slug ayrımı** testleri de mevcut.

---

## 6. Test sonuçları (gerçek exit code'lar)

| Komut                            |  Exit | Sonuç                                            |
| -------------------------------- | ----: | ------------------------------------------------ |
| `pnpm install --frozen-lockfile` | **0** | Silinmiş `node_modules` üzerinde başarılı        |
| `pnpm format:check`              | **0** | "All matched files use Prettier code style!"     |
| `pnpm lint`                      | **0** | 0 hata, 0 uyarı                                  |
| `pnpm typecheck`                 | **0** | `astro check`: **32 dosya, 0 error / 0 warning** |
| `pnpm test`                      | **0** | **69 passed** (5 dosya)                          |
| `pnpm test:e2e`                  | **0** | **42 passed** (gerçek Chromium)                  |
| `pnpm build`                     | **0** | **15 sayfa**                                     |
| **`pnpm quality`**               | **0** | Zincirin tamamı                                  |
| `pnpm audit --prod`              | **0** | **No known vulnerabilities found**               |
| `pnpm audit` (tümü)              | **0** | **No known vulnerabilities found**               |
| `pnpm peers check`               | **0** | "No peer dependency issues found"                |
| `git bundle verify`              | **0** | "bundle is okay"                                 |

Unit test dağılımı: `schema` 24 · `i18n` 18 · `selectors` 15 · `pageTitle` 7 · `content-validation` 5.

---

## 7. Tarayıcı kanıtı

| İstenen                         | Kanıt                                      | Sonuç                                                                                                           |
| ------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `/` → Türkçe, `lang="tr"`       | `01-home-tr-1440.png`                      | **lang=tr**                                                                                                     |
| `/en/` → İngilizce, `lang="en"` | `02-home-en-1440.png`                      | **lang=en**                                                                                                     |
| TR solution route               | `03-solution-tr-1440.png`                  | `/cozumler/operasyonel-gorunurluk/`                                                                             |
| Aynı kaydın EN route'u          | `04-solution-en-1440.png`                  | `/en/solutions/observability-and-apm/`                                                                          |
| Karşılıklı dil değiştirici      | `evidence.json > languageSwitcher`         | TR→EN → `/en/solutions/observability-and-apm/` (lang=en); EN→TR → `/cozumler/operasyonel-gorunurluk/` (lang=tr) |
| Eksik çeviri davranışı          | `05-missing-translation-1440.png`          | EN link **0**, "mevcut değil" **1**, içinde `<a>` **0**, metin: _"English — bu dilde henüz yayınlanmadı"_       |
| 1440 px                         | 6 görüntü                                  | ✔                                                                                                               |
| ~390 px                         | `06`, `07`, `08`                           | ✔                                                                                                               |
| Console error                   | 8 rota tarandı                             | **YOK**                                                                                                         |
| Kırık iç link                   | 14 iç bağlantı                             | **YOK**                                                                                                         |
| JavaScript kapalı               | `09-solution-nojs-1440.png` + 7 nojs testi | Tam içerik okunabilir, **0 `<script>`**                                                                         |
| Public filtre                   | `10-aiops-filtered-1440.png`               | CyclOps HTML'de **yok**, "teknoloji kaydı bulunmuyor" gösteriliyor                                              |

**Reduced motion: N/A.** S02'de hiçbir animasyon, geçiş veya `@keyframes` eklenmedi; `prefers-reduced-motion` kuralı gerektirecek hareket üretilmedi. Motion sözleşmesi S06'dan itibaren geçerli olacak.

---

## 8. Bundle / bütçe etkisi

Çözüm detay sayfası (`/cozumler/operasyonel-gorunurluk/`), üretim çıktısı, gerçek tarayıcı ölçümü:

| Kalem                   | S01 (ana sayfa) | S02 (çözüm detayı) |
| ----------------------- | --------------: | -----------------: |
| Toplam istek            |               1 |              **1** |
| HTML                    |         2.202 B |        **5.332 B** |
| JS dosyası              |               0 |              **0** |
| **Başlangıç client JS** |         **0 B** |            **0 B** |
| CSS dosyası             |      0 (gömülü) |         0 (gömülü) |

| Bütçe (`02_TECHNICAL_ARCHITECTURE.md` §3) |         Sınır |  Ölçülen | Durum    |
| ----------------------------------------- | ------------: | -------: | -------- |
| İçerik/detay sayfası başlangıç JS         |  ≤ 90 KB gzip | **0 KB** | **PASS** |
| Homepage başlangıç JS                     | ≤ 180 KB gzip | **0 KB** | **PASS** |

**İçerik modeli nedeniyle client JavaScript eklenmedi** — beklendiği gibi. Çıktı hâlâ **0 script etiketi**. Dil değiştirici düz `<a>` bağlantısıdır; JavaScript gerektirmez (nojs testiyle doğrulandı). HTML artışı gerçek içerikten (çözüm metinleri, teknoloji listesi) kaynaklanıyor.

---

## 9. Kabul kriterleri

| Kriter                                                    | Durum    | Kanıt                                                                    |
| --------------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| Geçersiz frontmatter build'i kırıyor                      | **PASS** | `content-validation.test.ts` — gerçek `astro sync`/`build` ile 4 senaryo |
| `/` Türkçe, `/en/` İngilizce, doğru `lang`                | **PASS** | e2e + ekran görüntüleri                                                  |
| Dil değiştirici aynı `translationKey` karşılığına gidiyor | **PASS** | 3 e2e testi + gidiş-dönüş ölçümü                                         |
| Eksik çeviri yanlış dilde sessiz fallback göstermiyor     | **PASS** | 3 e2e testi + `t()` hata fırlatma testi                                  |
| Pending claim ve izinsiz logo public build'de görünmüyor  | **PASS** | Seçici testleri + e2e (`#main-content img` = 0)                          |
| Pasif teknoloji public listeden çıkıyor; kod değişmiyor   | **PASS** | CyclOps `active:false` → HTML'de yok                                     |
| En az bir solution route TR ve EN fixture'dan üretiliyor  | **PASS** | 8 TR + 2 EN rota, 15 sayfa                                               |
| Tüm test/build komutları başarılı                         | **PASS** | `pnpm quality` exit 0                                                    |

---

## 10. Karşılaşılan sorunlar

1. **Astro `reference()` bozuk referansı yalnızca logluyor**, senkronizasyonu durdurmuyor. Kendi `assertSolutionReferencesResolve` denetimimiz eklendi; artık build kırılıyor.

2. **Astro'nun varsayılan kayıt kimliği slugify ediliyor** ve `tr/observability` gibi yol tabanlı referanslarla eşleşmiyordu. `generateId: pathId` ile deterministik kimlik tanımlandı.

3. **Playwright bayat build'e karşı koştu.** S01'den kalan bir `astro preview` daemon'u (pid 13120) hâlâ 4321'i dinliyordu; `reuseExistingServer: true` olduğu için Playwright onu yeniden kullandı ve testler eski çıktıyı gördü — bir kırık link **yanlışlıkla** raporlandı. Üç adımda kalıcı olarak çözüldü:
   - `reuseExistingServer: false`
   - Astro 7'nin preview komutu TTY yokken kendini arka plana alıp kilit dosyası tuttuğu ve Playwright ön planda süreç beklediği için, `astro preview` yerine **küçük bir statik sunucu** yazıldı (`tests/support/preview-server.mjs`). Astro'nun üretim davranışını taklit eder (`trailingSlash: always`, 404 → `dist/404.html` **HTTP 404** ile) ve yeni bağımlılık gerektirmez.

4. **Gerçek kırık link bulundu:** fixture CTA'ları `/iletisim/` ve `/en/contact/` adreslerine işaret ediyordu; iletişim sayfası **S12 kapsamında** olduğu için bu rotalar yok. CTA'lar mevcut rotalara (`/cozumler/`, `/en/solutions/`) yönlendirildi. Gerçek iletişim CTA'sı S12'de bağlanacak.

5. **Dil değiştiricide yön hatası:** TR sayfada "Bu sayfa henüz Türkçe değil" yazıyordu — anlamsız. Ayrı bir sözlük anahtarı (`translation.notAvailableInTarget`) eklendi: _"bu dilde henüz yayınlanmadı"_ / _"not published in this language yet"_.

6. **TypeScript:** `z.infer<>` namespace olarak çözülmüyordu (`z` değer olarak import ediliyor) → tip `ReturnType<typeof seoSchema.parse>` ile türetildi. Ayrıca deprecated `z.string().url()` yerine `z.url()` kullanıldı.

---

## 11. Teslim paketleri

| Paket                          | İçerik            |     Boyut | SHA-256                                                            |
| ------------------------------ | ----------------- | --------: | ------------------------------------------------------------------ |
| `duosis-web-S02-review.bundle` | 4 ref, tam geçmiş | 232.525 B | `5f7550d7aa23bb380a55d7a001f557abccfb00bc679b359c5422a482ee96df61` |
| `duosis-web-S02-evidence.zip`  | 16 dosya          | 551.729 B | `268d8b17a743c6b6dde36a6604d3d62352756e7742a1448a78686c229d575f7e` |

```
$ git bundle verify duosis-web-S02-review.bundle
The bundle contains these 4 refs:
0342d740... refs/heads/duosis-web/s01-repository-quality-gates
d7061a77... refs/heads/duosis-web/s02-content-model-i18n
900d10f5... refs/heads/main
d7061a77... HEAD
The bundle records a complete history.
duosis-web-S02-review.bundle is okay
```

Her iki pakette de secret, `.env`, `node_modules` veya tarayıcı ikilisi **yok** (programatik kontrol edildi). `dist/` secret taraması temiz.

---

## 12. Kapsam dışı bırakılanlar

Talimat gereği eklenmedi: görsel tasarım, nihai pazarlama metni, tam navigasyon shell'i, analytics, form, deployment adapter. Ayrıca içeriğin tamamının İngilizce çevirisi yapılmadı (2 çözüm ile sınırlı).

---

## 13. Bilinen açıklar ve riskler

1. **Fixture metinleri taslaktır.** Sekiz çözümün başlık ve kapsamları ADR-009'da `PROVISIONAL`; nihai kamuya açık isimler iş sahibi doğrulaması bekliyor. Başlıklar içerik verisinden geldiği için değişiklik kod değişikliği gerektirmez.
2. **EN kapsamı sınırlı** — 8 çözümün yalnızca 2'sinin EN karşılığı var. Kalanların çeviri kaynağı ve onaylayıcısı belirlenmeli.
3. **`/iletisim/` rotası yok** (S12). CTA'lar geçici olarak çözüm sayfalarına yönlendiriliyor.
4. **CI hâlâ hiç çalışmadı** — push yapılmadığı için workflow yalnızca yerel olarak doğrulanmış durumda.
5. **`cookie` hoist ve jsx-a11y peer istisnası** S01'den devam ediyor; ikisi de belgelenmiş ve dar kapsamlı.
6. S00'dan devam eden blokajlar değişmedi: CyclOps ürün kanıtı (S08), müşteri logo izinleri (S10), deployment hedefi (ADR-003).

---

## 14. Sonraki sprint önerisi

**S03 — Command Atlas Design System.** Girerken dikkat edilecekler:

- **ADR-008 / C11 bağlayıcı kısıt:** marka cyanı `#16A6D9` beyaz üzerinde **2.80:1** — AA'yı büyük metinde bile geçmiyor. Paper yüzeyler için koyulaştırılmış varyant **türetilmeli**. `base.css` içindeki geçici `#0b5f80` bu kararla değiştirilmeli.
- Logodaki çift değerler (`#16A6D9`/`#16A6DE`, `#252A2E`/`#242A2F`) tekilleştirilmeli.
- Mevcut `src/styles/base.css` asgari bir iskelettir; tasarım tokenları onun yerini alacak.
- Radius `0–6px`, en fazla iki font ailesi, glassmorphism ve kart yığını yok.

> Bu yalnızca öneridir. Codex onayı gelmeden S03'e geçilmeyecektir.
