# S07 — Çözümler Landing ve Veriyle Çalışan Detay Şablonu

## Amaç

Sekiz çözümü teknik ürün listesi olmaktan çıkarıp müşteri problemi → yaklaşım → sonuç → teknoloji → kanıt akışında sunan yeniden kullanılabilir sistem kurmak.

## Yapılacaklar

1. `/cozumler/` ve `/en/solutions/` landing sayfalarını oluştur.
2. Çözüm keşif biçimi:
   - iş sonucu başlığı
   - kısa problem cümlesi
   - ilgili kabiliyet/teknoloji
   - uygun CTA
3. Tek `SolutionDetail` şablonunu collection verisiyle oluştur.
4. En az bir çözümü uçtan uca gerçek içerik derinliğinde tamamla; önerilen ilk aday Observability.
5. İkinci çözümle şablonun yeniden kullanılabilirliğini kanıtla; özel sayfa hack'i yapma.
6. “AI burada ne yapıyor?” alanı yalnız içerik varsa render olsun.
7. Related technology, proof ve insight ilişkilerini ID/ref ile çöz.
8. Breadcrumb, localized metadata ve CTA tracking hook ekle.
9. Sektörel çözüm kaydı aynı şema ile render edilebilsin.
10. Draft/pending filtrelerini e2e test et.

## Kabul kriterleri

- [ ] Sekiz çözüm fayda odaklı başlıklarla görünür.
- [ ] Bir detay şablonu en az iki farklı kayıtla eksiksiz çalışır.
- [ ] Teknoloji logosu/ismi anlatının başlangıcı değildir.
- [ ] Boş opsiyonel alanlar görsel boşluk veya sahte içerik üretmez.
- [ ] TR/EN çeviri eşlemesi ve canonical/hreflang doğru.
- [ ] İlgili içerik referansları kırık ID'de build/test hatası verir.
- [ ] Mobile/desktop ve klavye akışı tamam.
- [ ] CTA iletişim sayfasına anlamlı context parametresiyle gidebilir; hassas veri içermez.

## Test / kanıt

- Collection ref unit testleri.
- İki solution e2e.
- Sektörel fixture rendering testi.
- axe ve heading/breadcrumb kontrolü.
- Screenshot: landing + iki detay, desktop/mobile.

## Kapsam dışı

- Sekiz çözümün nihai pazarlama metnini tamamen üretmek.
- Müşteri onayı olmayan vaka/metric yayınlamak.

## Sprint sonu

Rapor ver ve dur. S08'e geçme.

