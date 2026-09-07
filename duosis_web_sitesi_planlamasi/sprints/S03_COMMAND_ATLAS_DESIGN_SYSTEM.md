# S03 — Command Atlas Tasarım Sistemi

## Amaç

Ana sayfaya geçmeden önce Duosis'e özgü, erişilebilir ve tüm sayfalarda tutarlı tasarım tokenlarını ve temel UI dilini kanıtlamak.

## Yapılacaklar

1. Mevcut logo renklerini ölç; marka sahibi onayı olmayan değerleri provisional olarak etiketle.
2. Semantic token sistemi kur:
   - surface, text, border
   - signal, action
   - success, warning, critical
   - focus
3. Tipografi ölçeği ve font loading stratejisi kur.
4. Spacing, container, grid, border, radius ve motion tokenlarını oluştur.
5. Temel bileşenleri uygula:
   - Link/Button
   - Eyebrow/SectionHeading
   - Metric
   - Logo mark container
   - Status label
   - Quote/proof block
   - Form field states
6. Koyu/açık section kullanımını bileşen içinde değil tema bağlamında çöz.
7. Focus, hover, active, disabled, error ve loading durumlarını tasarla.
8. `/design-system` yalnız development/preview route'u oluştur; prod çıktısında indexlenmesin veya kaldırılabilsin.
9. Font fallback ve 200% zoom/reflow kontrolü yap.
10. Tasarım kararlarını kısa `DESIGN_SYSTEM.md` ile belgele.

## Kabul kriterleri

- [ ] Renk kontrastları normal metin ve UI bileşenlerinde WCAG AA.
- [ ] Focus indicator tüm interactive componentlerde açıkça görünür.
- [ ] Dark/light section arasında bileşen kontrastı bozulmuyor.
- [ ] Button/link hiyerarşisi görsel olarak net; her metin buton görünmüyor.
- [ ] Radius ve gölge kullanımı sözleşmedeki keskin stile uygun.
- [ ] Font yüklenmezse layout bozulmuyor ve CLS üretmiyor.
- [ ] 320px genişlik ve 200% zoom'da yatay içerik taşması yok.
- [ ] Design system desktop/mobile screenshot kanıtı var.

## Test / kanıt

- Token lint veya geçersiz token referansı kontrolü.
- axe taraması.
- Klavye tab sırası.
- Screenshot/visual regression başlangıç snapshot'ı.
- Build ve bundle özeti.

## Kapsam dışı

- Global navigation.
- Hero animasyonu.
- Tam ana sayfa.

## Sprint sonu

Rapor ver ve dur. S04'e geçme.

