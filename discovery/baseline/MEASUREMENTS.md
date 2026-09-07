# Baseline Ölçüm Kayıtları — duosis.com

Ölçüm tarihi: **2026-09-07 / 2026-09-08**
Araçlar: `curl 8.16.0`, Chrome headless (`--headless=new`), Python 3.8.6 (metin/renk analizi)

Lighthouse CLI bu ortamda kurulu değil ve S00 kapsamı "bağımlılık kurulmaz" dediği için kurulmadı. Bunun yerine ham ağ ölçümü, DOM analizi ve WCAG kontrast hesabı yapıldı.

---

## Görsel kanıt

| Dosya | Görünüm | Boyut |
|---|---|---|
| `home-desktop-1440.png` | Ana sayfa, 1440px genişlik, tam sayfa | 3.121.481 B |
| `home-mobile-390.png` | Ana sayfa, 390px genişlik | 853.593 B |
| `hakkimizda-desktop-1440.png` | Hakkımızda, 1440px | 1.781.043 B |
| `iletisim-desktop-1440.png` | İletişim, 1440px | 338.565 B |

---

## Ağ ağırlığı — ana sayfa

| Kalem | Transfer | İstek |
|---|---:|---:|
| HTML | 182.723 B (178 KB) | 1 |
| CSS + JS (sıkıştırılmış) | 386.542 B (377 KB) | 73 |
| Görseller | 6.772.813 B (6,61 MB) | 28 |
| **Toplam** | **~7,17 MB** | **~102** |

### En ağır 10 script/stil

| Boyut | Kaynak |
|---:|---|
| 171,2 KB | `googletagmanager.com/gtag/js?id=G-C9DG54493V` |
| 44,3 KB | `js_composer.min.css` (WPBakery 8.0.1) |
| 29,7 KB | `jquery.min.js` 3.7.1 |
| 25,3 KB | `googlesitekit-consent-mode-*.js` |
| 13,1 KB | `flickity-all.min.js` |
| 10,6 KB | `owl.carousel.min.js` |
| 10,6 KB | `woodmart/css/parts/base.min.css` |
| 5,0 KB | `js_composer_front.min.js` |
| 4,8 KB | `jquery-migrate.min.js` |
| 4,2 KB | `contact-form-7/includes/js/index.js` |

### En ağır 6 görsel

| Boyut | Dosya |
|---:|---|
| 749 KB | `2024/06/apm.jpg` |
| 650 KB | `2024/06/devops.jpg` |
| 646 KB | `2024/07/Yazilim-Gelistirme3.jpg` |
| 575 KB | `2024/07/Konfigurasyon-ve-Varlik-Yonetimi5.jpg` |
| 515 KB | `2024/06/atm-kiosk-800x600.png` |
| 507 KB | `2024/07/raporve-gorsel.jpg` |

Format dağılımı: **18 JPG, 5 PNG, 3 SVG. WebP/AVIF: 0.**

---

## HTTP yanıt başlıkları (`curl -D -` ile alınan ham çıktı)

```
HTTP/1.1 200 OK
Server: nginx/1.22.1
Date: Mon, 07 Sep 2026 20:57:00 GMT
Content-Type: text/html; charset=UTF-8
Transfer-Encoding: chunked
Connection: keep-alive
Vary: Accept-Encoding
Link: <https://duosis.com/wp-json/>; rel="https://api.w.org/"
Link: <https://duosis.com/wp-json/wp/v2/pages/15>; rel="alternate"; ...
Link: <https://duosis.com/>; rel=shortlink
```

Güvenlik başlıkları: **hiçbiri mevcut değil** (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options / frame-ancestors).

---

## URL erişilebilirlik testi

54 URL tek tek çağrıldı:

- HTTP 200: **54 / 54**
- 3xx / 4xx / 5xx: **0**
- Duplicate URL: 0
- Boş URL: 0

Yani mevcut sitemap'te kırık bağlantı yok. (Sayfa **içi** bağlantılar ayrıca taranmadı — bu S13 redirect çalışmasının kapsamındadır.)

---

## Marka rengi ölçümü

Kaynak: `logo.svg`, `logo-white.svg` (SVG `fill` değerlerinden birebir okundu)

| Hex | RGB | HSL |
|---|---|---|
| `#16A6D9` | 22, 166, 217 | hsl(196, 82%, 47%) |
| `#16A6DE` | 22, 166, 222 | hsl(197, 82%, 48%) |
| `#252A2E` | 37, 42, 46 | hsl(207, 11%, 16%) |
| `#242A2F` | 36, 42, 47 | hsl(207, 13%, 16%) |

### WCAG 2.2 kontrast oranları

| Kombinasyon | Oran | AA normal (4.5:1) | AA büyük (3:1) |
|---|---:|---|---|
| `#16A6D9` üzerine beyaz zemin | 2.80:1 | FAIL | FAIL |
| `#16A6D9` üzerine `#252A2E` zemin | 5.17:1 | PASS | PASS |
| `#252A2E` üzerine beyaz zemin | 14.49:1 | PASS | PASS |
| Beyaz metin / `#16A6D9` buton | 2.80:1 | FAIL | FAIL |

Hesaplama WCAG 2.x relative luminance formülüne göre yapıldı (sRGB lineerleştirme + 0.2126/0.7152/0.0722 ağırlıkları).

---

## SEO baseline (54 sayfa)

| Ölçüm | Sonuç |
|---|---|
| Meta description eksik | 24 |
| H1 eksik | 2 |
| Birden fazla H1 | 0 |
| Tekrar eden title | 0 |
| Tekrar eden description | 5x DevOps metni, 2x ATM metni |
| JSON-LD blok sayısı (ana sayfa) | 1 |
| JSON-LD tipleri | Organization, WebSite, WebPage, Person, Article |

---

## İçerik tazeliği (sitemap `lastmod`)

| Yıl | URL |
|---:|---:|
| 2024 | 50 |
| 2025 | 2 |
| 2026 | 1 |

- Ana sayfa: 2024-08-07
- En yeni: `/ardoq/` 2026-02-20
- Blog yazıları: orijinal 2019-09-10 ve 2020-08-04, her ikisi 2024-06-23'te güncellenmiş
