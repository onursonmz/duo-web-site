# S06 — Command Atlas İmza Hero Etkileşimi

## Amaç

Sitenin hatırlanmasını sağlayacak, Duosis'in observability → context → AI → action yaklaşımını anlatan yüksek kaliteli ama performanslı hero deneyimi üretmek.

## Deneyim modeli

Hero en fazla beş kavramsal aşamayı gösterir:

1. Sistem/servis kaynakları.
2. Metrik, log, event ve trace sinyalleri.
3. Bağlam ve ilişkilendirme.
4. AI destekli karar/öneri.
5. İnsan onayı veya otomatik aksiyon.

## Yapılacaklar

1. Önce static composition ve semantik HTML fallback'i tamamla.
2. SVG tabanlı topoloji/bağlantı katmanı oluştur; ağır canvas/WebGL ancak ölçümle gerekçelendirilirse.
3. İlk yükte kısa, bir kez çalışan intro; sürekli dikkat dağıtan loop yok.
4. Pointer/focus ile node açıklamaları; hover'a özel bilgi bırakma.
5. Scroll ile section'a geçerken sinyallerin Solution Atlas'a görsel devamını kur.
6. Reduced-motion sürümünü ayrı kabul kriteri olarak uygula.
7. Mobilde sadeleştirilmiş ve dokunmatik uyumlu görünüm oluştur.
8. Hero metin ve CTA'larını HTML'de tut; görsel içine gömme.
9. Asset ölçüleri ve preload kararını LCP ölçümüyle belirle.
10. Görsel regression ve motion state testleri ekle.

## Kabul kriterleri

- [ ] Hero 5 saniyede Duosis'in alanını anlatıyor; kullanıcı animasyon beklemek zorunda değil.
- [ ] Ana H1 ve CTA ilk HTML'de.
- [ ] Etkileşim klavye/focus ile erişilebilir veya eşdeğer metin sunuyor.
- [ ] Reduced-motion altında anlam kaybı yok ve motion duruyor.
- [ ] Mobilde içerik taşmıyor, FPS/jank gözle görülür değil.
- [ ] Hero kaynaklı CLS yok.
- [ ] Homepage first-party başlangıç JS bütçesi korunuyor veya raporlu gerekçe var.
- [ ] Ürün ekranı/iddiası uydurulmamış.

## Test / kanıt

- Desktop normal/reduced-motion video veya state screenshot.
- Mobile screenshot ve touch senaryosu.
- Klavye testi.
- Lighthouse/bundle karşılaştırması S05 → S06.
- JS devre dışı fallback screenshot.

## Kapsam dışı

- Gerçek LLM çağrısı.
- 3D dünya veya ağır parçacık motoru.
- Scrolljacking.

## Sprint sonu

Rapor ver ve dur. S07'ye geçme.

