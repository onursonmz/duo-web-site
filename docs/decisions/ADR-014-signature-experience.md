# ADR-014 — Signature Experience: eski minimalist bütçenin değiştirilmesi

**Durum:** Accepted
**Tarih:** 2026-09-11
**Sprint:** S15

## Numara hakkında bir not

Çalışma emri bu kaydın `ADR-013-signature-experience.md` olmasını istiyordu.
**`ADR-013` numarası zaten kullanılıyor:** `ADR-013-onuncu-yil-yayin-karari.md`
S09'da yazılmış ve yürürlükte. Aynı numarayı ikinci kez kullanmak karar
günlüğünde gerçek bir çakışma yaratacağı — ve ileride hangi ADR-013'ten söz
edildiğini belirsizleştireceği — için kayıt **ADR-014** olarak açıldı. İçerik,
istenen kapsamın aynısıdır.

---

## Bağlam

`VISUAL_POLISH_BACKLOG.md`, S13'te iki sert sınır koymuştu:

- **"Ağır WebGL yok"** — canvas/WebGL bağımlılığı eklenmez.
- **Ana sayfa istemci JS bütçesi ≤ 12 KB gzip** (o gün ölçülen: 978 B).

Bu sınırlar S13'te doğruydu: site doküman benzeri, statik ve hafifti; hareket
yalnızca küçük geçişlerden ibaretti.

S14/S15 ile gelen kullanıcı yönü bunu değiştirdi. İstenen sonuç artık
"biraz süslenmiş mevcut site" değil; **ilk beş saniyede ne yaptığımızın
anlaşıldığı, en az üç belirgin signature moment taşıyan, dört ürünü birbirinden
farklı işleyen gerçek ürünler gibi gösteren** bir deneyim.

**Çelişki gerçektir ve sessizce yok sayılamaz:** 978 baytlık bir bütçeyle
dört farklı hareket dili taşıyan etkileşimli bir ürün sahnesi kurulamaz.
Bu ADR, sınırı değiştirdiğimizi açıkça kayda geçirir.

## Karar

### 1. Render yöntemi: önce SVG + CSS, WebGL YOK

Önce SVG, CSS ve Web Animations ile bir spike yapıldı. Sonuç: **ihtiyaç
duyulan görsel dil için WebGL veya Canvas gerekmiyor.**

İhtiyacımız olan şey parçacık simülasyonu, 3B sahne veya shader değil;
**topolojisi değişen bir operasyon şeması**: düğümler, yollar, durum
geçişleri ve kontrollü reveal. Bunların tamamı SVG geometrisi + CSS geçişleri
ile ifade edilebiliyor ve ifade edildi.

Bu yüzden karar: **WebGL/Canvas kullanılmıyor.** Araç seçimi "kütüphane
kullanmış olmak" için yapılmadı; gerekmediği ölçülerek görüldü.

Backlog'daki "ağır WebGL yok" maddesi bu ADR ile **korunuyor** — ama artık
bir kısıt olarak değil, **ölçülmüş bir tercih** olarak.

### 2. Bundle bütçesi: 12 KB yerine kademeli ve rota bazlı

Eski tek satırlık `≤ 12 KB gzip` sınırı, ürün ekosistemi sahnesi ve hero
etkileşimi eklendiğinde anlamını yitirdi. Yerine geçen bütçe:

| Ölçüm                         | Hedef         |
| ----------------------------- | ------------- |
| Ana sayfa toplam istemci JS   | ≤ 120 KB gzip |
| Ürün detay sayfası istemci JS | ≤ 90 KB gzip  |
| Bir rotanın ilk yük toplamı   | ≤ 1.25 MB     |
| Ürün ekran galerisi           | ≤ 1 MB        |
| Üçüncü taraf runtime isteği   | **0**         |
| LCP                           | < 2.5 s       |
| CLS                           | < 0.05        |
| Laboratuvar etkileşim         | < 200 ms      |

**Bu bir tavan, bir hedef değil.** Bugünkü gerçek kullanım bu tavanın çok
altındadır ve öyle kalması beklenir: sahneler SVG olduğu için istemci JS'i
yalnızca sekme/durum yönetimi kadardır. Bütçe aşılırsa otomatik olarak kalite
düşürülmez; gerçek breakdown, görsel kazanım ve alternatifler raporlanır.

### 3. Mobil ve reduced-motion davranışı

Reduced-motion **boş ekran veya yarım deneyim değildir**:

- Tüm sahneler **anlamlı son durumda** görünür.
- Otomatik hareket durur; scroll tabanlı transform kalkar.
- İçerik sırası değişmez.
- CTA ve ürün seçimi çalışmaya devam eder.
- Hiçbir bilgi **yalnızca** animasyonla aktarılmaz — her sahnenin metin
  karşılığı ilk HTML'dedir.

JavaScript kapalıyken ürün açıklamaları, sayfa navigasyonu ve temel görseller
erişilebilir kalır. Ürün ekosisteminde sekme gizleme **yalnızca JS
çalıştığında** başlar; JS yoksa dört ürünün açıklaması da okunur.

### 4. GPU ve pil davranışı

WebGL/Canvas kullanılmadığı için sürekli çalışan bir render döngüsü **yoktur**.
Hareket, CSS geçişlerinden ibarettir ve yalnızca durum değiştiğinde tetiklenir.
Bu, sekme arka plandayken de, düşük güçlü cihazda da ek GPU veya pil maliyeti
üretmez — `requestAnimationFrame` döngüsü durdurulması gereken bir şey olarak
hiç var olmaz.

### 5. Scroll davranışı

**Scroll hijacking yapılmaz.** `wheel` veya `touchmove` ile kullanıcının
scroll'u ele geçirilmez. Sticky anlatı kullanılabilir, fakat doğal sayfa akışı
bozulmaz.

## Değerlendirilen ve seçilmeyen alternatifler

| Alternatif                             | Neden seçilmedi                                                                                                                                                                    |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **WebGL (three.js / ogl)**             | İhtiyaç 3B veya shader değil; şema. En küçük kurulum bile onlarca KB runtime, GPU döngüsü, context kaybı yönetimi ve ayrı bir fallback yolu getirirdi. Görsel kazanım yok.         |
| **Canvas 2D + özel çizim motoru**      | SVG'nin verdiği erişilebilirlik (metin, `role`, `aria-label`) ve CSS ile temaya bağlanma kaybedilirdi; reduced-motion ve JS-kapalı fallback elle yeniden yazılmak zorunda kalırdı. |
| **Lottie / hazır animasyon dosyaları** | Tasarım JSON'a gömülür; tema token'larına bağlanamaz, dark/light geçişine uymaz ve içerik verisinden beslenemez. Ayrıca runtime bağımlılığı gelir.                                 |
| **GSAP + ScrollTrigger**               | İstenen etkiler CSS geçişleri ve `IntersectionObserver` ile karşılanıyor. Scroll tabanlı kütüphaneler scroll hijacking'e davetiye çıkarır; emirde açıkça yasak.                    |
| **Videoya alınmış sahne**              | Tema, dil ve içerik değiştikçe eskir; metin seçilemez, erişilebilir değildir, dosya boyutu büyüktür.                                                                               |

## Backlog güncellemesi

`VISUAL_POLISH_BACKLOG.md` içindeki iki genel sınır bu kararla değişti:

- ~~"Ana sayfa istemci JS bütçesi: ≤ 12 KB gzip"~~ → yukarıdaki rota bazlı tablo.
- "Ağır WebGL yok" → **korunuyor**, gerekçesi güncellendi: kısıt değil, ölçülmüş tercih.

Değişmeyen sınırlar: scroll hijacking yok, `prefers-reduced-motion` altında
hareket ≤ 1 ms, etkilenen rotalarda CLS 0, üçüncü taraf runtime isteği 0.

## Sonuçlar

**Olumlu:** görsel hedef WebGL maliyeti olmadan karşılanabiliyor; sahneler
içerik verisinden besleniyor, temaya bağlı, erişilebilir ve JS-kapalı
durumda bile okunur.

**Olumsuz / kabul edilen risk:** SVG topolojisi karmaşıklaştıkça DOM düğüm
sayısı büyür. Bu, bütçe tablosundaki ilk yük ve etkileşim hedefleriyle
sınırlanır; aşılırsa ADR yeniden değerlendirilir — sessizce esnetilmez.
