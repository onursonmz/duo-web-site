# S08–S11 Entegrasyon Raporu

**Integration branch:** `duosis-web/s08-s11-integration`

| Öğe                         | Değer                                      |
| --------------------------- | ------------------------------------------ |
| S08+S09 feature branch HEAD | `95aedc052eea223da5ddb4d0f1e442fd7e673382` |
| S10+S11 feature branch HEAD | `e89dbd1722269a289fcd46427c9c2154cf068944` |
| Merge commit                | `65fdd5d5c00d52e3cee79e58c4fc29226c17b528` |
| Implementation HEAD         | `111e9d0`                                  |
| İlk integration delivery    | `486ce7a`                                  |
| Düzeltme (R1) delivery HEAD | evidence manifestinde (`PACKAGES.sha256`)  |
| Remote CI                   | [run 34431554788][ci]                      |

[ci]: https://github.com/onursonmz/duo-web-site/actions/runs/34431554788

Her iki feature branch de **kendi remote CI'ını yeşil geçtikten sonra**
birleştirildi. `main` branch'ine **merge edilmedi**. S12'ye geçilmedi.

---

## 1. Yöntem

Üçüncü bir worktree açıldı (`../duo-web-site-s08-s11-integration`), S08+S09
branch'i temel alındı ve S10+S11 **merge commit ile** birleştirildi:

```
git worktree add ../duo-web-site-s08-s11-integration \
  -b duosis-web/s08-s11-integration \
  origin/duosis-web/s08-s09-cyclops-about
git merge --no-ff origin/duosis-web/s10-s11-services-insights
```

**Rebase ve squash kullanılmadı.** Merge commit'in iki ebeveyni de korunuyor,
dolayısıyla her iki sprintin geçmişi ayrı ayrı okunabilir durumda.

Hiçbir feature branch'in geçmişi değiştirilmedi; force-push yapılmadı.

---

## 2. Çakışmalar ve çözümleri

Beş dosyada çakışma çıktı. Şemalar, seçiciler ve sözlük **temiz merge oldu**.

### 2.1 `src/config/navigation.ts`

İki branch de aynı diziyi değiştirmişti: S08+S09 `nav.cyclops` ve `nav.about`
girdilerini, S10+S11 ise `nav.services` girdisini aktifleştirmişti.

**Çözüm:** sözleşmedeki nihai sıra ve **altı girdinin tamamı aktif**:

| #   | Girdi      | Rota           | Kaynak  |
| --- | ---------- | -------------- | ------- |
| 1   | Çözümler   | `/cozumler/`   | S06+S07 |
| 2   | CyclOps    | `/cyclops/`    | S08     |
| 3   | Hizmetler  | `/hizmetler/`  | S10     |
| 4   | İçgörüler  | `/icgoruler/`  | S05     |
| 5   | Hakkımızda | `/hakkimizda/` | S09     |
| 6   | İletişim   | `/iletisim/`   | S07     |

`planned` girdi kalmadı; `MAX_PRIMARY_ITEMS` sınırı tam dolu.

**Teknoloji atlası ana menüye EKLENMEDİ** — yedinci giriş sözleşmeyi bozardı.
`SECONDARY_NAV` üzerinden üç yerde erişilebilir ve build çıktısında üçü de
doğrulandı: çözüm mega menüsünün altında, mobil menü alt listesinde ve
footer site haritasında.

### 2.2 `src/lib/i18n/routes.ts`

`SEGMENTS` nesnesi iki taraftan da genişletilmişti. **Birleşim alındı**:
`cyclops`, `about` (S08+S09) + `services`, `technologies`, `series`, `tag`
(S10+S11). Tip imzası da birleştirildi. Hiçbir segment düşmedi.

### 2.3 `tests/e2e/route-inventory.spec.ts` (add/add)

İki branch **aynı adlı dosyayı bağımsız olarak** oluşturmuştu — aynı sorunu
farklı yollarla çözüyorlardı.

**Çözüm: S08'in KEŞİF tabanlı yaklaşımı korundu.** Envanter `dist/`
çıktısından türetiliyor, dolayısıyla yeni bir rota taramaya kendiliğinden
giriyor. S10+S11'in elle tuttuğu liste tam olarak eskime riski taşıyordu ve
o branch'te bir kez gerçekten eskidi.

S10+S11'in getirdiği iki tamamlayıcı kontrol üzerine eklendi:

- **besleme adresleri** — RSS sayfa değil kaynaktır, `index.html` taramasına
  girmez; ayrıca kontrol edilir.
- **rota ailesi kapsamı** — keşif "ne varsa" bulur, bu test "ne OLMASI
  gerektiğini" sabitler. Bir şablon ailesi bütünüyle üretilmemeye başlarsa
  keşif fark etmez, bu test eder.

### 2.4 `tests/support/public-routes.ts`

Elle tutulan rota listesi **kaldırıldı** (2.3'e bağlı). Dosyada yalnızca
keşiften türetilemeyen sabitler kaldı: besleme adresleri, kritik rota matrisi
ve taşma test genişlikleri. `CRITICAL_ROUTES` listesine CyclOps ve Hakkımızda
rotaları eklendi.

### 2.5 `tests/e2e/public-voice.spec.ts` ve `navigation.spec.ts`

Ses taraması keşif tabanlı envantere bağlandı; S10+S11'in eklediği
`/404-kontrol/` korundu (hata sayfası da public sestir ve iç süreç dili
taşıyamaz).

"Henüz rotası yok" listesinde entegrasyon sonrası **yalnızca `/blog/`** kaldı:
`/iletisim/` (S07), `/cyclops/` ve `/hakkimizda/` (S08+S09), `/hizmetler/`
(S10) gerçek rota oldu. Kural gevşetilmedi; rotası açılan adres listeden
çıkarıldı.

---

## 3. Entegrasyonun ortaya çıkardığı tek hata

Merge sonrası **bir** test kırıldı ve bu, iki doğru kararın ölçüm yönteminde
uyuşmamasıydı.

S10+S11'in eklediği "teknoloji listesi çözüm sınırının dışına taşmıyor" testi
`innerText()` kullanıyordu. S08+S09 ise izin verilen bir logo olduğunda adın
**metin olarak tekrar etmemesini** sağlıyor: ad `<img alt>` içinde duruyor
(ekran okuyucu adı yine duyuruyor, göz iki kez okumuyor).

Merge sonrası CyclOps'un logosu görüntülendiği için AIOps listesi
`innerText()` ile **boş** görünüyor ve test "CyclOps yok" diyordu.

**Çözüm:** test artık **erişilebilir ad** üzerinden ölçüyor — her liste
öğesinin metni ve varsa `<img alt>` değeri birlikte değerlendiriliyor.
Guardrail korundu: AIOps listesinde Zabbix, observability listesinde CyclOps
bulunamaz.

Hiçbir test silinmedi, `skip` eklenmedi, timeout yükseltilmedi.

---

## 4. Korunan sözleşmeler

| Sözleşme                                                  | Durum                                          |
| --------------------------------------------------------- | ---------------------------------------------- |
| Global navigasyon en fazla altı ana giriş                 | Tam altı, hepsi aktif                          |
| Teknoloji yedinci ana menü değil                          | Mega menü + mobil alt liste + footer           |
| Dictionary TR/EN key parity                               | Korundu; her iki feature'ın anahtar kümesi tam |
| Hiçbir feature'ın anahtarı sessizce silinmedi             | Korundu (§4.1)                                 |
| Milestone `source` / `verificationStatus` alanları        | Korundu                                        |
| Insight `author` / `date` / `series` / `sources` alanları | Korundu                                        |
| Strict validation gevşetilmedi                            | `.strict()` yerinde; `.passthrough()` yok      |
| Lockfile elle birleştirilmedi                             | Gerekmedi — iki taraf da dokunmamıştı          |
| Her iki branch'in test dosyaları korundu                  | 16 birim + 21 e2e spec dosyası                 |

### 4.1 Dictionary — bilinçli bir silme

S08+S09 iki anahtarı **kasıtlı olarak** kaldırmıştı: `site.tagline` ve
`footer.buildNote` (footer'daki geliştirme sürümü notu). Bu bir merge kaybı
değil, o branch'in kendi kararıdır ve kullanım yerleri de birlikte
kaldırılmıştı. Silme korundu; S10+S11'in eklediği anahtarların tamamı
(`services.*`, `technologies.*`, `regions.*`, genişletilmiş `insights.*`,
`nav.technologies`, üç CTA anahtarı) eklendi.

---

## 5. Kalite kapısı

Node `24.20.0`, pnpm `12.3.4` (ikisi de repoda pinli).

| #   | Adım                                      | Sonuç                                      |
| --- | ----------------------------------------- | ------------------------------------------ |
| 1   | `pnpm install --frozen-lockfile`          | Başarılı — lockfile değişmedi              |
| 2   | `pnpm format:check`                       | Temiz                                      |
| 3   | `pnpm lint`                               | 0 bulgu                                    |
| 4   | `pnpm typecheck`                          | 0 hata                                     |
| 5   | `pnpm test`                               | **281 / 281** (16 dosya)                   |
| 6   | `pnpm test:e2e`                           | **794 / 794** (chromium + chromium-nojs)   |
| 7   | `pnpm build`                              | 61 sayfa + 2 besleme                       |
| 8   | `pnpm audit --prod`                       | Bilinen guvenlik acigi yok                 |
| 9   | Tüm public rotalarda iç bağlantı taraması | Keşif tabanlı envanter; kırık bağlantı yok |
| 10  | 320/390/768/1024/1440 responsive tarama   | Yatay taşma yok                            |
| 11  | External request taraması                 | 0 dış istek                                |
| 12  | Public voice taraması                     | İç süreç dili yok                          |
| 13  | axe kritik rota matrisi                   | WCAG 2.2 AA ihlali yok                     |

`pnpm quality` çıkış kodu: **0**.

### RSS ve yapılandırılmış veri

**113 / 113** kontrol geçti: iki besleme de geçerli XML, RFC 822 tarihleri
doğru, kaçırılmamış `&` yok, öğeler gerçek sayfalara işaret ediyor ve diller
karışmıyor. Her BlogPosting JSON-LD'si sayfadaki `<h1>`, canonical URL, tarih
ve yazarla birebir örtüşüyor; gösterilmeyen iddia alanı taşımıyor.

---

## 6. Görsel kontrol

Ana sayfada S08–S11'in tüm gereksinimleri build çıktısında doğrulandı:

| Gereksinim                      | Durum                    |
| ------------------------------- | ------------------------ |
| Düzeltilmiş Command Atlas hero  | Var                      |
| CyclOps bağlantısı              | Var                      |
| 10. yıl / Hakkımızda bağlantısı | Var                      |
| Onaylı bölgeler                 | Var (üç bölge)           |
| Aktif teknoloji ekosistemi      | Var (yetenek katmanları) |
| Son insight içerikleri          | Var (en yeni üç)         |
| Roadmap CTA                     | Var                      |

Ekran görüntüleri kanıt paketinde: ana sayfa, CyclOps, Hakkımızda, Hizmetler,
Teknolojiler, İçgörüler landing, uzun blog yazısı, mobil menü ve footer —
masaüstü / tablet / mobil / 320px / %200 zoom / JS-kapalı koşullarında.

---

## 7. Teslim

| Öğe                      | Değer                                          |
| ------------------------ | ---------------------------------------------- |
| Merge commit             | `65fdd5d5c00d52e3cee79e58c4fc29226c17b528`     |
| Merge parent 1 (S08+S09) | `95aedc052eea223da5ddb4d0f1e442fd7e673382`     |
| Merge parent 2 (S10+S11) | `e89dbd1722269a289fcd46427c9c2154cf068944`     |
| Implementation HEAD      | `111e9d0`                                      |
| İlk integration delivery | `486ce7a`                                      |
| Düzeltme (R1) delivery   | `PACKAGES.sha256` + evidence manifesti         |
| Review bundle            | `duosis-web-S08-S11-integration-review.bundle` |
| Evidence ZIP             | `duosis-web-S08-S11-integration-evidence.zip`  |

### `git status --short`

```
(temiz — çıktı yok)
```

---

## 8. Bilinen içerik riskleri

Bunlar entegrasyonun ürettiği sorunlar değil; iki sprintten devralınan ve
**bilinçli olarak açık bırakılan** durumlardır.

| #   | Risk                                                                                                                          | Durum                                                                                                                                     |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Onaylı müşteri referansı yok.** Kanıt bölümü hiçbir sayfada render edilmiyor.                                               | `proof-system.test.ts` bu durumu kilitliyor: gerçek bir referans eklendiğinde test kırılır ve bölümün gözden geçirilmesini zorunlu kılar. |
| 2   | **Üçüncü taraf teknoloji logosu yayınlanamıyor.** Envanterdeki tüm üçüncü taraf kayıtların `logoPermission` değeri `unknown`. | Yalnızca CyclOps'un izni var (ADR-012, Duosis kendi ürünü). Teknoloji atlası bilinçli olarak logosuz.                                     |
| 3   | **Sosyal önizleme görseli yok.** Şemada alan var, hiçbir yazıda dolu değil; OG kartı `summary` tipinde.                       | Sahte hero görseli üretilmedi. Marka OG raster'ı hazırlanınca doldurulabilir.                                                             |
| 4   | **Tüm sayfalar `noindex`.**                                                                                                   | Geliştirme sürümü politikası (S02). Yayın öncesi toplu gözden geçirme gerekiyor.                                                          |
| 5   | **Kanonik adres `localhost:4321`.** `PUBLIC_SITE_URL` ayarlı değil; JSON-LD ve RSS yerel adres taşıyor.                       | Dağıtım kararıyla (ADR-003) birlikte çözülür.                                                                                             |
| 6   | **Geniş tablo sınırı.** Üç sütundan geniş tablo dar ekranda okunaksız.                                                        | Erişilebilirlik kararının kabul edilen bedeli; `CONTENT_AUTHORING.md` belgeliyor.                                                         |
| 7   | **Sitemap yok.** S13 kapsamı.                                                                                                 | Üretim `src/lib/content/selectors` seçicilerini tüketmeli; görünürlük kuralı orada yaşıyor.                                               |

---

## 9. Sonraki adım

S08–S11 entegrasyonu tamamlandı ve remote CI yeşil. **Burada duruldu:**
`main` branch'ine merge edilmedi ve S12'ye geçilmedi. Codex incelemesi
bekleniyor.
