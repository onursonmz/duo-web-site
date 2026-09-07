# S08 — CyclOps ve Signal-to-Action Ürün Hikâyesi

## Amaç

CyclOps'u teknoloji logosu seviyesinden çıkarıp Duosis'i ürün sahibi yapan temel fark olarak konumlandıran bağımsız ürün sayfası oluşturmak.

## İçerik sınırı

Doğrulanmamış ürün kabiliyeti, entegrasyon, müşteri kullanımı, performans metriği veya “otonom” iddiası yazılmaz. Gerçek ekran yoksa ürün UI'ı uydurulmaz; şematik akış açıkça temsili olur.

## Yapılacaklar

1. `/cyclops/` ve `/en/cyclops/` sayfalarını oluştur.
2. Signal-to-Action anlatısı:
   - signal
   - context
   - correlate
   - decide
   - act
3. Hero'da ürünün tek cümlelik değer önerisi ve demo/iletişim CTA'sı.
4. “Önce / Sonra” operasyon senaryosu:
   - alarm kalabalığı
   - ilişkilendirilmiş olay
   - etki/kök neden bağlamı
   - öneri veya kontrollü aksiyon
5. Gerçek ürün ekranları varsa erişilebilir galeri; yoksa content-driven schematic.
6. Integrations alanını doğrulanmış technology refs ile besle.
7. İnsan onayı ve otomasyon sınırını görünür kıl.
8. İlgili solution/case-study/insight bağlantıları.
9. Product/SoftwareApplication structured data yalnız gerekli gerçek alanlar varsa.
10. Demo etkileşiminin reduced-motion ve mobile sürümleri.

## Kabul kriterleri

- [ ] CyclOps'un Duosis'e ait ürün olduğu 5 saniyede anlaşılır.
- [ ] Sayfa “ne yapıyor, kimin için, nasıl değer yaratıyor” sorularını yanıtlar.
- [ ] Signal-to-Action akışı JavaScript kapalıyken de metinsel olarak anlaşılır.
- [ ] Hiçbir entegrasyon veya kabiliyet varsayılmamış.
- [ ] Gerçek ve temsili görsel ayrımı açık.
- [ ] CTA bağlamı iletişim formuna taşınır.
- [ ] TR/EN, mobile, keyboard ve reduced-motion davranışları tamam.
- [ ] Bundle bütçesi raporlandı.

## Test / kanıt

- Content validation: verification status.
- E2E: hero → demo/iletişim CTA.
- E2E: senaryo adımları keyboard/touch.
- axe ve screenshot.
- JS-off/reduced-motion kanıtı.

## Kapsam dışı

- Gerçek üretim sistemi entegrasyonu.
- Canlı LLM/API.
- Onaysız müşteri vakası.

## Sprint sonu

Rapor ver ve dur. S09'a geçme.

