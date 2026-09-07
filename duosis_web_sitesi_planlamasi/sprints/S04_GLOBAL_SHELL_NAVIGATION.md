# S04 — Global Shell, Navigasyon, Mega Menü ve Footer

## Amaç

Tüm sayfalarda kullanılacak erişilebilir header/footer, çözüm keşfi ve TR/EN geçişini tamamlamak.

## Yapılacaklar

1. Sticky davranışı kontrollü global header oluştur.
2. En fazla altı ana menü girişini uygula.
3. Çözümler mega menüsünde:
   - iş sonucu başlığı
   - tek satır açıklama
   - ilişkili teknoloji sayısı/etiketi gerekiyorsa
   - CyclOps ayrı vurgu
4. Mobile menü:
   - aç/kapat
   - focus trap ve focus return
   - ESC ile kapatma
   - scroll lock temizliği
5. Dil değiştiriciyi translation mapping ile bağla.
6. Global footer:
   - kısa değer önerisi
   - İstanbul/Ankara doğrulanmış iletişim bilgileri
   - temel linkler ve politikalar
   - güncel yıl dinamik/derleme tabanlı
7. Skip link, `main` landmark ve breadcrumb altyapısı.
8. 404 sayfasını aynı shell içinde oluştur.
9. Navigation config ile hard-coded tekrarları kaldır.

## Kabul kriterleri

- [ ] Desktop ve mobile menü mouse, touch ve klavye ile çalışıyor.
- [ ] Mega menü hover zorunlu değil; focus/click ile kullanılabilir.
- [ ] Mobile menü kapandığında focus tetikleyiciye dönüyor.
- [ ] Dil değiştirici ilgili çeviri rotasına gidiyor.
- [ ] Header açılıp kapanırken CLS veya body scroll kalıntısı yok.
- [ ] Footer'da eski yıl, placeholder veya izinsiz sosyal link yok.
- [ ] Aktif route semantik olarak işaretleniyor.
- [ ] JS kapalı fallback temel site navigasyonunu koruyor.

## Test / kanıt

- Playwright desktop/mobile navigation.
- Keyboard-only senaryo.
- axe.
- TR/EN route senaryosu.
- 404 ve focus kontrolü.

## Kapsam dışı

- Ana sayfa özel bölümleri.
- Search özelliği; ihtiyaç doğrulanmadan eklenmez.

## Sprint sonu

Rapor ver ve dur. S05'e geçme.

