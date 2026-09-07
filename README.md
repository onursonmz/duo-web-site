# Duosis Web

Duosis kurumsal web sitesinin yeniden inşası. Astro + TypeScript (strict), statik çıktı.

Bu depo sprint temellidir. Her sprint tek başına incelenebilir bir artım üretir; sözleşmeler
[`duosis_web_sitesi_planlamasi/`](duosis_web_sitesi_planlamasi/), S00 keşif çıktıları ise
[`discovery/`](discovery/) altındadır.

**Mevcut durum:** S01 — repo iskeleti ve kalite kapıları. Gerçek tasarım (S03), içerik modeli
(S02) ve pazarlama metinleri henüz üretilmedi; `src/pages/` altındaki sayfalar yer tutucudur.

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

E2E testleri **üretim çıktısına** karşı koşar: Playwright `pnpm build && pnpm preview`
çalıştırır, böylece dev sunucusunun HMR istemcisi konsol ve DOM sonuçlarını kirletmez.

## Proje yapısı

```text
src/
  layouts/BaseLayout.astro   # <head>, skip link, #main-content, footer
  lib/seo/pageTitle.ts       # title üretimi (unit test kapsamında)
  pages/index.astro          # yer tutucu ana sayfa
  pages/404.astro            # 404
  styles/base.css            # asgari temel stil (tasarım sistemi S03'te)
tests/
  unit/                      # Vitest
  e2e/                       # Playwright
```

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
