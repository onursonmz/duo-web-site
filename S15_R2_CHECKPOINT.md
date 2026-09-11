# S15-R2 — Görsel checkpoint raporu (yalnızca HERO)

**Durum:** görsel onay bekleniyor. Merge, tag, deploy ve push YOK.
**Branch:** `duosis-web/s14-s15-signature-release` (ileri yönlü commit, geçmiş
değiştirilmedi)
**Kapsam:** ana hero + Hero → Çözüm Atlası geçişi. Ürün evreni ve diğer
sayfalar bilinçli olarak GELİŞTİRİLMEDİ.

---

## 1. Ne reddedildi, ne değişti

S15-R1 checkpoint'i "kodda 3B var, ekranda derinlik yok" gerekçesiyle
reddedildi. Bu revizyonda savunulan bir şey yok; değişen şey ekrana çıkan
görüntü:

| S15-R1 (reddedildi)                        | S15-R2                                                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------- |
| CSS 3B katmanlı SVG şeması                 | Three.js r182 ile gerçek perspektif kamera sahnesi                                    |
| Metin solda, şema sağdaki kutuda           | Tuval viewport'un TAMAMI; metin sahnenin üstünde güvenli alanda                       |
| Kamera neredeyse sabit                     | Açılışta kendi hareketi + scroll'a bağlı kamera yolculuğu                             |
| Bölüm geçişi = V biçimli ayraç             | Kamera çekirdekten GEÇİYOR, sahne açılıyor, yollar atlasın ray geometrisine DÖNÜŞÜYOR |
| Hareket yalnız opacity + stroke-dashoffset | position, rotation, scale, camera depth, gerçek perspektif                            |

Render kararı **ADR-014**'te ikinci kez açıldı ve değiştirildi
(`docs/decisions/ADR-014-signature-experience.md`, "S15-R2 revizyonu"
bölümü). S15-R1 gerekçesinin nerede hatalı olduğu orada açıkça yazılı.

---

## 2. Sahne — Duosis Operational Universe

`src/lib/scene/universe.ts` (~900 satır). Sahnedeki HER gövde koddan üretilir;
hazır model, stok asset veya dış kaynak yoktur.

| Nesne              | Geometri                                        | Anlamı                           |
| ------------------ | ----------------------------------------------- | -------------------------------- |
| Perspektif ızgara  | `LineSegments` (zemin + üst hat)                | mekân, derinlik referansı        |
| Beş kaynak         | `OctahedronGeometry` + iki `TorusGeometry`      | metrik, log, event, trace, alarm |
| Veri yolları       | `TubeGeometry` (Catmull-Rom eğri)               | sinyal akışı                     |
| Sinyal paketleri   | `InstancedMesh` (33 örnek)                      | yolda ilerleyen tekil sinyaller  |
| Intelligence Core  | fasetli ikosahedron + yarı saydam kabuk + kafes | Duosis mühendislik çekirdeği     |
| Üç halka           | `TorusGeometry`, üç ayrı hız ve eksen           | korelasyon katmanları            |
| Bağlam telleri     | `LineSegments`, sırayla açılan segmentler       | ortak kimlik / korelasyon        |
| Karar geçidi       | iki `TorusGeometry` yayı + ışık düzlemi         | bakır karar noktası              |
| Aksiyon portalı    | altıgen `TorusGeometry` + onay çemberi          | onaylı otomasyon                 |
| Geri besleme       | `TubeGeometry`, yavaş paketler                  | aksiyonun sisteme dönüşü         |
| Işık katmanı + sis | `ShaderMaterial` düzlem + `FogExp2`             | atmosfer                         |

**Renkler tasarım sisteminden okunur.** `readTokens()` koyu temalı bir DOM
öğesinden `--surface-sunken`, `--signal`, `--decision`, `--action`,
`--border-subtle`, `--surface-inverse`, `--text-inverse` değerlerini alır.
Sahnede marka rengi sabitlenmez.

**Tasarım sınırlarına uyum:** rastgele parçacık alanı yok (hareket eden her
nesne tanımlı bir yol üzerinde), gradient küre yok (çekirdek fasetli gövde +
kafes), sahte terminal yok, cyberpunk oyun arayüzü yok. Turuncu yalnızca
aksiyon portalının merkezindeki onay parıltısında ve birincil CTA'da kullanılır;
çerçeveler bakırdır.

---

## 3. Açılış sekansı (ölçülen)

| Zaman  | Ne olur                                                                |
| ------ | ---------------------------------------------------------------------- |
| 0–1 sn | Karanlık mekân, uzak ızgara ve katmanlar. H1 ve CTA ZATEN okunur.      |
| 1–3 sn | Beş kaynak farklı derinliklerde belirir; cyan sinyaller yola çıkar.    |
| 3–5 sn | Halkalar hizalanır, bağlam telleri kurulur, çekirdek enerji verir.     |
| 5–6 sn | Bakır karar geçidi açılır; tek bir sinyal aksiyona ilerler.            |
| 6 sn + | Sahne durmaz: yavaş çevresel dönüş, sürekli akış, işaretçi parallaksı. |

Kanıt kareleri: `evidence/s15-r2/02-frame-start.png` (0,9 sn),
`03-frame-core.png` (4,4 sn), `04-frame-action.png` (6,6 sn).

---

## 4. Hero → Çözüm Atlası geçişi

İkisi **tek bir yapışkan sahnenin** içinde yaşar; aralarında `SectionBridge`
yoktur (test bunu ölçüyor). Scroll ilerlemesi `p` ∈ [0, 1]:

| `p`       | Kamera / sahne                                                       |
| --------- | -------------------------------------------------------------------- |
| 0,00–0,26 | hero duruşu; beş yolculuk adımı sırayla maskeyle açılır              |
| 0,26–0,70 | kamera çekirdeğe ilerler, halkalar viewport'a doğru büyür            |
| 0,70–0,81 | kamera çekirdeğin İÇİNDEN geçer                                      |
| 0,70–0,95 | veri yolları düzleşir (`aFlat` + `uFlat`, vertex shader)             |
| 0,80–0,95 | zemin koyudan açığa döner; sis, ızgara ve metin aynı eğride çevrilir |
| 0,95–1,00 | beş ray + kolon bağlantıları; Çözüm Atlası zeminini devralır         |

Scroll **doğal**: sahne kodunda `wheel`, `touchmove` veya `mousewheel`
dinleyicisi yoktur ve bu `addEventListener` sarmalanarak ölçülür. Yapışkanlık
tamamen CSS'tir.

Kanıt karesi: `evidence/s15-r2/05-frame-transform.png` — düzleşmiş raylar ve
kolon çizgisi atlasın satır geometrisine bağlanıyor.

---

## 5. Kompozisyon ve başlık

- Tuval hero'nun TAMAMINI kaplar (`canvasW ≥ 0.99`, `canvasH ≥ 0.99` ölçüldü).
- Metin sol tarafta kontrollü bir güvenli alanda durur; okunurluk kart veya
  kenarlıkla değil, kontrollü bir ışık düşüşüyle (`--u-theme` ile sönen örtü)
  kurulur.
- **Başlık artık hero'nun üstüne biniyor** (`site-header--overlay`,
  `position: absolute`, şeffaf zemin, koyu tema). Hero ile başlık arasındaki
  beyaz şerit kalktı. Diğer sayfalarda başlık değişmedi.
- Mono etiketler sahneye serpiştirilmedi: sinyal türleri metnin altında tek
  satırlık dekoratif bir künyedir.

---

## 6. Mobil, fallback ve hareket azaltma

Tek düzen, üç çizim kipi — track yüksekliği her kipte AYNI, bu yüzden sahne
açıldığında hiçbir şey yer değiştirmez.

| Kip      | Ne zaman                                                   | Ne görünür                        |
| -------- | ---------------------------------------------------------- | --------------------------------- |
| `poster` | GPU yok · WebGL yok · JS yok · `save-data` · context kaybı | statik SVG son kompozisyon        |
| `live`   | gerçek donanım hızlandırma                                 | WebGL sahnesi çalışır             |
| `static` | `prefers-reduced-motion: reduce`                           | WebGL'in TEK karesi; kamera durur |

- **Mobil:** evren KALDIRILMAZ, küçültülür. Segment ve paket sayısı düşer,
  kamera kompozisyonu ortalanır ve aşağı kayar; sahne ilk ekranın üst
  üçte birinde okunur. Ölçülen yatay taşma: 0 px (390×844).
- **DPR tavanı 1,5**, ölçüldü.
- **Gizli sekmede** (`visibilitychange`) ve **viewport dışında**
  (`IntersectionObserver`) render döngüsü durur.
- **`webglcontextlost`** yakalanır, döngü durur, sahne postere döner.
- **Hareket azaltmada** yolculuk bandı da kısalır: kamera durduğu için uzun bir
  scroll bandının anlamı kalmaz. Anlamlı son kompozisyon ve beş adımın tamamı
  ekranda kalır.

### Yetenek kapısı — S15-R2a'da YENİDEN YAZILDI

**Bildirilen sorun:** kullanıcı projeyi localhost'tan normal Chrome ile
açtığında sahne sabit görünüyordu.

**Kök neden:** kapı GÜVENİLMEZ sinyallere bakıyordu.

1. `WEBGL_debug_renderer_info` ile okunan GPU sürücü ADI. Bu dizge gizlilik
   nedeniyle maskelenebiliyor, ANGLE katmanında farklı yazılıyor ve sürücü
   sürümüne göre değişiyor. "swiftshader / llvmpipe / basic render" araması
   WebGL'i sorunsuz çalıştıran normal Chrome'ları da eleyebiliyordu.
2. `failIfMajorPerformanceCaveat: true`. Sürücüden sürücüye farklı davranıyor;
   ölçüldü, aynı bayrak başsız Chromium'da SwiftShader'a rağmen context
   VERİYOR, bazı gerçek GPU'larda ise REDDEDEBİLİYOR.

Bu iki sinyal donanım SINIFLANDIRMASI yapıyordu; yapması gereken ise yalnızca
YETENEK ölçmekti.

**Yeni kapı — tek soru:** tarayıcı bir WebGL context'i veriyor mu?

```
webgl2 denenir -> olmazsa AYNI tuvalde webgl denenir -> yoklama context'i bırakılır
```

Başka hiçbir şeye bakılmaz. Sahnenin AÇILMAMASININ tek nedeni şunlardan biri
olabilir ve hepsi teşhis tablosuna yazılır:

| Neden                           | Davranış                               |
| ------------------------------- | -------------------------------------- |
| WebGL context oluşmuyor         | `poster`                               |
| `navigator.connection.saveData` | `poster`                               |
| `?universe=off`                 | `poster` (yalnız hata ayıklama için)   |
| `prefers-reduced-motion`        | `static` — sahne çizilir, KAMERA durur |

Normal Chrome'da (`reduce` kapalı, WebGL var, sekme görünür, canvas viewport
içinde) sahne **kesinlikle** başlar.

### Performans artık ÖLÇÜLEREK ele alınıyor

İsim tahmini yerine kare süresi ölçülüyor. Isınma penceresinden (500 ms, shader
derlemesi) sonra her 600 ms'de gerçek kare hızı hesaplanır:

| Kademe   | DPR             | Kare atlama |
| -------- | --------------- | ----------- |
| `high`   | `min(dpr, 1.5)` | yok         |
| `medium` | 1,0             | yok         |
| `low`    | 0,75            | 1 kare atla |

24 fps altına düşerse bir kademe inilir. En düşük kademede hâlâ 18 fps altıysa
sahne kendini kapatır ve statik postere döner. Kademeler yalnızca aşağı iner;
salınım yoktur. `?universe=force` bu vazgeçmeyi kapatır (kanıt üretimi ve
testler için).

Ölçülen davranış:

| Ortam                                 | Kademe | Kare süresi | Durum  |
| ------------------------------------- | ------ | ----------- | ------ |
| Gerçek GPU (Intel HD 520, Direct3D11) | `high` | ~16,7 ms    | `live` |
| Başsız Chromium (SwiftShader)         | `low`  | ~47 ms      | `live` |

### Teşhis tablosu

Yerel makinede (`localhost`, `127.0.0.1`, `[::1]`) veya `?universe=debug` ile
konsola **tek bir** `console.table` düşer. Arayüze hiçbir öğe eklenmez; canlı
alan adında hiçbir şey yazılmaz.

```
1 prefersReducedMotion    false
2 webgl                   true
3 webgl2                  true
4 visibilityState         "visible"
5 saveData                false
6 kapi                    "acik"
7 rendererOlusturuldu     true
8 sahneModuluIndi         true
9 moduleSuresiMs          176
10 dongyuBasladi          true
11 kalite                 "high (189 kare, ~17 ms)"
12 scrollAraligiPx        3600
13 scrollProgress         0.3333
14 scrollProgressDegisti  true
15 durum                  "live"
16 fallbackNedeni         ""
```

Ayrıca konsoldan `__duosisUniverse.inspect()` anlık kare süresini, kalite
kademesini ve scroll ilerlemesini verir.

> ÖLÇÜLEN AYRINTI: `import.meta.env.DEV`, Astro'nun bileşen `<script>` boru
> hattında `astro dev` altında bile **false** geliyor. Bu yüzden "geliştirme"
> koşulu ona bağlanamadı; ölçüt sunucunun kendisi (yerel makine) oldu.

### Kullanıcının çalıştıracağı kesin komut ve URL

Üretim çıktısı (ölçümlerin yapıldığı yol):

```
pnpm build
pnpm preview
```

→ **http://localhost:4321/**

Geliştirme sunucusu:

```
pnpm dev
```

→ **http://localhost:4321/**

İkisi aynı portu kullanır; aynı anda çalıştırılamaz. Teşhis için DevTools
konsolunu açın (tablo sayfa açıldıktan ~2,5 saniye sonra düşer). Konsolu
kapalı tutmak isterseniz `http://localhost:4321/?universe=debug` de aynı
tabloyu yazar.

Sahne hâlâ sabit görünüyorsa tabloya bakın:

| Tabloda gördüğünüz               | Anlamı ve çözümü                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------ |
| `1 prefersReducedMotion: true`   | Windows > Erişilebilirlik > Görsel efektler > **Animasyon efektleri** açın. Sahne bilerek donar. |
| `2 webgl: false`                 | `chrome://gpu` — donanım hızlandırma kapalı veya sürücü engelli.                                 |
| `5 saveData: true`               | Chrome'da veri tasarrufu açık.                                                                   |
| `15 durum: "live"`, kalite `low` | Sahne çalışıyor ama makine zorlanıyor; kalite düştü.                                             |
| `16 fallbackNedeni` dolu         | Tam neden orada yazılı.                                                                          |

### Doğrulanan matris

Başlı Chrome, gerçek GPU, Windows grafik hızlandırması açık, DevTools kapalı,
1440×900, `reduce` kapalı:

| Senaryo                       | Durum    | Kademe | Kare süresi | Scroll aralığı | Sahne açıldı |
| ----------------------------- | -------- | ------ | ----------- | -------------- | ------------ |
| `pnpm dev` ilk yükleme        | `live`   | high   | 16,6 ms     | 3600 px        | 1138 ms      |
| `pnpm dev` hard refresh       | `live`   | high   | 16,7 ms     | 3600 px        | 529 ms       |
| `pnpm dev` 2. ziyaret (cache) | `live`   | high   | 16,7 ms     | 3600 px        | 456 ms       |
| preview ilk yükleme           | `live`   | high   | 16,7 ms     | 3600 px        | 697 ms       |
| preview hard refresh          | `live`   | high   | 16,7 ms     | 3600 px        | 457 ms       |
| preview 2. ziyaret (cache)    | `live`   | high   | 16,6 ms     | 3600 px        | 466 ms       |
| preview + reduced-motion      | `static` | —      | —           | —              | beklenen     |

Scroll ilerlemesi ilk yüklemede doğru kuruluyor: üç ardışık başlı oturumda
`scrollY = 0`, `progress = 0`, yolculuk bandı 3600 px ölçüldü. 1200 px
kaydırıldığında `progress = 0,3333` ve `scrollProgressDegisti = true`.

### Kabul edilen yan etki: CI süresi

Kapı gevşediği için başsız tarayıcıda sahne artık GERÇEKTEN çalışıyor (düşük
kademede, ~47 ms/kare). Ölçülen bedel: aynı dört süit 4,0 dakikadan **7,2
dakikaya** çıktı.

Bu bilinçli bir takas. Alternatif, GPU adına bakan eski kapıyı geri getirmekti;
o kapı tam olarak bu revizyonun düzelttiği hatayı üretiyordu. Tam süit için
ileride yapılabilecek doğru hafifletme, ÜRETİM davranışını değiştirmeden test
koşucusuna `?universe=off` verdirmektir (yükleyici bu parametreyi zaten
tanıyor); bu checkpoint'in kapsamı dışında bırakıldı.

### Açılış iki yoldan tetiklenir

`requestAnimationFrame` normal durumda kazanır. Sekme ARKA PLANDA açıldıysa
rAF hiç çalışmaz; bu yüzden 1200 ms'lik bir zamanlayıcı da kurulur ve `booted`
bayrağı ikisinin birden çalışmasını engeller. Açılış tek bir zamanlayıcıya
bağlı değildir.

## 7. Ölçülen performans

### Bütçeler

| Kalem                           | Ölçülen      | Tavan (§9) | Durum |
| ------------------------------- | ------------ | ---------- | ----- |
| Ana sayfa istemci JS (gzip)     | **134,5 KB** | 220 KB     | ✓     |
| — sahne yığını `universe.*.js`  | 134,2 KB     | —          |       |
| — yükleyici (satır içi + dosya) | ~1,4 KB      | —          |       |
| İlk yük toplamı                 | ~0,8 MB      | 1,5 MB     | ✓     |
| Harici runtime isteği           | **0**        | 0          | ✓     |
| Renderer DPR tavanı             | **1,5**      | 1,5        | ✓     |
| H1 ve CTA ilk HTML'de           | evet         | zorunlu    | ✓     |
| Konsol hatası                   | **0**        | —          | ✓     |

Bütçe ölçümü elle yazılmış bir sayı değil: `tests/e2e/hero.spec.ts` derleme
çıktısındaki dosyaları `gzipSync` ile sıkıştırıp toplar.

### Lighthouse (mobil, varsayılan simülasyon)

Ana sayfa, üç koşu. Sahne yığını HER koşuda indirildi (ağ izinde doğrulandı) —
yani rakamlar EN KÖTÜ durumu, yani sahnenin çalıştığı yolu gösteriyor.

| Metrik  | S14-S15 temel çizgisi | S15-R2           | Tavan (§9) | Durum                   |
| ------- | --------------------- | ---------------- | ---------- | ----------------------- |
| **LCP** | 2,71 sn               | **2,70–2,71 sn** | < 2,5 sn   | ✗ (temel çizgiyle AYNI) |
| **CLS** | 0,000                 | **0,000**        | < 0,05     | ✓                       |
| FCP     | 1,96 sn               | 2,11 sn          | —          |                         |
| TBT     | 0 ms                  | 528–903 ms       | —          | bkz. aşağıdaki not      |
| Perf    | 93                    | 73–81            | —          |                         |

Temel çizgi: `evidence/s14-s15/lighthouse/home.report.json` (bu çalışmadan
ÖNCEKİ ölçüm).

**LCP tavanın üstünde ve bu YENİ bir sorun değil.** Değişimden önce de 2,71
saniyeydi; WebGL sahnesi LCP'yi ölçülebilir biçimde etkilemiyor (LCP öğesi
H1'dir, animasyonu yoktur ve sahne ilk boyamadan SONRA yükleniyor). Darboğaz
LCP'nin kendisi değil FCP: kritik yol yazı tipi ve CSS ile sınırlı. Yazı tipi
stratejisi bu checkpoint'in kapsamında değil; onaydan sonraki turda ele
alınmalı.

**TBT ise GERÇEK bir maliyet.** Temel çizgide 0 ms'ti; sahne three.js'i
ayrıştırıp geometriyi kuruyor ve bu ana iş parçacığında zaman harcıyor. Bu
makinede ölçüm çok oynak (aynı yapı için 528 / 688 / 765 / 776 / 903 ms), bu
yüzden tek bir sayı vermek yanıltıcı olur; büyüklük mertebesi birkaç yüz
milisaniyedir.

Sahneyi `requestIdleCallback` ile geciktirmek DENENDİ ve ÖLÇÜLDÜ: LCP ve CLS
değişmedi, TBT iyileşmedi, yalnızca açılış sekansı geç başladı. Değişiklik
geri alındı; gerekçe kodda kayıtlı.

## 8. Çalıştırılan testler

Talimat gereği **full E2E koşulmadı**. Koşulanlar:

| Süit                              | Sonuç                                                             |
| --------------------------------- | ----------------------------------------------------------------- |
| `pnpm format:check`               | temiz                                                             |
| `pnpm lint`                       | temiz                                                             |
| `pnpm typecheck`                  | 0 hata, 0 uyarı (197 dosya)                                       |
| `pnpm test` (unit, 500 test)      | temiz (token denetiminde bulunan bir eski ihlal düzeltildi)       |
| `tests/e2e/hero.spec.ts`          | chromium — hero smoke, konsol, taşma, reduced-motion, bütçe, a11y |
| `tests/e2e/motion-system.spec.ts` | chromium                                                          |
| `tests/e2e/homepage.spec.ts`      | chromium                                                          |
| `tests/e2e/smoke.spec.ts`         | chromium                                                          |

### Testlerde bilinçli değiştirilen üç güvence

1. **"Satır içi modül < 8 KB"** kaldırıldı. Sahne artık ayrı bir dinamik
   yığın; doğru güvence sayfanın TOPLAM istemci JS'ini gzip ile ölçmektir.
2. **"Beş aşama başlığı ilk ekranda"** kaldırıldı. Aşamalar artık ilk ekranın
   süsü değil, kamera yolculuğunun anlatısıdır ve kasıtlı olarak katlamanın
   altındadır. İlk ekranda olması ölçülen küme: H1, açıklama, iki CTA.
3. **"Sinyal etiketleri portlarla hizalı"** kaldırıldı. Sahnede serpiştirilmiş
   etiket kalmadı.

### Sıra değişikliği

`main section[id]` sırası `hero → solutions → trust → …` oldu (önce
`hero → trust → solutions`). Gerekçe: hero ile atlas TEK sahnenin içinde;
araya bölüm girerse süreklilik kopar. İçerik değişmedi, yalnızca sırası.

---

## 9. Bu koşuda bulunan üç üretim hatası

Üçü de tahminle değil, ekran görüntüsü alınıp DOM ölçülerek bulundu. Ayrıntı
ADR-014'te.

1. **Düzleşen raylar `p = 1`'de kayboluyordu.** Köşeler vertex shader'da
   taşınıyor, üç.js ise budamayı BAŞLANGIÇ sınır küresiyle yapıyor → mesh
   kameranın arkasında sanılıp tamamen budanıyordu.
2. **Okunurluk örtüsü sahnenin üstüne açık gri boyuyordu.** `theme-dark`
   yalnızca hero bölümündeyken örtü `:root` açık temasından okuyordu.
3. **Geçişin ortasında hiçbir metin rengi kazanamıyor.** Zemin gri olduğu için
   bu bir renk değil ZAMANLAMA sorunu; son adım ekrandan çıkmadan tema geçişi
   başlamıyor.

---

## 10. Kanıt paketi

`evidence/s15-r2/` — gerçek GPU üzerinde (Intel HD 520, Direct3D11), başsız
DEĞİL, hiçbir zorlama parametresi olmadan üretildi.

| Dosya                         | Ne gösterir                                                        |
| ----------------------------- | ------------------------------------------------------------------ |
| `01-hero-1440x900.png`        | 1440×900 ilk açılış ekranı (sekans oturmuş)                        |
| `02-frame-start.png`          | başlangıç: uzak katmanlar, H1 ve CTA okunur                        |
| `03-frame-core.png`           | Core aktif: halkalar hizalandı, bağlam kuruldu                     |
| `04-frame-action.png`         | karar geçidi açık, sinyal aksiyona bağlandı                        |
| `05-frame-transform.png`      | section dönüşümü: düzleşen yollar atlasın ray geometrisine dönüştü |
| `video/01-hero-to-atlas.webm` | **19,6 sn** kesintisiz: ilk açılıştan geçişin sonuna kadar         |
| `evidence.json`               | üretim kaydı (konsol hatası: 0)                                    |

Her karede `scrollY` ve `innerHeight` kayda geçirilir (`evidence.json`):
dördü de `scrollY = 0`, `innerHeight = 900`. Bu denetim, bir koşuda sayfanın
~400 piksel kaymış başladığı ÖLÇÜLDÜKTEN sonra eklendi; o koşuda hero kareleri
H1'siz çıkmıştı.

Çerez bandı kanıt oturumunda önceden karara bağlandı (analitik KAPALI); bant
sahnenin alt şeridini kapatıyordu. Sayfanın davranışı değişmedi.

Kanıtın üretildiği derleme `c04b320` commit'ine aittir. Sonrasında yalnızca bu
rapor güncellendi; derleme çıktısı değişmedi.

---

## 11. Bu checkpoint'te BİLİNÇLİ OLARAK yapılmayanlar

Talimatın 10. maddesi gereği:

- Ürün evreni (dört ürün istasyonu, kamera ile ürün seçimi) — geliştirilmedi.
- Ürün detay sayfaları, sayfa geçişleri (View Transitions) — dokunulmadı.
- Diğer sayfalara yayma — yapılmadı.
- Full E2E (1100+), Lighthouse, SEO raporu, final paket — çalıştırılmadı.
- Push, merge, tag, deploy — yapılmadı.

Görsel yön onaylandıktan sonra sıradaki iş: ürün evreni (§6), sonra mobil
ince ayar (§8) ve yayma.
