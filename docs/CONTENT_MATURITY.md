# İçerik Olgunluk Politikası

Fail-closed. Doğrulanmamış içerik hiçbir aşamada üretim içeriği gibi davranmaz.

## Neden

S00 doğruluk matrisi, kamuya açık sitede kullanılacak iş iddialarının büyük
kısmının **iş sahibi doğrulaması beklediğini** gösterdi (`discovery/content-truth-matrix.csv`).
S02 fixture'ları bu doğrulama gelmeden önce yazılmış **taslak** metinlerdir:
demo ve şablon doğrulaması için vardır, yayın için değil.

## Kurallar

| Durum                             | Kural                           | Nerede uygulanıyor           |
| --------------------------------- | ------------------------------- | ---------------------------- |
| Taslak olgunluktaki sayfa         | `seo.noindex: true`             | Tüm `solutions` fixture'ları |
| `status !== published`            | Public build'de hiç üretilmez   | `selectors` — public mod     |
| `verificationStatus !== verified` | İddia/metrik public'te görünmez | `selectors` — public mod     |
| `logoPermission !== allowed`      | Logo hiç render edilmez         | `logoPathIfAllowed`          |
| `lifecycle !== active`            | Teknoloji public listede yok    | `isVisibleTechnology`        |

## Şu anki durum (S02-R1)

- **10/10 solution fixture'ı `noindex: true`.** Rotalar üretiliyor ve TR/EN demo
  akışı çalışıyor; yalnızca arama motoru indekslemesi kapalı.
- **35/35 teknoloji `lifecycle: pending`.** S00 envanterinde hepsinin `active`
  değeri `unknown`'dı; sessizce `true` yapılmadı. Sonuç: **public teknoloji
  listesi boştur.** Bu bilinçli ve fail-closed bir sonuçtur.
- Sayfalarda görünür `TASLAK / DRAFT` rozeti ve "doğrulanmış iddia içermez" notu var.

## Bir kaydı yayına almak

1. İş sahibi ilgili iddiayı/teknolojiyi yazılı olarak doğrular.
2. `discovery/content-truth-matrix.csv` veya `discovery/technology-inventory.csv`
   güncellenir (kaynak kayıt).
3. İçerik verisinde karşılığı değiştirilir:
   - teknoloji: `lifecycle: "pending"` → `"active"`
   - iddia/metrik: `verificationStatus: "pending"` → `"verified"`
   - logo: `logoPermission: "unknown"` → `"allowed"` (yalnızca yazılı izinle)
   - sayfa: `seo.noindex: true` → `false`
4. **Kod değişikliği gerekmez**; filtreler içerik verisinden çalışır.
