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

## Şu anki durum (S08)

- **Tüm üretim sayfaları `noindex: true`.** Rotalar üretiliyor ve TR/EN akışı
  çalışıyor; yalnızca arama motoru indekslemesi kapalı.
- **21/35 teknoloji `lifecycle: active`, 14/35 `pending`** (ADR-011). S00'da
  hepsi `pending` idi; yayın kararı iş sahibi onayıyla verildi ve yalnızca ADR'de
  adı geçen kayıtlar açıldı.
- **35/35 kayıt `logoPermission: unknown`** — CyclOps hariç hiçbir logo açılmadı;
  teknolojiler public çıktıda YALNIZCA metin olarak geçer.
- Ziyaretçiye gösterilen arayüzde `TASLAK / DRAFT` rozeti, olgunluk dili veya
  yayın süreci anlatısı **YOKTUR** (ADR-011 + S08 takibi). Bu bilgiler yalnızca
  içerik verisinde, ADR'lerde ve bu dosyada durur; `tests/e2e/public-voice.spec.ts`
  build çıktısından keşfedilen TÜM public rotaları tarar.

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
