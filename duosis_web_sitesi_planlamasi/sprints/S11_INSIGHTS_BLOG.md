# S11 — İçgörüler / Blog Yayın Sistemi

## Amaç

Duosis'in güncelliğini ve uzmanlığını sürekli gösterecek, SEO ve çözüm keşfine bağlanan haftalık/aylık içerik sistemini kurmak.

## Yapılacaklar

1. `/icgoruler/`, `/en/insights/` landing sayfaları.
2. Insight detail şablonu:
   - başlık/excerpt
   - yazar
   - yayın/güncelleme tarihi
   - okuma süresi
   - seri ve etiketler
   - kaynaklar
   - ilgili çözümler
   - CTA
3. Seriler:
   - Observability Radar
   - Data & AI
   - Mimari Notları
   - Otomasyon Rehberleri
   - CyclOps Günlüğü
   - Bölgesel Teknoloji
4. Filter/tag navigasyonu; JS zorunlu olmadan çalışabilir URL yaklaşımı.
5. RSS feed ve sitemap entegrasyonu.
6. Draft/future date davranışı.
7. BlogPosting structured data ve social preview.
8. En az üç TR ve bir EN yüksek kaliteli örnek fixture; açıkça demo/taslak içerikse public iddia üretmesin.
9. Kod bloğu, tablo, alıntı, callout ve responsive media stilleri.
10. İçerik editörü için `CONTENT_AUTHORING.md` rehberi.

## Kabul kriterleri

- [ ] Yazılar collection şemasından üretiliyor.
- [ ] Draft/future yazılar prod'da görünmüyor.
- [ ] Filtreli görünüm shareable URL veya normal linklerle çalışıyor.
- [ ] RSS yalnız published içerik içeriyor ve geçerli XML.
- [ ] Her yazı en az bir anlamlı çözüm veya dönüşüm bağlantısı taşıyabiliyor.
- [ ] Author/date/read time doğru ve locale uyumlu.
- [ ] BlogPosting markup sayfa içeriğiyle tutarlı.
- [ ] Uzun yazı mobile, 200% zoom ve keyboard kullanımında okunur.

## Test / kanıt

- Draft/future filter testleri.
- RSS XML validation.
- Blog detail e2e.
- Structured data validation.
- Desktop/mobile long-form screenshot.
- axe.

## Kapsam dışı

- Gerçek haftalık içeriklerin tamamını yazmak.
- Otomatik AI ile içerik yayınlamak.
- Headless CMS migration.

## Sprint sonu

Rapor ver ve dur. S12'ye geçme.

