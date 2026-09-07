# Teknik Mimari Sözleşmesi

## 1. Varsayılan teknoloji seçimi

- Framework: Astro + TypeScript strict.
- Render yaklaşımı: içerik sayfaları statik; form gibi zorunlu dinamik uçlar on-demand/server endpoint.
- İnteraktif alanlar: Astro island; yalnızca gerektiğinde küçük bir UI runtime.
- İçerik: Astro Content Collections + doğrulanan şemalar.
- Stil: CSS custom properties, cascade layers ve bileşen kapsamlı stiller. Kullanılacaksa yardımcı sınıf sistemi tasarım tokenlarının yerini alamaz.
- Hareket: öncelikle CSS/Web Animations; karmaşık akışta küçük ve tree-shake edilebilir motion bağımlılığı. Ağır WebGL için ölçüm ve açık gerekçe gerekir.
- Paket yöneticisi: pnpm; lockfile commit edilir.
- Runtime: proje başlangıcında güncel aktif Node LTS doğrulanır ve `.nvmrc`/`packageManager`/CI ile pinlenir.

Astro dışı mevcut bir repo bulunursa S00'da ölçülür; stack değişikliği gerekçesiz yapılmaz. Nihai adapter/deployment sağlayıcısı bilinmiyorsa provider-specific kod çekirdeğe yayılmaz.

## 2. Önerilen proje yapısı

```text
src/
  assets/
  components/
    global/
    home/
    solutions/
    cyclops/
    insights/
    motion/
  content/
    solutions/
    technologies/
    services/
    milestones/
    testimonials/
    case-studies/
    insights/
    authors/
  data/
    navigation.ts
    regions.ts
    redirects.ts
  layouts/
  lib/
    content/
    i18n/
    seo/
    analytics/
    validation/
  pages/
    index.astro
    en/
    cozumler/
    cyclops/
    hizmetler/
    teknolojiler/
    hakkimizda/
    icgoruler/
    iletisim/
  styles/
  middleware.ts
public/
tests/
  unit/
  e2e/
  accessibility/
  visual/
```

Klasör yapısı mevcut repo bağlamına göre uyarlanabilir; sorumluluk sınırları korunmalıdır.

## 3. Render ve JavaScript politikası

- Varsayılan çıktı HTML/CSS'tir; client JavaScript açık gerekçe gerektirir.
- Global header için tam SPA runtime yüklenmez.
- Hero, timeline ve çözüm atlası birbirinden bağımsız hydrate edilir.
- View Transition kullanılırsa normal link navigasyonu fallback olarak eksiksiz çalışır.
- Üçüncü taraf scriptleri consent öncesi ağ isteği başlatmaz.

Başlangıç performans bütçesi:

| Kalem | Bütçe |
|---|---:|
| Homepage first-party başlangıç JS | `<= 180 KB gzip` |
| İçerik/detay sayfası başlangıç JS | `<= 90 KB gzip` |
| Kritik olmayan font | ilk render'ı bloklamaz |
| Hero ana görsel | uygun responsive kaynaklarla `<= 350 KB` hedef |
| CLS | `< 0.1` |

Her istisna sprint raporunda ölçüm ve gerekçeyle açıklanır.

## 4. i18n sözleşmesi

- Varsayılan locale `tr`; Türkçe URL'lerde prefix yok.
- İngilizce locale `/en/...`.
- Her içerikte sabit `translationKey` ve locale-specific slug bulunur.
- Dil değiştirici mevcut sayfanın çevirisine gider; çeviri yoksa İngilizce/Türkçe ana sayfaya sessizce atmaz, erişilebilir bir unavailable davranışı uygular.
- `hreflang`, canonical ve sitemap locale ilişkileri test edilir.
- Otomatik makine çevirisi yayınlanmaz.

## 5. İçerik güvenliği ve doğruluk

- Şema dışı frontmatter build'i kırar.
- `draft`, `review`, `published`, `archived` yayın durumu.
- `verificationStatus: pending | verified | rejected` iddia/metric/teknoloji kayıtlarında kullanılabilir.
- `logoPermission: unknown | allowed | denied` varsayılanı `unknown`.
- `active: false` teknoloji kartını ve ilişkili menü girişini kamuya açık görünümden çıkarır; kod değişikliği gerekmez.
- Markdown/MDX'te rastgele script veya tehlikeli HTML çalıştırılmaz.

## 6. Form ve veri akışı

Form alanları minimum tutulur:

- ad soyad
- kurumsal e-posta
- şirket
- konu/ilgi alanı
- mesaj
- KVKK aydınlatma onayı

Kurallar:

- Hem istemci hem sunucu doğrulaması.
- Sunucu tarafında uzunluk, tür, format ve allowlist kontrolü.
- Honeypot + oran sınırlama + Turnstile benzeri koruma; token sunucuda doğrulanır.
- Loglarda form mesajı, tam e-posta veya hassas veri tutulmaz.
- CRM bilinmiyorsa provider interface + test/dry-run adapter; prod'da başarısızlığı gizleyen sahte başarı yok.
- Başarılı/başarısız durumlar klavye ve ekran okuyucu için duyurulur.

## 7. Consent ve analitik

- Essential dışındaki kategoriler default kapalı.
- Kullanıcı “reddet” seçeneğine “kabul et” kadar kolay ulaşır.
- Tercihler sürümlü ve yeniden açılabilir.
- Analitik script tag'i onaydan önce DOM'a/ağa eklenmez.
- Olay isimleri PII içermez: `cta_click`, `solution_view`, `contact_start`, `contact_submit_success`, `language_switch`.

## 8. SEO

- Her indexlenebilir sayfada özgün title, description, canonical, Open Graph ve Twitter metadata.
- Organization, Service, BreadcrumbList ve BlogPosting şemaları yalnızca sayfadaki gerçek içerikle.
- Sitemap, robots.txt ve RSS build içinde.
- Eski WordPress URL envanteri ile birebir 301 eşleme; toplu olarak ana sayfaya yönlendirme yok.
- 404 ve kaldırılan içerikler açıkça yönetilir.

## 9. Güvenlik başlıkları

Deployment ortamına uygun şekilde en az:

- Content-Security-Policy
- Strict-Transport-Security (yalnız HTTPS prod)
- Referrer-Policy
- X-Content-Type-Options
- Permissions-Policy
- Frame koruması (`frame-ancestors`)

Secret hiçbir zaman `PUBLIC_` değişkeninde, client bundle'da veya repoda tutulmaz.

## 10. Test ve kalite komutları

Paket scriptleri tek kontrol yolu sağlar:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm test:a11y
pnpm build
pnpm quality
```

`pnpm quality`, sprintin gerektirdiği tüm deterministik kontrolleri sıralı ve fail-closed çalıştırır.

## 11. Tarayıcı matrisi

- Chromium güncel.
- Firefox güncel.
- WebKit/Safari eşdeğeri.
- Android küçük ekran.
- iOS küçük ekran.
- Klavye-only.
- Reduced motion.
- 200% zoom ve dar reflow.

## 12. Kaynak kararları

- Astro i18n ve Content Collections kullanılabilirliği resmi Astro dokümantasyonuyla doğrulanmalıdır.
- Core Web Vitals sonuçları laboratuvar skoruyla sınırlı yorumlanmaz; saha hedefinin 75. yüzdelik mantığı korunur.
- Erişilebilirlik WCAG 2.2 AA kabul matrisiyle izlenir.
- Form güvenliği, CSP ve HTTP header kararları OWASP ve kullanılan sağlayıcının resmi dokümanıyla doğrulanır.

