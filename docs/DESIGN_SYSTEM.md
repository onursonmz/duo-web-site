# Command Atlas — Tasarım Sistemi

Duosis web sitesinin token, tipografi ve temel bileşen sözleşmesi.
Canlı önizleme: `/design-system/` (**noindex**, yalnızca geliştirme).

---

## 1. Karakter

Klasik, keskin, premium, sakin. Editorial ızgara + operasyon merkezi hassasiyeti.

**Kullanılmayanlar:** oyun arayüzü ve cyberpunk estetiği, aşırı neon, cam
efektleri, peş peşe kart gridleri, mor/mavi gradient küreler, parçacık
animasyonları, sahte terminal metinleri, otomatik kayan logo şeritleri.

**Kullanılanlar:** büyük tipografi, ince çizgiler, kontrollü asimetri, güçlü
boşluk ritmi, görünür kolon sistemi. Bir bölümde tek baskın kompozisyon ilkesi.

Gölge yerine **border + kontrast + katman**. Radius `0–6px`; yalnızca işlevsel
kontrollerde (buton, input) üst sınıra çıkar.

---

## 2. Renk

### Ölçülen marka kaynakları

Değerler `duosis-logo.pdf` içerik akışından çıkarılmıştır (bkz.
[`source-materials/SOURCE_MATERIALS.md`](source-materials/SOURCE_MATERIALS.md)).

| Token              | Değer     | Beyaz üzerinde |
| ------------------ | --------- | -------------: |
| `--brand-cyan`     | `#16a6de` |     **2.78:1** |
| `--brand-cyan-alt` | `#16a6d9` |     **2.80:1** |
| `--brand-ink`      | `#252a2e` |        14.49:1 |

> **Kısıt:** her iki cyan tonu da açık yüzeyde WCAG 2.2 AA'yı geçmez — normal
> metin eşiğini (4.5:1) de, büyük metin/UI eşiğini (3:1) de. Bu yüzden açık
> yüzeyde **yalnızca logo geometrisinin parçası olarak dekoratif kalır**.
> Metin ve link için türetilmiş `--signal` kullanılır.

### Türetilmiş palet — açık yüzey

| Token               | Değer     | `--surface-canvas` üzerinde | Sonuç              |
| ------------------- | --------- | --------------------------: | ------------------ |
| `--text-primary`    | `#14181c` |                     16.63:1 | AA / AAA           |
| `--text-secondary`  | `#4a545e` |                      7.20:1 | AA / AAA           |
| `--text-muted`      | `#5d6874` |                      5.29:1 | AA                 |
| `--signal`          | `#0f7197` |                      5.11:1 | AA + güvenlik payı |
| `--action`          | `#a44f0e` |                      5.29:1 | AA + güvenlik payı |
| `--status-success`  | `#1a8246` |                      4.53:1 | AA                 |
| `--status-warning`  | `#986800` |                      4.54:1 | AA                 |
| `--status-critical` | `#d03939` |                      4.53:1 | AA                 |
| `--border-strong`   | `#767f8a` |                      3.78:1 | AA (UI bileşeni)   |

### Türetilmiş palet — koyu yüzey

Koyu yüzeyde **orijinal marka cyanı** signal olarak kullanılır.

| Token              | Değer     | `--surface-canvas` üzerinde | Sonuç            |
| ------------------ | --------- | --------------------------: | ---------------- |
| `--text-primary`   | `#eef1f4` |                     15.74:1 | AA / AAA         |
| `--text-secondary` | `#aab4bf` |                      8.49:1 | AA / AAA         |
| `--text-muted`     | `#8b96a2` |                      5.93:1 | AA               |
| `--signal`         | `#16a6de` |                  **6.41:1** | AA               |
| `--action`         | `#e06b12` |                      5.34:1 | AA               |
| `--border-strong`  | `#68727d` |                      3.65:1 | AA (UI bileşeni) |

### Focus

`--focus-ring: #0f86b4` — **tek değer**, her iki yüzeyde de WCAG 2.2 SC 1.4.11
eşiğini geçer:

| Yüzey       |   Oran |
| ----------- | -----: |
| Açık canvas | 3.85:1 |
| Açık raised | 4.13:1 |
| Açık sunken | 3.61:1 |
| Koyu canvas | 4.32:1 |
| Koyu raised | 3.93:1 |
| Koyu sunken | 4.52:1 |

3px kalınlık + 2px offset kullanılır; offset sayesinde kontrast bileşenin kendi
rengine değil **yüzeye** karşı ölçülür.

### Kurallar

- Bileşenler **ham renk yazmaz**; yalnızca semantic token okur.
  `tests/unit/tokens.test.ts` bunu denetler ve ham hex kullanımını reddeder.
- Açık/koyu ayrımı bileşenin içinde değil **tema bağlamında** çözülür:
  `<Section tone="dark">` bir sınıf uygular, bileşenler aynı token adlarını okur.
- Renk **tek başına anlam taşımaz**: her durum etiketinin metni ve şekil işareti
  vardır; hata alanında renk + metin + simge birlikte kullanılır.
- Action Orange **düşük sıklıkta**, yalnızca aksiyon vurgusunda.
- **Güvenlik payı:** açık yüzeyde `--signal` ve `--action` için taban AA (4.5:1)
  değil **4.75:1**; `--signal` ayrıca **5.0:1** hedefini tutar. 4.51 gibi sınır
  değerler küçük bir yüzey değişikliğinde eşiğin altına düşer. Ton (HSL H/S)
  marka cyanıyla aynı bırakıldı; yalnızca açıklık düşürüldü.
- Tüm oranlar testte **yeniden hesaplanır**; token değeri değişirse test düşer.

---

## 3. Tipografi

**En fazla iki aile.** Harici CDN bağımlılığı **yoktur**; ikisi de self-host edilir.

| Aile               | Rol                              | Sürüm              | Lisans                    |
| ------------------ | -------------------------------- | ------------------ | ------------------------- |
| **Inter**          | Ana sans (değişken, 100–900)     | Google Fonts `v20` | SIL Open Font License 1.1 |
| **JetBrains Mono** | Sınırlı sistem etiketi (400–700) | Google Fonts `v24` | SIL Open Font License 1.1 |

### WOFF2 kaynakları

Dosyalar `fonts.gstatic.com` üzerinden bir kez indirilip repoya alınmıştır.
Çalışma zamanında `fonts.googleapis.com` veya `fonts.gstatic.com`'a **hiçbir
istek yapılmaz** (e2e testi bunu doğrular).

| Dosya                                         |    Boyut | SHA-256                                                            |
| --------------------------------------------- | -------: | ------------------------------------------------------------------ |
| `public/fonts/inter-latin.woff2`              | 48.256 B | `3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62` |
| `public/fonts/inter-latin-ext.woff2`          | 85.068 B | `34b9c504cab7a73e37b746343a449132e56cf7b5481af2cb81dc74dcff25c956` |
| `public/fonts/jetbrains-mono-latin.woff2`     | 31.432 B | `83c005d49d8a6a50474c73a5a36ac0468076e9c4a29da7bdb14995d80560a5be` |
| `public/fonts/jetbrains-mono-latin-ext.woff2` | 11.624 B | `db5ff4db83e580426280e9337a58dc57d3a83784a1b03ad80914651594441d52` |

**Neden iki alt küme:** Türkçe `ş/ğ/İ` karakterleri `latin-ext` aralığında
(U+011E-011F, U+015E-015F, U+0130); `ı` (U+0131) ise `latin` aralığında. Tek alt
küme Türkçe metni karşılamaz. Tarayıcı `unicode-range` sayesinde yalnızca
gereken dosyayı indirir.

### Ölçek

| Token        | Değer                                        | Kullanım              |
| ------------ | -------------------------------------------- | --------------------- |
| `--text-3xl` | `clamp(2.25rem, 1.6rem + 3vw, 3.75rem)`      | Hero başlığı          |
| `--text-2xl` | `clamp(1.75rem, 1.4rem + 1.6vw, 2.5rem)`     | Bölüm başlığı         |
| `--text-xl`  | `clamp(1.375rem, 1.2rem + 0.8vw, 1.75rem)`   | Alt başlık            |
| `--text-lg`  | `clamp(1.125rem, 1.05rem + 0.35vw, 1.25rem)` | Giriş metni           |
| `--text-md`  | `1rem`                                       | Gövde                 |
| `--text-sm`  | `0.875rem`                                   | İkincil               |
| `--text-2xs` | `0.75rem`                                    | Sistem etiketi (mono) |

Gövde satır uzunluğu `--container-text: 38rem` ile **55–75 karakter** aralığında
tutulur.

### Font yüklenmezse

`font-display: swap` + **metrik hizalanmış fallback** aileleri
(`Inter Fallback`, `JetBrains Mono Fallback`) `size-adjust`,
`ascent-override` ve `descent-override` ile Inter'e yaklaştırılmıştır.

E2E testi fontları `abort` ederek H1 yüksekliğini ölçer ve farkın **%10'un
altında** kaldığını doğrular — yani font takas edildiğinde satır sayısı ve
yükseklik değişmez, CLS oluşmaz.

---

## 4. Ölçek ve ızgara

4px tabanlı ritim: `--space-3xs` (4px) → `--space-3xl` (112px).

| Token              | Değer            |
| ------------------ | ---------------- |
| `--container-max`  | `76rem` (1216px) |
| `--container-text` | `38rem` (~608px) |
| `--grid-columns`   | `12`             |
| `--grid-gap`       | `--space-md`     |

---

## 5. Hareket

Mikro etkileşimler `160–360ms` (`--motion-fast` / `--motion-base` /
`--motion-slow`). Scrolljacking yoktur. Kritik bilgi yalnızca hover veya
animasyonla verilmez.

`prefers-reduced-motion: reduce` altında süreler **token seviyesinde 1ms'e
iner**; bileşenlerin ayrıca kural yazması gerekmez. Buton spinner'ının
animasyonu durur — bilgi `aria-busy` ve görünür metinle de verildiği için
anlam kaybı olmaz.

---

## 6. Bileşenler

| Bileşen          | Sorumluluk                                                               |
| ---------------- | ------------------------------------------------------------------------ |
| `Section`        | Tema bağlamı (`light`/`dark`), kapsayıcı genişliği                       |
| `Button`         | `primary` / `secondary` / `quiet`; `href` varsa `<a>`, yoksa `<button>`  |
| `SectionHeading` | Eyebrow + başlık + giriş; başlık seviyesi **çağıran** tarafından verilir |
| `Metric`         | Doğrulanmamış rakam onaylı görünmez; kaynak etiketi zorunlu              |
| `StatusLabel`    | Yalnızca gerçek durum bilgisi; renk + metin + şekil                      |
| `Quote`          | `verificationStatus !== "verified"` ise atıf yerine bekleme etiketi      |
| `LogoMark`       | Duosis logo varyantları; üçüncü taraf logosu bu bileşenden **geçmez**    |
| `FormField`      | Etiket her zaman görünür; hata `aria-describedby` + `aria-invalid`       |

### Buton hiyerarşisi

`primary` dolu (sayfada tek birincil eylem), `secondary` kenarlıklı, `quiet`
yalnızca metin + alt çizgi. **Her metin buton görünmez.**

Devre dışı bağlantı `href` taşımaz, `aria-disabled="true"` ve `tabindex="-1"`
alır — tıklanamaz ve odak sırasına girmez.

---

## 7. Erişilebilirlik sözleşmesi

| Kural                                       | Doğrulama                                       |
| ------------------------------------------- | ----------------------------------------------- |
| Tüm metin ve UI kontrastları AA             | `tests/unit/tokens.test.ts` (yeniden hesaplama) |
| Focus göstergesi her yüzeyde görünür        | Token testi + e2e computed style                |
| 320px ve 200% zoom'da yatay taşma yok       | e2e, 5 rota × 2 viewport                        |
| Geniş içerik sayfayı değil kendini kaydırır | `.scroll-x` + `tabindex="0"` + `role="region"`  |
| Klavye tab sırası belge sırasını izler      | e2e                                             |
| `prefers-reduced-motion`                    | e2e (token süreleri + spinner)                  |
| axe WCAG 2.2 AA ihlali yok                  | e2e, açık + koyu bölümler, 1440px ve 320px      |

`html { overflow-x: hidden }` **kullanılmaz**: taşmayı gizler ama sorunu
çözmez ve gerçek hataları testlerden saklar.

---

## 8. Bilinçli açıklar

- Palet **PROVISIONAL**: türetilen değerler marka sahibi onayı bekliyor
  (ADR-008). Ham logo renkleri değiştirilmemiştir.
- `/design-system/` yalnızca önizlemedir; global navigation, hero animasyonu ve
  tam ana sayfa **S03 kapsamı dışındadır**.
- CyclOps turkuazı bu sisteme dahil **edilmemiştir**; yalnızca CyclOps'a ait
  sınırlı tema bağlamında kullanılacaktır (S08).
