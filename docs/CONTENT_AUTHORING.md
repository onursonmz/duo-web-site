# İçerik Yazım Rehberi — İçgörüler

Bu belge `insights` koleksiyonuna yazı ekleyen herkes içindir. Şema
`src/lib/content/schemas.ts` içindedir ve **tek kaynaktır**; buradaki kurallar
şemanın zorunlu kıldıklarını açıklar, onların yerine geçmez.

---

## 1. Yeni bir yazı nasıl eklenir?

Dosya yolu içerik kimliğini belirler:

```
src/content/insights/<locale>/<slug>.md
```

`locale` `tr` veya `en`; `slug` ASCII kebab-case olmalıdır (Türkçe karakter
kabul edilmez — şema reddeder).

### Zorunlu frontmatter

| Alan              | Kural                                                               |
| ----------------- | ------------------------------------------------------------------- |
| `translationKey`  | Diller arası kimlik. TR ve EN karşılıkları **aynı** anahtarı taşır. |
| `locale`          | `tr` \| `en`                                                        |
| `slug`            | Dosya adıyla aynı olmalı; ASCII kebab-case.                         |
| `status`          | `draft` \| `review` \| `published` \| `archived`                    |
| `title`           | Sayfadaki `<h1>`.                                                   |
| `excerpt`         | Liste kartında ve `og:description`'da görünür.                      |
| `series`          | Kapalı küme — aşağıdaki listeden biri.                              |
| `authorRef`       | `src/content/authors/` altındaki bir kayıt.                         |
| `seo.title`       | En fazla 70 karakter.                                               |
| `seo.description` | En fazla 200 karakter.                                              |
| `seo.noindex`     | Geliştirme sürümünde `true`.                                        |
| `publishedAt`     | `status: published` ise **zorunlu**.                                |

### Opsiyonel alanlar

`tags`, `updatedAt`, `sources`, `relatedSolutionRefs`, `cta`, `social`.

**Boş bir opsiyonel alan bölüm üretmez.** `sources: []` yazmak "Kaynaklar"
başlığını boş göstermez; başlık hiç oluşmaz. Bu yüzden kullanılmayan alanı
boş bırakmak yerine **hiç yazmamak** tercih edilir.

---

## 2. Şemanın build'i kırdığı durumlar

Bunlar uyarı değil, **hata**dır; `pnpm build` sıfırdan farklı kodla durur.

- Aynı `translationKey + locale` iki kayıtta.
- Aynı `slug + locale` iki kayıtta.
- `authorRef` veya `relatedSolutionRefs` var olmayan bir kayda işaret ediyor.
- `series` kapalı kümede değil.
- `tags` içinde ASCII kebab-case olmayan bir değer.
- `status: published` ama `publishedAt` yok.
- `updatedAt`, `publishedAt` tarihinden önce.
- Şemada tanımlı olmayan bir frontmatter alanı (`.strict()`).

---

## 3. Yayın görünürlüğü — fail-closed

Bir yazının public çıktıda görünmesi için **iki** koşul birden gerekir:

1. `status === "published"`
2. `publishedAt` **geçmiş veya bugün**

İleri tarihli bir yazı listede görünmez, RSS'e girmez ve **rotası hiç
üretilmez** — adresi de yoktur. Bu kural `src/lib/content/selectors.ts`
içindeki `getInsights` fonksiyonundadır; sayfalar kendi filtresini yazmaz.

---

## 4. Okuma süresi

**Yazılmaz, hesaplanır.** Şemada böyle bir alan yoktur.
`src/lib/content/readingTime.ts` gövdeden deterministik olarak hesaplar
(200 kelime/dakika). Sayımdan kod blokları, satır içi kod, bağlantı hedefleri
ve markdown işaretleri çıkarılır.

Elle yazılan bir süre, gövde değiştiğinde sessizce yanlışa dönerdi.

---

## 5. Seriler (kapalı küme)

Seri anahtarı `src/lib/content/series.ts` içinde tanımlıdır. Frontmatter'a
**anahtar** yazılır, etiket değil.

| Anahtar               | TR etiketi           | TR yolu                | EN etiketi          | EN yolu               |
| --------------------- | -------------------- | ---------------------- | ------------------- | --------------------- |
| `observability-radar` | Observability Radar  | `observability-radar`  | Observability Radar | `observability-radar` |
| `data-and-ai`         | Data & AI            | `data-ve-ai`           | Data & AI           | `data-and-ai`         |
| `architecture-notes`  | Mimari Notları       | `mimari-notlari`       | Architecture Notes  | `architecture-notes`  |
| `automation-guides`   | Otomasyon Rehberleri | `otomasyon-rehberleri` | Automation Guides   | `automation-guides`   |
| `cyclops-log`         | CyclOps Günlüğü      | `cyclops-gunlugu`      | CyclOps Log         | `cyclops-log`         |
| `regional-technology` | Bölgesel Teknoloji   | `bolgesel-teknoloji`   | Regional Technology | `regional-technology` |

Slug ile etiket **ayrı tutulur**: etiket düzeltilebilir, slug URL'de yaşadığı
için değişmemelidir.

Seri ve etiket sayfaları yalnızca **gerçekten yazısı olan** değerler için
üretilir. Bilinmeyen bir seri veya etiket 404 döner.

---

## 6. İçerik kuralları

### Yapılmayacaklar

- **Kaynaksız istatistik.** Bir oran veya sayı veriliyorsa kaynağı olmalı.
- **Uydurulmuş link.** Kaynak gerçekten açılıp kontrol edilmediyse
  `sources` içine yazılmaz.
- **Müşteri veya partnerlik iddiası.** Onaylanmış müşteri referansı yoktur;
  "müşterilerimizden biri", "iş ortağımız" gibi ifadeler kullanılamaz.
- **Ürün özelliği uydurmak.** Bir ürünün ne yaptığı yazılıyorsa resmî
  dokümantasyona dayanmalı. Genel mimari yaklaşım ile ürün adı ayrı
  paragraflarda tutulur.
- **SEO anahtar kelime doldurma.** Aynı terimi yapay biçimde tekrarlamak.
- **Uydurulmuş çalışan profili.** Yazar olarak `Duosis Mühendislik Ekibi`
  kullanılır; yazar kaydında fotoğraf, biyografi veya sosyal hesap alanı yoktur.
- **İç süreç dilini ziyaretçiye anlatmak.** "Doğrulama bekliyor", "taslak",
  "iş sahibi onayı" gibi ifadeler public metinde geçemez
  (`tests/e2e/public-voice.spec.ts` bunu denetler).

### Kaynak politikası

Teknik bir iddia kaynak gerektiriyorsa yalnızca şunlar kullanılır:

- resmî ürün dokümantasyonu,
- sağlanan kurumsal kaynak (S00 keşif belgeleri).

Kaynak eklemeden önce **açılıp doğrulanır**. Bir bağlantının var olduğundan
emin değilseniz, o iddiayı kaynaksız bırakmak yerine **iddiayı çıkarın**.

### Uzunluk ve yapı

Tam bir TR yazısı yaklaşık **900–1.400 kelime**dir ve şu iskeleti taşır:

1. Giriş — okurun tanıdığı somut bir durum.
2. Gerçek problem — neden göründüğünden farklı.
3. Yaklaşım — ne yapılır.
4. Uygulama sınırları — ne zaman işe yaramaz, neyi maliyeti var.
5. Sonuç — nereden başlanır.

Dördüncü bölüm atlanmaz: sınırı olmayan bir öneri, pazarlama metnidir.

### Markdown

Gövdede `#` (h1) **kullanılmaz** — sayfa başlığı şablondan gelir ve tek H1
kuralı vardır. Bölümler `##`, alt bölümler `###` ile açılır.

Tablo ve kod blokları desteklenir; ikisi de kendi kabında kayar ve sayfayı
taşırmaz.

---

## 7. Sonraki içerik kuyruğu

Öncelik sırası iş sahibinin vurguladığı konulardan türetilmiştir. Her satır
bir yazıya karşılık gelir; seri ataması öneridir.

| #   | Konu                                                                             | Önerilen seri        | İlgili çözüm                   |
| --- | -------------------------------------------------------------------------------- | -------------------- | ------------------------------ |
| 1   | **Datadog** — tek platformda metrik/log/trace toplamanın mimari sonuçları        | Observability Radar  | Operasyonel görünürlük         |
| 2   | **Freshservice** — ITSM'i bilet kuyruğundan hizmet kataloğuna taşımak            | Mimari Notları       | BT hizmet yönetimi             |
| 3   | **Zabbix ve CyclOps** — açık kaynak izlemeyi olay yönetimine bağlamak            | CyclOps Günlüğü      | AIOps ve olay yaşam döngüsü    |
| 4   | **Ardoq** — mimari modelini karar döngüsüne sokmak                               | Mimari Notları       | Kurumsal mimari ve yönetişim   |
| 5   | **Data platformları** — göl, ambar ve akış arasında seçim                        | Data & AI            | Veri akışı ve entegrasyon      |
| 6   | **Automation** — runbook'tan güvenli otomasyona                                  | Otomasyon Rehberleri | Otomasyon                      |
| 7   | **RAG ve kurumsal asistanlar** — kurum verisiyle çalışan yardımcıların sınırları | Data & AI            | Mühendislik ve ürün geliştirme |
| 8   | **Virtual NOC** — dağıtık ekiple merkezî operasyon                               | Bölgesel Teknoloji   | Operasyonel görünürlük         |

Her konu yazılmadan önce §6'daki kaynak politikası uygulanır: ürün adı geçen
her iddia resmî dokümantasyona dayandırılır veya iddia çıkarılır.

---

## 8. Yayın öncesi kontrol listesi

- [ ] `translationKey` karşı dildeki kayıtla aynı mı (çeviri varsa)?
- [ ] `slug` ASCII kebab-case ve dosya adıyla aynı mı?
- [ ] `publishedAt` doğru ve geçmiş tarihli mi?
- [ ] Gövdede `#` (h1) yok, bölümler `##` ile mi açılıyor?
- [ ] Her sayı ve oran için kaynak var mı?
- [ ] `sources` içindeki her bağlantı açılıp doğrulandı mı?
- [ ] Müşteri, partnerlik veya referans iddiası var mı? (Olmamalı.)
- [ ] `relatedSolutionRefs` gerçekten yayında olan çözümlere mi işaret ediyor?
- [ ] `pnpm test` ve `pnpm build` geçiyor mu?
