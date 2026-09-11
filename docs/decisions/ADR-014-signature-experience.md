# ADR-014 — Signature Experience: eski minimalist bütçenin değiştirilmesi

**Durum:** Accepted — 1. bölüm S15-R1'de bir kez, S15-R2'de bir kez daha YENİDEN AÇILDI;
yürürlükteki render kararı **S15-R2** bölümündedir
**Tarih:** 2026-09-11 (S15) · revizyon 2026-09-11 (S15-R1) · revizyon 2026-09-11 (S15-R2)
**Sprint:** S15, S15-R1, S15-R2

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

---

# S15-R1 revizyonu — render kararının yeniden açılması

Codex incelemesi (CHANGES REQUESTED) bu ADR'nin **1. maddesini** açıkça
yeniden açtırdı:

> "ADR-014'teki 'WebGL/Canvas gerekmez' sonucu yeniden OPEN yapılmalı. Amaç
> mutlaka WebGL kullanmak değildir; amaç hedeflenen görsel sonucu elde
> etmektir."

Karar yeniden açıldı, yeni bir spike yapıldı ve aşağıdaki sonuca bağlandı.

## Neden ilk karar yetersizdi

İlk spike doğru soruyu sormamıştı. "Topolojisi değişen bir şema WebGL'siz
çizilebilir mi?" diye soruldu; cevap evetti ve iş orada bitti. Oysa istenen şey
bir şema değil, **derinliği olan bir sahne**ydi: ölçek, perspektif, blur,
katman ve kontrollü kamera hareketi. S15 hero'su bu yüzden "ince bir alt çizgi
şeması" olarak kaldı.

## S15-R1 spike'ı

Üç yol denendi:

| Yol                                                 | Sonuç                                                                                                                                                                                               |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tek düzlemde SVG (S15'in yaptığı)**               | Derinlik hissi YOK. Ölçek ve blur elle taklit edilse bile katmanlar birlikte hareket etmediği için parallax kurulamıyor. **Yetersiz — asıl eleştirinin kaynağı bu.**                                |
| **CSS 3B katmanlar (`perspective` + `translateZ`)** | Beş katman gerçek bir 3B uzayda duruyor; kamera döndüğünde katmanlar DERİNLİĞİNE göre farklı hızda kayıyor. Blur, opaklık ve ölçek doğal olarak derinlikten geliyor. **Hedeflenen sonucu veriyor.** |
| **WebGL / Canvas (three.js, ogl veya el yazımı)**   | Aynı görsel sonucu verir, ek olarak shader ve parçacık imkânı sunar — ama ikisi de tasarım sınırlarında YASAK. Karşılığında runtime, GPU döngüsü, context kaybı ve ayrı fallback yolu getirir.      |

## Yeni karar (1. maddenin yerine geçer)

**CSS 3B katmanlı SVG kullanılıyor; WebGL/Canvas yine kullanılmıyor.** Bu,
S15'teki cevabın tekrarı değil: S15'teki uygulama da değişti. Hero artık tek
düzlem değil, `perspective: 1400px` altında beş ayrı derinlikte duran bir
katman yığınıdır.

Kararın ölçülen dayanağı:

- İstenen etkilerin tamamı (ölçek, perspektif, blur, katman, kamera) CSS 3B
  ile elde edildi — kanıt: `evidence/s15-r1/` içindeki hero videosu.
- WebGL'in ekleyeceği tek fark shader/parçacık sınıfı efektlerdir; bunlar
  talimatın **tasarım sınırları** bölümünde açıkça yasaklanmıştır ("rastgele
  parçacık alanı, mor gradient küre, cyberpunk oyun arayüzü yok").
- Bu yüzden WebGL, ulaşılamayan bir görsel kalite açmıyor; yalnızca maliyet
  ekliyor. "Kütüphane kullanmış olmak" için seçilmedi.

## Kabul edilen yeni maliyet: hero kamerası ~1 KB JS

S15'te hero'nun **sıfır** ek istemci JS'i vardı ve bu bir test güvencesiydi.
Kontrollü kamera hareketi bunu değiştirdi:

- Kamera yalnızca iki CSS değişkeni (`--px`, `--py`) yazar.
- Kapanma koşulları: `prefers-reduced-motion`, kaba işaretçi (dokunmatik),
  `save-data`, sekme gizli ve viewport dışı.
- `wheel` / `touchmove` / `mousewheel` dinleyicisi **yoktur**; bu artık
  `tests/e2e/hero.spec.ts` içinde `addEventListener` sarmalanarak ÖLÇÜLÜYOR.
- JS hiç çalışmazsa sahne nötr duruşta kalır; kompozisyon ve bilgi kaybı yok.

Ana sayfa istemci JS bütçesi (≤ 120 KB gzip) bundan etkilenmiyor; ölçüm final
raporda yer alacak.

## Ölçüm koşulu netleştirmesi (S15 raporundaki açık madde)

S15 teslim raporunda "ADR-014, `LCP < 2.5 s` hedefinin hangi ölçüm koşulu için
geçerli olduğunu yazmıyor" diye bir eksik kaydedilmişti. Kapatılıyor:

| Hedef                    | Geçerli olduğu koşul                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| **LCP < 2.5 s**          | Lighthouse `simulate` + `mobile` kısıtlaması (Moto G Power profili, 4x CPU, Slow 4G), soğuk yükleme |
| **CLS < 0.05**           | Aynı koşul; ayrıca kısıtlamasız masaüstünde de ölçülür                                              |
| **< 200 ms etkileşim**   | Laboratuvar ölçümü (TBT üzerinden), gerçek kullanıcı alan verisi DEĞİL                              |
| **İstemci JS tavanları** | Üretim derlemesinde gzip'lenmiş boyut                                                               |

## S15-R1'de ölçülen iki üretim hatası

Bu revizyonun kayda değer iki bulgusu var; ikisi de "çalışıyor sanılan ama
çalışmayan" sınıfından:

1. **Scroll tabanlı açılışlar üretim derlemesinde HİÇ çalışmıyordu.** CSS
   küçültücü `animation` kısayolu ile `animation-timeline: view()` bildirimini
   birleştiriyor; oluşan `animation: linear both ad view()` kısayolu tarayıcıda
   GEÇERSİZ olduğu için kuralın tamamı düşüyordu (`animation-name: none`).
   Geliştirme sunucusunda CSS küçültülmediği için sorun görünmüyordu. Çözüm:
   zaman çizelgesi `var(--scroll-timeline)` üzerinden okunuyor. Regresyon
   `tests/e2e/motion-system.spec.ts` ile hem üretilen CSS'te hem tarayıcıda
   denetleniyor.

2. **Açılış animasyonu metnin kontrastını düşürüyordu.** 10. yıl durakları
   `opacity: 0.35` ile başlıyordu; animasyon gerçekten bağlandıktan sonra
   henüz görünmemiş duraklar axe tarafından GERÇEK kontrast ihlali olarak
   raporlandı (2.99:1). Açılış maske (`clip-path`) tabanlına çevrildi. Bu
   ayrıca talimattaki "bölümler yalnız opacity ile görünmemeli" kuralını
   karşılıyor.

**Kural olarak kayda geçiyor:** metin taşıyan bir öğenin açılışı opaklık
düşürerek yapılmaz; maske ve konum kullanılır.

## Backlog üzerindeki etki

`VISUAL_POLISH_BACKLOG.md` maddeleri değişmedi: "ağır WebGL yok" hâlâ geçerli
ve hâlâ ölçülmüş bir tercih. Eklenen tek şey, bu tercihin artık **derinlikli
bir sahne üzerinde** sınanmış olması.

---

# S15-R2 revizyonu — render kararı ikinci kez açıldı ve DEĞİŞTİ

**Durum:** 1. madde (render yöntemi) YENİDEN AÇILDI ve **yeni bir karara**
bağlandı. Yukarıdaki S15 ve S15-R1 bölümleri **tarihsel kayıt** olarak durur;
yürürlükte olan karar budur.

## İnceleme sonucu

S15-R1 checkpoint'i görsel kabulden GEÇMEDİ. İncelemenin tespiti teknik
değil, görseldi:

- ekranda algılanan gerçek bir derinlik yok,
- kamera neredeyse sabit; hareket eden şey yalnızca çizgiler,
- bir sahne başka bir sahneye DÖNÜŞMÜYOR; "bölüm geçişi" dediğimiz şey
  çizgi/V biçimli bir ayraçtan ibaret,
- sonuç düzenli fakat jenerik.

İnceleme ayrıca yöntemi de kayda geçirdi: **kabul kriteri ortaya çıkan
görüntüdür**, kullanılan tekniğin yeterliliğini anlatan gerekçe değil.

## S15-R1 kararı NEDEN yanlıştı

S15-R1'deki gerekçe şuydu: "WebGL'in ekleyeceği tek fark shader/parçacık
sınıfı efektlerdir; bunlar zaten yasak, o hâlde WebGL yalnızca maliyet ekler."

Bu akıl yürütme iki şeyi birbirine karıştırıyor:

1. **Efekt** (parçacık yağmuru, gradient küre) ile **mekân** (gerçek perspektif
   kamera, gerçek Z mesafesi, birbirini örten hacimli gövdeler). Yasak olan
   birincisiydi; eksik olan ikincisi.
2. **Kodda derinlik** ile **ekranda derinlik**. `translateZ` + telafi ölçeği
   katmanları net ekran ölçeğinde 1.0'da tutar — yani tam olarak derinliğin
   GÖRÜNMEMESİNİ sağlar. Parallax yalnızca işaretçi hareket ederken belirir;
   duran bir ekran görüntüsünde hiçbir izi kalmaz. Bu yüzden "CSS 3B" kodda
   doğrulanabiliyor ama 1440x900 bir karede doğrulanamıyordu.

Kısacası: S15-R1'in dayanağı ölçüm değil, çıkarımdı. Ölçüm (kare ve video)
tersini söyledi.

## Yeni karar — 1. maddenin yerine geçer

**Masaüstü ana deneyimde gerçek WebGL kullanılıyor: Three.js r182,
`src/lib/scene/universe.ts`.**

Kapsam ve sınırlar:

- **Geometri koddan üretilir.** Hazır sahne (Spline), stok 3B model veya başka
  bir siteden alınmış asset YOKTUR. Sahnedeki her gövde ikosahedron, torus,
  tüp (`TubeGeometry`) ve ızgara ilkellerinden türetilir.
- **Renkler tasarım sisteminden OKUNUR.** `readTokens()` koyu temalı bir DOM
  öğesinden `--surface-sunken`, `--signal`, `--decision`, `--action`,
  `--border-subtle`, `--surface-inverse`, `--text-inverse` değerlerini alır;
  dosyada marka rengi sabitlenmez (yalnızca okunamazsa devreye giren yedek).
- **PBR materyali İTHAL EDİLMEZ.** Yalnızca `MeshBasicMaterial`,
  `LineBasicMaterial` ve elle yazılmış üç küçük `ShaderMaterial` kullanılır
  (fresnel kenar, akış tüpü, ışık düzlemi). Paket bütçesi bunun üzerine
  kuruludur; `MeshStandardMaterial` tek başına shader yığınını ikiye katlıyor.
- **Kritik içerik tuvalin İÇİNE yazılmaz.** H1, açıklama ve iki CTA ilk
  HTML'dedir, animasyonsuzdur ve tuvalden bağımsız okunur. Tuval
  `aria-hidden`.

## Ölçülen maliyet

| Kalem                                | Ölçülen | Tavan (S15-R2 §9) |
| ------------------------------------ | ------- | ----------------- |
| Sahne yığını (`universe.*.js`), gzip | ~134 KB | —                 |
| Ana sayfa TOPLAM istemci JS, gzip    | ~136 KB | 220 KB            |
| Harici runtime isteği                | 0       | 0                 |
| Renderer DPR tavanı                  | 1.5     | 1.5               |

Ölçüm `tests/e2e/hero.spec.ts` içinde otomatiktir: sayfanın indirdiği her
`.js` yanıtı `dist/` içinden okunup `gzipSync` ile sıkıştırılır ve satır içi
modüllerle toplanır. Elle yazılmış bir sayı değildir.

Eski 120 KB tavanı S15-R2 talimatıyla 220 KB'ye çıkarıldı; bu bir gevşetme
değil, gerçekçi bir sınır. Ölçülen değer yeni tavanın da epey altında.

## Üç çizim kipi — tek düzen

Track yüksekliği her kipte AYNIDIR; sahne açıldığında hiçbir şey yer
değiştirmez (CLS ölçülüyor, bkz. hero testleri):

| Kip      | Ne zaman                                         | Ne görünür                            |
| -------- | ------------------------------------------------ | ------------------------------------- |
| `poster` | WebGL yok · JS yok · `save-data` · context kaybı | statik SVG son kompozisyon            |
| `live`   | normal masaüstü ve mobil                         | WebGL sahnesi, kamera ve akış çalışır |
| `static` | `prefers-reduced-motion: reduce`                 | WebGL'in TEK karesi; kamera durur     |

`live` dışındaki kiplerde yolculuk bandı da kısalır: kamera durduğunda uzun
bir scroll bandının anlamı kalmaz.

## Pil, GPU ve scroll

- `requestAnimationFrame` döngüsü sekme gizliyken (`visibilitychange`) ve
  sahne viewport dışındayken (`IntersectionObserver`) DURUR.
- `devicePixelRatio` 1.5 ile sınırlıdır.
- Dar ekranda (`< 860px`) segment sayıları düşer, paket sayısı azalır, kamera
  kompozisyonu ortalanır — evren KALDIRILMAZ, küçültülür.
- `webglcontextlost` yakalanır, döngü durur ve sahne postere döner.
- **Scroll'a EL SÜRÜLMEZ.** Sahne kodunda `wheel`, `touchmove` veya
  `mousewheel` dinleyicisi yoktur; yapışkanlık tamamen CSS'tir ve scroll
  konumu yalnızca OKUNUR. Bu, `addEventListener` sarmalanarak ölçülüyor.

## S15-R2'de ölçülen üç üretim hatası

Üçü de "kodda doğru görünen ama ekranda yanlış olan" sınıfından; üçü de
tahminle değil, ekran görüntüsü alınıp DOM ölçülerek bulundu.

1. **Düzleşen raylar p = 1'de tamamen kayboluyordu.** Akış tüplerinin köşeleri
   vertex shader'da (`aFlat` + `uFlat`) taşınıyor; üç.js ise budamayı
   geometrinin BAŞLANGIÇ sınır küresiyle yapıyor. Kamera çekirdekten geçtikten
   sonra o küre kameranın arkasında kalıyor ve mesh tamamen budanıyordu.
   Çözüm: morph uygulanan meshlerde `frustumCulled = false`.

2. **Okunurluk örtüsü sahnenin üstüne AÇIK GRİ boyuyordu.** `.universe__scrim`
   `color-mix(... var(--surface-sunken) ...)` kullanıyor; `theme-dark` sınıfı
   yalnızca hero bölümündeyken örtü `:root` açık temasından okuyordu. Koyu
   sahne sisli bir açık griye dönüyordu. Çözüm: tema bağlamı kapsayıcıya
   taşındı; atlas bölümü kendi `theme-light` sınıfıyla bağlamı geri alıyor.

3. **Geçişin ORTASINDA hiçbir metin rengi kazanamıyor.** Zemin koyudan açığa
   giderken ortada gri oluyor; açık metin de koyu metin de aynı anda düşük
   kontrastta kalıyor. Bu bir RENK sorunu değil, ZAMANLAMA sorunudur. Çözüm:
   son yolculuk adımı ekrandan çıkmadan tema geçişi BAŞLAMAZ (devir bandı bu
   iş için vardır), ayrıca adım metni `--u-theme` ile ters yönde döner.

**Kural olarak kayda geçiyor:** zemin rengi animasyonla değişiyorsa, o
aralıkta ekranda okunması gereken metin BULUNMAMALIDIR.

## Değerlendirilip seçilmeyenler (S15-R2)

| Seçenek                          | Neden seçilmedi                                                                |
| -------------------------------- | ------------------------------------------------------------------------------ |
| CSS 3B katmanlı SVG (S15-R1)     | Ekranda derinlik üretmiyor; ölçüldü ve reddedildi.                             |
| Hazır sahne servisi (Spline vb.) | Harici runtime isteği ve üçüncü taraf asset; talimatta açıkça yasak.           |
| OGL / kendi WebGL sarmalayıcımız | ~40 KB tasarruf; buna karşılık tüp geometrisi, eğri örnekleme ve materyal      |
|                                  | altyapısını elle yazmak gerekiyor. Bütçe zaten tavanın çok altında.            |
| `MeshStandardMaterial` + ışıklar | Shader yığınını büyütüyor; istenen görünüm zaten fresnel kenar + katkılı akış. |

## Backlog üzerindeki etki

`VISUAL_POLISH_BACKLOG.md` içindeki "ağır WebGL yok" maddesi **geçersizdir**.
Yerine geçen kural: WebGL kullanılır, ancak (a) dinamik yüklenir, (b) kritik
metni bloklamaz, (c) ölçülen bir gzip tavanı altında kalır, (d) her
başarısızlık biçiminde statik bir son kompozisyona düşer.
