# Görsel Cila Backlog'u — S15 girdisi

Bu dosya **S15 sanat yönetimi sprintinin girdisidir**. S12/S13 kapsamında
UYGULANMAZ; burada yalnızca ölçülebilir kabul kriterleriyle kaydedilir.

Her madde bugünkü durumu, hedefi ve **nasıl ölçüleceğini** taşır. "Daha güzel
olsun" gibi ölçülemeyen bir kabul kriteri bilinçli olarak yazılmamıştır.

Genel sınırlar (her maddede geçerli):

- `prefers-reduced-motion: reduce` altında **tam statik** son durum; hareket
  süreleri ≤ 1ms.
- **Scroll hijacking YOK**: `scroll-behavior` dışında scroll olayına bağlı
  konum manipülasyonu yapılmaz.
- **Ağır WebGL YOK**: canvas/WebGL bağımlılığı eklenmez. S15'te bu bir
  kısıt olmaktan çıkıp **ölçülmüş bir tercihe** dönüştü: istenen görsel dil
  (topolojisi değişen operasyon şeması) SVG + CSS ile karşılandı, WebGL
  görsel kazanım sağlamadığı için kullanılmadı (ADR-014).
- Ana sayfa istemci JS bütçesi: **≤ 120 KB gzip** — S15'te güncellendi.
  Eski `≤ 12 KB` sınırı (bugün 978 B) dört ürünlü etkileşimli sahneyle
  bağdaşmıyordu; gerekçe ve yeni rota bazlı tablo
  `docs/decisions/ADR-014-signature-experience.md` içindedir.
- Etkilenen rotalarda **CLS 0** korunur.

---

## 1. Ana hero sinyal yolları ve kontrollü reveal

**Bugün:** `SignatureHero` beş aşamayı statik SVG ile çiziyor; giriş
animasyonu tek seferlik `stroke-dashoffset` + `opacity`.

**Hedef:** sinyalin kaynaktan aksiyona akışını, okumayı geciktirmeden anlatan
kontrollü bir reveal.

**Kabul kriterleri**

- İlk anlamlı boyamada H1, açıklama ve CTA **hareketsiz** ve okunur.
- Reveal tek seferlik; sayfa yeniden ziyaretinde tekrar oynamaz.
- Toplam animasyon süresi ≤ 1200 ms; hiçbir aşama 400 ms'yi aşmaz.
- Yalnızca `transform` ve `opacity`; düzen özelliği animasyonu yok
  (test: hesaplanmış stil taraması).
- 1440×900 ve 1366×768'de beş aşama adı ilk viewport'ta kalır (mevcut test
  korunur).
- Hero istemci JS'i **0 bayt** kalır.

## 2. Dark/light bölüm geçiş ritmi

**Bugün:** bölümler `theme-dark` / `theme-light` ile ayrılıyor; geçişler sert.

**Hedef:** sayfa boyunca okunabilir bir ritim; ardışık iki koyu bölüm arasında
görsel nefes.

**Kabul kriterleri**

- Ana sayfada ardışık aynı tonlu bölüm sayısı ≤ 2.
- Her geçişte üst kenar çizgisi veya boşluk farkı ölçülebilir (≥ 24 px).
- Tüm metin/yüzey çiftleri **≥ 4.75:1** kontrast (mevcut token testi korunur).
- Tema değişimi yalnızca CSS; JS ile sınıf değiştirme eklenmez.

## 3. Solution Atlas focus/hover anlatımı

**Bugün:** `:has()` ile hover/focus vurgusu var; bilgi hover'a bağlı değil.

**Hedef:** hangi çözümün seçildiğini, çevresindeki ilişkiyi de göstererek
anlatmak.

**Kabul kriterleri**

- Bilgi **hover'a bağlı kalmaz**: klavye focus'u aynı vurguyu üretir.
- Dokunmatik cihazda vurgu olmadan da tüm metin okunur.
- Vurgu geçişi ≤ 200 ms, yalnızca `transform`/`opacity`/`stroke-width`.
- Tooltip veya viewport dışına taşan katman eklenmez.

## 4. CyclOps ürün ekranlarının premium çerçeve ve detay davranışı

**Bugün:** üç gerçek ekran, ince kenarlıklı çerçevede, `<picture>` +
AVIF/WebP, lazy-load.

**Hedef:** ekranların "ekran görüntüsü" değil ürün deneyimi gibi durması.

**Kabul kriterleri**

- İlk görsel ≤ 250 KB, galeri toplamı ≤ 1 MB (mevcut bütçe korunur).
- CLS **0**; her görselde `width`/`height` bulunur.
- Büyütme eklenirse **gerçek `<button>`** ile; `role="button"` taklidi yok,
  Esc ile kapanır, odak tuzağı doğru kurulur ve odak tetikleyiciye döner.
- Modal eklenmezse de galeri klavyeyle tam gezilebilir kalır.
- "Gerçek ürün ekranı" ayrımı görünür kalır.

## 5. 10. yıl timeline vurgu hareketi

**Bugün:** yıl rayı statik; 2026 düğümünde bakır vurgu var.

**Hedef:** yılın seçildiğini/geçildiğini belli eden ölçülü bir vurgu.

**Kabul kriterleri**

- Derin bağlantı (`#yil-2021`) davranışı değişmez; hedef başlık viewport
  içinde ve odaklanabilir kalır.
- Sticky başlık hedefi kapatmaz (`scroll-margin-top` korunur).
- Reduced-motion altında `scroll-behavior: auto` ve vurgu animasyonu yok.
- Mobilde yatay sürükleme oluşmaz (mevcut test korunur).

## 6. İçgörü sayfalarında editoryal ritim

**Bugün:** yazı gövdesi tek sütun; başlık/paragraf ritmi standart.

**Hedef:** uzun teknik metinde okuma temposunu taşıyan editoryal düzen.

**Kabul kriterleri**

- Gövde ölçüsü 60–75 karakter aralığında kalır.
- Başlık hiyerarşisi atlamaz (mevcut test korunur).
- Kod/tablo blokları kendi kabında yatay kaydırılır; sayfa kaymaz.
- 320 px genişlikte metin sütunu ≥ 200 px kalır.

## 7. Reduced-motion tam statik fallback

**Kabul kriterleri**

- Tüm rotalarda `prefers-reduced-motion: reduce` altında animasyon/geçiş
  süresi ≤ 1 ms (mevcut CyclOps testi tüm rotalara genişletilir).
- Hiçbir bilgi yalnızca hareketle iletilmez: hareket kapalıyken de aynı metin
  ve aynı sıra görünür.

## 8. Scroll hijacking ve ağır WebGL kullanılmaması

**Kabul kriterleri**

- `wheel`, `touchmove` veya `scroll` olayına bağlı `preventDefault`/konum
  değiştirme YOK (kaynak taraması).
- `canvas`, `WebGLRenderingContext`, `three`, `gsap` gibi bağımlılık YOK
  (bağımlılık ve bundle taraması).
- Sayfa ağırlığı ve istek bütçeleri korunur.
