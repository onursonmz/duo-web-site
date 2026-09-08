# Duosis Web

Duosis kurumsal web sitesinin yeniden inşası. Astro + TypeScript (strict), statik çıktı.

Bu depo sprint temellidir. Her sprint tek başına incelenebilir bir artım üretir; sözleşmeler
[`duosis_web_sitesi_planlamasi/`](duosis_web_sitesi_planlamasi/), S00 keşif çıktıları ise
[`discovery/`](discovery/) altındadır.

**Mevcut durum:** S02 — içerik modeli ve TR/EN yönlendirme. Gerçek tasarım (S03) ve nihai
pazarlama metinleri henüz üretilmedi; `src/content/` altındaki kayıtlar **taslak fixture**'dır.

---

## Gereksinimler

| Araç    | Sürüm                         | Neden                                                        |
| ------- | ----------------------------- | ------------------------------------------------------------ |
| Node.js | **24.20.0** (`.nvmrc`)        | Astro 7 `>=22.12` istiyor; 24 aktif LTS ("Krypton")          |
| pnpm    | **12.3.4** (`packageManager`) | Sözleşme gereği tek paket yöneticisi; lockfile commit edilir |

pnpm'i ayrıca kurmanıza gerek yok — Node ile gelen Corepack `packageManager` alanındaki
sürümü otomatik kullanır:

```bash
corepack enable pnpm
```

## Kurulum

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
```

## Günlük komutlar

```bash
pnpm dev        # geliştirme sunucusu (http://localhost:4321)
pnpm build      # üretim derlemesi -> dist/
pnpm preview    # derlenmiş çıktıyı yerel olarak sun
```

## Kalite kapıları

Tek doğru giriş noktası. CI ile **birebir aynı** komut çalışır:

```bash
pnpm quality
```

Sırayla ve **fail-closed** çalışır — herhangi biri hata verirse zincir durur ve sıfırdan farklı
exit code döner:

| Komut               | Ne yapar                               |
| ------------------- | -------------------------------------- |
| `pnpm format:check` | Prettier biçim denetimi                |
| `pnpm lint`         | ESLint (TypeScript + Astro + jsx-a11y) |
| `pnpm typecheck`    | `astro check` + `tsc --noEmit`         |
| `pnpm test`         | Vitest unit testleri                   |
| `pnpm test:e2e`     | Playwright (gerçek Chromium)           |
| `pnpm build`        | Üretim derlemesi                       |

Tek tek de çalıştırılabilirler. Ek olarak:

```bash
pnpm test:a11y    # yalnızca axe erişilebilirlik testleri (@a11y etiketli)
pnpm test:watch   # unit testleri izleme modunda
pnpm format       # biçimi düzelt (kontrol etmek yerine)
```

### Testler ne doğruluyor

- **Unit** (`tests/unit/`) — `buildPageTitle` yardımcısı: marka adının tekrarlanmaması ve
  title uzunluk sınırı.
- **E2E** (`tests/e2e/smoke.spec.ts`) — ana sayfa yükleniyor, tek H1, `lang="tr"`, viewport,
  title/description dolu, skip link klavyeyle `#main-content`'e gidiyor, konsol hatası yok,
  axe (WCAG 2.2 AA) ihlali yok, 404 gerçekten 404 dönüyor.
- **JavaScript kapalı** (`tests/e2e/no-javascript.nojs.spec.ts`) — ayrı bir Playwright
  projesinde `javaScriptEnabled: false` ile koşar; temel içerik, bağlantılar ve skip link
  erişilebilir kalmalı, sayfa hiç `<script>` yüklememeli.

E2E testleri **üretim çıktısına** karşı koşar: `pnpm build` sonrası
`tests/support/preview-server.mjs` ayağa kalkar.

**Her çalıştırma dinamik ve boş bir port kullanır.** `tests/support/run-e2e.mjs` portu
tek yerde seçip `E2E_PORT` ile hem `baseURL`'e hem web server komutuna aktarır; tüm
worker'lar aynı değeri devralır. Sunucu bind edemezse testler **hiç başlamaz** ve komut
sıfırdan farklı exit code döner. Sabit porttaki yabancı süreçlere dokunulmaz.

## Proje yapısı

```text
src/
  content.config.ts          # koleksiyon tanımları (şemalar @lib/content/schemas'tan)
  content/
    solutions/tr|en/         # 8 TR + 2 EN çözüm fixture'ı
    technologies/technologies.json  # TEK veri kaynağı — S00'daki 35 kaydın tamamı
    technologies/MAPPING.json       # S00 -> S02 dönüşümünün makinece okunabilir kaydı
    services|milestones|proofs|insights|authors/
  lib/
    content/schema.ts        # ortak enumlar, slug/translationKey, SEO
    content/schemas.ts       # koleksiyon şemaları (testler bunları doğrular)
    content/selectors.ts     # MERKEZİ public/preview filtre katmanı
    content/graph.ts         # TÜM referans alanlarını doğrulayan içerik grafiği
    i18n/routes.ts           # locale algılama + yerelleştirilmiş yol üretimi
    i18n/dictionary.ts       # nav/CTA/sistem mesajları (TR + EN)
    seo/pageTitle.ts
  components/                # LanguageSwitcher, SolutionList, SolutionDetail
  layouts/BaseLayout.astro
  middleware.ts              # her build'de grafik + benzersizlik doğrulaması
  pages/
    index.astro              # TR ana sayfa
    cozumler/[index|[slug]]  # TR çözümler
    en/index.astro           # EN ana sayfa
    en/solutions/…           # EN çözümler
    404.astro
tests/
  unit/                      # Vitest (şema, seçici, i18n, içerik doğrulama)
  e2e/                       # Playwright (smoke, i18n, JavaScript kapalı)
  support/run-e2e.mjs        # boş port seçer, E2E_PORT ile Playwright'ı başlatır
  support/preview-server.mjs # e2e için deterministik statik sunucu (fail-closed)
```

## İçerik kuralları

| Kural                                                               | Nerede uygulanıyor                                   |
| ------------------------------------------------------------------- | ---------------------------------------------------- |
| Şema dışı alan build'i kırar                                        | Tüm şemalar `.strict()`                              |
| Enumlar kapalı (status, verificationStatus, logoPermission, locale) | `@lib/content/schema`                                |
| Yinelenen `translationKey + locale` reddedilir                      | `assertUniqueTranslations`                           |
| Bozuk içerik referansı build'i kırar (TÜM referans alanları)        | `assertContentGraph` + `src/middleware.ts`           |
| `status !== published` public'te görünmez                           | `selectors` — public mod                             |
| `verificationStatus !== verified` iddia public'te görünmez          | `selectors` — public mod                             |
| `logoPermission !== allowed` logo hiç render edilmez                | `logoPathIfAllowed`                                  |
| `lifecycle !== active` teknoloji public listede yok                 | `isVisibleTechnology` — **kod değişikliği gerekmez** |
| Eksik çeviri sessiz fallback üretmez                                | `LanguageSwitcher` + `t()`                           |

Üretim sayfaları filtreleri **açıkça** `PUBLIC` moduyla çağırır.

### İçerik grafiği doğrulaması

`src/lib/content/graph.ts` şemadaki **tüm** `reference()` alanlarını doğrular
(`solutions→technologies`, `solutions→proofs`, `milestones→solutions`,
`insights→authors`, `insights→relatedSolutions`). `src/middleware.ts` her sayfa
üretiminde çağırır; doğrulama **bir sayfanın o koleksiyonu sorgulamasına bağlı değildir**.

> Astro'nun kendi `reference()` doğrulaması bozuk referansı yalnızca loglar ve
> `astro sync` sıfır exit code döner. Bu doğrulayıcı hatayı **fırlatır**, build durur.

### İçerik olgunluğu

Bkz. [`docs/CONTENT_MATURITY.md`](docs/CONTENT_MATURITY.md). Şu an **35/35 teknoloji
`lifecycle: pending`** ve **tüm sayfalar `noindex`** — doğrulanmamış içerik yayınlanmaz.

## Diller

- Türkçe **prefixsiz**: `/`, `/cozumler/`, `/cozumler/<slug>/`
- İngilizce **`/en/` altında**: `/en/`, `/en/solutions/`, `/en/solutions/<slug>/`
- Locale **yalnızca URL'den** belirlenir (`localeFromPath`) — çerez/Accept-Language yok
- Dil değiştirici aynı `translationKey` karşılığına gider; karşılığı yoksa link üretmez ve
  erişilebilir bir "çeviri mevcut değil" bilgisi gösterir

## Ortam değişkenleri

`.env.example` dosyasını kopyalayıp `.env` oluşturun. **Gerçek secret asla commit edilmez.**
`PUBLIC_` önekli değişkenler tarayıcıya gönderilir; gizli değer taşıyamazlar.

## Bağımlılık politikası

Bkz. [`docs/DEPENDENCY_POLICY.md`](docs/DEPENDENCY_POLICY.md).

## Sprint disiplini

- Her sprint kendi branch'inde: `duosis-web/sXX-kisa-ad`
- Sprint sonunda atomik yerel commit
- Açık talimat olmadan push, merge, rebase, tag, PR veya deployment **yok**
- Doğrulanmamış iş iddiaları (müşteri sayısı, referans, ürün yeteneği) kamuya açık
  build'e çıkmaz — bkz. `discovery/content-truth-matrix.csv`
