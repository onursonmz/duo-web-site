# Kaynak materyaller — provenance ve kullanım sınıflandırması

Bu dosya, Duosis web sitesi için sağlanan **ham kaynak materyallerin** kaydıdır.
Ham dosyaların kendileri bu repoda **taşınmaz**; burada yalnızca hash, kaynak
bilgisi, kullanım sınıflandırması ve türetilen web varlıklarının izi tutulur.

Kanonik envanter: [`discovery/source-inventory.csv`](../../discovery/source-inventory.csv)

---

## 1. Depolama kararı

Repo **PRIVATE** ölçüldü (`gh repo view --json visibility` → `PRIVATE`).
Buna rağmen **daha katı** olan politika uygulanır:

| Karar                                               | Gerekçe                                                                                                                                                                                   |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Raw master'lar commit **edilmez**                   | Süregelen kısıt: kurumsal PPTX/PDF kaynakları sürüm kontrolüne alınmaz. Private repo her an public'e çevrilebilir; o an ham masterlar ve doğrulanmamış iddialar geriye dönük açığa çıkar. |
| Hash + provenance + sınıflandırma commit **edilir** | Denetlenebilirlik için yeterli; içerik sızdırmaz.                                                                                                                                         |
| Sanitize edilmiş web türevleri commit **edilir**    | Yalnızca gerçekten kullanılanlar (`public/brand/`, `public/fonts/`).                                                                                                                      |
| Kaynaklar `public/` altında **tutulmaz**            | Site build çıktısına kopyalanmaz; `dist/` içinde hiçbir master bulunmaz.                                                                                                                  |

`.gitignore` bunu zorlar: `*.pdf`, `*.pptx`, `*.ai`,
`duosis-10-yil-manifesto.html` ve `/Re_*/`.
`git check-ignore -v` ile altı kaynak dosyanın da yoksayıldığı doğrulanmıştır.

---

## 2. Kaynak listesi

### SRC-03 — `Cyclops_v1.pptx` (ASLİ KAYNAK — çalışma alanında YOK)

| Alan          | Değer                                                                              |
| ------------- | ---------------------------------------------------------------------------------- |
| Tür           | PPTX, 22 slayt                                                                     |
| SHA-256       | `964a6ee73d061cdcc09c436ad43198bbd2eb612388b8a5729e071a6be295435a`                 |
| Durum         | **Kullanıcı tarafından sağlandı fakat Claude çalışma alanında henüz mevcut değil** |
| Sınıflandırma | İçerik ve ürün ekranı kaynağı                                                      |

Hash, slayt sayısı ve format **kullanıcı beyanıdır**; bu çalışma alanında
ölçülememiştir. SRC-04 bunun yerine geçmez.

> **S08 ön koşulu:** asli PPTX, CyclOps sprintine başlanmadan önce çalışma
> alanına alınmalıdır. Bu eksiklik S03'ü bloklamaz.

### SRC-04 — `Cyclops_v1.pdf` (TÜREV KAYNAK)

| Alan          | Değer                                                              |
| ------------- | ------------------------------------------------------------------ |
| Tür           | PDF, 22 sayfa                                                      |
| Boyut         | 1.592.526 B                                                        |
| SHA-256       | `6a98ff91b4dcbeee70b050c8ab253f4e1b04a0b8974d9e817d676291b8feb5d7` |
| Sınıflandırma | İçerik ve ürün ekranı kaynağı                                      |

SRC-03'ün export'u **olabilir** (sayfa sayısı aynı); bu **doğrulanmamıştır**.
Ayrı bir türev kaynak olarak kaydedilir, asli PPTX'in yerine yazılmaz.

> **S08 notu.** S08 talimatı `Cyclops_v1.pdf` için SRC-03'ün (PPTX) hash'ini
> veriyordu; çalışma alanındaki PDF'in ölçülen hash'i farklıdır
> (`6a98ff91…b5d7`). PDF sessizce asli kaynak sayılmadı: ürün ekranları bu
> dosyadan çıkarıldı ve `src/assets/cyclops/MANIFEST.json` içinde gerçek hash
> ile kaydedildi. SRC-03 hâlâ eksiktir. Bkz. ADR-012 §1.

**Duosis global tasarım şablonu DEĞİLDİR.** CyclOps turkuazı yalnızca CyclOps'a
ait sınırlı tema bağlamında kullanılabilir; site geneline taşınmaz.

### SRC-05 — `duosis-10-yil-manifesto.html`

| Alan          | Değer                                                              |
| ------------- | ------------------------------------------------------------------ |
| Boyut         | 26.991 B                                                           |
| SHA-256       | `beb51261bceb4a707861a321ad1304e56f456e96e26b6f4414646553c3a4d049` |
| Sınıflandırma | Anlatı ve görsel yön kaynağı                                       |

İçindeki rakamlar **doğrulanmış kamu iddiası sayılmaz**. Tamamı truth matrix'e
**C28–C45** olarak tek tek işlenmiştir; hepsi
`source-present-owner-unverified` ve `publishableNow: NO`.

Görsel yön olarak ilham alınabilir (koyu yüzey, sinyal çizgileri, timeline,
teknik etiket yaklaşımı); **birebir kopyalanmaz**. Manifesto'nun vurgu rengi
`#2dd4bf` marka cyanı **değildir** ve tasarım sistemine taşınmamıştır.

### SRC-06 / SRC-08 — `duosis-logo.ai` ve `duosis-logo[64].ai`

| Alan    | Değer                                                              |
| ------- | ------------------------------------------------------------------ |
| Boyut   | 67.103 B (her ikisi)                                               |
| SHA-256 | `31c8a67324a7b70f9e97a4909472ab790424c77ee1a187e0f035993acebdda8a` |

**BYTE-IDENTICAL** — aynı SHA-256. İkisi birden kaynak sayılmaz; SRC-06 esas
alınır. Canlı metin taşır (`IT for More`), bu yüzden font bağımlılığı vardır.

### SRC-07 — `duosis-logo.pdf` (CANONICAL MASTER)

| Alan     | Değer                                                              |
| -------- | ------------------------------------------------------------------ |
| Boyut    | 69.405 B                                                           |
| SHA-256  | `b07bde333b66a31829a1016942000c7aef64dc24b98bce4fd340d1d4c6218232` |
| MediaBox | 595.28 × 312.402 pt                                                |

**Tamamen outline'lanmış vektör** — çıkarılabilir canlı metin yok. Bu yüzden
web SVG türevleri **bundan** üretilmiştir: font bağımlılığı olmadan, geometri
bozulmadan.

---

## 3. Türetilen web varlıkları

`SRC-07` içerik akışı (obje 8, FlateDecode, 2.663 B) çözülerek 20 yol
çıkarılmıştır. Noktalar yalnızca PDF'in kendi CTM'si ile çarpılmış, y ekseni
çevrimi SVG grup matrisiyle yapılmıştır. **Yeniden çizim, ölçekleme,
yuvarlama veya sadeleştirme yoktur.**

| Dosya                                   | İçerik                                 | Kullanım              |
| --------------------------------------- | -------------------------------------- | --------------------- |
| `public/brand/duosis-logo.svg`          | Tam kilit (wordmark + çizgi + tagline) | Açık zemin            |
| `public/brand/duosis-logo-dark.svg`     | Aynı geometri, ink→paper eşlemesi      | Koyu zemin            |
| `public/brand/duosis-wordmark.svg`      | Yalnızca wordmark                      | Dar alan / responsive |
| `public/brand/duosis-wordmark-mono.svg` | Wordmark, `currentColor`               | Monochrome            |
| `public/brand/duosis-mark.svg`          | Yalnızca "du" markası                  | Favicon kaynağı       |
| `public/brand/duosis-mark-mono.svg`     | Mark, `currentColor`                   | Monochrome            |
| `public/favicon.svg`                    | Mark, kare viewBox                     | Tarayıcı sekmesi      |

Monokrom varyantlar **wordmark ve mark** üzerinden üretilir: bu yollarda beyaz
counter (delik) bulunmadığı için tek renge indirgeme kayıpsızdır. Tam kilitteki
tagline'ın beyaz counter'ı vardır; bu yüzden tam kilit yalnızca açık/koyu
varyant olarak sunulur.

### Ölçülen renkler

| Renk         | Değer     | Nerede        |
| ------------ | --------- | ------------- |
| Marka cyan A | `#16a6de` | Mark          |
| Marka cyan B | `#16a6d9` | İkincil aksan |
| Marka ink    | `#252a2e` | Wordmark      |
| Çizgi ink    | `#242a2f` | Ayırıcı kural |

---

## 4. İzin durumu

| Varlık                          | Durum                                                                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Duosis logosu (SRC-06/07/08)    | **Kullanılabilir** — Duosis'in kendi markasıdır                                                                                  |
| "IT for More" sloganı           | Logo masterında **korunur**. Logo dışında bağımsız bir web mesajı olarak yaygınlaştırılması **iş sahibi onayına bağlıdır**       |
| Üçüncü taraf teknoloji logoları | **Etkilenmez.** 35/35 kayıt `logoPermission: unknown` olarak kalır; `logoPathIfAllowed` izinsiz logoyu hiçbir modda render etmez |
| CyclOps ekran görüntüleri       | Yayın izni **doğrulanmamış**                                                                                                     |

Duosis kendi logosunun kullanılabilir olması, üçüncü taraf logolarının iznini
**hiçbir şekilde ima etmez**.
