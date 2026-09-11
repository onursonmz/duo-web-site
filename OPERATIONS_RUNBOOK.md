# Operasyon el kitabı

Bu dosya siteyi **çalıştıran** kişi içindir: yerelde açmak, derlemek,
doğrulamak ve üretim yapılandırmasını hazırlamak.

---

## 1. Siteyi yerelde görmek — tek komut

```bash
pnpm install --frozen-lockfile && pnpm dev
```

**Tam URL:** <http://localhost:4321/>

İngilizce ana sayfa: <http://localhost:4321/en/>
Ürünler: <http://localhost:4321/urunler/>

> Node sürümü `.nvmrc` ile pinlidir. Farklı bir Node kullanıyorsanız
> `corepack enable` sonrası `pnpm` doğru sürümü seçer.

### Üretim çıktısını yerelde görmek

```bash
pnpm build
node tests/support/preview-server.mjs dist 4321
```

**Tam URL:** <http://127.0.0.1:4321/>

Bu sunucu Astro'nun üretim davranışını taklit eder: `trailingSlash: "always"`,
dizin biçimli çıktı ve bilinmeyen yol için gerçek HTTP 404.

---

## 2. Ortam değişkenleri

| Değişken          | Varsayılan              | Etkisi                                                |
| ----------------- | ----------------------- | ----------------------------------------------------- |
| `DEPLOY_ENV`      | `preview`               | Yalnızca tam olarak `production` production sayılır   |
| `PUBLIC_SITE_URL` | `http://localhost:4321` | Production'da **zorunlu**, https ve localhost olmayan |
| `LEGAL_APPROVED`  | (yok)                   | Yalnızca `true` hukuk kapısını açar                   |
| `CONTACT_FORM_TO` | (yok)                   | Teslim hedefi; boşsa form demo modda                  |

**Fail-closed davranış.** Aşağıdaki dört komut derlemeyi KIRAR — bu
bilinçlidir ve `evidence/seo/production-build-guards.md` içinde ölçülmüş
çıktılarıyla kayıtlıdır:

```bash
DEPLOY_ENV=production pnpm build                                  # PUBLIC_SITE_URL zorunlu
DEPLOY_ENV=production PUBLIC_SITE_URL=http://duosis.com pnpm build  # HTTPS zorunlu
DEPLOY_ENV=production PUBLIC_SITE_URL=https://localhost:4321 pnpm build  # localhost YASAK
DEPLOY_ENV=production PUBLIC_SITE_URL=duosis.com pnpm build         # geçerli URL değil
```

---

## 3. Günlük komutlar

| Komut               | Ne yapar                                                     |
| ------------------- | ------------------------------------------------------------ |
| `pnpm dev`          | Geliştirme sunucusu                                          |
| `pnpm build`        | Üretim çıktısı + yönlendirme dosyaları                       |
| `pnpm quality`      | Tüm kapılar: format, lint, typecheck, birim, E2E, build, SEO |
| `pnpm test`         | Yalnızca birim testleri                                      |
| `pnpm test:e2e`     | Yalnızca E2E                                                 |
| `pnpm test:a11y`    | Yalnızca erişilebilirlik etiketli testler                    |
| `pnpm seo:report`   | Metadata kapısı ve raporu                                    |
| `pnpm og:images`    | Open Graph kartlarını yeniden üretir                         |
| `pnpm audit --prod` | Üretim bağımlılık taraması                                   |

### E2E tarayıcıları

```bash
pnpm exec playwright install chromium firefox webkit
```

Chromium tüm süiti, Firefox ve WebKit yalnızca `cross-browser.spec.ts`
dosyasını koşar. Gerekçe `playwright.config.ts` içinde yazılıdır.

### Makine yükü altında E2E

Süit ~1050 test. Varsayılan worker sayısı bazı makinelerde zaman aşımı
üretiyor; deterministik sonuç için:

```bash
node tests/support/run-e2e.mjs --workers=2
```

---

## 4. Ürün içeriğini güncellemek

Ürün anlatısı **kaynak depolardan türetilir**, elle yazılmaz.

1. Kaynak deponun `.duosis/website.json` dosyası güncellenir.
2. Yeni commit SHA'sı `docs/PRODUCT_SOURCE_MANIFEST.md` içine yazılır.
3. `src/content/products/products.json` yeniden üretilir.
4. Görsel eklendiyse **önce güvenlik incelemesi**: kişisel veri, müşteri adı,
   iç sistem adresi, token. Güvenli değilse kullanılmaz veya maskelenir.

LogiSlot ekranlarının maskelenmesi:

```bash
node scripts/mask-logislot-screens.mjs <kaynak-dizin>
```

---

## 5. Güvenlik başlıkları — BEKLENEN SET

**Uygulanmadı.** Dağıtım hedefi seçilmediği için bu başlıkların gerçekten
uygulandığı iddia EDİLEMEZ. Aşağıdaki set, hedef seçildiğinde uygulanacak
yapılandırmadır.

| Başlık                       | Değer                                                                                                                                                                                             | Gerekçe                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `Content-Security-Policy`    | `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` | Site üçüncü taraf kaynak kullanmıyor; CSP bunu zorunlu kılar |
| `Strict-Transport-Security`  | `max-age=31536000; includeSubDomains`                                                                                                                                                             | HTTPS zorunlu                                                |
| `X-Content-Type-Options`     | `nosniff`                                                                                                                                                                                         | MIME tahmini kapalı                                          |
| `Referrer-Policy`            | `strict-origin-when-cross-origin`                                                                                                                                                                 | Yol ve sorgu dışarı sızmaz                                   |
| `X-Frame-Options`            | `DENY`                                                                                                                                                                                            | `frame-ancestors` ile birlikte                               |
| `Permissions-Policy`         | `camera=(), microphone=(), geolocation=(), interest-cohort=()`                                                                                                                                    | Kullanılmayan yetenekler kapalı                              |
| `Cross-Origin-Opener-Policy` | `same-origin`                                                                                                                                                                                     | Pencere izolasyonu                                           |

**`style-src 'unsafe-inline'` neden var:** Astro bileşen stillerini satır içi
`<style>` olarak üretiyor. Nonce tabanlı bir çözüm statik çıktıda sunucu
desteği ister; hedef platform seçildiğinde yeniden değerlendirilmelidir.

**Uygulandıktan sonra yapılacak:** CSP önce `Content-Security-Policy-Report-Only`
ile bir süre izlenir, ihlal gelmediği görülür, sonra zorunlu kılınır.

### Kaynak haritası

Üretim derlemesinde kaynak haritası üretilmiyor; `dist/` içinde `.map`
dosyası yok. Dağıtımdan önce doğrulanır:

```bash
find dist -name '*.map' | wc -l   # 0 olmalı
```

---

## 6. Sık karşılaşılan durumlar

**Derleme "PUBLIC_SITE_URL zorunludur" diyor.**
Beklenen davranış. `DEPLOY_ENV=production` verdiniz ama site adresini
vermediniz. Ya adresi verin ya `DEPLOY_ENV`'i kaldırın.

**Form "gönderilmedi" diyor.**
Beklenen davranış. Üç koşuldan en az biri eksik: production ortamı, hukuk
onayı, teslim hedefi. Sahte başarı göstermemek için bilinçli.

**Sitemap boş.**
Beklenen davranış. Tüm sayfalar `noindex`; indeksleme kararı verilmedi.

**E2E rastgele zaman aşımıyla düşüyor.**
Makine yükü. `--workers=2` ile koşun. Bir kez de soket tükenmesi yaşandı:
bir VPN/güvenlik servisi 30.000'den fazla loopback bağlantısı tutunca
Chromium kaynak portu alamamıştı; `netstat -ano` ile sahip süreç bulunur.

**`astro check` içerik şeması hatası veriyor.**
Şemalar `.strict()`. Yeni bir alan eklediyseniz şemaya da eklemeniz gerekir;
sessizce yok sayılmaz.
