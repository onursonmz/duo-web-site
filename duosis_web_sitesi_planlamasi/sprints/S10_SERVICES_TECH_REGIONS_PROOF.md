# S10 — Hizmetler, Teknolojiler, Bölgeler ve Güven Kanıtları

## Amaç

Duosis'in nasıl hizmet verdiğini, hangi doğrulanmış ekosistemle çalıştığını, hangi bölgelerde faaliyet gösterdiğini ve müşteri güvenini dengeli biçimde göstermek.

## Yapılacaklar

1. `/hizmetler/` ve `/en/services/`:
   - Danışmanlık
   - Destek
   - Eğitim
   - Yönetilen Hizmet / Operasyon
   - Dış Kaynak
2. Her hizmet için “ne zaman gerekir, ne sunulur, çıktı nedir?” yapısı.
3. `/teknolojiler/` ve İngilizce karşılığı; aktif teknoloji collection verisinden gruplanmış görünüm.
4. Logo yok/izinsiz durumda tipografik fallback.
5. Regional Presence:
   - Türkiye
   - Central Asia
   - Middle East
   - yalnız doğrulanmış şehir/ülke/kapsam
6. Harita SVG'si dekor değil, ilgili bölge metnine bağlı; klavye ve screen reader alternatifi.
7. Referans/vaka sistemi:
   - logo izni
   - anonim sektör seçeneği
   - doğrulanmış metrik
   - related solution
8. Ana sayfa ve solution detaylarının aynı proof kaynağını kullanması.
9. Logo görsel optimizasyonu, sabit kutu oranları ve alt metin politikası.

## Kabul kriterleri

- [ ] Hizmetler ve çözümler birbirine karışmıyor.
- [ ] Pasif teknoloji görünmüyor; aktiflik contentten yönetiliyor.
- [ ] İzinsiz logo public build'e çıkmıyor.
- [ ] Bölgesel iddialar doğrulanmış veya görünmez.
- [ ] Harita olmadan da bölge içeriği eksiksiz.
- [ ] Logo duvarı sayfanın ana mesajını bastırmıyor.
- [ ] Referans metrikleri kaynağa ve verification durumuna bağlı.
- [ ] TR/EN, responsive ve accessibility kontrolleri geçiyor.

## Test / kanıt

- Active/permission/verification filter unit testleri.
- Responsive logo and region screenshot.
- SVG keyboard/fallback testi.
- Broken refs negatif testi.
- axe.

## Kapsam dışı

- İzin alınması veya müşteriye dış iletişim.
- Doğrulanmamış ülke ofisi/partner iddiası.

## Sprint sonu

Rapor ver ve dur. S11'e geçme.

