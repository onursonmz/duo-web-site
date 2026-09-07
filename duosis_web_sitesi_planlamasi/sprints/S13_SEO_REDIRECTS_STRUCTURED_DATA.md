# S13 — SEO, URL Migration, Redirect ve Structured Data

## Amaç

Yeni sitenin arama görünürlüğünü korumak; eski WordPress URL'lerini doğru karşılıklara taşımak ve TR/EN sayfaları doğru indexletmek.

## Yapılacaklar

1. S00 legacy URL envanterini tamamla; response status ve içerik sınıfı ekle.
2. Her eski URL için karar:
   - birebir yeni karşılık → 301
   - birleştirilen içerik → en yakın anlamlı landing → 301
   - kalıcı kaldırma → 410/özel politika
   - korunacak → yeni template
3. Redirect chain/loop ve toplu homepage redirect'i engelle.
4. Locale canonical/hreflang/x-default stratejisi.
5. Sitemap index veya locale-aware sitemap.
6. robots.txt; preview/noindex ayrımı.
7. Sayfa türüne göre JSON-LD:
   - Organization
   - Service
   - BreadcrumbList
   - BlogPosting
   - gerekiyorsa SoftwareApplication/Product
8. Open Graph/Twitter image fallback sistemi.
9. 404/410 ve broken internal links crawler kontrolü.
10. Metadata duplicate/length kalite raporu.

## Kabul kriterleri

- [ ] Tüm bilinen legacy URL'lerde açık karar var.
- [ ] Redirect loop/chain yok; önemli URL tek hop.
- [ ] Redirect hedefi anlamlı; ana sayfaya kör yönlendirme yok.
- [ ] TR/EN canonical ve hreflang karşılıklı.
- [ ] Preview ortamı indexlenmiyor; prod config ayrı.
- [ ] Sitemap yalnız indexlenebilir canonical URL'leri içeriyor.
- [ ] Structured data sayfadaki gerçek içeriği aşmıyor.
- [ ] Kırık internal link yok.

## Test / kanıt

- Redirect automated matrix.
- Link crawler.
- Sitemap/robots XML/text validation.
- Structured data validator sonucu.
- Metadata duplicate raporu.

## Kapsam dışı

- Search Console hesap işlemleri.
- Canlı DNS veya domain migration.
- İş sahibi onayı olmayan içerik silme.

## Sprint sonu

Rapor ver ve dur. S14'e geçme.

